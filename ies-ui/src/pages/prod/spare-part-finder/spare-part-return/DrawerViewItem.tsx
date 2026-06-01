import { useEffect, useMemo, useState } from 'react';
import { Drawer, Badge, Card, Button, Typography, Row, Col, Spin, message } from 'antd';
import { InboxOutlined, SettingOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { RequestActions } from '@/services/apiGateway';
import { SparePartReturnAPI } from './service';
import type { SparePartReturnListItem } from './data';
import SparePartImage from '../spare-part-request/SparePartImage';

const { Title, Text } = Typography;

const formatDrawerDateTime = (value?: string | null) => {
  if (!value) return '-';

  const parsed = dayjs(value);
  if (!parsed.isValid()) return String(value);

  return parsed.format('YYYY-MM-DD HH:mm:ss');
};

const normalizePickedItemDetail = (response: any): PickedItemDetail | null => {
  const raw = Array.isArray(response)
    ? response[0]
    : response?.items?.[0] || response?.data?.items?.[0] || response?.data?.[0] || response;

  if (!raw || typeof raw !== 'object') return null;

  return {
    ...raw,
    forLine: raw.forLine ?? raw.for_line ?? '',
    requestOtherDestination: Boolean(raw.requestOtherDestination ?? raw.request_other_destination ?? raw.otherDestination ?? raw.other_destination),
    otherDestination: raw.otherDestination ?? raw.other_destination ?? '',
  } as PickedItemDetail;
};

interface PickedItemDetail {
  id?: number;
  itemId?: string;
  itemName?: string;
  fulfillmentNo?: string;
  pickupMethod?: string;
  description?: string;
  imageId?: string[];
  requestedUom?: string;
  fromWarehouseCode?: string;
  fromWarehouseName?: string;
  toWarehouseCode?: string;
  toWarehouseName?: string;
  category?: { id?: number; category_name?: string } | string;
  businessUnit?: string;
  forLine?: string;
  requestOtherDestination?: boolean;
  otherDestination?: string;
  requestedBy?: string;
  requestDate?: string;
  approvedBy?: string;
  approvedAt?: string;
  pickedBy?: string;
  pickedDate?: string;
  firstPickedDate?: string;
  lastPickedDate?: string;
  pickedUpdates?: Array<{
    fulfillmentNo?: string;
    pickupMethod?: string;
    pickedBy?: string;
    pickedDate?: string;
    pickupLocation?: string;
  }>;
  deliveredQty?: number;
  remainingQty?: number;
  pendingReturnQty?: number;
  returnedQty?: number;
  kind?: string;
  isClosed?: boolean;
  requestId?: number;
  requestNo?: string;
  requestLineId?: number;
}

interface DrawerViewItemProps {
  open: boolean;
  data?: SparePartReturnListItem | null;
  onClose?: () => void;
  onRequestParts?: () => void;
}

export default function DrawerViewItem({
  open,
  data,
  onClose,
  onRequestParts,
}: DrawerViewItemProps) {
  const [detail, setDetail] = useState<PickedItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | undefined>(undefined);
  const [imageTransitioning, setImageTransitioning] = useState(false);

  const requestAction: RequestActions = {
    start: (serviceName) => console.log(`Loading: ${serviceName}`),
    end: (status, reason) => console.log(status, reason),
  };

  const itemId = data?.itemId;
  const requestId = data?.requestId;

  useEffect(() => {
    let active = true;

    const fetchPickedDetails = async () => {
      if (!open) {
        setDetail(null);
        setLoading(false);
        return;
      }

      if (!itemId || !requestId) {
        setDetail(null);
        return;
      }

      setLoading(true);
      try {
        const response = await SparePartReturnAPI(requestAction).itemPickedDetails(itemId, requestId);
        const item = normalizePickedItemDetail(response);

        if (active) {
          setDetail(item);
        }
      } catch (error) {
        console.error('Failed to fetch picked item details', error);
        if (active) {
          setDetail(null);
          message.error('Failed to load spare part details');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchPickedDetails();

    return () => {
      active = false;
    };
  }, [itemId, open, requestId]);

  const imageIds = useMemo(() => {
    const ids = detail?.imageId ?? data?.imageId;
    return Array.isArray(ids) ? ids.filter(Boolean) : (ids ? [ids] : []);
  }, [detail?.imageId, data?.imageId]);

  const firstImageId = imageIds[0];

  useEffect(() => {
    setSelectedImageId(firstImageId);
  }, [firstImageId, open]);

  const mainImageId = selectedImageId || firstImageId;

  useEffect(() => {
    if (!open || !mainImageId) return;
    setImageTransitioning(true);
    const timeout = window.setTimeout(() => setImageTransitioning(false), 180);
    return () => window.clearTimeout(timeout);
  }, [mainImageId, open]);

  const isClosed = detail?.isClosed ?? data?.isClosed ?? false;
  const title = detail?.itemName || data?.spare_part_name || data?.part_number || 'Product Details';
  const otherDestination = detail?.requestOtherDestination
    ? detail.otherDestination?.trim()
    : (data as any)?.requestOtherDestination
      ? String((data as any)?.otherDestination || '').trim()
      : '';
  const lineValue = otherDestination ? '-' : detail?.forLine || (data as any)?.forLine || '-';
  const warehouseToValue = otherDestination ? '-' : detail?.toWarehouseName || detail?.toWarehouseCode || '-';
  const pickedUpdates = useMemo(
    () =>
      [...(detail?.pickedUpdates ?? [])].sort(
        (a, b) => dayjs(b.pickedDate).valueOf() - dayjs(a.pickedDate).valueOf(),
      ),
    [detail?.pickedUpdates],
  );
  const latestPickedUpdate = pickedUpdates[0];
  const pickupLocationValue = latestPickedUpdate?.pickupLocation || otherDestination || detail?.toWarehouseCode || '-';
  const categoryLabel = useMemo(() => {
    const category = detail?.category;
    if (typeof category === 'string') return category;
    return category?.category_name || data?.category || '-';
  }, [data?.category, detail?.category]);

  return (
    <Drawer
      width={480}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Product Details</span>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      bodyStyle={{ padding: 0, backgroundColor: '#fafafa' }}
      headerStyle={{ borderBottom: '1px solid #f0f0f0' }}
    >
      <Spin spinning={loading}>
        <div
          style={{
            backgroundColor: '#fff',
            padding: '24px 0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 300,
          }}
        >
          {imageIds.length > 0 ? (
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  transition: 'opacity 180ms ease, transform 180ms ease',
                  opacity: imageTransitioning ? 0.55 : 1,
                  transform: imageTransitioning ? 'scale(0.985)' : 'scale(1)',
                }}
              >
                <SparePartImage imageId={mainImageId} alt={title} size={280} />
              </div>

              {imageIds.length > 1 && (
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    gap: 10,
                    flexWrap: 'wrap',
                    padding: '0 24px',
                    justifyContent: 'start',
                  }}
                >
                  {imageIds.map((id, index) => {
                    const isActive = id === mainImageId;
                    return (
                      <div key={`${id}-${index}`} style={{ position: 'relative' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedImageId(id)}
                          style={{
                            border: isActive ? '2px solid #d4a574' : '1px solid #d9d9d9',
                            borderRadius: 8,
                            padding: 4,
                            background: '#fff',
                            cursor: 'pointer',
                          }}
                        >
                          <SparePartImage imageId={id} alt={title} size={64} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <SparePartImage imageId={detail?.imageId ?? data?.imageId} alt={title} size={220} />
          )}
        </div>

        <div style={{ padding: '24px', backgroundColor: '#fff' }}>
          <Badge
            status={isClosed ? 'default' : 'success'}
            text={
              <Text style={{ color: isClosed ? '#8c8c8c' : '#52c41a', fontWeight: 500 }}>
                {isClosed ? 'Closed' : 'Open'}
              </Text>
            }
            style={{ marginBottom: 16, display: 'block' }}
          />

          <Title level={4} style={{ margin: '0 0 12px 0', fontWeight: 600 }}>
            {title}
          </Title>

          <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 8 , fontWeight: 500}}>
            {/* Item ID: */}
             {detail?.itemId || data?.itemId || '-'}
          </Text>
          <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 8 , fontWeight: 500}}>
            Request No: {detail?.requestNo || data?.requestNo || '-'}
          </Text>
          {/* <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 24 }}>
            Fulfillment No: {detail?.fulfillmentNo || data?.fulfillmentNo || '-'}
          </Text> */}

          <div style={{ marginBottom: 24 }}>
            <Text
              type="secondary"
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: 1,
                display: 'block',
                marginBottom: 8,
              }}
            >
              Description
            </Text>
            <Text style={{ fontSize: 14, lineHeight: 1.6, color: '#595959' }}>
              {detail?.description || data?.description || 'No description available.'}
            </Text>
          </div>
        </div>

        <div style={{ padding: '0 24px 24px', backgroundColor: '#fff' }}>
          <Card
            style={{
              backgroundColor: '#fafafa',
              border: '1px solid #f0f0f0',
              borderRadius: 8,
            }}
            bodyStyle={{ padding: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <InboxOutlined style={{ fontSize: 18, marginRight: 8, color: '#595959' }} />
              <Text strong style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Quantity Summary
              </Text>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: '1px solid #e8e8e8',
              }}
            >
              <Text style={{ color: '#8c8c8c' }}>Delivered Qty</Text>
              <div>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: '#d4a574',
                    lineHeight: 1,
                  }}
                >
                  {detail?.deliveredQty ?? '-'}
                </Text>
                <Text style={{ marginLeft: 4, color: '#8c8c8c' }}>{detail?.requestedUom || data?.UoM || 'Units'}</Text>
              </div>
            </div>

            <Row gutter={16} style={{ textAlign: 'center' }}>
              <Col span={6}>
                <Text
                  style={{
                    fontSize: 11,
                    color: '#8c8c8c',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  Remaining
                </Text>
                <Text strong style={{ fontSize: 16 }}>
                  {detail?.remainingQty ?? '-'}
                </Text>
              </Col>
              <Col span={6}>
                <Text
                  style={{
                    fontSize: 11,
                    color: '#8c8c8c',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  Pending
                </Text>
                <Text strong style={{ fontSize: 16 }}>
                  {detail?.pendingReturnQty ?? '-'}
                </Text>
              </Col>
              <Col span={6} style={{ borderLeft: '1px solid #e8e8e8', borderRight: '1px solid #e8e8e8' }}>
                <Text
                  style={{
                    fontSize: 11,
                    color: '#8c8c8c',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  Returned
                </Text>
                <Text strong style={{ fontSize: 16 }}>
                  {detail?.returnedQty ?? '-'}
                </Text>
              </Col>
              <Col span={6}>
                <Text
                  style={{
                    fontSize: 11,
                    color: '#8c8c8c',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  Type
                </Text>
                <Text strong style={{ fontSize: 12 }}>
                  {detail?.kind || '-'}
                </Text>
              </Col>
            </Row>
          </Card>
        </div>

        <div style={{ padding: '0 24px 24px', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <SettingOutlined style={{ fontSize: 18, marginRight: 8, color: '#595959' }} />
            <Text strong style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Picking Details
            </Text>
          </div>

          <Card
            style={{
              backgroundColor: '#fafafa',
              border: '1px solid #f0f0f0',
              borderRadius: 8,
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <Text style={{ color: '#8c8c8c' }}>Warehouse From</Text>
              <Text>{detail?.fromWarehouseName || detail?.fromWarehouseCode || '-'}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <Text style={{ color: '#8c8c8c' }}>Warehouse To</Text>
              <Text>{warehouseToValue}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <Text style={{ color: '#8c8c8c' }}>Other Destination</Text>
              <Text>{otherDestination || '-'}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <Text style={{ color: '#8c8c8c' }}>Pickup Method</Text>
              <Text>{latestPickedUpdate?.pickupMethod || detail?.pickupMethod || '-'}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px' }}>
              <Text style={{ color: '#8c8c8c' }}>Pickup Location</Text>
              <Text>{pickupLocationValue}</Text>
            </div>

            {pickedUpdates.length > 0 && (
              <>
                <div style={{ padding: '14px 20px', borderTop: '1px solid #f0f0f0', background: '#fcfcfc' }}>
                  <Text strong style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                    Pickup Updates ({pickedUpdates.length})
                  </Text>
                </div>
                {pickedUpdates.map((update, index) => (
                  <div
                    key={`${update.fulfillmentNo || 'pickup'}-${index}`}
                    style={{
                      padding: '14px 20px',
                      borderTop: '1px solid #f5f5f5',
                      borderBottom: index === pickedUpdates.length - 1 ? 'none' : '1px dashed #f0f0f0',
                    }}
                  >
                    {/* <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ color: '#8c8c8c' }}>Fulfillment</Text>
                      <Text>{update.fulfillmentNo || '-'}</Text>
                    </div> */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ color: '#8c8c8c' }}>Picked By</Text>
                      <Text>{update.pickedBy || '-'}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ color: '#8c8c8c' }}>Picked Date</Text>
                      <Text>{formatDrawerDateTime(update.pickedDate)}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ color: '#8c8c8c' }}>Method</Text>
                      <Text>{update.pickupMethod || '-'}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text style={{ color: '#8c8c8c' }}>Location</Text>
                      <Text>{update.pickupLocation || '-'}</Text>
                    </div>
                  </div>
                ))}
              </>
            )}
          </Card>
        </div>

        <div style={{ padding: '0 24px 24px', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <SettingOutlined style={{ fontSize: 18, marginRight: 8, color: '#595959' }} />
            <Text strong style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Request Activity
            </Text>
          </div>

          <Card
            style={{
              backgroundColor: '#fafafa',
              border: '1px solid #f0f0f0',
              borderRadius: 8,
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <Text style={{ color: '#8c8c8c' }}>Requested By</Text>
              <Text>{detail?.requestedBy || '-'}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <Text style={{ color: '#8c8c8c' }}>Request Date</Text>
              <Text>{formatDrawerDateTime(detail?.requestDate)}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <Text style={{ color: '#8c8c8c' }}>Approved By</Text>
              <Text>{detail?.approvedBy || '-'}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <Text style={{ color: '#8c8c8c' }}>Approved At</Text>
              <Text>{formatDrawerDateTime(detail?.approvedAt)}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <Text style={{ color: '#8c8c8c' }}>Picked By</Text>
              <Text>{detail?.pickedBy || latestPickedUpdate?.pickedBy || '-'}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px' }}>
              <Text style={{ color: '#8c8c8c' }}>Picked Date</Text>
              <Text>{formatDrawerDateTime(detail?.pickedDate || latestPickedUpdate?.pickedDate || detail?.firstPickedDate)}</Text>
            </div>
          </Card>
        </div>

        <div style={{ padding: '0 24px 100px', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <FileTextOutlined style={{ fontSize: 18, marginRight: 8, color: '#595959' }} />
            <Text strong style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Additional Information
            </Text>
          </div>

          <Card
            style={{
              backgroundColor: '#fafafa',
              border: '1px solid #f0f0f0',
              borderRadius: 8,
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <Text style={{ color: '#8c8c8c' }}>Business Unit</Text>
              <Text>{detail?.businessUnit || data?.businessUnit || '-'}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <Text style={{ color: '#8c8c8c' }}>Category</Text>
              <Text>{categoryLabel}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <Text style={{ color: '#8c8c8c' }}>Line</Text>
              <Text>{lineValue}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px' }}>
              <Text style={{ color: '#8c8c8c' }}>UoM</Text>
              <Text>{detail?.requestedUom || data?.UoM || '-'}</Text>
            </div>
          </Card>
        </div>

      </Spin>

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 24px',
          backgroundColor: '#fff',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          gap: 12,
        }}
      >
        {/* <Button
          type="primary"
          size="large"
          block
          style={{
            backgroundColor: '#d4a574',
            borderColor: '#d4a574',
            flex: 2,
          }}
          onClick={onRequestParts}
        >
          Return Part
        </Button> */}
      </div>
    </Drawer>
  );
}
