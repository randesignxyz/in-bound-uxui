import React, { useState } from 'react';

import { Alert, Button, Form, Input, Modal, Select, Table, Typography, Row, Col, message } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Text, Title } = Typography;
const { TextArea } = Input;

export interface CloseRefundModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: (values: { reason: string; notes: string }) => void;
  poData?: {
    poNumber: string;
    supplier: string;
    totalValue: number;
    items: Array<{
      key: string;
      code: string;
      description: string;
      qty: number;
      unitPrice: number;
    }>;
  };
}

const defaultPoData = {
  poNumber: 'REJ-9921-A',
  supplier: 'Global Logistics Inc.',
  totalValue: 12450.00,
  items: [
    {
      key: '1',
      code: 'LG-772-X',
      description: 'Industrial Precision Bearings',
      qty: 450,
      unitPrice: 22.00,
    },
    {
      key: '2',
      code: 'LG-881-Z',
      description: 'High-Tensile Steel Cables',
      qty: 120,
      unitPrice: 15.50,
    },
  ],
};

export function CloseRefundModal({
  open,
  onClose,
  onConfirm,
  poData = defaultPoData,
}: CloseRefundModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        message.success(`Purchase Order Closed. Refund request transmitted to ${poData.supplier}`);
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
    {
      title: 'Unit Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      width: 120,
      render: (value: number) => `$${value.toFixed(2)}`,
    },
  ];

  // Calculate items subtotal
  const subtotal = poData.items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);

  return (
    <Modal
      title={
        <div style={{ padding: '8px 0 4px', borderBottom: '1px solid #f0f0f0', marginBottom: 12 }}>
          <Title level={4} style={{ margin: 0 }}>
            Close Purchase Order & Initiate Refund
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
          danger
          loading={loading}
          icon={<CheckCircleOutlined />}
          onClick={handleSubmit}
        >
          Confirm Refund & Close PO
        </Button>,
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Summary Cards Row */}
        <div
          style={{
            background: '#fafafa',
            border: '1px solid #f0f0f0',
            borderRadius: 8,
            padding: '12px 16px',
          }}
        >
          <Row gutter={24}>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}>
                PO Number
              </Text>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#262626', marginTop: 2 }}>
                {poData.poNumber}
              </div>
            </Col>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}>
                Supplier
              </Text>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#262626', marginTop: 2 }}>
                {poData.supplier}
              </div>
            </Col>
            <Col span={8}>
              <Text type="secondary" style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}>
                Total Value
              </Text>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#cf1322', marginTop: 2 }}>
                ${poData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </Col>
          </Row>
        </div>

        {/* Warning Banner */}
        <Alert
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message="Attention Required"
          description="This action will permanently cancel the PO and trigger a credit note request from the vendor. This process cannot be undone."
          style={{ borderRadius: 8 }}
        />

        {/* Form Inputs */}
        <Form form={form} layout="vertical" initialValues={{ reason: '', notes: '' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="reason"
                label={<span style={{ fontWeight: 600 }}>Reason for Refund</span>}
                rules={[{ required: true, message: 'Please select a reason' }]}
              >
                <Select placeholder="Select a reason...">
                  <Select.Option value="damaged">Damaged beyond repair</Select.Option>
                  <Select.Option value="unfulfilled">Vendor cannot fulfill</Select.Option>
                  <Select.Option value="terminated">Contract termination</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="notes"
                label={<span style={{ fontWeight: 600 }}>Documentation & Notes</span>}
              >
                <TextArea placeholder="Enter additional details for the vendor..." rows={3} />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {/* Table of Returned Items */}
        <div>
          <Title level={5} style={{ fontSize: 13, marginBottom: 8, color: '#595959', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Items Being Returned
          </Title>
          <Table
            size="small"
            columns={columns}
            dataSource={poData.items}
            pagination={false}
            bordered
            summary={() => (
              <Table.Summary.Row style={{ background: '#fafafa' }}>
                <Table.Summary.Cell index={0} colSpan={2} align="right">
                  <Text strong>Subtotal</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={2} align="right">
                  <Text strong style={{ fontSize: 15, color: '#cf1322' }}>
                    ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </div>
      </div>
    </Modal>
  );
}
