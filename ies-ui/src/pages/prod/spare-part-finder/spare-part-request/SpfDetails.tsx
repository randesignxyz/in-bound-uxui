import { Alert, Badge, Button, Card, Col, Drawer, Form, Input, Modal, Row, Select, Skeleton, Switch, Typography, Upload, message } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  InboxOutlined,
  SettingOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useAccess } from '@umijs/max';
import { useEffect, useMemo, useState } from 'react';
import type { UploadProps } from 'antd';
import type { SparePartRequestItem } from './data';
import SparePartImage from './SparePartImage';
import { formatSpfDateTime } from '../shared/dateTime';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const LOW_STOCK_THRESHOLD = 5;
const OUT_OF_STOCK_THRESHOLD = 0;

interface DrawerViewItemProps {
  open: boolean;
  data?: SparePartRequestItem;
  loading?: boolean;
  error?: string | null;
  onClose?: () => void;
  onRequestParts?: () => void;
  onInventoryLog?: () => void;
  EditImage?: () => void;
  canManageImages?: boolean;
  onUploadImages?: (files: File[]) => Promise<void>;
  onDeleteImage?: (imageId: string) => Promise<void>;
  onUpdateDetail?: (payload: {
    id?: number;
    productId?: string;
    partName: string;
    description?: string;
    uom: string[];
    kind?: string;
    categoryId?: number;
    isActive: boolean;
    warehouseCode?: string;
    rack?: string;
    shelve?: string;
    level?: string;
    bin?: string;
  }) => Promise<void>;
  categoryOptions?: { label: string; value: number }[];
}

type DetailLocation = {
  warehouseCode?: string;
  warehouseName?: string;
  level?: string;
  shelve?: string;
  rack?: string;
  bin?: string;
  onHandQty?: number;
  reservedQty?: number;
  availableQty?: number;
  reorderLevel?: number;
  lastSyncedAt?: string;
};

const getStockBadge = (availableStock: number) => {
  if (availableStock <= OUT_OF_STOCK_THRESHOLD) {
    return { label: 'Out of Stock', status: 'error' as const, color: '#ff4d4f' };
  }

  if (availableStock <= LOW_STOCK_THRESHOLD) {
    return { label: 'Low Stock', status: 'warning' as const, color: '#faad14' };
  }

  return { label: 'Available', status: 'success' as const, color: '#52c41a' };
};

