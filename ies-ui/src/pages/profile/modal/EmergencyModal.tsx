import { LookupDataItem2 } from "@/services/data"
import { ModalForm, ModalFormProps, ProCard, ProFormSelect, ProFormText } from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { EmergencyData,SaveEmergency,LocationData, FilesData } from "../data.ess"
import { Spin,message,Image,List,Typography, Space, Button, Modal, Row, Col } from 'antd';
import { useEffect,useState } from 'react';  
import { simpleRequestActions } from '@/services/model';
import { ProfileServicesEss } from '../service_ess'; 
import FileUploader , { UploadType } from '@/components/Attachment/FileUploader';
import { ProfileOutlined,SaveOutlined,CloseSquareOutlined } from "@ant-design/icons";
import { ProfileData } from "../data";

interface Props extends ModalFormProps<SaveEmergency> { 
    profile: ProfileData;
    data?: SaveEmergency;
    locations?:LocationData[];
    type:string; 
    isAdmin:number;
    empId:number;
    cb: { //used callback function to parent form
        onLoadMenu: (tid:UploadType[]) => void;  
        onReload:()=>void;
    };
}

export default ({ profile,data,locations,type,isAdmin,empId, cb, ...rest }: Props) => {
    const requestActions = simpleRequestActions(); 

    const [district, setDistrict] = useState<LocationData[]>();
    const [commune, setCommune] = useState<LocationData[]>();
    const [isLoading,setLoading] = useState(false); 
    const [imageList, setImageList] = useState<FilesData[]>([]);
    const [form] = useForm<SaveEmergency>();
    const [createFileOther, selectedFileOther] = useState<any>();  
    // 
    useEffect(() => {
        initData();
    }, [profile,data]);
    // 
    const initData = async () => { 
        const list = await ProfileServicesEss.listImageProfile(profile.id,2,type=="ADD"?2:1,data?.id!!||-1).query(requestActions);
        setImageList(list); 
        if(!!data){
            districtList(data!!.provinceId);
            communeList(data!!.districtId);
        }
        
        // 
        if(!!data){
            form.setFieldsValue(data!!);
        }
        else{
            form.resetFields();
        }
    };
    // 
    const districtList = async(val:number)=>{
        try {
            const list = await ProfileServicesEss.listLocation(val).query(requestActions);
            setDistrict(list); 
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            message.error(error.message || 'Failed to load data.');
        } 
    }
    // 
    const communeList = async(val:number)=>{
        try {
            const list = await ProfileServicesEss.listLocation(val).query(requestActions);
            setCommune(list); 
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            message.error(error.message || 'Failed to load data.');
        }  
    }
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
                bmForm.otherFile = createFileOther||[];  
                bmForm.id = (!!data!!?data!!.id:0);
                bmForm.empId = empId;
                bmForm.status=true;
                bmForm.isDelete=0;
                await ProfileServicesEss.saveEmergencyAdmin(bmForm)(requestActions); 
                // call back fun
                cb.onReload(); 
              } catch (error: any) {
                message.error(error.message || 'Failed to save.');
              }
            },
        });
    }
    // 
    return <ModalForm  {...rest} form={form} width={'35%'} title={!!data?<><ProfileOutlined /> Edit Emergency</>:<><ProfileOutlined /> Add Emergency</>}  
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
        <Spin spinning = {isLoading}> 
            <ProCard bordered> 
                <ProFormText label="Emergency Name" name={'emergencyName'} rules={[{ required: true }]}/> 
                <ProFormSelect 
                    label="Emergency Contact Relation" rules={[{ required: true }]}
                    width={'md'} 
                    name={'emergencyContactRelation'}
                    options={profile.relship?.map((it) => {
                        return { value: it.id, label: it.titleName };
                    })}  
                />   
                <ProFormText label="Emergency Phone" name={'emergencyPhone'} rules={[{ required: true }]}/> 
            </ProCard> 
            <div style={{marginTop:'10px'}}><Typography.Title level={5}>Emergency Address</Typography.Title></div>
            <ProCard bordered> 
                <Row>
                    <Col span={8} style={{padding:'3px'}}>
                        <ProFormSelect rules={[{ required: true }]}
                            label="City/ Province" 
                            name={'provinceId'}
                            options={locations?.map((it) => {
                                return { value: it.id, label: it.name };
                            })}
                            fieldProps={{
                                onChange: (val) => {
                                    setLoading(true);
                                    districtList(val); 
                                }, 
                            }}
                        />   
                    </Col>   
                    <Col span={8} style={{padding:'3px'}}>   
                        {/*  */}
                        <ProFormSelect rules={[{ required: true }]}
                            label="Khan/ District" 
                            name={'districtId'}
                            options={district?.map((it) => {
                                return { value: it.id, label: it.name };
                            })}
                            fieldProps={{
                                onChange: (val) => {
                                    setLoading(true);
                                    communeList(val); 
                                }, 
                            }}
                        /> 
                    </Col>   
                    <Col span={8} style={{padding:'3px'}}>     
                    {/*  */}
                        <ProFormSelect rules={[{ required: true }]}
                            label="Sangkhat/ Commune" 
                            name={'communeId'}
                            options={commune?.map((it) => {
                                return { value: it.id, label: it.name };
                            })}
                        />
                    </Col>
                </Row>
                {/*  */}
                <Row>
                    <Col span={8} style={{padding:'3px'}}>   
                        <ProFormText label="House No" name={'homeNo'} rules={[{ required: true }]}/> 
                    </Col>
                        <Col span={8} style={{padding:'3px'}}>    
                        <ProFormText label="Street" name={'street'} rules={[{ required: false }]}/> 
                    </Col>
                    <Col span={8} style={{padding:'3px'}}>   
                        <ProFormText label="Group/Village" name={'villageId'} rules={[{ required: false }]}/> 
                    </Col>
                </Row>
            </ProCard>
            
            {/* Attachment files  */} 
            {/* <div style={{marginTop:'10px'}}>
                <Space direction="horizontal">
                    <Typography.Title level={5}>Attachments </Typography.Title><Typography.Title level={5} style={{color:'red'}}> (Required*)</Typography.Title>
                </Space>
            </div>  */}
            {/* <ProCard size="small" bordered>   
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
            </ProCard> */}
        </Spin>
    </ModalForm>
}