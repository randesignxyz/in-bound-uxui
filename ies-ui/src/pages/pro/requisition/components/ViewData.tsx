import { formatDate, formatDateTime, formatter1 } from '@/pages/utils';
import {
  RequisitionDetailResponse,
  RequisitionItemDetailResponse,
  RequisitionServiceItemDetailResponse,
} from '@/services/pro/data';
import { ProCard } from '@ant-design/pro-components';
import ProDescriptions from '@ant-design/pro-descriptions';
import ProTable from '@ant-design/pro-table';
import { Checkbox, Col, Descriptions, Divider, Row, } from 'antd';

interface Props {
  data?: RequisitionDetailResponse;
}

export default ({ data }: Props) => {
  return (
    <ProCard>
      <Descriptions>
        <Descriptions.Item label="From No" style={{ fontWeight: 'bolder' }}>
          {data?.formNo}
        </Descriptions.Item>
        <Descriptions.Item style={{ fontWeight: 'bolder' }} label="Expected date">
          {formatDate(data?.acquisitionDate)}{' '}
        </Descriptions.Item>
        <Descriptions.Item label="Service">
          <Checkbox checked={data?.service} />{' '}
        </Descriptions.Item>
        <Descriptions.Item style={{ fontWeight: 'bolder' }} label="Reason">{data?.reason} </Descriptions.Item>
        <Descriptions.Item label="Budget Code Required">
          <Checkbox checked={data?.budgetCodeRequired} />
        </Descriptions.Item>

        <Descriptions.Item label="Created Date">
          {data?.createdDate && formatDateTime(data?.createdDate)}
        </Descriptions.Item>
        <Descriptions.Item label="BU">{data?.buName}</Descriptions.Item>
        <Descriptions.Item label="Created By">{data?.createdBy}</Descriptions.Item>
        {data?.lastModifiedDate && (
          <Descriptions.Item label="Last Modified Date">
            {formatDateTime(data?.lastModifiedDate)}
          </Descriptions.Item>
        )}
        {data?.lastModifiedBy && (
          <Descriptions.Item label="Last Modified By">
            {data?.lastModifiedBy}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Remark">{data?.remarks}</Descriptions.Item>
      </Descriptions>
      <Divider />
      {!data?.service && (
        <ProTable<RequisitionItemDetailResponse>
          size="small"
          search={false}
          rowKey="id"
          dataSource={data?.items}
          options={{
            density: false,
            fullScreen: false,
            reload: false,
            setting: false,
          }}
          pagination={false}
          columns={[
            { title: 'No', dataIndex: 'seqNo' }, // render: (_, r, index) => ++index},
            { title: 'Item Code', dataIndex: 'itemCode' },
            { title: 'Item Name', dataIndex: 'itemName' },
            { title: 'Description', dataIndex: 'description' },
            { title: 'Quantity', dataIndex: 'qty' },
            { title: 'UoM', dataIndex: 'uom' },
            { title: 'Unit Price', align: 'right', render: (_, r) => formatter1.format(r.unitPrice) },
            { title: 'Amount', align: 'right', render: (_, r) => formatter1.format(r.amount) },
            { title: 'Budget Code', dataIndex: 'budgetCode' },
            { title: 'Remarks', dataIndex: 'remarks' },
          ]}
        />
      )}
      {data?.service && (
        <ProTable<RequisitionServiceItemDetailResponse>
          size="small"
          search={false}
          rowKey="id"
          dataSource={data?.services}
          options={{
            density: false,
            fullScreen: false,
            reload: false,
            setting: false,
          }}
          pagination={false}
          columns={[
            { title: 'No', dataIndex: 'seqNo' }, //render: (_, r, index) => ++index},
            { title: 'Service Name', dataIndex: 'serviceName' },
            { title: 'Description', dataIndex: 'description' },
            { title: 'Amount', align: 'right', render: (_, r) => formatter1.format(r.amount) },
            { title: 'Budget Code', dataIndex: 'budgetCode' },
            { title: 'Remarks', dataIndex: 'remarks' },
          ]}
        />
      )}
      <Row>
        <Col flex={'Auto'} />
        <Col flex={'300px'}>
          <ProDescriptions formProps={{
            style: {
              fontWeight: 'bold'
            }
          }}>
            <ProDescriptions.Item label="Total Amount" style={{ fontWeight: 'bolder' }}>
              {formatter1.format(data?.totalAmount || 0)}
            </ProDescriptions.Item>
          </ProDescriptions>
        </Col>
      </Row>
    </ProCard>
  );
};
