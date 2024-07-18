// import { formatDate, formatDateTime } from "@/pages/utils"
// import { simpleRequestActions } from "@/services/model"
// import { ProCard, ProDescriptions } from "@ant-design/pro-components"
// import { message, Table } from "antd"
// import { useEffect, useState } from "react"
// import { ITRequestDetail, ITRequestItemDetail } from "./data.types"
// import { itRequestSessions } from "./RequestForm"
// import { createService } from "./services"

// export default ({ processInstaceId }: { processInstaceId: string }) => {
//     const requestActions = simpleRequestActions()
//     const services = createService(requestActions)
//     const [data, setData] = useState<ITRequestDetail>()
//     useEffect(() => {
//         (async () => {
//             try {
//                 const rs = await services.fetchItemByProcessInstanceId(processInstaceId)
//                 setData(rs)
//             } catch (error: any) {
//                 message.error(error.message || 'Failed to fetch data.')
//             }

//         })()
//     }, [])
//     const firstItem = data?.items.find(it => it)
//     return <ProCard size="small">
//         <ProDescriptions<ITRequestDetail>

//             columns={[
//                 { label: 'Session', dataIndex: 'session', render: (_,r ) => itRequestSessions.find(it => it.value == r.requestTypeId)?.label },
//                 { label: 'Reason', dataIndex: 'reason', valueType: 'textarea' },
//                 ...data?.requestTypeId == 2 ? [
//                     { label: 'Date', render: () => {
//                         var review = firstItem?.requestedDate?formatDateTime(firstItem.requestedDate):'';
//                         review += firstItem?.requestedDateTo? (' ~ '+formatDateTime(firstItem.requestedDateTo)):''
//                       return review
//                     }},
//                     { label: 'CCTV Location', render: () => firstItem?.itemName },
//                     { label: 'Remarks', render: () => firstItem?.remarks }
//                 ] : []
//             ]}

//             dataSource={data}
//         />

//         {data?.requestTypeId  != 2 && <Table<ITRequestItemDetail> 
//             dataSource = {data?.items}
//             rowKey = 'id'
//             size='small'
//             columns={[
//                 {title: "Category", width: 300 , dataIndex:'category'},
//                 {title: "Item Name", width: 350 , dataIndex:'itemName'},
//                 {title: "Remarks", dataIndex:'remarks'},
//             ]}
//         />}


//     </ProCard>
// }