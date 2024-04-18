import { kc } from '@/auth';
import { downloadUploadFile, downloadUploadFileV2 } from '@/services/apiGateway';
import { getServiceUrl } from '@/services/ApiUrl';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import React, { useState } from 'react';

const ImageUploader: React.FC<{
  title?: string;
  onSetFiles?: (ploadFiles: UploadFile[]) => void;
  service?: 'WORK_FLOW' | 'FILE';
  multiple?: boolean;
  required?: boolean;
}> = ({ title, service = 'FILE', multiple, onSetFiles, required }) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const token = kc.token //localStorage.getItem('accessToken');
  const uploadUrl = () => {
    if ((service = 'FILE')) {
      return `${getServiceUrl('FILE')}/upload`;
    } else {
      return `${getServiceUrl('WORK_FLOW')}/uploader/upload`;
    }
  };

  return (
    // <ProCard
    //   title={<Space size={1}>  {required && <Typography.Text type="danger">*</Typography.Text>} {title || 'Attachment Files'} </Space>}
    //   size="small"
    // >
    <Upload
      multiple={multiple}
      showUploadList={false}
      headers={
        token
          ? {
            Authorization: `Bearer ${token}`,
          }
          : {}
      }
      action={uploadUrl()}
      onRemove={(file) => {
        setFiles((v) => {
          const list = v.filter((it) => it.uid != file.uid);
          onSetFiles?.(list.filter((it) => it.response));
          return list;
        });
      }}
      onDownload={async (file) => {
        if (service == 'FILE') {
          await downloadUploadFileV2()(file.response, file.fileName || file.name);
        } else await downloadUploadFile()(file.response, file.fileName || file.name);
      }}
      onChange={({ file }) => {
        if (file.status == 'done') {
          setFiles((v) => {
            const list = [...v, { ...file, url: '#' }];
            onSetFiles?.(list.filter((it) => it.response));
            return list;
          });
        }
      }}
    // showUploadList={{
    //   showDownloadIcon: true,
    // }}
    >
      <Button type="link" icon={<UploadOutlined />}>
        Upload
      </Button>
    </Upload>
    // </ProCard >
  );
};

export default ImageUploader;
