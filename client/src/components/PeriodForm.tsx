import {
  Modal,
  Form,
  Select,
  Space,
  Button,
  DatePicker,
  message,
  ConfigProvider,
} from "antd";
import { useFormik } from "formik";
import * as yup from "yup";
import dayjs, { Dayjs } from "dayjs";
import esES from "antd/locale/es_ES";
import "dayjs/locale/es";
import isBetween from "dayjs/plugin/isBetween";
import customParseFormat from "dayjs/plugin/customParseFormat";

import type { Course } from "../interfaces/courseInterface";
import type { Clase, CreateClassDTO } from "../interfaces/claseInterface";

dayjs.locale("es");
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

const { Option } = Select;
const MIN_BUSINESS_DAYS = 25;

const periodValidationSchema = yup.object({
  semester: yup
    .string()
    .required("El semestre es obligatorio")
    .matches(/^(PRIMERO|SEGUNDO|INVIERNO|VERANO) \d{4}$/, "Semestre inválido"),
  dateBegin: yup.string().required("La fecha de inicio es obligatoria"),
  dateEnd: yup.string().required("La fecha de fin es obligatoria"),
});

interface PeriodFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (periodData: CreateClassDTO | Clase) => Promise<void>;
  course: Course;
  period?: Clase;
  loading?: boolean;
}

