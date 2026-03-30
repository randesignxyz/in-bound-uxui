import { DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
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
import { getUploadFileObjectUrlV2, RequestActions } from '@/services/apiGateway';
import { getServiceUrl } from '@/services/ApiUrl';
import { SparePartWarehouseReturnAPI } from './service.return';
import { message } from 'antd';

const { Title } = Typography;
const MAX_ATTACHMENTS = 3;
const ATTACHMENT_CARD_SIZE = 56;
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * Full lifecycle:
 *  return → approved | rejected
 *         ↓ (if approved)
 *     in_progress → completed | partially_returned
 */
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
  itemId?: number; // use for primary key for DB calls
  imageId?: string;
  image?: string;
  productId: string;
  partName?: string;
  name: string;
  usedQty: number;
  qtyToReturn: number;
  status?: string;
  // Warehouse receipt fields (populated when COMPLETED)
  receivedQty?: number;
  goodQty?: number;
  damagedQty?: number;
  itemRemark?: string;
  images?: string[];  // file IDs
}

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Timeline steps shown in the drawer.
 * Step 0: Return (submitted)
 * Step 1: Approved / Rejected
 * Step 2: In Progress
 * Step 3: Completed / Partially Returned
 */
const STATUS_STEPS = ['Return', 'Approved', 'Receiving', 'Completed'];

/**
 * Maps each status to which step index it sits on.
 */
const STATUS_STEP_MAP: Record<ReturnStatus | string, number> = {
  Pending: 0,
  Approved: 1,
  Rejected: 1,
  Receiving: 2,
  'In Progress': 2,
  Completed: 3,
  'Partially Returned': 3,
};

const statusColorMap: Record<ReturnStatus | string, string> = {
  Pending: 'processing',
  Approved: 'warning',
  Rejected: 'error',
  Receiving: 'processing',
  'In Progress': 'processing',
  Completed: 'success',
  'Partially Returned': 'warning',
};

const statusLabelMap: Record<ReturnStatus | string, string> = {
  Pending: 'Return',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Receiving: 'Receiving',
  'In Progress': 'In Progress',
  Completed: 'Completed',
  'Partially Returned': 'Partially Returned',
};
// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDateTime = (date?: string) => {
  if (!date) return '—';
  return new Date(date).toLocaleString();
};

