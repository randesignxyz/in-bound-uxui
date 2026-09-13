import { downloadUploadFileV2 } from '@/services/apiGateway';
import { AttachmentFile } from '@/services/data';
import { FileServiceAPI } from '@/services/files/service';
import { simpleRequestActions } from '@/services/model';
import { DeleteOutlined, EyeFilled, PaperClipOutlined, UpCircleFilled } from '@ant-design/icons';
import { ProDescriptions } from '@ant-design/pro-components';
import ProList from '@ant-design/pro-list';
import { Button, Card, message, Space } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import FileUploader, { UploadType } from './FileUploader';
import FilePreview from './FilePreview';

export interface Props {
  // initFiles?: string[];
  title?: string;
  initFiles?: { fileId: string; activity: string }[];
  onSetFileIds?: (fileIds: string[]) => void;
  readonly?: true | false;
  onSetUploadFile?: (ploadFiles: UploadType[]) => void;
  removeButton?: true | false;
}

/**
 * Use Files service instead of Workflow service
 */
export default ({
  title,
  initFiles,
  readonly,
  onSetFileIds,
  onSetUploadFile,
  removeButton,
}: Props) => {
  const [attachfileVisible, setAttachfileVisible] = useState<boolean>(false);
  const [attachFiles, setAttachFiles] = useState<AttachmentFile[]>([]);
  const requestActions = simpleRequestActions();
  const services = FileServiceAPI(requestActions);
  useEffect(() => {
    (async () => {
      if (initFiles && initFiles.length > 0) {
        try {
          const rs = await services.list(initFiles.map((it) => it.fileId));
          setAttachFiles(rs);
        } catch (error: any) {
          message.error(error.message || 'Failed to load files.');
        }
      } else {
        setAttachFiles([]);
      }
    })();
  }, [initFiles]);

  // const setUploadFileHandle= (ploadFiles: UploadFile[]) => {
  //   Modal.confirm({
  //     title: 'Confirmation',
  //     content: 'Are you sure to upload?',
  //     onOk: async () => {
  //       onSetUploadFile?.(ploadFiles?.filter(it=> {
  //         return !removeFile.find(r => r===it.uid)
  //       }));

  //     },
  //     onCancel: ()=>{
  //       setRemoveFile(ploadFiles.map(it=> it.uid))
  //     }
  // })}

  return (
    <Card
      title={title || (!readonly && 'Attachment')}
      size="small"
      extra={
        !readonly && (
          <FileUploader
            required={false}
            onSetFiles={(f) => onSetUploadFile?.(f)}
            showUploadList={false}
          />
        )
      }
    >
      <ProList<AttachmentFile>
        dataSource={attachFiles}
        showActions="hover"
        loading={requestActions.request?.loading}
        extra={<Button type="link" icon={<UpCircleFilled />} />}
        metas={{
          title: {
            render: (_, r) => (<Space>
              <a title='Download the file' onClick={() => downloadUploadFileV2()(r.id, r.fileName)}>{r.fileName}</a>
              {(r.fileType.includes("image", 0) || r.fileType.includes("application/pdf", 0)) && <FilePreview fileInfo={r} trigger={<Button title='Preview the file' type='link' icon={<EyeFilled />} />} />}

            </Space>

            ),
          },
          avatar: { render: (_, r) => <PaperClipOutlined /> },
          subTitle: { render: (_, r) => moment(r.createdDate).toNow() },

          description: {
            render: (_, r) => (
              <ProDescriptions>
                <ProDescriptions.Item label="Activity">
                  {initFiles?.find((it) => it.fileId == r.id)?.activity}
                </ProDescriptions.Item>
                {r.title && (
                  <ProDescriptions.Item label="File Title">{r.title}</ProDescriptions.Item>
                )}
                {r.title && (
                  <ProDescriptions.Item label="File Description">
                    {r.description}
                  </ProDescriptions.Item>
                )}
              </ProDescriptions>
            ),
          },
          actions: {
            render: (_, r) =>
              !readonly &&
              removeButton && (
                <a
                  onClick={() => {
                    const items = attachFiles.filter((it) => it.id !== r.id);
                    setAttachFiles(items);
                    onSetFileIds?.(items.map((it) => it.id));
                  }}
                >
                  <DeleteOutlined />
                </a>
              ),
          },
        }}
      />
      {/* <AttachmentModal
        service="FILE"
        title="File Upload"
        actionHandlers={{
          onAddFiles: (files) => {
            const item = [
              ...attachFiles,
              ...files.map((it) => ({
                id: it.response,
                fileName: it.name,
                fileType: it.type || '',
                createdDate: moment(),
              })),
            ];
            setAttachFiles(item);

            onSetFileIds?.(item.map((it) => it.id));
          },
        }}
        open={attachfileVisible}
        onCancel={() => setAttachfileVisible(false)}
      /> */}
    </Card>
  );
};
