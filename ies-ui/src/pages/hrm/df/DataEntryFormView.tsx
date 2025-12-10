import { CheckCard, EditableFormInstance, FooterToolbar, ProCard, ProForm, ProTable } from "@ant-design/pro-components";
import { Avatar, Button, Card, Col, Descriptions, message, Modal, Row, Space, Spin, Tabs, Tooltip } from "antd";
import { useForm } from "antd/es/form/Form";
import { useInView } from "react-intersection-observer";
import { DF360EmpDetailRs,  DF360SelfCommitmentPlayload,  DF360UpdatePlayload, DfComment, DfCommentRs, DfEmpAssessorRs, DfEmpEvaluationDetailReport, DfEmpEvaluationRs, DfEmpEvaluationSummaryReport, DfEmpStatementDetail, DfInstrunctionItemList } from "./data";
import { useEffect, useRef, useState } from "react";
import { uniqueId } from "lodash";
import { Df360EmpServiceAPI } from "./services";
import { formatDate, formatterQty1, toReadable } from "@/pages/utils";
import InstructionCard from "./components/InstructionCard";
import StatementTable from "./components/StatementTable";
import CommentTable from "./components/commentTable";
import { FilePdfOutlined, UnorderedListOutlined, UserOutlined } from "@ant-design/icons";
import { AppraisalDataLookup } from "../appraisal-submit/data.types";
import { createService } from "../appraisal-submit/services";
import { simpleRequestActions } from "@/services/model";
import { history} from 'umi';
import StatementTableReport from "./components/StatementTableReport";


type DataFormType = {
   requestorId: number;
   requestorBuId: number;
};

