import { TableViewSearchParams } from "@/components/DataCrud/TableView"
import PageWrapper from "@/components/PageWrapper"
import Status from "@/components/Status"
import { formatDate, formatter1 } from "@/pages/utils"
import { ProDepartment, RequisitionDetailResponse, RequisitionListItem } from "@/services/pro/data"
import { RequisitionAdvanceSearchParams } from "@/services/pro/req-params"
import { RequisitionServiceAPI } from "@/services/pro/services"
import {
    CheckOutlined, CopyFilled, ExportOutlined, EyeFilled,
    FileOutlined, PartitionOutlined, PlusCircleOutlined, UploadOutlined
} from "@ant-design/icons"
import { useQuery } from "@umijs/max"
import { Button, Flex, Modal, Spin, Tooltip, Typography, message } from "antd"
import { useEffect, useRef, useState } from "react"
import Form from "@/pages/process-flow/form"
import DataDetailView from "./DataDetailView"
import AdvanceSearch from "./components/AdvanceSearch"
import Flow from "../flow"
import DataEntryView from "./DataEntryView"
import { uniqueId } from "lodash"
import { ActionType } from "@ant-design/pro-components"

export const openPR = (instanceId: string) => window.open(`/external/data-form/requisition_request_process/${instanceId}`, '_blank')?.focus()

