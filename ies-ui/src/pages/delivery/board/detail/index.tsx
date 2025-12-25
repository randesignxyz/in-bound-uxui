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
import { AimOutlined, CheckCircleFilled, CloseCircleFilled, EnvironmentOutlined } from '@ant-design/icons';
import { ModalForm, ProDescriptions } from '@ant-design/pro-components';
import ProList from '@ant-design/pro-list';
import ProTable from '@ant-design/pro-table';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Drawer,
  DrawerProps,
  message,
  Modal,
  Row,
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
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

interface Props extends DrawerProps, ViewController {
  forceRefresh?: number;
}

export default ({ forceRefresh, requestActions, data: { itemDetail }, actions: { onRefreshDetailData }, view: { getActions, }, ...rest
}: Props) => {
  const [openMap, setOpenMap] = useState(false)
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyA0Ifgai8ryDULDIqNOZmX8L7XZlzu4_D8', // put your key here
  });

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


  // const onClearCancel = async (item: FreightDetail, remarks?: string) => {
  //   Modal.confirm({
  //     title: "Clear Canceled DN", content: 'Are you sure?', onOk: async () => {
  //       try {
  //         await DeliveryParams.clearCancelDn(item.id, remarks!!)(requestActions)

  //       } catch (error: any) {
  //         message.error(error.message || 'Failed to clear.')
  //       }
  //     }
  //   })
  // }

  // const onClearChangeLocation = async (item: FreightDetail, remarks?: string) => {
  //   Modal.confirm({
  //     title: "Clear Changed Location DN", content: 'Are you sure?', onOk: async () => {
  //       try {
  //         await DeliveryParams.clearChangedLocationDn(item.id, remarks!!)(requestActions)
  //       } catch (error: any) {
  //         message.error(error.message || 'Failed to clear.')
  //       }
  //     }
  //   })
  // }

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

  const defaultCenter = {
    lat: Number(itemDetail?.deliveryInfo?.freights[0]?.shippingAddress.latitude) || 11.562108,
    lng: Number(itemDetail?.deliveryInfo?.freights[0]?.shippingAddress.longitude) || 104.888535,
  };

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
            <Button
              onClick={() => setOpenMap(true)}
              icon={<EnvironmentOutlined />}
              type="default"
            >
              Location
            </Button>
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
            <ProDescriptions.Item label="Owned Truck Loading"><Checkbox checked={!!itemDetail?.loading.ownedTruckLoading} /></ProDescriptions.Item>
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
                { title: 'Quantity', dataIndex: 'qty', align: 'right' },
                { title: 'Loaded Qty', dataIndex: 'loadedQty', align: 'right', width: '120px' },
              ]}
              footer={(data) => (
                <Row>
                  <Col flex={'Auto'} style={{ fontWeight: 'bold' }}>
                    Total
                  </Col>
                  <Col flex={'100px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
                    {' '}
                    {data.map((it) => it.qty || 0).reduce((p, c) => p + c, 0)}{' '}
                  </Col>
                  <Col flex={'120px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
                    {' '}
                    {data.map((it) => it.loadedQty || 0).reduce((p, c) => p + c, 0)}{' '}
                  </Col>
                </Row>
              )}
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
                { title: 'Quantity', dataIndex: 'qty', align: 'right' },
              ]}

              footer={(data) => (
                <Row>
                  <Col flex={'Auto'} style={{ fontWeight: 'bold' }}>
                    Total
                  </Col>
                  <Col flex={'100px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
                    {' '}
                    {data.map((it) => it.qty || 0).reduce((p, c) => p + c, 0)}{' '}
                  </Col>
                </Row>
              )}
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
                      </Space>
                    </Tag>}
                    {r.shippingLocation && <Tag color="error">
                      <Space>
                        Location Changed
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
      <ModalForm
        title="Map"
        open={openMap}
        modalProps={{
          onCancel: () => setOpenMap(false),
          onOk: () => setOpenMap(false),
        }}
      >
        <GoogleMap
          zoom={12}
          center={defaultCenter}
          mapContainerStyle={{ width: "100%", height: "550px" }}
        >
          {itemDetail?.deliveryInfo?.freights.map((dn) => {
            const markerIcon = dn.checkIn
              ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
              : "https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi3.png"
            const markerSize = dn.checkIn
              ? new window.google.maps.Size(45, 43)
              : new window.google.maps.Size(25, 43);
            return (
              <Marker
                key={dn.id}
                position={{
                  lat: Number(dn.shippingAddress?.latitude),
                  lng: Number(dn.shippingAddress?.longitude),
                }}
                title={`${dn.shippingAddress?.shipToCode}`}
                icon={{
                  url: markerIcon,
                  scaledSize: markerSize,
                }}
              />
            );
          })}
        </GoogleMap>


      </ModalForm>
    </Drawer>
  );
};
