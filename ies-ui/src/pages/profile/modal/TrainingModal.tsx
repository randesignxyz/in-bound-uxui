import { LookupDataItem2 } from "@/services/data"
import { ModalForm, ModalFormProps, ProFormTextArea, ProFormDatePicker, ProForm, ProFormText,ProCard, ProFormSelect, ProFormDateRangePicker, ProFormDigit } from "@ant-design/pro-components" 
import { TrainingData, SaveTraining, FilesData } from "../data.ess"
import { useEffect,useState } from 'react';
import FileUploader , { UploadType } from '@/components/Attachment/FileUploader';
import { Space, Typography , Image,List, Modal, message, Button, Row, Col} from "antd";
import ImagePreview from "@/components/ImagePreview";
import { ProfileData } from "../data";
import { simpleRequestActions } from "@/services/model";
import { ProfileServicesEss } from "../service_ess";

interface Props extends ModalFormProps<SaveTraining> { 
    profile: ProfileData;
    data?: TrainingData;
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

    const [form] = ProForm.useForm<SaveTraining>(); 
    const [imageList, setImageList] = useState<FilesData[]>([]); 
    const [createFileOther, selectedFileOther] = useState<any>();  
    
    useEffect(() => {
        initData();
    }, [data]);
    const initData = async () => { 
        const list = await ProfileServicesEss.listImageProfile(profile.id,5,type=="ADD"?2:1,data?.id!!).query(requestActions);
        setImageList(list); 
        // 
        if(!!data){

                var dataRange= [data.year,data.toYear];

            form.setFieldsValue({...data!!,year:dataRange});
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
            title: 'Save Training',
            content: 'Are you sure?',
            onOk: async () => {
              try { 
                bmForm.otherFile = createFileOther;  
                bmForm.id = (!!data!!?data!!.id:0);
                bmForm.empId = empId;
                bmForm.status=true;
                await ProfileServicesEss.saveTrainingAdmin(bmForm)(requestActions); 
                // call back fun
                cb.onReload(); 
              } catch (error: any) {
                message.error(error.message || 'Failed to save.');
              }
            },
        });
    }
    // 
    return <ModalForm  {...rest} form={form} width={'30%'} title={!!data?"Edit Training":"Add Training"}
        // onOpenChange={visible => {
        //     form.resetFields()
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
            <ProFormText label="Training Courses" name={'trainingCourse'} rules={[{ required: true }]} placeholder={"courses"}/> 
            <ProFormText label="Institution" name={'institution'} rules={[{ required: true }]} placeholder={"institution"}/> 
            <Row>              
                <Col span={24} style={{padding:'3px'}}>  
                    <ProFormDateRangePicker label="Date" name={"year"} />
                </Col>      
            </Row> 
            <Row>              
                <Col span={24} style={{padding:'3px'}}>  
                    <ProFormDigit label="Duration(Hours)" name={'duration'} placeholder={"duration"}/>
                </Col>       
            </Row> 
            <ProFormTextArea label="Description" name={'description'} placeholder={"description"}/> 
        </ProCard>
          
        
        {/* Attachment files  */} 
        <div style={{marginTop:'10px'}}>
            <Space direction="horizontal">
                <Typography.Title level={5}>Attachments</Typography.Title>
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