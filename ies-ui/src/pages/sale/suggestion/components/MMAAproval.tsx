import FormModalComp, { FormModalProps } from '@/components/FormModal';
import RemoteSelectBox from '@/components/RemoteSelectBox';
import { AddressInfo } from '@/services/crm/data';
import { CrmService, CrmServiceAPI } from '@/services/crm/services';
import { simpleRequestActions } from '@/services/model';
import { CustomerLookup, StockControlLess } from '@/services/sale/data';
import { DeleteOutlined, EditOutlined, PlusCircleOutlined, SyncOutlined } from '@ant-design/icons';
import {
  ActionType,
  EditableFormInstance,
  EditableProTable,
  ProDescriptions,
  ProForm,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  InputNumber,
  Modal,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useForm } from 'antd/es/form/Form';
import { head, remove } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ProductItemsServiceAPI } from '../../product/services';

interface Props extends FormModalProps {
  data?: StockControlLess;
  onSave: (data: MMAAprovalEntity) => void;
}

// interface MMAEntry {
//   id: number;
//   customer: string;
//   customerCod: string;
//   item: any[];
// }

export interface MMAAprovalEntity {
  stockRquestId?: number;
  description?: string;
  items?: EditableStockItem[];
  distributorCode?: string;
  distributorName?: string;
  // distributorPhone?: string;
  distributorId?: number;
  addressId?: number;
  latitude?: string;
  longitude?: string;
  address?: string;
}

interface EditableStockItem {
  id?: number;
  key: React.Key;
  index: number;
  itemName: string;
  itemCode: string;
  uom: string;
  quantity: number;
  isSplit: boolean;
  stockCategoryId: number;
  status: string;
  internalId?: string;
  // division?: string;
  itemType: string;
  price?: number;
  itemId?: number;
  itemInfo?: string;
  focType?: string;
}

interface MMAForm {
  address: string;
  customerId: string;
  addressId?: number;
}

