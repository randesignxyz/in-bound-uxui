import React, { useState } from 'react';

import { Alert, Button, Form, Input, Modal, Select, Table, Typography, Row, Col, DatePicker, message } from 'antd';
import { SyncOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Dayjs } from 'dayjs';

const { Text, Title } = Typography;
const { TextArea } = Input;

export interface ReissuePOModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: (values: { expectedDeliveryDate: Dayjs; shippingMethod: string; remarks: string }) => void;
  poData?: {
    poNumber: string;
    supplier: string;
    reason: string;
    items: Array<{
      key: string;
      code: string;
      description: string;
      qty: number;
    }>;
  };
}

const defaultPoData = {
  poNumber: 'REJ-9921-A',
  supplier: 'Global Logistics Inc.',
  reason: 'Damaged Packaging',
  items: [
    {
      key: '1',
      code: 'MOD-8821-X',
      description: 'Induction Coil L4 (Heavy Duty)',
      qty: 12,
    },
    {
      key: '2',
      code: 'CAS-1120-K',
      description: 'Thermal Casing Seal Gasket',
      qty: 240,
    },
  ],
};

export function ReissuePOModal({
  open,
  onClose,
  onConfirm,
  poData = defaultPoData,
}: ReissuePOModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        message.success(`PO successfully re-issued. Replacement PO linked to ${poData.poNumber}`);
        if (onConfirm) {
          onConfirm(values);
        }
        form.resetFields();
        onClose();
      }, 1200);
    } catch (error) {
      // Validation error
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Item Code',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (text) => <code style={{ fontFamily: 'monospace', fontWeight: 600 }}>{text}</code>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      key: 'qty',
      align: 'right',
      width: 100,
      render: (value: number) => value.toLocaleString(),
    },
  ];

  return (
    <Modal
      title={
        <div style={{ padding: '8px 0 4px', borderBottom: '1px solid #f0f0f0', marginBottom: 12 }}>
          <Title level={4} style={{ margin: 0 }}>
            Re-issue Purchase Order
          </Title>
        </div>
      }
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      width={720}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          loading={loading}
          icon={<SyncOutlined />}
          onClick={handleSubmit}
        >
          Confirm Re-issue
        </Button>,
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* PO Summary Card */}
        <div
          style={{
            background: '#f5f7fa',
            border: '1px solid #e8e8e8',
            borderRadius: 8,
            padding: '10px 16px',
          }}
        >
          <Row gutter={24}>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>
                PO Number
              </Text>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#262626', marginTop: 2 }}>
                {poData.poNumber}
              </div>
            </Col>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>
                Supplier
              </Text>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#262626', marginTop: 2 }}>
                {poData.supplier}
              </div>
            </Col>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>
                Reason
              </Text>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#795900', marginTop: 2 }}>
                {poData.reason}
              </div>
            </Col>
          </Row>
        </div>

        {/* Info Alert */}
        <Alert
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          message="Re-issuing cancels current PO & generates a linked 0-cost replacement PO."
          style={{ borderRadius: 8, padding: '10px 14px' }}
        />

        {/* Form Section */}
        <Form form={form} layout="vertical" initialValues={{ shippingMethod: 'Standard', remarks: '' }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="expectedDeliveryDate"
                label={<span style={{ fontWeight: 600 }}>New Expected Delivery Date</span>}
                rules={[{ required: true, message: 'Please pick expected delivery date' }]}
                style={{ marginBottom: 12 }}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="shippingMethod"
                label={<span style={{ fontWeight: 600 }}>Shipping Method</span>}
                rules={[{ required: true, message: 'Please select a shipping method' }]}
                style={{ marginBottom: 12 }}
              >
                <Select placeholder="Select shipping method">
                  <Select.Option value="Standard">Standard</Select.Option>
                  <Select.Option value="Express">Express</Select.Option>
                  <Select.Option value="Vendor Pickup">Vendor Pickup</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="remarks"
                label={<span style={{ fontWeight: 600 }}>Internal Remarks</span>}
                style={{ marginBottom: 12 }}
              >
                <TextArea placeholder="Add specific instructions for the replacement..." rows={3} style={{ resize: 'none' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {/* Replaced Items Table */}
        <div>
          <Title level={5} style={{ fontSize: 13, marginBottom: 6, color: '#595959', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Items Being Replaced
          </Title>
          <Table
            size="small"
            columns={columns}
            dataSource={poData.items}
            pagination={false}
            bordered
          />
        </div>
      </div>
    </Modal>
  );
}
