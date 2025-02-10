import { ActionDataFormProps } from "@/pages/process-flow/data";
import ActionFormWrapper from '@/pages/process-flow/components/forms/ActionFormWrapper';
import { useEffect, useRef, useState } from "react";
import { Button, Card, Flex, message, Modal, Spin, Tooltip, UploadFile } from "antd";
import { simpleRequestActions } from "@/services/model";
import { useForm } from "antd/es/form/Form";
import { ActionType, EditableFormInstance, EditableProTable, ProDescriptions, ProForm, ProFormTextArea } from "@ant-design/pro-components";
import moment from "moment";
import { CopyOutlined, DeleteOutlined } from "@ant-design/icons";
import { Typography } from "antd/lib";
import { ApprovalStockControlDto, ApprovalStockItemDto, StockControlLess } from "@/services/sale/data";
import { StockControlServiceAPI } from "../../stock-control/services";
import { WorkflowIntegrationService } from "../services";
import { StockControlDTO } from "../data";

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
    const services = WorkflowIntegrationService(requestActions);
    const [stockControl, setStockControl] = useState<StockControlDTO>();
    const [dataSource, setDataSource] = useState<EditableStockItem[]>();
    const actionRef = useRef<ActionType>();
    const editableFormRef = useRef<EditableFormInstance>();
    const [form] = useForm<{
        comment?: string;
    }>()
    const init = async () => {
        if (props.procInstId == null) return
        const rs = await services.fetchStockControl(props.procInstId);
        setStockControl(rs);
        const items: EditableStockItem[] = rs.items?.map(p => ({
            ...p,
            batchNo:null,
            stockCategoryId:p.itemType,
            key: (Math.random() * 100).toString()
        }))
        setDataSource(items);
    }
    useEffect(() => {
        props.visible && init();
        props.visible && form.resetFields();
    }, [props.visible]);
    return <ActionFormWrapper {...props}
        title="Issue Stock"
        actionHandlers={{
            ...props.actionHandlers,
            onReset: () => {
                init()
            },
            onCompleted: async () => {
                const dataForm = await form.validateFields();
                await editableFormRef.current?.validateFields();
                Modal.confirm({
                    title: 'Stock Transfer',
                    content: 'Are you sure?',
                    onOk: async () => {
                        try {
                            if (!props.activityData?.taskId) {
                                message.error("Activity not found.")
                                return
                            }
                            const entry: ApprovalStockControlDto = {
                                ...dataForm,
                                stockControlId: stockControl?.id || 0,
                                items: dataSource?.map(p => ({ ...p, batchNo: p.batchNo ? p.batchNo : "n/a" })) as unknown as ApprovalStockItemDto[],
                                receivedBy: stockControl?.receivedBy,
                                description: stockControl?.description,
                                referenceNo: stockControl?.referenceNo
                            }
                            if (!props.activityData?.taskId) {
                                message.error("Activity not found.")
                                return
                            }
                            if (!stockControl) {
                                message.error("Stock transfer request not found.")
                                return
                            }
                            await WorkflowIntegrationService(requestActions).stockControlApproval({
                                actionName: props.action,
                                payload: entry,
                                taskId: props.activityData.taskId,
                                fileIds: files.map(it => it.response),
                                comment: dataForm.comment
                            });
                            props.actionHandlers?.onCancel?.(true);
                        }
                        catch (error: any){
                            message.error(error?.message || 'Failed to submit.');
                        }
                    }
                    // onOk: async () => {
                    //     try {
                    //         if (!props.activityData?.taskId) {
                    //             message.error("Activity not found.")
                    //             return
                    //         }
                    //         if (!stockControl) {
                    //             message.error("Stock transfer request not found.")
                    //             return
                    //         }
                    //         await services.stockTransferAction({
                    //             taskId: props.activityData.taskId,
                    //             actionName: props.action,
                    //             payload: {
                    //                 requestId: stockControl.id,
                    //                 items: stockControl.items?.map(it => ({
                    //                     itemId: it.itemId,
                    //                     requestItemId: it.id,
                    //                     qty: it.qty,
                    //                     uom: it.uom,
                    //                     batchNo: formatDate(moment(), "dd-MM-yyyy"),
                    //                     expiryDate: moment(),
                    //                 }))
                    //             },
                    //             fileIds: files.map(it => it.response),
                    //             comment: dataForm.comment
                    //         })
                    //         props.actionHandlers?.onCancel?.(true)
                    //     } catch (error: any) {
                    //         message.error(error?.message || 'Failed to submit.')
                    //     }
                    // }
                });
            },
            onSetFiles: file => setFiles(v => (file)),
            onRemoveFile: file => setFiles(v => v.filter(it => it.uid !== file.uid)),
        }}
    >
        <Spin spinning={requestActions.request?.loading || false}>
            <ProForm form={form} submitter={false}>
                <Flex vertical gap={12}>
                    <Card size="small">
                        <ProDescriptions<StockControlLess>
                            dataSource={stockControl}
                            size="small"
                            columns={[
                                {
                                    title: "Store Name",
                                    dataIndex: "stockName"
                                },
                                {
                                    title: "Truck No",
                                    dataIndex: "plateNumber"
                                },
                                {
                                    title: "Current Status",
                                    render: (_, r) => <Typography.Text type="success">{r.status}</Typography.Text>
                                },
                            ]}
                        />
                    </Card>
                    <Card size="small" >
                        <EditableProTable<EditableStockItem>
                            value={dataSource}
                            recordCreatorProps={false}
                            editableFormRef={editableFormRef}
                            style={{ margin: 0, padding: 0 }}
                            rowKey={"key"}
                            actionRef={actionRef}
                            size="small"
                            editable={{
                                type: "multiple",
                                editableKeys: dataSource?.map((items) => items.key),
                                onValuesChange: (record, ddd) => {
                                    const item = ddd.map(o => ({
                                        ...o,
                                        batchNo:o.batchNo,
                                        expiredDate: o.batchNo ? moment(o.batchNo).add(6, 'M') : ""
                                    }))
                                    setDataSource(item);
                                },
                                actionRender: (row, config, defaultDoms) => {
                                    return [
                                        <Tooltip title={"copy"}>
                                            <Button
                                                icon={<CopyOutlined />}
                                                type="link"
                                                onClick={() => {
                                                    const key = (Math.random() * 100).toString()
                                                    const first: EditableStockItem = {
                                                        id: row.id,
                                                        beginningQty: row.beginningQty,
                                                        itemCode: row.itemCode,
                                                        itemName: row.itemName,
                                                        quantity: row.quantity,
                                                        uom: row.uom,
                                                        isSplit: true,
                                                        status: row.status,
                                                        stockCategoryId: row.stockCategoryId,
                                                        internalId: row.internalId,
                                                        itemType: row.itemType,
                                                        key: key,
                                                    };
                                                    setDataSource((o) => [...o || [], first])
                                                }}
                                            />
                                        </Tooltip>,
                                        <Tooltip title="Delete">
                                            <Button
                                                type="link"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => {
                                                    Modal.confirm({
                                                        title: "Delete Item",
                                                        content: "are you sure",
                                                        onOk: () => {
                                                            config.onDelete?.(row.key, row);
                                                        }
                                                    })
                                                }}
                                            />
                                        </Tooltip>
                                    ]
                                },
                            }}
                            columns={[
                                {
                                    key: 'batchNo',
                                    title: 'Batch #',
                                    dataIndex: 'batchNo',
                                    valueType: 'date',
                                    width: 150,
                                    formItemProps: (form, _config) => {
                                        return (
                                            {
                                                ...form,
                                                hidden: (_config.entity.itemType == 132) ? false : true,
                                                rules: [
                                                    {
                                                        required: (_config.entity.itemType == 132) ? true : false
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
                                    width: 100,
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
                                    ellipsis: true
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
                                        rules: [
                                            {
                                                validator: (_, value) => {
                                                    return value < 0
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
                                    valueType: "option",
                                    width: 80
                                }
                            ]}
                        />
                    </Card>

                    <Card size="small">
                        <ProFormTextArea rules={[{ required: props.action == 'Rejected' }]} label="Comment" name="description" />
                    </Card>
                </Flex>

            </ProForm>
        </Spin>
    </ActionFormWrapper>
}