import { ActionDataFormProps } from "@/pages/process-flow/data";
import ActionFormWrapper from '@/pages/process-flow/components/forms/ActionFormWrapper';
import { useEffect, useState } from "react";
import { Button, Card, message, Modal, Spin, UploadFile } from "antd";
import { StockControlServiceAPI } from "../services";
import { simpleRequestActions } from "@/services/model";
import { useForm } from "antd/es/form/Form";
import { EditableProTable, ProForm, ProFormTextArea } from "@ant-design/pro-components";
import moment from "moment";
import { formatDate } from "@/pages/utils";
import { StockTransferRequest, StockTransferRequestItem } from "./process-flow/data";
import { EditOutlined } from "@ant-design/icons";

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


export default (props: ActionDataFormProps) => {

    const [files, setFiles] = useState<UploadFile[]>([])
    const requestActions = simpleRequestActions()
    const services = StockControlServiceAPI(requestActions);
    const [transferRequest, setTransferRequest] = useState<StockTransferRequest>();
    const [isError, setIsError] = useState<boolean>(false);
    const [dataSource, setDataSource] = useState<EditableStockItem[]>([]);
    const [form] = useForm<{
        comment?: string;
    }>()
    const init = async () => {
        if (props.procInstId == null) return
        const rs = await services.fetchStockTransferRequest(props.procInstId)
        setTransferRequest(rs);
        // setDataSource(
        //     rs.items.map(o=>({ 
        //         ...o,
        //         expiredDate:null,
                
        //      }))
        // )
    }
    useEffect(() => {
        if (!props.visible) return
        init()
    }, [props.visible])

    return <ActionFormWrapper {...props} title="Stock Transfer"
        actionHandlers={{
            ...props.actionHandlers,
            onCompleted: async () => {
                const dataForm = await form.validateFields()
                Modal.confirm({
                    title: 'Stock Transfer',
                    content: 'Are you sure?',
                    onOk: async () => {

                        try {
                            if (!props.activityData?.taskId) {
                                message.error("Activity not found.")
                                return
                            }

                            if (!transferRequest) {
                                message.error("Stock transfer request not found.")
                                return
                            }
                            await services.stockTransferAction({
                                taskId: props.activityData.taskId,
                                actionName: props.action,
                                payload: {
                                    requestId: transferRequest.id,
                                    items: transferRequest.items.map(it => ({
                                        itemId: it.itemId,
                                        requestItemId: it.id,
                                        qty: it.qty,
                                        uom: it.uom,
                                        batchNo: formatDate(moment(), "dd-MM-yyyy"),
                                        expiryDate: moment(),

                                    }))
                                },
                                fileIds: files.map(it => it.response),
                                comment: dataForm.comment
                            })
                            props.actionHandlers?.onCancel?.(true)
                        } catch (error: any) {
                            message.error(error?.message || 'Failed to submit.')
                        }
                    }
                })

            },

            onSetFiles: file => setFiles(v => (file)),
            onRemoveFile: file => setFiles(v => v.filter(it => it.uid !== file.uid)),
        }}
    >
        <Spin spinning={requestActions.request?.loading || false}>
            <ProForm form={form} submitter={false}>
                <Card size="small">
                    <EditableProTable
                        value={transferRequest?.items}
                        recordCreatorProps={false}
                        rowKey={(r) => {
                            return r.id;
                        }}
                        onValuesChange={}
                        key={`EditableProTable-${Math.random()}`}
                        editable={{
                            onlyAddOneLineAlertMessage: 'Please save the new record, before add a new record.',
                            onlyOneLineEditorAlertMessage:
                                'Please save the editing record, before start edit a new record.',
                            type: 'single',
                            // editableKeys,
                            onSave: async (_, record: StockTransferRequestItem, originRow: StockTransferRequestItem) => {

                              if(record.batchNo){
                                record.batchNo = moment(originRow.batchNo)
                                record.expiredDate = moment(record.batchNo).add(6, 'M');
                              }
                            //   await waitTime(100);
                            },
                            // onChange: setEditableRowKeys,
                            actionRender: (_row, _config, dom) => [dom.save, dom.cancel],
                        }}
                        columns={[
                            {
                                key: 'batchNo',
                                title: 'Batch #',
                                dataIndex: 'batchNo',
                                valueType: 'date',
                                //   width: 140,
                                //   formItemProps: (form, _config) => {
                                //     return (
                                //       {
                                //         ...form,
                                //         hidden: _config.entity.itemType == 132 ? false : true,
                                //         rules: [
                                //           {
                                //             required: _config.entity.itemType == 132 ? true : false
                                //           }
                                //         ],
                                //       } 
                                //     ) 
                                //   },
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
                                    validateStatus: isError ? 'error' : 'success',
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
                                render: (_, record, __, action) => [
                                    <Button
                                        type="link"
                                        icon={<EditOutlined />}
                                        onClick={() => {
                                            if (!action?.isEditable) setIsError(false);
                                            action?.startEditable?.(record.id);
                                        }}
                                    />
                                ]
                                //   render: (_text, record, _, action) => [
                                //     record.beginningQty === 0 && (
                                //       <>
                                //         <Tooltip title="Edit" key={`editable-${record.key}`}>
                                //           <Button
                                //             type="link"
                                //             icon={<EditOutlined />}
                                //             onClick={() => {
                                //               if (!action?.isEditable) setIsError(false);
                                //               action?.startEditable?.(record.key);
                                //             }}
                                //           />
                                //         </Tooltip>
                                //         <Tooltip title="Copy" key={`copy-${record.key}`}>
                                //           <Button
                                //             type="link"
                                //             icon={<CopyOutlined />}
                                //             onClick={() => {
                                //               const key = (Math.random() * 1000000).toFixed(0);
                                //               const first: EditableStockItem = {
                                //                 id: record.id,
                                //                 beginningQty: record.beginningQty,
                                //                 itemCode: record.itemCode,
                                //                 itemName: record.itemName,
                                //                 quantity: record.quantity,
                                //                 uom: record.uom,
                                //                 isSplit: true,
                                //                 status: record.status,
                                //                 stockCategoryId: record.stockCategoryId,
                                //                 internalId: record.internalId,
                                //                 itemType:record.itemType,
                                //                 key: key,
                                //               };
                                //               actionRef.current?.addEditRecord?.(first);
                                //             }}
                                //           />
                                //         </Tooltip>
                                //         <Tooltip title="Delete" key={`delete-${record.key}`}>
                                //           <Button
                                //             type="link"
                                //             danger
                                //             icon={<DeleteOutlined />}
                                //             onClick={() => {

                                //               if (record.internalId === undefined) {
                                //                 const dataSourceItems = dataSource.filter(
                                //                   (it) => it.key !== record.key && it.internalId !== record.internalId,
                                //                 );
                                //                 setDataSource(dataSourceItems);
                                //                 actionRef.current?.reload();
                                //               } else {
                                //                 // const isCopied = dataSource.some((e) => {
                                //                 //   console.log((e.id === record.id) && record.isSplit);

                                //                 // });
                                //                 // console.log(isCopied)
                                //                 // if (isCopied) {
                                //                 //   message.error('Please remove copied item firstly.');
                                //                 // } else {
                                //                   // setShowRemark({ isOpen: true, record: record });
                                //                 // }
                                //                 setShowRemark({ isOpen: true, record: record });
                                //               }
                                //             }}
                                //           />
                                //         </Tooltip>
                                //       </>
                                //     ),
                                //   ],
                            },
                        ]}
                    />
                    {/* {transferRequest?.storeName}
                    <Alert type="warning" description="To be implemented" /> */}
                </Card>
                <Card style={{ marginTop: 10, marginBottom: 10 }}>
                    <ProFormTextArea rules={[{ required: props.action == 'Rejected' }]} label="Comment" name="comment" />
                </Card>
            </ProForm>
        </Spin>
    </ActionFormWrapper>
}