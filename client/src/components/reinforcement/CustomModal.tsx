import React from "react";
import { Modal, Card, Row, Col, Space, Typography, Button } from "antd";
import type { ReactNode, CSSProperties } from "react";

const { Title, Text } = Typography;

const PALETTE = {
  primary: "#1A2A80",
  secondary: "#3B38A0",
  lightBlue: "#7A85C1",
  veryLightBlue: "#B2B0E8",
  success: "#52c41a",
  error: "#d32f2f",
  warning: "#faad14",
} as const;

interface CustomModalProps {
  status?: "default" | "success" | "warning" | "error";
  width?: number;
  height?: number; 
  padding?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  visible: boolean;
  onClose: () => void;
}

interface HeaderProps {
  icon: ReactNode;
  title: ReactNode;
}

interface DescriptionProps {
  children: ReactNode;
}

interface BodyProps {
  children: ReactNode;
}

interface ActionsProps {
  children: ReactNode;
}

const componentIds = {
  header: Symbol("CustomModal.Header"),
  description: Symbol("CustomModal.Description"),
  body: Symbol("CustomModal.Body"),
  actions: Symbol("CustomModal.Actions"),
};

interface ComponentWithId {
  $id: symbol;
}

function isComponentType(child: React.ReactNode, id: symbol): boolean {
  if (!React.isValidElement(child)) return false;
  return (child.type as unknown as ComponentWithId)?.$id === id;
}

const Header: React.FC<HeaderProps> & { $id?: symbol } = ({ icon, title }) => (
  <Space align="center" size={16} style={{ width: "100%", minWidth: 0 }}>
    <div
      style={{
        width: 48,
        height: 48,
        display: "grid",
        placeItems: "center",
        borderRadius: 12,
        background: PALETTE.veryLightBlue,
        color: PALETTE.secondary,
        fontSize: 20,
      }}
    >
      {icon}
    </div>
    <Title
      level={4}
      style={{
        margin: 0,
        color: PALETTE.primary,
        fontWeight: 600,
        whiteSpace: "normal",
        wordBreak: "break-word",
      }}
    >
      {title}
    </Title>
  </Space>
);
Header.$id = componentIds.header;

const Description: React.FC<DescriptionProps> & { $id?: symbol } = ({
  children,
}) => (
  <Text
    style={{
      display: "block",
      marginTop: 8,
      marginBottom: 8,
      color: PALETTE.lightBlue,
      fontSize: 15,
      lineHeight: 1.4,
    }}
  >
    {children}
  </Text>
);
Description.$id = componentIds.description;

const Body: React.FC<BodyProps> & { $id?: symbol } = ({ children }) => (
  <div
    style={{
      marginTop: 4,
      marginBottom: 8,
      fontSize: 14,
      lineHeight: 1.5,
      color: "#666",
    }}
  >
    {children}
  </div>
);
Body.$id = componentIds.body;

const Actions: React.FC<ActionsProps> & { $id?: symbol } = ({ children }) => {
  const childArray = React.Children.toArray(children);
  const limitedChildren = childArray.slice(0, 3);

  return (
    <Space direction="vertical" style={{ width: "100%" }} size={8}>
      {limitedChildren.map((child, index) => (
        <div key={index} style={{ width: "100%" }}>
          {React.isValidElement(child)
            ? React.cloneElement(child, {
                style: { width: "100%", justifyContent: "flex-start" },
              } as React.HTMLAttributes<HTMLElement>)
            : child}
        </div>
      ))}
    </Space>
  );
};
Actions.$id = componentIds.actions;

const Root: React.FC<CustomModalProps> & {
  Header: typeof Header;
  Description: typeof Description;
  Body: typeof Body;
  Actions: typeof Actions;
} = ({
  status = "default",
  width = 580,
  height = 240,
  padding = 24,
  className,
  style,
  children,
  visible,
  onClose,
}) => {
  const allChildren = React.Children.toArray(children);
  const header = allChildren.find((child) =>
    isComponentType(child, componentIds.header)
  );
  const description = allChildren.find((child) =>
    isComponentType(child, componentIds.description)
  );
  const body = allChildren.find((child) =>
    isComponentType(child, componentIds.body)
  );
  const actions = allChildren.find((child) =>
    isComponentType(child, componentIds.actions)
  );

  if (!header) {
    throw new Error(
      "CustomModal: Header es obligatorio. Asegúrate de incluir <CustomModal.Header> como hijo directo."
    );
  }

  const hasActions = Boolean(actions);
  const modalWidth = hasActions ? Math.max(width, 580) : width;

  const accentColor = {
    success: PALETTE.success,
    warning: PALETTE.warning,
    error: PALETTE.error,
    default: PALETTE.secondary,
  }[status];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={modalWidth}
      className={className}
    
      style={{
        ...style,
        borderRadius: 14,
        overflow: "hidden",
        paddingBottom: 0, 
      }}
      
      
      centered
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          background: accentColor,
        }}
      />
      <Row align="top" wrap={false} style={{ width: "100%", height: "100%" }}>
        <Col flex="auto" style={{ padding, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: "0 0 auto" }}>
            {header}
            {description}
          </div>
          {body && (
            <div style={{ flex: "1 1 auto", marginTop: 4 }}>{body}</div>
          )}
        </Col>

        {hasActions && (
          <>
            <Col flex="0 0 1px">
              <div
                style={{ width: 1, height: "100%", background: "#E6E8EF" }}
              />
            </Col>
            <Col flex="260px" style={{ padding }}>
              {actions}
            </Col>
          </>
        )}
      </Row>
    </Modal>
  );
};

Root.Header = Header;
Root.Description = Description;
Root.Body = Body;
Root.Actions = Actions;

export default Root;
