import { downloadUploadFile, downloadUploadFileV2, execDataService0 } from '@/services/apiGateway';
import { getServiceUrl } from '@/services/ApiUrl';
import { FileServiceAPI } from '@/services/files/service';
import { simpleRequestActions } from '@/services/model';
import { UploadOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Button, Descriptions, List, message, Space, Typography, Upload } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import React, { useEffect, useState } from 'react';
import FileUploaderInfoModal from './FileUploaderInfoModal';
import { kc } from '@/auth';

export type UploadType = UploadFile<string> & { title?: string; description?: string };
type FileInfoType = {
  id: string;
  title: string;
  description?: string;
};

const FileUploader: React.FC<{
  title?: string;
  onSetFiles?: (ploadFiles: UploadFile[]) => void;
  service?: 'WORK_FLOW' | 'FILE';
  multiple?: boolean;
  required?: boolean;
  // readOnly?: true | false,
  addFileInfo?: boolean;
  showTitle?: boolean;
  showUploadList?: boolean;
  initFiles?: string[];
}> = ({
  title,
  service = 'FILE',
  multiple,
  onSetFiles,
  addFileInfo,
  required,
  showTitle,
  showUploadList = true,
  initFiles,
}) => {
    const [file, setFile] = useState<UploadFile>();
    const [fileList, setFileList] = useState<UploadType[]>([]);
    // const token = kc.token  
    const token = localStorage.getItem('accessToken');
    const requestActions = simpleRequestActions();
    const [forceReload, setForceReload] = useState(1);
    const services = FileServiceAPI(requestActions);

    const uploadUrl = () => {
      if ((service = 'FILE')) {
        return `${getServiceUrl('FILE')}/upload`;
      } else {
        return `${getServiceUrl('WORK_FLOW')}/uploader/upload`;
      }
    };


    useEffect(() => {
      (async () => {
        if (initFiles && initFiles.length > 0) {
          try {
            const rs = await services.list(initFiles);
            const fileList: UploadType[] = rs.map((it) => ({
              uid: it.id,
              name: it.fileName,
              response: it.id,
              type: it.fileType,
              title: it.title,
              description: it.description,
              status: 'done',
            }));
            setFileList(fileList);
            // onSetFiles?.(fileList);
          } catch (error: any) {
            message.error(error.message || 'Failed to load files.');
          }
        }
      })();
    }, [initFiles]);

    useEffect(() => {
      fileList.every((it) => it.status == 'done') && onSetFiles?.(fileList);
    }, [forceReload]);

    return (
      <ProCard
        title={
          showTitle && (
            <Space size={1}>
              {required && <Typography.Text type="danger">*</Typography.Text>}{' '}
              {title || 'Attachment Files'}{' '}
            </Space>
          )
        }
        size="small"
      >
        <Upload
          multiple={multiple && addFileInfo}
          itemRender={(node, file: UploadType) => {
            return (
              <List.Item.Meta
                title={node}
                description={
                  file.title && (
                    <Descriptions>
                      <Descriptions.Item label="Title">{file.title}</Descriptions.Item>
                      <Descriptions.Item label="Descroption">{file.description}</Descriptions.Item>
                    </Descriptions>
                  )
                }
              />
            );
          }}
          fileList={fileList}
          headers={
            token
              ? {
                Authorization: `Bearer ${token}`,
              }
              : {}
          }
          action={uploadUrl()}
          onDownload={async (file) => {
            if (service == 'FILE') {
              await downloadUploadFileV2()(file.response, file.fileName || file.name);
            } else await downloadUploadFile()(file.response, file.fileName || file.name);
          }}
          onChange={({ file, fileList }) => {
            setFileList(fileList.map((it) => ({ ...it, url: '#' })));
            if (file.status == 'done') {
              if (!file.response) {
                setFileList((v) => v.filter((it) => it.uid != file.uid));
              } else {
                addFileInfo && setFile(file);
              }
            }
            setForceReload((v) => v + 1);
          }}
          showUploadList={showUploadList ? { showDownloadIcon: true } : false}
        >
          <Button>
            {required && <Typography.Text type="danger">*</Typography.Text>}
            <UploadOutlined />
            Add Files
          </Button>
        </Upload>

        {file && (
          <FileUploaderInfoModal
            onCancel={() => {
              setFileList((v) => v.filter((it) => it.uid != file.uid));
              setFile(undefined);
              setForceReload((v) => v + 1);
            }}
            onOk={async (title, description) => {
              try {
                await execDataService0<{ list: FileInfoType[] }>({
                  actionName: 'update-files-by-ids',
                  endpoint: 'FILE',
                  payload: {
                    list: [{ id: file.response, title, description }],
                  },
                })(requestActions);
                setFileList((v) =>
                  v.map((it) =>
                    it.uid == file.uid ? { ...it, title: title, description: description } : it,
                  ),
                );
                setFile(undefined);
                setForceReload((v) => v + 1);
                return true;
              } catch (error) {
                setFileList((v) => v.filter((it) => it.uid != file.uid));
                setFile(undefined);
                setForceReload((v) => v + 1);
                return false;
              }
            }}
            file={file}
            open={!!file}
          />
        )}
      </ProCard>
    );
  };

export default FileUploader;
