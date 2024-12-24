import { ProCard, ProForm, ProFormDatePicker, ProFormRadio, ProTable } from "@ant-design/pro-components";
import { ProbationEvaluationDetailRs } from "../data.types"
import { Col, Flex, FormInstance, Radio, RadioChangeEvent, Row, Space } from "antd";
import { formatDate, formatterQty1 } from "@/pages/utils";
import { useEffect, useState } from "react";
import { Moment } from "moment";

interface Props{
  probaRequest: ProbationEvaluationDetailRs
  totalScore?: number
  form?: FormInstance<{extendedDate?: Moment}>
  setConfirmStatus?: (v:string) => void;
  readonly?: boolean |true
  initialValue?:{status: string,extendedDate?: Moment}
}

export default({probaRequest, totalScore, form, setConfirmStatus, readonly=true,initialValue}:Props)=>{
  const [value, setValue] = useState('');

  useEffect(()=>{
    if(initialValue){
      setValue(initialValue.status);
    }
  },[!initialValue])
  const onChange = async (e: RadioChangeEvent) => {
    if(!readonly){
      const v = e.target.value
      setValue(v);
      setConfirmStatus?.(v)
    }   
  };

  return(<><ProCard title="SUMMARY" 
    collapsible  
    size="small"
    bordered headerBordered 
    defaultCollapsed ={(totalScore||0)>0?true:false}
  >
    <ProForm form={form} submitter={false} readonly={readonly}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{paddingBottom:20}}><b>FINAL SCORE </b> <span style={{paddingRight:20, borderRadius:'9px', padding:'8px', border:'solid 1.5px black'}}><b>{`${formatterQty1.format(totalScore||probaRequest?.totalScore)} / ${formatterQty1.format(probaRequest?.maxScore||0)}`}</b></span> 
        {/* <Input style={{width:150}} value={`${formatterQty1.format(probaRequest?.totalScore||0)} / ${formatterQty1.format(probaRequest?.maxScore||0)}`} /> */}
        </div>
        {/* <Row> */}
        <Flex gap={25}>
          <div >
            <div><b>OVERALL PROBATION RATING</b></div>
            {probaRequest?.overallRating&&<ProTable
              pagination={false}  
              cardProps={false}
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
          </div>
          <div style={{width:450}}>
            <div><b>DECISION BY FUNCTION MANAGER</b></div>
            <Radio.Group  name='confirmedStatus' onChange={onChange} value={value}  style={{paddingTop:5}}>
              <Space direction="vertical" style={{paddingLeft:5}}>
                <Radio value={'CONFIRMED'} >Passed Probation</Radio>      
                <Radio value={'EXTENDED'} > <Space>Extended Probation { value==='EXTENDED' && !readonly?<> Until: <ProFormDatePicker readonly={readonly} initialValue={initialValue?.extendedDate} name={'extendedDate'} rules={[{required: true}]}/></>:<>Until: {formatDate(initialValue?.extendedDate)}</>} </Space></Radio>
                <Radio value={'TERMINATED'}>Failed Probation</Radio>
              </Space>
          </Radio.Group>
          </div>
        {/* </Row>*/}
        </Flex> 
      </Space>  
    </ProForm>                  
  </ProCard>     
  </>)
}