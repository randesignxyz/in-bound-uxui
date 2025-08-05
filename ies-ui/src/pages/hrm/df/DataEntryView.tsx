import RequestorComp from "@/pages/process-flow/components/Requestor";
import Requestor from "@/pages/process-flow/components/Requestor";
import DF360Sumbitter from "@/pages/process-flow/components/Submitter/DF360Sumbitter";
import Sumbitter from "@/pages/process-flow/components/Submitter/Sumbitter";
import { EditableFormInstance, EditableProTable, FooterToolbar, ProCard, ProForm } from "@ant-design/pro-components";
import { Button, Flex, message, Modal, Space, Spin } from "antd";
import { useForm } from "antd/es/form/Form";
import { Moment } from "moment";
import { useInView } from "react-intersection-observer";
import { AssessorFD, DF360Playload } from "./data";
import AssessorList from "./components/AssessorList";
import { useEffect, useRef, useState } from "react";
import { uniqueId } from "lodash";
import { Df360EmpServiceAPI } from "./services";

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
  type: 'CREATE' | 'EDIT';
  onCloseTab?: () => void;
   readOnly?: boolean | undefined,
})=>{
    const services = Df360EmpServiceAPI()
    const { ref, inView } = useInView({});
    const [formSubmittor] = useForm<DataFormType>();
    const editableManagerFormRef = useRef<EditableFormInstance>();
    const editablePeerFormRef = useRef<EditableFormInstance>();
    const editableSubordinateFormRef = useRef<EditableFormInstance>();
    const [managerItems, setManagerItems] = useState<AssessorFD[]>([])
    const [peerItem, setPeerItem] = useState<AssessorFD[]>([])
    const [subordinateItem, setSubordinateItem] = useState<AssessorFD[]>([])

    const [managers, setManagers]  = useState<AssessorFD[]>([])
    const [peers, setPeers] = useState<AssessorFD[]>([])
    const [subordinates, setSubordinates] = useState<AssessorFD[]>([])

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
        // setManagers(initData.map(r=> {return {...r,key: uniqueId().toString()}}))  
        setManagers(initData)
        setPeers(initData.map(r=> ({...r,key: uniqueId().toString()})))
        setSubordinates(initData.map(r=> ({...r,key: uniqueId().toString()})))
    },[])

    const onChangeSubmitterHandler = async (data: any) => {      
       setManagerItems([])
       setPeerItem([])
       setSubordinateItem([])
    }
    const onCloseHandler = () => { 
        // if(type=='CREATE') {
        //     onCloseTab?.()
        // }else{

        // }
        onCloseTab?.()
    }
    const onSubmitHandler = async () => {
        const submitter = await formSubmittor.validateFields()     
        if(!submitter) return
        const validManagerItems = await editableManagerFormRef.current?.validateFields()
        const validPeerItem = await editablePeerFormRef.current?.validateFields()
        const validSubordinateItem = await editableSubordinateFormRef.current?.validateFields()
        if(!validManagerItems || !validPeerItem || !validSubordinateItem) return       
        if(managerItems.length==0 || peerItem.length==0 || subordinateItem.length==0){
            message.warning('Assessor is required')
        }else{           
            const data = {
                empId: submitter.requestorId,
                buId: submitter.requestorBuId,
                managers: managerItems?.map(it => it.empId),
                peers: peerItem?.map(it => it.empId),
                subordinates: subordinateItem?.map(it => it.empId)
            } as DF360Playload
            console.log('data ', data);
            Modal.confirm({
                title: 'Submit 360 Degree Feedback Form',
                content: 'Are you sure?',
                onOk: async () => {
                    try {
                        await services.createDf360Form(data)
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
                <DF360Sumbitter onlyCurrentUser={false}
                    form={formSubmittor}
                    title={<div>Employee</div>}
                    onSetSubmitter={onChangeSubmitterHandler}
                />
                <ProCard size="small"                  
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
                </ProCard>
           </Space>            
        </ProForm>
    </Spin></div>)

}