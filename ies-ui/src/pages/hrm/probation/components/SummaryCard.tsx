import { ProCard, ProTable } from "@ant-design/pro-components"
import { ProbationEvaluationDetailRs } from "../data.types"
import { Descriptions, Space } from "antd"
import { formatterQty1 } from "@/pages/utils"

interface Props{
  probaRequest: ProbationEvaluationDetailRs

}
export default({probaRequest}:Props)=>{
  return(<><ProCard title="SUMMARY" 
    collapsible  
    size="small"
    bordered headerBordered 
  >
    <Space direction="vertical" style={{ width: '100%' }}>
      <div style={{paddingBottom:20}}><b>FINAL SCORE </b> <span style={{paddingRight:20, borderRadius:'9px', padding:'8px', border:'solid 1.5px black'}}><b>{`${formatterQty1.format(probaRequest?.totalScore||0)} / ${formatterQty1.format(probaRequest?.maxScore||0)}`}</b></span> 
      {/* <Input style={{width:150}} value={`${formatterQty1.format(probaRequest?.totalScore||0)} / ${formatterQty1.format(probaRequest?.maxScore||0)}`} /> */}
      </div>
      <div><b>OVERALL PROBATION RATING</b></div>
      {probaRequest?.overallRating&&<ProTable
        pagination={false}  
        search={false}
        options={{
            density:false,
            search:false,
            reload:false,
            setting:false,
            fullScreen:false
            
        }}                
        dataSource={probaRequest?.overallRating} 
        columns={[
          {title:'Rating',dataIndex:'score',
            render:(_,r)=>(<div>{formatterQty1.format(r.startedScore||0)} - { formatterQty1.format(r.endedScore||0)}</div>)
          },                     
          {title:'Description',
            children:[
              {title:'', dataIndex:'title'},
              {title:'', dataIndex:'description1'}
            ]
          }
        ]}
      />}
    </Space>                  
  </ProCard>     
  </>)

}