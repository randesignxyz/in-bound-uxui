import PageWrapper from "@/components/PageWrapper"
import { PriceComparisonListItem, PriceComparisonSearchParams } from "./data"
import { CheckOutlined, ExportOutlined, PartitionOutlined, PlusCircleFilled, UploadOutlined } from "@ant-design/icons"
import { PriceComparisonFormNames } from "./process-flow/data"
import { useQuery } from "@umijs/max"
import { createPriceComparisonService } from "./service"
import { useState } from "react"
import { TableViewSearchParams } from "@/components/DataCrud/TableView"
import { uniq } from "lodash"
import Status from "@/components/Status"
import { Button, Flex, Modal, Typography, message } from "antd"
import { createQuotationService } from "../quotation/services"
import Flow from "../flow"
import { formatDateTime } from "@/pages/utils"
import Form from "@/pages/process-flow/form"
import DataEntryView from "./DataEntryView"


export const openQC = (processInstId: string) => window.open(`/external/data-form/${PriceComparisonFormNames.processDefKey}/${processInstId}`)?.focus()

export default () => {

    const srv = createPriceComparisonService();
    // const [forceReload, setForceReload] = useState(0)
    const srvQuote = createQuotationService()
    const [openFlow, setOpenFlow] = useState<PriceComparisonListItem>();
    const [filter, setFilter] = useState<TableViewSearchParams<PriceComparisonSearchParams>>({ criteria: { advanceSearch: { status: 'ALL' } } })

    const { data, refetch } = useQuery([filter], () => srv.fetchPaging({
        keywords: filter.criteria?.searchValue,
        criteria: {
            ...filter.criteria?.advanceSearch,
            keyword: filter.criteria?.searchValue,

        },
        pagination: { ...filter.pagination, current: (filter.pagination?.current || 1) - 1 },
        sort: filter.criteria?.sort
    }), {
        refetchOnWindowFocus: false
    })
    data?.items
    const onPosting = (item: PriceComparisonListItem) => {
        Modal.confirm({
            title: "Posting quotations to SAP.",
            content: "Are you sure?",
            onOk: async () => {
                try {
                    await srvQuote.postPQs(item.id)
                    message.success("Successfully posted.")
                    refetch()
                } catch (error: any) {
                    message.error(error.message || "Failed to post.")
                }
            }
        })
    }

    return <> <PageWrapper<PriceComparisonListItem, PriceComparisonSearchParams, {}>

        tabRender={(item) => [
            {
                action: 'add', panel: ({ onUpdateTab, onCloseTab, key }) => <DataEntryView
                    onBack={() => { onCloseTab() }}
                    onView={(processInstId, formNo) => {
                        onUpdateTab('view', { processInstId: processInstId, formNo: formNo } as any, undefined, key)
                        refetch()
                    }}
                    type="CREATE"
                />,
                tabLabel: 'New QC',
            },
            {
                action: 'view', panel: ({ }) => <Form
                    formKey="quotations_comparison_process"
                    openInTab id={item?.processInstId} />,
                tabLabel: item?.formNo,
            }
        ]}

        listView={{
            type: 'Table',
            onRefresh: refetch,
            onFilter: (params, page, sort) => {
                console.log(params?.status);

                setFilter(v => ({
                    ...v,
                    criteria: {
                        searchValue: params?.searchValue,
                        advanceSearch: { ...v.criteria?.advanceSearch, ...params, workflowStatus: params?.status, status: undefined },
                        sort: sort,
                    },
                    pagination: page
                }))
            },
            statuses: [
                { option: { label: 'All', value: 'ALL', default: true } },
                { option: { label: 'Pending', value: 'REQUESTED' } },
                { option: { label: 'In Process', value: 'IN_PROGRESS' } },
                { option: { label: 'Approved', value: 'APPROVED' } },
                { option: { label: 'Rejected', value: 'REJECTED' } },
            ],
            actionButtons: [
                { addNewTab: true, icon: <PlusCircleFilled />, type: 'link' }
            ],

            props: {
                dataSource: data?.items,
                pagination: { total: data?.total },

                columns: [
                    {
                        title: "Form #",
                        sorter: "formNo",
                        width: 130,
                        actionProps: (item) => ({
                            type: 'view',
                            label: item.formNo,
                            actionButtons: [
                                {
                                    type: 'link',
                                    icon: <ExportOutlined />,
                                    size: 'small',
                                    onClick: () => openQC(item.processInstId)
                                }
                            ]
                        }),
                    },
                    {
                        title: "Vendor",
                        render: (_, r) => {
                            return uniq(r.quotations?.filter(it => it.selected).map((it) => it.vendorCode || 'N/A')).join(', ');
                        },
                    },
                    {
                        title: 'Srv',
                        tooltip: "Is Service",
                        width: 40,
                        align: 'center',
                        render: (_, r) => r.isService && <CheckOutlined />,
                    },
                    { title: 'Requested By', sorter: 'requestedBy', dataIndex: 'requestedBy' },
                    { title: 'Requested Date', sorter: "requestedDate", render: (_, r) => formatDateTime(r.requestedDate) },
                    {
                        title: 'Remarks', render: (_, r) => r.remarks && <Typography.Paragraph ellipsis={{
                            expandable: true,
                            defaultExpanded: false,
                            rows: 2,
                            symbol: 'more'
                        }}>
                            {r.remarks}
                        </Typography.Paragraph>
                    },
                    {
                        title: 'Comment/Justification', render: (_, r) => r.justifications && <Typography.Paragraph ellipsis={{
                            expandable: true,
                            defaultExpanded: false,
                            rows: 2,
                            symbol: 'more'
                        }}>
                            {r.justifications}
                        </Typography.Paragraph>
                    },
                    {
                        title: 'Workflow Status',
                        render: (_, r) => r.workflowStatus && <Status text={r.workflowStatus} />,
                    },
                    {
                        width: 5,
                        render: (_, r) => (
                            <Flex>
                                <Button type="link" title='View Flow' onClick={() => setOpenFlow(r)} icon={<PartitionOutlined />} />
                                {r.workflowStatus == 'APPROVED' && r.quotations?.some(it => (it.integratedStatus || 'FAILED') == 'FAILED') && <Button
                                    title='Post all quotations to to SAP' type="link"
                                    danger onClick={() => { onPosting(r) }} icon={<UploadOutlined />} />}
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
            type={'QC'}
            fromId={openFlow?.id || 0}
        />
    </>
}