import ViewFormWrapper from "@/pages/process-flow/components/forms/ViewFormWrapper";
import ProcessFlowModel from "@/models/ProcessFlowModel";
import { DataViewProps } from "@/pages/process-flow/data";
import { SimpleRequestActions, simpleRequestActions } from "@/services/model";
import { Button, Col, Descriptions, Form, Input, message, Modal, Row, Space, Spin } from "antd";
import { EditableFormInstance, FooterToolbar, ProCard, ProForm, ProFormTextArea, ProTable } from "@ant-design/pro-components";
import { useEffect, useRef, useState } from "react";
import { CriteriaExportReport, ProbationEvaluation, ProbationEvaluationDetailRs, ProbationEvaluationResources, ProbationEvaluationResourcesSupport } from "../data.types";
import Section2Card from "../components/Section2Card";
import Section1Table from "../components/Section1Table";
import Section3Card from "../components/Section3Card";
import Section4Card from "../components/Section4Card";
import { useForm } from "antd/lib/form/Form";
import { createService } from "../services";
import { uniqueId } from "lodash";
import { formatDate, formatterQty, formatterQty1 } from "@/pages/utils";
import EmpImprovmentTable1 from "../components/EmpImprovmentTable1";
import EmpImprovmentTable from "../components/EmpImprovmentTable";
import { FileExcelOutlined, FilePdfOutlined } from "@ant-design/icons";
import { DownloadData, downloadReport } from "@/services/apiGateway";
import { ProbationEvaluationRequestFormNames } from ".";

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
    const dataReport=(exportType: 'PDF' | 'EXCEL'): DownloadData<CriteriaExportReport>=> { 
      
      // var direct = data?.contractTypeCode == 'OTHER' ? 'Display':data?.contractTypeCode == 'IN_DIRECT' ?'Indirect' : 'Direct'
      // var issued=  data?.status=='ISSUED'? 'Issued':''
      // var reportName = replace('SettlementIncentive@@##Report','@@',direct)
      // reportName = replace(reportName,'##',issued) 
      return {
        reportName: 'export-form',
        fileName: `Probation Evaluation Form`,
        type: exportType,
        data: {
          processDefKey: 'probation_evaluation_form',
          processInstId: instId||''
        }
      }    
    }

    const downloadDataFile =async (exportType: 'PDF' | 'EXCEL',requestAction: SimpleRequestActions)=>{
        await downloadReport<CriteriaExportReport>(requestActions)(dataReport(exportType))
    }
    const isDownloadForm = props.formKey==ProbationEvaluationRequestFormNames.assessmentPreparation ?true:false
  
    return(  
    <ViewFormWrapper<{ id: number }>
        workflowModel={workflowModel}
        workflowProp={props}
        moreActions= {() => {
          return (isDownloadForm)?[{
              icon: <FilePdfOutlined />, key: 'export-pdf', name: " Download Form",
              action: async () => {                    
                try {                        
                    downloadDataFile('PDF',requestActions)
                } catch (error: any) {
                    message.error(error.message || 'Failed to export data.')
                }
              }
            }]:[]
          }
        }
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
                    <Section1Table editable={false} editableRating={false} editableFormRef={editableFormRef1} addedItems={addedSection1} onSetAddedItems={setAddedSection1} totalScore={probaRequest?.totalScore1}/>
                    {/*---------------------------- SECTION II. JOB KNOWLEDGE AND SKILLS (Weightage: 20%)----------------------------------*/}
                    <div>
                        <div style={{paddingTop:5}}>
                        <div><b>SECTION II. JOB KNOWLEDGE AND SKILLS (Weightage: 20%)</b></div>
                        <div>What relevant knowledge and skills that employee possesses and applies effectively in the job</div>
                        </div>
                    </div>
                    <Section2Card editable={false} editableRating={false} editableFormRef={editableFormRef2} addedItems={addedSection2} onSetAddedItems={setAddedSection2}  totalScore={probaRequest?.totalScore2}/>
                    {/*---------------------------- SECTION III. BEHAVIOR (Weightage: 30%)-------------------------------------------------*/}
                    <div>
                        <div style={{paddingTop:5}}>
                        <div><b>SECTION III. BEHAVIOR (Weightage: 30%)</b></div>
                        <div>How employee is expected to behave in a proper manner.</div>
                        </div>
                    </div>
                    {probaResources&&<Section3Card editable={false} editableRating={false} editableFormRef={editableFormRef3} addedItems={probaResources} onSetAddedItems={setProbaResources}  totalScore={probaRequest?.totalScore3}/>}
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
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {probaRequest?.empAchievement&&<EmpImprovmentTable editable={false} addedItems={probaRequest?.empAchievement.map(it => ({...it,key: uniqueId().toString()}))} />}
                      {probaRequest?.empImprovement&&<EmpImprovmentTable1  editable={false} addedItems={probaRequest?.empImprovement.map(it => ({...it,key: uniqueId().toString()}))} />}
                    </Space>                    
                </ProCard>
                <ProCard title="SUMMARY" 
                  collapsible  
                  size="small"
                  bordered headerBordered 
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{paddingBottom:20}}><b>FINAL SCORE </b> <span style={{paddingRight:20, borderRadius:'9px', padding:'8px', border:'solid 1.5px black'}}><b>{`${formatterQty1.format(probaRequest?.totalScore||0)} / ${formatterQty1.format(probaRequest?.maxScore||0)}`}</b></span> 
                    {/* <Input style={{width:150}} value={`${formatterQty1.format(probaRequest?.totalScore||0)} / ${formatterQty1.format(probaRequest?.maxScore||0)}`} /> */}
                    </div>
                    <div><b>OVERALL PROBATION RATING</b></div>
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
                  </Space>                  
                </ProCard>
            </ProForm>     
        </Spin>)
        }}
    </ViewFormWrapper>)
}