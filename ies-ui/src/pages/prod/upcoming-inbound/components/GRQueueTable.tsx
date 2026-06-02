import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Badge, Tag, Typography } from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import { type ReactNode } from 'react';
import type { GoodsReceipt, LegacyGRStatus } from '../workflow';
import {
  getQcQueueStatus,
  getQcQueueStatusColor,
  getReceiptApprovedGrNumber,
  getReceiptDisplayStatusColor,
  getReceiptIrNumber,
  getReceiptPOReferences,
  getReceiptSapStatus,
  summarizePOReferences,
  summarizeSuppliers,
} from '../workflow';

const { Text } = Typography;

interface GRQueueTableProps {
  receipts: GoodsReceipt[];
  onViewDetail: (receipt: GoodsReceipt) => void;
  headerTitle?: ReactNode;
  toolbarExtra?: ReactNode;
  statusMode?: 'legacy' | 'qc';
  shouldShowNotificationBadge?: (receipt: GoodsReceipt) => boolean;
  pagination?: TablePaginationConfig;
}

const statusColor: Record<LegacyGRStatus, string> = {
  Draft: 'default',
  'Pending Approval': 'gold',
  Approved: 'green',
  'Ready To Post SAP': 'blue',
  Posted: 'blue',
  'Correction Required': 'red',
};

export function GRQueueTable({
  receipts,
  onViewDetail,
  headerTitle,
  toolbarExtra,
  statusMode = 'legacy',
  shouldShowNotificationBadge,
  pagination,
}: GRQueueTableProps) {
  const toolbarContent = toolbarExtra
    ? [toolbarExtra]
    : headerTitle
    ? [<div key="spacer" style={{ minHeight: 32 }} />]
    : [];
  const showApprovedGrColumn = receipts.some((receipt) => getReceiptApprovedGrNumber(receipt));

  const columns: ProColumns<GoodsReceipt>[] = [
    {
      key: 'receivingNumber',
      title: 'IR Number',
      dataIndex: 'receivingNumber',
      render: (_: any, row: GoodsReceipt) => {
        const shouldShowQcBadge =
          typeof shouldShowNotificationBadge === 'function'
            ? shouldShowNotificationBadge(row)
            : statusMode === 'qc' && row.items.some((item) => !item.qcDecision);

        return (
          <Badge dot={shouldShowQcBadge} color="#faad14" offset={[4, 2]}>
            <a onClick={() => onViewDetail(row)}>{getReceiptIrNumber(row)}</a>
          </Badge>
        );
      },
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
      render: (_: ReactNode, row: GoodsReceipt) =>
        getReceiptPOReferences(row).length > 0 ? (
          summarizePOReferences(row)
        ) : (
          <Text style={{ color: '#ff4d4f', fontWeight: 600, fontSize: '110%' }}>No PO</Text>
        ),
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
    },
    {
      key: 'status',
      title: 'Status',
      render: (_: any, row: GoodsReceipt) => {
        const sapStatus = getReceiptSapStatus(row);
        if (sapStatus) {
          return (
            <Tag color={getReceiptDisplayStatusColor(sapStatus)} bordered={false}>
              {sapStatus}
            </Tag>
          );
        }

        if (statusMode === 'qc') {
          const qcStatus = getQcQueueStatus(row);
          return (
            <Tag
              color={qcStatus ? getQcQueueStatusColor(qcStatus) : statusColor[row.status]}
              bordered={false}
            >
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
      headerTitle={headerTitle}
      columns={columns}
      dataSource={receipts}
      rowKey={(record) => record.receivingNumber || record.grNumber}
      bordered
      size="small"
      search={false}
      options={{ density: false, setting: false, reload: false }}
      toolBarRender={() => toolbarContent}
      pagination={pagination ?? { pageSize: 10, showSizeChanger: true }}
      onRow={(record) => ({
        onClick: () => onViewDetail(record),
        style: { cursor: 'pointer' },
      })}
    />
  );
}
