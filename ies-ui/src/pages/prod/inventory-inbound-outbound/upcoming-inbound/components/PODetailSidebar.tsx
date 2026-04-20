import React from 'react';
import { Button, Descriptions, Divider, Spin, Tag, Space, Typography } from 'antd';
import { ProCard, ProTable } from '@ant-design/pro-components';
import { DrawerForm } from '@ant-design/pro-form';
import type { ProColumns } from '@ant-design/pro-table';
import type { PurchaseOrder, POItem } from '../workflow';

interface PODetailSidebarProps {
  open: boolean;
  onClose: () => void;
  po: PurchaseOrder | null;
  onCreateGR: (po: PurchaseOrder) => void;
}

const poStatusColor: Record<PurchaseOrder['status'], string> = {
  Expected: 'gold',
  Partial: 'blue',
  'Fully Received': 'success',
};

const { Text } = Typography;

export function PODetailSidebar({ open, onClose, po, onCreateGR }: PODetailSidebarProps) {
  if (!po) return null;

  const deliveryNotes = po.deliveryNoteNumber
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean) || [];

  const itemColumns: ProColumns<POItem>[] = [
    { title: 'No', render: (_: any, _r: POItem, index: number) => index + 1, width: 50 },
    { title: 'Item Code', dataIndex: 'code' },
    { title: 'Item Name', dataIndex: 'name' },
    { title: 'PO Qty', dataIndex: 'poQty', valueType: 'digit' },
    { title: 'Received', dataIndex: 'receivedQty', valueType: 'digit' },
    {
      title: 'Remaining',
      dataIndex: 'remainingQty',
      valueType: 'digit',
      render: (_: any, r: POItem) => (
        <span style={{ color: r.remainingQty > 0 ? '#1890ff' : '#52c41a', fontWeight: 600 }}>
          {r.remainingQty.toLocaleString()}
        </span>
      ),
    },
    { title: 'UoM', dataIndex: 'uom', width: 60 },
    { title: 'Supplier', dataIndex: 'supplier' },
  ];

  return (
    <DrawerForm
      title="Purchase Order Detail"
      open={open}
      onOpenChange={(v: boolean) => !v && onClose()}
      submitter={false}
      width={720}
      drawerProps={{
        destroyOnClose: true,
        bodyStyle: { paddingInline: 16, paddingTop: 16, paddingBottom: 16 },
      }}
    >
      <Spin spinning={false}>
        <ProCard bodyStyle={{ paddingInline: 8, paddingTop: 8, paddingBottom: 8 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="PO Number" style={{ fontWeight: 'bolder' }}>
              {po.poNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Supplier" style={{ fontWeight: 'bolder' }}>
              {po.supplier}
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color={po.type === 'Planned' ? 'green' : 'orange'}>{po.type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={poStatusColor[po.status]}>{po.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Expected Date">
              {po.expectedDate || 'Unplanned'}
            </Descriptions.Item>
            <Descriptions.Item label="Expected Time">
              {po.expectedTime || '—'}
            </Descriptions.Item>
            <Descriptions.Item label={`Delivery Notes For ${po.poNumber}`} span={2}>
              {deliveryNotes.length > 0 ? (
                <Space size={[8, 8]} wrap>
                  {deliveryNotes.map((deliveryNote) => (
                    <Tag key={deliveryNote} color="processing" bordered={false}>
                      {deliveryNote}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Text type="secondary">No approved delivery note yet</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Total Items">
              {po.totalItems}
            </Descriptions.Item>
            <Descriptions.Item label="Total Qty">
              {po.totalQty.toLocaleString()}
            </Descriptions.Item>
          </Descriptions>

          <Divider />
          <ProTable<POItem>
            headerTitle="PO Items"
            size="small"
            search={false}
            rowKey="code"
            dataSource={po.items}
            options={{ density: false, fullScreen: false, reload: false, setting: false }}
            pagination={false}
            columns={itemColumns}
          />

          <Divider />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="primary"
              onClick={() => onCreateGR(po)}
            >
              Create Inbound Receiving
            </Button>
          </div>
        </ProCard>
      </Spin>
    </DrawerForm>
  );
}
