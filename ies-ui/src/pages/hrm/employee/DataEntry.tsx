import { simpleRequestActions } from "@/services/model";
import { ProForm, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { useForm } from "antd/lib/form/Form";
import { BU, Department, SubDepartment, EmployeeListItem } from "../data";
import { Row, Col, Button, Card } from "antd";
import { EmployeeServices } from "../services";
import { useEffect, useState } from "react";
import { MultiRequest } from "@/services/apiGateway";

interface Props {
  dataItem?: EmployeeListItem;
  onSubmit?: (values: any) => Promise<any> | any;
}

const EmployeeForm = ({ dataItem, onSubmit }: Props) => {
  const requestActions = simpleRequestActions();
  const [data, setData] = useState<{
    buList: BU[];
    departmentList: Department[];
    subDepartmentList: SubDepartment[];
  }>();

  const [form] = useForm<EmployeeListItem>();

  useEffect(() => {
    initData();
  }, [dataItem]);

  const initData = async () => {
    const rs = await MultiRequest<{
      buList: BU[];
      deptList: Department[];
      subDeptList: SubDepartment[];
    }>([
      EmployeeServices.listBu.queryParams,
      EmployeeServices.listDepartment.queryParams,
      EmployeeServices.listSubDepartment.queryParams,
    ])(requestActions);

    setData({
      buList: rs.buList,
      departmentList: rs.deptList,
      subDepartmentList: rs.subDeptList,
    });

    form.resetFields();

    if (dataItem) {
      form.setFieldsValue({
        emp_no: dataItem.employeeCode,
        sap_id: dataItem.sapId,
        local_name: dataItem.employeeLocalName,
        first_name: dataItem.firstName,
        last_name: dataItem.lastName,
        job_title_id: dataItem.job_id,
        department_id: dataItem.department_id,
        bu_id: dataItem.bu_id,
        status: dataItem.status,
      });
    }
  };
  const handleSubmit = async (values: any) => {
    if (onSubmit) {
      await onSubmit(values);
    }
  };
  return (
    <Card title="Employee Form" bordered>
      <ProForm
        form={form}
        onFinish={handleSubmit}
        submitter={false}
        grid
        rowProps={{ gutter: 16 }}
        style={{ width: "100%", background: "white" }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <ProFormText label="Emp No" name="emp_no" />
          </Col>
          <Col span={12}>
            <ProFormText label="Integrated ID" name="sap_id" />
          </Col>
          <Col span={12}>
            <ProFormText label="Local Name" name="local_name" />
          </Col>
          <Col span={12}>
            <ProFormSelect
              label="Job Title"
              name="job_title_id"
              showSearch
              allowClear
              request={async ({ keyWords }) => {
                const its = (
                  await EmployeeServices.listPageJobTitle(keyWords).query(requestActions)
                ).items.map((it) => ({ label: it.name, value: it.id }));

                if (dataItem && !its.some((it) => it.value === dataItem.job_id)) {
                  return [
                    { label: dataItem.jobTitle, value: dataItem.job_id },
                    ...its,
                  ];
                }
                return its;
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormText label="First Name" name="first_name" />
          </Col>
          <Col span={12}>
            <ProFormText label="Last Name" name="last_name" />
          </Col>
          <Col span={8}>
            <ProFormSelect
              label="Department"
              name="department_id"
              showSearch
              options={data?.departmentList?.map((it) => ({
                label: it.name,
                value: it.id,
              }))}
            />
          </Col>
          <Col span={8}>
            <ProFormSelect
              label="BU"
              name="bu_id"
              options={data?.buList?.map((it) => ({
                label: it.name,
                value: it.id,
              }))}
            />
          </Col>
          <Col span={8}>
            <ProFormSelect
              label="Status"
              name="status"
              request={async () => [
                { label: "Active", value: "ACTIVE" },
                { label: "Inactive", value: "INACTIVE" },
              ]}
            />
          </Col>
          <Col span={24} style={{ textAlign: "right", marginTop: 16 }}>
            <Button type="primary" onClick={() => form.submit()}>
              Submit
            </Button>
            <Button style={{ marginLeft: 8 }}>Cancel</Button>
          </Col>
        </Row>
      </ProForm>
    </Card>
  );
};

export default EmployeeForm;
