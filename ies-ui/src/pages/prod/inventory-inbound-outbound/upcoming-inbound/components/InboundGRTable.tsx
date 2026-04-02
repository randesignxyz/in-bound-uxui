import { useMemo, useRef } from 'react';
import { Flex, Progress, Tag } from 'antd';
import ProTable from '@ant-design/pro-table';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import {
  GoodsReceipt,
  InboundHistoryStatus,
  getGoodsReceiptWorkflowProgress,
  getInboundHistoryStatus,
  getInboundHistoryStatusColor,
  getGoodsReceiptSourceColor,
  getPOLinkStatusColor,
  getReceiptPOReferences,
  goodsReceiptSourceLabel,
  poLinkStatusLabel,
  summarizePOReferences,
  summarizeSuppliers,
} from '../workflow';

interface InboundGRTableProps {
  receipts: GoodsReceipt[];
  onViewDetail: (gr: GoodsReceipt) => void;
  typeFilter: 'ALL' | 'Planned' | 'Unplanned';
  statusFilter: 'ALL' | InboundHistoryStatus;
}

export function InboundGRTable({
  receipts,
  onViewDetail,
  typeFilter,
  statusFilter,
}: InboundGRTableProps) {
  const actionRef = useRef<ActionType>();

  const filteredReceipts = useMemo(() => {
    let data = receipts;
    if (typeFilter !== 'ALL') {
      data = data.filter((r) => r.receiptType === typeFilter);
    }
    if (statusFilter !== 'ALL') {
      data = data.filter((r) => getInboundHistoryStatus(r) === statusFilter);
    }
    return data;
  }, [receipts, typeFilter, statusFilter]);

  const columns: ProColumns<GoodsReceipt>[] = [
    {
      key: 'grNumber',
      title: 'ID',
      dataIndex: 'grNumber',
      render: (_: any, r: GoodsReceipt) => (
        <a onClick={() => onViewDetail(r)}>{r.grNumber}</a>
      ),
    },
    {
      key: 'poNumber',
      title: 'PO Reference',
      dataIndex: 'poNumber',
      renderText: (_: string, r: GoodsReceipt) =>
        getReceiptPOReferences(r).length > 0 ? summarizePOReferences(r) : undefined,
    },
    {
      key: 'receiptType',
      title: 'Type',
      dataIndex: 'receiptType',
      render: (_: any, r: GoodsReceipt) => (
        <Tag color={r.receiptType === 'Planned' ? 'green' : 'orange'}>{r.receiptType}</Tag>
      ),
    },
    {
      key: 'receiptSourceType',
      title: 'Source',
      render: (_: any, r: GoodsReceipt) => (
        <Tag color={getGoodsReceiptSourceColor(r.receiptSourceType)}>
          {goodsReceiptSourceLabel[r.receiptSourceType]}
        </Tag>
      ),
    },
    {
      key: 'poLinkStatus',
      title: 'PO Link',
      render: (_: any, r: GoodsReceipt) => (
        <Tag color={getPOLinkStatusColor(r.poLinkStatus)}>
          {poLinkStatusLabel[r.poLinkStatus]}
        </Tag>
      ),
    },
    {
      key: 'supplier',
      title: 'Supplier',
      render: (_: any, r: GoodsReceipt) => summarizeSuppliers(r),
    },
    {
      key: 'items',
      title: 'Items',
      render: (_: any, r: GoodsReceipt) => r.items.length,
    },
    {
      key: 'createdBy',
      title: 'Created By',
      dataIndex: 'createdBy',
    },
    {
      key: 'createdDate',
      title: 'Created Date',
      dataIndex: 'createdDate',
      sorter: (a: GoodsReceipt, b: GoodsReceipt) => a.createdDate.localeCompare(b.createdDate),
    },
    {
      key: 'progress',
      title: 'Progress',
      render: (_: any, r: GoodsReceipt) => {
        const pct = getGoodsReceiptWorkflowProgress(r);
        return (
          <Flex vertical gap="small" style={{ width: 100 }}>
            <Progress
              percent={pct}
              strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
              size="small"
              status="active"
            />
          </Flex>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (_: any, r: GoodsReceipt) => {
        const historyStatus = getInboundHistoryStatus(r);

        return (
          <Tag color={getInboundHistoryStatusColor(historyStatus)} bordered={false}>
            {historyStatus}
          </Tag>
        );
      },
    },
  ];

  return (
    <ProTable<GoodsReceipt>
      actionRef={actionRef}
      columns={columns}
      dataSource={filteredReceipts}
      rowKey="grNumber"
      bordered
      size="small"
      search={false}
      options={{ density: false, reload: false, setting: false }}
      pagination={{ pageSize: 10, showSizeChanger: true }}
      onRow={(record) => ({
        onClick: () => onViewDetail(record),
        style: { cursor: 'pointer' },
      })}
    />
  );
}
