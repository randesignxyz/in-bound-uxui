import { ActionDataFormProps } from '@/pages/process-flow/data';
import ActionFormWrapper from '@/pages/process-flow/components/forms/ActionFormWrapper';
import { ActionType, EditableFormInstance, EditableProTable, ProCard, ProForm, ProFormTextArea } from "@ant-design/pro-components";
import { Button, Card, Col, message, Modal, Row, Space, UploadFile } from "antd";
import { ProbationEmpImprovement, ProbationEvaluation, ProbationEvaluationPayload, ProbationEvaluationResources, ProbationEvaluationResourcesSupport } from '../data.types';
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
import { MinusCircleOutlined } from '@ant-design/icons';
import EmpImprovmentTable1 from '../components/EmpImprovmentTable1';
import EmpImprovmentTable from '../components/EmpImprovmentTable';

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
    const [addedEmpAchievement,setAddedEmpAchievement] = useState<ProbationEmpImprovement[]>([])
    const [addedEmpImprovement,setAddedEmpImprovement] = useState<ProbationEmpImprovement[]>([])

    const editableFormRef1 = useRef<EditableFormInstance>();
    const editableFormRef2 = useRef<EditableFormInstance>();
    const editableFormRef3 = useRef<EditableFormInstance>();
    const editableFormRef4 = useRef<EditableFormInstance>();
    const editableEmpAchievForm = useRef<EditableFormInstance>();
    const editableEmpImprovementForm = useRef<EditableFormInstance>();

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
           title="Assessment, Submission"
            {...props}
            width={'95%'}
            actionHandlers= {{...props.actionHandlers,
                onCompleted: async ()=> {                 
                    
                    const f1 = await editableFormRef1.current?.validateFields()
                    const f2 = await editableFormRef2.current?.validateFields()                            
                    const section1Valid = addedSection1.filter(r => ( r.rating1==undefined || r.rating2==undefined || r.rating3==undefined || r.rating4==undefined || r.rating5==undefined))
                    const section2Valid = addedSection2.filter(r => ( r.rating1==undefined || r.rating2==undefined || r.rating3==undefined || r.rating4==undefined || r.rating5==undefined))
                    const section3Valid = addedSection3.filter(r => ( r.rating1==undefined || r.rating2==undefined || r.rating3==undefined || r.rating4==undefined || r.rating5==undefined))
                    const section4Valid = addedSection4.filter(r => ( r.fully==undefined || r.partial==undefined || r.no==undefined))
                    const empAchievement = addedEmpAchievement.filter(r => ( r.description==undefined || r.description=='' ))
                    const empImprovement = addedEmpImprovement.filter(r => ( r.description==undefined || r.description=='' || r.description1==undefined || r.description1==''))
                    
                    if(section1Valid.length>0) {
                        message.error("SECTION I. PERFORMANCE, rating score is required.")
                        return
                    }
                    if(section2Valid.length>0) {
                        message.error("SECTION II. JOB KNOWLEDGE AND SKILLS, rating score is required.")
                        return
                    }
                    console.log('section3Valid: ', section3Valid)
                    if(section3Valid.length>0) {
                        message.error("SECTION III. BEHAVIOR, rating score is required.")
                        return
                    }
                    if(section4Valid.length>0) {
                        message.error("SECTION IV. SUPPORT / RESOURCES NEEDED, rating score is required.")
                        return
                    }
                    if(empAchievement.length>0) {
                        message.error("SECTION V. ADDITIONAL COMMENTS, 1. achievment is required.")
                        return
                    }
                    if(empImprovement.length>0) {
                        message.error("SECTION V. ADDITIONAL COMMENTS, (2. Strength/ 3. Development Area) is required.")
                        return
                    }

                    if(!props.activityData?.taskId) {
                        message.error("Task Id is not found")
                        return
                    }

                    if(files.length==0) {
                        message.error("Attachment file is required.")
                        return
                    }
                    const dataForm = await form.validateFields() 
                    const payload = {
                        instId: props.procInstId||'',
                        section1: addedSection1.map((v, index) => ({ ...v, seqNo: index + 1 })),
                        section2: addedSection2.map((v, index) => ({ ...v, seqNo: index + 1 })),
                        section3: addedSection3.map((v, index) => ({ ...v, seqNo: index + 1 })),
                        section4: addedSection4.map((v, index) => ({ ...v, seqNo: index + 1 })),
                        empAchievement: addedEmpAchievement.map((v, index) => ({ ...v, seqNo: index + 1 })),
                        empImprovement: addedEmpImprovement.map((v, index) => ({ ...v, seqNo: index + 1 }))
                    } as ProbationEvaluationPayload
                            
                    const data = {                      
                        taskId: props.activityData?.taskId || '',
                        actionName: props.action,
                        comment: dataForm.comment,  
                        payload: payload,                     
                        fileIds: files.map(it=> it.response)
                    } as TaskActionDataParam<ProbationEvaluationPayload>
                    console.log('data form: ', payload)
                    Modal.confirm({
                        title: 'Assessment, Submission',
                        content: 'Are you sure?',
                        onOk: async () => {
                            try {
                                const rs = await srv.updateAssessment(data).then(rs=>{
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
                  loadData()
                  form.setFieldsValue({
                      comment: undefined
                    })
                    setFiles([])
                }
            }}
            uploadProps= {{
                required: true,
                message: 'Attachment fils is required.'
            }}
        >
             <ProForm form={form}  submitter={false}>
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
                    <Section1Table editable={false} editableRating={true} editableFormRef={editableFormRef1} addedItems={addedSection1} onSetAddedItems={setAddedSection1} />
                    {/*---------------------------- SECTION II. JOB KNOWLEDGE AND SKILLS (Weightage: 20%)----------------------------------*/}
                    <div>
                        <div style={{paddingTop:5}}>
                        <div><b>SECTION II. JOB KNOWLEDGE AND SKILLS (Weightage: 20%)</b></div>
                        <div>What relevant knowledge and skills that employee possesses and applies effectively in the job</div>
                        </div>
                    </div>
                    <Section2Card editable={false} editableRating={true} editableFormRef={editableFormRef2} addedItems={addedSection2} onSetAddedItems={setAddedSection2} />
                    {/*---------------------------- SECTION III. BEHAVIOR (Weightage: 30%)-------------------------------------------------*/}
                    <div>
                        <div style={{paddingTop:5}}>
                        <div><b>SECTION III. BEHAVIOR (Weightage: 30%)</b></div>
                        <div>How employee is expected to behave in a proper manner.</div>
                        </div>
                    </div>
                    <Section3Card editable={false} editableRating={true} editableFormRef={editableFormRef3} addedItems={addedSection3} onSetAddedItems={setAddedSection3} />
                    {/*---------------------------- SECTION IV. SUPPORT / RESOURCES NEEDED-------------------------------------------------*/}
                    <div>
                        <div style={{paddingTop:5}}>
                        <div><b>SECTION IV. SUPPORT / RESOURCES NEEDED</b></div>
                        <div>What Line Manager provides/facilitates employee during probation period.</div>
                        </div>
                    </div>
                    <Section4Card editable={false} editableRating={true} editableFormRef={editableFormRef4} addedItems={addedSection4} onSetAddedItems={setAddedSection4} />

                </ProCard>
                {/*---------------------------- SECTION V. ADDITIONAL COMMENTS-------------------------------------------------*/}
                <div>
                    <div style={{paddingTop:5}}>
                    <div><b>SECTION V. ADDITIONAL COMMENTS</b></div>
                    <div>What employee has done, their strength, and further development need.</div>
                    </div>
                </div>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <EmpImprovmentTable editableFormRef={editableEmpAchievForm} editable={true} addedItems={addedEmpAchievement} onSetAddedItems={setAddedEmpAchievement}/>
                    <EmpImprovmentTable1 editableFormRef={editableEmpImprovementForm} editable={true} addedItems={addedEmpImprovement} onSetAddedItems={setAddedEmpImprovement}/>
                </Space>
                
                <Card style={{ marginTop: 10, marginBottom: 10 }}>
                    <ProFormTextArea rules={[{required: props.action =='Rejected'}]} label="Comment" name="comment" />
                </Card>
                
             </ProForm>

        </ActionFormWrapper>
    )

}