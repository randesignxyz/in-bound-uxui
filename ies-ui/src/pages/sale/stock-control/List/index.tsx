import type { TableViewProps } from '@/components/DataCrud/TableView';
import TableView from '@/components/DataCrud/TableView';
import { formatDate } from '@/pages/utils';
import type { Paging } from '@/services/API';
import { getServiceUrl } from '@/services/ApiUrl';
import type {
  SaveStockControl,
  StockAdvanceSearchParams,
  StockControlLess,
} from '@/services/sale/data';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-table';
import { useSetState } from 'ahooks';
import { Button, message, Modal, Radio, Space, Tag, Tooltip, Upload } from 'antd';
import type { SortOrder } from 'antd/lib/table/interface';
import { omit } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { history, useAccess, useModel } from 'umi';
import { SalePaths } from '../..';
import EditStockControlFormModal from '../EditStockControlFormModal';
import { Model } from '../model';
import StockControlFormModal from '../StockControlFormModal';
import AdvanceSearch from './AdvanceSearch';

const StockListView: React.FC<TableViewProps<StockControlLess>> = ({ actionHandlers }) => {
  const excelType = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  const cacheList = useModel('dataList');
  // const [transferModal, setTransferModal] = useSetState<{ visible?: boolean }>();
  const [addNewModal, setAddNewModal] = useSetState<{ visible?: boolean }>({});
  const [editModal, setEditModal] = useSetState<{ visible?: boolean; record?: StockControlLess }>(
    {},
  );
  const [force, setForce] = useSetState<{ update: number }>({ update: 0 });
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const { state, actions, modals } = Model();
  const [advanceSearchParams, setAdvanceSearchParams] = useState<StockAdvanceSearchParams>();
  const [fileId, setFileId] = useState();
  const [storageData, setStorageData] = useState<StockControlLess[]>([]);

  const onRequestHandler = (
    criteria?: { searchValue?: string; advanceSearch?: StockAdvanceSearchParams },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return actions
      .loadListItem?.(criteria || { advanceSearch: advanceSearchParams }, pagination, sort)
      .then((it) => {
        setStorageData(it.items);
        return cacheList.cacheDataList({
          type: 'stock',
          criteria: criteria?.advanceSearch || advanceSearchParams,
          data: it,
        });
      }) as Promise<Paging<StockControlLess>>;
  };

  // const onSaveActionHandler = (data: TopupLess, isView: boolean) => {
  //   const msgTitle = `Save Transaction`;
  //   Modal.confirm({
  //     title: msgTitle,
  //     content: 'Are you sure:',
  //     onOk: async () => {
  //       const result = await actions.transferMoney(data);
  //       if (result && result.message === 'Ok') {
  //         setTransferModal({ visible: false });
  //         message.info(`Your transaction is saved.`);
  //         isView
  //           ? history.push(`${SalePaths.stock}/detail/${result.id}`)
  //           : setForce({ update: force.update + 1 });
  //       }
  //     },
  //   });
  // };

  const onSaveAddNewStoreActionHandler = (data: SaveStockControl, isView: boolean) => {
    const msgTitle = `Save Transaction`;
    Modal.confirm({
      title: msgTitle,
      content: 'Are you sure:',
      onOk: async () => {
        const result = state.data?.isBeginningManual
          ? await actions.initializeStockControl(data)
          : await actions.createStockControl(data);
        if (result && result.message === 'Ok') {
          setAddNewModal({ visible: false });
          message.info(`Your transaction is saved.`);
          actionRef.current?.reload();
          isView
            ? history.push(`${SalePaths.stock}/detail/${result.id}`)
            : setForce({ update: force.update + 1 });
        }
      },
    });
  };

  useEffect(() => {
    (async () => {
      await actions.initilizeData();
    })();
  }, []);

  const importProps = {
    name: 'file',
    action: `${getServiceUrl('WORK_FLOW')}/uploader/upload`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    beforeUpload: (file: { type: string; name: any }) => {
      const isExslFile = excelType.includes(file.type);
      if (!isExslFile) {
        message.error(`${file.name} is not a excel file`);
      }
      return isExslFile ? true : Upload.LIST_IGNORE;
    },
    showUploadList: false,
    onChange(info: any) {
      if (info.file.status !== 'uploading') {
        //console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        console.log(info);
        info.fileList = [];
        setFileId(info.file.response);

        Modal.confirm({
          title: `Importing file '${info.file.name}'`,
          content: 'Are you sure?',
          onOk: async () => {
            const result = await actions.importSalesStock(fileId || '');
            // const result = { message: 'Ok' };
            if (result && result.message === 'Ok') {
              // setAddNewModal({ visible: false });
              message.info(`Your records is imported.`);
              actionRef.current?.reload();
            }
          },
        });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    <>
      <TableView<
        StockControlLess,
        { searchValue?: string; advanceSearch?: StockAdvanceSearchParams }
      >
        cache
        advanceSearch
        hasCriteria={Object.values(omit(advanceSearchParams, ['status', 'customerType'])).some(
          (v) => v,
        )}
        forceUpdate={force.update}
        displayOnly
        extraFilter={
          <Space size="large">
            <Radio.Group
              value={advanceSearchParams?.status || 'all'}
              onChange={(e) => {
                setAdvanceSearchParams((v) => ({
                  ...v,
                  status: e.target.value,
                }));

                actionRef.current?.reloadAndRest?.();
              }}
            >
              <Radio.Button value="all">All</Radio.Button>
              <Radio.Button value="pending">Pending</Radio.Button>
              <Radio.Button value="approved">Loading</Radio.Button>
              <Radio.Button value="open">Open</Radio.Button>
              <Radio.Button value="count stock">Count Stock</Radio.Button>
              <Radio.Button value="settled">Settle</Radio.Button>
              <Radio.Button value="closed">Closed</Radio.Button>
            </Radio.Group>
          </Space>
        }
        tableProps={{
          actionRef: actionRef,
          toolbar: !access.canAccessWarehouse
            ? undefined
            : {
                actions: [
                  // <Upload {...importProps}>
                  //   <Tooltip placement="top" title="Import">
                  //     <Button type="link" icon={<UploadOutlined />}>
                  //       Import
                  //     </Button>
                  //   </Tooltip>
                  // </Upload>,
                  // <Button
                  //   key={'bt'}
                  //   type="link"
                  //   onClick={() => setTransferModal({ visible: true })}
                  //   icon={<RetweetOutlined />}
                  // />,
                  <Button
                    key={'bt'}
                    type="link"
                    onClick={() => setAddNewModal({ visible: true })}
                    icon={<PlusOutlined />}
                  />,
                ],
                // settings: [
                //   {
                //     icon: <SwapOutlined color="blue" />,
                //     tooltip: 'Transfer Money',
                //     onClick: () => setAddModal({ visible: true }),
                //   },
                // ],
              },
        }}
        actionHandlers={{
          onSearchCriteria: (data) => {
            return { searchValue: data, advanceSearch: advanceSearchParams };
          },
          // onAdd: () => {
          //   setAddNewModal({ visible: true });
          // },
          onFirstLoad: () =>
            cacheList.fetchDataList('stock').then((v) => {
              if (v) {
                setAdvanceSearchParams(v.creteria);
                return v.dataList;
              } else return onRequestHandler();
            }) as Promise<Paging<StockControlLess>>,
          onRequest: onRequestHandler,
          onAdvanceSearchClicked: () => modals.showModal('advanceSearch'),
        }}
        columns={[
          {
            title: 'Owner Request',
            // sorter: 'poNo',
            // dataIndex: 'stockName',
            render: (_, r) => {
              return (
                <a onClick={() => actionHandlers?.onDetail && actionHandlers?.onDetail(r)}>
                  {r.owner}
                </a>
              );
            },
          },
          {
            width: 120,
            title: 'Request Date',
            align: 'right',
            render: (_, r) => {
              return formatDate(r.requestedDate);
            },
          },
          {
            title: 'Serial Number',
            dataIndex: 'referenceNo',
          },

          {
            title: 'Number Plate',
            dataIndex: 'plateNumber',
          },
          {
            title: 'Received By',
            dataIndex: 'receivedBy',
          },

          {
            title: 'Status',
            // dataIndex: 'status',
            align: 'center',
            render: (_, r) => {
              const color =
                r.status === 'pending'
                  ? 'default'
                  : //: r.status === 'approved'
                  r.status === 'open'
                  ? 'success'
                  : r.status === 'canceled' || r.status === 'closed'
                  ? 'magenta'
                  : 'warning';
              return (
                <span>
                  <Tag color={color}>{r.status}</Tag>
                </span>
              );
            },
          },

          {
            title: 'Approved By',
            dataIndex: 'approvedBy',
          },
          {
            width: 120,
            title: 'Approved Date',
            //dataIndex: 'approvedDate',
            align: 'right',
            render: (_, r) => {
              return formatDate(r.approvedDate);
            },
          },
          access.canAcessStockControlMenuItem
            ? {
                title: '',
                align: 'center',
                render: (_, r) => {
                  return (
                    <Tooltip title="Edit" key="edit">
                      <EditOutlined
                        style={{ color: '#448DF7' }}
                        onClick={() => {
                          setEditModal({ visible: true, record: r });
                        }}
                      />
                    </Tooltip>
                  );
                  // return <Checkbox defaultChecked={r.isActive ? true : false} disabled />;
                },
              }
            : {},
        ]}
      />

      {/* <QuickView
        width="700px"
        placement="right"
        closable
        destroyOnClose
        title="Quick View"
        visible={modals.isVisible('quickView')}
        onClose={() => {
          modals.hideModal('quickView');
        }}
        soDetail={state.data?.soDetail}
      /> */}

      {/* <TransferEntryModal
        title="Deposit Money"
        visible={transferModal.visible}
        width={'500px'}
        onCancel={() => setTransferModal({ visible: false })}
        seList={state.data?.initData?.salespersonList}
        actionHandlers={{
          onSave: onSaveActionHandler,
          // onLoadInitData: onInitializationHandler,
        }}
      /> */}

      <EditStockControlFormModal
        isLoading={state.loading || false}
        title="Edit Store"
        open={editModal.visible}
        data={{
          seList: state.data?.initData?.salespersonList,
          stockControl: editModal.record,
        }}
        onCancel={() => setEditModal({ visible: false, record: undefined })}
        actionHandlers={{
          onSaveVehicle: actions.saveVehicle,
          onUpdate: async (item) => {
            const result = await actions.updateStockControl(item);
            if (result?.message === 'Ok') {
              message.info('Store is updated.');
              setEditModal({ visible: false, record: undefined });
              actionRef.current?.reload();
            }
          },
        }}
      />

      <StockControlFormModal
        isLoading={state.loading || false}
        title="Create Stock Control"
        open={addNewModal.visible}
        data={{
          typeId: 132,
          seList: state.data?.initData?.salespersonList?.filter((it) => {
            const found = storageData.find((it1) => {
              const code = it1.owner.split(' - ')[0];
              return it1.status !== 'closed' && code === it.salespersonCode;
            });
            return found ? false : true;
          }),
          stockCategory: state.data?.initData?.types,
          typeProductItems: state.data?.initData?.typeProductItems,
          listLastStockControl: state.data?.lsitLastStockControl,
          isBeginningManual: state.data?.isBeginningManual,
        }}
        onCancel={() => setAddNewModal({ visible: false })}
        actionHandlers={{
          onLoadInitData: () => {},
          onSave: onSaveAddNewStoreActionHandler,
          onFetchLastStockControl: (empNo: string) => {
            actions.fetchLastStockControl(empNo);
          },
          onClearLastStockControl: actions.clearLastStockControl,
          onSaveVehicle: actions.saveVehicle,
          onCheckInitializeMenu: async (empNo: string) => {
            await actions.checkInitailManual(empNo);
            //console.log(`after fetch ${state.data?.isBeginningManual}`);
          },
        }}
      />

      <AdvanceSearch
        width="400px"
        placement="right"
        closable
        title="Advance Search"
        open={modals.isVisible('advanceSearch')}
        onClose={() => {
          modals.hideModal('advanceSearch');
        }}
        initData={advanceSearchParams}
        salespersons={state.data?.initData?.salespersonList}
        onSearch={(data) => {
          setAdvanceSearchParams((v) => ({ ...v, ...data, status: v?.status }));
          actionRef.current?.reloadAndRest?.();
        }}
        onReset={() => {
          setAdvanceSearchParams({ status: 'all' });
          actionRef.current?.reloadAndRest?.();
        }}
      />
    </>
  );
};

export default StockListView;
