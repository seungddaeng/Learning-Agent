import { Attendance } from "../entities/attendance.entity";

export interface AttendanceRepositoryPort {
    findByClassId(
        classId: string
    ): Promise<Attendance[]>;
    findByStudentAndClass(
        studentId: string, 
        classId: string
    ): Promise<Attendance[]>;

    countAttendanceByStudentAndClass(
        studentId: string, 
        classId: string
    ): Promise<number>;
    countAbsenceByStudentAndClass(
        studentId: string, 
        classId: string
    ): Promise<number>;

    create(
        studentId: string,
        classId: string,
        date: Date,
        isPresent?: boolean,
    ): Promise<Attendance>;
}