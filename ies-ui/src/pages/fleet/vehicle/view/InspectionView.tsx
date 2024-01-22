import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { ActionType } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { message, Popover, Radio, Space, Tag } from 'antd';
import Omit from 'omit.js';
import { useRef, useState } from 'react';
import { InspectionAdvanceParams, InspectionDTO } from '../../inspection/data';
import { InspectionServiceAPI } from '../../inspection/service';

interface Props {
  id: string;
}

export default ({ id }: Props) => {
  const requestActions = simpleRequestActions();
  const services = InspectionServiceAPI(requestActions);

  const [advanceSearchParams, setAdvanceSearchParams] = useState<InspectionAdvanceParams>({
    status: 'ALL',
  });

  const actionRef = useRef<ActionType>();

  const cacheList = useModel('dataList');

  const onRequestHandler = async (params: TableViewSearchParams<InspectionAdvanceParams>) => {
    try {
      return services
        .page({
          ...params.criteria,
          criteria: { ...params.criteria, advanceSearch: { vehicleId: id } },
          pagination: params.pagination,
        })
        .then((it) => {
          return cacheList.cacheDataList({
            type: 'fleet-inspection',
            criteria: params,
            data: it,
          });
        }) as Promise<Paging<InspectionDTO>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };
  return (
    <TableView<InspectionDTO, { searchValue?: string }>
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
            <Radio.Button value="DAILY">DAILY</Radio.Button>
            <Radio.Button value="WEEKLY">WEEKLY</Radio.Button>
          </Radio.Group>
        </Space>
      }
      tableProps={{
        actionRef: actionRef,
      }}
      columns={[
        {
          key: 'date',
          title: 'Inspection Date',
          valueType: 'date',
          dataIndex: 'createdDate',
        },
        {
          key: 'duration',
          title: 'Duration',
          dataIndex: 'duration',
          render: (_, r) => (
            <Tag color={'cyan'}>{[Math.floor(r.duration / 1000), 'm'].join(' ')}</Tag>
          ),
        },
        {
          key: 'type',
          title: 'Type',
          dataIndex: 'inspectionType',
        },

        {
          key: 'item',
          title: 'Item',
          dataIndex: 'item',
          render: (_, r) => [r.checked, r.item].join('/'),
        },

        {
          key: 'percentage',
          title: 'Rate',
          valueType: {
            type: 'percent',
            precision: 0,
          },
          dataIndex: 'percentage',
          render: (_, r) => (
            <Tag color={r.checked > r.item - 5 ? 'green' : 'error'}>
              {[((r.checked / r.item) * 100) ^ 0, '%'].join(' ')}
            </Tag>
          ),
        },

        {
          key: 'fail',
          title: 'Fail Item',
          render: (_, r) => (
            <Popover
              content={r.failItem
                .filter((it) => it.result == false)
                .map((it) => (
                  <p>{it.item}</p>
                ))}
            >
              {r.failItem.filter((it) => it.result == false).length}
            </Popover>
          ),
        },
        {
          key: 'Inspected by',
          title: 'Inspected By',
          dataIndex: 'createdBy',
        },
      ]}
      displayOnly
      actionHandlers={{
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
          cacheList.fetchDataList('retailer-customer').then((v) => {
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
          }) as Promise<Paging<InspectionDTO>>,
      }}
    />
  );
};
