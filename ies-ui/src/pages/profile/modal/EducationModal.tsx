import { LookupDataItem2 } from "@/services/data"
import { ModalForm, ModalFormProps, ProCard, ProFormSelect, ProFormText } from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { EducationData, FilesData } from "../data.ess"
import { Flex, Space, Typography, Row, Col, Image,List, Modal, message, Button,} from 'antd';
import { useEffect,useState } from 'react';
import FileUploader , { UploadType } from '@/components/Attachment/FileUploader';
import ImagePreview from "@/components/ImagePreview";
import { ProfileServicesEss } from "../service_ess";
import { ProfileData } from "../data";
import { simpleRequestActions } from "@/services/model";

interface Props extends ModalFormProps<EducationData> { 
    profile: ProfileData;
    data?: EducationData;
    files: FilesData[];   
    type:string; 
    isAdmin:number;
    empId:number;
    cb: { //used callback function to parent form
        onLoadMenu: (tid:UploadType[]) => void;  
        onReload:()=>void;
    };
}

export default ({ profile,data,files,type,isAdmin,empId,cb, ...rest }: Props) => { 
    const [form] = useForm<EducationData>(); 
    const requestActions = simpleRequestActions();
    const [imageList, setImageList] = useState<FilesData[]>([]);
    const [createFileOther, selectedFileOther] = useState<any>();  

    useEffect(() => {
        initData();
    }, [data]);
    const initData = async () => {  
        const list = await ProfileServicesEss.listImageProfile(profile.id,3,type=="ADD"?2:1,data?.id!!).query(requestActions);
        setImageList(list); 
        // 
        if(!!data){
            form.setFieldsValue(data!!);
        }
        else{
            form.resetFields();
        }
    };

    //    
    const setUpladFileHandle=(ploadFiles: UploadType[])=>{ 
        selectedFileOther(ploadFiles);
        cb.onLoadMenu(ploadFiles);
    }
    // 
    const onAdminSubmit = async ()=>{
        const bmForm = await form.validateFields(); 
        Modal.confirm({
            title: 'Save Emergency',
            content: 'Are you sure?',
            onOk: async () => {
              try { 
                bmForm.other_file = createFileOther;  
                bmForm.id = (!!data!!?data!!.id:0);
                bmForm.empId = empId;
                bmForm.status=true;
                await ProfileServicesEss.saveEducationAdmin(bmForm)(requestActions); 
                // call back fun
                cb.onReload(); 
              } catch (error: any) {
                message.error(error.message || 'Failed to save.');
              }
            },
        });
    }
    return <ModalForm  {...rest} form={form} width={'30%'} title={!!data?"Edit Education":"Add Education"}
        // onOpenChange={visible => {
        //     form.resetFields(); 
        //     form.setFieldsValue({
        //         id: data?.id,
        //         degree_id: data?.degree_id,
        //         status_id: data?.status_id,
        //         country_education_center: data?.country_education_center,
        //         education_center: data?.education_center,
        //         marjor_subject: data?.marjor_subject,
        //     }); 

        //     rest.onOpenChange?.(visible)
        // }}

            submitter={isAdmin==2&&empId>0?
                {
                    render: () => { 
                    return <><Button onClick={()=>{onAdminSubmit();}}>Submit</Button></>
                    }
                }
                :{
                    searchConfig: {
                        submitText: 'Submit',
                        resetText: 'Cancel',
                    }
                }
            } 
        >
        <ProCard bordered>
            <ProFormText label="Education Center" name={'education_center'} /> 
            <ProFormText label="Major/Subject" name={'marjor_subject'} /> 
            <Row>
                <Col span={12}>
                    <ProFormSelect rules={[{ required: false }]} allowClear={true} width="sm" 
                        name="degree_id" label = "Degree" placeholder="Degree"  
                        showSearch 
                        mode="single" 
                        options={
                            [
                            { value: 1, label: "Primary school" },
                            { value: 2, label: "Secondary school"} ,
                            { value: 3, label: "Higher school"} ,
                            { value: 4, label: "Bachelor degree"} ,
                            { value: 5, label: "Master degree"} ,
                            { value: 6, label: "Phd"}  
                            ]
                        }  
                    />  
                </Col>
                <Col span={12}>
                    <ProFormSelect rules={[{ required: false }]} allowClear={true}  width="sm" 
                        name="status_id" label = "Status" placeholder="Status"  
                        showSearch 
                        mode="single" 
                        options={
                            [
                            { value: 1, label: "Finished" },
                            { value: 2, label: "Unfinished"} ,
                            { value: 3, label: "On-going"}  
                            ]
                        }  
                    /> 
                </Col>
            </Row>  
            <ProFormSelect rules={[{ required: false }]} allowClear={true}  
                name="country_education_center" label = "Country Education Center" placeholder="Country Education Center"  
                showSearch 
                mode="single" 
                options={
                    [
                        { value: 1, label: "Khmer" },
                        { value: 2, label: "English"} ,
                        { value: 3, label: "Chineses"} ,
                        { value: 4, label: "Thai"} ,
                        { value: 5, label: "Janpanese"} ,
                        { value: 6, label: "Vietnamese"} ,
                        // { value: 7, label: "Other, please specify"}  
                    ]}
            /> 
        </ProCard>
        
        {/* Attachment files  */} 
        <div style={{marginTop:'10px'}}>
            <Space direction="horizontal">
                <Typography.Title level={5}>Attachments </Typography.Title><Typography.Title level={5} style={{color:'red'}}> (Required*)</Typography.Title>
            </Space>
        </div> 
        <ProCard size="small" bordered>   
            <FileUploader   
                required={false}  
                service="FILE" onSetFiles={f=>setUpladFileHandle?.(f)}
                showUploadList={true} 
            />
            <Image.PreviewGroup>
                <List style={{display:imageList.length>0?'':'none'}}
                    grid={{ gutter: 5 }}
                    dataSource={imageList.filter((it) => it) || []}
                    renderItem={(it) => {
                    return (
                        <List.Item>
                            <ImagePreview
                                version={2}
                                width={'200px'}
                                key={it.id}
                                fileId={it.id || ''}
                                fileName={it.file_name}
                            />
                        </List.Item>
                    );
                    }}
                />
            </Image.PreviewGroup>
        </ProCard>

    </ModalForm>
}