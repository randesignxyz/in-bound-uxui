import PageWrapper from "@/components/PageWrapper"
import CountStockDetail from "./Detail"
import { CountStockServiceAPI } from "./service";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { simpleRequestActions } from "@/services/model";
import { ActionType } from "@ant-design/pro-components";
import { useQuery } from "@umijs/max";
import { useRef, useState } from "react";
import { formatterQty } from "@/pages/utils";
import { Tag } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from "@ant-design/icons";

interface Props {
}

const CountStockMainPage: React.FC<Props> = () => {
  const requestActions = simpleRequestActions();
  const services = CountStockServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [filter, setFilter] = useState<TableViewSearchParams<CountStockAdvanceSearch>>({
    criteria: { advanceSearch: { status: 'ALL' } }
  });
  const { data, isFetching, refetch } = useQuery(['fetch-stock-count-list',filter], () => services.page(filter), {
    refetchOnWindowFocus: false,
    cacheTime:9,
    keepPreviousData:false
  });
  return (
    <PageWrapper<StockCountDto, CountStockAdvanceSearch, {}>
      tabRender={items => [
        {
          tabLabel: `${items?.countedNo}`,
          action: "view",
          panel: ({ }) => <CountStockDetail id={items?.id} />
        }
      ]}
      listView={{
        type: "Table",
        title: "Count Stock",
        onRefresh: refetch,
        onFilter: (params, page, sort) => {
          setFilter(k => ({
            ...k,
            criteria: {
              searchValue: params?.searchValue,
              advanceSearch: {
                status: params?.status || "ALL"
              },
              sort: sort
            },
            pagination: { ...page }
          }))
        },
        statuses: [
          { option: { value: "ALL", label: "All", default: true } },
          { option: { value: "Pending", label: "Pending" } },
          { option: { value: "Rejected", label: "Rejected" } },
          { option: { value: "Approved", label: "Approved" } },
        ],
        props: {
          dataSource: data?.items,
          actionRef: actionRef,
          loading: isFetching,
          pagination: {
            total: data?.total
          },
          columns: [
            {
              title: "Counted No",
              dataIndex: "countedNo",
              actionProps: (items) => ({
                label: `${items.countedNo}`,
                type: "view",
              })
            },
            {
              title: "Saleperson",
              dataIndex: "type",
              render: (_, r) => [r.salespersonCode, r.salespersonName].join("-")
            },
            {
              title: "Stock code",
              dataIndex: "storeCode"
            },
            {
              title: "Status",
              render: (_, r) => <Tag
                bordered={false}
                icon={
                  r.status == "Pending" ? <SyncOutlined spin />
                    : r.status == "Rejected" ? <CloseCircleOutlined />
                      : <CheckCircleOutlined />
                }
                color={
                  r.status =="Pending" ?"processing"
                  :r.status =="Rejected"?"error"
                  :"success"
                }
              >{r.status}</Tag>
            },
            {
              title: "Sales Volume",
              dataIndex: "soldQuantity",
              render: (_, r) => formatterQty.format(r.soldQuantity)
            },
            {
              title: "Sales Amount",
              dataIndex: "soldAmount",
              valueType: "money"
            },
            {
              title: "Sales Amount",
              dataIndex: "soldAmount",
              valueType: "money"
            },
            {
              title: "Counted Date",
              dataIndex: "countedDate",
              valueType: "date"
            },
          ]
        }
      }}
    />
  )
}

export default CountStockMainPage