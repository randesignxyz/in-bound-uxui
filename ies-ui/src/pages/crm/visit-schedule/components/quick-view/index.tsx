import { colLink } from '@/components/DataCrud/TableView';
import DescriptionDisplay from '@/components/Descriptions';
import ImagePreview from '@/components/ImagePreview';
import { CrmPaths } from '@/pages/crm';
import PosmVerify from '@/pages/crm/components/PosmVerify';
import ContractVerification from '@/pages/crm/contract/contract-verification';
import { SalePaths } from '@/pages/sale';
import { formatDateTime } from '@/pages/utils';
import { PosmReview, StockCount, VisitScheduleDetail } from '@/services/crm/data';
import { SoItemLess } from '@/services/sale/data';
import { AuditOutlined, } from '@ant-design/icons';
import { ProCard, ProDescriptions } from '@ant-design/pro-components';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import { Button, Card, Checkbox, Descriptions, Image, Space, Table, Tabs, Tag } from 'antd';
import moment from 'moment';
import { useState } from 'react';
import { history } from "@umijs/max";
import ContractDetail from '../ContractDetail';
import PosmCheckedView from '../PosmCheckedView';

const customerColors = [
  'gold',
  'orange',
  'volcano',
  'magenta',
  'lime',
  'green',
  'cyan',
  'geekblue',
  'purple',
  'blue',
];

interface Props extends DrawerFormProps {
  detail?: VisitScheduleDetail;
  orderList?: SoItemLess[];
  onRefresh?: () => void;
}

