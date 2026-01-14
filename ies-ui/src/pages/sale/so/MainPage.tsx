
import '@/pages/index.less'
import { Badge, Button, Card, Flex, Form, Space, Spin, Tag, Typography } from "antd"
import PageWrapper from "@/components/PageWrapper"
import { SoAdvanceSearchParams, SoItemLess } from "@/services/sale/data"
import { ExportOutlined, EyeOutlined, FileOutlined, FileSearchOutlined, PaperClipOutlined, PlusCircleOutlined, SyncOutlined } from "@ant-design/icons"
import { Model } from "./model"
import { useEffect, useRef, useState } from "react"
import { FetchPagingParams } from "@/components/DataCrud/TableView"
import { ActionType, ProForm, ProFormCascader } from "@ant-design/pro-components"
import { useAccess, useParams, useQuery } from "@umijs/max"
import CustomerDetailView from "@/pages/crm/customer/components/Detail"
import { formatDateTime } from "@/pages/utils"
import Status from "@/components/Status"
import StatusBar from "./components/List/StatusBar"
import ViewWrapper from './ViewWrapper'
import QuickView from './components/List/QickView'
import AdvanceSearch from './components/List/AdvanceSearch'
import { simpleRequestActions } from '@/services/model'
import ExcelSaleAreaFilter from './components/ExcelFilterSelect'

