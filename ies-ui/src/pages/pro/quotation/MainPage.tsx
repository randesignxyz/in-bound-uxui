import PageWrapper from "@/components/PageWrapper"
import { QuotationListItem, QuotationSearchParams } from "./data"
import { createQuotationService } from "./services";
import { useQuery } from "@umijs/max";
import { Button, Checkbox, Flex } from "antd";
import { formatter } from "@/pages/utils";
import Status from "@/components/Status";
import { PartitionOutlined, UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { ProPaths } from "..";

export default () => {

    const srv = createQuotationService();

    const { data, refetch, isFetching } = useQuery(['fetch-quotation-list'], () => srv.fetchPaging({
        criteria: {}
    }))

    const [filter, setFilter] = useState<TableViewSearchParams<QuotationSearchParams>>()

    return <PageWrapper<QuotationListItem, QuotationSearchParams & {
        searchValue?: string;
        status?: string; subStatus?: string
    }, {}>
        listView={{
            type: 'Table',
            title: 'Quotation List',
            statuses: [
                { option: { label: 'All', value: 'ALL', default: true }, },
                { option: { label: 'Pending', value: 'PENDING' }, subOptions: [] },
                { option: { label: 'In Process', value: 'IN_PROGRESS' } },
                { option: { label: 'Selected', value: 'SELECTED' } },
                { option: { label: 'Expired', value: 'EXPIRED' } },
                { option: { label: 'Void', value: 'VOID' } },
            ],
            props: {
                loading: isFetching,
                dataSource: data?.items,
                pagination: {
                    total: data?.total
                },
                bordered: true,

                columns: [{
                    title: 'Code #',
                    sorter: 'codeNo',
                    width: 140,
                    tabRender: (item) => ({
                        onOpenIconClick: () => window.open(`/external/${ProPaths.quotation}/detail/${item.id}`, '_blank')?.focus(),
                        panel: () => <></>,
                        tabLabel: item.code,
                        value: item.code,

                    }),
                }, {
                    title: 'Info',
                    children: [
                        { title: 'Vendor Ref#', width: 130, render: (_, r) => r.refNo },
                        {
                            title: 'Srv',
                            width: 20,
                            align: 'center',
                            render: (_, r) => <Checkbox checked={!!r.service} />,
                        },
                        {
                            title: 'Vendor',
                            sorter: 'vendor',
                            render: (_, r) => [r.vendor.code, r.vendor.name].filter((it) => it).join(' - '),
                        },
                        { title: 'Issued Date', sorter: 'issuedDate', align: 'right', width: 110, dataIndex: 'issuedDate' },
                        {
                            title: 'Pay. Due Amt',
                            sorter: 'paymentDueAmount',
                            width: 110,
                            align: 'right',
                            render: (_, r) => formatter.format(r.paymentDue),
                        },
                        { title: 'Status', render: (_, r) => <Status text={r.status} /> },
                    ],
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
                                //  setOpenFlow(r)
                            }} icon={<PartitionOutlined />} />
                            {(['SELECTED', 'REJECTED'].some(it => it == r.status) && (r.integratedStatus || 'FAILED') == 'FAILED') && <Button title='Post quotation to to SAP' type="link" danger onClick={() => {
                                //onPostQP(r)
                            }
                            } icon={<UploadOutlined />} />}
                        </Flex>

                    ),
                },]
            }
        }}>

    </PageWrapper>
}