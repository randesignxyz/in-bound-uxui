
import { Tabs } from 'antd';
import { useState } from 'react';
import { FleetPaths } from '..';
import AccessoriesListView from '../accessory/AccessoriesListView';
import DriverModalForm from '../driver/DriverFormModal';
import ListView from '../driver/ListView';
import VendorListView from '../vendor/VendorListView';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import TaskListView from '../serviceTask/TaskListView';
import TireVehicleAssignListView from '../tires/TireListView';

export default () => {
  const [driverState, setDriverState] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit' };
  }>({});

  const routes = [
    {
      path: FleetPaths.fleet,
      label: 'Fleet',
    },
    {
      path: '',
      label: 'Set-up',
    },
  ];

  return (
    <>
    <PageContainer
    title={false}
      tabProps={{
        type:"card"
      }}
     tabList={[
      {
        key:"driver",
        tab:"Driver (Operator) ",
        children:<ListView/>
      },
      {
        key:"servicetask",
        tab:"Service Task",
        children:<TaskListView/>
      },
      {
        key:"Vendors",
        tab:"Vendors",
        children: <VendorListView />,
      },
      {
        key:"Accessories",
        tab:"Accessories",
        children: <AccessoriesListView />,
      },
      {
        key:"Tyre Management",
        tab:"Tyre Management",
        children: <TireVehicleAssignListView />,
      },
     ]}
    />
      {/* <BreadCrumbCom separator=">" routes={routes} /> */}
      {/* <PageContainer
        // onBack={()=>history.push(FleetPaths.fleet)}
        title="Set-up"
      >
      <Tabs
        items={[
          {
            label: 'Driver',
            key: '1',
            children: <ListView />,
          },
          {
            label: 'Vendors',
            key: '2',
            children: <VendorListView />,
          },
          {
            label: 'Accessories',
            key: '3',
            children: <AccessoriesListView />,
          },
        ]}
      />
      </PageContainer> */}

      <DriverModalForm
        open={driverState.visible?.name == 'modal'}
        onCancel={() => setDriverState((v) => ({ ...v, visible: undefined }))}
        onSave={() => {}}
      />
    </>
  );
};
