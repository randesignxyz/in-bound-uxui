import forkLift from '@/assets/fork-lift.png';
import stopping from '@/assets/no-stopping.png';
import timeLeft from '@/assets/time-left.png';
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { MultiRequest, downloadReport, execDataService0, fetchDataItemService, printPdf, singleRequest } from '@/services/apiGateway';
import { Loaded, LoadingBayListItem, LoadingCapacityListItem, LoadingListItem } from '@/services/delivery/data';
import {
  AllocatedLoadingDock,
  AllocatedLoadingDockBase,
  AllocatedLoadingDockDetail,
  LoadingServiceParams,
} from '@/services/delivery/loading-bay-service-params';
import { LoadingParams } from '@/services/delivery/loading-params';
import { simpleRequestActions } from '@/services/model';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CloseCircleTwoTone,
  ExclamationCircleOutlined,
  EyeOutlined,
  FileDoneOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
  PauseCircleOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  PrinterOutlined,
  ReloadOutlined, RetweetOutlined, StarFilled, StopOutlined, SwapOutlined, SyncOutlined, UnlockOutlined, UserOutlined
} from '@ant-design/icons';
import {
  Affix,
  Badge,
  Button, Checkbox, Col, Input,
  message, Modal, Row, Segmented, Space, Spin, Tag
} from 'antd';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import Detail from './detail';
import { durationFormat, server } from '@/pages/utils';
import { CheckCard, PageContainer, ProCard, ProDescriptions, ProList } from '@ant-design/pro-components';
import DropdownButton from 'antd/es/dropdown/dropdown-button';
import { UiType, ViewController } from './vc';
import { ActionData } from '@/pages/type';
import styles from './style.less';
import Remarks from '@/components/remarks';
import LoadingCapacitySelect from './LoadingCapacitySelect';
import Transfer from './Transfer';
import FinishLoadingModal from './finish-loading-modal';
import { SaveLoadedParam, startLoadingParam } from '@/services/delivery/req-params';
import ChangeRequest from './ChangeRequest';
import { InstanceSrvParams } from '@/services/delivery/instance-service-params';
import { useReactToPrint } from 'react-to-print';
import { PickingSlipToPrint } from '@/pages/delivery/board/picking-print';
import PickingSlip from '@/pages/delivery/loading/picking-slip-modal';
import { InstanceDetail } from '@/services/delivery/instance.types';
import ReconnectingWebSocket from 'reconnecting-websocket';
import Checkin from '@/pages/delivery/checkin';
import { OperatorCheckIn } from '@/pages/delivery/board/data';
import RemarkModalV2 from '@/components/remark-modal-v2';
import CheckinInfo from '@/pages/delivery/checkin/CheckinInfo';
import { QueuePaths } from '..';
import StartLoadingModal from './start-loading-modal';

const PENDING = "PENDING"
const PICKING = "PICKING"
const CHANGE_REQUEST = "CHANGE_REQUEST"
const LOADING = "LOADING"
const LOADING_STARTED = "LOADING_STARTED"
const HOLD = "HOLD"
const LOADED = "LOADED"

