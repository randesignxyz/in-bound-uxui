
  
import { Button, message, Modal, Space, Descriptions ,Card,Flex  } from 'antd';
import { ProfileData } from "../data" 
import { EditOutlined, DribbbleOutlined, BankOutlined,AimOutlined, EyeOutlined } from "@ant-design/icons";
import type { DescriptionsProps } from 'antd'; 
import { useState,useEffect } from 'react'; 
import { ProfileServicesEss } from '../service_ess'; 
import { EssProfileData, LocationData,SaveEssProfile } from "../data.ess"; 
import { simpleRequestActions } from '@/services/model';
import { ProCard } from "@ant-design/pro-components";
import PersonalModal from '../modal/PersonalModal';
import PersonalViewEditModal from '../modal/PersonalViewEditModal';

interface Props {
    profile: ProfileData; 
    step: any;
    is_admin:number;
    empId:number;
    cb:{ 
        onLoadData: () => void;  
    };
  }

export default ({ profile,step,is_admin,empId,cb}: Props) => {
    // 
    const [modalVisible, setModalVisible] = useState< { type: 'ADD'; payload: undefined } | { type: 'EDIT'; payload: EssProfileData } >();
    const [modalViewVisible, setModalViewVisible] = useState< { type: 'ADD'; payload: undefined } | { type: 'EDIT'; payload: EssProfileData } >();
    // const [placeBirthModalVisible, setPlaceBirthModalVisible] = useState< { type: 'ADD'; payload: undefined } | { type: 'EDIT'; payload: EssProfileData } >();
    // const [permanentAddressModalVisible, setPermanentAddressModalVisible] = useState< { type: 'ADD'; payload: undefined } | { type: 'EDIT'; payload: EssProfileData } >();
    // const [currentAddressModalVisible, setCurrentAddressModalVisible] = useState< { type: 'ADD'; payload: undefined } | { type: 'EDIT'; payload: EssProfileData } >();
    // 
    const hideModal = (visble?: boolean) => !visble && setModalVisible(undefined);
    const hideViewModal = (visble?: boolean) => !visble && setModalViewVisible(undefined); 
    // const hidePlaceBirthModal = (visble?: boolean) => !visble && setPlaceBirthModalVisible(undefined); 
    // const hidePermanentAddressModal = (visble?: boolean) => !visble && setPermanentAddressModalVisible(undefined); 
    // const hideCurrentAddressModal = (visble?: boolean) => !visble && setCurrentAddressModalVisible(undefined); 
    // 
    const [createFileOther, selectedFileOther] = useState<any>();
    const [stepId,setStepId] = useState(0);
    // 
    useEffect(()=> {
        initData(); 
    }, [step]); 
    // init
    const initData = async () => {  
        cb.onLoadData();
        setStepId(step);
    }    
    // 
    const requestActions = simpleRequestActions(); 

    var MF = ["" ,"Male","Female"];
    var MarriedStatus = ["" ,"Single","Married","Divorced","Widowed"];
    var Rg = ["" ,"Buddhism","Islam"]; 
    var relship = ["" ,"Hushand","Wife","Son","Daughter"]; 
    var oc = ["" ,"Housewife","Student","Work","Farmer"];
    //
    var pb = profile.profile_adr_pb?(profile.profile_adr_pb.province_name+" "+profile.profile_adr_pb.district_name+" "+profile.profile_adr_pb.commune_name):'N/A';
    var ct = profile.profile_adr_ct?(profile.profile_adr_ct.province_name+" "+profile.profile_adr_ct.district_name+" "+profile.profile_adr_ct.commune_name+" "+
            profile.profile_adr_ct.village_id+" "+profile.profile_adr_ct.home_no+" "+profile.profile_adr_ct.street+" "+profile.profile_adr_ct.remark):'';
    var pm = profile.profile_adr_pm?(profile.profile_adr_pm.province_name+" "+profile.profile_adr_pm.district_name+" "+profile.profile_adr_pm.commune_name+" "+
            profile.profile_adr_pm.village_id+" "+profile.profile_adr_pm.home_no+" "+profile.profile_adr_pm.street+" "+profile.profile_adr_pm.remark):''; 

    //
    const items: DescriptionsProps['items'] = [
        {
            key     : '1',
            label   : 'Name KH',
            children: <Flex vertical={'vertical'}><div>{profile.profile.name_kh}</div><div style={{color:'red',display:'none'}}>{"testing"}</div></Flex>,
        },
        {
            key     : '2',
            label   : 'Name EN',
            children: <Flex vertical={'vertical'}><div>{profile.profile.name_en}</div><div style={{color:'red',display:'none'}}>{"testing"}</div></Flex>,
        },
        {
            key     : '3',
            label   : 'Gender',
            children: MF[profile.profile.gender_id],
        },
        {
            key     : '4',
            label   : 'Date of Birth',
            children: profile.profile.date_birth,
        },
        {
            key     : '5',
            label   : 'Place of Birth',
            children: <div>
                            <Flex vertical={'vertical'}><div>{pb}</div><div style={{color:'red',display:'none'}}>{"testing"}</div></Flex>  
                        {/* {<a style={{display: step==2?'':'none'}} type="primary" onClick={() => setPlaceBirthModalVisible({ type: 'EDIT', payload: profile.profile })}> <EditOutlined /> </a>} */}
                    </div>,
            span    : 2,
        },
        {
            key     : '6',
            label   : 'Marital Status',
            children: MarriedStatus[profile.profile.marital_status_id],
        },
        {
            key     : '7',
            label   : 'Permanent Address',
            children: <div>
                            <Flex vertical={'vertical'}><div>{pm}</div><div style={{color:'red',display:'none'}}>{"testing"}</div></Flex> 
                            {/* {<a style={{display: step==2?'':'none'}} type="primary" onClick={() => setPermanentAddressModalVisible({ type: 'EDIT', payload: profile.profile })}> <EditOutlined /> </a>} */}
                        </div>,
            span    : 2,
        },
        {
            key     : '8',
            label   : 'Religion',
            children: Rg[profile.profile.religion_id],
        },
        {
            key     : '9',
            label   : 'Current Address',
            children: <div>
                        <Flex vertical={'vertical'}><div>{ct}</div>
                            {/* <div style={{color:'red',display: profile.profile_draft!==null?'':'none'}}> {profile.profile_draft.street_cr==profile.profile.street_cr?'':profile.profile_draft.street_cr}
                            </div> */}
                        </Flex>  
                    </div>,
                    // <div>{ct}  {<a style={{display: step==2?'':'none'}} type="primary" onClick={() => setCurrentAddressModalVisible({ type: 'EDIT', payload: profile.profile })}> <EditOutlined /> </a>}</div>, 
            span    : 2,
        },
        {
            key     : '10',
            label   : 'National ID',
            children: profile.profile.national_id,
        },
        {
            key     : '11',
            label   : 'Passport Number',
            children: profile.profile.passport_number,
        },
        {
            key     : '12',
            label   : 'Dependent',
            children: <div>{relship[profile.profile.relationship_id]+", "}  {profile.profile.depend_date_of_birth+", "}  {oc[profile.profile.occupation_id]} </div>,
        }
    ];
    //
    const saveEssProfileHandler = async (data: SaveEssProfile) => {
        Modal.confirm({
          title: 'Save Profile',
          content: 'Are you sure?',
          onOk: async () => {
            try {
                data.other_file = createFileOther;
                await ProfileServicesEss.saveEssProfile(data)(requestActions); 
                // call back fun
                cb.onLoadData();
                //
              if (modalVisible?.type == 'EDIT') hideModal();
            } catch (error: any) {
              message.error(error.message || 'Failed to Save Profile.');
            }
          },
        });
    };
    //
    const saveEssProfileAdrHandler = async (data: LocationData) => {
        Modal.confirm({
          title: 'Save Profile Address',
          content: 'Are you sure?',
          onOk: async () => {
            try {
                await ProfileServicesEss.saveEssProfileAdr(data)(requestActions); 
                // place of birth
                if(data.type_id == 1){
                    hidePlaceBirthModal();
                } else
                if(data.type_id == 2){
                    hidePermanentAddressModal();
                } else
                if(data.type_id == 3){
                    hideCurrentAddressModal();
                }
            } catch (error: any) {
              message.error(error.message || 'Failed to Save Profile Address.');
            }
          },
        });
    };
    // 
    const editFormEssProfileHandler = async () => {
        setModalVisible({ type: 'EDIT', payload: profile.profile});
        hideViewModal(false);
    }

    return <div>
        <Space direction="vertical">
            
            {/* personal info */}
            <ProCard bordered> 
                <div style={{width:'100%',textAlign:'right'}}>
                    <Space direction='horizontal'>
                        <Button onClick={() => setModalVisible({ type: 'EDIT', payload: profile.profile})} style={{display:(is_admin==2&&empId>0)?'':'none'}}><EditOutlined/> EDIT</Button>, 

                        <Button danger onClick={() => setModalViewVisible({ type: 'VIEW', payload: profile.profile!!})} 
                                style={{display:(stepId>=2&&is_admin==0)?'':'none'}}><EyeOutlined/> View edit</Button>

                        <Button style={{display: (step==2||step==7||step==5)&&is_admin==0?'':'none'}}
                            onClick={() => setModalVisible({ type: 'EDIT', payload: profile.profile_draft==null?profile.profile:profile.profile_draft })}
                            icon={<EditOutlined />}
                            key="1"
                            type="primary">
                            Edit
                        </Button>
                    </Space>
                </div>

                <Descriptions size="small" items={items}/>  
            </ProCard>

            {/* place of birth */}
            <ProCard style={{display:'none'}} title={<div><DribbbleOutlined /> Place of Birth</div>} bordered>  
                <div style={{width:'100%',textAlign:'right'}}>
                    <Button
                        onClick={() => setModalVisible({ type: 'EDIT', payload: profile.profile })}
                        icon={<EditOutlined />}
                        key="1"
                        type="primary">
                        Edit
                    </Button>
                </div>
                <Descriptions size="small" items={[
                        {
                            key     : '1',
                            label   : 'City/Province',
                            children: profile.profile.name_kh,
                        },{
                            key     : '2',
                            label   : 'Khan/District',
                            children: profile.profile.name_kh,
                        },{
                            key     : '3',
                            label   : 'Sangkan/Commune',
                            children: profile.profile.name_kh,
                        } 
                    ]}
                />            
            </ProCard> 
            {/* permanent address */}
            <ProCard style={{display:'none'}} title={<div><AimOutlined /> Permanent Address</div>} bordered>  
                <div style={{width:'100%',textAlign:'right'}}>
                    <Button
                        onClick={() => setModalVisible({ type: 'EDIT', payload: profile.profile })}
                        icon={<EditOutlined />}
                        key="1"
                        type="primary">
                        Edit
                    </Button>
                </div>
                <Descriptions size="small" items={[
                        {
                            key     : '1',
                            label   : 'City/Province',
                            children: profile.profile.name_kh,
                        },{
                            key     : '2',
                            label   : 'Khan/District',
                            children: profile.profile.name_kh,
                        },{
                            key     : '3',
                            label   : 'Sangkan/Commune',
                            children: profile.profile.name_kh,
                        },{
                            key     : '4',
                            label   : 'Home No',
                            children: profile.profile.name_kh,
                        },{
                            key     : '5',
                            label   : 'Street No',
                            children: profile.profile.name_kh,
                        },{
                            key     : '6',
                            label   : 'Group',
                            children: profile.profile.name_kh,
                        },{
                            key     : '7',
                            label   : 'Village',
                            children: profile.profile.name_kh,
                        } 
                    ]}
                />            
            </ProCard>              
            {/* current address */}
            <ProCard style={{display:'none'}} title={<div><BankOutlined /> Current Address</div>} bordered>  
                <div style={{width:'100%',textAlign:'right'}}>
                    <Button
                        onClick={() => setModalVisible({ type: 'EDIT', payload: profile.profile })}
                        icon={<EditOutlined />}
                        key="1"
                        type="primary">
                        Edit
                    </Button>
                </div>
                <Descriptions size="small" items={[
                        {
                            key     : '1',
                            label   : 'City/Province',
                            children: profile.profile.name_kh,
                        },{
                            key     : '2',
                            label   : 'Khan/District',
                            children: profile.profile.name_kh,
                        },{
                            key     : '3',
                            label   : 'Sangkan/Commune',
                            children: profile.profile.name_kh,
                        },{
                            key     : '4',
                            label   : 'Home No',
                            children: profile.profile.name_kh,
                        },{
                            key     : '5',
                            label   : 'Street No',
                            children: profile.profile.name_kh,
                        },{
                            key     : '6',
                            label   : 'Group',
                            children: profile.profile.name_kh,
                        },{
                            key     : '7',
                            label   : 'Village',
                            children: profile.profile.name_kh,
                        } 
                    ]}
                />             
            </ProCard>   
        </Space> 
        {/* personal */}
        <PersonalModal
            open={!!modalVisible?.type}
            locations={profile?.essLocation}
            onOpenChange={(visible) => hideModal(visible)}
            data={modalVisible?.payload}
            profile_draft={profile.profile_draft}
            files={profile.essAttachFill}
            isAdmin={is_admin}
            empId={empId}
            cb={{
                onLoadMenu: (tid) => { 
                    selectedFileOther(tid);
                },
                onReload:()=>{
                    hideModal();
                    initData();
                }
            }}
            onFinishFailed={(error) => {
            message.error(
                <Space direction="vertical" align="start">
                {error.errorFields.map((it) => (
                    <div>{it.errors.join(', ')}</div>
                ))}
                </Space>,
            );
            }}
            onFinish={(data) => {
                return saveEssProfileHandler({ ...data, ess_prof_id: modalVisible?.payload?.id, empId: profile.id,status:true,step:22,remark:'' });
            }}
        /> 
        {/* PersonalViewEditModal */}        
        <PersonalViewEditModal
            open={!!modalViewVisible?.type}
            locations={profile?.essLocation}
            onOpenChange={(visible) => hideViewModal(visible)}
            data={modalViewVisible?.payload}
            profile_draft={profile.profile_draft}
            files={profile.essAttachFill}
            onFinishFailed={(error) => {
            message.error(
                <Space direction="vertical" align="start">
                {error.errorFields.map((it) => (
                    <div>{it.errors.join(', ')}</div>
                ))}
                </Space>,
            );
            }}
            onFinish={(data) => {
                return editFormEssProfileHandler();
            }}
        />
{/* 
        <PlaceBirthModal
            open={!!placeBirthModalVisible?.type}
            locations={profile?.essLocation}
            onOpenChange={(visible) => hidePlaceBirthModal(visible)}
            data={placeBirthModalVisible?.payload}
            onFinishFailed={(error) => {
            message.error(
                <Space direction="vertical" align="start">
                {error.errorFields.map((it) => (
                    <div>{it.errors.join(', ')}</div>
                ))}
                </Space>,
            );
            }}
            onFinish={(data) => {
                return saveEssProfileAdrHandler({ ...data, empId: profile.id,home_no:'',street:'',village_id:'',type_id:1, remark:'',status:1});
            }}
        />
        
        <PermanentAddressModal
            open={!!permanentAddressModalVisible?.type}
            locations={profile?.essLocation}
            onOpenChange={(visible) => hidePermanentAddressModal(visible)}
            data={permanentAddressModalVisible?.payload}
            onFinishFailed={(error) => {
            message.error(
                <Space direction="vertical" align="start">
                {error.errorFields.map((it) => (
                    <div>{it.errors.join(', ')}</div>
                ))}
                </Space>,
            );
            }}
            onFinish={(data) => {
                return saveEssProfileAdrHandler({ ...data, empId: profile.id,type_id:2,status:1});
            }}
        />
        
        <CurrentAddressModal
            open={!!currentAddressModalVisible?.type}
            locations={profile?.essLocation}
            onOpenChange={(visible) => hideCurrentAddressModal(visible)}
            data={currentAddressModalVisible?.payload}
            onFinishFailed={(error) => {
            message.error(
                <Space direction="vertical" align="start">
                {error.errorFields.map((it) => (
                    <div>{it.errors.join(', ')}</div>
                ))}
                </Space>,
            );
            }}
            onFinish={(data) => {
                return saveEssProfileAdrHandler({ ...data,empId: profile.id,type_id:3,status:1});
            }}
        /> */}
    </div>
}