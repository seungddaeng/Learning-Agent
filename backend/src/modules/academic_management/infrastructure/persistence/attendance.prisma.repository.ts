import { Injectable } from "@nestjs/common";
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AttendanceRepositoryPort } from "../../domain/ports/attendance.repository.port";
import { Attendance } from "../../domain/entities/attendance.entity";

@Injectable()
export class AttendancePrismaRepository implements AttendanceRepositoryPort {
    constructor(private readonly prisma: PrismaService) { }

    async findByClassId(classId: string): Promise<Attendance[]> {
        const attendanceData = await this.prisma.attendance.findMany({ where: { classId } })
        if (!attendanceData) return []
        return attendanceData.map(a => new Attendance(
            a.id,
            a.studentId,
            a.classId,
            a.date,
            a.isPresent
        ))
    }

    async findByStudentAndClass(studentId: string, classId: string): Promise<Attendance[]> {
        const attendanceData = await this.prisma.attendance.findMany({ where: { studentId, classId } })
        if (!attendanceData) return []
        return attendanceData.map(a => new Attendance(
            a.id,
            a.studentId,
            a.classId,
            a.date,
            a.isPresent
        ))
    }

    async countAttendanceByStudentAndClass(studentId: string, classId: string): Promise<number> {
        return await this.prisma.attendance.count({
            where: {
                studentId,
                classId,
                isPresent: true,
            },
        });
    }

    async countAbsenceByStudentAndClass(studentId: string, classId: string): Promise<number> {
        return await this.prisma.attendance.count({
            where: {
                studentId,
                classId,
                isPresent: false,
            },
        });
    }

    async create(studentId: string, classId: string, date: Date, isPresent: boolean = true): Promise<Attendance> {
        const attendance = await this.prisma.attendance.create({
            data: {
                studentId,
                classId,
                date,
                isPresent,
            },
        });

        return new Attendance(
            attendance.id,
            attendance.studentId,
            attendance.classId,
            attendance.date,
            attendance.isPresent,
        );
    }
}