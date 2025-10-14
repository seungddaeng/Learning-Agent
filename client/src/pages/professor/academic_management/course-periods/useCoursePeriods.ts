import { message } from "antd";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Clase, CreateClassDTO } from "../../../../interfaces/claseInterface";
import useClasses from "../../../../hooks/useClasses";
import useCourses from "../../../../hooks/useCourses";

export function useCoursePeriods() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creatingPeriod, setCreatingPeriod] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPeriods, setFilteredPeriods] = useState<Clase[]>([]);

  const { classes, createClass, fetchClassesByCourse } = useClasses();
  const { actualCourse, getCourseByID } = useCourses();

  const fetchCoursePeriods = async () => {
    if (!courseId) return;
    setLoading(true);

    try {
      const courseRes = await getCourseByID(courseId);
      if (courseRes.state === "error") {
        message.error(courseRes.message);
        return;
      }

      const periodsRes = await fetchClassesByCourse(courseId);
      if (periodsRes.state === "error") {
        message.error(periodsRes.message);
        return;
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      message.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCoursePeriods();
    }
  }, [courseId]); 

  useEffect(() => {
    const lower = searchTerm.trim().toLowerCase();
    if (lower === "") {
      setFilteredPeriods(classes);
      return;
    }

    const filtered = classes.filter(
      (period) =>
        period.semester.toLowerCase().includes(lower) ||
        period.name.toLowerCase().includes(lower)
    );
    setFilteredPeriods(filtered);
  }, [searchTerm, classes]);

  const handleCreatePeriod = async (periodData: Clase | CreateClassDTO) => {
    if (!courseId) return;

    setCreatingPeriod(true);
    let createData: CreateClassDTO;
    if ("courseId" in periodData && typeof periodData.courseId === "string") {
      createData = periodData as CreateClassDTO;
    } else {
      createData = {
        semester: periodData.semester,
        dateBegin: periodData.dateBegin,
        dateEnd: periodData.dateEnd,
        courseId: courseId,
        teacherId: periodData.teacherId,
      };
    }

    const res = await createClass(createData);
    if (res.state === "error") {
      message.error(res.message);
      setCreatingPeriod(false);
      return;
    }

    message.success(res.message);
    await fetchClassesByCourse(courseId);
    setCreatingPeriod(false);
    setModalOpen(false);
  };

  const goToPeriod = (periodId: string) => {
    navigate(`${periodId}`);
  };

  const openCreateModal = () => setModalOpen(true);
  const closeCreateModal = () => setModalOpen(false);

  return {
    loading,
    modalOpen,
    creatingPeriod,
    searchTerm,
    filteredPeriods,
    actualCourse,
    
    setSearchTerm,
    
    handleCreatePeriod,
    goToPeriod,
    openCreateModal,
    closeCreateModal,
  };
}