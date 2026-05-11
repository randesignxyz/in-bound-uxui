import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Badge, Tag, Typography } from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import type { ReactNode } from 'react';
import {
  GoodsReceipt,
  getGoodsReceiptSourceColor,
  getInboundHistoryStatus,
  getInboundHistoryStatusColor,
  getPOLinkStatusColor,
  getReceiptApprovedGrNumber,
  getReceiptDisplayStatusColor,
  getReceiptIrNumber,
  getReceiptPOReferences,
  getReceiptSapStatus,
  goodsReceiptSourceLabel,
  poLinkStatusLabel,
  summarizePOReferences,
  summarizeSuppliers,
} from '../workflow';

const { Text } = Typography;

interface InboundGRTableProps {
  receipts: GoodsReceipt[];
  onViewDetail: (gr: GoodsReceipt) => void;
  headerTitle?: ReactNode;
  toolbarExtra?: ReactNode;
  hideSourceAndPoLink?: boolean;
  showNotificationBadge?: boolean;
  pagination?: TablePaginationConfig;
}

export function InboundGRTable({
  receipts,
  onViewDetail,
  headerTitle,
  toolbarExtra,
  hideSourceAndPoLink = false,
  showNotificationBadge = false,
  pagination,
}: InboundGRTableProps) {
  const showApprovedGrColumn = receipts.some((receipt) =>
    getReceiptApprovedGrNumber(receipt),
  );

  const columns: ProColumns<GoodsReceipt>[] = [
    {
      key: 'receivingNumber',
      title: 'IR Number',
      dataIndex: 'receivingNumber',
      render: (_: any, r: GoodsReceipt) => {
        const shouldShowRowBadge =
          showNotificationBadge && getInboundHistoryStatus(r) === 'Rejected';

        return (
          <Badge dot={shouldShowRowBadge} color="#ff4d4f" offset={[2, 2]}>
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
    },
    {
      key: 'status',
      title: 'Status',
      render: (_: any, r: GoodsReceipt) => {
        const historyStatus = getInboundHistoryStatus(r);
        const sapStatus = getReceiptSapStatus(r);
        const displayStatus = sapStatus || historyStatus;
        const color = sapStatus
          ? getReceiptDisplayStatusColor(sapStatus)
          : getInboundHistoryStatusColor(historyStatus);

        return (
          <Tag color={color} bordered={false}>
            {displayStatus}
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
      toolBarRender={() => (toolbarExtra ? [toolbarExtra] : [])}
      pagination={pagination ?? { pageSize: 10, showSizeChanger: true }}
      onRow={(record) => ({
        onClick: () => onViewDetail(record),
        style: { cursor: 'pointer' },
      })}
    />
  );
}
