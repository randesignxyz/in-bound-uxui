import { AttachmentModal } from "@/components/Attachment/AttachmentModal"
import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import Remarks from "@/components/remarks"
import { BasicData, CustomerItemBase } from "@/services/crm/data"
import { simpleRequestActions } from "@/services/model"
import {
    CloseCircleOutlined, EditOutlined,
    HistoryOutlined, PaperClipOutlined,
    PlayCircleOutlined, ScheduleOutlined,
    SwapOutlined, UpOutlined
} from "@ant-design/icons"
import { useAccess } from "@umijs/max"
import { message, Modal, Spin } from "antd"
import { useState } from "react"
import { CrmPaths } from ".."
import BasicEntryModal from "./components/basic/BasicEntryModal"
import CustomerCodeTracking from "./components/basic/CustomerCodeTracking"
import UpgradeCustomer from "./components/basic/UpgradeCustomer"
import CreateCustomer from "./components/Create"
import CustomerDetailView from "./components/Detail"
import Transfer from "./components/Detail/Transfer"
import VisitSchduleGeneratedModal from "./components/VisitSchduleGeneratedModal"
import { model } from "./model"
import { CustomerServices } from "./services"
import React from "react"
import MainPage from "./MainPage"
import { ActionBarType } from "@/components/ActionBar"

export type CustomerActionController = {
    getMenuItems: (item: CustomerItemBase, type: 'List' | 'Detail', cb?: () => void) => ActionBarType[]
}

