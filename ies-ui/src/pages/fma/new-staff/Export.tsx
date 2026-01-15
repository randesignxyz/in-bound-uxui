import React, { useEffect, useState } from 'react';
import {
  ModalForm,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, message } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useForm } from 'antd/es/form/Form';

import { simpleRequestActions } from '@/services/model';
import { downloadGenericReport, MultiRequest } from '@/services/apiGateway';
import { BU, Department } from '@/pages/hrm/data';
import { EmployeeServices } from '@/pages/hrm/services';
import { createService } from './services';
import moment from 'moment';
import { getUrlReporting } from '@/pages/ReportUrl';

type FormData = {
  requestedDate?: dayjs.Dayjs[];
  buIds?: number[];
  departmentIds?: number[];
  status?: string[];
  requestedBy?: string;
};

const Export: React.FC = () => {
  const requestActions = simpleRequestActions();
  const srv = createService(requestActions);
  const [form] = useForm<FormData>();

  const [loading, setLoading] = useState(false);
  const [buList, setBuList] = useState<BU[]>([]);
  const [departmentList, setDepartmentList] = useState<Department[]>([]);

  // ---------- INIT DATA ----------
  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    try {
      const rs = await MultiRequest<{
        buList: BU[];
        deptList: Department[];
      }>([
        EmployeeServices.listBu.queryParams,
        EmployeeServices.listDepartment.queryParams,
      ])(requestActions);

      setBuList(rs.buList);
      setDepartmentList(rs.deptList);
    } catch (err: any) {
      message.error(err.message || 'Failed to load filter data');
    }
  };

  // ---------- EXPORT ----------
  const handleExport = async (e:any) => {
    try {
      const dataForm =  await form.validateFields()
      const reportName ='New Staff Support Request Report'
      setLoading(true)
      await downloadGenericReport(requestActions)({
        fileName: `${reportName}-${moment().format()}.xls`,
        type: 'EXCEL',
        data: {
          reportName: 'new-staff-report',
          reportPath: getUrlReporting('fma'),
          data: [
            {key:'dateFrom', value: dataForm.requestedDate?.[0], type:'dateTime'},
            {key:'dateTo', value: dataForm.requestedDate?.[1], type:'dateTime'},
            ...(dataForm.status || ['All']).map(it => ({ key: 'status', value: it })),
            ...(dataForm.buIds || []).map(it => ({ key: 'buIds', value: it })),
            ...(dataForm.departmentIds || []).map(it => ({ key: 'departmentId', value: it })),
            {key:'startWithRole', value: 'ROLE_FMA_WF_NEW_STAFF_REQUESTER'}
          ]
        }
      }).then(()=>{
        setLoading(false)
      })
    } catch (error: any) {
      message.error(error.message || "Failed to generate report.")
      setLoading(false)
    }
  };

  return (
    <ModalForm<FormData>
      title="Export New Staff Requests"
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
      <ProFormDateRangePicker
        name="requestedDate"
        label="Requested Date"
        rules={[{ required: true }]}
      />

      <ProFormSelect
        label="Company"
        name="buIds"
        mode="multiple"
        allowClear
        showSearch
        options={buList.map(it => ({
          label: it.name,
          value: it.id,
        }))}
      />

      <ProFormSelect
        label="Function"
        name="departmentIds"
        mode="multiple"
        allowClear
        showSearch
        options={departmentList.map(it => ({
          label: it.name,
          value: it.id,
        }))}
      />

      <ProFormSelect
        label="Status"
        name="status"
        mode="multiple"
        allowClear
        options={[
          { label: 'Pending', value: 'PENDING' },
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'Rejected', value: 'REJECTED' },
        ]}
      />
    </ModalForm>
  );
};

export default Export;
