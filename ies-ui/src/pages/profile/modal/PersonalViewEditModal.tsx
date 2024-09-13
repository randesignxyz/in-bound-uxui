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

interface Props extends ModalFormProps<SaveEssProfile> { 
    data?: EssProfileData, 
    profile: ProfileData, 
    profile_draft?: EssProfileData, 
    locations?:LocationData[],
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
    const [isLoading,setLoading] = useState(false); 
    
    // const [attachFiles, setAttachFiles] = useState<any>(); 

    // const _files = '';
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
    // 
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
    var MF = ["" ,"Male","Female"];
    // 
    return <div>
        <ModalForm  {...rest} form={form} width={'40%'} title="View Edit Personal Information"
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
                        <Col span={12} style={{padding:'3px'}}>
                            <ProFormText label="Name KH" name={'nameKh'} allowClear={false} />
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':profile_draft!!.nameKh!!}`}}  />  
                        </Col>
                        <Col span={12} style={{padding:'3px'}}>
                            <ProFormText label="Name EN" name={'nameEn'} allowClear={false} />
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':profile_draft!!.nameEn!!}`}}  />
                        </Col> 
                    </Row>  
                    <Row>
                        <Col span={12}>
                            <ProFormDatePicker label="Date of Birth" name={'dateBirth'} allowClear={false} />
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':profile_draft!!.dateBirth!!}`}}  />  
                        </Col>                
                        <Col span={12}>
                            <ProFormSelect allowClear={false} 
                                label="Gender"
                                // disabled = {!!data}
                                name={'genderId'}
                                mode="single" 
                                options={[
                                        { value: 1, label: "Male" },
                                        { value: 2, label: "Female"}  
                                    ]}  
                            />
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
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
                            <Select defaultValue={profile_draft==null?'':profile_draft!!.maritalStatusId} style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;'}}                                
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
                            <Select defaultValue={profile_draft==null?'':profile_draft!!.religionId} style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;'}}    
                                options={profile.religion?.map((it) => {
                                    return { value: it.id, label: it.titleName };
                                })}  
                            /> 
                        </Col>       
                    </Row>
                     
