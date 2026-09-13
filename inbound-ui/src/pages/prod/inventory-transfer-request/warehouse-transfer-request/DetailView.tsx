import { formatDate, formatDateTime } from '@/pages/utils';
import { ProCard, ProList, ProTable } from '@ant-design/pro-components';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import { Button, Col, Descriptions, Divider, Row, Spin } from 'antd';
import moment from 'moment';
import { ActivitiesItem, TransferRequest, TransferRequestItem } from '../data';
import { useState } from 'react';
import TransferModelForm from './TransferModelForm';

interface Props extends DrawerFormProps {
  data?: TransferRequest;
  reload?: (id: number) => Promise<void>;
  onEdit?: () => void;
  onAdd?: () => void;
}

export default ({ data, ...rest }: Props) => {
  // const [loading, setLoading] = useState(false);
  const [transferOpen, setTransferOpen] = useState<{
    visible: boolean;
    item_data?: any;
  }>({ visible: false });
  const formatDatewithNumber = (value: moment.Moment) => {
    if (moment(value).fromNow().search('ago') > 0) {
      return moment(value).fromNow().replace('in', '');
    } else {
      return moment(value).fromNow().replace('in', '') + ' from now';
    }


    // return date
  };
  const [visible, setVisible] = useState(false);

  return (
    <DrawerForm submitter={false} title={
      <div>
        Inventory Transfer Request Detail
      </div>} {...rest}>
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
          <ProTable<TransferRequestItem>
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
              { title: 'UoM', dataIndex: 'uom' },
              { title: 'Vendor', dataIndex: 'supplier' },
              { title: 'Remark', dataIndex: 'remark' },
            ]}
          />
          <Row>
            <Col flex={'Auto'} />
            <Col flex={'300px'}></Col>
          </Row>
        </ProCard>
      </Spin>
      <TransferModelForm
        open={transferOpen.visible}
        data={data?? {}}
        onCancel={() => setTransferOpen({ visible: false, item_data: undefined })}
      // onSave={onSaveActionHandler}
      // data={stateOpen.visible?.payload?.data}
      />
    </DrawerForm>

  );
};
