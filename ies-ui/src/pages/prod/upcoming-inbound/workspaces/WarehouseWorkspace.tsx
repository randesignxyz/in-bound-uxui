import React from 'react';
import { Card, Typography, Button, Input, Select, Radio, Badge, Tag, Row, Col, Space } from 'antd';

import { ReloadOutlined } from '@ant-design/icons';
import { POListTable } from '../features/purchase-order';
import { InboundGRTable } from '../features/goods-receipt';
import { useInboundContext } from '../state';
import {
  summarizeSuppliers,
  summarizePOReferences,
  getGoodsReceiptSourceColor,
  getReceiptSapStatus,
  getReceiptDisplayStatus,
  getReceiptDisplayStatusColor,
  poLinkStatusLabel,
} from '../core/workflow';
import type { UpcomingInboundPurchaseOrder as PurchaseOrder, UpcomingInboundGoodsReceipt as GoodsReceipt } from '../core/type';

const { Text } = Typography;

export interface WarehouseWorkspaceProps {
  warehouseVendorOptions: string[];
  selectedWarehousePOs: PurchaseOrder[];
  selectedWarehousePOVendor: string | undefined;
  warehouseRejectedReceiptCount: number;
  historyReceipts: GoodsReceipt[];
  onViewPODetail: (po: PurchaseOrder) => void;
  onCreateSelectedGR: () => void;
  onCreateTempGR: () => void;
  onOpenGRDetail: (gr: GoodsReceipt) => void;
  onLinkPO: (gr: GoodsReceipt) => void;
  onRefresh: () => void;
  onWarehousePOSearch: (value: string) => void;
  onPurchaseOrderPageChange: (page: number, pageSize: number) => void;
  onHistoryPageChange: (page: number, pageSize: number) => void;
  onWarehousePOSelectionChange: (nextSelectedRowKeys: string[]) => void;
}