export default ({ detail, orderList, onRefresh, ...rest }: Props) => {

  const [showModal, setShowModal] = useState<{ type: 'CONTACT_VERIFY' | 'POSM_VERIFY'; cb?: () => void }>()

  const scheduleInfoView = <ProCard bordered><DescriptionDisplay
    column={2}
    data={[
      {
        label: 'Customer',
        onClick: () => {
          history.push(CrmPaths.customer + `/detail/${detail?.customer.id}`);
        },
        value: [detail?.customer.code, detail?.customer.name].filter((it) => it).join(' - '),
      },
      { label: 'Address', value: detail?.address.name },
      {
        label: 'Salesperson',
        value: [detail?.salesperson.code, detail?.salesperson.name]
          .filter((it) => it)
          .join(' - '),
      },
      { label: 'Created By', value: detail?.createdBy },
      { label: 'Created Date', value: formatDateTime(detail?.createdDate) },
      { label: 'Schedule Type', value: detail?.scheduleType },
      { label: 'Status', value: detail?.status },
      { label: 'Completed Date', value: formatDateTime(detail?.completedDate) },
      { label: 'Completed By', value: detail?.completedBy },
      { label: 'Remarks', value: detail?.remarks },
    ]}
  /></ProCard>

  const visitView = <Space direction='vertical' style={{ width: '100%' }}>
    {detail?.status == 'COMPLETED' && (
      <ProCard bordered size="small" title="Visit Info" style={{ marginTop: 5 }}>
        <Descriptions column={2} contentStyle={{ fontWeight: 'bold' }}>
          <Descriptions.Item label="Visited By">{detail?.createdBy} </Descriptions.Item>

          <Descriptions.Item label="Actual Location">
            {detail?.visit?.actualLatitude && detail?.visit.actualLongitude && (
              <a
                href={'https://www.google.com/maps/search/?api=1&query='.concat(
                  detail?.visit.actualLatitude,
                  ',',
                  detail?.visit.actualLongitude,
                )}
                target="_blank"
              >
                {detail?.visit.actualLatitude.concat(',', detail?.visit.actualLongitude)}
              </a>
            )}
          </Descriptions.Item>
        </Descriptions>
        <DescriptionDisplay
          column={2}
          data={[
            {
              label: 'Checkin Date',
              value: formatDateTime(detail?.visit?.checkInDate),
            },
            {
              label: 'Checkout Date',
              value: formatDateTime(detail?.visit?.checkoutDate),
            },
          ]}
        />
        <DescriptionDisplay
          column={2}
          data={[
            {
              label: 'Check In Remarks',
              value: detail?.visit?.checkInRemarks || '',
            },
            {
              label: 'Check Out Remarks',
              value: detail?.visit?.checkoutRemarks || '',
            },
          ]}
        />
        <ProDescriptions>
          <ProDescriptions.Item label="Shop Closed" valueType={'checkbox'} >
            <Checkbox
              disabled
              defaultChecked={detail?.visit?.shopIsClosed}
            /></ProDescriptions.Item>
        </ProDescriptions>
        {detail.visit?.checkInImage && (
          <ImagePreview
            version={1}
            width={'100px'}
            key={detail?.visit?.checkInImage}
            fileId={detail.visit?.checkInImage}
            fileName={'Check In image'}
          />
        )}
      </ProCard>
    )}

    {(orderList || []).length > 0 && (
      <ProTable<SoItemLess>
        size="small"
        bordered
        style={{ marginTop: 5 }}
        rowKey="id"
        dataSource={orderList}
        search={false}
        options={{
          density: false,
          setting: false,
          reload: false,
        }}
        columns={[
          {
            title: 'PO #',
            width: '100px',
            render: colLink(
              (d) => {
                history.push(SalePaths.so + `/detail/${d.id}`);
              },
              (d) => d.poNo || 'Not Assigned',
            ),
          },
          { title: 'SO #', width: '70px', render: (_, r) => r.soNo },
          { title: 'Ship To', render: (_, r) => r.shippingAddress },
          {
            title: 'Orderd Date',
            align: 'right',
            width: '150px',
            render: (_, r) => formatDateTime(r.orderedDate),
          },
          {
            title: 'Quantity',
            align: 'right',
            width: 100,
            render: (_, r) => r.qty || 0,
          },
          {
            title: 'Status',
            width: 40,
            render: (_, r) => {
              const color =
                r.status == 'Pending'
                  ? 'processing'
                  : r.status == 'Posted'
                    ? 'success'
                    : r.status == 'Failed'
                      ? 'error'
                      : r.status == 'Canceled'
                        ? 'default'
                        : 'warning';
              return <Tag color={color}>{r.status}</Tag>;
            },
          },
        ]}
      />
    )}

    {(detail?.stockCountList.filter((it) => !it.item?.isCompetitor) || []).length > 0 && (
      <ProCard size="small" title="Current Stock" bordered>
        <Table<StockCount>
          rowKey="id"
          size='small'
          pagination={false}
          dataSource={detail?.stockCountList.filter((it) => it.item?.isCompetitor === false)}
          columns={[
            { title: 'Item Name', width: '300px', render: (_, r) => r.item?.name },
            { title: 'Quantity', dataIndex: 'quantity', width: '100px', align: 'right' },
            {
              title: 'Remarks',
              // dataIndex: 'remarks',
              render: (_, r) => {
                return (
                  <>
                    {r.remarks ? (
                      <>
                        {r.remarks}
                        <br />
                      </>
                    ) : (
                      <></>
                    )}
                    {r.stockExpired?.map((item, index) => (
                      <Tag color={customerColors[index]}>
                        Qty: {item.quantity}, Exp: {moment(item.expiredDate).format('DD-MM-YYYY')}
                      </Tag>
                    ))}
                  </>
                );
              },
            },
          ]}
        />
      </ProCard>
    )}

    {(detail?.stockCountList.filter((it) => it.item?.isCompetitor) || []).length > 0 && (
      <ProCard size="small" title="Current Stock" bordered>
        <Table<StockCount>
          size="small"
          pagination={false}
          rowKey="id"
          dataSource={detail?.stockCountList.filter((it) => it.item?.isCompetitor === true)}
          columns={[
            { title: 'Item Name', width: '300px', render: (_, r) => r.item?.name },
            { title: 'Quantity', dataIndex: 'quantity', width: '100px', align: 'right' },
            { title: 'Remarks', dataIndex: 'remarks' },
          ]}
        />
      </ProCard>
    )}

    {(detail?.posmReviewList || []).length > 0 && (
      <ProCard size="small" title="POSM Checked" bordered>
        <Table<PosmReview> size='small'
          columns={[
            { title: "Name", render: (_, r) => r.posm.name },
            { title: "Quantity", dataIndex: 'quantity' },
            {
              title: "Images", render: (_, r) => (
                <Image.PreviewGroup>
                  <Space>
                    {detail?.posmReviewList?.filter(it => it.id == r.id)
                      .flatMap((it) =>
                        (it.attachments || [])?.map((it1, index) => ({
                          fileId: it1.imageId,
                          fileName: `${it.posm.name} (${index + 1})`,
                        })),
                      )?.map(it => (<ImagePreview
                        version={1}
                        width={'50px'}
                        key={it.fileId}
                        fileId={it.fileId}
                      />))}
                  </Space>
                </Image.PreviewGroup>
              )
            },
            { title: "Remarks", dataIndex: 'remarks' },

          ]}
          dataSource={detail?.posmReviewList || []}
          pagination={false}
        />
      </ProCard>

    )}

    {(detail?.attachments || []).length > 0 && (
      <ProCard size="small" title="Attachment Photos" bordered>
        <Image.PreviewGroup>
          <Space>
            {detail?.attachments.map((it1, index) => ({
              fileId: it1.imageId,
              fileName: `Attachment (${index + 1})`,
            }))?.map(it => <ImagePreview
              version={1}
              width={'100px'}
              key={it.fileId}
              fileId={it.fileId}
              fileName={it.fileName}
            />)}
          </Space>
        </Image.PreviewGroup>
      </ProCard>
    )}

  </Space>

  const tabs = () => {

    return [
      detail?.status == 'COMPLETED' && { label: "Visit Info", disabled: detail?.status !== 'COMPLETED', key: "visitInfo", children: visitView },
      { label: "Schedule Info", key: "scheduleInfo", children: scheduleInfoView },
      (detail?.contracts?.length || 0) > 0 && { label: 'Contracts', key: "contract", disabled: (detail?.contracts?.length || 0) == 0, children: <ContractDetail refresh={onRefresh} detail={detail} /> },
      (detail?.posmCheckedList?.length || 0) > 0 && { label: 'POSM Checked', key: 'posmChecked', children: <PosmCheckedView items={detail?.posmCheckedList || []} /> }
    ].filter(it => it) as any
  }
  return (
    <DrawerForm width={1000}  {...rest} drawerProps={{
      extra: <Space>
        {((detail?.posmItems?.length || 0) + (detail?.posmReviewList?.length || 0)) > 0 && (detail?.posmCheckedList.length || 0) == 0 && <Button icon={<AuditOutlined />} type="primary" onClick={() => setShowModal({ type: 'POSM_VERIFY' })}>Verify POSM</Button>}
        {(detail?.contracts.length || 0) > 0 && (detail?.contracts.find(it => !detail?.contractCheckedList?.some(i => i.contractId == it.id))) && <Button type="primary" onClick={() => setShowModal({ type: 'CONTACT_VERIFY' })} icon={<AuditOutlined />}>Verify Contract</Button>}
      </Space>
    }}>
      <Tabs
        defaultActiveKey={detail?.status == 'COMPLETED' ? 'visitInfo' : 'visitInfo'}
        items={tabs()}
      />

      {showModal?.type == 'POSM_VERIFY' && detail && <PosmVerify
        open={true}
        posmItems={detail.posmItems}
        posmReviewList={detail.posmReviewList}
        onOpenChange={visible => !visible && setShowModal(undefined)}
        customerId={detail?.customer.id}
        onRefresh={onRefresh}
        visitId={detail.id}
      />}

      {showModal?.type == 'CONTACT_VERIFY' && detail && <ContractVerification
        open={true}
        onOpenChange={visible => !visible && setShowModal(undefined)}
        checkingDate={detail.scheduleDate}
        customerId={detail?.customer.id}
        customerAddressId={detail.customerAddressId}
        onRefresh={onRefresh}
        visitId={detail.id} />
      }
    </DrawerForm>
  );
};
