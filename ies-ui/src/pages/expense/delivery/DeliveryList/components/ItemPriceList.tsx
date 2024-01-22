import { DeliveryCost, domain } from "@/services/del-expense/data"
import { Card, Table } from "antd"
import { ColumnsType } from "antd/lib/table"
import React from "react"

const itemCols: ColumnsType<domain.delivery.DeliveryCostItem> = [
    {
        title: 'Item Code',
        dataIndex: 'itemNo',
    },
    {
        title: 'Item Name',
        dataIndex: 'itemName',
    },
    {
        title: 'Quantity',
        dataIndex: 'qty',
        align: 'right'
    },

    {
        title: 'Price',
        dataIndex: 'price',
        render: (_, record) => {
            if (!record.price) return ''
            return `${record.price}/ ${record.unit} ${record.uom}`
        }
    },
    {
        title: 'Currency',
        dataIndex: 'currency',
        width: '50px'

    },
    {
        title: 'Amount',
        dataIndex: 'baseCurrAmount',
        align: 'right',
        render: (_, record) => record.baseCurrAmount && record.baseCurrAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
    }
]


const ItemPriceList: React.FC<{ item: domain.deliveryDeliveryCost }> = ({ item }) => {
    return <Table<domain.delivery.DeliveryCostItem>
        columns={itemCols}
        style = {{background: '#f2c3bd'}}
        rowKey="itemNo"
        key={`table-${item.docEntry}`}
        dataSource={item.itemList || []}
        
        pagination={false}
        size="small"
    />

}

export default ItemPriceList