const MMAApproval: React.FC<Props> = ({ data, onSave, ...props }) => {
  const [form] = useForm<MMAForm>();
  const requestActions = simpleRequestActions();
  const actionRef = useRef<ActionType>();
  // const [distributor, setDistributor] = useState<DistributorCreate>();
  const [dataSource, setDataSource] = useState<EditableStockItem[]>([]);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const editableFormRef = useRef<EditableFormInstance>();
  const [addressList, setAddressList] = useState<AddressInfo[]>();

  const [customerId, setCustomerId] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);

  const getAddress = (addressId: number) => {
    const address = addressList?.find((item) => item.id === addressId);
    return [
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
  };

  const onResetActionHandler = useCallback(() => {
    setLoading(false);
    if (data) {
      setDataSource(
        data.items
          ?.filter((it) => it.status !== 'rejected')
          .map((it, index) => {
            const itemEdit: EditableStockItem = {
              id: it.id,
              itemId: it.itemId,
              key: (Math.random() * 1000000).toFixed(0),
              itemName: it.itemName,
              // division: 'STD',
              quantity: it.quantity,
              uom: it.uom || '',
              itemCode: it.itemCode,
              isSplit: false,
              stockCategoryId: it.itemType!!,
              status: it.status,
              internalId: it.internalId,
              itemType: 'STD',
              itemInfo: it.itemName,
              price: undefined,
              index: index + 1,
              focType: undefined,
            };
            return itemEdit;
          }) || [],
      );
    }
    remove(editableKeys);
    form.resetFields();
    actionRef.current?.reload();
    setAddressList([]);
  }, [data]);

  useEffect(() => {
    if (!props.open) return;
    onResetActionHandler();
    return () => {};
  }, [props.open]);

  const disabledButton = useCallback(() => {
    return dataSource.some((o) => o.price === undefined);
  }, [dataSource]);

  const onFormvalueChanged = (changedValues: any) => {
    const { customerId, addressId } = changedValues;
    if (customerId && 'customerId' in changedValues) {
      setCustomerId(customerId);
    }
    // shippingAddressId
    if (addressId && 'addressId' in changedValues) {
      form.setFieldsValue({
        address: getAddress(addressId),
      });
    }
  };

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    const obj = JSON.parse(customerId);
    const fetchAddress = async () => {
      const listAddress = await CrmServiceAPI(requestActions).listAddressByCustomer({
        id: obj.id,
      });
      setAddressList(listAddress);
      console.log(listAddress);
      form.resetFields(['address', 'shippingAddressId']);
    };
    fetchAddress();
  }, [customerId]);

  useEffect(() => {
    const defaultAddress = head(addressList);
    const address = getAddress(defaultAddress?.id || 0);
    form.setFieldsValue({
      addressId: defaultAddress?.id,
      address: address,
    });
    setLoading(false);
  }, [addressList]);

  return (
    <>
      <FormModalComp
        title="Stock Issue"
        disabled={disabledButton()}
        {...props}
        onResetForm={() => {
          onResetActionHandler();
        }}
        onSubmit={async () => {
          const dataEntity = await form.validateFields();
          const address = addressList?.find((e) => e.id === dataEntity.addressId);
          if (address !== undefined) {
            const customer: CustomerLookup = JSON.parse(dataEntity.customerId);
            const entity: MMAAprovalEntity = {
              address: dataEntity.address,
              addressId: address.id,
              distributorId: customer.id,
              distributorCode: customer.code,
              distributorName: customer.name,
              latitude: address.latitude?.toString(),
              longitude: address.longitude?.toString(),
              stockRquestId: data?.id,
              items: dataSource,
            };
            onSave(entity);
          }
        }}
      >
        <ProForm
          submitter={false}
          form={form}
          onValuesChange={onFormvalueChanged}
          layout="horizontal"
        >
          <Flex vertical gap={12}>
            <Card size="small" title={<Typography.Text>Request Info</Typography.Text>}>
              <ProDescriptions
                size={'small'}
                dataSource={data}
                contentStyle={{
                  fontWeight: 500,
                }}
                columns={[
                  {
                    title: 'Store Name',
                    render: (_, r) => (
                      <Typography.Text type="success">{r.stockName}</Typography.Text>
                    ),
                  },
                  {
                    title: 'Requested Date',
                    dataIndex: 'requestedDate',
                    valueType: 'date',
                  },
                  {
                    title: '	Request By',
                    dataIndex: 'owner',
                  },
                  {
                    title: 'Serial #',
                    dataIndex: 'referenceNo',
                  },
                  {
                    title: 'Plate Number',
                    dataIndex: 'plateNumber',
                  },
                  {
                    title: 'Status',
                    render: (_, r) => {
                      const capitalizeFirstLetter = (name: string): string => {
                        return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
                      };
                      return (
                        <Tag color="processing" bordered={false} icon={<SyncOutlined spin />}>
                          {capitalizeFirstLetter(r.status)}
                        </Tag>
                      );
                    },
                    // dataIndex: 'status',
                  },
                ]}
              />
            </Card>
            <Spin spinning={loading}>
              <Card size="small" title={<Typography.Text>Distributor</Typography.Text>}>
                <Row gutter={50}>
                  <Col flex={100}>
                    <Form.Item
                      help={<span />}
                      name="customerId"
                      label="Customer"
                      rules={[{ required: true }]}
                    >
                      <RemoteSelectBox<CustomerLookup, { searchValue: any }>
                        width={'300px'}
                        popupMatchSelectWidth={500}
                        // initData={so?.associatedTo.customer ? [{ ...so.associatedTo.customer }] : []}
                        transforms={{
                          onCriteria: (value) => {
                            return { searchValue: value };
                          },

                          onOptionData: (item) => {
                            return {
                              key: item.id,
                              value: JSON.stringify(item),
                              label: [item.code, item.name].filter((it) => it !== null).join('-'),
                            };
                          },
                        }}
                        service={CrmService('search-basic-customer')}
                      />
                    </Form.Item>
                  </Col>
                  <Col flex={100}>
                    <ProFormSelect
                      help={<span />}
                      label="Address Code"
                      name="addressId"
                      rules={[{ required: true }]}
                      showSearch
                      // width={280}
                      allowClear={false}
                      fieldProps={{
                        defaultActiveFirstOption: true,
                        // popupMatchSelectWidth: 350,
                        filterOption: (input, option) =>
                          (option?.label?.toString() || '')
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0,
                      }}
                      options={addressList?.map((item) => {
                        return { value: item.id, label: item.address };
                      })}
                    />
                  </Col>
                </Row>
                <Row gutter={50}>
                  <Col>
                    <ProFormTextArea
                      readonly
                      help={<span />}
                      label="Address"
                      disabled={true}
                      name="address"
                    />
                  </Col>
                </Row>
              </Card>
            </Spin>
            <EditableProTable
              rowKey={(r) => {
                return r.key;
              }}
              size="small"
              editableFormRef={editableFormRef}
              actionRef={actionRef}
              key={`EditableProTable-${data?.id}`}
              recordCreatorProps={false}
              value={dataSource}
              onValuesChange={setDataSource}
              summary={(record) => {
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} align="center" colSpan={7}>
                      {/* <Typography.Text type="secondary">Total</Typography.Text> */}
                      <Button
                        icon={<PlusCircleOutlined />}
                        type="dashed"
                        block
                        onClick={() => {
                          const id = -(Math.random() * 1000000);
                          const key = id.toFixed(0);
                          const first: EditableStockItem = {
                            id: id,
                            itemId: 0,
                            itemName: record[0].itemName!,
                            itemCode: record[0].itemName!,
                            itemInfo: undefined,
                            quantity: 0,
                            uom: record[0].uom!,
                            isSplit: true,
                            status: record[0].status!,
                            // division: 'FOC',
                            stockCategoryId: record[0].stockCategoryId!,
                            internalId: record[0].internalId!,
                            itemType: 'FOC',
                            focType: 'distributor',
                            key: key,
                            price: 0,
                            index: dataSource.length + 1,
                          };
                          actionRef.current?.addEditRecord?.(first);
                        }}
                      >
                        Add FOC
                      </Button>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
              editable={{
                onlyAddOneLineAlertMessage: 'Please save the new record, before add a new record.',
                onlyOneLineEditorAlertMessage:
                  'Please save the editing record, before start edit a new record.',
                type: 'single',
                editableKeys,
                onSave: async (_, record: EditableStockItem) => {
                  record.price = record.itemType === 'FOC' ? 0 : record.price;
                  const itInfo = record.itemInfo?.split('~');
                  if (itInfo && itInfo?.length > 1) {
                    const categoryId = parseInt(itInfo[3]);
                    record.itemCode = itInfo[2];
                    record.itemId = parseInt(itInfo[0]);
                    record.itemName = itInfo[1];
                    record.stockCategoryId = categoryId === 1 ? 131 : categoryId === 2 ? 132 : 133;
                    record.itemType = 'FOC';
                    record.uom = itInfo[4];
                  }
                },
                onChange: setEditableRowKeys,
                actionRender: (_row, _config, dom) => [dom.save, dom.cancel],
              }}
              columns={[
                {
                  title: '#',
                  readonly: true,
                  dataIndex: 'index',
                },
                {
                  title: 'Product Name',
                  dataIndex: 'itemInfo',
                  fieldProps: (_, config) => {
                    // console.log(config.entity);
                    return {
                      // onChange: (e: string) => {
                      //   console.log(e);
                      //   // const item = e.split("~")
                      //   // // config.entity.itemId=item[0];
                      //   // // config.entity.itemName =item[1];
                      //   // // config.entity.itemCode=item[2];
                      //   // // console.log(e);

                      //   // // if (dataSource?.filter(o => o.itemId === item[0]).length) {
                      //   //   setDataSource(o =>o.filter(p=>p.itemId ==item[0]).map(ob=>({
                      //   //     ...ob,
                      //   //     itemCode :item[2],
                      //   //     itemName :item[1],
                      //   //     itemId :item[0]
                      //   //   })))
                      //   // }
                      // },

                      showSearch: true,
                      debounceTime: 500,
                      allowClear: true,
                      ...config,
                      // disabled:true
                      disabled: config.entity.itemType === 'STD' ? true : false,
                    };
                  },
                  valueType: 'select',
                  formItemProps: {
                    rules: [
                      {
                        required: true,
                      },
                    ],
                  },
                  request: async (k: { keywords: string }) => {
                    const data = await ProductItemsServiceAPI(requestActions).pageProducts({
                      criteria: {
                        searchValue: k.keywords,
                      },
                    });
                    return data.items.map((p) => ({
                      value: [p.id, p.name, p.code, p.itemCategoryId, `${p.uom}`].join('~'),
                      label: p.name,
                    }));
                  },
                },
                {
                  title: 'Items Type',
                  dataIndex: 'itemType',
                  readonly: true,
                },
                {
                  title: 'Request Qty',
                  align: 'right',
                  dataIndex: 'quantity',
                  valueType: 'digit',
                  width: 100,
                  formItemProps: {
                    rules: [
                      {
                        validator: (_, value) => {
                          return value === 0
                            ? Promise.reject('Quantity sould be greater than 0.')
                            : Promise.resolve(undefined);
                        },
                        whitespace: false,
                      },
                    ],
                  },
                },
                // {
                //   title: 'UoM',
                //   dataIndex: 'uom',
                //   readonly: true,
                //   align: 'center',
                //   width: 60,
                // },
                {
                  dataIndex: 'itemId',
                  readonly: true,
                  hideInTable: true,
                },
                {
                  title: 'FOC Type',
                  dataIndex: 'focType',
                  valueType: 'select',
                  fieldProps: (_, config) => {
                    return {
                      ...config,
                      allowClear: false,
                      disabled: config.entity.itemType === 'STD' ? true : false,
                    };
                  },
                  valueEnum: {
                    distributor: {
                      text: 'Distributor',
                    },
                    warehouse: {
                      text: 'Warehouse',
                    },
                  },

                  // renderFormItem: (_, {record}) => {
                  //   return (</>);
                  // },
                },
                {
                  dataIndex: 'price',
                  title: 'Unit Price',
                  align: 'right',
                  valueType: 'digit',
                  initialValue: 0,
                  renderFormItem: (_, { record }) => {
                    return (
                      <InputNumber disabled={record?.itemType === 'FOC' ? true : false} min={0} />
                    );
                  },
                  formItemProps: {
                    rules: [{ required: true }],
                  },
                },
                {
                  valueType: 'option',
                  align: 'right',
                  width: 120,
                  render: (_text, record, _, action) => [
                    <Space key={`action_${record.id}`}>
                      <Tooltip title="Edit" key={`editable-${record.key}`}>
                        <Button
                          type="link"
                          icon={<EditOutlined />}
                          onClick={() => {
                            action?.startEditable?.(record.key);
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="Delete" key={`delete-${record.key}`}>
                        <Button
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            const deletedItem = () => {
                              const dataSourceItems = dataSource.filter(
                                (it) => it.key !== record.key,
                              );
                              dataSourceItems.map((e, index) => {
                                e.index = index + 1;
                                return e;
                              });
                              setDataSource(dataSourceItems);
                              actionRef.current?.reload();
                            };

                            if (record.itemType === 'FOC') {
                              deletedItem();
                            } else {
                              Modal.confirm({
                                title: 'Delete Item ',
                                content: 'are you sure ?',
                                onOk: () => {
                                  deletedItem();
                                },
                              });
                            }
                          }}
                        />
                      </Tooltip>
                    </Space>,
                    // <>

                    //   {record.division === 'FOC' && (
                    //     <Tooltip title="Delete" key={`delete-${record.key}`}>
                    //       <Button
                    //         type="link"
                    //         danger
                    //         icon={<DeleteOutlined />}
                    //         onClick={() => {
                    //           const dataSourceItems = dataSource.filter(
                    //             (it) => it.key !== record.key,
                    //           );
                    //           setDataSource(dataSourceItems);
                    //           actionRef.current?.reload();
                    //           // Modal.confirm({
                    //           //   title: 'Delete Item ',
                    //           //   content: 'are you sure ?',
                    //           //   onOk: () => {
                    //           //     const dataSourceItems = dataSource.filter(
                    //           //       (it) => it.key !== record.key,
                    //           //     );
                    //           //     setDataSource(dataSourceItems);
                    //           //     actionRef.current?.reload();
                    //           //   },
                    //           // });
                    //         }}
                    //       />
                    //     </Tooltip>
                    //   )}
                    // </>,
                  ],
                },
              ]}
            />
          </Flex>
        </ProForm>
      </FormModalComp>
    </>
  );
};

export default MMAApproval;
