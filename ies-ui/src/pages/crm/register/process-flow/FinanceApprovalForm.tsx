import ActionFormWrapper from "@/pages/process-flow/components/forms/ActionFormWrapper";
import { ActionDataFormProps } from "@/pages/process-flow/data";
import { ActionType, ProCard, ProForm, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { Card, message, Modal, UploadFile } from "antd";
import { useForm } from 'antd/es/form/Form';
import { useEffect, useRef, useState } from "react";
import { simpleRequestActions } from "@/services/model";
import { RegisterCustomerServiceAPI } from "../services";
import { LookupData } from "@/services/data";

export default (props: ActionDataFormProps) => {
    const requestActions = simpleRequestActions();
    const actionRef = useRef<ActionType>();
    const services = RegisterCustomerServiceAPI(requestActions)
    const [ lookupDataList, setLookupDataList ] = useState<LookupData[]>([])
    const [form] = useForm<{
        seriesId?: number;
        comment?: string;
    }>();
    const [files, setFiles] = useState<UploadFile[]>([])
     useEffect(()=>{
        loadData()
        setFiles([]) 
      },[])
    const loadData = async () => {
        const data = await services.detailByProcessFlow(props.procInstId||'');
        form.setFieldsValue({seriesId: data.seriesId})
       await services.initCustomerData([{
            actionName: 'lookupDataList',
            payload: {
                list: [
                    'SALE_SAP_SERIES'
                ],
            },
        }]).then((rs)=>{
            setLookupDataList(rs.lookupDataList||[])
        })
    }
    return (<ActionFormWrapper
        title={'Finance Approval'}
        {...props}
        width={'95%'}
        actionHandlers= {{...props.actionHandlers,
            onCompleted: async  ()=> {
                const dataForm = await form.validateFields() 
                const data = {                          
                    taskId: props.activityData?.taskId || '',
                    actionName: props.action,
                    comment: dataForm.comment,  
                    payload: { instId: props.procInstId||'', customerCode: dataForm.seriesId} ,                     
                    fileIds: files.map(it=> it.response)
                }
                Modal.confirm({
                    title: 'Workflow Action',
                    content: 'Are you sure?',
                    onOk: async () => {
                        try {
                            services.updateFinanceProcess(data).then(rs=>{
                                actionRef.current?.reload()
                                props.actionHandlers?.onCancel?.(true)
                            })     
                        } catch (error: any) {
                            message.error(error.message || 'Failed to submit.');
                        }
                    },
                });                          
            },
            onSetFiles: file => setFiles(v=> (file)),
            onRemoveFile: file => setFiles(v=> v.filter(it=> it.uid !== file.uid)),
            onReset: ()=> {
                loadData()
                form.setFieldsValue({
                    seriesId: undefined,
                    comment: undefined
                })
                setFiles([])
                
            }

        }}
    >
        <ProForm form={form}  submitter={false}>
            {props.action !='Rejected' && 
            <ProCard title="Customer Information" 
                collapsible ={false}  
                size="small"
                bordered headerBordered 
            >
                {/* <ProFormText rules={[{required: true}]} label="Customer's ID" name="customerCode" /> */}
                     
                <ProFormSelect
                    label="Customer's ID"
                    name={'series'}
                    // placeholder={'Customer's ID'}
                    options={lookupDataList?.filter((it) => it.type === 'SALE_SAP_SERIES' && it?.actived=='Y')?.map((it) => ({
                        label: it.name,
                        value: it.id,
                    }))}
                    // width={470}
                />
            </ProCard>}
            <Card style={{ marginTop: 10, marginBottom: 10 }}>
                <ProFormTextArea rules={[{required: props.action =='Rejected'}]} label="Comment" name="comment" />
            </Card>
        </ProForm>
    </ActionFormWrapper>)

}