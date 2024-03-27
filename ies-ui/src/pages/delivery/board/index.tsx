import RemarkModal from "@/components/remark-modal";
import Remarks from "@/components/remarks";
import { singleRequest } from "@/services/apiGateway";
import { LoadingListItem } from "@/services/delivery/data";
import { DeliveryParams } from "@/services/delivery/delivery-params";
import { InstanceSrvParams } from "@/services/delivery/instance-service-params";
import { InstanceBasic, InstanceDetail } from "@/services/delivery/instance.types";
import { LoadingParams } from "@/services/delivery/loading-params";
import { simpleRequestActions } from "@/services/model";
import { CheckCircleOutlined, CloseCircleOutlined, EyeFilled, FileDoneOutlined, PauseOutlined, StopOutlined, SwapOutlined } from "@ant-design/icons";
import { ActionType, PageContainer } from "@ant-design/pro-components";
import { FloatButton, message, Modal, Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import AssignedDocModal from "./assigned-docs";
import Detail from "./detail";
import ListView from "./list-view";
import { ModalName, UiType, ViewController } from "./view-controller";
import { ActionData } from "@/pages/type";
import { PickingSlipToPrint } from "./picking-print";
import { useReactToPrint } from 'react-to-print';
import styles from './style.less';
import IssueDNModal from "./issue-dn";

const StatusTitle = [
  {
    status: 'LOADING',
    title: 'Loading',
  },
  {
    status: 'DELIVERY',
    title: 'Delivery',
  },
  {
    status: 'QUEUE',
    title: 'Queue',
  },
  {
    status: 'PENDING',
    title: 'Pending',
  },
  {
    status: 'IN_PROGRESS',
    title: 'In-process',
  },
];

export const getStatus = (item?: InstanceBasic) => {
  return {
    claimed: !!item?.claimedBy,
    picking: item?.loading?.status === 'PENDING',
    isLoading: item?.loading?.status === 'LOADING',
    pendingDelivery: item?.delivery?.status === 'PENDING' && !item?.delivery?.assignedDocDate,
    delivering: item?.delivery?.status === 'PENDING' && !!item?.delivery?.assignedDocDate,
  }
}

export default () => {

  const [selectedItem, setSelectedItem] = useState<InstanceDetail>();
  const actionRef = useRef<ActionType>();
  const requestActions = simpleRequestActions()
  const [viewDetail, setViewDetail] = useState(false)
  const [printing, setPrinting] = useState(0)
  const [forceUpdate, setForceupdate] = useState(1)
  const [modal, setModal] = useState<
    { from?: UiType; } & (
      { type: 'DETAIL' } |
      { type: undefined } |
      { type: 'PICKING-SLIP' } |
      { type: 'CANCEL_PICKING'; payload: LoadingListItem } |
      { type: 'CANCEL_DELIVERY'; deliveryId: number } |
      { type: 'REMARKS', required?: boolean, cb: (remarks: string) => void; } |
      { type: 'ASSIGNED_DOC'; }
    )
  >({ type: undefined })

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current as any,
    bodyClass: styles.print
  });

  const loadDetail = async (id: number) => {
    const rs = await singleRequest(InstanceSrvParams.fetch(id))(requestActions) as InstanceDetail;
    setSelectedItem(rs);
    return rs
  }

  const onRefreshDatahHandler = async (id?: number) => {
    await actionRef.current?.reloadAndRest?.()
    await loadDetail(id || selectedItem?.id || 0)
    setForceupdate(v => v + 1)
  }

  const onOpenModalHandler = async (from: UiType, modalName: ModalName, id?: number, isLoadDetail?: boolean) => {
    const item = isLoadDetail ? await loadDetail(id || selectedItem?.id || 0) : selectedItem
    if (modalName === 'assign-doc' && item) {
      setModal({
        type: 'ASSIGNED_DOC', from: from
      })
    } else if (modalName === 'detail' && item) {
      setViewDetail(true)
    } else if (modalName === 'picking-slip') {
      setModal({ type: 'PICKING-SLIP', from: from })
    }

  }
  const onCloseModalHandler = (visible?: boolean) => {
    if (visible) return
    setModal({ type: undefined })
    !viewDetail && setSelectedItem(undefined)
  }

  const onCancelDeliveryHandler = (id: number, remarks: string, cb?: () => void) => {

    try {
      Modal.confirm({
        title: 'Cancel Delivery',
        content: 'Are you sure?',
        onOk: async () => {
          try {
            await singleRequest(DeliveryParams.cancelDelivery(id, remarks))(requestActions);
            onCloseModalHandler()
            message.success('Canceling is successfully.');
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


  const onCancelChangeRequestHandler = async (loadingId: number, remarks: string, cb?: () => void) => {
    Modal.confirm({
      title: 'Cancel Change Request',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await DeliveryParams.cancelChangeLoading(loadingId, remarks)(requestActions)
          onCloseModalHandler()
          message.success('Cancel is successfully.');
          cb?.()
        } catch (error: any) {
          message.error(error.message || `Failed to cancel`);
        }
      },
    });
  }

  const onHoldHandler = async (instanceId: number, remarks: string, cb?: () => void) => {
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


  const getActionData = (from: UiType, item?: InstanceBasic): ActionData[] => {
    const selected = item || selectedItem
    const basic: ActionData[] = [
      { key: 'view', label: "View", icon: <EyeFilled />, onClick: (id) => onOpenModalHandler(from, 'detail', id, true), visible: true }
    ]

    if (!selected) {
      message.error("Item not identified.")
      return [...basic]
    }

    const statuses = getStatus(item)

    const claimed = statuses.claimed
    const picking = statuses.picking && claimed && !item?.changeRequest
    const pendingDelivery = statuses.pendingDelivery && claimed && !item?.changeRequest
    const delivering = statuses.delivering && claimed && !item?.changeRequest


    return [...basic,
    {
      key: 'claimed', label: "Claim", main: true, icon: <CheckCircleOutlined />, type: 'Primary', onClick: (id) => {
        onClaimHandler(item?.id, async () => {
          if (from == 'DETAIL') {
            await loadDetail(selected.id)
          }
          actionRef.current?.reloadAndRest?.()
        })
      }, visible: !claimed && (statuses.delivering || item?.changeRequest || item?.delivery?.status == 'DELIVERED')
    },
    // { key: 'issueDN', label: 'Issue DN', type: 'Primary', visible: picking, main: claimed, icon: <FileDoneOutlined />, onClick: issueDNHandler },
    { key: 'issueDN', label: 'Issue DN', type: 'Primary', visible: picking, main: claimed, icon: <FileDoneOutlined />, onClick: () => onOpenModalHandler(from, 'picking-slip', item?.id, true) },

    { key: 'assignDoc', label: 'Assign Doc', type: 'Primary', visible: pendingDelivery, main: claimed, icon: <FileDoneOutlined />, onClick: () => onOpenModalHandler(from, 'assign-doc', item?.id, true) },
    { key: 'reassignDoc', label: 'Reassign Doc', visible: delivering, icon: <SwapOutlined />, onClick: async () => await onOpenModalHandler(from, 'assign-doc', item?.id, true) },

    {
      key: 'cancelChangeRequest', label: 'Cancel Change Request', type: 'Danger', icon: <StopOutlined />, visible: item?.claimedBy !== null && item?.changeRequest, onClick: () => {
        setModal({
          type: 'REMARKS', required: true, from: from, cb: (remarks) => {
            onCancelChangeRequestHandler(selected.loading.id, remarks, () => {
              if (from === 'DETAIL') {
                onRefreshDatahHandler(selected.id)
              }
              // actionRef.current?.reloadAndRest?.()
            })
          }
        })
      }
    },
    {
      key: 'hold', label: 'Hold', visible: claimed && !item?.changeRequest && item?.delivery?.status != 'DELIVERED', main: false, icon: <PauseOutlined />, onClick: () => {
        setModal({
          type: 'REMARKS', required: true, from: from, cb: (remarks) => {
            onHoldHandler(selected.id, remarks, () => {
              if (from === 'DETAIL') {
                onRefreshDatahHandler(selected.id)
              }
              actionRef.current?.reloadAndRest?.()
            })
          }
        })
      }
    },
    {
      key: 'released', label: "Release", main: true, icon: <StopOutlined />, onClick: () => {
        onReleaseHandler(item?.id, async () => {
          if (from == 'DETAIL') {
            await loadDetail(selected.id)
          }
          actionRef.current?.reloadAndRest?.()
        })
      }, visible: claimed
    },
    {
      key: 'cancel', label: "Cancel Loading", type: 'Danger', visible: picking, main: false, icon: <CloseCircleOutlined />, onClick: () => {
        setModal({
          type: 'REMARKS', required: true, from: from, cb: (remarks) => {
            item?.loading.id && onCancelHandler(item?.loading.id, remarks, async () => {
              if (from === 'DETAIL') {
                await loadDetail(selected.id)
              }
              // actionRef.current?.reloadAndRest?.()
            })
          }
        })
      }
    },
    {
      key: 'cancelDelivery', label: 'Cancel Delivery', visible: delivering || pendingDelivery, type: 'Danger', main: claimed, icon: <StopOutlined />, onClick: () => {
        setModal({ type: 'CANCEL_DELIVERY', from: 'LIST', deliveryId: item?.delivery.id || 0 })
      }
    },
    ]
  }

  const vc: ViewController = {
    requestActions: requestActions,
    actions: {
      onOpenModal: onOpenModalHandler,
      onCloseModal: onCloseModalHandler,
      onRefreshDetailData: onRefreshDatahHandler,
      onRefreshLisViewData: () => actionRef.current?.reloadAndRest?.(),
      onClaim: async (id, cb) => {
        const id1 = id || selectedItem?.id
        if (!id1) {
          message.error("Item cannot be identified.")
          return
        }
        Modal.confirm({
          title: 'Claim Task',
          content: 'Are you sure?',
          onOk: async () => {
            try {
              await singleRequest(InstanceSrvParams.claim(id1))(requestActions);
              cb?.()
            } catch (error: any) {
              message.error(error.message || `Failed to claim`);
            }
          },
        });
      },

      onRelease: async (id, cb) => {
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

    },
    data: {
      itemDetail: selectedItem
    },
    view: {
      loading: requestActions.request?.loading,
      actionRef: actionRef,
      getActions: getActionData
    }
  }

  useEffect(() => {
    if (selectedItem?.id == printing) {
      handlePrint()
      setPrinting(0)
    }


  }, [selectedItem, printing])

  return <PageContainer breadcrumb={undefined}
    title={'Delivery Board'}

    onBack={() => history.back()}>

    {/* List view */}
    <ListView {...vc} />

    {/* Detail View */}
    <Detail
      width={1000}
      forceRefresh={forceUpdate}
      title={`${selectedItem?.activity} (${StatusTitle.find((it) => it.status === selectedItem?.status)?.title ||
        selectedItem?.status
        })`}
      open={viewDetail}

      onClose={() => setViewDetail(false)}
      {...vc}
    />

    {modal.type === 'PICKING-SLIP' && <IssueDNModal
      requestActions={requestActions}
      itemDetail={vc.data.itemDetail}
      cb={() => {
        if (modal.from === 'DETAIL') {
          onRefreshDatahHandler()
        }
        actionRef.current?.reloadAndRest?.()
      }}
      open={true}
      onCancel={onCloseModalHandler}
    />}

    {
      modal.type === 'REMARKS' && <Remarks open={true}
        onOpenChange={onCloseModalHandler}
        required={modal.required}
        onSave={modal.cb} />
    }

    {modal.type === 'CANCEL_DELIVERY' && (
      <RemarkModal
        title="Cancel Delivery"
        open={modal.type === 'CANCEL_DELIVERY'}
        onCancel={async (refresh) => {
          vc.actions.onCloseModal()
        }}
        id={modal.deliveryId}
        onSave={(id, remarks) => onCancelDeliveryHandler(id, remarks)}
      />
    )}

    {modal?.type === 'ASSIGNED_DOC' && <AssignedDocModal
      {...vc}
      from={modal.from}
      open={modal?.type === 'ASSIGNED_DOC'}
      onOpenChange={onCloseModalHandler}
      width={1000}
    />}
    <FloatButton.BackTop />

    {selectedItem?.id == printing && <PickingSlipToPrint data={selectedItem} ref={componentRef} />}
  </PageContainer>
}

