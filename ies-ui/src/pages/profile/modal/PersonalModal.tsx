import { ModalForm, ModalFormProps, ProFormDatePicker, ProFormSelect, ProFormText,ProCard, ProFormTextArea} from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { SaveEssProfile,LocationData, FilesData, EssProfileData } from "../data.ess"
import { Image, Flex, Spin, List,message, Button, Modal} from 'antd';
import { Space,Row, Col,Typography} from 'antd';
import { useEffect,useState } from 'react'; 
import { simpleRequestActions } from '@/services/model';
import { ProfileServicesEss } from '../service_ess';  
import FileUploader , { UploadType } from '@/components/Attachment/FileUploader';
import ImagePreview from "@/components/ImagePreview";
import { ProfileData } from "../data";

interface Props extends ModalFormProps<SaveEssProfile> { 
    data?: EssProfileData;
    profile_draft?: SaveEssProfile; 
    locations?:LocationData[];
    files: FilesData[];
    isAdmin:number;
    empId:number;
    cb: { //used callback function to parent form
        onLoadMenu: (tid:UploadType[]) => void;  
        onReload:()=>void; 
    };
}

export default ({ data,profile_draft,locations,files,isAdmin,empId,cb, ...rest }: Props) => {
    const requestActions = simpleRequestActions(); 

    const [form] = useForm<SaveEssProfile>();
    const [districtPB, setDistrictPB] = useState<LocationData[]>();
    const [districtPA, setDistrictPA] = useState<LocationData[]>();
    const [districtCA, setDistrictCA] = useState<LocationData[]>();
    const [communePB, setCommunePB] = useState<LocationData[]>();
    const [communePA, setCommunePA] = useState<LocationData[]>();
    const [communeCA, setCommuneCA] = useState<LocationData[]>(); 
    const [isLoading,setLoading] = useState(false);  
    const [createFileOther, selectedFileOther] = useState<any>();  

    useEffect(() => {
        initData();
    }, [data]);
    const initData = async () => { 
        form.setFieldsValue(data!!);
        if(!!data){
            //place of birth
            districtList(data!!.provincePbId!!,1);
            communeList(data!!.districtPbId!!,1);
            //permenance address
            districtList(data!!.provincePaId!!,2);
            communeList(data!!.districtPaId!!,2);
            //current address
            districtList(data!!.provinceCrId!!,3);
            communeList(data!!.districtCrId!!,3);
        }
         
    };  
    
    const districtList = async(val:number,typeId:number)=>{
        try {
            const list = await ProfileServicesEss.listLocation(val).query(requestActions);
            if(typeId==1){// place of birth
                setDistrictPB(list); 
            }
            else if(typeId==2){ // permernant address
                setDistrictPA(list); 
            }
            else if(typeId==3){ // current address
                setDistrictCA(list); 
            } 
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            message.error(error.message || 'Failed to load data.');
        } 
    }
    const communeList = async(val:number,typeId:number)=>{
        try {
            const list = await ProfileServicesEss.listLocation(val).query(requestActions);
            if(typeId==1){// place of birth
                setCommunePB(list); 
            }
            else if(typeId==2){ // permernant address
                setCommunePA(list); 
            }
            else if(typeId==3){ // current address
                setCommuneCA(list); 
            }

            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            message.error(error.message || 'Failed to load data.');
        }  
    }  
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
                bmForm.otherFile = createFileOther;  
                bmForm.id = (!!data!!?data!!.id:0);
                bmForm.empId = empId;
                bmForm.status=true;
                await ProfileServicesEss.saveEssProfileAdmin(bmForm)(requestActions); 
                // call back fun
                cb.onReload(); 
              } catch (error: any) {
                message.error(error.message || 'Failed to save.');
              }
            },
        });
    }
    return <div>
        <ModalForm  {...rest} form={form} width={'40%'} title="Edit Personal Information"
            onOpenChange={visible => {
                form.resetFields() 
                rest.onOpenChange?.(visible)
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
            <Spin spinning = {isLoading}> 
                <ProCard bordered>
                    <ProFormText label="Name KH" name={'nameKh'} />
                    <ProFormText label="Name EN" name={'nameEn'} />
                    <Row>
                        <Col span={12}>
                            <ProFormDatePicker label="Date of Birth" name={'dateBirth'} />
                        </Col>                
                        <Col span={12}>
                            <ProFormSelect 
                                label="Gender"
                                // disabled = {!!data}
                                name={'genderId'}
                                mode="single" 
                                options={[
                                        { value: 1, label: "Male" },
                                        { value: 2, label: "Female"}  
                                    ]}  
                            />
                        </Col>
                    </Row> 
                    {/* <ProFormText label="Place of Birth" name={'place_birth'} />  */}
                    <Row>
                        <Col span={12} style={{padding:'3px'}}>
                            <ProFormSelect 
                                label="Marital Status"
                                name={'maritalStatusId'}
                                options={[
                                    { value: 1, label: "Single" },
                                    { value: 2, label: "Married"},
                                    { value: 3, label: "Divorced"},
                                    { value: 4, label: "Widowed"}    
                                ]}  
                                // options={lookupList.filter(it => it.type == 'CONTACT_TYPE').map(it => ({ label: it.name, value: it.id }))}
                            />
                        </Col>                
                        <Col span={12} style={{padding:'3px'}}>     
                            <ProFormSelect 
                                label="Religion"
                                name={'religionId'}
                                options={[
                                    { value: 1, label: "Buddhism" },
                                    { value: 2, label: "Islam"}   
                                ]}  
                                // options={lookupList.filter(it => it.type == 'CONTACT_TYPE').map(it => ({ label: it.name, value: it.id }))}
                            />
                        </Col>       
                    </Row>
                    
                    <Row>
                        <Col span={12} style={{padding:'3px'}}>
                            <ProFormText label="National ID" name={'nationalId'} rules={[{max: 16,message: "Value should be less than 17 character"}]}/>
                        </Col>                
                        <Col span={12} style={{padding:'3px'}}>  
                            <ProFormText label="Passport Number" name={'passportNumber'} rules={[{max: 16,message: "Value should be less than 17 character"}]} />
                        </Col>                
                    </Row>
                    {/* <ProFormText label="Current Address" name={'current_address'} />
                    <ProFormText label="Permanent Address" name={'permanent_address'} /> */}
                </ProCard>
                {/* Dependent */}
                <div style={{marginTop:'10px'}}><Typography.Title level={5}>Dependent</Typography.Title></div>
                <ProCard bordered> 
                    <Row>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormSelect 
                                label="Relationship"
                                // disabled = {!!data}
                                name={'relationshipId'}
                                options={[
                                    { value: 1, label: "Hushand" },
                                    { value: 2, label: "Wife"},
                                    { value: 3, label: "Son"}  ,
                                    { value: 4, label: "Daughter"}  
                                ]}    
                                
                                // options={lookupList.filter(it => it.type == 'CONTACT_TYPE').map(it => ({ label: it.name, value: it.id }))}
                            />
                        </Col>                
                        <Col span={8} style={{padding:'3px'}}>       
                            <ProFormSelect 
                                label="Occupation"
                                name={'occupationId'}
                                options={[
                                    { value: 1, label: "Housewife" },
                                    { value: 2, label: "Student"},
                                    { value: 3, label: "Work"},
                                    { value: 4, label: "Farmer"}  
                                ]}  
                                // options={lookupList.filter(it => it.type == 'CONTACT_TYPE').map(it => ({ label: it.name, value: it.id }))}
                            />
                        </Col>                 
                        <Col span={8} style={{padding:'3px'}}>       
                            <ProFormDatePicker 
                                label="Date of Birth"
                                name={'dependDateOfBirth'}/>
                        </Col> 
                    </Row>

                </ProCard>

                {/* Place of birth  */}
                <div style={{marginTop:'10px'}}><Typography.Title level={5}>Place of Birth</Typography.Title></div>
                <ProCard bordered>
                    <Flex vertical={false} gap="middle" style={{width:'100%'}}>
                    <ProFormSelect 
                        label="City/ Province" 
                        name={'provincePbId'}
                        options={locations?.map((it) => {
                            return { value: it.id, label: it.internalName };
                        })}
                        fieldProps={{
                            onChange: (val) => {
                                setLoading(true);
                                districtList(val,1); 
                            }, 
                        }}
                    />         
                    {/*  */}
                    <ProFormSelect 
                        label="Khan/ District" 
                        name={'districtPbId'}
                        options={districtPB?.map((it) => {
                            return { value: it.id, label: it.internalName };
                        })}
                        fieldProps={{
                            onChange: (val) => {
                                setLoading(true);
                                communeList(val,1); 
                            }, 
                        }}
                    />         
                    {/*  */}
                    <ProFormSelect 
                        label="Sangkhat/ Commune" 
                        name={'communePbId'}
                        options={communePB?.map((it) => {
                            return { value: it.id, label: it.internalName };
                        })}
                    />
                    </Flex>
                </ProCard>

                {/* Permenant address  */}
                <div style={{marginTop:'10px'}}><Typography.Title level={5}>Permanent Address</Typography.Title></div>
                <ProCard bordered>
                    <Flex vertical={false} gap="middle"  justify="flex-start">
                    <ProFormSelect 
                        label="City/ Province" 
                        name={'provincePaId'}
                        options={locations?.map((it) => {
                            return { value: it.id, label: it.internalName };
                        })}
                        fieldProps={{
                            onChange: (val) => {
                                setLoading(true);
                                districtList(val,2); 
                            }, 
                        }}
                    />         
                    {/*  */}
                    <ProFormSelect 
                        label="Khan/ District" 
                        name={'districtPaId'}
                        options={districtPA?.map((it) => {
                            return { value: it.id, label: it.internalName };
                        })}
                        fieldProps={{
                            onChange: (val) => {
                                setLoading(true);
                                communeList(val,2); 
                            }, 
                        }}
                    />         
                    {/*  */}
                    <ProFormSelect 
                        label="Sangkhat/ Commune" 
                        name={'communePaId'}
                        options={communePA?.map((it) => {
                            return { value: it.id, label: it.internalName };
                        })}
                    />
                    </Flex>
                    
                    <Flex vertical={false} gap="middle" style={{width:'100%'}}>
                    {/*  */}
                    <ProFormText label="House No" name={'homePaNo'} />  
                    <ProFormText label="Street" name={'streetPa'} /> 
                    <ProFormText label="Group/Village" name={'villagePaId'} />
                    </Flex>
                </ProCard>

                {/* current address  */}
                <div style={{marginTop:'10px'}}><Typography.Title level={5}>Current Address</Typography.Title></div> 
                <ProCard bordered>
                <Flex vertical={false} gap="middle" style={{width:'100%'}}>
                    <ProFormSelect 
                        label="City/ Province" 
                        name={'provinceCrId'}
                        options={locations?.map((it) => {
                            return { value: it.id, label: it.internalName };
                        })}
                        fieldProps={{
                            onChange: (val) => {
                                setLoading(true);
                                districtList(val,3); 
                            }, 
                        }}
                    />         
                    {/*  */}
                    <ProFormSelect 
                        label="Khan/ District" 
                        name={'districtCrId'}
                        options={districtCA?.map((it) => {
                            return { value: it.id, label: it.internalName };
                        })}
                        fieldProps={{
                            onChange: (val) => {
                                setLoading(true);
                                communeList(val,3); 
                            }, 
                        }}
                    />         
                    {/*  */}
                    <ProFormSelect 
                        label="Sangkhat/ Commune" 
                        name={'communeCrId'}
                        options={communeCA?.map((it) => {
                            return { value: it.id, label: it.internalName };
                        })}
                    />
                    </Flex>
                    
                    <Flex vertical={false} gap="middle" style={{width:'100%'}}>
                    {/*  */}
                    <ProFormText label="House No" name={'homeCrNo'} />  
                    <ProFormText label="Street" name={'streetCr'} /> 
                    <ProFormText label="Group/Village" name={'villageCrId'} />
                    </Flex>
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
                        <List
                            grid={{ gutter: 5 }}
                            dataSource={files.filter((it) => it) || []}
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
            </Spin>
        </ModalForm>
    </div>
}