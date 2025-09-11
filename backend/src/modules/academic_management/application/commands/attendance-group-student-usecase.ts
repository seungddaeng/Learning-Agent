import { Inject, Injectable, Logger } from '@nestjs/common';
import { ATTENDANCE_REPO, CLASSES_REPO, COURSE_REPO, ENROLLMENT_REPO } from '../../tokens';
import type { AttendanceRepositoryPort } from '../../domain/ports/attendance.repository.ports';
import type { EnrollmentRepositoryPort } from '../../domain/ports/enrollment.repository.ports';
import type { ClassesRepositoryPort } from '../../domain/ports/classes.repository.ports';
import type { CourseRepositoryPort } from '../../domain/ports/courses.repository.ports';
import { ForbiddenError, NotFoundError } from '../../../../shared/handler/errors';
import { AttendenceGroupStudentRow } from '../../infrastructure/http/dtos/attendence-group-student.dto';
import { Attendance } from '../../domain/entities/attendance.entity';

@Injectable()
export class AttendanceGroupStudentUseCase {
    private readonly logger = new Logger(AttendanceGroupStudentUseCase.name)
    constructor(
        @Inject(ATTENDANCE_REPO) private readonly attendanceRepo: AttendanceRepositoryPort,
        @Inject(ENROLLMENT_REPO) private readonly enrollmentRepo: EnrollmentRepositoryPort,
        @Inject(CLASSES_REPO) private readonly classesRepo: ClassesRepositoryPort,
        @Inject(COURSE_REPO) private readonly courseRepo: CourseRepositoryPort,
    ) { }
    //classId:string ,teacherId:string, date:Date, studentRows: AttendenceGroupStudentRow[] 
    async execute(input: {
        classId: string,
        teacherId: string,
        date: Date,
        studentRows: AttendenceGroupStudentRow[],
    }) {
        const objClass = await this.classesRepo.findById(input.classId);
        if (!objClass) {
            this.logger.error(`Class not found with ID ${input.classId}`);
            throw new NotFoundError(`No se ha podido recupear la información de la clase`);
        }
        const course = await this.courseRepo.findById(objClass.courseId);
        if (!course) {
            this.logger.error(`Course not found with id ${objClass.courseId}`);
            throw new NotFoundError(`No se ha podido recuperar la información de la materia`);
        }
        if (course.teacherId != input.teacherId) {
            this.logger.error(`Class ${objClass.id}-${objClass.name} doesnt belongs to teacher ${input.teacherId}`);
            throw new ForbiddenError(`No se ha podido recuperar la información del Docente`);
        }
        let totalRows = input.studentRows.length, errorRows = 0, existingRows = 0, successRows = 0;
        for (const row of input.studentRows) {
            const enrollment = await this.enrollmentRepo.findByStudentAndClass(row.studentId, input.classId);
            if (!enrollment) {
                this.logger.error(`Enrollment not found for student ${row.studentId} and class ${input.classId}`);
                errorRows++;
                continue;
            }
            const existing = await this.attendanceRepo.findByStudentClassAndDate(
                row.studentId,
                input.classId,
                input.date
            );
            
            if (existing) {
                existingRows++;
                continue;
            }
            successRows++;

            await this.attendanceRepo.create(row.studentId, input.classId, input.date, row.isPresent);
        }
        return { totalRows, errorRows, existingRows, successRows };
    }
}