const warehouseHistoryStatusOptions = [
  { label: 'All Status', value: 'ALL' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Ready to Post SAP', value: 'Ready to Post SAP' },
  { label: 'Complete', value: 'Complete' },
  { label: 'Correction Required', value: 'Correction Required' },
  { label: 'Rejected', value: 'Rejected' },
];

export function WarehouseWorkspace({
  warehouseVendorOptions,
  selectedWarehousePOs,
  selectedWarehousePOVendor,
  historyReceipts,
  onViewPODetail,
  onCreateSelectedGR,
  onCreateTempGR,
  onOpenGRDetail,
  onLinkPO,
  onRefresh,
  onWarehousePOSearch,
  onPurchaseOrderPageChange,
  onHistoryPageChange,
  onWarehousePOSelectionChange,
}: WarehouseWorkspaceProps) {
  const context = useInboundContext();
  const {
    effectiveInboundView,
    purchaseOrders,
    poPagination,
    poSearchValue,
    setPOSearchValue,
    poVendorFilter,
    setPOVendorFilter,
    poVendorSearch,
    setPoVendorSearch,
    poTypeFilter,
    setPOTypeFilter,
    selectedWarehousePONumbers,
    setSelectedWarehousePONumbers,
    awaitingPOLinkReceipts,
    exceptionQueueReceipts,
    receipts,
    historyPagination,
    queueSearchValue,
    setQueueSearchValue,
    historyTypeFilter,
    setHistoryTypeFilter,
    historyStatusFilter,
    setHistoryStatusFilter,
  } = context;

  const poHeaderTitle = (
    <div style={{ paddingLeft: 8 }}>
      <Text strong>{`Purchase Orders (${poPagination.total})`}</Text>
    </div>
  );

  const poHeaderActions = (
    <Space size={8} wrap>
      <Input.Search
        allowClear
        placeholder="Search PO / PO Doc Num / Supplier"
        onSearch={onWarehousePOSearch}
        onChange={(e) => setPOSearchValue(e.target.value)}
        value={poSearchValue}
        style={{ width: 240 }}
      />
      <Select
        value={poVendorFilter}
        onChange={(value) => {
          setPOVendorFilter(value);
          setPoVendorSearch('');
        }}
        style={{ width: 220 }}
        showSearch
        filterOption={false}
        placeholder="All Vendors"
        onSearch={(input) => setPoVendorSearch(input)}
        onBlur={() => setPoVendorSearch('')}
        options={[
          { label: 'All Vendors', value: 'ALL' },
          ...(poVendorSearch
            ? warehouseVendorOptions.filter((vendor) =>
                vendor.toLowerCase().includes(poVendorSearch.toLowerCase())
              )
            : warehouseVendorOptions.slice(0, 20)
          ).map((vendor) => ({
            label: vendor,
            value: vendor,
          })),
        ]}
      />
      <Radio.Group value={poTypeFilter} onChange={(e) => setPOTypeFilter(e.target.value)}>
        <Radio.Button value="ALL">All</Radio.Button>
        <Radio.Button value="Planned">Planned</Radio.Button>
        <Radio.Button value="Unplanned">Unplanned</Radio.Button>
      </Radio.Group>
      <Button
        type="primary"
        onClick={onCreateSelectedGR}
        disabled={selectedWarehousePOs.length === 0}
      >
        {selectedWarehousePOs.length > 1
          ? `Create IR (${selectedWarehousePOs.length} POs)`
          : 'Create IR'}
      </Button>
      {selectedWarehousePONumbers.length > 0 && (
        <Button onClick={() => setSelectedWarehousePONumbers([])}>Clear Selection</Button>
      )}
      <Button
        onClick={onCreateTempGR}
        style={{
          background: '#fff',
          fontWeight: 600,
        }}
      >
        Receive Without PO
      </Button>
      <Button icon={<ReloadOutlined />} onClick={onRefresh}>
        Refresh
      </Button>
    </Space>
  );

  const inboundReceivingHeaderTitle = (
    <div style={{ paddingLeft: 8 }}>
      <Text strong>{`Inbound Receiving (${historyPagination.total})`}</Text>
    </div>
  );

  const historyTableToolbar = (
    <Space size={8} wrap>
      <Input.Search
        allowClear
        placeholder="Search IR / GR Doc Num / PO / PO Doc Num / Supplier"
        onSearch={(value) => setQueueSearchValue(value)}
        onChange={(event) => {
          setQueueSearchValue(event.target.value);
        }}
        value={queueSearchValue}
        style={{ width: 280 }}
      />
      <Radio.Group value={historyTypeFilter} onChange={(e) => setHistoryTypeFilter(e.target.value)}>
        <Radio.Button value="ALL">All</Radio.Button>
        <Radio.Button value="Planned">Planned</Radio.Button>
        <Radio.Button value="Unplanned">Unplanned</Radio.Button>
      </Radio.Group>
      <Select<string>
        value={historyStatusFilter}
        onChange={(value) => setHistoryStatusFilter(value)}
        options={warehouseHistoryStatusOptions}
        style={{ width: 190 }}
      />
      <Button icon={<ReloadOutlined />} onClick={onRefresh}>
        Refresh
      </Button>
    </Space>
  );

  return (
    <div>
      {effectiveInboundView === 'operations' ? (
        <>
          <POListTable
            purchaseOrders={purchaseOrders}
            onViewDetails={onViewPODetail}
            headerTitle={poHeaderTitle}
            toolbarExtra={poHeaderActions}
            selectedRowKeys={selectedWarehousePONumbers}
            lockedSupplier={selectedWarehousePOVendor}
            onSelectionChange={onWarehousePOSelectionChange}
            goodsReceipts={receipts}
            pagination={{
              current: poPagination.current,
              pageSize: poPagination.pageSize,
              total: poPagination.total,
              showSizeChanger: true,
              onChange: onPurchaseOrderPageChange,
            }}
          />

          {awaitingPOLinkReceipts.length > 0 && (
            <Card
              size="small"
              style={{ marginBottom: 16, borderColor: '#d3adf7' }}
              title={
                <span>
                  <Badge color="#722ed1" />
                  <Text strong style={{ color: '#531dab', marginLeft: 8 }}>
                    Awaiting PO Link
                  </Text>
                  <Badge
                    count={awaitingPOLinkReceipts.length}
                    style={{ marginLeft: 8, backgroundColor: '#722ed1' }}
                  />
                </span>
              }
            >
              {awaitingPOLinkReceipts.map((gr) => (
                <div
                  key={gr.grNumber}
                  style={{
                    padding: '8px 0',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                  }}
                  onClick={() => onOpenGRDetail(gr)}
                >
                  <Row align="middle" justify="space-between" gutter={12}>
                    <Col flex="auto">
                      <div>
                        <Text strong style={{ color: '#531dab', fontSize: 13 }}>
                          {gr.tempReferenceNo || gr.grNumber}
                        </Text>
                        <Tag
                          color={getGoodsReceiptSourceColor(gr.receiptSourceType)}
                          style={{ marginLeft: 8 }}
                        >
                          Temporary Receiving
                        </Tag>
                        <Tag color="warning" style={{ marginLeft: 8 }}>
                          {poLinkStatusLabel[gr.poLinkStatus]}
                        </Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {summarizeSuppliers(gr)} ·{' '}
                        {gr.pendingPOReason || 'Waiting for procurement PO'}
                      </Text>
                    </Col>
                    <Col>
                      <Button
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          onLinkPO(gr);
                        }}
                      >
                        Link PO
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))}
            </Card>
          )}

          {exceptionQueueReceipts.length > 0 && (
            <Card
              size="small"
              title={
                <span>
                  <Badge status="error" />
                  <Text strong style={{ color: '#cf1322', marginLeft: 8 }}>
                    Exception Queue
                  </Text>
                  <Badge
                    count={exceptionQueueReceipts.length}
                    style={{ marginLeft: 8, backgroundColor: '#ff4d4f' }}
                  />
                </span>
              }
              style={{ borderColor: '#ffa39e' }}
            >
              {exceptionQueueReceipts.map((gr) => {
                const displayStatus = getReceiptSapStatus(gr) || getReceiptDisplayStatus(gr);

                return (
                  <div
                    key={gr.grNumber}
                    style={{
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                    }}
                    onClick={() => onOpenGRDetail(gr)}
                  >
                    <Row align="middle" justify="space-between">
                      <Col>
                        <div>
                          <Text strong style={{ color: '#cf1322', fontSize: 13 }}>
                            {gr.grNumber}
                          </Text>
                          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                            - {summarizePOReferences(gr)}
                          </Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {summarizeSuppliers(gr)} &middot;{' '}
                          <Tag
                            color={getReceiptDisplayStatusColor(displayStatus)}
                            bordered={false}
                          >
                            {displayStatus}
                          </Tag>
                        </Text>
                      </Col>
                    </Row>
                  </div>
                );
              })}
            </Card>
          )}
        </>
      ) : (
        <Card size="small" style={{ marginBottom: 16 }} bodyStyle={{ padding: 0 }}>
          <InboundGRTable
            receipts={historyReceipts}
            onViewDetail={onOpenGRDetail}
            headerTitle={inboundReceivingHeaderTitle}
            toolbarExtra={historyTableToolbar}
            hideSourceAndPoLink={true}
            showNotificationBadge={true}
            pagination={{
              current: historyPagination.current,
              pageSize: historyPagination.pageSize,
              total: historyPagination.total,
              showSizeChanger: true,
              onChange: onHistoryPageChange,
            }}
          />
        </Card>
      )}
    </div>
  );
}
