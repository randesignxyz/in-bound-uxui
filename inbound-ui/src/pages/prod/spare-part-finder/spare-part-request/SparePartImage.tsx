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

const isDirectImageUrl = (value?: string) =>
  Boolean(value) &&
  /^(https?:\/\/|blob:|data:image\/|\/)/i.test(value as string);

export default function SparePartImage({ imageId, src, alt, size = 48 }: Props) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    isDirectImageUrl(src) ? src : undefined,
  );
  const objectUrlRef = useRef<string | undefined>();
  const normalizedImageId = Array.isArray(imageId) ? imageId.find((id) => Boolean(id)) : imageId;
  const fallbackImageId = normalizedImageId ?? (!isDirectImageUrl(src) ? src : undefined);

  const revokeObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = undefined;
    }
  };

  useEffect(() => {
    let active = true;

    revokeObjectUrl();
    setImageUrl(isDirectImageUrl(src) ? src : undefined);

    if (!fallbackImageId) {
      return () => {
        active = false;
      };
    }

    if (!isDirectImageUrl(src)) {
      setImageUrl(undefined);
    }

    getUploadFileObjectUrlV2()(fallbackImageId)
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
          setImageUrl(isDirectImageUrl(src) ? src : undefined);
        }
      });

    return () => {
      active = false;
      revokeObjectUrl();
    };
  }, [fallbackImageId, src]);

  return imageUrl ? (
    <Avatar src={imageUrl} alt={alt} size={size} shape="square" />
  ) : (
    <Avatar icon={<FileImageOutlined />} size={size} shape="square" />
  );
}