function PeriodForm({
  open,
  onClose,
  onSubmit,
  course,
  period,
  loading = false,
}: PeriodFormProps) {
  const countBusinessDays = (start: Dayjs, end: Dayjs) => {
    let days = 0;
    let current = start.clone();
    while (current.isBefore(end, "day")) {
      const day = current.day();
      if (day !== 0 && day !== 6) days++;
      current = current.add(1, "day");
    }
    return days;
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      semester: period?.semester || "",
      dateBegin: period?.dateBegin || "",
      dateEnd: period?.dateEnd || "",
    },
    validationSchema: periodValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const start = dayjs(values.dateBegin);
        const end = dayjs(values.dateEnd);

        // Validar mínimo de días hábiles
        const businessDays = countBusinessDays(start, end);
        if (businessDays < MIN_BUSINESS_DAYS) {
          message.error(
            `El período debe tener mínimo ${MIN_BUSINESS_DAYS} días hábiles`
          );
          return;
        }

        // Crear DTO según modo (crear / editar)
        let periodData: CreateClassDTO | Clase;
        if (period) {
          periodData = {
            ...period,
            semester: values.semester,
            teacherId: course.teacherId,
            courseId: course.id,
            dateBegin: values.dateBegin,
            dateEnd: values.dateEnd,
          };
        } else {
          periodData = {
            semester: values.semester,
            teacherId: course.teacherId,
            courseId: course.id,
            dateBegin: values.dateBegin,
            dateEnd: values.dateEnd,
          };
        }

        await onSubmit(periodData);
        resetForm();
        onClose();
      } catch (error) {
        console.error(error);
      }
    },
  });

  const handleCancel = () => {
    onClose();
    formik.resetForm();
  };

  const today = dayjs();
  const currentYear = today.year();

  const allPeriods = [
    {
      name: `PRIMERO ${currentYear}`,
      start: `${currentYear}-01-25`,
      end: `${currentYear}-06-30`,
      type: "NORMAL",
    },
    {
      name: `INVIERNO ${currentYear}`,
      start: `${currentYear}-07-01`,
      end: `${currentYear}-07-24`,
      type: "SPECIAL",
    },
    {
      name: `SEGUNDO ${currentYear}`,
      start: `${currentYear}-07-25`,
      end: `${currentYear}-12-31`,
      type: "NORMAL",
    },
    {
      name: `VERANO ${currentYear + 1}`,
      start: `${currentYear + 1}-01-01`,
      end: `${currentYear + 1}-01-24`,
      type: "SPECIAL",
    },
    {
      name: `PRIMERO ${currentYear + 1}`,
      start: `${currentYear + 1}-01-25`,
      end: `${currentYear + 1}-06-30`,
      type: "NORMAL",
    },
    {
      name: `INVIERNO ${currentYear + 1}`,
      start: `${currentYear + 1}-07-01`,
      end: `${currentYear + 1}-07-24`,
      type: "SPECIAL",
    },
    {
      name: `SEGUNDO ${currentYear + 1}`,
      start: `${currentYear + 1}-07-25`,
      end: `${currentYear + 1}-12-31`,
      type: "NORMAL",
    },
    {
      name: `VERANO ${currentYear + 2}`,
      start: `${currentYear + 2}-01-01`,
      end: `${currentYear + 2}-01-24`,
      type: "SPECIAL",
    },
  ];

  let availableSemesters = allPeriods.filter((p) =>
    dayjs(p.end).isAfter(today)
  );

  availableSemesters = availableSemesters.sort((a, b) =>
    dayjs(a.start).diff(dayjs(b.start))
  );

  availableSemesters = availableSemesters.slice(0, 4);

  const ranges = availableSemesters.reduce((acc, sem) => {
    acc[sem.name] = {
      start: dayjs(sem.start),
      end: dayjs(sem.end),
      type: sem.type,
    };
    return acc;
  }, {} as Record<string, { start: Dayjs; end: Dayjs; type: string }>);

  const disabledDateBegin = (current: Dayjs) => {
    const { semester } = formik.values;
    if (!semester || !ranges[semester]) return true;

    const { start, end, type } = ranges[semester];
    const minDate = start.isAfter(today) ? start : today;

    if (type === "SPECIAL") {
      return (
        current.isBefore(minDate, "day") ||
        current.isAfter(end, "day") ||
        current.day() === 0 ||
        current.day() === 6
      );
    }

    let temp = end.clone();
    let days = 0;
    while (days < MIN_BUSINESS_DAYS) {
      temp = temp.subtract(1, "day");
      if (temp.day() !== 0 && temp.day() !== 6) days++;
    }
    const maxDate = temp;

    return (
      current.isBefore(minDate, "day") ||
      current.isAfter(maxDate, "day") ||
      current.day() === 0 ||
      current.day() === 6
    );
  };

  const disabledDateEnd = (current: Dayjs) => {
    const { semester, dateBegin } = formik.values;
    if (!semester || !ranges[semester]) return true;

    const { start, end, type } = ranges[semester];

    if (type === "SPECIAL") {
      return (
        current.isBefore(start, "day") ||
        current.isAfter(end, "day") ||
        current.day() === 0 ||
        current.day() === 6
      );
    }

    if (!dateBegin) return true;

    const beginDate = dayjs(dateBegin);

    // Calcular fecha mínima válida
    let temp = beginDate.clone();
    let days = 0;
    while (days < MIN_BUSINESS_DAYS) {
      temp = temp.add(1, "day");
      if (temp.day() !== 0 && temp.day() !== 6) days++;
    }
    const minDate = temp;

    const maxDate = end;

    return (
      current.isBefore(minDate, "day") ||
      current.isAfter(maxDate, "day") ||
      current.day() === 0 ||
      current.day() === 6
    );
  };

  const handleDateChange = (
    field: "dateBegin" | "dateEnd",
    value: Dayjs | null
  ) => {
    const { semester } = formik.values;
    if (!semester || !ranges[semester]) return;

    const { start, end, type } = ranges[semester];

    if (value) {
      const isoDate = value.format("YYYY-MM-DD");
      formik.setFieldValue(field, isoDate);

      if (field === "dateBegin") {
        if (type === "SPECIAL") {
          formik.setFieldValue("dateBegin", start.format("YYYY-MM-DD"));
          formik.setFieldValue("dateEnd", end.format("YYYY-MM-DD"));
        } else {
          let temp = value.clone();
          let days = 0;
          while (days < MIN_BUSINESS_DAYS && temp.isBefore(end)) {
            temp = temp.add(1, "day");
            if (temp.day() !== 0 && temp.day() !== 6) days++;
          }
          if (temp.isAfter(end)) temp = end;
          formik.setFieldValue("dateEnd", temp.format("YYYY-MM-DD"));
        }
      }
    } else {
      formik.setFieldValue(field, "");
      if (field === "dateBegin") formik.setFieldValue("dateEnd", "");
    }
  };

  return (
    <ConfigProvider locale={esES}>
      <Modal
        title={`${period ? "Editar" : "Crear"} Período`}
        open={open}
        onCancel={handleCancel}
        footer={null}
        centered
        width={500}
      >
        <Form
          layout="vertical"
          onFinish={formik.handleSubmit}
          style={{ marginTop: "20px" }}
        >
          {/* Select semestre */}
          <Form.Item
            label="Semestre"
            validateStatus={
              formik.errors.semester && formik.touched.semester ? "error" : ""
            }
            help={
              formik.errors.semester && formik.touched.semester
                ? formik.errors.semester
                : null
            }
          >
            <Select
              placeholder="Selecciona un semestre"
              value={formik.values.semester || undefined}
              onChange={(value) => {
                formik.setFieldValue("semester", value);
                formik.setFieldTouched("semester", true);
                formik.setFieldValue("dateBegin", "");
                formik.setFieldValue("dateEnd", "");
              }}
              disabled={!!period}
            >
              {availableSemesters.map((sem) => (
                <Option key={sem.name} value={sem.name}>
                  {sem.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Fecha de inicio */}
          <Form.Item
            label="Fecha de inicio"
            validateStatus={
              formik.errors.dateBegin && formik.touched.dateBegin ? "error" : ""
            }
            help={
              formik.errors.dateBegin && formik.touched.dateBegin
                ? formik.errors.dateBegin
                : null
            }
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              disabledDate={disabledDateBegin}
              value={
                formik.values.dateBegin ? dayjs(formik.values.dateBegin) : null
              }
              onChange={(date) => {
                handleDateChange("dateBegin", date);
                formik.setFieldTouched("dateBegin", true);
              }}
              disabled={!formik.values.semester}
            />
          </Form.Item>

          {/* Fecha de fin */}
          <Form.Item
            label="Fecha de fin"
            validateStatus={
              formik.errors.dateEnd && formik.touched.dateEnd ? "error" : ""
            }
            help={
              formik.errors.dateEnd && formik.touched.dateEnd
                ? formik.errors.dateEnd
                : null
            }
          >
            <DatePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              disabledDate={disabledDateEnd}
              value={
                formik.values.dateEnd ? dayjs(formik.values.dateEnd) : null
              }
              onChange={(date) => {
                handleDateChange("dateEnd", date);
                formik.setFieldTouched("dateEnd", true);
              }}
              disabled={!formik.values.dateBegin}
            />
          </Form.Item>

          {/* Botones */}
          <Form.Item style={{ marginTop: "24px", marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={handleCancel}
                danger
                type="primary"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading || formik.isSubmitting}
              >
                {period ? "Actualizar Período" : "Crear Período"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </ConfigProvider>
  );
}

export default PeriodForm;
