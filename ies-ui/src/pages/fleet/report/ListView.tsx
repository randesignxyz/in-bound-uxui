import BreadCrumbCom from '@/pages/sale/retailer/components/BreadCrumbCom';
import { simpleRequestActions } from '@/services/model';
import { useModel } from '@umijs/max';
import { Tabs } from 'antd';
import { useState } from 'react';
import { FleetPaths } from '..';
import { ServiceTasksServiceAPI } from './service';
import Meta from 'antd/es/card/Meta';
import FuelReport from './component/FuelReport';
import MaintenanceReport from './component/MaintenanceReport';
import InspectionReport from './component/InspectionReport';
import VehicleReport from './component/VehicleReport';

interface Props {
  onDetail?: (id: string) => void;
  onAdd?: () => void;
  onEdit?: (id: string) => void;
}

export default ({ onDetail, onAdd, onEdit }: Props) => {
  const requestActions = simpleRequestActions();
  const services = ServiceTasksServiceAPI(requestActions);
  const [reportModule, setReportModal] = useState<string>();

  const routes = [
    {
      path: FleetPaths.fleet,
      label: 'Fleet',
    },
    {
      path: '',
      label: 'Reports',
    },
  ];

 
  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />
      <Tabs
        defaultValue={"1"}
        
        items={[
          {
            key:"1",
            label:<Meta
            
            title={"Vehicle"}
          />,
          children:<VehicleReport/>
          },
          {
            key:"2",
            label:<Meta
            title={"Fuel Log"}

          />,
          children:<FuelReport/>
          },
          {
            key:"3",
            label:<Meta
            title={"Maintenance"}

          />,
          children:<MaintenanceReport/>
          },
          {
            key:"4",
            label:<Meta
            title={"Inspection"}

          />,
          children:<InspectionReport/>
          },
        ]}
      />
     {/* <List

        grid={{ gutter: 16, column: 4 }}
        dataSource={data}
        renderItem={(items) => (
          <List.Item>
            <Card
              onClick={() =>setReportModal(items.module)}
            >
              <Meta
                avatar={<img style={{ width: 50 }} src={items.icon} />}
                title={items.title}

              />
            </Card>
          </List.Item>
        )}

      /> */}
      {
        (
          reportModule =="VEHICLE" &&<VehicleReport/>
        )||
        (
          reportModule ==="FUEl" && <FuelReport/>
        )||
        (
          reportModule ==="MAINTENANCE" && <MaintenanceReport/>
        )||
        (
          reportModule ==="INSPECTION" && <InspectionReport/>
        )
      }
      
      

      
    </>
  );
};
