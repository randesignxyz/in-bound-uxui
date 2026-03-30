import { PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import {
  Button,
  Descriptions,
  Drawer,
  Image,
  Input,
  InputNumber,
  Space,
  Steps,
  Tag,
  Timeline,
  Typography,
  Upload,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import SparePartImage from '../spare-part-request/SparePartImage';
import type { RequestDetailData, ReturnStatus } from '../spare-part-return/data';
import { SparePartReturnAPI } from '../spare-part-return/service';
import { RequestActions } from '@/services/apiGateway';
import { getServiceUrl } from '@/services/ApiUrl';
import { message } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { SparePartWarehouseReturnAPI } from '../spare-part-warehouse/service.return';

const { Title } = Typography;
const MAX_ATTACHMENTS = 3;
const ATTACHMENT_CARD_SIZE = 56;
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

// Internal UI status for map keys (keeping these to avoid breaking UI logic)
export type DrawerReturnStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Receiving'
  | 'In Progress'
  | 'Completed'
  | 'Partially Returned';

interface ReturnItem {
  id: string | number;
  itemId?: number;
  imageId?: string;
  image?: string;
  productId: string;
  partName?: string;
  name: string;
  usedQty: number;
  qtyToReturn: number;
  status?: string;
  receivedQty?: number;
  goodQty?: number;
  damagedQty?: number;
  itemRemark?: string;
  images?: string[];
}

interface ReturnData {
  id?: string;
  requestId?: string;
  type?: string;
  requestDate?: string;
  status?: ReturnStatus;
  totalItems?: number;
  approvedBy?: string;
  items?: ReturnItem[];
}

const STATUS_STEPS = ['Pending', 'Approved', 'Receiving', 'Completed'];

const STATUS_STEP_MAP: Record<ReturnStatus, number> = {
  Pending: 0,
  Approved: 1,
  Rejected: 1,
  Receiving: 2,
  // 'In Progress' is a UI state
  Completed: 3,
};

const statusColorMap: Record<ReturnStatus | string, string> = {
  Pending: 'processing',
  Approved: 'warning',
  Rejected: 'error',
  Receiving: 'processing',
  Completed: 'success',
};

const statusLabelMap: Record<ReturnStatus | string, string> = {
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Receiving: 'Receiving',
  Completed: 'Completed',
};

const formatDateTime = (date?: string) => {
  if (!date) return '—';
  return new Date(date).toLocaleString();
};

const getStepStatus = (
  effectiveStatus: ReturnStatus,
  stepIndex: number,
  currentStep: number,
): 'finish' | 'process' | 'wait' | 'error' => {
  if (effectiveStatus === 'Rejected' && stepIndex === 1) return 'error';
  if (stepIndex < currentStep) return 'finish';
  if (stepIndex === currentStep) return 'process';
  return 'wait';
};

interface ReturnsListDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  data: RequestDetailData | null;
  returnId?: number | null;
}

export default function ReturnsListDrawer({
  open,
  onClose,
  onSuccess,
  data,
  returnId,
}: ReturnsListDrawerProps) {
  const access = useAccess();
  const [loading, setLoading] = useState(false);
  const [statusOverride, setStatusOverride] = useState<ReturnStatus | null>(null);

  const requestAction: RequestActions = {
    start: (name) => console.log(`Loading: ${name}`),
    end: (status) => console.log(status),
  };

  const [fetchedData, setFetchedData] = useState<RequestDetailData | null>(null);

  const effectiveStatus: ReturnStatus = useMemo(() => {
    if (statusOverride) return statusOverride as any;
    if (fetchedData?.status) {
      return fetchedData.status;
    }
    return (data?.status as any) ?? 'Pending';
  }, [statusOverride, fetchedData?.status, data?.status]);

  const isGlobalReadOnly = useMemo(() => {
    return ['Completed', 'Rejected', 'Pending'].includes(effectiveStatus);
  }, [effectiveStatus]);

  const checkReadOnly = (record: ReturnItem) => {
    if (isGlobalReadOnly) return true;
    if (effectiveStatus === 'Receiving') {
      return (record.receivedQty ?? 0) >= record.qtyToReturn;
    }
    return false;
  };

  const tableItems: ReturnItem[] = useMemo(() => {
    if (fetchedData?.items?.length) {
      return fetchedData.items.map((i, idx) => {
        const rowId = i.return_item_id ?? i.no ?? idx + 1;
        return {
          id: rowId,
          itemId: i.return_item_id,
          imageId: i.imageId,
          image: i.image,
          productId: i.product_id,
          name: i.item_name,
          partName: i.item_name,
          usedQty: i.used_quantity ?? 0,
          qtyToReturn: i.quantity_to_return ?? 0,
          receivedQty: i.received_qty,
          goodQty: i.good_qty,
          damagedQty: i.damaged_qty,
          itemRemark: i.remark,
          images: i.images,
        };
      });
    }
    // Fallback to data?.items if no fetchedData
    const items = data?.items ?? [];
    return items.map((i: any, idx: number) => ({
      ...i,
      id: i.id ?? idx + 1,
      qtyToReturn: i.qtyToReturn ?? i.quantity_to_return ?? 0,
      usedQty: i.usedQty ?? i.used_quantity ?? 0,
      productId: i.productId ?? i.product_id ?? '',
      name: i.name ?? i.item_name ?? '',
    }));
  }, [fetchedData, data?.items]);

  const currentStep = STATUS_STEP_MAP[effectiveStatus];

  const [attachmentMap, setAttachmentMap] = useState<Record<string, UploadFile[]>>({});
  const [goodQtyMap, setGoodQtyMap] = useState<Record<string, number>>({});
  const [damagedQtyMap, setDamagedQtyMap] = useState<Record<string, number>>({});
  const [remarkMap, setRemarkMap] = useState<Record<string, string>>({});
  const [returnRemark, setReturnRemark] = useState('');

  // ── Single shared preview state ──
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // Same enrichment as doc 3 — only generate base64 if needed, always keep existing
  const enrichUploadFile = async (file: UploadFile): Promise<UploadFile> => {
    if (file.url || file.thumbUrl || file.preview || !file.originFileObj) {
      return file;
    }
    const preview = await getBase64(file.originFileObj as FileType);
    return {
      ...file,
      preview,
      thumbUrl: preview,
      status: 'done',
    };
  };

  const fetchDetail = async () => {
    if (!returnId) return;
    setLoading(true);
    try {
      const res = await SparePartReturnAPI(requestAction).fetch_spare_part_by_return_id(returnId);
      const item = Array.isArray(res) ? res[0] : res;
      if (item) {
        const mapped: RequestDetailData = {
          no: item.no ?? returnId,
          request_id: item.request_id ?? '',
          total_items: item.total_items ?? 0,
          request_date: item.request_date ?? '',
          status:
            item.state === 'APPROVED'
              ? 'Approved'
              : item.state === 'REJECTED'
              ? 'Rejected'
              : item.state === 'COMPLETE' || item.state === 'COMPLETED'
              ? 'Completed'
              : item.state === 'RECEIVING'
              ? 'Receiving'
              : 'Pending',
          remarks: item.remarks ?? '',
          items: (item.items ?? []).map((i: any) => ({
            no: i.no,
            return_item_id: i.return_item_id,
            imageId: i.imageId ?? i.image_id,
            image: i.image ?? undefined,
            product_id: i.product_id,
            request_id: i.request_id,
            item_name: i.item_name,
            uom: i.uom,
            quantity_to_return: i.quantity_to_return,
            used_quantity: i.used_quantity,
            total: i.total,
            received_qty: i.received_qty,
            good_qty: i.good_qty,
            damaged_qty: i.damaged_qty,
            remark: i.remark,
            images: i.images,
          })),
          activities: (item.activities ?? []).map((a: any) => ({
            label: a.label,
            description: a.description,
            date: a.date,
            dot: a.dot === 'pending' ? 'pending' : 'default',
          })),
        };
        setFetchedData(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch return detail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && returnId) {
      fetchDetail();
    } else {
      setFetchedData(null);
    }
  }, [open, returnId]);

  // Preview handler — opens the shared <Image> portal below
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }
    setPreviewImage(file.url || file.thumbUrl || (file.preview as string) || '');
    setPreviewOpen(true);
    setPreviewTitle(file.name || '');
  };

  const handleAttachmentChange =
    (itemId: string | number): UploadProps['onChange'] =>
    async ({ fileList: newFileList }) => {
      const enriched = await Promise.all(newFileList.map(enrichUploadFile));
      setAttachmentMap((prev) => ({
        ...prev,
        [String(itemId)]: enriched.slice(0, MAX_ATTACHMENTS),
      }));
    };

  const handleRemoveAttachment = (itemId: string | number, uid: string) => {
    setAttachmentMap((prev) => {
      const key = String(itemId);
      return { ...prev, [key]: (prev[key] ?? []).filter((f) => f.uid !== uid) };
    });
  };
  const handleApproved = () => {
    if (!returnId) return;
    const service = SparePartReturnAPI(requestAction);
    service.warehouse_approve_spare_part_return(returnId, 'APPROVE').then((res: any) => {
      if (res) {
        message.success('Approved successfully');
        onClose?.();
      }
    });
  };
  const handleRejected = () => {
    if (!returnId) return;
    const service = SparePartReturnAPI(requestAction);
    service.warehouse_approve_spare_part_return(returnId, 'REJECT').then((res: any) => {
      if (res) {
        message.success('Rejected successfully');
        onClose?.();
      }
    });
  };
  const handleReplaceAttachment = async (
    itemId: string | number,
    fileIndex: number,
    nextFile: UploadFile,
  ) => {
    const enriched = await enrichUploadFile(nextFile);
    setAttachmentMap((prev) => {
      const key = String(itemId);
      const updated = [...(prev[key] ?? [])];
      updated[fileIndex] = enriched;
      return { ...prev, [key]: updated };
    });
  };

  const uploadFilesToFileService = async (files: UploadFile[]): Promise<string[]> => {
    const token = localStorage.getItem('accessToken');
    const uploadUrl = `${getServiceUrl('FILE')}/upload`;
    const ids: string[] = [];
    for (const file of files) {
      if (file.response && typeof file.response === 'string' && !file.response.startsWith('data:')) {
        ids.push(file.response);
        continue;
      }
      if (!file.originFileObj) continue;
      const formData = new FormData();
      formData.append('file', file.originFileObj as File);
      try {
        const res = await fetch(uploadUrl, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
        const fileId: string = await res.text();
        if (fileId) ids.push(fileId.replace(/"/g, '').trim());
      } catch (err) {
        console.error('Failed to upload damage image', err);
      }
    }
    return ids;
  };

  const handleSave = async () => {
    if (!returnId) return;
    setLoading(true);
    try {
      const itemsWithImages = await Promise.all(
        tableItems.map(async (item) => {
          const key = String(item.id);
          const files = attachmentMap[key] ?? [];
          const damageImage = files.length > 0 ? await uploadFilesToFileService(files) : [];
          const alreadyReceived = item.receivedQty ?? 0;
          const remaining = item.qtyToReturn - alreadyReceived;
          const goodQty = goodQtyMap[key] ?? remaining;
          const damagedQty = damagedQtyMap[key] ?? 0;
          if (goodQty + damagedQty <= 0) return null as any;
          return {
            returnItemId: item.itemId ?? Number(item.id),
            receivedProductId: item.productId,
            receivedQty: goodQty + damagedQty,
            goodQty,
            damagedQty,
            remark: remarkMap[key] ?? '',
            damageMessages: damagedQty > 0 ? (remarkMap[key] ?? '') : undefined,
            damageImage: damageImage.length > 0 ? damageImage : undefined,
          };
        }),
      );
      const itemsToConfirm = itemsWithImages.filter((i) => i !== null);
      if (!itemsToConfirm.length) {
        message.warning('No quantities entered for receipt');
        setLoading(false);
        return;
      }
      const service = SparePartWarehouseReturnAPI(requestAction);
      await service.warehouse_confirm_return(returnId, returnRemark, itemsToConfirm);
      message.success('Return confirmed successfully');
      await fetchDetail();
      onSuccess?.();
      setGoodQtyMap({});
      setDamagedQtyMap({});
      setRemarkMap({});
      setAttachmentMap({});
      setReturnRemark('');
    } catch (e) {
      console.error('Save failed', e);
      message.error('Failed to confirm return');
    } finally {
      setLoading(false);
    }
  };

  // ── Upload add button (same as doc 3) ──
  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const columnsReturn: ProColumns<ReturnItem>[] = [
    { title: 'No', dataIndex: 'id', key: 'number_id' },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image_key',
      render: (_: unknown, record: ReturnItem) => (
        <SparePartImage
          imageId={record.imageId}
          src={record.image}
          alt={record.partName || record.productId}
          size={48}
        />
      ),
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Product ID',
      dataIndex: 'productId',
      key: 'product_id',
      render: (_: unknown, entity: ReturnItem) => (
        <Typography.Link>{entity.productId}</Typography.Link>
      ),
    },
    { title: 'Name', dataIndex: 'name', key: 'name_product', ellipsis: true },
    { title: 'UoM', dataIndex: 'UoM', key: 'UoM' },
    { title: 'Used QTY', dataIndex: 'usedQty', key: 'used_key', align: 'center' as const },
    {
      title: 'QTY to Return',
      dataIndex: 'qtyToReturn',
      key: 'qty_key_return',
      align: 'center' as const,
      render: (_: unknown, record: ReturnItem) => {
        const isPartial = effectiveStatus === 'Receiving';
        const received = record.receivedQty ?? 0;
        const total = record.qtyToReturn;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#d4a574', fontSize: 16 }}>{total}</span>
            {isPartial && (
              <Tag color={received >= total ? 'success' : 'processing'} style={{ fontSize: 10, marginTop: 4 }}>
                {received} / {total} Received
              </Tag>
            )}
          </div>
        );
      },
    },
    ...(access.canSpfWarehouseStaff
      ? [
          {
            title: 'Good',
            key: 'good_amount',
            render: (_: unknown, record: ReturnItem) => {
              const key = String(record.id);
              const alreadyReceived = record.receivedQty ?? 0;
              const remaining = record.qtyToReturn - alreadyReceived;
              if (checkReadOnly(record)) {
                return <span style={{ fontWeight: 600, color: '#52c41a' }}>{record.goodQty ?? '—'}</span>;
              }
              return (
                <InputNumber
                  min={0} max={remaining} defaultValue={remaining}
                  value={goodQtyMap[key] ?? remaining}
                  style={{ width: '100%' }}
                  onChange={(v) => setGoodQtyMap((prev) => ({ ...prev, [key]: v ?? 0 }))}
                />
              );
            },
            width: 90,
          },
          {
            title: 'Damaged',
            key: 'damaged_amount',
            render: (_: unknown, record: ReturnItem) => {
              const key = String(record.id);
              const alreadyReceived = record.receivedQty ?? 0;
              const remaining = record.qtyToReturn - alreadyReceived;
              if (checkReadOnly(record)) {
                return (
                  <span style={{ fontWeight: 600, color: record.damagedQty ? '#ff4d4f' : '#8c8c8c' }}>
                    {record.damagedQty ?? '—'}
                  </span>
                );
              }
              return (
                <InputNumber
                  min={0} max={remaining} defaultValue={0}
                  value={damagedQtyMap[key] ?? 0}
                  style={{ width: '100%' }}
                  onChange={(v) => setDamagedQtyMap((prev) => ({ ...prev, [key]: v ?? 0 }))}
                />
              );
            },
            width: 90,
          },
          {
            title: 'Remarks',
            key: 'messages',
            render: (_: unknown, record: ReturnItem) => {
              const key = String(record.id);
              if (checkReadOnly(record)) {
                return <Typography.Text type="secondary">{record.itemRemark || '—'}</Typography.Text>;
              }
              return (
                <Input.TextArea
                  rows={1} placeholder="Enter any notes"
                  value={remarkMap[key] ?? ''}
                  onChange={(e) => setRemarkMap((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              );
            },
            width: 180,
          },
          {
            title: 'Attachments',
            key: 'broken_image',
            render: (_: unknown, record: ReturnItem) => {
              const alreadyReceivedImgs = record.images ?? [];
              const isLineReadOnly = checkReadOnly(record);

              if (isLineReadOnly && alreadyReceivedImgs.length === 0) {
                return <Typography.Text type="secondary">—</Typography.Text>;
              }

              const rowFiles = attachmentMap[String(record.id)] ?? [];

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                  {/* Already-received images */}
                  {alreadyReceivedImgs.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {alreadyReceivedImgs.map((fileId) => (
                        <SparePartImage key={fileId} imageId={fileId} alt={record.name} size={ATTACHMENT_CARD_SIZE} />
                      ))}
                    </div>
                  )}

                  {/* New-batch uploader — follows doc 3 pattern exactly */}
                  {!isLineReadOnly && (
                    <>
                      <style>{`
                        .compact-attachment-upload .ant-upload-select,
                        .compact-attachment-upload .ant-upload-list-item-container {
                          width: ${ATTACHMENT_CARD_SIZE}px !important;
                          height: ${ATTACHMENT_CARD_SIZE}px !important;
                        }
                        .compact-attachment-upload .ant-upload-list-item {
                          padding: 3px !important;
                          border-radius: 10px !important;
                        }
                        .compact-attachment-upload .ant-upload-list-item-thumbnail img {
                          object-fit: cover;
                        }
                        .compact-attachment-upload .ant-upload-list {
                          display: flex;
                          flex-wrap: wrap;
                          gap: 8px;
                          margin: 0;
                        }
                        .compact-attachment-upload .ant-upload-list-item-container {
                          margin: 0 !important;
                        }
                        .compact-attachment-upload .ant-upload.ant-upload-select {
                          border-radius: 10px !important;
                        }
                      `}</style>
                      <div
                        className="compact-attachment-upload"
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 4 }}
                      >
                        <Upload
                          accept="image/*"
                          beforeUpload={() => false}
                          listType="picture-card"
                          fileList={rowFiles}
                          maxCount={MAX_ATTACHMENTS}
                          onPreview={handlePreview}
                          onChange={handleAttachmentChange(record.id)}
                          // KEY: use itemRender (same as doc 3) to own the
                          // delete & preview buttons — bypasses antd's status check
                          itemRender={(originNode, file) => {
                            const fileIndex = rowFiles.findIndex((f) => f.uid === file.uid);
                            const src = file.thumbUrl || file.url || (file.preview as string) || '';

                            return (
                              <div
                                style={{
                                  position: 'relative',
                                  width: ATTACHMENT_CARD_SIZE,
                                  height: ATTACHMENT_CARD_SIZE,
                                  borderRadius: 8,
                                  overflow: 'hidden',
                                  border: '1px solid #d9d9d9',
                                }}
                              >
                                {/* Thumbnail */}
                                {src ? (
                                  <img
                                    src={src}
                                    alt={file.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                  />
                                ) : (
                                  // Fallback: let antd render its default node while no preview yet
                                  <div style={{ width: '100%', height: '100%' }}>{originNode}</div>
                                )}

                                {/* Hover overlay with preview + delete */}
                                <div
                                  className="upload-item-actions"
                                  style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'rgba(0,0,0,0.45)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    borderRadius: 8,
                                  }}
                                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0')}
                                >
                                  {/* Preview */}
                                  <EyeOutlined
                                    style={{ color: '#fff', fontSize: 14, cursor: 'pointer' }}
                                    onClick={() => handlePreview(file)}
                                  />
                                  {/* Delete */}
                                  <DeleteOutlined
                                    style={{ color: '#fff', fontSize: 14, cursor: 'pointer' }}
                                    onClick={() => handleRemoveAttachment(record.id, file.uid)}
                                  />
                                </div>
                              </div>
                            );
                          }}
                        >
                          {rowFiles.length >= MAX_ATTACHMENTS ? null : uploadButton}
                        </Upload>
                      </div>
                    </>
                  )}
                </div>
              );
            },
            align: 'center' as const,
            width: 260,
          },
          {
            title: 'Action',
            key: 'action',
            render: (_: unknown, record: ReturnItem) =>
              !checkReadOnly(record) ? (
                <Space>
                  <Button type="primary" size="small" onClick={handleSave}>Save</Button>
                </Space>
              ) : null,
            width: 100,
          },
        ]
      : []),
  ];

  return (
    <Drawer
      title={<span style={{ fontSize: 16, letterSpacing: '0.5px' }}>Return Request Details</span>}
      width="100%"
      open={open}
      onClose={onClose}
      styles={{ body: { backgroundColor: '#fafafa', padding: '24px' } }}
      footer={
        !isGlobalReadOnly ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space>
              <Button onClick={onClose}>Close</Button>
              <Button type="primary" loading={loading} onClick={handleSave}>Received</Button>
            </Space>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>Close</Button>
          </div>
        )
      }
    >
      {access.canSpfApprover && effectiveStatus === 'Pending' && (
        <div style={{ marginBottom: 24, textAlign: 'right' }}>
          <Space>
            <Button
              danger
              onClick={handleRejected}
            >
              Reject
            </Button>
            <Button
              type="primary"
              onClick={handleApproved}
            >
              Approve
            </Button>
          </Space>
        </div>
      )}
      <div style={{ marginBottom: 24 }}>
        <Descriptions
          column={3} size="small"
          labelStyle={{ fontWeight: 600, color: '#595959', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: 12 }}
          contentStyle={{ fontWeight: 500, color: '#262626' }}
        >
          <Descriptions.Item label="No">{fetchedData?.no ?? data?.no ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Return ID">{fetchedData?.request_id ?? data?.request_id ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Total Items">{fetchedData?.total_items ?? data?.total_items ?? 0}</Descriptions.Item>
          <Descriptions.Item label="Return Date">{formatDateTime(fetchedData?.request_date ?? data?.request_date)}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusColorMap[effectiveStatus]} bordered={false}>{statusLabelMap[effectiveStatus]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Remarks">{fetchedData?.remarks || '—'}</Descriptions.Item>
        </Descriptions>
      </div>

      <div>
        <Title level={5} style={{ marginBottom: 16 }}>Status Timeline</Title>
        <Steps
          current={currentStep}
          size="default"
          items={STATUS_STEPS.map((title, index) => {
            const stepStatus = getStepStatus(effectiveStatus, index, currentStep);
            const label = index === STATUS_STEPS.length - 1 && currentStep === index
              ? statusLabelMap[effectiveStatus] : title;
            const description =
              index === 1 && effectiveStatus === 'Rejected' ? 'Rejected'
              : undefined;
            return {
              title: <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>,
              description: description ? <span style={{ fontSize: 12, color: '#8c8c8c' }}>{description}</span> : undefined,
              status: stepStatus,
            };
          })}
        />
      </div>

      <div>
        <Title level={5} style={{ marginBottom: 16, marginTop: 24 }}>Return Items</Title>
        <ProTable<ReturnItem>
          columns={columnsReturn}
          dataSource={tableItems}
          loading={loading}
          rowKey="id"
          pagination={false}
          search={false}
          options={false}
          tableLayout="auto"
          style={{ backgroundColor: 'transparent' }}
          rowClassName={() => 'custom-row'}
        />
      </div>

      <Title level={5} style={{ marginBottom: 16 }}>Recent Activities</Title>
      <Timeline
        style={{ marginBottom: 24 }}
        items={(fetchedData?.activities ?? []).map((a) => ({
          color: a.dot === 'pending' ? 'gray' : 'blue',
          children: (
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <Typography.Text strong>{a.label}</Typography.Text>
                <br />
                <Typography.Text type="secondary">{a.description}</Typography.Text>
              </div>
              {a.date && <Typography.Text type="secondary">{a.date}</Typography.Text>}
            </div>
          ),
        }))}
      />

      {/* Single shared preview portal — outside the table */}
      {previewImage && (
        <Image
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
          alt={previewTitle}
          style={{ display: 'none' }}
        />
      )}
    </Drawer>
  );
}