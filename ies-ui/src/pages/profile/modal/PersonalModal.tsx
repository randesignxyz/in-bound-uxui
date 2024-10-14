import { ModalForm, ModalFormProps, ProFormDatePicker, ProFormSelect, ProFormText,ProCard, ProFormTextArea, ProFormCheckbox, ProFormDigit} from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { SaveEssProfile,LocationData, FilesData, EssProfileData } from "../data.ess"
import { Image, Flex, Spin, List,message, Button, Modal,InputNumber} from 'antd';
import { Space,Row, Col,Typography} from 'antd';
import { useEffect,useState } from 'react'; 
import { simpleRequestActions } from '@/services/model';
import { ProfileServicesEss } from '../service_ess';  
import FileUploader , { UploadType } from '@/components/Attachment/FileUploader';
import ImagePreview from "@/components/ImagePreview";
import { ProfileData } from "../data";
import { DeliveredProcedureOutlined,SaveOutlined,CloseSquareOutlined,ProfileOutlined } from "@ant-design/icons";

interface Props extends ModalFormProps<SaveEssProfile> { 
    data?: EssProfileData;
    profile:ProfileData;
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

export default ({ data,profile,profile_draft,locations,files,isAdmin,empId,cb, ...rest }: Props) => {
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
    const [isOther, setIsOtherVisible] = useState(true);

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
            // 
            if(data?.maritalStatusId==19){
                setIsOtherVisible(false);
            }
            else{ 
                setIsOtherVisible(true);
            }
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
        // attachment files
        if(isAdmin!=2){
            if(createFileOther.length==0){  
                message.error('Please do select attachment files.');
                return false;
            } 
        }
        // submit
        Modal.confirm({
            title: 'Save Profile',
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
    //
    const onCloneAddress = async (nData:SaveEssProfile) => {  
        // reload data
        districtList(nData!!.provincePaId!!,3);
        communeList(nData!!.districtPaId!!,3);
        // bind data to current address
        form.setFieldsValue({
            provinceCrId:nData.provincePaId,
            districtCrId:nData.districtPaId,
            communeCrId:nData.communePaId,
            homeCrNo:nData.homePaNo,
            streetCr:nData.streetPa,
            villageCrId:nData.villagePaId
        }); 
    }
    return <div>
        <ModalForm  {...rest} form={form} width={'60%'} title={<><ProfileOutlined /> Edit Personal Information</>}
            // onOpenChange={visible => {
            //     form.resetFields() 
            //     rest.onOpenChange?.(visible)
            // }}

            submitter={isAdmin==2&&empId>0?
                {
                    render: () => { 
                    return <><Button type="primary" onClick={()=>{onAdminSubmit();}}><SaveOutlined /> Save</Button></>
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
                <ProCard bordered style={{backgroundColor:'#f5f5f5'}}> 
                    <Row>
                        <Col span={8} style={{padding:'3px'}}> 
                            <ProFormText label="Name KH" name={'nameKh'} placeholder={"គោត្តនាម និង នាម"}/>
                        </Col>    
                        <Col span={8} style={{padding:'3px'}}> 
                            <ProFormText label="Last Name EN" name={'firstNameEn'} placeholder={"Given Name"}/>
                        </Col>    
                        <Col span={8} style={{padding:'3px'}}> 
                            <ProFormText label="First Name EN" name={'lastNameEn'} placeholder={"Family name"}/>
                        </Col>    
                    </Row>
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
                                options={profile.marriedStatus?.map((it) => {
                                    return { value: it.id, label: it.titleName };
                                })}  
                                fieldProps={{
                                    onChange: (val) => { 
                                        if(val==19){
                                            setIsOtherVisible(false);
                                        }else{ 
                                            setIsOtherVisible(true);
                                        }
                                    }, 
                                }} 
                                
                            />
                        </Col>                
                        <Col span={12} style={{padding:'3px'}}>     
                            <ProFormSelect 
                                label="Religion"
                                name={'religionId'}
                                options={profile.religion?.map((it) => {
                                    return { value: it.id, label: it.titleName };
                                })}  
                            />
                        </Col>       
                    </Row>
                    
                    {/*  */}
                    <Row hidden={isOther}>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormCheckbox label="Married to OML Staff" name={"marriedWith"} placeholder={"Married to OML Staff"}/>
                        </Col>
                        <Col span={12} style={{padding:'3px'}}>
                            <ProFormDigit label="Spouse's OML Employee ID number" name={"spouseStaffId"} placeholder={"000000"} />
                        </Col>       
                    </Row>

                     
                </ProCard>  
                {/* National ID */}
                <div style={{marginTop:'10px'}}><Typography.Title level={5}>National ID</Typography.Title></div>
                <ProCard bordered style={{backgroundColor:'#f5f5f5'}}> 
                    <Row>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormText label="National ID" name={'nationalId'} rules={[{max: 16,message: "Value should be less than 17 character"}]}/>
                        </Col>                       
                        <Col span={8} style={{padding:'3px'}}>  
                            <ProFormDatePicker label="Issued Date" name={'nationalIssuedDate'} />
                        </Col>   
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormDatePicker label="Expiry Date" name={'nationalExpiryDate'}/>
                        </Col>             
                    </Row>
                </ProCard>
                {/* Passport Number */}
                <div style={{marginTop:'10px'}}><Typography.Title level={5}>Passport ID</Typography.Title></div>
                <ProCard bordered style={{backgroundColor:'#f5f5f5'}}> 
                    <Row>            
                        <Col span={8} style={{padding:'3px'}}>  
                            <ProFormText label="Passport Number" name={'passportNumber'} rules={[{max: 16,message: "Value should be less than 17 character"}]} />
                        </Col>     
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormDatePicker label="Issued Date" name={'passportIssuedDate'} />
                        </Col>         
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormDatePicker label="Expiry Date" name={'passportExpiryDate'} />
                        </Col>               
                    </Row>
                </ProCard> 

                {/* Place of birth  */}
                <div style={{marginTop:'10px'}}><Typography.Title level={5}>Place of Birth</Typography.Title></div>
                <ProCard bordered style={{backgroundColor:'#f5f5f5'}}> 
                    <Row>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormSelect rules={[{ required: true }]}
                                label="City/ Province" 
                                showSearch
                                name={'provincePbId'}
                                options={locations?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                                fieldProps={{
                                    onChange: (val) => {
                                        setLoading(true);
                                        districtList(val,1); 
                                    }, 
                                }}
                            />
                        </Col> 
                        <Col span={8} style={{padding:'3px'}}>         
                            {/*  */}
                            <ProFormSelect rules={[{ required: true }]}
                                label="Khan/ District" 
                                showSearch
                                name={'districtPbId'}
                                options={districtPB?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                                fieldProps={{
                                    onChange: (val) => {
                                        setLoading(true);
                                        communeList(val,1); 
                                    }, 
                                }}
                            />  
                        </Col> 
                        <Col span={8} style={{padding:'3px'}}>      
                            {/*  */}
                            <ProFormSelect rules={[{ required: true }]}
                                label="Sangkhat/ Commune" 
                                showSearch
                                name={'communePbId'}
                                options={communePB?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                            />
                        </Col>
                    </Row>
                </ProCard>

                {/* Permenant address  */}
                <div style={{marginTop:'10px'}}><Typography.Title level={5}>Permanent Address</Typography.Title></div>
                <ProCard bordered style={{backgroundColor:'#f5f5f5'}}> 
                    <Row>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormSelect rules={[{ required: true }]}
                                label="City/ Province" 
                                name={'provincePaId'}
                                showSearch
                                options={locations?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                                fieldProps={{
                                    onChange: (val) => {
                                        setLoading(true);
                                        districtList(val,2); 
                                    }, 
                                }}
                            />     
                        </Col> 
                        <Col span={8} style={{padding:'3px'}}>   
                        {/*  */}
                            <ProFormSelect rules={[{ required: true }]}
                                label="Khan/ District" 
                                name={'districtPaId'}
                                showSearch
                                options={districtPA?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                                fieldProps={{
                                    onChange: (val) => {
                                        setLoading(true);
                                        communeList(val,2); 
                                    }, 
                                }}
                            />         
                        </Col> 
                    {/*  */}
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormSelect rules={[{ required: true }]}
                                label="Sangkhat/ Commune" 
                                name={'communePaId'}
                                showSearch
                                options={communePA?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                            />
                        </Col>
                    </Row>
                    
                    <Flex vertical={false} gap="middle" style={{width:'100%'}}>
                    {/*  */}
                    <ProFormText label="House No" name={'homePaNo'} rules={[{ required: true }]}/>  
                    <ProFormText label="Street" name={'streetPa'} rules={[{ required: false }]}/> 
                    <ProFormText label="Group/Village" name={'villagePaId'} />
                    </Flex>
                </ProCard>

                {/* current address  */}
                <div style={{marginTop:'10px'}}>
                    <Typography.Title level={5}>Current Address</Typography.Title> 
                    <Button onClick={(e)=>onCloneAddress(form.getFieldsValue())}><DeliveredProcedureOutlined /> Copy from Permanent Address</Button>
                </div> 
                <ProCard bordered style={{backgroundColor:'#f5f5f5'}}> 
                    <Row>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormSelect rules={[{ required: true }]}
                                showSearch
                                label="City/ Province" 
                                name={'provinceCrId'}
                                options={locations?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                                fieldProps={{
                                    onChange: (val) => {
                                        setLoading(true);
                                        districtList(val,3); 
                                    }, 
                                }}
                            />      
                        </Col>  
                        <Col span={8} style={{padding:'3px'}}>  
                            {/*  */}
                            <ProFormSelect rules={[{ required: true }]}
                                showSearch
                                label="Khan/ District" 
                                name={'districtCrId'}
                                options={districtCA?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                                fieldProps={{
                                    onChange: (val) => {
                                        setLoading(true);
                                        communeList(val,3); 
                                    }, 
                                }}
                            />  
                        </Col>        
                    {/*  */}
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormSelect rules={[{ required: true }]}
                                showSearch
                                label="Sangkhat/ Commune" 
                                name={'communeCrId'}
                                options={communeCA?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                            />
                        </Col> 
                    </Row>
                    
                    <Flex vertical={false} gap="middle" style={{width:'100%'}}>
                    {/*  */}
                    <ProFormText label="House No" name={'homeCrNo'} rules={[{ required: true }]}/>  
                    <ProFormText label="Street" name={'streetCr'} rules={[{ required: false }]}/> 
                    <ProFormText label="Group/Village" name={'villageCrId'} />
                    </Flex>
                </ProCard>
                 {/* Attachment files  */} 
                <div style={{marginTop:'10px'}}>
                    <Space direction="horizontal">
                        <Typography.Title level={5}>Attachments </Typography.Title><Typography.Title level={5} style={{color:'red'}}> (Required*)</Typography.Title>
                        
                    </Space>
                    <div style={{fontSize:'12px'}}>- National ID (for updating ID number, Name, DOB, Expiry date)</div>
                    <div style={{fontSize:'12px'}}>- Passport (for updating Passport number, Name, DOB, Expiry date)</div> 
                    {/* <div style={{fontSize:'12px'}}>- Marriage Certificate (for updating marital status)</div>  */}
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