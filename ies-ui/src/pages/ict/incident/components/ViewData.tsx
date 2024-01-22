import AttachedFileList from '@/components/Attachment/AttachedFileList';
import {
  IncidentDetailResponse,

} from '@/services/ict/data';
import ProDescriptions from '@ant-design/pro-descriptions';

import { Card, Col, Row, Space } from 'antd';

interface Props {
  data?: IncidentDetailResponse;
}

export default ({ data }: Props) => {
  return (
    <>
      <Card size='small'>
        <Row gutter={20}>
          <Col flex="auto">
            <ProDescriptions title="">
              <ProDescriptions.Item style={{ fontWeight: 'bolder' }} label="Urgency">
                {data?.urgency}
              </ProDescriptions.Item>
              <ProDescriptions.Item style={{ fontWeight: 'bolder' }} label="Impact">{data?.impact} </ProDescriptions.Item>


              <ProDescriptions.Item label="Priority">{data?.priority}</ProDescriptions.Item>
            </ProDescriptions>
          </Col>
          <Col flex="auto">
            <ProDescriptions title="">
              <ProDescriptions.Item label="Classification">
                {data?.classification}
              </ProDescriptions.Item>
              <ProDescriptions.Item label="Category">{data?.category}</ProDescriptions.Item>
            </ProDescriptions>
          </Col></Row>
        <Row gutter={20}>
          <Col flex="auto">
            <ProDescriptions title="">
              <ProDescriptions.Item style={{ fontWeight: 'bolder' }} label="Workgroup">
                {data?.workgroup}
              </ProDescriptions.Item>
              <ProDescriptions.Item style={{ fontWeight: 'bolder' }} label="Assigned To">{data?.assignedTo} </ProDescriptions.Item>
            </ProDescriptions>
          </Col>
          <Col flex="auto">
            <ProDescriptions title="">
              <ProDescriptions.Item label="" style={{ paddingLeft: "10px" }}>
                <ProDescriptions title="Response SLA" size="small" bordered >
                  <ProDescriptions.Item label="Deadline: 2022-07-10 16:30:10">High</ProDescriptions.Item>
                  <ProDescriptions.Item label="Actual">30 minutes</ProDescriptions.Item>
                  <ProDescriptions.Item label="Violation"><Space style={{ color: 'red' }}>Violated</Space></ProDescriptions.Item>
                </ProDescriptions>
                <ProDescriptions title="Resolution SLA" size="small" bordered style={{ paddingLeft: "5px" }} >
                  <ProDescriptions.Item label="Deadline: 2022-07-10 16:50:10">High</ProDescriptions.Item>
                  <ProDescriptions.Item label="Actual">60 minutes</ProDescriptions.Item>
                  <ProDescriptions.Item label="Violation"><Space style={{ color: 'green' }}>Normal</Space></ProDescriptions.Item>
                </ProDescriptions>
              </ProDescriptions.Item>
            </ProDescriptions>
          </Col>
        </Row>
      </Card>
      <Card size='small' style={{ marginTop: "10px" }}>
        <Row gutter={20}>
          <Col flex="auto">
            <ProDescriptions title="">
              <ProDescriptions.Item label="Reported By">{data?.requestedBy}</ProDescriptions.Item>
              <ProDescriptions.Item label="Source">{data?.source}</ProDescriptions.Item>
            </ProDescriptions>
          </Col></Row>
        <Row gutter={20}>
          <Col flex="auto">
            <ProDescriptions title="">
              <ProDescriptions.Item label="Issued Statement">{data?.symptom}</ProDescriptions.Item>
            </ProDescriptions>
          </Col>
        </Row>
        <Row gutter={20}><Col flex="auto">
          <ProDescriptions title="">
            <ProDescriptions.Item label="Description">{data?.description}</ProDescriptions.Item>
          </ProDescriptions>
        </Col></Row>
      </Card>
      <Card style={{ marginTop: "10px" }}>
        <Row gutter={20} >
          <Col flex="auto">
            <ProDescriptions title="Attachments" layout='horizontal'>
              <AttachedFileList initFiles={data?.fileIds?.map(it =>({fileId: it, activity: "Start"}))} readonly />
            </ProDescriptions>
          </Col></Row></Card>
    </>
  );
};
