import ImageProfileUploader from '@/components/ImageProfileUploader';
import { simpleRequestActions } from '@/services/model';
import { ProDescriptions, ProFormTextArea } from '@ant-design/pro-components';
import { PageContainer, RouteContext } from '@ant-design/pro-components';
import { Alert, message, Spin,Space, Modal,Button} from 'antd';
import { history, useParams } from '@umijs/max';
import { useEffect } from 'react';
import { useState } from 'react';
import { formatDate, formatDateTime } from '../utils';
import { ProfileData } from './data';
import { EssProfileData, SaveEssProfile } from "./data.ess"
import Personal from './tabitems/Personal';
import Relationship from './tabitems/Relationship';
import Emergency from './tabitems/Emergency';
import Education from './tabitems/Education';
import Languages from './tabitems/Languages';
import Training from './tabitems/Training';
import Experiences from './tabitems/Experiences';
import { ProfileServices } from './service';
import { ProfileServicesEss } from './service_ess'; 
import styles from './style.less';
import UserContact from './UserContact'; 
import { EditOutlined,HistoryOutlined, ExclamationCircleOutlined, UserOutlined, PhoneOutlined, ThunderboltOutlined, ReadOutlined, TagOutlined, SisternodeOutlined, ScheduleOutlined, 
  LinkOutlined, FieldTimeOutlined,UsergroupDeleteOutlined } from "@ant-design/icons";  
import PersonalViewDetailModal from './modal/PersonalViewDetailModal';
import AttachmentList from './tabitems/AttachmentList';
import Message from './Message';
import Activity from './tabitems/Activity';

