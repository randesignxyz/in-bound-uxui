import PageWrapper from "@/components/PageWrapper"
import { BasicData, CustomerItemBase, CustomerItemLess } from "@/services/crm/data"
import { CloseCircleOutlined, DashOutlined, EditOutlined, HistoryOutlined, PaperClipOutlined, PlayCircleOutlined, ScheduleOutlined, SwapOutlined, UpOutlined, UploadOutlined } from "@ant-design/icons"
import { useAccess, useParams, useQuery, useQueryClient } from "@umijs/max"
import { CrmServiceAPI } from "@/services/crm/services";
import { Dropdown, Modal, Space, Typography, message } from "antd";
import Status from "@/components/Status";
import { toReadable } from "@/pages/utils";
import { useState } from "react";
import { FetchPagingParams } from "@/components/DataCrud/TableView";
import CustomerDetailView from "./components/Detail";
import { ItemType } from "rc-menu/lib/interface";
import { model } from "./model";
import { simpleRequestActions } from "@/services/model";
import { CustomerServices } from "./services";
import BasicEntryModal from "./components/basic/BasicEntryModal";
import Transfer from "./components/Detail/Transfer";
import UpgradeCustomer from "./components/basic/UpgradeCustomer";
import Remarks from "@/components/remarks";
import CustomerCodeTracking from "./components/basic/CustomerCodeTracking";
import VisitSchduleGeneratedModal from "./components/VisitSchduleGeneratedModal";
import { AttachmentModal } from "@/components/Attachment/AttachmentModal";
import { ViewType } from "@/components/DataCrud/CrudWrapper";

const crmServices = CrmServiceAPI();

type FilterType = {
    searchValue?: string;
    status?: string;
}

export type CustomerActionController = {
    getMenuItems: (item: CustomerItemBase, type: 'List' | 'Detail', cb?: () => void) => (ItemType & { display?: boolean })[]
}




