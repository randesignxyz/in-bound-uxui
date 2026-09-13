import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Radio,
  Badge,
  Row,
  Col,
  Space,
  Segmented,
  Tag,
  Alert,
  Modal,
  message,
  Tabs,
  Tooltip,
  Dropdown,
} from 'antd';
import {
  AppstoreOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  CalendarOutlined,
  HistoryOutlined,
  CloudSyncOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  InfoCircleOutlined,
  FileDoneOutlined,
  DownOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { history } from '@umijs/max';

import BreadCrumbCom from '@/pages/prod/shared/BreadCrumbCom';
import { ProdPaths } from '@/pages/prod';

// Workspaces
import { ProcurementWorkspace } from './workspaces/ProcurementWorkspace';
import { WarehouseWorkspace } from './workspaces/WarehouseWorkspace';
import { QCWorkspace } from './workspaces/QCWorkspace';
import { SupervisorWorkspace } from './workspaces/SupervisorWorkspace';
import { AuditTrailWorkspace } from './workspaces/AuditTrailWorkspace';
import { UserFlowWorkspace } from './workspaces/UserFlowWorkspace';

// Shared Components
import { AuditTrailTimeline } from './features/shared/AuditTrailTimeline';
import { InboundStatusBadge } from './features/shared/InboundStatusBadge';

// Initial Sample Data Store
import {
  SAMPLE_IR_PLANS,
  SAMPLE_PURCHASE_ORDERS,
  SAMPLE_GOODS_RECEIPTS,
} from './data/inboundMockStore';

import type {
  GoodsReceipt,
  PurchaseOrder,
  IRPlan,
  SupervisorAdjustmentAudit,
} from './core/type';

const { Text, Title } = Typography;

export type InboundRole = 'PROCUREMENT' | 'WAREHOUSE' | 'QC' | 'SUPERVISOR' | 'AUDIT_TIMELINE' | 'USER_FLOW';

const ROLE_OPTIONS: { label: string; value: InboundRole; icon: React.ReactNode; desc: string }[] = [
  { label: 'Procurement', value: 'PROCUREMENT', icon: <AppstoreOutlined />, desc: 'Purchase orders & IR scheduling' },
  { label: 'Warehouse', value: 'WAREHOUSE', icon: <InboxOutlined />, desc: 'Receiving, staging & verification' },
  { label: 'QC Lab', value: 'QC', icon: <SafetyCertificateOutlined />, desc: 'Quality sampling & inspection' },
  { label: 'Supervisor', value: 'SUPERVISOR', icon: <CheckCircleOutlined />, desc: 'Variance review & SAP posting' },
  { label: 'Audit Trail', value: 'AUDIT_TIMELINE', icon: <AuditOutlined />, desc: 'Full transaction lifecycle' },
  { label: 'User Flow', value: 'USER_FLOW', icon: <RocketOutlined />, desc: 'Interactive system flow' },
];

export default function InboundListview({ routeView }: { routeView?: string }) {
  const [activeRole, setActiveRole] = useState<InboundRole>('PROCUREMENT');

  // Shared in-memory data store across all roles
  const [irPlans, setIrPlans] = useState<IRPlan[]>(SAMPLE_IR_PLANS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(SAMPLE_PURCHASE_ORDERS);
  const [receipts, setReceipts] = useState<GoodsReceipt[]>(SAMPLE_GOODS_RECEIPTS);

  // Selected sample transaction for deep dive
  const sampleGR = receipts.find((r) => r.grNumber === 'GR000124') || receipts[0];

  // Refresh handler
  const handleRefresh = () => {
    message.success('Inbound data refreshed from central server.');
  };

  // Procurement: Create IR Plan
  const handleCreateIRPlan = (newPlan: IRPlan) => {
    setIrPlans((prev) => [newPlan, ...prev]);

    // Update corresponding Purchase Orders and their items in state dynamically
    const allActiveIRPlans = [newPlan, ...irPlans];
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (newPlan.poNumbers.includes(po.poNumber)) {
          const updatedItems = (po.items || []).map((item) => {
            const allScheduledForThisItem = allActiveIRPlans
              .filter((plan) => plan.poNumbers?.includes(po.poNumber))
              .flatMap((plan) => plan.items || [])
              .filter(
                (it) =>
                  (it.poNumber === po.poNumber || !it.poNumber) &&
                  (it.itemCode === item.code || it.itemCode === (item as any).itemCode)
              )
              .reduce(
                (sum, it) =>
                  sum +
                  (Number(it.allocatedQty) ||
                    (it.schedules
                      ? it.schedules.reduce((s, sc) => s + (Number(sc.plannedQty) || 0), 0)
                      : 0) ||
                    0),
                0
              );

            const newReceived = allScheduledForThisItem;
            const newRemaining = Math.max(0, (Number(item.poQty) || 0) - newReceived);
            return {
              ...item,
              receivedQty: newReceived,
              remainingQty: newRemaining,
            };
          });

          const totalPoQty = updatedItems.reduce((s, i) => s + (Number(i.poQty) || 0), 0);
          const totalReceived = updatedItems.reduce((s, i) => s + (Number(i.receivedQty) || 0), 0);
          const isFullyPlanned = totalPoQty > 0 && totalReceived >= totalPoQty;

          return {
            ...po,
            items: updatedItems,
            status: isFullyPlanned ? 'Fully Scheduled' : 'Partially Scheduled',
            docStatus: isFullyPlanned ? 'Closed' : totalReceived > 0 ? 'In Progress' : po.docStatus,
          };
        }
        return po;
      })
    );

    // Automatically create expected Goods Receipt for Warehouse
    const newGR: GoodsReceipt = {
      id: Date.now(),
      grNumber: `GR${String(receipts.length + 125).padStart(6, '0')}`,
      receivingNumber: `GR${String(receipts.length + 125).padStart(6, '0')}`,
      businessUnit: 'OFL',
      irPlanNumber: newPlan.irPlanNumber,
      deliveryPlanNumber: newPlan.deliveryPlanNumber,
      deliveryPlanStatus: 'To Receive',
      poNumber: newPlan.poNumbers[0] || 'UNASSIGNED',
      poReferences: newPlan.poNumbers.map((po) => ({
        poNumber: po,
        businessUnit: 'OFL',
        supplier: newPlan.vendor,
        expectedDate: newPlan.deliveryDate,
      })),
      supplier: newPlan.vendor,
      supplierNames: [newPlan.vendor],
      receiptType: 'Planned',
      receiptSourceType: 'PLANNED',
      poLinkStatus: 'NOT_REQUIRED',
      deliveryNoteNumber: `DN-${Date.now().toString().slice(-6)}`,
      receiverWarehouseName: 'WHM1 - Main Raw Materials',
      expectedDate: newPlan.deliveryDate,
      postingDate: newPlan.deliveryDate,
      actualReceiptDate: newPlan.deliveryDate,
      status: 'Draft',
      processState: 'RECEIVED_CHECKING',
      displayStatus: 'Expected Delivery / To Receive',
      legacyStatus: 'Draft',
      createdBy: newPlan.createdBy,
      createdDate: newPlan.createdAt,
      specMatch: true,
      qtyMatch: true,
      qualityCheckRequired: true,
      documentChecklist: {
        vendorDN: true,
        goodsReceiptPOForm: false,
        pmrmStockCardForm: false,
        supportingDocs: [],
      },
      scenario: {
        scenarioId: 'sc-new',
        scenarioName: 'New Scheduled Inbound',
        scenarioPath: 'NORMAL',
        stepNumber: 1,
        totalSteps: 6,
        stepTitle: 'Scheduled by Procurement',
      },
      activities: [
        {
          id: `act-init-${Date.now()}`,
          title: 'IR Plan Confirmed by Procurement',
          description: `Scheduled ${newPlan.totalPlannedQty.toLocaleString()} units across ${newPlan.items.length} items for PO #${newPlan.poNumbers.join(', ')}.`,
          performedBy: newPlan.createdBy,
          timestamp: newPlan.createdAt,
          state: 'done',
        },
      ],
      items: newPlan.items.flatMap((item, idx) => {
        if (item.schedules && item.schedules.length > 0) {
          return item.schedules.map((sched, sIdx) => ({
            id: Date.now() + idx * 100 + sIdx,
            code: item.itemCode,
            name: item.itemName,
            poNumber: item.poNumber,
            supplier: newPlan.vendor,
            uom: item.uom,
            poQty: sched.plannedQty,
            plannedQty: sched.plannedQty,
            receiveQty: sched.plannedQty,
            actualReceivedQty: sched.plannedQty,
            deliveryDate: sched.deliveryDate,
            batches: [
              {
                id: `b-init-${Date.now()}-${idx}-${sIdx}`,
                batchNumber: `LOT-${item.itemCode.slice(-4)}-${Date.now().toString().slice(-3)}`,
                batchQty: sched.plannedQty,
                productionDate: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
                expiryDate: dayjs().add(2, 'year').format('YYYY-MM-DD'),
                bestBeforeDate: dayjs().add(2, 'year').format('YYYY-MM-DD'),
                remark: `Scheduled for ${sched.deliveryDate || newPlan.deliveryDate}`,
              },
            ],
          }));
        }
        return [
          {
            id: Date.now() + idx,
            code: item.itemCode,
            name: item.itemName,
            poNumber: item.poNumber,
            supplier: newPlan.vendor,
            uom: item.uom,
            poQty: item.allocatedQty,
            plannedQty: item.allocatedQty,
            receiveQty: item.allocatedQty,
            actualReceivedQty: item.allocatedQty,
            batches: [
              {
                id: `b-init-${Date.now()}-${idx}`,
                batchNumber: `LOT-${item.itemCode.slice(-4)}-${Date.now().toString().slice(-3)}`,
                batchQty: item.allocatedQty,
                productionDate: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
                expiryDate: dayjs().add(2, 'year').format('YYYY-MM-DD'),
                bestBeforeDate: dayjs().add(2, 'year').format('YYYY-MM-DD'),
                remark: 'Standard verified supplier batch',
              },
            ],
          },
        ];
      }),
    };

    setReceipts((prev) => [newGR, ...prev]);
  };

  // Warehouse: Save / Submit to QC
  const handleWarehouseSubmitToQC = (updatedGR: GoodsReceipt) => {
    const enrichedGR: GoodsReceipt = {
      ...updatedGR,
      deliveryPlanStatus: 'Waiting for QC',
      processState: 'QC_PENDING',
      displayStatus: 'Under QC Inspection',
      activities: [
        ...(updatedGR.activities || []),
        {
          id: `act-wh-${Date.now()}`,
          title: 'Warehouse Check-in & Unloading Complete',
          description: `Received and verified ${updatedGR.items.reduce((s, i) => s + (i.receiveQty || 0), 0).toLocaleString()} units. Dispatched samples to Quality Control lab.`,
          performedBy: 'Warehouse Team (Dara S.)',
          timestamp: dayjs().format('YYYY-MM-DD HH:mm'),
          state: 'done',
        },
      ],
    };

    setReceipts((prev) => prev.map((r) => (r.grNumber === enrichedGR.grNumber ? enrichedGR : r)));

    Modal.success({
      title: 'Goods Received & Submitted to QC Lab',
      content: (
        <div>
          <p>
            Receipt <b>{enrichedGR.grNumber}</b> has been checked in and physical sample dispatched to QC Lab for chemical & visual testing.
          </p>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            Would you like to switch to the <b>QC Workspace</b> to perform the inspection?
          </p>
        </div>
      ),
      okText: 'Switch to QC Workspace',
      cancelText: 'Stay in Warehouse',
      okButtonProps: { style: { background: '#16a34a', borderColor: '#16a34a' } },
      onOk: () => setActiveRole('QC'),
    });
  };

  // QC: Submit Review to Supervisor
  const handleQCSubmitReview = (updatedGR: GoodsReceipt) => {
    const enrichedGR: GoodsReceipt = {
      ...updatedGR,
      deliveryPlanStatus: 'QC Completed',
      processState: 'PENDING_SUPERVISOR_REVIEW',
      displayStatus: 'QC Passed - Pending Supervisor Approval',
      activities: [
        ...(updatedGR.activities || []),
        {
          id: `act-qc-${Date.now()}`,
          title: 'QC Inspection Passed & Certificate Issued',
          description: `All physical & analytical quality parameters passed specifications. Sent to Supervisor for final SAP GRPO posting.`,
          performedBy: 'QC Specialist (Chanthy K.)',
          timestamp: dayjs().format('YYYY-MM-DD HH:mm'),
          state: 'done',
        },
      ],
    };

    setReceipts((prev) => prev.map((r) => (r.grNumber === enrichedGR.grNumber ? enrichedGR : r)));

    Modal.success({
      title: 'QC Inspection Passed & Released',
      content: (
        <div>
          <p>
            Receipt <b>{enrichedGR.grNumber}</b> passed all quality parameters and is ready for Supervisor review & SAP GRPO Posting.
          </p>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            Would you like to switch to the <b>Supervisor Workspace</b> to approve and post to SAP?
          </p>
        </div>
      ),
      okText: 'Switch to Supervisor Workspace',
      cancelText: 'Stay in QC',
      okButtonProps: { style: { background: '#7c3aed', borderColor: '#7c3aed' } },
      onOk: () => setActiveRole('SUPERVISOR'),
    });
  };

  // Supervisor: Approve & Post to SAP
  const handleSupervisorApproveAndPost = (updatedGR: GoodsReceipt) => {
    const sapDoc = `SAP-GRPO-${Date.now().toString().slice(-5)}`;
    const enrichedGR: GoodsReceipt = {
      ...updatedGR,
      deliveryPlanStatus: 'Posted',
      processState: 'SAP_POSTED',
      displayStatus: 'Completed / Posted to SAP',
      sapDocNum: sapDoc,
      sapPostingStatus: 'Posted',
      activities: [
        ...(updatedGR.activities || []),
        {
          id: `act-sup-${Date.now()}`,
          title: 'Supervisor Approved & Posted to SAP B1',
          description: `Goods Receipt PO Document #${sapDoc} posted to SAP B1. Stock released into Main Warehouse bin locations.`,
          performedBy: 'Inbound Supervisor (Bopha N.)',
          timestamp: dayjs().format('YYYY-MM-DD HH:mm'),
          state: 'done',
        },
      ],
    };

    setReceipts((prev) => prev.map((r) => (r.grNumber === enrichedGR.grNumber ? enrichedGR : r)));

    // Synchronize Purchase Order state: Mark PO as Closed or update received quantity
    const linkedPoNumbers = [
      updatedGR.poNumber,
      ...(updatedGR.poReferences || []).map((p) => p.poNumber),
      ...(updatedGR.items || []).map((i) => i.poNumber).filter(Boolean),
    ].filter(Boolean);

    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (linkedPoNumbers.includes(po.poNumber)) {
          const updatedItems = po.items.map((item) => {
            const grItem = updatedGR.items.find((gi) => gi.code === item.code || gi.name === item.name);
            const addedQty = grItem ? (grItem.sapPostedQty || grItem.receiveQty || grItem.actualReceivedQty || grItem.poQty || 0) : item.poQty;
            const newReceived = Math.min(item.poQty, (item.receivedQty || 0) + addedQty);
            return {
              ...item,
              receivedQty: newReceived,
              remainingQty: Math.max(0, item.poQty - newReceived),
            };
          });

          const isFullyReceived = updatedItems.every((it) => it.receivedQty >= it.poQty);

          return {
            ...po,
            items: updatedItems,
            docStatus: isFullyReceived ? 'Closed' : 'In Progress',
            status: isFullyReceived ? 'Closed' : 'In Progress',
          };
        }
        return po;
      })
    );

    Modal.success({
      title: 'GRPO Successfully Posted to SAP B1',
      content: (
        <div>
          <p>
            Receipt <b>{enrichedGR.grNumber}</b> has been approved and posted to SAP as Document <b>{sapDoc}</b>.
          </p>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            Linked Purchase Order(s) <b>{linkedPoNumbers.join(', ')}</b> have been updated to <b>Closed / Completed</b> in Procurement.
          </p>
        </div>
      ),
      okText: 'View in Audit Trail',
      cancelText: 'Stay in Supervisor',
      okButtonProps: { style: { background: '#059669', borderColor: '#059669' } },
      onOk: () => setActiveRole('AUDIT_TIMELINE'),
    });
  };

  // Supervisor: Send Back
  const handleSupervisorSendBack = (
    updatedGR: GoodsReceipt,
    target: 'WAREHOUSE' | 'QC',
    reason: string,
  ) => {
    setReceipts((prev) => prev.map((r) => (r.grNumber === updatedGR.grNumber ? updatedGR : r)));
  };

  // Supervisor: Adjust GR
  const handleSupervisorAdjustGR = (
    updatedGR: GoodsReceipt,
    adjustment: SupervisorAdjustmentAudit,
  ) => {
    setReceipts((prev) => prev.map((r) => (r.grNumber === updatedGR.grNumber ? updatedGR : r)));
  };

  // Supervisor: Manual SAP Sync
  const handleSupervisorManualSync = (updatedGR: GoodsReceipt, sapDocNum: string) => {
    setReceipts((prev) => prev.map((r) => (r.grNumber === updatedGR.grNumber ? updatedGR : r)));

    // Synchronize Purchase Order state: Mark PO as Closed
    const linkedPoNumbers = [
      updatedGR.poNumber,
      ...(updatedGR.poReferences || []).map((p) => p.poNumber),
      ...(updatedGR.items || []).map((i) => i.poNumber).filter(Boolean),
    ].filter(Boolean);

    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (linkedPoNumbers.includes(po.poNumber)) {
          const updatedItems = po.items.map((item) => ({
            ...item,
            receivedQty: item.poQty,
            remainingQty: 0,
          }));

          return {
            ...po,
            items: updatedItems,
            docStatus: 'Closed',
            status: 'Closed',
          };
        }
        return po;
      })
    );
  };

  // Live stage counts
  const stageStats = {
    procurement: purchaseOrders.filter((p) => p.docStatus === 'Open' || (p as any).status === 'Open' || (p as any).status === 'Pending').length,
    warehouse: receipts.filter((r) => r.deliveryPlanStatus === 'To Receive' || !r.deliveryPlanStatus || r.deliveryPlanStatus === 'In Progress').length,
    qc: receipts.filter((r) => r.deliveryPlanStatus === 'Waiting for QC' || r.processState === 'QC_PENDING').length,
    supervisor: receipts.filter((r) => r.deliveryPlanStatus === 'QC Completed' || r.processState === 'PENDING_SUPERVISOR_REVIEW').length,
    audit: receipts.length,
  };

  return (
    <div style={{ padding: '0 8px 24px', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Top Header with Breadcrumb, Role Selector and Live Device Sync */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 4px 14px',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <BreadCrumbCom
          separator="/"
          routes={[
            { label: 'Home', path: ProdPaths.prod },
            { label: 'Inbound Logistics Hub', path: '' },
          ]}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Dropdown
            menu={{
              selectedKeys: [activeRole],
              items: ROLE_OPTIONS.map((opt) => ({
                key: opt.value,
                label: (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      minWidth: 220,
                      padding: '4px 2px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          fontSize: 15,
                          color: activeRole === opt.value ? '#2563eb' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {opt.icon}
                      </span>
                      <div>
                        <div
                          style={{
                            fontWeight: activeRole === opt.value ? 600 : 500,
                            color: activeRole === opt.value ? '#2563eb' : '#1e293b',
                            fontSize: 13,
                          }}
                        >
                          {opt.label}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{opt.desc}</div>
                      </div>
                    </div>
                    {activeRole === opt.value && (
                      <CheckCircleOutlined style={{ color: '#2563eb', fontSize: 13, marginLeft: 12 }} />
                    )}
                  </div>
                ),
              })),
              onClick: ({ key }) => setActiveRole(key as InboundRole),
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                height: 36,
                padding: '0 12px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>Role:</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#0f172a',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {ROLE_OPTIONS.find((r) => r.value === activeRole)?.icon}
                {ROLE_OPTIONS.find((r) => r.value === activeRole)?.label}
              </span>
              <DownOutlined style={{ fontSize: 10, color: '#94a3b8', marginLeft: 2 }} />
            </Button>
          </Dropdown>
        </div>
      </div>

      {/* Main Workspace Body Based on Active Role */}
      {activeRole === 'PROCUREMENT' && (
        <ProcurementWorkspace
          purchaseOrders={purchaseOrders}
          irPlans={irPlans}
          receipts={receipts}
          onCreateIRPlan={handleCreateIRPlan}
          onRefresh={handleRefresh}
          onNavigateToRole={(role) => setActiveRole(role)}
        />
      )}

      {activeRole === 'WAREHOUSE' && (
        <WarehouseWorkspace
          receipts={receipts}
          irPlans={irPlans}
          onSaveGR={(gr) => setReceipts((p) => [gr, ...p])}
          onSubmitToQC={handleWarehouseSubmitToQC}
          onRefresh={handleRefresh}
          onNavigateToRole={(role) => setActiveRole(role)}
        />
      )}

      {activeRole === 'QC' && (
        <QCWorkspace
          receipts={receipts}
          onSubmitQCReview={handleQCSubmitReview}
          onRefresh={handleRefresh}
          onNavigateToRole={(role) => setActiveRole(role)}
        />
      )}

      {activeRole === 'SUPERVISOR' && (
        <SupervisorWorkspace
          receipts={receipts}
          onApproveAndPostSAP={handleSupervisorApproveAndPost}
          onSendBack={handleSupervisorSendBack}
          onAdjustGR={handleSupervisorAdjustGR}
          onRetrySAPPosting={handleSupervisorApproveAndPost}
          onManualSAPSync={handleSupervisorManualSync}
          onRefresh={handleRefresh}
          onNavigateToRole={(role) => setActiveRole(role)}
        />
      )}

      {activeRole === 'AUDIT_TIMELINE' && (
        <AuditTrailWorkspace
          receipts={receipts}
          irPlans={irPlans}
          onRefresh={handleRefresh}
        />
      )}

      {activeRole === 'USER_FLOW' && (
        <UserFlowWorkspace
          onNavigateToRole={(role) => setActiveRole(role)}
        />
      )}
    </div>
  );
}
