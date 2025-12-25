
import '@/pages/index.less'
import { Badge, Button, Form, Select, Space, Spin, Typography } from "antd"
import PageWrapper from "@/components/PageWrapper"
import { SoAdvanceSearchParams, SoItemLess } from "@/services/sale/data"
import { ExportOutlined, EyeOutlined, FileOutlined, FileSearchOutlined, PaperClipOutlined, PlusCircleOutlined, SyncOutlined } from "@ant-design/icons"
import { Model } from "./model"
import { useEffect, useMemo, useRef, useState } from "react"
import { FetchPagingParams } from "@/components/DataCrud/TableView"
import { ActionType, CheckCard, ProForm, ProFormSelect } from "@ant-design/pro-components"
import { useAccess, useParams, useQuery } from "@umijs/max"
import CustomerDetailView from "@/pages/crm/customer/components/Detail"
import { formatDate, formatDateTime } from "@/pages/utils"
import Status from "@/components/Status"
import StatusBar from "./components/List/StatusBar"
import ViewWrapper from './ViewWrapper'
import QuickView from './components/List/QickView'
import AdvanceSearch from './components/List/AdvanceSearch'
import { AllocateServiceAPI } from '@/pages/delivery/allocate/service'
import { simpleRequestActions } from '@/services/model'
import { CrmServiceAPI } from '@/services/crm/services'
import { CrmServices } from '@/pages/crm/services'

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
    const defaultSetRef = useRef(false)
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
                advanceSearchButton: <Space align='center'>
                    <Button style={{ marginTop: -6 }} icon={<FileSearchOutlined />}
                        onClick={() => modals.showModal('advanceSearch')}
                    />
                    {/* <div className='my-checkcard-so'>
                        <CheckCard.Group
                            defaultValue={true}
                            onChange={(e) => (
                                setFilter((o) => ({
                                    criteria: {
                                        ...o.criteria,
                                        myTask: e
                                    }
                                }))
                            )}
                        >
                            <CheckCard
                                title={"All"}
                                size='small'
                                value={false}
                            />
                            <CheckCard
                                title={"My Tasks"}
                                size='small'
                                value={true}
                            />
                        </CheckCard.Group>
                    </div> */}
                    {/* <Select
                        popupMatchSelectWidth={400}
                        style={{ width: '250px' }}
                        options={initData?.subContractTypeList?.map((it) => {
                            return { value: it.id, label: [it.budgetCode, it.name].join('-') };
                        })}
                    /> */}
                    <ProForm
                        form={form}
                        submitter={false}

                    >
                        <ProFormSelect
                            name="saleArea"
                            placeholder={"Area"}
                            mode="multiple"
                            width={250}
                            request={async () => {
                                const res = await CrmServices.listSaleAreas().query(requestActions)
                                if (!Array.isArray(res)) return [];

                                const options = res.map((a: any) => ({
                                    value: Number(a.divisionId ?? a.di),
                                    label: (a.divisionName ?? a.name)
                                        ?.replace(/^S&D\s*/i, '')
                                        .trim(),
                                    isDefault: a.defaultFlag === 1 || a.defaultFlag === 1,
                                }));
                                if (!param?.['*'] && !defaultSetRef.current) {
                                    const defaultAreaIds = options
                                        .filter(o => o.isDefault)
                                        .map(o => o.value);

                                    if (defaultAreaIds.length > 0) {
                                        defaultSetRef.current = true;

                                        form.setFieldsValue({ saleArea: defaultAreaIds });

                                        setFilter(v => ({
                                            ...v,
                                            criteria: {
                                                ...v.criteria,
                                                saleArea: defaultAreaIds,
                                            },
                                        }));
                                    }
                                }
                                return options;
                            }}
                            fieldProps={{
                                onChange: (val: number[]) => {
                                    setFilter(v => ({
                                        ...v,
                                        criteria: {
                                            ...v.criteria,
                                            saleArea: val,
                                        },
                                    }));
                                },
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