function Profile() {
  const params = useParams();
  const {is_admin,id} = params  
 
  const requestActions = simpleRequestActions();
  const [tabStatus, seTabStatus] = useState<AdvancedState>({
    operationKey: 'contact',
    tabActiveKey: 'contact',
  });

  var _valueText = "";
    
  const [profile, setProfile] = useState<ProfileData>();
  const [step,setStep] = useState(1); 
  //
  const onTextChange = (val:string)=>{ 
      // setRemarks({valueText:val});
      _valueText = val;
  } 
  // start modified on profiles 
  const onStartModify = (step_id : number,sms:string)=>{ 
    //
    Modal.confirm({
      title: sms,
      content: 'Do you want to '+sms+' data?',
      onOk: async () => {
        try {  
          if(step_id==2){ 
            await ProfileServicesEss.saveEssProfile({...profile?.profile, empId: profile?.id,step:step_id,openEssId:profile?.ess.id,otherFile:[],remark:'',status:true})(requestActions); 
          }
          else if(step_id==9){ // not yet have action need to be make another step for save draft action
            //
            message.info("Save to draft...");
          }
          else{ 
            await ProfileServicesEss.saveEssProfile({...profile?.profile_draft, empId: profile?.id,step:step_id,openEssId:profile?.ess.id,otherFile:[],remark:'',status:true})(requestActions); 
          }
          initData();  
        } catch (error: any) {
          message.error(error.message || 'Failed to created.');
        }
      },
    });  
  } 
  const onRejected = (step_id : number)=>{ 
    //
    Modal.confirm({
      title: 'Rejected',
      content: <div><ProFormTextArea name={"comment"} fieldProps={{onChange: (e) => {onTextChange(e.currentTarget.value);}}} placeholder={"Entry Message"} /></div>,
      onOk: async () => {
        try {
          await ProfileServicesEss.approvalEssProfile({...profile?.profile_draft,id: profile?.id, empId: profile?.id,step:step_id,openEssId:profile?.ess.id,otherFile:[],remark:_valueText,status:true})(requestActions);  
          initData();  
        } catch (error: any) {
          message.error(error.message || 'Failed to created.');
        }
      },
    });  
  } 
  const onStartResubmit = (step_id : number)=>{ 
    //
    Modal.confirm({
      title: 'Resubmit',
      content: 'Do you want to resubmit data?',
      onOk: async () => {
        try { 
          await ProfileServicesEss.saveEssProfile({...profile?.profile_draft,id: profile?.id, empId: profile?.id,step:step_id,openEssId:profile?.ess.id,otherFile:[],remark:'',status:true})(requestActions);  
          initData();  
        } catch (error: any) {
          message.error(error.message || 'Failed to created.');
        }
      },
    });  
  } 
  const onStartAproval = (step_id : number)=>{ 
    //
    Modal.confirm({
      title: 'Approval Data',
      content: 'Do you want to start approval data?',
      onOk: async () => {
        try { 
          // approval
          await ProfileServicesEss.approvalEssProfile({...profile?.profile_draft,id: profile?.id, empId: profile?.id,step:step_id,openEssId:profile?.ess.id,otherFile:[],remark:'',status:true})(requestActions);  
          // set 
          setStep(step_id);
          // reload
          initData();  
        } catch (error: any) {
          message.error(error.message || 'Failed to created.');
        }
      },
    });  
  } 

  // effect
  useEffect(()=> {
    initData();  
  }, []);

  // init
  const initData = async () => {
    try {
      const rs = await ProfileServices.fetchProfile(Number(id)).query(requestActions);
      // 
      if(rs?.profile_draft==null){  
        // var _step = (rs?.ess.id!!<=0)?rs?.ess.stag:1; 
        setStep(rs?.ess.stag);
      }
      else { 
        setStep(rs?.profile_draft.step!!);
      }
      // 
      setProfile(rs);    
    } catch (error: any) {
      message.error(error.message || 'Failed to load data.')
    } 
  } 
  //
  const description = (data?: ProfileData) => (
    <RouteContext.Consumer>
      {({ isMobile }) => (
        <ProDescriptions className={styles.headerList} size="small" column={isMobile ? 1 : 2}>
          <ProDescriptions.Item label="Name KH">{data?.internalName}</ProDescriptions.Item>
          <ProDescriptions.Item label="Name EN">{data?.firstName} {data?.lastName}</ProDescriptions.Item>
          <ProDescriptions.Item label="Company">{data?.company}</ProDescriptions.Item>
          <ProDescriptions.Item label="Location">{data?.location}</ProDescriptions.Item>
          <ProDescriptions.Item label="Function">{data?.functions}</ProDescriptions.Item>
          <ProDescriptions.Item label="Position">{data?.position}</ProDescriptions.Item>
          <ProDescriptions.Item> </ProDescriptions.Item> 
          <ProDescriptions.Item label="Start Date">{data?.dateJoined && formatDate(data.dateJoined)}</ProDescriptions.Item> 
        </ProDescriptions>
      )}
    </RouteContext.Consumer>
  );

  const operationTabList = [
    { 
      key: 'contact',
      tab: <div style={{color: profile?.profileTab==null?'':profile?.profileTab.contactInformation==0?'':'red'}}><PhoneOutlined /> Contact Information</div>,
    },
    {
      key: 'personal',
      tab: <div style={{color: profile?.profileTab==null?'':profile?.profileTab.personalInformation==0?'':'red'}}><UserOutlined/> Personal Information</div>, 
    },
    {
      key: 'relationship',
      tab: <div style={{color: profile?.profileTab==null?'':profile?.profileTab.familyMember==0?'':'red'}}><UsergroupDeleteOutlined /> Family member</div>, 
    },
    {
      key: 'emergency',
      tab: <div style={{color: profile?.profileTab==null?'':profile?.profileTab.emergencyContact==0?'':'red'}}><ThunderboltOutlined /> Emergency Contact</div>,  
    },
    {
      key: 'education',
      tab: <div style={{color: profile?.profileTab==null?'':profile?.profileTab.education==0?'':'red'}}><ScheduleOutlined /> Education</div>,   
    },
    {
      key: 'language',
      tab: <div style={{color: profile?.profileTab==null?'':profile?.profileTab.languages==0?'':'red'}}><TagOutlined /> Languages</div>,   
    },
    {
      key: 'training',
      tab: <div style={{color: profile?.profileTab==null?'':profile?.profileTab.training==0?'':'red'}}><ReadOutlined /> Training/Certification</div>,  
    },
    {
      key: 'experience',
      tab: <div style={{color: profile?.profileTab==null?'':profile?.profileTab.workExperiences==0?'':'red'}}><SisternodeOutlined /> Work Experiences</div>,   
    },
    {
      key: 'attachmentfiles',
      tab: <><LinkOutlined /> Attachment Files</>,
    },
    {
      key: 'activity',
      tab: <><FieldTimeOutlined /> Activity</>,
    }
    // ,
    // {
    //   key: 'job',
    //   tab: 'Job',
    // },
    // {
    //   key: 'account',
    //   tab: 'Account',
    // },

  ];

  type AdvancedState = {
    operationKey: string;
    tabActiveKey: string;
  }; 
  // reload data
  const reloadData = () =>{
    initData();
  }

  const contentList = (data: ProfileData) => ({
    contact: (
      <UserContact profile={data} step={step} is_admin={Number(is_admin)} />
    ),
    // account: (
    //   <UserAccount profile={data} />
    // ),
    // job: <Job profile={data} />,
    personal: <Personal profile={data} step={step} is_admin={Number(is_admin)} empId={Number(id)} cb={{ onLoadData: () => {  reloadData(); }}} />,
    relationship: <Relationship profile={data} step={step} is_admin={Number(is_admin)} empId={Number(id)} cb={{ onLoadData: () => {  reloadData(); }}} />,
    emergency: <Emergency profile={data} step={step} is_admin={Number(is_admin)} empId={Number(id)} cb={{ onLoadData: () => {  reloadData(); }}} />,
    education: <Education profile={data} step={step} is_admin={Number(is_admin)} empId={Number(id)} cb={{ onLoadData: () => {  reloadData(); }}} />,
    language: <Languages profile={data} step={step} is_admin={Number(is_admin)} empId={Number(id)} cb={{ onLoadData: () => {  reloadData(); }}} />,
    training: <Training profile={data} step={step} is_admin={Number(is_admin)} empId={Number(id)} cb={{ onLoadData: () => {  reloadData(); }}} />,
    experience: <Experiences profile={data} step={step} is_admin={Number(is_admin)} empId={Number(id)} cb={{ onLoadData: () => {  reloadData(); }}} /> ,
    attachmentfiles: <AttachmentList profile={data} step={step} is_admin={Number(is_admin)} />  ,
    activity: <Activity profile={data} step={step} is_admin={Number(is_admin)} /> 
  });

  const onOperationTabChange = (key: string) => {
    seTabStatus({ ...tabStatus, operationKey: key });
  };
  // 
  const extra = (
    <div className={styles.moreInfo}> 
        <ImageProfileUploader imageId= {profile?.profileImageId} onSave={async (fileId)=> {
          try {
            profile && await ProfileServices.saveProfileImage({
              employeeId: profile.id,
              imageId: fileId
            })(requestActions)
          } catch (error:any) {
            message.error(error.message || 'failed to upload image.')
          }
        }}/> 
    </div>
  );
  
  //     
  const [modalViedEditVisible, setModalViewEditVisible] = useState< { type: 'ADD'; payload: undefined } | { type: 'EDIT'; payload: EssProfileData } | { type: 'PREVIEW'; payload: EssProfileData }>();
  const hideModal = (visble?: boolean) => !visble && setModalViewEditVisible(undefined); 

  const onViewProfileData = ()=>{
    setModalViewEditVisible({ type: 'PREVIEW', payload: profile?.profile_draft })
  }

  // stage
  const _info = "Period: From  "+(profile?.ess.id!!<=0?'':formatDate(profile?.ess.startDate))+" To  "+(profile?.ess.id!!<=0?'':formatDate(profile?.ess.endDate))+"";
  const _stag = ["Cancel Updated","Getting Starts","Start Modifying","Reviewing","Rejected","Re-Edit","Approval","Cancelled Submitted"];
  const _stag_message = [
    /*0*/"Cancel Updated",
    /*1*/_info,
    /*2*/"Employee starts modifying profile",
    /*3*/"Your request update is under review",
    /*4*/ (profile?.profile_draft==null?'':profile?.profile_draft.remark),
    /*5*/ (profile?.profile_draft==null?'':profile?.profile_draft.remark), 
    /*6*/ "Approval",
    /*7*/ "Cancelled Submitted"
  ];
  
  //
  return (
    <Spin spinning = {requestActions.request?.loading}> 
      {/*  
        checking open announcement expiry
      */}  
      {profile?.ess.id!!<=0?'': profile?.ess.empClosed==2?'': profile?.ess.stag==8?'':
            <Message visible={(step==6&&Number(id)==0)?true:false}
              message={_stag[step]}
              description={_stag_message[step]}
              opentitle = {profile?.ess.description!!}
              type={[4,5].find((element) => element == step)?"error":"info"}
              step={step}
              data={profile?.profile_draft}
              is_admin={[1,2].find((element) => element == Number(is_admin))?true:false}
              cb={{
                onStartModify: (stepId) => { 
                  onStartModify(stepId,'Start Modify Data');
                },
              }}
            /> 
      }
      {/*  */}
      {profile && <PageContainer
        title={`Employee No: ${profile?.empNo}`}
        className={styles.pageHeader}
        content={description(profile)}
        extra={extra}
        onTabChange={onOperationTabChange}
        tabList={operationTabList} 
        footer={[ 
          profile!!.ess.id!!<=0?'':<Button style={{display:(step==2&&Number(id)==0)?'':'none',color: 'red'}} onClick={()=>onStartModify(8,'Cancel Update')}><ExclamationCircleOutlined /> Cancel Update</Button>,   
          <Button style={{background:'#E7E6E6'}} style={{display:([7,5,2].find((element) => element == step))&&Number(id)==0?'':'none'}} onClick={()=>onStartModify(9,'Save Draft')}><EditOutlined/> Save Draft</Button>,       
          profile!!.ess.id!!<=0?'':<Button type="primary" style={{display:([7,5,2].find((element) => element == step))&&Number(id)==0?'':'none'}} onClick={()=>onStartModify(3,'Submit Update')}><EditOutlined/> Submit Update</Button>,
          profile!!.ess.id!!<=0?'':<Button style={{display:(step==3&&Number(id)==0)==true?'':'none',color: 'red'}} onClick={()=>onStartModify(7,'Cancel Submitted')}><HistoryOutlined/> Cancel Submitted</Button>,
          // profile!!.ess.id!!<=0?'':<Button style={{display:(step==4&&Number(id)==0)==true?'':'none',color: 'red'}} onClick={()=>onStartResubmit(5)}><HistoryOutlined/> Re-Edit</Button>, 

          profile!!.ess.id!!<=0?'':<Button style={{color: 'red',display:(step==3&&Number(id)>0)==true?'':'none'}} onClick={()=>onRejected(4)}><EditOutlined/> Rejected</Button>,
          
          <Button type="primary" style={{display:(step==3&&Number(id)>0)==true?'':'none'}} onClick={()=>onStartAproval(6)}><EditOutlined/> Approval</Button>, 

        ]}
      >
        { profile &&  contentList(profile)[tabStatus.operationKey as  keyof {}]}
      
      </PageContainer>}
      {!profile && <Alert message="Error" description="Your profile is not yet setup. please contact ICT team for support." type="error" showIcon />}

      
      <PersonalViewDetailModal
          open={!!modalViedEditVisible?.type}
          // lookupList={lookupDataList}
          onOpenChange={(visible) => hideModal(visible)}
          data={modalViedEditVisible?.payload}
          onFinishFailed={(error) => {
            message.error(
                <Space direction="vertical" align="start">
                {error.errorFields.map((it) => (
                    <div>{it.errors.join(', ')}</div>
                ))}
                </Space>,
            );
          }}
          // onFinish={(data) => {
          //     return saveEssProfileHandler({ ...data, id: modalVisible?.payload?.id, empId: profile.id,status:true,step:step });
          // }}
      />
    </Spin>
  );
}

export default Profile;