export default () => {
    const params = useParams()
    const view: ViewType = (params['view'] as ViewType) || undefined
    const id = params['*']

    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<FetchPagingParams<FilterType>>()

    const { data, refetch, isFetching } = useQuery(['fetch-customer-list', filter], () => crmServices.findAllCustomer({
        searchValue: filter?.criteria?.searchValue,
        advanceSearch: { status: filter?.criteria?.status },
        sort: filter?.sort,
    }, { page: filter?.pagination?.current, pageSize: filter?.pagination?.pageSize }), {
        refetchOnWindowFocus: false
    });

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
    }>()


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

    const getMenuItems = (item: CustomerItemBase, type: 'List' | 'Detail', forceReloadCb?: () => void): (ItemType & { display?: boolean, icon?: React.ReactElement })[] => {
        const isDiabled = item?.status == 'Inactive'
        return [
            {
                key: 'editBasicInfo', label: 'Edit Customer', icon: <EditOutlined />, disabled: !(item?.source !== 'SAP') || (!access.canEditCustomerBasicInfo) || isDiabled, onClick: async () => {
                    await initData()
                    await ops.detail(item.id, true)
                    setForceReload({ cb: forceReloadCb })
                    modals.showModal('editBasicInfo')
                }, display: true
            },
            { type: 'divider', display: true },
            {
                key: 'promote-customer', label: 'Promote Customer', disabled: isDiabled || item.type.id != 102 || !item.code?.startsWith("L9"), icon: <UpOutlined />, onClick: async () => {
                    await ops.detail(item.id, true)
                    setForceReload({ cb: forceReloadCb })
                    modals.showModal('promote-customer')
                }, display: true
            },
            {
                key: 'customer_code_tracking', label: "Customer Code tracking", icon: <HistoryOutlined />, onClick: async () => {
                    await ops.detail(item.id, true)
                    setForceReload({ cb: forceReloadCb })
                    modals.showModal('code-tracking')
                }, display: true
            },
            {
                key: 'transfer-customer', label: 'Transfer Salesperson', disabled: !access.canTransferSe || isDiabled || item?.type?.id != 102, icon: <SwapOutlined />, onClick: async () => {
                    await initData()
                    await ops.detail(item.id, true)
                    setForceReload({ cb: forceReloadCb })
                    modals.showModal('transfer-customer')
                }, display: true
            },
            { type: 'divider', display: true },
            {
                key: 'attachments', label: 'Attach Files', icon: <PaperClipOutlined />, display: type == 'Detail', onClick: async () => {
                    await ops.detail(item.id, true)
                    setForceReload({ cb: forceReloadCb })
                    modals.showModal('attachments')
                }
            },
            {
                key: 'visitScheduleGen', label: 'Generate Schedule', disabled: !access.canVisitScheduleGen || isDiabled, icon: <ScheduleOutlined />, display: type == 'Detail', onClick: async () => {
                    await ops.detail(item.id, true)
                    setForceReload({ cb: forceReloadCb })
                    modals.showModal('visitScheduleGen')
                }
            },

            { type: 'divider', display: true },
            {
                key: 'disabled', label: 'Disabled', disabled: item?.type?.id != 102 || !access.canActiveInactiveCustomer, icon: <CloseCircleOutlined />, display: !isDiabled, onClick: async () => {
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
                key: 'activate', label: 'Activate', disabled: item?.type?.id != 102 || !access.canActiveInactiveCustomer, icon: <PlayCircleOutlined />, display: isDiabled, onClick: async () => {
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

    return <>
        {view == 'list' && <PageWrapper<CustomerItemLess, FilterType, { test: string, test1: string }> title="Customer"
            detailViewRender={(item) => <CustomerDetailView openInTab id={item.id} getMenuItems={getMenuItems} />}
            listView={{
                type: 'Table',
                statuses: [
                    { option: { label: 'All', value: 'ALL' }, subOptions: [] },
                    { option: { label: 'Active', value: 'Y' }, subOptions: [] },
                    { option: { label: 'Inactive', value: 'N' }, subOptions: [] }
                ],
                onFilter(filter, page, sort) {
                    setFilter({
                        criteria: { ...filter, status: filter?.status == "ALL" ? undefined : filter?.status },
                        pagination: page,
                        sort: sort
                    })
                    queryClient.invalidateQueries(['fetch-customer-list', filter])

                },
                onRefresh: refetch,
                props: {
                    dataSource: data?.items,
                    pagination: {
                        total: data?.total,
                    },
                    loading: isFetching,
                    // quickView: true,
                    fullView: {
                        onOpen: item => window.open(`/external/crm/customer/detail/${item.id}`, '_blank')?.focus()
                    },
                    primaryCol: {
                        title: 'Customer #'
                    },
                    columns: [
                        {
                            title: 'Customer Name', render: (_, r) => <Space>
                                {<Typography.Text>{r.name}</Typography.Text>}
                                {<Typography.Text type="secondary">{r.internalName}</Typography.Text>}
                            </Space>
                        },
                        { title: 'Type', render: (_, r) => r.type.name },
                        {
                            title: 'Region',
                            dataIndex: 'region',
                        },
                        { title: 'Saleperson', render: (_, r) => r.sale },
                        { title: 'Channel', render: (_, r) => r.channel },
                        { title: 'Outlet Type', render: (_, r) => r.outletType },
                        { title: 'Status', render: (_, r) => <Status text={toReadable(r.status)} value={r.status} /> },
                        {
                            render: (_, r) => <Dropdown menu={{

                                items: getMenuItems(r, 'List', () => refetch).filter(it => it.display)

                            }}>
                                <a onClick={(e) => e.preventDefault()}>
                                    <Space>
                                        <DashOutlined />
                                    </Space>
                                </a>
                            </Dropdown>
                        }
                    ]
                },
                actionNumShown: 2,
                actions: [
                    {
                        key: 'IMPORT', label: 'Import', icon: <UploadOutlined />, onClick: async () => {
                            queryClient.invalidateQueries(['fetch-customer', 'hello'])
                        }
                    },
                    {
                        key: 'EXPORT', label: 'Export', icon: <UploadOutlined />, onClick: () => {
                            const data = queryClient.getQueryData(['fetch-customer', 'hello'])
                            console.log(data)
                        }
                    },
                    { key: 'TRANSFER', label: 'Transfer SE', icon: <SwapOutlined style={{ fontSize: '16px', color: '#08c' }} /> }
                ]
            }}
        />}
        {view == 'detail' && id && <CustomerDetailView id={id as unknown as number} getMenuItems={getMenuItems} actionHandlers={{
            onBack: () => { }
        }} />}
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

    </>
}