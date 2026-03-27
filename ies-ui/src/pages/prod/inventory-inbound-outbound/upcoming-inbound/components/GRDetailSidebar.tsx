import { Alert, Button, Descriptions, Divider, Space, Spin, Tag, Timeline } from 'antd';
import { ProCard, ProTable } from '@ant-design/pro-components';
import { DrawerForm } from '@ant-design/pro-form';
import type { ProColumns } from '@ant-design/pro-table';
import type { ReactNode } from 'react';
import {
  buildReceiptTimelineActivities,
  GoodsReceipt,
  GRItem,
  InboundProcessState,
  getGoodsReceiptSourceColor,
  goodsReceiptSourceLabel,
  summarizePOReferences,
  summarizeSuppliers,
} from '../workflow';

interface GRDetailSidebarProps {
  open: boolean;
  onClose: () => void;
  receipt: GoodsReceipt | null;
  viewerRole: 'WAREHOUSE_STAFF' | 'QC' | 'WAREHOUSE_SUPERVISOR';
  onUpdateProcessState: (grNumber: string, newState: InboundProcessState, note?: string) => void;
  onOpenWarehouseCorrection: (receipt: GoodsReceipt) => void;
  onOpenLinkPO: (receipt: GoodsReceipt) => void;
  onOpenQCVerification: (receipt: GoodsReceipt) => void;
  onOpenSupervisorReview: (receipt: GoodsReceipt) => void;
}

