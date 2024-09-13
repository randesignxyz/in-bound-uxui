import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDateTime } from '@/pages/utils';
import { ReviewerListItem } from '@/services/delivery/data';
import { ReviewerParams } from '@/services/delivery/req-params';
import { DeliveryServiceAPI } from '@/services/delivery/services';
import { simpleRequestActions } from '@/services/model';
import { CheckCircleTwoTone, CheckOutlined, CloseCircleTwoTone } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { ActionType } from '@ant-design/pro-table';
import { Badge, Button, message, Radio, Space, Spin, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import { history } from "@umijs/max";
import ReviewList from './review-list';

export default () => {
  const requestActions = simpleRequestActions();
  const services = DeliveryServiceAPI(requestActions);
  const [searchParams, setSearchParams] = useState<ReviewerParams>({ status: 'ALL' });
  const actionRef = useRef<ActionType>();
  const [selected, setSelected] = useState<number>();

  const onRequestHandler = async (params: TableViewSearchParams<ReviewerParams>) => {
    try {
      return await services.listReviewer(params);
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  return (
    <PageContainer breadcrumb={undefined} title={'Reviewer'} onBack={history.back}>
      <Spin spinning={requestActions.request?.loading || false}>
        <TableView<ReviewerListItem, { searchValue?: string }>
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
                <Badge size="small" offset={[-20, 0]} count={0}>
                  <Radio.Button value="PENDING">Pending</Radio.Button>
                </Badge>

                <Radio.Button value="VERIFIED">Verified</Radio.Button>
              </Radio.Group>
            </Space>
          }
          tableProps={{
            actionRef: actionRef,
          }}
          columns={[
            { title: 'Telegram Id', dataIndex: 'telegramId', sorter: 'telegramId' },
            {
              title: 'Registered Date',
              sorter: 'registeredDate',
              render: (_, r) => formatDateTime(r.registeredDate),
            },
            { title: 'Reviewer', sorter: 'accountName', dataIndex: 'reviewer' },
            { title: 'Registered Phone', sorter: 'registeredPhone', dataIndex: 'registeredPhone' },
            { title: 'Customer Code', sorter: 'customerCode', dataIndex: 'customerCode' },
            { title: 'Customer Name', sorter: 'customerName', dataIndex: 'customerName' },
            {
              title: 'Verified',
              render: (_, r) => {
                if (r.verified === 'Y') return <CheckCircleTwoTone size={5} />;
                if (r.verified === 'N')
                  return <CloseCircleTwoTone twoToneColor="#eb2f96" size={5} />;
                return '';
              },
            },
            { title: 'Verified Type', dataIndex: 'verifiedType' },
            { title: 'Verified By', sorter: 'verifiedBy', dataIndex: 'verifiedBy' },
            {
              title: 'Verified Date',
              sorter: 'verifiedDate',
              render: (_, r) => formatDateTime(r.verifiedDate),
            },
            {
              title: '',
              render: (_, r) =>
                !r.verified ? (
                  <Tooltip title="Assign">
                    <Button
                      onClick={() => setSelected(r.id)}
                      type="link"
                      icon={<CheckOutlined />}
                    />
                  </Tooltip>
                ) : (
                  ''
                ),
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

        <ReviewList
          title="Delivery Note List"
          width={1000}
          open={!!selected}
          reviwerId={selected || 0}
          onVisibleChange={(visible) => !visible && setSelected(undefined)}
        />
      </Spin>
    </PageContainer>
  );
};
