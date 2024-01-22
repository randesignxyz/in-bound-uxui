import {
  IncidentDetailResponse,
  
} from '@/services/ict/data';
import { MailOutlined } from '@ant-design/icons';
import ProDescriptions from '@ant-design/pro-descriptions';

import { Card, Col, Row, Typography } from 'antd';
import { useEffect } from 'react';

interface Props {
  
  data?: IncidentDetailResponse;
}


export default ({ data }: Props) => {
  
  
  

  useEffect(() => {
    
    loadData();
    
  }, [data]);

  const loadData = () => {
      
  }

  

  return (
    <>
    
    <Card size='small' style={{marginTop:'10px'}}>
    <Row gutter={20}>
        <Col flex="auto">
      <ProDescriptions title="">
        <ProDescriptions.Item style={{fontWeight: 'bolder'}} label="Company">
          {data?.company}
        </ProDescriptions.Item>
        <ProDescriptions.Item style={{fontWeight: 'bolder'}} label="Location">{data?.location} </ProDescriptions.Item>
        
        
        <ProDescriptions.Item style={{fontWeight: 'bolder'}} label="Contact No">
        <a href={data?.contactNo??"#"} target="_blank" style={{color:'blue'}}> 
                      <Typography.Text copyable style={{color:'rgb(64,145,247)'}}>{data?.contactNo}</Typography.Text>
                      </a>
  
        </ProDescriptions.Item>
       </ProDescriptions>
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
        </Row>
      
        <Row gutter={20}>
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
      {(data?.status !== 'ON_HOLD' && data?.status !== 'PENDING') && (
      <div><Row gutter={20}><Col flex="auto">
      <ProDescriptions title="">
        <ProDescriptions.Item style={{fontWeight: 'bolder'}} label="Resolved Type">{data?.closureCode}</ProDescriptions.Item>
        
      </ProDescriptions>
      </Col>
    </Row><Row gutter={20}><Col flex="auto">
        <ProDescriptions title="">
        
          <ProDescriptions.Item style={{fontWeight: 'bolder'}} label="Solution">{data?.closeReason}</ProDescriptions.Item>
        </ProDescriptions>
        </Col>
      </Row></div>)}

      
      {data?.status === 'ON_HOLD' && (
        <Row gutter={20}><Col flex="auto">
        <ProDescriptions title="">
          <ProDescriptions.Item style={{fontWeight: 'bolder'}} label="On Hold Reason">{data?.onHoldReason}</ProDescriptions.Item>
        </ProDescriptions>
        </Col></Row>
      ) }
      </Card>
      
    </>
  );
};
