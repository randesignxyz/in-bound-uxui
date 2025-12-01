import ActionFormWrapper from "@/pages/process-flow/components/forms/ActionFormWrapper";
import { ActionDataFormProps } from "@/pages/process-flow/data";
import { simpleRequestActions } from "@/services/model";
import { ProForm, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { message, Modal, UploadFile } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useEffect, useState } from "react";
import { StaffRequisitionRequest } from "../../data";
import { EmployeeServices } from "../../services";

export default (props: ActionDataFormProps) => {

    const [files, setFiles] = useState<UploadFile[]>([])
    const [form] = useForm<{
        proposedBudget: string;
        remarks?: string;

    }>()
    const requestActions = simpleRequestActions();
    const [data, setData] = useState<StaffRequisitionRequest>()

    useEffect(() => {

        if (!props.visible) return
        (async () => {
            if (props.activityData?.procInstId) {
                const rs = await EmployeeServices.fetchStaffRequisitionRequest(props.activityData?.procInstId).query(requestActions)
                setData(rs)
            }
        })()
    }, [props.visible, props.ProcessInstanceData])

    return <ActionFormWrapper
        {...props}
        loading={requestActions.request?.loading || false}
        title="Budget Review"
        actionHandlers={{
            ...props.actionHandlers,
            onCompleted: async () => {
                const formData = await form.validateFields()
                Modal.confirm({
                    title: "HRBP Review",
                    content: "Are you sure?",
                    onOk: async () => {
                        if (!props.activityData?.taskId || !data?.id) {
                            message.error("Task cannot be found.")
                            return
                        }
                        try {
                            await EmployeeServices.hrbpApprove({
                                actionName: props.action,
                                taskId: props.activityData.taskId,
                                comment: formData.remarks,
                                fileIds: files.map(it => it.response),
                                payload: {
                                    id: data.id,
                                    proposedBudget: formData.proposedBudget
                                }
                            })(requestActions)
                            props.actionHandlers?.onCancel?.(true)
                            message.success("Submitted successfully.")
                        } catch (error: any) {
                            message.error(error.message || 'Failed to post.')
                        }
                    }
                })
            },
            onSetFiles: setFiles,
            onReset: () => form.resetFields()
        }}
    >
        <ProForm form={form} submitter={false}>
            {props.action === 'Approved' && <ProFormText rules={[{ required: true }]} label="Proposed Budget" name={'proposedBudget'} />}
            <ProFormTextArea rules={[{ required: props.action === 'Rejected' }]} label="Remarks" name={"remarks"} />
        </ProForm>
    </ActionFormWrapper>
}
