import { Alert, Badge, Button, Card, Col, Drawer, Form, Grid, Input, Modal, Radio, Row, Select, Skeleton, Space, Typography, Upload, message } from "antd";
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
  editOnlyMode?: boolean;
  onUpdateDetail?: (payload: {
    id?: number;
    productId?: string;
    partName: string;
    description?: string;
    uom: string[];
    kind?: string;
    categoryId?: number;
    // isActive: boolean;
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
  editOnlyMode = false,
  onUpdateDetail,
  categoryOptions = [],
}: DrawerViewItemProps) {
  const access = useAccess();
  const screens = Grid.useBreakpoint();
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
      // isActive: data.isActive ?? true,
      rack: firstLocation?.rack || '',
      shelve: firstLocation?.shelve || '',
      level: firstLocation?.level || '',
      bin: firstLocation?.bin || '',
    });
  }, [data, editOpen, firstLocation?.bin, firstLocation?.level, firstLocation?.rack, firstLocation?.shelve, firstLocation?.warehouseCode, form]);

  useEffect(() => {
    if (!open) {
      setEditOpen(false);
      return;
    }

    if (editOnlyMode && data && !loading) {
      setEditOpen(true);
    }
  }, [data, editOnlyMode, loading, open]);

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
  const formColSpan = screens.xl ? 8 : screens.md ? 12 : 24;
  const modalWidth = screens.xxl ? 1080 : screens.xl ? 980 : screens.lg ? 860 : screens.md ? 720 : '94vw';

  const handleBeforeUpload: UploadProps['beforeUpload'] = async (file) => {
    if (!canManageImages || !onUploadImages) return Upload.LIST_IGNORE;

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
        // isActive: Boolean(values.isActive),
        warehouseCode: firstLocation?.warehouseCode || data.warehouse || undefined,
        rack: String(values.rack || '').trim() || undefined,
        shelve: String(values.shelve || '').trim() || undefined,
        level: String(values.level || '').trim() || undefined,
        bin: String(values.bin || '').trim() || undefined,
      });
      message.success('Product details updated');
      if (editOnlyMode) {
        onClose?.();
      } else {
        setEditOpen(false);
      }
    } catch (error) {
      if ((error as any)?.errorFields) return;
      console.error('Failed to update spare part detail', error);
      message.error(error instanceof Error && error.message ? error.message : 'Failed to update product details');
    } finally {
      setDetailSaving(false);
    }
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

  const closeEditModal = () => {
    setEditOpen(false);
    if (editOnlyMode) {
      onClose?.();
    }
  };

  const imageUploadProps: UploadProps = {
    multiple: true,
    accept: 'image/*',
    beforeUpload: handleBeforeUpload,
    showUploadList: false,
    disabled: imageUploading,
  };

  const renderReadOnlyField = (label: string, value?: string) => (
    <div
      style={{
        padding: '12px 14px',
        border: '1px solid #f0f0f0',
        borderRadius: 12,
        background: '#fafafa',
        minHeight: 72,
      }}
    >
      <Text
        type="secondary"
        style={{
          display: 'block',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <Text strong style={{ fontSize: 14, color: '#1f1f1f' }}>
        {value || '-'}
      </Text>
    </div>
  );

  return (
    <>
      {!editOnlyMode ? (
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
                        {/* Upload controls intentionally hidden in warehouse item detail view. */}
                      </div>
                    )}
                    {imageIds.length === 1 && canManageImages ? (
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 12 }}>
                        <Button icon={<DeleteOutlined />} loading={deletingImageId === mainImageId} onClick={() => confirmDeleteImage(mainImageId!)}>
                          Delete
                        </Button>
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
                    {/* Upload controls intentionally hidden in warehouse item detail view. */}
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
                      <Text style={{ fontSize: 11, color: '#8c8c8c', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                        Warehouse
                      </Text>
                      <Text strong style={{ fontSize: 16 }}>
                        {displayWarehouse}
                      </Text>
                    </Col>
                    <Col span={5}>
                      <Text style={{ fontSize: 11, color: '#8c8c8c', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                        Rack
                      </Text>
                      <Text strong style={{ fontSize: 16 }}>
                        {firstLocation?.rack || '-'}
                      </Text>
                    </Col>
                    <Col span={4} style={{ borderLeft: '1px solid #e8e8e8' }}>
                      <Text style={{ fontSize: 11, color: '#8c8c8c', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                        Level
                      </Text>
                      <Text strong style={{ fontSize: 16 }}>
                        {firstLocation?.level || '-'}
                      </Text>
                    </Col>
                    <Col span={5} style={{ borderLeft: '1px solid #e8e8e8', borderRight: '1px solid #e8e8e8' }}>
                      <Text style={{ fontSize: 11, color: '#8c8c8c', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                        Shelve
                      </Text>
                      <Text strong style={{ fontSize: 16 }}>
                        {firstLocation?.shelve || '-'}
                      </Text>
                    </Col>
                    <Col span={5}>
                      <Text style={{ fontSize: 11, color: '#8c8c8c', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                    <Text style={{ color: '#8c8c8c' }}>Category</Text>
                    <Text>{displayCategory}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                    <Text style={{ color: '#8c8c8c' }}>UOM</Text>
                    <Text>{displayUom}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                    <Text style={{ color: '#8c8c8c' }}>Business Unit</Text>
                    <Text>{data?.businessUnit || '-'}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                    <Text style={{ color: '#8c8c8c' }}>Kind</Text>
                    <Text>{data?.kind || '-'}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                    <Text style={{ color: '#8c8c8c' }}>Created At</Text>
                    <Text>{formatSpfDateTime(data?.createdDate)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                    <Text style={{ color: '#8c8c8c' }}>Last Updated</Text>
                    <Text>{formatSpfDateTime(lastUpdated)}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px' }}>
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
                    style={{ flex: 2 }}
                    onClick={onRequestParts}
                  >
                    Request Parts
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </Drawer>
      ) : null}
      <Modal
        title="Edit Item Details"
        open={editOpen || (editOnlyMode && open)}
        centered
        width={modalWidth}
        onCancel={closeEditModal}
        onOk={handleSaveDetail}
        okText="Save"
        confirmLoading={detailSaving}
        okButtonProps={{ disabled: loading || !data }}
        destroyOnClose
        maskClosable={!detailSaving}
        bodyStyle={{ maxHeight: 'calc(100vh - 140px)', overflowY: 'auto', overflowX: 'hidden', paddingLeft: screens.xs ? 16 : 24, paddingRight: screens.xs ? 16 : 24 }}
      >
        {loading ? (
          <Skeleton active avatar paragraph={{ rows: 8 }} />
        ) : error ? (
          <Alert type="error" showIcon message="Unable to load product details" description={error} />
        ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <SparePartImage
              imageId={mainImageId || data?.imageId}
              src={data?.image}
              alt={data?.partName || data?.productId}
              size={160}
            />
          </div>

          {canManageImages ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: screens.md ? 'row' : 'column', gap: 12, width: '100%', maxWidth: 560, alignItems: 'center', justifyContent: 'center' }}>
              <Dragger
                {...imageUploadProps}
                style={{
                  flex: 1,
                  width: '100%',
                  minHeight: 110,
                  padding: '12px 14px',
                  background: '#fff',
                  borderRadius: 12,
                  textAlign: 'center',
                }}
              >
                <p className="ant-upload-drag-icon" style={{ marginBottom: 8 }}>
                  <UploadOutlined />
                </p>
                <Text strong style={{ display: 'block' }}>
                  Drag and drop image
                </Text>
                <Text type="secondary">or click to upload</Text>
              </Dragger>
              {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload {...imageUploadProps}>
                  <Button icon={<UploadOutlined />} loading={imageUploading}>
                    Upload Image
                  </Button>
                </Upload>
              </div> */}
            </div>
            </div>
          ) : null}

          <Row gutter={[12, 12]}>
            <Col xs={24} md={12} xl={8}>{renderReadOnlyField('Part Code', data?.productId)}</Col>
            <Col xs={24} md={12} xl={8}>{renderReadOnlyField('UOM', displayUom)}</Col>
            <Col xs={24} md={12} xl={8}>{renderReadOnlyField('Business Unit', data?.businessUnit)}</Col>
            <Col xs={24} md={12} xl={8}>{renderReadOnlyField('Warehouse', displayWarehouse)}</Col>
          </Row>

          <Form form={form} layout="vertical">
            <Row gutter={12}>
              <Col span={formColSpan}>
                <Form.Item
                  name="categoryId"
                  label="Category"
                >
                  <Select options={categoryOptions} placeholder="Select category" showSearch optionFilterProp="label" />
                </Form.Item>
              </Col>
              <Col span={formColSpan}>
                <Form.Item
                  name="description"
                  label="Description"
                >
                  <Input placeholder="Enter description" maxLength={1000} />
                </Form.Item>
              </Col>
              <Col span={formColSpan}>
                <Form.Item
                  name="rack"
                  label="Rack"
                >
                  <Input maxLength={80} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={12}>
              <Col span={formColSpan}>
                <Form.Item
                  name="level"
                  label="Level"
                >
                  <Input maxLength={80} />
                </Form.Item>
              </Col>
              <Col span={formColSpan}>
                <Form.Item
                  name="bin"
                  label="Bin"
                >
                  <Input maxLength={80} />
                </Form.Item>
              </Col>
              <Col span={formColSpan}>
                <Form.Item
                  name="shelve"
                  label="Shelve"
                >
                  <Input maxLength={80} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={12}>
              <Col span={formColSpan}>
                <Form.Item name="kind" label="Kind">
                  <Radio.Group>
                    <Space size={20} wrap>
                      <Radio value="consumable">Consumable</Radio>
                      <Radio value="returnable">Returnable</Radio>
                    </Space>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
        )}
      </Modal>
    </>
  );
}
