import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import PageWrapper from '@/components/PageWrapper';
import { displayDate } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { useAccess, useQuery } from '@umijs/max';
import { Tag } from 'antd';
import numeral from 'numeral';
import React, { useRef, useState } from 'react';
import AdvanceSearch from '../components/AdvanceSearch';
import SettlementMethodDetail from './Detail';
import { SettlementMethodDetailDTO } from './data';
import { SettlementMethodServicAPI } from './service';
// interface Props {}

const SettlementMianPage: React.FC<any> = () => {
  const access = useAccess();
  const requestActions = simpleRequestActions();
  const services = SettlementMethodServicAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const role = access.canAccessAllMenuDSD
    ? 'sale_admin'
    : access.canAccessTabWarehouse
    ? 'warehouse'
    : access.canAccessTabCashier
    ? 'cashier'
    : 'admin';
  const [filter, setFilter] = useState<
    TableViewSearchParams<AdvanceSearchParam & { type: string }>
  >({
    criteria: { advanceSearch: { status: 'ALL', type: role } },
  });

  const [advanceSearch, setAdvanceSearch] = useState<{
    isVisibled: boolean;
    value?: AdvanceSearchParam & { type: string };
  }>({
    isVisibled: false,
  });

  const { data, isFetching, refetch } = useQuery(
    ['fetch-settlement-list', filter],
    () => services.page(filter),
    {
      refetchOnWindowFocus: false,
    },
  );
  return (
    <>
      <PageWrapper<SettlementMethodDetailDTO, AdvanceSearchParam & { type: string }, ''>
        tabRender={(items) => [
          {
            tabLabel: `${displayDate(items?.settlementDate)}-${items?.salespersonCode}`,
            action: 'view',
            tabKey: `${items?.id}`,
            //{ onUpdateTab, onAddTab, onCloseTab, key }
            panel: () => <SettlementMethodDetail id={items?.id} />,
          },
        ]}
        listView={{
          type: 'Table',
          title: 'Settlement',
          onOpenAdvanceSearch: () =>
            setAdvanceSearch({
              isVisibled: true,
              value: {
                ...filter.criteria,
                type: filter.criteria?.advanceSearch?.type ?? role,
              },
            }),
          statuses: [
            { option: { label: 'All', value: 'ALL', default: true } },
            { option: { label: 'Pending', value: 'Pending' } },
            { option: { label: 'Completed', value: 'Completed' } },
            { option: { label: 'Rejected', value: 'Rejected' } },
          ],
          onRefresh: refetch,
          onFilter(params, page, sort) {
            console.log(params);
            console.log(data);
            console.log(filter);
            console.log(advanceSearch.value);
            setFilter({
              criteria: {
                searchValue: params?.searchValue,
                advanceSearch: {
                  searchValue: params?.searchValue,
                  status: params?.status,
                  type:
                    filter.criteria?.advanceSearch?.type ||
                    advanceSearch.value?.type ||
                    params?.type ||
                    role,
                  dates: advanceSearch.value?.dates,
                  salespersonId: filter.criteria?.advanceSearch?.salespersonId,
                },
                sort: sort,
              },

              // criteria: {
              //   searchValue: filter.criteria?.searchValue,
              //   advanceSearch: {
              //     ...advanceSearch,
              //     type: advanceSearch.value?.type ?? role,
              //     salespersonId: data.salespersonId,
              //     dates: data.dates,
              //   },
              //   //advanceSearch
              // },
              pagination: { ...page },
            });
          },
          props: {
            dataSource: data?.items,
            actionRef: actionRef,
            loading: isFetching,
            pagination: {
              total: data?.total,
            },
            columns: [
              {
                title: 'Settlement Date',
                dataIndex: 'settlementDate',
                valueType: 'date',
                actionProps: (item) => ({
                  type: 'view',
                  label: displayDate(item.settlementDate) || 'n/a',
                }),
              },
              {
                title: 'Salesperson',
                render: (_, r) =>
                  [r?.salespersonCode, r?.salespersonName].filter((p) => p).join(' - '),
              },
              {
                title: 'P.O Number',
                render: (_, r) => r.purchaseOrder?.map((e) => e.purchaseOrderCode).join(', '),
                hidden: role === 'cashier',
              },
              {
                title: 'Cashier',
                dataIndex: 'cashierName',
              },
              {
                title: 'Status',
                dataIndex: 'status',
                render: (_, r) => (
                  <Tag
                    bordered={false}
                    icon={
                      r.status === 'Pending' ? (
                        <SyncOutlined spin />
                      ) : r.status === 'Completed' ? (
                        <CheckCircleOutlined />
                      ) : (
                        <CloseCircleOutlined />
                      )
                    }
                    color={
                      r.status === 'Pending'
                        ? 'processing'
                        : r.status === 'Completed'
                        ? 'success'
                        : 'error'
                    }
                  >
                    {r.status}
                  </Tag>
                ),
              },
              {
                title: 'Amount',
                dataIndex: 'amount',
                valueType: 'money',
                align: 'right',
                render: (_, r) => {
                  const total = r.amount + r.amountKH / r.exchangeRate;
                  return `$ ${numeral(total).format('0,000.000')}`;
                },
              },
              // {
              //   title: 'Exchange Rate',
              //   dataIndex: 'exchangeRate',
              //   align: 'right',
              //   render: (_, r) => `៛ ${numeral(r.exchangeRate).format('0,000')}`,
              // },
            ],
          },
        }}
      />
      <AdvanceSearch
        width={500}
        title="Advance Search"
        open={advanceSearch.isVisibled}
        entity="Settlement"
        onOpenChange={(visible) => {
          if (!visible) {
            setAdvanceSearch({
              isVisibled: false,
              value: {
                ...filter,
                type: filter.criteria?.advanceSearch?.type ?? role,
              },
            });
          }
        }}
        onSearch={(data) => {
          setFilter(
            {
              criteria: {
                searchValue: filter.criteria?.searchValue,
                advanceSearch: {
                  ...advanceSearch.value,
                  type: advanceSearch.value?.type ?? role,
                  salespersonId: data.salespersonId,
                  dates: data.dates,
                },
                //advanceSearch
              },
            },

            //   (v) => ({
            //   ...v,
            //   criteria: {
            //     ...v.criteria,
            //     advanceSearch: {
            //       ...filter.criteria?.advanceSearch,
            //       ...data,
            //       type: filter.criteria?.advanceSearch?.type || '',
            //     },
            //   },
            // })
          );
        }}
        onReset={() => {
          setFilter((v) => ({
            ...v,
            criteria: {
              ...filter.criteria,
              advanceSearch: {
                salespersonId: undefined,
                type: filter.criteria?.advanceSearch?.type ?? role,
                dates: undefined,
              },
            },
          }));
          actionRef.current?.reload?.(true);
        }}
        initData={filter.criteria}
      />
    </>
  );
};

export default SettlementMianPage;
