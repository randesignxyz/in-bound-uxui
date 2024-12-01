import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { Drawer, DrawerProps } from 'antd';
import { useForm } from 'antd/lib/form/Form'; 
import { useState } from 'react';
import { BU, Department, SubDepartment } from '../../data';
import { AppraisalAdvanceParams, AppraisalEvaluationAdvanceParams } from '../data.types';
import { PerformanceEvaluationAccessRs } from '../../appraisal-request/data.types';

interface Props extends DrawerProps {
  dataDS: PerformanceEvaluationAccessRs
  dataItem?: AppraisalAdvanceParams|undefined; 
  onSearch: (params: AppraisalEvaluationAdvanceParams) => void;
  onReset: () => void;
}
const AdvancePerformanceEvaluationSearch: React.FC<Props> = ({
  dataDS,
  onSearch,
  onReset, 
  ...props
}) => {
  const [form] = useForm<AppraisalEvaluationAdvanceParams>();  
  const [data, setData] = useState<{
    buList: BU[];
    departmentList: Department[];
    subDepartmentList: SubDepartment[];
  }>();
  const [appraiser,setAppraiser] = useState<number>()

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
        <ProFormSelect label="Appraiser" name={'appraiser'}  shouldUpdate allowClear
            options={dataDS?.appraiser?.map((it) => ({ label: it.appraiser1, value: it.appraiser1Id }))}            
            fieldProps={{
              dropdownMatchSelectWidth: 300 ,
              onChange(value: any) { 
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
