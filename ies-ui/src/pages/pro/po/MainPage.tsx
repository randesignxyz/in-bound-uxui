import PageWrapper from "@/components/PageWrapper"
import { PoRequestFormNames, PoRequestListItem, PoRequestSearchParams } from "./data"
import { CheckOutlined, ExportOutlined, PartitionOutlined, PlusCircleFilled, UploadOutlined } from "@ant-design/icons"
import Status from "@/components/Status"
import { formatDate, formatDateTime, formatter } from "@/pages/utils"
import { Badge, Button, Flex, Modal, Typography, message } from "antd"
import { useState } from "react"
import Flow from "../flow"
import { createPoService } from "./services"
import { useQuery } from "@umijs/max"
import { TableViewSearchParams } from "@/components/DataCrud/TableView"
import Form from "@/pages/process-flow/form"
import DataEntryView from "./DataEntryView"

export default () => {

    const [openFlow, setOpenFlow] = useState<PoRequestListItem>();
    const srv = createPoService();
    const [filter, setFilter] = useState<TableViewSearchParams<PoRequestSearchParams>>({
        criteria: {
            advanceSearch: {
                workflowStatus: 'ALL'
            }
        }
    })

    const { data, refetch } = useQuery([filter], () => srv.fetchPaging({
        keywords: filter.criteria?.searchValue,
        criteria: {
            ...filter.criteria?.advanceSearch,
            searchValue: filter.criteria?.searchValue

        }
    }), {
        refetchOnWindowFocus: false
    })

    const onPostHandler = (item: PoRequestListItem) => {
        Modal.confirm({
            title: 'Post purchase order to SAP',
            content: "Are you sure?",
            onOk: async () => {
                try {
                    await srv.postPo(item.id)
                    message.success("Successfully posted.")
                    refetch()
                } catch (error: any) {
                    message.error(error.message || "Failed to post.")
                    // setForceReload(v => v + 1)
                }

            }
        })
    }
    return <>
        <PageWrapper<PoRequestListItem, PoRequestSearchParams, {} >

            tabRender={item => [
                { action: 'view', tabLabel: item?.formNo, panel: ({ }) => <Form formKey={PoRequestFormNames.processDefKey} id={item?.processInstId} openInTab /> },
                {
                    action: 'add', tabLabel: 'New PO', panel: ({ onCloseTab, onUpdateTab, key }) => <DataEntryView onBack={onCloseTab} onView={(processInstId, formNo) => {
                        onUpdateTab?.('view', { processInstId: processInstId, formNo: formNo }, undefined, key)
                        refetch()
                    }} type="CREATE" />
                },
            ]}
            listView={{
                onRefresh: refetch,
                onFilter: (params, page, sort) => {
                    setFilter({
                        criteria: {
                            searchValue: params?.searchValue,
                            advanceSearch: {
                                ...params,
                                keyword: params?.searchValue,
                                workflowStatus: params?.status,
                                status: params?.subStatus
                            },
                            sort: sort,
                        },
                        pagination: page
                    })
                },
                statuses: [
                    {
                        option: { label: 'All', value: 'ALL', default: true, }, subOptions: [
                            { label: 'All', value: 'ALL', default: true },
                            { label: 'Posted', value: 'POSTED' },
                            { label: 'Closed', value: 'CLOSED' },
                            { label: 'Canceled', value: 'CANCELED' },
                            { label: 'Failed', value: 'FAILED' },
                        ]
                    },
                    { option: { label: 'Pending', value: 'REQUESTED' } },
                    { option: { label: 'In Progress', value: 'IN_PROGRESS' } },
                    {
                        option: { label: 'Approved', value: 'APPROVED' }, subOptions: [
                            { label: 'All', value: 'ALL', default: true },
                            { label: 'Posted', value: 'POSTED' },
                            { label: 'Closed', value: 'CLOSED' },
                            { label: 'Canceled', value: 'CANCELED' },
                            { label: 'Failed', value: 'FAILED' },
                        ]
                    },
                    { option: { label: 'Rejected', value: 'REJECTED' } },
                ],
                title: 'PO List',
                type: "Table",
                actionButtons: [{ icon: <PlusCircleFilled />, type: 'link', addNewTab: true }],
                props: {
                    dataSource: data?.items,
                    pagination: {
                        total: data?.total
                    },

                    columns: [
                        {
                            title: 'Form #', sorter: 'formNo',
                            actionProps: (item) => ({
                                type: 'view',
                                label: item.formNo,
                                actionButtons: [{
                                    type: 'link', icon: <ExportOutlined />,
                                    size: "small", onClick: () => window
                                        .open(
                                            `/external/data-form/${PoRequestFormNames.processDefKey}/${item.processInstId}`,
                                        )
                                        ?.focus()
                                }]
                            }),
                        },
                        {
                            title: 'Purchase order infomation',
                            children: [
                                {
                                    title: 'Vendor',
                                    sorter: 'vendor',
                                    render: (_, r) => [r.vendorCode, r.vendorName].join('-')
                                },
                                {
                                    title: 'Service',
                                    width: 40,
                                    align: 'center',
                                    render: (_, r) => r.isService && <CheckOutlined />,
                                },
                                { title: 'Payment Term', sorter: 'paymentTerm', dataIndex: 'paymentTerm' },
                                { title: 'Payment Due', align: 'right', sorter: 'paymentDue', render: (_, r) => formatter.format(r.paymentDue) },
                            ]

                        },
                        {
                            title: 'Request infomation',
                            children: [
                                { title: 'Requestor', sorter: 'requestedBy', dataIndex: 'requestedBy' },
                                { title: 'Requested Date', align: 'right', sorter: 'requestedDate', render: (_, r) => formatDateTime(r.createdDate) },
                                { title: 'Status', render: (_, r) => <Status text={r.workflowStatus} /> },
                            ]
                        },

                        {
                            title: 'SAP Information',
                            hideInTable: !['ALL', 'APPROVED'].some((it) => it == filter.criteria?.advanceSearch?.workflowStatus),
                            children: [
                                { title: 'Posted Date', sorter: "postedDate", align: 'right', render: (_, r) => r.postedDate && formatDate(r.postedDate) },
                                { title: 'Doc Num', render: (_, r) => r.sapDocNo },
                                { title: 'Status', render: (_, r) => r.integratedStatus && <Status text={r.integratedStatus} /> },
                            ],
                        },
                        {
                            width: 5,
                            render: (_, r) => (
                                <Flex>
                                    <Button type="link" onClick={() => setOpenFlow(r)} icon={<PartitionOutlined />} />
                                    {(['APPROVED'].some(it => it == r.workflowStatus) && (r.integratedStatus || 'FAILED') == 'FAILED') && <Button title='Post purchase order to to SAP' type="link" danger onClick={() => onPostHandler(r)} icon={<UploadOutlined />} />}
                                </Flex>

                            ),
                        },
                    ]
                }
            }}

        />

        <Flow
            open={!!openFlow}
            onOpenChange={(visible) => !visible && setOpenFlow(undefined)}
            type={'PO'}
            fromId={openFlow?.id || 0}
        />
    </>
}