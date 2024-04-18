import { kc } from '@/auth';
import { getUploadFileObjectUrlV2 } from '@/services/apiGateway';
import { getServiceUrl } from '@/services/ApiUrl';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Image, Space, Upload, UploadFile, UploadProps } from 'antd';
import { UploadChangeParam } from 'antd/lib/upload';
import { CSSProperties, useEffect, useState } from 'react';

export default ({
  style,
  onSave,
  imageId,
  defualtImage,
  displayOnly = false,
}: {
  style?: CSSProperties;
  defualtImage?: string;
  onSave: (fileId: string) => void;
  imageId?: string;
  displayOnly?: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();

  const token = kc.token // localStorage.getItem('accessToken');
  const uploadUrl = () => `${getServiceUrl('FILE')}/upload`;

  const getFileUrl = async (fileId: string) => {
    return await getUploadFileObjectUrlV2()(fileId);
  };

  const handleChange: UploadProps['onChange'] = async (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      const url = await getFileUrl(info.file.response);
      setImageUrl(url);
      setLoading(false);
      onSave(info.file.response);
    }
  };
  useEffect(() => {
    imageId && getFileUrl(imageId).then(setImageUrl);
  }, [imageId]);

  return (
    <>
      <Space direction="vertical" align="center">
        <Image style={style} src={imageUrl ? imageUrl : defualtImage} />
        {displayOnly ? (
          ''
        ) : (
          <Upload
            headers={
              token
                ? {
                  Authorization: `Bearer ${token}`,
                }
                : {}
            }
            className="avatar-uploader"
            action={uploadUrl()}
            onChange={handleChange}
            showUploadList={false}
          >
            <Button type="link" icon={<UploadOutlined />} />
          </Upload>
        )}
      </Space>
    </>
  );
};
