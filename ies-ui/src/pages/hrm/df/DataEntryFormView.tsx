import { CheckCard, EditableFormInstance, FooterToolbar, ProCard, ProForm } from "@ant-design/pro-components";
import { Avatar, Button, Card, Col, Descriptions, message, Modal, Row, Space, Spin } from "antd";
import { useForm } from "antd/es/form/Form";
import { useInView } from "react-intersection-observer";
import { DF360EmpDetailRs,  DF360UpdatePlayload, DfComment, DfCommentRs, DfEmpAssessorRs, DfEmpEvaluationRs } from "./data";
import { useEffect, useRef, useState } from "react";
import { uniqueId } from "lodash";
import { Df360EmpServiceAPI } from "./services";
import { formatDate } from "@/pages/utils";
import InstructionCard from "./components/InstructionCard";
import StatementTable from "./components/StatementTable";
import CommentTable from "./components/commentTable";
import { UserOutlined } from "@ant-design/icons";


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
    const services = Df360EmpServiceAPI();
    const [loading,setLoading] = useState(true) 
    const { ref, inView } = useInView({});
    const [formSubmittor] = useForm<DataFormType>();
    const [statement, setStatement] = useState<DfEmpEvaluationRs[]>([]);
    const editableFormRef = useRef<EditableFormInstance>();
    const editableStrengthFormRef1 = useRef<EditableFormInstance>();
    const editableImprovementFormRef2 = useRef<EditableFormInstance>();
    const editableFormRef3 = useRef<EditableFormInstance>();
    const editableFormRef4 = useRef<EditableFormInstance>();
    const editableFormRef5 = useRef<EditableFormInstance>();
    const [dataStrength, setDataStrength] = useState<DfComment[]>([])
    const [dataImprovement, setDataImprovement] = useState<DfComment[]>([])
    const [dataComment3, setDataComment3] = useState<DfComment[]>([])
    const [dataComment4, setDataComment4] = useState<DfComment[]>([])
    const [dataComment5, setDataComment5] = useState<DfComment[]>([])
    const [data, setDate] = useState<DF360EmpDetailRs>()
    const [selectedAssessor, setSelectedAssessor] = useState<DfEmpAssessorRs>()
        
    useEffect(()=> {
        if(!id) return
        if(loading){
            services.detail(id||0).then(r=>{
                setDate(r)
                setSelectedAssessor(r.currentAssessor)
                setLoading(false)
            })
        }
    },[loading])
    useEffect(()=>{
        setStatement((selectedAssessor?.statementEvaluations||[]).map(it=>({...it,key: uniqueId().toString()})))
        setDataStrength((selectedAssessor?.comments?.filter(it=>it.type=='C1')||[]).map(it=>({...it,key: uniqueId().toString()})))
        setDataImprovement((selectedAssessor?.comments?.filter(it=>it.type=='C2')||[]).map(it=>({...it,key: uniqueId().toString()})))
        setDataComment3((selectedAssessor?.comments?.filter(it=>it.type=='C3')||[]).map(it=>({...it,key: uniqueId().toString()})))
        setDataComment4((selectedAssessor?.comments?.filter(it=>it.type=='C4')||[]).map(it=>({...it,key: uniqueId().toString()})))
        setDataComment5((selectedAssessor?.comments?.filter(it=>it.type=='C5')||[]).map(it=>({...it,key: uniqueId().toString()})))
    },[selectedAssessor])

    const onChangeAssessor=(v: number) =>{
        console.log(v);
        if(v>0){
            setSelectedAssessor(data?.assessors.find(it=>(it.id==v))) 
        }
        console.log('assessor: ',data?.assessors.find(it=>(it.id==v)));
    }
    const onCloseHandler = () => { 
        onCloseTab?.()
    }
    const onSubmitHandler = async () => {
        const submitter = await formSubmittor.validateFields()  
        const editable1 = await editableStrengthFormRef1?.current?.validateFields()
        const editable2 = await editableImprovementFormRef2?.current?.validateFields() 
        const editable3 = await editableFormRef3.current?.validateFields() 
        const editable4 = await editableFormRef4.current?.validateFields() 
        const editable5 = await editableFormRef5.current?.validateFields() 
        
        const commList1: DfComment[] = editable1?Object.values(editable1):[] 
        const commList2: DfComment[] = editable2?Object.values(editable2):[] 
        const commList3: DfComment[] = editable3?Object.values(editable3):[]
        const commList4: DfComment[] = editable4?Object.values(editable4):[]
        const commList5: DfComment[] = editable5?Object.values(editable5):[]
        console.log('editableImprovementFormRef',editable1)

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
            const comments:DfCommentRs[] =[]
            
            comments.push(...commList1?.map((i,index)=>({
                id: 0,
                dfEmpAssessorId: selectedAssessor?.id,
                comment: i.comment,
                seqNo: index+1  ,
                type: 'C1'
            } as DfCommentRs)))
            comments?.push(
                ...commList2.map((i,index)=>({
                    id: 0,
                    dfEmpAssessorId: selectedAssessor?.id,
                    comment: i.comment,
                    seqNo: index+1,
                    type: 'C2'
                } as DfCommentRs))
            )
            
            comments?.push(
                ...commList3.map((i,index)=>({
                    id: 0,
                    dfEmpAssessorId: selectedAssessor?.id,
                    comment: i.comment,
                    seqNo: index+1,
                    type: 'C3'
                } as DfCommentRs))
            )
            comments?.push(
                ...commList4.map((i,index)=>({
                    id: 0,
                    dfEmpAssessorId: selectedAssessor?.id,
                    comment: i.comment,
                    seqNo: index+1,
                    type: 'C4'
                } as DfCommentRs))
            )
            comments?.push(
                ...commList5.map((i,index)=>({
                    id: 0,
                    dfEmpAssessorId: selectedAssessor?.id,
                    comment: i.comment,
                    seqNo: index+1,
                    type: 'C5'
                } as DfCommentRs))
            )
            console.log('comments1==================',comments)
            // const statement = Object.values(editable)      
            const payload = {
                id: id,
                dfEmpAssessorId: selectedAssessor?.id,
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
                comments: comments          
            } as DF360UpdatePlayload
            console.log('data ', payload);

            Modal.confirm({
                title: 'Submit 360 Degree Feedback Form',
                content: 'Are you sure?',
                onOk: async () => {
                    try {
                        await services.submitEvaluation(payload)
                        message.success('Submitted successfully.');
                        // onCloseTab?.()
                    } catch (error: any) {
                        message.error(error.message || 'Failed to submit 360 degree feedback form.');
                    }
                },
            });
        }
    }

    return(<div ref={ref}><Spin spinning={loading} >
        <ProForm dir="vertical"
            submitter={{
                render: () => 
                inView && !readOnly ?<FooterToolbar>
                    <Button
                        onClick={() => {onCloseHandler();}}
                    >
                       Close
                    </Button>
                    {selectedAssessor?.currentAccess && selectedAssessor?.status!='SUBMITTED' && type=='EDIT' && <Button
                        onClick={onSubmitHandler}
                    >
                    Submit
                    </Button>}      
                    {/* {type=='EDIT' && <Button
                        // onClick={() => {onSubmitHandler();}}
                    >
                        Submit
                    </Button> } */}
                </FooterToolbar> : <></>
            }} 
        >
           <Space direction="vertical" style={{ width: '100%' }}>
                {(data?.assessors.length||0)>1 && <Card title="Assessor Infomation" size="small">
                    <Row gutter={20}>
                        <Col flex={1}>
                            {data?.assessors &&<CheckCard.Group  onChange={v => onChangeAssessor(v?.valueOf() as number)}  defaultValue={selectedAssessor?.id} size='small'>
                                {data?.assessors.map(r => (<CheckCard size='small' 
                                avatar={
                                    <Avatar
                                        style={{ backgroundColor: '#c2af1f' }}
                                        icon={<UserOutlined />}
                                        size="small"
                                    />
                                }
                                key={`assessor-${r.id}`}  title= {`${r.type} - ${r.empNo}`} description={`${r.empName}`}  value={r.id}/>)) }
                            </CheckCard.Group>}
                        </Col>
                    </Row>                    
                </Card>}
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
                    {selectedAssessor?.statementEvaluations && <StatementTable 
                        items={statement} 
                        editableFormRef={editableFormRef}
                        editable={true} 
                        editableRating={selectedAssessor?.currentAccess && selectedAssessor?.status!='SUBMITTED'}
                        onSetItems={setStatement}
                    />}
                </ProCard>
                {selectedAssessor?.type=='SELF' &&<CommentTable title="4. Please state three (3) good points or strengths of your colleague." 
                    commTitle={'Strength'} 
                    initDataItems={dataStrength} 
                    // onSetItems={setDataStrength}
                    editableFormRef={editableStrengthFormRef1}  
                    editable={selectedAssessor?.currentAccess && selectedAssessor?.status!='SUBMITTED'}
                />}
                {selectedAssessor?.type=='SELF' && <CommentTable title="5. Please state three (3) areas of improvement for your colleague." 
                    commTitle={'Improvement'} 
                    initDataItems={dataImprovement} 
                    // onSetItems={setDataImprovement} 
                    editableFormRef={editableImprovementFormRef2} 
                    editable={selectedAssessor?.currentAccess && selectedAssessor?.status!='SUBMITTED'}
                />}
                {selectedAssessor?.type=='Manager' && <CommentTable title="4. Please state three (3) key points that you would like the management to help achieve the company's goals or strategies." 
                    commTitle={'Key Point'} 
                    initDataItems={dataComment3} 
                    // onSetItems={setDataImprovement} 
                    editableFormRef={editableFormRef3}
                    editable
                />}
                {selectedAssessor?.type=='Manager' && <CommentTable title="5. Please state three (3) good points or strengths of your line manager" 
                    commTitle={'Good Point'} 
                    initDataItems={dataComment4} 
                    // onSetItems={setDataImprovement} 
                    editableFormRef={editableFormRef4}
                    editable={selectedAssessor?.currentAccess && selectedAssessor?.status!='SUBMITTED'}
                />}
                {selectedAssessor?.type=='Manager' && <CommentTable title="6. Please state three (3) areas of improvement for your line manager." 
                    commTitle={'Improvement'} 
                    initDataItems={dataComment5} 
                    // onSetItems={setDataImprovement} 
                    editableFormRef={editableFormRef5}
                    editable={selectedAssessor?.currentAccess && selectedAssessor?.status!='SUBMITTED'}
                />}
           </Space>            
        </ProForm>
    </Spin></div>)

}