import DescriptionDisplay from '@/components/Descriptions';
import { formatDate } from '@/pages/utils';

import { simpleRequestActions } from '@/services/model';
import { AimOutlined } from '@ant-design/icons';
import {
  FooterToolbar,
  ModalForm,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProList,
  ProTable,
} from '@ant-design/pro-components';
import { history, useAccess } from '@umijs/max';
// import { request } from '@umijs/max';
import { Button, Card, message, Modal, Space, Spin, Tabs, Tag, Typography } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { join, startCase } from 'lodash';
import numeral from 'numeral';
import { useCallback, useEffect, useState } from 'react';
import { RetailerPath } from '..';
import { SalePaths } from '../..';
import BreadCrumbCom from '../components/BreadCrumbCom';
import { GroupCustomer } from '../groupCustomer/data';
import { GroupCustomerServiceAPI } from '../groupCustomer/service';
import GoogleMapModal from '../orders/components/GoogleMapModal';
import { GoogleEntity } from '../orders/data';
import { ItemsPricing } from '../pricing/data';
import type { CustomerAddressDTO, CustomerDto } from './data';
import { CustomerServiceAPI } from './services';

interface Props {
  onEdit: (id: string) => void;
  id: string;
  customer?: CustomerDto;
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const layoutModal = {
  labelCol: { span: 6 },
  //   wrapperCol: { span: 22 },
};

export default ({ id }: Props) => {
  const requestActions = simpleRequestActions();
  const services = CustomerServiceAPI(requestActions);
  const [customer, setCustomer] = useState<CustomerDto>();
  const customerGroupServiceAPI = GroupCustomerServiceAPI(requestActions);
  const [customerAddressList, setCustomerAddressList] = useState<CustomerAddressDTO[]>();
  const [form] = useForm<CustomerDto>();
  const [formModal] = useForm<CustomerCreate>();
  const [customerGroups, setCustomerGroups] = useState<GroupCustomer[]>([]);

  const access = useAccess();
  const { Text } = Typography;

  const [googleModal, setGoogleModal] = useState<GoogleEntity>({
    visible: false,
    id: '',
    lat: -1,
    lng: -1,
    name: '',
    internalName: '',
    phone: '',
  });

  const routes = [
    {
      path: SalePaths.retailer,
      label: 'Retailer',
    },
    {
      path: `${RetailerPath.customer}/list`,
      label: 'Customer',
    },
    {
      path: `${RetailerPath.customer}/${id}`,
      label: 'Detail',
    },
  ];

  const initdata = useCallback(() => {
    (async () => {
      if (id) {
        const detail = await services.detailCustomer(id);
        setCustomer(detail);

        const ss = await services.customerAddressList(id);
        setCustomerAddressList(ss);

        const result = (await customerGroupServiceAPI.listGroupCustomer({})).items;
        setCustomerGroups(result);
      }
    })();
  }, []);

  useEffect(() => {
    initdata();
  }, []);

  const displayItems = [
    { label: 'First Name', value: customer?.firstName },
    { label: 'Last Name', value: customer?.lastName },
    { label: 'Phone', value: customer?.phone },
    {
      label: 'Status',
      value: customer?.status,
      tag: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{startCase(status)}</Tag>
      ),
    },
    { label: 'Type', value: customer?.type },
    { label: 'Modified by', value: customer?.lastModifiedBy },
    { label: 'Modified date', value: formatDate(customer?.lastModifiedDate) },
    {
      label: 'Customer Group',
      value: customer?.customerGroup?.name,
      onClick: () =>
        history.push(`${RetailerPath.customergroup}/detail/${customer?.customerGroup?.id}`),
    },
  ];

  const suggestion = [
    {
      label: 'Bussiness Name',
      value: customer?.suggestion?.businessName,
      onClick: () =>
        history.push(`${RetailerPath.registration}/detail/${customer?.suggestion?.id}`),
    },
    {
      label: 'Customer No',
      value: customer?.suggestion?.customerNo,
    },
    {
      label: 'Bussiness Owner',
      value: customer?.suggestion?.businessOwner,
    },
    {
      label: 'Bussiness Phone Number',
      value: customer?.suggestion?.phone,
    },

    {
      label: 'Status',
      value: customer?.suggestion?.status,
      tag: (status: string) => {
        return (
          <Tag color={status === 'pending' ? 'default' : 'green'}>
            {status === 'pending' ? 'Pending' : 'Approved'}
          </Tag>
        );
      },
    },
  ];

