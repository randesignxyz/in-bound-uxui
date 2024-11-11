import ActionFormWrapper from "@/pages/process-flow/components/forms/ActionFormWrapper";
import { ActionDataFormProps } from "@/pages/process-flow/data";
import { TaskActionDataParam } from "@/services/process-workflow/params";
import { ActionType, ProForm, ProFormTextArea } from "@ant-design/pro-components";
import { message, Modal, UploadFile } from "antd";
import { useForm } from 'antd/es/form/Form';
import { useEffect, useRef, useState } from "react";
import { ProbationEvaluationHrRevievPayload } from "../data.types";
import { simpleRequestActions } from "@/services/model";
import { createService } from "../services";

export default (props: ActionDataFormProps) => {
    const actionRef = useRef<ActionType>();
    const requestActions = simpleRequestActions();
    const srv = createService({ request: requestActions });
    const [form] = useForm<{
        comment?: string;
    }>();
    const [files, setFiles] = useState<UploadFile[]>([])

    useEffect(()=>{
        // loadData()
        setFiles([]) 
    },[])

    return (
        <ActionFormWrapper
           title={props.title}
            {...props}
            width={'95%'}
            actionHandlers= {{...props.actionHandlers,
                onCompleted: async ()=> {
                    const dataForm = await form.validateFields()
                    const data = {                      
                        taskId: props.activityData?.taskId || '',
                        actionName: props.action,
                        comment: dataForm.comment,  
                        payload: { instId: props.procInstId||'',} as ProbationEvaluationHrRevievPayload,                     
                        fileIds: files.map(it=> it.response)
                    } as TaskActionDataParam<ProbationEvaluationHrRevievPayload>
                    Modal.confirm({
                        title: 'Workflow Action',
                        content: 'Are you sure?',
                        onOk: async () => {
                            try {
                                const rs = await srv.mboAssessment(data).then(rs=>{
                                    actionRef.current?.reload()
                                })
                                props.actionHandlers?.onCancel?.(true)
                            } catch (error: any) {
                                message.error(error.message || 'Failed to submit.');
                            }
                        },
                    });

                },
                onSetFiles: file => setFiles(v=> (file)),
                onRemoveFile: file => setFiles(v=> v.filter(it=> it.uid !== file.uid)),
                onReset: ()=> {
                //   loadData()
                  form.setFieldsValue({
                      comment: undefined
                    })
                    setFiles([])
                    
                }
            }}
        >
        
            <ProForm form={form} submitter = {false} >
            <ProFormTextArea
                rules={[{ required: true }]}
                label = "Comment"
                name="comment"
            />
            </ProForm>
        </ActionFormWrapper>
    )
}