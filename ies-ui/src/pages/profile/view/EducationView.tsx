import { Descriptions, Flex, message, Modal, ModalProps, Space, Typography } from "antd"
import { BasicContactData } from "../data"
import { ModalForm, ProTable } from "@ant-design/pro-components"
import { EducationData } from "../data.ess"
import { useEffect, useState } from "react"
import { ProfileServicesEss } from "../service_ess"
import { simpleRequestActions } from "@/services/model"
import { EditOutlined } from "@ant-design/icons"

interface Props extends ModalProps {
    // data: BasicContactData;
    oldData: EducationData[];
    newData: EducationData[];
    essProfileId: number;
    isAdmin:number;
    cb:{ //used callback function to parent form
        onOpenEditForm: (data:EducationData,type:string) => void;  
    };
}

export default ( {oldData,newData,essProfileId,isAdmin,cb, ...rest}: Props) => {  

    var lng = ["N/A","Khmer" ,"English","Chineses","Thai","Janpanese","Vietnamese"];  
    return <>
      <ModalForm title = "View education edit" {...rest} width={'90%'} submitter={false} > 
        <Space direction={"vertical"} style={{width:'100%'}}>
        <Typography.Title level={5}>Existing data </Typography.Title> 
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
                    title: "Degree", dataIndex: "degree_id",render: (dom, r) => {return lng[r.degree_id]}
                },{
                    title: "Major/Subject", dataIndex: "marjor_subject"
                },{
                    title: "Education Center", dataIndex: "education_center"
                },{
                    title: "Country of Education Center", dataIndex: "country_education_center",render: (dom, r) => {return lng[r.country_education_center]}
                },{
                    title: "Status", dataIndex: "status_id",render: (dom, r) => {return lng[r.status_id]}
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
                    title: "Degree", dataIndex: "degree_id",render: (dom, r) => {return lng[r.degree_id]}
                },{
                    title: "Major/Subject", dataIndex: "marjor_subject"
                },{
                    title: "Education Center", dataIndex: "education_center"
                },{
                    title: "Country of Education Center", dataIndex: "country_education_center",render: (dom, r) => {return lng[r.country_education_center]}
                },{
                    title: "Status", dataIndex: "status_id",render: (dom, r) => {return lng[r.status_id]}
                },{   width: '70px',
                    render: (dom, r) => {
                        return ( <Flex vertical={false} justify='space-between'>
                            <a style={{display: isAdmin==0?'':'none'}} 
                                onClick={() => cb.onOpenEditForm(r,"ADD")}>
                                <EditOutlined />
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