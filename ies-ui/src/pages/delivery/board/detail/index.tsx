import { ActionData } from '@/pages/type';
import { formatDate, formatDateTime, toReadable } from '@/pages/utils';
import {
  AssigningDocsResponse,
  DeliveryListItem,
  DeliveryNoteItem,
  FreightDetail,
  Loaded,
  LoadedInfo,
  LoadedItemInfo,
  LoadingListItem,
} from '@/services/delivery/data';
import { DeliveryParams } from '@/services/delivery/delivery-params';
import { InstanceDetail } from '@/services/delivery/instance.types';
import { AimOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { ProDescriptions } from '@ant-design/pro-components';
import ProList from '@ant-design/pro-list';
import ProTable from '@ant-design/pro-table';
import {
  Button,
  Card,
  Drawer,
  DrawerProps,
  message,
  Modal,
  Space,
  Spin,
  Tag,
  Timeline,
} from 'antd';
import moment, { Moment } from 'moment';
import { Key, useEffect, useState } from 'react';
import { CollectedInvoice } from '../assigned-docs';
import ResolveShipping from '../resolve-shipping';
import { ViewController } from '../view-controller';
import FreighDetail from './FreighDetail';
import RemarkModalV2 from '@/components/remark-modal-v2';

interface Props extends DrawerProps, ViewController {
  forceRefresh?: number;
}

export default ({ forceRefresh, requestActions, data: { itemDetail }, actions: { onRefreshDetailData }, view: { getActions, }, ...rest
}: Props) => {

  const [modal, setModal] = useState<
    | {
      type: 'PICKING-SLIP';
      payload: {
        loadingItem: LoadingListItem;
        isModified?: boolean;
      };
    }
    | {
      type: 'FINISH_LOADING';
      payload: {
        loadingItem: LoadingListItem;
        loaded: Loaded;
      };
    }
    | { type: 'CANCEL_PICKING'; payload: LoadingListItem }
    | { type: 'CANCEL_DELIVERY'; payload: DeliveryListItem }
    | { type: 'CHANGE_LICENSE_PLATE'; payload: InstanceDetail }
    | { type: 'VIEW'; payload: LoadedInfo }
    | {
      type: 'ASSIGNED_DOC';
      payload: {
        delivery: DeliveryListItem;
        assigningData: AssigningDocsResponse;
      };
    }
    | {
      type: 'RESOLVE',
      payload: {
        freight: FreightDetail
      }
    }
    | { type: 'CANCEL_CHANGE_REQUEST', payload: { loadingId: number } }
    | { type: 'NONE' }
  >({
    type: 'NONE',
  });

  const [actions, setActions] = useState<ActionData[]>()
  const closeModal = (visible?: boolean) => {
    !visible && setModal((v) => ({ ...v, type: 'NONE' }));
  };



  const onResolve = async (item: FreightDetail) => {
    try {

      setModal({
        type: 'RESOLVE',
        payload: {
          freight: item,
        }
      })
    } catch (error: any) {
      message.error(error.message || `Failed to load data`);
    }
  }


  const onClearCancel = async (item: FreightDetail, remarks?: string) => {
    Modal.confirm({
      title: "Clear Canceled DN", content: 'Are you sure?', onOk: async () => {
        try {
          await DeliveryParams.clearCancelDn(item.id, remarks!!)(requestActions)

        } catch (error: any) {
          message.error(error.message || 'Failed to clear.')
        }
      }
    })
  }

  const onClearChangeLocation = async (item: FreightDetail, remarks?: string) => {
    Modal.confirm({
      title: "Clear Changed Location DN", content: 'Are you sure?', onOk: async () => {
        try {
          await DeliveryParams.clearChangedLocationDn(item.id, remarks!!)(requestActions)
        } catch (error: any) {
          message.error(error.message || 'Failed to clear.')
        }
      }
    })
  }

  const fetchResolveDn = async (dnDate: Moment, shipToCode: string) => {
    return DeliveryParams.fetchResolvingDn(itemDetail?.delivery.id || 0, dnDate, shipToCode).query(requestActions)
  }

  const onSaveHandler = (currentFreightId: number, dnIds: number[], invoices: CollectedInvoice[], returnItems: DeliveryNoteItem[]) => {
    Modal.confirm({
      title: 'Resolve DN',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await DeliveryParams.resolveDn(
            currentFreightId,
            dnIds,
            invoices.map(it => ({
              docEntry: it.docEntry,
              collected: it.collected || false,
              remarks: it.remarks
            })),
            returnItems
          )(requestActions)
          closeModal()
          onRefreshDetailData()
        } catch (error: any) {
          message.error(error.message || `Failed to resolve`);
        }
      },
    });
  }

  const [expandedRowKeys, setExpandedRowKeys] = useState<readonly Key[]>([]);

  useEffect(() => {
    if (modal.type === 'RESOLVE') {
      const refreshId = modal.payload.freight.id
      const newData = itemDetail?.deliveryInfo?.freights.find(it => it.id == refreshId)
      if (newData) setModal({ ...modal, payload: { freight: newData } })
    }
  }, [forceRefresh])

  return (
    <Drawer
      {...rest}
      styles={{
        body: {
          backgroundColor: '#f0f2f5'
        }
      }}
      extra={
        !['CANCELED', 'COMPLETED'].some(it => it === itemDetail?.status) && (
          <Space>
            {
              rest.open && getActions?.('DETAIL', itemDetail)?.filter(it => it.visible && it.key !== 'view').map(it => (
                <Button onClick={() => it.onClick?.(itemDetail?.id || 0)} icon={it.icon}
                  danger={it.type === 'Danger'} key={it.key} type={it.type === 'Primary' ? "primary" : 'default'} >
                  {it.label}
                </Button>)
              )
            }
          </Space>
        )
      }
    >
      <Spin spinning={requestActions.request?.loading || false}>
        <Card title="General" size="small">
          <ProDescriptions>
            <ProDescriptions.Item label="Delivered Date">{itemDetail?.delivery?.deliveryDate ? formatDate(moment(itemDetail?.delivery.deliveryDate)) : 'N/A'}</ProDescriptions.Item>
            <ProDescriptions.Item label="Shift">{itemDetail?.delivery?.shift || 'N/A'}</ProDescriptions.Item>
            <ProDescriptions.Item label="Truck">{itemDetail?.truck.licensePlate}</ProDescriptions.Item>
            <ProDescriptions.Item label="Driver">
              {[itemDetail?.driver.firstName, itemDetail?.driver.lastName].filter((it) => it).join(' ')}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="Loading Dock">{itemDetail?.loading?.loadingDock}</ProDescriptions.Item>
            <ProDescriptions.Item label="Claimed By">{itemDetail?.claimedBy}</ProDescriptions.Item>
          </ProDescriptions>
        </Card>

        {(itemDetail?.loadingInfo?.items.length || 0) > 0 && (
          <Card title="Loading" size="small" style={{ marginTop: 5 }}>
            <ProTable<LoadedItemInfo>
              dataSource={itemDetail?.loadingInfo?.items || []}
              size="small"
              rowKey="id"
              search={false}
              options={{
                density: false,
                fullScreen: false,
                setting: false,
                reload: false,
              }}
              pagination={false}
              columns={[
                { title: 'Item Code', dataIndex: 'itemCode' },
                { title: 'Item Description', dataIndex: 'itemDescription' },
                { title: 'Batch', dataIndex: 'batchNum' },
                { title: 'Warehouse', dataIndex: 'whsCode' },
                { title: 'UoM', dataIndex: 'uom' },
                { title: 'Quantity', dataIndex: 'qty' },
                { title: 'Loaded Qty', dataIndex: 'loadedQty' },
              ]}
            />
          </Card>
        )}

        {(itemDetail?.loadingInfo?.newItems.length || 0) > 0 && (
          <Card title="Loading changed Request"
            headStyle={{ color: 'red' }} size="small" style={{ marginTop: 5 }}>

            <ProTable<LoadedItemInfo>
              headerTitle={
                itemDetail?.loadingInfo?.truckTransfer &&
                <ProDescriptions size='small'>
                  <ProDescriptions.Item label="Driver">{itemDetail?.loadingInfo?.truckTransfer.driverName}</ProDescriptions.Item>
                  <ProDescriptions.Item label="License Plate">{itemDetail?.loadingInfo?.truckTransfer.licensePlate}</ProDescriptions.Item>
                </ProDescriptions>
              }

              dataSource={itemDetail?.loadingInfo?.newItems || []}
              size="small"
              rowKey="id"
              search={false}
              options={{
                density: false,
                fullScreen: false,
                setting: false,
                reload: false,
              }}
              pagination={false}
              columns={[
                { title: 'Item Code', dataIndex: 'itemCode' },
                { title: 'Item Description', dataIndex: 'itemDescription' },
                { title: 'Batch', dataIndex: 'batchNum' },
                { title: 'Warehouse', dataIndex: 'whsCode' },
                { title: 'UoM', dataIndex: 'uom' },
                { title: 'Quantity', dataIndex: 'qty' },
              ]}
            />
          </Card>
        )}

        {(itemDetail?.deliveryInfo?.freights.length || 0) > 0 && (
          <Card title="Shipping" size="small" style={{ marginTop: 5 }}>
            <ProList<FreightDetail>
              dataSource={itemDetail?.deliveryInfo?.freights || []}
              expandable={{
                expandedRowKeys,
                onExpandedRowsChange: setExpandedRowKeys
              }}
              rowKey="id"
              // showActions="hover"

              metas={{
                avatar: {
                  render: () => <AimOutlined />,
                },
                title: {

                  render: (_, r) => (
                    <a style={(!!r.shippingLocation || r.canceled) ? itemDetail?.status === 'COMPLETED' ? { color: 'gray', textDecoration: 'line-through' } : { color: 'red', textDecoration: 'line-through' } : {}} onClick={() => { }}>
                      <Space direction='horizontal'>
                        {r.shippingAddress.shipToCode}
                        {!!r.shippingLocation && itemDetail?.status === 'COMPLETED' && <CheckCircleFilled />}
                      </Space>
                    </a>
                  ),
                },

                actions: {
                  render: (_, r) =>
                    (!!r.shippingLocation || r.canceled) && !r.resolved && itemDetail?.status !== 'COMPLETED' && itemDetail?.isOwner && (
                      <a color="red" onClick={() => onResolve(r)}>
                        Resolve
                      </a>
                    ),
                },
                subTitle: {
                  render: (_, r) => <div>
                    {r.canceled && <Tag color="error" >
                      <Space>
                        Canceled
                        {/* <RemarkModalV2 trigger={<a style={{ color: 'red' }}><CloseCircleFilled /></a>}
                          required item={r} title='Clear canceled delivery'
                          onSave={async (item, remarks) => {
                            try {
                              await onClearCancel(item, remarks)
                              return true
                            } catch (error) {
                              return false
                            }

                          }} /> */}
                      </Space>
                    </Tag>}
                    {r.shippingLocation && <Tag color="error">
                      <Space>
                        Location Changed
                        {/* <RemarkModalV2 trigger={<a style={{ color: 'red' }}><CloseCircleFilled /></a>}
                          required item={r} title='Clear change delivery location'
                          onSave={async (item, remarks) => {
                            try {
                              await onClearChangeLocation(item, remarks)
                              return true
                            } catch (error) {
                              return false
                            }

                          }}
                        /> */}
                      </Space>
                    </Tag>}
                  </div>
                },

                description: {
                  render: (_, r) => <FreighDetail data={r} />,
                },
              }}
            />
          </Card>
        )}

        <Card title="Activities" size="small" style={{ marginTop: 5 }}>
          <Timeline mode="left">
            {itemDetail?.activities.map((it) => (
              <Timeline.Item key={`timeline-${it.id}`}>
                {`${formatDateTime(moment(it.actionDate))}, ${toReadable(it.action)} by ${it.actionBy}`}{' '}
                {it.remarks && `, Remarks: ${it.remarks}`}
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
        {
          modal.type === 'RESOLVE' && (
            <ResolveShipping
              open={modal.type === 'RESOLVE'}
              loading={requestActions.request?.loading}
              loadingDate={itemDetail?.loading.assignedDate}
              freight={modal.payload.freight}
              onReload={onRefreshDetailData}
              onFetchResolvedDn={fetchResolveDn}
              onLoadingAvailble={(dbDate) => DeliveryParams.fetchChangedDNList(itemDetail?.delivery?.id || 0, dbDate).query(requestActions)}
              onSave={onSaveHandler}
              onCancel={closeModal}
            />
          )
        }
      </Spin>
    </Drawer>
  );
};
