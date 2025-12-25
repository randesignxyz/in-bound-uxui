import { Card, Row, Col, Button, Spin } from "antd";
import {
  ProForm,
  ProFormText,
  ProFormSelect,
} from "@ant-design/pro-components";
import { useForm } from "antd/lib/form/Form";
import { useEffect, useState } from "react";
import { simpleRequestActions } from "@/services/model";
import { EmployeeServices } from "../services";
import { BU, Department, EmployeeListItem } from "../data";
import { MultiRequest } from "@/services/apiGateway";

interface Props {
  type: "CREATE" | "EDIT" | "VIEW";
  id?: number;                 // required for EDIT / VIEW
  onSuccess?: () => void;      // callback after save
}

const EmployeeForm = ({ type, id, onSuccess }: Props) => {
  const requestActions = simpleRequestActions();
  const [form] = useForm<EmployeeListItem>();

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [data, setData] = useState<{
    buList: BU[];
    departmentList: Department[];
  }>({
    buList: [],
    departmentList: [],
  });

  const isView = type === "VIEW";
  const isEdit = type === "EDIT";
  const isCreate = type === "CREATE";

  /* ===================== LOAD LOOKUPS ===================== */
  useEffect(() => {
    loadLookups();
  }, []);

  const loadLookups = async () => {
    const rs = await MultiRequest<{
      buList: BU[];
      deptList: Department[];
    }>([
      EmployeeServices.listBu.queryParams,
      EmployeeServices.listDepartment.queryParams,
    ])(requestActions);

    setData({
      buList: rs.buList,
      departmentList: rs.deptList,
    });
  };

  /* ===================== LOAD EMPLOYEE DETAIL ===================== */
  useEffect(() => {
    if ((isEdit || isView) && id) {
      loadEmployee();
    } else {
      form.resetFields();
    }
  }, [id, type]);

  const loadEmployee = async () => {
    setInitLoading(true);
    try {
      const rs = await EmployeeServices.fetchEmployeeById(id!).query(
        requestActions
      );

      form.setFieldsValue({
        emp_no: rs.employeeCode,
        sap_id: rs.sapId,
        local_name: rs.employeeLocalName,
        first_name: rs.firstName,
        last_name: rs.lastName,
        job_title_id: rs.job_id,
        department_id: rs.department_id,
        bu_id: rs.bu_id,
        status: rs.status,
      });
    } finally {
      setInitLoading(false);
    }
  };

  /* ===================== SUBMIT ===================== */
  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);

    try {
      const payload: EmployeeListItem = {
        id,
        employeeCode: values.emp_no,
        sapId: values.sap_id,
        employeeLocalName: values.local_name,
        firstName: values.first_name,
        lastName: values.last_name,
        job_id: values.job_title_id,
        department_id: values.department_id,
        bu_id: values.bu_id,
        status: values.status,
      };

      await EmployeeServices.EmployeeUpdate(payload).query(requestActions);
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  /* ===================== RENDER ===================== */
  return (
    <Spin spinning={initLoading}>
      <Card
        title={
          isCreate
            ? "New Employee"
            : isEdit
              ? "Edit Employee"
              : "View Employee"
        }
      >
        <ProForm
          form={form}
          layout="vertical"
          submitter={false}
          disabled={isView}
        >
          <Row gutter={16}>
            <Col span={12}>
              <ProFormText
                name="emp_no"
                label="Employee No"
                rules={[{ required: true }]}
                disabled={isEdit}
              />
            </Col>

            <Col span={12}>
              <ProFormText
                name="sap_id"
                label="Integrated ID (SAP)"
              />
            </Col>

            <Col span={12}>
              <ProFormText
                name="local_name"
                label="Local Name (KH)"
                rules={[{ required: true }]}
              />
            </Col>

            <Col span={6}>
              <ProFormText
                name="first_name"
                label="First Name (EN)"
                rules={[{ required: true }]}
              />
            </Col>

            <Col span={6}>
              <ProFormText
                name="last_name"
                label="Last Name (EN)"
                rules={[{ required: true }]}
              />
            </Col>

            <Col span={12}>
              <ProFormSelect
                name="job_title_id"
                label="Job Title"
                showSearch
                request={async ({ keyWords }) => {
                  const res =
                    await EmployeeServices.listPageJobTitle(keyWords).query(
                      requestActions
                    );
                  return res.items.map((it) => ({
                    label: it.name,
                    value: it.id,
                  }));
                }}
                rules={[{ required: true }]}
              />
            </Col>

            <Col span={8}>
              <ProFormSelect
                name="department_id"
                label="Department"
                options={data.departmentList.map((d) => ({
                  label: d.name,
                  value: d.id,
                }))}
                rules={[{ required: true }]}
              />
            </Col>

            <Col span={8}>
              <ProFormSelect
                name="bu_id"
                label="Business Unit"
                options={data.buList.map((b) => ({
                  label: b.name,
                  value: b.id,
                }))}
                rules={[{ required: true }]}
              />
            </Col>

            <Col span={8}>
              <ProFormSelect
                name="status"
                label="Status"
                options={[
                  { label: "Active", value: "ACTIVE" },
                  { label: "Inactive", value: "INACTIVE" },
                ]}
                rules={[{ required: true }]}
              />
            </Col>
          </Row>

          {!isView && (
            <Row justify="end" style={{ marginTop: 24 }}>
              <Button
                type="primary"
                loading={loading}
                onClick={handleSubmit}
              >
                {isCreate ? "Create" : "Save"}
              </Button>
            </Row>
          )}
        </ProForm>
      </Card>
    </Spin>
  );
};

export default EmployeeForm;