export default () => {
    const services = RequisitionServiceAPI();
    const [viewDetail, setViewDetail] = useState<{
        visible: boolean;
        data?: RequisitionDetailResponse;
    }>({ visible: false });
    const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
    const [listDepartment, setListDepartment] = useState<ProDepartment[]>([]);
    const [openFlow, setOpenFlow] = useState<RequisitionListItem>();
    const [filter, setFilter] = useState<TableViewSearchParams<RequisitionAdvanceSearchParams>>({
        criteria: { advanceSearch: { status: 'ALL' } }
    })

    const { data, isFetching, refetch } = useQuery(['fetch-customer-list', filter], () => services.list(filter), {
        refetchOnWindowFocus: false
    })

    const actionRef = useRef<ActionType>();

    const onDetailhandler = async (data: RequisitionListItem) => {
        try {
            const detail = await services.detail(data.id);
            setViewDetail({ visible: true, data: detail });
        } catch (error: any) {
            message.error(error.message || 'Faild to load data.');
        }
    };

    const listDepts = async () => {
        try {
            const depts = await services.listProDepartment();
            setListDepartment(depts);
        } catch (error: any) {
            message.error(error.message);
        }
    };

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    console.log('windowWidth', windowWidth);
    // Add useEffect to handle window resize
    useEffect(() => {
        
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    return <Spin spinning={false}>
        <PageWrapper<RequisitionListItem, RequisitionAdvanceSearchParams, {}>
            tabRender={item => [
                {
                    action: "add",
                    tabIcon: <FileOutlined />,
                    tabLabel: 'New PR',
                    panel: (props) => <DataEntryView
                        onCloseTab={() => {
                            props?.onCloseTab?.()
                            refetch()
                        }} openInTab onBack={() => { }} type="CREATE" />,
                }, {
                    action: 'copy',
                    tabLabel: item?.formNo ? `Copy (#${item.formNo})` : 'Copy',
                    tabKey: `copy-${item?.id}-${uniqueId('copy')}`,
                    panel: (props) => item?.id && <DataEntryView onCloseTab={() => {
                        props?.onCloseTab?.()
                        refetch()
                    }} id={item.id} type="CREATE" openInTab />,
                    tabIcon: <CopyFilled />
                }, {
                    action: 'view',
                    value: item?.formNo || "n/a",
                    tabLabel: item?.formNo || 'Draft',
                    panel: (props) => item?.processStatus == 'DRAFT' ? <DataEntryView onCloseTab={() => {
                        props?.onCloseTab?.()
                        refetch()
                    }} id={item.id} type="EDIT" openInTab /> : <Form openInTab formKey="requisition_request_process" id={item?.instanceId} />,
                }
            ]}
            listView={{
                actionButtons: [{
                    icon: <PlusCircleOutlined />,
                    type: 'link',
                    addNewTab: true
                }],
                type: 'Table',
                title: "PR List",

                onOpenAdvanceSearch: async () => {
                    await listDepts();
                    setAdvanceSearch({ visible: true });
                },
                statuses: [
                    { option: { label: 'All', value: 'ALL', default: true }, },
                    { option: { label: 'Draft', value: 'DRAFT' }, },
                    { option: { label: 'Pending', value: 'PENDING' }, },
                    {
                        option: { label: 'Approved', value: 'APPROVED', }, subOptions: [
                            { label: 'All', value: 'ALL', default: true },
                            { label: 'Posted', value: 'POSTED' },
                            { label: 'Closed', value: 'CLOSED' },
                            { label: 'Canceled', value: 'CANCELED' },
                            { label: 'Failed', value: 'FAILED' },
                        ]
                    },
                    { option: { label: 'Rejected', value: 'REJECTED' }, },
                ],
                onFilter: (params, page, sort) => {
                    setFilter(v => ({
                        ...v,
                        criteria: {
                            ...v.criteria,
                            searchValue: params?.searchValue,
                            advanceSearch: {
                                ...v.criteria?.advanceSearch,
                                ...params,
                                status: params?.status || 'ALL',
                                integratedStatus: params?.subStatus
                            },
                            sort: sort,
                        },
                        pagination: page,
                    }))
                },
                onRefresh: refetch,
                props: {
                    dataSource: data?.items,
                    pagination: { total: data?.total },
                    loading: isFetching,
                    scroll: { x: 'max-content' },
                    bordered: true,
                    actionRef: actionRef,
                    actionButtonsColumnRender: (item) => ([
                        {
                            tooltip: 'View data in new browser tab', type: 'link',
                            disabled: item.processStatus == 'DRAFT', size: 'small', icon: <ExportOutlined />,
                            onClick: () => item.instanceId && openPR(item.instanceId)
                        },
                        { tooltip: 'Quick view', type: 'link', size: 'small', icon: <EyeFilled />, onClick: () => onDetailhandler(item) },
                        {
                            tooltip: 'Copy', type: 'link',
                            size: 'small', icon: <CopyFilled />,
                            actionType: 'copy'
                        }
                    ]),
                    columns: [
                        {
                            title: 'Form No', sorter: 'formNo', 
                            width: 100,
                            actionProps: (item) => ({ type: 'view', label: item.formNo || "n/a" })
                        },
                        {
                            title: 'Reason',
                            // width: 200,
                            render: ( dom , r) => 
                            //     <Typography.Paragraph style={{ fontWeight: 350 }} ellipsis={{
                            //     rows: 2,
                            //     defaultExpanded: false,
                            //     expandable: true,
                            //     symbol: 'more'
                            // }} >
                            //     {r.reason}
                            // </Typography.Paragraph>,
                            {
       
                            return <Tooltip title={r.reason}>
                                    <Typography.Text style={{ 
                                        maxWidth: '250px',
                                        display: 'block',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {r.reason}
                                    </Typography.Text>
                                </Tooltip>},
                            dataIndex: 'reason',
                        },
                        {
                            title: 'Requisition Infomation',
                            children: [
                                {
                                    title: 'Expected Dt',
                                    align: 'right',
                                    sorter: 'acquisitionDate',
                                    width: 110,
                                    render: (_, r) => formatDate(r.acquisitionDate),
                                },
                                {
                                    title: 'Total Amt.',
                                    align: 'right',
                                    width: 100,
                                    sorter: 'totalAmount',
                                    render: (_, r) => formatter1.format(r.totalAmount || 0),
                                },
                                {
                                    title: 'Srv',
                                    width: '10px',
                                    align: 'center',
                                    render: (_, r) => {
                                        return r.service == 'Y' ? <CheckOutlined size={5} /> : <span />;
                                    },
                                },
                            ],
                        },
                        {
                            title: 'Requested Information',
                            children: [
                                {
                                    title: 'Requested By',
                                    width: 130,
                                    sorter: 'requestedBy',
                                    render: (_, r) => r.requestedBy,
                                },
                                {
                                    title: 'BU',
                                    width: 50,
                                    dataIndex: 'buName'
                                },
                                {
                                    title: 'Requested Dt',
                                    align: 'right',
                                    sorter: 'createdDate',
                                    width: 120,
                                    render: (_, r) => formatDate(r.createdDate),
                                },
                                {
                                    title: 'Status',
                                    dataIndex: 'processStatus',
                                    width: 100,
                                    render: (_, r) => r.processStatus && <Status size="small" text={r.processStatus} />,
                                },
                            ],
                        },

                        {
                            title: 'SAP Information',
                            hideInTable: !['APPROVED', 'ALL'].some((it) => it == filter.criteria?.advanceSearch?.status),
                            children: [
                                {
                                    title: 'DocNum',
                                    width: 100,
                                    dataIndex: 'sapDocNo',
                                    // hideInTable: !['APPROVED', 'ALL'].some((it) => it == advanceSearchParams.status),
                                },
                                {
                                    title: 'Posted Date',
                                    width: 100,
                                    // hideInTable: !['APPROVED', 'ALL'].some((it) => it == advanceSearchParams.status),
                                    render: (_, r) => formatDate(r.postedDate),
                                },
                                {
                                    title: 'Status',
                                    width: 100,

                                    dataIndex: 'sapStatus',
                                    // hideInTable: !['APPROVED', 'ALL'].some((it) => it == advanceSearchParams.status),
                                    render: (_, r) => r.sapStatus && <Status size="small" text={r.sapStatus} />,
                                },
                            ],
                        },
                        {
                            width: 5,
                            render: (_, r) => (
                                <Flex>
                                    <Button type="link" title='View Flow' onClick={() => {
                                        setOpenFlow(r)
                                    }

                                    } icon={<PartitionOutlined />} />
                                    {r.sapStatus == 'FAILED' && <Button title='Post to SAP' danger type="link" onClick={() => {
                                        Modal.confirm({
                                            title: 'Post to SAP',
                                            content: 'Are you sure?',
                                            onOk: async () => {
                                                try {
                                                    await services.post(r.id);
                                                    // actionRef.current?.reloadAndRest?.()
                                                    message.success('Posted successfully.');
                                                } catch (error: any) {
                                                    message.error(error.message || 'Failed to post.');
                                                } finally {

                                                }
                                            },
                                        });
                                    }} icon={<UploadOutlined />} />}
                                </Flex>

                            ),
                        },
                    ]
                }
            }}

        />
        <DataDetailView
            open={viewDetail.visible}
            data={viewDetail.data}
            reload={async (id) => {
                const detail = await services.detail(id);
                setViewDetail((v) => ({ ...v, data: detail }));
            }}
            onEdit={() => {
                // viewDetail.data?.id && onEdit?.(viewDetail.data?.id)
            }}
            onAdd={() => {
                // viewDetail.data?.id && onAdd?.(viewDetail.data?.id)
            }}
            onOpenChange={(v) => v == false && setViewDetail({ visible: false })}
        />
        <AdvanceSearch
            title="Advance Search"
            closable
            open={advanceSearch?.visible}
            initData={filter.criteria?.advanceSearch}
            onClose={() => {
                console.log('advance search in pro visible ', advanceSearch);
                setAdvanceSearch({ visible: false });
            }}
            onReset={() => {
                setFilter(v => ({
                    ...v,
                    pagination: undefined,
                    criteria: {
                        ...v.criteria,
                        sort: undefined,
                        advanceSearch: {
                            status: v.criteria?.advanceSearch?.status || 'ALL',
                        }

                    }
                }));
            }}
            onSearch={(data) => {
                setFilter(v => ({
                    ...v,
                    pagination: undefined,
                    criteria: {
                        ...v.criteria,
                        sort: undefined,
                        advanceSearch: {
                            status: v.criteria?.advanceSearch?.status || 'ALL',
                            deptIds: data.deptIds,
                            service: data.service,
                            requestedDate: data.requestedDate,
                            acquiredDate: data.acquiredDate
                        }

                    }
                }));

            }}
            listDepts={listDepartment}
        />

        <Flow
            open={!!openFlow}
            onOpenChange={(visible) => !visible && setOpenFlow(undefined)}
            type={'PR'}
            fromId={openFlow?.id || 0}
        />
    </Spin>

}