import { colLink } from '@/components/DataCrud/TableView';
import DescriptionDisplay from '@/components/Descriptions';
import ImagePreview from '@/components/ImagePreview';
import { CrmPaths } from '@/pages/crm';
import PosmVerify from '@/pages/crm/components/PosmVerify';
import ContractVerification from '@/pages/crm/contract/contract-verification';
import { SalePaths } from '@/pages/sale';
import { formatDate, formatDateTime } from '@/pages/utils';
import { PosmReview, StockCount } from '@/services/crm/data';
import { SoItemLess } from '@/services/sale/data';
import { AuditOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { ProFormCheckbox } from '@ant-design/pro-form';
import ProTable from '@ant-design/pro-table';
import {
  Button,
  Card,
  Descriptions,
  Image,
  List,
  message,
  Modal,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { history, useAccess } from 'umi';
import { Model } from '../../model';
import ChangeStatusModal from '../ChangeStatusModal';
import ContractDetail from '../ContractDetail';
import PosmCheckedView from '../PosmCheckedView';

interface ImageData {
  id?: string;
  name: string;
  // image: string;
}

export interface DetailProps {
  id: number;
  openInTab?: true;
  onBack?: () => void;
}

const VisitScheduleDetailView: React.FC<DetailProps> = ({ id, openInTab, onBack }) => {
  const { state, actions, modals } = Model();
  const [images, setImage] = useState<ImageData[]>([]);
  const [showModal, setShowModal] = useState<{
    type: 'CONTACT_VERIFY' | 'POSM_VERIFY';
    cb?: () => void;
  }>();
  const access = useAccess();

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

  useEffect(() => {
    actions.detail(id);
  }, []);

  useEffect(() => {
    const posImags = (state.data?.detail?.posmReviewList || []).flatMap((it) =>
      (it.attachments || []).map((ti) => ({ id: ti.imageId, name: it.posm.name })),
    );

    const attachmentImages = (state.data?.detail?.attachments || []).map((it, index) => ({
      id: it.imageId,
      name: `Attachment ${index + 1}`,
    }));

    if (state.data?.detail?.visit?.checkInImage !== null) {
      setImage([
        { id: state.data?.detail?.visit?.checkInImage, name: 'Check In' },
        ...posImags,
        ...attachmentImages,
      ]);
    } else {
      setImage([...posImags, ...attachmentImages]);
    }

    // if (state.data?.detail?.posmReviewList) {
    //   state.data?.detail?.posmReviewList
    //     ?.flatMap((it) => {
    //       return it.attachments?.map((ti) => {
    //         return { id: ti.imageId, name: it.posm.name };
    //       });
    //     })
    //     .concat(
    //       state.data?.detail?.visit && state.data?.detail?.visit?.checkInImage
    //         ? [{ id: state.data?.detail?.visit?.checkInImage, name: 'Check In' }]
    //         : [],
    //     )
    //     .map((it) => {
    //       it &&
    //         getUploadFileObjectUrl()(it.id).then((image) => {
    //           setImage((v) => [...v, { id: it.id, name: it.name, image: image }]);
    //         });
    //     });
    // }

    // state.data?.detail?.attachments &&
    //   state.data?.detail?.attachments.map((it, index) => {
    //     it &&
    //       getUploadFileObjectUrl()(it.imageId).then((image) => {
    //         setImage((v) => [
    //           ...v,
    //           { id: it.imageId, name: `Attachment ${index + 1}`, image: image },
    //         ]);
    //       });
    //   });
  }, [state.data?.detail?.posmReviewList]);


  const actionButtons = <Space>
    {access.canVerifyContractCompliance &&
      (state.data?.detail?.posmItems?.length || 0) +
      (state.data?.detail?.posmReviewList?.length || 0) >
      0 &&
      (state.data?.detail?.posmCheckedList?.length || 0) === 0 && (
        <Button
          type="link"
          onClick={() => setShowModal({ type: 'POSM_VERIFY' })}
          icon={<AuditOutlined />}
        >
          Verify POSM
        </Button>
      )}

    {access.canVerifyContractCompliance &&
      (state.data?.detail?.contracts?.length || 0) > 0 &&
      state.data?.detail?.contracts?.find(
        (it) =>
          !state.data?.detail?.contractCheckedList?.some((i) => i.contractId === it.id),
      ) && (
        <Button
          type="link"
          onClick={() => setShowModal({ type: 'CONTACT_VERIFY' })}
          icon={<AuditOutlined />}
        >
          Verify Contract
        </Button>
      )}
  </Space>

  const content = <>
    <Card size="small" title="General" extra={openInTab && actionButtons} >
      <DescriptionDisplay
        data={[
          {
            label: 'Customer',
            onClick: () => {
              history.push(CrmPaths.customer + `/detail/${state.data?.detail?.customer.id}`);
            },
            value: [state.data?.detail?.customer.code, state.data?.detail?.customer.name]
              .filter((it) => it)
              .join(' - '),
          },
          { label: 'Address', value: state.data?.detail?.address.name },
          {
            label: 'Salesperson',
            value: [state.data?.detail?.salesperson.code, state.data?.detail?.salesperson.name]
              .filter((it) => it)
              .join(' - '),
          },
          { label: 'Created By', value: state.data?.detail?.createdBy },
          { label: 'Created Date', value: formatDateTime(state.data?.detail?.createdDate) },
          { label: 'Schedule Type', value: state.data?.detail?.scheduleType },
          { label: 'Status', value: state.data?.detail?.status },
          { label: 'Completed Date', value: formatDateTime(state.data?.detail?.completedDate) },
          { label: 'Completed By', value: state.data?.detail?.completedBy },
          { label: 'Remarks', value: state.data?.detail?.remarks },
        ]}
      />
    </Card>
    {state.data?.detail?.visit && (
      <Card size="small" style={{ marginTop: '5px' }}>
        <Tabs>
          <Tabs.TabPane tab="Visit Info" key="visitInfo">
            <Descriptions column={2} contentStyle={{ fontWeight: 'bold' }}>
              <Descriptions.Item label="Visited By">
                {state.data?.detail?.createdBy}{' '}
              </Descriptions.Item>

              <Descriptions.Item label="Actual Location">
                {state.data?.detail?.visit.actualLatitude &&
                  state.data?.detail?.visit.actualLongitude && (
                    <a
                      href={'https://www.google.com/maps/search/?api=1&query='.concat(
                        state.data?.detail?.visit.actualLatitude,
                        ',',
                        state.data?.detail?.visit.actualLongitude,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {state.data?.detail?.visit.actualLatitude.concat(
                        ',',
                        state.data?.detail?.visit.actualLongitude,
                      )}
                    </a>
                  )}
              </Descriptions.Item>
            </Descriptions>

            <DescriptionDisplay
              column={2}
              data={[
                {
                  label: 'Checkin Date',
                  value: formatDateTime(state.data?.detail?.visit.checkInDate),
                },
                {
                  label: 'Checkout Date',
                  value: formatDateTime(state.data?.detail?.visit.checkoutDate),
                },
              ]}
            />
            <DescriptionDisplay
              column={2}
              data={[
                {
                  label: 'Check In Remarks',
                  value: state.data?.detail?.visit.checkInRemarks || '',
                },
                {
                  label: 'Check Out Remarks',
                  value: state.data?.detail?.visit.checkoutRemarks || '',
                },
              ]}
            />
            <ProFormCheckbox
              label="Shop Closed"
              disabled
              fieldProps={{
                defaultChecked: state.data.detail.visit.shopIsClosed,
              }}
            />
            {images.length > 0 && state.data?.detail?.visit?.checkInImage && (
              <ImagePreview
                version={1}
                width={'200px'}
                key={state.data?.detail?.visit?.checkInImage}
                fileId={state.data?.detail.visit?.checkInImage}
                fileName={'Check In image'}
              />
            )}
          </Tabs.TabPane>

          <Tabs.TabPane tab="Contracts" key={'contract'}>
            <ContractDetail detail={state.data?.detail} />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Sale Orders" key="saleOrders">
            <ProTable<SoItemLess>
              size="small"
              bordered
              rowKey="id"
              dataSource={state.data?.orderList}
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
                  // valueType: {
                  //   type: 'money',
                  //   locale: 'en-US',
                  // },
                  width: 100,
                  render: (_, r) => r.qty || 0,
                },
                {
                  title: 'Status',
                  width: 40,
                  render: (_, r) => {
                    const color =
                      r.status === 'Pending'
                        ? 'processing'
                        : r.status === 'Posted'
                          ? 'success'
                          : r.status === 'Failed'
                            ? 'error'
                            : r.status === 'Canceled'
                              ? 'default'
                              : 'warning';
                    return <Tag color={color}>{r.status}</Tag>;
                  },
                },
              ]}
              style={{ marginTop: 24 }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Stock count" key="stockCount">
            <Table<StockCount>
              size="small"
              rowKey="id"
              title={() => 'Current Stock'}
              dataSource={state.data?.detail?.stockCountList.filter(
                (it) => it.item?.isCompetitor === false,
              )}
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
                          <Tag color={customerColors[index]} key={r.id}>
                            Qty: {item.quantity}, Exp:{' '}
                            {moment(item.expiredDate).format('DD-MM-YYYY')}
                          </Tag>
                        ))}
                      </>
                    );
                  },
                },
              ]}
              bordered
            />

            <Table<StockCount>
              size="small"
              bordered
              rowKey="id"
              title={() => 'Competitor Stock'}
              dataSource={state.data?.detail?.stockCountList.filter(
                (it) => it.item?.isCompetitor === true,
              )}
              columns={[
                { title: 'Item Name', width: '300px', render: (_, r) => r.item?.name },
                { title: 'Quantity', dataIndex: 'quantity', width: '100px', align: 'right' },
                { title: 'Remarks', dataIndex: 'remarks' },
              ]}
              style={{ marginTop: 24 }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="POSM Review" key="posmReview">
            <Table<PosmReview>
              dataSource={state.data?.detail?.posmReviewList}
              rowKey="id"
              size="small"
              columns={[
                { title: 'POSM', width: '300px', render: (_, r) => r.posm.name },
                { title: 'Quantity', dataIndex: 'quantity', width: '100px', align: 'right' },
                { title: 'Status', dataIndex: 'status' },
                {
                  title: 'Image',
                  render: (_, r) => {
                    return r.attachments && r.attachments.length > 0 ? (
                      // loop
                      <Space>
                        {r.attachments.map((item) => (
                          <ImagePreview
                            version={1}
                            width={'30px'}
                            key={item.id}
                            fileId={item.imageId}
                            fileName={''}
                          />
                        ))}
                      </Space>
                    ) : (
                      <div>No Image</div>
                    );
                  },
                },
                { title: 'Remarks', dataIndex: 'remarks' },
              ]}
            />
          </Tabs.TabPane>

          {(state.data?.detail.posmCheckedList.length || 0) > 0 && (
            <Tabs.TabPane tab="POSM Review Checked" key={'posmChecked'}>
              <PosmCheckedView items={state.data?.detail.posmCheckedList || []} />
            </Tabs.TabPane>
          )}
          <Tabs.TabPane tab="Gallery" key="images">
            <Image.PreviewGroup>
              <List
                grid={{ gutter: 5 }}
                dataSource={images.filter((it) => it) || []}
                renderItem={(it) => {
                  return (
                    <List.Item>
                      <ImagePreview
                        version={1}
                        width={'200px'}
                        key={it.id}
                        fileId={it.id || ''}
                        fileName={it.name}
                      />
                    </List.Item>
                  );
                }}
              />
            </Image.PreviewGroup>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    )}
  </>
  return (
    <Spin spinning={state.loading}>
      {openInTab ? content : <PageContainer
        breadcrumb={undefined}
        title="Visit Schedule"
        subTitle={formatDate(state.data?.detail?.scheduleDate)}
        onBack={onBack}
        extra={actionButtons}
      >
        {content}
      </PageContainer>
      }

      <ChangeStatusModal
        open={modals.isVisible('changeStatus')}
        onCancel={() => modals.hideModal('changeStatus')}
        onSubmit={(remarks) => {
          Modal.confirm({
            title: 'Schedule Cancellation',
            content: 'Are you sure?',
            onOk: async () => {
              try {
                if (state.data?.detail?.id)
                  await actions.cancelSchedule(state.data?.detail?.id, remarks);
                modals.hideModal('changeStatus');
                message.success('Visit schedule is cancelled successfully.');
              } catch (error) {
                message.error('Failed to cancel.');
              }
            },
          });
        }}
      />

      {showModal?.type === 'POSM_VERIFY' && state.data?.detail && (
        <PosmVerify
          open={true}
          posmItems={state.data.detail.posmItems}
          posmReviewList={state.data.detail.posmReviewList}
          onOpenChange={(visible) => !visible && setShowModal(undefined)}
          customerId={state.data.detail?.customer.id}
          onRefresh={() => actions.detail(state.data?.detail?.id || 0)}
          visitId={state.data.detail.id}
        />
      )}

      {showModal?.type === 'CONTACT_VERIFY' && state.data?.detail && (
        <ContractVerification
          open={true}
          onOpenChange={(visible) => !visible && setShowModal(undefined)}
          checkingDate={state.data?.detail?.scheduleDate}
          customerId={state.data?.detail?.customer.id}
          onRefresh={() => actions.detail(state.data?.detail?.id || 0)}
          visitId={state.data?.detail.id}
        />
      )}
    </Spin>
  );
};

export default VisitScheduleDetailView;
