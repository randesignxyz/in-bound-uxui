// @ts-nocheck
import TableView, { colLink, TableViewSearchParams } from '@/components/DataCrud/TableView';
import { simpleRequestActions } from '@/services/model';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Card, Checkbox, DatePicker, message, Modal, Progress, Radio, Space, Spin, Tag, Image, UploadFile, Descriptions, Button, Table, Dropdown, Row, Col, Typography, Select, Form, Tooltip, Divider, Collapse, MenuProps, Flex, Badge } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AllocateServiceAPI } from '@/pages/delivery/allocate/service';
import { Allocate, AllocateSOAdvanceParams, AreaList, DeliveryList, DNItemParams, DNList, DNParams, DnQuickView, LocationList, SkuList, SOAllocateActivities, SOList, UpdateRemarkParams } from '@/pages/delivery/allocate/data';
import { useAccess, useModel } from '@umijs/max';
import { Paging } from '@/services/API';
import { FaCarSide, FaMapLocationDot, FaRegPenToSquare, FaTruckMoving } from "react-icons/fa6";
import DrawerForm from './DrawerForm';
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import AddRemarkModal from './AddRemarkForm';
import { uploadFileToFirebase } from './uploadImage';
import { CloseCircleOutlined, ColumnHeightOutlined, CopyOutlined, DashOutlined, ExportOutlined, FileExcelOutlined, FileSearchOutlined, HistoryOutlined, MoreOutlined, PlayCircleOutlined, PlusCircleOutlined, ReloadOutlined, SyncOutlined } from '@ant-design/icons';
import AdvanceSearch from './advanceSearchDrawer';
import { FloatingCard } from './displayCard';
import SaleTypeDrawer from './SaleTypeDrawer';
import moment from 'moment';
import { ProForm, ProFormDatePicker, ProFormDateRangePicker, ProFormSelect } from '@ant-design/pro-components';
import ForceColseModal from './ForceCloseModal';
import { TbMap2 } from "react-icons/tb";
import { useLocation, useNavigate } from "react-router-dom";
import SortModal, { SortRule } from '@/pages/delivery/allocate/SortModal';
import { render } from '@testing-library/react';
import OfficerZoneFilter from '@/pages/delivery/allocate/FilterSelect';
import ExportExcel from '@/pages/delivery/allocate/ExportExcel';
import { downloadGenericReport } from '@/services/apiGateway';

dayjs.extend(customParseFormat)
interface DNListState {
  selectedRows?: DNList[]
  areaList?: AreaList[]
}

