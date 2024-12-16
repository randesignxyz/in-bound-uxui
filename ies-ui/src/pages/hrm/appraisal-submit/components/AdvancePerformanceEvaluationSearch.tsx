import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { Drawer, DrawerProps } from 'antd';
import { useForm } from 'antd/lib/form/Form'; 
import { useEffect, useState } from 'react';
import { BU, Department, SubDepartment } from '../../data';
import { AppraisalEvaluationAdvanceParams } from '../data.types';
import { PerformanceEvaluationAccessRs } from '../../appraisal-request/data.types';

interface Props extends DrawerProps {
  dataDS: PerformanceEvaluationAccessRs
  // dataItem?: AppraisalAdvanceParams|undefined; 
  onSearch: (params: AppraisalEvaluationAdvanceParams) => void;
  onReset: () => void;
  forceReset?: number 
}
const AdvancePerformanceEvaluationSearch: React.FC<Props> = ({
  dataDS,
  onSearch,
  onReset, 
  forceReset,
  ...props
}) => {
  const [form] = useForm<AppraisalEvaluationAdvanceParams>();  
  const [data, setData] = useState<{
    buList: BU[];
    departmentList: Department[];
    subDepartmentList: SubDepartment[];
  }>();
  // const [appraiser,setAppraiser] = useState<number>()
  const [company,setCompany] = useState<string[]>()
  const [func,setFunc] = useState<string[]>()

  useEffect(()=>{
    if((forceReset||0)>0) {
      form.resetFields()
    }
  },[forceReset])

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
       
        <ProFormSelect label="Company" name={'company'} mode='multiple'  shouldUpdate allowClear
            // options={dataDS?.company?.filter(it=>(it.appraiser1Id==appraiser)).map((it) => ({ label: it.company, value: it.company }))}
            options={dataDS?.company?.map((it) => ({ label: it.company, value: it.company }))}
            fieldProps={{
              dropdownMatchSelectWidth: 300 ,
              onChange(value: any) { 
                setCompany(value)
                form.setFieldValue('function',[])
              },
            }}
        />    
         <ProFormSelect label="Function" name={'function'}  mode='multiple' showSearch  allowClear
            options={dataDS?.function?.filter(it=>(company?.find(rs=> (rs==it.company))) ).map((it) => ({ label: it.func, value: it.func }))}
            fieldProps={{
              dropdownMatchSelectWidth: 300 ,
              onChange(value: any) { 
                setFunc(value)
                form.setFieldValue('appraiser',[])
              },
            }}
        />
         <ProFormSelect label="Appraiser" name={'appraiser'} mode='multiple'  shouldUpdate allowClear
            options={dataDS?.appraiser?.filter(it=>(company?.find(c=>(c==it.company)) && ((func||[])?.length>0? func?.find(f=>(f==it.func)):true )))
              .filter((obj1, i, arr) => 
                arr.findIndex(obj2 => 
                  JSON.stringify({appraiser1: obj2.appraiser1,appraiser1Id: obj2.appraiser1Id}) === JSON.stringify({appraiser1: obj1.appraiser1,appraiser1Id: obj1.appraiser1Id})
                ) === i
              )
              .map((it) => ({ label: it.appraiser1, value: it.appraiser1Id }))}     
        /> 
      </ProForm>
    </Drawer>
  );
};

export default AdvancePerformanceEvaluationSearch;
