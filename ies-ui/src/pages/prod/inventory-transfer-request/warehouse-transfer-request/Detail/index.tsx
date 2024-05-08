import { formatDate, formatDateTime } from '@/pages/utils';
import { ActionType, ProCard, ProList, ProTable } from '@ant-design/pro-components';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import { Button, Card, Col, Descriptions, Divider, Row, Spin, Tabs, message } from 'antd';
import moment from 'moment';
import { ActivitiesItem, ProvidedList, TransferRequest, TransferRequestItem } from '../../data';
import { useEffect, useRef, useState } from 'react';
import BreadCrumbCom from '@/pages/fleet/components/BreadCrumbCom';
import { ProdPaths } from '@/pages/prod';
import { simpleRequestActions } from '@/services/model';
import { TransferRequestServiceAPI } from '../../service';
import ActivitiesTab from './ActivitiesTab';
import TransferTab from './TransferTab';

interface Props extends DrawerFormProps {
  // data?: TransferRequest;
  id: string
  reload?: (id: number) => Promise<void>;
  onEdit?: () => void;
  onAdd?: () => void;
}

export default ({ id, ...rest }: Props) => {
  const actionRef = useRef<ActionType>();
  const requestActions = simpleRequestActions();
  const services = TransferRequestServiceAPI(requestActions);
  const routes = [
    {
      path: ProdPaths.prod,
      label: 'Prod',
    },
    {
      path: `${ProdPaths.transferRequest}/list`,
      label: 'Inventory Transfer Request',
    },
    {
      path: '',
      label: 'Deatil',
    },
  ];
  const [data, setData] = useState<TransferRequest>()
  const [providedList, setProvidedList] = useState<ProvidedList[]>([])

  useEffect(() => {
    const da = async () => {
      try {
        const detail = await services.detail(id);
        const rs = await services.get_provided_list(id)
        setProvidedList(rs)
        setData(detail)
      } catch (error: any) {
        message.error(error.message || 'Faild to load data.');
      }
    }
    da()
  }, [])

  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />
      <ProCard style={{ marginTop: 30 }}>
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
          <Descriptions.Item label="Posting Date">
            {formatDate(data?.posting_date)}
          </Descriptions.Item>
          <Descriptions.Item label="Due Date">{formatDate(data?.due_date)}</Descriptions.Item>
          <Descriptions.Item label="Remark">{data?.remark || '-'}</Descriptions.Item>
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
        <Card title="Items" size="small">
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
              { title: 'Remark', dataIndex: 'remark' },
            ]}
          />
        </Card>
        <Row>
          <Col flex={'Auto'} />
          <Col flex={'300px'}></Col>
        </Row>
        <Tabs
          items={[
            {
              label: 'Transfer',
              key: '1',
              children: <TransferTab providedList={providedList} data={data ?? {}}/>,
            },
            {
              label: 'Activities',
              key: '2',
              children: <ActivitiesTab data={data} />,
            },
          ]}
        />
      </ProCard>

      {/* <TransferModelForm
        open={transferOpen.visible}
        data={data ?? {}}
        onCancel={() => setTransferOpen({ visible: false, item_data: undefined })}
      // onSave={onSaveActionHandler}
      // data={stateOpen.visible?.payload?.data}
      /> */}

    </>
  );
};
