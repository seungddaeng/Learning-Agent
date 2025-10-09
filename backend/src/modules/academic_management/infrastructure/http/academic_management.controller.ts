import { Body, Controller, Get, Param, Post, UseGuards, Put, Query } from '@nestjs/common';
import { CreateClassUseCase } from '../../application/commands/create-class.usecase';
import { CreateClassDto } from './dtos/create-classes.dto';
import { ListClassesUseCase } from '../../application/queries/list-classes.usecase';
import { ListStudentsUseCase } from '../../application/queries/list-student.usecase';
import { GetClassesByStudentUseCase } from '../../application/queries/get-classes-by-student.usecase';
import { GetStudentsByClassUseCase } from '../../application/queries/get-students-by-class.usecase';
import { GetClassByIdUseCase } from '../../application/queries/get-class-by-id.usecase';
import { EnrollSingleStudentDto } from './dtos/enroll-single-student.dto';
import { EnrollSingleStudentUseCase } from '../../application/commands/enroll-single-student.usecase';
import { EnrollGroupStudentUseCase } from '../../application/commands/enroll-group-students.usecase';
import { EnrollGroupStudentDTO } from './dtos/enroll-group-student.dto';
import { UpdateClassUseCase } from '../../application/commands/update-class.usecase';
import { EditClassDTO } from './dtos/edit-class.dto';
import { SoftDeleteClassUseCase } from '../../application/commands/soft-delete-class.usecase';
import { DeleteClassDTO } from './dtos/delete-class.dto';
import { DeleteStudentDTO } from './dtos/delete-student.dto';
import { GetTeacherInfoByIDUseCase } from '../../application/queries/get-teacher-info-by-id.usecase';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { CreateCourseUseCase } from '../../application/commands/create-course.usecase';
import { CreateCourseDTO } from './dtos/create-course.dto';
import { GetCoursesByTeacherUseCase } from '../../application/queries/get-courses-by-teacher.usecase';
import { GetClassesByCourseUseCase } from '../../application/queries/get-classes-by-course.usecase';
import { getDateAbsencesBystudentUseCase } from '../../application/queries/get-date-absences-by-student.usecase.ts';
import { responseAlreadyCreated, responseConflict, responseCreated, responseForbidden, responseInternalServerError, responseNotFound, responseSuccess } from 'src/shared/handler/http.handler';
import { AlreadyCreatedError, ForbiddenError, NotFoundError,ConflictError } from 'src/shared/handler/errors';
import { GetCourseByIdUseCase } from '../../application/queries/get-course-by-id.usecase';
import { SoftDeleteSingleEnrollmentUseCase } from '../../application/commands/soft-delete-single-enrollment.useCase';
import { AttendenceGroupStudentDTO } from './dtos/attendence-group-student.dto';
import { SaveAttendanceGroupStudentUseCase } from '../../application/commands/save-attendance-group-student-usecase';
import { absencesByClassDTO } from './dtos/absences-by-class.dto';
import { GetAbsencesByClass } from '../../application/queries/get-absences-by-class';
const academicRoute = 'academic'

@UseGuards(JwtAuthGuard)
@Controller(academicRoute)
export class AcademicManagementController {
  constructor(
    private readonly listClasses: ListClassesUseCase,
    private readonly listStudents: ListStudentsUseCase,
    private readonly getCourseById: GetCourseByIdUseCase,
    private readonly getCoursesByTeacher: GetCoursesByTeacherUseCase,
    private readonly getClassesByCourse: GetClassesByCourseUseCase,
    private readonly getClassById: GetClassByIdUseCase,
    private readonly getClassesByStudent: GetClassesByStudentUseCase,
    private readonly getStudentsByClass: GetStudentsByClassUseCase,
    private readonly getTeacherInfoById: GetTeacherInfoByIDUseCase,
    private readonly createCourse: CreateCourseUseCase,
    private readonly createClasses: CreateClassUseCase,
    private readonly enrollSingle: EnrollSingleStudentUseCase,
    private readonly enrollGroup: EnrollGroupStudentUseCase,
    private readonly updateClass: UpdateClassUseCase,
    private readonly softDeleteClass: SoftDeleteClassUseCase,
    private readonly softDeleteStudent: SoftDeleteSingleEnrollmentUseCase,
    private readonly saveAttendanceGroupStudent: SaveAttendanceGroupStudentUseCase,
    private readonly getAbsencesByClass: GetAbsencesByClass,
    private readonly getDateAbsencesBystudentUseCase: getDateAbsencesBystudentUseCase,    
  ) { }

@Get('classes')
  async listClassesEndPoint() {
    const classesData = await this.listClasses.execute();
    return responseSuccess(
      'Clases listadas correctamente',
      classesData,
      'List all active classes endpoint',
      `${academicRoute}/classes`,
    );
  }

