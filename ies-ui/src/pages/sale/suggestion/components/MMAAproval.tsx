import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { CrmServiceAPI } from "@/services/crm/services";
import { simpleRequestActions } from "@/services/model";
import { ActionType, EditableProTable, ProDescriptions, ProForm, ProFormSelect } from "@ant-design/pro-components"
import { Alert, Button, Flex, Tooltip, Typography } from "antd";
import { useForm } from "antd/es/form/Form"
import { useCallback, useEffect, useRef, useState } from "react";
import { DistributorCreate } from "../../mpu/request/data";
import { PurChaseRequestAPIService } from "../../mpu/request/service";
import { StockControlLess } from "@/services/sale/data";
import moment from "moment";
import { EditOutlined, CopyOutlined, DeleteOutlined } from "@ant-design/icons";


interface Props extends FormModalProps {
    data?: StockControlLess
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
    itemType?: number;
}

const MMAApproval: React.FC<Props> = ({ data, ...props }) => {
    const [form] = useForm<MMAEntry>();
    const requestActions = simpleRequestActions();
    const actionRef = useRef<ActionType>();
    const [distributor, setDistributor] = useState<DistributorCreate>();
    const [dataSource, setDataSource] = useState<EditableStockItem[]>([]);
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

    const onResetActionHandler = useCallback(() => {
        if (data) {
            console.log(data.items);
            
          setDataSource(
            data.items
              ?.filter((it) => it.status !== 'rejected')
              .map((it) => {
                // const batchNo = moment(it.batchNo, formatStringDate);
                const itemEdit: EditableStockItem = {
                  id: it.id,
                  key: (Math.random() * 1000000).toFixed(0),
                //   batchNo: it.batchNo === null || it.batchNo === '' || it.batchNo =="n/a" ? undefined :"",
                  beginningQty: it.beginningQty,
                  expiredDate: it.expiredDate,
                  itemName: it.itemName,
                  quantity: it.quantity,
                  uom: it.uom || '',
                  itemCode: it.itemCode,
                  isSplit: false,
                  stockCategoryId: it.itemType,
                  status: it.status,
                  internalId: it.internalId,
                  itemType: it.itemType
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
        return () => {
        };
      }, [onResetActionHandler, props.open]);



    return (
        <>
            <FormModalComp
                title="Stock Issue"
                {...props}
            >
                <ProForm
                    submitter={false}
                    form={form}
                    layout="horizontal"
                >
                    <Flex vertical gap={12}>
                        <Alert
                            type="warning"
                            description={
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
                                            // render: (_, r) => <Tag color='gold' bordered={false}>{r.status}</Tag>
                                        },
                                        {
                                            title: "Description",
                                            dataIndex: "description"
                                        },
                                    ]}
                                />
                            }
                        />
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
                            }}
                            label={"Distributor"}
                            request={async (k: { keyWords: string }) => {
                                // const data = await CrmServiceAPI(requestActions).findAllCustomer({
                                //   searchValue: k.keyWords
                                // });
                                const data = await PurChaseRequestAPIService(requestActions).customerDistributor({
                                    criteria: {
                                        searchValue: ""
                                    }
                                })
                                return data.items.map(p => ({ value: p.id, label: p.name }));
                            }}
                        />

                        <EditableProTable
                            rowKey={(r) => {
                                return r.key;
                            }}
                            size='small'
                            actionRef={actionRef}
                            key={`EditableProTable-${data?.id}`}
                            recordCreatorProps={false}
                            value={dataSource}
                            onValuesChange={setDataSource}
                            editable={{
                                onlyAddOneLineAlertMessage: 'Please save the new record, before add a new record.',
                                onlyOneLineEditorAlertMessage:
                                    'Please save the editing record, before start edit a new record.',
                                type: 'single',
                                editableKeys,
                                onSave: async (_, record: EditableStockItem, originRow: EditableStockItem) => {

                                    if (record.batchNo) {
                                        record.batchNo = moment(originRow.batchNo)
                                        record.expiredDate = moment(record.batchNo).add(6, 'M');
                                    }
                                    // await waitTime(100);
                                },
                                onChange: setEditableRowKeys,
                                actionRender: (_row, _config, dom) => [dom.save, dom.cancel],
                            }}
                            columns={[
                                {
                                  key: 'batchNo',
                                  title: 'Batch #',
                                  dataIndex: 'batchNo',
                                  valueType: 'date',
                                  width: 140,
                                  formItemProps: (form, _config) => {
                                    return (
                                      {
                                        ...form,
                                        hidden: _config.entity.itemType == 132 ? false : true,
                                        rules: [
                                          {
                                            required: _config.entity.itemType == 132 ? true : false
                                          }
                                        ],
                                      } 
                                    ) 
                                  },
                                },
                                {
                                  title: 'Expired Date',
                                  dataIndex: 'expiredDate',
                                  valueType: 'date',
                                  readonly: true,
                                },
                                {
                                  title: 'Item Code',
                                  dataIndex: 'itemCode',
                                  readonly: true,
                                  width: 90,
                                },
                                {
                                  title: 'Item Name',
                                  dataIndex: 'itemName',
                                  readonly: true,
                                  width: 180,
                                },
                                {
                                  title: 'UoM',
                                  dataIndex: 'uom',
                                  readonly: true,
                                  align: 'center',
                                  width: 60,
                                },
                                {
                                  title: 'Begin Qty',
                                  align: 'right',
                                  dataIndex: 'beginningQty',
                                  readonly: true,
                                  width: 90,
                                },
                                {
                                  title: 'Request Qty',
                                  align: 'right',
                                  dataIndex: 'quantity',
                                  valueType: 'digit',
                                  width: 100,
                                  formItemProps: {
                                    // validateStatus: isError ? 'error' : 'success',
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
                                {
                                  dataIndex: 'itemId',
                                  readonly: true,
                                  hideInTable: true,
                                },
                                {
                                  valueType: 'option',
                                  align: 'right',
                                  width: 120,
                                  render: (_text, record, _, action) => [
                                    record.beginningQty === 0 && (
                                      <>
                                        <Tooltip title="Edit" key={`editable-${record.key}`}>
                                          <Button
                                            type="link"
                                            icon={<EditOutlined />}
                                            onClick={() => {
                                              if (!action?.isEditable) setIsError(false);
                                              action?.startEditable?.(record.key);
                                            }}
                                          />
                                        </Tooltip>
                                        <Tooltip title="Copy" key={`copy-${record.key}`}>
                                          <Button
                                            type="link"
                                            icon={<CopyOutlined />}
                                            onClick={() => {
                                              const key = (Math.random() * 1000000).toFixed(0);
                                              const first: EditableStockItem = {
                                                id: record.id,
                                                beginningQty: record.beginningQty,
                                                itemCode: record.itemCode,
                                                itemName: record.itemName,
                                                quantity: record.quantity,
                                                uom: record.uom,
                                                isSplit: true,
                                                status: record.status,
                                                stockCategoryId: record.stockCategoryId,
                                                internalId: record.internalId,
                                                itemType:record.itemType,
                                                key: key,
                                              };
                                              actionRef.current?.addEditRecord?.(first);
                                            }}
                                          />
                                        </Tooltip>
                                        <Tooltip title="Delete" key={`delete-${record.key}`}>
                                          <Button
                                            type="link"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => {
                                              
                                              if (record.internalId === undefined) {
                                                const dataSourceItems = dataSource.filter(
                                                  (it) => it.key !== record.key && it.internalId !== record.internalId,
                                                );
                                                setDataSource(dataSourceItems);
                                                actionRef.current?.reload();
                                              } else {
                                                // const isCopied = dataSource.some((e) => {
                                                //   console.log((e.id === record.id) && record.isSplit);
                                                  
                                                // });
                                                // console.log(isCopied)
                                                // if (isCopied) {
                                                //   message.error('Please remove copied item firstly.');
                                                // } else {
                                                  // setShowRemark({ isOpen: true, record: record });
                                                // }
                                                setShowRemark({ isOpen: true, record: record });
                                              }
                                            }}
                                          />
                                        </Tooltip>
                                      </>
                                    ),
                                  ],
                                },
                              ]}
                            // columns={[
                            //     {
                            //         title: "Item Code",
                            //         dataIndex: 'itemCode',
                            //         readonly: true,
                            //         width: 90,
                            //     },
                            //     {
                            //         title: "Item Name",
                            //         dataIndex: 'itemName',
                            //         readonly: true,
                            //         width: 180,
                            //     },
                            //     {
                            //         title: "Qty",
                            //         align: 'right',
                            //         dataIndex: 'beginningQty',
                            //         readonly: true,
                            //         width: 90,
                            //     },
                            //     // {
                            //     //     title: "Unit price",
                            //     //     dataIndex: ""
                            //     // },
                            //     // {
                            //     //     title: "Total Price",
                            //     //     dataIndex: ""
                            //     // },
                            // ]}
                        />
                    </Flex>
                </ProForm>
            </FormModalComp>
        </>
    )
}


export default MMAApproval