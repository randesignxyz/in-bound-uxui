
import '@/pages/index.less'
import { Badge, Button, Card, Flex, Form, message, Space, Spin, Tag, Typography } from "antd"
import PageWrapper from "@/components/PageWrapper"
import { SoAdvanceSearchParams, SoItemLess } from "@/services/sale/data"
import { ExportOutlined, EyeOutlined, FileAddOutlined, FileOutlined, FileSearchOutlined, PaperClipOutlined, PlusCircleOutlined, PlusOutlined, SyncOutlined } from "@ant-design/icons"
import { Model } from "./model"
import { useEffect, useRef, useState } from "react"
import { TableViewSearchParams } from "@/components/DataCrud/TableView"
import { ActionType, ProForm } from "@ant-design/pro-components"
import { useAccess, useQuery } from "@umijs/max"
import CustomerDetailView from "@/pages/crm/customer/components/Detail"
import Status from "@/components/Status"
import StatusBar from "./components/List/StatusBar"
import ViewWrapper from './ViewWrapper'
import QuickView from './components/List/QickView'
import AdvanceSearch from './components/List/AdvanceSearch'
import { simpleRequestActions } from '@/services/model'
import ExcelSaleAreaFilter from './components/ExcelFilterSelect'
import moment from 'moment'
import PageWrapperV1 from '@/components/PageWrapperV1'

