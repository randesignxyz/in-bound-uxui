import { Flex, ModalProps, Space, Typography } from "antd" 
import { ModalForm, ProCard, ProTable } from "@ant-design/pro-components"
import { TrainingData } from "../data.ess" 
import { EditOutlined,DeleteOutlined } from "@ant-design/icons"
import { formatMonth, formatYear } from "@/pages/utils";

interface Props extends ModalProps {
    // data: BasicContactData;
    oldData:TrainingData[],
    newData:TrainingData[],
    essProfileId: number;
    isAdmin:number;
    cb:{ //used callback function to parent form
        onOpenEditForm: (data:TrainingData,type:string) => void;  
        onDelete: (data:TrainingData) => void;  
    };
}

export default ( {oldData,newData,essProfileId,isAdmin,cb, ...rest}: Props) => {   
     
    return <>
      <ModalForm title = "View training edit" {...rest} width={'90%'} submitter={false} > 
        <Space direction={"vertical"} style={{width:'100%'}}>
            <ProCard bordered>
                <Typography.Title level={5}>Existing Datas Modified </Typography.Title> 
                {/* existing data */} 
                <ProTable<TrainingData> bordered
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
                            title: "Courses", dataIndex: "trainingCourse"
                        },{
                            title: "Institution", dataIndex: "institution"
                        },{
                            title: "In Year", 
                            dataIndex: "year",
                            render:(_, r) => {
                                return formatMonth(r.year)
                            }
                        },{
                            title: "Description", dataIndex: "description"
                        },{   
                            width: '70px',
                            render: (_, r) => { 
                                return ( <Flex vertical={false} justify='space-between'>
                                    <a style={{display: isAdmin==0?'':'none'}} title="Edit item" 
                                        onClick={() => {
                                                cb.onOpenEditForm(r,"EDIT"); 
                                            }
                                        }>
                                        <EditOutlined />
                                    </a>  
                                </Flex>
                                );
                            },
                        } 
                    ]}
                />
            </ProCard>
            <ProCard bordered>
                <Typography.Title level={5}>New Records Added</Typography.Title> 
                {/* existing data */} 
                <ProTable<TrainingData> bordered
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
                            title: "Courses", dataIndex: "trainingCourse"
                        },{
                            title: "Institution", dataIndex: "institution"
                        },{
                            title: "In Year", 
                            dataIndex: "year",
                            render:(dom, r) => {
                                return formatMonth(r.year)
                            }
                        },{
                            title: "Description", dataIndex: "description"
                        },{   
                            width: '70px',
                            render: (_, r) => {
                                return ( <Flex vertical={false} justify='space-between'>
                                    <a style={{display: isAdmin==0?'':'none'}} title="Edit item" 
                                        onClick={() => {
                                            cb.onOpenEditForm(r,"ADD");
                                        }
                                    }>
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