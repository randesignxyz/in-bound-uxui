import { Button, Input, Modal, Typography } from 'antd';
import { useEffect, useState } from 'react';

type ValidationPopupProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  showRemark?: boolean;
  requireRemark?: boolean;
  remarkLabel?: string;
  remarkPlaceholder?: string;
  remarkRequiredMessage?: string;
  initialRemark?: string;
  onCancel: () => void;
  onConfirm: (payload?: { remark?: string }) => void | Promise<void>;
};

export default function ValidationPopup({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  loading = false,
  showRemark,
  requireRemark = false,
  remarkLabel = 'Remark',
  remarkPlaceholder = 'Please enter remark',
  remarkRequiredMessage,
  initialRemark = '',
  onCancel,
  onConfirm,
}: ValidationPopupProps) {
  const [remark, setRemark] = useState(initialRemark);
  const [remarkError, setRemarkError] = useState('');
  const shouldShowRemark = showRemark ?? requireRemark;

  useEffect(() => {
    if (open) {
      setRemark(initialRemark);
      setRemarkError('');
    }
  }, [open, initialRemark]);

  return (
    <Modal
      open={open}
      centered
      width={420}
      title={title}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {cancelText}
        </Button>,
        <Button
          key="confirm"
          type="primary"
          danger={danger}
          loading={loading}
          onClick={() => {
            if (requireRemark && !remark.trim()) {
              setRemarkError(remarkRequiredMessage || `${remarkLabel} is required.`);
              return;
            }
            setRemarkError('');
            onConfirm(shouldShowRemark ? { remark: remark.trim() || undefined } : undefined);
          }}
        >
          {confirmText}
        </Button>,
      ]}
      maskClosable={!loading}
      destroyOnClose
    >
      {description ? (
        <Typography.Paragraph style={{ marginBottom: requireRemark ? 16 : 0 }}>
          {description}
        </Typography.Paragraph>
      ) : null}

      {shouldShowRemark ? (
        <div>
          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
            {remarkLabel}
            {requireRemark ? <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span> : null}
          </Typography.Text>
          <Input.TextArea
            value={remark}
            rows={4}
            placeholder={remarkPlaceholder}
            status={remarkError ? 'error' : undefined}
            onChange={(event) => {
              setRemark(event.target.value);
              if (remarkError) {
                setRemarkError('');
              }
            }}
          />
          {remarkError ? (
            <Typography.Text type="danger" style={{ display: 'block', marginTop: 8 }}>
              {remarkError}
            </Typography.Text>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