  const suggestionAddress = [
    {
      label: 'Bussiness Address',
      value: customer?.suggestion?.address,
    },
  ];

  const resetModal = () => {
    setGoogleModal({
      visible: false,
      id: '',
      lat: -1,
      lng: -1,
      internalName: '',
      name: '',
      phone: '',
    });
  };

  const address = (
    <>
      <ProList<CustomerAddressDTO>
        size="small"
        rowKey="name"
        dataSource={customerAddressList}
        showActions="hover"
        itemCardProps={{}}
        metas={{
          title: {
            render: (_, r) => (
              <Button
                icon={<AimOutlined />}
                type="link"
                onClick={
                  r.address.latitude !== undefined && r.address.longitude !== undefined
                    ? () => {
                      setGoogleModal({
                        visible: true,
                        id: r.id,
                        lat: parseFloat(r.address.latitude) ?? -1,
                        lng: parseFloat(r.address.longitude) ?? -1,
                        name: r.address.address,
                        internalName: '',
                        phone: `Contact Phone: ${r.phone}`,
                      });
                    }
                    : undefined
                }
              >
                {r.lastName
                  ? [r.firstName, r.lastName].join('-').toUpperCase()
                  : r.firstName?.toUpperCase()}
              </Button>
            ),
          },

          description: {
            search: false,
            render: (_, r) => (
              <>
                <span>phone: {r.phone}</span>
                <br />
                <span>{r.address.address}</span>
                <br />
                <span>
                  Latitude: {r.address.latitude ? r.address.latitude : 'N/A'} / Longitude:{' '}
                  {r.address.longitude ? r.address.longitude : 'N/A'}
                </span>
              </>
            ),
          },
          subTitle: {
            dataIndex: 'addressType',
            render: (_, row, index) => {
              return (
                <>
                  <Tag color="blue" key={`${row.addressType}${index}`}>
                    {startCase(row.addressType)}
                  </Tag>
                  {row.isDefault && <Tag key={`Default-${index}`}>Default</Tag>}
                </>
              );
            },
            search: false,
          },

          // actions: {
          //   render: (text, row) => [
          //     <a
          //       href={row.id}
          //       style={{ color: 'red' }}
          //       target="_blank"
          //       rel="noopener noreferrer"
          //       key="warning"
          //     >
          //       Delete
          //     </a>,
          //   ],
          //   search: false,
          // },
        }}
      />
    </>
  );

