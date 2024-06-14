import PageWrapper from "@/components/PageWrapper"
import { QuotationListItem, QuotationSearchParams } from "./data"
import { createQuotationService } from "./services";
import { useQuery } from "@umijs/max";
import { Button, Checkbox, Flex, Modal, message } from "antd";
import { formatter } from "@/pages/utils";
import Status from "@/components/Status";
import { CheckOutlined, CopyFilled, EditOutlined, ExportOutlined, FileOutlined, PartitionOutlined, PlusCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { ProPaths } from "..";
import Flow from "../flow";
import DataDetailView from "./DataDetailView";
import DataEntryView from "./DataEntryView";
import { uniqueId } from "lodash";
import { TabRenderProps } from "@/components/PageWrapper/type";

export default () => {

    const srv = createQuotationService();
    const [openFlow, setOpenFlow] = useState<QuotationListItem>();
    const [filter, setFilter] = useState<TableViewSearchParams<QuotationSearchParams>>()
    const { data, refetch, isFetching } = useQuery(['fetch-quotation-list', filter], () => srv.fetchPaging({
        criteria: { ...filter?.criteria?.advanceSearch },
        keywords: filter?.criteria?.searchValue,
        pagination: filter?.pagination,
        sort: filter?.criteria?.sort
    },), { refetchOnWindowFocus: false })

    const onPostQP = (item: QuotationListItem) => {
        Modal.confirm({
            title: 'Post to SAP',
            content: 'Are you sure?',
            onOk: async () => {
                try {
                    await srv.postPQ(item.id)
                    message.success("Successfully posted.")
                    refetch()
                } catch (error: any) {
                    message.error(error.message || "Failed to post.")
                    refetch()
                }
            }
        })
    }

    const copyProps = (item: QuotationListItem) => ({
        tabLabel: `Copy(# ${item.code})`,
        tabKey: `Copy - ${item.id} -${uniqueId("copy")} `,
        tabIcon: <CopyFilled />,
        panel: (props) => <DataEntryView
            onCloseTab={() => {
                props?.onCloseTab?.()
                refetch()
            }}
            id={item.id}

            openInTab onBack={() => { }} type="CREATE" />,
    }) as Omit<TabRenderProps, 'value'>


    const editProps = (item: QuotationListItem) => ({
        tabLabel: item.code,
        value: item.code,
        panel: (props) => <DataEntryView
            onCloseTab={() => {
                props?.onCloseTab?.()
                refetch()
            }}
            id={item.id}

            openInTab onBack={() => { }} type="EDIT" />,
        tabIcon: <EditOutlined />
    }) as Omit<TabRenderProps, 'value'>



    return <><PageWrapper<QuotationListItem, QuotationSearchParams & {
        searchValue?: string;
        status?: string; subStatus?: string
    }, {}>
        tabRender={(item) => [
            {
                action: 'add',
                panel: ({ onCloseTab, onAddTab, onRenderTab }) => <DataEntryView
                    onCloseTab={() => {
                        onCloseTab?.()
                        refetch()
                    }}
                    openInTab onBack={() => { }} type="CREATE" />,
                tabLabel: "New",
            },
            {
                action: 'edit',
                panel: ({ onCloseTab, onAddTab, onRenderTab }) => <DataEntryView
                    onCloseTab={() => {
                        onCloseTab?.()
                        refetch()
                    }}
                    openInTab onBack={() => { }} type="CREATE" />,
                tabLabel: item?.code,
                tabIcon: <EditOutlined />
            },
            {
                action: 'view',
                panel: () => <DataDetailView openInTab id={item?.id} onBack={() => { }} />,
                tabLabel: item?.code,
            }, {
                tabLabel: `Copy(# ${item?.code})`,
                action: 'copy',
                tabKey: `Copy - ${item?.id} -${uniqueId("copy")} `,
                tabIcon: <CopyFilled />,
                panel: ({ onCloseTab, onAddTab, onRenderTab }) => <DataEntryView
                    id={item?.id}
                    onCloseTab={() => {
                        onCloseTab?.()
                        refetch()
                    }}
                    openInTab onBack={() => { }} type="CREATE" />,
            }
        ]}
        listView={{
            type: 'Table',
            title: 'Quotation List',
            actionButtons: [{
                icon: <PlusCircleOutlined />,
                type: 'link',
                actionType: 'add'
            }],
            statuses: [
                { option: { label: 'All', value: 'ALL', default: true }, },
                { option: { label: 'Pending', value: 'PENDING' }, subOptions: [] },
                { option: { label: 'In Process', value: 'IN_PROGRESS' } },
                { option: { label: 'Selected', value: 'SELECTED' } },
                { option: { label: 'Expired', value: 'EXPIRED' } },
                { option: { label: 'Void', value: 'VOID' } },
            ],
            onRefresh: refetch,
            onFilter: (params, page, sort) => {
                setFilter(v => ({
                    ...v, criteria: {
                        ...v?.criteria,
                        searchValue: params?.searchValue,
                        advanceSearch: {
                            keyword: params?.searchValue,
                            status: params?.status,
                        },
                        sort: sort
                    },
                    pagination: page

                }))
            },
            props: {
                loading: isFetching,
                dataSource: data?.items,
                pagination: {
                    total: data?.total
                },
                bordered: true,
                actionButtonsColumnRender: (item) => [
                    {
                        tooltip: 'View data in new browser tab',
                        type: 'link', size: 'small', icon: <ExportOutlined />,
                        onClick: () => window.open(`/ external${ProPaths.quotation} /detail/${item.id} `, '_blank')?.focus()
                    },
                    {
                        tooltip: 'Copy', type: 'link', size: 'small', icon: <CopyFilled />,
                        actionType: 'copy',
                        // tabRender: copyProps(item)
                    }
                ],
                columns: [{
                    title: 'Code #',
                    sorter: 'codeNo',
                    width: 110,
                    actionProps: (item) => ({
                        type: 'view',
                        label: item.code
                    }),
                    // tabRender: (item) => ({
                    //     panel: ({ onAddTab, onRenderTab }) => <DataDetailView
                    //         onAdd={(id) => {
                    //             if (id) {
                    //                 onAddTab?.(copyProps(item))

                    //             }
                    //         }}
                    //         onEdit={() => onRenderTab?.(editProps(item))}
                    //         openInTab id={item.id} onBack={() => { }} />,
                    //     tabLabel: item.code,
                    //     value: item.code,
                    // }),
                }, {
                    title: 'Vendor',
                    children: [
                        { title: 'Vendor Ref#', width: 130, render: (_, r) => r.refNo },
                        {
                            title: 'Vendor',
                            sorter: 'vendor',
                            render: (_, r) => [r.vendor.code, r.vendor.name].filter((it) => it).join(' - '),
                        },

                    ],
                }, {
                    title: 'Info',
                    children: [{
                        title: 'Srv',
                        width: 20,
                        align: 'center',
                        render: (_, r) => r.service && <CheckOutlined size={5} />,
                    }, { title: 'Issued Date', sorter: 'issuedDate', align: 'right', width: 110, dataIndex: 'issuedDate' },
                    {
                        title: 'Pay. Due Amt',
                        sorter: 'paymentDueAmount',
                        // width: 110,
                        align: 'right',
                        render: (_, r) => formatter.format(r.paymentDue),
                    },
                    { title: 'Status', render: (_, r) => <Status text={r.status} /> },]
                },
                {
                    title: 'SAP Info',
                    hideInTable: !['ALL', 'SELECTED', 'REJECTED'].some((it) => it == filter?.criteria?.advanceSearch?.status),
                    children: [
                        { title: 'Doc #', dataIndex: 'integratedDoc' },
                        { title: 'Posted Date', sorter: 'postedDate', dataIndex: 'postedDate' },
                        { title: 'Status', render: (_, r) => r.integratedStatus && <Status text={r.integratedStatus} /> }],
                },
                {
                    width: 5,
                    render: (_, r) => (
                        <Flex >
                            <Button type="link" title='View Flow' onClick={() => {
                                setOpenFlow(r)
                            }} icon={<PartitionOutlined />} />
                            {(['SELECTED', 'REJECTED'].some(it => it == r.status) && (r.integratedStatus || 'FAILED') == 'FAILED') && <Button title='Post quotation to to SAP' type="link" danger onClick={() => {
                                onPostQP(r)
                            }
                            } icon={<UploadOutlined />} />}
                        </Flex>

                    ),
                },]
            }
        }} />


        <Flow
            open={!!openFlow}
            onOpenChange={(visible) => !visible && setOpenFlow(undefined)}
            type={'PQ'}
            fromId={openFlow?.id || 0}
        />
    </>
}