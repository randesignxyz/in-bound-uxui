import { ActionDataFormProps } from '@/pages/process-flow/data';
import ActionFormWrapper from '@/pages/process-flow/components/forms/ActionFormWrapper';
import { ActionType, EditableFormInstance, ProCard, ProForm, ProFormTextArea } from "@ant-design/pro-components";
import { Card, message, Modal, Space, UploadFile } from "antd";
import { ProbationEmpImprovement, ProbationEvaluation, ProbationEvaluationDetailRs, ProbationEvaluationPayload, ProbationEvaluationResources, ProbationEvaluationResourcesSupport } from '../data.types';
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
import EmpImprovmentTable1 from '../components/EmpImprovmentTable1';
import EmpImprovmentTable from '../components/EmpImprovmentTable';
import SummaryCard from '../components/SummaryCard';
import { Moment } from 'moment';

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
    const editableEmpAchievForm = useRef<EditableFormInstance>();
    const editableEmpImprovementForm = useRef<EditableFormInstance>();
    const [probaRequest,setProbaRequest] = useState<ProbationEvaluationDetailRs>()
    const [formConfirmedStatus] = useForm<{extendedDate?: Moment;}>();
    const [confirmStatus,setConfirmStatus] = useState<string>('')

    useEffect(()=>{
        loadData()
        setFiles([]) 
      },[])
      const loadData = async () => {      
        try {       
          const data = await srv.detailByProcessFlow(props.procInstId||'');
          setProbaRequest(data)
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
    const finalTotal = (): number=>{
        var rating1 = 0,
        rating2 = 0,
        rating3 = 0;
        addedSection1.forEach((it) => {
            rating1 += (it.rating1||0) +  (it.rating2||0) +  (it.rating3||0) +  (it.rating4||0) +  (it.rating5||0)
        });
        rating1 = (rating1 / addedSection1.length)*0.5
        addedSection2.forEach((it) => {
            rating2 += (it.rating1||0) +  (it.rating2||0) +  (it.rating3||0) +  (it.rating4||0) +  (it.rating5||0)
        });
        rating2 = (rating2 / addedSection2.length)*0.2
        addedSection3.forEach((it) => {
            rating3 += (it.rating1||0) +  (it.rating2||0) +  (it.rating3||0) +  (it.rating4||0) +  (it.rating5||0)
        });
        rating3 = (rating3 / addedSection3.length)*0.3
        return rating1 + rating2 + rating3
    }
    
    return (
        <ActionFormWrapper
           title="Assessment, Evaluation"
            {...props}
            width={'95%'}
            actionHandlers= {{...props.actionHandlers,
                onCompleted: async ()=> { 
                    const section1Valid = addedSection1.filter(r => ( r.rating1==undefined || r.rating2==undefined || r.rating3==undefined || r.rating4==undefined || r.rating5==undefined))
                    const section2Valid = addedSection2.filter(r => ( r.rating1==undefined || r.rating2==undefined || r.rating3==undefined || r.rating4==undefined || r.rating5==undefined))
                    const section3Valid = addedSection3.filter(r => ( r.rating1==undefined || r.rating2==undefined || r.rating3==undefined || r.rating4==undefined || r.rating5==undefined))
                    const section4Valid = addedSection4.filter(r => ( r.fully==undefined || r.partial==undefined || r.no==undefined))
                   
                    if(section1Valid.length>0) {
                        message.error("SECTION I. PERFORMANCE, rating score is required.")
                        return
                    }
                    if(section2Valid.length>0) {
                        message.error("SECTION II. JOB KNOWLEDGE AND SKILLS, rating score is required.")
                        return
                    }                    
                    if(section3Valid.length>0) {
                        message.error("SECTION III. BEHAVIOR, rating score is required.")
                        return
                    }
                    if(section4Valid.length>0) {
                        message.error("SECTION IV. SUPPORT / RESOURCES NEEDED, rating score is required.")
                        return
                    }
                    const achFieldsValue = await editableEmpAchievForm.current?.getFieldsValue()
                    const achList: ProbationEmpImprovement[] = Object.values(achFieldsValue)
                    const empAchievement = achList.filter(r => ( r.description==undefined || r.description=='' ))
                    if(empAchievement.length>0) {
                        editableEmpAchievForm.current?.validateFields()
                        message.error("SECTION V. ADDITIONAL COMMENTS, 1. achievment is required.")
                        return
                    }
                    
                    const improFieldsValue = await editableEmpImprovementForm.current?.getFieldsValue()
                    const improList: ProbationEmpImprovement[] = Object.values(improFieldsValue)
                    const empImprovement = improList.filter(r => ( r.description==undefined || r.description=='' || r.description1==undefined || r.description1==''))                       
                    if(empImprovement.length>0) {  
                        editableEmpImprovementForm.current?.validateFields()                      
                        message.error("SECTION V. ADDITIONAL COMMENTS, (2. Strength/ 3. Development Area) is required.")
                        return
                    }
                    const dataStatus = formConfirmedStatus.getFieldsValue() 
                    if(confirmStatus=='') {
                        message.error("DECISION BY FUNCTION MANAGER is required.")
                        return
                    }
                    if(confirmStatus=='EXTENDED' && (!dataStatus || dataStatus.extendedDate==undefined)) {                        
                        message.error("DECISION BY FUNCTION MANAGER: Extened Probation Until is required.")
                        await formConfirmedStatus.validateFields()  
                        return   
                    } 

                    if(!props.activityData?.taskId) {
                        message.error("Task Id is not found")
                        return
                    }

                    if(files.length<=1) {
                        message.error("Atless two attachment files is required.")
                        return
                    }
                    const dataForm = await form.validateFields() 
                    const payload = {
                        instId: props.procInstId||'',
                        section1: addedSection1.map((v, index) => ({ ...v, seqNo: index + 1 })),
                        section2: addedSection2.map((v, index) => ({ ...v, seqNo: index + 1 })),
                        section3: addedSection3.map((v, index) => ({ ...v, seqNo: index + 1 })),
                        section4: addedSection4.map((v, index) => ({ ...v, seqNo: index + 1 })),
                        empAchievement: achList.map((v, index) => ({ ...v, seqNo: index + 1 })),
                        empImprovement: improList.map((v, index) => ({ ...v, seqNo: index + 1 })),
                        confirmedStatus: confirmStatus,
                        extendedDate: dataStatus?.extendedDate

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
                        title: 'Assessment, Evaluation',
                        content: 'Are you sure?',
                        onOk: async () => {
                            try {
                                await srv.updateAssessment(data).then(rs=>{
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
                  form.setFieldsValue({comment: undefined})
                  setFiles([])                
                  
                }
            }}
            uploadProps= {{
                required: true,
                message: 'Atless two attachment fils is required.'
            }}
        >
             <ProForm form={form}  submitter={false}>
                <ProCard title="PERFORMANCE" 
                    collapsible  
                    size="small"
                    bordered headerBordered 
                >
                    <Section1Table editable={false} editableRating={true} editableFormRef={editableFormRef1} addedItems={addedSection1} onSetAddedItems={setAddedSection1} />                    
                    <Section2Card editable={false} editableRating={true} editableFormRef={editableFormRef2} addedItems={addedSection2} onSetAddedItems={setAddedSection2} />                   
                    <Section3Card editable={false} editableRating={true} editableFormRef={editableFormRef3} addedItems={addedSection3} onSetAddedItems={setAddedSection3} />                    
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
                    <EmpImprovmentTable editableFormRef={editableEmpAchievForm} editable={true} initDataItems={[]}/>
                    <EmpImprovmentTable1 editableFormRef={editableEmpImprovementForm} editable={true} initDataItems={[]} />
                </Space>
                {probaRequest && <SummaryCard probaRequest={probaRequest} totalScore={finalTotal()} form={formConfirmedStatus} setConfirmStatus={setConfirmStatus} readonly={false} initialValue={{status:''}}/>}
                
                <Card style={{ marginTop: 10, marginBottom: 10 }}>
                    <ProFormTextArea rules={[{required: props.action =='Rejected'}]} label="Comment" name="comment" />
                </Card>
                
             </ProForm>

        </ActionFormWrapper>
    )

}