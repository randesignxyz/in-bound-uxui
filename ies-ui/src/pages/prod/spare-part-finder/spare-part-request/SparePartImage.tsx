import { FileImageOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { getUploadFileObjectUrlV2 } from '@/services/apiGateway';

type Props = {
  imageId?: string | string[];
  src?: string;
  alt?: string;
  size?: number;
};

export default function SparePartImage({ imageId, src, alt, size = 48 }: Props) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(src);
  const objectUrlRef = useRef<string | undefined>();
  const normalizedImageId = Array.isArray(imageId) ? imageId.find((id) => Boolean(id)) : imageId;

  const revokeObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = undefined;
    }
  };

  useEffect(() => {
    let active = true;

    revokeObjectUrl();
    setImageUrl(src);

    if (!normalizedImageId) {
      return () => {
        active = false;
      };
    }

    if (!src) {
      setImageUrl(undefined);
    }

    getUploadFileObjectUrlV2()(normalizedImageId)
      .then((url) => {
        if (!active) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrlRef.current = url;
        setImageUrl(url);
      })
      .catch(() => {
        if (active) {
          setImageUrl(src);
        }
      });

    return () => {
      active = false;
      revokeObjectUrl();
    };
  }, [normalizedImageId, src]);

  return imageUrl ? (
    <Avatar src={imageUrl} alt={alt} size={size} shape="square" />
  ) : (
    <Avatar icon={<FileImageOutlined />} size={size} shape="square" />
  );
}