  @Get('students')
  async listStudentEndPoint() {
    const students = await this.listStudents.execute();
    return responseSuccess(
      'Estudiantes listados correctamente',
      students,
      'List all students endpoint',
      `${academicRoute}/students`,
    );
  }

  @Get('course/:id')
  async getCourseByIdEndpoint(@Param('id') id: string) {
    const course = await this.getCourseById.execute(id);
    return responseSuccess(
      'Curso obtenido correctamente',
      course,
      'Get course by ID',
      `${academicRoute}/course/${id}`,
    );
  }

  @Get('course/by-teacher/:id')
  async getCourseByTeacherEndpoint(@Param('id') id: string) {
    const courses = await this.getCoursesByTeacher.execute(id);
    return responseSuccess(
      'Cursos del profesor obtenidos correctamente',
      courses,
      'List all courses of a teacher',
      `${academicRoute}/course/by-teacher/${id}`,
    );
  }

@Get('classes/by-course/:id')
async getClassesByCourseEndpoint(@Param('id') id: string) {
  const path = `${academicRoute}/classes/by-course/${id}`;
  const description = "List all classes of a course";
  
  const classes = await this.getClassesByCourse.execute(id);
  return responseSuccess("Sin implementar", classes, description, path);
}

@Get('classes/:id')
async getClassByIdEndpoint(@Param('id') id: string) {
  const path = `${academicRoute}/classes/${id}`;
  const description = "Get class by ID";
  
  const objClass = await this.getClassById.execute(id);
  return responseSuccess("Sin implementar", objClass, description, path);
}

@Get('classes/by-student/:studentId')
async getClassesByStudentEndpoint(@Param('studentId') studentId: string) {
  const path = `${academicRoute}/classes/by-student/${studentId}`;
  const description = "Get classes by student ID";
  
  const classesData = await this.getClassesByStudent.execute(studentId);
  return responseSuccess("Sin implementar", classesData, description, path);
}

@Get('students/by-class/:classId')
async getStudentsByClassEndpoint(@Param('classId') classId: string) {
  const path = `${academicRoute}/students/by-class/${classId}`;
  const description = "Get students by class ID";
  
  const studentsData = await this.getStudentsByClass.execute(classId);
  return responseSuccess("Sin implementar", studentsData, description, path);
}

@Get('teacher/:id')
async getTeacherInfoByID(@Param('id') id: string) {
  const path = `${academicRoute}/teacher/${id}`;
  const description = "List teacher info by ID";
  
  const teacherInfo = await this.getTeacherInfoById.execute(id);
  return responseSuccess("Sin implementar", teacherInfo, description, path);
}

@Get('/absences/classes/:classId')
async getStudentAbsencesByClassId(
  @Param('classId') id: string,
  @Query('teacherId') teacherId: string
) {
  const path = `${academicRoute}/absences/class/${id}`;
  const description = "Get all student absences for a class";

  const input = { classId: id, teacherId };
  const absences = await this.getAbsencesByClass.execute(input);
  return responseSuccess("Sin implementar", absences, description, path);
}


