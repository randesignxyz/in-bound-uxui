import { ActionDataFormProps } from "@/pages/process-flow/data";
import ActionFormWrapper from '@/pages/process-flow/components/forms/ActionFormWrapper';
import { useEffect, useRef, useState } from "react";
import { Button, Card, Flex, message, Modal, Spin, Tag, Tooltip, UploadFile } from "antd";
import { StockControlServiceAPI } from "../services";
import { simpleRequestActions } from "@/services/model";
import { useForm } from "antd/es/form/Form";
import { ActionType, EditableProTable, ProDescriptions, ProForm, ProFormTextArea } from "@ant-design/pro-components";
import moment from "moment";
import { formatDate } from "@/pages/utils";
import { StockTransferRequest } from "./process-flow/data";
import { CopyOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";

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
    const actionRef = useRef<ActionType>();
    const [form] = useForm<{
        comment?: string;
    }>()
    const init = async () => {
        if (props.procInstId == null) return
        const rs = await services.fetchStockTransferRequest(props.procInstId)
        setTransferRequest(rs);
        setDataSource(
            rs.items.map(o => ({
                ...o,
                expiredDate: null,
                quantity: o.qty
            }))
        )
    }
    useEffect(() => {
        if (!props.visible) return
        init()
    }, [props.visible])

    return <ActionFormWrapper {...props}
        title="Issue Stock"
        actionHandlers={{
            ...props.actionHandlers,
            onReset: () => {
                init()
            },
            onCompleted: async () => {
                const dataForm = await form.validateFields();
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
                });
            },
            onSetFiles: file => setFiles(v => (file)),
            onRemoveFile: file => setFiles(v => v.filter(it => it.uid !== file.uid)),
        }}
    >
        <Spin spinning={requestActions.request?.loading || false}>
            <ProForm form={form} submitter={false}>
                <Flex vertical gap={24}>
                    <Card>
                        <ProDescriptions<StockTransferRequest>
                            dataSource={transferRequest}
                            columns={[
                                {
                                    title: "Store Name",
                                    dataIndex: "storeName"
                                },
                                {
                                    title: "Truck No",
                                    dataIndex: "truckNo"
                                },
                                {
                                    title:"Current Status",
                                    render:(_,r)=><Tag color={"processing"}>{r.status}</Tag>
                                },
                                // {
                                //     title: "Remark",
                                //     dataIndex: "remarks",
                                //     span:3
                                // },
                                
                            ]}
                        />
                    </Card>
                    <EditableProTable<EditableStockItem>
                        value={dataSource}
                        recordCreatorProps={false}
                        style={{ margin: 0, padding: 0 }}
                        rowKey={"id"}
                        size="small"
                        onValuesChange={setDataSource}
                        editable={{
                            onlyAddOneLineAlertMessage: 'Please save the new record, before add a new record.',
                            onlyOneLineEditorAlertMessage:
                                'Please save the editing record, before start edit a new record.',
                            type: 'single',
                            onSave: async (_, record: EditableStockItem, originRow: EditableStockItem) => {

                                if (record.batchNo) {
                                    record.batchNo = moment(originRow.batchNo)
                                    record.expiredDate = moment(record.batchNo).add(6, 'M');
                                }
                            },
                            actionRender: (_row, _config, dom) => [dom.save, dom.cancel],
                        }}
                        columns={[
                            {
                                key: 'batchNo',
                                title: 'Batch #',
                                dataIndex: 'batchNo',
                                valueType: 'date',
                                ellipsis: true,
                                // formItemProps: (form, _config) => {
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
                                    />,
                                    <EditableProTable.RecordCreator
                                        key={"copy"}
                                        record={{
                                            ...record,
                                            id: (Math.random() * 1000000).toFixed(0)
                                        }}
                                    >
                                        <a><CopyOutlined /></a>
                                    </EditableProTable.RecordCreator>,
                                    <Tooltip title="Delete" key={`delete-${record.key}`}>
                                        <Button
                                            type="link"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => {
                                                const dataSourceItems = dataSource.filter(
                                                    (it) => it.id !== record.id,
                                                );
                                                setDataSource(dataSourceItems);
                                            }}
                                        />
                                    </Tooltip>
                                ]
                            },
                        ]}
                    />
                    <Card>
                        <ProFormTextArea rules={[{ required: props.action == 'Rejected' }]} label="Comment" name="comment" />
                    </Card>
                </Flex>

            </ProForm>
        </Spin>
    </ActionFormWrapper>
}