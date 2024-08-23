import { Flex, ModalProps, Space, Typography } from "antd" 
import { ModalForm, ProTable } from "@ant-design/pro-components"
import { ExperienceData } from "../data.ess" 
import { EditOutlined,DeleteOutlined } from "@ant-design/icons"

interface Props extends ModalProps {
    // data: BasicContactData;
    oldData:ExperienceData[],
    newData:ExperienceData[],
    essProfileId: number;
    isAdmin:number;
    cb:{ //used callback function to parent form
        onOpenEditForm: (data:ExperienceData,type:string) => void;  
        onDelete: (data:ExperienceData) => void;  
    };
}

export default ( {oldData,newData,essProfileId,isAdmin,cb, ...rest}: Props) => {  
 
    return <>
      <ModalForm title = "View experience edit" {...rest} width={'90%'} submitter={false} > 
        <Space direction={"vertical"} style={{width:'100%'}}>
        <Typography.Title level={5}>Existing data </Typography.Title> 
        {/* existing data */} 
        <ProTable<ExperienceData>
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
                    title: "Company Name", dataIndex: "companyName"
                },{
                    title: "Location", dataIndex: "location"
                }, {
                    title: "Started Position", dataIndex: 'startPosition'
                },{
                    title: "Ended Position", dataIndex: 'endPosition'
                },{
                    title: "Started Date", dataIndex: 'startDate'
                },{
                    title: "Ended Date", dataIndex: 'endDate'
                },{   width: '70px',
                    render: (dom, r) => {
                        return ( <Flex vertical={false} justify='space-between'>
                            <a style={{display: isAdmin==0?'':'none'}} 
                                onClick={() => cb.onOpenEditForm(r,"EDIT")}>
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
        <ProTable<ExperienceData>
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
                    title: "Company Name", dataIndex: "companyName"
                },{
                    title: "Location", dataIndex: "location"
                }, {
                    title: "Started Position", dataIndex: 'startPosition'
                },{
                    title: "Ended Position", dataIndex: 'endPosition'
                },{
                    title: "Started Date", dataIndex: 'startDate'
                },{
                    title: "Ended Date", dataIndex: 'endDate'
                },{   width: '70px',
                    render: (dom, r) => {
                        return ( <Flex vertical={false} justify='space-between'>
                            <a style={{display: isAdmin==0?'':'none'}} 
                                onClick={() => cb.onOpenEditForm(r,"ADD")}>
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