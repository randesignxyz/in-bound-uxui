import { useRef, type ReactNode } from 'react';
import { Flex, Progress, Tag } from 'antd';
import ProTable from '@ant-design/pro-table';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import type { GoodsReceipt, LegacyGRStatus } from '../workflow';
import {
  getGoodsReceiptWorkflowProgress,
  getGoodsReceiptSourceColor,
  getPOLinkStatusColor,
  getReceiptPOReferences,
  goodsReceiptSourceLabel,
  poLinkStatusLabel,
  summarizePOReferences,
  summarizeSuppliers,
} from '../workflow';

interface GRQueueTableProps {
  receipts: GoodsReceipt[];
  onViewDetail: (receipt: GoodsReceipt) => void;
  headerTitle?: ReactNode;
  toolbarExtra?: ReactNode;
}

const statusColor: Record<LegacyGRStatus, string> = {
  Draft: 'default',
  'Pending Approval': 'gold',
  Approved: 'green',
  Posted: 'blue',
  Merged: 'cyan',
  'Correction Required': 'red',
};

export function GRQueueTable({
  receipts,
  onViewDetail,
  headerTitle,
  toolbarExtra,
}: GRQueueTableProps) {
  const actionRef = useRef<ActionType>();
  const toolbarContent = toolbarExtra ? [toolbarExtra] : headerTitle ? [<div key="spacer" style={{ minHeight: 32 }} />] : [];

  const columns: ProColumns<GoodsReceipt>[] = [
    {
      key: 'grNumber',
      title: 'GR Number',
      dataIndex: 'grNumber',
      render: (_: any, row: GoodsReceipt) => <a onClick={() => onViewDetail(row)}>{row.grNumber}</a>,
    },
    {
      key: 'poNumber',
      title: 'PO Reference',
      dataIndex: 'poNumber',
      renderText: (_: string, row: GoodsReceipt) =>
        getReceiptPOReferences(row).length > 0 ? summarizePOReferences(row) : undefined,
    },
    {
      key: 'supplier',
      title: 'Supplier',
      render: (_: any, row: GoodsReceipt) => summarizeSuppliers(row),
      ellipsis: true,
    },
    {
      key: 'receiptType',
      title: 'Type',
      dataIndex: 'receiptType',
      render: (_: any, row: GoodsReceipt) => (
        <Tag color={row.receiptType === 'Planned' ? 'green' : 'orange'}>{row.receiptType}</Tag>
      ),
    },
    {
      key: 'source',
      title: 'Source',
      render: (_: any, row: GoodsReceipt) => (
        <Tag color={getGoodsReceiptSourceColor(row.receiptSourceType)}>
          {goodsReceiptSourceLabel[row.receiptSourceType]}
        </Tag>
      ),
    },
    {
      key: 'poLinkStatus',
      title: 'PO Link',
      render: (_: any, row: GoodsReceipt) => (
        <Tag color={getPOLinkStatusColor(row.poLinkStatus)}>
          {poLinkStatusLabel[row.poLinkStatus]}
        </Tag>
      ),
    },
    {
      key: 'expectedDate',
      title: 'Expected Date',
      render: (_: any, row: GoodsReceipt) =>
        row.expectedDate ? `${row.expectedDate} ${row.expectedTime || ''}`.trim() : 'Unplanned',
    },
    {
      key: 'items',
      title: 'Items',
      render: (_: any, row: GoodsReceipt) => row.items.length,
    },
    {
      key: 'createdBy',
      title: 'Submitted By',
      dataIndex: 'createdBy',
    },
    {
      key: 'createdDate',
      title: 'Submitted Date',
      dataIndex: 'createdDate',
      sorter: (a: GoodsReceipt, b: GoodsReceipt) => a.createdDate.localeCompare(b.createdDate),
    },
    {
      key: 'progress',
      title: 'Progress',
      render: (_: any, row: GoodsReceipt) => {
        const percent = getGoodsReceiptWorkflowProgress(row);
        return (
          <Flex vertical gap="small" style={{ width: 100 }}>
            <Progress
              percent={percent}
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
      render: (_: any, row: GoodsReceipt) => (
        <Tag color={statusColor[row.status]} bordered={false}>
          {row.status}
        </Tag>
      ),
    },
  ];

  return (
    <ProTable<GoodsReceipt>
      actionRef={actionRef}
      headerTitle={headerTitle}
      columns={columns}
      dataSource={receipts}
      rowKey="grNumber"
      bordered
      size="small"
      search={false}
      options={{ density: false, setting: false }}
      toolBarRender={() => toolbarContent}
      pagination={{ pageSize: 10, showSizeChanger: true }}
      onRow={(record) => ({
        onClick: () => onViewDetail(record),
        style: { cursor: 'pointer' },
      })}
    />
  );
}
