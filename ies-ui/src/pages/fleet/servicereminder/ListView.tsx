import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDate } from '@/pages/utils';
import { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import {
  AppstoreAddOutlined,
  ArrowRightOutlined,
  DashOutlined,
  DeleteOutlined,
  SisternodeOutlined,
} from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-table';
import { useModel } from '@umijs/max';
import { Badge, Button, MenuProps, message, Modal, Radio, Space } from 'antd';
import Dropdown from 'antd/lib/dropdown/dropdown';
import moment from 'moment';
import Omit from 'omit.js';
import { useRef, useState } from 'react';
import { FleetPaths } from '..';
import BreadCrumbCom from '../components/BreadCrumbCom';
import MaintenanceModalForm from '../maintenance/EntityFormModal';
import CompletedHistory from './CompletedHistory';
import {
  ReminderHistory,
  ServiceReminderCreate,
  ServiceReminderDTO,
  ServiceReminderSearchParam,
  StatusCount,
} from './data';
import ServiceReminderModalForm from './EntryFormModel';
import ForceComplete from './ForceComplete';
import { ReminderServiceAPI } from './service';

interface Props {
  onDetail?: (id: number) => void;
  onAdd?: () => void;
  onEdit?: (id: number) => void;
}

export default ({ onDetail, onAdd, onEdit }: Props) => {
  const requestActions = simpleRequestActions();
  const services = ReminderServiceAPI(requestActions);
  const [statusCount, setStatusCount] = useState<StatusCount>();
  const [state, setSate] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: { vehicle: ServiceReminderDTO } };
  }>({});
  const [reminderHistorystate, setReminderHistorySate] = useState<{
    visible?: {
      name: 'modal';
      type: 'ADD' | 'Edit';
      reminderId: number;
      reminderDTO: ServiceReminderDTO;
    };
  }>({});

  const [alertHistorystate, setAlertHistorySate] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; record?: ServiceReminderDTO };
  }>({});

  const [maintenanceState, setMaintenanceState] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: { entry: ServiceReminderDTO } };
  }>({});

  const [advanceSearchParams, setAdvanceSearchParams] = useState<ServiceReminderSearchParam>({
    status: 'ALL',
  });

  const getMenuItems = (item: ServiceReminderDTO):MenuProps["items"] => {
    return [
      {
        key: '1',
        label: 'View',
        itemIcon: <ArrowRightOutlined />,
        onClick: async () => {
          setAlertHistorySate({ visible: { name: 'modal', type: 'ADD', record: item } });
        },
      },
      {
        key: '2',
        label: 'Maintent Entry',
        itemIcon: <AppstoreAddOutlined />,
        onClick: async () => {
          console.log(item);
          
          setMaintenanceState({
            visible: { name: 'modal', type: 'ADD', payload: { entry: item } },
          });
        },
      },
      {
        key: '3',
        label: 'Force Complete',
        itemIcon: <SisternodeOutlined />,
        onClick: () =>
          setReminderHistorySate({
            visible: { name: 'modal', type: 'ADD', reminderId: item.id, reminderDTO: item },
          }),
      },

      // {
      //     key: '4',
      //     label: 'History',
      //     display:true,
      //     // disabled:item.status==="void" ?true:false,
      //     itemIcon:<HistoryOutlined/>,
      //     onClick: async () => {
      //         setAlertHistorySate({visible:{name : "modal", type:"ADD", id:item.id}})
      //     },
      // },
      {
        type:"divider"
      },
      {
        key: '5',
        label: 'Delete',
        itemIcon: <DeleteOutlined />,
        danger:true,
        onClick: () => {
          Modal.confirm({
            title: 'Confirm Service Reminder Deletion',
            content:
              'Are you sure you want to delete this Service Reminder? All data will be lost forever.',
            onOk: async () => {
              await services.delete(item.id);
              message.success('Service Reminder was Successfully Deleted');
              actionRef.current?.reload();
            },
          });
        },
      },
    ];
  };

  const routes = [
    {
      path: FleetPaths.fleet,
      label: 'Fleet',
    },
    {
      path: '',
      label: 'Service Reminder',
    },
  ];

  const cacheList = useModel('dataList');

  const onRequestHandler = async (params: TableViewSearchParams<ServiceReminderSearchParam>) => {

    try {
      return services.page(params).then((it) => {
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

    // return date
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
    const dueSoonFrequency = mpd.dueSoonTimeThresholdFrequency;
    const timeDuesoon = mpd.dueSoonTimeThresholdInterval;
    if (mpd.timeInterval != null) {
      if (timeDuesoon != null) {
        // const diff = moment().add(timeDuesoon, dueSoonFrequency).diff(moment.now(), 'days');
        const dsiff = moment(nextDueAt).diff(moment.now(), 'days');

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

  const onSaveActionHandler = (data: ServiceReminderCreate) => {
    Modal.confirm({
      title: 'Save Service Reminder Record',
      content: ' are you sure?',
      onOk: async () => {
        const response = (await services.save(data)) as {
          data: string;
          message: string;
        };
        setSate((v) => ({ ...v, visible: undefined }));

        actionRef.current?.reloadAndRest?.();
        message.success(response.data);
      },
    });
  };

  const onSaveRemiderHistory = (data: ReminderHistory) => {
    Modal.confirm({
      title: 'Force Update Rminder Service',
      content: 'are you sure',
      onOk: async () => {
        const entry = {
          ...data,
          source: 'service reminder',
          status: 'completed',
        };
        const response = await services.saveReminderHistory(entry);
        message.success('success');
        actionRef.current?.reloadAndRest?.();
        setReminderHistorySate((v)=>({...v, visible:undefined}));
      },
    });
  };

  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />

      <TableView<
        ServiceReminderDTO,
        { searchValue?: string; advanceSearch: ServiceReminderSearchParam }
      >
        hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
        cache
        columns={[
          {
            key: 'Vehicle',
            title: 'Vehicle',
            sorter: 'vehicleId',
            render: (_, r) => (
              <Button
                type="link"
                onClick={() =>
                  setSate({ visible: { name: 'modal', type: 'Edit', payload: { vehicle: r } } })
                }
              >
                {[r.vehicleId.plateNumber].filter((it) => it).join('-')}
              </Button>
            ),
          },
          {
            key: 'Service Tasks',
            title: 'Service Tasks',
            sorter: 'serviceTaskId',
            render: (_, r) => (
              <>
                {setStatusCount(r.statusCount)}
                <p style={{ margin: 0, padding: 0 }}>{r.serviceTask?.name}</p>
                <p style={{ color: 'gray', fontSize: '12px', margin: 0, padding: 0 }}>
                  Every{r.timeInterval ? ` ${r.timeInterval} ${r.timeFrequency} or` : ''}{' '}
                  {r.meterInterval ? ` ${r.meterInterval} km` : ''}
                </p>
              </>
            ),
          },
          {
            key: 'Status',
            title: 'Status',
            dataIndex: 'status',
            sorter: 'status',
            render: (_, r) => (
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
            key: 'remaining',
            title: 'Remaining',
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
            title: 'Next Due',
            dataIndex: 'nextDueAt',
            sorter: 'nextDueAt',
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
          {
            key: 'action',
            title: '',
            width: 50,
            render: (_, r) => (
              <Dropdown
                menu={{
                  items: getMenuItems(r),
                  style: { width: 200 },
                }}
              >
                <a onClick={(e) => e.preventDefault()}>
                  <DashOutlined />
                </a>
              </Dropdown>
            ),
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
            cacheList.fetchDataList('fleet-maintenance-plan').then((v: any) => {
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
        extraFilter={
          <>
            <Space size="large" direction="horizontal">
              <Radio.Group
                value={advanceSearchParams.status}
                onChange={(e) => {
                  setAdvanceSearchParams((v) => ({
                    ...v,
                    status: e.target.value,
                  }));
                  actionRef.current?.reloadAndRest?.();
                }}
              >
                <Radio.Button value="ALL">All</Radio.Button>
                <Badge showZero={true} color={'blue'} count={statusCount?.upcoming}>
                  <Radio.Button value="Upcoming">Upcoming</Radio.Button>
                </Badge>
                <Badge showZero={true} color={'yellow'} count={statusCount?.dueSoon}>
                  <Radio.Button value="Due Soon">Due Soon</Radio.Button>
                </Badge>
                <Badge showZero={true} count={statusCount?.overdue} color={'red'}>
                  <Radio.Button value="Overdue">Overdue</Radio.Button>
                </Badge>
              </Radio.Group>
            </Space>
          </>
        }
      />

      <ServiceReminderModalForm
        open={state.visible?.name == 'modal'}
        onCancel={() => setSate((v) => ({ ...v, visible: undefined }))}
        onSave={onSaveActionHandler}
        data={state.visible?.payload?.vehicle}
      />

      <MaintenanceModalForm
        open={maintenanceState.visible?.name == 'modal'}
        onCancel={() => setMaintenanceState((v) => ({ ...v, visible: undefined }))}
        serviceReminder={maintenanceState.visible?.payload?.entry}
      />

      <CompletedHistory
        data={alertHistorystate.visible?.record}
        open={alertHistorystate.visible?.name === 'modal'}
        onClose={() => setAlertHistorySate((v) => ({ ...v, visible: undefined }))}
      />

      <ForceComplete
        open={reminderHistorystate.visible?.name === 'modal'}
        onSave={onSaveRemiderHistory}
        reminderId={reminderHistorystate.visible?.reminderId}
        modalProps={{
          onCancel: () => setReminderHistorySate((v) => ({ ...v, visible: undefined })),
        }}
        reminderDTO={reminderHistorystate.visible?.reminderDTO}
      />
    </>
  );
};
