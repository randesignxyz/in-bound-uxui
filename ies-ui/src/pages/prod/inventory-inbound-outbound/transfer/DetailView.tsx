import { formatDate, formatDateTime } from '@/pages/utils';
import { ProCard, ProTable } from '@ant-design/pro-components';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import { Col, Descriptions, Divider, Row, Spin } from 'antd';
import { Transfer, TransferItem } from './data';
import ActivityTimeline from './ActivityTimeline';

interface Props extends DrawerFormProps {
  data?: Transfer;
  reload?: (id: number) => Promise<void>;
  onEdit?: () => void;
  onAdd?: () => void;
}

export default ({ data, ...rest }: Props) => {
  return (
    <DrawerForm title="Inventory Outbound Transfer Detail" {...rest} submitter={false}>
      <Spin spinning={false}>
        <ProCard>
          <Descriptions>
            <Descriptions.Item label="Type" style={{ fontWeight: 'bolder' }}>
              {data?.transfer_type}
            </Descriptions.Item>
            <Descriptions.Item label="From Warehouse" style={{ fontWeight: 'bolder' }}>
              {data?.from_warehouse.map((w) => w.whsCode)}
            </Descriptions.Item>
            <Descriptions.Item label="To Warehouse" style={{ fontWeight: 'bolder' }}>
              {data?.to_warehouse.map((w) => w.whsCode)}
            </Descriptions.Item>
            <Descriptions.Item label="Line">{data?.line}</Descriptions.Item>
            <Descriptions.Item label="Posting Date">
              {formatDate(data?.posting_date)}
            </Descriptions.Item>
            <Descriptions.Item label="Due Date">{formatDate(data?.due_date)}</Descriptions.Item>
            <Descriptions.Item label="Created Date">
              {data?.createdDate && formatDateTime(data?.createdDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Created By">{data?.createdBy}</Descriptions.Item>
            {data?.sapDocNo && (
              <Descriptions.Item label="Sap Doc No">{data?.sapDocNo}</Descriptions.Item>
            )}
            {data?.lastModifiedBy && (
              <Descriptions.Item label="Last Modified By">{data?.lastModifiedBy}</Descriptions.Item>
            )}
            {data?.lastModifiedDate && (
              <Descriptions.Item label="Last Modified Date">
                {formatDateTime(data?.lastModifiedDate)}
              </Descriptions.Item>
            )}
          </Descriptions>

          <Divider />
          <ProTable<TransferItem>
            size="small"
            search={false}
            rowKey="id"
            dataSource={data?.item}
            options={{
              density: false,
              fullScreen: false,
              reload: false,
              setting: false,
            }}
            pagination={false}
            columns={[
              { title: 'No', render: (_, r, index) => index + 1 },
              { title: 'Item Code', dataIndex: 'item_code' },
              { title: 'Item Name', dataIndex: 'item_name' },
              { title: 'Quantity', dataIndex: 'quantity' },
              { title: 'Receive', dataIndex: 'received' },
              { title: 'Total', dataIndex: 'total' },
              { title: 'UoM', dataIndex: 'uom' },
              { title: 'Supplier', dataIndex: 'supplier' },
              { title: 'Remark', dataIndex: 'remark' },
            ]}
          />
          <Row>
            <Col flex={'Auto'} />
            <Col flex={'300px'}></Col>
          </Row>
          <Divider />
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Activities</div>
          <ActivityTimeline activities={data?.activities} />
        </ProCard>
      </Spin>
    </DrawerForm>
  );
};
