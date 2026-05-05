import { useEffect, useMemo, useRef } from 'react';
import { Badge, Tag, Typography } from 'antd';
import ProTable from '@ant-design/pro-table';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import type { ReactNode } from 'react';
import {
  GoodsReceipt,
  InboundHistoryStatus,
  getInboundHistoryStatus,
  getInboundHistoryStatusColor,
  getGoodsReceiptSourceColor,
  getPOLinkStatusColor,
  getReceiptApprovedGrNumber,
  getReceiptIrNumber,
  getReceiptPOReferences,
  goodsReceiptSourceLabel,
  poLinkStatusLabel,
  summarizePOReferences,
  summarizeSuppliers,
} from '../workflow';

const { Text } = Typography;

interface InboundGRTableProps {
  receipts: GoodsReceipt[];
  onViewDetail: (gr: GoodsReceipt) => void;
  typeFilter: 'ALL' | 'Planned' | 'Unplanned';
  statusFilter:
    | 'ALL'
    | InboundHistoryStatus
    | 'SUPERVISOR_PENDING'
    | 'QC_PENDING'
    | 'QC_REJECTED';
  headerTitle?: ReactNode;
  hideSourceAndPoLink?: boolean;
  showNotificationBadge?: boolean;
  onRefresh?: () => Promise<void> | void;
}

function matchesStatusFilter(
  receipt: GoodsReceipt,
  statusFilter: InboundGRTableProps['statusFilter'],
) {
  if (statusFilter === 'ALL') {
    return true;
  }

  if (statusFilter === 'SUPERVISOR_PENDING') {
    return receipt.processState === 'PENDING_SUPERVISOR_REVIEW';
  }

  if (statusFilter === 'QC_PENDING') {
    return receipt.processState === 'QC_PENDING';
  }

  if (statusFilter === 'QC_REJECTED') {
    return receipt.processState === 'CORRECTION_REQUIRED';
  }

  return getInboundHistoryStatus(receipt) === statusFilter;
}

export function InboundGRTable({
  receipts,
  onViewDetail,
  typeFilter,
  statusFilter,
  headerTitle,
  hideSourceAndPoLink = false,
  showNotificationBadge = false,
  onRefresh,
}: InboundGRTableProps) {
  const actionRef = useRef<ActionType>();
  const originalReloadRef = useRef<ActionType['reload']>();

  const filteredReceipts = useMemo(() => {
    let data = receipts;
    if (typeFilter !== 'ALL') {
      data = data.filter((r) => r.receiptType === typeFilter);
    }
    data = data.filter((r) => matchesStatusFilter(r, statusFilter));
    return data;
  }, [receipts, typeFilter, statusFilter]);
  const showApprovedGrColumn = filteredReceipts.some((receipt) => getReceiptApprovedGrNumber(receipt));

  const columns: ProColumns<GoodsReceipt>[] = [
    {
      key: 'receivingNumber',
      title: 'IR Number',
      dataIndex: 'receivingNumber',
      render: (_: any, r: GoodsReceipt) => {
        const shouldShowRowBadge =
          showNotificationBadge && getInboundHistoryStatus(r) === 'Rejected';

        return (
          <Badge
            dot={shouldShowRowBadge}
            color="#ff4d4f"
            offset={[2, 2]}
          >
            <a onClick={() => onViewDetail(r)}>{getReceiptIrNumber(r)}</a>
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
            render: (_: any, r: GoodsReceipt) => getReceiptApprovedGrNumber(r) || '-',
          } as ProColumns<GoodsReceipt>,
        ]
      : []),
    {
      key: 'poNumber',
      title: 'PO Reference',
      dataIndex: 'poNumber',
      render: (_: ReactNode, r: GoodsReceipt) =>
        getReceiptPOReferences(r).length > 0 ? (
          summarizePOReferences(r)
        ) : (
          <Text style={{ color: '#ff4d4f', fontWeight: 600, fontSize: '110%' }}>No PO</Text>
        ),
    },
    {
      key: 'receiptType',
      title: 'Type',
      dataIndex: 'receiptType',
      render: (_: any, r: GoodsReceipt) => (
        <Tag color={r.receiptType === 'Planned' ? 'green' : 'orange'}>{r.receiptType}</Tag>
      ),
    },
    ...(!hideSourceAndPoLink
      ? [
          {
            key: 'receiptSourceType',
            title: 'Source',
            render: (_: any, r: GoodsReceipt) => (
              <Tag color={getGoodsReceiptSourceColor(r.receiptSourceType)}>
                {goodsReceiptSourceLabel[r.receiptSourceType]}
              </Tag>
            ),
          } as ProColumns<GoodsReceipt>,
          {
            key: 'poLinkStatus',
            title: 'PO Link',
            render: (_: any, r: GoodsReceipt) => (
              <Tag color={getPOLinkStatusColor(r.poLinkStatus)}>
                {poLinkStatusLabel[r.poLinkStatus]}
              </Tag>
            ),
          } as ProColumns<GoodsReceipt>,
        ]
      : []),
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

  useEffect(() => {
    if (!actionRef.current || !onRefresh) {
      return;
    }

    if (!originalReloadRef.current) {
      originalReloadRef.current = actionRef.current.reload?.bind(actionRef.current);
    }

    actionRef.current.reload = async (resetPageIndex?: boolean) => {
      await onRefresh();
      return originalReloadRef.current?.(resetPageIndex);
    };
  }, [onRefresh]);

  return (
    <ProTable<GoodsReceipt>
      actionRef={actionRef}
      headerTitle={headerTitle}
      columns={columns}
      dataSource={filteredReceipts}
      rowKey={(record) => record.receivingNumber || record.grNumber}
      bordered
      size="small"
      search={false}
      options={{ density: false, setting: false }}
      pagination={{ pageSize: 10, showSizeChanger: true }}
      onRow={(record) => ({
        onClick: () => onViewDetail(record),
        style: { cursor: 'pointer' },
      })}
    />
  );
}