export default({
//   items,
//   onSetItems,
  id,
  type,
  onCloseTab,
  readOnly
}:{
//   items: DfEmpEvaluationRs[];
//   onSetItems?: (v: DfEmpEvaluationRs[]) => void;
  id?: number | string;
  type: 'VIEW' | 'EDIT';
  onCloseTab?: () => void;
   readOnly?: boolean | undefined,
})=>{
    const [lang, setLang] = useState<string>('ENG');
    const [activeTab, setActiveTab] = useState<string>("1")
    const [dataLookup, setDataLookup] = useState<AppraisalDataLookup[]>();
    const requestActions = simpleRequestActions();
    const services = Df360EmpServiceAPI();
    const hrAppraisal = createService({ request: requestActions })
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
    const editableFormRef6 = useRef<EditableFormInstance>();
    const [dataStrength, setDataStrength] = useState<DfComment[]>([])
    const [dataImprovement, setDataImprovement] = useState<DfComment[]>([])
    const [dataComment3, setDataComment3] = useState<DfComment[]>([])
    const [dataComment4, setDataComment4] = useState<DfComment[]>([])
    const [dataComment5, setDataComment5] = useState<DfComment[]>([])
    const [dataSeftCommitment, setDataSeftCommitment] = useState<DfComment[]>([])
    const [data, setDate] = useState<DF360EmpDetailRs>()
    const [selectedAssessor, setSelectedAssessor] = useState<DfEmpAssessorRs>()
        
    useEffect(()=> {
        if(!id) return
        if(loading){
            services.detail(id||0).then(r=>{
                setDate(r)
                setSelectedAssessor(r.currentAssessor? r.currentAssessor:r.assessors[0])
                setLoading(false)
            })
        }
    },[loading])
    useEffect(() => {
        hrAppraisal.fetchAppraisalDataLookupList().then((rs) => {setDataLookup(rs);});       
    }, []);
    useEffect(()=>{
        if(selectedAssessor){
            setStatement((selectedAssessor?.statementEvaluations||[]).map(it=>({...it,key: uniqueId().toString()})))
            setDataStrength((selectedAssessor?.comments?.filter(it=>it.type=='C1')||[]).map(it=>({...it,key: uniqueId().toString()})))
            setDataImprovement((selectedAssessor?.comments?.filter(it=>it.type=='C2')||[]).map(it=>({...it,key: uniqueId().toString()})))
            setDataComment3((selectedAssessor?.comments?.filter(it=>it.type=='C3')||[]).map(it=>({...it,key: uniqueId().toString()})))
            setDataComment4((selectedAssessor?.comments?.filter(it=>it.type=='C4')||[]).map(it=>({...it,key: uniqueId().toString()})))
            setDataComment5((selectedAssessor?.comments?.filter(it=>it.type=='C5')||[]).map(it=>({...it,key: uniqueId().toString()})))
            setDataSeftCommitment((selectedAssessor?.comments?.filter(it=>it.type=='C6')||[]).map(it=>({...it,key: uniqueId().toString()})))
        }      
    },[selectedAssessor])

    const getLable = (key: string) => {
        var label = dataLookup?.find((it) => it.code === key);
        return lang == 'KH' ? label?.value1 : label?.value;
    };

    const onChangeAssessor=(v: number) =>{
        if(v>0){
            setSelectedAssessor(data?.assessors.find(it=>(it.id==v))) 
            setActiveTab('1')
        }
    }
    const onCloseHandler = () => { 
        onCloseTab?.()
    }
    const onSubmitHandler = async () => {
        if(activeTab!='1')setActiveTab('1')
        const section1Valid = statement.filter(r =>(
            (r.rating1==0 && r.rating2==0 && r.rating3==0 && r.rating4==0 && r.rating5==0) || 
            (r.rating1==undefined && r.rating2==undefined && r.rating3==undefined && r.rating4==undefined && r.rating5==undefined)
        ))
        
        if(section1Valid.length>0) {
            message.error("EVALUATION: The rating of each statement is required.")
            await editableFormRef.current?.validateFields()
            return
        }else{
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
        
            if(!submitter) return       
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

            Modal.confirm({
                title: 'Submit 360 Degree Feedback Form',
                content: 'Are you sure?',
                onOk: async () => {
                    try {
                        await services.submitEvaluation(payload)
                        message.success('Submitted successfully.');
                        setLoading(true)
                        onCloseTab?.()
                    } catch (error: any) {
                        message.error(error.message || 'Failed to submit 360 degree feedback form.');
                    }
                },
            });
        }
    }
    const onSelfCommitmentHandler = async () => {
        if(activeTab!='2')setActiveTab('2')
        const submitter = await formSubmittor.validateFields()
        if(!submitter) return     
        const editable6 = await editableFormRef6.current?.validateFields() 
        const commList6: DfComment[] = editable6?Object.values(editable6):[]
        if(commList6.length==0) {
             message.error("Self commitment is required.")
            return
        }else{
            const list = commList6.map((i,index)=>({
                id: 0,
                dfEmpAssessorId: selectedAssessor?.id,
                comment: i.comment,
                seqNo: index+1,
                type: 'C6'
            })) 
            const payload = {
                id: id,
                dfEmpAssessorId: selectedAssessor?.id,
                comments: list          
            } as DF360SelfCommitmentPlayload       
            console.log('commitment: ',payload)
            Modal.confirm({
                title: 'Submit Self Commitment',
                content: 'Are you sure?',
                onOk: async () => {
                    try {
                        await services.submitSelfCommitment(payload)
                        message.success('Submitted successfully.');
                        setLoading(true)
                        onCloseTab?.()
                    } catch (error: any) {
                        message.error(error.message || 'Failed to submit self commitment.');
                    }
                },
            });
        }        

    }

    const isReport = selectedAssessor && ['Self','Manager'].some(r=>r==selectedAssessor?.type)
    const isCurrentSelfCommitted = (selectedAssessor?.currentAccess && ['Self'].some(r=>r==selectedAssessor?.type) && !data?.selfCommitted && data?.allSubmitted)? true: false
    const isExternal = () => history.location.pathname.includes("/externa/hrm/df/detail");

    const getKeyPointTitle= ():string | undefined => {
        if('Self'==selectedAssessor?.type)
            return getLable('DF_TITLE_SELF_KEY_POINT')
        else if('Manager'==selectedAssessor?.type)
            return getLable('DF_TITLE_MANAGER_KEY_POINT')
        else if('Peer'==selectedAssessor?.type)
            return getLable('DF_TITLE_PEER_KEY_POINT')
        else if('Subordinate'==selectedAssessor?.type)
         return getLable('DF_TITLE_SUBORDINATE_KEY_POINT')
       else return ''
    }
    const getStrengthTitle= ():string | undefined => {
        if('Self'==selectedAssessor?.type)
            return getLable('DF_TITLE_STRENGTH')
        else if('Manager'==selectedAssessor?.type)
            return getLable('DF_TITLE_STRENGTH_MANAGER')
        else if('Peer'==selectedAssessor?.type)
            return getLable('DF_TITLE_STRENGTH_PEER')
        else if('Subordinate'==selectedAssessor?.type)
         return getLable('DF_TITLE_STRENGTH_SUBORDINATE')
       else return ''
    }
    const getImprovementTitle= ():string | undefined => {
        if('Self'==selectedAssessor?.type)
            return getLable('DF_TITLE_IMPROVEMENT')
        else if('Manager'==selectedAssessor?.type)
            return getLable('DF_TITLE_IMPROVEMENT_MANAGER')
        else if('Peer'==selectedAssessor?.type)
            return getLable('DF_TITLE_IMPROVEMENT_PEER')
        else if('Subordinate'==selectedAssessor?.type)
         return getLable('DF_TITLE_IMPROVEMENT_SUBORDINATE')
       else return ''
    }

    return(<div ref={ref}><Spin spinning={loading} ><Space direction="vertical" style={{ width: '100%' }}>
        {(data?.assessors?.length||0)>1 && <Card title="Assessor Infomation" size="small"
            // extra={<Button icon={<UnorderedListOutlined/>} type='link'  onClick={() => history.push(`/hrm/df/list`)}>360 Degree Feedback List</Button>}
        >
            {/* <Row gutter={20}>
                <Col flex={1}> */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center', // center horizontally
                        flexDirection: 'column',
                        alignItems: 'center',     // center content inside column
                    }}
                >
                    {data?.assessors &&<CheckCard.Group  
                        onChange={v => onChangeAssessor(v?.valueOf() as number)}  value={selectedAssessor?.id} size='small'
                         style={{
                            display: 'inline-flex',  // makes cards wrap but centered
                            flexWrap: 'wrap',
                            gap: '12px',
                            justifyContent: 'center',
                        }}
                    >
                        {data?.assessors.map(r => (<CheckCard size='small' 
                        avatar={
                            <Tooltip title={(['Self'].some(s=>s==r.type) && !data?.selfCommitted && data?.allSubmitted)?'Pending self Commitment':toReadable(r.status || "")} placement="top">
                                <Avatar
                                    style={{ backgroundColor: r.status=='PENDING'?'gray': (['Self'].some(s=>s==r.type) && !data?.selfCommitted && data?.allSubmitted)?'#faad14': '#1677ff' }}
                                    icon={<UserOutlined />}
                                    size="small"                                    
                                />
                            </Tooltip>
                        }
                        key={`assessor-${r.id}`}  title= { r.empNo==''? `${r.type}`:`${r.type} - ${r.empNo}`} description={r.empName}  value={r.id}/>)) }
                    </CheckCard.Group>}
                </div>
                {/* </Col>
            </Row> */}
        </Card>}
        <ProCard size="small" headerBordered title="Employee Infomation"
            // extra={<Button icon={<FilePdfOutlined/>}>Export</Button>}
            extra={isExternal()&&< Button icon={<UnorderedListOutlined/>} type='link'  onClick={() => history.push(`/hrm/df/list`)}>360 Degree Feedback List</Button>}
        >
            <Descriptions>
                <Descriptions.Item label="Employee ID" style={{ fontWeight: 'bolder' }}>{data?.empNo}</Descriptions.Item>
                <Descriptions.Item label="Employee Name" style={{ fontWeight: 'bolder' }}>{data?.empName}</Descriptions.Item>
                <Descriptions.Item label="Hired Date" style={{ fontWeight: 'bolder' }}>{formatDate(data?.hiredDate)}</Descriptions.Item>
                <Descriptions.Item label="Position" style={{ fontWeight: 'bolder' }}>{data?.jobTitle}</Descriptions.Item>
                <Descriptions.Item label="Function" style={{ fontWeight: 'bolder' }}>{data?.deptName}</Descriptions.Item>
                <Descriptions.Item label="Business Unit" style={{ fontWeight: 'bolder' }}>{data?.buName}</Descriptions.Item>
            </Descriptions>
        </ProCard>
        <InstructionCard lang={lang} onChangeLanglauge={()=>{setLang(lang=='ENG'?'KH':'ENG')}} getLableName={getLable}/>
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
                    { isCurrentSelfCommitted && <Button onClick={onSelfCommitmentHandler}>Submit Commitment</Button> }
                </FooterToolbar> : <></>
            }} 
        >
              
        <Tabs onChange={key => setActiveTab(key)} activeKey={activeTab}  style={{marginTop: isReport?0:-30}} >
            <Tabs.TabPane icon={isReport?<UnorderedListOutlined/>:''} tab={isReport?(getLable('DF_TITLE_DETAIL')||''):""} key="1">
                {/* <ProForm dir="vertical"
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
                        {/* </FooterToolbar> : <></> */}
                    {/* }}  */}
                {/* >  */}
                    <ProCard size="small"                  
                        headerBordered
                        title= {getLable( ['Self','Peer','Manager'].some(r=>r==selectedAssessor?.type)?'DF_TITLE_EVALUATION':'DF_TITLE_MANAGER_EVALUATION')}
                    >
                        {selectedAssessor?.statementEvaluations && <StatementTable lang={lang} getLableName={getLable}
                            items={statement} 
                            editableFormRef={editableFormRef}
                            editable={true} 
                            editableRating={selectedAssessor?.currentAccess && selectedAssessor?.status!='SUBMITTED'}
                            onSetItems={setStatement}
                        />}
                    </ProCard>
                     {selectedAssessor && ['Self','Manager','Peer','Subordinate'].some(r=>r==selectedAssessor?.type) && <CommentTable title={getKeyPointTitle()||''} 
                        commTitle={getLable('DF_TBL_MANAGER_KEY_POINT')||''} 
                        initDataItems={dataComment3} 
                        editableFormRef={editableFormRef3}
                        editable={selectedAssessor?.currentAccess && selectedAssessor?.status!='SUBMITTED'}
                    />}
                    {selectedAssessor && ['Self','Peer','Manager'].some(r=>r==selectedAssessor?.type) &&<CommentTable title={getStrengthTitle()||''} 
                        commTitle={getLable('DF_TBL_STRENGTH')||''} 
                        initDataItems={dataStrength} 
                        // onSetItems={setDataStrength}
                        editableFormRef={editableStrengthFormRef1}  
                        editable={selectedAssessor?.currentAccess && selectedAssessor?.status!='SUBMITTED'}
                    />}
                    {selectedAssessor && ['Self','Peer','Manager'].some(r=>r==selectedAssessor?.type) && <CommentTable title={getImprovementTitle()||''}
                        commTitle={getLable('DF_TBL_IMPROVEMENT')||''} 
                        initDataItems={dataImprovement} 
                        // onSetItems={setDataImprovement} 
                        editableFormRef={editableImprovementFormRef2} 
                        editable={selectedAssessor?.currentAccess && selectedAssessor?.status!='SUBMITTED'}
                    />}
                   
                    {selectedAssessor && ['Subordinate'].some(r=>r==selectedAssessor?.type) && <CommentTable title={getStrengthTitle()||''}
                        commTitle={getLable('DF_TBL_IMPROVEMENT')||''}
                        initDataItems={dataComment4} 
                        editableFormRef={editableFormRef4}
                        editable={selectedAssessor?.currentAccess && selectedAssessor?.status!='SUBMITTED'}
                    />}
                    {selectedAssessor && ['Subordinate'].some(r=>r==selectedAssessor?.type) && <CommentTable title={getImprovementTitle()||''} 
                        commTitle={getLable('DF_TBL_IMPROVEMENT')||''} 
                        initDataItems={dataComment5} 
                        editableFormRef={editableFormRef5}
                        editable={selectedAssessor?.currentAccess && selectedAssessor?.status!='SUBMITTED'}
                    />}
                {/* </ProForm> */}
            </Tabs.TabPane>
            {isReport &&<Tabs.TabPane icon={<UnorderedListOutlined/>} tab={getLable('DF_TITLE_REPORT')||''} key="2">
                <>
                    <ProCard collapsible defaultCollapsed={true} size="small" headerBordered title={getLable('DF_TITLE_SECTION1')||''}>
                        <ProTable<DfEmpEvaluationSummaryReport>
                            size="small"
                            search={false}
                            rowKey="id"
                            dataSource={selectedAssessor.summary?.sumEvaluations||[]}
                            pagination={false}
                            options={{
                                density: false,
                                fullScreen: false,
                                reload: false,
                                setting: false,
                            }}
                            columns={[                               
                                { title: getLable('DF_TBL_STATEMENT')||'',dataIndex: lang=='KH'?'title1':'title'},
                                { title: getLable('DF_TBL_SELF')||'', dataIndex: 'avgSelf', render: (text, record) => record.avgSelf==0?'-': formatterQty1.format(record.avgSelf)},
                                { title: getLable('DF_TBL_MANAGER')||'', dataIndex: 'avgManager', render: (text, record) => record.avgManager==0?'-': formatterQty1.format(record.avgManager), hidden: !['Manager'].some(r=>r==selectedAssessor?.type)},
                                { title: getLable('DF_TBL_PEER')||'', dataIndex: 'avgPeer', render: (text, record) => record.avgPeer==0?'-': formatterQty1.format(record.avgPeer), hidden: !['Manager'].some(r=>r==selectedAssessor?.type) },
                                { title: getLable('DF_TBL_SUBORDINATE')||'', dataIndex: 'avgSubordinate', render: (text, record) => record.avgSubordinate==0?'-': formatterQty1.format(record.avgSubordinate), hidden: !['Manager'].some(r=>r==selectedAssessor?.type) },
                                { title: getLable('DF_TBL_OVERALL')||'', dataIndex: 'overall', 
                                    render: (text, record) => <Tooltip title="Exclude self rating">
                                        {record.overall==0?'-': formatterQty1.format(record.overall) }
                                    </Tooltip>
                                },
                            ]}
                        />
                    </ProCard>
                   
                    <ProCard collapsible defaultCollapsed={true} size="small" headerBordered title={getLable('DF_TITLE_SECTION2')||''}>
                        <StatementTableReport lang={lang} keyRating="DF_TBL_SELF" getLable={getLable} item={selectedAssessor.summary?.statementEvaluations?.find(it=>it.type=='Self')}/>
                        {['Manager'].some(r=>r==selectedAssessor?.type) && <StatementTableReport lang={lang} keyRating="DF_TBL_MANAGER" getLable={getLable} item={selectedAssessor.summary?.statementEvaluations?.find(it=>it.type=='Manager')}/>}
                        {['Manager'].some(r=>r==selectedAssessor?.type) && <StatementTableReport lang={lang} keyRating="DF_TBL_PEER" getLable={getLable} item={selectedAssessor.summary?.statementEvaluations?.find(it=>it.type=='Peer')}/>}
                        {['Manager'].some(r=>r==selectedAssessor?.type) && <StatementTableReport lang={lang} keyRating="DF_TBL_SUBORDINATE" getLable={getLable} item={selectedAssessor.summary?.statementEvaluations?.find(it=>it.type=='Subordinate')}/>}                       
                    </ProCard>
                    <ProCard collapsible defaultCollapsed={true} size="small" headerBordered title={getLable('DF_TITLE_SECTION3')||''}>  
                        <CommentTable title="" 
                            commTitle={getLable('DF_TBL_STRENGTH')||''} 
                            initDataItems={(selectedAssessor?.summary?.comments||[]).filter(it=> ['C1','C4'].some(r=>r==it.type)).map(it=>({...it,comment: it.comment,key: uniqueId().toString()}))}                            
                            editable={false}
                        />                     
                        <CommentTable title="" 
                            commTitle={getLable('DF_TBL_IMPROVEMENT')||''} 
                            initDataItems={(selectedAssessor?.summary?.comments||[]).filter(it=> ['C2','C5'].some(r=>r==it.type)).map(it=>({...it,comment: it.comment,key: uniqueId().toString()}))}                           
                            editable={false}
                        />
                    </ProCard>
                    <ProCard collapsible defaultCollapsed={!isCurrentSelfCommitted} size="small" headerBordered title={getLable('DF_TITLE_SECTION4')||''}>                        
                        <CommentTable title="" 
                            commTitle={getLable('DF_TBL_COMMITMENT')||''} 
                            initDataItems={dataSeftCommitment.map(it=>({...it,comment: it.comment,key: uniqueId().toString()}))}                            
                            editableFormRef={editableFormRef6} 
                            editable={isCurrentSelfCommitted||false}
                        />
                    </ProCard>
                </>
            </Tabs.TabPane>}
        </Tabs> 
        </ProForm>       
     </Space> </Spin></div>)

}