import React, { useEffect, useState } from 'react';
import {
  ModalForm,
  ProFormSelect,
} from '@ant-design/pro-components';
import {Button, Form, Input, message} from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import { useForm } from 'antd/es/form/Form';
import moment from 'moment';

import { simpleRequestActions } from '@/services/model';
import { downloadGenericReport, MultiRequest } from '@/services/apiGateway';
import { BU, Department } from '@/pages/hrm/data';
import { EmployeeServices } from '@/pages/hrm/services';
import { getUrlReporting } from '@/pages/ReportUrl';


type FormData = {
  buIds?: number[];
  departmentIds?: number[];
  subFunctionIds?: number[];
  employeeId?: string;
  status?: string[];
};

const Export: React.FC = () => {
  const requestActions = simpleRequestActions();
  const [form] = useForm<FormData>();

  const [loading, setLoading] = useState(false);
  const [buList, setBuList] = useState<BU[]>([]);
  const [departmentList, setDepartmentList] = useState<Department[]>([]);
  const [subdepartmentList, setSubdepartmentList] = useState<string[]>([]);

  // ================= INIT DATA =================
  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    try {
      const rs = await MultiRequest<{
        buList: BU[];
        deptList: Department[];
        subDeptList: Department[];
      }>([
        EmployeeServices.listBu.queryParams,
        EmployeeServices.listDepartment.queryParams,
        EmployeeServices.listSubDepartment.queryParams,
      ])(requestActions);
      const subDeptList = rs.subDeptList.map(it => it.name)
      setSubdepartmentList(subDeptList.filter((item,index)=> subDeptList.indexOf(item)===index)?? [])
      setBuList(rs.buList);
      setDepartmentList(rs.deptList);
    } catch (err: any) {
      message.error(err.message || 'Failed to load filter data');
    }
  };

  // ================= EXPORT =================
  const handleExport = async () => {
    try {
      const dataForm = await form.validateFields();
      setLoading(true);

      const reportName = 'IOS Performance Review Detail List';

      await downloadGenericReport(requestActions)({
        fileName: `${reportName}-${moment().format(
          'YYYYMMDDHHmmss'
        )}.xls`,
        type: 'EXCEL',
        data: {
          reportName: 'hr_ios_emp_detail_list', // your jasper name
          reportPath: getUrlReporting('hrm/ios'),
          data: [
            ...(dataForm.status || []).map((it) => ({
              key: 'status',
              value: it,
            })),

            ...(dataForm.buIds || []).map((it) => ({
              key: 'buIds',
              value: it,
            })),

            ...(dataForm.departmentIds || []).map((it) => ({
              key: 'deptIds',
              value: it,
            })),

            ...(dataForm.subFunctionIds || []).map((it) => ({
              key: 'subDeptIds',
              value: it,
            })),
            {key:'startWithRole', value: 'ROLE_HR_IOS'},
            {key:'empNo',value:dataForm.employeeId}
          ],

        },
      });

      setLoading(false);
    } catch (error: any) {
      message.error(error.message || 'Failed to generate report.');
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <ModalForm<FormData>
      title="Export IOS Performance Review"
      trigger={
        <Button type="link" icon={<ExportOutlined />}>
          Export
        </Button>
      }
      form={form}
      modalProps={{ maskClosable: false }}
      submitter={{
        render: (_, dom) => [
          dom[0], // Cancel button
          <Button
            key="reset"
            onClick={() => {
              form.resetFields();
              setLoading(false);
            }}
          >
            Reset
          </Button>,
          <Button
            key="export"
            type="primary"
            loading={loading}
            onClick={handleExport}
          >
            Export
          </Button>,
        ],
      }}
    >


      <Form.Item
        label="Employee Id"
        name="employeeId"
      >
        <Input placeholder="Please enter one or more separated by( , )  e.g. 000001, 000002" />
      </Form.Item>
      <ProFormSelect
        label="Company"
        name="buIds"
        mode="multiple"
        allowClear
        showSearch
        options={buList.map((it) => ({
          label: it.name,
          value: it.id,
        }))}
      />

      {/* Function */}
      <ProFormSelect
        label="Function"
        name="departmentIds"
        mode="multiple"
        allowClear
        showSearch
        options={departmentList.map((it) => ({
          label: it.name,
          value: it.id,
        }))}
      />

      {/* Sub Function */}
      <ProFormSelect
        label="Sub Function"
        name="subFunctionIds"
        mode="multiple"
        allowClear
        showSearch
        options={subdepartmentList.filter((item,index)=> subdepartmentList.indexOf(item)===index).map((it) => ({
          label: it,
          value: it,
        }))}
      />

      {/* Status */}
      <ProFormSelect
        label="Status"
        name="status"
        mode="multiple"
        allowClear
        options={[
          { label: 'Pending', value: 'PENDING' },
          { label: 'In Progress', value: 'IN_PROGRESS' },
          { label: 'Completed', value: 'COMPLETED' },
        ]}
      />
    </ModalForm>
  );
};

export default Export;
