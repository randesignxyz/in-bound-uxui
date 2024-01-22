import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import {
  currentDate,
  durationEx,
  formatDateTime,
  formatDurationEx,
  getWeekendDay,
  getWeekendDays,
  toReadable,
  wrapLocalDate,
} from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import { IncidentDetailResponse, IncidentLess, IncidentListItem } from '@/services/ict/data';
import { IncidentAdvanceSearchParams } from '@/services/ict/req-params';
import { IncidentServiceAPI } from '@/services/ict/services';
import {
  ClearOutlined,
  ClockCircleTwoTone,
  ExclamationCircleTwoTone,
  ExportOutlined,
  EyeFilled,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-table';
import { Button, Flex, message, Modal, Radio, Space, Spin, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import DataDetailView from './DataDetailView';
import { history, useAccess, useModel } from 'umi';
import AdvanceSearch from './components/AdvanceSearch';
import AnalystIncidentTicketModal from './AnalystIncidentTicketModal';
import { Paging } from '@/services/API';
import Omit from 'omit.js';
import { WorkflowServiceAPI } from '@/services/process-workflow/services';

import moment, { Moment } from 'moment';
import { ActivityEx } from '@/services/process-workflow/data';
import ClearSolvedTicket from './components/ClearSolvedTicket';
import { execDataService0, fetchDataListService } from '@/services/apiGateway';
import { stringify } from 'qs';

interface Props {
  onAdd?: (id?: number) => void;
  onEdit?: (id: number) => void;
}

export default ({ onAdd, onEdit }: Props) => {
  const requestActions = simpleRequestActions();
  const services = IncidentServiceAPI(requestActions);
  const workflowServices = WorkflowServiceAPI(requestActions);
  const [advanceSearchParams, setAdvanceSearchParams] = useState<IncidentAdvanceSearchParams>({
    status: 'ALL',
  });

  const actionRef = useRef<ActionType>();
  const access = useAccess();

  const [viewDetail, setViewDetail] = useState<{ visible: boolean; data?: IncidentDetailResponse }>(
    { visible: false },
  );
  const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
  const [dataEntryView, setDataEntryView] = useState<{
    visible: boolean;
    actionType: string;
    isAnalyst: boolean;
  }>({ visible: false, actionType: 'CREATE', isAnalyst: false });

  const [visibleClearModal, setVisibleClearModal] = useState(false)

  // const [activity, setActivity] = useState<CompletedActivityEx[]>([])
  const cacheList = useModel('dataList');

  const getInstanceActivities = async (instanceIds: (string | undefined)[]) => {
    return await workflowServices.listActivity({
      list: instanceIds
        .filter((instanceId) => instanceId !== undefined)
        .map((instanceId) => instanceId ?? ''),
    });
  };

  const onLoadSolvedTicketHandler = (searchValue?: string, dateBefore?: Moment) => {
    return fetchDataListService<IncidentListItem, { searchValue?: string; dateBefore?: Moment; }>({
      actionName: 'list-solved-tickets',
      endpoint: 'ICT',
      payload: { searchValue, dateBefore }
    }).query(requestActions)
  }

  const onForceCompleteTaks = (instanceIdList: string[], remarks?: string) => {

    Modal.confirm({
      title: 'Complete solved task',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await execDataService0<{ instanceIdList: string[], action: string, remarks?: string; }>({
            actionName: 'force-confirm',
            endpoint: 'ICT',
            payload: {
              instanceIdList,
              action: 'Confirmed',
              remarks
            }
          })(requestActions)
          setVisibleClearModal(false)
          message.success("Solved tasks are completed")
          actionRef.current?.reloadAndRest?.()
        } catch (error: any) {
          message.error(error.message || 'failed to complete')
        }

      }
    })

  }

  const onRequestHandler = async (params: TableViewSearchParams<IncidentAdvanceSearchParams>) => {
    try {

      const rs = await services.list(params)
      const slaMatrixs = await services.listSlaMatrix();
      const instActivities = await getInstanceActivities(rs.items.map((m) => m.instanceId));

      const itemList = rs.items.map((item) => {
        const slaMatrixMatched = slaMatrixs.find(
          (slaMatrix) => slaMatrix.priorityId === item.priorityId,
        );
        const activities = instActivities
          .find((f) => f.instanceId === item.instanceId)?.activities || [];
        const { respColor } = calculateResponseSla(
          slaMatrixMatched?.firstResponseTime,
          moment(item.requestedDate),
          activities,
        );
        const { resoColor } = calculateResolutionSla(
          slaMatrixMatched?.resolutionTime,
          moment(item.requestedDate),
          activities,
        );
        return { ...item, responseSlaColor: respColor, resolutionSlaColor: resoColor };
      })
      return cacheList.cacheDataList({
        type: 'ticket-incident',
        criteria: params,
        data: { ...rs, items: itemList },
      }) as Paging<IncidentLess>
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const onDetailhandler = async (data: IncidentListItem) => {
    try {
      const detail = await services.detail(data.id);

      setViewDetail({ visible: true, data: detail });
    } catch (error: any) {
      message.error(error.message || 'Faild to load data.');
    }
  };

  const calculateResponseSla = (
    firstResponseTime: number | undefined,
    requestedDate: moment.Moment | undefined,
    activities: ActivityEx[] | undefined,
  ) => {
    const defaultTime = firstResponseTime ?? 0;
    const defaultTimeStr = formatDurationEx(defaultTime);

    const startTime = requestedDate ?? currentDate();
    const activitiesSize = activities?.length ?? 0;
    //what about case admin create and assigned already for first start?
    const firstPickTime =
      activitiesSize < 1
        ? currentDate()
        : activitiesSize === 1 && defaultTime > 0
          ? activities?.[0]?.actionDate ?? currentDate()
          : activities?.[1]?.actionDate ?? currentDate();

    //before find duration make sure startTime is not greater than firstPickTime
    //not sure why in QA server startTime is bigger than firstpicktime????
    const actualTime =
      defaultTime === 0
        ? 0
        : moment(startTime).isBefore(moment(firstPickTime))
          ? durationEx(wrapLocalDate(moment(startTime)), wrapLocalDate(moment(firstPickTime)))
          : durationEx(wrapLocalDate(moment(firstPickTime)), wrapLocalDate(moment(startTime)));

    //exclude weekend days (Saturday, Sunday), Public Holiday
    const weekDayTime = actualTime === 0 ? 0 : actualTime - getWeekendDay(moment(startTime));

    const weekDayTimeStr = formatDurationEx(weekDayTime);

    // in case end user has no chooose priority => no first response or resolution time
    const violated = defaultTime === 0 ? undefined : defaultTime < weekDayTime;
    const color =
      defaultTime === 0
        ? 'grey'
        : weekDayTime <= 0
          ? 'rgb(244,244,244)'
          : violated
            ? 'rgb(235,51,67)'
            : 'rgb(97,208,62)';

    // console.log('activitiesSize,defaultTime,startTime,activities',activitiesSize,firstResponseTime, startTime,activities);

    return {
      respViolated: violated,
      respColor: color,
      respDefaultTime: defaultTimeStr,
      respActualTime: weekDayTimeStr,
    };
  };

  const calculateResolutionSla = (
    resolutionTime: number | undefined,
    requestedDate: moment.Moment | undefined,
    activities: ActivityEx[] | undefined,
  ) => {
    const defaultTime = resolutionTime ?? 0;
    const defaultTimeStr = formatDurationEx(defaultTime);

    const startTime = requestedDate ?? currentDate();

    const firstPickTimeFiltered = activities?.filter((f) => f.action === 'Resolved'); //?.actionDate??currentDate();
    const firstPickTime =
      firstPickTimeFiltered?.[firstPickTimeFiltered.length - 1]?.actionDate ?? 0; //currentDate();
    const actualTime =
      defaultTime === 0 || firstPickTime === 0
        ? 0
        : durationEx(wrapLocalDate(moment(startTime)), wrapLocalDate(moment(firstPickTime)));

    //exclude weekend days (Saturday, Sunday), Public Holiday
    const weekDayTime =
      firstPickTimeFiltered === undefined
        ? 0
        : actualTime - getWeekendDays(firstPickTimeFiltered?.map((m) => moment(m.actionDate)));

    const weekDayTimeStr = formatDurationEx(weekDayTime);

    const violated = defaultTime === 0 || firstPickTime === 0 ? undefined : defaultTime < weekDayTime;
    const color =
      defaultTime === 0 || firstPickTime === 0
        ? 'grey'
        : weekDayTime <= 0
          ? 'rgb(244,244,244)'
          : violated
            ? 'rgb(235,51,67)'
            : 'rgb(97,208,62)';

    return {
      violated: violated,
      resoColor: color,
      defaultTime: defaultTimeStr,
      actualTime: weekDayTimeStr,
    };
  };

  return (
    <Spin spinning={false}>
      <TableView<
        IncidentListItem,
        { searchValue?: string; advanceSearch?: IncidentAdvanceSearchParams }
      >
        hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
        cache
        extraFilter={
          <Space size="large">
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
              <Radio.Button value="PENDING">Pending</Radio.Button>
              {/* <Radio.Button value="REASSIGNED">Reassigned</Radio.Button>  */}
              <Radio.Button value="IN_PROGRESS">In Progress</Radio.Button>
              <Radio.Button value="ON_HOLD">On Hold</Radio.Button>
              <Radio.Button value="RESOLVED">Resolved</Radio.Button>
              <Radio.Button value="CLOSED">Closed</Radio.Button>
            </Radio.Group>
          </Space>
        }
        columns={[
          {
            title: '',
            width: 50,
            render: (_, r) => {
              return (
                <div>
                  <Space size={1}>
                    <Tooltip title="View Data">
                      <Button
                        size="small"
                        type="link"
                        icon={<EyeFilled />}
                        onClick={() => onDetailhandler(r)}
                      />
                    </Tooltip>
                  </Space>
                  <Space size={1}>
                    <Tooltip title="Response SLA">
                      <ClockCircleTwoTone twoToneColor={`${r.responseSlaColor}`} />
                    </Tooltip>
                  </Space>
                  <Space size={1} style={{ marginLeft: '5px' }}>
                    <Tooltip title="Resolution SLA">
                      <ExclamationCircleTwoTone twoToneColor={`${r.resolutionSlaColor}`} />
                    </Tooltip>
                  </Space>{' '}
                </div>
              );
            },
          },
          {
            title: 'Ticket No',
            dataIndex: 'formNo',
            sorter: 'formNo',
            width: 120,
            render: (_, r) => (
              <Flex gap={5}><Button
                size="small"
                type="link"
                title="Open in new tab"
                icon={<ExportOutlined />}
                onClick={() => {
                  window
                    .open(
                      `/external/data-form/incident_ticket_process/${r.instanceId}`,
                    )
                    ?.focus();
                }}
              />
                <a onClick={() => history.push(`/data-form/incident_ticket_process/${r.instanceId}`)}>
                  {r.formNo}
                </a>
              </Flex>
            ),
          },
          {
            title: 'Reported Date',
            dataIndex: 'requestedDate',
            align: 'left',
            sorter: 'requestedDate',
            width: 140,
            render: (_, r) => formatDateTime(r.requestedDate, 'YYYY-MM-DD h:mm:ss a'),
          },
          { title: 'Issued Statement', dataIndex: 'symptom', width: 150 },
          { title: 'Description', width: 200, dataIndex: 'description' },
          {
            title: 'Reported By',
            dataIndex: 'requestedBy',
            width: 150,
            sorter: 'requestedBy',
            render: (_, r) => r.requestedBy,
          },
          {
            title: 'Created Date',
            dataIndex: 'createdDate',
            align: 'left',
            sorter: 'createdDate',
            width: 140,
            render: (_, r) => formatDateTime(r.createdDate, 'YYYY-MM-DD h:mm:ss a'),
          },
          {
            title: 'Status',
            dataIndex: 'processStatus',
            width: 70,
            render: (_, r) => toReadable(r.processStatus),
          },
        ]}
        advanceSearch
        displayOnly={!access.canCreateIncidentTicket}
        actionHandlers={{
          onAdvanceSearchClicked: () => setAdvanceSearch({ visible: true }),
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
            cacheList.fetchDataList('ticket-incident').then(async (v) => {
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
            }) as Promise<Paging<IncidentLess>>,
        }}
        tableProps={{
          actionRef: actionRef,
          toolbar: {
            actions: [
              <Tooltip placement="top" title="Create Tikcet By User">
                <Button
                  type="link"
                  onClick={() =>
                    setDataEntryView({ visible: true, actionType: 'CREATE', isAnalyst: false })
                  }
                  icon={<PlusCircleOutlined />}
                >
                  {access.isAnalystIncidentTicket ? 'By User' : ''}
                </Button>
              </Tooltip>,

              access.isAnalystIncidentTicket && (
                <Tooltip placement="top" title="Create Tikcet By Analyst">
                  <Button
                    type="link"
                    onClick={() =>
                      setDataEntryView({ visible: true, actionType: 'CREATE', isAnalyst: true })
                    }
                    icon={<PlusCircleOutlined />}
                  >
                    By Analyst
                  </Button>
                </Tooltip>
              ),

              access.canCleanSolvedIncidentTicket && (
                <Tooltip placement="top" title="Clear solved tickets.">
                  <Button
                    type="link"
                    danger
                    onClick={() =>
                      setVisibleClearModal(true)
                    }
                    icon={<ClearOutlined />}
                  >
                    Close Solved Ticket
                  </Button>
                </Tooltip>
              )
            ],
          },
        }}
      />

      <DataDetailView
        open={viewDetail.visible}
        data={viewDetail.data}
        reload={async (id) => {
          const detail = await services.detail(id);
          await setViewDetail((v) => ({ ...v, data: detail }));
        }}
        isAnalyst={access.isAnalystIncidentTicket}
        onEdit={() => viewDetail.data?.id && onEdit?.(viewDetail.data?.id)}
        onAdd={() => viewDetail.data?.id && onAdd?.(viewDetail.data?.id)}
        onOpenChange={(v) => !v && setViewDetail({ visible: false })}
      />

      <AdvanceSearch
        title="Advance Search"
        closable
        open={advanceSearch?.visible}
        initData={advanceSearchParams}
        onClose={() => {
          setAdvanceSearch({ visible: false });
        }}
        onReset={() => {
          setAdvanceSearchParams({ status: 'ALL' });
          actionRef.current?.reloadAndRest?.();
        }}
        onSearch={(data) => {
          setAdvanceSearchParams((v) => ({ ...v, ...data, status: v.status }));
          actionRef.current?.reloadAndRest?.();
        }}
      />

      <AnalystIncidentTicketModal
        title="Incident Ticket"
        open={dataEntryView.visible}
        onCancel={() => {
          setDataEntryView({ visible: false, actionType: 'CREATE', isAnalyst: false });
          // actionRef.current?.reloadAndRest?.();
        }}
        isAnalyst={dataEntryView.isAnalyst}
        actionType={dataEntryView.actionType}
      />

      {visibleClearModal && <ClearSolvedTicket
        loading={requestActions.request?.loading}
        onLoadData={onLoadSolvedTicketHandler}
        open={true}
        onCompleteTask={onForceCompleteTaks}
        onOpenChange={visible => !visible && setVisibleClearModal(false)}
      />}
    </Spin>
  );
};
