 
import { simpleRequestActions } from '@/services/model'; 
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { Drawer, DrawerProps,Flex } from 'antd';
import { useForm } from 'antd/lib/form/Form'; 
import { MultiRequest } from '@/services/apiGateway';

import { BU, Department, SubDepartment } from '@/pages/hrm/data';  
import { useEffect, useState } from 'react';
import { EmployeeServices } from '@/pages/hrm/services';
import { OpenAdvanceSearchParams, OpenEssDataItem } from '../data_ess';

interface Props extends DrawerProps {
  dataItem?: OpenEssDataItem|undefined; 
  onSearch: (params: OpenAdvanceSearchParams) => void;
  onReset: () => void;
}
const AdvanceOpenItemSearch: React.FC<Props> = ({
  dataItem, 
  onSearch,
  onReset, 
  ...props
}) => {
  const requestActions = simpleRequestActions();
  const [form] = useForm<OpenAdvanceSearchParams>();  
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
        <ProFormSelect label="Company" name={'bu'}  shouldUpdate allowClear
            options={data?.buList.map((it) => ({ label: it.name, value: it.id }))}
        />    
         <ProFormSelect label="Function" name={'department'} showSearch  allowClear
            options={data?.departmentList?.map((it) => ({ label: it.name, value: it.id }))}
        />    
        
      </ProForm>
    </Drawer>
  );
};

export default AdvanceOpenItemSearch;
