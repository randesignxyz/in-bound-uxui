import { FileImageOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import React, { useEffect, useState } from 'react';
import { getUploadFileObjectUrlV2 } from '@/services/apiGateway';

type Props = {
  imageId?: string;
  src?: string;
  alt?: string;
  size?: number;
};

export default function SparePartImage({ imageId, src, alt, size = 48 }: Props) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(src);

  useEffect(() => {
    setImageUrl(src);
  }, [src]);

  useEffect(() => {
    let active = true;
    let objectUrl: string | undefined;

    if (!imageId) {
      return () => {};
    }

    getUploadFileObjectUrlV2()(imageId)
      .then((url) => {
        if (!active) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setImageUrl(url);
      })
      .catch(() => setImageUrl(src));

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageId, src]);

  return imageUrl ? (
    <Avatar src={imageUrl} alt={alt} size={size} shape="square" />
  ) : (
    <Avatar icon={<FileImageOutlined />} size={size} shape="square" />
  );
}
