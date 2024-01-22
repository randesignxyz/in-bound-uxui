import React, { useEffect, useState } from 'react';
import { Descriptions, Spin, FormInstance } from 'antd';
import moment from 'moment';
import { UserResult } from '@/services/process-workflow/data';
import { formatConfig } from '@/pages/utils';
import { AccountType } from '@/services/account/data';
import { ProCard, ProFormGroup, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { simpleRequestActions } from '@/services/model';
// import { AccountServiceAPI } from '@/services/account/services';
import { useAccess, useModel } from '@umijs/max';
import access from '@/access';
import { EmployeeInfResult } from '@/pages/hrm/appraisal-submit/data.types';
import { createService } from '@/pages/hrm/appraisal-submit/services';

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
  // const accountServices = AccountServiceAPI(requestActions)
  const [requestor, setRequestor] = useState<EmployeeInfResult>()
  const currentUser =  useModel('@@initialState');
  const [firstInit, setFirstInit] = useState(true)
  const srvHR = createService({ request: requestActions })

  const fetchUser = async (userId?: number) => {
    // const rs = await accountServices.fetchUser(userId).query(requestActions)
    srvHR.fetchEmployeeInfo(userId||0).then(it=> {
      onSetSubmitter?.(it)
      setRequestor(it)
      if(firstInit) {
        form.setFieldsValue({requestorId: userId})  
      } 
      form.setFieldsValue({requestorBuId: it.buId})
    })  
   
  }

  const onSearchHandler = async (type: AccountType, searchValue?: string) => {  
    const login =  currentUser.initialState?.currentUser?.login
    // const it = await accountServices.findUserOrGroupList({
    //   type: type,
    //   searchValue:  firstInit?login: searchValue,// firstInit? (currentUser.initialState?.currentUser?.login || 'phanny.ngoun'):searchValue,
    //   approveOnly: false
    // });
    const it1 = await srvHR.fetchAppraisalList( firstInit?login: searchValue)
    if(firstInit && login) {
      let emp = (it1||[{id:0}]).at(0)       
      await fetchUser(emp?.id||0)
    }
    setFirstInit(false)
    return it1.map((it_1:any) => ({ value: it_1.id, label: it_1.empName }));
  };

  return (<Spin spinning={requestActions.request?.loading}>
    <ProCard title= {title || 'Submitter'}
      bordered 
      // bodyStyle={{ backgroundColor: '#fefae7' }}
      size="small">
      <ProFormGroup >
        <ProFormSelect width={'sm'} label="Name"
          fieldProps={{
            dropdownMatchSelectWidth: 300 ,
            onChange(value: any) {
              fetchUser(value)
            },
          }}
          disabled = {onlyCurrentUser ||  !access.isAccessHRApprasilSupport}
          name={"requestorId"}
         
          allowClear
          showSearch
          rules={[{ required: true }]} debounceTime={1000}
          request={({ keyWords }) => onSearchHandler('user', keyWords)} />
        <ProFormSelect 
          rules={[{ required: true }]} 
          name={'requestorBuId'} width={'sm'} 
         
          label="Business Unit" 
          // options={requestor?.employeeList?.map(it => ({ label: it.buName, value: it.buId }))} 
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
       
        <Descriptions.Item label="Appraiser">
          <b>
            {' '}
            {requestor?.reportTo
              ? requestor?.reportTo
              : requestor?.hodName}{' '}
          </b>

        </Descriptions.Item>
      </Descriptions>
    </ProCard>
  </Spin>
  );
};

