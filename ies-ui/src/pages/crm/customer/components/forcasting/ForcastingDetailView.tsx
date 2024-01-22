import { PurchaseEstData } from "@/services/crm/data"
import { LookupDataItem } from "@/services/data"
import ProForm from "@ant-design/pro-form"
import { Table } from "antd"
import React from "react"

export const ForcastingDetailView: React.FC<{
    data?: PurchaseEstData[];
    itemList?: LookupDataItem[];
}> = ({ data, itemList }) => {
    return <ProForm submitter={false}>
        <Table<PurchaseEstData>
            columns={[
                {title: 'Item (SKU)', render: (_, r) => itemList?.find(it => it.id == r.itemId )?.name },
                {title: 'Quantity', dataIndex: 'quantity'}
            ]}
            rowKey = 'itemId'
            pagination = {false}
            size = 'small'
            dataSource = {data}
        />
    </ProForm>
}

