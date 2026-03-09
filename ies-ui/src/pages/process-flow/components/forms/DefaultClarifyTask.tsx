import { ProForm, ProFormSelect, ProFormTextArea } from "@ant-design/pro-components"
import { ActionDataFormProps } from "../../data"
import ActionFormWrapper from "./ActionFormWrapper"
import { useForm } from "antd/lib/form/Form"
import { AccountServiceAPIs } from "@/services/account/services"
import { simpleRequestActions } from "@/services/model"
import { Modal, message } from "antd"
import { useState } from "react"

export default ({ ...rest }: ActionDataFormProps) => {

    const requestActions = simpleRequestActions();
    const [uploadFiles, setUploadFiles] = useState<string[]>([])
    const [form] = useForm<{
        userId: string;
        remarks: string;
    }>()

    const onSearchHandler = async (keywords?: string) => {
        console.log(rest)
        return (await AccountServiceAPIs.findAvailableUsersTask(rest.procInstId, keywords).query(requestActions)).map(it => ({ label: it.name, value: it.id,subChannel: it.description  }))
    }
    return <ActionFormWrapper {...rest}
        title="Clarify Task"
        okText="Send"
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
                    title: "Clarify task",
                    content: "Are you sure?",
                    onOk: async () => {
                        if (!rest.activityData?.taskId) {
                            message.error("No task found.")
                            return
                        }
                        try {
                            await AccountServiceAPIs.createSubtask(
                                rest.activityData.taskId,
                                dataForm.userId, rest.action,
                                dataForm.remarks,
                                uploadFiles
                            )(requestActions)
                            message.success("Clarify task created successfully.")
                            rest.actionHandlers?.onCancel?.(true)
                        } catch (error: any) {
                            message.error(error.message || 'failed to create task.')
                        }
                    }
                })
            }
        }}
    >
        <ProForm form={form} submitter={false}>
            <ProFormSelect
                rules={[{ required: true }]} allowClear
                showSearch label="Assign To"
                name={"userId"}
                fieldProps={{
                dropdownRender: (menu) => (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 12px', color: '#999', borderBottom: '1px solid #f0f0f0' }}>
                      <span>Name</span>
                      <span></span>
                    </div>
                    {menu}
                  </>
                ),
                optionRender: (option) => (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{option.label}</span>
                    <span style={{ color: '#999' }}>{option.data.subChannel}</span>
                  </div>
                ),
              }}
                request={({ keyWords }) => onSearchHandler(keyWords)} 
            />
            <ProFormTextArea label="Remarks" name={"remarks"} rules={[{ required: true }]} />
        </ProForm>

    </ActionFormWrapper>
}