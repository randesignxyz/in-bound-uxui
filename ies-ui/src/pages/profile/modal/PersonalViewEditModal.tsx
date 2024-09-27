import { ModalForm, ModalFormProps, ProFormDatePicker, ProFormSelect, ProFormText,ProCard, ProFormTextArea, ProFormCheckbox, ProFormDigit} from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { SaveEssProfile,LocationData,FilesData, EssProfileData } from "../data.ess"
import { Image, Select, Spin,message,List, Checkbox,} from 'antd';
import { Space,Row, Col,Typography} from 'antd';
import { useEffect,useState } from 'react'; 
import { simpleRequestActions } from '@/services/model';
import { ProfileServicesEss } from '../service_ess';  
import ImagePreview from "@/components/ImagePreview";
import { ProfileData } from "../data";
import { formatDATEFUll } from "@/pages/utils";

interface Props extends ModalFormProps<SaveEssProfile> { 
    data?: EssProfileData;
    profile:ProfileData;
    profile_draft?: SaveEssProfile; 
    locations?:LocationData[];
    files: FilesData[];
}

export default ({ data,profile,profile_draft,locations,files, ...rest }: Props) => {
    const requestActions = simpleRequestActions();

    const [form] = useForm<SaveEssProfile>();
    const [districtPB, setDistrictPB] = useState<LocationData[]>();
    const [districtPA, setDistrictPA] = useState<LocationData[]>();
    const [districtCA, setDistrictCA] = useState<LocationData[]>();

    const [communePB, setCommunePB] = useState<LocationData[]>();
    const [communePA, setCommunePA] = useState<LocationData[]>();
    const [communeCA, setCommuneCA] = useState<LocationData[]>(); 

    
    const [districtPBNew, setDistrictPBNew] = useState<LocationData[]>();
    const [districtPANew, setDistrictPANew] = useState<LocationData[]>();
    const [districtCANew, setDistrictCANew] = useState<LocationData[]>();
    
    const [communePBNew, setCommunePBNew] = useState<LocationData[]>();
    const [communePANew, setCommunePANew] = useState<LocationData[]>();
    const [communeCANew, setCommuneCANew] = useState<LocationData[]>(); 

    const [isLoading,setLoading] = useState(false);  
    const [isOther, setIsOtherVisible] = useState(true);
    
    // const [attachFiles, setAttachFiles] = useState<any>(); 

    // const _files = '';
    useEffect(() => {
        initData();
    }, [data]);
    const initData = async () => { 
        // 
        form.setFieldsValue(profile.profile);
        // 
        if(!!data){ 
            // old data 
            districtList(profile.profile!!.provincePbId!!,1);
            communeList(profile.profile!!.districtPbId!!,1);
            //permenance address
            districtList(profile.profile!!.provincePaId!!,2);
            communeList(profile.profile!!.districtPaId!!,2);
            //current address
            districtList(profile.profile!!.provinceCrId!!,3);
            communeList(profile.profile!!.districtCrId!!,3);

            //  new data 
            districtListNew(profile_draft!!.provincePbId!!,1);
            communeListNew(profile_draft!!.districtPbId!!,1);
            //permenance address
            districtListNew(profile_draft!!.provincePaId!!,2);
            communeListNew(profile_draft!!.districtPaId!!,2);
            //current address
            districtListNew(profile_draft!!.provinceCrId!!,3);
            communeListNew(profile_draft!!.districtCrId!!,3); 
        
            // 
            if(profile_draft?.maritalStatusId==19){
                setIsOtherVisible(false);
            }
            else{ 
                setIsOtherVisible(true);
            }
        }  
    }; 
    // 
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
    
    // 
    const districtListNew = async(val:number,typeId:number)=>{
        try {
            const list = await ProfileServicesEss.listLocation(val).query(requestActions);
            if(typeId==1){// place of birth
                setDistrictPBNew(list); 
            }
            else if(typeId==2){ // permernant address
                setDistrictPANew(list); 
            }
            else if(typeId==3){ // current address
                setDistrictCANew(list); 
            } 
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            message.error(error.message || 'Failed to load data.');
        } 
    }
    const communeListNew = async(val:number,typeId:number)=>{
        try {
            const list = await ProfileServicesEss.listLocation(val).query(requestActions);
            if(typeId==1){// place of birth
                setCommunePBNew(list); 
            }
            else if(typeId==2){ // permernant address
                setCommunePANew(list); 
            }
            else if(typeId==3){ // current address
                setCommuneCANew(list); 
            }

            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            message.error(error.message || 'Failed to load data.');
        }  
    }  
    // 
    var MF = ["" ,"Male","Female"];
    // 
    return <div>
        <ModalForm  {...rest} form={form} width={'60%'} title="View Edit Personal Information"
            onOpenChange={visible => {
                form.resetFields() 
                rest.onOpenChange?.(visible)
            }}

            submitter={{
                searchConfig: {
                    submitText: 'Open Edit Form',
                    resetText: 'Close',
                },
            }} 
            > 
            <Spin spinning = {isLoading}> 
                <ProCard bordered style={{backgroundColor:'#f5f5f5'}}>
                    {/* short info */}
                    <Row> 
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormText label="Name KH" name={'nameKh'} allowClear={false} />
                            <ProFormText hidden={profile_draft?.nameKh==profile.profile?.nameKh?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':profile_draft!!.nameKh!!}`}}  />  
                        </Col>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormText label="Last Name EN" name={'lastNameEn'} allowClear={false} />
                            <ProFormText hidden={profile_draft?.lastNameEn==profile.profile?.lastNameEn?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':profile_draft!!.lastNameEn!!}`}}  />
                        </Col> 
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormText label="First Name EN" name={'firstNameEn'} allowClear={false} />
                            <ProFormText hidden={profile_draft?.firstNameEn==profile.profile?.firstNameEn?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':profile_draft!!.firstNameEn!!}`}}  />
                        </Col>  
                    </Row>  
                    <Row>
                        <Col span={12}>
                            <ProFormDatePicker label="Date of Birth" name={'dateBirth'} allowClear={false} />
                            <ProFormText hidden={profile_draft?.dateBirth==profile.profile?.dateBirth?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':profile_draft!!.dateBirth!!}`}}  />  
                        </Col>                
                        <Col span={12}>
                            <ProFormSelect allowClear={false} 
                                label="Gender" 
                                name={'genderId'}
                                mode="single" 
                                options={[
                                        { value: 1, label: "Male" },
                                        { value: 2, label: "Female"}  
                                    ]}  
                            />
                            <ProFormText hidden={profile_draft?.genderId==profile.profile?.genderId?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':MF[profile_draft!!.genderId!!]}`}}  />  
                        </Col>
                    </Row> 
                    {/* <ProFormText label="Place of Birth" name={'place_birth'} />  */}
                    <Row>
                        <Col span={12} style={{padding:'3px'}}>
                            <ProFormSelect allowClear={false} 
                                label="Marital Status"
                                name={'maritalStatusId'}
                                options={profile.marriedStatus?.map((it) => {
                                    return { value: it.id, label: it.titleName };
                                })}  
                            />   
                            <Select title="Marital Status" defaultValue={profile_draft? profile_draft?.maritalStatusId==profile.profile?.maritalStatusId?'':profile_draft!!.maritalStatusId:''} 
                                style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;',display:profile_draft?profile_draft?.maritalStatusId==profile.profile?.maritalStatusId?'none':'':''}}                                
                                options={profile.marriedStatus?.map((it) => {
                                    return { value: it.id, label: it.titleName };
                                })} 
                            />
                        </Col>                
                        <Col span={12} style={{padding:'3px'}}>     
                            <ProFormSelect allowClear={false} 
                                label="Religion"
                                name={'religionId'}
                                options={profile.religion?.map((it) => {
                                    return { value: it.id, label: it.titleName };
                                })}  
                            /> 
                            <Select defaultValue={profile_draft? profile_draft?.religionId==profile.profile?.religionId?'':profile_draft!!.religionId:''} 
                                style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;',display:profile_draft? profile_draft?.religionId==profile.profile?.religionId?'none':'':''}}    
                                options={profile.religion?.map((it) => {
                                    return { value: it.id, label: it.titleName };
                                })}  
                            /> 
                        </Col>       
                    </Row>
                     
                    {/*  */}
                    <Row>
                        <Col span={12} style={{padding:'3px'}}>
                            <ProFormCheckbox label="Married to OML Staff" name={"marriedWith"} hidden={profile.profile.marriedWith==true?false:true} />
                            <Checkbox style={{display:profile_draft?.marriedWith==true?'':'none'}} checked={profile_draft==null?false:profile_draft!!.marriedWith} />
                        </Col>
                        <Col span={12} style={{padding:'3px'}}>
                            <ProFormDigit name={"spouseStaffId"} label="Spouse's OML Employee ID number"  allowClear={false} hidden={profile.profile.marriedWith==true?false:true}/>
                            <ProFormText fieldProps={{ style: { color:'red',display:profile_draft?.spouseStaffId==""||profile_draft?.spouseStaffId==null?'none':'' },value:`${profile_draft==null?'':profile_draft!!.spouseStaffId}`}} />
                        </Col>       
                    </Row>

                </ProCard> 
                
                {/* National ID */}
                <div style={{marginTop:'10px'}}><Typography.Title level={5}>National ID</Typography.Title></div>
                <ProCard bordered style={{backgroundColor:'#f5f5f5'}}> 
                    <Row>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormText label="National ID" name={'nationalId'} allowClear={false} />
                            <ProFormText hidden={profile_draft?.nationalId==profile.profile?.nationalId?true:false} fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.nationalId}`}} />
                        </Col>                       
                        <Col span={8} style={{padding:'3px'}}>  
                            <ProFormDatePicker label="Issued Date" name={'nationalIssuedDate'} allowClear={false} />
                            <ProFormText hidden={profile_draft?.nationalIssuedDate==profile.profile?.nationalIssuedDate?true:false}  fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':formatDATEFUll(profile_draft!!.nationalIssuedDate)}`}} />
                        </Col>   
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormDatePicker label="Expiry Date" name={'nationalExpiryDate'} allowClear={false} />
                            <ProFormText hidden={profile_draft?.nationalExpiryDate==profile.profile?.nationalExpiryDate?true:false}  fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':formatDATEFUll(profile_draft!!.nationalExpiryDate)}`}} />
                        </Col>             
                    </Row>
                </ProCard>
                {/* Passport Number */}
                <div style={{marginTop:'10px'}}><Typography.Title level={5}>Passport ID</Typography.Title></div>
                <ProCard bordered style={{backgroundColor:'#f5f5f5'}}> 
                    <Row>            
                        <Col span={8} style={{padding:'3px'}}>  
                            <ProFormText label="Passport Number" name={'passportNumber'} allowClear={false} />
                            <ProFormText hidden={profile_draft?.passportNumber==profile.profile?.passportNumber?true:false} fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.passportNumber}`}}  />
                        </Col>     
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormDatePicker label="Issued Date" name={'passportIssuedDate'} allowClear={false} />
                            <ProFormText hidden={profile_draft?.passportIssuedDate==profile.profile?.passportIssuedDate?true:false} fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':formatDATEFUll(profile_draft!!.passportIssuedDate)}`}}  />
                        </Col>         
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormDatePicker label="Expiry Date" name={'passportExpiryDate'} allowClear={false} />
                            <ProFormText hidden={profile_draft?.passportExpiryDate==profile.profile?.passportExpiryDate?true:false} fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':formatDATEFUll(profile_draft!!.passportExpiryDate)}`}}  />
                        </Col>               
                    </Row>
                </ProCard> 

                {/* Place of birth  */}
                <div style={{marginTop:'10px'}}><Typography.Title level={5}>Place of Birth</Typography.Title></div>
                <ProCard bordered style={{backgroundColor:'#f5f5f5'}}> 
                    <Row>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormSelect allowClear={false} 
                                label="City/ Province" 
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
                            <Select defaultValue={profile_draft==null?'':profile_draft!!.provincePbId} 
                                style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;',display:profile_draft?.provincePbId==profile.profile?.provincePbId?'none':''}}
                                options={locations?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                            />
                        </Col>  
    
                        {/*  */}
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormSelect 
                                label="Khan/ District" allowClear={false} 
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
                            <Select defaultValue={profile_draft==null?'':profile_draft!!.districtPbId} 
                                style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;',display:profile_draft?.districtPbId==profile.profile?.districtPbId?'none':''}}
                                options={districtPBNew?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                            />
                        </Col>
                        {/*  */}
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormSelect allowClear={false} 
                                label="Sangkhat/ Commune" 
                                name={'communePbId'}
                                options={communePB?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                            />
                            <Select defaultValue={profile_draft==null?'':profile_draft!!.communePbId} 
                                style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;',display:profile_draft?.communePbId==profile.profile?.communePbId?'none':''}}
                                options={communePBNew?.map((it) => {
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
                            <ProFormSelect allowClear={false} 
                                label="City/ Province" 
                                name={'provincePaId'}
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
                            <Select defaultValue={profile_draft==null?'':profile_draft!!.provincePaId} 
                                style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;',display:profile_draft?.provincePaId==profile.profile?.provincePaId?'none':''}}
                                options={locations?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                            />
                        </Col>
                            {/*  */}
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormSelect allowClear={false} 
                                label="Khan/ District" 
                                name={'districtPaId'}
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
                            <Select defaultValue={profile_draft==null?'':profile_draft!!.districtPaId} 
                                style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;',display:profile_draft?.districtPaId==profile.profile?.districtPaId?'none':''}}
                                options={districtPANew?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                            />
                        </Col>   
                            {/*  */}
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormSelect allowClear={false} 
                                label="Sangkhat/ Commune" 
                                name={'communePaId'}
                                options={communePA?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                            />
                            <Select defaultValue={profile_draft==null?'':profile_draft!!.communePaId} 
                                style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;',display:profile_draft?.communePaId==profile.profile?.communePaId?'none':''}}
                                options={communePANew?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                            />
                        </Col>
                    </Row>
                    {/*  */} 
                    <Row>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormText label="House No" name={'homePaNo'} allowClear={false} />  
                            <ProFormText hidden={profile_draft?.homePaNo==profile.profile?.homePaNo?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':profile_draft!!.homePaNo!!}`}}  />  
                        </Col>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormText label="Street" name={'streetPa'} allowClear={false} /> 
                            <ProFormText hidden={profile_draft?.streetPa==profile.profile?.streetPa?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.streetPa}`}}  />  
                        </Col>    
                            <Col span={8} style={{padding:'3px'}}>
                            <ProFormText label="Group/Village" name={'villagePaId'} allowClear={false} />
                            <ProFormText hidden={profile_draft?.villagePaId==profile.profile?.villagePaId?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.villagePaId}`}}  />  
                        </Col> 
                    </Row>
                    {/* <ProFormTextArea name={'remarkPa'} label='Remark'/> */}
                </ProCard>

                {/* current address  */}
                <div style={{marginTop:'10px'}}><Typography.Title level={5}>Current Address</Typography.Title></div> 
                <ProCard bordered style={{backgroundColor:'#f5f5f5'}}>
                    <Row>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormSelect allowClear={false} 
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
                            <Select defaultValue={profile_draft==null?'':profile_draft!!.provinceCrId} 
                                style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;',display:profile_draft?.provinceCrId==profile.profile?.provinceCrId?'none':''}}
                                options={locations?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                            /> 
                        </Col>   
                        {/*  */}
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormSelect allowClear={false} 
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
                            <Select defaultValue={profile_draft==null?'':profile_draft!!.districtCrId} 
                                style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;',display:profile_draft?.districtCrId==profile.profile?.districtCrId?'none':''}}
                                options={districtCANew?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                            />
                        </Col>     
                        {/*  */}
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormSelect allowClear={false} 
                                label="Sangkhat/ Commune" 
                                name={'communeCrId'}
                                options={communeCA?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                            />
                            <Select defaultValue={profile_draft==null?'':profile_draft!!.communeCrId} 
                                style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;',display:profile_draft?.communeCrId==profile.profile?.communeCrId?'none':''}}
                                options={communeCANew?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                            />
                        </Col>
                    </Row>
                    {/*  */}  
                    <Row>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormText label="House No" name={'homeCrNo'} allowClear={false} />  
                            <ProFormText hidden={profile_draft?.homeCrNo==profile.profile?.homeCrNo?true:false} allowClear={false} fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.homeCrNo!!}`}}  /> 
                        </Col>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormText label="Street" name={'streetCr'} allowClear={false} /> 
                            <ProFormText hidden={profile_draft?.streetCr==profile.profile?.streetCr?true:false} allowClear={false} fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.streetCr}`}}  /> 
                        </Col>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormText label="Group/Village" name={'villageCrId'} allowClear={false} />
                            <ProFormText hidden={profile_draft?.villageCrId==profile.profile?.villageCrId?true:false} allowClear={false} fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.villageCrId}`}}  />   
                        </Col>
                    </Row>
                    {/* <ProFormTextArea name={'remarkCa'} label='Remark'/> */}
                </ProCard> 
                {/* Attachment files  */} 
                <div style={{marginTop:'10px'}}>
                    <Space direction="horizontal">
                        <Typography.Title level={5}>Attachments </Typography.Title> 
                    </Space>
                </div> 
                <ProCard size="small" bordered>   
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