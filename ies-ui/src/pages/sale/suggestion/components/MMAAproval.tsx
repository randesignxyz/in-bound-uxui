import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { CrmServiceAPI } from "@/services/crm/services";
import { simpleRequestActions } from "@/services/model";
import { ActionType, EditableFormInstance, EditableProTable, ProDescriptions, ProForm, ProFormRadio, ProFormSelect } from "@ant-design/pro-components"
import { Button, Card, Flex, InputNumber, Tooltip, Typography } from "antd";
import { useForm } from "antd/es/form/Form"
import { useCallback, useEffect, useRef, useState } from "react";
import { DistributorCreate } from "../../mpu/request/data";
import { MMAAprovalEntity, StockControlLess } from "@/services/sale/data";
import moment from "moment";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Modal } from "antd/lib";
import { ProductItemsServiceAPI } from "../../product/services";
import { AddresssView } from "@/services/crm/data";

interface Props extends FormModalProps {
  data?: StockControlLess;
  onSave: (data: MMAAprovalEntity) => void;
}

interface MMAEntry {
  id: number;
  customer: string;
  customerCod: string;
  item: any[];
}

interface EditableStockItem {
  id?: number;
  key: React.Key;
  batchNo?: moment.Moment;
  itemName: string;
  itemCode: string;
  uom: string;
  beginningQty: number;
  quantity: number;
  expiredDate?: moment.Moment;
  isSplit: boolean;
  stockCategoryId?: number;
  status: string;
  internalId?: string;
  division?: string;
  itemType?: number;
  price?: number;
  itemId?: number;
  itemInfo?: string;
}

