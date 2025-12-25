import { Modal, message, Form } from 'antd';

export function useRollbackPurchaseOrder() {
  const [rollback] = Form.useForm();

  const handleConfirm = (values: any) => {
    Modal.confirm({
      title: 'Are you sure?',
      content: (
        <span>
          Do you want to rollback PO Code: <b>{values.po_code}</b> ?
        </span>
      ),
      okText: 'Yes, Rollback',
      cancelText: 'Cancel',
      centered: true,
      onOk: () => {
        // API call to rollback purchase order goes here
        console.log('Form submitted:', values);
        message.success(`Rollback requested for PO Code: ${values.po_code}`);
        rollback.resetFields();
      },
    });
  };

  const submitRollback = (values: any) => {
    handleConfirm(values);
  };

  return { rollback,  submitRollback };
}