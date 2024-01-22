import { IncentiveSchemeInfo } from "@/services/crm/data"
import { Table } from "antd"
import React from "react"

const IncentiveSchemeView: React.FC<{
    items?: IncentiveSchemeInfo[]
}> = ({ items}) => {
    return (
        <Table<IncentiveSchemeInfo>
            size='small'
            dataSource={items || []}
            columns={[
                { title: 'Scheme', dataIndex: 'schemeNo' },
                { title: 'Sales Target (ctn/case)', dataIndex: "qty" },
                { title: 'Sale SKU', render: (_, r) => r.item.name },
                { title: 'Qty Sponsor', dataIndex: "sponsorQty" },
                { title: 'Sponsor SKU', render: (_, r) => r.sponsorItem.name },
                { title: 'Remarks', dataIndex: "remarks" },
            ]}
        />
    )
}

export default IncentiveSchemeView