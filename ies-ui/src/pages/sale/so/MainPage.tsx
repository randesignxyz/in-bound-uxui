
import '@/pages/index.less'
import { Badge, Spin, Typography } from "antd"
import PageWrapper from "@/components/PageWrapper"
import { SoAdvanceSearchParams, SoItemLess } from "@/services/sale/data"
import { ExportOutlined, EyeOutlined, FileOutlined, PaperClipOutlined, PlusCircleOutlined } from "@ant-design/icons"
import { Model } from "./model"
import { useEffect, useRef, useState } from "react"
import { FetchPagingParams } from "@/components/DataCrud/TableView"
import { ActionType } from "@ant-design/pro-components"
import { useAccess, useQuery } from "@umijs/max"
import CustomerDetailView from "@/pages/crm/customer/components/Detail"
import { formatDateTime } from "@/pages/utils"
import Status from "@/components/Status"
import StatusBar from "./components/List/StatusBar"
import ViewWrapper from './ViewWrapper'
import QuickView from './components/List/QickView'
import AdvanceSearch from './components/List/AdvanceSearch'

type FilterType = SoAdvanceSearchParams & {
    searchValue?: string; status?: string;
}
export default () => {
    const { state, actions, modals } = Model();
    const actionRef = useRef<ActionType>();
    const access = useAccess();
    const [filter, setFilter] = useState<FetchPagingParams<SoAdvanceSearchParams>>({
        criteria: {
            status: 'Pending',
            customerType: 'Direct',
        }
    })

    const { data, isFetching, refetch } = useQuery(['fetch-sale-pagin', filter], () => actions.loadListItem({
        advanceSearch: { ...filter.criteria },
        searchValue: filter.keywords
    }, filter.pagination, filter.sort), {
        refetchOnWindowFocus: false,
        refetchInterval: 15000
    })

    const statusBarRef = useRef<{ refresh: (pending?: number, failed?: number) => void }>()

    useEffect(() => {
        actions.initilizeData();
    }, []);

    useEffect(() => {
        const pendingCount = filter.criteria?.customerType == 'ALL' ? (state.data?.soSummary?.pendingDirect || 0) + (state.data?.soSummary?.pendingIndirect || 0) :
            filter.criteria?.customerType == 'Direct' ? state.data?.soSummary?.pendingDirect : state.data?.soSummary?.pendingIndirect
        statusBarRef.current?.refresh(pendingCount, state.data?.soSummary?.failed)
    }, [state.data?.soSummary])
    return <Spin spinning={false}>
        <PageWrapper<SoItemLess, FilterType, {}>
            onNewRender={(key) => access.canCreateEditSo && <ViewWrapper openInTab addNew tabKey={key} />}
            tabRender={item => [
                { action: 'add', tabIcon: <FileOutlined />, panel: ({ key }) => <ViewWrapper addNew openInTab tabKey={key.toString()} />, tabLabel: 'New SO' },
                {
                    action: 'view', value: item?.poNo,
                    panel: () => <ViewWrapper openInTab id={item?.id} />,
                    tabLabel: item?.poNo
                },
                {
                    action: 'action1', value: `${item?.customerCode} - ${item?.customerName}`,
                    panel: () => <CustomerDetailView id={item?.customerId} openInTab getMenuItems={() => []} />,
                    tabLabel: <Badge dot><Typography.Text>{item?.customerCode}</Typography.Text>  </Badge>,
                }
            ]}
            listView={{
                type: 'Table',
                title: 'Task List',
                actionButtons: [{
                    icon: <PlusCircleOutlined />,
                    type: 'link',
                    addNewTab: true,
                    disabled: !access.canCreateEditSo,
                }],
                onOpenAdvanceSearch: () => modals.showModal('advanceSearch'),
                onStatusRender: <StatusBar ref={statusBarRef} onCustomerTypeChanged={(value) => {
                    setFilter(v => ({
                        ...v,

                        criteria: {
                            ...v.criteria,
                            customerType: value
                        }
                    }))
                    actionRef.current?.reload(true)
                }} onStatusChanged={(value) => {
                    setFilter(v => ({
                        ...v,
                        criteria: {
                            ...v.criteria,
                            status: value
                        }
                    }))
                    actionRef.current?.reload(true)
                }} />,
                onRefresh: refetch,
                onFilter: (params, page, sort) => {
                    setFilter(v => (
                        {
                            ...v, keywords: params?.searchValue
                            , criteria: {
                                ...v.criteria,

                                ...params
                            }, pagination: page,
                            sort
                        }
                    ))
                },
                props: {
                    dataSource: data?.items,
                    loading: isFetching,

                    actionRef: actionRef,
                    pagination: {
                        total: data?.total
                    },
                    actionButtonsColumnRender: item => [
                        {
                            type: "link",
                            size: 'small',
                            icon: < ExportOutlined />,
                            onClick: () => window.open(`/external/sale/so/detail/${item.id}`, '_blank')?.focus()
                        },
                        {
                            type: 'link',
                            size: 'small',
                            icon: <EyeOutlined />,
                            onClick: async () => {
                                await actions.fetchSo(item.id);
                                modals.showModal('quickView');
                            }
                        }
                    ],
                    columns: [{
                        title: 'PO #',
                        sorter: 'poNo',
                        width: 140,
                        key: 'poNo',
                        actionProps: (item) => ({
                            type: 'view',
                            label: item.poNo || '',
                            actionButtons: [
                                {
                                    type: 'link',
                                    size: 'small',
                                    position: 'last',
                                    hidden: !item.hasAttachment,
                                    icon: <PaperClipOutlined style={{ color: `${item.uploaded ? '#A0A0A0' : 'red'}` }} />
                                }
                            ]
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
                        actionProps: item => ({ type: 'action1', label: item.customerCode, actionButtons: [{ type: 'link', size: 'small', icon: <ExportOutlined />, onClick: () => { window.open(`/external/crm/customer/detail/${item?.customerId}`, '_blank')?.focus() } }] }),

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

        <QuickView
            width={1000}
            title="Quick View"
            open={modals.isVisible('quickView')}
            onOpenChange={(visible) => {
                !visible && modals.hideModal('quickView');
            }}
            soDetail={state.data?.soDetail}
        />

        <AdvanceSearch
            width={500}
            title="Advance Search"
            open={modals.isVisible('advanceSearch')}
            onOpenChange={(visible) => {
                !visible && modals.hideModal('advanceSearch');
            }}
            initData={filter.criteria}
            salespersons={state.data?.initData?.salespersons}
            lookDataList={state.data?.initData?.lookDataList}
            onSearch={(data) => {
                setFilter(v => ({
                    ...v,
                    criteria: {
                        ...v.criteria,
                        ...data
                    }
                }))
                actionRef.current?.reload?.(true);
            }}
            onReset={() => {
                setFilter(v => ({
                    ...v,
                    criteria: {
                        status: v.criteria?.status,
                        customerType: v.criteria?.customerType
                    }
                }))
                actionRef.current?.reload?.(true);
            }}
        />
    </Spin>
}