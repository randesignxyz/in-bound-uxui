import { formatConfig } from '@/pages/utils';
import { AccountType } from '@/services/account/data';
import { AccountServiceAPI } from '@/services/account/services';
import { simpleRequestActions } from '@/services/model';
import { UserResult } from '@/services/process-workflow/data';
import { ProCard, ProFormGroup, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Descriptions, FormInstance, Spin } from 'antd';
import moment from 'moment';
import { useState } from 'react';

export default ({
  title,
  form,
  onlyCurrentUser,
  onSetRequestor,
}: {
  form: FormInstance<{
    requestorId: string;
    requestorBuId: number;
  }>;
  title?: string;
  onlyCurrentUser?: boolean;
  onSetRequestor?: (userId: string, requestorBuId?: number) => Promise<void>;
}) => {
  const requestActions = simpleRequestActions();
  const accountServices = AccountServiceAPI(requestActions);
  const [requestor, setRequestor] = useState<UserResult>();
  const currentUser = useModel('@@initialState');
  const [firstInit, setFirstInit] = useState(true);

  const fetchUser = async (userId: string) => {
    const rs = await accountServices.fetchUser(userId).query(requestActions);
    onSetRequestor?.(rs.id, rs.employee?.buId);
    setRequestor(rs);
    if (firstInit) {
      form.setFieldsValue({ requestorId: userId });
    }
    form.setFieldsValue({ requestorBuId: rs.employee?.buId });
  };

  const onSearchHandler = async (type: AccountType, searchValue?: string) => {
    const login = currentUser.initialState?.currentUser?.login;

    const it = await accountServices.findUserOrGroupList({
      type: type,
      searchValue: firstInit ? login : searchValue, // firstInit? (currentUser.initialState?.currentUser?.login || 'phanny.ngoun'):searchValue,
      approveOnly: false,
    });
    if (firstInit && login) {
      await fetchUser(login);
    }
    setFirstInit(false);

    return it.map((it_1) => ({ value: it_1.id, label: it_1.name }));
  };

  return (
    <Spin spinning={requestActions.request?.loading}>
      <ProCard
        title={title || 'Requestor'}
        bordered
        // bodyStyle={{ backgroundColor: '#fefae7' }}
        size="small"
      >
        <ProFormGroup>
          <ProFormSelect
            width={'sm'}
            label="Name"
            fieldProps={{
              popupMatchSelectWidth: 300,
              onChange(value: any) {
                fetchUser(value);
              },
            }}
            disabled={onlyCurrentUser}
            name={'requestorId'}
            allowClear
            showSearch
            rules={[{ required: true }]}
            debounceTime={1000}
            request={({ keyWords }) => onSearchHandler('user', keyWords)}
          />
          <ProFormSelect
            rules={[{ required: true }]}
            name={'requestorBuId'}
            width={'sm'}
            label="Business Unit"
            options={requestor?.employeeList?.map((it) => ({ label: it.buName, value: it.buId }))}
          />
          <ProFormText label="Requested Date">{moment().format(formatConfig.date)}</ProFormText>
        </ProFormGroup>

        <Descriptions size="small">
          <Descriptions.Item label="Emp No">
            <b> {requestor?.employee?.empNo} </b>
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <b> {requestor?.email} </b>
          </Descriptions.Item>
          <Descriptions.Item label="Job Title">
            <b> {requestor?.employee?.jobTitle} </b>
          </Descriptions.Item>
          <Descriptions.Item label="Function">
            <b> {requestor?.employee?.department} </b>
          </Descriptions.Item>
          <Descriptions.Item label="Sub Function">
            <b> {requestor?.employee?.subDepartment || 'n/a'} </b>
          </Descriptions.Item>

          <Descriptions.Item label="Report To">
            <b>
              {' '}
              {requestor?.employee?.reportTo
                ? requestor?.employee?.reportTo
                : requestor?.employee?.hod}{' '}
            </b>
          </Descriptions.Item>
        </Descriptions>
      </ProCard>
    </Spin>
  );
};
