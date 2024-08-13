import { ModalForm, ModalFormProps, ProFormDatePicker, ProFormSelect, ProFormText,ProCard, ProFormTextArea} from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { SaveEssProfile,LocationData,FilesData, EssProfileData } from "../data.ess"
import { Image, Select, Spin,message,List,} from 'antd';
import { Space,Row, Col,Typography} from 'antd';
import { useEffect,useState } from 'react'; 
import { simpleRequestActions } from '@/services/model';
import { ProfileServicesEss } from '../service_ess';  
import ImagePreview from "@/components/ImagePreview";

interface Props extends ModalFormProps<SaveEssProfile> { 
    data?: SaveEssProfile, 
    profile_draft?: EssProfileData, 
    locations?:LocationData[],
    files: FilesData[];
}

export default ({ data,profile_draft,locations,files, ...rest }: Props) => {
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
            districtList(data!!.province_pb_id,1);
            communeList(data!!.district_pb_id,1);
            //permenance address
            districtList(data!!.province_pa_id,2);
            communeList(data!!.district_pa_id,2);
            //current address
            districtList(data!!.province_cr_id,3);
            communeList(data!!.district_cr_id,3);
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
    var MarriedStatus = ["" ,"Single","Married","Divorced","Widowed"];
    var Rg = ["" ,"Buddhism","Islam"]; 
    var relship = ["" ,"Hushand","Wife","Son","Daughter"]; 
    var oc = ["" ,"Housewife","Student","Work","Farmer"]; 
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
                <ProCard bordered>
                    <ProFormText label="Name KH" name={'name_kh'} />
                    <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                        fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':profile_draft!!.name_kh!!}`}}  />  
                    <ProFormText label="Name EN" name={'name_en'} />
                    <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                        fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':profile_draft!!.name_en!!}`}}  />  
                    <Row>
                        <Col span={12}>
                            <ProFormDatePicker label="Date of Birth" name={'date_birth'} />
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':profile_draft!!.date_birth!!}`}}  />  
                        </Col>                
                        <Col span={12}>
                            <ProFormSelect 
                                label="Gender"
                                // disabled = {!!data}
                                name={'gender_id'}
                                mode="single" 
                                options={[
                                        { value: 1, label: "Male" },
                                        { value: 2, label: "Female"}  
                                    ]}  
                            />
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':MF[profile_draft!!.gender_id!!]}`}}  />  
                        </Col>
                    </Row> 
                    {/* <ProFormText label="Place of Birth" name={'place_birth'} />  */}
                    <Row>
                        <Col span={12} style={{padding:'3px'}}>
                            <ProFormSelect 
                                label="Marital Status"
                                name={'marital_status_id'}
                                options={[
                                    { value: 1, label: "Single" },
                                    { value: 2, label: "Married"},
                                    { value: 3, label: "Divorced"},
                                    { value: 4, label: "Widowed"}    
                                ]}  
                                // options={lookupList.filter(it => it.type == 'CONTACT_TYPE').map(it => ({ label: it.name, value: it.id }))}
                            />
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':MarriedStatus[profile_draft!!.marital_status_id!!]}`}}  />  
                        </Col>                
                        <Col span={12} style={{padding:'3px'}}>     
                            <ProFormSelect 
                                label="Religion"
                                name={'religion_id'}
                                options={[
                                    { value: 1, label: "Buddhism" },
                                    { value: 2, label: "Islam"}   
                                ]}  
                                // options={lookupList.filter(it => it.type == 'CONTACT_TYPE').map(it => ({ label: it.name, value: it.id }))}
                            />
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':Rg[profile_draft!!.religion_id!!]}`}}  />  
                        </Col>       
                    </Row>
                    
                    <Row>
                        <Col span={12} style={{padding:'3px'}}>
                            <ProFormText label="National ID" name={'national_id'} rules={[{max: 16,message: "Value should be less than 17 character"}]}/>
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':profile_draft!!.national_id!!}`}}  />  
                        </Col>                
                        <Col span={12} style={{padding:'3px'}}>  
                            <ProFormText label="Passport Number" name={'passport_number'} rules={[{max: 16,message: "Value should be less than 17 character"}]} />
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':profile_draft!!.passport_number!!}`}}  />  
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
                                name={'relationship_id'}
                                options={[
                                    { value: 1, label: "Hushand" },
                                    { value: 2, label: "Wife"},
                                    { value: 3, label: "Son"}  ,
                                    { value: 4, label: "Daughter"}  
                                ]}    
                                
                                // options={lookupList.filter(it => it.type == 'CONTACT_TYPE').map(it => ({ label: it.name, value: it.id }))}
                            />
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':relship[profile_draft!!.relationship_id!!]}`}}  />  
                        </Col>                
                        <Col span={8} style={{padding:'3px'}}>       
                            <ProFormSelect 
                                label="Occupation"
                                name={'occupation_id'}
                                options={[
                                    { value: 1, label: "Housewife" },
                                    { value: 2, label: "Student"},
                                    { value: 3, label: "Work"},
                                    { value: 4, label: "Farmer"}  
                                ]}  
                                // options={lookupList.filter(it => it.type == 'CONTACT_TYPE').map(it => ({ label: it.name, value: it.id }))}
                            />
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':oc[profile_draft!!.occupation_id!!]}`}}  />  
                        </Col>                 
                        <Col span={8} style={{padding:'3px'}}>       
                            <ProFormDatePicker 
                                label="Date of Birth"
                                name={'depend_date_of_birth'}/>
                            <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                                fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':profile_draft!!.depend_date_of_birth!!}`}}  />  
                        </Col> 
                    </Row>

                </ProCard>

                {/* Place of birth  */}
                <div style={{marginTop:'10px'}}><Typography.Title level={5}>Place of Birth</Typography.Title></div>
                <ProCard bordered>
                    <ProFormSelect 
                        label="City/ Province" 
                        name={'province_pb_id'}
                        options={locations?.map((it) => {
                            return { value: it.id, label: it.internal_name };
                        })}
                        fieldProps={{
                            onChange: (val) => {
                                setLoading(true);
                                districtList(val,1); 
                            }, 
                        }}
                    />    
                    <Select defaultValue={profile_draft==null?'':profile_draft!!.province_pb_id} style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;'}}
                        options={locations?.map((it) => {
                            return { value: it.id, label: it.internal_name };
                        })}
                    />
 
                    {/*  */}
                    <ProFormSelect 
                        label="Khan/ District" 
                        name={'district_pb_id'}
                        options={districtPB?.map((it) => {
                            return { value: it.id, label: it.internal_name };
                        })}
                        fieldProps={{
                            onChange: (val) => {
                                setLoading(true);
                                communeList(val,1); 
                            }, 
                        }}
                    />         
                    <Select defaultValue={profile_draft==null?'':profile_draft!!.district_pb_id} style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;'}}
                        options={districtPB?.map((it) => {
                            return { value: it.id, label: it.internal_name };
                        })}
                    />
                    {/*  */}
                    <ProFormSelect 
                        label="Sangkhat/ Commune" 
                        name={'commune_pb_id'}
                        options={communePB?.map((it) => {
                            return { value: it.id, label: it.internal_name };
                        })}
                    />
                    <Select defaultValue={profile_draft==null?'':profile_draft!!.commune_pb_id} style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;'}}
                        options={communePB?.map((it) => {
                            return { value: it.id, label: it.internal_name };
                        })}
                    />
                </ProCard>

                {/* Permenant address  */}
                <div style={{marginTop:'10px'}}><Typography.Title level={5}>Permanent Address</Typography.Title></div>
                <ProCard bordered>
                    <ProFormSelect 
                        label="City/ Province" 
                        name={'province_pa_id'}
                        options={locations?.map((it) => {
                            return { value: it.id, label: it.internal_name };
                        })}
                        fieldProps={{
                            onChange: (val) => {
                                setLoading(true);
                                districtList(val,2); 
                            }, 
                        }}
                    />         
                    <Select defaultValue={profile_draft==null?'':profile_draft!!.province_pa_id} style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;'}}
                        options={locations?.map((it) => {
                            return { value: it.id, label: it.internal_name };
                        })}
                    />
                    {/*  */}
                    <ProFormSelect 
                        label="Khan/ District" 
                        name={'district_pa_id'}
                        options={districtPA?.map((it) => {
                            return { value: it.id, label: it.internal_name };
                        })}
                        fieldProps={{
                            onChange: (val) => {
                                setLoading(true);
                                communeList(val,2); 
                            }, 
                        }}
                    />      
                    <Select defaultValue={profile_draft==null?'':profile_draft!!.district_pa_id} style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;'}}
                        options={districtPA?.map((it) => {
                            return { value: it.id, label: it.internal_name };
                        })}
                    />   
                    {/*  */}
                    <ProFormSelect 
                        label="Sangkhat/ Commune" 
                        name={'commune_pa_id'}
                        options={communePA?.map((it) => {
                            return { value: it.id, label: it.internal_name };
                        })}
                    />
                    <Select defaultValue={profile_draft==null?'':profile_draft!!.commune_pa_id} style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;'}}
                        options={communePA?.map((it) => {
                            return { value: it.id, label: it.internal_name };
                        })}
                    />
                    {/*  */}
                    <ProFormText label="House No" name={'home_pa_no'} />  
                    <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                        fieldProps={{ style: { color:'red',marginTop:'-10px' },value:`${profile_draft==null?'':profile_draft!!.home_pa_no!!}`}}  />  
                    <ProFormText label="Street" name={'street_pa'} /> 
                    <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                        fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.street_pa}`}}  />  
                    <ProFormText label="Group/Village" name={'village_pa_id'} />
                    <ProFormText hidden={profile_draft==null?true:false} allowClear={false} 
                        fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.village_pa_id}`}}  />  
                    {/* <ProFormTextArea name={'remark_pa'} label='Remark'/> */}
                </ProCard>

                {/* current address  */}
                <div style={{marginTop:'10px'}}><Typography.Title level={5}>Current Address</Typography.Title></div> 
                <ProCard bordered>
                    <ProFormSelect 
                        label="City/ Province" 
                        name={'province_cr_id'}
                        options={locations?.map((it) => {
                            return { value: it.id, label: it.internal_name };
                        })}
                        fieldProps={{
                            onChange: (val) => {
                                setLoading(true);
                                districtList(val,3); 
                            }, 
                        }}
                    />     
                    <Select defaultValue={profile_draft==null?'':profile_draft!!.province_cr_id} style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;'}}
                        options={locations?.map((it) => {
                            return { value: it.id, label: it.internal_name };
                        })}
                    />    
                    {/*  */}
                    <ProFormSelect 
                        label="Khan/ District" 
                        name={'district_cr_id'}
                        options={districtCA?.map((it) => {
                            return { value: it.id, label: it.internal_name };
                        })}
                        fieldProps={{
                            onChange: (val) => {
                                setLoading(true);
                                communeList(val,3); 
                            }, 
                        }}
                    />    
                    <Select defaultValue={profile_draft==null?'':profile_draft!!.district_cr_id} style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;'}}
                        options={districtCA?.map((it) => {
                            return { value: it.id, label: it.internal_name };
                        })}
                    />     
                    {/*  */}
                    <ProFormSelect 
                        label="Sangkhat/ Commune" 
                        name={'commune_cr_id'}
                        options={communeCA?.map((it) => {
                            return { value: it.id, label: it.internal_name };
                        })}
                    />
                    <Select defaultValue={profile_draft==null?'':profile_draft!!.commune_cr_id} style={{width:'100%',marginTop:'-20px',marginBottom:'15px',color:'red!important;'}}
                        options={communeCA?.map((it) => {
                            return { value: it.id, label: it.internal_name };
                        })}
                    />
                    {/*  */}
                    <ProFormText label="House No" name={'home_cr_no'} />  
                    <ProFormText hidden={profile_draft==null?true:false} allowClear={false} fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.home_cr_no!!}`}}  /> 
                    <ProFormText label="Street" name={'street_cr'} /> 
                    <ProFormText hidden={profile_draft==null?true:false} allowClear={false} fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.street_cr}`}}  /> 
                    <ProFormText label="Group/Village" name={'village_cr_id'} />
                    <ProFormText hidden={profile_draft==null?true:false} allowClear={false} fieldProps={{ style: { color:'red' },value:`${profile_draft==null?'':profile_draft!!.village_cr_id}`}}  />   
                    {/* <ProFormTextArea name={'remark_ca'} label='Remark'/> */}
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