export default () => {

  const requestActions = simpleRequestActions();

  const [loadingDockList, setLoadingDockList] = useState<AllocatedLoadingDock[]>([]);
  const [loadingDockListDisplay, setLoadingDockListDisplay] = useState<AllocatedLoadingDock[]>([]);

  const [loadingDocks, setLoadingDocks] = useState<AllocatedLoadingDock[]>([]);
  const [loadingCapacities, setLoadingCapacities] = useState<LoadingCapacityListItem[]>([]);
  const [loadingBayList, setLoadingBayList] = useState<LoadingBayListItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<AllocatedLoadingDockDetail>();
  const [printing, setPrinting] = useState(0)
  const [filter, setFilter] = useState<{ loadingBayId?: number; searchValue?: string, allocatedOnly: boolean }>({ loadingBayId: 0, allocatedOnly: true });
  const [viewDetail, setViewDetail] = useState(false)
  const [instance, setInstance] = useState<InstanceDetail>();
  const [operatorCheckIn, setOperatorCheckIn] = useState<OperatorCheckIn>()

  const [statusFilter, setStatusFilter] = useState<string>(PICKING)

  const [statusCount, setStatusCount] = useState<{
    status: string,
    count: number
  }[]>()

  const [modal, setModal] = useState<
    { from?: UiType; } & (
      { type: undefined } |
      { type: 'START', payload: Loaded, ownedTruckLoading?: boolean, callback?: () => void } |
      { type: 'DONE', payload: Loaded, callback: () => void } |
      { type: 'TRANSFER' } |
      { type: 'LOADING_CAPACITY' } |
      { type: 'REMARKS', required?: boolean, cb: (remarks: string) => void; } |
      { type: 'CONFIRM_REQUEST', cb?: () => Promise<void>; } |
      { type: 'PICKING-SLIP', cb?: () => void; }
    )
  >({ type: undefined })

  const loadInstance = async (id: number) => {
    const rs = await singleRequest(InstanceSrvParams.fetch(id))(requestActions) as InstanceDetail;
    setInstance(rs);
    return rs
  }

  const onCancelHandler = (id: number, remarks: string, cb: () => void) => {
    Modal.confirm({
      title: "Cancel loading", content: "Are you sure?", onOk: async () => {
        try {
          await singleRequest(LoadingParams.cancelLoading(id, remarks))(requestActions);
          cb()
          onCloseModalHandler()
        } catch (error: any) {
          message.error(error.message || 'Failed to cancel.')
        }
      }
    })
  }

  const onCloseModalHandler = (visible?: boolean) => {
    if (visible) return
    setModal({ type: undefined })
    !viewDetail && setSelectedItem(undefined)
  }

  const onShowLoadingCapacityHandler = async () => {
    if (loadingCapacities.length === 0) {
      const list = (await singleRequest(LoadingServiceParams.listLoadingCapacity())(
        requestActions,
      )) as LoadingCapacityListItem[];
      setLoadingCapacities(list);
    }
    setModal({
      type: 'LOADING_CAPACITY'
    });
  }

  const onShowTransferHandler = async (item: AllocatedLoadingDockDetail) => {
    if (loadingDocks.length == 0) {
      try {
        const list = await LoadingServiceParams.listAvailableLoadingDocks(item.ticketId || 0).query(
          requestActions,
        );
        setLoadingDocks(list);
      } catch (error: any) {
        message.error(error?.message || 'Failed to load data.');
      }
    }

    setModal({ type: 'TRANSFER' });
  }

  const onCompleteHandler = async (loadingId: number, cb: () => void) => {

    try {
      const rs = (await singleRequest<Loaded>(LoadingParams.fetchLoadedItem(loadingId))(
        requestActions,
      )) as Loaded;
      rs && setModal({ type: 'DONE', payload: rs, callback: cb });
    } catch (error: any) {
      message.error(error.message || `Failed to load data`);
    }
  };

  const onStartLoaingHandler = async (loadingId: number, ownedTruckLoadin?: boolean, cb?: () => void) => {

    try {
      const rs = (await singleRequest<Loaded>(LoadingParams.fetchLoadedItem(loadingId))(
        requestActions,
      )) as Loaded;
      rs && setModal({ type: 'START', payload: rs, ownedTruckLoading: ownedTruckLoadin, callback: cb });
    } catch (error: any) {
      message.error(error.message || `Failed to load data`);
    }
  };

  const onLoadingStartedhandler = (params: startLoadingParam, cb?: () => void) => {
    Modal.confirm({
      title: 'Start Loading',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await singleRequest(LoadingParams.startLoading(params))(requestActions);
          message.success('Loading is started.');
          cb?.()
          onCloseModalHandler()
        } catch (error: any) {
          message.error(error.message || `Failed to start loading`);
        }
      },
    });
  };


  const onCompletedhandler = (params: SaveLoadedParam, cb: () => void) => {
    Modal.confirm({
      title: 'Complete Loading',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await singleRequest(LoadingParams.saveLoaded(params))(requestActions);
          message.success('Loading is finish successfully.');
          cb()
          onCloseModalHandler()
        } catch (error: any) {
          message.error(error.message || `Failed to completed loading`);
        }
      },
    });
  };

  const onClaimHandler = async (id?: number, cb?: () => void) => {
    const id1 = id || selectedItem?.id

    if (!id1) {
      message.error("Item cannot be identified.")
      return
    }
    try {
      await singleRequest(InstanceSrvParams.claim(id1))(requestActions);
      cb?.()
    } catch (error: any) {
      message.error(error.message || `Failed to claim`);
    }
  }

  const onReleaseHandler = (id?: number, cb?: () => void) => {
    const id1 = id || selectedItem?.id
    if (!id1) {
      message.error("Item cannot be identified.")
      return
    }
    Modal.confirm({
      title: 'Release Task',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await singleRequest(InstanceSrvParams.release(id1))(requestActions);
          cb?.()
        } catch (error: any) {
          message.error(error.message || `Failed to release`);
        }
      },
    });
  }

  const onCancelPickupHandler = (id: number, remarks: string, cb?: () => void) => {
    try {
      Modal.confirm({
        title: 'Cancel Picking Slip',
        content: 'Are you sure?',
        onOk: async () => {
          try {
            await singleRequest(LoadingParams.cancelPikingSlip(id, remarks))(requestActions);
            onCloseModalHandler()
            message.success('Cancel is successfully.');
            cb?.()
          } catch (error) {
            message.error(`Failed to cancel`);
          }
        },
      });
    } catch (error: any) {
      message.error(error.message || 'Failed to cancel');
    }

  }

  const printPickingSlip = async (instanceId: number) => {
    try {
      await printPdf<{ id: number }>(requestActions)({
        reportName: 'export-picking-slip',
        data: { id: instanceId }
      }, async () => {
        await printPdf<{ id: number }>(requestActions)({
          reportName: 'export-gate-pass',
          data: { id: instanceId }
        })
      });
    } catch (error: any) {
      message.error(error.message || "Failed to generate report.")
    }
  }

  const getActions = (from: UiType, item?: AllocatedLoadingDockBase) => {

    const selected = item || selectedItem
    const instanceId = item?.instanceId || selectedItem?.instanceId
    if (!selected) return []
    const isPending = selected?.status === 'PENDING'
    const isLoading = selected?.status === 'LOADING'
    const isLoadingStarted = selected?.status == LOADING_STARTED
    const isLoaded = selected?.status === 'LOADED'
    const claimed = !!selected?.claimedBy
    const isRequested = !!selected.loadedChangeRequest

    const actions = [
      {
        key: 'claim', label: 'Claim', visible: !claimed && instanceId && (!isLoaded || isRequested), main: true, icon: <CheckCircleOutlined />,
        onClick: () => {
          onClaimHandler(instanceId, async () => {
            if (from == 'DETAIL') {
              onFetchAllocatedDockDetail(selected?.id)
            }
            await loadData()
          })
        }
      },
      {
        key: 'view', label: 'View Detail', visible: from == 'LIST', icon: <EyeOutlined />,
        onClick: () => onFetchAllocatedDockDetail(selected.id, () => setViewDetail(true))
      },
      { seperator: true, visible: !isLoaded },
      {
        key: 'pickingSlip', label: "Picking Slip", visible: claimed && isPending && instanceId, main: claimed, type: 'Primary', icon: <FileDoneOutlined />, onClick: async () => {
          await loadInstance(instanceId || 0)
          setModal({
            type: 'PICKING-SLIP', from: from, cb: async () => {
              if (from == 'DETAIL') {
                onFetchAllocatedDockDetail(selected?.id)
              }
              const rs = await loadInstance(instanceId || 0)
              await printPickingSlip(rs.id)
              await loadData()
            }
          })
        }
      },
      {
        key: 'confirm',
        label: "Confirm Changed Request",
        visible: isRequested && claimed,
        main: isRequested, type: 'Primary',
        icon: <CheckCircleOutlined />,
        onClick: async () => {
          const rs = await loadInstance(instanceId || 0)
          setModal({
            type: 'CONFIRM_REQUEST', cb: async () => {
              if (from === 'DETAIL') {
                await onFetchAllocatedDockDetail(selected?.id)
              }
              await loadData()
            }
          })
        }
      },
      {
        key: 'printPickingSlip',
        label: "Print Picking slip",
        main: isLoaded,
        visible: !isPending && instanceId,
        icon: <PrinterOutlined />, onClick: async () => {

          await printPickingSlip(instanceId || 0)

        }
      },
      {
        key: 'hold', label: 'Hold', visible: claimed && isPending, main: false, icon: <PauseOutlined />, onClick: () => {
          setModal({
            type: 'REMARKS', required: true, from: from, cb: (remarks) => {
              onHoldInstanceHandler(selected.instanceId || 0, remarks, async () => {
                if (from === 'DETAIL') {
                  onFetchAllocatedDockDetail(selected?.id)
                }
                await loadData()
              })
            }
          })
        }
      },

      {
        key: 'release', label: 'Release Claim', visible: claimed && instanceId && (!isLoaded || isRequested || !isLoadingStarted), main: !isRequested && !isLoadingStarted && !isLoading, icon: <UnlockOutlined />,
        onClick: () => {
          onReleaseHandler(instanceId, async () => {
            if (from == 'DETAIL') {
              onFetchAllocatedDockDetail(selected?.id)
            }
            await loadData()
          })
        }
      },
      {
        key: 'changePickingSlip', label: "Change Picking slip", visible: !isRequested && isLoading && claimed && instanceId, icon: <SwapOutlined />, onClick: async () => {
          await loadInstance(instanceId || 0)
          setModal({
            type: 'PICKING-SLIP', from: from, cb: async () => {
              if (from == 'DETAIL') {
                onFetchAllocatedDockDetail(selected?.id)
              }
              await loadData()
            }
          })
        }
      },
      {
        key: 'cancalPickingSlip', label: "Cancel Picking slip", visible: !isRequested && isLoading && claimed && instanceId, type: 'Danger', icon: <StopOutlined />, onClick: () => {
          setModal({
            type: 'REMARKS', required: true, from: from, cb: (remarks) => {
              onCancelPickupHandler(selected?.loadingId || 0, remarks, async () => {
                if (from === 'DETAIL') {
                  onFetchAllocatedDockDetail(selected?.id)
                }
                await loadData()
              })
            }
          })
        }
      },

      { seperator: true, visible: (isLoading || claimed) && instanceId && !isLoaded },
      {
        key: 'start', label: "Start Loading", visible: isLoading && !isRequested && claimed, main: true, type: 'Primary', icon: <PlayCircleOutlined />, onClick: () => {

          selected?.loadingId && onStartLoaingHandler(selected.loadingId, selected.ownedTruckLoading, () => {
            if (from == 'DETAIL') {
              onFetchAllocatedDockDetail(selected?.id)
            }
            loadData()
          })
        }
      },
      {
        key: 'done', label: "Complete", visible: isLoadingStarted && !isRequested && claimed, main: true, type: 'Primary', icon: <FileDoneOutlined />, onClick: () => {
          selected?.loadingId && onCompleteHandler(selected.loadingId, () => {
            if (from == 'DETAIL') {
              onFetchAllocatedDockDetail(selected?.id)
            }
            loadData()
          })
        }
      },
      {
        key: 'attention', label: "Attention", visible: isPending || isLoading,
        icon: <ExclamationCircleOutlined />,
        onClick: () => selected?.loadingId && onAttentionHandler(selected.loadingId)
      },
      {
        key: 'transfer',
        label: 'Transfer',
        // visible: (isPending || isLoading) && !isRequested, 
        visible: false,
        icon: <SwapOutlined />,
        onClick: () => selected?.loadingId && onFetchAllocatedDockDetail(selected.id, async (item) => await onShowTransferHandler(item))
      },

      {
        key: 'loadingCapacity', label: 'Loading Capacity', visible: true, main: !isLoading && !isLoading, icon: <RetweetOutlined />, onClick: () => {
          onFetchAllocatedDockDetail(selected.id, async () => { await onShowLoadingCapacityHandler() })
        }
      },
      {
        key: 'cancel', label: "Cancel Loading", type: 'Danger', visible: isPending && claimed && (selected?.isOwner || !claimed), main: true, icon: <CloseCircleOutlined />, onClick: () => {
          setModal({
            type: 'REMARKS', required: true, from: from, cb: (remarks) => {
              selected?.loadingId && onCancelHandler(selected.loadingId, remarks, async () => {
                if (from === 'DETAIL') {
                  onFetchAllocatedDockDetail(selected?.id)
                }
                await loadData()
                setViewDetail(false)
              })
            }
          })
        }
      },
      {
        key: 'open', label: "Open", visible: !selected?.isActive, icon: <PlayCircleOutlined />,
        onClick: () => onOpenLoadingDockHandler(selected.id, () => {
          if (from == 'DETAIL') {
            setViewDetail(false)
          }
        })
      },
      {
        key: 'serveNext', label: "Serve Next", visible: !selected.allocated && selected.isActive && !selected.autoAssigned, icon: <UserOutlined />, onClick: () => {
          onServeNextHandler(selected.id, () => {
            if (from == 'DETAIL') {
              setViewDetail(false)
            }
          })
        }
      },
      {
        key: 'close', label: "Close", type: 'Danger',
        visible: !selected.allocated && selected.isActive,
        icon: <CloseCircleTwoTone />,
        onClick: () => onCloseLoadingDockHandler(selected.id, () => {
          if (from == 'DETAIL') {
            setViewDetail(false)
          }
        })
      },
    ] as ActionData[]

    return actions
  }

  const getSeq = (item: AllocatedLoadingDock) => {
    if (item.allocated)
      return 10
    else if (item.isActive)
      return 5
    else return 1
  }

  const loadData = async () => {
    try {
      const rs = await MultiRequest<{
        loadingBayList: LoadingBayListItem[];
        allocatedLoadingDockList: AllocatedLoadingDock[];
      }>([LoadingServiceParams.listAllLoadingBay(), LoadingServiceParams.allocatedLoadingDock(true)])(
        requestActions,
      );

      setLoadingBayList(rs.loadingBayList);

      const list = rs.allocatedLoadingDockList
        .filter(it => (it.allocated && filter.allocatedOnly) || !filter.allocatedOnly)
        .filter((it) => filter.loadingBayId == 0 || it.loadingBayId == filter.loadingBayId)
        .filter(it => (filter.searchValue || '').trim() == ''
          || it.ticketNum?.toLowerCase()?.includes(filter.searchValue?.toLowerCase() || '')
          || it.name.toLowerCase().includes(filter.searchValue?.toLowerCase() || '')
          || it.truckNo?.toLowerCase().includes(filter.searchValue?.toLowerCase() || '')
        ).sort((a, b) => getSeq(b) - getSeq(a))

      const list1 = rs.allocatedLoadingDockList.filter(it => !(it.canPick && it.status == 'PENDING' && it.isOwner))
      setStatusCount([
        { status: HOLD, count: list1.filter(it => it.holdBy).length },
        { status: CHANGE_REQUEST, count: list1.filter(it => it.loadedChangeRequest).length },
        { status: PENDING, count: list1.filter(it => it.status == PENDING && !it.holdBy && !it.canPick && !it.loadedChangeRequest).length },
        { status: PICKING, count: list1.filter(it => it.status == PENDING && !it.holdBy && it.canPick && !it.loadedChangeRequest).length },
        { status: LOADING, count: list1.filter(it => (it.status == LOADING || it.status == LOADING_STARTED) && !it.holdBy && !it.loadedChangeRequest).length },
        { status: LOADED, count: list1.filter(it => it.status == LOADED && !it.holdBy).length }
      ])
      setLoadingDockList(list)

      setLoadingDockListDisplay(
        list1
          .filter(it =>
            (statusFilter == HOLD && it.holdBy) ||
            (statusFilter == CHANGE_REQUEST && it.loadedChangeRequest && !it.holdBy) ||
            (statusFilter == PICKING && it.status == PENDING && it.canPick && !it.holdBy && !it.loadedChangeRequest) ||
            (statusFilter == PENDING && it.status == PENDING && !it.canPick && !it.holdBy && !it.loadedChangeRequest) ||
            (statusFilter == LOADING && (it.status == LOADING || it.status == LOADING_STARTED) && !it.holdBy && !it.loadedChangeRequest) ||
            (statusFilter == LOADED && it.status == LOADED && !it.holdBy) ||
            !statusFilter
          )
          .filter(it => (it.allocated && filter.allocatedOnly) || !filter.allocatedOnly)
          .filter((it) => filter.loadingBayId == 0 || it.loadingBayId == filter.loadingBayId)
          .filter(it => (filter.searchValue || '').trim() == ''
            || it.ticketNum?.toLowerCase()?.includes(filter.searchValue?.toLowerCase() || '')
            || it.name.toLowerCase().includes(filter.searchValue?.toLowerCase() || '')
            || it.truckNo?.toLowerCase().includes(filter.searchValue?.toLowerCase() || '')
          ).sort((a, b) => getSeq(b) - getSeq(a))
      )

    } catch (error: any) {
      message.error(error.message || 'Failed to load data.');
    }
  };

  const fetchOperatorCheckIn = async () => {
    const rs = await fetchDataItemService<OperatorCheckIn, { type: string }>({
      actionName: 'fetch-operator-check-in',
      endpoint: 'DELIVERY',
      payload: { type: 'WAREHOUSE' }
    }).query(requestActions)

    setOperatorCheckIn(rs)

    await loadData()
  }

  useEffect(() => {
    var clientWebSocket = new ReconnectingWebSocket(`ws://${server}/event-emitter`);
    clientWebSocket.onopen = () => {
      clientWebSocket.onmessage = (ev) => {
        const message = ev.data as string;
        if (message.includes('refresh')) {
          loadData()
        }
      };
    };
    fetchOperatorCheckIn()
  }, []);

  useEffect(() => {
    loadData();
  }, [filter, statusFilter]);

  const onHoldInstanceHandler = async (instanceId: number, remarks: string, cb?: () => void) => {
    Modal.confirm({
      title: 'Hold',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await singleRequest(InstanceSrvParams.hold(instanceId, remarks))(requestActions);
          onCloseModalHandler()
          message.success('Cancel is successfully.');
          cb?.()
        } catch (error: any) {
          message.error(error.message || `Failed to cancel`);
        }
      },
    });
  }

  const onSaveLoadingCapacityHandler = (loadingCapacityIds: number[]) => {
    Modal.confirm({
      title: 'Save Truck Loading Capacity',
      content: 'Are you sure?',
      onOk: async () => {
        if (!selectedItem) return
        try {
          await LoadingServiceParams.saveLoadingCapacity(
            selectedItem.id,
            loadingCapacityIds,
          )(requestActions);
          onCloseModalHandler()
          onFetchAllocatedDockDetail(selectedItem.id)
        } catch (error: any) {
          message.error(error?.message || 'Failed to save.');
        }
      },
    });
    return Promise.resolve();
  };

  const onFetchAllocatedDockDetail = async (id: number, cb?: (item: AllocatedLoadingDockDetail) => void) => {
    try {
      const rs = (await singleRequest(LoadingServiceParams.allocatedLoadingDockDetail(id))(
        requestActions,
      )) as AllocatedLoadingDockDetail;
      setSelectedItem(rs);
      cb?.(rs)
      // loadData();
    } catch (error: any) {
      message.error(error.message || 'Failed to load data.');
    }
  };

  const onListLoadingItemsHandler = (params: TableViewSearchParams<{ id: number }>) => {
    return singleRequest(LoadingParams.listByLoadingDock(params))(requestActions) as Promise<
      Paging<LoadingListItem>
    >;
  };

  const onAttentionHandler = (loadingId: number) => {
    Modal.confirm({
      title: "Attention",
      content: "Are you sure?",
      onOk: async () => {
        await singleRequest(LoadingParams.attentionCall(loadingId))(requestActions);
      }
    })
  };

  const onOpenLoadingDockHandler = (loadingDockId: number, cb: () => void) => {
    Modal.confirm({
      title: "Open loading dock", content: 'Are you sure?', onOk: async () => {
        try {
          await singleRequest(LoadingServiceParams.openLoadingDock(loadingDockId))(requestActions);
          loadData()
          cb()
        } catch (error: any) {
          message.error(error.message || 'Failed to open.')
        }

      }
    })

  }

  const onServeNextHandler = (loadingDockId: number, cb: () => void) => {
    Modal.confirm({
      title: "Serve Next", content: 'Are you sure?', onOk: async () => {
        try {
          await execDataService0({
            actionName: 'manual_serve',
            endpoint: 'DELIVERY',
            payload: { id: loadingDockId }
          })(requestActions)
          loadData()
          cb()
        } catch (error: any) {
          message.error(error.message || 'Failed to serve.')
        }
      }
    })
  };

  const onCloseLoadingDockHandler = (loadingDockId: number, cb: () => void) => {
    Modal.confirm({
      title: "Close loading dock", content: 'Are you sure?', onOk: async () => {
        try {
          await singleRequest(LoadingServiceParams.closeLoadingDock(loadingDockId))(requestActions);
          loadData()
          cb()
        } catch (error: any) {
          message.error(error.message || 'Failed to close.')
        }
      }
    })

  };

  const vc: ViewController = {
    requestActions: requestActions,
    actions: {
      listLoadingItems: onListLoadingItemsHandler
    },
    data: {
      item: selectedItem
    },
    view: {
      getActions: getActions
    }
  }

  const onChangeRequestHandler = (loadingId: number, approved: boolean, remarks?: string) => {
    Modal.confirm({
      title: approved ? "Request change approved." : "Request change rejected.",
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await singleRequest(LoadingServiceParams.onChangRequest({
            loadingId, approved, remarks
          }))(requestActions);
          modal.type === 'CONFIRM_REQUEST' && await modal.cb?.()
          onCloseModalHandler()
        } catch (error: any) {
          message.error(error.message || `Failed to ${approved ? 'approve' : 'reject'}.`)
        }
      }
    })
  }
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current as any,
    bodyClass: styles.print
  });

  const renderServing = () => {

    const itemToClaim = loadingDockList.find(it => !it.isOwner && it.canPick && !it.claimedBy && !it.holdBy && it.status == "PENDING")
    const claimedItem = loadingDockList.find(it => it.isOwner && !it.holdBy && it.canPick && it.status == "PENDING")
    return <ProCard style={claimedItem && { backgroundColor: 'Highlight' }} boxShadow bordered title="Serving Picking" extra={
      (() => {

        if (claimedItem) {
          const mainAction = (vc.view.getActions?.('LIST', claimedItem) || []).filter(it => it.visible && it.main).find(it => it)
          return <DropdownButton
            onClick={() => {
              if (!mainAction) {
                message.warning(`Blocked by ${claimedItem.claimedBy}`)
              }
              mainAction?.onClick?.(claimedItem.id)
            }} key={claimedItem.id}
            menu={{
              items: (vc.view.getActions?.('LIST', claimedItem) || []).filter(it => it.visible && it.key != mainAction?.key).map((it, index) => (it.seperator ? { type: 'divider', key: `dv-${index}` } : {
                icon: it.icon, key: it.key, label: it.label, onClick: () => it.onClick?.(claimedItem.id),
                danger: it.type == 'Danger'
              }))
            }}  >
            {mainAction?.icon}
            {(vc.view.getActions?.('LIST', claimedItem) || []).filter(it => it.visible && it.main)?.map(it => it.label).find(it => it) || <ClockCircleOutlined spin />}
          </DropdownButton>
        }

        if (itemToClaim) return <Button
          icon={<PlayCircleOutlined />} loading={requestActions.request?.loading || false}
          onClick={() => {
            onClaimHandler(itemToClaim?.instanceId, async () => {
              await loadData()
            })
          }}
          disabled={!operatorCheckIn} size='small' type='primary'>
          Serve Next
        </Button>


        return <Tag>No waiting</Tag>
      })()

    } >
      <ProDescriptions>
        <ProDescriptions.Item labelStyle={claimedItem && { color: 'whitesmoke' }} contentStyle={{ fontWeight: 'bolder', color: claimedItem ? 'whitesmoke' : undefined }} label="Ticket #">{claimedItem?.ticketNum}</ProDescriptions.Item>
        <ProDescriptions.Item labelStyle={claimedItem && { color: 'whitesmoke' }} contentStyle={claimedItem && { color: 'whitesmoke' }} label="Driver">{claimedItem?.driver}</ProDescriptions.Item>
        <ProDescriptions.Item labelStyle={claimedItem && { color: 'whitesmoke' }} contentStyle={claimedItem && { color: 'whitesmoke' }} label="Truck">{claimedItem?.truckNo}</ProDescriptions.Item>
        {(claimedItem?.combinedLoadingDocks?.length || 0) > 0 && <ProDescriptions.Item labelStyle={claimedItem && { color: 'whitesmoke' }} contentStyle={claimedItem && { color: 'whitesmoke' }} label="Combined with">{claimedItem?.combinedLoadingDocks?.map(it => it.name).join(", ")}</ProDescriptions.Item>}
      </ProDescriptions>

    </ProCard>
  }

  useEffect(() => {
    if (instance?.id == printing) {
      handlePrint()
      setPrinting(0)
    }
  }, [instance])

  return (
    <PageContainer breadcrumb={undefined} title={'Loading Board'} onBack={history.back}>
      {/* <Spin spinning={requestActions.request?.loading}> */}
      <Row style={{ marginBottom: 10 }}>
        <Col flex="300px">
          {' '}
          <Input.Search
            allowClear
            onSearch={(value) => {
              setFilter(v => ({ ...v, searchValue: value }))
            }}
          />{' '}
        </Col>
        <Col flex="20px" />
        <Col flex="200px">
          <Segmented
            value={filter.loadingBayId || 0}
            onChange={(value) => setFilter(v => ({ ...v, loadingBayId: value as number }))}
            options={[
              { value: 0, label: 'All' },
              ...loadingBayList.map((it) => ({ label: it.name, value: it.id })),
            ]} onResize={undefined} onResizeCapture={undefined} />
        </Col>
        <Col flex="20px" />
        <Col flex="150px" >
          <Checkbox key={'isAllocated'} defaultChecked checked={filter.allocatedOnly} onChange={e => setFilter(v => ({ ...v, allocatedOnly: e.target.checked }))}>Allocated Only </Checkbox>
        </Col>

        <Col flex={'Auto'}></Col>
        <Col>
          <Space>
            {!operatorCheckIn && <Checkin type='WAREHOUSE' onRefresh={fetchOperatorCheckIn} trigger={<Button icon={<LoginOutlined />} type='primary' >Check In</Button>} />}
            {operatorCheckIn && <CheckinInfo trigger={<Button icon={<InfoCircleOutlined />} />} type={'WAREHOUSE'} />}
            {operatorCheckIn && <RemarkModalV2<OperatorCheckIn> trigger={<Button icon={<LogoutOutlined />} danger>Checkout </Button>} item={operatorCheckIn} onSave={async (item: OperatorCheckIn, remarks?: string | undefined) => {
              try {
                await execDataService0<{ type: string, remarks?: string }>({
                  actionName: 'operator-checkout',
                  endpoint: 'DELIVERY',
                  payload: { type: 'WAREHOUSE', remarks: remarks }
                })(requestActions)
                fetchOperatorCheckIn()
                await loadData()
                return true
              } catch (error: any) {
                message.error(error.message || 'Failed to checkout.')
                return false
              }
            }} />}
            <Button
              onClick={() => {
                history.push(QueuePaths.loadingHistory);
              }}
              icon={<HistoryOutlined />}
            >
              Transanction
            </Button>
            <Button type="link" onClick={loadData} icon={<ReloadOutlined />} />
          </Space>
        </Col>
      </Row>
      <Spin spinning={requestActions.request?.loading || false}>
        <ProCard split='horizontal'>
          <Affix offsetTop={60}>
            {renderServing()}
          </Affix>
          <ProCard
            style={{ marginBlock: 5 }}

          >
            <CheckCard.Group onChange={values => {

              setStatusFilter(values as string)
            }
            } size='small' defaultValue={statusFilter}>
              <CheckCard size='small' style={{ width: 150 }} value={HOLD} avatar={<PauseCircleOutlined />} title="Hold" extra={<Badge count={statusCount?.find(it => it.status == HOLD)?.count} />} />
              <CheckCard size='small' style={{ width: 200 }} value={CHANGE_REQUEST} avatar={<SwapOutlined />} title="Change Request" extra={<Badge count={statusCount?.find(it => it.status == CHANGE_REQUEST)?.count} />} />
              <CheckCard size='small' style={{ width: 150 }} value={PENDING} avatar={<ClockCircleOutlined spin />} title="Pending" extra={<Badge style={{ backgroundColor: '#52c41a' }} count={statusCount?.find(it => it.status == PENDING)?.count} />} />
              <CheckCard size='small' style={{ width: 150 }} value={PICKING} avatar={<ClockCircleOutlined spin />} title="Picking" extra={<Badge count={statusCount?.find(it => it.status == PICKING)?.count} />} />
              <CheckCard size='small' style={{ width: 150 }} value={LOADING} avatar={<SyncOutlined spin />} title="Loading" extra={<Badge count={statusCount?.find(it => it.status == LOADING)?.count} />} />
              <CheckCard size='small' style={{ width: 150 }} value={LOADED} avatar={<CheckCircleOutlined />} title="Loaded" extra={<Badge style={{ backgroundColor: '#52c41a' }} count={statusCount?.find(it => it.status == LOADED)?.count} />} />
            </CheckCard.Group>
            <ProList<AllocatedLoadingDock>
              showActions='hover'
              size='small'
              rowKey='id'
              dataSource={loadingDockListDisplay}
              rowClassName={(item: AllocatedLoadingDock) => !item.isActive ? styles.color1 : item.allocated ? styles.color2 : styles.color3}
              metas={{
                avatar: { render: (_, r) => <img width={"50px"} src={!r.isActive ? stopping : r.allocated ? forkLift : timeLeft} /> },
                title: {
                  render: (_, r) => <a onClick={() => onFetchAllocatedDockDetail(r.id, () => setViewDetail(true))}>{[r.code, ...(r.combinedLoadingDocks || []).map(it => it.code)].join()}</a>
                },
                subTitle: {
                  render: (_, r) => {
                    const statusList = [
                      { key: 'issueDn', label: 'Issue DN', icon: <ClockCircleOutlined spin />, visible: !r.canPick && r.status == 'PENDING', color: 'processing' },
                      { key: 'issueDn', label: 'DN Issued', icon: <CheckCircleOutlined />, visible: r.canPick && r.status == 'PENDING', color: 'success' },
                      { key: 'hold', label: 'Hold', icon: <PauseCircleOutlined />, color: 'warning', visible: !!r.holdBy },
                      { key: 'pickingSlip', label: 'Picking Slip', icon: <ClockCircleOutlined spin />, visible: r.status == 'PENDING', color: 'processing' },
                      { key: 'pickingSlip', label: 'Picking Slip', icon: <CheckCircleOutlined />, visible: r.status != 'PENDING' && r.allocated, color: 'success' },
                      { key: 'loading', label: 'Loading', icon: <ClockCircleOutlined spin />, visible: r.status == 'LOADING', color: 'processing' },
                      { key: 'loaded', label: 'Loaded', icon: <CheckCircleOutlined />, visible: r.status == 'LOADED', color: 'success' },
                      { key: 'changeRequest', alert: true, label: 'Change Request', icon: <ClockCircleOutlined spin />, visible: r.loadedChangeRequest, color: 'processing' },
                    ]
                    return (<Space>
                      {r.ticketNum && `#${r.ticketNum}`}
                      {!r.autoAssigned && <Tag icon={<UserOutlined />}>Manual Assign</Tag>}
                      {statusList.filter(it => it.visible).map(it => (<Tag key={it.key} className={it.alert && styles.blinking} color={it.color} icon={it.icon}>
                        {it.label}
                      </Tag>))}
                    </Space>)
                  }
                },
                actions: {
                  render: (_, r) => {
                    if (r.holdBy && r.status == "PENDING" && r.canPick && !loadingDockList?.some(it => it.isOwner && it.status === 'PENDING')) {
                      return <Button onClick={() => {
                        getActions?.('LIST', r).find(it => it.key == 'claim')?.onClick?.(r?.id)
                      }}>Unhold</Button>
                    }

                    if (r.status == 'PENDING') return
                    const mainAction = (vc.view.getActions?.('LIST', r) || []).filter(it => it.visible && it.main).find(it => it)
                    return <DropdownButton onClick={() => {
                      if (!mainAction) {
                        message.warning(`Blocked by ${r.claimedBy}`)
                      }
                      mainAction?.onClick?.(r.id)
                    }} key={r.id}
                      menu={{
                        items: (vc.view.getActions?.('LIST', r) || []).filter(it => it.visible && it.key != mainAction?.key).map((it, index) => (it.seperator ? { type: 'divider', key: `dv-${index}` } : {
                          icon: it.icon, key: it.key, label: it.label, onClick: () => it.onClick?.(r.id),
                          danger: it.type == 'Danger'
                        }))
                      }} >
                      {mainAction?.icon}
                      {(vc.view.getActions?.('LIST', r) || []).filter(it => it.visible && it.main)?.map(it => it.label).find(it => it) || <ClockCircleOutlined spin />}
                    </DropdownButton>
                  }
                },
                description: {
                  render: (_, r) => (
                    <ProDescriptions size='small' column={4} style={{ width: 'calc(100vh - 5px)' }}>
                      <ProDescriptions.Item label="License Plate #"> {r.truckNo || 'N/A'}</ProDescriptions.Item>
                      <ProDescriptions.Item label="Driver Name"> {r.driver || 'N/A'}</ProDescriptions.Item>
                      {r.loadingStartedDate && !r?.loadingEndedDate && <ProDescriptions.Item label="Waiting Time"> {moment(r.loadingStartedDate).toNow()}</ProDescriptions.Item>}
                      {r.loadingEndedDate && r.status == 'LOADED' && <ProDescriptions.Item label="Loading Time"> {durationFormat(moment(r.loadingStartedDate), moment(r.loadingEndedDate))}</ProDescriptions.Item>}
                      {r.ownedTruckLoading && <ProDescriptions.Item label="Owned Truck Loading"> <Checkbox checked={r.ownedTruckLoading} /> </ProDescriptions.Item>}
                      {r.claimedBy && <ProDescriptions.Item label="Claimed By"> {r.claimedBy}</ProDescriptions.Item>}

                    </ProDescriptions>
                  )
                }
              }}
            />
          </ProCard>
        </ProCard>
      </Spin>
      <Detail
        title={
          <Space>
            <>{selectedItem?.name}</>
            <Tag color={'cyan'}>{selectedItem?.autoAssigned ? 'Auto' : 'Manual'}</Tag>
          </Space>
        }
        {...vc}
        open={viewDetail}
        width={1000}
        onClose={() => setViewDetail(false)}
      />

      {
        modal.type === 'REMARKS' && <Remarks open={true}
          onOpenChange={onCloseModalHandler}
          required={modal.required}
          onSave={modal.cb} />
      }

      {modal.type === 'START' && (
        <StartLoadingModal
          onOpenChange={onCloseModalHandler}
          open={modal.type === 'START'}
          ownedTruckLoading={modal.ownedTruckLoading}
          loaded={modal.payload}
          onSave={data => onLoadingStartedhandler(data, modal?.callback)}
        />
      )}

      {modal.type === 'DONE' && (
        <FinishLoadingModal
          onOpenChange={onCloseModalHandler}
          open={modal.type === 'DONE'}
          loaded={modal.payload}
          onSave={data => onCompletedhandler(data, modal.callback)}
        />
      )}

      {modal.type === 'LOADING_CAPACITY' && (
        <LoadingCapacitySelect
          open={modal.type === 'LOADING_CAPACITY'}
          loadingDockIds={selectedItem?.loadingCapacities?.map((it) => it.id) || []}
          loadingCapacities={loadingCapacities}
          onSave={onSaveLoadingCapacityHandler}
          onOpenChange={onCloseModalHandler}
        />
      )}

      {modal.type === 'TRANSFER' && (
        <Transfer
          open={modal.type === 'TRANSFER'}
          availableLoadingDocks={loadingDocks}
          onOpenChange={onCloseModalHandler}
          onSave={() => Promise.resolve()}
        />
      )}

      {instance && modal.type === 'CONFIRM_REQUEST' && <ChangeRequest open={true}
        instance={instance}
        onChangeRequest={(approved, remarks) => {
          if (!instance?.loading.id) return
          onChangeRequestHandler(instance.loading.id, approved, remarks)
        }}
        onOpenChange={onCloseModalHandler} />}

      {modal.type === 'PICKING-SLIP' && <PickingSlip
        requestActions={requestActions}
        itemDetail={instance}
        cb={modal.cb}
        open={true}
        onCancel={onCloseModalHandler}
      />}

      {instance?.id == printing && <PickingSlipToPrint data={instance} ref={componentRef} />}

    </PageContainer>
  );
};
