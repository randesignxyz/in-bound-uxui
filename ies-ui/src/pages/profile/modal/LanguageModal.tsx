import { LookupDataItem2 } from "@/services/data"
import { ModalForm, ModalFormProps,ProCard, ProFormTextArea, ProFormSelect, ProFormText, ProForm } from "@ant-design/pro-components"
import { FilesData, LanguageData, SaveLanguage } from "../data.ess" 
import { useEffect,useState } from 'react';
import FileUploader , { UploadType } from '@/components/Attachment/FileUploader';
import { Space, Typography, Image,List, Modal, message, Button} from "antd";
import ImagePreview from "@/components/ImagePreview";
import { ProfileData } from "../data";
import { simpleRequestActions } from "@/services/model";
import { ProfileServicesEss } from "../service_ess";
import { ProfileOutlined,SaveOutlined,CloseSquareOutlined } from "@ant-design/icons";

interface Props extends ModalFormProps<LanguageData> { 
    profile: ProfileData;
    data?: LanguageData;
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
 
    const [form] = ProForm.useForm<LanguageData>(); 
    const [imageList, setImageList] = useState<FilesData[]>([]); 
    const [createFileOther, selectedFileOther] = useState<any>();   
    
    useEffect(() => {
        initData();
    }, [data]);
    const initData = async () => {  
        const list = await ProfileServicesEss.listImageProfile(profile.id,4,type=="ADD"?2:1,data?.id!!).query(requestActions);
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
            title: 'Save Lanuage',
            content: 'Are you sure?',
            onOk: async () => {
              try { 
                bmForm.otherFile = createFileOther||[];  
                bmForm.id = (!!data!!?data!!.id:0);
                bmForm.empId = empId;
                bmForm.status=true;
                bmForm.isDelete=0;
                await ProfileServicesEss.saveLanguageAdmin(bmForm)(requestActions); 
                // call back fun
                cb.onReload(); 
              } catch (error: any) {
                message.error(error.message || 'Failed to save.');
              }
            },
        });
    }
    return <ModalForm  {...rest} form={form} width={'30%'} title={!!data?<><ProfileOutlined /> Edit Language</>:<><ProfileOutlined /> Add Language</>}
    //     onOpenChange={visible => {
    //         form.resetFields()
    //     //     if(visible) {
    //     //         form.setFieldsValue({
    //     //             id: data?.id,
    //     //             languageId: data?.languageId,
    //     //             level_name: data?.level_name,
    //     //             description: data?.description
    //     //         })
    //     //     }

    //         rest.onOpenChange?.(visible);
    //     } 
    // }

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
            <ProFormSelect rules={[{ required: true }]} allowClear={true}  
                name="languageId" label = "Languages" placeholder="Languages"  
                showSearch 
                mode="single" 
                options={profile.language?.map((it) => {
                    return { value: it.id, label: it.titleName };
                })}  
            /> 
            {/* <ProFormText label="Level" name='levelName' rules={[{ required: true }]}/>   */}
            <ProFormSelect rules={[{ required: true }]} allowClear={true}  
                name="levelId" label = "Level" placeholder="Level"  
                showSearch 
                mode="single" 
                options={profile.level?.map((it) => {
                    return { value: it.id, label: it.titleName };
                })}  
            /> 
            <ProFormTextArea label="Description" name='description' /> 
        </ProCard>
        
        {/* Attachment files  */} 
        <div style={{marginTop:'10px'}}>
            <Space direction="horizontal">
                <Typography.Title level={5}>Attachments </Typography.Title> 
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