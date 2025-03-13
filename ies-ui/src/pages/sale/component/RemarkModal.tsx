import { ProForm, ProFormTextArea } from '@ant-design/pro-components';
import { Alert, Modal, ModalProps, Space, Typography } from 'antd';
import { useForm } from 'antd/es/form/Form';
import React from 'react';

interface Props extends ModalProps {
  showAlertInfo: boolean | true;
  onSave: (data: { remark: string }) => void;
  status?: string;
}
const RemarkModalForm: React.FC<Props> = ({ onSave, status, showAlertInfo, ...props }) => {
  const [form] = useForm<{ remark: string }>();
  return (
    <Modal
      {...props}
      title={'Remark '}
      onOk={async () => {
        const data = await form.validateFields();
        onSave(data);
      }}
    >
      <ProForm form={form} submitter={false}>
        <ProFormTextArea
          rules={[{ required: true }, { message: 'Please entry ' }]}
          name="remark"
          placeholder="remark"
        />
        {showAlertInfo && (
          <Alert
            type="warning"
            showIcon
            message={
              <Space direction="vertical">
                <Typography.Text>
                  This is a message inform warning; be careful before clicking OK.
                </Typography.Text>
                <Typography.Text> You really want to {status} the request?</Typography.Text>
              </Space>
            }
            // message={``}
          />
        )}
      </ProForm>
    </Modal>
  );
};

export default RemarkModalForm;
