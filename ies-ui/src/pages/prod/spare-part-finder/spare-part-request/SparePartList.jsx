import Icon, { FileExcelOutlined, ReloadOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { Button, Card, DatePicker, Input, Modal, Select, Space, Tag, Typography, Upload, message } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getUrlReporting } from '@/pages/ReportUrl';
import { downloadGenericReport } from '@/services/apiGateway';
import { simpleRequestActions } from '@/services/model';
import RequestItemModal from './requestItem';
import { fetchSparePartCategories, fetchSparePartBusinessUnits, fetchSparePartWarehouses, SparePartRequestAPI, uploadFilesToFileService } from './service.api';
import { SparePartRequestService } from './service';
import SparePartImage from './SparePartImage';
import SpfDetails from './SpfDetails';
import RequestsWarehouseExportExcel from '../spare-part-warehouse/RequestsWarehouseExportExcel';

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

const getSparePartRowKey = (record) =>
  `${record?.id ?? ''}-${record?.productId || ''}-${normalizeBusinessUnit(record?.businessUnit) || 'no-bu'}-${record?.warehouse || record?.locations?.[0]?.warehouseCode || 'no-warehouse'}`;

const normalizeBusinessUnit = (value) => String(value || '').trim().toUpperCase();

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
  const detailRequestRef = useRef(0);
  const searchDebounceRef = useRef();
  const searchValueRef = useRef('');
  const filtersRef = useRef({
    businessUnits: [],
    category: undefined,
    status: 'All',
    warehouse: '',
    createdDateRange: undefined,
  });
  const requestSeqRef = useRef(0);
  const activeListControllerRef = useRef();
  const currentRowsRef = useRef([]);
  const requestActions = simpleRequestActions();
  const services = SparePartRequestAPI(requestActions);
  const requestServices = SparePartRequestService(requestActions);
  const { RangePicker } = DatePicker;
  const canSeeWarehouseLocation = access.canSpfWarehouseStaff || access.canAdmin;
  const canSeeStatusFilter = access.canSpfWarehouseStaff || access.canAdmin;
  const canSelectRows = access.canSpfRequester || access.canSpfApprover;
  const canManageImages = access.canSpfWarehouseStaff || access.canAdmin;
  const canExportExcel = access.canSpfWarehouseStaff || access.canAdmin;

  const [searchInputValue, setSearchInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedItemsById, setSelectedItemsById] = useState({});
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestItems, setRequestItems] = useState([]);
  const [requestInitialRows, setRequestInitialRows] = useState([]);
  const [requestWarehousesByBusinessUnit, setRequestWarehousesByBusinessUnit] = useState({});
  const [requestInitialRemark, setRequestInitialRemark] = useState('');
  const [requestInitialPriority, setRequestInitialPriority] = useState('normal');
  const [importingFile, setImportingFile] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [currentRows, setCurrentRows] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);
  const [knownWarehouses, setKnownWarehouses] = useState([]);
  const [knownBusinessUnits, setKnownBusinessUnits] = useState([]);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const exportInFlightRef = useRef(false);
  const [filters, setFilters] = useState({
    businessUnits: [],
    category: undefined,
    status: 'All',
    warehouse: '',
    createdDateRange: undefined,
  });

  const abortActiveListRequest = () => {
    activeListControllerRef.current?.abort?.();
    activeListControllerRef.current = undefined;
  };

  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...categoryItems.map((item) => ({ label: item.category_name, value: item.category_name })),
  ];

  const warehouseOptions = [
    { label: 'All Warehouses', value: '' },
    ...knownWarehouses.map((wh) => ({ label: wh, value: wh })),
  ];

  const businessUnitOptions = knownBusinessUnits.map((item) => ({ label: item, value: item }));

  useEffect(() => {
    fetchSparePartCategories()
      .then((items) => setCategoryItems(items.filter((item) => item?.id && item?.category_name)))
      .catch(() => undefined);

    fetchSparePartBusinessUnits()
      .then((items) => setKnownBusinessUnits(items.map(i => i.businessUnit).filter(Boolean)))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const selectedBusinessUnits = filters.businessUnits.filter(Boolean);
        const responses =
          selectedBusinessUnits.length === 0
            ? [await fetchSparePartWarehouses('')]
            : await Promise.all(
                selectedBusinessUnits.map(async (businessUnit) => {
                  const warehouses = await fetchSparePartWarehouses(businessUnit);
                  return warehouses.length > 0 ? warehouses : fetchSparePartWarehouses('');
                }),
              );
        const warehouseCodes = Array.from(
          new Set(responses.flat().map((item) => item.warehouseCode).filter(Boolean)),
        );

        setKnownWarehouses(warehouseCodes);
        if (filters.warehouse && !warehouseCodes.includes(filters.warehouse)) {
          applyFiltersAndReload((previous) => ({ ...previous, warehouse: '' }));
        }
      } catch (err) {
        setKnownWarehouses([]);
      }
    };
    fetchWarehouses();
  }, [filters.businessUnits, filters.warehouse]);

  useEffect(() => {
    if (searchInputValue === searchValue) return;

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      searchValueRef.current = searchInputValue;
      setSearchValue(searchInputValue);
      reloadTable(true);
    }, 350);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchInputValue, searchValue]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      abortActiveListRequest();
    };
  }, []);

  useEffect(() => {
    if (!resubmitDraft?.items?.length) return;

    const items = resubmitDraft.items.map((line, index) => buildResubmitItem(line, index));
    const initialRows = resubmitDraft.items.map((line, index) => buildResubmitRow(line, items[index]));
    const selectedKeys = items.map(getSparePartRowKey);

    setSelectedRowKeys(selectedKeys);
    setSelectedItemsById(
      items.reduce((acc, item) => {
        acc[getSparePartRowKey(item)] = item;
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
      setTimeout(() => {
        actionRef.current?.reload?.();
      }, 0);
    } else {
      actionRef.current?.reload?.();
    }
  };

  const commitSearchValue = (value) => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    abortActiveListRequest();
    searchValueRef.current = value;
    setSearchInputValue(value);
    setSearchValue(value);
    reloadTable(true);
  };

  const applyFiltersAndReload = (updater, resetPage = true) => {
    const nextFilters = typeof updater === 'function' ? updater(filtersRef.current) : updater;
    filtersRef.current = nextFilters;
    setFilters(nextFilters);
    abortActiveListRequest();
    reloadTable(resetPage);
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
        const rowKey = getSparePartRowKey(r);
        if (rowKey) {
          next[rowKey] = r;
        }
      });

      return next;
    });
  };

  const handleToggleRowSelection = (record) => {
    const key = getSparePartRowKey(record);
    if (!key) return;

    const nextKeys = selectedRowKeys.includes(key)
      ? selectedRowKeys.filter((item) => item !== key)
      : [...selectedRowKeys, key];

    syncSelection(nextKeys, [record]);
  };

  const selectedRequestItems = () =>
    selectedRowKeys
      .map((key) => selectedItemsById[String(key)] || currentRowsRef.current.find((row) => getSparePartRowKey(row) === String(key)))
      .filter(Boolean);

  const updateBusinessUnitFilters = (nextBusinessUnits) => {
    applyFiltersAndReload((previous) => ({ ...previous, businessUnits: nextBusinessUnits }));
  };

  const toggleBusinessUnitFilter = (businessUnit) => {
    const isSelected = filtersRef.current.businessUnits.includes(businessUnit);
    updateBusinessUnitFilters(
      isSelected
        ? filtersRef.current.businessUnits.filter((item) => item !== businessUnit)
        : [...filtersRef.current.businessUnits, businessUnit],
    );
  };

  const requestData = async (params) => {
    const requestSeq = ++requestSeqRef.current;
    const requestFilters = filtersRef.current;
    const controller = new AbortController();

    abortActiveListRequest();
    activeListControllerRef.current = controller;

    let response;
    try {
      response = await services.page({
        criteria: {
          searchValue: searchValueRef.current,
          category: requestFilters.category || '',
          status: requestFilters.status,
          warehouse: requestFilters.warehouse || '',
          businessUnit: requestFilters.businessUnits.length > 0 ? requestFilters.businessUnits : [],
        },
        pagination: {
          current: params.current,
          pageSize: params.pageSize,
        },
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted || error?.name === 'AbortError') {
        return {
          data: currentRowsRef.current,
          total: currentRowsRef.current.length,
          success: true,
        };
      }
      throw error;
    } finally {
      if (activeListControllerRef.current === controller) {
        activeListControllerRef.current = undefined;
      }
    }

    let rows = response.items || [];

    if (requestFilters.createdDateRange?.length === 2) {
      const [startIso, endIso] = requestFilters.createdDateRange;
      const startAt = dayjs(startIso).startOf('day');
      const endAt = dayjs(endIso).endOf('day');
      rows = rows.filter((item) => {
        if (!item.createdDate) return false;
        const d = dayjs(item.createdDate);
        return !d.isBefore(startAt) && !d.isAfter(endAt);
      });
    }

    if (requestSeq !== requestSeqRef.current) {
      return {
        data: currentRowsRef.current,
        total: currentRowsRef.current.length,
        success: true,
      };
    }

    setCurrentRows(rows);
    currentRowsRef.current = rows;
    setSelectedItemsById((previous) => {
      if (!selectedRowKeys?.length) return previous;
      const next = { ...previous };
      rows.forEach((row) => {
        const rowKey = getSparePartRowKey(row);
        if (selectedRowKeys.includes(rowKey)) {
          next[rowKey] = row;
        }
      });
      return next;
    });

    return {
      data: rows,
      total:
        requestFilters.createdDateRange?.length === 2
          ? rows.length
          : response.total || 0,
      success: true,
    };
  };

  const openRequestModal = async () => {
    const items = selectedRequestItems();
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

      const selectedIds = new Set(items.map(getSparePartRowKey));
      return previous.every((row) => selectedIds.has(getSparePartRowKey(row.item))) ? previous : [];
    });

    const businessUnits = Array.from(
      new Set(
        items
          .map((item) => normalizeBusinessUnit(item.businessUnit))
          .filter((businessUnit) => businessUnit && businessUnit !== '-'),
      ),
    );

    if (businessUnits.length > 0) {
      try {
        const warehouseEntries = await Promise.all(
          businessUnits.map(async (businessUnit) => [
            businessUnit,
            await fetchSparePartWarehouses(businessUnit),
          ]),
        );
        setRequestWarehousesByBusinessUnit(Object.fromEntries(warehouseEntries));
      } catch (error) {
        message.error('Failed to load destination warehouses.');
      }
    } else {
      setRequestWarehousesByBusinessUnit({});
    }

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

  const importRequestFile = async (file) => {
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
      const importedKeys = importedItems.map(getSparePartRowKey);

      syncSelection(importedKeys, importedItems);
      setRequestInitialRows(result.successfulRows);
      setRequestInitialRemark('');
      setRequestInitialPriority('normal');
      setRequestItems(importedItems);
      setRequestModalOpen(true);
      setImportModalOpen(false);
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

  const handleImportClick = () => {
    setImportModalOpen(true);
  };

  const handleImportBeforeUpload = async (file) => {
    await importRequestFile(file);
    return Upload.LIST_IGNORE;
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
      const detail = await services.detail({
        id: item.id,
        productId: item.productId,
        warehouseCode: item.warehouse || item.locations?.[0]?.warehouseCode,
      });
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

  const exportRequests = useCallback(
    async ({ dateRange, businessUnits }) => {
      if (exportInFlightRef.current) return;

      exportInFlightRef.current = true;
      setExportLoading(true);
      try {
        await downloadGenericReport(requestActions)?.({
          fileName: `spare-parts-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}`,
          type: 'EXCEL',
          data: {
            reportName: 'spare_parts',
            reportPath: getUrlReporting('prod'),
            data: [
              {
                key: 'BusinessUnit',
                value: businessUnits.length > 0 ? businessUnits.join(',') : 'All',
                type: 'string',
              }
            ],
          },
        });
        setExportModalOpen(false);
      } catch (error) {
        message.error('Failed to export Excel.');
      } finally {
        exportInFlightRef.current = false;
        setExportLoading(false);
      }
    },
    [requestActions],
  );

  const handleUploadProductImages = async (files) => {
    if (!detailsItem?.productId) return;
    const uploadedImageIds = await uploadFilesToFileService(files);
    if (!uploadedImageIds.length) {
      throw new Error('No image uploaded');
    }

    const updatedDetail = await services.updateImages(detailsItem.productId, uploadedImageIds);
    setDetailsItem(updatedDetail);
    reloadTable(false);
  };

  const handleDeleteProductImage = async (imageId) => {
    if (!detailsItem?.productId) return;

    const updatedDetail = await services.deleteImages(detailsItem.productId, [imageId]);
    setDetailsItem(updatedDetail);
    reloadTable(false);
  };

  const handleUpdateProductDetail = async (payload) => {
    const updatedDetail = await services.updateDetail(payload);
    setDetailsItem(updatedDetail);
    setCurrentRows((previous) =>
      previous.map((row) => (row.id === updatedDetail.id ? { ...row, ...updatedDetail } : row)),
    );
    setSelectedItemsById((previous) => ({
      ...previous,
      [getSparePartRowKey(updatedDetail)]: updatedDetail,
    }));
    reloadTable(false);
  };


  return (
    <>
      <Card size="small" style={{ marginBottom: 10 }}>
        <Space wrap size="middle">
          <Input.Search
            allowClear
            enterButton={<SearchOutlined />}
            value={searchInputValue}
            placeholder="Search by product ID or part name"
            style={{ width: 320 }}
            onChange={(event) => {
              abortActiveListRequest();
              setSearchInputValue(event.target.value || '');
            }}
            onSearch={(value) => {
              commitSearchValue(value || '');
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Typography.Text type="secondary"></Typography.Text>
            <div
              style={{
                display: 'flex',
                maxWidth: 420,
                overflowX: 'auto',
                paddingBottom: 2,
              }}
            >
              <Button
                type={filters.businessUnits.length === 0 ? 'primary' : 'default'}
                onClick={() => updateBusinessUnitFilters([])}
                style={{
                  borderRadius: '6px 0 0 6px',
                  flexShrink: 0,
                }}
              >
                All
              </Button>
              {businessUnitOptions.map((option, index) => (
                <Button
                  key={option.value}
                  type={filters.businessUnits.includes(option.value) ? 'primary' : 'default'}
                  onClick={() => toggleBusinessUnitFilter(option.value)}
                  style={{
                    borderLeftWidth: index === 0 ? undefined : 0,
                    borderRadius:
                      index === businessUnitOptions.length - 1 ? '0 6px 6px 0' : 0,
                    flexShrink: 0,
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* hidden ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â field temporarily removed from backend */}

          {/* {canSeeWarehouseLocation && ( */}
          <Select
            style={{ width: 140 }}
            value={filters.warehouse}
            options={warehouseOptions}
            onChange={(value) => {
              applyFiltersAndReload((previous) => ({ ...previous, warehouse: value || '' }));
            }}
          />
          {/* )} */}

          <Select
            style={{ width: 140 }}
            value={filters.category || ''}
            options={categoryOptions}
            onChange={(value) => {
              applyFiltersAndReload((previous) => ({ ...previous, category: value || undefined }));
            }}
          />



          {/* {canSeeStatusFilter ? ( */}
            <Select
              style={{ width: 140 }}
              value={filters.status}
              options={statusOptions}
              onChange={(value) => {
                applyFiltersAndReload((previous) => ({ ...previous, status: value }));
              }}
            />
          {/* ) : null} */}

          {canExportExcel ? (
            <Button icon={<FileExcelOutlined />} onClick={() => setExportModalOpen(true)}>
              Export Excel
            </Button>
          ) : null}

          {/* <RangePicker
            allowClear
            style={{ width: 260 }}
            placeholder={['Created from', 'Created to']}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                applyFiltersAndReload((previous) => ({
                  ...previous,
                  createdDateRange: [dates[0].toISOString(), dates[1].toISOString()],
                }));
              } else {
                applyFiltersAndReload((previous) => ({ ...previous, createdDateRange: undefined }));
              }
            }}
          /> */}
        </Space>
      </Card>

      <Card size="small">
        <ProTable
          actionRef={actionRef}
          size="small"
          rowKey={getSparePartRowKey}
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
          rowSelection={
            canSelectRows
              ? {
                preserveSelectedRowKeys: true,
                selectedRowKeys,
                onChange: (keys, rows) => {
                  syncSelection((keys || []).map((key) => String(key)), rows || []);
                },
              }
              : undefined
          }
          rowClassName={(record) =>
            canSelectRows && selectedRowKeys.includes(getSparePartRowKey(record)) ? 'ant-table-row-selected' : ''
          }
          onRow={(record) => ({
            onClick: (event) => {
              if (!canSelectRows) return;
              const target = event.target;
              if (target instanceof HTMLElement && target.closest('a, button, input, textarea, .ant-select')) {
                return;
              }
              handleToggleRowSelection(record);
            },
            style: { cursor: canSelectRows ? 'pointer' : 'default' },
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
                <Button type="primary" disabled={selectedRequestItems().length === 0} onClick={openRequestModal}>
                  Request{selectedRequestItems().length ? ` (${selectedRequestItems().length})` : ''}
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
                render: (v) => v || '-',
            },
            ...(canSeeWarehouseLocation
              ? [
                  
                  {
                    title: 'Rack',
                    render: (_, record) => record.locations?.[0]?.rack || '-',
                  },
                  {
                    title: 'Level',
                    render: (_, record) => record.locations?.[0]?.level || '-',
                  },
                  {
                    title: 'Shelve',
                    render: (_, record) => record.locations?.[0]?.shelve || '-',
                  },
                  {
                    title: 'Bin',
                    render: (_, record) => record.locations?.[0]?.bin || '-',
                  },
                  // {
                  //   title: 'Level',
                  //   dataIndex: 'level',
                  //   width: 120,
                  //   render: (v) => v || '-',
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
            ...(access.canSpfWarehouseStaff || access.canAdmin ? [
              {
                dataIndex: 'edit',
                width: 40,
                render: (_, record) => (
                  <a
                    style={{ color: '#1890ff', fontSize: 16, cursor: 'pointer' }}
                    onClick={() => {
                      openDetails(record);
                    }}>
                    Edit
                  </a>
                )
              },
            ] : [])
          ]}
          request={requestData}
        />
      </Card>

      <RequestItemModal
        open={requestModalOpen}
        selectedItems={requestItems}
        initialRows={requestInitialRows}
        initialWarehousesByBusinessUnit={requestWarehousesByBusinessUnit}
        onViewProduct={openDetails}
        onCancel={() => {
          setRequestModalOpen(false);
          setRequestInitialRows([]);
          setRequestWarehousesByBusinessUnit({});
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
            setRequestWarehousesByBusinessUnit({});
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

      <Modal
        open={importModalOpen}
        title="Import Request File"
        footer={null}
        onCancel={() => {
          if (!importingFile) {
            setImportModalOpen(false);
          }
        }}
        destroyOnClose
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Upload.Dragger
            accept=".xlsx"
            maxCount={1}
            multiple={false}
            showUploadList={false}
            beforeUpload={handleImportBeforeUpload}
            disabled={importingFile}
            style={{ padding: '12px 0' }}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <Typography.Text strong style={{ display: 'block', marginBottom: 4 }}>
              Drag and drop an Excel file here
            </Typography.Text>
            <Typography.Text type="secondary">
              or click this area to choose a `.xlsx` file
            </Typography.Text>
          </Upload.Dragger>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Upload
              accept=".xlsx"
              maxCount={1}
              multiple={false}
              showUploadList={false}
              beforeUpload={handleImportBeforeUpload}
              disabled={importingFile}
            >
              <Button icon={<FileExcelOutlined />} loading={importingFile}>
                Choose File
              </Button>
            </Upload>
          </div>
        </Space>
      </Modal>

      {canExportExcel ? (
        <RequestsWarehouseExportExcel
          open={exportModalOpen}
          loading={exportLoading}
          businessUnitOptions={knownBusinessUnits}
          showDateRange={false}
          onCancel={() => setExportModalOpen(false)}
          onSave={exportRequests}
        />
      ) : null}

      <SpfDetails
        open={detailsOpen}
        data={detailsItem || undefined}
        loading={detailsLoading}
        error={detailsError}
        onClose={closeDetails}
        onRequestParts={detailsItem ? handleRequestPartsFromDetails : undefined}
        onInventoryLog={() => { }}
        EditImage={undefined}
        canManageImages={canManageImages}
        onUploadImages={canManageImages ? handleUploadProductImages : undefined}
        onDeleteImage={canManageImages ? handleDeleteProductImage : undefined}
        onUpdateDetail={canManageImages ? handleUpdateProductDetail : undefined}
        categoryOptions={categoryItems.map((item) => ({
          label: item.category_name,
          value: item.id,
        }))}
      />

    </>
  );
}