type FilterType = SoAdvanceSearchParams & {
    searchValue?: string; status?: string;
}
export default () => {
    const requestActions = simpleRequestActions();
    const { state, actions, modals } = Model();
    const actionRef = useRef<ActionType>();
    const [form] = Form.useForm();
    const access = useAccess();
    const [loading, isLoading] = useState(false)
    const [filter, setFilter] = useState<TableViewSearchParams<SoAdvanceSearchParams>>({
        criteria: {
            advanceSearch: {
                status: 'Pending',
                customerType: 'Direct',
                saleArea: [0],
                divisionId: [0],
                orderedDate: [moment().subtract(1, 'months'), moment()]
            }
        }
    });

    const { data, isFetching, refetch } = useQuery(['fetch-sale-pagin', filter], () => actions.loadListItem(filter), {
        refetchOnWindowFocus: false,
        refetchInterval: 3600000
    })


    const statusBarRef = useRef<{ refresh: (pending?: number, failed?: number, totalPending?: number) => void }>()

    useEffect(() => {
        actions.initilizeData();
    }, []);

    const [saleArea, setSaleArea] = useState<any[]>([]);

    useEffect(() => {
        const pendingCount = filter.criteria?.advanceSearch?.customerType == 'All' ? ((state.data?.soSummary?.pendingDirect ?? 0) + (state.data?.soSummary?.pendingIndirect ?? 0)) :
            filter.criteria?.advanceSearch?.customerType == 'Direct' ? state.data?.soSummary?.pendingDirect :
                state.data?.soSummary?.pendingIndirect

        let totalPending = (state.data?.soSummary?.pendingDirect ?? 0) + (state.data?.soSummary?.pendingIndirect ?? 0);

        statusBarRef.current?.refresh(pendingCount, state.data?.soSummary?.failed, totalPending)
    }, [state.data?.soSummary])


    const optionsRef = useRef<{ value: number; label: string }[]>([]);
    const [isSelectAll, setIsSelectAll] = useState(false);


    return <Spin spinning={loading}>
        <PageWrapperV1<SoItemLess, FilterType, {}>
            // onNewRender={(key) => access.canCreateEditSo && <ViewWrapper openInTab addNew tabKey={key} />}
            addOptionsMode='inline'
            addOptionsPosition='right'
            showFullScreenButton
            // showNewWindowButton

            tabRender={item => access.canCreateEditSo ? [

                {
                    action: 'PO', tabIcon: <FileAddOutlined />, panel: ({ key, onUpdateTab }) => <ViewWrapper addNew openInTab tabKey={key.toString()} target='PO' actionHandlers={{
                        onBack() {
                            onUpdateTab("view", undefined, undefined, key)
                        },
                    }} />, tabLabel: 'New PO', multiple: true,
                },
                { action: 'GO', tabIcon: <FileAddOutlined />, panel: ({ key, onUpdateTab }) => <ViewWrapper addNew openInTab tabKey={key.toString()} target='GO' />, tabLabel: 'New GO', multiple: true },
                {
                    action: 'view', value: item?.poNo,
                    panel: () => <ViewWrapper openInTab id={item?.id} />,
                    tabLabel: item?.poNo,

                },
                {
                    action: 'action1', value: `${item?.customerCode} - ${item?.customerName}`,
                    panel: () => <CustomerDetailView id={item?.customerId} openInTab getMenuItems={() => []} />,
                    tabLabel: <Badge dot><Typography.Text>{item?.customerCode}</Typography.Text>  </Badge>,
                },
            ] : [
                {
                    action: 'view', value: item?.poNo,
                    panel: () => <ViewWrapper openInTab id={item?.id} />,
                    tabLabel: item?.poNo
                },
            ]}
            defaultTabClosable={false}
            addOptions={[
                {
                    action: "PO",
                    label: <Space><PlusOutlined /><span>PO</span></Space>,
                    // icon: <FileAddOutlined />,
                    tabLabel: 'New PO',
                    multiple: true,
                },
                {
                    action: "GO",
                    label: <Space><PlusOutlined /><span>GO</span></Space>,
                    // icon: <FileAddOutlined />,
                    tabLabel: 'New GO',
                    multiple: true
                },
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
                actionButtons: [
                    {
                        icon: <SyncOutlined />,
                        type: 'link',
                        disabled: !access.canCreateEditSo,
                        onClick: async () => {
                            try {
                                isLoading(true)
                                await actions.syncFromSFA()
                                actionRef.current?.reload(true)
                                message.success("Sync Success");
                            } catch(error: any) {
                                message.error(error.message);
                            } finally {
                                isLoading(false)
                            }


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
                            advanceSearch: {
                                ...v.criteria?.advanceSearch,
                                customerType: value
                            }
                        } 
                    }))
                    actionRef.current?.reload(true)
                }}
                    onStatusChanged={(value) => {
                        setIsSelectAll(value == "AllPending")
                        if (value == "AllPending") {
                            setFilter(v => ({
                                ...v,
                                criteria: {
                                    advanceSearch: {
                                        ...v.criteria?.advanceSearch,
                                        status: "Pending",
                                        saleArea: [0],
                                        divisionId: [0],
                                        customerType: "All"
                                    }
                                }
                            }))
                        }
                        else {
                            setFilter(v => ({
                                ...v,
                                criteria: {
                                    advanceSearch: {
                                        ...v.criteria?.advanceSearch,
                                        status: value == "AllPending" ? 'Pending' : value,
                                        saleArea: value == "AllPending" ? optionsRef.current.map(v => v.value) : v.criteria?.advanceSearch?.saleArea,
                                        divisionId: value == "AllPending" ? optionsRef.current.map(v => v.value) : v.criteria?.advanceSearch?.saleArea,
                                    }
                                }
                            }))
                        }
                        // setFilter(v => ({
                        //     ...v,
                        //     criteria: {
                        //         advanceSearch: {
                        //             ...v.criteria?.advanceSearch,
                        //             status: value == "AllPending" ? 'Pending' : value,
                        //             saleArea: value == "AllPending" ? optionsRef.current.map(v => v.value) : v.criteria?.advanceSearch?.saleArea,
                        //             divisionId: value == "AllPending" ? optionsRef.current.map(v => v.value) : v.criteria?.advanceSearch?.saleArea,
                        //         }
                        //     }
                        // }))
                        // actionRef.current?.reload(true)
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
                    <Button style={{ marginTop: 0 }} icon={<FileSearchOutlined />}
                        onClick={() => modals.showModal('advanceSearch')}
                    />
                    <ProForm
                        form={form}
                        submitter={false}
                        style={{ marginTop: 10 }}
                    >
                        <ExcelSaleAreaFilter
                            form={form}
                            requestActions={requestActions}
                            isSelectAll={isSelectAll}
                            width={100}
                            onInit={(values, options) => {
                                setSaleArea(options);
                                setFilter(v => ({
                                    ...v,
                                    criteria: {
                                        ...v.criteria,
                                        advanceSearch: {
                                            ...v.criteria?.advanceSearch,
                                            saleArea: values,
                                            divisionId: values
                                        }
                                    },
                                }));
                            }}
                            onChange={(values, options) => {
                                setFilter(v => ({
                                    ...v,
                                    criteria: {
                                        ...v.criteria,
                                        advanceSearch: {
                                            ...v.criteria?.advanceSearch,
                                            saleArea: values.length > 0 ? values : [0],
                                            divisionId: values.length > 0 ? values : [0]
                                        }
                                    },
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
                            ...v,
                            criteria: {
                                ...v.criteria,
                                ...filters,
                                sort: s?.field && s.order ? { [s.field as string]: s.order } : undefined
                            },
                            pagination
                        }));
                    },
                    // actionButtonsColumnRender: item => [
                    //     {
                    //         type: "link",
                    //         size: 'small',
                    //         icon: < ExportOutlined />,
                    //         onClick: () => window.open(`/external/sale/so/detail/${item.id}`, '_blank')?.focus()
                    //     },
                    //     {
                    //         type: 'link',
                    //         size: 'small',
                    //         icon: <EyeOutlined />,
                    //         onClick: async () => {
                    //             await actions.fetchSo(item.id);
                    //             modals.showModal('quickView');
                    //         }
                    //     }
                    // ],

                    rowKey: 'id',
                    columns: [
                        {
                            title: "No",
                            width: 40,

                            render: (r, s, index) => (
                                data?.page * data?.pageSize + index) + 1
                        },
                        {
                            title: 'PO #',
                            sorter: 'poNo',
                            dataIndex: 'poNo',
                            key: 'poNo',
                            width: 120,
                            // align: "center", 
                            actionProps: (item) => ({
                                type: 'view',
                                label: item.poNo || '',
                                actionButtons: [
                                    {
                                        type: 'link',
                                        size: 'small',
                                        icon: <ExportOutlined />,
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
                                    },
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
                            hideInTable: filter.criteria?.advanceSearch?.status === 'Pending',
                            width: 110,
                            dataIndex: 'soNo',
                            //render: colLink(actionHandlers?.onDetail, (d) => d.soNo || 'Not Assigned'),
                        }, {
                            title: 'Cust ID',
                            sorter: 'customerCode',
                            dataIndex: 'customerCode',
                            key: 'customerCode',
                            width: 100,
                            actionProps: item => ({ type: 'action1', label: item.customerCode, actionButtons: [{ type: 'link', size: 'small', icon: <ExportOutlined />, onClick: () => { window.open(`/external/crm/customer/detail/${item?.customerId}`, '_blank')?.focus() } }] }),

                        }, {
                            title: 'Ship to',
                            width: 200,
                            render: (_, data) => data.shippingAddress,
                        },
                        {
                            // title: 'Order Date',
                            title: 'Created Date',
                            align: 'right',
                            sorter: 'orderDate',
                            dataIndex: "orderDate",
                            width: 110,
                            render: (_, data) => moment(data.orderedDate).format('DD-MMM-YYYY'),

                        },
                        {
                            // title: "Order Time",
                            title: "Created Time",
                            width: 100,
                            render: (_, data) => moment(data.orderedDate).format('HH:mm:ss'),
                        },
                        {
                            title: 'DOP',
                            width: 100,
                            render: (_, r) => r.deliveryDate ? moment(r.deliveryDate).format('DD-MMM-YYYY') : '-',
                        },
                        {
                            title: 'Gross Qty',
                            width: 80,
                            align: 'right',
                            render: (_, r) => r.qty,
                        },
                        {
                            title: 'Amount(USD)',
                            width: 120,
                            align: 'right',
                            valueType: {
                                type: 'money',
                                locale: 'en-US',
                            },
                            dataIndex: 'amount',
                        },
                        {
                            title: 'Del.Serv',
                            width: 60,
                            render: (_, r) => r.deliveryMethod,
                        },


                        {
                            title: 'Salesperson',
                            render: (_, data) => data.salespersonName,
                            sorter: 'salespersonName',
                            dataIndex: 'salespersonName',
                            width: 120
                        },
                        {
                            title: 'PRO',
                            dataIndex: 'province',
                            width: 50
                        },
                        {
                            title: "Sub-Sec.",
                            dataIndex: "subSection",
                            width: 80,
                        },
                        {
                            title: "Sec.",
                            dataIndex: "section",
                            width: 50,
                        },
                        {
                            title: 'Status',
                            width: 80,
                            render: (_, r) => r.status && <Status text={r.status} />,
                        },
                        {
                            title: 'Source',
                            dataIndex: 'source',
                            width: 60,
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
            initData={filter.criteria?.advanceSearch}
            salespersons={state.data?.initData?.salespersons}
            lookDataList={state.data?.initData?.lookDataList}
            onSearch={(data) => {
                setFilter(v => ({
                    ...v,
                    criteria: {
                        ...v.criteria,
                        advanceSearch: {
                            ...v.criteria?.advanceSearch,
                            ...data,
                        }
                        // myTask: (data.saleArea?.length > 0) ? false : data?.myTask
                    }
                }))
                actionRef.current?.reload?.(true);
            }}
            onReset={() => {
                setFilter(v => ({
                    ...v,
                    criteria: {
                        advanceSearch: {
                            ...v.criteria?.advanceSearch,
                            status: v.criteria?.advanceSearch?.status,
                            customerType: v.criteria?.advanceSearch?.customerType,

                        }
                    }
                }))
                actionRef.current?.reload?.(true);
            }}
        />
    </Spin>
}
