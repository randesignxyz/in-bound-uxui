import LibraryModalEntry from "./LibraryModalEntry"
import { simpleRequestActions } from "@/services/model"
import { useRef, useState } from "react"
import { LibraryCreate, LibraryDTO } from "./data"
import { LibraryServiceAPI } from "./service"
import { ActionType, ProTable } from "@ant-design/pro-components"
import { Button, Dropdown, MenuProps, message } from "antd"
import { ArrowRightOutlined, EditOutlined, EllipsisOutlined, PlusOutlined } from "@ant-design/icons"
import FolderEntryForm from "@/pages/dms/folder/EntryForm"
import { FolderCreate } from "@/pages/dms/folder/data"
import { FolderServiceAPI } from "@/pages/dms/folder/service"

interface Props{
    actionKey?:string
}

export default ({actionKey, ...props}:Props) =>{

    const requestAction = simpleRequestActions();
    const actionRef = useRef<ActionType>();
    const services = FolderServiceAPI(requestAction);

    const [state, setState] = useState<{
        visible?:{
            name:"MODAL";
            type?:"ADD"|"EDIT";
            payload?:{
                data:LibraryDTO;
            }
        }
    }>();

    const items = ():MenuProps["items"] =>[
        {
            key:"view",
            label:"View",
            itemIcon:<ArrowRightOutlined/>
        },
        {
            key:"rename",
            label:"Rename",
            itemIcon:<EditOutlined/>
        },
      
    ]


    return (
        <>
            <ProTable<LibraryDTO>
                search={false}

                toolBarRender={()=>[
                    <Button 
                        icon={<PlusOutlined/>} 
                        type="link" 
                        onClick={()=>setState({visible:{name:"MODAL", type:"ADD"}})}
                    />
                ]}
                options={
                    {
                        search:true,
                        reload:true,
                        density:false,
                        setting:false,
                    }
                }
                columns={[
                    {
                        title:"Name",
                        dataIndex:"name"
                    },
                    {
                        title:"Type",
                        dataIndex:"type"
                    },
                    {
                        title:"location",
                        dataIndex:"location"
                    },
                    {
                        title:"Department",
                        render:(_,r)=>r.department?.name
                    },
                    {
                        title:"created",
                        dataIndex:"createdBy"
                    },
                    {
                        title:"modified",
                        dataIndex:"createdDate",
                        valueType:"date"
                    },
                    {
                        render:(_,r)=>(<>
                            <Dropdown
                                menu={{
                                    items:items(),
                                    style:{
                                        width:200
                                    }
                                }}
                            >
                                <a><EllipsisOutlined/></a>
                            </Dropdown>
                        </>)
                    }
                ]}
                actionRef={actionRef}
                request={async()=>{
                    const dataList = await services.page({
                        criteria:{
                            searchValue:"",
                            advanceSearch:{
                                code:"LIBRARY"
                            }
                        }
                    });
                    return dataList.items
                }}
               
            />

            <FolderEntryForm
                open={state?.visible?.name==="MODAL"}
                onCancel={()=>setState(v=>({...v, visible:undefined}))}
                code="LIBRARY"            
                onSave={async(data:FolderCreate)=>{
                    FolderServiceAPI(requestAction).save(data);
                }}
            />

            {/* <LibraryModalEntry
                open={state?.visible?.name==="MODAL"}
                onCancel={()=>setState(v=>({...v, visible:undefined}))}
                isAdmin
                onSave={async(data:LibraryCreate)=>{
                    const response = await LibraryServiceAPI(requestAction).save(data) as ({
                        data:string;
                        message:string;
                    });
                    message.success("Success")
                    actionRef.current?.reloadAndRest?.();
                
                }}

            /> */}
        </>
    )
}