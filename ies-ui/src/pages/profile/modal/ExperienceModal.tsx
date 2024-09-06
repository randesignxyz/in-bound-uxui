import { ModalForm, ModalFormProps, ProFormTextArea, ProCard,ProForm, ProFormText,ProFormDatePicker, ProFormSelect } from "@ant-design/pro-components" 
import { ExperienceData, FilesData, LocationData, SaveExperience } from "../data.ess"
import { useEffect,useState } from 'react'; 
import FileUploader , { UploadType } from '@/components/Attachment/FileUploader';
import { Space, Typography, Image,List, Modal, message, Button, Row, Col } from "antd";
import ImagePreview from "@/components/ImagePreview";
import { ProfileData } from "../data";
import { ProfileServicesEss } from "../service_ess";
import { simpleRequestActions } from "@/services/model";

interface Props extends ModalFormProps<ExperienceData> { 
    profile: ProfileData;
    data?: ExperienceData,
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
    const requestActions = simpleRequestActions();  
    
    const [form] = ProForm.useForm<ExperienceData>(); 
    const [imageList, setImageList] = useState<FilesData[]>([]);
    const [createFileOther, selectedFileOther] = useState<any>();  
    const [isOther, setIsOtherVisible] = useState(true);
    
    useEffect(() => {
        initData();
    }, [data]);
    const initData = async () => { 
        const list = await ProfileServicesEss.listImageProfile(profile.id,6,type=="ADD"?2:1,data?.id!!).query(requestActions);
        setImageList(list); 
        // 
        if(!!data){
            form.setFieldsValue(data!!);
        }
        else{
            form.resetFields();
        }
        // 
        if(data?.countryId==76){
            setIsOtherVisible(false);
        }
        else{ 
            setIsOtherVisible(true);
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
            title: 'Save Experience',
            content: 'Are you sure?',
            onOk: async () => {
              try { 
                bmForm.otherFile = createFileOther;  
                bmForm.id = (!!data!!?data!!.id:0);
                bmForm.empId = empId;
                bmForm.status=true;
                await ProfileServicesEss.saveExperienceAdmin(bmForm)(requestActions); 
                // call back fun
                cb.onReload(); 
              } catch (error: any) {
                message.error(error.message || 'Failed to save.');
              }
            },
        });
    }
    return <ModalForm  {...rest} form={form} width={'30%'} title={!!data?"Edit Experience":"Add Experience"}
        onOpenChange={visible => {
            // form.resetFields() 
            rest.onOpenChange?.(visible)
            console.log(visible);
        }} 
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
            <ProFormText label="Company Name" name={'companyName'} rules={[{ required: true }]}/>
            {/*  */}
            <Row>
                <Col span={12} style={{padding:'3px'}}>
                    <ProFormText label="Started Position" name={'startPosition'} rules={[{ required: true }]}/>  
                </Col>
                <Col span={12} style={{padding:'3px'}}>
                    <ProFormText label="Ended Position" name={'endPosition'} rules={[{ required: true }]}/> 
                </Col> 
            </Row>
            {/*  */}
            <Row>
                <Col span={12} style={{padding:'3px'}}>
                    <ProFormDatePicker label="Started Date" name={'startDate'} rules={[{ required: true }]}/> 
                </Col>
                <Col span={12} style={{padding:'3px'}}> 
                    <ProFormDatePicker label="Ended Date" name={'endDate'} rules={[{ required: true }]}/>  
                </Col> 
            </Row> 
        </ProCard>
        {/* Location  */}
        <div style={{marginTop:'10px'}}><Typography.Title level={5}>Location</Typography.Title></div>
        <ProCard bordered style={{backgroundColor:'#f5f5f5'}}> 
            <Row>
                <Col span={12} style={{padding:'3px'}}>
                    <ProFormSelect 
                        label="Country" 
                        name={'countryId'}
                        showSearch
                        options={profile.coei?.map((it) => {
                            return { value: it.id, label: it.titleName };
                        })}
                        fieldProps={{
                            onChange: (val) => { 
                                if(val==76){
                                    setIsOtherVisible(false);
                                }else{ 
                                    setIsOtherVisible(true);
                                }
                            }, 
                        }} 
                    />
                </Col> 
                <Col span={12} style={{padding:'3px'}} hidden={isOther}>     
                    <ProFormSelect 
                        showSearch
                        label="City/ Province" 
                        name={'provinceId'}
                        options={profile.essLocation?.map((it) => {
                            return { value: it.id, label: it.name };
                        })} 
                    />  
                </Col>  
                <Col span={24} hidden={!isOther} > 
                    <ProFormText label="City/ Province" name={'locationRemark'} /> 
                </Col>  
            </Row> 
            </ProCard>
            <ProFormTextArea label="Description" name={'description'} /> 
        
        {/* Attachment files  */} 
        <div style={{marginTop:'10px'}}>
            <Space direction="horizontal">
                <Typography.Title level={5}>Attachments </Typography.Title> <Typography.Title level={5} style={{color:'red'}}> (Required*)</Typography.Title>
            </Space>
            <div style={{fontSize:'12px'}}>- Curriculum Vitae (CV) (Image File or PDF)</div>
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