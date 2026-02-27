import { simpleRequestActions } from "@/services/model";
import { ModalForm, ModalFormProps, ProFormCheckbox, ProFormSelect, ProFormText } from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { BU, Department, SubDepartment,EmployeeListItem } from '../data';
import { Space } from 'antd';
import { EmployeeServices } from '../services';
import { useEffect, useRef, useState } from 'react';
import { MultiRequest } from '@/services/apiGateway';

interface Props extends ModalFormProps<EmployeeListItem> {
  dataItem?: EmployeeListItem|undefined;
}

export default ({ dataItem, ...rest }: Props) => {
  // const [requistionDetail, setRequistionDetail] = useState<StaffRequisitionRequest>();
  const [jobOptions, setJobOptions] = useState<{label:string,value:number}[]>([]);
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

      // 🔥 preload selected job title
      setJobOptions([
        {
          label: dataItem.jobTitle,
          value: dataItem.job_id,
        },
      ]);

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
  //
  return <ModalForm  {...rest} form={form} width={'30%'} title="Edit employee profiles"
                     onOpenChange={visible => {
                       rest.onOpenChange?.(visible)
                     }}
                     submitter={{
                       searchConfig: {
                         submitText: 'Submit',
                         resetText: 'Cancel',
                       },
                     }}
  >
    <Space direction='horizontal' style={{width:'100%'}}>
      <ProFormText label="Emp no" name={'emp_no'} />
      <ProFormText label="Integrated ID" name={'sap_id'} />
    </Space>
    <ProFormText label="Local Name" name={'local_name'} />
    <ProFormText label="First name" name={'first_name'} />
    <ProFormText label="Last name" name={'last_name'} />
    <ProFormSelect
      label="Job Title"
      name="job_title_id"
      showSearch
      allowClear
      options={jobOptions}
      request={async ({ keyWords }) => {
        const response = await EmployeeServices
          .listPageJobTitle(keyWords)
          .query(requestActions);

        const options = response.items.map((it) => ({
          label: it.name,
          value: it.id,
        }));

        setJobOptions(options);

        return options;
      }}
    />
    <ProFormSelect label="Department" name={'department_id'} showSearch
                   options={data?.departmentList?.map((it) => ({ label: it.name, value: it.id }))}
    />
    <ProFormSelect label="BU" name={'bu_id'}  shouldUpdate
                   options={data?.buList.map((it) => ({ label: it.name, value: it.id }))}
    />
    <ProFormSelect label="Status" name={'status'}  shouldUpdate
                   request={async () => [
                     { label: 'Active', value: 'ACTIVE'},
                     { label: 'Inactive', value: 'INACTIVE' }
                   ]}
    />
  </ModalForm>
}
