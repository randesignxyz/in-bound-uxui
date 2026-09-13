import React from 'react';
import { Timeline, Card, Typography, Table, Tag, Space, Alert, Empty } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  AuditOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { GRActivity, SupervisorAdjustmentAudit } from '../../core/type';

const { Text, Title } = Typography;

interface AuditTrailTimelineProps {
  activities?: GRActivity[];
  adjustments?: SupervisorAdjustmentAudit[];
  currentStep?: number;
}

export const AuditTrailTimeline: React.FC<AuditTrailTimelineProps> = ({
  activities = [],
  adjustments = [],
}) => {
  const getTimelineIcon = (state: string) => {
    switch (state) {
      case 'done':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />;
      case 'active':
        return <ClockCircleOutlined style={{ color: '#1677ff', fontSize: 16 }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: '#d9d9d9', fontSize: 16 }} />;
    }
  };

  const adjustmentColumns = [
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      key: 'itemCode',
      render: (code: string, record: SupervisorAdjustmentAudit) => (
        <div>
          <Text strong>{code}</Text>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{record.itemName}</div>
        </div>
      ),
    },
    {
      title: 'Field',
      dataIndex: 'fieldName',
      key: 'fieldName',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Previous',
      dataIndex: 'previousValue',
      key: 'previousValue',
      render: (val: any) => <Text delete type="secondary">{val}</Text>,
    },
    {
      title: 'Adjusted Value',
      dataIndex: 'newValue',
      key: 'newValue',
      render: (val: any) => <Text strong style={{ color: '#52c41a' }}>{val}</Text>,
    },
    {
      title: 'Reason for Adjustment',
      dataIndex: 'reason',
      key: 'reason',
      render: (text: string) => <Text style={{ fontSize: 12 }}>{text}</Text>,
    },
    {
      title: 'Changed By / Time',
      key: 'auditMeta',
      render: (_: any, record: SupervisorAdjustmentAudit) => (
        <div>
          <div><UserOutlined style={{ marginRight: 4 }} />{record.changedBy}</div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{record.timestamp}</div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card title="End-to-End Activity History" size="small" bordered={false}>
        {activities.length === 0 ? (
          <Empty description="No activity records yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Timeline
            style={{ marginTop: 12 }}
            items={activities.map((activity) => ({
              dot: getTimelineIcon(activity.state),
              children: (
                <div style={{ paddingBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 13 }}>{activity.title}</Text>
                    <span style={{ fontSize: 11, color: '#8c8c8c' }}>{activity.timestamp}</span>
                  </div>
                  <div style={{ color: '#595959', fontSize: 12, marginTop: 2 }}>{activity.description}</div>
                  {activity.performedBy && (
                    <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
                      <UserOutlined style={{ marginRight: 4 }} />
                      {activity.performedBy}
                    </div>
                  )}
                </div>
              ),
            }))}
          />
        )}
      </Card>

      {adjustments && adjustments.length > 0 && (
        <Card
          title={
            <Space>
              <AuditOutlined style={{ color: '#fa8c16' }} />
              <span>Supervisor Adjustment Audit Trail ({adjustments.length})</span>
            </Space>
          }
          size="small"
          bordered={false}
          style={{ borderColor: '#ffe58f', background: '#fffbe6' }}
        >
          <Alert
            message="Audit Logging Rule Active"
            description="Supervisor adjustments never overwrite original warehouse physical count or QC values. Every modification is immutably logged with before/after records."
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
          />
          <Table
            dataSource={adjustments}
            columns={adjustmentColumns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      )}
    </div>
  );
};
