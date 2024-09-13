import { ActionType, ProList } from "@ant-design/pro-components"
import { ReminderCreate, ReminderDTO } from "./data"
import { simpleRequestActions } from "@/services/model"
import { useRef, useState } from "react";
import { ReminderServiceAPI } from "./service";
import { formatDate } from "@/pages/utils";
import { Button, Flex, Modal, Tag } from "antd";
import { convertDuration } from "../core";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import ReminderModalForm from "./ModalFormEntry";
import moment from "moment";

interface Props{
    documentId?:number;
}
export default ({ documentId}:Props) =>{
    const requestAction = simpleRequestActions();
    const actionRef =  useRef<ActionType>();
    const services = ReminderServiceAPI(requestAction);
    const [state, setState] = useState<{
        visible?:{
            name:"MODAL";
            type:"ADD"|"EDIT";
            payloads?:ReminderDTO;
        }
    }>();
    return (
        <>
            <ProList<ReminderDTO>
                actionRef={actionRef}
                headerTitle={documentId?"":"Your Reminder" }
                request={async()=>{
                    if(documentId){
                        const data = await services.list(documentId);
                        return Promise.resolve({
                            data:data,
                            success:true
                        })
                    }else{
                        const data =await  services.page({
                            criteria:{
                                searchValue:""
                            }
                        });
                        return Promise.resolve({
                            data:data.items,
                            success:true
                        })
                    }
                }}
                metas={{
                    title:{
                       render:(_,r)=>(<>{r.title}</>)
                    },
                    description:{
                        render:(_,r)=>{
                            return (<p>{r.command}</p>)}
                    },
                    content:{
                        render:(_,r)=>{
                            return (<>
                            <Flex vertical  >
                                <span>Expire :{formatDate(r.reminderDate)}</span>
                                <Tag color={moment(r.reminderDate)?.diff(moment())>0?"processing":"error"} bordered={false} style={{display:"contents"}} >{convertDuration(r.reminderDate)}</Tag>
                            </Flex>
                        </>)}
                    },
                    subTitle:{
                        render:(_,r)=>(<>
                            <Tag color="cyan"  bordered={false}  >{r.type}</Tag>
                        </>)
                    },
                    actions:{
                        render:(_,r)=>[
                            <Button type="link" icon={<DeleteOutlined/>} danger 
                                onClick={()=>{
                                    Modal.confirm({
                                        title:"Delete Reminder",
                                        content:"are you sure? Delete this reminder can not be restore.",
                                        onOk:()=>{
                                            services.delete(r.id);
                                            actionRef.current?.reload?.();
                                        }
                                    });
                                }}
                            >Delete</Button>,
                            <Button type="link" icon={<EditOutlined/>} onClick={()=>setState({visible:{name:"MODAL",type:"EDIT", payloads:r}})} >Edit</Button>
                        ]
                    }
                }}
            />
            <ReminderModalForm
                open={state?.visible?.name==="MODAL"}
                data={state?.visible?.payloads}
                onSave={(data:ReminderCreate)=>{
                    const entry ={
                        id:state?.visible?.payloads?.id,
                        ...data,
                    }
                    services.save(entry);
                    actionRef.current?.reloadAndRest?.();
                    setState((v)=>({...v,visible:undefined}))
                }}
                onCancel={()=>setState((v)=>({...v,visible:undefined}))}
            />
        </>
    )
}