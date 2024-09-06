import { Flex, ModalProps, Space, Typography } from "antd" 
import { ModalForm, ProTable } from "@ant-design/pro-components"
import { ExperienceData } from "../data.ess" 
import { EditOutlined,DeleteOutlined } from "@ant-design/icons"
import { formatDate } from "@/pages/utils";

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
        <Typography.Title level={5}>Existing Data Modified </Typography.Title> 
        {/* existing data */} 
        <ProTable<ExperienceData> bordered
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
                    title: "Company Name", width: '250px',dataIndex: "companyName"
                },{
                    title: "Location", render: (_, r) => {return ((r.countryName==null?"":r.countryName)+", "+(r.provinceName==null?"":r.provinceName)+", "+(r.locationRemark==null?"":r.locationRemark));}
                }, {
                    title: "Started Position", width: '250px',dataIndex: 'startPosition'
                },{
                    title: "Ended Position", width: '250px',dataIndex: 'endPosition'
                },{
                    title: "Started Date", width: '150px',dataIndex: 'startDate',
                    render:(_, r) => {
                        return formatDate(r.startDate)
                    }
                },{
                    title: "Ended Date", width: '150px',dataIndex: 'endDate',
                    render:(_, r) => {
                        return formatDate(r.endDate)
                    }
                },{   width: '70px',
                    render: (dom, r) => {
                        return ( <Flex vertical={false} justify='space-between'>
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
         <Typography.Title level={5}>New Records Added </Typography.Title> 
        {/* existing data */} 
        <ProTable<ExperienceData> bordered
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
                    title: "Company Name", width: '250px',dataIndex: "companyName"
                },{
                    title: "Location", render: (_, r) => {return ((r.countryName==null?"":r.countryName)+", "+(r.provinceName==null?"":r.provinceName)+", "+(r.locationRemark==null?"":r.locationRemark));}
                }, {
                    title: "Started Position", width: '250px',dataIndex: 'startPosition'
                },{
                    title: "Ended Position", width: '250px',dataIndex: 'endPosition'
                },{
                    title: "Started Date", width: '150px',dataIndex: 'startDate',
                    render:(_, r) => {
                        return formatDate(r.startDate)
                    }
                },{
                    title: "Ended Date", width: '150px',dataIndex: 'endDate',
                    render:(_, r) => {
                        return formatDate(r.endDate)
                    }
                },{   width: '70px',
                    render: (dom, r) => {
                        return ( <Flex vertical={false} justify='space-between'>
                            <a style={{display: isAdmin==0?'':'none'}}  title="Edit item" 
                                onClick={() => cb.onOpenEditForm(r,"ADD")}>
                                <EditOutlined />
                            </a>   
                            <a style={{display: isAdmin==0?'':'none'}} title="Delete item" 
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