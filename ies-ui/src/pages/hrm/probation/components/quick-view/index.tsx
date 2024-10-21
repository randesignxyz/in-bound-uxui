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
            <Descriptions column={3}>
            <Descriptions.Item label='Employee Id'>{probationEmp.empNo} </Descriptions.Item>
            <Descriptions.Item label='Employee Name'>{probationEmp.empName} </Descriptions.Item>
            <Descriptions.Item label='Hired Date'>{probationEmp?.joinedDate&&formatDate(probationEmp?.joinedDate)}</Descriptions.Item>

            <Descriptions.Item label='Position'>{probationEmp.jobTitle}</Descriptions.Item>
            <Descriptions.Item label='Function'>{probationEmp.departmentName} </Descriptions.Item>
            <Descriptions.Item label='Company'>{probationEmp.buName}</Descriptions.Item>

            </Descriptions>
        </ProCard>}
        <InstructionCard/>
        {probaRequest &&<RatingScaleCard probaRequest={probaRequest}/>}
        <ProCard title="EVALUATION" 
            collapsible  
            size="small"
            bordered headerBordered 
        >
            {/* <div>
                <span>Please choose rating of each criterion that describes best of your employee’s performance compares to the job expectations and goals/work priorities.</span>
                <div style={{paddingTop:5}}>
                <div><b>SECTION I. PERFORMANCE (Weightage: 50%)</b></div>
                <div>What employee is expected to do/achieved during probation period.</div>
                <div><span style={{color:'red'}}>*</span> At least 3 items are required.</div>
                </div>
            </div> */}
            <Section1Table editable={false} editableRating={false}  addedItems={addedSection1}  totalScore={probaRequest?.totalScore1}/>
            {/*---------------------------- SECTION II. JOB KNOWLEDGE AND SKILLS (Weightage: 20%)----------------------------------*/}
            {/* <div>
                <div style={{paddingTop:5}}>
                <div><b>SECTION II. JOB KNOWLEDGE AND SKILLS (Weightage: 20%)</b></div>
                <div>What relevant knowledge and skills that employee possesses and applies effectively in the job</div>
                </div>
            </div> */}
            <Section2Card editable={false} editableRating={false}  addedItems={addedSection2} onSetAddedItems={setAddedSection2}  totalScore={probaRequest?.totalScore2}/>
            {/*---------------------------- SECTION III. BEHAVIOR (Weightage: 30%)-------------------------------------------------*/}
            {/* <div>
                <div style={{paddingTop:5}}>
                <div><b>SECTION III. BEHAVIOR (Weightage: 30%)</b></div>
                <div>How employee is expected to behave in a proper manner.</div>
                </div>
            </div> */}
            {probaResources&&<Section3Card editable={false} editableRating={false}  addedItems={probaResources} onSetAddedItems={setProbaResources}  totalScore={probaRequest?.totalScore3}/>}
            {/*---------------------------- SECTION IV. SUPPORT / RESOURCES NEEDED-------------------------------------------------*/}
            {/* <div>
                <div style={{paddingTop:5}}>
                <div><b>SECTION IV. SUPPORT / RESOURCES NEEDED</b></div>
                <div>What Line Manager provides/facilitates employee during probation period.</div>
                </div>
            </div> */}
            <Section4Card editable={false} editableRating={false}  addedItems={probaResourcesSupport} onSetAddedItems={setProbaResourcesSupport} />
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
        {probaRequest &&<SummaryCard probaRequest={probaRequest}/>}
    </Space>
    </DrawerForm>

    )
}
export default ProbationEvaluationQuickView