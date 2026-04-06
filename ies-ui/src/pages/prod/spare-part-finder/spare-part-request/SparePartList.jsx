import Icon, { ReloadOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { Button, Card, DatePicker, Input, Modal, Select, Space, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { simpleRequestActions } from '@/services/model';
import RequestItemModal from './requestItem';
import { fetchSparePartCategories, SparePartRequestAPI } from './service.api';
import { SparePartRequestService } from './service';
import SparePartImage from './SparePartImage';
import SpfDetails from './SpfDetails';

const statusOptions = [
  { label: 'All Status', value: 'All' },
  { label: 'Available', value: 'available' },
  { label: 'Low', value: 'low' },
  { label: 'No Stock', value: 'no-stock' },
];

const normalizeResubmitPriority = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'urgent' || normalized === 'high' ? normalized : 'normal';
};

const buildResubmitItem = (line, index) => ({
  id: Number(line.requestLineId || index + 1),
  image: line.image,
  imageId: Array.isArray(line.imageId) ? line.imageId : line.imageId ? [line.imageId] : undefined,
  productId: line.productId,
  partName: line.itemName,
  description: line.description,
  category: line.category || '',
  uom: line.uom || '',
  uomOptions: line.uom ? [line.uom] : [],
  stock: Math.max(Number(line.quantityToReturn || line.requestedQty || line.total || 1), 1),
  businessUnit: line.businessUnit || '',
  status: 'available',
  warehouse: line.warehouse || '',
  locations: [],
  tab: 'spare-list',
});

const buildResubmitRow = (line, item) => ({
  item,
  quantity: Math.max(Number(line.quantityToReturn || line.requestedQty || line.total || 1), 1),
  purpose: line.description || '',
  toWarehouseCode: line.warehouse || '',
  forLine: line.company || '',
  uom: line.uom || '',
});

export default function SparePartListView({ resubmitDraft, onResubmitDraftHandled }) {
  const access = useAccess();
  const actionRef = useRef();
  const importInputRef = useRef();
  const detailRequestRef = useRef(0);
  const requestActions = simpleRequestActions();
  const services = SparePartRequestAPI(requestActions);
  const requestServices = SparePartRequestService(requestActions);
  const { RangePicker } = DatePicker;
  const canSeeWarehouseLocation = access.canSpfWarehouseStaff || access.canAdmin;

  const [searchValue, setSearchValue] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedItemsById, setSelectedItemsById] = useState({});
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestItems, setRequestItems] = useState([]);
  const [requestInitialRows, setRequestInitialRows] = useState([]);
  const [requestInitialRemark, setRequestInitialRemark] = useState('');
  const [requestInitialPriority, setRequestInitialPriority] = useState('normal');
  const [importingFile, setImportingFile] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [currentRows, setCurrentRows] = useState([]);
  const [knownCategories, setKnownCategories] = useState([]);
  const [knownWarehouses, setKnownWarehouses] = useState([]);
  const [knownBusinessUnits, setKnownBusinessUnits] = useState([]);
  const [filters, setFilters] = useState({
    businessUnits: [],
    category: undefined,
    status: 'All',
    warehouse: '',
    createdDateRange: undefined,
  });

  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...knownCategories.map((item) => ({ label: item, value: item })),
  ];

  const warehouseOptions = [
    { label: 'All Warehouses', value: '' },
    ...knownWarehouses.map((wh) => ({ label: wh, value: wh })),
  ];

  const businessUnitOptions = knownBusinessUnits.map((item) => ({ label: item, value: item }));

  useEffect(() => {
    fetchSparePartCategories()
      .then((items) => setKnownCategories(items.map((item) => item.category_name).filter(Boolean)))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!resubmitDraft?.items?.length) return;

    const items = resubmitDraft.items.map((line, index) => buildResubmitItem(line, index));
    const initialRows = resubmitDraft.items.map((line, index) => buildResubmitRow(line, items[index]));
    const selectedKeys = items.map((item) => String(item.id));

    setSelectedRowKeys(selectedKeys);
    setSelectedItemsById(
      items.reduce((acc, item) => {
        acc[String(item.id)] = item;
        return acc;
      }, {}),
    );
    setRequestItems(items);
    setRequestInitialRows(initialRows);
    setRequestInitialRemark(resubmitDraft.remark || '');
    setRequestInitialPriority(normalizeResubmitPriority(resubmitDraft.priority));
    setRequestModalOpen(true);
    onResubmitDraftHandled?.();
  }, [onResubmitDraftHandled, resubmitDraft]);

  const reloadTable = (resetPage = false) => {
    if (resetPage) {
      actionRef.current?.setPageInfo?.({ current: 1 });
    }
    actionRef.current?.reload?.();
  };

  const syncSelection = (normalizedKeys, rows = []) => {
    setSelectedRowKeys(normalizedKeys);

    setSelectedItemsById((previous) => {
      const next = {};
      const keySet = new Set(normalizedKeys);

      Object.keys(previous || {}).forEach((k) => {
        if (keySet.has(k)) {
          next[k] = previous[k];
        }
      });

      (rows || []).forEach((r) => {
        if (r?.id != null) {
          next[String(r.id)] = r;
        }
      });

      return next;
    });
  };

  const handleToggleRowSelection = (record) => {
    const key = String(record?.id ?? '');
    if (!key) return;

    const nextKeys = selectedRowKeys.includes(key)
      ? selectedRowKeys.filter((item) => item !== key)
      : [...selectedRowKeys, key];

    syncSelection(nextKeys, [record]);
  };

  const requestData = async (params) => {
    const response = await services.page({
      criteria: {
        searchValue,
        category: filters.category || '',
        status: filters.status,
        warehouse: filters.warehouse || '',
      },
      pagination: {
        current: params.current,
        pageSize: params.pageSize,
      },
    });

    let rows = response.items || [];

    if (filters.createdDateRange?.length === 2) {
      const [startIso, endIso] = filters.createdDateRange;
      const startAt = dayjs(startIso).startOf('day');
      const endAt = dayjs(endIso).endOf('day');
      rows = rows.filter((item) => {
        if (!item.createdDate) return false;
        const d = dayjs(item.createdDate);
        return !d.isBefore(startAt) && !d.isAfter(endAt);
      });
    }

    if (filters.businessUnits.length > 0) {
      rows = rows.filter((item) => filters.businessUnits.includes(item.businessUnit));
    }

    setCurrentRows(rows);
    setSelectedItemsById((previous) => {
      if (!selectedRowKeys?.length) return previous;
      const next = { ...previous };
      rows.forEach((row) => {
        if (selectedRowKeys.includes(String(row.id))) {
          next[String(row.id)] = row;
        }
      });
      return next;
    });
    setKnownWarehouses((previous) => {
      const merged = new Set([...previous, ...rows.map((item) => item.warehouse).filter(Boolean)]);
      return Array.from(merged).sort();
    });
    setKnownBusinessUnits((previous) => {
      const merged = new Set([...previous, ...rows.map((item) => item.businessUnit).filter(Boolean)]);
      return Array.from(merged).sort();
    });

    return {
      data: rows,
      total:
        filters.createdDateRange?.length === 2
          ? rows.length
          : response.total || 0,
      success: true,
    };
  };

  const openRequestModal = () => {
    const items = selectedRowKeys.map((key) => selectedItemsById[String(key)]).filter(Boolean);
    if (items.length === 0) {
      message.warning('Please select at least one item.');
      return;
    }

    if (!requestInitialRows.length) {
      setRequestInitialRemark('');
      setRequestInitialPriority('normal');
    }

    setRequestInitialRows((previous) => {
      if (!previous.length) return previous;

      const selectedIds = new Set(items.map((item) => String(item.id)));
      return previous.every((row) => selectedIds.has(String(row.item.id))) ? previous : [];
    });
    setRequestItems(items);
    setRequestModalOpen(true);
  };

  const showImportSummary = (result) => {
    if (!result?.failedRows?.length) return;

    Modal.info({
      title: 'Import completed with validation issues',
      width: 760,
      content: (
        <div style={{ maxHeight: 320, overflowY: 'auto', marginTop: 12 }}>
          <Typography.Paragraph style={{ marginBottom: 12 }}>
            Imported {result.successCount} valid row(s). {result.failureCount} row(s) were skipped.
          </Typography.Paragraph>
          {result.failedRows.slice(0, 12).map((row) => (
            <div key={`import-failed-${row.rowNumber}`} style={{ marginBottom: 12 }}>
              <Typography.Text strong>Row {row.rowNumber}</Typography.Text>
              <div>{row.productId ? `Item: ${row.productId}` : 'Item: -'}</div>
              <div>{(row.reasons || []).join(' ')}</div>
            </div>
          ))}
          {result.failedRows.length > 12 && (
            <Typography.Text type="secondary">
              {result.failedRows.length - 12} more row(s) were omitted from this preview.
            </Typography.Text>
          )}
        </div>
      ),
    });
  };

  const handleImportClick = () => {
    importInputRef.current?.click?.();
  };

  const handleImportFileChange = async (event) => {
    const file = event?.target?.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!String(file.name || '').toLowerCase().endsWith('.xlsx')) {
      message.warning('Please choose an .xlsx file.');
      return;
    }

    setImportingFile(true);
    try {
      const result = await requestServices.importRequestFile(file);

      if (result.failureCount > 0) {
        showImportSummary(result);
      }

      if (!result.successfulRows.length) {
        message.error('No valid rows were imported.');
        return;
      }

      const importedItems = result.successfulRows.map((row) => row.item);
      const importedKeys = importedItems.map((item) => String(item.id));

      syncSelection(importedKeys, importedItems);
      setRequestInitialRows(result.successfulRows);
      setRequestInitialRemark('');
      setRequestInitialPriority('normal');
      setRequestItems(importedItems);
      setRequestModalOpen(true);
      message.success(`Imported ${result.successCount} row(s) successfully.`);
    } catch (error) {
      const errorMessage =
        error?.data?.message ||
        error?.info?.message ||
        error?.message ||
        'Failed to import the Excel file.';
      message.error(errorMessage);
    } finally {
      setImportingFile(false);
    }
  };

  const openDetails = async (item) => {
    const requestId = detailRequestRef.current + 1;
    detailRequestRef.current = requestId;
    setDetailsItem(null);
    setDetailsError(null);
    setDetailsLoading(Boolean(item));
    setDetailsOpen(true);

    if (!item) {
      setDetailsLoading(false);
      return;
    }

    try {
      const detail = await services.detail({ id: item.id, productId: item.productId });
      if (detailRequestRef.current !== requestId) return;
      setDetailsItem(detail || null);
    } catch (error) {
      if (detailRequestRef.current !== requestId) return;
      setDetailsError('Unable to load the latest product details.');
      setDetailsItem(null);
    } finally {
      if (detailRequestRef.current === requestId) {
        setDetailsLoading(false);
      }
    }
  };

  const closeDetails = () => {
    detailRequestRef.current += 1;
    setDetailsOpen(false);
    setDetailsItem(null);
    setDetailsError(null);
    setDetailsLoading(false);
  };

  const handleRequestPartsFromDetails = () => {
    if (!detailsItem) return;
    setRequestInitialRemark('');
    setRequestInitialPriority('normal');
    setRequestInitialRows([]);
    setRequestItems([detailsItem]);
    setRequestModalOpen(true);
    closeDetails();
  };


  return (
    <>
      <Card size="small" style={{ marginBottom: 10 }}>
        <Space wrap size="middle">
          <Input.Search
            allowClear
            enterButton={<SearchOutlined />}
            value={searchValue}
            placeholder="Search by product ID or part name"
            style={{ width: 320 }}
            onChange={(event) => {
              setSearchValue(event.target.value || '');
              reloadTable(true);
            }}
          />

          <Select
            mode="multiple"
            allowClear
            maxTagCount="responsive"
            style={{ minWidth: 140 }}
            value={filters.businessUnits}
            placeholder="All BU"
            options={businessUnitOptions}
            onChange={(value) => {
              setFilters((previous) => ({ ...previous, businessUnits: value || [] }));
              reloadTable(true);
            }}
          />

          {/* hidden — field temporarily removed from backend */}

          {/* {canSeeWarehouseLocation && ( */}
            <Select
              style={{ width: 140 }}
              value={filters.warehouse}
              options={warehouseOptions}
              onChange={(value) => {
                setFilters((previous) => ({ ...previous, warehouse: value || '' }));
                reloadTable(true);
              }}
            />
          {/* )} */}

          <Select
            style={{ width: 140 }}
            value={filters.category || ''}
            options={categoryOptions}
            onChange={(value) => {
              setFilters((previous) => ({ ...previous, category: value || undefined }));
              reloadTable(true);
            }}
          />

          

          <Select
            style={{ width: 140 }}
            value={filters.status}
            options={statusOptions}
            onChange={(value) => {
              setFilters((previous) => ({ ...previous, status: value }));
              reloadTable(true);
            }}
          />

          {/* <RangePicker
            allowClear
            style={{ width: 260 }}
            placeholder={['Created from', 'Created to']}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setFilters((previous) => ({
                  ...previous,
                  createdDateRange: [dates[0].toISOString(), dates[1].toISOString()],
                }));
              } else {
                setFilters((previous) => ({ ...previous, createdDateRange: undefined }));
              }
              reloadTable(true);
            }}
          /> */}
        </Space>
      </Card>

      <Card size="small">
        <ProTable
          actionRef={actionRef}
          size="small"
          rowKey={(record) => String(record.id)}
          tableLayout="auto"
          search={false}
          options={false}
          bordered
          scroll={{ x: 'max-content' }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys, rows) => {
              syncSelection((keys || []).map((key) => String(key)), rows || []);
            },
          }}
          rowClassName={(record) =>
            selectedRowKeys.includes(String(record.id)) ? 'ant-table-row-selected' : ''
          }
          onRow={(record) => ({
            onClick: (event) => {
              const target = event.target;
              if (target instanceof HTMLElement && target.closest('a, button, input, textarea, .ant-select')) {
                return;
              }
              handleToggleRowSelection(record);
            },
            style: { cursor: 'pointer' },
          })}
          toolBarRender={() => [
            <Space key="spr-action-bar" size="small">
              <Button icon={<ReloadOutlined />} onClick={() => reloadTable(false)}>
                Refresh
              </Button>
              {(access.canSpfRequester || access.canSpfApprover) && (
                <Button icon={<UploadOutlined />} loading={importingFile} onClick={handleImportClick}>
                  Import
                </Button>
              )}
              {(access.canSpfRequester || access.canSpfApprover) && (
                <Button type="primary" disabled={selectedRowKeys.length === 0} onClick={openRequestModal}>
                  Request{selectedRowKeys.length ? ` (${selectedRowKeys.length})` : ''}
                </Button>
              )}
            </Space>,
          ]}
          columns={[
            {
              title: 'Image',
              dataIndex: 'image',
              width: 80,
              align: 'center',
              render: (_, record) => (
                <SparePartImage
                  imageId={record.imageId}
                  src={record.image}
                  alt={record.partName || record.productId}
                  size={48}
                />
              ),
            },
            {
              title: 'Product ID',
              dataIndex: 'productId',
              render: (_, record) => (
                <Typography.Link
                  onClick={(event) => {
                    event.preventDefault();
                    openDetails(record);
                  }}
                >
                  {record.productId}
                </Typography.Link>
              ),
            },
            {
              title: 'Part Name',
              dataIndex: 'partName',
              ellipsis: true,
            },
            {
              title: 'Category',
              dataIndex: 'category',
            },
            {
              title: 'Business Unit',
              dataIndex: 'businessUnit',
            },
            {
              title: 'Warehouse',
              dataIndex: 'warehouse',
                render: (v) => v || '—',
            },
            ...(canSeeWarehouseLocation
              ? [
                  
                  {
                    title: 'Level',
                    render: (_, record) => record.locations?.[0]?.level || '—',
                  },
                  {
                    title: 'Shelve',
                    render: (_, record) => record.locations?.[0]?.shelve || '—',
                  },
                  {
                    title: 'Bin',
                    render: (_, record) => record.locations?.[0]?.bin || '—',
                  },
                  // {
                  //   title: 'Level',
                  //   dataIndex: 'level',
                  //   width: 120,
                  //   render: (v) => v || '—',
                  // },
                ]
              : []),
            
            {
              title: 'Stock',
              dataIndex: 'stock',
              width: 90,
              render: (_, record) => {
                if (record.stock <= 0) {
                  return <Typography.Text type="danger">00</Typography.Text>;
                }
                if (record.stock <= 2) {
                  return <Typography.Text type="warning">{record.stock}</Typography.Text>;
                }
                return record.stock;
              },
            },
            
            {
              title: 'Status',
              dataIndex: 'status',
              width: 120,
              render: (_, record) => {
                if (record.status === 'available') return <Tag color="success">Available</Tag>;
                if (record.status === 'low') return <Tag color="warning">Low</Tag>;
                return <Tag color="error">No Stock</Tag>;
              },
            },
            ...(access.canSpfWarehouseStaff || access.canAdmin ?[
              {
              dataIndex: 'edit',
              width: 40,
              render: () =>(
                <a
                  style={{ color: '#1890ff', fontSize: 16, cursor: 'pointer' }}
                  onClick={() => {}}>
                  Edit
                </a>
              )
            },
            ]:[])
          ]}
          request={requestData}
        />
      </Card>

      <RequestItemModal
        open={requestModalOpen}
        selectedItems={requestItems}
        initialRows={requestInitialRows}
        onCancel={() => {
          setRequestModalOpen(false);
          setRequestInitialRows([]);
          setRequestInitialRemark('');
          setRequestInitialPriority('normal');
        }}
        onSubmit={async (payload) => {
          if (!(access.canSpfRequester || access.canSpfApprover)) {
            message.error('You are not allowed to submit spare part requests.');
            return;
          }

          try {
            const created = await requestServices.createRequest(payload);
            message.success(`Request ${created.requestId} submitted successfully.`);
            setRequestModalOpen(false);
            setSelectedRowKeys([]);
            setSelectedItemsById({});
            setRequestInitialRows([]);
            setRequestInitialRemark('');
            setRequestInitialPriority('normal');
            reloadTable(true);
          } catch (error) {
            message.error('Failed to submit request.');
            throw error;
          }
        }}
        onAddMore={() => {
          setRequestModalOpen(false);
        }}
        initialRemark={requestInitialRemark}
        initialPriority={requestInitialPriority}
      />

      <input
        ref={importInputRef}
        type="file"
        accept=".xlsx"
        style={{ display: 'none' }}
        onChange={handleImportFileChange}
      />

      <SpfDetails
        open={detailsOpen}
        data={
          detailsItem
            ? {
                image: detailsItem.image,
                imageId: detailsItem.imageId,
                locations: detailsItem.locations,
                spare_part_name: detailsItem.partName,
                part_number: detailsItem.productId,
                description: detailsItem.description,
                stock_quantity: detailsItem.stock,
                receiving_from_warehouse: detailsItem.warehouse,
                company: detailsItem.company,
                category: detailsItem.category,
                uom: detailsItem.uom,
                business_unit: detailsItem.businessUnit,
                requested_date: detailsItem.createdDate,
                updated_date: detailsItem.updatedDate,
              }
            : undefined
        }
        loading={detailsLoading}
        error={detailsError}
        onClose={closeDetails}
        onRequestParts={detailsItem ? handleRequestPartsFromDetails : undefined}
        onInventoryLog={() => {}}
        EditImage={undefined}
      />

    </>
  );
}