  return (
    <Spin spinning={requestActions.request?.loading}>
      <ProForm
        form={form}
        {...layout}
        layout="horizontal"
        submitter={{
          render: () => {
            return (
              <FooterToolbar>
                <Button
                  onClick={() => {
                    history.push(`${RetailerPath.customer}/list`);
                  }}
                >
                  Back
                </Button>
                {access.canCreateRetailer && (
                  <Space>
                    <ModalForm
                      size="middle"
                      {...layoutModal}
                      layout="horizontal"
                      onFinish={async () => {
                        Modal.confirm({
                          title: 'Are you sure?',
                          content: 'Change Group Customer',
                          onOk: async () => {
                            const data = formModal.getFieldsValue();
                            const params = {
                              id: id,
                              groupId: data.customerGroupId!,
                            };
                            try {
                              const respone = await services.changeGroupCustomer(params);
                              message.success(respone.message);
                              initdata();
                            } catch (e: any) {
                              message.error(e);
                            }
                          },
                        });
                        return Promise.resolve(true);
                      }}
                      form={formModal}
                      title="Change Group Customer"
                      trigger={
                        <Button
                          type="default"
                          onClick={() =>
                            formModal.setFieldsValue({
                              customerGroupId: customer?.customerGroup?.id,
                            })
                          }
                        >
                          Change Group
                        </Button>
                      }
                    >
                      <ProFormSelect
                        options={customerGroups.map((it) => ({
                          value: it.id,
                          label: join([it.code, it.name], ' - '),
                        }))}
                        width="lg"
                        hidden={customer?.suggestion?.status === 'pending'}
                        name="customerGroupId"
                        rules={[{ required: true, message: 'Please select Customer Group' }]}
                        label={'Customer Group'}
                      />
                    </ModalForm>
                    <ModalForm
                      size="middle"
                      {...layoutModal}
                      layout="horizontal"
                      onFinish={async () => {
                        Modal.confirm({
                          title: 'Are you sure?',
                          content: 'Update Customer',
                          onOk: async () => {
                            const data = formModal.getFieldsValue();
                            const entity = {
                              ...data,
                              id: id,
                            };
                            try {
                              const respone = await services.updateCustomer(entity);
                              message.success(respone.message);
                              initdata();
                            } catch (e: any) {
                              message.error(e);
                            }
                          },
                        });
                        return Promise.resolve(true);
                      }}
                      form={formModal}
                      title="Edit Customer"
                      trigger={
                        <Button
                          type="primary"
                          onClick={() =>
                            formModal.setFieldsValue({
                              firstName: customer?.firstName,
                              lastName: customer?.lastName,
                              phone: customer?.phone,
                              customerGroupId: customer?.customerGroup?.id,
                            })
                          }
                        >
                          Edit
                        </Button>
                      }
                    >
                      <ProFormText
                        label="First Name"
                        name={'firstName'}
                        rules={[{ required: true }]}
                        width="lg"
                      />
                      <ProFormText
                        label="Last Name"
                        name={'lastName'}
                        rules={[{ required: true }]}
                        width="lg"
                      />
                      <ProFormText
                        label="Phone"
                        name="phone"
                        rules={[{ required: true }]}
                        width="lg"
                      />

                      <ProFormSelect
                        options={customerGroups.map((it) => ({
                          value: it.id,
                          label: join([it.code, it.name], ' - '),
                        }))}
                        width="lg"
                        hidden={customer?.suggestion?.status === 'pending'}
                        name="customerGroupId"
                        rules={[{ required: true, message: 'Please select Customer Group' }]}
                        label={'Customer Group'}
                      />
                    </ModalForm>
                  </Space>
                )}
              </FooterToolbar>
            );
          },
        }}
      >
        <BreadCrumbCom separator=">" routes={routes} />
        {/* <Row justify="space-between">
        
      </Row> */}
        <Card
          title={<Text>General Info</Text>}
          size="small"
          style={{ marginTop: 10, marginBottom: 10 }}
        >
          <DescriptionDisplay data={displayItems} column={3} />
        </Card>
        {customer?.suggestion && (
          <Card title={<Text>Business Info</Text>} size="small" style={{ marginBottom: 10 }}>
            <DescriptionDisplay data={suggestion} column={3} />
            <DescriptionDisplay data={suggestionAddress} column={1} />
          </Card>
        )}
        <Card size="small">
          <Tabs
            size="small"
            defaultActiveKey="1"
            items={[
              {
                label: `Address`,
                key: '1',
                children: address,
              },
              {
                label: `Item Pricing Rule`,
                key: '2',
                children: (
                  <ProTable<ItemsPricing>
                    search={false}
                    options={false}
                    dataSource={customer?.customerGroup?.items}
                    columns={[
                      {
                        title: 'Pricing Code',
                        render: (_, r) => {
                          return (
                            <Button
                              type="link"
                              onClick={() => {
                                const url = RetailerPath.pricing;
                                history.push(url.concat('/detail/', r.id));
                              }}
                            >
                              {r.code}
                            </Button>
                          );
                        },
                      },
                      {
                        title: 'Product Item',
                        render: (_, r) => {
                          return (
                            <Button
                              type="link"
                              onClick={() => {
                                const url = '/retailer/products';
                                history.push(url.concat('/detail/', r.productId ?? ''));
                              }}
                            >
                              {r.productCode?.concat('-', r.productName ?? '')}
                            </Button>
                          );
                        },
                      },
                      {
                        title: 'Unit Price',
                        valueType: 'money',
                        render: (_, r) => numeral(r.unitPrice).format('$ 0,0.00'),
                      },
                      {
                        title: 'Discount Price',
                        valueType: 'money',
                        render: (_, r) =>
                          r.discountPrice === undefined
                            ? ''
                            : numeral(r.discountPrice).format('$ 0,0.00'),
                      },
                      {
                        title: 'Status',
                        render: (_, r) => {
                          return (
                            <Tag color={`${r.status ? 'blue' : 'red'}`}>{startCase(r.status)}</Tag>
                          );
                        },
                      },

                      {
                        title: 'Effective Date',
                        render: (_, r) => {
                          return formatDate(r.effectiveDate);
                        },
                      },
                      {
                        title: 'Expired Date',
                        render: (_, r) => {
                          return formatDate(r.expiredDate);
                        },
                      },
                    ]}
                  />
                ),
              },
            ]}
          />
        </Card>
        <GoogleMapModal
          open={googleModal.visible}
          onCancel={resetModal}
          onSubmit={resetModal}
          centerPoint={{ ...googleModal }}
        />
      </ProForm>
    </Spin>
  );
};
