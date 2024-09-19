import { ActionDataFormProps } from '@/pages/process-flow/data';
import ActionFormWrapper from '@/pages/process-flow/components/forms/ActionFormWrapper';
import { ActionType, EditableFormInstance, ProCard, ProForm, ProFormTextArea } from "@ant-design/pro-components";
import { Card, message, Modal, UploadFile } from "antd";
import { ProbationEvaluation, ProbationEvaluationPaloay, ProbationEvaluationResources, ProbationEvaluationResourcesSupport } from '../data.types';
import { useForm } from 'antd/es/form/Form';
import { simpleRequestActions } from '@/services/model';
import { createService } from '../services';
import { useEffect, useRef, useState } from 'react';
import { uniqueId } from 'lodash';
import Section1Table from '../components/Section1Table';
import Section2Card from '../components/Section2Card';
import Section3Card from '../components/Section3Card';
import Section4Card from '../components/Section4Card';
import { TaskActionDataParam } from '@/services/process-workflow/params';

export default (props: ActionDataFormProps) => {

    const [form] = useForm<{
        comment?: string;
    }>();
    const actionRef = useRef<ActionType>();
    const [files, setFiles] = useState<UploadFile[]>([])
    const requestActions = simpleRequestActions();
    const srv = createService({ request: requestActions });

   
    const [addedSection1, setAddedSection1] = useState<ProbationEvaluation[]>([]);
    const [addedSection2, setAddedSection2] = useState<ProbationEvaluation[]>([]);
    const [addedSection3,setAddedSection3] = useState<ProbationEvaluationResources[]>([])
    const [addedSection4,setAddedSection4] = useState<ProbationEvaluationResourcesSupport[]>([])

    const editableFormRef1 = useRef<EditableFormInstance>();
    const editableFormRef2 = useRef<EditableFormInstance>();
    const editableFormRef3 = useRef<EditableFormInstance>();
    const editableFormRef4 = useRef<EditableFormInstance>();

    useEffect(()=>{
        loadData()
        setFiles([]) 
      },[])
      const loadData = async () => {      
        try {       
          const data = await srv.detailByProcessFlow(props.procInstId||'');
          setAddedSection1(data.section1.map(v=> {
            return {...v,key: uniqueId().toString()}
          }))
          setAddedSection2(data.section2.map(v=> {
            return {...v,key: uniqueId().toString()}
          }))
          setAddedSection3(data.section3.map(v=> {
            return {...v,key: uniqueId().toString()}
          }))
          setAddedSection4(data.section4.map(v=> {
            return {...v,key: uniqueId().toString()}
          }))
        } catch (error: any) {
            message.error(error.message || 'Failed to load request.');
        }
    }
 
    
    return (
        <ActionFormWrapper
           title="Assessment, Preparation"
            {...props}
            width={'95%'}
            actionHandlers= {{...props.actionHandlers,
                onCompleted: async ()=> {
                   
                    if(props.action =='Rejected'){
                        const dataForm = await form.validateFields()
                        const data = {                      
                            taskId: props.activityData?.taskId || '',
                            actionName: props.action,
                            comment: dataForm.comment,  
                            payload: { instId: props.procInstId||'',} as ProbationEvaluationPaloay,                     
                            fileIds: files.map(it=> it.response)
                        } as TaskActionDataParam<ProbationEvaluationPaloay>
                        Modal.confirm({
                            title: 'Workflow Action',
                            content: 'Are you sure?',
                            onOk: async () => {
                                try {
                                    const rs = await srv.insertAssessment(data).then(rs=>{
                                        actionRef.current?.reload()
                                    })
                                    props.actionHandlers?.onCancel?.(true)
                                } catch (error: any) {
                                message.error(error.message || 'Failed to submit.');
                                }
                            },
                        });

                    }else{
                        const f1 = await editableFormRef1.current?.validateFields()
                        const f2 = await editableFormRef2.current?.validateFields()
                        const dataForm = await form.validateFields()        
                        const payload = {
                            instId: props.procInstId||'',
                            section1: addedSection1.map((v, index) => ({ ...v, seqNo: index + 1 })),
                            section2: addedSection2.map((v, index) => ({ ...v, seqNo: index + 1 })),
                            section3: addedSection3.map((v, index) => ({ ...v, seqNo: index + 1 })),
                            section4: addedSection4.map((v, index) => ({ ...v, seqNo: index + 1 }))
                        } as ProbationEvaluationPaloay

                        if(!props.activityData?.taskId) {
                            message.error("Task Id is not found")
                            return
                        }
                        // const saveItems = items?.map(v => ({id:v.id,stockRemarks: v.stockRemarks}))                   
                        const data = {                      
                            taskId: props.activityData?.taskId || '',
                            actionName: props.action,
                            comment: dataForm.comment,  
                            payload: payload,                     
                            fileIds: files.map(it=> it.response)
                        } as TaskActionDataParam<ProbationEvaluationPaloay>
                        console.log('data form: ', payload)
                        Modal.confirm({
                            title: 'Assessment, Preparation',
                            content: 'Are you sure?',
                            onOk: async () => {
                                try {
                                    const rs = await srv.insertAssessment(data).then(rs=>{
                                        actionRef.current?.reload()
                                    })
                                    props.actionHandlers?.onCancel?.(true)
                                } catch (error: any) {
                                message.error(error.message || 'Failed to submit.');
                                }
                            },
                        });
                    }
                },
                onSetFiles: file => setFiles(v=> (file)),
                onRemoveFile: file => setFiles(v=> v.filter(it=> it.uid !== file.uid)),
                onReset: ()=> {
                  loadData()
                  form.setFieldsValue({
                      comment: undefined
                    })
                    setFiles([])
                }
            }}
        >
             <ProForm form={form}  submitter={false}>
              {props.action !='Rejected' && <div>
                <ProCard title="EVALUATION" 
                    collapsible  
                    size="small"
                    bordered headerBordered 
                >
                    
                    <div>
                        <span>Please choose rating of each criterion that describes best of your employee’s performance compares to the job expectations and goals/work priorities.</span>
                        <div style={{paddingTop:5}}>
                        <div><b>SECTION I. PERFORMANCE (Weightage: 50%)</b></div>
                        <div>What employee is expected to do/achieved during probation period.</div>
                        <div><span style={{color:'red'}}>*</span> At least 3 items are required.</div>
                        </div>
                    </div>
                    <Section1Table editable={true} editableRating={false} editableFormRef={editableFormRef1} addedItems={addedSection1} onSetAddedItems={setAddedSection1} />
                    {/*---------------------------- SECTION II. JOB KNOWLEDGE AND SKILLS (Weightage: 20%)----------------------------------*/}
                    <div>
                        <div style={{paddingTop:5}}>
                        <div><b>SECTION II. JOB KNOWLEDGE AND SKILLS (Weightage: 20%)</b></div>
                        <div>What relevant knowledge and skills that employee possesses and applies effectively in the job</div>
                        </div>
                    </div>
                    <Section2Card editable={true} editableRating={false} editableFormRef={editableFormRef2} addedItems={addedSection2} onSetAddedItems={setAddedSection2} />
                    {/*---------------------------- SECTION III. BEHAVIOR (Weightage: 30%)-------------------------------------------------*/}
                    <div>
                        <div style={{paddingTop:5}}>
                        <div><b>SECTION III. BEHAVIOR (Weightage: 30%)</b></div>
                        <div>How employee is expected to behave in a proper manner.</div>
                        </div>
                    </div>
                    <Section3Card editable={false} editableRating={false} editableFormRef={editableFormRef3} addedItems={addedSection3} onSetAddedItems={setAddedSection3} />
                    {/*---------------------------- SECTION IV. SUPPORT / RESOURCES NEEDED-------------------------------------------------*/}
                    <div>
                        <div style={{paddingTop:5}}>
                        <div><b>SECTION IV. SUPPORT / RESOURCES NEEDED</b></div>
                        <div>What Line Manager provides/facilitates employee during probation period.</div>
                        </div>
                    </div>
                    <Section4Card editable={false} editableRating={false} editableFormRef={editableFormRef4} addedItems={addedSection4} onSetAddedItems={setAddedSection4} />

                </ProCard>
                </div>}
                <Card style={{ marginTop: 10, marginBottom: 10 }}>
                    <ProFormTextArea rules={[{required: props.action =='Rejected'}]} label="Comment" name="comment" />
                </Card>
             </ProForm>

        </ActionFormWrapper>
    )

}