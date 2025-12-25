// component/SolutionIssuesModal.tsx
import { Button, Form, Input, Modal, Select } from 'antd';
import { useEffect } from 'react';
import styles from '../assets/style.module.css';
import { SolutionIssueData } from '../data';
// import { alertBtn } from './alertBtn';


export default function SolutionIssuesModal({
  currentAction,
  close,
  rollback,
  submitRollback,
  wrongPricing,
  changeDistributor,
  poItemForm,
  mmeForm,
}: SolutionIssueData) {
  const open = !!currentAction;

  const titleFor = (a: string | null) => {
    switch (a) {
      case 'rollback_po':
        return 'Rollback Purchase Order';
      case 'wrong_pricing':
        return 'Wrong Pricing Scheme';
      case 'change_distributor':
        return 'Change Distributor After Settlement';
      case 'change_po_item':
        return 'Change Purchase Order Item';
      case 'create_new_mme':
        return 'Create New MME';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (!open) return;

    // reset forms
    rollback?.resetFields();
    wrongPricing?.resetFields();
    changeDistributor?.resetFields();
    poItemForm?.resetFields();
    mmeForm?.resetFields();
  }, [open, currentAction]);

  return (
    <Modal
      title={titleFor(currentAction)}
      open={open}
      onCancel={close}
      footer={null}
      centered
      maskClosable={false}
      destroyOnClose
    >
      {/* Rollback PO */}
      {currentAction === 'rollback_po' && (
        <Form form={rollback} layout="vertical" onFinish={submitRollback}>
          <Form.Item
            label="PO Code"
            name="po_code"
            rules={[{ required: true, message: 'Please Enter Purchase Order Code' }]}
            extra="Enter the Purchase Order code you wish to rollback."
          >
            <Input placeholder="Enter PO Code" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block className={styles.submitBtn}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      )}

      {/* Wrong Pricing */}
      {currentAction === 'wrong_pricing' && (
        <Form
          form={wrongPricing}
          layout="vertical"
          onFinish={(values) => {
            // alertBtn(values);
            close();
          }}
          
        >
          <Form.Item
            label="Stock Control ID"
            name="stock_control_id"
            rules={[
              { required: true, message: 'Please enter Stock Control ID' },
              { pattern: /^\d+$/, message: 'Please Input Number' },
            ]}
          >
            <Input placeholder="Enter Stock Control ID" inputMode="numeric" />
          </Form.Item>
          <Form.Item
            label="Invoice Number"
            name="invoice_number"
            rules={[{ required: true, message: 'Please enter Invoice Number' }]}
          >
            <Input placeholder="Enter Invoice Number" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block className={styles.submitBtn}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      )}

      {/* Change Distributor */}
      {currentAction === 'change_distributor' && (
        <Form form={changeDistributor} layout="vertical" onFinish={close}>
          <Form.Item
            label="Purchase Order Code"
            name="purchase_order_code"
            rules={[{ required: true, message: 'Please enter Purchase Order Code' }]}
          >
            <Input placeholder="Enter Purchase Order Code" />
          </Form.Item>
          <Form.Item
            label="Distributor Code"
            name="distributor_code"
            rules={[{ required: true, message: 'Please enter Distributor Code' }]}
          >
            <Input placeholder="Enter Distributor Code" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block className={styles.submitBtn}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      )}

      {/* Change Purchase Order Item */}
      {currentAction === 'change_po_item' && (
        <Form form={poItemForm} layout="vertical" onFinish={close}>
          <Form.Item
            label="PO Code"
            name="po_code"
            rules={[{ required: true, message: 'Please enter PO Code' }]}
          >
            <Input placeholder="Enter PO Code" />
          </Form.Item>
          <Form.Item
            label="Old Item Code"
            name="old_item_code"
            rules={[{ required: true, message: 'Please enter Old Item Code' }]}
          >
            <Input placeholder="Enter Old Item Code" />
          </Form.Item>
          <Form.Item
            label="New Item Code"
            name="new_item_code"
            rules={[{ required: true, message: 'Please enter New Item Code' }]}
          >
            <Input placeholder="Enter New Item Code" />
          </Form.Item>
          <Form.Item
            label="New Price"
            name="price"
            rules={[
              { required: true, message: 'Please enter New Price' },
              { pattern: /^\d+(\.\d{1,4})?$/, message: 'Please Input Valid Price' },
            ]}
          >
            <Input placeholder="Enter New Price" inputMode="numeric" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block className={styles.submitBtn}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      )}

      {/* Create New MME */}
      {currentAction === 'create_new_mme' && (
        <Form form={mmeForm} layout="vertical" onFinish={close}>
          <Form.Item
            label="Salesperson Code"
            name="salesperson_code"
            rules={[{ required: true, message: 'Please enter Salesperson Code' }]}
          >
            <Input placeholder="Salesperson Code" />
          </Form.Item>
          <Form.Item
            label="Salesperson Type"
            name="salesperson_type"
            rules={[{ required: true, message: 'Please enter Salesperson Type' }]}
          >
            <Select
              placeholder="Select Salesperson Type"
              options={[
                { label: 'MME', value: 'mme' },
                { label: 'CnD', value: 'cnd' },
              ]}
              allowClear
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block className={styles.submitBtn}>
              Create
            </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}