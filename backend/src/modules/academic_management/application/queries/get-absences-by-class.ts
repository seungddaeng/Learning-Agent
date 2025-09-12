import { Inject, Injectable, Logger } from "@nestjs/common";
import {  COURSE_REPO, ENROLLMENT_REPO, CLASSES_REPO } from "../../tokens";
import type { EnrollmentRepositoryPort } from "../../domain/ports/enrollment.repository.ports";
import type { CourseRepositoryPort } from "../../domain/ports/courses.repository.ports";
import type { ClassesRepositoryPort } from "../../domain/ports/classes.repository.ports";
import { Enrollment } from "../../domain/entities/enrollment.entity";
import { ConflictError, ForbiddenError, NotFoundError } from "../../../../shared/handler/errors";


@Injectable()
export class GetAbsencesByClass {
    private readonly logger = new Logger(GetAbsencesByClass.name)
    constructor(
        @Inject(CLASSES_REPO) private readonly classesRepo: ClassesRepositoryPort,
        @Inject(COURSE_REPO) private readonly courseRepo: CourseRepositoryPort,
    ) {}

    async execute(input:{
        classId: string,
        teacherId: string,
    }) {
        const objClass = await this.classesRepo.findById(input.classId);

        if (!objClass) {
            this.logger.error(`Class not found with Id ${input.classId}`)
            throw new NotFoundError(`No se ha podido recuperar la información de la clase`)
        }
        const course = await this.courseRepo.findById(objClass.courseId);
        if (!course) {
          this.logger.error(`Course not found with id ${objClass.courseId}`);
          throw new NotFoundError("No se encontró el curso");
        }    
        if (course?.teacherId !== input.teacherId) {
          this.logger.error(
            ` `,
            );

          throw new ForbiddenError("El docente no tiene permisos sobre esta clase");
        }
        
        
    }
}