type FilterType = SoAdvanceSearchParams & {
    searchValue?: string; status?: string;
}
export default () => {
    const requestActions = simpleRequestActions();
    const { state, actions, modals } = Model();
    const actionRef = useRef<ActionType>();
    const [form] = Form.useForm();
    const access = useAccess();
    const param = useParams();
    const [filter, setFilter] = useState<FetchPagingParams<SoAdvanceSearchParams>>({
        criteria: {
            status: 'Pending',
            customerType: 'Direct',
            saleArea: [0],
        }
    })

    const { data, isFetching, refetch } = useQuery(['fetch-sale-pagin', filter], () => actions.loadListItem({
        advanceSearch: { ...filter.criteria },
        searchValue: filter.keywords,
        divisionId: filter.criteria?.saleArea?.length ? filter.criteria?.saleArea : [0]
    }, filter.pagination, filter.sort), {
        refetchOnWindowFocus: false,
        // refetchInterval: 60000
        refetchInterval: 3600000
    })



    const statusBarRef = useRef<{ refresh: (pending?: number, failed?: number, totalPending?: number) => void }>()

    useEffect(() => {
        actions.initilizeData();
    }, []);

    const [saleArea, setSaleArea] = useState<any[]>([]);

    useEffect(() => {
        const pendingCount = filter.criteria?.customerType == 'All' ? ((state.data?.soSummary?.pendingDirect ?? 0) + (state.data?.soSummary?.pendingIndirect ?? 0)) :
            filter.criteria?.customerType == 'Direct' ? state.data?.soSummary?.pendingDirect :
                state.data?.soSummary?.pendingIndirect

        let totalPending = (state.data?.soSummary?.pendingDirect ?? 0) + (state.data?.soSummary?.pendingIndirect ?? 0);

        // switch (filter.criteria?.customerType) {
        //     case 'All':
        //         totalPending = state.data?.soSummary?.allPending ?? 0;
        //         break;

        //     case 'Direct':
        //         totalPending = (state.data?.soSummary?.allPending ?? 0) - (state.data?.soSummary?.pendingIndirect ?? 0);
        //         break;

        //     default:
        //         break
        //     // totalPending = (state.data?.soSummary?.pendingDirect ?? 0) + (state.data?.soSummary?.pendingIndirect ?? 0);
        // }

        statusBarRef.current?.refresh(pendingCount, state.data?.soSummary?.failed, totalPending)
    }, [state.data?.soSummary])

    const optionsRef = useRef<{ value: number; label: string }[]>([]);
    const [isSelectAll, setIsSelectAll] = useState(false);


    return <Spin spinning={false}>
        <PageWrapper<SoItemLess, FilterType, {}>
            onNewRender={(key) => access.canCreateEditSo && <ViewWrapper openInTab addNew tabKey={key} />}
            tabRender={item => access.canCreateEditSo ? [
                { action: 'add', tabIcon: <FileOutlined />, panel: ({ key }) => <ViewWrapper addNew openInTab tabKey={key.toString()} />, tabLabel: 'New PO' },
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
            ] : [
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
                title: 'PO List',
                onExtraFilterRender: () => <>
                    <Card size='small' style={{ marginTop: -10, marginBottom: 0, }}
                        styles={{
                            body: {
                                // padding: 0,
                                backgroundColor: "#f5f5f5"
                            }
                        }}
                        hidden={!saleArea?.length}>
                        <Flex gap={1} align="center" wrap>
                            {
                                (saleArea.length > 0) && saleArea?.filter(p => p.value != 0)?.map(p => {
                                    return <Tag
                                    >{p.label}</Tag>
                                })
                            }
                        </Flex>
                    </Card>
                </>,
                actionButtons: [{
                    icon: <SyncOutlined />,
                    type: 'link',
                    disabled: !access.canCreateEditSo,
                    onClick: async () => {
                        await actions.syncFromSFA()
                        actionRef.current?.reload(true)
                    }
                }, {
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
                }}
                    onStatusChanged={(value) => {
                        setIsSelectAll(value == "AllPending")
                        setFilter(v => ({
                            ...v,
                            criteria: {
                                ...v.criteria,
                                status: value == "AllPending" ? 'Pending' : value,
                                saleArea: value == "AllPending" ? optionsRef.current.map(v => v.value) : v.criteria?.saleArea
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

                advanceSearchButton: <Space align='center'>
                    <Button style={{ marginTop: -6 }} icon={<FileSearchOutlined />}
                        onClick={() => modals.showModal('advanceSearch')}
                    />

                    <ProForm
                        form={form}
                        submitter={false}
                    >

                        <ExcelSaleAreaFilter
                            form={form}
                            requestActions={requestActions}
                            isSelectAll={isSelectAll}
                            onInit={(values, options) => {
                                setSaleArea(options);
                                setFilter(v => ({
                                    ...v,
                                    criteria: { ...v.criteria, saleArea: values },
                                }));
                            }}
                            onChange={(values, options) => {
                                setSaleArea(options);
                                setFilter(v => ({
                                    ...v,
                                    criteria: { ...v.criteria, saleArea: values },
                                }));
                            }}
                        />
                    </ProForm>
                </Space>,

                props: {
                    dataSource: data?.items,
                    loading: isFetching,
                    actionRef: actionRef,
                    pagination: {
                        total: data?.total
                    },
                    onChange: (pagination, filters, sorter, extra) => {
                        const s = Array.isArray(sorter) ? sorter[0] : sorter;
                        setFilter(v => ({
                            criteria: {
                                ...v.criteria,
                            },
                            pagination,
                            sort: s?.field && s.order ? { [s.field as string]: s.order } : undefined
                        }))
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

                    rowKey: 'id',

                    columns: [{
                        title: 'PO #',
                        sorter: 'poNo',
                        dataIndex: 'poNo',
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
                        dataIndex: 'customerCode',
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
                        dataIndex: 'salespersonName',
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
                        dataIndex: "orderDate",
                        width: 150,
                        render: (_, data) => formatDateTime(data.orderedDate),
                    },
                    // {
                    //     title: 'First Delivery Date',
                    //     align: 'right',
                    //     sorter: 'deliveryDate',

                    //     width: 150,
                    //     render: (_, data) => formatDate(data.deliveryDate),
                    // },
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
                // console.log(data);
                // console.log( data.saleArea.length);


                setFilter(v => ({
                    ...v,
                    criteria: {
                        ...v.criteria,
                        ...data,
                        // myTask: (data.saleArea?.length > 0) ? false : data?.myTask
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
