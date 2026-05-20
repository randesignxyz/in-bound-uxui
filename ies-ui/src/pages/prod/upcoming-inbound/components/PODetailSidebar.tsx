import React, { useEffect, useState } from 'react';
import { Button, Descriptions, Divider, Spin, Tag, Space, Typography } from 'antd';
import { ProCard, ProTable } from '@ant-design/pro-components';
import { DrawerForm } from '@ant-design/pro-form';
import type { ProColumns } from '@ant-design/pro-table';
import { ExportOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { PurchaseOrder, POItem } from '../workflow';
import type { InboundWarehouseMasterApi } from '../data';

interface PODetailSidebarProps {
  open: boolean;
  onClose: () => void;
  po: PurchaseOrder | null;
  onCreateGR: (po: PurchaseOrder) => void;
  onOpenReceiptInNewTab: (receiptId: number) => void;
  warehouseOptions?: InboundWarehouseMasterApi[];
}

const { Text } = Typography;
const prProcessPathPrefix = '/external/data-form/requisition_request_process/';

function getReceiptLogStatusColor(statusLabel: string) {
  if (statusLabel.includes('Rejected')) return 'error';
  if (statusLabel.includes('Pending')) return 'warning';
  if (statusLabel.includes('Approved')) return 'success';
  if (statusLabel.includes('Draft')) return 'default';
  return 'processing';
}

function getReceiptItemLabel(name: string, code: string) {
  return name?.trim() || code?.trim() || 'Item';
}

function isAgingPOItem(item: POItem, poExpectedDate?: string) {
  if (typeof item.isAging === 'boolean') return item.isAging;
  const expectedDate = item.expectedDate || poExpectedDate;
  if (!expectedDate || item.remainingQty <= 0) return false;
  return dayjs(expectedDate).isValid() && dayjs(expectedDate).isBefore(dayjs(), 'day');
}

export function PODetailSidebar({
  open,
  onClose,
  po,
  onCreateGR,
  onOpenReceiptInNewTab,
  warehouseOptions = [],
}: PODetailSidebarProps) {
  const [drawerOpen, setDrawerOpen] = useState(open);
  const [renderedPO, setRenderedPO] = useState<PurchaseOrder | null>(po);

  useEffect(() => {
    if (po) {
      setRenderedPO(po);
    }
    setDrawerOpen(open);
  }, [open, po]);

  const currentPO = po || renderedPO;
  const receiptLogs = currentPO?.receiptLogs || [];
  const linkedReceiptLogs = receiptLogs.filter((log, index, logs) =>
    typeof log.receiptId === 'number' &&
    logs.findIndex((candidate) => candidate.receiptId === log.receiptId) === index,
  );

  if (!currentPO) return null;

  const deliveryNotes = currentPO.deliveryNoteNumber
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean) || [];
  const prLinks = currentPO.prLinks || [];
  const poBusinessUnit = currentPO.businessUnit?.trim().toUpperCase();
  const receiverWarehouses = warehouseOptions
    .filter((warehouse) => {
      const warehouseBusinessUnit = warehouse.business_unit?.trim().toUpperCase();
      return !poBusinessUnit || !warehouseBusinessUnit || warehouseBusinessUnit === poBusinessUnit;
    })
    .map((warehouse) => warehouse.warehouse_code?.trim())
    .filter((warehouseCode): warehouseCode is string => Boolean(warehouseCode));

  const itemColumns: ProColumns<POItem>[] = [
    { title: 'No', render: (_: any, _r: POItem, index: number) => index + 1, width: 50 },
    { title: 'Item Code', dataIndex: 'code' },
    {
      title: 'Item Name',
      dataIndex: 'name',
      render: (_: any, r: POItem) => (
        <Space size={6} wrap>
          <span>{r.name}</span>
          {isAgingPOItem(r, currentPO.expectedDate) && (
            <Tag color="error" bordered={false}>
              Aging
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Expected',
      dataIndex: 'expectedDate',
      width: 112,
      render: (_: any, r: POItem) => {
        const expectedDate = r.expectedDate || currentPO.expectedDate || '-';
        return (
          <Space size={4} direction="vertical">
            <span>{expectedDate}</span>
          </Space>
        );
      },
    },
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
      open={drawerOpen}
      onOpenChange={(visible: boolean) => setDrawerOpen(visible)}
      submitter={false}
      width={880}
      drawerProps={{
        destroyOnClose: false,
        extra: (
          <Button
            type="primary"
            onClick={() => onCreateGR(currentPO)}
          >
            Create Inbound Receiving
          </Button>
        ),
        afterOpenChange: (visible) => {
          if (!visible) {
            onClose();
            setRenderedPO(null);
          }
        },
        bodyStyle: {
          paddingInline: 16,
          paddingTop: 16,
          paddingBottom: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', minHeight: 0 }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 16 }}>
          <Spin spinning={false}>
            <ProCard bodyStyle={{ paddingInline: 8, paddingTop: 8, paddingBottom: 8 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="PO Number" style={{ fontWeight: 'bolder' }}>
              {currentPO.poNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Supplier" style={{ fontWeight: 'bolder' }}>
              {currentPO.supplier}
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color={currentPO.type === 'Planned' ? 'green' : 'orange'}>{currentPO.type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="SAP PO Status">
              <Tag color={currentPO.docStatus?.toLowerCase() === 'closed' ? 'success' : 'processing'}>
                {currentPO.docStatus || 'Open'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Receiver Warehouse">
              {receiverWarehouses.length > 0 ? (
                <Space size={[6, 6]} wrap>
                  {receiverWarehouses.map((warehouseCode) => (
                    <Tag key={warehouseCode} bordered={false}>
                      {warehouseCode}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Text type="secondary">Selected when creating IR</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Expected Date">
              {currentPO.expectedDate || 'Unplanned'}
            </Descriptions.Item>
            <Descriptions.Item label="Expected Time">
              {currentPO.expectedTime || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Linked PR" span={2}>
              {prLinks.length > 0 ? (
                <Space size={[8, 8]} wrap>
                  {prLinks.map((link) => {
                    const prHref = link.prUuid ? `${prProcessPathPrefix}${link.prUuid}` : undefined;
                    return (
                      <Tag key={link.prNumber} color="cyan" bordered={false}>
                        {prHref ? (
                          <a href={prHref} target="_blank" rel="noreferrer">
                            {link.prNumber}
                          </a>
                        ) : (
                          link.prNumber
                        )}
                      </Tag>
                    );
                  })}
                </Space>
              ) : (
                <Text type="secondary">No linked PR from SAP</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Delivery Note" span={2}>
              {deliveryNotes.length > 0 ? (
                <Space size={[8, 8]} wrap>
                  {deliveryNotes.map((deliveryNote) => (
                    <Tag key={deliveryNote} color="processing" bordered={false}>
                      {deliveryNote}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Text type="secondary">-</Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Total Items">
              {currentPO.totalItems}
            </Descriptions.Item>
            <Descriptions.Item label="Total Qty">
              {currentPO.totalQty.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Link IR" span={2}>
              {linkedReceiptLogs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {linkedReceiptLogs.map((log) => (
                    <Button
                      key={`linked-ir-${log.receiptId}`}
                      type="link"
                      icon={<ExportOutlined />}
                      style={{ paddingInline: 0, justifyContent: 'flex-start', width: 'fit-content' }}
                      onClick={() => {
                        if (typeof log.receiptId === 'number') {
                          onOpenReceiptInNewTab(log.receiptId);
                        }
                      }}
                    >
                      {log.receivingNumber}
                    </Button>
                  ))}
                </div>
              ) : (
                <Text type="secondary">-</Text>
              )}
            </Descriptions.Item>
          </Descriptions>

          <Divider />
          <ProTable<POItem>
            headerTitle="PO Items"
            size="small"
            search={false}
            rowKey={(item) => `${item.lineNumber ?? item.code}-${item.code}`}
            dataSource={currentPO.items}
            options={{ density: false, fullScreen: false, reload: false, setting: false }}
            pagination={false}
            columns={itemColumns}
          />

          <Divider />
          <div style={{ marginBottom: 12 }}>
            <Text strong>Inbound Updates</Text>
          </div>
          {receiptLogs.length > 0 ? (
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {receiptLogs.map((log) => (
                <ProCard
                  key={log.receivingNumber}
                  bordered
                  bodyStyle={{ padding: 12 }}
                  style={{ background: '#fafafa' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <Space wrap size={[8, 8]}>
                      <Text strong>{log.receivingNumber}</Text>
                      <Tag color={getReceiptLogStatusColor(log.statusLabel)}>{log.statusLabel}</Tag>
                    </Space>
                    <Text type="secondary">
                      {log.receivedBy ? `Received by ${log.receivedBy}` : 'Warehouse received'}
                      {log.receivedAt ? ` • ${log.receivedAt}` : ''}
                    </Text>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text>Total received: {log.totalReceivedQty.toLocaleString()} qty</Text>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <Text strong>Received items</Text>
                    <div style={{ marginTop: 6 }}>
                      <Space size={[6, 6]} wrap>
                        {log.receivedItems.map((item) => (
                          <Tag key={`received-${log.receivingNumber}-${item.code}-${item.qty}`} color="processing">
                            {getReceiptItemLabel(item.name, item.code)} x{item.qty}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  </div>
                  {log.approvedItems.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <Text strong>Approved to supervisor</Text>
                      <div style={{ marginTop: 6 }}>
                        <Space size={[6, 6]} wrap>
                          {log.approvedItems.map((item) => (
                            <Tag key={`approved-${log.receivingNumber}-${item.code}-${item.qty}`} color="success">
                              {getReceiptItemLabel(item.name, item.code)} x{item.qty}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    </div>
                  )}
                  {log.rejectedItems.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <Text strong>Returned / rejected</Text>
                      <div style={{ marginTop: 6 }}>
                        <Space size={[6, 6]} wrap>
                          {log.rejectedItems.map((item) => (
                            <Tag key={`rejected-${log.receivingNumber}-${item.code}-${item.qty}`} color="error">
                              {getReceiptItemLabel(item.name, item.code)} x{item.qty}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    </div>
                  )}
                </ProCard>
              ))}
            </Space>
          ) : (
            <Text type="secondary">No inbound activity has been recorded for this PO yet.</Text>
          )}

            </ProCard>
          </Spin>
        </div>
      </div>
    </DrawerForm>
  );
}
