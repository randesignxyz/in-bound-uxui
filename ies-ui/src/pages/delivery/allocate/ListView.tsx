import TableView, { colLink, TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDateTime } from '@/pages/utils';
import { MultiRequest } from '@/services/apiGateway';
import { Company, Driver, DriverListItem, SaveDriver, Truck } from '@/services/delivery/data';
import { simpleRequestActions } from '@/services/model';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Card, Checkbox, DatePicker, message, Modal, Progress, Radio, Space, Spin, Tag, Image, UploadFile, Descriptions, Button } from 'antd';
import { useRef, useState } from 'react';
import { AllocateServiceAPI } from './service';
import { Allocate, AllocateSOAdvanceParams, DeliveryList, DNItemParams, DNList, SOList, UpdateRemarkParams } from './data';
import { useAccess, useModel } from '@umijs/max';
import { Paging } from '@/services/API';
import { FaCarSide, FaRegPenToSquare, FaTruckMoving } from "react-icons/fa6";
import DrawerForm from './DrawerForm';
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import AddRemarkModal from './AddRemarkForm';
import { uploadFileToFirebase } from './uploadImage';
import { PlayCircleOutlined, SyncOutlined } from '@ant-design/icons';

dayjs.extend(customParseFormat)

export default () => {
  const access = useAccess();
  const requestActions = simpleRequestActions();
  const services = AllocateServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [drawerOpen, setDrawerOpen] = useState<{ visible: boolean; id: string, status?: string, po?: string, deliveres?: any[], so?: string }>({
    visible: false,
    id: '',
  });
  const [advanceSearchParams, setAdvanceSearchParams] = useState({
    filter: 'SO',
    status: 'posted',
  });
  const [modalOpen, setModalOpen] = useState<{ visible: boolean; id: number, remark?: string, attachment?: any }>({
    visible: false,
    id: 0,
  });
  // const [state, setSate] = useState<{
  //   visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: Driver };
  //   initData?: {
  //     companyList: Company[];
  //     truckList: Truck[];
  //   };
  // }>({});
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

  const onRequestHandler = async (params: TableViewSearchParams<AllocateSOAdvanceParams>) => {
    try {
      return services.pageSO(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'alocate-list',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<Allocate>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const onRequestDNHandler = async (params: TableViewSearchParams<AllocateSOAdvanceParams>) => {
    try {
      return services.pageDN(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'alocate-list',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<DeliveryList>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const soColums: ProColumns<SOList>[] = [
    { title: 'PO No', dataIndex: 'poNo' },
    { title: 'SO No', dataIndex: 'soNo' },
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
      title: 'Total',
      dataIndex: 'totalItemQty',
    },
    {
      title: 'DN Total',
      dataIndex: 'dnCount',
    },
    {
      title: 'Status',
      width: 250,
      dataIndex: 'status',
      render: (_, entity) => {
        const status = entity.status;
        let color = 'default';

        switch (status) {
          case 'Pending':
            color = 'orange';
            break;
          case 'Posted':
            color = 'green';
            break;
          case 'Failed':
            color = 'red';
            break;
          default:
            color = 'default';
            break;
        }
        const percentage =
          (entity?.totalDnQty ?? 0) > 0 && (entity?.totalItemQty ?? 0) > 0
            ? ((entity?.totalDnQty ?? 0) / (entity?.totalItemQty ?? 1)) * 100
            : 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ alignItems: 'flex-start', width: '35%' }}>
              <Tag color={color}>{status}</Tag>
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
      (<a onClick={() => setDrawerOpen({ visible: true, id: r.id, status: r.status, po: r.poNo, deliveres: r.deliveries, so: r.soNo })}>
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
            <Descriptions style={{ padding: 16, marginBottom: 16 }} column={2}>
              <Descriptions.Item label="Delivery Date " style={{ fontWeight: 'bolder' }}>
                {dayjs(record.deliveryDate).isValid() ? dayjs(record.deliveryDate).format('DD-MMM-YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="SO Status " style={{ fontWeight: 'bolder' }}>
                <Tag
                  color={
                    record.soStatus === 'Pending'
                      ? 'orange'
                      : record.soStatus === 'Posted'
                        ? 'green'
                        : record.soStatus === 'Failed'
                          ? 'red'
                          : 'default'
                  }
                  bordered={false}
                >
                  {record.soStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="SO Number " style={{ fontWeight: 'bolder' }}>
                <a onClick={() => setDrawerOpen({ visible: true, id: record.soId, status: record.soStatus, po: record.poNo, deliveres: record.dn_plan })}>
                  {record.soNo ? record.soNo : '-'}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="Shipping Address " style={{ fontWeight: 'bolder' }}>
                {record.shippingAddress ? record.shippingAddress : '-'}
              </Descriptions.Item>
            </Descriptions>
            <ProTable
              size="small"
              search={false}
              rowKey="id"
              // dataSource={record.dn_plan}
              dataSource={(record.dn_plan || []).map(item => ({
                ...item,
                __parent: record.dn_plan,
              }))}
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
                  render: (_, item) => {
                    if (record.soStatus != 'Posted') return null;

                    const dnItem = item.dn?.[0];
                    return (
                      <a
                        onClick={() => {
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
        <TableView<SOList | DeliveryList, { searchValue?: string }>
          displayOnly
          tableProps={{
            actionRef: actionRef,
            toolbar: {
              actions: [
                <>
                  {access.canAccesAddRemarkAllocate ?
                    <Button
                      type="link"
                      onClick={async () => {
                        await services.syncAllocate()
                        actionRef.current?.reloadAndRest?.();
                      }}
                      icon={<SyncOutlined />}
                    />
                    : <></>}
                </>
              ],
            },
          }}
          extraFilter={
            <Space size="large" style={{ flexDirection: 'row' }}>
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
                <Radio.Button value="DN">Delivery Note</Radio.Button>
                {/* <Radio.Button value="FG">FG</Radio.Button> */}
              </Radio.Group>
              <Radio.Group
                value={advanceSearchParams.status}
                onChange={(e) => {
                  setAdvanceSearchParams((v) => ({
                    ...v,
                    status: e.target.value,
                  }));
                  actionRef.current?.reloadAndRest?.();
                }}
              >
                <Radio.Button value="ALL">ALL</Radio.Button>
                <Radio.Button value="pending">Pending</Radio.Button>
                <Radio.Button value="posted">Posted</Radio.Button>
                <Radio.Button value="failed">Failed</Radio.Button>
                <Radio.Button value="canceled">Canceled</Radio.Button>
              </Radio.Group>
              <DatePicker
                style={{ width: 165 }}
                onChange={(v) => {
                  const dateWithoutTime = v?.format("YYYY-MM-DD")
                  setAdvanceSearchParams((prev) => ({
                    ...prev,
                    ordered_date: dateWithoutTime,
                  }));
                  actionRef.current?.reloadAndRest?.();
                }}
                placeholder="Select Date"
              />
            </Space>
          }
          columns={advanceSearchParams.filter == 'SO' ? soColums : advanceSearchParams.filter == 'DN' ? dnColums : []}
          actionHandlers={{
            onRequest: (criteria, pagination, sort) =>
              advanceSearchParams.filter === 'SO'
                ? onRequestHandler({
                  criteria: {
                    ...criteria,
                    advanceSearch: advanceSearchParams,
                    sort,
                  },
                  pagination,
                })
                : advanceSearchParams.filter == 'DN' ? onRequestDNHandler({
                  criteria: {
                    ...criteria,
                    advanceSearch: advanceSearchParams,
                    sort,
                  },
                  pagination,
                }) : Promise.resolve({}),
          }}

        />
      </Spin>
      <DrawerForm
        open={drawerOpen.visible}
        id={drawerOpen.id}
        status={drawerOpen.status}
        so={drawerOpen.so}
        po={drawerOpen.po}
        deliveres={drawerOpen.deliveres}
        onVisibleChange={(v) => v === false && setDrawerOpen({ visible: false, id: '', status: '', po: '' })}
      />
      <AddRemarkModal
        open={modalOpen.visible}
        onCancel={() => setModalOpen({ visible: false, id: 0, remark: '', attachment: [] })}
        id={modalOpen.id}
        onSave={(e) => { handleSaveRemark(e) }}
        remark={modalOpen.remark}
        attachment={modalOpen.attachment}
      />

    </>
  );
};