export default () => {
  const navigate = useNavigate();
  const { RangePicker } = DatePicker
  const { state } = useLocation() as { state: DNListState };
  const access = useAccess();
  const [form] = Form.useForm();
  const requestActions = simpleRequestActions();
  const services = AllocateServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const restoredFromNavRef = useRef(false);
  const [data, setData] = useState<SOList[]>()
  const [skuList, setSkuList] = useState<SkuList[]>([])
  const [dataListDn, setDataListDn] = useState<DNList[]>([])
  const [selectedListDn, setSelectedListDn] = useState<DNList[]>([])
  const [selectedRows, setSelectedRows] = useState<DNList[]>([]);
  const [sortModalOpen, setSortModalOpen] = useState(false);
  const [loading, isLoading] = useState(false)
  const [claimLoading, setClaimLoading] = useState(false);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortRule[]>([
    { field: 'shippingAddress', order: 'desc' }
  ]);
  const [asDate, setAsDate] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [drawerTypeOpen, setDrawerTypeOpen] = useState<{ visible: boolean; data?: DNList }>({
    visible: false,
  });
  const [drawerOpen, setDrawerOpen] = useState<{ visible: boolean; id: string, status?: string, po?: string, deliveres?: any[], so?: string, dn_qty?: number, order_qty?: number }>({
    visible: false,
    id: '',
  });
  const [cardOpen, setCardOpen] = useState<{ visible: boolean }>({
    visible: false
  });
  const [advanceSearchParams, setAdvanceSearchParams] = useState({
    filter: 'DN',
    status: 'posted',
    dnStatus: 'pending'
  });
  const [MTSearch, setMTSearch] = useState<{ status: string; startDate?: string, endDate?: string }>({
    status: 'pending',
  });
  const [dnSearch, setDnSearch] = useState<{ status: string; delivery_date?: string, province_id?: string, district_id?: any, commune_id?: string, dnStatus?: string, sap_delivery_date: string | null, sap_from_date?: string, sap_to_date?: string, customer?: string, zone?: [] }>({
    status: 'posted',
    dnStatus: 'open',
    sap_delivery_date: 'unplan',
  });
  const [modalOpen, setModalOpen] = useState<{ visible: boolean; id: number, remark?: string, attachment?: any, sales_planid?: string }>({
    visible: false,
    id: 0,
  });
  const [forceCloseOpen, setForceCloseOpen] = useState<{ visible: boolean; id: number }>({
    visible: false,
    id: 0,
  });
  const [quickViewSearch, setQuickViewSearch] = useState<{ startDate?: string; endDate?: string }>({
    startDate: undefined,
    endDate: undefined
  });

  const [searchModalOpen, setSearchModalOpen] = useState<{ visible: boolean }>({
    visible: false
  });
  const [activities, setActivities] = useState<SOAllocateActivities[]>([]);
  const [hisSearch, setHisSearch] = useState<{
    sap_delivery_date: string | null; status: string; delivery_date?: string, province_id?: string, district_id?: any, commune_id?: string, dnStatus?: string, sap_from_date?: string, sap_to_date?: string, customer?: string,
    // zone?: string
  }>({
    status: 'posted',
    dnStatus: 'open',
    sap_delivery_date: 'as_of_now',
  });
  const cacheList = useModel('dataList');
  const normalizeLocationList = (
    res: LocationList | Paging<LocationList> | LocationList[]
  ): LocationList[] => {
    if (Array.isArray(res)) return res;
    if ("data" in res && Array.isArray(res.data)) return res.data;
    if (res && !("data" in res)) return [res as LocationList];
    return [];
  };
  const [officerArea, setOfficerArea] = useState<any[]>([]);
  const [provinceId, setProvinceId] = useState<string | undefined>(undefined);
  const [districtId, setDistrictId] = useState<string | undefined>(undefined);
  const [provinceOptions, setProvinceOptions] = useState<{ value: number; label: string }[]>([]);
  const [districtOptions, setDistrictOptions] = useState<{ value: number; label: string }[]>([]);
  const [communeOptions, setCommuneOptions] = useState<{ value: number; label: string }[]>([]);
  const [areaOptions, setAreaOptions] = useState<any[]>([]);
  const [areaReady, setAreaReady] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [useExisting, setUseExisting] = useState(false);
  const [selectedClaimedLine, setSelectedClaimedLine] = useState<string | null>(null);
  const [claimedLines, setClaimedLines] = useState<string[]>([]);
  const [claimIds, setClaimIds] = useState<number[]>([]);
  const [selectedArea, setSelectedArea] = useState<number[]>([]);
  const [countList, setCountList] = useState<any[]>([]);
  const [routeOptions, setRouteOptions] = useState<any[]>([]);
  const [zoneOptions, setZoneOptions] = useState<any[]>([]);
  const [routeId, setRouteId] = useState<any[]>([]);
  const [zoneId, setZoneId] = useState<string | undefined>(undefined);
  const [exportModel, setExportModal] = useState<{ visible: boolean }>({
    visible: false,
  });
  const [excelLoading, setExcelLoading] = useState(false)

  useEffect(() => {
    if (state?.selectedRows) {
      setSelectedRowKeys(prev => {
        const newKeys = state.selectedRows
          ?.map(r => r.id)
          .filter(id => !prev.includes(id));
        return [...prev, ...newKeys];
      });

      setSelectedRows(prev => {
        const newRows = state.selectedRows?.filter(
          r => !prev.some(p => p.id === r.id)
        );
        return [...prev, ...newRows];
      });

      setSelectedListDn(prev => {
        const newRows = state.selectedRows?.filter(
          r => !prev.some(p => p.id === r.id)
        );
        return [...prev, ...newRows];
      });

      setDataListDn(prev => ({
        ...prev,
        items: prev?.items?.filter(
          r => !state.selectedRows?.some(s => s.id === r.id)
        ),
      }));
      if (state.selectedRows.length > 0) setCardOpen({ visible: true });
    }
  }, [state?.selectedRows]);

  useEffect(() => {
    if (state?.areaList) {
      setSelectedArea(state?.areaList)
    }
  }, [state?.areaList]);

  useEffect(() => {
    AllocateServiceAPI(requestActions)
      .list_route()
      .then((res) => setRouteOptions(normalizeLocationList(res).map((obj) => ({ value: obj.district_id, label: obj.name, id: obj.id }))));
  }, []);


  useEffect(() => {
    if (!routeId) {
      setZoneOptions([]);
      setRouteId(null);
      return;
    }
    AllocateServiceAPI(requestActions)
      .list_zone(routeId)
      .then((res) => setZoneOptions(normalizeLocationList(res).map((obj) => ({ value: obj.location_id, label: obj.name }))));
  }, [routeId]);

  // Load provinces once
  useEffect(() => {
    // onSync()
    AllocateServiceAPI(requestActions)
      .list_Location("PROVINCE")
      .then((res) => setProvinceOptions(normalizeLocationList(res).map((obj) => ({ value: obj.id, label: obj.name }))));
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (!provinceId) {
      setDistrictOptions([]);
      setDistrictId(null);
      return;
    }
    AllocateServiceAPI(requestActions)
      .list_Location("DISTRICT", provinceId)
      .then((res) => setDistrictOptions(normalizeLocationList(res).map((obj) => ({ value: obj.id, label: obj.name }))));
  }, [provinceId]);

  // Load communes when district changes
  useEffect(() => {
    if (!districtId) {
      setCommuneOptions([]);
      return;
    }
    AllocateServiceAPI(requestActions)
      .list_Location("COMMUNE", districtId)
      .then((res) => setCommuneOptions(normalizeLocationList(res).map((obj) => ({ value: obj.id, label: obj.name }))));
  }, [districtId]);


  useEffect(() => {
    const fetchSku = async () => {
      const result = await services.list_sku();

      let skuArray: SkuList[] = [];

      if (Array.isArray(result)) {
        skuArray = result;
      } else if ('data' in result && Array.isArray(result.data)) {
        skuArray = result.data;
      } else {
        skuArray = [result];
      }

      // Sort by item_category first, then by sequence
      const sortedSku = skuArray.sort((a, b) => {
        if (a.item_category !== b.item_category) {
          return a.item_category - b.item_category; // category ascending
        }
        return a.sequence - b.sequence; // sequence ascending
      });

      setSkuList(sortedSku);
    };

    fetchSku();
  }, [advanceSearchParams.filter === 'DN']);

  useEffect(() => {
    if (claimOpen) {
      setUseExisting(false);
      setSelectedClaimedLine(null);
    }
  }, [claimOpen]);

  const getMenuItems = (item: any): MenuProps['items'] => {

    const items: MenuProps['items'] = [];

    // Activate
    items.push({
      key: 'TBA',
      label: 'TBA',
      // icon: <CheckCircleOutlined />,
      onClick: () => handleTBA([Number(item.id)], item),
    });

    // Divider (correctly typed)
    items.push({
      type: 'divider',
    });

    if (item.status != 'force-close' && item.status != 'complete' && access.canAccesAddRemarkAllocate) {
      items.push({
        key: 'force_close',
        label: 'Force Close',
        icon: <CloseCircleOutlined />,
        danger: true,
        onClick: () => setForceCloseOpen({
          visible: true,
          id: item?.id,
        }),
      });
    }
    return items;
  };

  const getClearTBA = (item: any): MenuProps['items'] => {

    const items: MenuProps['items'] = [];

    // Activate
    items.push({
      key: 'Clear TBA',
      label: 'Clear TBA',
      // icon: <CheckCircleOutlined />,
      onClick: () => handleClearTBA([Number(item.id)], item),
    });
    return items;
  };

  const handleSaveRemark = async (data: UpdateRemarkParams & { file?: UploadFile[] }) => {
    Modal.confirm({
      title: 'Add Remark',
      content: 'Are you sure?',
      onOk: async () => {
        let fileUrls: string[] = [];

        if (data.file && data.file.length > 0) {
          try {
            const existingFiles = data.file.filter(f => !f.originFileObj);
            const existingUrls = existingFiles
              .map(f => f.url)
              .filter(Boolean) as string[];

            const newFiles = data.file.filter(f => !!f.originFileObj);

            // Upload only the new files to Firebase
            const newFileUrls = await Promise.all(
              newFiles.map(f => uploadFileToFirebase(f.originFileObj as File))
            );

            fileUrls = [...existingUrls, ...newFileUrls];

          } catch (err) {
            message.error('File upload failed');
            return;
          }
        }

        const payload = {
          ...data,
          attachment: fileUrls.length > 0 ? fileUrls.map(url => ({ attachment: url })) : [],
        };
        console.log('payload', payload)
        await services.updateRemark(payload) as {
          data: string;
          message: string;
        };
        setModalOpen({ visible: false, id: 0 });
        actionRef.current?.reloadAndRest?.();
        message.success('Updated successfully');
      },
    });
  };

  const handleForceClose = async (data: UpdateRemarkParams) => {
    Modal.confirm({
      title: 'Force Close',
      content: 'Are you sure?',
      onOk: async () => {
        await services.force_close(data) as {
          data: string;
          message: string;
        };
        setForceCloseOpen({ visible: false, id: 0 });
        actionRef.current?.reloadAndRest?.();
        message.success('Updated successfully');
      },
    });
  };

  const handleTBA = async (ids: number[], selectedListDn: any[]) => {
    Modal.confirm({
      title: 'TBA',
      content: 'Are you sure?',
      onOk: async () => {
        const dnList = Array.isArray(selectedListDn)
          ? selectedListDn
          : [selectedListDn];

        const rawLines = dnList.flatMap(dn =>
          (dn.deliveryItems ?? []).map((it: any) => ({
            soDocEntry: String(dn.so_doc_entry ?? dn.soId),
            lineNum: Number(it.sap_line_num),
            shipDate: dn.deliveryDate
          }))
        );

        const uniqueMap = new Map<string, any>();
        rawLines.forEach((l) => {
          const key = `${l.soDocEntry}_${l.lineNum}`;
          if (!uniqueMap.has(key)) uniqueMap.set(key, l);
        });

        const del_item = Array.from(uniqueMap.values());

        del_item.sort((a, b) =>
          a.soDocEntry === b.soDocEntry
            ? a.lineNum - b.lineNum
            : a.soDocEntry.localeCompare(b.soDocEntry)
        );

        await services.ClaimDn(
          ids,
          access.currentUser?.login ?? '',
          `Unpick (${dnList.map(v => v.claimed_line)}) & TBA`,
          'TBA',
          null,
          del_item,
          'TBA'
        );

        actionRef.current?.reloadAndRest?.();
        message.success('Updated successfully');
      },
    });
  };

  const handleClearTBA = async (ids: number[], selectedListDn: any[]) => {
    Modal.confirm({
      title: 'Clear TBA',
      content: 'Are you sure?',
      onOk: async () => {
        const dnList = Array.isArray(selectedListDn)
          ? selectedListDn
          : [selectedListDn];

        const rawLines = dnList.flatMap(dn =>
          (dn.deliveryItems ?? []).map((it: any) => ({
            soDocEntry: String(dn.so_doc_entry ?? dn.soId),
            lineNum: Number(it.sap_line_num),
            shipDate: dn.deliveryDate
          }))
        );

        const uniqueMap = new Map<string, any>();
        rawLines.forEach((l) => {
          const key = `${l.soDocEntry}_${l.lineNum}`;
          if (!uniqueMap.has(key)) uniqueMap.set(key, l);
        });

        const del_item = Array.from(uniqueMap.values());

        del_item.sort((a, b) =>
          a.soDocEntry === b.soDocEntry
            ? a.lineNum - b.lineNum
            : a.soDocEntry.localeCompare(b.soDocEntry)
        );

        await services.ClaimDn(
          ids,
          access.currentUser?.login ?? '',
          'Clear TBA',
          'TBA',
          null,
          del_item,
          'open'
        );
        await services.list_count()
        actionRef.current?.reloadAndRest?.();
        message.success('Updated successfully');
      },
    });
  };

  const handleClaim = async (ids: number | number[]) => {
    const claimed_line = await services.list_claimed_line()
    setClaimIds(Array.isArray(ids) ? ids : [ids]);
    setClaimedLines(claimed_line);
    setClaimOpen(true);
  };

  const handleUnClaim = async (ids: number[], selectedListDn: any[]) => {
    Modal.confirm({
      title: 'Unpick',
      content: 'Are you sure?',
      onOk: async () => {
        const dnList = Array.isArray(selectedListDn)
          ? selectedListDn
          : [selectedListDn];
        const rawLines = dnList.flatMap(dn =>
          (dn.deliveryItems ?? []).map((it: any) => ({
            soDocEntry: String(dn.so_doc_entry ?? dn.soId),
            lineNum: Number(it.sap_line_num),
            shipDate: dn.deliveryDate
          }))
        );

        const uniqueMap = new Map<string, any>();
        rawLines.forEach((l) => {
          const key = `${l.soDocEntry}_${l.lineNum}`;
          if (!uniqueMap.has(key)) uniqueMap.set(key, l);
        });

        const del_item = Array.from(uniqueMap.values());

        del_item.sort((a, b) =>
          a.soDocEntry === b.soDocEntry
            ? a.lineNum - b.lineNum
            : a.soDocEntry.localeCompare(b.soDocEntry)
        );
        await services.ClaimDn(
          ids,
          access.currentUser?.login ?? '',
          `Unpick (${dnList.map(v => v.claimed_line)})`,
          'Unpick DN',
          null,
          del_item
        );

        actionRef.current?.reloadAndRest?.();
        message.success('Updated successfully');
      },
    });
  };



  const getActivities = async (id: number) => {
    try {
      const da = await services.getActivities(id);

      const uniqueMap = new Map<string, any>();

      da.forEach(activity => {
        // Normalize date: ignore seconds & milliseconds
        const date = new Date(activity.action_date);
        const dateKey =
          `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ` +
          `${date.getHours()}:${date.getMinutes()}`;

        const key = `${activity.action}|${activity.remark}|${dateKey}`;

        // Keep first occurrence only
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, activity);
        }
      });

      const uniqueActivities = Array.from(uniqueMap.values());

      setActivities(uniqueActivities);
    } catch (error) {
      console.error(error);
    }
  };

  const activityMenu = {
    items: activities.map((activity, index) => ({
      key: index,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <strong>{activity.action}</strong> by {activity.action_by}
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: '#888' }}>
            {dayjs(activity.action_date)
              .tz('Asia/Phnom_Penh')
              .format('DD-MMM-YYYY hh:mm A')}
          </div>
        </div>
      ),
    })),
    style: {
      maxHeight: 300,
      overflowY: 'auto',
    },
  };

  const onRequestDNHandler = async (
    params: TableViewSearchParams<AllocateSOAdvanceParams>
  ): Promise<any> => {
    try {
      const list = await services.list_dn_by_user(
        MTSearch.status,
        MTSearch.startDate,
        MTSearch.endDate
      );

      if (!Array.isArray(list)) {
        throw new Error("Unexpected response format");
      }

      const groupedResult = list.map(group => {
        const processedData = group.data.map((delivery: { deliveryItems: any; unplannedItems: any; }) => {
          const deliveryItems = Array.isArray(delivery.deliveryItems)
            ? delivery.deliveryItems
            : [];
          const unplannedItems = Array.isArray(delivery.unplannedItems)
            ? delivery.unplannedItems
            : [];

          const mergedItems = [
            ...deliveryItems.map((item: any) => ({ ...item, isUnplanned: false })),
            ...unplannedItems.map((item: any) => ({ ...item, isUnplanned: true }))
          ];

          return {
            ...delivery,
            mergedItems
          };
        });

        return {
          claimed_line: group.claimed_line,
          claimed_date: group.claimed_date,
          claim_status: group.claim_status,
          data: processedData
        };
      });

      // STEP 2 — pagination applies to groups, not individual deliveries
      const page = params.pagination?.current ?? 1;
      const pageSize = params.pagination?.pageSize ?? 20;
      const total = groupedResult.length;
      const pagedGroups = groupedResult.slice(
        (page - 1) * pageSize,
        page * pageSize
      );
      return {
        items: pagedGroups,
        total,
        page,
        pageSize
      };

    } catch (error: any) {
      message.error(error.message);
      return Promise.reject(error);
    }
  };

  const onSync = async () => {
    try {
      isLoading(true)
      await services.syncAllocate();
      actionRef.current?.reloadAndRest?.();
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject(error);
    } finally {
      isLoading(false)
    }
  };

  const normalizeUOM = (uom: string | undefined): 'pack' | 'bowl' | null => {
    if (!uom) return null;
    const lower = uom.toLowerCase();
    if (lower === 'case' || lower === 'pack') return 'pack';
    if (lower === 'bowl') return 'bowl';
    return null; // skip unknown UOM
  };

  useEffect(() => {
    if (state?.areaList?.length) {
      restoredFromNavRef.current = true;

      setSelectedArea(state.areaList);
      form.setFieldsValue({
        area_dn: state.areaList,
        area_his: state.areaList,
      });

      setDnSearch(v => ({
        ...v,
        // zone: state.areaList,
      }));
    }
  }, [state?.areaList]);

  useEffect(() => {
    const loadDefaultAreas = async () => {
      const res = await services.list_area();
      if (!Array.isArray(res)) return;

      const options = res.map((a: any) => ({
        value: Number(a.zone_ids),
        label: a.zone_name.replace(/^S&D\s*/i, '').trim(),
        isDefault: a.isdefault === '1' || a.is_default === '1',
      }));

      setAreaOptions(options);

      // 🔑 HARD STOP if restored from navigation
      if (restoredFromNavRef.current) {
        setAreaReady(true);
        return;
      }

      // otherwise → apply default
      const defaultAreaIds = options
        .filter(o => o.isDefault)
        .map(o => o.value);

      if (defaultAreaIds.length > 0) {
        setSelectedArea(defaultAreaIds);

        form.setFieldsValue({
          area_dn: defaultAreaIds,
          area_his: defaultAreaIds,
        });

        setDnSearch(v => ({
          ...v,
          // zone: defaultAreaIds,
        }));
      }

      setAreaReady(true);
      const count = await services.list_count()
      setCountList(count)
      setTimeout(() => {
        actionRef.current?.reloadAndRest?.();
      }, 0);
    };

    loadDefaultAreas();
  }, []);

  const buildBackendSort = (sortConfig: SortRule[]) => {
    const sortBy: string[] = [];
    const sortOrders: string[] = [];

    sortConfig.forEach((rule) => {
      if (rule.field && rule.order) {
        sortBy.push(rule.field);
        sortOrders.push(rule.order);
      }
    });

    return { sortBy, sortOrders };
  };

  const onRequestDNDeatilHandler = async (
    params: TableViewSearchParams<AllocateSOAdvanceParams>
  ): Promise<Paging<DNList>> => {
    try {
      const { sortBy, sortOrders } = buildBackendSort(sortConfig);

      const res = await services.list_dn_detail({
        criteria: {
          ...dnSearch,
          ...params.criteria,
          sap_delivery_date:
            dnSearch.sap_from_date && dnSearch.sap_to_date
              ? null
              : dnSearch.sap_delivery_date,
          filterPass: 'Unclaimed',
          sortBy,
          sortOrders,
        },
        pagination: {
          current: params.pagination?.current ?? 1,
          pageSize: params.pagination?.pageSize ?? 20,
        }
      });

      if (!res || !Array.isArray(res.items)) {
        throw new Error('Unexpected response format');
      }

      const transformedItems = res.items.map((delivery) => {
        const skuValues: Record<string, number> = {};

        skuList.forEach((sku) => {
          if (sku.item_category === 2) {
            skuValues[`${sku.sku_code}_pack`] = 0;
            skuValues[`${sku.sku_code}_bowl`] = 0;
          } else {
            skuValues[sku.sku_code] = 0;
          }
        });

        const itemsToUse =
          delivery.mergeItems?.length > 0
            ? delivery.mergeItems
            : delivery.deliveryItems;

        itemsToUse.forEach((item) => {
          const sku = skuList.find(
            (s) => s.id.toString() === item.sku_id
          );
          if (!sku) return;

          const key =
            sku.item_category === 2
              ? `${sku.sku_code}_${normalizeUOM(item.sku_uom)}`
              : sku.sku_code;

          skuValues[key] += item.remaining_qty;
        });

        return {
          ...delivery,
          key: delivery.id,
          ...skuValues,
        };
      });
      const dataList = {
        items: transformedItems,
      }
      setDataListDn(dataList)
      return {
        items: transformedItems,
        total: res.total,
        pageSize: res.pageSize,
      };
    } catch (error: any) {
      message.error(error.message);
      throw error;
    }
  };

  const onHistoryRequestDNDeatilHandler = async (
    params: TableViewSearchParams<AllocateSOAdvanceParams>
  ): Promise<Paging<DNList>> => {
    try {
      const sortBy: string[] = [];
      const sortOrders: string[] = [];

      if (params?.criteria?.sort) {
        Object.entries(params.criteria.sort).forEach(([key, value]) => {
          sortBy.push(key);
          sortOrders.push(value === 'ascend' ? 'asc' : 'desc');
        });
      }

      const res = await services.list_dn_detail({
        criteria: {
          ...hisSearch,
          ...params.criteria,
          sap_delivery_date:
            hisSearch.sap_from_date && hisSearch.sap_to_date
              ? null
              : hisSearch.sap_delivery_date,
          filterPass: 'Claimed',
        },
        pagination: {
          current: params.pagination?.current ?? 1,
          pageSize: params.pagination?.pageSize ?? 10,
        },
        sort: params.sort,
      });


      if (!res || !Array.isArray(res.items)) {
        throw new Error('Unexpected response format');
      }

      const transformedItems = res.items.map((delivery) => {
        const skuValues: Record<string, number> = {};

        skuList.forEach((sku) => {
          if (sku.item_category === 2) {
            skuValues[`${sku.sku_code}_pack`] = 0;
            skuValues[`${sku.sku_code}_bowl`] = 0;
          } else {
            skuValues[sku.sku_code] = 0;
          }
        });

        const itemsToUse =
          delivery.mergeItems?.length > 0
            ? delivery.mergeItems
            : delivery.deliveryItems;

        itemsToUse.forEach((item) => {
          const sku = skuList.find(
            (s) => s.id.toString() === item.sku_id
          );
          if (!sku) return;

          const key =
            sku.item_category === 2
              ? `${sku.sku_code}_${normalizeUOM(item.sku_uom)}`
              : sku.sku_code;

          skuValues[key] += item?.qty;
        });

        return {
          ...delivery,
          key: delivery.id,
          ...skuValues,
        };
      });

      return {
        items: transformedItems,
        total: res.total,
        pageSize: res.pageSize,
      };
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject(error);
    }
  };

  const skuColumns: ProColumns<DNList>[] = skuList.map((sku) => {
    if (sku.item_category === 1) {

      return {
        title: sku.sku_name,
        dataIndex: sku.sku_code,
        key: sku.sku_code,
        width: 120, // fix width
        render: (_, record) => (record as any)[sku.sku_code] || '-',
        onCell: () => ({
          style: {
            backgroundColor:
              sku.id == 9
                ? 'rgba(239, 109, 35, 0.05)'
                : 'rgba(3, 78, 162, 0.05)',
            textAlign: 'center',
          },
        }),
      };
    } else if (sku.item_category === 2) {
      return {
        title: sku.sku_name,
        key: sku.sku_code,
        children: [
          {
            title: 'Pack',
            dataIndex: `${sku.sku_code}_pack`,
            key: `${sku.sku_code}_pack`,
            maxwidth: 60, // fix width for Pack
            render: (_, record) => (record as any)[`${sku.sku_code}_pack`] || '-',
            onCell: () => ({ style: { backgroundColor: 'rgba(239, 109, 35, 0.05)', textAlign: 'center' } }),
          },
          {
            title: 'Bowl',
            dataIndex: `${sku.sku_code}_bowl`,
            key: `${sku.sku_code}_bowl`,
            width: 60, // fix width for Bowl
            render: (_, record) => (record as any)[`${sku.sku_code}_bowl`] || '-',
            onCell: () => ({ style: { backgroundColor: 'rgba(239, 109, 35, 0.05)', textAlign: 'center' } }),
          },
        ],
      };
    } else {
      return {
        title: sku.sku_name,
        dataIndex: sku.sku_code,
        key: sku.sku_code,
        width: 120, // fix width
        render: (_, record) => (record as any)[sku.sku_code] || '-',
        onCell: () => ({
          style: {
            backgroundColor: 'rgba(87, 87, 87, 0.05)',
            textAlign: 'center',
          },
        }),
      };
    }
  });

  // Static columns
  const staticColumns: ProColumns<DNList>[] = [
    ...(advanceSearchParams.filter !== 'HIS'
      ? [
        {
          title: '',
          dataIndex: 'checkbox',
          width: '2%',
          render: (_: any, record: DNList) => {
            if (record.status === 'TBA') {
              return null
            }

            return (
              <Checkbox
                checked={selectedRowKeys.includes(record.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedRowKeys(prev => [...prev, record.id]);
                    setSelectedRows(prev => [...prev, record]);
                    setCardOpen({ visible: true });
                    setSelectedListDn(prev => [...prev, record]);
                    // setDataListDn(prev => prev.items.filter(r => r.id !== record.id));
                    setDataListDn(prev => ({
                      ...prev,
                      items: prev?.items?.filter(r => r.id !== record.id),
                    }));
                  } else {
                    setSelectedRowKeys(prev => prev.filter(k => k !== record.id));
                    setSelectedRows(prev => prev.filter(r => r.id !== record.id));
                    setSelectedListDn(prev => prev.filter(r => r.id !== record.id));
                    setDataListDn(prev => ({
                      ...prev,
                      items: [...prev.items, record],
                    }));
                  }
                }}
              />
            );
          },

        },
      ]
      : []),


    {
      title: 'SO No',
      dataIndex: 'so_no',
      key: 'so_no',
      width: 300,
      render: (_, value) => (
        <>
          <a onClick={() => setDrawerTypeOpen({ visible: true, data: value })}>
            <Typography.Link strong copyable >{value.so_no}</Typography.Link>
          </a>
          <a style={{ marginLeft: 5 }} onClick={() => window.open(`/external/sale/so/detail/${value.soId}`, '_blank')?.focus()}>
            <Typography.Link >< ExportOutlined /></Typography.Link>
          </a>
          {value.status == 'TBA' &&
            <a style={{ marginLeft: 5 }} onClick={() => { console.log(value) }}>
              <Typography.Link ><Dropdown
                menu={{
                  items: getClearTBA(value),
                  style: { width: 200 },
                }}
              >
                <a onClick={(e) => e.preventDefault()}>
                  <MoreOutlined />
                </a>
              </Dropdown></Typography.Link>
            </a>
          }
        </>
      ),
    },
    {
      title: 'DO No',
      dataIndex: 'id',
      width: 200,
      render: (_, value) => (
        <>
          <a onClick={() => setDrawerTypeOpen({ visible: true, data: value })}>
            <Typography.Link strong copyable >{value.id}</Typography.Link>
          </a>
        </>
      ),
    },
    // {
    //   title: 'Request Delivery Date',
    //   dataIndex: 'deliveryDate',
    //   width: '6%',
    //   render: (_, r) =>
    //     dayjs.utc(r.deliveryDate).add(7, 'hour').format('DD-MMM-YYYY'),// forces UTC, no timezone shift
    //   sorter: {
    //     compare: (a, b) =>
    //       (a.deliveryDate ? dayjs(a.deliveryDate).unix() : 0) -
    //       (b.deliveryDate ? dayjs(b.deliveryDate).unix() : 0),
    //     multiple: 4,
    //   },
    // },
    {
      title: 'Delivery Date',
      dataIndex: 'deliveryDate',
      width: '6%',
      render: (_, r) =>
        dayjs.utc(r.deliveryDate).add(7, 'hour').format('DD-MMM-YYYY hh:mm'),// forces UTC, no timezone shift
      // sorter: {
      //   compare: (a, b) =>
      //     (a.sap_delivery_date ? dayjs(a.sap_delivery_date).unix() : 0) -
      //     (b.sap_delivery_date ? dayjs(b.sap_delivery_date).unix() : 0),
      //   multiple: 4,
      // },
    },
    {
      title: 'Shipping Address',
      dataIndex: 'shippingAddress',
      width: '10%',
      render: (_, value) => (
        <a
          style={{
            whiteSpace: 'nowrap',
          }}
          onClick={() => {
            if (value.latitude && value.longitude) {
              const url = `https://www.google.com/maps?q=${value.latitude},${value.longitude}`;
              window.open(url, '_blank');
            } else {
              message.info(`No location found for: ${value.shippingAddress}`);
            }
          }}
        >
          {value.shippingAddress}
        </a>
      ),
    },
    // { title: 'Route', dataIndex: 'route_name', width: 120 },
    // { title: 'Zone', dataIndex: 'zone_name', width: '7%' },
    ...(advanceSearchParams.filter !== 'HIS'
      ? [
        // {
        //   title: 'Area',
        //   dataIndex: 'division',
        //   width: 150,
        //   render: (value: string) =>
        //     value?.replace(/^S&D\s*/i, ''),
        // },
        // {
        //   title: 'Zone',
        //   dataIndex: 'zone_name',
        //   width: 150,
        //   render: (value: string) =>
        //     value?.replace(/^S&D\s*/i, ''),
        // },
        {
          title: 'District', dataIndex: 'district', width: 150,
          // sorter: {
          //   compare: (a, b) => (a.district ?? '').localeCompare(b.district ?? ''),
          //   multiple: 2,
          // },
        },
        {
          title: 'Commune', dataIndex: 'commune', width: 150,
          //  sorter: {
          //   compare: (a, b) => (a.commune ?? '').localeCompare(b.commune ?? ''),
          //   multiple: 3,
          // },
        },
        // { title: 'Channel', dataIndex: 'channel', width: 150 },
        {
          title: 'Volume', width: 120,
          render: (_: any, r: { mergeItems: any[]; }) => {
            if (!r.mergeItems) return 0;

            const total = r.mergeItems.reduce((sum, item) => {
              const volume = Number(item.volume) || 0;
              const remaining_qty = Number(item.remaining_qty) || 0;

              return sum + volume * remaining_qty;
            }, 0);

            return `${total.toFixed(2)} m³`
          }
        },
        {
          title: 'Truck Type', width: 150,
          dataIndex: 'truck_capacity',
        },
      ]
      : []),


    {
      title: 'SKU',
      key: 'sku',
      children: skuColumns,
    },
    {
      title: 'SAL Remark',
      dataIndex: 'remarks',
      width: 500, // keep reasonable width
      render: (_, record) => (
        <div
          style={{
            whiteSpace: 'normal',     // ✅ allow wrap
            wordBreak: 'break-word',  // ✅ break long words
          }}
        >
          {record.remarks || '-'}
        </div>
      ),
    },
    ...(advanceSearchParams.filter !== 'DN'
      ? [
        { title: 'Claimed By', dataIndex: 'claimed_by', width: 150 },
        {
          title: 'Status', dataIndex: 'status',
          render: (_, r) => (
            <Tag
              color={
                r.status === 'open'
                  ? 'blue'
                  : r.status === 'in-progress'
                    ? 'orange'
                    : r.status === 'complete'
                      ? 'green'
                      : r.status === 'force-close'
                        ? 'red'
                        : 'default'
              }
              style={{ textTransform: 'capitalize' }}
            >
              {r?.status === 'force-close' ? 'Close' : r?.status?.replace(/-/g, ' ')}
            </Tag>
          )
        },
      ]
      : []),
  ];

  const dnColumns: ProColumns<DNList>[] = [...staticColumns];

  function extractSortableColumns(columns: ProColumns<DNList>[]) {
    const result: { title: string; dataIndex: string }[] = [];

    const walk = (cols: ProColumns<DNList>[]) => {
      cols.forEach(col => {
        // Skip columns without dataIndex (group headers, render-only cols)
        if (col.dataIndex && typeof col.title === "string") {
          result.push({
            title: col.title,
            dataIndex: col.dataIndex as string
          });
        }

        // Handle nested children
        if (col.children) walk(col.children as ProColumns<DNList>[]);
      });
    };

    walk(columns);
    return result;
  }

  const allowedSortFields = [
    "sap_delivery_date",
    "shippingAddress",
    "district",
    "commune",
    "channel",
    // "truck_capacity"
  ];
  const sortableColumns = extractSortableColumns(dnColumns).filter(c =>
    allowedSortFields.includes(c.dataIndex)
  );

  const mtColumns: ProColumns<any>[] = [
    {
      render: (_, record) => {
        return (
          <Card style={{
            marginBottom: 16,
          }}>
            <Descriptions column={5}>
              <Descriptions.Item label="Pick Number" style={{ fontWeight: 'bolder' }}>
                <a>
                  <Typography.Link strong copyable >{record.claimed_line || '-'}</Typography.Link>
                </a>
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            {record?.data?.map((item: any, index: number) => (
              <>
                <Collapse
                  ghost
                  defaultActiveKey={['collapMT']}
                  key={'collapMT'}
                  items={[
                    {
                      key: 'collapMT',
                      label: (
                        <Descriptions column={5}>
                          <Descriptions.Item label="DO Date" style={{ fontWeight: 'bolder' }}>
                            {dayjs(item.deliveryDate).isValid()
                              ? dayjs(item.deliveryDate).format('DD-MMM-YYYY hh:mm')
                              : '-'}
                          </Descriptions.Item>
                          <Descriptions.Item label="DO No" style={{ fontWeight: 'bolder' }}>
                            <a>
                              <Typography.Link strong copyable >{item.id || '-'}</Typography.Link>
                            </a>
                          </Descriptions.Item>
                          <Descriptions.Item label="Shipping Address" span={1}
                          >
                            <a onClick={() => {
                              if (item.latitude && item.longitude) {
                                const url = `https://www.google.com/maps?q=${item.latitude},${item.longitude}`;
                                window.open(url, '_blank'); // open in new tab
                              } else {
                                message.info(`No location found for: ${item.shippingAddress}`);
                              }
                            }}>{item.shippingAddress ? item.shippingAddress : '-'}</a>
                          </Descriptions.Item>
                          <Descriptions.Item span={5}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', alignItems: 'center' }}>
                              {item.status ? (
                                <Tag
                                  color={
                                    item.status === 'open'
                                      ? 'blue'
                                      : item.status === 'in-progress'
                                        ? 'orange'
                                        : item.status === 'complete'
                                          ? 'green'
                                          : item.status === 'force-close'
                                            ? 'red'
                                            : 'default'
                                  }
                                  style={{ textTransform: 'capitalize' }}
                                >
                                  {item.status === 'force-close' ? 'Close' : item.status.replace(/-/g, ' ')}
                                </Tag>
                              ) : (
                                '-'
                              )}
                              {item.claimed_by ? (
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                  <span>
                                    Claimed:{' '}
                                    <strong>
                                      {item.claimed_by},
                                    </strong>
                                    <span style={{ fontSize: 12 }}> {dayjs.utc(item.claimed_date).tz('Asia/Phnom_Penh').format('DD-MMM-YYYY hh:mm a')}</span>

                                  </span>
                                  {item.status != 'complete' && (access.currentUser?.login == item.claimed_by && access.canAccesAllocateAdmin) ?
                                    <Button type="default" danger
                                      onClick={() => (handleUnClaim([Number(item.id)], item))}
                                    >
                                      Unpick
                                    </Button>
                                    : <></>}

                                </div>
                              ) : access.canAccesAddRemarkAllocate ? (
                                <Button type="primary"
                                  onClick={() => handleClaim(item.id)}
                                >
                                  Pick
                                </Button>
                              ) : <></>}

                              <Dropdown overlayStyle={{ width: 400 }} menu={activityMenu} trigger={['click']} >
                                <Button onClick={() => getActivities(item.id)} style={{ marginLeft: 10 }}><HistoryOutlined /></Button>
                              </Dropdown>
                              {/* {
                                item.status != 'force-close' && item.status != 'complete' && access.canAccesAddRemarkAllocate ?
                                  <Tooltip title="Force Close" >
                                    <Button onClick={() =>
                                      setForceCloseOpen({
                                        visible: true,
                                        id: item?.id,
                                      })
                                    }
                                      style={{ marginLeft: 10 }}><CloseCircleOutlined /></Button>
                                  </Tooltip>
                                  : <></>
                              } */}
                              {item.status != 'force-close' && item.status != 'complete' && access.canAccesAddRemarkAllocate &&
                                <Space style={{ marginLeft: 10 }} size={'large'}>
                                  <Dropdown
                                    menu={{
                                      items: getMenuItems(item),
                                      style: { width: 200 },
                                    }}
                                  >
                                    <a onClick={(e) => e.preventDefault()}>
                                      <MoreOutlined />
                                    </a>
                                  </Dropdown>
                                </Space>
                              }
                            </div>
                          </Descriptions.Item>
                          <Descriptions.Item label="SO Num" style={{ fontWeight: 'bolder' }}>
                            {item.so_no || '-'}
                          </Descriptions.Item>
                          <Descriptions.Item label="A/R Reserve Invoice" style={{ fontWeight: 'bolder' }}>
                            {item.reserve_num || '-'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Customer Code" style={{ fontWeight: 'bolder' }}>
                            <a>
                              <Typography.Link strong copyable >{item.customer_code || '-'}</Typography.Link>
                            </a>
                          </Descriptions.Item>
                          <Descriptions.Item label="Customer Name" style={{ fontWeight: 'bolder' }}>
                            {item.customer_name || '-'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Phone" style={{}}>
                            {item.phone || '-'}
                          </Descriptions.Item>

                        </Descriptions>

                      ),
                      children: (
                        <ProTable
                          size="small"
                          search={false}
                          rowKey="id"
                          dataSource={item.mergedItems}
                          expandable={{
                            expandedRowRender: (item) => {
                              const dnList = (item.dn || [item]).filter(d =>
                                d && (d.dn_num || d.dn_qty || d.dn_date)
                              );

                              const plannedQty = Number(item.qty) || 0;
                              const sortedDnList = dnList.filter(d => d.dn_num).sort((a, b) => Number(a.dn_num) - Number(b.dn_num));
                              const firstDn = sortedDnList[0];
                              return (
                                <Table
                                  size="small"
                                  rowKey={(r, index) => r?.id ?? index}
                                  columns={[
                                    {
                                      title: 'DN No',
                                      dataIndex: 'dn_num',
                                      key: 'dn_num',
                                    },
                                    {
                                      title: 'Delivered Qty',
                                      dataIndex: 'dn_qty',
                                      key: 'dn_qty',
                                      render: (_, dnRecord) => {
                                        const qty = parseFloat(dnRecord.dn_qty) || 0;
                                        const isMismatch = qty !== plannedQty;
                                        return (
                                          <span>
                                            {qty.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                          </span>
                                        );
                                      },
                                    },
                                    {
                                      title: 'DN Date',
                                      dataIndex: 'dn_date',
                                      key: 'dn_date',
                                      render: (_, item) => {
                                        const rawDnDate = item.dn_date;
                                        const dnDate = rawDnDate
                                          ? dayjs.utc(rawDnDate).tz('Asia/Phnom_Penh').startOf('day')
                                          : null;

                                        // Safely get the list of DNs for this item
                                        const dnList = item.dn || [];

                                        // Only consider DNs with a dn_num for sorting
                                        const sortedDnList = dnList
                                          .filter(d => d?.dn_num)
                                          .sort((a, b) => Number(a.dn_num) - Number(b.dn_num));

                                        const firstDn = sortedDnList[0];
                                        const isFirstDN = item.dn_num === firstDn?.dn_num;

                                        return (
                                          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                            {dnDate?.isValid() ? dnDate.format('DD-MMM-YYYY') : '-'}
                                            {!isFirstDN && <Tag color="orange" style={{ marginLeft: 8 }}>Unplanned</Tag>}
                                          </span>
                                        );
                                      },
                                    }



                                  ]}
                                  dataSource={dnList}
                                  pagination={false}
                                />
                              );
                            },
                            rowExpandable: (item) => {
                              // expanded if dn exists or record itself has dn_num
                              return (Array.isArray(item.dn) && item.dn.length > 0) || item.dn_num;
                            },
                          }}
                          options={false}
                          pagination={false}
                          columns={[
                            {
                              title: 'Item Code',
                              dataIndex: 'itemCode',
                              width: 150,
                              render: (_, r) => {
                                return r.itemCode || r.item_code || '-'
                              }
                            },
                            {
                              title: 'Item Name',
                              dataIndex: 'itemName',
                              width: 250,
                              render: (_, record) => {
                                return record.itemName && record.itemName.trim() !== ''
                                  ? record.itemName
                                  : record.item_name || '-';
                              },
                            },
                            {
                              title: 'Plan',
                              dataIndex: 'qty',
                              width: 70,
                              render: (_, r) => {
                                return r.qty || '0'
                              }
                            },
                            {
                              title: 'SAP Qty',
                              dataIndex: 'sap_qty',
                              width: 70,
                              render: (v) => {
                                if (v === null || v === undefined) return '0'
                                return Number(v).toString()
                              }
                            },
                            {
                              title: 'Delivered',
                              width: 90,
                              render: (_, r) => {
                                const deliveryDate = dayjs.utc(item.deliveryDate).tz('Asia/Phnom_Penh').startOf('day');
                                const dnList = Array.isArray(r.dn) ? r.dn : [r];

                                const allDNs = item.deliveryItems.flatMap(r => r.dn || []);
                                const sortedDnList = allDNs
                                  .filter(d => d.dn_num)
                                  .sort((a, b) => Number(a.dn_num) - Number(b.dn_num));
                                const firstDnNum = sortedDnList[0]?.dn_num;

                                const plannedQty = Number(r.qty) || 0;
                                const totalDelivered = dnList.reduce((sum, dn) => sum + (parseFloat(dn.dn_qty) || 0), 0);

                                let color = 'black'; // default

                                if (dnList.length === 1) {
                                  const dn = dnList[0];
                                  const dnDate = dayjs.utc(dn.dn_date).tz('Asia/Phnom_Penh').startOf('day');
                                  const isFirstDn = dn.dn_num === firstDnNum;
                                  const isSameDate = dnDate.isSame(deliveryDate);

                                  if (isFirstDn && isSameDate && totalDelivered >= plannedQty) {
                                    color = 'green';
                                  } else if (totalDelivered == 0) {
                                    color = 'black';
                                  } else {
                                    color = 'orange';
                                  }
                                } else if (totalDelivered == 0) {
                                  color = 'black';
                                } else if (
                                  dnList.length > 1 ||
                                  dnList.some(dn => {
                                    const dnDate = dayjs.utc(dn.dn_date).tz('Asia/Phnom_Penh').startOf('day');
                                    return !dnDate.isSame(deliveryDate);
                                  }) ||
                                  totalDelivered < plannedQty
                                ) {
                                  color = 'orange';
                                }

                                return (
                                  <div style={{ color }}>
                                    {totalDelivered.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                  </div>
                                );
                              },
                            },
                            {
                              title: 'Type',
                              dataIndex: 'saleType',
                              width: 70,
                              render: (_, r) => {
                                return (r.saleType ? r.saleType : r.type ? r.type : 'STD')
                              }
                            },
                            {
                              title: 'Remark',
                              dataIndex: 'dn',
                              width: 250,
                              render: (_dom, entity) => {
                                const remark = entity.dn?.[0]?.remark ?? '';
                                return (
                                  <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                    {remark ? remark : '-'}
                                  </div>
                                );
                              },
                            },
                            {
                              title: 'Attachment',
                              dataIndex: 'attachment',
                              width: 200,
                              render: (_, record) => {
                                const attachments = record.dn?.[0]?.attachment || [];

                                return (
                                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {attachments.map((att, index) => {
                                      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(att);
                                      const decodedURL = decodeURIComponent(att)
                                      const fileNameMatch = decodedURL.match(/\/([^\/?]+)\?alt=media/)
                                      let fileName = fileNameMatch ? fileNameMatch[1] : `File ${index + 1}`;
                                      const dashIndex = fileName.indexOf('-');
                                      if (dashIndex !== -1) {
                                        fileName = fileName.substring(dashIndex + 1);
                                      }
                                      return isImage ? (
                                        <Image
                                          key={index}
                                          width={50}
                                          height={50}
                                          src={att}
                                          alt={`attachment-${index}`}
                                          style={{ objectFit: 'cover', borderRadius: 4 }}
                                          preview={{ mask: <div>Click to preview</div> }}
                                        />
                                      ) : (
                                        <a
                                          key={index}
                                          href={att.attachment}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{
                                            display: 'inline-block',
                                            padding: '4px 8px',
                                            border: '1px solid #ccc',
                                            borderRadius: 4,
                                            backgroundColor: '#f5f5f5',
                                            marginRight: 8,
                                          }}
                                        >
                                          {fileName}
                                        </a>
                                      );
                                    })}
                                  </div>
                                );
                              },
                            },
                            {
                              width: 100,
                              align: 'center',
                              render: (_, r) => {
                                if (status == 'Pending' || status == 'Failed') return null;
                                if (r.isUnplanned) return <Tag key="unplanned" color="orange" style={{ marginLeft: 8 }}>Unplanned</Tag>
                                if (!access.canAccesAddRemarkAllocate) return null
                                return (
                                  <a
                                    onClick={() => {
                                      const dnItem = r.dn?.[0];
                                      setModalOpen({
                                        visible: true,
                                        id: dnItem?.id,
                                        remark: dnItem?.remark,
                                        attachment: dnItem?.attachment,
                                        sales_planid: r.deliveryId
                                      });
                                    }}
                                  >
                                    <FaRegPenToSquare />
                                  </a>
                                );
                              },
                            },
                          ]}
                        />
                      ),
                    },
                  ]}
                />
                <Divider />
              </>
            ))}
          </Card>)
      },
    },
  ]

  const qvColums: ProColumns<DnQuickView>[] = [
    {
      // title: 'SO Number',
      // dataIndex: 'soNo',
      render: (_, record) => {
        return (
          // <Card style={{
          //   marginBottom: 16,
          // }}>
          //   hi
          // </Card>
          <Row justify="center" gutter={4}>
            <Col span={6}>
              <Card
                style={{ color: '#555555', backgroundColor: 'rgba(200, 200, 200, 0.15)', textAlign: 'center', fontSize: 16 }}
                bodyStyle={{ paddingTop: 30, paddingBottom: 30, paddingLeft: 0, paddingRight: 0, }}
              >
                Total Delivery Note
                <br />
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {record.total_count}
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card
                style={{ color: 'rgba(36, 134, 200, 1)', backgroundColor: 'rgba(36, 134, 200, 0.1)', textAlign: 'center', fontSize: 16 }}
                bodyStyle={{ paddingTop: 30, paddingBottom: 30, paddingLeft: 0, paddingRight: 0, }}
              >
                Open Delivery Note
                <br />
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {record.open_count}
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card
                style={{ color: 'rgba(244, 157, 12, 1)', backgroundColor: 'rgba(244, 157, 12, 0.1)', textAlign: 'center', fontSize: 16 }}
                bodyStyle={{ paddingTop: 30, paddingBottom: 30, paddingLeft: 0, paddingRight: 0, }}
              >
                In Progress Delivery Note
                <br />
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {record.in_progress_count}
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card
                style={{ color: 'rgba(39, 173, 96, 1)', backgroundColor: 'rgba(39, 173, 96, 0.1)', textAlign: 'center', fontSize: 16 }}
                bodyStyle={{ paddingTop: 30, paddingBottom: 30, paddingLeft: 0, paddingRight: 0, }}
              >
                Completed Delivery Note
                <br />
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {record.complete_count}
                </div>
              </Card>
            </Col>

          </Row>
        );
      },
    },
  ];


  return (
    <>
      <Spin spinning={requestActions.request?.loading || loading}>
        {advanceSearchParams.filter == 'MT' ?
          <TableView<DNList, { searchValue?: string }>
            displayOnly
            tableProps={{
              actionRef: actionRef,
              options: {
                reload: false,
                setting: false,
                density: false,
                fullScreen: false,
              },
              toolbar: {
                actions: [
                  <ProForm submitter={false} layout="inline">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>

                      <ProFormSelect
                        width={150}
                        name="status"
                        allowClear
                        showSearch
                        initialValue="pending"
                        onChange={(val: string) => {
                          setMTSearch((v) => ({ ...v, status: val }))
                          actionRef.current?.reloadAndRest?.();
                        }}
                        options={[
                          { value: 'ALL', label: 'ALL' },
                          { value: 'pending', label: 'Pending' },
                          { value: 'open', label: 'Open' },
                          { value: 'in-progress', label: 'In Progress' },
                          { value: 'complete', label: 'Completed' },
                          { value: 'force-close', label: 'Close' },
                        ]}
                      />
                      <ProFormDateRangePicker
                        style={{ width: 165 }}
                        name="ordered_date"
                        placeholder={['From Date', 'To Date']}
                        fieldProps={{
                          onChange: (values) => {
                            const [start, end] = values || [];
                            setMTSearch((v) => ({
                              ...v,
                              startDate: start ? start.format("YYYY-MM-DD") : undefined,
                              endDate: end ? end.format("YYYY-MM-DD") : undefined,
                            }));
                            actionRef.current?.reloadAndRest?.();
                          },
                        }}
                      />
                      <Button type="text" size='large' onClick={() => onSync()}>
                        <SyncOutlined />
                      </Button>
                      <Button
                        type="text"
                        onClick={() => actionRef.current?.reloadAndRest?.()}
                        size='large'
                      >
                        <ReloadOutlined />
                      </Button>

                    </div>
                  </ProForm>

                ],
              },
            }}
            extraFilter={
              <Space size="large" style={{ flexDirection: 'row' }}>
                {/* <Button onClick={() => setSearchModalOpen({ visible: true })}><FileSearchOutlined /></Button> */}
                <>
                  <Radio.Group
                    value={advanceSearchParams.filter}
                    onChange={(e) => {
                      setAdvanceSearchParams((v) => ({
                        ...v,
                        filter: e.target.value,
                      }));
                      actionRef.current?.reloadAndRest?.();
                    }}
                  >
                    {/* <Radio.Button value="OV">Over View</Radio.Button>
                    <Radio.Button value="SO">Sales Order</Radio.Button> */}
                    <Radio.Button value="DN">Delivery Plan</Radio.Button>
                    <Radio.Button value="HIS">History</Radio.Button>
                    <Radio.Button value="MT">My Task</Radio.Button>
                    {/* <Radio.Button value="FG">FG</Radio.Button> */}
                  </Radio.Group>
                </>
              </Space>
            }
            columns={mtColumns}
            actionHandlers={{
              onRequest: (criteria, pagination, sort) =>
                onRequestDNHandler({
                  criteria: {
                    ...criteria,
                    advanceSearch: MTSearch,
                    sort,
                  },
                  pagination: {
                    pageSize: 20
                  },
                })
            }}

          />

          : advanceSearchParams.filter == 'DN' ?
            <TableView<DNList, { searchValue?: string }>
              displayOnly
              tableProps={{
                actionRef: actionRef,
                options: {
                  reload: false,
                  setting: false,
                  density: false,
                  fullScreen: false,
                },
                toolbar: {
                  actions: [
                    <>
                      <ProForm submitter={false} layout="inline" form={form} style={{
                        justifyContent: 'flex-end',
                        width: '100%',
                      }}>
                        <ProFormSelect
                          name="sap_delivery_date"
                          initialValue="unplan"
                          onChange={(val: string) => {
                            setDnSearch((v) => ({ ...v, sap_delivery_date: val }))
                            actionRef.current?.reloadAndRest?.();
                          }}
                          options={[
                            { value: 'all', label: 'ALL' },
                            { value: 'as_of_now', label: 'As Date' },
                            { value: 'today', label: 'Today' },
                            { value: 'unplan', label: 'DOP Pending' },
                            { value: 'TBA', label: 'TBA' },
                          ]}
                          width={150}
                          showSearch
                        />
                        <ProFormSelect
                          placeholder="Route"
                          name="route"
                          mode="multiple"
                          options={routeOptions}
                          width={200}
                          allowClear
                          showSearch
                          onChange={async (vals: string[] = []) => {
                            const districtIds = vals
                              .flatMap(v => v.split(','))
                              .map(Number)
                              .filter(Number.isFinite);
                            const selectedDistricts = vals
                              .flatMap(v => v.split(','))
                              .map(v => v.trim())
                              .filter(Boolean);

                            const routeIds = routeOptions
                              .filter(opt => vals.includes(opt.value))
                              .map(opt => opt.id);

                            setRouteId(routeIds);

                            setDnSearch(v => ({ ...v, district_id: districtIds }));
                            actionRef.current?.reloadAndRest?.();
                          }}
                        />

                        <ProFormSelect
                          placeholder="Zone"
                          // name="zone"
                          value={zoneId}
                          onChange={(val: string) => {
                            const communeIds = val
                              .flatMap(v => v.split(','))
                              .map(Number)
                              .filter(Number.isFinite);
                            //  const zoneIds = zoneOptions
                            //   .filter(opt => val.includes(opt.value))
                            //   .map(opt => opt.id);
                            setDnSearch((v) => ({ ...v, commune_id: communeIds }))
                            // // setZoneId(zoneIds)
                            // console.log(val)
                            // setOfficerArea(val)
                            console.log('zoneIds', zoneOptions)
                            actionRef.current?.reloadAndRest?.();
                          }}
                          options={zoneOptions}
                          width={200}
                          allowClear
                          showSearch
                          mode="multiple"
                        />
                        {/* <OfficerZoneFilter
                          form={form}
                          name="zone"
                          options={zoneOptions}
                          requestActions={requestActions}
                          isSelectAll={isSelectAll}
                          onInit={(values, options) => {
                            setOfficerArea(options);
                            setDnSearch(v => ({ ...v, zone: values }));
                          }}
                          onChange={(values, options) => {
                            setOfficerArea(options);
                            setDnSearch(v => ({ ...v, zone: values }));
                            actionRef.current?.reloadAndRest?.();
                          }}
                        /> */}

                        <ProFormDateRangePicker
                          name="sap_delivery_range_dn"
                          placeholder={['From Date', 'To Date']}
                          disabled={!asDate}
                          width={250}
                          fieldProps={{
                            onChange(val) {
                              const fromDate = val?.[0] ? val[0].format('YYYY-MM-DD') : undefined;
                              const toDate = val?.[1] ? val[1].format('YYYY-MM-DD') : undefined;

                              setDnSearch((v) => ({
                                ...v,
                                sap_from_date: fromDate,
                                sap_to_date: toDate,
                              }));

                              actionRef.current?.reloadAndRest?.();
                            }
                          }}
                        />
                        <ProFormSelect
                          placeholder="Province"
                          name="province_id_dn"
                          onChange={(val: string) => {
                            setProvinceId(val)
                            setDnSearch((v) => ({ ...v, province_id: val }))
                            actionRef.current?.reloadAndRest?.();
                          }}
                          options={provinceOptions}
                          width={200}
                          allowClear
                          showSearch
                          mode="multiple"
                        />

                        <ProFormSelect
                          placeholder="District"
                          name="district_id_dn"
                          value={districtId}
                          onChange={(val: string) => {
                            setDistrictId(val)
                            setDnSearch((v) => ({ ...v, district_id: val }))
                            actionRef.current?.reloadAndRest?.();
                          }}
                          options={districtOptions}
                          width={200}
                          allowClear
                          showSearch
                          mode="multiple"
                        />

                        <ProFormSelect
                          placeholder="Commune"
                          name="commune_id_dn"
                          options={communeOptions}
                          onChange={(val: string) => {
                            setDnSearch((v) => ({ ...v, commune_id: val }))
                            actionRef.current?.reloadAndRest?.();
                          }}
                          width={200}
                          allowClear
                          showSearch
                          mode="multiple"
                        />
                        <ProFormSelect
                          placeholder="Customer"
                          name="customer_dn"
                          showSearch
                          debounceTime={200}
                          mode="multiple"
                          allowClear
                          width={250}
                          request={async ({ keyWords }) => {
                            const res = await services.pageCustomer({
                              criteria: {
                                searchValue: keyWords,
                              },
                              pagination: {
                                current: 1,
                                pageSize: 20,
                              },
                            })

                            return res.items.map((c: any) => ({
                              value: c.code,
                              label: `${c.code} - ${c.name}`,
                            }));
                          }}
                          onChange={(val: string[]) => {
                            setDnSearch(v => ({ ...v, customer: val }));
                            actionRef.current?.reloadAndRest?.();
                          }}
                        />

                        {access.canAccesAddRemarkAllocate && (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Button
                              type="primary"
                              disabled={selectedRowKeys.length === 0}
                              onClick={() => (handleClaim(selectedRowKeys.map(k => Number(k))), console.log(selectedListDn))}
                            >
                              Pick
                            </Button>
                          </div>
                        )}
                        <Tooltip title="Map"><Button type="text" size={'large'}
                          onClick={() => navigate("/delivery/location", { state: { list: dataListDn, selected: selectedListDn, selectedRows: selectedRows, areaList: selectedArea } })}
                          icon={<TbMap2 />}
                          style={{ fontSize: 22 }}
                        >
                        </Button></Tooltip>
                        <Tooltip title="Sort"><Button type="text" size='large' onClick={() => setSortModalOpen(true)} >
                          <ColumnHeightOutlined />
                        </Button></Tooltip>
                        <Tooltip title="Sync From SAP"><Button type="text" size='large' onClick={() => onSync()} >
                          <SyncOutlined />
                        </Button></Tooltip>
                        <Tooltip title="Dowload Excel File"><Button type="text" size='large' icon={<FileExcelOutlined />}
                          onClick={() => setExportModal({ visible: true })}
                        >
                        </Button>
                        </Tooltip>
                        <Tooltip title="Refresh">
                          <Button
                            type="text"
                            onClick={() => actionRef.current?.reloadAndRest?.()}
                            size='large'
                          >
                            <ReloadOutlined />
                          </Button></Tooltip>

                        <div style={{ width: '100%', alignItems: 'flex-start', }}>   {/* 🔑 FORCE NEW ROW */}
                          <Card
                            size="small"
                            style={{ border: 0, width: '100%', alignItems: 'flex-start', }}
                            styles={{ body: { padding: 4 } }}
                          >
                            <Flex gap={4} align="center" wrap>
                              <Badge
                                offset={[-10, 0]}
                                size="small"
                                count={Number(countList?.[0]?.unplan_count ?? 0)}
                                showZero
                              >
                                <Tag>DOP Pending</Tag>
                              </Badge>

                              <Badge
                                offset={[-10, 0]}
                                size="small"
                                count={Number(countList?.[0]?.tba_count ?? 0)}
                                showZero
                              >
                                <Tag>TBA</Tag>
                              </Badge>
                            </Flex>
                          </Card>
                        </div>
                        {officerArea?.length > 0 && (
                          <div style={{ width: '100%', alignItems: 'flex-start', }}>   {/* 🔑 FORCE NEW ROW */}
                            <Card
                              size="small"
                              style={{ border: 0, width: '100%', alignItems: 'flex-start', }}
                              styles={{ body: { padding: 4 } }}
                            >
                              <Flex gap={4} align="center" wrap>
                                {officerArea.map(p => (
                                  <Tag key={p.value}>{p.label}</Tag>
                                ))}
                              </Flex>
                            </Card>
                          </div>
                        )}
                      </ProForm>

                    </>

                  ],
                },
              }}
              extraFilter={
                <Space size="large" style={{ flexDirection: 'row' }}>
                  {/* <Button onClick={() => setSearchModalOpen({ visible: true })}>
                        <FileSearchOutlined />
                      </Button> */}
                  <Radio.Group
                    value={advanceSearchParams.filter}
                    onChange={(e) => {
                      setAdvanceSearchParams((v) => ({
                        ...v,
                        filter: e.target.value,
                      }));
                      actionRef.current?.reloadAndRest?.();
                    }}
                  >
                    {/* <Radio.Button value="OV">Over View</Radio.Button>
                        <Radio.Button value="SO">Sales Order</Radio.Button> */}
                    <Radio.Button value="DN">Delivery Plan</Radio.Button>
                    <Radio.Button value="HIS">History</Radio.Button>
                    <Radio.Button value="MT">My Task</Radio.Button>
                  </Radio.Group>
                </Space>
              }
              columns={dnColumns}
              actionHandlers={{
                onRequest: (criteria, pagination, sort) =>
                  onRequestDNDeatilHandler({
                    criteria: {
                      ...criteria,
                      ...dnSearch,
                      sort
                    },
                    pagination,    // ✅ PASS pagination
                  }),
              }}
            />
            : advanceSearchParams.filter == 'HIS' ?
              <TableView<DNList, { searchValue?: string }>
                displayOnly
                tableProps={{
                  actionRef: actionRef,
                  options: {
                    reload: false,
                    setting: false,
                    density: false,
                    fullScreen: false,
                  },
                  toolbar: {
                    actions: [
                      <ProForm submitter={false} layout="inline">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <ProFormSelect
                            name="sap_delivery_date"
                            initialValue="as_of_now"
                            onChange={(val: string) => {
                              setHisSearch((v) => ({ ...v, sap_delivery_date: val }))
                              actionRef.current?.reloadAndRest?.();
                            }}
                            options={[
                              { value: 'all', label: 'ALL' },
                              { value: 'as_of_now', label: 'As Date' },
                              { value: 'today', label: 'Today' },
                              { value: 'unplan', label: 'DOP Pending' },
                              { value: 'TBA', label: 'TBA' },
                            ]}
                            width={150}
                            showSearch
                          />
                          <ProFormDateRangePicker
                            name="sap_delivery_range_his"
                            placeholder={['From Date', 'To Date']}
                            disabled={!asDate}
                            width={300}
                            fieldProps={{
                              onChange(val) {
                                const fromDate = val?.[0] ? val[0].format('YYYY-MM-DD') : undefined;
                                const toDate = val?.[1] ? val[1].format('YYYY-MM-DD') : undefined;

                                setHisSearch((v) => ({
                                  ...v,
                                  sap_from_date: fromDate,
                                  sap_to_date: toDate,
                                }));

                                actionRef.current?.reloadAndRest?.();
                              }
                            }}
                          />
                          <ProFormSelect
                            placeholder="Province"
                            name="province_id_his"
                            value={provinceId}
                            onChange={(val: string) => {
                              setProvinceId(val)
                              setHisSearch((v) => ({ ...v, province_id: val }))
                              actionRef.current?.reloadAndRest?.();
                            }}
                            options={provinceOptions}
                            width={200}
                            allowClear
                            showSearch
                            mode="multiple"
                          />

                          <ProFormSelect
                            placeholder="District"
                            name="district_id_his"
                            value={districtId}
                            onChange={(val: string) => {
                              setDistrictId(val)
                              setHisSearch((v) => ({ ...v, district_id: val }))
                              actionRef.current?.reloadAndRest?.();
                            }}
                            options={districtOptions}
                            width={200}
                            allowClear
                            showSearch
                            mode="multiple"
                          />

                          <ProFormSelect
                            placeholder="Commune"
                            name="commune_id_his"
                            options={communeOptions}
                            onChange={(val: string) => {
                              setHisSearch((v) => ({ ...v, commune_id: val }))
                              actionRef.current?.reloadAndRest?.();
                            }}
                            width={200}
                            allowClear
                            showSearch
                            mode="multiple"
                          />
                          <ProFormSelect
                            placeholder="Customer"
                            name="customer_his"
                            showSearch
                            debounceTime={200}
                            mode="multiple"
                            allowClear
                            width={300}
                            request={async ({ keyWords }) => {
                              const res = await services.pageCustomer({
                                criteria: {
                                  searchValue: keyWords,
                                },
                                pagination: {
                                  current: 1,
                                  pageSize: 20,
                                },
                              })

                              return res.items.map((c: any) => ({
                                value: c.code,
                                label: `${c.code} - ${c.name}`,
                              }));
                            }}
                            onChange={(val: string) => {
                              setHisSearch(v => ({ ...v, customer: val }));
                              actionRef.current?.reloadAndRest?.();
                            }}
                          />
                        </div>
                        {/* Button */}
                        <ProFormSelect
                          width={150}
                          name="hisstatus"
                          allowClear
                          showSearch
                          initialValue="open"
                          onChange={(val: string) => {
                            setHisSearch((v) => ({ ...v, dnStatus: val }))
                            actionRef.current?.reloadAndRest?.();
                          }}
                          options={[
                            { value: '', label: 'ALL' },
                            { value: 'open', label: 'Open' },
                            { value: 'in-progress', label: 'In Progress' },
                            { value: 'complete', label: 'Completed' },
                            { value: 'force-close', label: 'Close' },
                          ]}
                        />
                        <Button type="text" size='large' onClick={() => onSync()}>
                          <SyncOutlined />
                        </Button>
                        <Button
                          type="text"
                          onClick={() => actionRef.current?.reloadAndRest?.()}
                          size='large'
                        >
                          <ReloadOutlined />
                        </Button>

                      </ProForm>

                    ],
                  },
                }}
                extraFilter={
                  <Space size="large" style={{ flexDirection: 'row' }}>
                    {/* <Button onClick={() => setSearchModalOpen({ visible: true })}>
                          <FileSearchOutlined />
                        </Button> */}
                    <Radio.Group
                      value={advanceSearchParams.filter}
                      onChange={(e) => {
                        setAdvanceSearchParams((v) => ({
                          ...v,
                          filter: e.target.value,
                        }));
                        actionRef.current?.reloadAndRest?.();
                      }}
                    >
                      {/* <Radio.Button value="OV">Over View</Radio.Button>
                          <Radio.Button value="SO">Sales Order</Radio.Button> */}
                      <Radio.Button value="DN">Delivery Plan</Radio.Button>
                      <Radio.Button value="HIS">History</Radio.Button>
                      <Radio.Button value="MT">My Task</Radio.Button>
                    </Radio.Group>
                  </Space>
                }
                columns={dnColumns}
                actionHandlers={{
                  onRequest: (criteria, pagination, sort) =>
                    onHistoryRequestDNDeatilHandler({
                      criteria: {
                        ...criteria,
                        ...hisSearch,
                        sort
                      },
                      pagination,
                    }),
                }}
              />
              : []}



      </Spin>
      <DrawerForm
        open={drawerOpen.visible}
        id={drawerOpen.id}
        status={drawerOpen.status}
        so={drawerOpen.so}
        po={drawerOpen.po}
        deliveres={drawerOpen.deliveres}
        dn_qty={drawerOpen.dn_qty}
        order_qty={drawerOpen.order_qty}
        onVisibleChange={(v) => v === false && (setDrawerOpen({ visible: false, id: '', status: '', po: '', dn_qty: 0, order_qty: 0 }), actionRef.current?.reloadAndRest?.())}
      />
      <AddRemarkModal
        open={modalOpen.visible}
        onCancel={() => setModalOpen({ visible: false, id: 0, remark: '', attachment: [], sales_planid: '' })}
        id={modalOpen.id}
        onSave={(e) => { handleSaveRemark(e) }}
        remark={modalOpen.remark}
        attachment={modalOpen.attachment}
        sales_planid={modalOpen.sales_planid}
      />
      <ForceColseModal
        open={forceCloseOpen.visible}
        onCancel={() => setForceCloseOpen({ visible: false, id: 0 })}
        id={forceCloseOpen.id}
        onSave={(e) => { handleForceClose(e) }}
      />
      <AdvanceSearch
        type={advanceSearchParams.filter}
        open={searchModalOpen.visible}
        onSearch={(d) => {
          {
            advanceSearchParams.filter == 'SO' ?
              setAdvanceSearchParams((v) => ({ ...v, ...d }))
              : advanceSearchParams.filter == 'DN' ?
                (
                  setDnSearch((v) => ({ ...v, ...d }))
                )
                : advanceSearchParams.filter == 'OV' ?
                  (
                    setQuickViewSearch((v) => ({ ...v, ...d }))
                  )
                  : advanceSearchParams.filter == 'MT' ?
                    (
                      console.log('d', d),
                      setMTSearch((v) => ({ ...v, ...d }))
                    ) : {}
          }
          actionRef.current?.reloadAndRest?.();
        }}
        onVisibleChange={(v) => v === false && setSearchModalOpen({ visible: false })}
        onReset={() => {
          setAdvanceSearchParams({ status: 'posted', filter: 'SO', dnStatus: 'open' });
          actionRef.current?.reloadAndRest?.();
        }}
      />
      {advanceSearchParams.filter == 'DN' ?
        <FloatingCard
          selectedRows={selectedRows}
          cardOpen={cardOpen}
        />
        : <></>}
      <SaleTypeDrawer
        open={drawerTypeOpen.visible}
        dataList={drawerTypeOpen.data}
        onVisibleChange={(v) => v === false && (setDrawerTypeOpen({ visible: false, data: undefined }))}
      />
      <SortModal
        open={sortModalOpen}
        onClose={() => setSortModalOpen(false)}
        onApply={() => {
          actionRef.current?.reloadAndRest?.();
          setSortModalOpen(false);
        }}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        columns={sortableColumns}
      />
      <Modal
        open={claimOpen}
        title="Pick"
        confirmLoading={claimLoading}
        onCancel={() => {
          setClaimOpen(false);
          setClaimIds([])
          setClaimedLines([])
          setSelectedRowKeys([])
          setSelectedRows([])
          setSelectedListDn([])
        }}
        onOk={async () => {
          if (selectedListDn.length === 0) {
            message.warning('Please select at least one DN');
            return;
          }

          setClaimLoading(true);

          try {
            const rawLines = selectedListDn.flatMap(dn =>
              (dn.deliveryItems ?? []).map(it => ({
                soDocEntry: String(dn.so_doc_entry),
                lineNum: Number(it.sap_line_num),
                shipDate: dn.deliveryDate,
              }))
            );

            const uniqueMap = new Map<string, any>();
            rawLines.forEach(l => {
              const key = `${l.soDocEntry}_${l.lineNum}`;
              if (!uniqueMap.has(key)) uniqueMap.set(key, l);
            });

            const del_item = Array.from(uniqueMap.values()).sort((a, b) =>
              a.soDocEntry === b.soDocEntry
                ? a.lineNum - b.lineNum
                : a.soDocEntry.localeCompare(b.soDocEntry)
            );

            await services.ClaimDn(
              claimIds,
              access.currentUser?.login,
              'Pick',
              'Pick DN',
              useExisting ? selectedClaimedLine : null,
              del_item
            );

            message.success('Updated successfully');

            actionRef.current?.reloadAndRest?.();

            setClaimOpen(false);
            setClaimIds([]);
            setClaimedLines([]);
            setSelectedRowKeys([]);
            setSelectedRows([]);
            setSelectedListDn([]);

          } catch (err: any) {
            console.error(err);
            message.error(err?.message || 'Claim failed');
          } finally {
            setClaimLoading(false);
          }
        }}

      >
        <Checkbox
          checked={useExisting}
          onChange={e => setUseExisting(e.target.checked)}
        >
          Use existing pick
        </Checkbox>

        {useExisting && (
          <Select
            style={{ width: '100%', marginTop: 12 }}
            placeholder="Select pick"
            options={claimedLines.map(c => ({ label: c.claimed_line, value: c.claimed_line }))}
            value={selectedClaimedLine}
            onChange={setSelectedClaimedLine}
          />
        )}
      </Modal >
      <ExportExcel
        title="Export Excel"
        open={exportModel.visible}
        loading={excelLoading}
        onCancel={() => setExportModal({ visible: false })}
        onSave={async (customer, ordered_date, request_delivery_date) => {
          const result = [
            {
              key: 'customer',
              value: customer ?? null,
              type: 'string',
            },

            {
              key: 'request_delivery_startdate',
              value: request_delivery_date?.[0]
                ? (request_delivery_date[0])
                : null,
              type: 'dateTime',
            },
            {
              key: 'request_delivery_enddate',
              value: request_delivery_date?.[1]
                ? (request_delivery_date[1])
                : null,
              type: 'dateTime',
            },

            {
              key: 'ordered_startdate',
              value: ordered_date?.[0]
                ? (ordered_date[0])
                : null,
              type: 'dateTime',
            },
            {
              key: 'ordered_enddate',
              value: ordered_date?.[1]
                ? (ordered_date[1])
                : null,
              type: 'dateTime',
            },
          ]
          try {
            setExcelLoading(true)
            await downloadGenericReport(requestActions)({
              fileName: `dop-${moment().format()}.xls`,
              type: 'EXCEL',
              data: {
                reportName: 'DOPDetail',
                reportPath: '/Reports/Delivery',
                data: result,
              },
            }).then(() => { })
          } catch (error) {
            message.error('Failed to download.');
          } finally {
            setExcelLoading(false)
          }
          setExportModal({ visible: false });
        }}
      />
    </>
  );
};
