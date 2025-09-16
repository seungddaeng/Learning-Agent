import React, { useCallback, useState, useEffect } from "react";
import { Card, message, Row, Col, Grid, theme as antTheme } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { useParams, useLocation } from "react-router-dom";
import PageTemplate from "../../components/PageTemplate";
import ChunkedUploadButton from "../../components/shared/ChunkedUploadButton";
import { DocumentTable } from "../../components/documents/DocumentTable";
import { PdfPreviewSidebar } from "../../components/documents/PdfPreviewSidebar";
import { DocumentDataSidebar } from "../../components/documents/DocumentDataSidebar";
import { useDocuments } from "../../hooks/useDocuments";
import { useChunkedDocumentUpload } from "../../hooks/useChunkedDocumentUpload";
import { useUser } from "../../context/UserContext";
import { useUserStore } from "../../store/userStore";
import { useThemeStore } from "../../store/themeStore";
import type { Document } from "../../interfaces/documentInterface";
import useCourses from "../../hooks/useCourses";
import useClasses from "../../hooks/useClasses";

const { useBreakpoint } = Grid;

const UploadDocumentPage: React.FC = () => {
  const { documents, loading, downloadDocument, deleteDocument, loadDocuments } = useDocuments();
  const { processDocumentComplete } = useChunkedDocumentUpload();
  // Use only one source for user data
  const user = useUserStore((s) => s.user);
  const { id: userId } = useUser(); // Hook that internally uses the same store
  const isStudent = Boolean(user?.roles?.includes?.("estudiante"));
  const { courseId, id } = useParams<{ courseId: string; id: string }>();
  const location = useLocation();
  
  // Hooks to get course and period information
  const { actualCourse, getCourseByID } = useCourses();
  const { actualClass, fetchClassById } = useClasses();

  // Get course and period information when necessary
  useEffect(() => {
    if (courseId && !actualCourse) {
      getCourseByID(courseId);
    }
    if (id && !actualClass) {
      fetchClassById(id);
    }
  }, [courseId, id, actualCourse, actualClass, getCourseByID, fetchClassById]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const screens = useBreakpoint();
  
  // Check if we're in the student reinforcement context
  const isInReinforcementContext = location.pathname.includes('/student/classes/') && location.pathname.includes('/reinforcement/documents');
  
  // Theme
  const theme = useThemeStore((state: { theme: string }) => state.theme);
  const isDark = theme === "dark";
  const { token } = antTheme.useToken();
  
  // Estados para el sidebar de previsualización
  const [previewSidebarVisible, setPreviewSidebarVisible] = useState<boolean>(false);
  const [documentToPreview, setDocumentToPreview] = useState<Document | null>(null);
  
  // Estados para el sidebar de datos
  const [dataSidebarVisible, setDataSidebarVisible] = useState<boolean>(false);
  const [documentToViewData, setDocumentToViewData] = useState<Document | null>(null);

  const isSmallScreen = !screens.lg;
  const isMobileScreen = !screens.md;
  const sidebarWidth = isSmallScreen ? '100%' : '50%';
  
  const contentMaxWidth = (previewSidebarVisible || dataSidebarVisible) && !isSmallScreen 
    ? '50%'
    : '100%';

  // Create dynamic breadcrumbs based on context
  const getBreadcrumbs = () => {
    if (isInReinforcementContext && id) {
      return [
        { label: "Home", href: "/" },
        { label: "Classes", href: "/student/classes" },
        { label: "Reinforcement", href: `/student/classes/${id}/reinforcement` },
        { label: "Documents" }
      ];
    }
    
    // Professor context: /professor/courses/:courseId/periods/:id/documents
    if (courseId && id && actualCourse && actualClass) {
      return [
        { label: "Home", href: "/" },
        { label: "Materias", href: "/professor/courses" },
        { label: actualCourse.name, href: `/professor/courses/${courseId}/periods` },
        { label: actualClass.name, href: `/professor/courses/${courseId}/periods/${id}` },
        { label: "Documents" }
      ];
    }
    
    // Professor context: /professor/courses/:courseId/documents (from course card)
    if (courseId && !id && actualCourse) {
      return [
        { label: "Home", href: "/" },
        { label: "Materias", href: "/professor/courses" },
        { label: actualCourse.name, href: `/professor/courses/${courseId}/periods` },
        { label: "Documents" }
      ];
    }
    
    return [{ label: "Home", href: "/" }, { label: "Documents" }];
  };

  const pageTitle = isSmallScreen ? "Documents" : "Academic Documents";
  const containerPadding = isSmallScreen ? "16px" : "24px";

  const fileConfig = {
    accept: ".pdf",
    maxSize: 100 * 1024 * 1024, // 100MB
    chunkSize: 2 * 1024 * 1024, // 2MB chunks for better performance
    validationMessage: "Only PDF files up to 100MB are allowed"
  };

  const processingConfig = {
    steps: [
      { key: "validate", title: "Validation", description: "Validating PDF format..." },
      { key: "extract", title: "Extraction", description: "Extracting content..." },
      { key: "process", title: "Processing", description: "Processing document..." },
      { key: "store", title: "Storage", description: "Storing information..." }
    ],
    processingText: "Processing PDF document...",
    successText: "Document processed successfully!"
  };
    
  const handleUploadSuccess = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadDocuments();
    } catch (error) {
      console.error("Error updating table:", error);
    } finally {
      setRefreshing(false);
    }
  }, [loadDocuments]);

  const handleDownload = useCallback(async (doc: Document) => {
    try {
      await downloadDocument(doc);
      message.success("File downloaded successfully");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Download error";
      message.error(errorMessage);
    }
  }, [downloadDocument]);

  const handleDeleteSuccess = useCallback(() => {
    message.success("Document deleted successfully");
    loadDocuments();
  }, [loadDocuments]);

  const handleDeleteError = useCallback((error: Error) => {
    message.error(error.message);
  }, []);

  const handleViewData = useCallback((doc: Document) => {
    if (previewSidebarVisible) {
      setPreviewSidebarVisible(false);
      setDocumentToPreview(null);
    }
    setDocumentToViewData(doc);
    setDataSidebarVisible(true);
  }, [previewSidebarVisible]);

  const handleCloseDataSidebar = useCallback(() => {
    setDataSidebarVisible(false);
    setDocumentToViewData(null);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setPreviewSidebarVisible(false);
    setDocumentToPreview(null);
  }, []);

  // Preview
  const handlePreview = useCallback(async (doc: Document) => {
    if (dataSidebarVisible) {
      setDataSidebarVisible(false);
      setDocumentToViewData(null);
    }
    setDocumentToPreview(doc);
    setPreviewSidebarVisible(true);
  }, [dataSidebarVisible]);

  return (
    <div style={{ 
      position: "relative", 
      width: "100%", 
      height: "100vh", 
      display: "flex",
      overflow: "hidden" 
    }}>
      <div style={{ 
        width: contentMaxWidth,
        transition: "width 0.3s ease-in-out",
        minWidth: 0,
        overflow: "auto",
        height: "100%",
        flex: "0 0 auto" 
      }}>
      <PageTemplate
        title={pageTitle}
        subtitle="PDF educational material upload and management system"
        breadcrumbs={getBreadcrumbs()}>
        <div style={{
          padding: containerPadding,
          width: "100%",
          margin: "0",
          maxWidth: "none" 
        }}>
          {/* Documents Table Section */}
          <Row>
            <Col xs={24}>
              <Card
                title={
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: isDark ? token.colorText : "#1A2A80",
                    width: "100%",
                    minWidth: 0,
                    gap: isSmallScreen ? "12px" : "16px",
                    flexWrap: isSmallScreen ? "nowrap" : "nowrap"
                  }}>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center",
                      minWidth: 0,
                      flex: "1 1 auto",
                      overflow: "hidden"
                    }}>
                      <FileTextOutlined style={{ 
                        marginRight: "8px", 
                        fontSize: isSmallScreen ? "14px" : "20px",
                        flexShrink: 0 
                      }} />
                      <span style={{ 
                        fontSize: isSmallScreen ? "14px" : "18px", 
                        fontWeight: "500",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {isSmallScreen ? "Repository" : "Document Repository"}
                      </span>
                      <div style={{
                        marginLeft: "12px",
                        backgroundColor: documents.length > 0 
                          ? (isDark ? token.colorPrimaryBg : "#E8F4FD") 
                          : (isDark ? token.colorBgTextHover : "#F0F0F0"),
                        color: documents.length > 0 
                          ? (isDark ? token.colorPrimary : "#3B38A0") 
                          : (isDark ? token.colorTextSecondary : "#666"),
                        padding: isSmallScreen ? "2px 8px" : "4px 10px",
                        borderRadius: isSmallScreen ? "10px" : "16px",
                        fontSize: isSmallScreen ? "10px" : "12px",
                        fontWeight: "500",
                        transition: "all 0.3s ease",
                        flexShrink: 0,
                        whiteSpace: "nowrap"
                      }}>
                        {loading || refreshing ? (isSmallScreen ? "..." : "Updating...") : (isSmallScreen ? `${documents.length}` : `${documents.length} document${documents.length !== 1 ? 's' : ''}`)}
                      </div>
                    </div>

                    {!isStudent && (
                      <div style={{ 
                        flexShrink: 0,
                        minWidth: "fit-content",
                        paddingTop: isSmallScreen ? '6px' : '4px'
                      }}>
                        <ChunkedUploadButton
                          fileConfig={fileConfig}
                          processingConfig={processingConfig}
                          buttonConfig={{
                            showText: !isMobileScreen,
                            variant: "fill",
                            size: isMobileScreen ? "small" : "middle",
                            shape: "default"
                          }}
                          modalConfig={{
                            title: "Upload New Document",
                            width: isMobileScreen ? (typeof window !== 'undefined' ? window.innerWidth * 0.9 : 600) : 600
                          }}
                          onPostUploadProcess={processDocumentComplete}
                          onUploadSuccess={handleUploadSuccess}
                        />
                      </div>
                    )}
                  </div>
                }
                style={{
                  borderRadius: "12px",
                  boxShadow: isDark 
                    ? "0 4px 16px rgba(91, 110, 240, 0.1)" 
                    : "0 4px 16px rgba(26, 42, 128, 0.1)",
                  border: `1px solid ${isDark ? token.colorBorder : "#e8eaed"}`,
                  backgroundColor: isDark ? token.colorBgContainer : "#FFFFFF",
                  width: "100%",
                  minWidth: 0,
                  overflow: "hidden"
                }}
              >
                <DocumentTable
                  key={`documents-table-${documents.length}`}
                  documents={documents}
                  loading={loading || refreshing}
                  onDownload={handleDownload}
                  onDelete={deleteDocument}
                  onPreview={handlePreview}
                  onViewData={handleViewData}
                  onDeleteSuccess={handleDeleteSuccess}
                  onDeleteError={handleDeleteError}
                  isStudent={isStudent}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </PageTemplate>
      </div>

      {/* PDF preview sidebar */}
      <PdfPreviewSidebar
        document={documentToPreview}
        visible={previewSidebarVisible}
        onClose={handleCloseSidebar}
        sidebarWidth={sidebarWidth}
      />

      {/* Document data sidebar */}
      <DocumentDataSidebar
        document={documentToViewData}
        visible={dataSidebarVisible}
        onClose={handleCloseDataSidebar}
      />
    </div>
  );
};

export default UploadDocumentPage;
