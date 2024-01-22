import React, { useEffect } from "react";
import { formatDate, getColorStatus } from "@/pages/utils";
import { GratisContract, GratisInvoice, GratisInvoiceItem, VerifyGratisContact } from "../../types";
import { Button, Space, Tag, Tooltip } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { EyeOutlined } from "@ant-design/icons";


const itemCols=(): ColumnsType<GratisInvoiceItem> => [
   {
        title: 'Item No',
        dataIndex: 'invItermCode',     
        render:  (_, r) => r.invItermCode
    },{
      title: 'Item Name',
      dataIndex: 'invItermName',     
      render:  (_, r) => r.invItermName
  }/*,{
    title: 'Date',   
    render:  (_, r) => formatDate(r.invItemDate)
  }*/,{
    title: 'UOM',
    align: 'right',
    dataIndex: 'invUomCode'
  },{
    title: 'Quantity',
    align: 'right',
    dataIndex: 'qty'
  }
]

const GratisInvoiceItemList: React.FC<{item: GratisInvoice}> = ({item}) => {
    return <Table<GratisInvoiceItem>
        columns={itemCols()}
        style = {{background: '#f2c3bd'}}
        rowKey="invItermCode"
        key={`table-${item.invNum}`}
        dataSource={item.items || []}        
        pagination={false}
        size="small"
    />
}
export default GratisInvoiceItemList;