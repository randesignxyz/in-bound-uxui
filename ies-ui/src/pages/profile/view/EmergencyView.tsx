import { Descriptions, Flex, message, Modal, ModalProps, Space, Typography } from "antd"
import { BasicContactData } from "../data"
import { ModalForm, ModalFormProps,ProCard,ProDescriptions, ProTable } from "@ant-design/pro-components"
import { EmergencyData } from "../data.ess"
import { useEffect, useState } from "react"
import { ProfileServicesEss } from "../service_ess"
import { simpleRequestActions } from "@/services/model"
import { EditOutlined, EyeOutlined } from "@ant-design/icons"

interface Props extends ModalProps {
    // data: BasicContactData;
    oldData:EmergencyData[],
    newData:EmergencyData[],
    essProfileId: number;
    isAdmin:number;
    cb:{ //used callback function to parent form
        onOpenEditForm: (data:EmergencyData,type:string) => void;  
    };
}

export default ( {oldData,newData,essProfileId,isAdmin,cb, ...rest}: Props) => { 

    var lng = ["","Spouse" ,"Parent","Parent in law","Brother","Sister","Cousin"];  
    return <>
      <ModalForm title = "View emergency edit" {...rest} width={'90%'} submitter={false} > 
        <Space direction={"vertical"} style={{width:'100%'}}>
        <Typography.Title level={5}>Existing data </Typography.Title> 
        {/* existing data */} 
        <ProTable<EmergencyData>
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
                    title: "Emergency Name", dataIndex: "emergencyName"
                },{
                    title: "Emergency Contact Relation", render: (dom, r) => {return lng[r.emergencyContactRelation]} 
                },{
                    title: "Emergency Phone", dataIndex: "emergencyPhone"
                },{
                    title: "Emergency Address", dataIndex: "emergencyPhone",render: (dom, r) => {return r.homeNo+" "+r.street+" "+r.villageId}
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
        <ProTable<EmergencyData>
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
                    title: "Emergency Name", dataIndex: "emergencyName"
                },{
                    title: "Emergency Contact Relation", render: (dom, r) => {return lng[r.emergencyContactRelation]} 
                },{
                    title: "Emergency Phone", dataIndex: "emergencyPhone"
                },{
                    title: "Emergency Address", dataIndex: "emergencyPhone",render: (dom, r) => {return r.homeNo+" "+r.street+" "+r.villageId}
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