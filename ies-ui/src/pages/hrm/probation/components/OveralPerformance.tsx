// import { useEffect, useState } from "react"
// import { AppraisalOverallPerformanceRating } from "../data.types"
// import { simpleRequestActions } from "@/services/model"
// import { createService } from "../services"
// import { message } from "antd"
// import { ProCard, ProTable } from "@ant-design/pro-components"

// interface Props{
//     lang?: string
//     getLableName:(key:string)=>any
//     appraisalPerformanceId: number
// export default({lang,getLableName,appraisalPerformanceId}:Props)=>{}
// 
//     const requestActions = simpleRequestActions()
//     const services = createService({ request: requestActions })
//     const [overallRating,setOverallRating] = useState<AppraisalOverallPerformanceRating[]>([])
//     useEffect(()=>{      
//         (async () => {
//           try {
//             const rating = await services.fetchAppraisalOveralRating(appraisalPerformanceId)
//             setOverallRating(rating)
//           } catch (error: any) {
//               message.error(error.message || 'Failed to load data.')
//           }
//         })()
//       },[])
    
//     /*OVERALL PERFORMANCE RATING------------------------------------*/
//     const overallRatingCols = [
//         {title:'',
//             width:'20px',
//             render:(r:any) => {
//             return `${r.rating}`
//             }
//         },
//         {title:'',
//             render:(r:any) => {
//             return `${lang=='KH'? r.description1: r.description}`
//             }
//         },
//     ]
    
//     return <ProCard size="small" bordered headerBordered title= {<b>{getLableName('TITLE_OVERALL_RATING')}</b>}>
//     {overallRating&&<ProTable size="small"
//         loading={requestActions.request?.loading}
//       pagination={false}  
//       search={false}
//       options={{
//           density:false,
//           search:false,
//           reload:false,
//           setting:false,
//           fullScreen:false
          
//       }}                
//       dataSource={overallRating} 
//       columns={overallRatingCols}
//     />}
//   </ProCard> 
// }