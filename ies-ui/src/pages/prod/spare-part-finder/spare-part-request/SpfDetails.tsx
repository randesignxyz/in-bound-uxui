import { Drawer, Badge, Card, Button, Space, Divider, Typography, Row, Col } from "antd";
import { 
  InboxOutlined, 
  SettingOutlined, 
  FileTextOutlined
} from "@ant-design/icons";
import SparePartImage from './SparePartImage';

const { Title, Text } = Typography;

interface DrawerViewItemProps {
  open: boolean;
  data?: any;
  onClose?: () => void;
  onRequestParts?: () => void;
  onInventoryLog?: () => void;
}

export default function SpfDetails({ 
  open, 
  data, 
  onClose, 
  onRequestParts,
  onInventoryLog 
}: DrawerViewItemProps) {
  
  // Determine stock status
  const isInStock = data?.stock_quantity > 0;
  
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
        backgroundColor: '#fff', 
        padding: '24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300
      }}>
        <SparePartImage
          imageId={data?.imageId}
          src={data?.image}
          alt={data?.spare_part_name || data?.part_number}
          size={280}
        />
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
          {data?.spare_part_name || "Heavy Duty Hydraulic Control Valve"}
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
            {data?.description || "Precision-engineered hydraulic control valve designed for high-pressure industrial applications. Featuring a high-flow capacity with minimal leakage, optimized for heavy-duty earthmoving equipment and stationary industrial machinery."}
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
                {data?.receiving_from_warehouse || data?.warehouse || '-'}
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
                Zone
              </Text>
              <Text strong style={{ fontSize: 16 }}>
                {data?.zone || '-'}
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
                Shelf
              </Text>
              <Text strong style={{ fontSize: 16 }}>
                {data?.shelf || '-'}
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
                Level
              </Text>
              <Text strong style={{ fontSize: 16 }}>
                {data?.level || '-'}
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
            <Text>{data?.receiving_from_warehouse || "MRO-W"}</Text>
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
          size="large"
          block
          style={{ 
            backgroundColor: '#d4a574', 
            borderColor: '#d4a574',
            flex: 2
          }}
          onClick={onRequestParts}
        >
          Request Parts
        </Button>
      </div>
    </Drawer>
  );
}
