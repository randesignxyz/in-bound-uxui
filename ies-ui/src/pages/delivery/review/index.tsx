import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { durationFormat, formatDate, formatDateTime } from '@/pages/utils';
import { downloadReport } from '@/services/apiGateway';
import { Driver, ReviewItem, ReviewListItem } from '@/services/delivery/data';
import { ReviewParams } from '@/services/delivery/req-params';
import { DeliveryServiceAPI } from '@/services/delivery/services';
import { simpleRequestActions } from '@/services/model';
import {
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  CloudDownloadOutlined,
  EyeFilled,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { ActionType } from '@ant-design/pro-table';
import { Button, message, Radio, Space, Spin, Tooltip } from 'antd';
import moment from 'moment';
import { useRef, useState } from 'react';
import { history } from 'umi';
import { ReviewReport } from './data.type';
import Exporter from './export';
import ReviewItemView from './review-item';

export default () => {
  const requestActions = simpleRequestActions();
  const services = DeliveryServiceAPI(requestActions);
  const [searchParams, setSearchParams] = useState<ReviewParams>({ status: 'ALL' });
  const actionRef = useRef<ActionType>();

  const [reviewItems, setReviewItems] = useState<{ items: ReviewItem[]; comment?: string }>();
  const [drivers, setDrivers] = useState<Driver[]>([]);

  const [exportVisible, setExportVisible] = useState(false);
  const onRequestHandler = async (params: TableViewSearchParams<ReviewParams>) => {
    try {
      return await services.listReview(params);
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const onDetailHandler = async (data: ReviewListItem) => {
    const rs = await services.listReviewItem(data.id);
    setReviewItems({ items: rs, comment: data.comment });
  };

  const dowloadReport = (data: ReviewReport) => {
    return downloadReport<ReviewReport>(requestActions)({
      reportName: 'export-delivery-review',
      fileName: 'delivery-reviews',
      type: 'EXCEL',
      data: data,
    });
  };

  const openExporter = async () => {
    if (drivers.length === 0) {
      const rs = await services.listAllDrivers();
      setDrivers(rs);
    }
    setExportVisible(true);
  };

  return (
    <PageContainer breadcrumb={undefined} title={'Review'} onBack={history.back}>
      <Spin spinning={requestActions.request?.loading || false}>
        <TableView<ReviewListItem, { searchValue?: string }>
          extraFilter={
            <Space size="large">
              <Radio.Group
                value={searchParams.status}
                onChange={(e) => {
                  setSearchParams((v) => ({
                    ...v,
                    status: e.target.value,
                  }));

                  actionRef.current?.reloadAndRest?.();
                }}
              >
                <Radio.Button value="ALL">All</Radio.Button>
                <Radio.Button value="VERIFIED">Verified</Radio.Button>
                <Radio.Button value="PENDING">Un Verified</Radio.Button>
              </Radio.Group>
            </Space>
          }
          tableProps={{
            actionRef: actionRef,
            toolbar: {
              actions: [
                <Tooltip placement="top" title="Export">
                  <Button type="link" onClick={openExporter} icon={<CloudDownloadOutlined />}>
                    Export
                  </Button>
                </Tooltip>,
              ],
            },
          }}
          columns={[
            {
              width: 50,
              render: (_, r) => (
                <Tooltip title="View Review Detail">
                  <Button type="link" icon={<EyeFilled />} onClick={() => onDetailHandler(r)} />
                </Tooltip>
              ),
            },
            { title: 'DN Num', dataIndex: 'dnNum', sorter: 'dnNum' },
            {
              title: 'Delevery Date',
              render: (_, r) => formatDate(r.deliveryDate),
              sorter: 'deliveryDate',
            },
            { title: 'telegram.Acc', dataIndex: 'reviewer', sorter: 'reviewer' },
            { title: 'Customer Code', dataIndex: 'customerCode', sorter: 'customerCode' },
            { title: 'Customer Name', dataIndex: 'customerName', sorter: 'customerName' },
            { title: 'Ship to code', dataIndex: 'shipToCode', sorter: 'shipToCode' },
            { title: 'Driver', dataIndex: 'driver', sorter: 'driver' },
            {
              title: 'Started Date',
              render: (_, r) => formatDateTime(r.startedDate),
              sorter: 'startedDate',
            },
            {
              title: 'Ended Date',
              render: (_, r) => formatDateTime(r.endedDate),
              sorter: 'endedDate',
            },
            {
              title: 'Duration',
              render: (_, r) => durationFormat(moment(r.startedDate), moment(r.endedDate)),
            },
            {
              title: 'Verified',
              render: (_, r) => {
                if (r.verified === 'Y') return <CheckCircleTwoTone size={5} />;
                if (r.verified === 'N')
                  return <CloseCircleTwoTone twoToneColor="#eb2f96" color="red" size={5} />;
                return '';
              },
            },
          ]}
          displayOnly
          actionHandlers={{
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
        />
        <ReviewItemView
          title="Review Item List"
          width={1300}
          data={reviewItems?.items || []}
          comment={reviewItems?.comment}
          open={!!reviewItems}
          onVisibleChange={(visible) => !visible && setReviewItems(undefined)}
        />
        <Exporter
          title="Exporter"
          drivers={drivers}
          open={exportVisible}
          onExport={dowloadReport}
          onVisibleChange={(visible) => !visible && setExportVisible(false)}
        />
      </Spin>
    </PageContainer>
  );
};
