import { ProCard } from "@ant-design/pro-components"
import { ProbationEvaluationDetailRs } from "../data.types"
import { Descriptions } from "antd"

interface Props{
  probaRequest: ProbationEvaluationDetailRs

}
export default({probaRequest}:Props)=>{
  return(<><ProCard title="RATING SCALE" 
      collapsible
      size="small"
      bordered headerBordered 
     >
       {probaRequest?.ratingScale.map(it => 
         <Descriptions column={2}>
           <Descriptions.Item style={{width:'15%'}}> <b>{it.seqNo} - {it.title}</b></Descriptions.Item>
           <Descriptions.Item> {it.description}</Descriptions.Item>
         </Descriptions>
       )}
    </ProCard>       
  </>)

}