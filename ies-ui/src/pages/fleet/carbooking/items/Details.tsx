import TableView, { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { simpleRequestActions } from '@/services/model';
import { ProDescriptions } from '@ant-design/pro-components';
import { PageContainer, RouteContext } from '@ant-design/pro-components';
import {  Alert,   message, Spin, } from 'antd';
import { useEffect,useState } from 'react';  
import { OpenEssDataItem,OpenAdvanceSearchParams } from "../data_ess"; 
import { ServicesEss } from '../service_ess_tran'; 

import ListViewEss from './ListViewEss';

interface Props {
  profileData: OpenEssDataItem;
  essId: number;
}

export default ({ profileData,essId }: Props) =>{

  const [tabStatus, seTabStatus] = useState<AdvancedState>({
    operationKey: 'ListViewEss',
    tabActiveKey: 'ListViewEss',
  });

  const [profile, setProfile] = useState<OpenEssDataItem>()

  useEffect(()=> {
    initData()
  }, [])

  const initData = async () => {
    try { 
    //   const rs = await ServicesEss.listEssOpen({criteria.searchValue:1}).query(requestActions);
    //   setProfile(rs)
    } catch (error: any) {
      message.error(error.message || 'Failed to load data.')
    }
  }

  const contentList = () => ({
    
    ListViewEss: <ListViewEss profile={[]} />, 
  });

  const onOperationTabChange = (key: string) => {
    seTabStatus({ ...tabStatus, operationKey: key });
  };

  
const description = (data?: OpenEssDataItem) => (
    <RouteContext.Consumer>
      {({ isMobile }) => (
        <ProDescriptions  size="small" column={isMobile ? 1 : 3}>
          <ProDescriptions.Item label="Start date">10/06/2024</ProDescriptions.Item>
          <ProDescriptions.Item label="End date">10/06/2024</ProDescriptions.Item>
          <ProDescriptions.Item label="Description">The compiler bundled to Kotlin plugin (IDE) must be greater or equal than external compiler (project) used for building modules. So update Intellij IDEA to be compatible with the most up-to-date plugins.</ProDescriptions.Item>   
  
        </ProDescriptions>
      )}
    </RouteContext.Consumer>
  );
  
  const operationTabList = [
    {
      key: 'ListViewEss',
      tab: 'Started',
    },
    // {
    //   key: 'ListViewEssD',
    //   tab: 'Draft',
    // },{
    //   key: 'ListViewEssV',
    //   tab: 'Verified',
    // },{
    //   key: 'ListViewEssC',
    //   tab: 'Completed',
    // }
    
  ];
  
  type AdvancedState = {
    operationKey: string;
    tabActiveKey: string;
  };
 
  return (
    // <Spin spinning = {requestActions.request?.loading}>
    <PageContainer 
      title={`Open ess testing testing`}
      content={description(profile)}
    //   extra={extra}
      onTabChange={onOperationTabChange}
      tabList={operationTabList}     
    >
      { contentList()[tabStatus.operationKey as  keyof {}]}
    
    </PageContainer> 
    // </Spin>
  );
}


