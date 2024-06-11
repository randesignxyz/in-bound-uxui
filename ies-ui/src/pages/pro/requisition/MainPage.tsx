import { TableViewSearchParams } from "@/components/DataCrud/TableView"
import PageWrapper from "@/components/PageWrapper"
import Status from "@/components/Status"
import { formatDate, formatter } from "@/pages/utils"
import { ProDepartment, RequisitionDetailResponse, RequisitionListItem } from "@/services/pro/data"
import { RequisitionAdvanceSearchParams } from "@/services/pro/req-params"
import { RequisitionServiceAPI } from "@/services/pro/services"
import { CheckOutlined, CopyFilled, EditFilled, ExportOutlined, EyeFilled, PartitionOutlined, UploadOutlined } from "@ant-design/icons"
import { useQuery } from "@umijs/max"
import { Button, Flex, Modal, Space, Spin, Tooltip, Typography, message } from "antd"
import { useState } from "react"
import Form from "@/pages/process-flow/form"
import DataDetailView from "./DataDetailView"
import AdvanceSearch from "./components/AdvanceSearch"
import Flow from "../flow"

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

    return <Spin spinning={false}>
        <PageWrapper<RequisitionListItem, RequisitionAdvanceSearchParams, {}>

            listView={{
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
                    bordered: true,
                    actionButtonsRender: (item) => ([
                        { tooltip: 'View data in new browser tab', type: 'link', disabled: item.processStatus == 'DRAFT', size: 'small', icon: <ExportOutlined />, onClick: () => window.open(`/external/data-form/requisition_request_process/${item.instanceId}`, '_blank')?.focus() },
                        { tooltip: 'Quick view', type: 'link', disabled: item.processStatus == 'DRAFT', size: 'small', icon: <EyeFilled />, onClick: () => onDetailhandler(item) },
                        {
                            tooltip: 'Clone', type: 'link', disabled: item.processStatus == 'DRAFT', size: 'small', icon: <CopyFilled />, tabRender: {
                                tabLabel: "Clone",
                                panel: <></>,
                                tabIcon: <CopyFilled />
                            }
                        }

                    ]),
                    columns: [
                        {
                            title: 'Form No', sorter: 'formNo', width: 100, tabRender: item => ({
                                value: item.formNo,
                                tabLabel: item.formNo,
                                panel: <Form openInTab formKey="requisition_request_process" id={item.instanceId} />,

                            })
                        },
                        {
                            title: 'Reason',
                            render: (_, r) => <Typography.Paragraph style={{ fontWeight: 350 }} ellipsis={{
                                rows: 2,
                                defaultExpanded: false,
                                expandable: true,
                                symbol: 'more'
                            }} >{r.reason}</Typography.Paragraph>,
                            dataIndex: 'reason',
                        },
                        {
                            title: 'Requisition Infomation',
                            children: [
                                {
                                    title: 'Expected Dt',
                                    align: 'right',
                                    sorter: 'acquisitionDate',
                                    width: 120,
                                    render: (_, r) => formatDate(r.acquisitionDate),
                                },
                                {
                                    title: 'Total Amt.',
                                    align: 'right',
                                    width: 120,
                                    sorter: 'totalAmount',
                                    render: (_, r) => formatter.format(r.totalAmount || 0),
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
                                    title: 'Requested Dt',
                                    align: 'right',
                                    sorter: 'createdDate',
                                    width: 130,
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
            // onVisibleChange = {v => setAdvanceSearch({visible: v})}
            initData={filter.criteria?.advanceSearch}
            onClose={() => {
                console.log('advance search in pro visible ', advanceSearch);
                setAdvanceSearch({ visible: false });
            }}
            onReset={() => {
                // setAdvanceSearchParams({ status: 'ALL' });
                // actionRef.current?.reloadAndRest?.();
            }}
            onSearch={(data) => {
                // setAdvanceSearchParams((v) => ({ ...v, ...data, status: v.status }));
                // actionRef.current?.reloadAndRest?.();
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