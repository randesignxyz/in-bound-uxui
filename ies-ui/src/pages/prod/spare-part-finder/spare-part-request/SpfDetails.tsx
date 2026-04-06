import { Alert, Badge, Button, Card, Col, Drawer, Row, Skeleton, Typography } from "antd";
import { 
  InboxOutlined, 
  SettingOutlined, 
  FileTextOutlined
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from 'react';
import SparePartImage from './SparePartImage';
import { formatSpfDateTime } from '../shared/dateTime';

const { Title, Text } = Typography;
const LOW_STOCK_THRESHOLD = 5;
const OUT_OF_STOCK_THRESHOLD = 0;

interface DrawerViewItemProps {
  open: boolean;
  data?: any;
  loading?: boolean;
  error?: string | null;
  onClose?: () => void;
  onRequestParts?: () => void;
  onInventoryLog?: () => void;
  EditImage?: () => void;
}

type DetailLocation = {
  warehouseCode?: string;
  warehouseName?: string;
  level?: string;
  shelve?: string;
  rack?: string;
  bin?: string;
  onHandQty?: number;
  reservedQty?: number;
  availableQty?: number;
  reorderLevel?: number;
  lastSyncedAt?: string;
};

const getStockBadge = (availableStock: number) => {
  if (availableStock <= OUT_OF_STOCK_THRESHOLD) {
    return { label: 'Out of Stock', status: 'error' as const, color: '#ff4d4f' };
  }

  if (availableStock <= LOW_STOCK_THRESHOLD) {
    return { label: 'Low Stock', status: 'warning' as const, color: '#faad14' };
  }

  return { label: 'Available', status: 'success' as const, color: '#52c41a' };
};

export default function SpfDetails({ 
  open, 
  data, 
  loading = false,
  error = null,
  onClose, 
  onRequestParts,
  onInventoryLog,
  EditImage
}: DrawerViewItemProps) {
  const imageIds: string[] = Array.isArray(data?.imageId) ? data.imageId.filter(Boolean) : [];
  const locations: DetailLocation[] = Array.isArray(data?.locations) ? data.locations : [];
  const firstLocation = locations[0];
  const firstImageId = imageIds[0];
  const [selectedImageId, setSelectedImageId] = useState<string | undefined>(firstImageId);
  const hasLiveData = Boolean(
    data &&
      (
        data?.spare_part_name ||
        data?.part_number ||
        data?.description ||
        data?.updated_date ||
        data?.requested_date ||
        imageIds.length > 0 ||
        locations.length > 0
      ),
  );

  useEffect(() => {
    setSelectedImageId(firstImageId);
  }, [firstImageId, open]);

  const mainImageId = useMemo(
    () => selectedImageId || firstImageId,
    [selectedImageId, firstImageId],
  );
  const availableStock = hasLiveData
    ? Number(data?.stock_quantity ?? firstLocation?.availableQty ?? 0)
    : undefined;
  const normalizedAvailableStock =
    typeof availableStock === 'number' && Number.isFinite(availableStock) ? availableStock : null;
  const stockBadge = normalizedAvailableStock == null ? null : getStockBadge(normalizedAvailableStock);
  const displayCategory =
    typeof data?.category === 'object' ? data?.category?.category_name || '-' : data?.category || '-';
  const displayPartNumber = data?.part_number || '-';
  const displayWarehouse =
    firstLocation?.warehouseCode ||
    firstLocation?.warehouseName ||
    data?.receiving_from_warehouse ||
    data?.warehouse ||
    '-';
  const lastUpdated =
    data?.updated_date ||
    firstLocation?.lastSyncedAt ||
    data?.requested_date;
  
  return (
    <Drawer
      width={480}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Product Details</span>
          {/* <Button type="link" style={{ color: '#d4a574' }}>
            Edit Info
          </Button> */}
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      bodyStyle={{ padding: 0, backgroundColor: '#fafafa' }}
      headerStyle={{ borderBottom: '1px solid #f0f0f0' }}
    >
      {loading ? (
        <div style={{ padding: 24, backgroundColor: '#fff' }}>
          <Skeleton active avatar paragraph={{ rows: 10 }} />
        </div>
      ) : error ? (
        <div style={{ padding: 24, backgroundColor: '#fff' }}>
          <Alert
            type="error"
            showIcon
            message="Unable to load product details"
            description={error}
          />
        </div>
      ) : !hasLiveData ? (
        <div style={{ padding: 24, backgroundColor: '#fff' }}>
          <Skeleton active avatar paragraph={{ rows: 10 }} />
        </div>
      ) : (
        <>
      {/* Product Image */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '0px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300
      }}>
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
            <SparePartImage
              imageId={mainImageId}
              alt={data?.spare_part_name || data?.part_number}
              size={280}
            />

            {imageIds.length > 1 && (
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  gap: 10,
                  flexWrap: 'wrap',
                  paddingLeft: '24px',
                  justifyContent: 'start',
                }}
              >
                {imageIds.map((id, index) => {
                  const isActive = id === mainImageId;
                  return (
                    <button
                      key={`${id}-${index}`}
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
                      <SparePartImage
                        imageId={id}
                        alt={data?.spare_part_name || data?.part_number}
                        size={64}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <SparePartImage
            imageId={data?.imageId}
            src={data?.image}
            alt={data?.spare_part_name || data?.part_number}
            size={280}
          />
        )}
      </div>

      {/* Product Info Section */}
      <div style={{ padding: '24px', backgroundColor: '#fff' }}>
        {/* Stock Status Badge */}
        {stockBadge ? (
          <Badge 
            status={stockBadge.status} 
            text={
              <Text style={{ color: stockBadge.color, fontWeight: 500 }}>
                {stockBadge.label}
              </Text>
            }
            style={{ marginBottom: 16, display: 'block' }}
          />
        ) : null}

        {/* Product Name */}
        <Title level={4} style={{ margin: '0 0 16px 0', fontWeight: 600 }}>
          {data?.spare_part_name || '-'}
        </Title>

        {/* Part Number */}
        <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 24 }}>
          {displayPartNumber}
        </Text>

        {/* Description Section */}
        <div style={{ marginBottom: 24 }}>
          <Text type="secondary" style={{ 
            fontSize: 12, 
            textTransform: 'uppercase', 
            letterSpacing: 1,
            display: 'block',
            marginBottom: 8
          }}>
            Description
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 1.6, color: '#595959' }}>
            {data?.description || '-'}
          </Text>
        </div>
      </div>

      {/* Stock Availability Card */}
      <div style={{ padding: '0 24px 24px', backgroundColor: '#fff' }}>
        <Card 
          style={{ 
            backgroundColor: '#fafafa', 
            border: '1px solid #f0f0f0',
            borderRadius: 8
          }}
          bodyStyle={{ padding: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <InboxOutlined style={{ fontSize: 18, marginRight: 8, color: '#595959' }} />
            <Text strong style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Stock Availability
            </Text>
          </div>

          {/* Total Quantity */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: '1px solid #e8e8e8'
          }}>
              <Text style={{ color: '#8c8c8c' }}>Total Quantity</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Text style={{ 
                fontSize: 32, 
                fontWeight: 700, 
                color: '#d4a574',
                lineHeight: 1
              }}>
                {normalizedAvailableStock ?? '-'}
              </Text>
              <Text style={{ color: '#8c8c8c' }}>{data?.uom || '-'}</Text>
              {stockBadge ? <Badge status={stockBadge.status} text={stockBadge.label} /> : null}
            </div>
          </div>

          {/* Location Grid */}
          <Row gutter={24} style={{ textAlign: 'center' }}>
             <Col span={6}>
              <Text style={{ 
                fontSize: 11, 
                color: '#8c8c8c', 
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 4
              }}>
                Warehouse
              </Text>
              <Text strong style={{ fontSize: 16 }}>
                {displayWarehouse}
              </Text>
            </Col>
            <Col span={6}>
            
              <Text style={{ 
                fontSize: 11, 
                color: '#8c8c8c', 
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 4
              }}>
                Rack
              </Text>
              <Text strong style={{ fontSize: 16 }}>
                {firstLocation?.rack || '-'}
              </Text>
            </Col>
            <Col span={6} style={{ borderLeft: '1px solid #e8e8e8', borderRight: '1px solid #e8e8e8' }}>
              <Text style={{ 
                fontSize: 11, 
                color: '#8c8c8c', 
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 4
              }}>
                Shelve
              </Text>
              <Text strong style={{ fontSize: 16 }}>
                {firstLocation?.shelve || '-'}
              </Text>
            </Col>
            <Col span={6}>
              <Text style={{ 
                fontSize: 11, 
                color: '#8c8c8c', 
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 4
              }}>
                Bin
              </Text>
              <Text strong style={{ fontSize: 16 }}>
                {firstLocation?.bin || '-'}
              </Text>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Technical Specifications */}
      <div style={{ padding: '0 24px 24px', backgroundColor: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <SettingOutlined style={{ fontSize: 18, marginRight: 8, color: '#595959' }} />
          <Text strong style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Technical Specifications
          </Text>
        </div>

        <Card 
          style={{ 
            backgroundColor: '#fafafa', 
            border: '1px solid #f0f0f0',
            borderRadius: 8
          }}
          bodyStyle={{ padding: 0 }}
        >
          {/* <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <Text style={{ color: '#8c8c8c' }}>Company</Text>
            <Text>{data?.company || "Isobaric Valve Co."}</Text>
          </div> */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <Text style={{ color: '#8c8c8c' }}>Category</Text>
            <Text>{displayCategory}</Text>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <Text style={{ color: '#8c8c8c' }}>UOM</Text>
            <Text>{data?.uom || '-'}</Text>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '16px 20px'
          }}>
            <Text style={{ color: '#8c8c8c' }}>Warehouse</Text>
            <Text>{displayWarehouse}</Text>
          </div>
        </Card>
      </div>
      {/* Additional Info */}
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
            borderRadius: 8
          }}
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <Text style={{ color: '#8c8c8c' }}>Business Unit</Text>
            <Text>{data?.business_unit || '-'}</Text>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <Text style={{ color: '#8c8c8c' }}>Created At</Text>
            <Text>{formatSpfDateTime(data?.requested_date)}</Text>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <Text style={{ color: '#8c8c8c' }}>Last Updated</Text>
            <Text>{formatSpfDateTime(lastUpdated)}</Text>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '16px 20px'
          }}>
            <Text style={{ color: '#8c8c8c' }}>Pickup Date</Text>
            <Text>{formatSpfDateTime(data?.requested_pickup_date)}</Text>
          </div>
        </Card>
      </div>

      {/* Footer Actions */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 24px',
        backgroundColor: '#fff',
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        gap: 12
      }}>
        <Button 
          type="primary"
          block
          disabled={!onRequestParts}
          style={{ 
            flex: 2
          }}
          onClick={onRequestParts}
        >
          Request Parts
        </Button>
         <Button         
          onClick={EditImage}
        >
          Edit
        </Button>
      </div>
        </>
      )}
    </Drawer>
  );
}
