import TableView, { colLink, TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDateTime } from '@/pages/utils';
import { MultiRequest } from '@/services/apiGateway';
import { Company, Driver, DriverListItem, SaveDriver, Truck } from '@/services/delivery/data';
import { simpleRequestActions } from '@/services/model';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Card, Checkbox, DatePicker, message, Modal, Progress, Radio, Space, Spin, Tag, Image, UploadFile, Descriptions, Button, Table, Dropdown, Row, Col, Typography, Select, Form, Tooltip, Divider, Collapse } from 'antd';
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
import { CloseCircleOutlined, ColumnHeightOutlined, CopyOutlined, ExportOutlined, FileSearchOutlined, HistoryOutlined, PlayCircleOutlined, PlusCircleOutlined, ReloadOutlined, SyncOutlined } from '@ant-design/icons';
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
  const [sortConfig, setSortConfig] = useState<SortRule[]>([
    { field: undefined, order: undefined }
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
  const [dnSearch, setDnSearch] = useState<{ status: string; delivery_date?: string, province_id?: string, district_id?: any, commune_id?: string, dnStatus?: string, sap_delivery_date: string | null, sap_from_date?: string, sap_to_date?: string, customer?: string, area?: [] }>({
    status: 'posted',
    dnStatus: 'open',
    sap_delivery_date: 'as_of_now',
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
    sap_delivery_date: string | null; status: string; delivery_date?: string, province_id?: string, district_id?: any, commune_id?: string, dnStatus?: string, sap_from_date?: string, sap_to_date?: string, customer?: string, area?: string
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

      setDataListDn(prev => prev.filter(r => !state.selectedRows?.some(s => s.id === r.id)));
      if (state.selectedRows.length > 0) setCardOpen({ visible: true });
    }
  }, [state?.selectedRows]);

  useEffect(() => {
    if (state?.areaList) {
      setSelectedArea(state?.areaList)
    }
  }, [state?.areaList]);

  // Load provinces once
  useEffect(() => {
    onSync()
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


  const handleSaveRemark = async (data: UpdateRemarkParams & { file?: UploadFile[] }) => {
    Modal.confirm({
      title: 'Add Remark',
      content: 'Are you sure?',
      onOk: async () => {
        let fileUrls: string[] = [];

        if (data.file && data.file.length > 0) {
          try {
            // Separate existing files (already uploaded) and new files (to upload)
            const existingFiles = data.file.filter(f => !f.originFileObj);
            const existingUrls = existingFiles
              .map(f => f.url)
              .filter(Boolean) as string[];

            const newFiles = data.file.filter(f => !!f.originFileObj);

            // Upload only the new files to Firebase
            const newFileUrls = await Promise.all(
              newFiles.map(f => uploadFileToFirebase(f.originFileObj as File))
            );

            // Combine old URLs and newly uploaded URLs
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

  // const handleClaim = async (ids: number | number[]) => {
  //   // Normalize ids to an array
  //   const idArray = Array.isArray(ids) ? ids : [ids];
  //   const claimed_line = await services.list_claimed_line();
  //   console.log('claimed_line', claimed_line)
  //   Modal.confirm({
  //     title: 'Pick',
  //     content: 'Are you sure?',
  //     onOk: async () => {
  //       try {
  //         await services.ClaimDn(idArray, access.currentUser?.login, 'Pick', 'Pick DN') as {
  //           data: string;
  //           message: string;
  //         }

  //         // Reload table and show success message
  //         actionRef.current?.reloadAndRest?.();
  //         message.success('Updated successfully');
  //         setSelectedRowKeys([])
  //         setSelectedRows([])
  //       } catch (error) {
  //         message.error('Failed to update');
  //         console.error(error);
  //       }
  //     },
  //   });
  // };

  const handleClaim = async (ids: number | number[]) => {
    const claimed_line = await services.list_claimed_line()
    setClaimIds(Array.isArray(ids) ? ids : [ids]);
    setClaimedLines(claimed_line);
    setClaimOpen(true);
  };

  const handleUnClaim = async (ids: number[], data: any) => {
    Modal.confirm({
      title: 'Unpick',
      content: 'Are you sure?',
      onOk: async () => {

        // ✅ data is ONE DN object
        const sapLines = (data.deliveryItems ?? []).map((it: any) => ({
          lineNum: Number(it.sap_line_num),
          shipDate: data.deliveryDate,
        }));

        const soDocEntry = data.so_doc_entry ?? data.soId;

        await services.ClaimDn(
          ids,
          access.currentUser?.login ?? '',
          'Unpick',
          'Unpick DN',
          null,
          soDocEntry,
          sapLines
        );

        actionRef.current?.reloadAndRest?.();
        message.success('Updated successfully');
      },
    });
  };



  const getActivities = async (id: number) => {
    try {
      const da = await services.getActivities(id);

      // Deduplicate: keep only the first occurrence of each action + remark
      const uniqueActivities = da.filter((activity, index, self) =>
        index === self.findIndex(a => a.action === activity.action && a.remark === activity.remark)
      );

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


  const onRequestHandler = async (params: TableViewSearchParams<AllocateSOAdvanceParams>) => {
    try {
      return services.pageSO(params).then((it) => {
        const statusFilter = params.criteria?.advanceSearch?.dnStatus;

        let filteredItems = it.items ?? [];

        if (statusFilter === 'pending') {
          // Include both 'open' and 'in-progress', and sort 'in-progress' first
          filteredItems = filteredItems
            .filter((v) => v.dn_status === 'open' || v.dn_status === 'in-progress')
            .sort((a, b) => {
              if (a.dn_status === b.dn_status) return 0;
              return a.dn_status === 'in-progress' ? -1 : 1;
            });
        } else if (statusFilter) {
          // Filter by exact match if not 'pending'
          filteredItems = filteredItems.filter((v) => v.dn_status === statusFilter);
        }
        const pageSize = params?.pagination?.pageSize ?? 20;
        const current = params?.pagination?.current ?? 1;
        const pagedItems = filteredItems.slice((current - 1) * pageSize, current * pageSize);

        const filteredResult = {
          ...it,
          items: pagedItems,
          total: filteredItems.length,
        };

        setData(pagedItems);

        return cacheList.cacheDataList({
          type: 'alocate-list',
          criteria: params,
          data: filteredResult,
        });
      }) as Promise<Paging<SOList>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  // const onRequestDNHandler = async (
  //   params: TableViewSearchParams<AllocateSOAdvanceParams>
  // ): Promise<Paging<DNList>> => {
  //   try {
  //     const list = await services.list_dn_by_user(MTSearch.status, MTSearch.startDate, MTSearch.endDate);

  //     if (!Array.isArray(list)) {
  //       throw new Error('Unexpected response format');
  //     }

  //     const page = params.pagination?.current ?? 1;
  //     const pageSize = params.pagination?.pageSize ?? 20;
  //     const total = list.length;

  //     const pagedData = list.slice((page - 1) * pageSize, page * pageSize);

  //     return {
  //       items: pagedData,
  //       total,
  //       page,
  //       pageSize
  //     };


  //   } catch (error: any) {
  //     message.error(error.message);
  //     return Promise.reject(error);
  //   }
  // };

  // const onRequestDNHandler = async (
  //   params: TableViewSearchParams<AllocateSOAdvanceParams>
  // ): Promise<Paging<DNList>> => {
  //   try {
  //     const list = await services.list_dn_by_user(
  //       MTSearch.status,
  //       MTSearch.startDate,
  //       MTSearch.endDate
  //     );

  //     if (!Array.isArray(list)) {
  //       throw new Error('Unexpected response format');
  //     }
  //     console.log('list',list)
  //     // Merge deliveryItems and unplannedItems for each record
  //     const mergedList = list.map(delivery => {
  //       const deliveryItems = Array.isArray(delivery.deliveryItems) ? delivery.deliveryItems : [];
  //       const unplannedItems = Array.isArray(delivery.unplannedItems) ? delivery.unplannedItems : [];

  //       const mergedItems = [
  //         ...deliveryItems.map(item => ({ ...item, isUnplanned: false })),
  //         ...unplannedItems.map(item => ({ ...item, isUnplanned: true }))
  //       ];

  //       return {
  //         ...delivery,
  //         mergedItems
  //       };
  //     });

  //     // Pagination
  //     const page = params.pagination?.current ?? 1;
  //     const pageSize = params.pagination?.pageSize ?? 20;
  //     const total = mergedList.length;
  //     const pagedData = mergedList.slice((page - 1) * pageSize, page * pageSize);
  //     console.log('pagedDatapagedData', pagedData)
  //     return {
  //       items: pagedData,
  //       total,
  //       page,
  //       pageSize
  //     };

  //   } catch (error: any) {
  //     message.error(error.message);
  //     return Promise.reject(error);
  //   }
  // };

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

      console.log("list", list);

      // list format:
      // [
      //   { claimed_line, claimed_date, claim_status, data: [delivery1, delivery2...] }
      // ]

      // STEP 1 — merge items **inside each group**
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
      console.log('pagedGroups', pagedGroups)
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


  const onRequestQuickView = async (
    params: TableViewSearchParams<AllocateSOAdvanceParams>
  ): Promise<Paging<DnQuickView>> => {
    try {
      const data = await services.fetch_dn_quick_view(quickViewSearch.startDate, quickViewSearch.endDate);
      return {
        items: [data],
        total: 1,
        page: 1,
        pageSize: 10,
      };

    } catch (error: any) {
      message.error(error.message);
      return Promise.reject(error);
    }
  };

  // const onRequestDNDeatilHandler = async (
  //   params: TableViewSearchParams<AllocateSOAdvanceParams>
  // ): Promise<Paging<DNList>> => {
  //   try {
  //     const list = await services.list_dn_detail(dnSearch.status, dnSearch.delivery_date, dnSearch.region,);

  //     if (!Array.isArray(list)) {
  //       throw new Error('Unexpected response format');
  //     }

  //     const page = params.pagination?.current ?? 1;
  //     const pageSize = params.pagination?.pageSize ?? 20;
  //     const total = list.length;

  //     const pagedData = list.slice((page - 1) * pageSize, page * pageSize);
  //     const dataList = {
  //       items: pagedData,
  //       total,
  //       page,
  //       pageSize
  //     }
  //     setDataListDn(dataList)
  //     return dataList;

  //   } catch (error: any) {
  //     message.error(error.message);
  //     return Promise.reject(error);
  //   }
  // }

  const onSync = async () => {
    try {
      isLoading(true)
      // await services.syncAllocate();
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

  function applyMultiSort(data: any, config: any) {
    return [...data].sort((a, b) => {
      for (const rule of config) {
        if (!rule.field || !rule.order) continue;

        const field = rule.field;
        const asc = rule.order === "asc" ? 1 : -1;

        const aVal = a[field];
        const bVal = b[field];

        if (aVal < bVal) return -1 * asc;
        if (aVal > bVal) return 1 * asc;
      }
      return 0;
    });
  }

  // useEffect(() => {
  //   const loadDefaultAreas = async () => {
  //     const res = await services.list_area();
  //     if (!Array.isArray(res)) return;

  //     const options = res.map((a: any) => ({
  //       value: Number(a.division_id),
  //       label: a.division_name.replace(/^S&D\s*/i, '').trim(),
  //       isDefault: a.isdefault === '1' || a.is_default === '1',
  //     }));

  //     setAreaOptions(options);

  //     const defaultAreaIds = options
  //       .filter(o => o.isDefault)
  //       .map(o => o.value);

  //     if (defaultAreaIds.length > 0) {
  //       form.setFieldsValue({
  //         area_dn: defaultAreaIds,
  //         area_his: defaultAreaIds,
  //       });

  //       setDnSearch((v: any) => ({
  //         ...v,
  //         area: defaultAreaIds,
  //       }));
  //       setSelectedArea(defaultAreaIds)
  //     }

  //     setAreaReady(true);

  //     setTimeout(() => {
  //       actionRef.current?.reloadAndRest?.();
  //     }, 0);
  //   };

  //   loadDefaultAreas();
  // }, []);

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
        area: state.areaList,
      }));
    }
  }, [state?.areaList]);

  useEffect(() => {
    const loadDefaultAreas = async () => {
      const res = await services.list_area();
      if (!Array.isArray(res)) return;

      const options = res.map((a: any) => ({
        value: Number(a.division_id),
        label: a.division_name.replace(/^S&D\s*/i, '').trim(),
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
          area: defaultAreaIds,
        }));
      }

      setAreaReady(true);

      setTimeout(() => {
        actionRef.current?.reloadAndRest?.();
      }, 0);
    };

    loadDefaultAreas();
  }, []);




  const onRequestDNDeatilHandler = async (
    params: TableViewSearchParams<AllocateSOAdvanceParams>
  ): Promise<Paging<DNList>> => {
    try {

      // Map Ant Design sort info to backend format
      const sortBy: string[] = [];
      const sortOrders: string[] = [];
      if (params?.criteria?.sort) {
        Object.entries(params?.criteria?.sort).forEach(([key, value]) => {
          sortBy.push(key);
          sortOrders.push(value === 'ascend' ? 'asc' : 'desc');
        });
      }

      const list = await services.list_dn_detail({
        status: dnSearch.status,
        delivery_date: dnSearch.delivery_date,
        province_id: dnSearch.province_id,
        district_id: dnSearch.district_id,
        commune_id: dnSearch.commune_id,
        sap_delivery_date: (dnSearch.sap_from_date && dnSearch.sap_to_date) ? null : dnSearch.sap_delivery_date,
        sortBy,
        sortOrders,
        filterPass: "Unclaimed",
        sap_from_date: dnSearch.sap_from_date,
        sap_to_date: dnSearch.sap_to_date,
        customer: dnSearch.customer,
        area: dnSearch.area
      });

      if (!Array.isArray(list)) throw new Error('Unexpected response format');

      // Transform list with SKU quantities
      const transformedList = list.map((delivery) => {
        const skuValues: Record<string, number> = {};
        skuList.forEach((sku) => {
          if (sku.item_category === 2) {
            skuValues[`${sku.sku_code}_pack`] = 0;
            skuValues[`${sku.sku_code}_bowl`] = 0;
          } else {
            skuValues[sku.sku_code] = 0;
          }
        });

        const itemsToUse = delivery.mergeItems?.length ? delivery.mergeItems : delivery.deliveryItems;
        itemsToUse.forEach((item) => {
          const sku = skuList.find((s) => s.id.toString() === item.sku_id);
          if (!sku) return;
          const key = sku.item_category === 2 ? `${sku.sku_code}_${normalizeUOM(item.sku_uom)}` : sku.sku_code;
          skuValues[key] += item.qty;
        });

        return { ...delivery, key: delivery.id, ...skuValues };
      });
      const sortedList = applyMultiSort(transformedList, sortConfig);
      const page = params.pagination?.current ?? 1;
      const pageSize = params.pagination?.pageSize ?? 10;
      const total = sortedList.length;
      const pagedData = sortedList.slice((page - 1) * pageSize, page * pageSize);

      const dataList = { items: pagedData, total, page, pageSize };
      setDataListDn(list);
      return dataList;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject(error);
    }
  };

  const onHistoryRequestDNDeatilHandler = async (
    params: TableViewSearchParams<AllocateSOAdvanceParams>
  ): Promise<Paging<DNList>> => {
    try {
      const today = moment().format('YYYY-MM-DD');
      const sapdeliveryDate = asDate
        ? (dnSearch.sap_delivery_date ? dnSearch.sap_delivery_date : today) // ✅ use filter or ALL
        : today;
      // Map Ant Design sort info to backend format
      const sortBy: string[] = [];
      const sortOrders: string[] = [];
      if (params?.criteria?.sort) {
        Object.entries(params?.criteria?.sort).forEach(([key, value]) => {
          sortBy.push(key);
          sortOrders.push(value === 'ascend' ? 'asc' : 'desc');
        });
      }

      const list = await services.list_dn_detail({
        status: hisSearch.status,
        delivery_date: hisSearch.delivery_date,
        province_id: hisSearch.province_id,
        district_id: hisSearch.district_id,
        commune_id: hisSearch.commune_id,
        sap_delivery_date: (hisSearch.sap_from_date && hisSearch.sap_to_date) ? null : hisSearch.sap_delivery_date,
        sortBy,
        sortOrders,
        filterPass: "Claimed",
        dnStatus: hisSearch.dnStatus,
        sap_from_date: hisSearch.sap_from_date,
        sap_to_date: hisSearch.sap_to_date,
        customer: hisSearch.customer,
        area: hisSearch.area
      });

      if (!Array.isArray(list)) throw new Error('Unexpected response format');

      // Transform list with SKU quantities
      const transformedList = list.map((delivery) => {
        const skuValues: Record<string, number> = {};
        skuList.forEach((sku) => {
          if (sku.item_category === 2) {
            skuValues[`${sku.sku_code}_pack`] = 0;
            skuValues[`${sku.sku_code}_bowl`] = 0;
          } else {
            skuValues[sku.sku_code] = 0;
          }
        });

        const itemsToUse = delivery.mergeItems?.length ? delivery.mergeItems : delivery.deliveryItems;
        itemsToUse.forEach((item) => {
          const sku = skuList.find((s) => s.id.toString() === item.sku_id);
          if (!sku) return;
          const key = sku.item_category === 2 ? `${sku.sku_code}_${normalizeUOM(item.sku_uom)}` : sku.sku_code;
          skuValues[key] += item.qty;
        });

        return { ...delivery, key: delivery.id, ...skuValues };
      });

      const page = params.pagination?.current ?? 1;
      const pageSize = params.pagination?.pageSize ?? 10;
      const total = transformedList.length;
      const pagedData = transformedList.slice((page - 1) * pageSize, page * pageSize);

      const dataList = { items: pagedData, total, page, pageSize };
      setDataListDn(list);
      return dataList;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject(error);
    }
  };


  const soColums: ProColumns<SOList>[] = [
    { title: 'PO No', dataIndex: 'poNo' },
    { title: 'SO No', dataIndex: 'soNo' },
    { title: 'A/R Reserve Invoice', dataIndex: 'reserve_num' },
    { title: 'Customer', dataIndex: 'customerName' },
    {
      title: 'Ordered Date',
      dataIndex: 'orderedDate',
      renderText: (value: string) => {
        const date = dayjs(value)
        return date.isValid() ? date.format('DD-MMM-YYYY') : '-'
      }
    },
    {
      title: 'Order Qty',
      dataIndex: 'totalItemQty',
    },
    {
      title: 'Delivered Qty',
      dataIndex: 'totalDnQty',
    },
    {
      title: 'DN Total',
      dataIndex: 'dnCount',
    },
    {
      title: 'Status',
      width: 250,
      dataIndex: 'dn_status',
      render: (_, entity) => {

        const percentage =
          (entity?.totalDnQty ?? 0) > 0 && (entity?.totalItemQty ?? 0) > 0
            ? ((entity?.totalDnQty ?? 0) / (entity?.totalItemQty ?? 1)) * 100
            : 0;
        let color = 'default';
        const status = percentage >= 100 ? 'Completed' : percentage < 100 && percentage > 0 ? 'In Progress' : "Open"
        switch (entity.dn_status) {
          case 'in-progress':
            color = 'orange';
            break;
          case 'complete':
            color = 'green';
            break;
          case 'open':
            color = 'blue';
            break;
          case 'cancel':
            color = 'red';
            break;
          case 'close':
            color = 'red';
            break;
          default:
            color = 'default';
            break;
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ alignItems: 'flex-start', width: '35%' }}>
              <Tag color={color}> {entity?.dn_status?.charAt(0).toUpperCase() + entity?.dn_status?.slice(1)}</Tag>
            </div>
            <Progress
              percent={percentage || 0}
              size="small"
              strokeColor={{ from: '#108ee9', to: '#87d068' }}
              style={{ width: '50%' }}
              format={(percent) => `${Math.round(percent ?? 0)}%`} />
          </div>
        )
      },
    },
    {
      title: 'Action', dataIndex: 'idCard',
      width: 20,
      align: 'center',
      render: (_, r) =>
      (<a onClick={() => setDrawerOpen({ visible: true, id: r.id, status: r.status, po: r.poNo, deliveres: r.deliveries, so: r.soNo, dn_qty: r.totalDnQty, order_qty: r.totalItemQty })}>
        <FaTruckMoving />
      </a>),
    },
  ]

  const skuColumns: ProColumns<DNList>[] = skuList.map((sku) => {
    if (sku.item_category === 1) {

      return {
        title: sku.sku_name,
        dataIndex: sku.sku_code,
        key: sku.sku_code,
        width: 120, // fix width
        render: (_, record) => (record as any)[sku.sku_code] || '-',
        onCell: () => ({ style: { backgroundColor: 'rgba(3, 78, 162, 0.05)', textAlign: 'center' } }),
      };
    } else {
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
          render: (_: any, record: DNList) => (
            <Checkbox
              checked={selectedRowKeys.includes(record.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedRowKeys(prev => [...prev, record.id]);
                  setSelectedRows(prev => [...prev, record]);
                  setCardOpen({ visible: true });
                  setSelectedListDn(prev => [...prev, record]);
                  setDataListDn(prev => prev.filter(r => r.id !== record.id));
                } else {
                  setSelectedRowKeys(prev => prev.filter(k => k !== record.id));
                  setSelectedRows(prev => prev.filter(r => r.id !== record.id));
                  setSelectedListDn(prev => prev.filter(r => r.id !== record.id));
                }
              }}
            />
          ),
        },
      ]
      : []),


    {
      title: 'SO No',
      dataIndex: 'so_no',
      key: 'so_no',
      width: '7%',
      render: (_, value) => (
        <>
          <a onClick={() => setDrawerTypeOpen({ visible: true, data: value })}>
            <Typography.Link strong copyable >{value.so_no}</Typography.Link>
          </a>
          <a style={{ marginLeft: 5 }} onClick={() => window.open(`/external/sale/so/detail/${value.soId}`, '_blank')?.focus()}>
            <Typography.Link >< ExportOutlined /></Typography.Link>
          </a>
        </>
      ),
    },
    {
      title: 'DO No',
      dataIndex: 'id',
      width: 220,
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
        dayjs.utc(r.deliveryDate).add(7, 'hour').format('DD-MMM-YYYY hh-mm'),// forces UTC, no timezone shift
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
      // sorter: true,
      // sorter: {
      //   compare: (a, b) => (a.shippingAddress ?? '').localeCompare(b.shippingAddress ?? ''),
      //   multiple: 1,
      // },
      width: 200,
      render: (_, value) => (
        <a
          onClick={() => {
            if (value.latitude && value.longitude) {
              const url = `https://www.google.com/maps?q=${value.latitude},${value.longitude}`;
              window.open(url, '_blank'); // open in new tab
            } else {
              message.info(`No location found for: ${value.shippingAddress}`);
            }
          }}
        >
          {value.shippingAddress}
        </a>
      ),
    },
    // { title: 'Customer', dataIndex: 'customer_name', width: '7%' },
    ...(advanceSearchParams.filter !== 'HIS'
      ? [
        {
          title: 'Area',
          dataIndex: 'division',
          width: 150,
          render: (value: string) =>
            value?.replace(/^S&D\s*/i, ''),
        },
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
        { title: 'Channel', dataIndex: 'channel', width: 150 },
        {
          title: 'Volume', width: 180,
          render: (_: any, r: { mergeItems: any[]; }) => {
            if (!r.mergeItems) return 0;

            const total = r.mergeItems.reduce((sum, item) => {
              const volume = Number(item.volume) || 0;
              const qty = Number(item.qty) || 0;

              return sum + volume * qty;
            }, 0);

            return `${total.toFixed(4)} m³`
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
    // {
    //   title: 'SAL Remark',
    //   dataIndex: 'remarks',
    //   width: 150,
    //   render: (_, text) => (
    //     <div
    //       style={{
    //         whiteSpace: 'nowrap',
    //         overflow: 'hidden',
    //         textOverflow: 'ellipsis',
    //         maxWidth: 150,
    //       }}
    //       title={text.remarks} // shows full text on hover
    //     >
    //       {text.remarks ? text.remarks : '-'}
    //     </div>
    //   ),
    // },
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

  // const expandedRowRender = (record: DNList) => {
  //   const breakdown = record.deliveryItems?.reduce((acc: any, item: any) => {
  //     const sku = skuList.find((s) => s.id.toString() === item.sku_id);
  //     if (!sku) return acc;

  //     const key =
  //       sku.item_category === 2
  //         ? `${sku.sku_code}_${item.sku_uom.toLowerCase()}`
  //         : sku.sku_code;

  //     if (!acc[key]) acc[key] = {};
  //     acc[key][item.saleType || "STD"] =
  //       (acc[key][item.saleType || "STD"] || 0) + item.qty;

  //     return acc;
  //   }, {}) || {};

  //   return (
  //     <tr>
  //       {/* empty tds for static columns before SKU */}
  //       <td></td>
  //       <td style={{ width: '6%' }}></td> {/* DN Date */}
  //       <td style={{ width: '6%' }}></td> {/* SO No */}
  //       <td style={{ width: '7%' }}></td> {/* Customer */}

  //       {/* SKU columns */}
  //       {skuColumns.map((col: any) => {
  //         if (col.children && col.children.length) {
  //           return col.children.map((child: any) => {
  //             const saleTypes = breakdown[child.key];
  //             return (
  //               <td
  //                 key={child.key}
  //                 style={{
  //                   minWidth: child.width || 60,
  //                   textAlign: "center",
  //                   background: "#f8fbff",
  //                 }}
  //               >
  //                 {saleTypes
  //                   ? Object.entries(saleTypes).map(([type, qty]) => (
  //                     <div key={type}>
  //                       {type || "STD"}: {qty}
  //                     </div>
  //                   ))
  //                   : "-"}
  //               </td>
  //             );
  //           });
  //         } else {
  //           const saleTypes = breakdown[col.key];
  //           return (
  //             <td
  //               key={col.key}
  //               style={{
  //                 minWidth: col.width || 100,
  //                 textAlign: "center",
  //                 background: "#f8fbff",
  //               }}
  //             >
  //               {saleTypes
  //                 ? Object.entries(saleTypes).map(([type, qty]) => (
  //                   <div key={type}>
  //                     {type || "STD"}: {qty}
  //                   </div>
  //                 ))
  //                 : "-"}
  //             </td>
  //           );
  //         }
  //       })}

  //       {/* optional: leave blank for columns after SKU */}
  //       <td></td> {/* SAL Remark */}
  //       <td></td> {/* Shipping Address */}
  //     </tr>
  //   );
  // };

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
    "channel"
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
                              ? dayjs(item.deliveryDate).format('DD-MMM-YYYY')
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
                                  {access.currentUser?.login == item.claimed_by && access.canAccesAddRemarkAllocate ?
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
                              {
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
                                return (r.saleType ? r.saleType : 'STD')
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
  // const mtColums: ProColumns<DNList>[] = [
  //   {
  //     // title: 'SO Number',
  //     // dataIndex: 'soNo',
  //     render: (_, record) => {
  //       return (
  //         <Card style={{
  //           marginBottom: 16,
  //         }}>
  //           <Descriptions column={5}>
  //             <Descriptions.Item label="DO Date" style={{ fontWeight: 'bolder' }}>
  //               {dayjs(record.deliveryDate).isValid()
  //                 ? dayjs(record.deliveryDate).format('DD-MMM-YYYY')
  //                 : '-'}
  //             </Descriptions.Item>
  //             <Descriptions.Item label="DO No" style={{ fontWeight: 'bolder' }}>
  //               {record.id}
  //             </Descriptions.Item>
  //             <Descriptions.Item label="Shipping Address" span={1}
  //             >
  //               <a onClick={() => {
  //                 if (record.latitude && record.longitude) {
  //                   const url = `https://www.google.com/maps?q=${record.latitude},${record.longitude}`;
  //                   window.open(url, '_blank'); // open in new tab
  //                 } else {
  //                   message.info(`No location found for: ${record.shippingAddress}`);
  //                 }
  //               }}>{record.shippingAddress ? record.shippingAddress : '-'}</a>
  //             </Descriptions.Item>
  //             <Descriptions.Item span={5}>
  //               <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', alignItems: 'center' }}>
  //                 {record.status ? (
  //                   <Tag
  //                     color={
  //                       record.status === 'open'
  //                         ? 'blue'
  //                         : record.status === 'in-progress'
  //                           ? 'orange'
  //                           : record.status === 'complete'
  //                             ? 'green'
  //                             : record.status === 'force-close'
  //                               ? 'red'
  //                               : 'default'
  //                     }
  //                     style={{ textTransform: 'capitalize' }}
  //                   >
  //                     {record.status === 'force-close' ? 'Close' : record.status.replace(/-/g, ' ')}
  //                   </Tag>
  //                 ) : (
  //                   '-'
  //                 )}
  //                 {record.claimed_by ? (
  //                   <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
  //                     <span>
  //                       Claimed:{' '}
  //                       <strong>
  //                         {record.claimed_by},
  //                       </strong>
  //                       <span style={{ fontSize: 12 }}> {dayjs.utc(record.claimed_date).tz('Asia/Phnom_Penh').format('DD-MMM-YYYY hh:mm a')}</span>

  //                     </span>
  //                     {access.currentUser?.login == record.claimed_by && access.canAccesAddRemarkAllocate ?
  //                       <Button type="default" danger
  //                         onClick={() => handleUnClaim([Number(record.id)])}
  //                       >
  //                         Unship
  //                       </Button>
  //                       : <></>}

  //                   </div>
  //                 ) : access.canAccesAddRemarkAllocate ? (
  //                   <Button type="primary"
  //                     onClick={() => handleClaim(record.id)}
  //                   >
  //                     Ship
  //                   </Button>
  //                 ) : <></>}

  //                 <Dropdown overlayStyle={{ width: 400 }} menu={activityMenu} trigger={['click']} >
  //                   <Button onClick={() => getActivities(record.id)} style={{ marginLeft: 10 }}><HistoryOutlined /></Button>
  //                 </Dropdown>
  //                 {
  //                   record.status != 'force-close' && record.status != 'complete' && access.canAccesAddRemarkAllocate ?
  //                     <Tooltip title="Force Close" >
  //                       <Button onClick={() =>
  //                         setForceCloseOpen({
  //                           visible: true,
  //                           id: record?.id,
  //                         })
  //                       }
  //                         style={{ marginLeft: 10 }}><CloseCircleOutlined /></Button>
  //                     </Tooltip>
  //                     : <></>
  //                 }

  //               </div>
  //             </Descriptions.Item>
  //             <Descriptions.Item label="SO Num" style={{ fontWeight: 'bolder' }}>
  //               {record.so_no || '-'}
  //             </Descriptions.Item>
  //             <Descriptions.Item label="A/R Reserve Invoice" style={{ fontWeight: 'bolder' }}>
  //               {record.reserve_num || '-'}
  //             </Descriptions.Item>
  //             <Descriptions.Item label="Customer Code" style={{ fontWeight: 'bolder' }}>
  //               <a>
  //                 <Typography.Link strong copyable >{record.customer_code || '-'}</Typography.Link>
  //               </a>
  //             </Descriptions.Item>
  //             <Descriptions.Item label="Customer Name" style={{ fontWeight: 'bolder' }}>
  //               {record.customer_name || '-'}
  //             </Descriptions.Item>
  //             <Descriptions.Item label="Phone" style={{}}>
  //               {record.phone || '-'}
  //             </Descriptions.Item>

  //           </Descriptions>
  //           <ProTable
  //             size="small"
  //             search={false}
  //             rowKey="id"
  //             dataSource={record.mergedItems}
  //             expandable={{
  //               expandedRowRender: (record) => {
  //                 const dnList = (record.dn || [record]).filter(d =>
  //                   d && (d.dn_num || d.dn_qty || d.dn_date)
  //                 );

  //                 const plannedQty = Number(record.qty) || 0;
  //                 const sortedDnList = dnList.filter(d => d.dn_num).sort((a, b) => Number(a.dn_num) - Number(b.dn_num));
  //                 const firstDn = sortedDnList[0];
  //                 return (
  //                   <Table
  //                     size="small"
  //                     rowKey={(r, index) => r?.id ?? index}
  //                     columns={[
  //                       {
  //                         title: 'DN No',
  //                         dataIndex: 'dn_num',
  //                         key: 'dn_num',
  //                       },
  //                       {
  //                         title: 'Delivered Qty',
  //                         dataIndex: 'dn_qty',
  //                         key: 'dn_qty',
  //                         render: (_, dnRecord) => {
  //                           const qty = parseFloat(dnRecord.dn_qty) || 0;
  //                           const isMismatch = qty !== plannedQty;
  //                           return (
  //                             <span>
  //                               {qty.toLocaleString(undefined, { maximumFractionDigits: 0 })}
  //                             </span>
  //                           );
  //                         },
  //                       },
  //                       {
  //                         title: 'DN Date',
  //                         dataIndex: 'dn_date',
  //                         key: 'dn_date',
  //                         render: (_, item) => {
  //                           const rawDnDate = item.dn_date;
  //                           const dnDate = rawDnDate
  //                             ? dayjs.utc(rawDnDate).tz('Asia/Phnom_Penh').startOf('day')
  //                             : null;

  //                           // Safely get the list of DNs for this item
  //                           const dnList = item.dn || [];

  //                           // Only consider DNs with a dn_num for sorting
  //                           const sortedDnList = dnList
  //                             .filter(d => d?.dn_num)
  //                             .sort((a, b) => Number(a.dn_num) - Number(b.dn_num));

  //                           const firstDn = sortedDnList[0];
  //                           const isFirstDN = item.dn_num === firstDn?.dn_num;

  //                           return (
  //                             <span style={{ display: 'inline-flex', alignItems: 'center' }}>
  //                               {dnDate?.isValid() ? dnDate.format('DD-MMM-YYYY') : '-'}
  //                               {!isFirstDN && <Tag color="orange" style={{ marginLeft: 8 }}>Unplanned</Tag>}
  //                             </span>
  //                           );
  //                         },
  //                       }



  //                     ]}
  //                     dataSource={dnList}
  //                     pagination={false}
  //                   />
  //                 );
  //               },
  //               rowExpandable: (record) => {
  //                 // expanded if dn exists or record itself has dn_num
  //                 return (Array.isArray(record.dn) && record.dn.length > 0) || record.dn_num;
  //               },
  //             }}
  //             options={false}
  //             pagination={false}
  //             columns={[
  //               {
  //                 title: 'Item Code',
  //                 dataIndex: 'itemCode',
  //                 width: 150,
  //                 render: (_, r) => {
  //                   return r.itemCode || r.item_code || '-'
  //                 }
  //               },
  //               {
  //                 title: 'Item Name',
  //                 dataIndex: 'itemName',
  //                 width: 250,
  //                 render: (_, record) => {
  //                   return record.itemName && record.itemName.trim() !== ''
  //                     ? record.itemName
  //                     : record.item_name || '-';
  //                 },
  //               },
  //               {
  //                 title: 'Plan',
  //                 dataIndex: 'qty',
  //                 width: 70,
  //                 render: (_, r) => {
  //                   return r.qty || '0'
  //                 }
  //               },
  //               {
  //                 title: 'Delivered',
  //                 width: 90,
  //                 render: (_, item) => {
  //                   const deliveryDate = dayjs.utc(record.deliveryDate).tz('Asia/Phnom_Penh').startOf('day');
  //                   const dnList = Array.isArray(item.dn) ? item.dn : [item];

  //                   const allDNs = record.deliveryItems.flatMap(item => item.dn || []);
  //                   const sortedDnList = allDNs
  //                     .filter(d => d.dn_num)
  //                     .sort((a, b) => Number(a.dn_num) - Number(b.dn_num));
  //                   const firstDnNum = sortedDnList[0]?.dn_num;

  //                   const plannedQty = Number(item.qty) || 0;
  //                   const totalDelivered = dnList.reduce((sum, dn) => sum + (parseFloat(dn.dn_qty) || 0), 0);

  //                   let color = 'black'; // default

  //                   if (dnList.length === 1) {
  //                     const dn = dnList[0];
  //                     const dnDate = dayjs.utc(dn.dn_date).tz('Asia/Phnom_Penh').startOf('day');
  //                     const isFirstDn = dn.dn_num === firstDnNum;
  //                     const isSameDate = dnDate.isSame(deliveryDate);

  //                     if (isFirstDn && isSameDate && totalDelivered >= plannedQty) {
  //                       color = 'green';
  //                     } else if (totalDelivered == 0) {
  //                       color = 'black';
  //                     } else {
  //                       color = 'orange';
  //                     }
  //                   } else if (totalDelivered == 0) {
  //                     color = 'black';
  //                   } else if (
  //                     dnList.length > 1 ||
  //                     dnList.some(dn => {
  //                       const dnDate = dayjs.utc(dn.dn_date).tz('Asia/Phnom_Penh').startOf('day');
  //                       return !dnDate.isSame(deliveryDate);
  //                     }) ||
  //                     totalDelivered < plannedQty
  //                   ) {
  //                     color = 'orange';
  //                   }

  //                   return (
  //                     <div style={{ color }}>
  //                       {totalDelivered.toLocaleString(undefined, { maximumFractionDigits: 0 })}
  //                     </div>
  //                   );
  //                 },
  //               },
  //               {
  //                 title: 'Type',
  //                 dataIndex: 'saleType',
  //                 width: 70,
  //                 render: (_, r) => {
  //                   return (r.saleType ? r.saleType : 'STD')
  //                 }
  //               },
  //               {
  //                 title: 'Remark',
  //                 dataIndex: 'dn',
  //                 width: 250,
  //                 render: (_dom, entity) => {
  //                   const remark = entity.dn?.[0]?.remark ?? '';
  //                   return (
  //                     <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
  //                       {remark ? remark : '-'}
  //                     </div>
  //                   );
  //                 },
  //               },
  //               {
  //                 title: 'Attachment',
  //                 dataIndex: 'attachment',
  //                 width: 200,
  //                 render: (_, record) => {
  //                   const attachments = record.dn?.[0]?.attachment || [];

  //                   return (
  //                     <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
  //                       {attachments.map((att, index) => {
  //                         const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(att);
  //                         const decodedURL = decodeURIComponent(att)
  //                         const fileNameMatch = decodedURL.match(/\/([^\/?]+)\?alt=media/)
  //                         let fileName = fileNameMatch ? fileNameMatch[1] : `File ${index + 1}`;
  //                         const dashIndex = fileName.indexOf('-');
  //                         if (dashIndex !== -1) {
  //                           fileName = fileName.substring(dashIndex + 1);
  //                         }
  //                         return isImage ? (
  //                           <Image
  //                             key={index}
  //                             width={50}
  //                             height={50}
  //                             src={att}
  //                             alt={`attachment-${index}`}
  //                             style={{ objectFit: 'cover', borderRadius: 4 }}
  //                             preview={{ mask: <div>Click to preview</div> }}
  //                           />
  //                         ) : (
  //                           <a
  //                             key={index}
  //                             href={att.attachment}
  //                             target="_blank"
  //                             rel="noopener noreferrer"
  //                             style={{
  //                               display: 'inline-block',
  //                               padding: '4px 8px',
  //                               border: '1px solid #ccc',
  //                               borderRadius: 4,
  //                               backgroundColor: '#f5f5f5',
  //                               marginRight: 8,
  //                             }}
  //                           >
  //                             {fileName}
  //                           </a>
  //                         );
  //                       })}
  //                     </div>
  //                   );
  //                 },
  //               },
  //               {
  //                 width: 100,
  //                 align: 'center',
  //                 render: (_, r) => {
  //                   if (status == 'Pending' || status == 'Failed') return null;
  //                   if (r.isUnplanned) return <Tag key="unplanned" color="orange" style={{ marginLeft: 8 }}>Unplanned</Tag>
  //                   if (!access.canAccesAddRemarkAllocate) return null
  //                   return (
  //                     <a
  //                       onClick={() => {
  //                         const dnItem = r.dn?.[0];
  //                         setModalOpen({
  //                           visible: true,
  //                           id: dnItem?.id,
  //                           remark: dnItem?.remark,
  //                           attachment: dnItem?.attachment,
  //                           sales_planid: r.deliveryId
  //                         });
  //                       }}
  //                     >
  //                       <FaRegPenToSquare />
  //                     </a>
  //                   );
  //                 },
  //               },
  //             ]}
  //           />
  //         </Card>
  //       );
  //     },
  //   },
  // ];




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
        {advanceSearchParams.filter == 'SO' ?
          <TableView<SOList, { searchValue?: string }>
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
                      <Button
                        type="text"
                        size='large'
                        onClick={() => onSync()}
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
              </Space>
            }
            columns={soColums}
            actionHandlers={{
              onRequest: (criteria, pagination, sort) =>
                onRequestHandler({
                  criteria: {
                    ...criteria,
                    advanceSearch: advanceSearchParams,
                    sort,
                  },
                  pagination: {
                    pageSize: 500
                  },
                })

            }}

          />
          : advanceSearchParams.filter == 'MT' ?
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
                        <Button
                          type="text"
                          onClick={() => onSync()}
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
                    {/* {advanceSearchParams.filter == 'MT' ?
                      <Radio.Group
                        value={MTSearch.status}
                        onChange={(e) => {
                          setMTSearch((v) => ({
                            ...v,
                            status: e.target.value,
                          }));
                          actionRef.current?.reloadAndRest?.();
                        }}
                      >
                        <Radio.Button value="ALL">ALL</Radio.Button>
                        <Radio.Button value="open">Open</Radio.Button>
                        <Radio.Button value="in-progress">In Progress</Radio.Button>
                        <Radio.Button value="complete">Completed</Radio.Button>
                      </Radio.Group>
                      : {}} */}
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
                      pageSize: 500
                    },
                  })
              }}

            />
            : advanceSearchParams.filter == 'OV' ?
              <TableView<DnQuickView, { searchValue?: string }>
                displayOnly
                tableProps={{
                  actionRef: actionRef,
                }}
                extraFilter={
                  <Space size="large" style={{ flexDirection: 'row' }}>
                    {/* <Button onClick={() => setSearchModalOpen({ visible: true })}><FileSearchOutlined /></Button> */}
                    <><Radio.Group
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
                      {/* {advanceSearchParams.filter == 'OV' ?
                        <RangePicker onChange={(dates) => {
                          if (dates) {
                            setQuickViewSearch({
                              startDate: dates[0]?.format('YYYY-MM-DD'),
                              endDate: dates[1]?.format('YYYY-MM-DD'),
                            })
                            actionRef.current?.reloadAndRest?.();
                          } else {
                            setQuickViewSearch({ startDate: undefined, endDate: undefined })
                            actionRef.current?.reloadAndRest?.();
                          }
                        }} />
                        : {}} */}
                    </>
                  </Space>
                }
                columns={qvColums}
                actionHandlers={{
                  onRequest: (criteria, pagination, sort) =>
                    onRequestQuickView({
                      criteria: {
                        ...criteria,
                        advanceSearch: advanceSearchParams,
                        sort,
                      },
                      pagination: {
                        pageSize: 500
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
                        <ProForm submitter={false} layout="inline">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            {/* <Checkbox
                              checked={asDate}
                              onChange={e => { setAsDate(e.target.checked), actionRef.current?.reloadAndRest?.() }}
                            >
                              As of Now
                            </Checkbox> */}
                            {/* <ProFormDatePicker
                              name="delivery_date"
                              placeholder="Request Delivery Date"
                              disabled={!asDate}
                              onChange={(val: moment.Moment | null) => {
                                const localDate = val ? val.format('YYYY-MM-DD') : undefined; // local date
                                setDnSearch((v) => ({ ...v, delivery_date: localDate }));
                                actionRef.current?.reloadAndRest?.();
                              }}
                              width={200}
                            /> */}
                            <ProFormSelect
                              name="sap_delivery_date"
                              initialValue="as_of_now"
                              onChange={(val: string) => {
                                setDnSearch((v) => ({ ...v, sap_delivery_date: val }))
                                actionRef.current?.reloadAndRest?.();
                              }}
                              options={[
                                { value: 'all', label: 'ALL' },
                                { value: 'as_of_now', label: 'As Date' },
                                { value: 'today', label: 'Today' },
                                { value: 'unplan', label: 'TBC' },
                              ]}
                              width={150}
                              showSearch
                            />
                            {/* <ProFormSelect
                              width={200}
                              name="area_dn"
                              placeholder="Area"
                              showSearch
                              allowClear
                              mode="multiple"
                              request={async () => {
                                const data = await services.list_area();
                                return data.map((obj: any) => ({
                                  value: obj.division_id,
                                  label: obj.division_name,
                                }));
                              }}
                              onChange={(val?: string) => {
                                setDnSearch(v => ({
                                  ...v,
                                  area: val,
                                }));
                                actionRef.current?.reloadAndRest?.();
                              }}
                            /> */}
                            {areaReady && (
                              <ProFormSelect
                                name="area_dn"
                                mode="multiple"
                                placeholder="Area"
                                showSearch
                                allowClear
                                width={200}
                                options={areaOptions}
                                initialValue={dnSearch.area}
                                onChange={(val: number[]) => {
                                  setSelectedArea(val);
                                  setDnSearch(v => ({
                                    ...v,
                                    area: val,
                                  }));
                                  actionRef.current?.reloadAndRest?.();
                                }}
                              />
                            )}




                            <ProFormDateRangePicker
                              name="sap_delivery_range_dn"
                              placeholder={['From Date', 'To Date']}
                              disabled={!asDate}
                              width={300}
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
                              onChange={(val: string[]) => {
                                setDnSearch(v => ({ ...v, customer: val }));
                                actionRef.current?.reloadAndRest?.();
                              }}
                            />

                          </div>
                          {/* Button */}
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
                          <Button type="text" size={'large'}
                            onClick={() => navigate("/delivery/location", { state: { list: dataListDn, selected: selectedListDn, selectedRows: selectedRows, areaList: selectedArea } })}
                            icon={<TbMap2 />}
                            style={{ fontSize: 22 }}
                          >
                          </Button>
                          <Button type="text" size='large' onClick={() => setSortModalOpen(true)}>
                            <ColumnHeightOutlined />
                          </Button>
                          <Button
                            type="text"
                            onClick={() => onSync()}
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
                      onRequestDNDeatilHandler({
                        criteria: {
                          ...criteria,
                          advanceSearch: dnSearch,
                          sort,
                        },
                        pagination: {
                          pageSize: 500,
                        },
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
                              {/* <Checkbox
                                checked={asDate}
                                onChange={e => { setAsDate(e.target.checked), actionRef.current?.reloadAndRest?.() }}
                              >
                                As of Now
                              </Checkbox> */}
                              {/* <ProFormDatePicker
                                name="delivery_date"
                                placeholder="Delivery Date"
                                disabled={!asDate}
                                onChange={(val: moment.Moment | null) => {
                                  const localDate = val ? val.format('YYYY-MM-DD') : undefined; // local date
                                  setHisSearch((v) => ({ ...v, delivery_date: localDate }));
                                  actionRef.current?.reloadAndRest?.();
                                }}
                                width={200}
                              /> */}
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
                                  { value: 'unplan', label: 'TBC' },
                                ]}
                                width={150}
                                showSearch
                              />
                              {/* <ProFormDatePicker
                                name="sap_delivery_date"
                                placeholder="Delivery Date"
                                disabled={!asDate}
                                onChange={(val: moment.Moment | null) => {
                                  const localDate = val ? val.format('YYYY-MM-DD') : undefined; // local date
                                  setHisSearch((v) => ({ ...v, sap_delivery_date: localDate }));
                                  actionRef.current?.reloadAndRest?.();
                                }}
                                width={200}
                              /> */}
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

                            <Button
                              type="text"
                              onClick={() => onSync()}
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
                            advanceSearch: hisSearch,
                            sort,
                          },
                          pagination: {
                            pageSize: 500,
                          },
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
        onCancel={() => {
          setClaimOpen(false);
          setClaimIds([])
          setClaimedLines([])
          setSelectedRowKeys([])
          setSelectedRows([])
          setSelectedListDn([])
        }}
        onOk={async () => {
          const sapLines = selectedListDn.flatMap(dn =>
            (dn.deliveryItems ?? []).map(it => ({
              lineNum: Number(it.sap_line_num),                 // SAP line number
              shipDate: (dn.deliveryDate)
            }))
          );
          const soDocEntries = [...new Set(
            selectedListDn.map(v => v.so_doc_entry)
          )];
          for (const soDocEntry of soDocEntries) {
            await services.ClaimDn(
              claimIds,
              access.currentUser?.login,
              'Pick',
              'Pick DN',
              useExisting ? selectedClaimedLine : null,
              soDocEntry,
              sapLines
            );
          }
          actionRef.current?.reloadAndRest?.();
          message.success('Updated successfully');
          setClaimOpen(false);
          setClaimIds([])
          setClaimedLines([])
          setSelectedRowKeys([])
          setSelectedRows([])
          setSelectedListDn([])
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

    </>
  );
};
