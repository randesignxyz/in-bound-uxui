import RemoteSelectBox from '@/components/RemoteSelectBox';
import { formatDate } from '@/pages/utils';
import { AddressInfo } from '@/services/crm/data';
import { CrmService, CrmServiceAPI } from '@/services/crm/services';
import { simpleRequestActions } from '@/services/model';
import { CustomerLookup, SalesTeamWorkLess } from '@/services/sale/data';
import { SaleService } from '@/services/sale/services';
import { AimOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  ActionType,
  EditableFormInstance,
  EditableProTable,
  FooterToolbar,
  ProDescriptions,
  ProForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Card, Col, Flex, Form, Modal, Row, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { uniqueId } from 'lodash';
import moment from 'moment';
import numeral from 'numeral';
import { useEffect, useRef, useState } from 'react';
import { ProductItemsServiceAPI } from '../../product/services';
import { PurchaseOrderCreate, PurchaseOrderDtoCreate, PurchaseOrderItem } from './data';
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
  const mainRequestActions = simpleRequestActions();
  const [form] = useForm<PurchaseOrderCreate>();
  const editableFormRef = useRef<EditableFormInstance>();
  const [dataSourceItems, setDataSourceItems] = useState<PurchaseOrderItem[]>();
  const actionRef = useRef<ActionType>();
  const [addressList, setAddressList] = useState<AddressInfo[]>();
  const [selectedAddress, setSelectedAddress] = useState<AddressInfo>();
  const [amount, setAmount] = useState<Amount>({
    discountAmount: 0,
    grantAmount: 0,
    totalAmount: 0,
  });
  const onTotalAmount = async () => {
    const result =
      dataSourceItems && dataSourceItems.length > 0
        ? dataSourceItems
            .map((o) => ({
              totalAmoun: o.pricing * o.quantity || 0,
            }))
            .reduce((p, c) => ({ totalAmoun: p.totalAmoun + c.totalAmoun || 0 }))
        : undefined;

    setAmount({
      totalAmount: result ? result.totalAmoun : 0,
      grantAmount: result ? result.totalAmoun : 0,
      discountAmount: 0,
    });
  };
  const loadData = async () => {
    const purchaseOrder = await PurchaseOrderServiceAPI(mainRequestActions).detail(id);
    const data = await CrmServiceAPI(mainRequestActions).listAddressByCustomer({
      id: purchaseOrder.distributorId || 0,
    });
    setAddressList(data);
    const address = data.find((e) => e.customerAddressId === purchaseOrder.addressId);
    setSelectedAddress(address);

    form.setFieldsValue({
      address: purchaseOrder.address,
      remark: purchaseOrder.remark,
      purchaseOrderDate: formatDate(purchaseOrder.purchaseOrderDate),
      assignedTo: [purchaseOrder.assignedToCode, purchaseOrder.assignedTo].join(','),
      distributorId: [
        purchaseOrder.distributorId,
        purchaseOrder.distributorCode,
        purchaseOrder.distributorName,
      ].join(','),
      addressId: purchaseOrder.addressId,
      addressCode: purchaseOrder.addressCode,
      latitude: purchaseOrder.latitude,
      longitude: purchaseOrder.longitude,
    });
    setDataSourceItems(
      purchaseOrder.items
        ? purchaseOrder.items.map((e) => {
            e.key = e.itemCode!;
            return e;
          })
        : [],
    );
  };

  useEffect(() => {
    if (type === 'CREATE') {
      form.resetFields();
      setAddressList([]);
      setDataSourceItems([]);
      setAmount({
        discountAmount: 0,
        grantAmount: 0,
        totalAmount: 0,
      });
    }
    if (id) {
      loadData();
    }
    // (async () => {
    //   console.log('Hello222');
    //   const data = await services.salespersonList({ searchValue: undefined });
    //   setsalespersons(data.filter((t) => t.isRequester === true));
    // })();
  }, [id]);

  useEffect(() => {
    //if (dataSourceItems?.length) {
    onTotalAmount?.();
    //}
  }, [dataSourceItems]);

  const getAddress = (address?: AddressInfo) => {
    return address
      ? [
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
          .join(', ')
      : '';
  };

  const onFormvalueChanged = async (changeValues: any) => {
    const { distributorId, addressId } = changeValues;
    if ('distributorId' in changeValues) {
      const dd = distributorId?.split(',')?.[0];

      const data = await CrmServiceAPI(mainRequestActions).listAddressByCustomer({
        id: dd || 0,
      });
      setAddressList(data);
      if (data.length > 0) {
        setAddressList(data);
        const address = data[0];
        setSelectedAddress(address);
        form.setFieldsValue({
          addressId: address.id,
          address: getAddress(address),
        });
      }
    }
    if (addressId) {
      const address = addressList?.find((e) => e.id === addressId);
      setSelectedAddress(address);
      const fullAddress = getAddress(address);
      form.setFieldsValue({
        address: fullAddress,
      });
    }
  };

  const disabledButton = () => {
    return !(
      dataSourceItems &&
      dataSourceItems.length > 0 &&
      dataSourceItems.every((e) => e.pricing > 0.0)
    );
  };

  const onSavePurchaseOrder = async (callback: (data: PurchaseOrderCreate) => void) => {
    const dataForm = await form.validateFields();
    const purchaseOrderDate = moment(dataForm.purchaseOrderDate).format('YYYY-MM-DD');
    await editableFormRef.current?.validateFields();
    Modal.confirm({
      title: 'Make Purchase Order',
      content: 'Are you sure',
      onOk: async () => {
        const assigner = dataForm.assignedTo.split(',');
        const distributor = dataForm.distributorId.split(',');
        console.log(dataForm.latitude, dataForm.longitude);
        const entry: PurchaseOrderDtoCreate = {
          id: id,
          address: dataForm.address,
          addressId: dataForm.addressId,
          addressCode: selectedAddress?.address,
          assignedToCode: assigner[0],
          assignedTo: assigner[1],
          distributorId: distributor[0],
          distributorCode: distributor[1],
          distributorName: distributor[2],
          items: dataSourceItems,
          latitude: selectedAddress?.latitude,
          longitude: selectedAddress?.longitude,
          remark: dataForm.remark,
          purchaseOrderDate: moment(purchaseOrderDate).add(1, 'day'),
          ...amount,
        };
        const response = await PurchaseOrderServiceAPI(mainRequestActions).save(entry);
        callback(response.data);
      },
    });
  };

  return (
    // <Spin spinning={mainRequestActions.request?.loading}>
    <ProForm
      layout="horizontal"
      title="Purchase Order"
      // labelCol={{ sm: 6, md: 8, }}
      labelAlign="left"
      onValuesChange={onFormvalueChanged}
      form={form}
      loading={mainRequestActions.request?.loading}
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
                  await onSavePurchaseOrder(() => {
                    setSelectedAddress(undefined);
                    setAddressList([]);
                    setDataSourceItems([]);
                  });
                }}
              >
                Save & New
              </Button>
              <Button
                type="primary"
                disabled={disabledButton()}
                onClick={async () => {
                  // const dataForm = await form.validateFields();
                  // await editableFormRef.current?.validateFields();
                  // Modal.confirm({
                  //   title: `${type === 'CREATE' ? 'Make' : 'Edit'} Purchase Order`,
                  //   content: 'Are you sure',
                  //   onOk: async () => {
                  //     const assigner = dataForm.assignedTo.split(',');
                  //     const distributor = dataForm.distributorId.split(',');
                  //     const entry: PurchaseOrderDtoCreate = {
                  //       id: id,
                  //       address: dataForm.address,
                  //       addressId: dataForm.addressId,
                  //       addressCode: selectedAddress?.address,
                  //       assignedToCode: assigner[0],
                  //       assignedTo: assigner[1],
                  //       distributorId: distributor[0],
                  //       distributorCode: distributor[1],
                  //       distributorName: distributor[2],
                  //       items: dataSourceItems,
                  //       latitude: dataForm.latitude,
                  //       longitude: dataForm.longitude,
                  //       remark: dataForm.remark,
                  //       purchaseOrderDate:
                  //         type === 'CREATE'
                  //           ? moment(dataForm.purchaseOrderDate)
                  //           : moment(dataForm.purchaseOrderDate).add(1, 'day'),
                  //       ...amount,
                  //     };
                  //     const response = await PurchaseOrderServiceAPI(mainRequestActions).save(
                  //       entry,
                  //     );
                  //   },
                  // });
                  await onSavePurchaseOrder((data) => {
                    onView?.(data);
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
              {/* <Typography.Text type="secondary">Distributor Info</Typography.Text> */}
              <Form.Item
                help={<span />}
                name="distributorId"
                label="Distributor"
                rules={[{ required: true }]}
                labelCol={{ sm: 4, md: 6, lg: 6, xl: 4, xxl: 4 }}
              >
                <RemoteSelectBox<CustomerLookup, { searchValue: any }>
                  width={'350px'}
                  // popupMatchSelectWidth={500}
                  //initData={ type === edi? [{ ...so.associatedTo.customer }] : []}
                  transforms={{
                    onCriteria: (value) => {
                      return { searchValue: value };
                    },
                    onOptionData: (item) => {
                      return {
                        value: [item.id, item.code, item.name].join(','),
                        label: [item.code, item.name].filter((it) => it !== null).join(' - '),
                      };
                    },
                  }}
                  service={CrmService('search-basic-customer')}
                />
              </Form.Item>
              <ProFormSelect
                name={'addressId'}
                label="Address"
                labelCol={{ sm: 4, md: 6, lg: 6, xl: 4, xxl: 4 }}
                allowClear={false}
                key={'address'}
                showSearch
                rules={[{ required: true }]}
                options={addressList?.map((item) => {
                  return {
                    value: item.customerAddressId,
                    label: item.address,
                  };
                })}
              />
              <ProFormTextArea
                readonly
                //help={<AimOutlined />}
                label={<AimOutlined />}
                disabled={true}
                name="address"
              />
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
              <Form.Item
                help={<span />}
                name="assignedTo"
                label="Assign To"
                rules={[{ required: true }]}
                labelCol={{ sm: 8, md: 10, lg: 8, xl: 8, xxl: 6 }}
              >
                <RemoteSelectBox<SalesTeamWorkLess, { searchValue: any }>
                  width={'300px'}
                  // popupMatchSelectWidth={500}
                  //initData={ type === edi? [{ ...so.associatedTo.customer }] : []}
                  transforms={{
                    onCriteria: (value) => {
                      return { searchValue: value };
                    },
                    onOptionData: (item) => {
                      return {
                        label: [item.salespersonCode, item.salespersonName].join(' - '),
                        value: [item.salespersonCode, item.salespersonName].join(','),
                      };
                    },
                  }}
                  service={SaleService('list-sales-team-work-1')}
                />
              </Form.Item>
              <ProFormDatePicker
                name={'purchaseOrderDate'}
                labelCol={{ sm: 8, md: 10, lg: 8, xl: 8, xxl: 6 }}
                label="Purchase Order Date"
                width={'md'}
                initialValue={type === 'CREATE' ? moment() : undefined}
                rules={[{ required: true }]}
              />
              <ProFormTextArea
                labelCol={{ sm: 8, md: 10, lg: 8, xl: 8, xxl: 6 }}
                placeholder={'remark'}
                name={'remark'}
                label={'Remark'}
              />
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
            creatorButtonText: ' New Item',
          }}
          // controlled
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
                const data = await ProductItemsServiceAPI(mainRequestActions).pageProducts({
                  criteria: {
                    searchValue: k.keywords,
                  },
                });
                // const disabledSelected = type === 'CREATE' ? dataSourceItems?.some((ot) => ot.itemId === p.id) : false;

                return Promise.resolve(
                  data.items.map((p) => ({
                    value: p.id,
                    label: p.name,
                    // disabled: dataSourceItems?.some((ot) => ot.itemId === p.id),
                  })),
                );
              },
            },
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
    // </Spin>
  );
};

export default MpuPoEntryForm;
