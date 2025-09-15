export interface CreateAttendanceInterface {
    classId: string,
    teacherId: string,
    date: Date,
    studentRows: AttendanceRow[]
}

export interface AttendanceRow {
    studentId: string,
    isPresent?: boolean,
}

export interface AbsenceInfo {
    id: string;
    nombre: string;
    apellido: string;
    codigo: string;
    totalAbsences: number;
}