export default () => {
    const { state, ops, actions, modals } = model();
    const access = useAccess();
    const [forceReload, setForceReload] = useState<{ cb?: () => void }>()
    const requestAction = simpleRequestActions()
    const initData = async () => {
        if (!state.initData) {
            await ops.initData('Detail')
        }
    }
    const [modal, setModal] = useState<{
        type: 'remarks';
        required: boolean;
        cb: (remakrs: string) => void;
    }>();
    const onCloseModalHandler = (visible?: boolean) => {
        if (!visible) setModal(undefined)
    }
    const onSaveBasicHandler = (data: BasicData) => {
        Modal.confirm({
            title: 'Edit Customer Information',
            content: 'Are you sure?',
            onOk: async () => {
                try {
                    await actions.saveData(data);
                    modals.hideModal('editBasicInfo');
                    forceReload?.cb?.()
                } catch (error: any) {
                    message.error(error?.message || 'Failed to save.')
                }
            },
        });
    };

    const onTransferHandler = (salespersonId: number, remarks?: string) => {
        if (salespersonId == state.data?.detail?.sale?.id) {
            message.error('Please select different salesperson.');
        }
        Modal.confirm({
            title: 'Transfer Customer',
            content: 'Are you sure?',
            onOk: async () => {
                if (salespersonId == state.data?.detail?.saleInfo?.id) {
                    message.error('Please select different salesperson.');
                }
                try {
                    state.data?.detail?.id &&
                        (await ops.transfer(state.data?.detail?.id, salespersonId, remarks));
                    forceReload?.cb?.()
                    modals.hideModal('transfer-customer');
                    message.success('Transfer successfully.');
                } catch (error: any) {
                    message.error(error.message || 'Failed to transfer.');
                }
            },
        });
    }

    const onUpdateCustomerCodeHisHandler = (customerId: number, l9?: string, l0?: string, m0?: string, c0?: string, remarks?: string) => {
        Modal.confirm({
            title: "Upldate customer code tracking",
            content: "Are you sure?",
            onOk: async () => {
                try {
                    await CustomerServices.updateCustomerCodeHis(customerId, l9, l0, m0, c0, remarks)(requestAction)
                    forceReload?.cb?.()
                    modals.hideModal('code-tracking')
                } catch (error) {

                }
            }
        })
    }

    const getMenuItems = (item: CustomerItemBase, type: 'List' | 'Detail', forceReloadCb?: () => void): ActionBarType[] => {
        const isDiabled = item?.status == 'Inactive'
        return [
            {
                key: 'editBasicInfo', label: 'Edit Customer', icon: <EditOutlined />, disabled: !(item?.source !== 'SAP') || (!access.canEditCustomerBasicInfo) || isDiabled, onClick: async () => {
                    await initData()
                    await ops.detail(item.id, true)
                    setForceReload({ cb: forceReloadCb })
                    modals.showModal('editBasicInfo')
                }, visible: true
            },
            { type: 'divider', visible: true },
            {
                key: 'promote-customer', label: 'Promote Customer', disabled: isDiabled || item.type.id != 102 || !item.code?.startsWith("L9"), icon: <UpOutlined />, onClick: async () => {
                    await ops.detail(item.id, true)
                    setForceReload({ cb: forceReloadCb })
                    modals.showModal('promote-customer')
                }, visible: true
            },
            {
                key: 'customer_code_tracking', label: "Customer Code tracking", icon: <HistoryOutlined />, onClick: async () => {
                    await ops.detail(item.id, true)
                    setForceReload({ cb: forceReloadCb })
                    modals.showModal('code-tracking')
                }, visible: true
            },
            {
                key: 'transfer-customer', label: 'Transfer Salesperson', disabled: !access.canTransferSe || isDiabled || item?.type?.id != 102, icon: <SwapOutlined />, onClick: async () => {
                    await initData()
                    await ops.detail(item.id, true)
                    setForceReload({ cb: forceReloadCb })
                    modals.showModal('transfer-customer')
                }, visible: true
            },
            { type: 'divider', visible: true },
            {
                key: 'attachments', label: 'Attach Files', icon: <PaperClipOutlined />, visible: type == 'Detail', onClick: async () => {
                    await ops.detail(item.id, true)
                    setForceReload({ cb: forceReloadCb })
                    modals.showModal('attachments')
                }
            },
            {
                key: 'visitScheduleGen', label: 'Generate Schedule', disabled: !access.canVisitScheduleGen || isDiabled, icon: <ScheduleOutlined />, visible: type == 'Detail', onClick: async () => {
                    await ops.detail(item.id, true)
                    setForceReload({ cb: forceReloadCb })
                    modals.showModal('visitScheduleGen')
                }
            },

            { type: 'divider' },

            {
                key: 'disabled', label: 'Disabled', disabled: item?.type?.id != 102 || !access.canActiveInactiveCustomer, icon: <CloseCircleOutlined />, visible: !isDiabled, onClick: async () => {
                    setForceReload({ cb: forceReloadCb })
                    setModal({
                        type: 'remarks', required: true, cb: remarks => {
                            Modal.confirm({
                                title: 'Disable Customer',
                                content: 'Are you sure?',
                                onOk: async () => {
                                    try {
                                        await ops.disableCustomer(item.id, remarks);
                                        forceReload?.cb?.()
                                        message.success('Customer is inactive');
                                        onCloseModalHandler()
                                    } catch (error: any) {
                                        message.error(error.message || 'Failed to disble customer.');
                                    }
                                },
                            });
                        }
                    })
                }
            },
            {
                key: 'activate', label: 'Activate', disabled: item?.type?.id != 102 || !access.canActiveInactiveCustomer, icon: <PlayCircleOutlined />, visible: isDiabled, onClick: async () => {
                    setForceReload({ cb: forceReloadCb })
                    setModal({
                        type: 'remarks', required: true, cb: remarks => {
                            Modal.confirm({
                                title: 'Activate Customer',
                                content: 'Are you sure?',
                                onOk: async () => {
                                    try {
                                        await ops.activateCustomer(item.id, remarks);
                                        message.success('Customer is activated');
                                        forceReload?.cb?.()
                                        onCloseModalHandler()
                                    } catch (error: any) {
                                        message.error(error.message || 'Failed to activate customer.');
                                    }
                                },
                            });
                        }
                    })
                }
            },
        ]
    }

    const actl: CustomerActionController = {
        getMenuItems: getMenuItems
    }

    return <Spin spinning={state.loading || false}>
        <CrudWrapper baseURL={CrmPaths.customer} disablePageContainer >

            {(view, id, navigate) => {

                switch (view) {
                    case 'list':
                        return <MainPage getMenuItems={getMenuItems} />
                    // return <CustomerListView actl={actl} actionHandlers={{
                    //     onAdd: navigate?.goToCreate,
                    //     onDetail: navigate?.goToDetail
                    // }} />
                    case 'create':
                        return <CreateCustomer />
                    case 'detail':
                        return <CustomerDetailView id={id as number} getMenuItems={actl.getMenuItems} actionHandlers={{
                            onBack: navigate?.gotToListHandler
                        }} />
                    default:
                        throw Error('Not supported')
                }
            }}
        </CrudWrapper>
        <BasicEntryModal
            layoutConfig={{
                supplySource:
                    state.data?.detail?.type?.id == 102 &&
                    !!state.data.detail.addressList.find((it) => it.province?.id !== 12),
            }}
            editData={state.data?.detail && {
                id: state.data.detail.id,
                internalName: state.data.detail.internalName,
                divisionId: state.data.detail.division?.id,
                name: state.data.detail.name || '',
                outletTypeId: state.data.detail.outletType?.id,
                saleId: state.data.detail.sale?.id,
                typeId: state.data.detail.type?.id,
                ownerName: state.data.detail?.ownerName,
                supplySourceId: state.data.detail.supplySource?.id,
                description: state.data.detail.description,
            }}
            init={{
                outletTypeList: state.initData?.outletTypeList,
                seList: state.initData?.seList,
                lookupDataList: state.initData?.lookupDataList,
                supplySourceList: state.initData?.supplySources,
            }}
            actionHandlers={{
                onSave: onSaveBasicHandler,
            }}
            open={modals.isVisible('editBasicInfo')}
            onCancel={() => modals.hideModal('editBasicInfo')}
        />
        <Transfer
            seList={
                state.initData?.seList?.filter((it) => it.id !== state.data?.detail?.sale?.id) || []
            }
            open={modals.isVisible('transfer-customer')}
            currentSe={[state.data?.detail?.code, state.data?.detail?.sale?.name].join("-")}
            onCancel={() => modals.hideModal('transfer-customer')}
            onTransfer={onTransferHandler}
        />
        {state.data?.detail && <UpgradeCustomer
            customerId={state.data.detail.id}
            currCustNo={state.data.detail.code || ''}
            open={modals.isVisible('promote-customer')}
            onCancel={() => modals.hideModal('promote-customer')}
            onSave={(customerId, newCode, remakrs) => {
                Modal.confirm({
                    title: "Promote Customer",
                    content: "Are you sure?",
                    onOk: async () => {
                        try {
                            await ops.promoteCustomer(customerId, newCode, remakrs)
                            modals.hideModal('promote-customer')
                            forceReload?.cb?.()
                        } catch (error: any) {
                            message.error(error?.message || 'Failed to process')
                        }
                    }
                })
            }} />}
        {
            modal?.type === 'remarks' && <Remarks open={true}
                onOpenChange={onCloseModalHandler}
                required={modal.required}
                onSave={modal.cb} />
        }
        {state.data?.detail && <CustomerCodeTracking
            data={state.data?.detail}
            open={modals.isVisible('code-tracking')}
            onUpdate={onUpdateCustomerCodeHisHandler}
            onOpenChange={visible => !visible && modals.hideModal('code-tracking')}
        />}
        <VisitSchduleGeneratedModal
            open={modals.isVisible('visitScheduleGen')}
            onCancel={() => modals.hideModal('visitScheduleGen')}
            actionHandlers={{
                onSubmit: (month, effectiveDate, overwritePending, description) => {
                    Modal.confirm({
                        title: 'Visit Schedule Generation',
                        content: 'Are you sure?',
                        okText: 'Generate',
                        onOk: async () => {
                            const rs = await ops.genVisitSchedule(
                                month,
                                state.data?.detail?.id || 0,
                                effectiveDate,
                                overwritePending,
                                description,
                            );
                            if (rs.data == 0) {
                                message.warning('No schedule has been generated');
                            } else {
                                message.success(`${rs.data} shedules have been generated.`);
                                actions.listVisitScheduleByCustomer(state.data?.detail?.id || 0, 'PENDING');
                            }
                        },
                    });
                },
            }}
        />
        <AttachmentModal
            open={modals.isVisible('attachments')}
            onCancel={() => modals.hideModal('attachments')}
            actionHandlers={{
                onSaveAll: async (files) => {
                    if (state.data?.detail?.id) {
                        await actions.attachFiles(files, state.data?.detail?.id);
                    }
                    modals.hideModal('attachments');
                },
            }}
        />
    </Spin>
}