const MMAApproval: React.FC<Props> = ({ data, onSave, ...props }) => {
  const [form] = useForm<MMAAprovalEntity>();
  const requestActions = simpleRequestActions();
  const actionRef = useRef<ActionType>();
  const [distributor, setDistributor] = useState<DistributorCreate>();
  const [dataSource, setDataSource] = useState<EditableStockItem[]>([]);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const editableFormRef = useRef<EditableFormInstance>();
  const [addressState, setAddressListState] = useState<AddresssView[]>();

  const onResetActionHandler = useCallback(() => {
    if (data) {
      setDataSource(
        data.items
          ?.filter((it) => it.status !== 'rejected')
          .map((it) => {
            const itemEdit: EditableStockItem = {
              id: it.id,
              itemId: it.itemId,
              key: (Math.random() * 1000000).toFixed(0),
              beginningQty: it.beginningQty,
              expiredDate: it.expiredDate,
              itemName: it.itemName,
              division: "STD",
              quantity: it.quantity,
              uom: it.uom || '',
              itemCode: it.itemCode,
              isSplit: false,
              stockCategoryId: it.itemType,
              status: it.status,
              internalId: it.internalId,
              itemType: it.itemType,
              itemInfo: it.itemName
            };
            return itemEdit;
          }) || [],
      );
    }
    setEditableRowKeys([]);
    actionRef.current?.reload();
  }, [data]);

  useEffect(() => {
    if (!props.open) return;
    onResetActionHandler();
    props.open && form.resetFields();
    props.open && setAddressListState([]);
    return () => {
    };
  }, [onResetActionHandler, props.open]);

  const disabledButton = useCallback(() => {
    return dataSource.some(o => (o.price == undefined));
  }, [dataSource]);

  return (
    <>
      <FormModalComp
        title="Stock Issue"
        disabled={disabledButton()}
        {...props}
        onSubmit={async () => {
          const dataEntity = await form.validateFields();
          await editableFormRef?.current?.validateFields();
          const addressInfo = dataEntity.addressInfo?.toString()?.split(",");
          const entity: MMAAprovalEntity = {
            ...dataEntity,
            distributorCode: distributor?.code,
            distributorId: distributor?.id,
            distributorName: distributor?.name,
            distributorPhone: distributor?.phone,
            stockControlId: data?.id,
            addressId: parseInt(addressInfo?.[0] || ""),
            latitude: addressInfo?.[1],
            longitude: addressInfo?.[2],
            items: dataSource.map(o => ({ ...o, batchNo: "n/a" }))
          }
          onSave(entity);
        }}
      >
        <ProForm
          submitter={false}
          form={form}
          layout="horizontal"
        >
          <Flex vertical gap={12}>
            <Card>
              <ProDescriptions
                size={"small"}
                dataSource={data}
                contentStyle={{
                  fontWeight: 500
                }}
                columns={[
                  {
                    title: "Store Name",
                    render: (_, r) => <Typography.Text type='success'>{r.stockName}</Typography.Text>
                  },
                  {
                    title: "Requested Date",
                    dataIndex: "requestedDate",
                    valueType: "date"
                  },
                  {
                    title: "	Request By",
                    dataIndex: "owner"
                  },
                  {
                    title: "Serial #",
                    dataIndex: "referenceNo"
                  },
                  {
                    title: "	Approved Date",
                    dataIndex: "approvedDate",
                    valueType: "date"
                  },
                  {
                    title: "Approved By",
                    dataIndex: "approvedBy"
                  },
                  {
                    title: "Plate Number",
                    dataIndex: "plateNumber"
                  },
                  {
                    title: "Received By",
                    dataIndex: "receivedBy",
                  },
                  {
                    title: "Status",
                    dataIndex: "receivedBy",
                  },
                  {
                    title: "Description",
                    dataIndex: "description"
                  },
                ]}
              />
            </Card>
            <Card size="small">
              <ProFormSelect
                showSearch
                debounceTime={500}
                name={"distributorId"}
                rules={[
                  { required: true }
                ]}
                onChange={async (s: number) => {
                  const y = await CrmServiceAPI(requestActions).findDetailCustomer({ id: s });
                  setDistributor({
                    code: y.code,
                    id: y.id,
                    name: y.name,
                    phone: y.contacts?.[0].phone1,
                    latitude: y?.addressList?.[0]?.latitude,
                    longitude: y?.addressList?.[0]?.longitude
                  });
                  CrmServiceAPI(requestActions).listAddressDetailByCustomerId({ id: s }).then(o => {
                    setAddressListState(o);
                    form.setFieldValue("addressInfo","")
                    o.length ==1 &&  form.setFieldValue("addressInfo", o?.map(p => `${p.id},${p.latitude},${p.longitude}`).join("").toString())
                    actionRef.current?.reload?.();
                  });
                }}
                label={"Distributor"}
                request={async (k: { keyWords: string }) => {
                  const data = await CrmServiceAPI(requestActions).findAllCustomer({
                    searchValue: k.keyWords
                  });
                  return data.items.map(p => ({ value: p.id, label: p.name }));
                }}
              />
              {(addressState) && <ProFormRadio.Group
                name={"addressInfo"}
                rules={[{ required: true }]}
                noStyle
                options={addressState?.map(p => ({
                  value: [p.id, p.latitude, p.longitude].join(","),
                  label: [
                    `Street ${p.streetName}`,
                    `Village ${p.village?.name}`,
                    `Commune ${p.commune?.name}`,
                    `District ${p.district?.name}`,
                    `Province ${p.province?.name}`,
                    `Direction ${p.district?.name}`
                  ].filter(p => p).join(", ").toString().replaceAll("null", "N/A").replaceAll("undefined", "N/A")
                }))}
              />}
            </Card>
            <EditableProTable
              rowKey={(r) => {
                return r.key;
              }}
              size='small'
              editableFormRef={editableFormRef}
              actionRef={actionRef}
              key={`EditableProTable-${data?.id}`}
              recordCreatorProps={false}
              value={dataSource}
              onValuesChange={setDataSource}
              editable={{
                onlyAddOneLineAlertMessage: 'Please save the new record, before add a new record.',
                onlyOneLineEditorAlertMessage: 'Please save the editing record, before start edit a new record.',
                type: 'single',
                editableKeys,
                onSave: async (_, record: EditableStockItem, originRow: EditableStockItem) => {
                  if (record.batchNo) {
                    record.batchNo = moment(originRow.batchNo)
                    record.expiredDate = moment(record.batchNo).add(6, 'M');
                  }
                  record.division == "FOC" ? record.price = 0 : record.price;
                  const itInfo = record.itemInfo?.split("~");
                  if (itInfo && itInfo?.length > 1) {
                    record.itemCode = itInfo[2];
                    record.itemId = parseInt(itInfo[0]);
                    record.itemName = itInfo[1];
                  }    
                },
                onChange: setEditableRowKeys,
                actionRender: (_row, _config, dom) => [dom.save, dom.cancel],
              }}
              columns={[
                {
                  title: "Product Name",
                  dataIndex: "itemInfo",
                  fieldProps: (_, config) => {
                    // console.log(config.entity);
                    return {
                      // onChange: (e: string) => {
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
                      disabled: config.entity.division == "STD" ? true : false,
                    }
                  },
                  valueType: "select",
                  formItemProps: {
                    rules: [{
                      required: true,
                      // rea
                    }],
                  },
                  request: async (k: { keywords: string }) => {
                    const data = await ProductItemsServiceAPI(requestActions).pageProducts({
                      criteria: {
                        searchValue: k.keywords
                      }
                    });
                    return data.items.map(p => ({
                      value: [p.id, p.name, p.code].join("~"),
                      label: p.name,
                    }));
                  }
                },
                // {
                //   title: 'Item Code',
                //   dataIndex: 'itemCode',
                //   readonly: true,
                //   width: 90,
                // },
                // {
                //   title: 'Item Name',
                //   dataIndex: 'itemName',
                //   readonly: true,
                //   width: 180,
                // },
                {
                  title: "Items Division",
                  dataIndex: "division",
                  valueType: "select",
                  fieldProps: (_, config) => {
                    return {
                      showSearch: true,
                      debounceTime: 500,
                      options: [
                        {
                          label: "STD ",
                          value: "STD",
                        },
                        {
                          label: "FOC",
                          value: "FOC",
                        },
                      ],
                      allowClear: true,
                      ...config,
                      disabled: true,
                    }
                  },
                  // initialValue: "STD",
                  // formItemProps: {
                  //   rules: [
                  //     {
                  //       required: true
                  //     }
                  //   ]
                  // },
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
                  dataIndex: "price",
                  title: "Unit Price",
                  align: "right",
                  valueType: "digit",
                  initialValue: 0,
                  renderFormItem: (schema, { record }, form) => {
                    // record?.price = 0
                    return <InputNumber disabled={record?.division == "FOC" ? true : false} min={0} />
                  },
                  formItemProps: {
                    rules: [
                      { required: true }
                    ],
                  }
                },
                {
                  valueType: 'option',
                  align: 'right',
                  width: 120,
                  render: (_text, record, _, action) => [
                    
                      <>
                        <Tooltip title="Edit" key={`editable-${record.key}`}>
                          <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => {
                              action?.startEditable?.(record.key);
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Copy" key={`copy-${record.key}`}>
                          <Button
                            type="link"
                            // icon={<CopyOutlined />}
                            onClick={() => {
                              const key = (Math.random() * 1000000).toFixed(0);
                              const first: EditableStockItem = {
                                id: record.id,
                                beginningQty: record.beginningQty,
                                // itemCode: record.itemCode,
                                // itemName: record.itemName,
                                itemId: 0,
                                quantity: 0,
                                uom: record.uom,
                                isSplit: true,
                                status: record.status,
                                division: "FOC",
                                stockCategoryId: record.stockCategoryId,
                                internalId: record.internalId,
                                itemType: record.itemType,
                                key: key,
                                price: 0
                              };
                              actionRef.current?.addEditRecord?.(first);
                            }}
                          >FOC</Button>
                        </Tooltip>
                        {record.division == "FOC" && <Tooltip title="Delete" key={`delete-${record.key}`}>
                          <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              Modal.confirm({
                                title: "Delete Item ",
                                content: "are you sure ?",
                                onOk: () => {
                                  const dataSourceItems = dataSource.filter(
                                    (it) => it.key !== record.key
                                  );
                                  setDataSource(dataSourceItems);
                                  actionRef.current?.reload();
                                }
                              });
                            }}
                          />
                        </Tooltip>}
                      </>
                  ],
                },
              ]}
            />
          </Flex>
        </ProForm>
      </FormModalComp>
    </>
  )
}

export default MMAApproval