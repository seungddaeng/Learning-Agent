import { Modal, Table, Empty, message, Typography } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import type { StudentInfo } from "../interfaces/studentInterface";
import type { AbsenceRow } from "../interfaces/attendanceInterface";
import useAttendance from "../hooks/useAttendance";

interface AbsencesModalProps {
  open: boolean;
  onClose: () => void;
  classId: string,
  student?: StudentInfo;
}

function AbsencesModal({
  open,
  onClose,
  classId,
  student,
}: AbsencesModalProps) {
  const { actualAbsencesDates, getAbsencesByStudent } = useAttendance();
  const [loading, setLoading] = useState(true);

  const fetchAbsencesByStudent = async (studentId: string) => {
    const res = await getAbsencesByStudent(classId, studentId);

    if (res.state == "error") {
      message.error(res.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    if (!student) return;

    fetchAbsencesByStudent(student.userId);
  }, [student])

  const columns = [
    {
      title: "Fecha",
      dataIndex: "date",
      key: "date",
      render: (_: any, record: AbsenceRow) => (
        <Typography.Text>
          {dayjs(record.date).format("DD/MM/YYYY")}
        </Typography.Text>
      ),
    }
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={onClose}
      title={`Ausencias de ${student ? student.name + " " + student.lastname : ""
        }`}
      footer={null}
      width={window.innerWidth < 600 ? '50%' : '35%'}
    >
      {actualAbsencesDates && actualAbsencesDates.length > 0 ? (
        <Table
          columns={columns}
          dataSource={actualAbsencesDates}
          loading={loading}
          pagination={false}
        />
      ) : (
        <Empty description="No hay ausencias registradas" />
      )}
    </Modal>
  );
}

export default AbsencesModal;