  @Get('/students/:studentId/absences/dates')
async getStudentAbsencesByDate(
  @Param('studentId') id: string,
  @Query('teacherId') teacherId: string,
  @Query('classId') classId: string
) {
  const path = `${academicRoute}/students/${id}/absences/dates`;
  const description = "Retrieve all absence dates of a student for a specific class";

  const input = { studentId: id, teacherId, classId };
  const absencesDate = await this.getDateAbsencesBystudentUseCase.execute(input);
  return responseSuccess("Sin implementar", absencesDate, description, path);
}

//  POST Endpoints 

@Post('course')
async createCourseEndpoint(@Body() dto: CreateCourseDTO) {
  const path = `${academicRoute}/course`;
  const description = "Create a new course";

  const classesData = await this.createCourse.execute(dto);
  return responseCreated("Sin implementar", classesData, description, path);
}

@Post('classes')
async createClassEndpoint(@Body() dto: CreateClassDto) {
  const path = `${academicRoute}/classes`;
  const description = "Create a new Class";

  const classesData = await this.createClasses.execute(dto);
  return responseCreated("Sin implementar", classesData, description, path);
}

@Post('enrollments/single-student')
async enrollSingleStudentEndpoint(@Body() dto: EnrollSingleStudentDto) {
  const path = `${academicRoute}/enrollments/single-student`;
  const description = "Enroll one student to a class";

  const enrollment = await this.enrollSingle.execute(dto);
  return responseCreated("Sin implementar", enrollment, description, path);
}

@Post('enrollments/group-students')
async enrollGroupStudentEndpoint(@Body() dto: EnrollGroupStudentDTO) {
  const path = `${academicRoute}/enrollments/group-students`;
  const description = "Enroll a group of students to a class";

  const enrollments = await this.enrollGroup.execute(dto);
  return responseCreated("Sin implementar", enrollments, description, path);
}

@Post('attendance/:classId')
async AttendeceGroupStudentsEndpoint(
  @Param('classId') classId: string,
  @Body() dto: AttendenceGroupStudentDTO
) {
  const path = `${academicRoute}/attendances/${classId}`;
  const description = `Registro de asistencias para la clase ${classId} por el docente ${dto.teacherId} en la fecha ${dto.date.toISOString().split('T')[0]}`;

  const attendanceData = await this.saveAttendanceGroupStudent.execute({
    classId,
    teacherId: dto.teacherId,
    date: dto.date,
    studentRows: dto.studentRows,
  });

  return responseCreated("Sin implementar", attendanceData, description, path);
}

// PUT Endpoints 

@Put('classes/:id')
async updateClassEndpoint(@Param('id') id: string, @Body() dto: EditClassDTO) {
  const path = `${academicRoute}/classes/${id}`;
  const description = "Update information of a class by id";

  const input = {
    teacherId: dto.teacherId,
    classId: id,
    name: dto.name,
    semester: dto.semester,
    dateBegin: dto.dateBegin,
    dateEnd: dto.dateEnd,
  };

  const objClass = await this.updateClass.execute(input);
  return responseCreated("Sin implementar", objClass, description, path);
}

@Put('classes/remove/:id')
async softDeleteEndpoint(
  @Param('id') id: string,
  @Body() dto: DeleteClassDTO,
) {
  const path = academicRoute + `/classes/remove/${id}`;
  const description = 'Soft delete a class by id';

  const input = {
    teacherId: dto.teacherId,
    classId: id,
  };

  const objClass = await this.softDeleteClass.execute(input);

  return responseCreated(
    'Clase marcada como eliminada correctamente',
    objClass,
    description,
    path,
  );
}

@Put('students/remove/:id')
async softDeleteStudents(
  @Param('id') id: string,
  @Body() dto: DeleteStudentDTO,
) {
  const path = academicRoute + `/students/remove/${id}`;
  const description = 'Soft delete a student by student ID and class ID';

  const input = {
    teacherId: dto.teacherId,
    studentId: dto.studentId,
    classId: id,
  };

  const enrollment = await this.softDeleteStudent.execute(input);

  return responseCreated(
    'Estudiante marcado como eliminado correctamente',
    enrollment,
    description,
    path,
  );
}
}
      