import { ModalForm, ModalFormProps, ProCard, ProFormSelect, ProTable, Statistic } from "@ant-design/pro-components"
import { simpleRequestActions } from "@/services/model"
import { RequisitionServiceAPI } from "@/services/pro/services"
import { useState } from "react"
import { Space, Table, message } from "antd"
import { RequisitionDetailWithQuotatopmResponse } from "./data"
import { RequisitionItemDetailResponse } from "@/services/pro/data"
import { formatter } from "@/pages/utils"
import { QuotationItemtDetail } from "../quotation/data"
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons"
import _ from "lodash"

export default ({ ...props }: ModalFormProps<{ requisitionId: number }>) => {

    const requestActions = simpleRequestActions()
    const srv = RequisitionServiceAPI(requestActions)
    const [detail, setDetail] = useState<RequisitionDetailWithQuotatopmResponse>()

    const onSearchPR = async ({ keywords }: { keywords?: string }) => {
        const rs = await srv.list({
            criteria: {
                searchValue: keywords,
                advanceSearch: {
                    integratedStatus: "POSTED",
                    status: "APPROVED",
                }
            },
        })
        const dataItems = rs.items.map(it => ({ label: [it.formNo, it.sapDocNo, it.requestedBy].filter(it => it).join("/ "), value: it.id }))
        return dataItems
    }

    const fetchDetail = async (id: number) => {

        try {
            const rs = await srv.detailWithQuotation(id)
            setDetail(rs)
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch data.')
        }

    }

    const linkQuote = (records: RequisitionItemDetailResponse) => {

        const quoteItems = detail?.quotationList.flatMap(it => it.items.map(i => ({ ...i, code: it.code, vendor: it.vendorName }))).filter(it => it.prLinked.some(i => i == records.id)).sort( (a, b) => a.amount- b.amount)
        const min = _.minBy<number>(quoteItems?.map(it=> it.amount)) || 0
        
        return <Table<QuotationItemtDetail & { code: string; vendor: string }>
            size="small"
            rowKey={'id'}
            pagination={false}
            dataSource={quoteItems}
            columns={detail?.service ? [
                { title: 'Vendor', dataIndex: 'vendor' },
                { title: 'Quote #', dataIndex: 'code' },
                { title: 'Price', render: (_, r) => formatter.format(r.price) },
                { title: 'Amount', render: (_, r) => formatter.format(r.amount) },
                {
                    title: '', render: (_, r) => <Statistic 
                    
                        value={ r.amount/ min - 1}
                        precision={2}
                        valueStyle={{ color: r.amount/min -1 <= 0?'#3f8600': '#cf1322' }}
                        prefix={r.amount / min -1 != 0 && (r.amount / min  -1 >0? <ArrowUpOutlined />: <ArrowDownOutlined/>)}
                        suffix="%" />
                },

            ] : [
                { title: 'Vendor', dataIndex: 'vendor' },
                { title: 'Quote', dataIndex: 'code' },
                { title: 'Qty', dataIndex: 'qty', },
                { title: 'Qty', dataIndex: 'qty', },
                { title: 'UoM', dataIndex: 'uomName' },
                { title: 'Price', render: (_, r) => formatter.format(r.price) },
                { title: 'Amount', render: (_, r) => formatter.format(r.amount) },
                {
                    title: '', render: (_, r) => <Statistic 
                    
                        value={ r.amount / min  - 1 }
                        precision={2}
                        valueStyle={{ color: r.amount / min -1 <= 0?'#3f8600': '#cf1322'  }}
                        prefix={r.amount / min -1 != 0 && (r.amount / min -1>0 ? <ArrowUpOutlined />: <ArrowDownOutlined/>)}
                        suffix="%" />
                },
            ]}
        />
    }

    return <ModalForm title="Price Comparison" width={1000} {...props} onValuesChange={(changedVaues) => {
        const { requisitionId } = changedVaues
        if ('requisitionId' in changedVaues) {
            fetchDetail(requisitionId)
        }
    }} >
        <ProCard direction="column" >
            <ProCard bordered size="small" title="Criteria">
                <ProFormSelect
                    placeholder={"PR No, Request No, Requestor"}
                    name={"requisitionId"} showSearch allowClear
                    request={onSearchPR} />
            </ProCard>

            {detail && <ProCard bordered size="small" title="Item list" style={{ marginBlockStart: 8 }}>
                <ProTable<RequisitionItemDetailResponse> search={false} pagination={false}
                    dataSource={detail?.items}
                    size="small"
                    options={false}
                    rowKey={'id'}
                    bordered
                    expandable={{
                        expandedRowRender: linkQuote,
                        rowExpandable: (record) => detail?.quotationList.flatMap(it => it.items.flatMap(it1 => it1.prLinked)).some(it => record.id) || false,
                    }}
                    columns={[
                        { title: '#', dataIndex: 'seqNo' },
                        { title: 'Item Code', dataIndex: 'itemCode' },
                        { title: 'Item Name', dataIndex: 'itemName' },
                        //{ title: 'Description', dataIndex: 'description' },
                        { title: 'Qty', align: 'right', dataIndex: 'qty' },
                        { title: 'UoM', dataIndex: 'uom' },
                        { title: 'Price', align: 'right', render: (_, r) => formatter.format(r.unitPrice) },
                        //{ title: 'Amount', align: 'right', render: (_, r) => formatter.format(r.amount) },
                        {
                            title: "First Offer Unit Price",
                            proFieldProps: {},
                            children: [
                                { title: "Vendor 1" },
                                { title: "Vendor 2" },
                                { title: "Vendor 3" }
                            ]
        
                        },
                        {
                            title: "Second Offer Unit Price",
                            children: [
                                { title: "Vendor 1" },
                                { title: "Vendor 2" },
                                { title: "Vendor 3" }
                            ]
        
                        }
                    ]}
                />
            </ProCard>}
        </ProCard>
    </ModalForm>
}