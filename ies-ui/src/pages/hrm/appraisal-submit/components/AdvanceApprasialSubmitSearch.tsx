 
import { simpleRequestActions } from '@/services/model'; 
// import { simpleRequestActions } from "@/services/model"
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { Drawer, DrawerProps,Flex } from 'antd';
import { useForm } from 'antd/lib/form/Form'; 
import { MultiRequest } from '@/services/apiGateway';

// import { BU, Department, EmployeeAdvanceSearchParams, EmployeeListItem, SubDepartment } from '../data';  
import { useEffect, useState } from 'react';
// import { EmployeeServices } from '../services';
import { BU, Department, EmployeeAdvanceSearchParams, SubDepartment } from '../../data';
import { EmployeeServices } from '../../services';
import { AppraisalAdvanceParams } from '../data.types';
import { AppraisalLookupData } from '../../appraisal-request/data.types';
import { createService } from "@/pages/hrm/appraisal-request/services"

interface Props extends DrawerProps {
  dataItem?: AppraisalAdvanceParams|undefined; 
  onSearch: (params: AppraisalAdvanceParams) => void;
  onReset: () => void;
}
const AdvanceApprasialSubmitSearch: React.FC<Props> = ({
  dataItem, 
  onSearch,
  onReset, 
  ...props
}) => {
  const requestActions = simpleRequestActions();
    const srv = createService(requestActions)
  const [form] = useForm<AppraisalAdvanceParams>();  
  // const [period,setPeriod] = useState<AppraisalLookupData[]>()
  const [data, setData] = useState<{
    buList: BU[];
    departmentList: Department[];
    subDepartmentList: SubDepartment[];
  }>();

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
    // const year = await srv.fetchAppraisalPeriodList() 
    // setPeriod(year) 
  }
   
  return (
    <Drawer {...props}>
      <ProForm
        form={form}
        onReset={() => { onReset(); }}
        submitter={{
          onSubmit: async () => {
            const data = await form.validateFields();
            onSearch(data);
          },
        }}
      >
        {/* <ProFormSelect showSearch allowClear rules={[{required:false}]} mode="multiple" name={"appraisalPeriodId"} label = "Annual" options={period?.map(it => ({label: it.label, value: it.value}))}/> */}
        <ProFormSelect label="Company" name={'bu'} mode='multiple'  shouldUpdate allowClear
            options={data?.buList.map((it) => ({ label: it.name, value: it.id }))}
        />    
         <ProFormSelect label="Function" name={'department'}  mode='multiple' showSearch  allowClear
            options={data?.departmentList?.map((it) => ({ label: it.name, value: it.id }))}
        />    
        
      </ProForm>
    </Drawer>
  );
};

export default AdvanceApprasialSubmitSearch;
