import { getUploadFileObjectUrl } from '@/services/apiGateway';
import { Card, Empty, Image, Space } from 'antd';
import React, { useEffect, useState } from 'react';

interface Props {
  attachments: { id: number; imageId: string }[];
}

interface ImageData {
  id: string;
  name: string;
  image: string;
}

const AttachmentsView: React.FC<Props> = ({ attachments }) => {
  const [images, setImage] = useState<ImageData[]>([]);
  useEffect(() => {
    attachments.forEach((it, index) => {
      if (it) {
        getUploadFileObjectUrl()(it.imageId).then((image) => {
          setImage((v) => [
            ...v,
            { id: it.imageId, name: `Attachment ${index + 1}`, image: image },
          ]);
        });
      }
    });
    // attachments.map((it, index) => {
    //   it &&
    //     getUploadFileObjectUrl()(it.imageId).then((image) => {
    //       setImage((v) => [
    //         ...v,
    //         { id: it.imageId, name: `Attachment ${index + 1}`, image: image },
    //       ]);
    //     });
    // });
  }, []);

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
    </Card>
  );
};

export default AttachmentsView;
