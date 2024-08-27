import { ActionDataFormProps } from "@/pages/process-flow/data";
import ActionFormWrapper from '@/pages/process-flow/components/forms/ActionFormWrapper';
import { useEffect, useState } from "react";
import { Alert, Card, message, Modal, Spin, Typography, UploadFile } from "antd";
import { StockControlServiceAPI } from "../services";
import { simpleRequestActions } from "@/services/model";
import { useForm } from "antd/es/form/Form";
import { ProForm, ProFormTextArea } from "@ant-design/pro-components";
import { StockTransferRequest } from "./process-flow/data";
import moment from "moment";
import { formatDate } from "@/pages/utils";

export default (props: ActionDataFormProps) => {

    const [files, setFiles] = useState<UploadFile[]>([])
    const requestActions = simpleRequestActions()
    const services = StockControlServiceAPI(requestActions);
    const [transferRequest, setTransferRequest] = useState<StockTransferRequest>()
    const [form] = useForm<{
        comment?: string;
    }>()
    const init = async () => {
        if (props.procInstId == null) return
        const rs = await services.fetchStockTransferRequest(props.procInstId)
        setTransferRequest(rs)
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
                <Card>
                    {transferRequest?.storeName}
                    <Alert type="warning" description="To be implemented" />
                </Card>
                <Card style={{ marginTop: 10, marginBottom: 10 }}>
                    <ProFormTextArea rules={[{ required: props.action == 'Rejected' }]} label="Comment" name="comment" />
                </Card>
            </ProForm>
        </Spin>
    </ActionFormWrapper>
}