export function GRDetailSidebar({
  open,
  onClose,
  receipt,
  viewerRole,
  onUpdateProcessState,
  onOpenWarehouseCorrection,
  onOpenLinkPO,
  onOpenQCVerification,
  onOpenSupervisorReview,
}: GRDetailSidebarProps) {
  if (!receipt) return null;

  const supportingDocs = receipt.documentChecklist.supportingDocs || [];
  const timelineActivities = buildReceiptTimelineActivities(receipt);

  const statusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'default';
      case 'Pending Approval':
        return 'gold';
      case 'Approved':
        return 'green';
      case 'Posted':
        return 'blue';
      case 'Correction Required':
        return 'red';
      default:
        return 'default';
    }
  };

  const canSubmitForQC = viewerRole === 'WAREHOUSE_STAFF' && receipt.processState === 'GRPO_DRAFT';
  const canOpenWarehouseCorrection =
    viewerRole === 'WAREHOUSE_STAFF' &&
    ['CORRECTION_REQUIRED', 'MISMATCH_EXCEPTION'].includes(receipt.processState);

  const reviewerLabel =
    receipt.approvedBy === 'qam.inspector' ||
    ['QC_PASSED', 'CORRECTION_REQUIRED', 'MISMATCH_EXCEPTION'].includes(receipt.processState)
      ? 'QC Reviewed By'
      : 'Approved By';

  const reviewerDateLabel = reviewerLabel === 'QC Reviewed By' ? 'QC Reviewed Date' : 'Approved Date';
  const canLinkPO =
    viewerRole === 'WAREHOUSE_STAFF' &&
    receipt.receiptSourceType === 'TEMP_NO_PO' &&
    receipt.poLinkStatus === 'WAITING_PO';

  const headerActions: ReactNode[] = [];

  if (canOpenWarehouseCorrection) {
    headerActions.push(
      <Button
        key="warehouse-recheck"
        type="primary"
        onClick={() => onOpenWarehouseCorrection(receipt)}
      >
        Recheck & Correct
      </Button>,
    );
  } else if (canSubmitForQC) {
    headerActions.push(
      <Button
        key="submit-qc"
        type="primary"
        onClick={() => onUpdateProcessState(receipt.grNumber, 'QC_PENDING', 'Submitted for QC')}
      >
        Submit for QC
      </Button>,
    );
  } else if (receipt.processState === 'QC_PENDING' && viewerRole === 'QC') {
    headerActions.push(
      <Button key="qc-review" type="primary" onClick={() => onOpenQCVerification(receipt)}>
        Check & Verify
      </Button>,
    );
  } else if (receipt.processState === 'QC_PASSED' && viewerRole === 'WAREHOUSE_STAFF') {
    headerActions.push(
      <Button
        key="submit-supervisor"
        type="primary"
        onClick={() =>
          onUpdateProcessState(
            receipt.grNumber,
            'PENDING_SUPERVISOR_REVIEW',
            'Submitted to warehouse supervisor after QC pass',
          )
        }
      >
        Submit for Supervisor Review
      </Button>,
    );
  } else if (
    receipt.processState === 'PENDING_SUPERVISOR_REVIEW' &&
    viewerRole === 'WAREHOUSE_SUPERVISOR'
  ) {
    headerActions.push(
      <Button key="supervisor-review" type="primary" onClick={() => onOpenSupervisorReview(receipt)}>
        Review & Approve
      </Button>,
    );
  }

  if (canLinkPO) {
    headerActions.push(
      <Button key="link-po" onClick={() => onOpenLinkPO(receipt)}>
        Link PO
      </Button>,
    );
  }

  return (
    <DrawerForm
      title={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            width: '100%',
            paddingRight: 12,
          }}
        >
          <span>Inbound Receiving Detail</span>
          <Space>{headerActions}</Space>
        </div>
      }
      open={open}
      onOpenChange={(value: boolean) => !value && onClose()}
      submitter={false}
      width={760}
      drawerProps={{
        destroyOnClose: true,
        bodyStyle: { paddingInline: 16, paddingTop: 16, paddingBottom: 16 },
      }}
    >
      <Spin spinning={false}>
        <ProCard bodyStyle={{ paddingInline: 8, paddingTop: 8, paddingBottom: 8 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Receiving / GR Number" style={{ fontWeight: 'bolder' }}>
              {receipt.grNumber}
            </Descriptions.Item>
            <Descriptions.Item label="PO Reference" style={{ fontWeight: 'bolder' }}>
              {summarizePOReferences(receipt)}
            </Descriptions.Item>
            <Descriptions.Item label="Supplier">{summarizeSuppliers(receipt)}</Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color={receipt.receiptType === 'Planned' ? 'blue' : 'orange'}>
                {receipt.receiptType}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Source">
              <Tag color={getGoodsReceiptSourceColor(receipt.receiptSourceType)}>
                {goodsReceiptSourceLabel[receipt.receiptSourceType]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={statusColor(receipt.status)} bordered={false}>
                {receipt.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Posting Date">{receipt.postingDate}</Descriptions.Item>
            <Descriptions.Item label="Actual Receipt Date">{receipt.actualReceiptDate}</Descriptions.Item>
            <Descriptions.Item label="Receiver Warehouse">
              {receipt.receiverWarehouseName}
            </Descriptions.Item>
            <Descriptions.Item label="Delivery Note">{receipt.deliveryNoteNumber}</Descriptions.Item>
            <Descriptions.Item label="Created By">{receipt.createdBy}</Descriptions.Item>
            <Descriptions.Item label="Created Date">{receipt.createdDate}</Descriptions.Item>
            {receipt.approvedBy && (
              <Descriptions.Item label={reviewerLabel}>{receipt.approvedBy}</Descriptions.Item>
            )}
            {receipt.approvedDate && (
              <Descriptions.Item label={reviewerDateLabel}>{receipt.approvedDate}</Descriptions.Item>
            )}
            {receipt.linkedPoNumber && (
              <Descriptions.Item label="Linked PO">{receipt.linkedPoNumber}</Descriptions.Item>
            )}
            {receipt.linkedPoLinkedAt && (
              <Descriptions.Item label="Linked At">{receipt.linkedPoLinkedAt}</Descriptions.Item>
            )}
            {receipt.linkedPoLinkedBy && (
              <Descriptions.Item label="Linked By">{receipt.linkedPoLinkedBy}</Descriptions.Item>
            )}
            {receipt.pendingPOReason && (
              <Descriptions.Item label="Pending PO Note" span={2}>
                {receipt.pendingPOReason}
              </Descriptions.Item>
            )}
            {receipt.linkBlockReason && (
              <Descriptions.Item label="Link Check" span={2}>
                {receipt.linkBlockReason}
              </Descriptions.Item>
            )}
          </Descriptions>

          {(!receipt.specMatch || !receipt.qtyMatch || receipt.processState === 'MISMATCH_EXCEPTION') && (
            <>
              <Divider style={{ margin: '12px 0' }} />
              <Alert
                type="error"
                showIcon
                message={
                  <span>
                    <strong>Exception:</strong> Receipt requires follow-up before it can proceed.
                    {receipt.exceptionReason ? ` ${receipt.exceptionReason}` : ''}
                  </span>
                }
              />
            </>
          )}

          <Divider />
          <div style={{ marginInline: -8 }}>
            <ProTable<GRItem>
              headerTitle="Receipt Items"
              size="small"
              search={false}
              rowKey={(row) => `${row.poNumber}-${row.code}-${row.batchNumber || 'row'}`}
              dataSource={receipt.items}
              options={{ density: false, fullScreen: false, reload: false, setting: false }}
              pagination={false}
              scroll={{ x: 1480 }}
              columns={[
                { title: 'No', render: (_: any, _row: GRItem, index: number) => index + 1, width: 50 },
                { title: 'PO', dataIndex: 'poNumber', width: 120 },
                { title: 'Supplier', dataIndex: 'supplier', width: 160 },
                { title: 'Item Code', dataIndex: 'code' },
                { title: 'Item Name', dataIndex: 'name' },
                { title: 'PO Qty', dataIndex: 'poQty', valueType: 'digit' },
                { title: 'Received', dataIndex: 'receiveQty', valueType: 'digit' },
                { title: 'UoM', dataIndex: 'uom', width: 80 },
                {
                  title: 'Product Date',
                  dataIndex: 'productDate',
                  width: 120,
                  render: (_: any, row: GRItem) => row.productDate || '-',
                },
                { title: 'Expiry', dataIndex: 'expiryDate', width: 120 },
                { title: 'Batch Number', dataIndex: 'batchNumber', width: 160 },
                {
                  title: 'Receipt Status',
                  key: 'receiptStatus',
                  width: 140,
                  render: (_: any, row: GRItem) => {
                    if (row.isMissing) return <Tag color="error">Missing</Tag>;
                    if (row.receiveQty < row.poQty) return <Tag color="warning">Short</Tag>;
                    return <Tag color="success">Matched</Tag>;
                  },
                },
                {
                  title: 'Receipt Remark',
                  key: 'missingRemark',
                  width: 220,
                  render: (_: any, row: GRItem) => row.missingRemark?.trim() || '-',
                },
                {
                  title: 'Barcode',
                  dataIndex: 'barcode',
                  width: 180,
                  render: (_: any, row: GRItem) => (
                    <Tag color={row.barcode ? 'processing' : 'default'}>
                      {row.barcode || 'Not scanned'}
                    </Tag>
                  ),
                },
              ] as ProColumns<GRItem>[]}
            />
          </div>

          <Divider />
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Supporting Documents</div>
            {supportingDocs.length > 0 ? (
              <Space wrap>
                {supportingDocs.map((documentName) => (
                  <Tag key={documentName} color="processing">
                    {documentName}
                  </Tag>
                ))}
              </Space>
            ) : (
              <div style={{ color: '#8c8c8c' }}>No supporting documents attached.</div>
            )}
          </div>

          <Divider />
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Activities</div>
          <Timeline
            items={timelineActivities.map((activity) => ({
              color:
                activity.state === 'done'
                  ? 'green'
                  : activity.state === 'active'
                    ? 'orange'
                    : 'gray',
              children: (
                <div>
                  <div style={{ fontWeight: 600 }}>{activity.title}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{activity.description}</div>
                  {activity.timestamp && (
                    <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                      {activity.timestamp}
                    </div>
                  )}
                </div>
              ),
            }))}
          />

          {receipt.processState === 'QC_PENDING' && (
            <>
              <Divider />
              <Alert
                message="Waiting QC decision. Once QC passes, this receipt moves to warehouse supervisor review."
                showIcon
              />
            </>
          )}

          {receipt.processState === 'QC_PASSED' && (
            <>
              <Divider />
              <Alert
                type="success"
                message="QC passed. The receipt is ready to move to warehouse supervisor approval."
                showIcon
              />
            </>
          )}

          {receipt.processState === 'PENDING_SUPERVISOR_REVIEW' && (
            <>
              <Divider />
              <Alert message="Waiting warehouse supervisor decision after QC pass." showIcon />
            </>
          )}

          {receipt.processState === 'SUPERVISOR_APPROVED' && (
            <>
              <Divider />
              <Alert
                type={receipt.poLinkStatus === 'WAITING_PO' ? 'warning' : 'success'}
                message={
                  receipt.poLinkStatus === 'WAITING_PO'
                    ? 'Supervisor approved. Completion is blocked until a PO is linked.'
                    : 'Supervisor approved. This inbound workflow is complete.'
                }
                showIcon
              />
            </>
          )}

          {canLinkPO && receipt.linkBlockReason && (
            <>
              <Divider />
              <Alert
                type="warning"
                message={receipt.linkBlockReason}
                showIcon
              />
            </>
          )}

          {receipt.processState === 'TRANSFERRED_TO_PM_RM_WH' && !docsComplete && (
            <>
              <Divider />
              <Alert type="error" message="Required documents are incomplete." showIcon />
            </>
          )}
        </ProCard>
      </Spin>
    </DrawerForm>
  );
}
