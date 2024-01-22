import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { simpleRequestActions } from '@/services/model';

import { LookupData } from '@/services/data';
import {
  ActionType,
  ProForm,
  ProFormSelect,
  ProFormTextArea,
  ProList,
} from '@ant-design/pro-components';
import { Card, message, Switch } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { join } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { CRMDTO } from '../customer/data';
import { CustomerServiceAPI } from '../customer/services';
import { GroupCustomer } from '../groupCustomer/data';
import { GroupCustomerServiceAPI } from '../groupCustomer/service';

interface Props extends FormModalProps {
  customerTypes: LookupData[];
  actionHandler: {
    onCancel: () => void;
    onOk: (
      remark?: string,
      customerType?: string,
      items?: CRMDTO,
      customerGroupId?: string | undefined,
    ) => void;
  };
}

export default ({ actionHandler, customerTypes, ...props }: Props) => {
  const requestActions = simpleRequestActions();
  // const services = RegistrationFormAPI(requestActions);
  const customerServiceAPI = CustomerServiceAPI(requestActions);
  const customerGroupServiceAPI = GroupCustomerServiceAPI(requestActions);
  const [selectedItem, setSelectedItem] = useState<CRMDTO>();
  const actionRef = useRef<ActionType>();
  const [form] = useForm<{ remarks: string; customerGroup: string }>();
  const [activeKey, setActiveKey] = useState<React.Key | undefined>('All');
  const [dataSource, setDataSource] = useState<CRMDTO[]>([]);
  const [searchText, setSearchText] = useState<string>('');

  const [customerGroups, setCustomerGroups] = useState<GroupCustomer[]>([]);

  const [page, setPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const resetAll = async () => {
    const customerList = await customerServiceAPI.crmList({
      searchValue: undefined,
      pageRequest: {
        page: 1,
        pageSize: 5,
      },
    });
    const result = (await customerGroupServiceAPI.listGroupCustomer({})).items;
    setCustomerGroups(result);
    form.setFieldsValue({ customerGroup: result.find((it) => it.isDefault === true)?.id });
    setPage(1);
    setTotalRecords(customerList.total ?? 0);
    setDataSource(customerList.items);
    setSelectedItem(undefined);
    setActiveKey('All');
    setSearchText('');
  };

  useEffect(() => {
    if (props.open) form.resetFields();
    (async () => {
      if (props.open) await resetAll();
    })();
  }, [props.open]);

  const getCustomerType = (customerCode: string) => {
    const code = customerCode.charAt(0).toLowerCase();
    return code === 'c' ? 'Direct' : code === 'l' ? 'Indirect' : 'Direct MC';
  };

  const fetchCustomers = async (
    key: React.Key | undefined,
    textValue: string,
    pageNumber: number,
  ) => {
    const value = key?.toString() ?? '';
    const customerType = customerTypes.find((it) => it.code === value);
    const customerList = await customerServiceAPI.crmList({
      searchValue: textValue === '' ? undefined : textValue,
      pageRequest: {
        page: pageNumber,
        pageSize: 5,
      },
      advanceSearch:
        customerType === undefined
          ? undefined
          : {
              customerTypeId: customerType?.id === -1 ? undefined : customerType?.id,
            },
    });

    setTotalRecords(customerList.total ?? 0);
    setDataSource(customerList.items);
    actionRef.current?.reload();
  };

  return (
    <FormModalComp
      {...props}
      title="Approve Registration Form"
      onCancel={actionHandler.onCancel}
      onResetForm={async () => {
        await resetAll();
        form.resetFields();
      }}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        const customerType = getCustomerType(selectedItem?.code ?? '');
        if (selectedItem === undefined || selectedItem === null) {
          message.error('Please select a customer.');
        } else {
          actionHandler.onOk(dataForm.remarks, customerType, selectedItem, dataForm.customerGroup);
        }
        // console.log(customerType);
        // console.log(dataForm.remarks);
        // console.log(selectedItem?.code);
      }}
    >
      <Card>
        <ProForm form={form} submitter={false} layout="horizontal">
          <ProFormSelect
            options={customerGroups.map((it) => ({
              value: it.id,
              label: join([it.code, it.name], ' - '),
            }))}
            width="lg"
            name="customerGroup"
            rules={[{ required: true, message: 'Please select Customer Group' }]}
            label={'Customer Group'}
          />
          <ProList<CRMDTO>
            actionRef={actionRef}
            dataSource={dataSource}
            // showActions="hover"
            style={{
              margin: 0,
              padding: 0,
            }}
            toolbar={{
              menu: {
                activeKey,
                type: 'tab',
                items: customerTypes.map((it) => ({ key: it.code, label: it.name })),
                onChange: async (key) => {
                  fetchCustomers(key, searchText, 1);
                  setActiveKey(key);
                },
              },
              search: {
                value: searchText,
                onChange: async (e) => {
                  const text = e.currentTarget.value;
                  //const textValue = text.trim();
                  fetchCustomers(activeKey, text, 1);
                  setSearchText(text);
                },
              },
            }}
            pagination={{
              //current: page,
              //defaultCurrent: 1,
              current: page,
              pageSize: 5,
              total: totalRecords,
              showSizeChanger: false,
              onChange(pageNumber) {
                fetchCustomers(activeKey, searchText, pageNumber);
                setPage(pageNumber);
              },
            }}
            metas={{
              title: {
                dataIndex: 'code',
              },
              // avatar: {
              //   dataIndex: 'code',
              //   search: false,
              // },
              description: {
                search: false,
                dataIndex: 'internalName',
                render: (_, i) => {
                  return <>Internal Name : {i.internalName}</>;
                },
              },
              subTitle: {
                search: false,
                render: (_, i) => {
                  return <>Name: {i.name}</>;
                },
              },
              actions: {
                render: (_, r) => {
                  const isSelected = selectedItem?.id === r.id;
                  return (
                    <Switch
                      key={r.id}
                      checked={isSelected}
                      onClick={() => {
                        setSelectedItem(r);
                      }}
                    />
                  );
                },
              },
            }}
          />
          <ProFormTextArea rules={[{ required: true }]} label="Remarks" name="remarks" />
        </ProForm>
      </Card>
    </FormModalComp>
  );
};
