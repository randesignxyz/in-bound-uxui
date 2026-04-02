import { Button, Input, Modal, Typography, message } from 'antd';
import { useEffect, useState } from 'react';

type ValidationPopupProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  requireRemark?: boolean;
  remarkLabel?: string;
  remarkPlaceholder?: string;
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
  requireRemark = false,
  remarkLabel = 'Remark',
  remarkPlaceholder = 'Please enter remark',
  initialRemark = '',
  onCancel,
  onConfirm,
}: ValidationPopupProps) {
  const [remark, setRemark] = useState(initialRemark);

  useEffect(() => {
    if (open) {
      setRemark(initialRemark);
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
              message.warning(`${remarkLabel} is required.`);
              return;
            }
            onConfirm(requireRemark ? { remark: remark.trim() } : undefined);
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

      {requireRemark ? (
        <div>
          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
            {remarkLabel}
          </Typography.Text>
          <Input.TextArea
            value={remark}
            rows={4}
            placeholder={remarkPlaceholder}
            onChange={(event) => setRemark(event.target.value)}
          />
        </div>
      ) : null}
    </Modal>
  );
}
