import { useEffect, useState } from "react";
import { useUserStore } from "../store/userStore";
import type { StudentAbsenceInfo, CreateAttendanceInterface } from "../interfaces/attendanceInterface";
import { attendanceService } from "../services/attendance.service";

const useAttendance = () => {
    const [studentAbsences, setStudentAbsences] = useState<StudentAbsenceInfo[]>();
    const [absencesMap, setAbsencesMap] = useState<Map<string, number>>(new Map());
    const [actualAbsencesDates, setActualAbsencesDates] = useState<Date[]>();
    const user = useUserStore((s) => s.user);
    const fetchUser = useUserStore((s) => s.fetchUser);

    useEffect(() => {
        const prepareHook = async () => {
            if (!user) {
                await fetchUser();
            };
        };
        prepareHook();
    }, [user]);

    useEffect(() => {
        if (!studentAbsences) return
        const newMap = new Map<string, number>();

        studentAbsences.forEach((s: StudentAbsenceInfo) => {
            newMap.set(s.userId, s.totalAbsences)
        });
        setAbsencesMap(newMap);
    }, [studentAbsences])

    //Endpoints GET
    const getStudentAbsencesByClass = async (classId: string) => {
        if (!user) return {
            state: "error",
            message: "No se ha podido cargar la información del usuario"
        };

        const teacherId = user.id;

        const res = await attendanceService.getAbsencesByClass(classId, teacherId);
        const success = res?.code === 200

        if (success) {
            setStudentAbsences(res.data)
        }

        return {
            state: success ? "success" : "error",
            message: success ? "Ausencias por clase recuperadas exitosamente" : res?.error
        }
    }

    const getAbsencesByStudent = async (classId: string, studentId: string) => {
        if (!user) return {
            state: "error",
            message: "No se ha podido cargar la información del usuario"
        };

        const teacherId = user.id;

        const res = await attendanceService.getStudentAbsencesInfo(classId, teacherId, studentId);
        const success = res?.code === 200

        if (success) {
            const dateInfo = res.data.map((date: string) => new Date(date));
            setActualAbsencesDates(dateInfo);
        }

        return {
            state: success ? "success" : "error",
            message: success ? "Ausencias por estudiante recuperadas exitosamente" : res?.error
        }
    }

    //Endpoints POST
    const saveAttendanceList = async (attendanceInfo: Omit<CreateAttendanceInterface, "teacherId">) => {
        if (!user) return {
            state: "error",
            message: "No se ha podido cargar la información del usuario"
        };

        const classId = attendanceInfo.classId;
        const attendanceData = {
            teacherId: user.id,
            date: attendanceInfo.date,
            studentRows: attendanceInfo.studentRows
        };
        const res = await attendanceService.saveAttendanceList(classId, attendanceData);
        if (res?.code === 201) {
            return {
                state: "success",
                message: "Asistencia guardada correctamente"
            }
        }
        return {
            state: res?.code === 409 ? "info" : "error",
            message: res?.error
        };
    }

    return {
        studentAbsences,
        actualAbsencesDates,
        absencesMap,
        saveAttendanceList,
        getStudentAbsencesByClass,
        getAbsencesByStudent,
    }
}

export default useAttendance;
