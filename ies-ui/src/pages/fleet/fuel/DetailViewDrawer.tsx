import AttachedFileList from '@/components/Attachment/AttachedFileList';
import { formatDate } from '@/pages/utils';
import { ActionType, ProDescriptions } from '@ant-design/pro-components';
import { Card, Divider, Drawer, DrawerProps, Tag } from 'antd';
import { useEffect, useRef } from 'react';
import { FuelDTO } from './data';

interface Props extends DrawerProps {
  data?: FuelDTO;
}

export default ({ data, ...props }: Props) => {
  const actionType = useRef<ActionType>();
  useEffect(() => {
    props.open;
  }, [props.open]);

  return (
    <>
      <Drawer {...props} width={800}
        styles={{
          body: {
            backgroundColor: '#fafafa'
          }
        }}
      >
        <Card>
          <ProDescriptions
            dataSource={data}
            contentStyle={{ fontWeight: 'bold' }}
            column={2}
            actionRef={actionType}
            columns={[
              {
                key: 'refilledDate',
                title: 'Date',
                valueType: 'date',
                dataIndex: 'refilledDate',
              },
              {
                key: 'plateNumber',
                title: 'Truck Number',
                dataIndex: 'plateNumber',
              },
              {
                key: 'driverName',
                title: 'Driver',
                dataIndex: 'driverName',
              },

              {
                key: 'pumpBy',
                title: 'Pump By',
                dataIndex: 'pumpBy',
              },
              {
                key: 'quantity',
                title: 'Quantity(L)',
                dataIndex: 'quantity',
                render: (_, r) => <Tag color="green">{r.quantity?.toFixed(2)} L</Tag>,
              },
              {
                key: 'kilometer',
                title: 'Odometer',
                render: (_, r) => <Tag color="blue">{r.kilometer?.toFixed(2)} km</Tag>,
              },
              {
                key: 'reciept',
                title: 'Tank Station',
                render: (_, r) => r.gasStation?.tankName,
              },
              {
                key: 'type',
                title: 'Type',
                render: (_, r) => r.gasType?.name,
              },
              {
                key: 'location',
                title: 'Location',
                render: (_, r) => r.location?.name,
              },
              {
                key: 'reciept',
                title: 'Receipt Number',
                dataIndex: 'receiptNumber',
              },
              {
                key: 'km',
                title: 'Usage Rate',
                render: (_, r) => (r.numberKilometer && (r.quantity / r.numberKilometer) * 100)?.toFixed(2)
              },

              {
                key: 'km',
                title: 'Previous Rate',
                render: (_, r) => (r?.previousRate?.usageRate)?.toFixed(2)
              },

              {
                key: 'km',
                title: 'Over Rate',
                render: (_, r) => (

                  r.numberKilometer && ((r.numberKilometer && (r.quantity / r.numberKilometer) * 100) - r.previousRate?.usageRate)?.toFixed(2)
                )
              },


              {
                key: 'status',
                title: 'Alert',
                dataIndex: 'status',
                render: (_, r) => (
                  <div style={{ color: r.status != 'Normal' ? 'red' : '' }}>
                    {r.status != 'Normal' ? r.status : '-'}
                  </div>
                ),
              },
            ]}
          />
          <Divider />
          <p style={{ color: 'gray' }}>
            Created By : {data?.createdBy} / Created Date :
            <span>{formatDate(data?.createdDate)}</span>
          </p>
          <p style={{ color: 'gray' }}>
            Last Modified By : {data?.lastModifiedBy} / Last Modified Date :
            <span>{formatDate(data?.lastModifiedDate)}</span>
          </p>
        </Card>
        <br />
        <p>Attachment</p>
        <AttachedFileList initFiles={data?.attacheFile} readonly />
      </Drawer>
    </>
  );
};
