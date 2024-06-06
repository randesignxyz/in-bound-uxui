
import '@/pages/index.less'
import SoDetailView from "./components/Detail"
import { Badge, Button, Space, Spin, Typography } from "antd"
import PageWrapper from "@/components/PageWrapper"
import { SoAdvanceSearchParams, SoItemLess } from "@/services/sale/data"
import { EyeOutlined, PaperClipOutlined, SelectOutlined } from "@ant-design/icons"
import { Model } from "./model"
import { useEffect, useRef, useState } from "react"
import { FetchPagingParams } from "@/components/DataCrud/TableView"
import { ActionType } from "@ant-design/pro-components"
import { useQuery } from "@umijs/max"
import CustomerDetailView from "@/pages/crm/customer/components/Detail"
import { formatDateTime } from "@/pages/utils"
import Status from "@/components/Status"
import StatusBar from "./components/List/StatusBar"
import ViewWrapper from './ViewWrapper'
import Create from './components/Create'

type FilterType = SoAdvanceSearchParams & {
    searchValue?: string; status?: string;
}
export default () => {
    const { state, actions, modals } = Model();
    const actionRef = useRef<ActionType>();
    const [filter, setFilter] = useState<FetchPagingParams<SoAdvanceSearchParams>>({
        criteria: {
            status: 'Pending',
            customerType: 'Direct',
        }
    })

    const [disbleQuery, setDisableQuery] = useState(true)
    const { data, isFetching } = useQuery(['fetch-sale-pagin', filter], () => actions.loadListItem({
        advanceSearch: { ...filter.criteria },
        searchValue: filter.keywords
    }, filter.pagination, filter.sort), {
        refetchOnWindowFocus: false,
        refetchInterval: 15000
    })

    const statusBarRef = useRef<{ refresh: (pending?: number, failed?: number) => void }>()
    useEffect(() => {
        statusBarRef.current?.refresh(state.data?.soSummary?.pendingDirect, state.data?.soSummary?.failed)
    }, [state.data?.soSummary])
    return <Spin spinning={false}>
        <PageWrapper<SoItemLess, FilterType, {}>
            onNewRender={(key) => <ViewWrapper addNew tabKey={key} />}
            listView={{
                type: 'Table',
                title: 'Sale List',
                onStatusRender: <StatusBar ref={statusBarRef} onCustomerTypeChanged={() => { }} onStatusChanged={() => { }} />,
                onFilter: (params) => {

                },
                // onRefresh: refetch,
                props: {
                    dataSource: data?.items,
                    loading: isFetching,
                    actionRef: actionRef,
                    pagination: {
                        total: data?.total
                    },
                    columns: [{
                        width: 50,
                        render: (_, r) => (
                            <Space size={0}>
                                <Button
                                    type="link"
                                    icon={<SelectOutlined />}
                                    onClick={async () => {
                                        window.open(`/external/sale/so/detail/${r.id}`, '_blank')?.focus();
                                    }}
                                />
                                <Button
                                    type="link"
                                    icon={<EyeOutlined />}
                                    onClick={async () => {
                                        // await actions.fetchSo(r.id);
                                        // modals.showModal('quickView');
                                    }}
                                />
                                {r.hasAttachment && (
                                    <PaperClipOutlined style={{ color: `${r.uploaded ? '#A0A0A0' : 'red'}` }} />
                                )}
                            </Space>
                        )
                    }, {
                        title: 'PO #',
                        sorter: 'poNo',
                        width: 130,
                        key: 'poNo',
                        tabRender: item => ({
                            value: item.poNo,
                            panel: <ViewWrapper id={item.id} />,
                            tabLabel: item.poNo
                        })
                    }, {
                        title: 'SO #',
                        sorter: 'soNo',
                        hideInTable: filter.criteria?.status === 'Pending',
                        width: 110,
                        dataIndex: 'soNo',
                        //render: colLink(actionHandlers?.onDetail, (d) => d.soNo || 'Not Assigned'),
                    }, {
                        title: 'Customer',
                        sorter: 'customerCode',
                        key: 'customerCode',
                        tabRender: item => ({
                            value: `${item.customerCode} - ${item.customerName}`,
                            panel: <CustomerDetailView id={item.customerId} openInTab getMenuItems={() => []} />,
                            tabLabel: <Badge dot><Typography.Text>{item.customerCode}</Typography.Text>  </Badge>,
                        })
                    }, {
                        title: 'Ship To',
                        render: (_, data) => data.shippingAddress,
                    },

                    {
                        title: 'Salesperson',
                        render: (_, data) => data.salespersonName,
                        sorter: 'salespersonName',
                    },
                    {
                        title: 'Province',
                        dataIndex: 'province',
                    },
                    {
                        title: 'Region',
                        dataIndex: 'region',
                    },
                    {
                        title: 'Del. Method',
                        render: (_, r) => r.deliveryMethod,
                    },
                    {
                        title: 'Order Date',
                        align: 'right',
                        sorter: 'orderDate',

                        width: 150,
                        render: (_, data) => formatDateTime(data.orderedDate),
                    },
                    {
                        title: 'Amount',
                        align: 'right',
                        valueType: {
                            type: 'money',
                            locale: 'en-US',
                        },
                        dataIndex: 'amount',
                    },
                    {
                        title: 'Status',
                        render: (_, r) => r.status && <Status text={r.status} />,
                    },
                    {
                        title: 'Source',
                        dataIndex: 'source',
                    },]
                }
            }} />

    </Spin>
}