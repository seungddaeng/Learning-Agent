import { useEffect } from "react";
import { useUserStore } from "../store/userStore";
import type { CreateAttendanceInterface } from "../interfaces/attendanceInterface";
import { attendanceService } from "../services/attendance.service";

const useAttendance = () => {
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
            attendances: attendanceInfo.attendances
        };
        const res = await attendanceService.saveAttendanceList(classId, attendanceData);
        const success = res?.code === 201
        return {
            state: success ? "success" : "error",
            message: success ? "Asistencia guardada correctamente" : res?.error
        };
    }

    return {
        saveAttendanceList,
    }
}

export default useAttendance;
