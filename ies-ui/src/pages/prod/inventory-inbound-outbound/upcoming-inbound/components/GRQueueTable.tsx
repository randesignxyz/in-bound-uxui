import { useRef, type ReactNode } from 'react';
import { Flex, Progress, Tag } from 'antd';
import ProTable from '@ant-design/pro-table';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import type { GoodsReceipt, LegacyGRStatus } from '../workflow';
import {
  getGoodsReceiptWorkflowProgress,
  getQcQueueStatus,
  getQcQueueStatusColor,
  getReceiptApprovedGrNumber,
  getReceiptIrNumber,
  getReceiptPOReferences,
  summarizePOReferences,
  summarizeSuppliers,
} from '../workflow';

interface GRQueueTableProps {
  receipts: GoodsReceipt[];
  onViewDetail: (receipt: GoodsReceipt) => void;
  headerTitle?: ReactNode;
  toolbarExtra?: ReactNode;
  statusMode?: 'legacy' | 'qc';
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
  statusMode = 'legacy',
}: GRQueueTableProps) {
  const actionRef = useRef<ActionType>();
  const toolbarContent = toolbarExtra ? [toolbarExtra] : headerTitle ? [<div key="spacer" style={{ minHeight: 32 }} />] : [];
  const showApprovedGrColumn = receipts.some((receipt) => getReceiptApprovedGrNumber(receipt));

  const columns: ProColumns<GoodsReceipt>[] = [
    {
      key: 'receivingNumber',
      title: 'IR Number',
      dataIndex: 'receivingNumber',
      render: (_: any, row: GoodsReceipt) => (
        <a onClick={() => onViewDetail(row)}>{getReceiptIrNumber(row)}</a>
      ),
    },
    ...(showApprovedGrColumn
      ? [
          {
            key: 'approvedGrNumber',
            title: 'GR Number',
            dataIndex: 'approvedGrNumber',
            render: (_: any, row: GoodsReceipt) => getReceiptApprovedGrNumber(row) || '-',
          } as ProColumns<GoodsReceipt>,
        ]
      : []),
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
      render: (_: any, row: GoodsReceipt) => {
        if (statusMode === 'qc') {
          const qcStatus = getQcQueueStatus(row);
          return (
            <Tag color={qcStatus ? getQcQueueStatusColor(qcStatus) : statusColor[row.status]} bordered={false}>
              {qcStatus || row.status}
            </Tag>
          );
        }

        return (
          <Tag color={statusColor[row.status]} bordered={false}>
            {row.status}
          </Tag>
        );
      },
    },
  ];

  return (
    <ProTable<GoodsReceipt>
      actionRef={actionRef}
      headerTitle={headerTitle}
      columns={columns}
      dataSource={receipts}
      rowKey={(record) => record.receivingNumber || record.grNumber}
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