export default function SpfDetails({
  open,
  data,
  loading = false,
  error = null,
  onClose,
  onRequestParts,
  canManageImages = false,
  onUploadImages,
  onDeleteImage,
  onUpdateDetail,
  categoryOptions = [],
}: DrawerViewItemProps) {
  const access = useAccess();
  const [form] = Form.useForm();
  const canRequestParts = access.canSpfRequester || access.canSpfApprover;
  const canManageDetails = canManageImages;
  const imageIds: string[] = Array.isArray(data?.imageId) ? data.imageId.filter(Boolean) : [];
  const locations: DetailLocation[] = Array.isArray(data?.locations) ? data.locations : [];
  const firstLocation = locations.find((location) => Number(location?.availableQty ?? 0) > 0) || locations[0];
  const firstImageId = imageIds[0];
  const [selectedImageId, setSelectedImageId] = useState<string | undefined>(firstImageId);
  const [imageTransitioning, setImageTransitioning] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [detailSaving, setDetailSaving] = useState(false);

  const hasLiveData = Boolean(
    data &&
      (data?.partName || data?.productId || data?.description || data?.updatedDate || data?.createdDate || imageIds.length > 0 || locations.length > 0),
  );

  useEffect(() => {
    setSelectedImageId(firstImageId);
  }, [firstImageId, open]);

  useEffect(() => {
    if (!editOpen || !data) return;

    form.setFieldsValue({
      description: data.description || '',
      kind: data.kind || 'consumable',
      categoryId: data.categoryId,
      isActive: data.isActive ?? true,
      rack: firstLocation?.rack || '',
      shelve: firstLocation?.shelve || '',
      level: firstLocation?.level || '',
      bin: firstLocation?.bin || '',
    });
  }, [data, editOpen, firstLocation?.bin, firstLocation?.level, firstLocation?.rack, firstLocation?.shelve, firstLocation?.warehouseCode, form]);

  const mainImageId = useMemo(
    () => selectedImageId || firstImageId,
    [selectedImageId, firstImageId],
  );

  useEffect(() => {
    if (!open || !mainImageId) return;
    setImageTransitioning(true);
    const timeout = window.setTimeout(() => setImageTransitioning(false), 180);
    return () => window.clearTimeout(timeout);
  }, [mainImageId, open]);

  const availableStock = hasLiveData ? Number(data?.stock ?? firstLocation?.availableQty ?? 0) : undefined;
  const normalizedAvailableStock =
    typeof availableStock === 'number' && Number.isFinite(availableStock) ? availableStock : null;
  const stockBadge = normalizedAvailableStock === null ? null : getStockBadge(normalizedAvailableStock);
  const displayCategory = data?.category || '-';
  const displayWarehouse =
    firstLocation?.warehouseCode ||
    firstLocation?.warehouseName ||
    data?.warehouse ||
    '-';
  const displayUom =
    Array.isArray(data?.uomOptions) && data.uomOptions.length > 0
      ? data.uomOptions.join(', ')
      : data?.uom || '-';
  const lastUpdated = data?.updatedDate || firstLocation?.lastSyncedAt || data?.createdDate;

  const handleSaveDetail = async () => {
    if (!onUpdateDetail || !data) return;

    try {
      const values = await form.validateFields();
      setDetailSaving(true);
      await onUpdateDetail({
        id: data.id,
        productId: data.productId,
        partName: String(data.partName || '').trim(),
        description: String(values.description || '').trim() || undefined,
        uom:
          (Array.isArray(data.uomOptions) && data.uomOptions.length > 0
            ? data.uomOptions
            : data.uom
              ? [data.uom]
              : []
          )
            .map((item: string) => String(item || '').trim())
            .filter(Boolean),
        kind: values.kind,
        categoryId: values.categoryId,
        isActive: Boolean(values.isActive),
        warehouseCode: firstLocation?.warehouseCode || data.warehouse || undefined,
        rack: String(values.rack || '').trim() || undefined,
        shelve: String(values.shelve || '').trim() || undefined,
        level: String(values.level || '').trim() || undefined,
        bin: String(values.bin || '').trim() || undefined,
      });
      message.success('Product details updated');
      setEditOpen(false);
    } catch (error) {
      if ((error as any)?.errorFields) return;
      console.error('Failed to update spare part detail', error);
      message.error(error instanceof Error && error.message ? error.message : 'Failed to update product details');
    } finally {
      setDetailSaving(false);
    }
  };

  const handleBeforeUpload: UploadProps['beforeUpload'] = async (file) => {
    if (!canManageImages || !onUploadImages) return;

    setImageUploading(true);
    try {
      await onUploadImages([file as File]);
      message.success('Image uploaded');
    } catch (error) {
      console.error('Failed to upload spare part image', error);
      message.error(
        error instanceof Error && error.message ? `Failed to upload image: ${error.message}` : 'Failed to upload image',
      );
    } finally {
      setImageUploading(false);
    }
    return Upload.LIST_IGNORE;
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!canManageImages || !onDeleteImage) return;
    setDeletingImageId(imageId);
    try {
      await onDeleteImage(imageId);
      message.success('Image deleted');
    } catch (error) {
      console.error('Failed to delete spare part image', error);
      message.error('Failed to delete image');
    } finally {
      setDeletingImageId(null);
    }
  };

  const confirmDeleteImage = (imageId: string) => {
    Modal.confirm({
      centered: true,
      title: 'Delete this image?',
      content: 'This image will be removed from the item.',
      okText: 'Delete',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: () => handleDeleteImage(imageId),
    });
  };

  const imageUploadProps: UploadProps = {
    multiple: true,
    accept: 'image/*',
    beforeUpload: handleBeforeUpload,
    showUploadList: false,
    disabled: imageUploading,
  };

  const renderImageUploadDragger = (compact = false) => (
    <Dragger
      {...imageUploadProps}
      style={{
        width: compact ? 180 : '100%',
        minHeight: compact ? 72 : 120,
        padding: compact ? '8px 12px' : '16px 12px',
        background: '#fff',
        borderRadius: 8,
      }}
    >
      <p className="ant-upload-drag-icon" style={{ marginBottom: compact ? 8 : 12 }}>
        <UploadOutlined />
      </p>
      <Text strong style={{ display: 'block' }}>
        Drop image here
      </Text>
      <Text type="secondary">or click to upload</Text>
    </Dragger>
  );

  const renderImageUploadButton = () => (
    <Upload {...imageUploadProps}>
      <Button icon={<UploadOutlined />} loading={imageUploading}>
        Upload
      </Button>
    </Upload>
  );

  return (
    <Drawer
      width={480}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Product Details</span>
          {canManageDetails ? (
            <Button type="link" icon={<EditOutlined />} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
          ) : null}
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      bodyStyle={{ padding: 0, backgroundColor: '#fafafa' }}
      headerStyle={{ borderBottom: '1px solid #f0f0f0' }}
    >
      {loading ? (
        <div style={{ padding: 24, backgroundColor: '#fff' }}>
          <Skeleton active avatar paragraph={{ rows: 10 }} />
        </div>
      ) : error ? (
        <div style={{ padding: 24, backgroundColor: '#fff' }}>
          <Alert
            type="error"
            showIcon
            message="Unable to load product details"
            description={error}
          />
        </div>
      ) : !hasLiveData ? (
        <div style={{ padding: 24, backgroundColor: '#fff' }}>
          <Skeleton active avatar paragraph={{ rows: 10 }} />
        </div>
      ) : (
        <>
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '0px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 300,
            }}
          >
            {imageIds.length > 0 ? (
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    transition: 'opacity 180ms ease, transform 180ms ease',
                    opacity: imageTransitioning ? 0.55 : 1,
                    transform: imageTransitioning ? 'scale(0.985)' : 'scale(1)',
                  }}
                >
                  <SparePartImage
                    imageId={mainImageId}
                    alt={data?.partName || data?.productId}
                    size={280}
                  />
                </div>

                {imageIds.length > 1 && (
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      gap: 10,
                      flexWrap: 'wrap',
                      paddingLeft: '24px',
                      justifyContent: 'start',
                    }}
                  >
                    {imageIds.map((id, index) => {
                      const isActive = id === mainImageId;
                      return (
                        <div key={`${id}-${index}`} style={{ position: 'relative' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedImageId(id)}
                            style={{
                              border: isActive ? '2px solid #d4a574' : '1px solid #d9d9d9',
                              borderRadius: 8,
                              padding: 4,
                              background: '#fff',
                              cursor: 'pointer',
                            }}
                          >
                            <SparePartImage
                              imageId={id}
                              alt={data?.partName || data?.productId}
                              size={64}
                            />
                          </button>
                          {canManageImages ? (
                            <Button
                              type="text"
                              size="small"
                              icon={<DeleteOutlined />}
                              loading={deletingImageId === id}
                              onClick={() => confirmDeleteImage(id)}
                              style={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                background: '#fff',
                                border: '1px solid #f0f0f0',
                                borderRadius: '50%',
                              }}
                            />
                          ) : null}
                        </div>
                      );
                    })}
                    {canManageImages ? (
                      <div
                        style={{
                          minHeight: 72,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        {renderImageUploadDragger(true)}
                        {renderImageUploadButton()}
                      </div>
                    ) : null}
                  </div>
                )}
                {imageIds.length === 1 && canManageImages ? (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
                    {renderImageUploadDragger()}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                      {renderImageUploadButton()}
                      <Button icon={<DeleteOutlined />} loading={deletingImageId === mainImageId} onClick={() => confirmDeleteImage(mainImageId!)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                <SparePartImage
                  imageId={data?.imageId}
                  src={data?.image}
                  alt={data?.partName || data?.productId}
                  size={280}
                />
                {canManageImages ? (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                    {renderImageUploadDragger()}
                    {renderImageUploadButton()}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div style={{ padding: '24px', backgroundColor: '#fff' }}>
            {stockBadge ? (
              <Badge
                status={stockBadge.status}
                text={
                  <Text style={{ color: stockBadge.color, fontWeight: 500 }}>
                    {stockBadge.label}
                  </Text>
                }
                style={{ marginBottom: 16, display: 'block' }}
              />
            ) : null}

            <Title level={4} style={{ margin: '0 0 16px 0', fontWeight: 600 }}>
              {data?.partName || '-'}
            </Title>

            <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 24 }}>
              {data?.productId || '-'}
            </Text>

            <div style={{ marginBottom: 24 }}>
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  display: 'block',
                  marginBottom: 8,
                }}
              >
                Description
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 1.6, color: '#595959' }}>
                {data?.description || '-'}
              </Text>
            </div>
          </div>

          <div style={{ padding: '0 24px 24px', backgroundColor: '#fff' }}>
            <Card
              style={{
                backgroundColor: '#fafafa',
                border: '1px solid #f0f0f0',
                borderRadius: 8,
              }}
              bodyStyle={{ padding: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <InboxOutlined style={{ fontSize: 18, marginRight: 8, color: '#595959' }} />
                <Text strong style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Stock Availability
                </Text>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: '1px solid #e8e8e8',
                }}
              >
                <Text style={{ color: '#8c8c8c' }}>Total Quantity</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: 700,
                      color: '#d4a574',
                      lineHeight: 1,
                    }}
                  >
                    {normalizedAvailableStock ?? '-'}
                  </Text>
                  <Text style={{ color: '#8c8c8c' }}>{displayUom}</Text>
                </div>
              </div>

              <Row gutter={16} style={{ textAlign: 'center' }}>
                <Col span={5}>
                  <Text
                    style={{
                      fontSize: 11,
                      color: '#8c8c8c',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Warehouse
                  </Text>
                  <Text strong style={{ fontSize: 16 }}>
                    {displayWarehouse}
                  </Text>
                </Col>
                <Col span={5}>
                  <Text
                    style={{
                      fontSize: 11,
                      color: '#8c8c8c',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Rack
                  </Text>
                  <Text strong style={{ fontSize: 16 }}>
                    {firstLocation?.rack || '-'}
                  </Text>
                </Col>
                <Col span={4} style={{ borderLeft: '1px solid #e8e8e8' }}>
                  <Text
                    style={{
                      fontSize: 11,
                      color: '#8c8c8c',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Level
                  </Text>
                  <Text strong style={{ fontSize: 16 }}>
                    {firstLocation?.level || '-'}
                  </Text>
                </Col>
                <Col span={5} style={{ borderLeft: '1px solid #e8e8e8', borderRight: '1px solid #e8e8e8' }}>
                  <Text
                    style={{
                      fontSize: 11,
                      color: '#8c8c8c',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Shelve
                  </Text>
                  <Text strong style={{ fontSize: 16 }}>
                    {firstLocation?.shelve || '-'}
                  </Text>
                </Col>
                <Col span={5}>
                  <Text
                    style={{
                      fontSize: 11,
                      color: '#8c8c8c',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Bin
                  </Text>
                  <Text strong style={{ fontSize: 16 }}>
                    {firstLocation?.bin || '-'}
                  </Text>
                </Col>
              </Row>
            </Card>
          </div>

          <div style={{ padding: '0 24px 24px', backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <SettingOutlined style={{ fontSize: 18, marginRight: 8, color: '#595959' }} />
              <Text strong style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Technical Specifications
              </Text>
            </div>

            <Card
              style={{
                backgroundColor: '#fafafa',
                border: '1px solid #f0f0f0',
                borderRadius: 8,
              }}
              bodyStyle={{ padding: 0 }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <Text style={{ color: '#8c8c8c' }}>Category</Text>
                <Text>{displayCategory}</Text>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <Text style={{ color: '#8c8c8c' }}>UOM</Text>
                <Text>{displayUom}</Text>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <Text style={{ color: '#8c8c8c' }}>Business Unit</Text>
                <Text>{data?.businessUnit || '-'}</Text>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <Text style={{ color: '#8c8c8c' }}>Kind</Text>
                <Text>{data?.kind || '-'}</Text>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                }}
              >
                <Text style={{ color: '#8c8c8c' }}>Warehouse</Text>
                <Text>{displayWarehouse}</Text>
              </div>
            </Card>
          </div>

          <div style={{ padding: '0 24px 100px', backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <FileTextOutlined style={{ fontSize: 18, marginRight: 8, color: '#595959' }} />
              <Text strong style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Additional Information
              </Text>
            </div>

            <Card
              style={{
                backgroundColor: '#fafafa',
                border: '1px solid #f0f0f0',
                borderRadius: 8,
              }}
              bodyStyle={{ padding: 0 }}
            >
              
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <Text style={{ color: '#8c8c8c' }}>Created At</Text>
                <Text>{formatSpfDateTime(data?.createdDate)}</Text>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <Text style={{ color: '#8c8c8c' }}>Last Updated</Text>
                <Text>{formatSpfDateTime(lastUpdated)}</Text>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                }}
              >
                <Text style={{ color: '#8c8c8c' }}>Active</Text>
                <Text>{data?.isActive === false ? 'Inactive' : 'Active'}</Text>
              </div>
            </Card>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '16px 24px',
              backgroundColor: '#fff',
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              gap: 12,
            }}
          >
            {canRequestParts ? (
              <Button
                type="primary"
                block
                disabled={!onRequestParts}
                style={{
                  flex: 2,
                }}
                onClick={onRequestParts}
              >
                Request Parts
              </Button>
            ) : null}
          </div>
        </>
      )}
      <Modal
        title="Edit Product Details"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={handleSaveDetail}
        okText="Save"
        confirmLoading={detailSaving}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Part Name">
            <Text type="secondary">{data?.partName || '-'}</Text>
          </Form.Item>
          <Form.Item label="UOM">
            <Text type="secondary">{displayUom}</Text>
          </Form.Item>
          <Form.Item label="Warehouse">
            <Text type="secondary">{displayWarehouse}</Text>
          </Form.Item>
          <Form.Item label="Business Unit">
            <Text type="secondary">{data?.businessUnit || '-'}</Text>
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} maxLength={1000} />
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="Category"
            rules={[{ required: true, message: 'Category is required' }]}
          >
            <Select options={categoryOptions} placeholder="Select category" showSearch optionFilterProp="label" />
          </Form.Item>
          <Form.Item
            name="rack"
            label="Rack"
            rules={[{ required: true, message: 'Rack is required' }]}
          >
            <Input maxLength={80} />
          </Form.Item>
          <Form.Item
            name="level"
            label="Level"
            rules={[{ required: true, message: 'Level is required' }]}
          >
            <Input maxLength={80} />
          </Form.Item>
          <Form.Item
            name="shelve"
            label="Shelve"
            rules={[{ required: true, message: 'Shelve is required' }]}
          >
            <Input maxLength={80} />
          </Form.Item>
          <Form.Item
            name="bin"
            label="Bin"
            rules={[{ required: true, message: 'Bin is required' }]}
          >
            <Input maxLength={80} />
          </Form.Item>
          <Form.Item name="kind" label="Kind" rules={[{ required: true, message: 'Kind is required' }]}>
            <Select
              options={[
                { label: 'Consumable', value: 'consumable' },
                { label: 'Returnable', value: 'returnable' },
              ]}
            />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Drawer>
  );
}
