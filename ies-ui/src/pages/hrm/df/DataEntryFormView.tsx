import { EditableFormInstance, FooterToolbar, ProCard, ProForm } from "@ant-design/pro-components";
import { Button, Descriptions, message, Modal, Space, Spin } from "antd";
import { useForm } from "antd/es/form/Form";
import { useInView } from "react-intersection-observer";
import { DF360EmpDetailRs,  DF360UpdatePlayload, DfComment, DfCommentRs, DfEmpEvaluationRs } from "./data";
import { useEffect, useRef, useState } from "react";
import { uniqueId } from "lodash";
import { Df360EmpServiceAPI } from "./services";
import { formatDate } from "@/pages/utils";
import InstructionCard from "./components/InstructionCard";
import StatementTable from "./components/StatementTable";
import CommentTable from "./components/commentTable";


type DataFormType = {
   requestorId: number;
   requestorBuId: number;
};

export default({
  id,
  type,
  onCloseTab,
  readOnly
}:{
  id?: number;
  type: 'VIEW' | 'EDIT';
  onCloseTab?: () => void;
   readOnly?: boolean | undefined,
})=>{
    const services = Df360EmpServiceAPI()
    const { ref, inView } = useInView({});
    const [formSubmittor] = useForm<DataFormType>();
    const [statement, setStatement] = useState<DfEmpEvaluationRs[]>([]);
    const editableFormRef = useRef<EditableFormInstance>();
    const editableStrengthFormRef = useRef<EditableFormInstance>();
    const editableImprovementFormRef = useRef<EditableFormInstance>();
    const [dataStrength, setDataStrength] = useState<DfComment[]>([])
    const [dataImprovement, setDataImprovement] = useState<DfComment[]>([])
    const [data, setDate] = useState<DF360EmpDetailRs>()

    const initData = [
        {
            key: uniqueId().toString(),
            empId: 1,
            empNo: '002136',
            empName: 'Hay sokhom(00213)' 
        },
        {
            key: uniqueId().toString(),
            empId: 2,
            empNo: '002137',
            empName: 'Nob Sreynan(00215)' 
        }
    ]
        
    useEffect(()=> {
        // setManagers(initData)
        // setPeers(initData.map(r=> ({...r,key: uniqueId().toString()})))
        // setSubordinates(initData.map(r=> ({...r,key: uniqueId().toString()})))
        services.detail(id||0).then(r=>{
            setDate(r)
            setStatement((r?.statementEvaluations||[]).map(it=>({...it,key: uniqueId().toString()})))
        })
    },[])

    // const onChangeSubmitterHandler = async (data: any) => {      
    //    setManagerItems([])
    //    setPeerItem([])
    //    setSubordinateItem([])
    // }
    const onCloseHandler = () => { 
        onCloseTab?.()
    }
    const onSubmitHandler = async () => {
        const submitter = await formSubmittor.validateFields()  
        const editable1 = await editableStrengthFormRef.current?.validateFields()
        const editable2 = await editableImprovementFormRef.current?.validateFields() 
        const improList: DfComment[] = Object.values(editable1)  
        console.log('',dataImprovement)

        if(!submitter) return        
        const section1Valid = statement.filter(r =>(
            (r.rating1==0 && r.rating2==0 && r.rating3==0 && r.rating4==0 && r.rating5==0) || 
            (r.rating1==undefined && r.rating2==undefined && r.rating3==undefined && r.rating4==undefined && r.rating5==undefined)
        ))
        
        if(section1Valid.length>0) {
            message.error("EVALUATION: The rating of each statement is required.")
            await editableFormRef.current?.validateFields()
            return
       }else{
            const comments1:DfCommentRs[] =[]
            comments1.push(...dataImprovement.map((i,index)=>({
                id: i.id,
                dfEmpAssessorId: data?.assessor.id,
                comment: i.comment,
                seqNo: index+1  ,
                type: 'c1'
            } as DfCommentRs)))
            comments1.push(
                ...dataImprovement.map((i,index)=>({
                    id: i.id,
                    dfEmpAssessorId: data?.assessor.id,
                    comment: i.comment,
                    seqNo: index+1,
                    type: 'c2'
                } as DfCommentRs))
            )
            // const statement = Object.values(editable)      
            const payload = {
                id: id,
                dfEmpAssessorId: data?.assessor.id,
                statements: statement.map(it=>({
                    id: it.id,
                    dfEmpAssessorId: it.dfEmpAssessorId,
                    dfStatementId: it.dfStatementId,
                    dfStatementGroupId: it.dfStatementGroupId,
                    rating1: it.rating1,
                    rating2: it.rating2,
                    rating3: it.rating3,
                    rating4: it.rating4,
                    rating5: it.rating5,
                    seqNo: it.seqNo                    
                } as DF360UpdatePlayload)),
                comments: comments1           
            } as DF360UpdatePlayload
            console.log('data ', payload);

            Modal.confirm({
                title: 'Submit 360 Degree Feedback Form',
                content: 'Are you sure?',
                onOk: async () => {
                    try {
                        await services.draftEvaluation(payload)
                        message.success('Submitted successfully.');
                        // onCloseTab?.()
                    } catch (error: any) {
                        message.error(error.message || 'Failed to submit 360 degree feedback form.');
                    }
                },
            });
        }
    }

    return(<div ref={ref}><Spin spinning={false} >
        <ProForm dir="vertical"
            submitter={{
                render: () => 
                inView && !readOnly ?<FooterToolbar>
                    <Button
                        onClick={() => {onCloseHandler();}}
                    >
                       Close
                    </Button>
                    <Button
                        onClick={onSubmitHandler}
                    >
                    Submit
                    </Button>      
                    {/* {type=='EDIT' && <Button
                        // onClick={() => {onSubmitHandler();}}
                    >
                        Submit
                    </Button> } */}
                </FooterToolbar> : <></>
            }}  
        >
           <Space direction="vertical" style={{ width: '100%' }}>
                {/* <DF360Sumbitter onlyCurrentUser={false}
                    form={formSubmittor}
                    title={<div>Employee</div>}
                    onSetSubmitter={onChangeSubmitterHandler}
                /> */}
                <ProCard size="small" headerBordered title="Employee Infomation">
                    <Descriptions>
                        <Descriptions.Item label="Employee ID" style={{ fontWeight: 'bolder' }}>{data?.empNo}</Descriptions.Item>
                        <Descriptions.Item label="Employee Name" style={{ fontWeight: 'bolder' }}>{data?.empName}</Descriptions.Item>
                        <Descriptions.Item label="Hired Date" style={{ fontWeight: 'bolder' }}>{formatDate(data?.hiredDate)}</Descriptions.Item>
                        <Descriptions.Item label="Position" style={{ fontWeight: 'bolder' }}>{data?.jobTitle}</Descriptions.Item>
                        <Descriptions.Item label="Function" style={{ fontWeight: 'bolder' }}>{data?.deptName}</Descriptions.Item>
                        <Descriptions.Item label="Business Unit" style={{ fontWeight: 'bolder' }}>{data?.buName}</Descriptions.Item>
                    </Descriptions>
                </ProCard>
                <InstructionCard/>
                <ProCard size="small"                  
                    headerBordered
                    title= "EVALUATION"
                >
                    {data?.statementEvaluations && <StatementTable 
                        items={statement} 
                        editableFormRef={editableFormRef}
                        editable={true} 
                        editableRating={true}
                        onSetItems={setStatement}
                    />}
                </ProCard>
                <CommentTable title="4.	Please state three (3) good points or strengths of your colleague." 
                    commTitle={'Strength'} 
                    initDataItems={dataStrength} 
                    onSetItems={setDataStrength}
                    editableFormRef={editableStrengthFormRef}  
                    editable
                />
                <CommentTable title="5.	Please state three (3) areas of improvement for your colleague." 
                    commTitle={'Improvement'} 
                    initDataItems={dataImprovement} 
                    onSetItems={setDataImprovement} 
                    editableFormRef={editableImprovementFormRef} 
                    editable
                />
                
                
                {/* <ProCard size="small"                  
                    headerBordered
                    title= {<div>Assessors<span style={{color:'red'}}>*</span></div>}
                >
                    <Flex vertical>
                        <Flex justify="flex-center" gap={25}>
                            <Flex vertical style={{ width: '100%' }}>
                                <AssessorList title="Manager" editableFormRef={editableManagerFormRef} initData={managers} items={managerItems} onSetItems={setManagerItems}/>
                            </Flex>
                            <Flex vertical style={{width:'100%'}}> 
                                <AssessorList title="Peers" editableFormRef={editablePeerFormRef} initData={peers} items={peerItem} onSetItems={setPeerItem}/>
                            </Flex>  
                            <Flex vertical style={{width:'100%'}}>                               
                                <AssessorList title="Subordinates" editableFormRef={editableSubordinateFormRef} initData={subordinates} items={subordinateItem} onSetItems={setSubordinateItem}/>
                            </Flex>  
                        </Flex> 
                    </Flex>               
                </ProCard> */}
           </Space>            
        </ProForm>
    </Spin></div>)

}