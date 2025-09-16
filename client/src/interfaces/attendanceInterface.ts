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

export interface StudentAbsenceInfo {
    userId: string,
    code: string,
    name: string,
    lastname: string,
    totalAbsences: number,
}

export interface AbsenceRow {
    date: Date,
}