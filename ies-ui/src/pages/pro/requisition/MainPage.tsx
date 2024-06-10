import { TableViewSearchParams } from "@/components/DataCrud/TableView"
import PageWrapper from "@/components/PageWrapper"
import Status from "@/components/Status"
import { formatDate, formatter } from "@/pages/utils"
import { RequisitionListItem } from "@/services/pro/data"
import { RequisitionAdvanceSearchParams } from "@/services/pro/req-params"
import { RequisitionServiceAPI } from "@/services/pro/services"
import { CheckOutlined, CopyFilled, EditFilled, ExportOutlined, EyeFilled, PartitionOutlined, UploadOutlined } from "@ant-design/icons"
import { useQuery } from "@umijs/max"
import { Button, Flex, Modal, Space, Spin, Tooltip, message } from "antd"
import { useState } from "react"
import Form from "@/pages/process-flow/form"

export default () => {

    const services = RequisitionServiceAPI();

    const [filter, setFilter] = useState<TableViewSearchParams<RequisitionAdvanceSearchParams>>({
        criteria: { advanceSearch: { status: 'ALL' } }
    })

    const { data, refetch } = useQuery(['fetch-customer-list'], () => services.list(filter), {
        refetchOnWindowFocus: false
    })

    return <Spin spinning={false}>
        <PageWrapper<RequisitionListItem, {}, {}>

            listView={{
                type: 'Table',
                title: "PR List",
                statuses: [
                    { option: { label: 'All', value: 'ALL' }, },
                    { option: { label: 'Draft', value: 'DRAFT' }, },
                    { option: { label: 'Pending', value: 'PENDING' }, },
                    {
                        option: { label: 'Approved', value: 'APPROVED', }, subOptions: [
                            { label: 'All', value: 'ALL' },
                            { label: 'Posted', value: 'POSTED' },
                            { label: 'Closed', value: 'CLOSED' },
                            { label: 'Canceled', value: 'CANCELED' },
                            { label: 'Failed', value: 'FAILED' },
                        ]
                    },
                    { option: { label: 'Rejected', value: 'REJECTED' }, },
                ],

                props: {
                    dataSource: data?.items,
                    pagination: { total: data?.pageSize },
                    columns: [
                        {
                            width: 10, render: (_, r) => (
                                <Space size={1}>
                                    <Tooltip title="View data in new browser tab.">
                                        <Button
                                            type="link"
                                            size="small"
                                            icon={<ExportOutlined />}
                                            onClick={async () => {
                                                window.open(`/external/data-form/requisition_request_process/${r.instanceId}`, '_blank')?.focus();
                                            }}
                                        />
                                    </Tooltip>
                                    <Tooltip title="View Data">
                                        <Button
                                            size="small"
                                            type="link"
                                            icon={<EyeFilled />}
                                        //onClick={() => onDetailhandler(r)}
                                        />
                                    </Tooltip>
                                    <Tooltip title="Copy Data">
                                        <Button
                                            size="small"
                                            type="link"
                                            icon={<CopyFilled />}
                                        //onClick={() => history.push(`/pro/requisition/create/${r.id}`)}
                                        />
                                    </Tooltip>

                                    {!r.formNo && (
                                        <Tooltip title="Edit">
                                            <Button
                                                size="small"
                                                type="link"
                                                icon={<EditFilled />}
                                            //onClick={() => history.push(`/pro/requisition/edit/${r.id}`)}
                                            />
                                        </Tooltip>
                                    )}
                                </Space>
                            )
                        },
                        {
                            title: 'Form No', sorter: 'formNo', width: 80, tabRender: item => ({
                                value: item.formNo,

                                tabLabel: item.formNo,
                                panel: <Form openInTab formKey="requisition_request_process" id={item.instanceId} />,

                            })
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
                                    width: 70,
                                    render: (_, r) => r.processStatus && <Status text={r.processStatus} />,
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
                                    width: 70,
                                    dataIndex: 'sapStatus',
                                    // hideInTable: !['APPROVED', 'ALL'].some((it) => it == advanceSearchParams.status),
                                    render: (_, r) => r.sapStatus && <Status text={r.sapStatus} />,
                                },
                            ],
                        },
                        {
                            width: 5,
                            render: (_, r) => (
                                <Flex>
                                    <Button type="link" title='View Flow' onClick={() => setOpenFlow(r)} icon={<PartitionOutlined />} />
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

    </Spin>

}