/**
 * Determines the Ant Design Steps `status` for each step node.
 *
 * Special cases:
 *  - `rejected`          → step 1 shows as "error"
 *  - `partially_returned`→ step 3 shows as "finish" (not error, it's a partial success)
 *  - active step         → "process"
 *  - past steps          → "finish"
 *  - future steps        → "wait"
 */
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReturnsListDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // call parent reload after successful record
  data: RequestDetailData | null;
  returnId?: number | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReturnsListDrawer({ open, onClose, onSuccess, data, returnId }: ReturnsListDrawerProps) {
  const access = useAccess();
  const [loading, setLoading] = useState(false);
  const [statusOverride] = useState<ReturnStatus | null>(null);

  const requestAction: RequestActions = {
    start: (name) => console.log(`Loading: ${name}`),
    end: (status) => console.log(status),
  };

  const [fetchedData, setFetchedData] = useState<RequestDetailData | null>(null);

  const effectiveStatus: ReturnStatus = useMemo(() => {
    if (statusOverride) return statusOverride as any;
    // fetchedData.status is 'Pending' | 'Approved' | 'Rejected' | 'Completed'
    if (fetchedData?.status) {
      return fetchedData.status;
    }
    return (data?.status as any) ?? 'Pending';
  }, [statusOverride, fetchedData?.status, data?.status]);

  const isGlobalReadOnly = useMemo(() => {
    return ['Completed', 'Rejected', 'Pending'].includes(effectiveStatus);
  }, [effectiveStatus]);

  const canEditAttachments = useMemo(() => {
    return ['Receiving', 'Completed'].includes(effectiveStatus);
  }, [effectiveStatus]);

  const canSubmitChanges = useMemo(() => {
    return access.canSpfWarehouseStaff && canEditAttachments;
  }, [access.canSpfWarehouseStaff, canEditAttachments]);

  const checkReadOnly = (record: ReturnItem) => {
    if (isGlobalReadOnly) return true;
    if (effectiveStatus === 'Receiving') {
      return (record.receivedQty ?? 0) >= record.qtyToReturn;
    }
    return false;
  };

  // Map API items (fetchedData) to ReturnItem shape used by columnsReturn
  const tableItems: ReturnItem[] = useMemo(() => {
    if (fetchedData?.items?.length) {
      return fetchedData.items.map((i, idx) => {
        const rowId = i.return_item_id ?? i.no ?? idx + 1;
        return {
          id: rowId,
          itemId: i.return_item_id,
          image: i.image,
          productId: i.product_id,
          name: i.item_name,
          partName: i.item_name,
          usedQty: i.used_quantity ?? 0,
          qtyToReturn: i.quantity_to_return ?? 0,
          // Receipt fields from completed returns
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
  // ─── Upload State ─────────────────────────────────
  const [attachmentMap, setAttachmentMap] = useState<Record<string, UploadFile[]>>({});
  // ─── Per-row inspection state ─────────────────────
  const [goodQtyMap,    setGoodQtyMap]    = useState<Record<string, number>>({});
  const [damagedQtyMap, setDamagedQtyMap] = useState<Record<string, number>>({});
  const [remarkMap,     setRemarkMap]     = useState<Record<string, string>>({});
  const [returnRemark,  setReturnRemark]  = useState('');

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // Convert file to base64 (for preview)
  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

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
  // Preview handler
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    if (!file.url && !file.preview && typeof file.response === 'string') {
      try {
        file.url = await getUploadFileObjectUrlV2()(file.response);
      } catch (error) {
        console.error('Failed to preview uploaded image', error);
      }
    }

    setPreviewImage(file.url || file.thumbUrl || (file.preview as string) || '');
    setPreviewOpen(true);
    setPreviewTitle(file.name || '');
  };
  
  const handleAttachmentChange =
    (itemId: string | number): UploadProps['onChange'] =>
    async ({ fileList: newFileList }) => {
      const normalizedFiles = await Promise.all(newFileList.map(enrichUploadFile));

      setAttachmentMap((prev) => ({
        ...prev,
        [String(itemId)]: normalizedFiles.slice(0, MAX_ATTACHMENTS),
      }));
    };

  const handleRemoveAttachment = (
    itemId: string | number,
    uid: string,
    currentFiles: UploadFile[] = [],
  ) => {
    setAttachmentMap((prev) => {
      const itemKey = String(itemId);
      const sourceFiles = prev[itemKey] ?? currentFiles;
      return {
        ...prev,
        [itemKey]: sourceFiles.filter((file) => file.uid !== uid),
      };
    });
  };

  const getInitialAttachmentFiles = (record: ReturnItem): UploadFile[] =>
    (record.images ?? []).map((fileId, index) => ({
      uid: `existing-${record.id}-${fileId}-${index}`,
      name: `image-${index + 1}`,
      status: 'done',
      response: fileId,
    }));

  const getRowAttachmentFiles = (record: ReturnItem): UploadFile[] =>
    attachmentMap[String(record.id)] ?? getInitialAttachmentFiles(record);

  const isExistingImageFile = (file: UploadFile) => typeof file.response === 'string' && !file.originFileObj;

  const areImageListsEqual = (current: string[], next: string[]) =>
    current.length === next.length && current.every((id, index) => id === next[index]);

  // ─── Upload damage images to FILE microservice ───────────────────
  const uploadFilesToFileService = async (files: UploadFile[]): Promise<string[]> => {
    const token = localStorage.getItem('accessToken');
    const uploadUrl = `${getServiceUrl('FILE')}/upload`;
    const ids: string[] = [];

    for (const file of files) {
      // Already uploaded (server ID stored in file.response or file.url is a real URL)
      if (file.response && typeof file.response === 'string' && !file.response.startsWith('data:')) {
        ids.push(file.response);
        continue;
      }
      // Skip if no raw file object
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
      // Upload all damage images per row first, collect server IDs
      const itemsWithImages = await Promise.all(
        tableItems.map(async (item) => {
          const key = String(item.id);
          const files = getRowAttachmentFiles(item);
          const existingImages = item.images ?? [];
          const damageImage = files.length > 0 ? await uploadFilesToFileService(files) : [];
          const imageChanged = areImageListsEqual(existingImages, damageImage) === false;

          // Resolve defaults the same way the InputNumber columns do
          const alreadyReceived = item.receivedQty ?? 0;
          const remaining = item.qtyToReturn - alreadyReceived;
          const goodQty    = goodQtyMap[key]    ?? remaining;
          const damagedQty = damagedQtyMap[key] ?? 0;

          if (goodQty + damagedQty <= 0 && !imageChanged) return null as any;

          return {
            returnItemId: item.itemId ?? Number(item.id),
            receivedProductId: item.productId,
            receivedQty: goodQty + damagedQty,
            goodQty,
            damagedQty,
            remark: remarkMap[key] ?? '',
            damageMessages: damagedQty > 0 ? (remarkMap[key] ?? '') : undefined,
            damageImage: imageChanged || damageImage.length > 0 ? damageImage : undefined,
          };
        })
      );

      const itemsToConfirm = itemsWithImages.filter(i => i !== null);
      if (!itemsToConfirm.length) {
        message.warning('No quantities or image changes to save');
        setLoading(false);
        return;
      }

      const service = SparePartWarehouseReturnAPI(requestAction);
      await service.warehouse_confirm_return(returnId, returnRemark, itemsToConfirm);
      message.success('Return confirmed successfully');

      // ─── Refresh Logic ───
      await fetchDetail();        // Refresh drawer internal state
      onSuccess?.();               // Notify parent list to reload
      
      // Clear current batch inputs
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

  const handleReceived = handleSave;

  const columnsReturn: ProColumns<ReturnItem>[] = [
    {
      title: 'No',
      dataIndex: 'id',
      key: 'number_id',
    },
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
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name_product',
      ellipsis: true,
    },
    {
      title: 'UoM',
      dataIndex: 'UoM',
      key: 'UoM',
    },
    {
      title: 'Used QTY',
      dataIndex: 'usedQty',
      key: 'used_key',
      align: 'center' as const,
    },
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
            <span style={{ fontWeight: 600, color: '#d4a574', fontSize: 16 }}>
              {total}
            </span>
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
              const defaultVal = remaining; // Default to remaining for partial receipts
              
              if (checkReadOnly(record)) {
                return (
                  <span style={{ fontWeight: 600, color: '#52c41a' }}>
                    {record.goodQty ?? '—'}
                  </span>
                );
              }
              return (
                <InputNumber
                  min={0}
                  max={remaining}
                  defaultValue={defaultVal}
                  value={goodQtyMap[key] ?? defaultVal}
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
              const defaultVal = 0; // Default damaged to 0 for partial receipts
              
              if (checkReadOnly(record)) {
                return (
                  <span style={{ fontWeight: 600, color: record.damagedQty ? '#ff4d4f' : '#8c8c8c' }}>
                    {record.damagedQty ?? '—'}
                  </span>
                );
              }
              return (
                <InputNumber
                  min={0}
                  max={remaining}
                  defaultValue={defaultVal}
                  value={damagedQtyMap[key] ?? defaultVal}
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
                  rows={1}
                  placeholder="Enter any notes"
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
              const canEditLineAttachments = canEditAttachments;
              const rowFiles = getRowAttachmentFiles(record);

              if (!canEditLineAttachments && rowFiles.length === 0) {
                return <Typography.Text type="secondary">—</Typography.Text>;
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                  {canEditLineAttachments ? (
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
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: 4,
                        }}
                      >
                        <Upload
                          accept="image/*"
                          beforeUpload={() => false}
                          listType="picture-card"
                          fileList={rowFiles}
                          maxCount={MAX_ATTACHMENTS}
                          onPreview={handlePreview}
                          onChange={handleAttachmentChange(record.id)}
                          itemRender={(originNode, file) => {
                            const src = file.thumbUrl || file.url || (file.preview as string) || '';
                            const existingFileId = isExistingImageFile(file) ? String(file.response) : undefined;

                            return (
                              <div
                                style={{
                                  position: 'relative',
                                  width: ATTACHMENT_CARD_SIZE,
                                  height: ATTACHMENT_CARD_SIZE,
                                  borderRadius: 8,
                                  overflow: 'hidden',
                                  border: '1px solid #d9d9d9',
                                  background: '#fafafa',
                                }}
                              >
                                {src ? (
                                  <img
                                    src={src}
                                    alt={file.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                  />
                                ) : existingFileId ? (
                                  <div style={{ width: '100%', height: '100%' }}>
                                    <SparePartImage
                                      imageId={existingFileId}
                                      alt={record.name}
                                      size={ATTACHMENT_CARD_SIZE}
                                    />
                                  </div>
                                ) : (
                                  <div style={{ width: '100%', height: '100%' }}>{originNode}</div>
                                )}

                                <div
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
                                  }}
                                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0')}
                                >
                                  <EyeOutlined
                                    style={{ color: '#fff', fontSize: 14, cursor: 'pointer' }}
                                    onClick={() => handlePreview(file)}
                                  />
                                  <DeleteOutlined
                                    style={{ color: '#fff', fontSize: 14, cursor: 'pointer' }}
                                    onClick={() => handleRemoveAttachment(record.id, file.uid, rowFiles)}
                                  />
                                </div>
                              </div>
                            );
                          }}
                          onRemove={(file) => {
                            handleRemoveAttachment(record.id, file.uid, rowFiles);
                          }}
                        >
                          {rowFiles.length < MAX_ATTACHMENTS && (
                            <div style={{ textAlign: 'center' }}>
                              <PlusOutlined style={{ fontSize: 16 }} />
                              <div style={{ marginTop: 4, fontSize: 10 }}>Add</div>
                            </div>
                          )}
                        </Upload>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {rowFiles.map((file) => {
                        const existingFileId = isExistingImageFile(file) ? String(file.response) : undefined;
                        return existingFileId ? (
                          <SparePartImage
                            key={file.uid}
                            imageId={existingFileId}
                            alt={record.name}
                            size={ATTACHMENT_CARD_SIZE}
                          />
                        ) : null;
                      })}
                    </div>
                  )}

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
              (!checkReadOnly(record) || canEditAttachments) ? (
                <Space>
                  <Button type="primary" size="small" onClick={handleSave}>
                    Save
                  </Button>
                </Space>
              ) : null,
            width: 100,
          },
        ]
      : []),
  ];

  return (
    <Drawer
      title={
        <span
          style={{
            fontSize: 16,
            letterSpacing: '0.5px',
          }}
        >
          Return Request Details
        </span>
      }
      width={'100%'}
      open={open}
      onClose={onClose}
      styles={{ body: { backgroundColor: '#fafafa', padding: '24px' } }}
      footer={
        canSubmitChanges ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space>
              <Button onClick={onClose}>Close</Button>
              <Button type="primary" loading={loading} onClick={handleReceived}>
                Received
              </Button>
            </Space>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>Close</Button>
          </div>
        )
      }
    >

      {/* ── Info Descriptions ── */}
      <div style={{ marginBottom: 24 }}>
        <Descriptions
          column={3}
          size="small"
          labelStyle={{
            fontWeight: 600,
            color: '#595959',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: 12,
          }}
          contentStyle={{ fontWeight: 500, color: '#262626' }}
        >
          <Descriptions.Item label="No">{fetchedData?.no ?? data?.no ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Return ID">{fetchedData?.request_id ?? data?.request_id ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Total Items">{fetchedData?.total_items ?? data?.total_items ?? 0}</Descriptions.Item>
          <Descriptions.Item label="Return Date">
            {formatDateTime(fetchedData?.request_date ?? data?.request_date)}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusColorMap[effectiveStatus]} bordered={false}>{statusLabelMap[effectiveStatus]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Remarks">{fetchedData?.remarks || '—'}</Descriptions.Item>
        </Descriptions>
      </div>

      {/* ── Status Timeline ── */}
      <div style={{}}>
        <Title level={5} style={{ marginBottom: 16 }}>
          Status Timeline
        </Title>

        <Steps
          current={currentStep}
          size="default"
          items={STATUS_STEPS.map((title, index) => {
            const stepStatus = getStepStatus(effectiveStatus, index, currentStep);

            // For the last step (index 3), show the precise label
            const label =
              index === STATUS_STEPS.length - 1 && currentStep === index
                ? statusLabelMap[effectiveStatus] // "Completed" or "Partially Returned"
                : title;

            // Description hint shown below each step node
            const description =
              index === 1 && effectiveStatus === 'Rejected'
                ? 'Rejected'
                : undefined;

            return {
              title: <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>,
              description: description ? (
                <span style={{ fontSize: 12, color: '#8c8c8c' }}>{description}</span>
              ) : undefined,
              status: stepStatus,
            };
          })}
        />
      </div>

      {/* ── Items Table ── */}
      <div style={{}}>
        <Title level={5} style={{ marginBottom: 16, marginTop: 24 }}>
          Return Items
        </Title>
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
      {/* _____ Timeline */}
      {/* - return (submitted)
      - approved / rejected
      - in progress if partially returned this status when warehousse checked items and fount some items not returned, if all items returned then status will be completed
       so this status until warehouse mark as completed 
       so in timetime has a table store logs + items return and completed items when ? 
       and there are many cases: that return like 1 request : 5 items but only 3 items returned and 2 items not returned , so status will be partially returned until requester return 2 items 
       then status will be completed, so in timeline status will be in progress until all items returned then status will be completed
      - completed until all items returned  */}
      <Title level={5} style={{ marginBottom: 16 }}>
        Recent Activities
      </Title>
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
    </Drawer>
  );
}
