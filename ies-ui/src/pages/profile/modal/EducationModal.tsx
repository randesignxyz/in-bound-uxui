import { LookupDataItem2 } from "@/services/data"
import { ModalForm, ModalFormProps, ProCard, ProFormSelect, ProFormText } from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { EducationData, EssLookupData, FilesData, MarjorData } from "../data.ess"
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
    marjor: MarjorData[];  
    cb: { //used callback function to parent form
        onLoadMenu: (tid:UploadType[]) => void;  
        onReload:()=>void;
    };
}

export default ({ profile,data,files,type,isAdmin,empId,marjor,cb, ...rest }: Props) => { 
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
            title: 'Save Education',
            content: 'Are you sure?',
            onOk: async () => {
              try { 
                bmForm.otherFile = createFileOther;  
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
        //         degreeId: data?.degreeId,
        //         statusId: data?.statusId,
        //         countryEducationCenter: data?.countryEducationCenter,
        //         educationCenter: data?.educationCenter,
        //         marjorSubject: data?.marjorSubject,
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
            <ProFormText label="Education Institution" name={'educationCenter'} rules={[{ required: true }]}/> 
            <ProFormSelect rules={[{ required: true }]} allowClear={true}
                name={'marjorSubject'} label = "Major/Subject"  
                showSearch  
                mode="single" 
                options={marjor?.map((it) => {
                    return { value: it.id, label: it.majorName };
                })} 
            />    
            <Row>
                <Col span={12}>
                    <ProFormSelect rules={[{ required: true }]} allowClear={true} 
                        name="degreeId" label = "Degree" placeholder="Degree"  
                        showSearch 
                        mode="single" 
                        options={profile.degree?.map((it) => {
                            return { value: it.id, label: it.titleName };
                        })}  
                    />   
                </Col>
                <Col span={12}>
                    <ProFormSelect rules={[{ required: true }]} allowClear={true} 
                        name="statusId" label = "Status" placeholder="Status"  
                        showSearch 
                        mode="single" 
                        // options={
                        options={profile.status?.map((it) => {
                            return { value: it.id, label: it.titleName };
                        })}  
                    /> 
                </Col>
            </Row>  
            <ProFormSelect rules={[{ required: true }]} allowClear={true}  
                name="countryEducationCenter" label = "Country of Education Institution" placeholder="Country of Education Institution"  
                showSearch 
                mode="single" 
                options={profile.coei?.map((it) => {
                    return { value: it.id, label: it.titleName };
                })}  
            /> 
        </ProCard>
        
        {/* Attachment files  */} 
        <div style={{marginTop:'10px'}}>
            <Space direction="horizontal">
                <Typography.Title level={5}>Education Document</Typography.Title><Typography.Title level={5} style={{color:'red'}}>(Required*)</Typography.Title>
            </Space>
            <div style={{fontSize:'12px'}}>(Degree and transcript or other related documents)</div>
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
                                fileName={it.fileName}
                            />
                        </List.Item>
                    );
                    }}
                />
            </Image.PreviewGroup>
        </ProCard>

    </ModalForm>
}