import TableView, { colLink, TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDateTime } from '@/pages/utils';
import { MultiRequest } from '@/services/apiGateway';
import { Company, Driver, DriverListItem, SaveDriver, Truck } from '@/services/delivery/data';
import { simpleRequestActions } from '@/services/model';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Card, Checkbox, DatePicker, message, Modal, Progress, Radio, Space, Spin, Tag, Image, UploadFile, Descriptions, Button, Table, Dropdown, Row, Col, Typography } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AllocateServiceAPI } from './service';
import { Allocate, AllocateSOAdvanceParams, DeliveryList, DNItemParams, DNList, DNParams, DnQuickView, SkuList, SOAllocateActivities, SOList, UpdateRemarkParams } from './data';
import { useAccess, useModel } from '@umijs/max';
import { Paging } from '@/services/API';
import { FaCarSide, FaRegPenToSquare, FaTruckMoving } from "react-icons/fa6";
import DrawerForm from './DrawerForm';
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import AddRemarkModal from './AddRemarkForm';
import { uploadFileToFirebase } from './uploadImage';
import { CopyOutlined, FileSearchOutlined, HistoryOutlined, PlayCircleOutlined, PlusCircleOutlined, SyncOutlined } from '@ant-design/icons';
import AdvanceSearch from './advanceSearchDrawer';
import { FloatingCard } from './displayCard';
import SaleTypeDrawer from './SaleTypeDrawer';
import moment from 'moment';

dayjs.extend(customParseFormat)

