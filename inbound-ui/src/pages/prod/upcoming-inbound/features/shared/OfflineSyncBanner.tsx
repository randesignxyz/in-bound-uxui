import React from 'react';
import { Tag, Space, Tooltip, Typography, Popover, Button } from 'antd';
import {
  CloudSyncOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  WarningOutlined,
  CloudUploadOutlined,
  WifiOutlined,
} from '@ant-design/icons';
import type { SyncStatus } from '../../core/type';

const { Text } = Typography;

interface OfflineSyncBannerProps {
  status?: SyncStatus;
  lastSyncedAt?: string;
  onManualSync?: () => void;
  compact?: boolean;
}

export const OfflineSyncBanner: React.FC<OfflineSyncBannerProps> = ({
  status = 'SYNCED',
  lastSyncedAt = 'Just now',
  onManualSync,
  compact = false,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'SAVED_ON_DEVICE':
        return {
          color: 'warning',
          icon: <CloudUploadOutlined />,
          label: 'Saved on Device',
          tooltip: 'Changes are saved locally on this device. Local save does NOT mean SAP posting is complete.',
          bgColor: '#FFFBE6',
          borderColor: '#FFE58F',
        };
      case 'PENDING_SYNC':
        return {
          color: 'processing',
          icon: <CloudSyncOutlined />,
          label: 'Pending Sync',
          tooltip: 'Queued to sync to central server once connection stabilizes.',
          bgColor: '#E6F4FF',
          borderColor: '#91CAFF',
        };
      case 'SYNCING':
        return {
          color: 'processing',
          icon: <SyncOutlined spin />,
          label: 'Syncing...',
          tooltip: 'Currently synchronizing warehouse data with central database...',
          bgColor: '#E6F4FF',
          borderColor: '#91CAFF',
        };
      case 'SYNC_FAILED':
        return {
          color: 'error',
          icon: <WarningOutlined />,
          label: 'Sync Failed',
          tooltip: 'Local changes failed to sync. Click to retry synchronization.',
          bgColor: '#FFF2F0',
          borderColor: '#FFCCC7',
        };
      case 'SYNCED':
      default:
        return {
          color: 'success',
          icon: <CheckCircleOutlined />,
          label: 'Device Synced',
          tooltip: 'All local changes synchronized with central IES server.',
          bgColor: '#F6FFED',
          borderColor: '#B7EB8F',
        };
    }
  };

  const config = getStatusConfig();

  const popoverContent = (
    <div style={{ maxWidth: 280, padding: 4 }}>
      <Text strong style={{ display: 'block', marginBottom: 4 }}>Offline & Sync Status</Text>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
        {config.tooltip}
      </Text>
      <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 8 }}>
        Last Synced: <Text style={{ fontSize: 11 }}>{lastSyncedAt}</Text>
      </div>
      {status !== 'SYNCED' && onManualSync && (
        <Button
          size="small"
          type="primary"
          icon={<SyncOutlined />}
          onClick={onManualSync}
          block
        >
          Sync Now
        </Button>
      )}
    </div>
  );

  return (
    <Popover content={popoverContent} trigger="hover" placement="bottomRight">
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: compact ? '2px 8px' : '4px 10px',
          background: config.bgColor,
          border: `1px solid ${config.borderColor}`,
          borderRadius: 6,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{ color: config.color === 'success' ? '#52c41a' : config.color === 'error' ? '#ff4d4f' : '#faad14' }}>
          {config.icon}
        </span>
        <Text strong style={{ fontSize: 12, color: '#262626' }}>
          {config.label}
        </Text>
        {!compact && (
          <span style={{ fontSize: 11, color: '#8c8c8c' }}>
            ({lastSyncedAt})
          </span>
        )}
      </div>
    </Popover>
  );
};
