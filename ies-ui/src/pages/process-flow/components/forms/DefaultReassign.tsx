import { simpleRequestActions } from "@/services/model";
import { ActionDataFormProps } from "../../data"
import ActionFormWrapper from "./ActionFormWrapper"
import { AccountServiceAPI, AccountServiceAPIs } from "@/services/account/services";
import { useForm } from "antd/lib/form/Form";
import { ProForm, ProFormSelect, ProFormTextArea } from "@ant-design/pro-components";
import { useState } from "react";
import { Modal, message } from "antd";

export default ( {...rest}: ActionDataFormProps) => {

    const requestActions = simpleRequestActions();
    const [uploadFiles, setUploadFiles] = useState<string[]>([])

    const [form] = useForm<{
        userId: string;
        remarks: string;
    }>()

    const onSearchHandler = async (keywords?: string) => {
        return (await AccountServiceAPIs.findAvailableCandidate(rest.formKey , keywords).query(requestActions)).map(it => ({label: it.name, value: it.id}))
    }

    return <ActionFormWrapper {...rest}
        title="Reassign Task"
        actionHandlers={{
            onSetFiles: (files) => setUploadFiles(files.map(it => it.response)),
            onReset: () => {
                form.resetFields()
                setUploadFiles([])
            },
            onCancel: () => {
                rest.actionHandlers?.onCancel?.()
            },
            onCompleted: async () => {

                const dataForm = await form.validateFields()
                Modal.confirm({
                    title: "Reassing task",
                    content: "Are you sure?",
                    onOk: async () => {

                        if (!rest.activityData?.taskId) {
                            message.error("No task found.")
                            return
                        }

                        try {
                            await AccountServiceAPIs.reassignTask(
                                rest.activityData.taskId,
                                dataForm.userId, 
                                true,
                                uploadFiles,
                                dataForm.remarks,
                            )(requestActions)
                            message.success("Task reassigned successfully.")
                            rest.actionHandlers?.onCancel?.(true)
                        } catch (error: any) {
                            message.error(error.message || 'failed to reassign task.')
                        }
                    }
                })
            }
        }}
    >
        <ProForm form={form} submitter={false}>
            <ProFormSelect rules={[{required: true}]} allowClear  showSearch label = "Assign To" name={"userId"} request={({ keyWords }) => onSearchHandler( keyWords)} />
            <ProFormTextArea rules={[{required: true}]} label = "Remarks" name={"remarks"} />
        </ProForm>
    </ActionFormWrapper>
}