                    {/*  */}
                    <Row>
                        <Col span={12} style={{padding:'3px'}}>
                            <ProFormCheckbox label="Married to OML Staff" name={"marriedWith"} />
                            <Checkbox checked={profile_draft==null?false:profile_draft!!.marriedWith} />
                        </Col>
                        <Col span={12} style={{padding:'3px'}}>
                            <ProFormDigit name={"spouseStaffId"} label="Spouse's OML Employee ID number"  allowClear={false} />
                            <ProFormText fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.spouseStaffId}`}} />
                        </Col>       
                    </Row>

                </ProCard>
                {/* Dependent */}
                {/* <div style={{marginTop:'10px'}}><Typography.Title level={5}>Dependent</Typography.Title></div>
                <ProCard bordered style={{backgroundColor:'#f5f5f5'}}>
                    <Row>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormSelect 
                                label="Relationship"
                                // disabled = {!!data}
                                name={'relationshipId'}
                                options={profile.relship?.map((it) => {
                                    return { value: it.id, label: it.titleName };
                                })} 
                                // options={[
                                //     { value: 1, label: "Hushand" },
                                //     { value: 2, label: "Wife"},
                                //     { value: 3, label: "Son"}  ,
                                //     { value: 4, label: "Daughter"}  
                                // ]}    
                                
                                // options={lookupList.filter(it => it.type == 'CONTACT_TYPE').map(it => ({ label: it.name, value: it.id }))}
                            />
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':relship[profile_draft!!.relationshipId!!]}`}}  />  
                        </Col>                
                        <Col span={8} style={{padding:'3px'}}>       
                            <ProFormSelect 
                                label="Occupation"
                                name={'occupationId'}                                
                                options={profile.oc?.map((it) => {
                                    return { value: it.id, label: it.titleName };
                                })} 
                                // options={[
                                //     { value: 1, label: "Housewife" },
                                //     { value: 2, label: "Student"},
                                //     { value: 3, label: "Work"},
                                //     { value: 4, label: "Farmer"}  
                                // ]}  
                                // options={lookupList.filter(it => it.type == 'CONTACT_TYPE').map(it => ({ label: it.name, value: it.id }))}
                            />
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':oc[profile_draft!!.occupationId!!]}`}}  />  
                        </Col>                 
                        <Col span={8} style={{padding:'3px'}}>       
                            <ProFormDatePicker 
                                label="Date of Birth"
                                name={'depend_date_of_birth'}/>
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':profile_draft!!.dependDateOfBirth!!}`}}  />  
                        </Col> 
                    </Row>

                </ProCard> */}
                
                {/* National ID */}
                <div style={{marginTop:'10px'}}><Typography.Title level={5}>National Brief</Typography.Title></div>
                <ProCard bordered style={{backgroundColor:'#f5f5f5'}}> 
                    <Row>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormText label="National ID" name={'nationalId'} allowClear={false} />
                            <ProFormText fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.nationalId}`}} />
                        </Col>                       
                        <Col span={8} style={{padding:'3px'}}>  
                            <ProFormText label="Issued Date" name={'nationalIssuedDate'} allowClear={false} />
                            <ProFormText fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.nationalIssuedDate}`}} />
                        </Col>   
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormText label="Expiry Date" name={'nationalExpiryDate'} allowClear={false} />
                            <ProFormText fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.nationalExpiryDate}`}} />
                        </Col>             
                    </Row>
                </ProCard>
                {/* Passport Number */}
                <div style={{marginTop:'10px'}}><Typography.Title level={5}>Passport Brief</Typography.Title></div>
                <ProCard bordered style={{backgroundColor:'#f5f5f5'}}> 
                    <Row>            
                        <Col span={8} style={{padding:'3px'}}>  
                            <ProFormText label="Passport Number" name={'passportNumber'} allowClear={false} />
                            <ProFormText fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.passportNumber}`}}  />
                        </Col>     
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormDatePicker label="Issued Date" name={'passportIssuedDate'} allowClear={false} />
                            <ProFormText fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.passportIssuedDate}`}}  />
                        </Col>         
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormDatePicker label="Expiry Date" name={'passportExpiryDate'} allowClear={false} />
                            <ProFormText fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.passportExpiryDate}`}}  />
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
                            <Select defaultValue={profile_draft==null?'':profile_draft!!.provincePbId} style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;'}}
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
                            <Select defaultValue={profile_draft==null?'':profile_draft!!.districtPbId} style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;'}}
                                options={districtPB?.map((it) => {
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
                            <Select defaultValue={profile_draft==null?'':profile_draft!!.communePbId} style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;'}}
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
                            <Select defaultValue={profile_draft==null?'':profile_draft!!.provincePaId} style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;'}}
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
                            <Select defaultValue={profile_draft==null?'':profile_draft!!.districtPaId} style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;'}}
                                options={districtPA?.map((it) => {
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
                            <Select defaultValue={profile_draft==null?'':profile_draft!!.communePaId} style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;'}}
                                options={communePA?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                            />
                        </Col>
                    </Row>
                    {/*  */} 
                    <Row>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormText label="House No" name={'homePaNo'} allowClear={false} />  
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':profile_draft!!.homePaNo!!}`}}  />  
                        </Col>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormText label="Street" name={'streetPa'} allowClear={false} /> 
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.streetPa}`}}  />  
                        </Col>    
                            <Col span={8} style={{padding:'3px'}}>
                            <ProFormText label="Group/Village" name={'villagePaId'} allowClear={false} />
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
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
                            <Select defaultValue={profile_draft==null?'':profile_draft!!.provinceCrId} style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;'}}
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
                            <Select defaultValue={profile_draft==null?'':profile_draft!!.districtCrId} style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;'}}
                                options={districtCA?.map((it) => {
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
                            <Select defaultValue={profile_draft==null?'':profile_draft!!.communeCrId} style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;'}}
                                options={communeCA?.map((it) => {
                                    return { value: it.id, label: it.name };
                                })}
                            />
                        </Col>
                    </Row>
                    {/*  */}  
                    <Row>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormText label="House No" name={'homeCrNo'} allowClear={false} />  
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.homeCrNo!!}`}}  /> 
                        </Col>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormText label="Street" name={'streetCr'} allowClear={false} /> 
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.streetCr}`}}  /> 
                        </Col>
                        <Col span={8} style={{padding:'3px'}}>
                            <ProFormText label="Group/Village" name={'villageCrId'} allowClear={false} />
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.villageCrId}`}}  />   
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