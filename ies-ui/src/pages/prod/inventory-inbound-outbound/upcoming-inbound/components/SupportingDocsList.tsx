import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { Button, List, Space, Tag, Typography } from 'antd';
import type { UploadFile } from 'antd';
import {
  downloadSupportingDoc,
  getUploadFileSource,
  openSupportingDoc,
  previewSupportingUploadFile,
} from '../supportingDocs';
import {
  getSupportingDocSourceColor,
  supportingDocSourceLabel,
  type SupportingDocReference,
  type SupportingDocSource,
} from '../workflow';

const { Link, Text } = Typography;

interface SupportingDocsListProps {
  docs?: SupportingDocReference[];
  files?: UploadFile[];
  emptyText?: string;
  fallbackSource?: SupportingDocSource;
  onRemoveFile?: (uid: string) => void;
}

function getDocumentIcon(fileName: string) {
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
    return <FileExcelOutlined style={{ color: '#52c41a', fontSize: 18 }} />;
  }
  if (lowerName.endsWith('.pdf')) {
    return <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />;
  }
  if (
    lowerName.endsWith('.jpg') ||
    lowerName.endsWith('.jpeg') ||
    lowerName.endsWith('.png') ||
    lowerName.endsWith('.webp')
  ) {
    return <FileImageOutlined style={{ color: '#1677ff', fontSize: 18 }} />;
  }
  return <FileTextOutlined style={{ color: '#8c8c8c', fontSize: 18 }} />;
}

export function SupportingDocsList({
  docs,
  files,
  emptyText = 'No supporting documents attached.',
  fallbackSource,
  onRemoveFile,
}: SupportingDocsListProps) {
  const items = files
    ? files.map((file) => ({
        key: file.uid,
        fileName: file.name,
        fileId: typeof file.response === 'string' ? file.response : null,
        source: getUploadFileSource(file, fallbackSource) ?? undefined,
        isPending: !!file.originFileObj,
        isLegacy: !file.originFileObj && typeof file.response !== 'string',
        onView: () => previewSupportingUploadFile(file),
        onRemove: onRemoveFile ? () => onRemoveFile(file.uid) : undefined,
      }))
    : (docs ?? []).map((doc, index) => ({
        key: `${doc.fileId ?? 'legacy'}-${index}-${doc.fileName}`,
        fileName: doc.fileName,
        fileId: doc.fileId ?? null,
        source: doc.source ?? undefined,
        isPending: false,
        isLegacy: !doc.fileId,
        onView: () => openSupportingDoc(doc),
        onRemove: undefined,
      }));

  if (items.length === 0) {
    return <Text type="secondary">{emptyText}</Text>;
  }

  return (
    <List
      bordered
      size="small"
      dataSource={items}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Button
              key={`view-${item.key}`}
              type="link"
              icon={<EyeOutlined />}
              onClick={() => void item.onView()}
              disabled={item.isLegacy}
            >
              View
            </Button>,
            ...(item.fileId
              ? [
                  <Button
                    key={`download-${item.key}`}
                    type="link"
                    icon={<DownloadOutlined />}
                    onClick={() =>
                      void downloadSupportingDoc({
                        fileId: item.fileId,
                        fileName: item.fileName,
                        source: item.source,
                      })
                    }
                  >
                    Download
                  </Button>,
                ]
              : []),
            ...(item.onRemove
              ? [
                  <Button
                    key={`remove-${item.key}`}
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={item.onRemove}
                  >
                    Remove
                  </Button>,
                ]
              : []),
          ]}
        >
          <div
            style={{
              width: '100%',
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                {getDocumentIcon(item.fileName)}
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                  flex: 1,
                  minWidth: 0,
                  minHeight: 24,
                }}
              >
                {item.isLegacy ? (
                  <Text style={{ lineHeight: 1.5 }}>{item.fileName}</Text>
                ) : (
                  <Link onClick={() => void item.onView()} style={{ lineHeight: 1.5 }}>
                    {item.fileName}
                  </Link>
                )}
                {item.source && (
                  <Tag color={getSupportingDocSourceColor(item.source)}>
                    {supportingDocSourceLabel[item.source]}
                  </Tag>
                )}
              </div>
            </div>
            {(item.isPending || item.isLegacy) && (
              <div style={{ paddingLeft: 30, marginTop: 4 }}>
                <Space size={8} wrap>
                  {item.isPending && <Text type="secondary">Pending upload until action is confirmed</Text>}
                  {item.isLegacy && <Text type="secondary">Legacy attachment</Text>}
                </Space>
              </div>
            )}
          </div>
        </List.Item>
      )}
    />
  );
}
