import RequestorComp from "@/pages/process-flow/components/Requestor";
import Requestor from "@/pages/process-flow/components/Requestor";
import DF360Sumbitter from "@/pages/process-flow/components/Submitter/DF360Sumbitter";
import Sumbitter from "@/pages/process-flow/components/Submitter/Sumbitter";
import { EditableFormInstance, EditableProTable, FooterToolbar, ProCard, ProForm } from "@ant-design/pro-components";
import { Button, Descriptions, Flex, message, Modal, Space, Spin } from "antd";
import { useForm } from "antd/es/form/Form";
import { Moment } from "moment";
import { useInView } from "react-intersection-observer";
import { AssessorFD, DF360EmpDetailRs, DF360Playload, DfEmpEvaluationRs } from "./data";
import AssessorList from "./components/AssessorList";
import { useEffect, useRef, useState } from "react";
import { uniqueId } from "lodash";
import { Df360EmpServiceAPI } from "./services";
import { formatDate } from "@/pages/utils";
import InstructionCard from "./components/InstructionCard";
import StatementTable from "./components/StatementTable";


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

    // const editableManagerFormRef = useRef<EditableFormInstance>();
    // const editablePeerFormRef = useRef<EditableFormInstance>();
    // const editableSubordinateFormRef = useRef<EditableFormInstance>();
    // const [managerItems, setManagerItems] = useState<AssessorFD[]>([])
    // const [peerItem, setPeerItem] = useState<AssessorFD[]>([])
    // const [subordinateItem, setSubordinateItem] = useState<AssessorFD[]>([])

    // const [managers, setManagers]  = useState<AssessorFD[]>([])
    // const [peers, setPeers] = useState<AssessorFD[]>([])
    // const [subordinates, setSubordinates] = useState<AssessorFD[]>([])
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
        if(!submitter) return        
        const section1Valid = statement.filter(r =>(
            (r.rating1==0 && r.rating2==0 && r.rating3==0 && r.rating4==0 && r.rating5==0) || 
            (r.rating1==undefined && r.rating2==undefined && r.rating3==undefined && r.rating4==undefined && r.rating5==undefined)
        ))
         console.log(statement, section1Valid)
        // const validManagerItems = await editableManagerFormRef.current?.validateFields()
        // const validPeerItem = await editablePeerFormRef.current?.validateFields()
        // const validSubordinateItem = await editableSubordinateFormRef.current?.validateFields()
        if(section1Valid.length>0) {
            message.error("EVALUATION: The rating of each statement is required.")
            await editableFormRef.current?.validateFields()
            return
       }else{           
            // const data = {
            //     empId: submitter.requestorId,
            //     buId: submitter.requestorBuId,
            //     managers: managerItems?.map(it => it.empId),
            //     peers: peerItem?.map(it => it.empId),
            //     subordinates: subordinateItem?.map(it => it.empId)
            // } as DF360Playload
            console.log('data ', data);
            Modal.confirm({
                title: 'Submit 360 Degree Feedback Form',
                content: 'Are you sure?',
                onOk: async () => {
                    try {
                        // await services.submitDf360Form(data)
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