export default () => {
  const { RangePicker } = DatePicker
  const access = useAccess();
  const requestActions = simpleRequestActions();
  const services = AllocateServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [data, setData] = useState<SOList[]>()
  const [skuList, setSkuList] = useState<SkuList[]>([])
  const [dataListDn, setDataListDn] = useState<DNList[]>([])
  const [selectedRows, setSelectedRows] = useState<DNList[]>([]);
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
  const [MTSearch, setMTSearch] = useState({
    status: 'ALL',
    startDate: undefined,
    endDate: undefined
  });
  const [dnSearch, setDnSearch] = useState<{ status: string; delivery_date: string, province_id?: string, district_id?: any, commune_id?: string }>({
    status: 'posted',
    delivery_date: moment().format("YYYY-MM-DD"),
  });
  const [modalOpen, setModalOpen] = useState<{ visible: boolean; id: number, remark?: string, attachment?: any, sales_planid?: string }>({
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

  const cacheList = useModel('dataList');

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
      console.log('Sorted SKU list by category and sequence:', sortedSku);
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

  // const handleClaim = async (id: number) => {
  //   Modal.confirm({
  //     title: 'Claim',
  //     content: 'Are you sure?',
  //     onOk: async () => {

  //       await services.ClaimDn(id, access.currentUser?.login, 'Claim', 'Claim DN') as {
  //         data: string;
  //         message: string;
  //       }
  //       actionRef.current?.reloadAndRest?.();
  //       message.success('Updated successfully');
  //     },
  //   });
  // }

  const handleClaim = async (ids: number | number[]) => {
    // Normalize ids to an array
    const idArray = Array.isArray(ids) ? ids : [ids];

    Modal.confirm({
      title: 'Claim',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          // Loop through each id
          for (const id of idArray) {
            await services.ClaimDn(id, access.currentUser?.login, 'Claim', 'Claim DN') as {
              data: string;
              message: string;
            };
          }

          // Reload table and show success message
          actionRef.current?.reloadAndRest?.();
          message.success('Updated successfully');
          setSelectedRowKeys([])
          setSelectedRows([])
        } catch (error) {
          message.error('Failed to update');
          console.error(error);
        }
      },
    });
  };

  const handleUnClaim = async (id: number) => {
    Modal.confirm({
      title: 'Release Claim',
      content: 'Are you sure?',
      onOk: async () => {

        await services.ClaimDn(id, '', 'Release Claim', 'Claim DN') as {
          data: string;
          message: string;
        }
        actionRef.current?.reloadAndRest?.();
        message.success('Updated successfully');
      },
    });
  }

  const getActivities = async (id: number) => {
    try {
      const da = await services.getActivities(id);
      setActivities(da);
      console.log(da);
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

  const onRequestDNHandler = async (
    params: TableViewSearchParams<AllocateSOAdvanceParams>
  ): Promise<Paging<DNList>> => {
    try {
      const list = await services.list_dn_by_user(MTSearch.status, MTSearch.startDate, MTSearch.endDate);

      if (!Array.isArray(list)) {
        throw new Error('Unexpected response format');
      }

      const page = params.pagination?.current ?? 1;
      const pageSize = params.pagination?.pageSize ?? 20;
      const total = list.length;

      const pagedData = list.slice((page - 1) * pageSize, page * pageSize);

      return {
        items: pagedData,
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
      console.log(data)
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

  const onRequestDNDeatilHandler = async (
    params: TableViewSearchParams<AllocateSOAdvanceParams>
  ): Promise<Paging<DNList>> => {
    try {
      const list = await services.list_dn_detail(
        dnSearch.status,
        dnSearch.delivery_date,
        dnSearch.province_id,
        dnSearch.district_id,
        dnSearch.commune_id
      );

      if (!Array.isArray(list)) {
        throw new Error('Unexpected response format');
      }

      // --- Transform items to map sku_id → sku_code (+ handle category 2 UOM split) ---
      const transformedList = list.map((delivery) => {
        const skuValues: Record<string, number> = {};

        const itemsToUse = delivery.mergeItems?.length ? delivery.mergeItems : delivery.deliveryItems;

        itemsToUse.forEach((item) => {
          const sku = skuList.find((s) => s.id.toString() === item.sku_id);
          if (sku) {
            if (sku.item_category === 2) {
              // Category 2 → split into pack/bowl using UOM
              const key = `${sku.sku_code}_${item.sku_uom.toLowerCase()}`;
              skuValues[key] = (skuValues[key] || 0) + item.qty;
            } else {
              // Category 1 (and others) → normal mapping
              skuValues[sku.sku_code] = (skuValues[sku.sku_code] || 0) + item.qty;
            }
          }
        });

        return {
          ...delivery,
          key: delivery.id,
          ...skuValues,
        };
      });

      // --- Pagination ---
      const page = params.pagination?.current ?? 1;
      const pageSize = params.pagination?.pageSize ?? 20;
      const total = transformedList.length;

      const pagedData = transformedList.slice((page - 1) * pageSize, page * pageSize);

      const dataList = {
        items: pagedData,
        total,
        page,
        pageSize,
      };

      setDataListDn(dataList);
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
      title: 'Deliver Qty',
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
    {
      title: '',
      dataIndex: 'checkbox',
      width: '2%',
      render: (_: any, record: DNList) => (
        <>
          {/* <Button type='link' onClick={() => setDrawerTypeOpen({ visible: true, data: record })}> <PlusCircleOutlined /></Button> */}

          <Checkbox
            checked={selectedRowKeys.includes(record.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedRowKeys(prev => [...prev, record.id]);
                setSelectedRows(prev => [...prev, record]);
                setCardOpen({ visible: true });
              } else {
                setSelectedRowKeys(prev => prev.filter(k => k !== record.id));
                setSelectedRows(prev => prev.filter(r => r.id !== record.id));
              }
            }}
          />
        </>
      ),
    },


    {
      title: 'SO No',
      dataIndex: 'so_no',
      key: 'so_no',
      width: '8%',
      render: (_, value) => (
        <a onClick={() => setDrawerTypeOpen({ visible: true, data: value })}>
          <Typography.Link strong copyable >{value.so_no}</Typography.Link>
        </a>
      ),
    },
    {
      title: 'DN Date',
      dataIndex: 'deliveryDate',
      width: '6%',
      render: (_, r) =>
        dayjs.utc(r.deliveryDate).format('DD-MMM-YYYY') // forces UTC, no timezone shift
    },
    { title: 'Customer', dataIndex: 'customer_name', width: '7%' },
    {
      title: 'SKU',
      key: 'sku',
      children: skuColumns,
    },
    {
      title: 'SAL Remark',
      dataIndex: 'remarks',
      width: 150,
      render: (_, text) => (
        <div
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 150,
          }}
          title={text.remarks} // shows full text on hover
        >
          {text.remarks ? text.remarks : '-'}
        </div>
      ),
    }, { title: 'Shipping Address', dataIndex: 'shippingAddress', width: 200 },
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

  const mtColums: ProColumns<DNList>[] = [
    {
      // title: 'SO Number',
      // dataIndex: 'soNo',
      render: (_, record) => {
        return (
          <Card style={{
            marginBottom: 16,
          }}>
            <Descriptions column={6}>
              <Descriptions.Item label="DO Date" style={{ fontWeight: 'bolder' }}>
                {dayjs(record.deliveryDate).isValid()
                  ? dayjs(record.deliveryDate).format('DD-MMM-YYYY')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Shipping Address" style={{ fontWeight: 'bolder' }} span={2}>
                {record.shippingAddress ? record.shippingAddress : '-'}
              </Descriptions.Item>
              {/* <Descriptions.Item style={{}}>
                {record.status ? (
                  <Tag
                    color={
                      record.status === 'open'
                        ? 'blue'
                        : record.status === 'in-progress'
                          ? 'orange'
                          : record.status === 'complete'
                            ? 'green'
                            : 'default'
                    }
                    style={{ textTransform: 'capitalize' }}
                  >
                    {record.status.replace(/-/g, ' ')}
                  </Tag>
                ) : (
                  '-'
                )}
              </Descriptions.Item> */}
              <Descriptions.Item span={5}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', alignItems: 'center' }}>
                  {record.status ? (
                    <Tag
                      color={
                        record.status === 'open'
                          ? 'blue'
                          : record.status === 'in-progress'
                            ? 'orange'
                            : record.status === 'complete'
                              ? 'green'
                              : 'default'
                      }
                      style={{ textTransform: 'capitalize' }}
                    >
                      {record.status.replace(/-/g, ' ')}
                    </Tag>
                  ) : (
                    '-'
                  )}
                  {record.claimed_by ? (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span>
                        Claimed:{' '}
                        <strong>
                          {record.claimed_by},
                        </strong>
                        <span style={{ fontSize: 12 }}> {dayjs.utc(record.claimed_date).tz('Asia/Phnom_Penh').format('DD-MMM-YYYY hh:mm a')}</span>

                      </span>
                      {access.currentUser?.login == record.claimed_by && access.canAccesAddRemarkAllocate ?
                        <Button type="default" danger
                          onClick={() => handleUnClaim(record.id)}
                        >
                          Release
                        </Button>
                        : <></>}

                    </div>
                  ) : access.canAccesAddRemarkAllocate ? (
                    <Button type="primary"
                      onClick={() => handleClaim(record.id)}
                    >
                      Claim
                    </Button>
                  ) : <></>}

                  <Dropdown overlayStyle={{ width: 400 }} menu={activityMenu} trigger={['click']} >
                    <Button onClick={() => getActivities(record.id)} style={{ marginLeft: 10 }}><HistoryOutlined /></Button>
                  </Dropdown>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="SO Num" style={{ fontWeight: 'bolder' }}>
                {record.so_no || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="A/R Reserve Invoice" style={{ fontWeight: 'bolder' }}>
                {record.reserve_num || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Customer Code" style={{ fontWeight: 'bolder' }}>
                {record.customer_code || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Customer Name" style={{ fontWeight: 'bolder' }}>
                {record.customer_name || '-'}
              </Descriptions.Item>

            </Descriptions>
            <ProTable
              size="small"
              search={false}
              rowKey="id"
              dataSource={record.deliveryItems}
              expandable={{
                expandedRowRender: (record) => {
                  const dnList = record.dn || [];
                  const plannedQty = Number(record.qty) || 0;
                  return (
                    <Table
                      size="small"
                      rowKey={(r) => r.id}
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
                          render: (_, re) => {
                            const rawDnDate = re.dn_date;
                            const dnDate = rawDnDate ? dayjs.utc(rawDnDate).tz('Asia/Phnom_Penh').startOf('day') : null;
                            const sortedDnList = record.dn
                              .filter(d => d.dn_num)
                              .sort((a, b) => Number(a.dn_num) - Number(b.dn_num));
                            const firstDn = sortedDnList[0];
                            const isFirstDN = re.dn_num === firstDn?.dn_num;

                            let tags: React.ReactNode[] = [];

                            if (!isFirstDN) {
                              tags.push(
                                <Tag key="check" color="orange" style={{ marginLeft: 8 }}>Unplanned</Tag>
                              );
                            }

                            return (
                              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                {dnDate?.isValid() ? dnDate.format('DD-MMM-YYYY') : '-'}
                                {tags}
                              </span>
                            );
                          }
                        }


                      ]}
                      dataSource={dnList}
                      pagination={false}
                    />
                  );
                },
                rowExpandable: (record) => record.dn && record.dn.length > 0,
              }}
              options={false}
              pagination={false}
              columns={[
                {
                  title: 'Item Code',
                  dataIndex: 'itemCode',
                  width: 100,
                },
                {
                  title: 'Item Name',
                  dataIndex: 'itemName',
                  width: 200,
                  render: (_, record) => {
                    return record.itemName && record.itemName.trim() !== ''
                      ? record.itemName
                      : record.delItemName || '-';
                  },
                },
                {
                  title: 'Plan',
                  dataIndex: 'qty',
                  width: 90,
                },
                {
                  title: 'Delivered',
                  width: 90,
                  render: (_, item) => {
                    const deliveryDate = dayjs.utc(record.deliveryDate).tz('Asia/Phnom_Penh').startOf('day');
                    const dnList = Array.isArray(item.dn) ? item.dn : [];

                    const allDNs = record.deliveryItems.flatMap(item => item.dn || []);
                    const sortedDnList = allDNs
                      .filter(d => d.dn_num)
                      .sort((a, b) => Number(a.dn_num) - Number(b.dn_num));
                    const firstDnNum = sortedDnList[0]?.dn_num;

                    const plannedQty = Number(item.qty) || 0;
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
                  width: 90,
                },
                {
                  title: 'Remark',
                  dataIndex: 'dn',
                  width: 300,
                  render: (_, item) => {
                    const dn = item.dn || [];
                    const remark = dn?.[0]?.remark ?? '';
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
                    if (!access.canAccesAddRemarkAllocate) return null
                    return (
                      <a
                        onClick={() => {
                          const dnItem = r.dn?.[0];
                          console.log('r', r)
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
          </Card>
        );
      },
    },
  ];

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
      <Spin spinning={requestActions.request?.loading}>
        {advanceSearchParams.filter == 'SO' ?
          <TableView<SOList, { searchValue?: string }>
            displayOnly
            tableProps={{
              actionRef: actionRef,
              toolbar: {
              },
            }}
            extraFilter={
              <Space size="large" style={{ flexDirection: 'row' }}>
                <Button onClick={() => setSearchModalOpen({ visible: true })}><FileSearchOutlined /></Button>
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
                  <Radio.Button value="OV">Over View</Radio.Button>
                  <Radio.Button value="SO">Sales Order</Radio.Button>
                  <Radio.Button value="DN">Delivery Plan</Radio.Button>
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
              }}
              extraFilter={
                <Space size="large" style={{ flexDirection: 'row' }}>
                  <Button onClick={() => setSearchModalOpen({ visible: true })}><FileSearchOutlined /></Button>
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
                    <Radio.Button value="OV">Over View</Radio.Button>
                    <Radio.Button value="SO">Sales Order</Radio.Button>
                    <Radio.Button value="DN">Delivery Plan</Radio.Button>
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
              columns={mtColums}
              actionHandlers={{
                onRequest: (criteria, pagination, sort) =>
                  onRequestDNHandler({
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
            : advanceSearchParams.filter == 'OV' ?
              <TableView<DnQuickView, { searchValue?: string }>
                displayOnly
                tableProps={{
                  actionRef: actionRef,
                }}
                extraFilter={
                  <Space size="large" style={{ flexDirection: 'row' }}>
                    <Button onClick={() => setSearchModalOpen({ visible: true })}><FileSearchOutlined /></Button>
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
                      <Radio.Button value="OV">Over View</Radio.Button>
                      <Radio.Button value="SO">Sales Order</Radio.Button>
                      <Radio.Button value="DN">Delivery Plan</Radio.Button>
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
                    toolbar: {
                      actions: [
                        <>
                          {access.canAccesAddRemarkAllocate ? (
                            <Button type="primary"
                              disabled={selectedRowKeys.length == 0}
                              onClick={() => handleClaim(selectedRowKeys.map(k => Number(k)))}
                            >Claim</Button>
                          ) : <></>}

                        </>
                      ],
                    },
                  }}
                  extraFilter={
                    <Space size="large" style={{ flexDirection: 'row' }}>
                      <Button onClick={() => setSearchModalOpen({ visible: true })}>
                        <FileSearchOutlined />
                      </Button>
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
                        <Radio.Button value="OV">Over View</Radio.Button>
                        <Radio.Button value="SO">Sales Order</Radio.Button>
                        <Radio.Button value="DN">Delivery Plan</Radio.Button>
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
    </>
  );
};
