import { DrawerForm, EditableFormInstance, ProCard, SubmitterProps } from "@ant-design/pro-components"
import {AppraisalRemark,  AppraisalEmpSubmissionResult, ValidatorMsg, AppraisalEmpImprovement, AppraisalDataLookup, ProbationEvaluationEmpList, ProbationEvaluationDetailRs, ProbationEvaluationResources, ProbationEvaluation, ProbationEvaluationResourcesSupport } from "../../data.types";
import { useEffect, useRef, useState } from "react";
import { simpleRequestActions } from "@/services/model";
import { Button, Descriptions, Modal, Space, Tag, Typography, message } from "antd";
import { formatDate, toReadable } from "@/pages/utils";
// import DataView from "../data-view";
import { SaveOutlined} from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import { createService } from "../../services";
// import SubmissionInfo from "../SubmissionInfo";
import { Model } from "../../model";
import { uniqueId } from "lodash";
import Status from "@/components/Status";
import InstructionCard from "../InstructionCard";
import RatingScaleCard from "../RatingScaleCard";
import SummaryCard from "../SummaryCard";
import Section1Table from "../Section1Table";
import Section2Card from "../Section2Card";
import Section3Card from "../Section3Card";
import Section4Card from "../Section4Card";
import EmpImprovmentTable from "../EmpImprovmentTable";
import EmpImprovmentTable1 from "../EmpImprovmentTable1";

interface Props{
    probationEmp?: ProbationEvaluationEmpList;
    open?: boolean;
    onOpenModalChange:(v:boolean)=>void;
    refreshTable:()=>void
}

const ProbationEvaluationQuickView=({probationEmp, open, onOpenModalChange, refreshTable}:Props) =>{
   
    const requestActions = simpleRequestActions()
    const srv = createService({ request: requestActions })
   
    const [probaResourcesSupport,setProbaResourcesSupport] = useState<ProbationEvaluationResourcesSupport[]>([])
    const [probaRequest,setProbaRequest] = useState<ProbationEvaluationDetailRs>()
    const [probaResources,setProbaResources] = useState<ProbationEvaluationResources[]>([])
    const [addedSection1, setAddedSection1] = useState<ProbationEvaluation[]>([]);
    const [addedSection2, setAddedSection2] = useState<ProbationEvaluation[]>([]);

    useEffect(()=>{
        loadData()
    },[probationEmp?.instanceId])
    const confirmedStatusList = [
        {status:'CONFIRMED', desc:'Confirmed Probation'},
        {status:'EXTENDED', desc:'Extended Probation Until: '},
        {status:'TERMINATED', desc:'Terminated'}
    ]

    const loadData = async () => {
        if (!probationEmp?.instanceId) return;
        try {       
          const data = await srv.detailByProcessFlow(probationEmp?.instanceId);
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
    }
    
   
    return(<DrawerForm width={'80%'}
        loading={requestActions.request?.loading}
        open={open}
        onOpenChange={onOpenModalChange}       
        title={<Space>
            <div>Probation Evaluation {probationEmp?.empNo}- {probationEmp?.empName}</div>          
        </Space>}
        
        // submitter={submitter}
        submitter={false}
        onFinish={ async (dataForm:any)=> {           
            //  saveSubmitHandler()
           return false
        }}
    ><Space direction="vertical">
        {probationEmp&&<ProCard title="Employee Info" 
                collapsible ={false}  
                size="small"
                bordered headerBordered 
            >                  
            <Descriptions column={5}>
            <Descriptions.Item label='Employee Id'>{probationEmp.empNo} </Descriptions.Item>
            <Descriptions.Item label='Employee Name'>{probationEmp.empName} </Descriptions.Item>
            <Descriptions.Item label='Hired Date'>{probationEmp?.joinedDate&&formatDate(probationEmp?.joinedDate)}</Descriptions.Item>
            

            <Descriptions.Item label='Decision by Line Manager' span={2}>
                {confirmedStatusList.find(v=> v.status==probaRequest?.probationEvaluation?.confirmedStatus)?.desc} {probaRequest?.probationEvaluation?.confirmedStatus==='EXTENDED'? formatDate(probaRequest?.probationEvaluation?.extendedDate):''}
            </Descriptions.Item>           
            <Descriptions.Item label='Function'>{probationEmp.departmentName} </Descriptions.Item>
            <Descriptions.Item label='Company'>{probationEmp.buName}</Descriptions.Item>
            <Descriptions.Item label='Position'>{probationEmp.jobTitle}</Descriptions.Item>

            <Descriptions.Item label='Ref' span={2}>{probaRequest?.probationEvaluation?.ref?.formNo}</Descriptions.Item>


            </Descriptions>
        </ProCard>}
        <InstructionCard/>
        {probaRequest &&<RatingScaleCard probaRequest={probaRequest}/>}
        <ProCard title="PERFORMANCE" 
            collapsible  
            size="small"
            bordered headerBordered 
        >            
            <Section1Table editable={false} editableRating={false}  addedItems={addedSection1}  totalScore={probaRequest?.totalScore1}/>          
            <Section2Card editable={false} editableRating={false}  addedItems={addedSection2} onSetAddedItems={setAddedSection2}  totalScore={probaRequest?.totalScore2}/>            
            {probaResources&&<Section3Card editable={false} editableRating={false}  addedItems={probaResources} onSetAddedItems={setProbaResources}  totalScore={probaRequest?.totalScore3}/>}           
            <Section4Card editable={false} editableRating={false}  addedItems={probaResourcesSupport} onSetAddedItems={setProbaResourcesSupport} />
            <div>
                <div style={{paddingTop:5}}>
                <div><b>SECTION V. ADDITIONAL COMMENTS</b></div>
                <div>What employee has done, their strength, and further development need.</div>
                </div>
            </div>
            <Space direction="vertical" style={{ width: '100%' }}>
                {probaRequest?.empAchievement&&<EmpImprovmentTable editable={false} initDataItems={probaRequest?.empAchievement.map(it => ({...it,key: uniqueId().toString()}))} />}
                {probaRequest?.empImprovement&&<EmpImprovmentTable1  editable={false} initDataItems={probaRequest?.empImprovement.map(it => ({...it,key: uniqueId().toString()}))} />}
            </Space>                    
        </ProCard>
        {probaRequest &&<SummaryCard probaRequest={probaRequest}/>}
    </Space>
    </DrawerForm>)
}
export default ProbationEvaluationQuickView