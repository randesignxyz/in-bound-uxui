import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDate } from '@/pages/utils';
import { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { ActionType } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Badge, message } from 'antd';
import moment from 'moment';
import Omit from 'omit.js';
import { useRef, useState } from 'react';
import {
  ServiceReminderDTO,
  ServiceReminderSearchParam,
} from '../../servicereminder/data';
import { ReminderServiceAPI } from '../../servicereminder/service';

interface Props {
  id: string;
}

export default ({ id }: Props) => {
  const requestActions = simpleRequestActions();
  const services = ReminderServiceAPI(requestActions);

  const [state, setSate] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: { vehicle: ServiceReminderDTO } };
  }>({});

  const [advanceSearchParams, setAdvanceSearchParams] = useState<ServiceReminderSearchParam>({
    status: 'ALL',
  });

  const cacheList = useModel('dataList');

  const onRequestHandler = async (params: TableViewSearchParams<ServiceReminderSearchParam>) => {
    try {
      return services.page({ criteria: { searchValue: id } }).then((it) => {
        return cacheList.cacheDataList({
          type: 'fleet-maintenance-plan',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<ServiceReminderDTO>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };
  const actionRef = useRef<ActionType>();

  const formatDatewithNumber = (value: moment.Moment) => {
    if (moment(value).fromNow().search('ago') > 0) {
      return moment(value).fromNow().replace('in', '');
    } else {
      return moment(value).fromNow().replace('in', '') + ' from now';
    }

  };

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
    const timeDuesoon = mpd.dueSoonTimeThresholdInterval;
    if (mpd.timeInterval != null) {
      if (timeDuesoon != null) {
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

  const onAddHandler = () => {
    setSate((v) => ({
      ...v,
      visible: { name: 'modal', type: 'ADD' },
    }));
  };

  return (
    <>
      <TableView<
        ServiceReminderDTO,
        { searchValue?: string; advanceSearch: ServiceReminderSearchParam }
      >
        hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
        cache
        displayOnly
        disableSearch
        columns={[
          {
            key: 'Vehicle',
            title: 'Vehicle',
            sorter: 'vehicleId',
            render: (_, r) => [r.vehicleId.plateNumber].filter((it) => it).join('-'),
          },
          {
            key: 'Service Tasks',
            title: 'Service Tasks',
            sorter: 'serviceTaskId',
            render: (_, r) => (
              <>
                <p style={{ margin: 0, padding: 0 }}>{r.serviceTask?.name}</p>
                <p style={{ color: 'gray', fontSize: '12px', margin: 0, padding: 0 }}>
                  Every{r.timeInterval ? ` ${r.timeInterval} ${r.timeFrequency} or` : ''}{' '}
                  {r.meterInterval ? ` ${r.meterInterval} km` : ''}
                </p>
              </>
            ),
          },
          {
            key       : 'Status',
            title     : 'Status',
            dataIndex : 'status',
            sorter    : 'status',
            render    : (_, r) => (
                        <Badge
                          status={
                            r.status == 'Due Soon'
                              ? 'warning'
                              : r.status == 'Upcoming'
                              ? 'processing'
                              : 'error'
                          }
                          text={r.status}
                        />
            ),
          },
          {
            key: 'Next Due',
            title: 'Next Due',
            dataIndex: 'checked',
            sorter: 'nextDueAt',
            render: (_, r) => (
              <>
                {r.timeInterval ? (
                  <p
                    style={{
                      fontSize: '13px',
                      margin: 0,
                      padding: 0,
                      color:
                        status(r) == 'Due Soon' ? '#f3af28' : status(r) == 'Upcoming' ? '' : 'red',
                    }}
                  >
                    {formatDatewithNumber(r.nextDueAt)}{' '}
                  </p>
                ) : (
                  ''
                )}

                {r.meterInterval ? (
                  <p
                    style={{
                      fontSize: '13px',
                      margin: 0,
                      padding: 0,
                      color:
                        meterFormat(r)?.status == 'Due Soon'
                          ? '#f3af28'
                          : meterFormat(r)?.status == 'Upcoming'
                          ? ''
                          : 'red',
                    }}
                  >
                    {meterFormat(r)?.velue}
                  </p>
                ) : (
                  ''
                )}
              </>
            ),
          },
          {
            key: 'remind',
            title: 'Destination Remind',
            dataIndex: 'nextDueAt',
            valueType: 'date',
            render: (_, r) => {
              if (r.nextDueAt && r.nextDueMeter) {
                return (
                  <>
                    <span>{formatDate(r.nextDueAt)}</span>
                    <br />
                    <span>{r.nextDueMeter}km</span>
                  </>
                );
              } else if (r.nextDueAt) {
                return <span>{formatDate(r.nextDueAt)}</span>;
              } else {
                return <span>{r.nextDueMeter}km</span>;
              }
            },
          },
          {
            key: 'Last Completed',
            title: 'Last Completed',
            valueType: 'date',
            dataIndex: 'lastModifiedDate',
            sorter: 'lastModifiedDate',
          },
        ]}
        actionHandlers={{
          onAdd: () => onAddHandler(),
          onRequest: (criteria, pagination, sort) =>
            onRequestHandler({
              criteria: {
                ...criteria,
                advanceSearch: advanceSearchParams,
                sort,
              },
              pagination,
            }),
          onFirstLoad: () =>
            cacheList.fetchDataList('fleet-maintenance-plan').then((v) => {
              if (v) {
                setAdvanceSearchParams({
                  ...v.creteria?.criteria,
                  status: v.creteria?.criteria?.advanceSearch?.status ?? 'ALL',
                });
                return v.dataList;
              } else {
                return onRequestHandler({
                  criteria: {
                    advanceSearch: advanceSearchParams,
                  },
                });
              }
            }) as Promise<Paging<ServiceReminderDTO>>,
        }}
        tableProps={{
          actionRef: actionRef,
        }}
      />
    </>
  );
};
