import React, { useMemo, useState } from 'react';
import { Radio, Select, Card, Tag, Badge, Space } from 'antd';
import {
  WarningOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import {
  GoodsReceipt,
  GRScenarioPath,
  getGoodsReceiptSourceColor,
  getPOLinkStatusColor,
  grScenarioOptions,
  goodsReceiptSourceLabel,
  officialStateLabel,
  poLinkStatusLabel,
  scenarioPathLabel,
  summarizePOReferences,
  summarizeSuppliers,
} from '../workflow';

interface RecentActivityProps {
  receipts: GoodsReceipt[];
  onViewDetail: (gr: GoodsReceipt) => void;
}

export function RecentActivity({ receipts, onViewDetail }: RecentActivityProps) {
  const [scenarioFilter, setScenarioFilter] = useState<'All' | GRScenarioPath>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | GoodsReceipt['status']>('All');

  const scopedReceipts = useMemo(() => {
    if (scenarioFilter === 'All') return receipts;
    return receipts.filter((r) => r.scenario.scenarioPath === scenarioFilter);
  }, [receipts, scenarioFilter]);

  const statusScopedReceipts = useMemo(() => {
    if (statusFilter === 'All') return scopedReceipts;
    return scopedReceipts.filter((r) => r.status === statusFilter);
  }, [scopedReceipts, statusFilter]);

  const correctionRequired = statusScopedReceipts.filter((r) => r.status === 'Correction Required');
  const pendingApproval = statusScopedReceipts.filter((r) => r.status === 'Pending Approval');
  const approved = statusScopedReceipts.filter((r) => r.status === 'Approved');
  const completedToday = statusScopedReceipts.filter(
    (r) => r.status === 'Posted' && r.postingDate >= '2026-03-01'
  );

  const statusBadge = (status: GoodsReceipt['status']) => {
    switch (status) {
      case 'Draft':
        return { color: 'default' as const };
      case 'Pending Approval':
        return { color: 'gold' as const };
      case 'Approved':
        return { color: 'green' as const };
      case 'Posted':
        return { color: 'blue' as const };
      case 'Correction Required':
        return { color: 'red' as const };
      default:
        return { color: 'default' as const };
    }
  };

  const renderGRRow = (gr: GoodsReceipt) => (
    <Card
      key={gr.grNumber}
      size="default"
      hoverable
      onClick={() => onViewDetail(gr)}
      style={{ marginBottom: 12, cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Space wrap size={[6, 6]}>
            <a
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail(gr);
              }}
              style={{ fontWeight: 600, fontSize: 14 }}
            >
              {gr.grNumber}
            </a>
            <span style={{ fontSize: 13, color: '#999' }}>→ {summarizePOReferences(gr)}</span>
            {gr.receiptType === 'Unplanned' && (
              <Tag color="orange">Unplanned</Tag>
            )}
            <Tag color={getGoodsReceiptSourceColor(gr.receiptSourceType)}>
              {goodsReceiptSourceLabel[gr.receiptSourceType]}
            </Tag>
            <Tag color={getPOLinkStatusColor(gr.poLinkStatus)}>
              {poLinkStatusLabel[gr.poLinkStatus]}
            </Tag>
            <Tag color="gold" style={{ borderColor: 'rgba(191, 185, 104, 0.4)' }}>
              {scenarioPathLabel[gr.scenario.scenarioPath]} • Step {gr.scenario.stepNumber}/{gr.scenario.totalSteps}
            </Tag>
          </Space>
          <div style={{ fontSize: 13, color: '#999', marginTop: 8 }}>
            {summarizeSuppliers(gr)} · {gr.items.length} item{gr.items.length !== 1 ? 's' : ''} · {gr.createdBy}
          </div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{gr.scenario.stepTitle}</div>
        </div>
        <Space direction="vertical" align="end" size={6}>
          <Tag {...statusBadge(gr.status)}>{gr.status}</Tag>
          <Tag color="gold" style={{ borderColor: 'rgba(191, 185, 104, 0.4)', fontSize: 11 }}>
            {officialStateLabel[gr.processState]}
          </Tag>
        </Space>
      </div>
    </Card>
  );

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    grs: GoodsReceipt[],
    emptyText: string
  ) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {icon}
        <span style={{ fontSize: 13, fontWeight: 600, color: '#666', textTransform: 'uppercase' }}>
          {title}
        </span>
        <Badge count={grs.length} style={{ backgroundColor: '#999' }} />
      </div>
      {grs.length === 0 ? (
        <div style={{ fontSize: 12, color: '#999', paddingLeft: 24 }}>{emptyText}</div>
      ) : (
        <div>{grs.map(renderGRRow)}</div>
      )}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Recent Activity</h3>
        <Select
          value={statusFilter}
          onChange={(v) => setStatusFilter(v)}
          style={{ width: 220, fontSize: 14 }}
          options={[
            { value: 'All', label: 'All Status' },
            { value: 'Draft', label: 'Draft' },
            { value: 'Pending Approval', label: 'Pending Approval' },
            { value: 'Approved', label: 'Approved' },
            { value: 'Posted', label: 'Posted' },
            { value: 'Correction Required', label: 'Correction Required' },
          ]}
        />
      </div>

      <Radio.Group
        value={scenarioFilter}
        onChange={(e) => setScenarioFilter(e.target.value)}
        style={{ marginBottom: 24, fontSize: 14 }}
      >
        {grScenarioOptions.map((option) => (
          <Radio.Button key={String(option.value)} value={option.value}>
            {option.label}
          </Radio.Button>
        ))}
      </Radio.Group>

      {correctionRequired.length > 0 &&
        renderSection(
          'Correction Required',
          <WarningOutlined style={{ color: '#ff4d4f' }} />,
          correctionRequired,
          'None'
        )}

      {renderSection(
        'Pending Approval',
        <ClockCircleOutlined style={{ color: '#faad14' }} />,
        pendingApproval,
        'No GRs pending approval'
      )}

      {renderSection(
        'Approved',
        <FileDoneOutlined style={{ color: '#52c41a' }} />,
        approved,
        'No approved GRs'
      )}

      {renderSection(
        'Recently Completed',
        <CheckCircleOutlined style={{ color: '#1890ff' }} />,
        completedToday,
        'No completed GRs'
      )}
    </div>
  );
}
