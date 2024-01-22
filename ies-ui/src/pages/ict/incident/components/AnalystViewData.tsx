import { currentDate, customDurationFormat, durationEx, formatDateTime, formatDuration, formatDurationEx, getWeekendDay, getWeekendDays, wrapLocalDate } from '@/pages/utils';
import { UserResult } from '@/services/process-workflow/data';
import {
  IncidentDetailResponse,
  
} from '@/services/ict/data';
import { ClockCircleTwoTone, ExclamationCircleTwoTone } from '@ant-design/icons';
import ProDescriptions from '@ant-design/pro-descriptions';

import { Card, Col, Descriptions, Row, Space, Typography } from 'antd';
import { IProcessWorkflowModel } from '@/models/process-flow/data';
import moment, {  } from 'moment';
import { useEffect, useState } from 'react';

interface Props {
  workflowModel: IProcessWorkflowModel;
  data?: IncidentDetailResponse;
  requestor?: UserResult;
}


export default ({ workflowModel: { state, actions }, data, requestor }: Props) => {
  
  const [responseSla, setResponseSla] = useState<{violated: boolean | undefined, color: string, defaultTime: string | undefined, actualTime: string | undefined}>({violated: undefined, color: 'grey', defaultTime: undefined, actualTime: undefined});
  const [resolutionSla, setResolutionSla] = useState<{violated: boolean | undefined, color: string, defaultTime: string | undefined, actualTime: string | undefined}>({violated: undefined, color: 'grey', defaultTime: undefined, actualTime: undefined});
  
  
  

  useEffect(() => {
    
    loadData();
    
  }, [state, actions, data, requestor]);

  const loadData = () => {
      calculateResponseSla();
      calculateResolutionSla();
  }

  const calculateResponseSla = () => {
    const defaultTime = data?.firstResponseTime ?? 0;
    const defaultTimeStr = formatDurationEx(defaultTime);
    
    const startTime = data?.requestedDate??currentDate()
    const activities = state?.instanceData?.activities?.length??0
    //what about case admin create and assigned already for first start?
    const firstPickTime =  activities < 1 ? currentDate() : activities === 1 && defaultTime > 0 ? state?.instanceData?.activities?.[0]?.actionDate??currentDate() : state?.instanceData?.activities?.[1]?.actionDate??currentDate()
    
    //before find duration make sure startTime is not greater than firstPickTime
    //not sure why in QA server startTime is bigger than firstpicktime????
    const actualTime = defaultTime === 0 ? 0 : moment(startTime).isBefore(moment(firstPickTime)) ? durationEx(wrapLocalDate(moment(startTime)), wrapLocalDate(moment(firstPickTime))) : durationEx(wrapLocalDate(moment(firstPickTime)), wrapLocalDate(moment(startTime)));

    //exclude weekend days (Saturday, Sunday), Public Holiday
    const weekDayTime = actualTime === 0 ? 0 : actualTime - getWeekendDay(moment(startTime));

    const weekDayTimeStr = formatDurationEx(weekDayTime);

    // in case end user has no chooose priority => no first response or resolution time
    const violated = defaultTime === 0 ? undefined : defaultTime < weekDayTime;
    const color = defaultTime === 0 ? 'grey' : weekDayTime <= 0 ? 'rgb(244,244,244)' : violated ? 'rgb(235,51,67)' : 'rgb(97,208,62)';

    setResponseSla({violated:violated, color:color, defaultTime:defaultTimeStr, actualTime:weekDayTimeStr});
  
  }

  const calculateResolutionSla = () => {
    const defaultTime = data?.resolutionTime ?? 0;
    const defaultTimeStr = formatDurationEx(defaultTime);
    
    const startTime = data?.requestedDate??currentDate();

    const firstPickTimeFiltered = state?.instanceData?.activities?.filter(f => f.action === 'Resolved'); //?.actionDate??currentDate();
    const firstPickTime = firstPickTimeFiltered?.[firstPickTimeFiltered.length - 1]?.actionDate??0; //currentDate();
    const actualTime = defaultTime === 0 || firstPickTime === 0 ? 0 :durationEx(wrapLocalDate(moment(startTime)), wrapLocalDate(moment(firstPickTime)));
    
    //exclude weekend days (Saturday, Sunday), Public Holiday
    const weekDayTime = firstPickTimeFiltered === undefined ? 0 : actualTime - getWeekendDays(firstPickTimeFiltered?.map(m => moment(m.actionDate)))

    const weekDayTimeStr = formatDurationEx(weekDayTime);

    const violated = defaultTime === 0 || firstPickTime === 0 ? undefined : defaultTime < weekDayTime;
    const color = defaultTime === 0 || firstPickTime === 0 ? 'grey' : weekDayTime <= 0 ? 'rgb(244,244,244)' : violated ? 'rgb(235,51,67)' : 'rgb(97,208,62)';


    // console.log('resolutionTime,customDurationFormat(defaultTime)',defaultTime,customDurationFormat(defaultTime));

    setResolutionSla({violated:violated, color:color, defaultTime:defaultTimeStr, actualTime:weekDayTimeStr});
  
  }

  return (
    <>
    <Card bodyStyle={{ backgroundColor: '#fffbe6'}}
                  size="small">
                    <Row gutter={20}>
        <Col flex="auto">
                <Descriptions title="" layout='horizontal'>
                  <Descriptions.Item label="Reported By">
                      
                          {requestor?.name || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Emp No">
                  <b> {requestor?.employee?.empNo} </b>
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                      <b> {requestor?.email} </b>
                  </Descriptions.Item>

                  <Descriptions.Item label="Deptartment">
                      <b> {requestor?.employee?.department} </b>
                  </Descriptions.Item>
                  <Descriptions.Item label="Job Title">
                      <b> {requestor?.employee?.jobTitle} </b>
                  </Descriptions.Item>
                  
              </Descriptions>
            </Col>
        </Row>
        <Row gutter={20}>
        <Col flex="auto">
                <Descriptions title="" layout='horizontal'>
                  <Descriptions.Item label="Company">
                    {data?.company}
                  </Descriptions.Item>
                  <Descriptions.Item label="Location">
                    {data?.location}
                  </Descriptions.Item>
                  <Descriptions.Item label="Contact No">
                  <a href={data?.contactNo??"#"} target="_blank" style={{color:'blue'}}> 
                      <Typography.Text copyable style={{color:'rgb(64,145,247)'}}>{data?.contactNo}</Typography.Text>
                      </a>
                  </Descriptions.Item>
                  
              </Descriptions>
            </Col>
        </Row>
    </Card>
    <Card size='small' style={{marginTop:'10px'}}>
      <Row gutter={20}>
        <Col flex="auto">
      <ProDescriptions title="">
        <ProDescriptions.Item style={{fontWeight: 'bolder'}} label="Urgency">
          {data?.urgency}
        </ProDescriptions.Item>
        <ProDescriptions.Item style={{fontWeight: 'bolder'}} label="Impact">{data?.impact} </ProDescriptions.Item>
        
        
        <ProDescriptions.Item style={{fontWeight: 'bolder'}} label="Priority">{data?.priority}</ProDescriptions.Item>
       </ProDescriptions>
        </Col>
        <Col flex="auto">
        <ProDescriptions title="">
        <ProDescriptions.Item label="Sub Function">
          {data?.workgroup}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="Classification">
          {data?.classification}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="Category">{data?.category}</ProDescriptions.Item>
        </ProDescriptions>
        </Col></Row>
        <Row gutter={20}>
          <Col flex="auto">
      <ProDescriptions title="">
        
          <ProDescriptions.Item label="Source">{data?.source}</ProDescriptions.Item>
          <ProDescriptions.Item label="Reported Date">{formatDateTime(data?.requestedDate, 'YYYY-MM-DD h:mm:ss a')}</ProDescriptions.Item>
          
        </ProDescriptions>
        </Col>
        <Col flex="500">
          <ProDescriptions style={{paddingLeft:"10px"}} title="" size="small" bordered layout='vertical'>
            
            <ProDescriptions.Item label="Response SLA">
              <Space style={{color:`${responseSla.color}`, fontWeight: 'bolder', marginRight:'5px', fontSize:'24px'}}>{responseSla.actualTime ?? "00:00:00"}</Space> 
                <ClockCircleTwoTone twoToneColor={`${responseSla.color}`} /> Time to Response within <Space style={{fontWeight: 'bolder'}}>{responseSla.defaultTime}</Space>
            </ProDescriptions.Item>
            
            <ProDescriptions.Item label="Resolution SLA" style={{marginLeft:'10px',paddingLeft:'10px',}}>
              <Space style={{color:`${resolutionSla.color}`, fontWeight: 'bolder', marginRight:'5px', fontSize:'24px'}}>{resolutionSla.actualTime ?? "00:00:00" }</Space>
                <ExclamationCircleTwoTone twoToneColor={`${resolutionSla.color}`} /> Time to Resolution within <Space style={{fontWeight: 'bolder'}}>{resolutionSla.defaultTime}</Space>
            </ProDescriptions.Item>
                    
        </ProDescriptions>
       
      </Col>
      </Row>
    </Card>
    <Card size='small' style={{marginTop:"10px"}}>
        
      <Row gutter={20}>
        <Col flex="auto">
      <ProDescriptions title="">
        <ProDescriptions.Item style={{fontWeight: 'bolder'}} label="Issued Statement">{data?.symptom}</ProDescriptions.Item>
      </ProDescriptions>
        </Col>
      </Row>
      <Row gutter={20}><Col flex="auto">
      <ProDescriptions title="">
        <ProDescriptions.Item style={{fontWeight: 'bolder'}} label="Description">{data?.description}</ProDescriptions.Item>
      </ProDescriptions>
      </Col>
      </Row>
      {(data?.status !== 'ON_HOLD' && data?.status !== 'PENDING') &&  (
      <div><Row gutter={20}>
      <Col flex="auto">
      <ProDescriptions title="">
      <ProDescriptions.Item style={{fontWeight: 'bolder'}} label="Resolved Type">{data?.closureCode}</ProDescriptions.Item>
        
      </ProDescriptions>
      </Col>
    </Row>
      <Row gutter={20}>
        <Col flex="auto">
        <ProDescriptions title="">
        
          <ProDescriptions.Item style={{fontWeight: 'bolder'}} label="Solution">{data?.closeReason}</ProDescriptions.Item>
        </ProDescriptions>
        </Col>
      </Row></div>)}

      
      {data?.status === 'ON_HOLD' && (
        <Row gutter={20}>
          
          <Col flex="auto">
        <ProDescriptions title="">
          <ProDescriptions.Item style={{fontWeight: 'bolder'}} label="On Hold Reason">{data?.onHoldReason}</ProDescriptions.Item>
        </ProDescriptions>
        </Col></Row>
      ) }
      </Card>
      
    </>
  );
};
