import { AddressInfo } from '@/services/crm/data';
import { CrmServiceAPI } from '@/services/crm/services';
import { simpleRequestActions } from '@/services/model';
import { AimOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  ActionType,
  EditableFormInstance,
  EditableProTable,
  FooterToolbar,
  ProDescriptions,
  ProForm,
  ProFormDatePicker,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Card, Col, Flex, Modal, Row, Typography, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { uniqueId } from 'lodash';
import moment from 'moment';
import numeral from 'numeral';
import { useEffect, useRef, useState } from 'react';
import { ProductItemsServiceAPI } from '../../product/services';
import { DistributorCreate } from '../request/data';
import { PurChaseRequestAPIService } from '../request/service';
import { PurchaseOrderCreate, PurchaseOrderItem } from './data';
import { PurchaseOrderServiceAPI } from './services';

interface Props {
  id?: number;
  type: 'CREATE' | 'EDIT';
  onView?: (data?: PurchaseOrderCreate) => void;
  onBack?: () => void;
}
interface Amount {
  grantAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
}
const MpuPoEntryForm: React.FC<Props> = ({ id, onBack, onView, type }) => {
  const requestActions = simpleRequestActions();
  const [form] = useForm<PurchaseOrderCreate>();
  const services = PurChaseRequestAPIService(requestActions);
  const editableFormRef = useRef<EditableFormInstance>();
  const [dataSourceItems, setDataSourceItems] = useState<PurchaseOrderItem[]>();
  const [distributor, setDistributor] = useState<DistributorCreate>();
  const [saleperson, setSaleperson] = useState<{ assignedTo?: string; assignedToCode?: string }>();
  const [distibutors, setDistributors] = useState<{
    distributorId?: number;
    distributorCode?: string;
    distributorName?: string;
  }>();
  const actionRef = useRef<ActionType>();
  const [addressList, setAddressList] = useState<AddressInfo[]>();
  const [amount, setAmount] = useState<Amount>({
    discountAmount: 0,
    grantAmount: 0,
    totalAmount: 0,
  });
  const onTotalAmoun = async () => {
    const result = dataSourceItems
      ?.map((o) => ({
        totalAmoun: o.pricing * o.quantity || 0,
      }))
      .reduce((p, c) => ({ totalAmoun: p.totalAmoun + c.totalAmoun || 0 }));

    setAmount({
      totalAmount: result ? result.totalAmoun : 0,
      grantAmount: result ? result.totalAmoun : 0,
      discountAmount: 0,
    });

    // result
    //   ? setAmount((t) => ({
    //       ...t,
    //       totalAmount: result.totalAmoun,
    //       grantAmount: result.totalAmoun,
    //       discountAmount: 0,
    //     }))
    //   : { totalAmount: 0, discountAmount: 0, grantAmount: 0 };
  };
  const loadData = async () => {
    await services.fetchData(id).then((o) => {
      setDistributor({
        id: o.distributorId,
        code: o.distributorCode,
        latitude: o.latitude,
        longitude: o.longitude,
        name: o.distributorName,
        phone: o.distributorPhone,
      });
      setSaleperson({
        assignedTo: o.assignedTo,
        assignedToCode: o.assignedToCode,
      });
      setDataSourceItems(
        o?.items.map((r, index) => ({
          ...r,
          total: r.quantity * r.pricing,
          key: uniqueId().toString() + index,
        })),
      );
    });
  };
  useEffect(() => {
    if (id) {
      loadData();
    }
  }, []);

  useEffect(() => {
    if (dataSourceItems?.length) {
      onTotalAmoun?.();
    }
  }, [dataSourceItems]);

  const onFormvalueChanged = async (changeValues: any) => {
    const { distributorId } = changeValues;
    if ('distributorId' in changeValues) {
      const dd = distributorId?.split(',')?.[0];

      const data = await CrmServiceAPI(requestActions).listAddressByCustomer({
        id: dd || 0,
      });
      setAddressList(data);
      form.setFieldValue('addressId', data?.[0]?.id);
    }
  };

  const disabledButton = () => {
    return !(
      dataSourceItems &&
      dataSourceItems.length > 0 &&
      dataSourceItems.every((e) => e.pricing > 0.0)
    );
  };

  return (
    <ProForm
      layout="horizontal"
      // labelCol={{ sm: 6, md: 8, }}
      labelAlign="left"
      onValuesChange={onFormvalueChanged}
      form={form}
      loading={requestActions.request?.loading}
      submitter={{
        render: () => {
          return (
            <FooterToolbar portalDom={false}>
              <Button onClick={onBack}>Cancel</Button>
              {type === 'CREATE' && <Button onClick={() => form.resetFields()}>Clear</Button>}
              <Button
                type="dashed"
                disabled={disabledButton()}
                onClick={async () => {
                  const dataForm = await form.validateFields();
                  await editableFormRef.current?.validateFields();
                  Modal.confirm({
                    title: 'Make Purchase Order',
                    content: 'Are you sure ?',
                    onOk: async () => {
                      const entry = {
                        id: id,
                        ...dataForm,
                        ...saleperson,
                        items: dataSourceItems || [],
                        ...distibutors,
                        ...amount,
                      };
                      await PurchaseOrderServiceAPI(requestActions).save(entry);
                      setDataSourceItems([]);
                    },
                  });
                }}
              >
                Save & New
              </Button>
              <Button
                type="primary"
                disabled={disabledButton()}
                onClick={async () => {
                  const dataForm = await form.validateFields();
                  await editableFormRef.current?.validateFields();
                  Modal.confirm({
                    title: 'Make Purchase Order',
                    content: 'Are you sure ?',
                    onOk: async () => {
                      const entry = {
                        id: id,
                        ...dataForm,
                        ...saleperson,
                        items: dataSourceItems || [],
                        ...distibutors,
                        ...amount,
                      };
                      console.log(entry.purchaseOrderDate);
                      await PurchaseOrderServiceAPI(requestActions)
                        .save(entry)
                        .then((o) => {
                          onView?.(o.data);
                        });
                    },
                  });
                }}
              >
                {type === 'CREATE' ? 'Save' : 'Update'}
              </Button>
            </FooterToolbar>
          );
        },
      }}
    >
      <Flex vertical gap={12}>
        <Card size="small">
          <Row gutter={24}>
            <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
              <Typography.Text type="secondary">Distributor Info</Typography.Text>
              <ProFormSelect
                showSearch
                labelCol={{ sm: 4, md: 6, lg: 6, xl: 4, xxl: 4 }}
                debounceTime={500}
                name={'distributorId'}
                rules={[{ required: true }]}
                onChange={(e: string) => {
                  const distributor = e?.split(',');
                  setDistributors({
                    distributorCode: distributor?.[1],
                    distributorId: parseInt(distributor?.[0]),
                    distributorName: distributor?.[2],
                  });
                }}
                label={'Distributor'}
                request={async (k: { keyWords: string }) => {
                  const data = await CrmServiceAPI(requestActions).findAllCustomer({
                    searchValue: k.keyWords,
                  });
                  return data.items.map((p) => ({
                    value: [p.id, p.code, p.name].join(','),
                    label: [p.code, p.name].filter((p) => p).join('-'),
                  }));
                }}
              />
              <ProFormSelect
                name={'addressId'}
                label="Address"
                labelCol={{ sm: 4, md: 6, lg: 6, xl: 4, xxl: 4 }}
                allowClear={false}
                key={'address'}
                showSearch
                rules={[{ required: true }]}
                options={addressList?.map((item) => {
                  return { value: item.id, label: item.address };
                })}
              />
              <ProFormDependency dependencies={['addressId']} name={['addressId']}>
                {({ addressId }) => {
                  const address = addressList?.find((item) => item.id === addressId);

                  const aa = [
                    { name: 'Street', value: address?.streetNo },
                    { name: 'House#', value: address?.houseNo },
                    { name: 'Village', value: address?.village },
                    { name: 'Commune', value: address?.commune },
                    { name: 'District', value: address?.district },
                    { name: 'Province', value: address?.province },
                    { name: 'Latitude', value: address?.latitude },
                    { name: 'Longitude', value: address?.longitude },
                    { name: 'Direction', value: address?.direction },
                    { name: 'Hotspot', value: address?.hotspot },
                  ]
                    .filter((it) => it.value)
                    .map((it) => `${it.name} ${it.value}`)
                    .join(', ');
                  form.setFieldsValue({
                    latitude: address?.latitude,
                    longitude: address?.longitude,
                    address: aa,
                  });
                  return (
                    <Flex gap={2}>
                      <ProFormText hidden name={'latitude'} />
                      <ProFormText hidden name={'longitude'} />
                      <ProFormTextArea hidden name={'address'} />
                      <Typography.Text type="warning">
                        <AimOutlined />
                      </Typography.Text>
                      <Typography.Text type={'secondary'}>{aa}</Typography.Text>
                    </Flex>
                  );
                }}
              </ProFormDependency>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
              <Typography.Text type="secondary">Receiver Info</Typography.Text>
              <ProFormSelect
                name={'assignedTo'}
                label={'Saleperson'}
                labelCol={{ sm: 8, md: 10, lg: 8, xl: 8, xxl: 6 }}
                debounceTime={500}
                rules={[{ required: true }]}
                showSearch
                onChange={(e: string) => {
                  const assigned = e.split(',');
                  setSaleperson({
                    assignedTo: assigned[1],
                    assignedToCode: assigned[0],
                  });
                }}
                request={async (k: { keyWords: string }) => {
                  const data = await services.salespersonList({
                    searchValue: k.keyWords,
                  });
                  return data
                    .filter((t) => t.isRequester === true)
                    .map((p) => ({
                      value: [p.salespersonCode, p.salespersonName].join(','),
                      label: [p.salespersonCode, p.salespersonName].join('-'),
                    }));
                }}
              />
              <ProFormDatePicker
                name={'purchaseOrderDate'}
                labelCol={{ sm: 8, md: 10, lg: 8, xl: 8, xxl: 6 }}
                label="Purchase Order Date"
                width={'md'}
                initialValue={moment()}
                rules={[{ required: true }]}
              />
              <ProFormTextArea placeholder={'remark'} name={'remark'} label={'Remark'} />
            </Col>
          </Row>
        </Card>
        <EditableProTable<PurchaseOrderItem & { key: string }>
          headerTitle={'Items'}
          editableFormRef={editableFormRef}
          rowKey="key"
          size="small"
          actionRef={actionRef}
          onValuesChange={(e) => {
            setDataSourceItems(e);
          }}
          value={dataSourceItems}
          recordCreatorProps={{
            newRecordType: 'dataSource',
            record: (index) => ({ key: uniqueId().toString() + index } as any),
            creatorButtonText: 'New Item',
          }}
          controlled
          editable={{
            type: 'multiple',
            editableKeys: dataSourceItems?.map((t) => t.key),
            onlyAddOneLineAlertMessage: '',
            actionRender: (row, config) => [
              <Button
                key={'bnt-delete'}
                icon={<DeleteOutlined />}
                type="link"
                danger
                onClick={() => {
                  config.onDelete?.(config.recordKey, row);
                }}
              />,
            ],
          }}
          columns={[
            {
              title: 'Product Name',
              dataIndex: 'itemId',
              width: 350,
              fieldProps: (_, config) => {
                return {
                  onChange: (e: number) => {
                    if (dataSourceItems?.filter((o) => o.itemId === e).length) {
                      message.error('This Item was ready added!');
                    }
                  },
                  showSearch: true,
                  debounceTime: 500,
                  allowClear: true,

                  param: config.entity.stockCategoryId,
                  ...config,
                };
              },
              valueType: 'select',
              formItemProps: () => {
                return {
                  rules: [{ required: true }],
                };
              },

              request: async (k: { keywords: string }) => {
                const data = await ProductItemsServiceAPI(requestActions).pageProducts({
                  criteria: {
                    searchValue: k.keywords,
                  },
                });
                return data.items.map((p) => ({
                  value: p.id,
                  label: p.name,
                  disabled: dataSourceItems?.some((ot) => ot.itemId === p.id),
                }));
              },
            },
            // {
            //   title: 'Category',
            //   dataIndex: 'stockCategoryId',
            //   width: 200,
            //   fieldProps: {
            //     showSearch: true,
            //     debounceTime: 500,
            //   },
            //   formItemProps: {
            //     rules: [
            //       {
            //         required: true,
            //       },
            //     ],
            //   },
            //   request: async () => {
            //     const data = await services.stockCategory();
            //     return data.map((p) => ({ value: p.id, label: p.name }));
            //   },
            // },
            // {
            //   title: 'UOM',
            //   dataIndex: 'uom',
            //   initialValue: 'CASE',
            //   fieldProps: {
            //     showSearch: true,
            //     debounceTime: 500,
            //   },
            //   formItemProps: {
            //     rules: [
            //       {
            //         required: true,
            //       },
            //     ],
            //   },
            //   request: async () => {
            //     const data = await services.uom();
            //     return data.map((p) => ({ value: p.name, label: p.name }));
            //   },
            // },
            {
              title: 'Quantity',
              dataIndex: 'quantity',
              valueType: 'digit',
              initialValue: 1,
              ellipsis: true,
              fieldProps: {
                allowClear: true,
              },
              formItemProps: {
                rules: [
                  {
                    required: true,
                  },
                ],
              },
            },
            {
              title: 'Unit Price',
              dataIndex: 'pricing',
              valueType: 'digit',
              initialValue: 0,
              ellipsis: true,
              formItemProps: {
                rules: [
                  {
                    required: true,
                  },
                ],
              },
            },
            {
              title: 'Amount',
              dataIndex: 'total',
              // valueType: 'money',
              initialValue: 0,
              ellipsis: true,
              readonly: true,
              renderFormItem: (_, r) => {
                const total = r.record ? r.record?.pricing * r.record?.quantity : 0;
                r.value = total;
                // return <>{formatter.format(total)}</>;
                return `$ ${numeral(total).format('0,000.000')}`;
              },
              formItemProps: {
                rules: [
                  {
                    required: true,
                  },
                ],
              },
            },
            {
              width: 50,
              valueType: 'option',
            },
          ]}
        />
        <Card size="small">
          <Flex justify="space-between">
            <div></div>
            <ProDescriptions<Amount>
              column={1}
              editable={{
                onSave: (_, record, originRow) => {
                  const total =
                    (originRow.grantAmount as number) -
                    ((originRow.grantAmount as number) * (record.discountAmount || 0)) / 100;
                  setAmount((c) => ({
                    ...c,
                    ...record,
                    discountAmount: record.discountAmount,
                    totalAmount: total,
                  }));
                  return Promise.resolve({
                    data: record,
                    sucess: true,
                  });
                },
              }}
              style={{
                width: '300px',
              }}
              labelStyle={{
                width: 150,
              }}
              contentStyle={{
                fontWeight: 'bold',
              }}
              dataSource={amount}
              columns={[
                {
                  title: 'Grand Amount',
                  dataIndex: 'grandAmount',
                  valueType: 'money',
                  editable: false,
                  // render: (_, r) => r.grantAmount ? formatter.format(r.grantAmount) : "$0.00"
                  render: (_, r) => `$ ${numeral(r.grantAmount).format('0,000.00')}`,
                },
                {
                  title: 'Discount Amount',
                  dataIndex: 'discountAmount',
                  valueType: 'percent',
                },
                {
                  title: 'Total Amount',
                  dataIndex: 'totalAmount',
                  valueType: 'money',
                  editable: false,
                  render: (_, r) => `$ ${numeral(r.totalAmount).format('0,000.00')}`,
                  // render: (_, r) => r.totalAmount ? formatter.format(r.totalAmount) : "$0.00"
                },
              ]}
            />
          </Flex>
        </Card>
      </Flex>
    </ProForm>
  );
};

export default MpuPoEntryForm;
