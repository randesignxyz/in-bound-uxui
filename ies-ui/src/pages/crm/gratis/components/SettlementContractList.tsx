// import { DeliveryCost, domain } from "@/services/del-expense/data"
// import { Button, Card, Space, Table, Tag, Tooltip } from "antd"
// import { ColumnsType } from "antd/lib/table"
// import React from "react"
// import { GratisContract, IncentiveSettlement } from "../types"
// import { formatDate, getColorStatus, toReadable } from "@/pages/utils"
// import { EyeOutlined } from "@ant-design/icons"

// const itemCols: ColumnsType<GratisContract> = [
   
//     {
//         title: 'Agreement No',
//         dataIndex: 'contractNo',
//     },
//     {
//         title: 'Customer No',
//         dataIndex: 'customerCode',
//     },
//     {
//         title: 'Business Name',
//         dataIndex: 'customerName',
//     },
//     {
//         title: 'Brand',
//         dataIndex: 'brand',
//         align: 'right'
//     },
//     {
//         title: 'Budget Code',
//         dataIndex: 'budgetCode',
//         align: 'right'
//     },
//     {
//         align: 'right',      
//         title: 'Start Date',
//         render: (_, item) => formatDate(item.effectiveDate)
//     },
//     {
//         align: 'right',      
//         title: 'End Date',
//         render: (_, item) => formatDate(item.expiryDate)
//     },
//     {
//         title: 'Status',
//         render: (_, item) => <><Tag color={item.achieved==0?'red':'green'}>{item.achieved}/{item.months} | ACHIEVED{((item?.achieved||0)>0 && (item?.achieved||0)!= (item.months||0)) && <span style={{color:'red'}}>*</span>}</Tag></>
//     }
// ]


// const SettlementContractList: React.FC<{ item: IncentiveSettlement }> = ({ item }) => {
//     return <Table<GratisContract>
//         columns={itemCols}
//         style = {{background: '#f2c3bd'}}
//         rowKey="id"
//         key={`table-${item.id}`}
//         dataSource={item.contracts || []}
        
//         pagination={false}
//         size="small"
//     />

// }

// export default SettlementContractList

