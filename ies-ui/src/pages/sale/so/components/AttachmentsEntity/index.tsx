import { kc } from '@/auth';
import { getUploadFileObjectUrl } from '@/services/apiGateway';
import { getServiceUrl } from '@/services/ApiUrl';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Image, Space, Upload } from 'antd';
import React, { useEffect, useState } from 'react';

interface Props {
  isCreated: boolean;
  attachments: { id: number; imageId: string; status: string }[];
  multiple?: boolean;
  //   uploadFiles?: UploadFile[];
  actionHandlers?: {
    // onAddFile?: (file: UploadFile) => void;
    onAddFile?: (file: { id: number; imageId: string; status: string }) => void;
    // onRemoveFile?: (file: UploadFile) => void;
    onRemoveFile?: (imageId: string) => void;
  };
}

interface ImageData {
  id: string;
  name: string;
  image: string;
}

const AttachmentsEntity: React.FC<Props> = ({
  multiple,
  //   uploadFiles,
  actionHandlers,
  attachments,
  isCreated,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [images, setImage] = useState<ImageData[]>([]);
  //   const [photos, setPhotos] = useState<{ id: number; imageId: string }[]>([]);

  useEffect(() => {
    setToken(localStorage.getItem('accessToken'));
    // setPhotos(attachments || []);
  }, [token]);

  const _createObjectImage = (imageId: string, index: number) => {
    getUploadFileObjectUrl()(imageId).then((image) => {
      setImage((v) => [...v, { id: imageId, name: `Attachment ${index + 1}`, image: image }]);
    });
  };

  useEffect(() => {
    // console.log(`------------- attachments ${attachments.length}`);
    setImage([]);
    if (attachments) {
      attachments.forEach((it, index) => {
        if (it) {
          _createObjectImage(it.imageId, index);
        }
      });
    }
    // attachments &&
    //   attachments.map((it, index) => {
    //     // clear images

    //     it && _createObjectImage(it.imageId, index);

    //   });
  }, [attachments]);

  return (
    <Card size="small" title="Attachment File">
      {attachments && attachments.length <= 0 && (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span>No Images</span>} />
      )}
      {attachments && attachments.length > 0 && (
        <div className="space-align-container" style={{ textAlign: 'center' }}>
          <div className="space-align-block" style={{ display: 'inline-block' }}>
            <Space align="center">
              <Image.PreviewGroup>
                <Space size={16}>
                  {images.map((it) => {
                    return <Image key={it.id} width={200} src={it.image} />;
                  })}
                </Space>
              </Image.PreviewGroup>
            </Space>
          </div>
        </div>
      )}
      {images.length < 5 && (
        <div className="space-align-container" style={{ textAlign: 'right' }}>
          <Upload
            multiple={multiple}
            headers={
              token
                ? {
                  Authorization: `Bearer ${token}`,
                }
                : {}
            }
            accept="image/*,.pdf"
            action={`${getServiceUrl('WORK_FLOW')}/uploader/upload`}
            fileList={undefined}
            showUploadList={false}
            onChange={({ file }) => {
              if (file.status === 'removed' && file.percent === 100)
                actionHandlers?.onRemoveFile?.(file.response);
              if (file.status === 'done' && file.percent === 100) {
                const id = Math.floor(Math.random() * 214748364) + 1;
                actionHandlers?.onAddFile?.({ id: id, imageId: file.response, status: 'new' });
                // setPhotos((v) => [...v, { id: id, imageId: file.response }]);
                if (images.length > 0 || !isCreated)
                  _createObjectImage(file.response, images.length);
              }
            }}
          >
            <Button>
              <UploadOutlined /> Add Files
            </Button>
          </Upload>
        </div>
      )}
    </Card>
  );
};

export default AttachmentsEntity;
