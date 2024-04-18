import { simpleRequestActions } from "@/services/model"
import { useRef, useState } from "react"
import { ActionType, ProTable } from "@ant-design/pro-components"
import { Button, Dropdown, MenuProps, message } from "antd"
import { ArrowRightOutlined, EditOutlined, EllipsisOutlined, PlusOutlined } from "@ant-design/icons"
import FolderEntryForm from "@/pages/dms/folder/EntryForm"
import { FolderCreate, FolderDTO } from "@/pages/dms/folder/data"
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
                data:FolderDTO;
            }
        }
    }>();

    const items = (record:FolderDTO):MenuProps["items"] =>[
        {
            key:"view",
            label:"View",
            itemIcon:<ArrowRightOutlined/>
        },
        {
            key:"rename",
            label:"Rename",
            itemIcon:<EditOutlined/>,
            onClick:()=>setState({visible:{name:"MODAL",type:"EDIT",payload:{data:record}}})
        },
      
    ]


    return (
        <>
            <ProTable<FolderDTO>
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
                                    items:items(r),
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
                request={async(criteria)=>{
                    const dataList =await  services.page({
                        criteria:{
                            searchValue:criteria.keyword,
                            advanceSearch:{
                                code:"LIBRARY"
                            },
                            
                        }
                    });
                    return Promise.resolve({
                        data:dataList.items,
                        success:true,
                        total:dataList.total
                    })
                }}
               
            />

            <FolderEntryForm
                open={state?.visible?.name==="MODAL"}
                onCancel={()=>setState(v=>({...v, visible:undefined}))}
                code="LIBRARY"        
                libraryData={state?.visible?.payload?.data}    
                onSave={async(data:FolderCreate)=>{
                    FolderServiceAPI(requestAction).save(data);
                    message.success("Success!");
                    actionRef.current?.reload?.();
                    setState({visible:undefined});
                }}
            />
        </>
    )
}