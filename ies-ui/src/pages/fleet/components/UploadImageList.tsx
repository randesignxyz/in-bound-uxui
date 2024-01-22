import { AttachmentFile } from '@/services/data';
import { FileServiceAPI } from '@/services/files/service';
import { simpleRequestActions } from '@/services/model';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Card, Image, message } from 'antd';
import { useEffect, useState } from 'react';

export interface Props {
  initFiles?: string[];
  onSetFileIds?: (fileIds: string[]) => void;
  readonly?: true;
}

/**
 * Use Files service instead of Workflow service
 */
export default ({ initFiles, readonly, onSetFileIds }: Props) => {
  const [attachfileVisible, setAttachfileVisible] = useState<boolean>(false);
  const [attachFiles, setAttachFiles] = useState<AttachmentFile[]>([]);
  const requestActions = simpleRequestActions();
  const services = FileServiceAPI(requestActions);
  useEffect(() => {
    (async () => {
      if (initFiles && initFiles.length > 0) {
        try {
          const rs = await services.list(initFiles);
          setAttachFiles(rs);
        } catch (error: any) {
          message.error(error.message || 'Failed to load files.');
        }
      } else {
        setAttachFiles([]);
      }
    })();
  }, [initFiles]);

  return (
    <Card
      title={!readonly && 'Attachment'}
      size="small"
      extra={
        !readonly && (
          <Button
            onClick={() => setAttachfileVisible(true)}
            type="link"
            icon={<UploadOutlined />}
          />
        )
      }
    >
      {/* <Image width={200} src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" /> */}
      <Image.PreviewGroup
        preview={{
          onChange: (current, prev) =>
            console.log(`current index: ${current}, prev index: ${prev}`),
        }}
      >
        {attachFiles.map((it) => (
          <>
            <Image width={200} src={`D:/Pheun Reach/OFL/uploads/${it.fileName}`} />
          </>
        ))}
      </Image.PreviewGroup>
    </Card>
  );
};
