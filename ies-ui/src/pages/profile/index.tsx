import ImageProfileUploader from '@/components/ImageProfileUploader';
import { simpleRequestActions } from '@/services/model';
import { ProDescriptions } from '@ant-design/pro-components';
import { PageContainer, RouteContext } from '@ant-design/pro-components';
import {
  Alert,
  message, Spin,
} from 'antd';
import { useEffect } from 'react';
import { useState } from 'react';
import { formatDateTime } from '../utils';
import { ProfileData } from './data';
import Job from './Job';
import { ProfileServices } from './service';
import styles from './style.less';
import UserAccount from './UserAccount';
import UserContact from './UserContact';

const description = (data?: ProfileData) => (
  <RouteContext.Consumer>
    {({ isMobile }) => (
      <ProDescriptions className={styles.headerList} size="small" column={isMobile ? 1 : 2}>
        <ProDescriptions.Item label="First Name">{data?.firstName}</ProDescriptions.Item>
        <ProDescriptions.Item label="Last Name">{data?.lastName}</ProDescriptions.Item>
        <ProDescriptions.Item label="Local Name">{data?.internalName}</ProDescriptions.Item>
        <ProDescriptions.Item label="DOB">{data?.bod && formatDateTime(data.bod)}</ProDescriptions.Item>
        <ProDescriptions.Item label="Gender">{data?.gender}</ProDescriptions.Item>
        <ProDescriptions.Item label="Joined Date">{data?.dateJoined && formatDateTime(data.dateJoined)}</ProDescriptions.Item>

      </ProDescriptions>
    )}
  </RouteContext.Consumer>
);

const operationTabList = [
  {
    key: 'contact',
    tab: 'Contact',
  },
  {
    key: 'job',
    tab: 'Job',
  },
  {
    key: 'account',
    tab: 'Account',
  },

];

type AdvancedState = {
  operationKey: string;
  tabActiveKey: string;
};

function Profile() {

  const requestActions = simpleRequestActions();
  const [tabStatus, seTabStatus] = useState<AdvancedState>({
    operationKey: 'contact',
    tabActiveKey: 'contact',
  });

  const [profile, setProfile] = useState<ProfileData>()

  useEffect(()=> {
    initData()
  }, [])

  const initData = async () => {
    try {
    
      const rs = await ProfileServices.fetchProfile.query(requestActions)
      setProfile(rs)
    } catch (error: any) {
      message.error(error.message || 'Failed to load data.')
    }
  }

  const contentList = (data: ProfileData) => ({
    contact: (
      <UserContact profile={data}/>
    ),
    account: (
      <UserAccount profile={data} />
    ),
    job: <Job profile={data} />
  });

  const onOperationTabChange = (key: string) => {
    seTabStatus({ ...tabStatus, operationKey: key });
  };

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
  

  return (
    <Spin spinning = {requestActions.request?.loading}>
    {profile && <PageContainer
      title={`Employee No: ${profile?.empNo}`}
      className={styles.pageHeader}
      content={description(profile)}
      extra={extra}
      onTabChange={onOperationTabChange}
      tabList={operationTabList}
     
    >
      { profile &&  contentList(profile)[tabStatus.operationKey as  keyof {}]}
    
    </PageContainer>}
    {!profile && <Alert message="Error" description="Your profile is not yet setup. please contact ICT team for support." type="error" showIcon />}
    </Spin>
  );
}

export default Profile;
