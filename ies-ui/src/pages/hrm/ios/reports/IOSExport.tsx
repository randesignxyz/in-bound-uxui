import React, { useEffect, useState } from 'react';
import {
  ModalForm,
  ProFormSelect,
} from '@ant-design/pro-components';
import {Button, Checkbox, Dropdown, Form, Input, MenuProps, message, Space} from 'antd';
import { DownOutlined, ExportOutlined, FileExcelOutlined } from '@ant-design/icons';
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
  // section?: number[];
};

const IOSExport = ({ trigger }: { trigger?: JSX.Element}) => {
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
  // const companyOptions = [
  //   { label: 'Section 1', value: 1, disabled: true },
  //   { label: 'Section 2', value: 2 }
  // ];

  // ================= EXPORT =================
  // const handleExport = async () => {
  //   try {
  //     const dataForm = await form.validateFields();
  //     setLoading(true);

  //     const reportName = 'IOS Performance Review Detail List';

  //     await downloadGenericReport(requestActions)({
  //       fileName: `${reportName}-${moment().format(
  //         'YYYYMMDDHHmmss'
  //       )}.xls`,
  //       type: 'EXCEL',
  //       data: {
  //         reportName: 'hr_ios_emp_detail_list', // your jasper name
  //         reportPath: getUrlReporting('hrm/ios'),
  //         data: [
  //            {key:'empNo',value:dataForm.employeeId},
  //           ...(dataForm.buIds || []).map((it) => ({
  //             key: 'buIds',
  //             value: it,
  //           })),

  //           ...(dataForm.departmentIds || []).map((it) => ({
  //             key: 'deptIds',
  //             value: it,
  //           })),

  //           ...(dataForm.subFunctionIds || []).map((it) => ({
  //             key: 'subDeptIds',
  //             value: it,
  //           })),
  //           {key:'startWithRole', value: 'ROLE_HR_IOS'},           
  //           // ...(dataForm.section || []).map((it) => ({
  //           //   key: 'section',
  //           //   value: it,
  //           // })),

  //         ],

  //       },
  //     });

  //     setLoading(false);
  //   } catch (error: any) {
  //     message.error(error.message || 'Failed to generate report.');
  //     setLoading(false);
  //   }
  // };
  const reportList = [
    {name:'Progress Report', value: 'hr_ios_emp_progress_list'},
    {name:'Detail Report', value: 'hr_ios_emp_by_detail_list'}
  ]
    const handleMenuClick: MenuProps['onClick'] = async (e) => {
      try {
          const dataForm = form.getFieldsValue()          
          // const raw = rawData? '_data':''
          const reportName = (reportList.find(r=> r.value==e.key)?.name )
          setLoading(true)
          await downloadGenericReport(requestActions)({
              fileName: `IOS ${reportName}-${moment().format()}.xls`,
              type: 'EXCEL',
              data: {
                  reportName: e.key,
                  reportPath: getUrlReporting('hrm/ios'),
                  data: [      
                      {key:'empNo',value:dataForm.employeeId},
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
  const items=(): MenuProps['items']=>{
    return reportList.map(e => {
        return {
            key: e.value,
            label: e.name,
            icon: <FileExcelOutlined style={{ fontSize: '16px', color: '#08c' }} />           
        }
    })
  } 
  const menuProps = {
      items: items(),
      onClick: handleMenuClick,
  };
  const bnts = [
      // <Button onClick={()=>{form.resetFields()}}>Reset</Button>,
      <Dropdown menu={menuProps}>
          <Button loading={loading}>
              <Space>
                  Export <DownOutlined />
              </Space>
          </Button>
      </Dropdown>
  ]  

  // ================= UI =================
  return (
    <ModalForm<FormData>
      title="Export IOS Performance Review"
      trigger={trigger}
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
          ...bnts
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
       {/* <Form.Item initialValue={[1]} name="section" label="Sections">
          <Checkbox.Group options={companyOptions} />
        </Form.Item> */}

      {/* Status 
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
      />*/}
    </ModalForm>
  );
};

export default IOSExport;
