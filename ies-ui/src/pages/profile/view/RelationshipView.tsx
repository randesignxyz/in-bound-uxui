import { Flex, ModalProps, Space, Typography } from "antd" 
import { ModalForm, ProCard, ProTable } from "@ant-design/pro-components"
import { RelationshipData } from "../data.ess" 
import { EditOutlined,DeleteOutlined } from "@ant-design/icons"
import { formatDate } from "@/pages/utils";

interface Props extends ModalProps { 
    oldData:RelationshipData[],
    newData:RelationshipData[],
    essProfileId: number;
    isAdmin:number;
    step:number;
    cb:{ //used callback function to parent form
        onOpenEditForm: (data:RelationshipData,type:string) => void;  
        onDelete: (data:RelationshipData) => void;  
    };
}

export default ( {oldData,newData,essProfileId,isAdmin,step,cb, ...rest}: Props) => {  
 
    return <>
      <ModalForm title = "View Family Member Modified" {...rest} width={'90%'} submitter={false} >  
        <Space direction={"vertical"} style={{width:'100%'}}>
        {/* old  */}
        <ProCard bordered> 
        <Typography.Title level={5}>Existing Data Modified </Typography.Title> 
        {/* existing data */} 
        <ProTable<RelationshipData> bordered
            dataSource={oldData}
            search={false}
            pagination={false}
            size='small'
            options={{
                density: false,
                fullScreen: false,
                setting: false,
                reload: false
            }}
            columns={[
                {
                    title: "Full Name", dataIndex: "relationshipName"
                },{
                    title: "Relationship", dataIndex: "typeName"
                },{
                    title: "Occupation", dataIndex: "occupationName"
                },{
                    title: "Date of Birth", dataIndex: "dateOfBirth",
                    render: (dom, r) => {
                        return (formatDate(r.dateOfBirth));
                    },
                },
                // {
                //     title: "Description", dataIndex: "description"
                // },
                {   width: '70px',
                    render: (dom, r) => {
                        return ( <Flex vertical={false} justify='space-between' hidden={step==3?true:false}>
                            <a style={{display: isAdmin==0?'':'none'}}  title="Edit item" 
                                onClick={() => cb.onOpenEditForm(r,"EDIT")}>
                                <EditOutlined />
                            </a>  
                        </Flex>
                        );
                    },
                } 
        ]}
        />
        </ProCard>
        {/* new records */}
        <ProCard bordered>
         <Typography.Title level={5}>New Records Added</Typography.Title> 
        {/* existing data */} 
        <ProTable<RelationshipData> bordered
            dataSource={newData}
            search={false}
            pagination={false}
            size='small'
            options={{
                density: false,
                fullScreen: false,
                setting: false,
                reload: false
            }}
            columns={[
                {
                    title: "Full Name", dataIndex: "relationshipName"
                },{
                    title: "Relationship", dataIndex: "typeName"
                },{
                    title: "Occupation", dataIndex: "occupationName"
                },{
                    title: "Date of Birth", dataIndex: "dateOfBirth",
                    render: (dom, r) => {
                        return (formatDate(r.dateOfBirth));
                    },
                },
                // {
                //     title: "Description", dataIndex: "description"
                // },
                {   width: '70px',
                    render: (dom, r) => {
                        return ( <Flex vertical={false} justify='space-between' hidden={step==3?true:false}>
                            <a style={{display: isAdmin==0?'':'none'}}  title="Edit item" 
                                onClick={() => cb.onOpenEditForm(r,"ADD")}>
                                <EditOutlined />
                            </a>   
                            <a style={{display: isAdmin==0?'':'none', color:'red'}} title="Delete item" 
                                onClick={() => cb.onDelete(r)}>
                                <DeleteOutlined />
                            </a>  
                        </Flex>
                        );
                    },
                }  
        ]}
        />
        </ProCard>
      </Space>
    </ModalForm>
  </>
}