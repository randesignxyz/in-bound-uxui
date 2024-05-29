import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDate, formatter } from '@/pages/utils';
import { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { ActionType } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, message, Radio, Space, Tag, Tooltip } from 'antd';
import moment from 'moment';
import Omit from 'omit.js';
import { useRef, useState } from 'react';
import { FuelAvanceSearchParam } from '../../fuel/data';
import { MaintenaceAdvanceSearch, MaintenneceDTO } from '../../maintenance/data';
import { MaintenanceServiceAPI } from '../../maintenance/service';

interface Props {
  id: string;
}

export default ({ id }: Props) => {
  const requestActions = simpleRequestActions();
  const services = MaintenanceServiceAPI(requestActions);
  const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
  const [advanceSearchParams, setAdvanceSearchParams] = useState<FuelAvanceSearchParam>({
    status: 'ALL',
  });

  const actionRef = useRef<ActionType>();
  const durationDate = (r: MaintenneceDTO) => {
    if (r.formDate && r.toDate !== null) {
      const start = moment(r.formDate);
      const end = moment(r.toDate);
      return moment.duration(start.diff(end)).humanize();
    }
    return '';
  };

  const cacheList = useModel('dataList');
  const onRequestHandler = async (params: TableViewSearchParams<MaintenaceAdvanceSearch>) => {
    try {
      return services
        .page({
          ...params.criteria,
          pagination:params.pagination,
          criteria: { searchValue: params.criteria?.searchValue, advanceSearch: { vehicleId: id }, sort:{...params.criteria?.sort} },
        })
        .then((it) => {
          return cacheList.cacheDataList({
            type: 'fleet-maintenance',
            criteria: params,
            data: it,
          });
        }) as Promise<Paging<MaintenneceDTO>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  return (
    <TableView<MaintenneceDTO, { searchValue?: string }>
      hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
      cache
      displayOnly
      extraFilter={
        <Space size="small">
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
            <Radio.Button value="ALL" style={{ borderRadius: 5 }}>
              All
            </Radio.Button>
          </Radio.Group>
        </Space>
      }
      columns={[
        {
          key: 'Date',
          title: 'Date',
          dataIndex: 'createdDate',
          sorter: 'createdDate',
          valueType: 'date',
          render: (_, r) => (
            <>
              <Button type="link" onClick={() => {}}>
                {formatDate(r.createdDate)}
              </Button>
            </>
          ),
        },
        {
          key: 'durationDate',
          title: 'Duration Date',
          render: (_, r) => (
            <Tooltip
              title={[
                moment(r.formDate).format('YYYY-MM-DD HH:mm:ss'),
                moment(r.toDate).format('YYYY-MM-DD HH:mm:ss'),
              ].join('/')}
              color={'blue'}
            >
              {durationDate(r) || '-'}
            </Tooltip>
          ),
        },
        {
          key: 'vendorname',
          title: 'Vendor Name',
          dataIndex: 'vendorName',
          sorter: 'vendorName',
          render: (_, r) => r.vendorName?.name,
        },
        {
          key: 'item',
          title: 'Item',
          dataIndex: 'itemCount',
        },
        {
          key: 'totalCost',
          title: 'Cost',
          dataIndex: 'totalCost',
          sorter: 'totalCost',
          render: (_, r) => formatter.format(r.totalCost),
        },
        {
          key: 'odometer',
          sorter: 'odometer',
          title: 'Odometer',
          render: (_, r) => [r.odometer.toFixed(2), 'km'].filter((it) => it).join(' '),
        },
        {
          key: 'status',
          sorter: 'status',
          title: 'Status',
          render: (_, r) => (
            <Tag color={r.status == 'Void' ? 'error' : r.status === 'Open' ? 'green' : 'cyan'}>
              {r.status}
            </Tag>
          ),
        },
        {
          key: 'by',
          title: 'Created by',
          dataIndex: 'createdBy',
        },
      ]}
      tableProps={{
        actionRef: actionRef,
      }}
      advanceSearch
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
          cacheList.fetchDataList('fleet-maintenance').then((v) => {
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
          }) as Promise<Paging<MaintenneceDTO>>,
      }}
    />
  );
};
