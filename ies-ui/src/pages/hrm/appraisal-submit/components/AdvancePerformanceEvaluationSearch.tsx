 
import { simpleRequestActions } from '@/services/model'; 
// import { simpleRequestActions } from "@/services/model"
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { Drawer, DrawerProps,Flex, message } from 'antd';
import { useForm } from 'antd/lib/form/Form'; 
import { MultiRequest } from '@/services/apiGateway';

// import { BU, Department, EmployeeAdvanceSearchParams, EmployeeListItem, SubDepartment } from '../data';  
import { useEffect, useState } from 'react';
// import { EmployeeServices } from '../services';
import { BU, Department, EmployeeAdvanceSearchParams, SubDepartment } from '../../data';
import { EmployeeServices } from '../../services';
import { AppraisalAdvanceParams, AppraisalEvaluationAdvanceParams } from '../data.types';
import { AppraisalLookupData, PerformanceEvaluationAccessRs } from '../../appraisal-request/data.types';
import { createService } from "@/pages/hrm/appraisal-request/services"

interface Props extends DrawerProps {
  dataDS: PerformanceEvaluationAccessRs
  dataItem?: AppraisalAdvanceParams|undefined; 
  onSearch: (params: AppraisalEvaluationAdvanceParams) => void;
  onReset: () => void;
}
const AdvancePerformanceEvaluationSearch: React.FC<Props> = ({
  dataDS,
  // dataItem, 
  onSearch,
  onReset, 
  ...props
}) => {
  // const requestActions = simpleRequestActions();
  //   const srv = createService(requestActions)
  const [form] = useForm<AppraisalEvaluationAdvanceParams>();  
  const [data, setData] = useState<{
    buList: BU[];
    departmentList: Department[];
    subDepartmentList: SubDepartment[];
  }>();
  const [appraiser,setAppraiser] = useState<number>()

  // useEffect(() => {
  //   initData();
  // }, [dataItem]);
  // const initData = async () => { 
  //   const rs = await MultiRequest<{
  //   buList: BU[];
  //   deptList: Department[];
  //   subDeptList: SubDepartment[];
  //   }>([
  //       EmployeeServices.listBu.queryParams,
  //       EmployeeServices.listDepartment.queryParams,
  //       EmployeeServices.listSubDepartment.queryParams,
  //   ])(requestActions);

  //   setData({
  //       buList: rs.buList,
  //       departmentList: rs.deptList,
  //       subDepartmentList: rs.subDeptList,
  //   }); 
  //   // const year = await srv.fetchAppraisalPeriodList() 
  //   // setPeriod(year) 
  // }
   
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
        <ProFormSelect label="Appraiser" name={'appraiser'}  shouldUpdate allowClear
            options={dataDS?.appraiser?.map((it) => ({ label: it.appraiser1, value: it.appraiser1Id }))}            
            fieldProps={{
              dropdownMatchSelectWidth: 300 ,
              onChange(value: any) {              
                message.error(value)
                setAppraiser(value)
                form.setFieldValue('company',null)
                form.setFieldValue('function',null)
              },
            }}
        /> 
        <ProFormSelect label="Company" name={'company'} mode='multiple'  shouldUpdate allowClear
            options={dataDS?.company?.filter(it=>(it.appraiser1Id==appraiser)).map((it) => ({ label: it.company, value: it.company }))}
        />    
         <ProFormSelect label="Function" name={'function'}  mode='multiple' showSearch  allowClear
            options={dataDS?.function?.filter(it=>(it.appraiser1Id==appraiser)).map((it) => ({ label: it.func, value: it.func }))}
        />    
        
      </ProForm>
    </Drawer>
  );
};

export default AdvancePerformanceEvaluationSearch;
