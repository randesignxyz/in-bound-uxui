import { formatDate, formatDateTime } from '@/pages/utils';
import { ActionType, ProCard, ProList, ProTable } from '@ant-design/pro-components';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import { Badge, Button, Card, Col, Descriptions, Divider, Row, Space, Spin, Tabs, Tag, message } from 'antd';
import moment from 'moment';

import { useEffect, useRef, useState } from 'react';
import BreadCrumbCom from '@/pages/prod/shared/BreadCrumbCom';
import { ProdPaths } from '@/pages/prod';
import { simpleRequestActions } from '@/services/model';

import ActivitiesTab from './ActivitiesTab';
import TransferTab from './TransferTab';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import ApproveRemarkFormModal from '@/pages/prod/ApproveRemarkFormModal';
import RemarkFormModal from '@/pages/prod/RemarkFormModal';
import { TransferServiceAPI } from '@/pages/prod/inventory-transfer/service';

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
  const [loading, setLoading] = useState(false)
  const [rejectLoading, setRejectLoading] = useState(false)
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
  const [onRefresh, setOnRefresh] = useState(false)
  const [providedList, setProvidedList] = useState<ProvidedList[]>([])
  const [commentModal, setCommentModal] = useState<{
    visible: boolean;
    id?: string;
    transfer_id?: string;
    sapDocEntry?: number
  }>({
    visible: false,
    id: undefined,
    transfer_id: undefined,
  });
  const [approveModel, setApproveModal] = useState<{
    visible: boolean;
    id?: string;
    transfer_id?: string;
    data?: any
  }>({
    visible: false,
    id: undefined,
    transfer_id: undefined,
  });

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
    setOnRefresh(false)
  }, [id, onRefresh == true])

  return (
    <>
      <Row justify="space-between">
        <BreadCrumbCom separator=">" routes={routes} />
        {data?.status == 'transfer-request' ?
          <Space>
            <Button
              onClick={() =>
              // getSap( data?.sapDocEntry || 0,  data?.id,  data?.transfer_id )
              {
                setApproveModal({ visible: true, id: data.id, transfer_id: data.transfer_id, data: data });
              }}
              type="default"
              icon={<CheckOutlined />}
            >
              Approve
            </Button>
            <Button
              onClick={() => {
                setCommentModal({ visible: true, id: data?.id, transfer_id: data?.transfer_id, sapDocEntry: data?.sapDocEntry });
              }}
              style={{ color: 'red' }}
              icon={<CloseOutlined />}
            >
              Reject
            </Button>
          </Space>
          : <></>}

      </Row>
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
          <Descriptions.Item label="Status" style={{ fontWeight: 'bolder' }}>
            {data?.state == 'in-progress' ? <Badge status={'processing'} text={'In Progress'} /> : data?.state == 'rejected' ? <Badge status={'error'} text={'Rejected'} /> : data?.state == 'completed' ? <Badge status={'success'} text={'Completed'} /> : ''}
          </Descriptions.Item>
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
              children: <TransferTab providedList={providedList} data={data ?? {}} refresh={(v) => { v == true ? setOnRefresh(true) : setOnRefresh(false) }} />,
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
      <RemarkFormModal
        title="Reject Form"
        open={commentModal.visible}
        loading={rejectLoading}
        onCancel={() => {
          setCommentModal({ visible: false, id: undefined });
        }}
        onSave={async (id, remark, transfer_id) => {
          setRejectLoading(true)
          try {
            const response: { data: string; message: string } = (await services.status_change({
              id: id,
              remark: remark,
              statusChange: 'transfer-request-reject',
              state: 'rejected',
            })) as { data: string; message: string };
            await services.save_activites({
              activities_name: 'Production Approval',
              action: 'Rejected',
              remark: remark,
              transfer_request: transfer_id,
            });
            setCommentModal({ visible: false, id: undefined });
            setOnRefresh(true)
            message.info(response.message);
            actionRef.current?.reload();
          } catch (e) {
            message.error('Error');
          } finally {
            setRejectLoading(false);
          }
        }}
        id={commentModal.id ?? ''}
        transfer_id={commentModal.transfer_id ?? ''}
      />

      <ApproveRemarkFormModal
        title="Approve Form"
        open={approveModel.visible}
        loading={loading}
        onCancel={() => {
          setApproveModal({ visible: false, id: undefined });
        }}
        onSave={async (id, remark, transfer_id, data) => {
          try {
            setLoading(true)
            await services.save_to_sap({
              id: id,
              vendorCode: '',
              vendorName: '',
              fromWarehouse: data.from_warehouse.map((i: any) => (i.whsCode)).toString(),
              toWarehouse: data.to_warehouse.map((i: any) => (i.whsCode)).toString(),
              apiReferenceNo: '',
              comments: remark === null ? '' : remark === undefined ? '' : remark,
              transferRequestDetails: data.item.map((v: any) => ({
                ...v,
                itemCode: v.item_code,
                itemName: v.item_name,
                fromWarehouse: data.from_warehouse.map((i: any) => (i.whsCode)).toString(),
                toWarehouse: data.to_warehouse.map((i: any) => (i.whsCode)).toString(),
                remark: v.remark === null ? '' : v.remark === undefined ? '' : v.remark,
              })),
              statusChange: 'request-production-approve',
              state: 'in-progress',
              activities_name: 'Production Approval',
              action: 'Approved',
              transfer_request: transfer_id,
              postingDate: new Date(data.posting_date).toISOString(),
              docDueDate: new Date(data.due_date).toISOString(),
              taxDate: new Date(data.posting_date).toISOString(),
            })
            setApproveModal({ visible: false, id: undefined });
            setOnRefresh(true)
            message.success("Success");
            actionRef.current?.reload();
          } catch (e) {
            message.error('Error');
          } finally {
            setLoading(false);
          }
        }}
        id={approveModel.id ?? ''}
        transfer_id={approveModel.transfer_id ?? ''}
        data={approveModel.data ?? {}}
      />
    </>
  );
};
