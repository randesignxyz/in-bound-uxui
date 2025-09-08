import React, { useState } from 'react';
import { Descriptions, Spin, FormInstance } from 'antd';
import moment from 'moment';
import { useForm } from 'antd/lib/form/Form';
import { formatConfig } from '@/pages/utils';
import { AccountType } from '@/services/account/data';
import { ProCard, ProForm, ProFormGroup, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { simpleRequestActions } from '@/services/model';
import { useAccess, useModel } from '@umijs/max';
import { EmployeeInfResult } from '@/pages/hrm/df/data';
// import { createService } from '@/pages/hrm/probation/services';
import { Df360EmpServiceAPI } from '@/pages/hrm/df/services';

export default ({ title, form, onlyCurrentUser, onSetSubmitter }: {
    form: FormInstance<{
    requestorId: number;
    requestorBuId: number;
  } >
  title?: React.ReactNode;
  onlyCurrentUser?:boolean;
  onSetSubmitter?: (data:EmployeeInfResult) => Promise<void>;
}) => {
  const access = useAccess()
  const requestActions = simpleRequestActions();
  const [requestor, setRequestor] = useState<EmployeeInfResult>()
  const currentUser =  useModel('@@initialState');
  const [firstInit, setFirstInit] = useState(false)
  // const srvHR = createService({ request: requestActions })
  const srv = Df360EmpServiceAPI(requestActions);
  // const [form1] = useForm<{requestorId: number;requestorBuId: number;}>()

  const fetchUser = async (userId?: number) => {
    srv.fetchProbationEmployeeInfo(userId||0).then(it=> {
      onSetSubmitter?.(it)
      setRequestor(it)
      if(firstInit) {
        form.setFieldsValue({requestorId: userId})  
      } 
      form.setFieldsValue({requestorBuId: it.buId})
      // form1.setFieldsValue({requestorBuId: it.buId})
    })  
   
  }

  const onSearchHandler = async (type: AccountType, searchValue?: string) => {  
    const login =  currentUser.initialState?.currentUser?.login
    const it1 = await srv.fetchProbationEmpList( firstInit?login: searchValue)
    // const it1 = await srvHR.fetchProbationEmpList(searchValue)
    if(firstInit && login) {
      let emp = (it1||[{id:0}]).at(0)       
      await fetchUser(emp?.id||0)
    }
    setFirstInit(false)
    return it1.map((it_1:any) => ({ value: it_1.id, label: it_1.empName }));
  };

  return (<Spin spinning={requestActions.request?.loading}>
    <ProForm form={form} submitter={false}>
      <ProCard title= {title || 'Submitter'}
        bordered 
        headerBordered
        size="small">
        <ProFormGroup >
          <ProFormSelect width={'sm'} label="Name"
            fieldProps={{
              dropdownMatchSelectWidth: 300 ,
              onChange(value: any) {
              
                fetchUser(value)
              },
            }}
            disabled = {onlyCurrentUser }
            name={"requestorId"}          
            allowClear
            showSearch
            rules={[{ required: true }]} debounceTime={1000}
            request={({ keyWords }) => onSearchHandler('user', keyWords)} />
          <ProFormSelect         
            rules={[{ required: true }]} 
            name={'requestorBuId'} width={'sm'}           
            label="Business Unit" 
            options={[{ label: requestor?.buName, value: requestor?.buId }]}
          />
          <ProFormText label ="Create Date" >{moment().format(formatConfig.date)}</ProFormText>
        </ProFormGroup>

        <Descriptions size='small'>
          <Descriptions.Item label="Emp No">
            <b> {requestor?.empNo} </b>
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <b> {''} </b>
          </Descriptions.Item>
          <Descriptions.Item label="Job Title">
            <b> {requestor?.jobTitle} </b>
          </Descriptions.Item>
          <Descriptions.Item label="Function">
            <b> {requestor?.departmentName} </b>
          </Descriptions.Item>
          <Descriptions.Item label="Sub Function">
            <b> {requestor?.subDepartmentName || 'n/a'} </b>
          </Descriptions.Item>
        </Descriptions>
      </ProCard>
    </ProForm>    
  </Spin>
  );
};

