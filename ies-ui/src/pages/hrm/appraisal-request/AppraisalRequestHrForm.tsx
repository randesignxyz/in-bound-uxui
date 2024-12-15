import { ActionDataFormProps } from "@/pages/process-flow/data";
import { simpleRequestActions } from "@/services/model";
import { Modal, Space, UploadFile, message } from "antd";
import ActionFormWrapper from "@/pages/process-flow/components/forms/ActionFormWrapper";
import { useForm } from "antd/lib/form/Form";
import { useEffect, useState } from "react";
import { createService } from "./services";
import { AppraisalRequestDetail } from "./data.types";
import { ProForm, ProFormTextArea } from "@ant-design/pro-components";
import _ from "lodash";

export default (props: ActionDataFormProps) => {

    const [files, setFiles] = useState<UploadFile[]>([])
    const [form] = useForm<{
        remarks?: string;
    }>()
    const requestActions = simpleRequestActions()
    const services = createService(requestActions)
    const [data, setData] = useState<AppraisalRequestDetail>()

    useEffect(() => {
        (async () => {           
                if (props.activityData?.procInstId) {
                    try {
                        const rs = await services.findByInstId(props.activityData.procInstId)
                        setData(rs)
                    } catch (error: any) {
                        message.error(error.message || 'Failed to load data.')
                    }
                }
        })()
    },[props.visible, props.ProcessInstanceData])    

    return <ActionFormWrapper
        {...props}
        loading={requestActions.request?.loading || false}
        instanceData={props.ProcessInstanceData}
        title={props.activityData?.activity}
        actionHandlers={{
            ...props.actionHandlers,
            onCompleted: async () => {
                const formData = await form.validateFields()
                var validator = Array<string>()
                if((data?.items.filter(it=> !(it.status=='DONE' || it.status=='IMPORTED'))||[]).length>0){
                    validator.push('There are some Appraisal Form not yet review.')
                }
                if(data?.members?.length==0){
                    validator.push('Board Member List is require.')
                }
                if(validator.length>0){
                    Modal.warning({
                        title: `Data's Require`,                       
                        content: <div>{validator.map(it => { 
                            return <div><span style={{color:'orange'}}>{it}</span></div>
                        })}</div>
                    })
                    return
                }
                Modal.confirm({
                    title: "HR Review",
                    content: "Are you sure?",
                    onOk: async () => {
                        if (!props.activityData?.taskId || !data?.id) {
                            message.error("Task cannot be found.")
                            return
                        }
                        try {
                            await services.actionHR({
                                actionName: props.action,
                                taskId: props.activityData.taskId,
                                comment: formData.remarks,
                                fileIds: files.map(it => it.response),
                                payload: {
                                    processInstId: props.activityData?.procInstId
                                }
                            })
                            message.success("Submitted successfully.")
                            props.actionHandlers?.onCancel?.(true)

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
            <Space direction="vertical" style={{ width: '100%' }}>
                <ProFormTextArea rules={[{ required: true }]} label="Comment" name={"remarks"} />
            </Space>
        </ProForm>
    </ActionFormWrapper>


}