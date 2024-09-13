import { simpleRequestActions } from '@/services/model';
import { ProDescriptions } from '@ant-design/pro-components';
import { Badge, Card, Col, message, Row, Space, Tag } from 'antd';
import { useEffect } from 'react';
import { VehicleListItem } from '../vehicle/data';
import { VehicleServiceAPI } from '../vehicle/service';
import UploadImagePreview from './UploadImagePreview';
import truckDefaultIcon  from '@/assets/truck_default_icon.png';

interface Props {
  data?: VehicleListItem;
  displayImage?: boolean;
  span?: number;
}

export default ({ data, displayImage = true }: Props) => {
  const requestAction = simpleRequestActions();
  useEffect(() => {}, [data?.id]);
  return (
    <>
      <Space direction="vertical" size={20}>
        <Card>
          <Row gutter={6}>
            <Col xl={20} lg={20} xs={24}>
              <ProDescriptions
                style={{ fontWeight: 'bold' }}
                dataSource={{
                  plateNumber: data?.plateNumber,
                  vin: data?.vin,
                  engine: data?.engine,
                  make: data?.make?.name,
                  model: data?.model,
                  color: data?.color?.name,
                  fuelType: data?.fuelType?.name,
                  year: data?.year,
                  vehicleType: data?.vehicleType?.name,
                  vehicleNote: data?.vehicleNote,
                  weight: data?.weight?.name,
                  currentMeter: data?.currentMeter?.meterValue,
                }}
                columns={[
                  {
                    title: 'Plate Number',
                    key: 'plate',
                    dataIndex: 'plateNumber',
                  },
                  {
                    title: 'VIN',
                    key: 'vin',
                    dataIndex: 'vin',
                  },
                  {
                    title: 'Engine',
                    key: 'engine',
                    dataIndex: 'engine',
                  },
                  {
                    title: 'Brand',
                    key: 'make',
                    dataIndex: 'make',
                  },
                  {
                    title: 'Model',
                    key: 'model',
                    dataIndex: 'model',
                  },
                  {
                    title: 'Color',
                    key: 'color',
                    dataIndex: 'color',
                  },
                  {
                    title: 'Fuel Type',
                    key: 'text',
                    dataIndex: 'fuelType',
                  },
                  {
                    title: 'Year',
                    key: 'year',
                    dataIndex: 'year',
                  },
                  {
                    title: 'Weight',
                    key: 'weight',
                    dataIndex: 'weight',
                  },
                  {
                    title: 'Vehicle Type',
                    key: 'vehicel_type',
                    dataIndex: 'vehicleType',
                  },

                  {
                    title: 'Current Odometer',
                    key: 'odometer',
                    dataIndex: 'currentMeter',
                    render: (_, r) => <Tag color="blue">{r.currentMeter?.toFixed(2)}km</Tag>,
                  },
                ]}
              ></ProDescriptions>
            </Col>
            <Col span={4}>
              <UploadImagePreview
                style={{ height: 150 }}
                defualtImage={truckDefaultIcon}
                imageId={data?.profilePicture?.fileId}
                onSave={async (fileId) => {
                  try {
                    await VehicleServiceAPI(requestAction).profilePicture({
                      attachedTo: data?.id || '',
                      fileId: fileId,
                      attachedToId: 0,
                      id: data?.profilePicture?.id,
                    });
                  } catch (error: any) {
                    message.error(error.message || 'failed to upload image.');
                  }
                }}
              />
            </Col>
          </Row>
        </Card>
        <Card size="small" key={'Classification'} title="Classification">
          <ProDescriptions<VehicleListItem>
            dataSource={data}
            column={{ xs:1,sm:2, md:3, lg:4, xxl:4,xl:4 }}
            columns={[
              {
                title: 'Branding Type',
                key: 'branding',
                render: (_, r) => r.brandingType?.name,
              },
              {
                title: 'Ownership',
                key: 'ownership',
                render: (_, r) => r.ownership?.name,
              },
              {
                title: 'Group',
                key: 'businness',
                render: (_, r) => r.businessUnit?.name,
              },
             
              {
                title: 'Status',
                key: 'status',
                dataIndex: 'status',
                render: (_, r) => (
                  <Badge
                    style={{ color: '#438efd' }}
                    status={
                      r.status == 'Active'
                        ? 'processing'
                        : r.status == 'Inactive'
                        ? 'error'
                        : 'warning'
                    }
                    text={r.status}
                  />
                ),
              },
            ]}
          />
        </Card>
        <Card size="small" title="Vehicle Capacity">
          <ProDescriptions
            size="small"
            contentStyle={{
              fontWeight: 'bold',
            }}
            dataSource={data?.vehicleCapacity}
            columns={[
              {
                key: 'truckHead',
                title: 'Head of Truck length(m)',
                dataIndex: 'truckHead',
              },
              {
                key: 'boxLength',
                title: 'Box Length(m)',
                dataIndex: 'boxLength',
              },
              {
                key: 'boxHigh',
                title: 'Box High(m)',
                dataIndex: 'boxHigh',
              },
              {
                key: 'boxWidth',
                title: 'Box Width(m)',
                dataIndex: 'boxWidth',
              },
              {
                key: 'boxCBM',
                title: 'Box CBM(m)',
                dataIndex: 'boxCBM',
              },
              {
                key: 'totalLength',
                title: 'Total length Of Truck(m)',
                dataIndex: 'totalLength',
              },
            ]}
          />
        </Card>
        <Card size="small" title="Vehicle Loading">
          <ProDescriptions
            size="small"
            contentStyle={{
              fontWeight: 'bold',
            }}
            dataSource={data?.vehicleCapacity}
            columns={[
              {
                key: 'cbm',
                title: 'Loading capacity 85% (CBM)',
                render: (_, r) => (r.boxCBM * (85 / 100)) ^ 0,
              },
              {
                key: 'loading250',
                title: 'Number of case loading (250ml)',
                render: (_, r) => ((r.boxCBM * (85 / 100)) / 0.024147) ^ 0,
              },
              {
                key: 'loading350',
                title: 'Number of case loading (350ml)',
                render: (_, r) => ((r.boxCBM * (85 / 100)) / 0.01746) ^ 0,
              },
              {
                key: 'loading500',
                title: 'Number of case loading (500ml)',
                render: (_, r) => ((r.boxCBM * (85 / 100)) / 0.024147) ^ 0,
              },
              {
                key: 'loading1500',
                title: 'Number of case loading (1500ml)',
                render: (_, r) => ((r.boxCBM * (85 / 100)) / 0.04069) ^ 0,
              },
            ]}
          />
        </Card>
      </Space>
    </>
  );
};
