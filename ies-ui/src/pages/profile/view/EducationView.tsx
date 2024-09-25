import { Flex, ModalProps, Space, Typography } from "antd" 
import { ModalForm, ProCard, ProTable } from "@ant-design/pro-components"
import { EducationData } from "../data.ess" 
import { EditOutlined,DeleteOutlined } from "@ant-design/icons"
import { formatYear } from "@/pages/utils";

interface Props extends ModalProps {
    // data: BasicContactData;
    oldData: EducationData[];
    newData: EducationData[];
    essProfileId: number;
    isAdmin:number;
    step:number;
    cb:{ //used callback function to parent form
        onOpenEditForm: (data:EducationData,type:string) => void; 
        onDelete: (data:EducationData) => void;  
    };
}

export default ( {oldData,newData,essProfileId,isAdmin,step,cb, ...rest}: Props) => {  

    var lng = ["N/A","Khmer" ,"English","Chineses","Thai","Janpanese","Vietnamese"];  
    var dg = ["N/A","Primary school" ,"Secondary school","Higher school","Associate degree","Bachelor degree","Master degree","Phd"]; 
    return <>
      <ModalForm title = "View education edit" {...rest} width={'90%'} submitter={false} > 
        <Space direction={"vertical"} style={{width:'100%'}}>
            <ProCard bordered>
                <Typography.Title level={5}>Existing Data Modified </Typography.Title> 
                {/* existing data */} 
                <ProTable<EducationData>
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
                            title: "Degree", dataIndex: "degreeName"
                        },{
                            title: "Major/Subject", dataIndex: "majorName"
                        },{
                            title: "Education Institution", dataIndex: "educationCenter"
                        },{
                            title: "Country of Education Institution", dataIndex: "countryEducationCenterName" 
                        },{
                            title: "Year", render: (_, r) => {return formatYear(r.fromYear)+" - "+ formatYear(r.toYear)}
                        },{
                            title: "Status", dataIndex: "statusName" 
                        },{   width: '70px',
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
            {/*  */}
            <ProCard bordered>
                <Typography.Title level={5}>New Records Added </Typography.Title> 
                {/* existing data */} 
                <ProTable<EducationData>
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
                            title: "Degree", dataIndex: "degreeName"
                        },{
                            title: "Major/Subject", dataIndex: "majorName"
                        },{
                            title: "Education Institution", dataIndex: "educationCenter"
                        },{
                            title: "Country of Education Institution", dataIndex: "countryEducationCenterName" 
                        },{
                            title: "Year", render: (_, r) => {return formatYear(r.fromYear)+" - "+ formatYear(r.toYear)}
                        },{
                            title: "Status", dataIndex: "statusName" 
                        },{   width: '70px',
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