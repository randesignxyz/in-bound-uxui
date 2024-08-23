import { Flex, ModalProps, Space, Typography } from "antd" 
import { ModalForm, ProTable } from "@ant-design/pro-components"
import { EducationData } from "../data.ess" 
import { EditOutlined,DeleteOutlined } from "@ant-design/icons"

interface Props extends ModalProps {
    // data: BasicContactData;
    oldData: EducationData[];
    newData: EducationData[];
    essProfileId: number;
    isAdmin:number;
    cb:{ //used callback function to parent form
        onOpenEditForm: (data:EducationData,type:string) => void; 
        onDelete: (data:EducationData) => void;  
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
                    title: "Degree", dataIndex: "degreeId",render: (dom, r) => {return lng[r.degreeId]}
                },{
                    title: "Major/Subject", dataIndex: "marjorSubject"
                },{
                    title: "Education Center", dataIndex: "educationCenter"
                },{
                    title: "Country of Education Center", dataIndex: "countryEducationCenter",render: (dom, r) => {return lng[r.countryEducationCenter]}
                },{
                    title: "Status", dataIndex: "statusId",render: (dom, r) => {return lng[r.statusId]}
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
                    title: "Degree", dataIndex: "degreeId",render: (dom, r) => {return lng[r.degreeId]}
                },{
                    title: "Major/Subject", dataIndex: "marjorSubject"
                },{
                    title: "Education Center", dataIndex: "educationCenter"
                },{
                    title: "Country of Education Center", dataIndex: "countryEducationCenter",render: (dom, r) => {return lng[r.countryEducationCenter]}
                },{
                    title: "Status", dataIndex: "statusId",render: (dom, r) => {return lng[r.statusId]}
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