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
import { formatDate } from "@/pages/utils";
import EmpImprovmentTable1 from "../components/EmpImprovmentTable1";
import EmpImprovmentTable from "../components/EmpImprovmentTable";
import {FilePdfOutlined } from "@ant-design/icons";
import { DownloadData, downloadReport } from "@/services/apiGateway";
import { ProbationEvaluationRequestFormNames } from ".";
import InstructionCard from "../components/InstructionCard";
import RatingScaleCard from "../components/RatingScaleCard";
import SummaryCard from "../components/SummaryCard";

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
    const confirmedStatusList = [
      {status:'CONFIRMED', desc:'Confirmed Probation'},
      {status:'EXTENDED', desc:'Extended Probation Until: '},
      {status:'TERMINATED', desc:'Terminated'}
    ]
    
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
    const isDownloadForm = [ProbationEvaluationRequestFormNames.assessmentPreparation ,ProbationEvaluationRequestFormNames.lineManagerSubmission].find(r=> r== props.formKey)
                          && ['SETTING','PREPARED'].find(r => r==probaRequest?.probationEvaluation?.status)? true:false
    const isPrepareStatus = [ProbationEvaluationRequestFormNames.assessmentPreparation ].find(r=> r== props.formKey)
                          || ['PREPARED'].find(r => r==probaRequest?.probationEvaluation?.status)? true:false                      
  
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
               {probaRequest?.probationEvaluation&&<ProCard title="Employee Info" 
                        collapsible ={false}  
                        size="small"
                        bordered headerBordered 
                    >                  
                   <Descriptions column={5}>
                    <Descriptions.Item label='Employee Id'>{probaRequest?.probationEvaluation.empNo} </Descriptions.Item>
                    <Descriptions.Item label='Employee Name'>{probaRequest?.probationEvaluation.empName} </Descriptions.Item>
                    <Descriptions.Item label='Hired Date'>{probaRequest?.probationEvaluation?.joinedDate&&formatDate(probaRequest?.probationEvaluation?.joinedDate)}</Descriptions.Item>
                    

                    <Descriptions.Item label='Decision by Line Manager' span={2}>
                        {confirmedStatusList.find(v=> v.status==probaRequest?.probationEvaluation?.confirmedStatus)?.desc} {probaRequest?.probationEvaluation?.confirmedStatus==='EXTENDED'? formatDate(probaRequest?.probationEvaluation?.extendedDate):''}
                    </Descriptions.Item>           
                    <Descriptions.Item label='Function'>{probaRequest?.probationEvaluation.departmentName} </Descriptions.Item>
                    <Descriptions.Item label='Company'>{probaRequest?.probationEvaluation.buName}</Descriptions.Item>
                    <Descriptions.Item label='Position'>{probaRequest?.probationEvaluation.jobTitle}</Descriptions.Item>

                    <Descriptions.Item label='Ref' span={2}>{probaRequest?.probationEvaluation?.ref?.formNo}</Descriptions.Item>

                    </Descriptions>
                </ProCard>}
              
                <InstructionCard/>
                {probaRequest &&  <RatingScaleCard probaRequest={probaRequest}/>}
                <ProCard title= {isPrepareStatus?'PERFORMANCE':'EVALUATION' }
                    collapsible  
                    size="small"
                    bordered headerBordered 
                >
                   
                    <Section1Table showRating={!isPrepareStatus} editable={false} editableRating={false} editableFormRef={editableFormRef1} addedItems={addedSection1} onSetAddedItems={setAddedSection1} totalScore={probaRequest?.totalScore1}/>
                    
                    <Section2Card showRating={!isPrepareStatus} editable={false} editableRating={false} editableFormRef={editableFormRef2} addedItems={addedSection2} onSetAddedItems={setAddedSection2}  totalScore={probaRequest?.totalScore2}/>
                    {/*---------------------------- SECTION III. BEHAVIOR (Weightage: 30%)-------------------------------------------------*/}
                   
                    {probaResources&&<Section3Card showRating={!isPrepareStatus} editable={false} editableRating={false} editableFormRef={editableFormRef3} addedItems={probaResources} onSetAddedItems={setProbaResources}  totalScore={probaRequest?.totalScore3}/>}
                    {/*---------------------------- SECTION IV. SUPPORT / RESOURCES NEEDED-------------------------------------------------*/}
                    
                    <Section4Card showRating={!isPrepareStatus} editable={false} editableRating={false} editableFormRef={editableFormRef4} addedItems={probaResourcesSupport} onSetAddedItems={setProbaResourcesSupport} />
                    {/*---------------------------- SECTION V. ADDITIONAL COMMENTS-------------------------------------------------*/}
                    {!isPrepareStatus && <div>
                        <div style={{paddingTop:5}}>
                        <div><b>SECTION V. ADDITIONAL COMMENTS</b></div>
                        <div>What employee has done, their strength, and further development need.</div>
                        </div>
                    </div>}
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {!isPrepareStatus && probaRequest?.empAchievement&&<EmpImprovmentTable editable={false} initDataItems={probaRequest?.empAchievement.map(it => ({...it,key: uniqueId().toString()}))} />}
                      {!isPrepareStatus && probaRequest?.empImprovement&&<EmpImprovmentTable1  editable={false} initDataItems={probaRequest?.empImprovement.map(it => ({...it,key: uniqueId().toString()}))} />}
                    </Space>                
                </ProCard>
                {probaRequest &&<SummaryCard probaRequest={probaRequest} initialValue={{status:probaRequest.probationEvaluation?.confirmedStatus||'', extendedDate: probaRequest.probationEvaluation?.extendedDate}}/>}
                
            </ProForm>     
        </Spin>)
        }}
    </ViewFormWrapper>)
}