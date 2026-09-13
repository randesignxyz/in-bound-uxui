import { Button, Modal } from 'antd';
import React from 'react';

export interface FormModalProps {
  loading?: boolean;
  title?: string;
  readOnly?: boolean;
  open?: boolean;
  visible?: boolean;
  width?: string;
  okText?: string;
  confirmLoading?: boolean;
  footer?: React.ReactNode;
  onSubmit?: () => void;
  onResetForm?: () => void;
  onCancel?: (refresh?: boolean) => void;
  isHiddenReset?: boolean;
  disabled?: boolean;
  maskClosable?: boolean;
  children?: React.ReactNode;
}

const FormModalComp: React.FC<FormModalProps> = ({
  title,
  open,
  visible,
  readOnly,
  width,
  okText,
  confirmLoading,
  footer,
  onSubmit,
  onCancel,
  onResetForm,
  isHiddenReset,
  disabled,
  children,
  maskClosable,
}) => {
  return (
    <Modal
      styles={{
        body: {
          backgroundColor: '#fafafa'
        }
      }}
      title={title}
      open={open || visible}
      onCancel={() => onCancel?.()}
      destroyOnClose
      width={width || '1000px'}
      maskClosable={maskClosable === undefined ? true : maskClosable}
      footer={
        footer || [
          <Button key="cancel" onClick={() => onCancel?.()}>
            Cancel
          </Button>,
          onResetForm && (
            <Button hidden={readOnly || isHiddenReset} key="reset" onClick={onResetForm}>
              Reset
            </Button>
          ),
          <Button
            loading={confirmLoading}
            disabled={disabled}
            hidden={readOnly}
            key="submit"
            type="primary"
            onClick={onSubmit}
          >
            {okText || 'Submit'}
          </Button>,
        ]
      }
    >
      {children}
    </Modal>
  );
};

export default FormModalComp;
