export interface CreateAttendanceInterface {
    classId: string,
    teacherId: string,
    date: Date,
    attendances: AttendanceRow[]
}

export interface AttendanceRow {
    studentId: string,
    isPresent?: boolean,
}