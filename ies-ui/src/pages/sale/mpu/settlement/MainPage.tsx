import PageWrapper from "@/components/PageWrapper"
import { simpleRequestActions } from "@/services/model";
import React, { useRef, useState } from "react"
import { SettlementMethodServicAPI } from "./service";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { useQuery } from "@umijs/max";
import { ActionType } from "@ant-design/pro-components";
import { formatDate } from "@/pages/utils";
import SettlementMethodDetail from "./Detail";
import { formatCurrency } from "../../sale";
import { Tag } from "antd";
import { SyncOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
interface Props {

}

const SettlementMianPage: React.FC<Props> = () => {
    const requestActions = simpleRequestActions();
    const services = SettlementMethodServicAPI(requestActions);
    const actionRef = useRef<ActionType>();
    const [filter, setFilter] = useState<TableViewSearchParams<SettlementMethodAdvanceSearch>>({
        criteria: { advanceSearch: { status: 'ALL' } }
    });
    const { data, isFetching, refetch } = useQuery(['fetch-settlement-list', filter], () => services.page(filter), {
        refetchOnWindowFocus: false,
        cacheTime:5, 
    });
    return (<>

        <PageWrapper<SettlementMethodDetailDTO, SettlementMethodAdvanceSearch, {}>
            tabRender={items => [
                {
                    tabLabel: `${formatDate(items?.settlementDate)}-${items?.salespersonCode}`,
                    action: "view",
                    tabKey: `${formatDate(items?.settlementDate)}-${items?.salespersonCode}`,
                    panel: ({ onUpdateTab, onAddTab, onCloseTab, key }) => <SettlementMethodDetail id={items?.id} />
                }
            ]}
            listView={{
                type: "Table",
                title: "Settlement",
                statuses: [
                    { option: { label: "All", value: "ALL", default:true } },
                    { option: { label: "Pending", value: "Pending" } },
                    { option: { label: "Completed", value: "Completed" } },
                    { option: { label: "Rejected", value: "Rejected" } },
                ],
                // advanceSearchButton:<Button icon={<FileSearchOutlined />} onClick={()=>{}} />,
                onRefresh: refetch,
                onFilter: (params, page, sort) => {
                    setFilter(v => ({
                        ...v,
                        criteria: {
                            searchValue: params?.searchValue,
                            advanceSearch: {
                                status: params?.status || "ALL"
                            },
                            sort: sort
                        },
                        pagination: { ...page },
                    }))
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
                            title: "Settlement Date",
                            dataIndex: "settlementDate",
                            valueType: 'date',
                            actionProps: (item) => ({
                                type: 'view',
                                label: formatDate(item.settlementDate) || 'n/a',
                            }),
                        },
                        {
                            title: "Salesperson Code",
                            dataIndex: "salespersonCode"
                        },
                        {
                            title: "Cashier Name",
                            dataIndex: "cashierName"
                        },
                        {
                            title: "Status",
                            dataIndex: "status",
                            render:(_,r)=><Tag
                                bordered={false}
                                icon={
                                    r.status=="Pending"?<SyncOutlined spin />
                                    :r.status =="Completed"?<CheckCircleOutlined />
                                    :<CloseCircleOutlined />
                                }
                                color={
                                    r.status=="Pending"?"processing"
                                    :r.status =="Completed"?"success"
                                    :"error"
                                }

                            >{r.status}</Tag>
                        },
                        {
                            title: "Amount",
                            dataIndex: "amount",
                            valueType: "money"
                        },
                        {
                            title: "Exchange Rate",
                            dataIndex: "exchangeRate",
                            render: (_, r) => formatCurrency(r.exchangeRate, '៛'),
                        },
                        {
                            title: "Amount (KH)",
                            dataIndex: "amountKH",
                            render: (_, r) => formatCurrency(r.amountKH, '៛')
                        },
                    ]
                }
            }}
        />
    </>)
}


export default SettlementMianPage