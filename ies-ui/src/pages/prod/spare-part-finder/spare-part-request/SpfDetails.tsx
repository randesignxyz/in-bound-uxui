import { Drawer, Badge, Card, Button, Typography, Row, Col } from "antd";
import { 
  InboxOutlined, 
  SettingOutlined, 
  FileTextOutlined
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from 'react';
import SparePartImage from './SparePartImage';

const { Title, Text } = Typography;

interface DrawerViewItemProps {
  open: boolean;
  data?: any;
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
};

export default function SpfDetails({ 
  open, 
  data, 
  onClose, 
  onRequestParts,
  onInventoryLog,
  EditImage
}: DrawerViewItemProps) {
  
  // Determine stock status
  const isInStock = data?.stock_quantity > 0;
  const imageIds: string[] = Array.isArray(data?.imageId) ? data.imageId.filter(Boolean) : [];
  const locations: DetailLocation[] = Array.isArray(data?.locations) ? data.locations : [];
  const firstLocation = locations[0];
  const firstImageId = imageIds[0];
  const [selectedImageId, setSelectedImageId] = useState<string | undefined>(firstImageId);

  useEffect(() => {
    setSelectedImageId(firstImageId);
  }, [firstImageId, open]);

  const mainImageId = useMemo(
    () => selectedImageId || firstImageId,
    [selectedImageId, firstImageId],
  );
  
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
        <Badge 
          status={isInStock ? "success" : "error"} 
          text={
            <Text style={{ color: isInStock ? '#52c41a' : '#ff4d4f', fontWeight: 500 }}>
              {isInStock ? "In Stock" : "Out of Stock"}
            </Text>
          }
          style={{ marginBottom: 16, display: 'block' }}
        />

        {/* Product Name */}
        <Title level={4} style={{ margin: '0 0 16px 0', fontWeight: 600 }}>
          {data?.spare_part_name || '-'}
        </Title>

        {/* Part Number */}
        <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 24 }}>
          {data?.part_number}
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
            <div>
              <Text style={{ 
                fontSize: 32, 
                fontWeight: 700, 
                color: '#d4a574',
                lineHeight: 1
              }}>
                {data?.stock_quantity || 24}
              </Text>
              <Text style={{ marginLeft: 4, color: '#8c8c8c' }}>Units</Text>
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
                {firstLocation?.warehouseCode || data?.receiving_from_warehouse || data?.warehouse || '-'}
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
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <Text style={{ color: '#8c8c8c' }}>Company</Text>
            <Text>{data?.company || "Isobaric Valve Co."}</Text>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <Text style={{ color: '#8c8c8c' }}>Category</Text>
            <Text>{data?.category || "Hydraulic"}</Text>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <Text style={{ color: '#8c8c8c' }}>Type</Text>
            <Text>{data?.spare_part_type || "Control Valve"}</Text>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '16px 20px'
          }}>
            <Text style={{ color: '#8c8c8c' }}>Warehouse</Text>
            <Text>{firstLocation?.warehouseCode || data?.receiving_from_warehouse || "MRO-W"}</Text>
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
            <Text>{data?.business_unit || "BU-001"}</Text>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <Text style={{ color: '#8c8c8c' }}>Requested Date</Text>
            <Text>{data?.requested_date || "2024-01-15"}</Text>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '16px 20px'
          }}>
            <Text style={{ color: '#8c8c8c' }}>Pickup Date</Text>
            <Text>{data?.requested_pickup_date || "2024-01-20"}</Text>
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
    </Drawer>
  );
}
