import { formatDate } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import { ActionType, ProTable } from '@ant-design/pro-components';
import { Badge, Card, Col, Drawer, DrawerProps, Row } from 'antd';
import moment from 'moment';
import { useEffect, useRef } from 'react';
import { ReminderHistory, ServiceReminderDTO } from './data';
import { ReminderServiceAPI } from './service';

interface Props extends DrawerProps {
  data?: ServiceReminderDTO;
}
export default ({ data, ...props }: Props) => {
  const requestActions = simpleRequestActions();
  const actionRef = useRef<ActionType>();

  useEffect(() => {
    props.open && actionRef.current?.reload?.();
  }, [props.open]);

  const meterFormat = (r: ServiceReminderDTO) => {
    const dmt = r.dueSoonMeterThreshold || 20;

    if (
      r.nextDueMeter - r.meterHistory?.meterValue > 0 &&
      r.nextDueMeter - r.meterHistory?.meterValue <= dmt
    ) {
      return {
        velue: `${r.nextDueMeter - (r.meterHistory?.meterValue || 0)} km remaining`,
        status: 'Due Soon',
      };
    }

    if (r.meterHistory?.meterValue > r.nextDueMeter) {
      return {
        velue: `${r.meterHistory?.meterValue - r.nextDueMeter} km overdue`,
        status: 'Overdue',
      };
    } else if (r.meterHistory?.meterValue < r.nextDueMeter) {
      return {
        velue: `${r.nextDueMeter - (r.meterHistory?.meterValue || 0)} km remaining`,
        status: 'Upcoming',
      };
    }
  };
  const status = (mpd: ServiceReminderDTO) => {
    const nextDueAt = mpd.nextDueAt;
    const dueSoonFrequency = mpd.dueSoonTimeThresholdFrequency;
    const timeDuesoon = mpd.dueSoonTimeThresholdInterval;
    if (mpd.timeInterval != null) {
      if (timeDuesoon != null) {
        const diff = moment().add(timeDuesoon, dueSoonFrequency).diff(moment(), 'days');
        const dsiff = moment(nextDueAt).diff(moment(), 'days');

        if (dsiff <= 2 && dsiff >= 0) {
          return 'Due Soon';
        } else if (dsiff <= 0) {
          return 'Overdue';
        } else {
          return 'Upcoming';
        }
      }
    }
  };
  const formatDatewithNumber = (value: moment.Moment) => {
    if (moment(value).fromNow().search('ago') > 0) {
      return moment(value).fromNow().replace('in', '');
    } else {
      return moment(value).fromNow().replace('in', '') + ' from now';
    }

    // return date
  };

  return (
    <>
      <Drawer {...props} width={800} styles={{
        body: {
          backgroundColor: '#fafafa'
        }
      }}>
        <Card size="small" bodyStyle={{ padding: 0 }}>
          <Row gutter={6}>
            <Col span={12} style={{ padding: '5px 40px' }}>
              {data?.nextDueAt && (
                <p style={{ border: '1px solid lightgray', borderRadius: 5, padding: 5 }}>
                  <p>Scheduled Date</p>
                  <p>{formatDate(data?.nextDueAt)}</p>
                  {data?.timeInterval ? (
                    <h3
                      style={{
                        margin: 0,
                        padding: 0,
                        color:
                          status(data) == 'Due Soon'
                            ? '#f3af28'
                            : status(data) == 'Upcoming'
                              ? ''
                              : 'red',
                      }}
                    >
                      {formatDatewithNumber(data?.nextDueAt)}{' '}
                    </h3>
                  ) : (
                    ''
                  )}
                  <Badge
                    status={
                      data?.status == 'Due Soon'
                        ? 'warning'
                        : data?.status == 'Upcoming'
                          ? 'processing'
                          : 'error'
                    }
                    text={data?.status}
                  />
                </p>
              )}
            </Col>
            <Col span={12} style={{ padding: '5px 40px' }}>
              {data?.nextDueMeter && (
                <p style={{ border: '1px solid lightgray', borderRadius: 5, padding: 5 }}>
                  <p>Primary Meter</p>
                  <p>{data?.nextDueMeter} km</p>
                  {data?.meterInterval ? (
                    <h3
                      style={{
                        margin: 0,
                        padding: 0,
                        color:
                          meterFormat(data)?.status == 'Due Soon'
                            ? '#f3af28'
                            : meterFormat(data)?.status == 'Upcoming'
                              ? ''
                              : 'red',
                      }}
                    >
                      {meterFormat(data)?.velue}
                    </h3>
                  ) : (
                    ''
                  )}
                  <Badge
                    status={
                      data?.status == 'Due Soon'
                        ? 'warning'
                        : data?.status == 'Upcoming'
                          ? 'processing'
                          : 'error'
                    }
                    text={data?.status}
                  />
                </p>
              )}
            </Col>
          </Row>
        </Card>
        <br />
        <ProTable<ReminderHistory>
          options={false}
          search={false}
          actionRef={actionRef}
          size="small"
          style={{ margin: 0, padding: 0 }}
          columns={[
            {
              title: 'Completed Date',
              dataIndex: 'completedDate',
              valueType: 'date',
            },
            {
              title: 'Completed By',
              dataIndex: 'completedBy',
            },
            {
              title: 'Status',
              dataIndex: 'status',
            },
            {
              title: 'Source',
              dataIndex: 'source',
            },
            {
              title: 'Remark',
              dataIndex: 'remark',
            },
          ]}
          request={async () => {
            const recordList = await ReminderServiceAPI(requestActions).pageReminderHistory({
              criteria: { searchValue: '', advanceSearch: { reminderId: data?.id || 0 } },
            });

            return Promise.resolve({
              data: recordList.items,
              success: true,
            });
          }}
        />
      </Drawer>
    </>
  );
};
