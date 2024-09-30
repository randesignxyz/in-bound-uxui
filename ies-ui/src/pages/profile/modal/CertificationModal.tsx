import { LookupDataItem2 } from "@/services/data"
import { ModalForm, ModalFormProps, ProFormTextArea, ProFormDatePicker, ProForm, ProFormText,ProCard, ProFormSelect, ProFormDateMonthRangePicker } from "@ant-design/pro-components" 
import { TrainingData, SaveTraining, FilesData } from "../data.ess"
import { useEffect,useState } from 'react';
import FileUploader , { UploadType } from '@/components/Attachment/FileUploader';
import { Space, Typography , Image,List, Modal, message, Button, Row, Col} from "antd";
import ImagePreview from "@/components/ImagePreview";
import { ProfileData } from "../data";
import { simpleRequestActions } from "@/services/model";
import { ProfileServicesEss } from "../service_ess";
import { ProfileOutlined,SaveOutlined,CloseSquareOutlined } from "@ant-design/icons";

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
        // attachment files
        if(type=="ADD"){ 
            // 
            if(createFileOther.length==0){  
                message.error('Please do select attachment files.');
                return false;
            } 
        }

        // submit
        Modal.confirm({
            title: 'Save Professional Certification',
            content: 'Are you sure?',
            onOk: async () => {
              try { 
                bmForm.otherFile = createFileOther||[];  
                bmForm.id = (!!data!!?data!!.id:0);
                bmForm.empId = empId;
                bmForm.typeId = 2;
                bmForm.status=true;
                bmForm.isDelete = 0; 
                bmForm.traincert=2;
                bmForm.toYear = bmForm.year; 
                bmForm.openId = profile.ess.id||0;
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
    return <ModalForm  {...rest} form={form} width={'50%'} title={!!data?<><ProfileOutlined /> Edit Professional Certification</>:<><ProfileOutlined /> Add Professional Certification</>}
        onOpenChange={visible => {
            form.resetFields()
            rest.onOpenChange?.(visible);
        }}

        submitter={isAdmin==2&&empId>0?
                    {
                        render: () => { 
                        return <><Button onClick={()=>{onAdminSubmit();}}><SaveOutlined /> Save</Button></>
                        }
                    }
                    :{ 
                        searchConfig: {
                            submitText: <div><SaveOutlined /> Save</div>,
                            resetText: <div><CloseSquareOutlined /> Cancel</div>,
                        }
                    }
                } 
        > 
        <ProCard bordered> 
            <ProFormText label="Certified Courses" name={'trainingCourse'} rules={[{ required: true }]} placeholder={"courses"}/> 
            <ProFormText label="Institution" name={'institution'} rules={[{ required: true }]} placeholder={"institution"}/> 
            <ProFormDatePicker.Month label="In Month-Year" name={'year'} rules={[{ required: true }]} placeholder={"In Month-Year"}/>  
            <ProFormTextArea label="Description" name={'description'} placeholder={"description"}/> 
        </ProCard>
          
        
        {/* Attachment files  */} 
        <div style={{marginTop:'10px'}}>
            <Space direction="horizontal">
                <Typography.Title level={5}>Attachments</Typography.Title><Typography.Title level={5} style={{color:'red'}}> (Required*)</Typography.Title>
            </Space>
            <div style={{fontSize:'12px'}}>- Professional Certification (e.g., ACCA, Project Management Professional, SHRM-CP/SCP, ITIL, etc.)</div>
            
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