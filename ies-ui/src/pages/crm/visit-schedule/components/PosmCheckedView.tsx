import { PosmCheckedDataView } from "@/services/crm/data"
import { ProCard } from "@ant-design/pro-components"
import { Table } from "antd"

export default ({ items }: { items: PosmCheckedDataView[] }) => {
    return <ProCard size="small">
        <Table<PosmCheckedDataView> columns={[
            {
                title: "POSM", children: [
                    { title: 'Category', dataIndex: 'category' },
                    { title: 'Name', render: (_, r) => r.item.name },
                ]
            },
            {
                title: "Qty", children: [
                    { title: "Current", align: 'right', dataIndex: 'qty' },
                    { title: "Actual", align: 'right', dataIndex: 'actualQty' },
                ]
            },
            {
                title: 'Status', children: [
                    {title: "Item & Qty", render: (_,r ) => r.itemCheckedStatus.name},
                    {title: "Verification", render: (_,r ) => r. checkedStatus.name},
                ],
            },
            {
                title: 'Remarks (SA)', dataIndex: 'remarks'
            }

        ]} bordered size = 'small' dataSource = {items} />
    </ProCard>
}