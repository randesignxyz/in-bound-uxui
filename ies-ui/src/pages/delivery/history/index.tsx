import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDateTime, toReadable } from '@/pages/utils';
import { Paging } from '@/services/API';
import { singleRequest } from '@/services/apiGateway';
import { InstanceSrvParams } from '@/services/delivery/instance-service-params';
import {
  InstanceAdvanceSearchParams,
  InstanceDetail,
  InstanceListItem,
} from '@/services/delivery/instance.types';
import { simpleRequestActions } from '@/services/model';
import { DownloadOutlined, EyeFilled } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { ActionType } from '@ant-design/pro-table';
import { Button, FloatButton, message, Segmented, Space, Spin, Tooltip } from 'antd';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { history } from 'umi';
import Detail from '../board/detail';
import { ViewController } from '../board/view-controller';
import AdvanceSearch from './advance-search';
import Reports, { ReportType } from '../modal-mngt';
export default () => {
  const requestActions = simpleRequestActions();

  // const options = [
  //   { label: 'All', value: 'ALL' },
  //   {
  //     label: 'Loading',
  //     value: 'LOADING',
  //     data: [
  //       { label: 'All', value: 'ALL' },
  //       { label: 'Pending', value: 'PENDING' },
  //       { label: 'Loading', value: 'LOADING' },
  //       { label: 'loaded', value: 'LOADED' },
  //       { label: 'Canceled', value: 'CANCELED' },
  //     ],
  //   },
  //   {
  //     label: 'Delivery',
  //     value: 'DELIVERY',
  //     data: [
  //       { label: 'All', value: 'ALL' },
  //       { label: 'Pending', value: 'PENDING' },
  //       { label: 'In Progress', value: 'IN_PROGRESS' },
  //       { label: 'Delivered', value: 'DELIVERED' },
  //       { label: 'Canceled', value: 'CANCELED' },
  //     ],
  //   },
  //   // { label: 'Settlement', value: 'SETTLEMENT' },
  // ];


  const options = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Canceled', value: 'CANCELED' },
  ];

  const actionRef = useRef<ActionType>();
  const [searchParams, setSearchParams] = useState<InstanceAdvanceSearchParams>({
    activity: 'DELIVERY',
    status: 'ALL',
  });

  const [status, setStatus] = useState<{ label: string; value: string }[]>([]);

  const [selectedItem, setSelectedItem] = useState<InstanceDetail>();
  const [showAdvanceSearch, setShowAdvanceSearch] = useState(false);
  const [report, setReport] = useState<ReportType>()

  const onRequestHandler = async (params: TableViewSearchParams<InstanceAdvanceSearchParams>) => {
    try {
      return (await singleRequest(InstanceSrvParams.listDelivery(params))(
        requestActions,
      )) as Paging<InstanceListItem>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const onCloseHandler = (visible = false) => {
    !visible && setSelectedItem(undefined);
  };

  const onDetailHandler = async (id: number) => {
    try {
      const rs = (await singleRequest(InstanceSrvParams.fetch(id))(
        requestActions,
      )) as InstanceDetail;
      setSelectedItem(rs);
    } catch (error: any) {
      message.error(error.message || 'Failed to load data.');
    }
  };

  const vc: ViewController = {
    requestActions: requestActions,
    actions: {
      onOpenModal: () => { },
      onCloseModal: onCloseHandler,
      onRefreshDetailData: () => { },
      onRefreshLisViewData: () => actionRef.current?.reloadAndRest?.(),
      onClaim: async () => { },

      onRelease: async () => { }

    },
    data: {
      itemDetail: selectedItem
    },
    view: {
      loading: requestActions.request?.loading,
      actionRef: actionRef,
      getActions: undefined
    }
  }

  useEffect(() => {
    actionRef.current?.reloadAndRest?.();
  }, [searchParams.activity, searchParams.status]);

  return (
    <PageContainer breadcrumb={undefined} title={''} onBack={history.back}>
      <Spin spinning={requestActions.request?.loading}>
        <TableView<InstanceListItem, { searchValue?: string }>
          columns={[
            {
              width: 50,
              render: (_, r) => (
                <Tooltip title="View">
                  <Button type="link" icon={<EyeFilled />} onClick={() => onDetailHandler(r.id)} />
                </Tooltip>
              ),
            },
            {
              title: 'License Plate',
              sorter: 'licensePlate',
              render: (_, r) => r.truck.licensePlate,
            },
            {
              title: 'Driver',
              sorter: 'driver',
              render: (_, r) => [r.driver.firstName, r.driver.lastName].join(' '),
            },
            {
              title: 'Loading Dock',
              sorter: 'loadingDock',
              render: (_, r) => r.loading?.loadingDock,
            },
            {
              title: 'Started Date',
              sorter: 'startedDate',
              render: (_, r) => r.delivery?.startedDate && formatDateTime(moment(r.delivery.startedDate)),
            },
            {
              title: 'Ended Date',
              sorter: 'endedDate',
              render: (_, r) => r.delivery?.finishedDate && formatDateTime(moment(r.delivery.finishedDate)),
            },
            // { title: 'Activity',  render: (_, r) => toReadable(r.activity)  },
            { title: 'Status', render: (_, r) => toReadable(r.status) },
          ]}
          tableProps={{
            actionRef: actionRef,
            toolbar: {
              actions: [
                <Button onClick={() => setReport({ type: 'DELIVERY_TIME', props: {} })} type='link' icon={<DownloadOutlined />}>Export</Button>
              ]
            }
          }}
          advanceSearch
          actionHandlers={{
            onAdvanceSearchClicked: () => setShowAdvanceSearch(true),
            onRequest: (criteria, pagination, sort) =>
              onRequestHandler({
                criteria: {
                  ...criteria,
                  advanceSearch: searchParams,
                  sort,
                },
                pagination,
              }),
          }}
          extraFilter={
            <Space size="large">
              <Segmented
                value={searchParams.status}
                onChange={(value: any) => {
                  setSearchParams((v) => ({ ...v, activity: 'DELIVERY' as any, status: value }));
                  // setStatus(options.find((it) => it.value === value)?.data || []);
                }}
                options={options} onResize={undefined} onResizeCapture={undefined} />

              <Segmented
                value={searchParams.status}
                onChange={(value: any) => {
                  setSearchParams((v) => ({ ...v, status: value }));
                }}
                options={status} onResize={undefined} onResizeCapture={undefined} />
            </Space>
          }
          displayOnly
        />

        <Detail
          width={1200}
          title={'Delivery Detail'}
          open={!!selectedItem}
          onClose={() => onCloseHandler()}
          {...vc}
        />

        <AdvanceSearch
          open={showAdvanceSearch}
          onVisibleChange={(visible) => !visible && setShowAdvanceSearch(false)}
        />
      </Spin>
      <Reports report={report} onClose={() => setReport(undefined)} />
      <FloatButton.BackTop />
    </PageContainer>
  );
};
