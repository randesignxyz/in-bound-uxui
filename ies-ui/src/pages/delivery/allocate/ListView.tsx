import TableView, { colLink, TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDateTime } from '@/pages/utils';
import { MultiRequest } from '@/services/apiGateway';
import { Company, Driver, DriverListItem, SaveDriver, Truck } from '@/services/delivery/data';
import { simpleRequestActions } from '@/services/model';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Card, Checkbox, DatePicker, message, Modal, Progress, Radio, Space, Spin, Tag, Image, UploadFile, Descriptions, Button, Table, Dropdown } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AllocateServiceAPI } from './service';
import { Allocate, AllocateSOAdvanceParams, DeliveryList, DNItemParams, DNList, DNParams, SOAllocateActivities, SOList, UpdateRemarkParams } from './data';
import { useAccess, useModel } from '@umijs/max';
import { Paging } from '@/services/API';
import { FaCarSide, FaRegPenToSquare, FaTruckMoving } from "react-icons/fa6";
import DrawerForm from './DrawerForm';
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import AddRemarkModal from './AddRemarkForm';
import { uploadFileToFirebase } from './uploadImage';
import { FileSearchOutlined, HistoryOutlined, PlayCircleOutlined, SyncOutlined } from '@ant-design/icons';
import AdvanceSearch from './advanceSearchDrawer';

dayjs.extend(customParseFormat)

export default () => {
  const access = useAccess();
  const requestActions = simpleRequestActions();
  const services = AllocateServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [data, setData] = useState<SOList[]>()
  const [drawerOpen, setDrawerOpen] = useState<{ visible: boolean; id: string, status?: string, po?: string, deliveres?: any[], so?: string, dn_qty?: number, order_qty?: number }>({
    visible: false,
    id: '',
  });
  const [advanceSearchParams, setAdvanceSearchParams] = useState({
    filter: 'SO',
    status: 'posted',
    dnStatus: 'pending'
  });
  const [modalOpen, setModalOpen] = useState<{ visible: boolean; id: number, remark?: string, attachment?: any }>({
    visible: false,
    id: 0,
  });
  const [searchModalOpen, setSearchModalOpen] = useState<{ visible: boolean }>({
    visible: false
  });
  const [activities, setActivities] = useState<SOAllocateActivities[]>([]);

  const cacheList = useModel('dataList');

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

  const handleClaim = async (id: number) => {
    Modal.confirm({
      title: 'Claim',
      content: 'Are you sure?',
      onOk: async () => {

        await services.ClaimDn(id, access.currentUser?.login, 'Claim', 'Claim DN') as {
          data: string;
          message: string;
        }
        actionRef.current?.reloadAndRest?.();
        message.success('Updated successfully');
      },
    });
  }

  const handleUnClaim = async (id: number) => {
    Modal.confirm({
      title: 'UnClaim',
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
      const list = await services.list_dn_by_user();

      if (!Array.isArray(list)) {
        throw new Error('Unexpected response format');
      }

      const page = params.pagination?.current ?? 1;
      const pageSize = params.pagination?.pageSize ?? 20;
      const total = list.length;

      const pagedData = list.slice((page - 1) * pageSize, page * pageSize);
      console.log(pagedData)
      // const cached = cacheList.cacheDataList({
      //   type: 'dn-list',
      //   criteria: params,
      //   data: pagedData,
      //   total,
      //   page,
      //   pageSize,
      // });

      // console.log('onRequestDNHandler return:', cached);
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

  const dnColums: ProColumns<DNList>[] = [
    {
      // title: 'SO Number',
      // dataIndex: 'soNo',
      render: (_, record) => {
        return (
          <Card style={{ marginBottom: 16 }}>
            <Descriptions column={5}>
              <Descriptions.Item label="DO Date" style={{ fontWeight: 'bolder' }}>
                {dayjs(record.deliveryDate).isValid()
                  ? dayjs(record.deliveryDate).format('DD-MMM-YYYY')
                  : '-'}
              </Descriptions.Item>

              <Descriptions.Item label="Shipping Address" style={{ fontWeight: 'bolder' }} span={2}>
                {record.shippingAddress ? record.shippingAddress : '-'}
              </Descriptions.Item>

              <Descriptions.Item span={4}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
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
                          Unclaim
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

              // dataSource={(record.deliveryItems || []).map(item => ({
              //   ...item,
              //   __parent: record.deliveryItems,
              // }))}
              options={false}
              pagination={false}
              columns={[
                {
                  title: 'Item Name',
                  dataIndex: 'itemName',
                  width: 200,
                },
                // {
                //   title: 'Total Qty',
                //   dataIndex: 'qty',
                //   width: 90,
                //   render: (_, row) => {
                //     const allItems = row.__parent || [];
                //     const total = allItems
                //       .filter(i => i.itemCode === row.itemCode)
                //       .reduce((sum, i) => sum + Number(i.qty || 0), 0);
                //     return total.toLocaleString();
                //   },
                // },

                {
                  title: 'Plan',
                  dataIndex: 'qty',
                  width: 90,
                },
                {
                  title: 'Delivered',
                  width: 90,
                  render: (_, item) => {
                    const dn = item.dn || [];
                    const firstDnQty = dn?.[0]?.dn_qty ? Number(dn[0].dn_qty) : 0;
                    const planQty = Number(item.qty) || 0;
                    let color = 'black';

                    if (firstDnQty === planQty) color = 'green';
                    else if (firstDnQty > planQty) color = 'red';
                    else if (firstDnQty > 0) color = 'orange';

                    return (
                      <div style={{ color }}>
                        {firstDnQty.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
                          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(att.attachment);
                          const decodedURL = decodeURIComponent(att.attachment)
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
                              src={att.attachment}
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
                          setModalOpen({
                            visible: true,
                            id: dnItem?.id,
                            remark: dnItem?.remark,
                            attachment: dnItem?.attachment,
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
                  <Radio.Button value="SO">Sales Order</Radio.Button>
                  <Radio.Button value="DN">My Task</Radio.Button>
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
          : advanceSearchParams.filter == 'DN' ?
            <TableView<DNList, { searchValue?: string }>
              displayOnly
              tableProps={{
                actionRef: actionRef,
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
                    <Radio.Button value="SO">Sales Order</Radio.Button>
                    <Radio.Button value="DN">My Task</Radio.Button>
                    {/* <Radio.Button value="FG">FG</Radio.Button> */}
                  </Radio.Group>
                </Space>
              }
              columns={dnColums}
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
        onCancel={() => setModalOpen({ visible: false, id: 0, remark: '', attachment: [] })}
        id={modalOpen.id}
        onSave={(e) => { handleSaveRemark(e) }}
        remark={modalOpen.remark}
        attachment={modalOpen.attachment}
      />
      <AdvanceSearch
        open={searchModalOpen.visible}
        onSearch={(d) => {
          setAdvanceSearchParams((v) => ({ ...v, ...d }));
          actionRef.current?.reloadAndRest?.();
        }}
        onVisibleChange={(v) => v === false && setSearchModalOpen({ visible: false })}
        onReset={() => {
          setAdvanceSearchParams({ status: 'posted', filter: 'SO', dnStatus: 'open' });
          actionRef.current?.reloadAndRest?.();
        }}
      />
    </>
  );
};
