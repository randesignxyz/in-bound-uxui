import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import { Flex, Progress, Tag } from 'antd';
import ProTable from '@ant-design/pro-table';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import { getPurchaseOrderStatusLabel, type PurchaseOrder } from '../workflow';

interface POListTableProps {
  purchaseOrders: PurchaseOrder[];
  onViewDetails: (po: PurchaseOrder) => void;
  headerTitle?: ReactNode;
  toolbarExtra?: ReactNode;
  selectedRowKeys?: string[];
  lockedSupplier?: string;
  onSelectionChange?: (selectedRowKeys: string[]) => void;
  onRefresh?: () => Promise<void> | void;
}

export function POListTable({
  purchaseOrders,
  onViewDetails,
  headerTitle,
  toolbarExtra,
  selectedRowKeys = [],
  lockedSupplier,
  onSelectionChange,
  onRefresh,
}: POListTableProps) {
  const actionRef = useRef<ActionType>();
  const originalReloadRef = useRef<ActionType['reload']>();
  const hasActiveSelection = selectedRowKeys.length > 0;
  const getRowKey = (purchaseOrder: PurchaseOrder) => `${purchaseOrder.businessUnit || 'UNSPECIFIED'}::${purchaseOrder.poNumber}`;
  const isSelectionLockedRow = (purchaseOrder: PurchaseOrder) =>
    Boolean(lockedSupplier) &&
    purchaseOrder.supplier !== lockedSupplier &&
    !selectedRowKeys.includes(getRowKey(purchaseOrder));
  const openPurchaseOrderDetails = (
    purchaseOrder: PurchaseOrder,
    event?: { preventDefault?: () => void; stopPropagation?: () => void },
  ) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (hasActiveSelection) {
      return;
    }
    onViewDetails(purchaseOrder);
  };

  const columns: ProColumns<PurchaseOrder>[] = [
    {
      key: 'poNumber',
      title: 'ID',
      dataIndex: 'poNumber',
      width: 130,
      render: (_: any, r: PurchaseOrder) => (
        <a
          onClick={(event) => openPurchaseOrderDetails(r, event)}
          aria-disabled={hasActiveSelection ? 'true' : undefined}
          style={{
            color: isSelectionLockedRow(r) ? '#8c8c8c' : undefined,
            cursor: hasActiveSelection
              ? isSelectionLockedRow(r)
                ? 'not-allowed'
                : 'default'
              : 'pointer',
          }}
        >
          {r.poNumber}
        </a>
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
            {getPurchaseOrderStatusLabel(r.status)}
          </Tag>
        ) : r.status === 'Partial' ? (
          <Tag color="blue" bordered={false}>
            {getPurchaseOrderStatusLabel(r.status)}
          </Tag>
        ) : (
          <Tag color="gold" bordered={false}>
            {getPurchaseOrderStatusLabel(r.status)}
          </Tag>
      ),
    },
  ];
  const interactiveColumns = columns.map((column) => ({
    ...column,
    onCell: (record: PurchaseOrder) => ({
      onClick: (event: MouseEvent<HTMLElement>) => {
        const target = event.target as HTMLElement;
        if (target.closest('a') || target.closest('button')) {
          return;
        }

        openPurchaseOrderDetails(record);
      },
      style: { cursor: hasActiveSelection ? 'default' : 'pointer' },
    }),
  }));

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
    <ProTable<PurchaseOrder>
      actionRef={actionRef}
      headerTitle={headerTitle}
      columns={interactiveColumns}
      dataSource={purchaseOrders}
      rowKey={getRowKey}
      bordered
      size="small"
      search={false}
      options={{ density: false, setting: false }}
      toolBarRender={() => (toolbarExtra ? [toolbarExtra] : [])}
      tableAlertRender={false}
      pagination={{ pageSize: 10, showSizeChanger: true }}
      tableLayout="fixed"
      rowSelection={
        onSelectionChange
          ? {
              selectedRowKeys,
              onChange: (nextSelectedRowKeys) =>
                onSelectionChange(nextSelectedRowKeys.map((key) => String(key))),
              preserveSelectedRowKeys: false,
              getCheckboxProps: (record) => ({
                disabled:
                  Boolean(lockedSupplier) &&
                  record.supplier !== lockedSupplier &&
                  !selectedRowKeys.includes(getRowKey(record)),
              }),
            }
          : undefined
      }
      onRow={(record) => ({
        'data-dimmed-row': isSelectionLockedRow(record) ? 'true' : undefined,
        style: {
          backgroundColor: isSelectionLockedRow(record) ? '#fafafa' : undefined,
          opacity: isSelectionLockedRow(record) ? 0.58 : 1,
          transition: 'background-color 0.2s ease, opacity 0.2s ease',
        },
      })}
    />
  );
}
