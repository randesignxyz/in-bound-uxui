import TableView, { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { simpleRequestActions } from '@/services/model';
import { ProDescriptions } from '@ant-design/pro-components';
import { PageContainer, RouteContext } from '@ant-design/pro-components';
import { message, Spin, } from 'antd';
import { useEffect,useState } from 'react';  
import { OpenEssDataItem } from "../data_ess"; 
import { ServicesEss } from '../service_ess_tran'; 

import ListViewEss from './ListViewEss';
import { useParams } from "@umijs/max";
import { formatDate, formatDateTime } from "@/pages/utils";
 

export default () =>{
  const params = useParams();
  const {id} = params
  const requestActions = simpleRequestActions();


  const [tabStatus, seTabStatus] = useState<AdvancedState>({
    operationKey: 'ListViewEss',
    tabActiveKey: 'ListViewEss',
  });

  const [profile, setProfile] = useState<OpenEssDataItem>();


  useEffect(()=> {
    initData();
  }, [])

  const initData = async () => {
    try {   
      const rs = await ServicesEss.essOpenDetail(Number(id)).query(requestActions);
      setProfile(rs);
    } catch (error: any) {
      message.error(error.message || 'Failed to load data.')
    }
  }

  const contentList = () => ({ 
    ListViewEss: <ListViewEss profile={profile!!} />, 
  });

  const onOperationTabChange = (key: string) => {
    seTabStatus({ ...tabStatus, operationKey: key });
  };

  
const description = (data: OpenEssDataItem) => ( 
    <RouteContext.Consumer>
      {({ isMobile }) => ( 
        <ProDescriptions  size="small" column={isMobile ? 1 : 3}>
           <ProDescriptions.Item label="Start date">{formatDate(data.startDate)}</ProDescriptions.Item>
          <ProDescriptions.Item label="End date">{formatDate(data.endDate)}</ProDescriptions.Item>
          <ProDescriptions.Item label="Description">{data.description}</ProDescriptions.Item>     
  
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
    <Spin spinning = {requestActions.request?.loading}>
      {profile && <PageContainer 
        title={`${profile?.openTitle}`}
        content={description(profile)} 
        onTabChange={onOperationTabChange}
        tabList={operationTabList}     
      >
        { contentList()[tabStatus.operationKey as  keyof {}]}
      
      </PageContainer> 
    }
    </Spin>
  );
}


