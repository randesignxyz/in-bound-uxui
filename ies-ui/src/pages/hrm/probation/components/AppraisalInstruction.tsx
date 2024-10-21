// import { simpleRequestActions } from "@/services/model"
// import { ProCard } from "@ant-design/pro-components"
// import { createService } from "../services"
// import { AppraisalInstructionItem } from "../data.types"
// import { useEffect, useState } from "react"
// import { Button, message } from "antd"

// interface Props{ 
//     lang?:string
//     onChangeLanglauge:()=>void
//     getLableName:(key:string)=>any
//     appraisalPerformanceId: number
// }
// export default({lang,onChangeLanglauge,getLableName, appraisalPerformanceId}:Props) =>{
//     const requestActions = simpleRequestActions()
//     const services = createService({ request: requestActions })
//     const [intruction,setInstruction] = useState<AppraisalInstructionItem[]>([])
//     useEffect(()=>{      
//         (async () => {
//           try {
//             const rating = await services.fetchAppraisalIntructionList(appraisalPerformanceId)
//             setInstruction(rating)
//           } catch (error: any) {
//               message.error(error.message || 'Failed to load data.')
//           }
//         })()
//       },[])   
//     return <ProCard collapsible  size="small" bordered headerBordered 
//       extra = {<Button shape="round" onClick={onChangeLanglauge}>{lang=='KH'?'English':'ភាសាខ្មែរ'}</Button>}
//       title= {<b>{getLableName('TITLE_INSTRACTION')}</b>}
//     >
//     {intruction.map((it)=> <div >• {lang=='KH'?it.description1:it.description}</div>)}                
//  </ProCard>     
// }