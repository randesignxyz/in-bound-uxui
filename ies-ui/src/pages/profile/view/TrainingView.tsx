import { Flex, ModalProps, Space, Typography } from "antd" 
import { ModalForm, ProTable } from "@ant-design/pro-components"
import { TrainingData } from "../data.ess" 
import { EditOutlined,DeleteOutlined } from "@ant-design/icons"

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
        <Typography.Title level={5}>Existing data </Typography.Title> 
        {/* existing data */} 
        <ProTable<TrainingData>
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
                            title: "Training Courses", dataIndex: "trainingCourse"
                        },{
                            title: "Year", dataIndex: "year"
                        },{
                            title: "description", dataIndex: "description"
                        },{   width: '70px',
                            render: (dom, r) => { 
                                return ( <Flex vertical={false} justify='space-between'>
                                    <a style={{display: isAdmin==0?'':'none'}} 
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
         <Typography.Title level={5}>New records </Typography.Title> 
        {/* existing data */} 
        <ProTable<TrainingData>
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
                            title: "Training Courses", dataIndex: "trainingCourse"
                        },{
                            title: "Year", dataIndex: "year"
                        },{
                            title: "description", dataIndex: "description"
                        },{   width: '70px',
                            render: (dom, r) => {
                                return ( <Flex vertical={false} justify='space-between'>
                                    <a style={{display: isAdmin==0?'':'none'}} 
                                        onClick={() => {
                                            cb.onOpenEditForm(r,"ADD");
                                        }
                                    }>
                                        <EditOutlined />
                                    </a>   
                                    <a style={{display: isAdmin==0?'':'none'}} 
                                        onClick={() => cb.onDelete(r)}>
                                        <DeleteOutlined />
                                    </a>  
                                </Flex>
                                );
                            },
                        } 
                    ]}
                />
      </Space>
    </ModalForm>
  </>
}