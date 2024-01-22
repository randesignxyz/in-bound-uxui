import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { ActionType, ProList } from "@ant-design/pro-components"
import { Button, Input } from "antd";
import { useEffect, useRef, useState } from "react";
import DocumentTypeModalForm from "./DocumentTypeModalForm";
import { DocumentTypeServiceAPI } from "./service";
import { simpleRequestActions } from "@/services/model";
import { Modal, message } from "antd/lib";

interface Props{
    actionKey?:string
}

export default ({ actionKey }:Props) =>{
    const actionRef = useRef<ActionType>();
    const requestAction = simpleRequestActions();
    const services = DocumentTypeServiceAPI(requestAction);
    const [dataSource, setDataSource] = useState<DocumentTypeDTO[]>([]);
    const [state, setState] = useState<{
        visible?:{
            name:"MODAL";
            type:"ADD" |"EDIT";
            payload?:DocumentTypeDTO;
        }
    }>();

    const onLoad =async()=>{
        const data =await services.page({
            criteria:{
                searchValue:"",

            }
        });

        setDataSource(data.items);
    }
    

    useEffect(()=>{
        onLoad()
    }, [actionKey]);
    return (
        <>
           <ProList<DocumentTypeDTO>
                actionRef={actionRef}
                headerTitle={
                    <>
                        <Input />
                    </>
                }

                dataSource={dataSource}
                
                toolBarRender={() => [
                    <Button
                        type="link"
                        onClick={()=>setState({visible:{name:"MODAL", type:"ADD"}})}
                        icon={<PlusOutlined />}/>,
                        <Button
                            type="link"
                            onClick={()=>onLoad()}
                            icon={<ReloadOutlined/>}
                        />
                    
                ]}

                metas={{
                    title: {
                        dataIndex: "name"
                    },
                    subTitle: {
                        dataIndex: "status"
                    },
                    type: {},
                   
                    content: {

                    },
                   
                }}

            />


            <DocumentTypeModalForm
                open={state?.visible?.name=="MODAL"}
                onCancel={()=>setState((v)=>({...v,visible:undefined}))}
                onSave={(data:DocumentTypeCreate)=>{
                    Modal.confirm({
                        title:"Save Document Type",
                        content:"Are you sure",
                        onOk: async()=>{
                            services.save(data);
                            actionRef.current?.reloadAndRest?.();
                            message.success("Success");
                            setState({visible:undefined})
                        }
                    })
                }}
            />
        </>
    )
}