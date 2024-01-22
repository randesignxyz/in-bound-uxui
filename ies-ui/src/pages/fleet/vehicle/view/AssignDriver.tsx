import { formatDate } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import { ProDescriptions } from '@ant-design/pro-components';
import { Card, Col, Row, Space } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import UploadImagePreview from '../../components/UploadImagePreview';
import { VehicleDriverDTO } from '../../driver/data';
import { DriverServiceAPI } from '../../driver/service';

interface Props {
  id: string;
}

export default ({ id }: Props) => {
  const requestActions = simpleRequestActions();
  const [driverList, setDriverList] = useState<VehicleDriverDTO[]>([]);

  const onLoadData = async () => {
    const data = DriverServiceAPI(requestActions).listVehicleDriver({ id: id, status: 'active' });
    setDriverList(await data);
    return data;
  };

  useEffect(() => {
    onLoadData();
  }, [id]);

  return (
    <>
      {driverList.map((it, index) => {
        return (
          <Space size={24} direction="vertical">
            <Card size="small" key={index}>
              <Row gutter={8}>
                <Col span={8}>
                  <Space align="start">
                    <UploadImagePreview
                      displayOnly
                      imageId={it?.driverId.imageId}
                      style={{
                        height: 100,
                        borderRadius: 100,
                      }}
                      defualtImage="https://cdn.iconscout.com/icon/free/png-256/free-driver-1785014-1518720.png?f=webp"
                      onSave={async (fileId) => {}}
                    />
                    <h2>
                      {[it.driverId.firstName, it.driverId.lastName].filter((it) => it).join(' ')}
                    </h2>
                  </Space>
                </Col>
                <Col xs={24} lg={16} xl={16}>
                  <ProDescriptions
                    contentStyle={{ fontWeight: 'bold' }}
                    column={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 2 }}
                    dataSource={it.driverId}
                    columns={[
                      {
                        title: 'Phone Number',
                        dataIndex: 'phone',
                      },
                      {
                        title: 'National ID',
                        dataIndex: 'cardId',
                      },
                      {
                        title: 'Email',
                        dataIndex: 'email',
                      },
                      {
                        title: 'Employee ID',
                        dataIndex: 'employeeNumber',
                      },
                      {
                        title: 'Job Title',
                        dataIndex: 'jobTitle',
                      },
                    ]}
                  />
                </Col>
                <Col span={24}>
                  <br />
                  <hr />
                  <ProDescriptions
                    dataSource={it}
                    contentStyle={{ fontWeight: 'bold' }}
                    column={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
                    columns={[
                      {
                        title: 'Driver Type',
                        dataIndex: 'driverType',
                      },
                      {
                        title: 'Start Date',
                        dataIndex: 'startDate',
                        render: (_, r) =>
                          r.startDate ? formatDate(r.startDate) : formatDate(r.createdDate),
                        valueType: 'date',
                      },
                      {
                        title: 'End Date',
                        dataIndex: 'endDate',
                        valueType: 'date',
                        render: (_, r) => (r.endDate ? formatDate(r.endDate) : 'No Limit'),
                      },

                      {
                        title: 'Assigned by',
                        dataIndex: 'createdBy',
                      },
                      {
                        title: 'Assigned Date',
                        dataIndex: 'createdDate',
                        valueType: 'date',
                        span: 2,
                      },

                      {
                        title: 'Reason',
                        dataIndex: 'reason',
                      },
                    ]}
                  />
                  {it.startDate && it.endDate ? (
                    <>
                      <span style={{ fontWeight: 'bold' }}>Noted:</span>
                      <span style={{ color: '#f3af28' }}>
                        {' '}
                        A driver was{' '}
                        <span style={{ color: 'red' }}>{moment(it.endDate).fromNow()}</span> will be
                        remove from this vehicle
                      </span>
                    </>
                  ) : (
                    ''
                  )}
                </Col>
              </Row>
            </Card>
          </Space>
        );
      })}
    </>
  );
};
