import ViewFormWrapper from "@/pages/process-flow/components/forms/ViewFormWrapper";
import ProcessFlowModel from "@/models/ProcessFlowModel";
import { DataViewProps } from "@/pages/process-flow/data";
import { simpleRequestActions } from "@/services/model";
import { Button, Col, Descriptions, Form, message, Modal, Row, Spin } from "antd";
import { EditableFormInstance, FooterToolbar, ProCard, ProForm, ProFormTextArea, ProTable } from "@ant-design/pro-components";
import { useEffect, useRef, useState } from "react";
import { ProbationEvaluation, ProbationEvaluationDetailRs, ProbationEvaluationPaloay, ProbationEvaluationResources, ProbationEvaluationResourcesSupport } from "../data.types";
import Section2Card from "../components/Section2Card";
import Section1Table from "../components/Section1Table";
import Section3Card from "../components/Section3Card";
import Section4Card from "../components/Section4Card";
import { useForm } from "antd/lib/form/Form";
import { createService } from "../services";
import { uniqueId } from "lodash";
import { formatDate, formatterQty, formatterQty1 } from "@/pages/utils";

export default (props: DataViewProps & {contribute?:{formNo:number}}) => {
    const workflowModel = ProcessFlowModel();
    const [form] = useForm<ProbationEvaluation>();
    const requestActions = simpleRequestActions();
    const srv = createService({ request: requestActions });

    const [probaResources,setProbaResources] = useState<ProbationEvaluationResources[]>([])
    const [probaResourcesSupport,setProbaResourcesSupport] = useState<ProbationEvaluationResourcesSupport[]>([])
    const [probaRequest,setProbaRequest] = useState<ProbationEvaluationDetailRs>()
    const [addedSection1, setAddedSection1] = useState<ProbationEvaluation[]>([]);
    const [addedSection2, setAddedSection2] = useState<ProbationEvaluation[]>([]);
    const editableFormRef1 = useRef<EditableFormInstance>();
    const editableFormRef2 = useRef<EditableFormInstance>();
    const editableFormRef3 = useRef<EditableFormInstance>();
    const editableFormRef4 = useRef<EditableFormInstance>();
    const instId = workflowModel.state?.instanceData?.processInstance?.procInstId;
    
    const clear = () => {
        form.resetFields();
        setAddedSection2([])
    }
    const validationSection2=()=>{

    }
    useEffect(()=>{
      loadData()
    },[workflowModel.state.instanceData])
    const loadData = async () => {
      if (!instId) return;
      try {       
        const data = await srv.detailByProcessFlow(instId);
        setProbaRequest({ ...data });
        setAddedSection1(data.section1.map(v=> {
          return {...v,key: uniqueId().toString()}
        }))
        setAddedSection2(data.section2.map(v=> {
          return {...v,key: uniqueId().toString()}
        }))
        setProbaResources(data.section3.map(v=> {
          return {...v,key: uniqueId().toString()}
        }))
        setProbaResourcesSupport(data.section4.map(v=> {
          return {...v,key: uniqueId().toString()}
        }))
      } catch (error: any) {
          message.error(error.message || 'Failed to load request.');
      }
    };

    // const onSaveHandler = async ()=>{
    //   // const payload = await getDataForm();
    //   // setStartFormVisible(true);
    //   // console.log('Payload',editableFormRef2.current?.isFieldsValidating())
    //   // if(editableFormRef1.current?.isFieldsValidating()) return;
    //   const f1 = await editableFormRef1.current?.validateFields()
    //   const f2 = await editableFormRef2.current?.validateFields()
    //   const f = await form.validateFields()
    
    //     const payload = {
    //       instId: instId ||0,
    //       section1: addedSection1,
    //       section2: addedSection2,
    //       section3: probaResources,
    //       section4: probaResourcesSupport
    //     } as ProbationEvaluationPaloay
    //     console.log('data form: ', payload)
    //     Modal.confirm({
    //       title: 'Probation Evaluation',
    //       content: 'Are you sure?',
    //       onOk: async () => {
    //         try {
    //           const rs = await srv.insertAssessment(payload);
    //           // message.success(`Appraisal Form is ${'SUBMITTED' === status ? 'submitted' : 'saved'}.`);
    //           // onOpenModalChange?.(false);
    //           // refreshTable();
    //         } catch (error: any) {
    //           message.error(error.message || 'Failed to submit.');
    //         }
    //       },
    //     });
    // }

    return(  
    <ViewFormWrapper<{ id: number }>
        workflowModel={workflowModel}
        workflowProp={props}
        // attachedFiles={stockRequest?.fileIds?.map(it => ({ fileId: it, activity: 'Start' }))}
    >
        {(data) => {
               

        return (<Spin spinning={requestActions.request?.loading||false}>  
            <ProForm
                form={form}   
                style={{paddingBottom:35}}
                submitter={false}
            >
                <ProCard title="Employee Info" 
                      collapsible ={false}  
                      size="small"
                      bordered headerBordered 
                  >                  
                  <Descriptions column={3}>
                    <Descriptions.Item label='Employee Id'>{probaRequest?.probationEvaluation.empNo} </Descriptions.Item>
                    <Descriptions.Item label='Employee Name'>{probaRequest?.probationEvaluation.empName} </Descriptions.Item>
                    <Descriptions.Item label='Hired Date'>{probaRequest?.probationEvaluation?.joinedDate&&formatDate(probaRequest?.probationEvaluation?.joinedDate)}</Descriptions.Item>

                    <Descriptions.Item label='Position'>{probaRequest?.probationEvaluation.jobTitle}</Descriptions.Item>
                    <Descriptions.Item label='Function'>{probaRequest?.probationEvaluation.departmentName} </Descriptions.Item>
                    <Descriptions.Item label='Company'>{probaRequest?.probationEvaluation.buName}</Descriptions.Item>

                  </Descriptions>
                </ProCard>
                
                <ProCard title="INSTRUCTION" 
                    collapsible  
                    size="small"
                    bordered headerBordered 
                >                  
                  <div >• Information in this form and process is private and confidential.</div>
                  <div >• Line Manager must set realistic performance expectations and communicate these expectations clearly to employee at the start of the probation.</div>
                  <div >• Probation evaluation is to be conducted at least 2 weeks before probation ends.</div>
                  <div >• Probation evaluation will determine the employment status of the employee as follows:</div>
                    <div style={{paddingLeft:15}}> 1- Regular employee if the probation performance is satisfied. </div>
                    <div style={{paddingLeft:15}}> 2- Terminated employee if the probation performance is unsatisfied.</div>
                    <div style={{paddingLeft:15}}> 3- Re-assessed employee if the probation is extended. </div>
                  <div >• Probation confirmation does not link or tight to change or adjustment in benefits</div>
                  <div >• Probation evaluation is appraised by Line Manager. Employee will be provided with opportunity to discuss and seek clarification over the results.</div>                  
                </ProCard>    
                <ProCard title="RATING SCALE" 
                 collapsible  
                 size="small"
                 bordered headerBordered 
                >
                  {probaRequest?.ratingScale.map(it => 
                    <Descriptions column={2}>
                      <Descriptions.Item style={{width:'15%'}}> <b>{it.seqNo} - {it.title}</b></Descriptions.Item>
                      <Descriptions.Item> {it.description}</Descriptions.Item>
                    </Descriptions>
                  )}
                </ProCard>      
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
                    <Section1Table editable={false} editableRating={false} editableFormRef={editableFormRef1} addedItems={addedSection1} onSetAddedItems={setAddedSection1} />
                    {/*---------------------------- SECTION II. JOB KNOWLEDGE AND SKILLS (Weightage: 20%)----------------------------------*/}
                    <div>
                        <div style={{paddingTop:5}}>
                        <div><b>SECTION II. JOB KNOWLEDGE AND SKILLS (Weightage: 20%)</b></div>
                        <div>What relevant knowledge and skills that employee possesses and applies effectively in the job</div>
                        </div>
                    </div>
                    <Section2Card editable={false} editableRating={false} editableFormRef={editableFormRef2} addedItems={addedSection2} onSetAddedItems={setAddedSection2} />
                    {/*---------------------------- SECTION III. BEHAVIOR (Weightage: 30%)-------------------------------------------------*/}
                    <div>
                        <div style={{paddingTop:5}}>
                        <div><b>SECTION III. BEHAVIOR (Weightage: 30%)</b></div>
                        <div>How employee is expected to behave in a proper manner.</div>
                        </div>
                    </div>
                    {probaResources&&<Section3Card editable={false} editableRating={false} editableFormRef={editableFormRef3} addedItems={probaResources} onSetAddedItems={setProbaResources} />}
                    {/*---------------------------- SECTION IV. SUPPORT / RESOURCES NEEDED-------------------------------------------------*/}
                    <div>
                        <div style={{paddingTop:5}}>
                        <div><b>SECTION IV. SUPPORT / RESOURCES NEEDED</b></div>
                        <div>What Line Manager provides/facilitates employee during probation period.</div>
                        </div>
                    </div>
                    <Section4Card editable={false} editableRating={false} editableFormRef={editableFormRef4} addedItems={probaResourcesSupport} onSetAddedItems={setProbaResourcesSupport} />
                    {/*---------------------------- SECTION V. ADDITIONAL COMMENTS-------------------------------------------------*/}
                    <div>
                        <div style={{paddingTop:5}}>
                        <div><b>SECTION V. ADDITIONAL COMMENTS</b></div>
                        <div>What employee has done, their strength, and further development need.</div>
                        </div>
                    </div>
                    <Row>
                        <Col style={{width:'100%'}}><ProFormTextArea name='achievement' label='1. Achievement' style={{width:'100%'}} readonly rules={[{ required: true }]} ></ProFormTextArea></Col>
                    </Row>
                    <Row>
                        <Col style={{width:'50%',paddingRight:2}}><ProFormTextArea name='strength' label='2. Strength' style={{width:'100%'}} readonly rules={[{ required: true }]} ></ProFormTextArea></Col>
                        <Col style={{width:'50%',paddingLeft:2}}><ProFormTextArea name='developmentArea' label='3. Development Area' style={{width:'100%'}} readonly rules={[{ required: true }]} ></ProFormTextArea></Col>
                    </Row>
                </ProCard>
                <ProCard title="VERALL PROBATION RATING" 
                  collapsible  
                  size="small"
                  bordered headerBordered 
                >
                  {probaRequest?.overallRating&&<ProTable
                    pagination={false}  
                    search={false}
                    options={{
                        density:false,
                        search:false,
                        reload:false,
                        setting:false,
                        fullScreen:false
                        
                    }}                
                    dataSource={probaRequest?.overallRating} 
                    columns={[
                      {title:'Rating',dataIndex:'score',
                        render:(_,r)=>(<div>{formatterQty1.format(r.startedScore||0)} - { formatterQty1.format(r.endedScore||0)}</div>)
                      },                     
                      {title:'Description',
                        children:[
                          {title:'', dataIndex:'title'},
                          {title:'', dataIndex:'description1'}
                        ]
                      }
                    ]}
                  />}
                </ProCard>
            </ProForm>     
        </Spin>)
        }}
    </ViewFormWrapper>)
}