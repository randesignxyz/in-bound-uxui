import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import PageWrapper from '@/components/PageWrapper';
import { displayDate } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { useQuery } from '@umijs/max';
import { Tag, Typography } from 'antd';
import numeral from 'numeral';
import { useRef, useState } from 'react';
import AdvanceSearch from '../components/AdvanceSearch';
import CountStockDetail from './Detail';
import { StockCountDto } from './data';
import { CountStockServiceAPI } from './service';

const CountStockMainPage: React.FC<any> = () => {
  const requestActions = simpleRequestActions();
  const services = CountStockServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [filter, setFilter] = useState<TableViewSearchParams<AdvanceSearchParam>>({
    criteria: { advanceSearch: { status: 'ALL' } },
  });

  const [advanceSearch, setAdvanceSearch] = useState<{
    isVisibled: boolean;
    value?: AdvanceSearchParam;
  }>({
    isVisibled: false,
  });

  const { data, isFetching, refetch } = useQuery(
    ['fetch-stock-count-list', filter],
    () => services.page(filter),
    {
      refetchOnWindowFocus: false,
      retry: false,
    },
  );
  return (
    <>
      <PageWrapper<StockCountDto, AdvanceSearchParam, ''>
        tabRender={(items) => [
          {
            tabLabel: `${items?.countedNo}`,
            action: 'view',
            tabKey: `sc-${items?.id}`,
            panel: ({}) => <CountStockDetail id={items?.id} />,
          },
        ]}
        listView={{
          type: 'Table',
          title: 'Stock Count',
          onOpenAdvanceSearch: () => setAdvanceSearch({ isVisibled: true }),
          onRefresh: refetch,
          onFilter(params, page, sort) {
            setFilter(() => ({
              criteria: {
                searchValue: params?.searchValue,
                advanceSearch: {
                  status: params?.status,
                  dates: advanceSearch.value?.dates,
                  salespersonId: advanceSearch.value?.salespersonId,
                },
              },
              pagination: { ...page },
              sort: sort,
            }));
          },
          statuses: [
            { option: { value: 'ALL', label: 'All', default: true } },
            { option: { value: 'Pending', label: 'Pending' } },
            { option: { value: 'Rejected', label: 'Rejected' } },
            { option: { value: 'Approved', label: 'Approved' } },
          ],
          props: {
            dataSource: data?.items,
            actionRef: actionRef,
            loading: isFetching,
            pagination: {
              total: data?.total,
            },
            columns: [
              {
                title: 'Counted No',
                dataIndex: 'countedNo',
                actionProps: (items) => ({
                  label: `${items.countedNo}`,
                  type: 'view',
                }),
              },
              {
                title: 'Counted Date',
                // dataIndex: 'countedDate',
                // valueType: 'date',
                render: (_, r) => displayDate(r.countedDate),
              },
              {
                title: 'Saleperson Name',
                dataIndex: 'salespersonName',
              },
              {
                title: 'Status',
                render: (_, r) => (
                  <Tag
                    bordered={false}
                    icon={
                      r.status === 'Pending' ? (
                        <SyncOutlined spin />
                      ) : r.status === 'Rejected' ? (
                        <CloseCircleOutlined />
                      ) : (
                        <CheckCircleOutlined />
                      )
                    }
                    color={
                      r.status === 'Pending'
                        ? 'processing'
                        : r.status === 'Rejected'
                        ? 'error'
                        : 'success'
                    }
                  >
                    {r.status}
                  </Tag>
                ),
              },
              {
                title: 'Sold Quantity',
                dataIndex: 'soldQuantity',
                align: 'right',
                render: (_, r) => (
                  <>
                    ( <Typography.Text type="warning">{r.soldQuantity} </Typography.Text>)
                  </>
                ),
              },
              {
                title: 'Total Quantity',
                dataIndex: 'totalQuantity',
                align: 'right',
              },
              {
                title: 'Cnt. Invoices',
                dataIndex: 'countedInvoices',
                align: 'right',
              },
              {
                title: 'Amount',
                dataIndex: 'soldAmount',
                align: 'right',
                render: (_, r) => `$ ${numeral(r.soldAmount).format('0,000.000')}`,
                // valueType: "money",
              },
            ],
          },
        }}
      />
      <AdvanceSearch
        width={500}
        title="Advance Search"
        open={advanceSearch.isVisibled}
        entity="Stock Count"
        showingBar={true}
        onOpenChange={(visible) => {
          if (!visible) {
            setAdvanceSearch({ isVisibled: false });
          }
        }}
        onSearch={(data) => {
          setFilter({
            criteria: {
              searchValue: filter.criteria?.searchValue,
              advanceSearch: {
                ...advanceSearch.value,
                salespersonId: data.salespersonId,
                dates: data.dates,
              },
              //advanceSearch
            },
          });
        }}
        onReset={() => {
          setFilter((v) => ({
            ...v,
            criteria: {
              ...filter.criteria,
              advanceSearch: {
                salespersonId: undefined,
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

export default CountStockMainPage;
