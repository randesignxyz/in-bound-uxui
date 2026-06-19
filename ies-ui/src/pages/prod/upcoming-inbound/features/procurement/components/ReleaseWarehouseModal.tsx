import React, { useState } from 'react';

import { Alert, Button, Form, Input, Modal, Select, Table, Typography, Row, Col, Tag, message } from 'antd';
import { ExportOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Text, Title } = Typography;
const { TextArea } = Input;

export interface ReleaseWarehouseModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: (values: { category: string; documentRef?: string; instructions?: string }) => void;
  poData?: {
    poNumber: string;
    supplier: string;
    status: string;
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
  status: 'Rejected by QC',
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

export function ReleaseWarehouseModal({
  open,
  onClose,
  onConfirm,
  poData = defaultPoData,
}: ReleaseWarehouseModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        message.success(`Rejection cleared and items released to the warehouse queue.`);
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
      render: (text) => <code style={{ fontFamily: 'monospace', fontWeight: 600, color: '#005daa' }}>{text}</code>,
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
            Release to Warehouse
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
          icon={<ExportOutlined />}
          onClick={handleSubmit}
          style={{ background: '#266d00', borderColor: '#266d00' }}
        >
          Confirm Release
        </Button>,
      ]}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Info Summary Row */}
        <div
          style={{
            background: '#fafafa',
            border: '1px solid #f0f0f0',
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
                Current Status
              </Text>
              <div style={{ marginTop: 2 }}>
                <Tag color="error" style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {poData.status}
                </Tag>
              </div>
            </Col>
          </Row>
        </div>

        {/* Success Banner */}
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          message="Releasing clears QC rejection & pushes items back to receiving queue."
          style={{ borderRadius: 8, padding: '10px 14px' }}
        />

        {/* Form Inputs */}
        <Form form={form} layout="vertical" initialValues={{ category: '', documentRef: '', instructions: '' }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="category"
                label={<span style={{ fontWeight: 600 }}>Resolution Category <span style={{ color: '#ff4d4f' }}>*</span></span>}
                rules={[{ required: true, message: 'Please select verification category' }]}
                style={{ marginBottom: 12 }}
              >
                <Select placeholder="Select verification category...">
                  <Select.Option value="doc">Documentation Corrected</Select.Option>
                  <Select.Option value="re-inspected">Items Re-inspected</Select.Option>
                  <Select.Option value="vendor">Vendor Clarification Provided</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="documentRef"
                label={<span style={{ fontWeight: 600 }}>QC Document Reference <span style={{ color: '#bfbfbf', fontWeight: 'normal', fontSize: 11 }}>(OPTIONAL)</span></span>}
                style={{ marginBottom: 12 }}
              >
                <Input placeholder="e.g. QC-9921-REF" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="instructions"
                label={<span style={{ fontWeight: 600 }}>Warehouse Instructions</span>}
                style={{ marginBottom: 12 }}
              >
                <TextArea placeholder="Provide specific handling or storage instructions for the warehouse team..." rows={3} style={{ resize: 'none' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {/* Items to Release Table */}
        <div>
          <Title level={5} style={{ fontSize: 13, marginBottom: 6, color: '#595959', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Items to Release
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
