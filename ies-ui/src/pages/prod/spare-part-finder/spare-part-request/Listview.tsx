import BreadCrumbCom from '@/pages/fleet/components/BreadCrumbCom';
import { simpleRequestActions } from '@/services/model';
import { Tabs } from 'antd';
import { useState } from 'react';
import { ProdPaths } from '../..';
// @ts-ignore JSX component without local declaration file
import SparePartList from './SparePartList';
import type { RequestDetailData } from './RequestedBatchDrawer';
import MyRequestListview from './my-request/MyRequestListview';

export default function ListView() {
  const [activeTabKey, setActiveTabKey] = useState('1');
  const [resubmitDraft, setResubmitDraft] = useState<RequestDetailData | null>(null);
  const routes = [
    {
      path: '/prod',
      label: 'Prod',
    },
    {
      path: ProdPaths.sparePartRequestTest,
      label: 'Spare Part Request',
    },
  ];

  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />
      <Tabs
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        items={[
          {
            label: 'Spare Parts List',
            key: '1',
            children: (
              <SparePartList
                resubmitDraft={resubmitDraft}
                onResubmitDraftHandled={() => setResubmitDraft(null)}
              />
            ),
          },
          {
            label: 'My Requests',
            key: '2',
            children: (
              <MyRequestListview
                isActive={activeTabKey === '2'}
                onResubmitRequest={(detail) => {
                  setResubmitDraft(detail);
                  setActiveTabKey('1');
                }}
              />
            ),
          },
        ]}
      />

    </>
  );
}
