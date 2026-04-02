import { useRef, type ReactNode } from 'react';
import { Flex, Progress, Tag } from 'antd';
import ProTable from '@ant-design/pro-table';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import type { PurchaseOrder } from '../workflow';

interface POListTableProps {
  purchaseOrders: PurchaseOrder[];
  onViewDetails: (po: PurchaseOrder) => void;
  headerTitle?: ReactNode;
  toolbarExtra?: ReactNode;
}

export function POListTable({
  purchaseOrders,
  onViewDetails,
  headerTitle,
  toolbarExtra,
}: POListTableProps) {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<PurchaseOrder>[] = [
    {
      key: 'poNumber',
      title: 'ID',
      dataIndex: 'poNumber',
      width: 130,
      render: (_: any, r: PurchaseOrder) => (
        <a onClick={() => onViewDetails(r)}>{r.poNumber}</a>
      ),
    },
    {
      key: 'type',
      title: 'Type',
      dataIndex: 'type',
      width: 100,
      render: (_: any, r: PurchaseOrder) => (
        <Tag color={r.type === 'Planned' ? 'green' : 'orange'}>{r.type}</Tag>
      ),
    },
    {
      key: 'supplier',
      title: 'Supplier',
      dataIndex: 'supplier',
      width: 180,
      ellipsis: true,
    },
    {
      key: 'expectedDate',
      title: 'Expected Date',
      dataIndex: 'expectedDate',
      width: 150,
      render: (_: any, r: PurchaseOrder) =>
        r.expectedDate ? `${r.expectedDate} ${r.expectedTime || ''}`.trim() : 'Unplanned',
      sorter: (a: PurchaseOrder, b: PurchaseOrder) =>
        (a.expectedDate || '9999-12-31').localeCompare(b.expectedDate || '9999-12-31'),
    },
    {
      width: 80,
      key: 'totalItems',
      title: 'Items',
      dataIndex: 'totalItems',
    },
    {
      key: 'totalQty',
      title: 'Total Qty',
      dataIndex: 'totalQty',
      width: 100,
      render: (_: any, r: PurchaseOrder) => r.totalQty.toLocaleString(),
    },
    {
      key: 'progress',
      title: 'Progress',
      width: 120,
      render: (_: any, r: PurchaseOrder) => {
        const totalPO = r.items.reduce((acc: number, item) => acc + item.poQty, 0);
        const totalReceived = r.items.reduce((acc: number, item) => acc + item.receivedQty, 0);
        const pct = totalPO > 0 ? Math.round((totalReceived / totalPO) * 100) : 0;
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
      width: 150,
      render: (_: any, r: PurchaseOrder) =>
        r.status === 'Fully Received' ? (
          <Tag color="green" bordered={false}>
            Fully Received
          </Tag>
        ) : r.status === 'Partial' ? (
          <Tag color="blue" bordered={false}>
            Partial
          </Tag>
        ) : (
          <Tag color="gold" bordered={false}>
            Expected
          </Tag>
        ),
    },
  ];

  return (
    <ProTable<PurchaseOrder>
      actionRef={actionRef}
      headerTitle={headerTitle}
      columns={columns}
      dataSource={purchaseOrders}
      rowKey="poNumber"
      bordered
      size="small"
      search={false}
      options={{ density: false, setting: false }}
      toolBarRender={() => (toolbarExtra ? [toolbarExtra] : [])}
      pagination={{ pageSize: 10, showSizeChanger: true }}
      tableLayout="fixed"
      onRow={(record) => ({
        onClick: () => onViewDetails(record),
        style: { cursor: 'pointer' },
      })}
    />
  );
}
