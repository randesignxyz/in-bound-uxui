import { kc } from '@/auth';
import { getServiceUrl } from '@/services/ApiUrl';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Card, Form, message, Modal, Upload } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import React, { useState } from 'react';


const Deployment: React.FC<{
  visible: boolean;
  loading?: boolean;
  onDeploy: (fileId: string, cb: () => void) => void;
  onHide: () => void;
}> = ({ visible, loading, onDeploy, onHide }) => {
  const [selectedFile, setSelectedFile] = useState<UploadFile>();
  const token = kc.token //localStorage.getItem('accessToken');
  const [form] = Form.useForm();

  const clearForm = () => {
    form.resetFields();
    setSelectedFile(undefined);
  };

  const onOkHandler = () => {
    form.validateFields().then((values) => {
      if (!selectedFile) message.error('Please upload file.');
      selectedFile && onDeploy(selectedFile.response, clearForm);
    });
  };

  return (
    <Modal
      open={visible}
      title="Workflow Deployment"
      closable
      destroyOnClose
      okText="Submit"
      onCancel={() => {
        clearForm();
        onHide();
      }}
      okButtonProps={{
        loading: loading,
      }}
      onOk={onOkHandler}
    >
      <Card>
        <Form form={form} layout="vertical">
          <Form.Item>
            <Upload
              name="file"
              headers={
                token
                  ? {
                    Authorization: `Bearer ${token}`,
                  }
                  : {}
              }
              multiple={false}
              showUploadList={false}
              action={`${getServiceUrl('WORK_FLOW')}/uploader/upload`}
              onChange={({ file, fileList }) => {
                if (file.status !== 'uploading') {
                  console.log(file, fileList);
                }
                if (file.status === 'done') {
                  setSelectedFile(file);
                  message.success(`${file.name} file uploaded successfully`);
                } else if (file.status === 'error') {
                  message.error(`${file.name} file upload failed.`);
                }
              }}
            >
              {!selectedFile && <Button icon={<UploadOutlined />}>Click to Upload</Button>}
              {selectedFile && <a>{selectedFile.name}</a>}
            </Upload>
          </Form.Item>
        </Form>
      </Card>
    </Modal>
  );
};

export default Deployment;
