import PageWrapper from "@/components/PageWrapper"
import { BasicData, CustomerAdvanceSearchParams, CustomerItemBase, CustomerItemLess } from "@/services/crm/data"
import { CloseCircleOutlined, DashOutlined, DownloadOutlined, EditOutlined, HistoryOutlined, PaperClipOutlined, PlayCircleOutlined, ScheduleOutlined, SwapOutlined, UpOutlined, UploadOutlined } from "@ant-design/icons"
import { useAccess, useParams, useQuery, useQueryClient } from "@umijs/max"
import { CrmServiceAPI } from "@/services/crm/services";
import { Dropdown, Modal, Space, Spin, Typography, message } from "antd";
import Status from "@/components/Status";
import { toReadable } from "@/pages/utils";
import { useRef, useState } from "react";
import { FetchPagingParams } from "@/components/DataCrud/TableView";
import CustomerDetailView from "./components/Detail";
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
import { ActionBarType } from "@/components/ActionBar";
import AdvanceSearch from "./components/List/AdvanceSearch";
import TransferSE from "./components/List/TransferSE";
import UploadData from "./components/UploadData";
import ExportCustomer from "./components/List/ExportCustomer";
import { ImportDataItem, ImportDataResponse } from "@/services/shared/data";
import ImportFileButton from "@/components/ImportFileButton";
import { ActionType } from "@ant-design/pro-components";
const crmServices = CrmServiceAPI();
type FilterType = {
    searchValue?: string;
    status?: string;
} & CustomerAdvanceSearchParams

export type CustomerActionController = {
    getMenuItems: (item: CustomerItemBase, type: 'List' | 'Detail', cb?: () => void) => ActionBarType[]
}

export default () => {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<FetchPagingParams<FilterType>>()
    const [importData, setImportData] = useState<ImportDataResponse>()
    const [loading, setLoading] = useState(false);

    const actionRef = useRef<ActionType>();

    const { data, refetch, isFetching } = useQuery(['fetch-customer-list', filter], () => crmServices.findAllCustomer({
        searchValue: filter?.criteria?.searchValue,
        advanceSearch: { ...filter?.criteria },
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

    return <Spin spinning={loading}>
        <PageWrapper<CustomerItemLess, FilterType, {}> title="Customer"
            detailViewRender={(id, target) => <CustomerDetailView openInTab={target == 'page-tab' ? true : undefined} id={id} getMenuItems={getMenuItems} />}
            listView={{
                type: 'Table',
                statuses: [
                    { option: { label: 'All', value: 'ALL' }, subOptions: [] },
                    { option: { label: 'Active', value: 'Y' }, subOptions: [] },
                    { option: { label: 'Inactive', value: 'N' }, subOptions: [] }
                ],
                onFilter(filterParams, page, sort) {
                    setFilter(v => ({
                        ...v,
                        criteria: {
                            ...v?.criteria,
                            searchValue: filterParams?.searchValue,
                            status: filterParams?.status == "ALL" ? undefined : filterParams?.status
                        },
                        pagination: page,
                        sort: sort
                    }))
                    queryClient.invalidateQueries(['fetch-customer-list', filter])

                },
                onOpenAdvanceSearch: () => { modals.showModal('advanceSearch') },
                onRefresh: refetch,
                props: {
                    dataSource: data?.items,
                    pagination: {
                        total: data?.total,
                    },
                    actionRef: actionRef,
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

                                items: getMenuItems(r, 'List', () => refetch).filter(it => it.visible)

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
                actionButtons: access.crmAdmin ?
                    [<ImportFileButton<ImportDataItem>
                        importedKey="INDIRECT_CUSTOMER"
                        onDataResponse={data => {
                            setImportData(data)
                        }}
                        onHandleChange={(status) => {
                            setLoading(status == 'uploading');
                            if (status == 'done') {
                                message.info('Data uploaded.');
                            }
                        }}
                    />] : []
                ,
                actions: [
                    {
                        key: 'EXPORT', label: 'Export', icon: <DownloadOutlined />, onClick: () => {
                            modals.showModal('export-customer')
                        }
                    },
                    { key: 'TRANSFER', label: 'Transfer SE', onClick: () => modals.showModal('transfer-customers'), icon: <SwapOutlined style={{ fontSize: '16px', color: '#08c' }} /> }
                ]
            }}
        />
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

        <AdvanceSearch
            width="500px"
            // placement="right"
            closable
            title="Advance Customer Search"
            open={modals.isVisible('advanceSearch')}
            // initData={advanceSearchParams}
            lookupDataList={state.initData?.lookupDataList}
            seList={state.initData?.seList}
            outletTypeList={state.initData?.outletTypeList}
            onClose={() => {
                modals.hideModal('advanceSearch');
            }}
            onReset={() => {
                setFilter(v => ({
                    ...v, criteria: {
                        ...v?.criteria,
                        customerTypeId: undefined,
                        divisionId: undefined,
                        outletTypeId: undefined,
                        source: undefined,
                        salespersonId: undefined
                    }
                }))

            }}
            onSearch={(data) => {
                setFilter(v => ({ ...v, criteria: { ...v?.criteria, ...data } }))
                actionRef.current?.reload?.(true);
            }}
        />
        <ExportCustomer
            title="Export Customer"
            open={modals.isVisible('export-customer')}
            onCancel={() => modals.hideModal('export-customer')}
            confirmLoading={state.loading}
            lookupDataList={[]}
            outletTypeList={state.initData?.outletTypeList || []}
            seList={state.initData?.seList || []}
            provinceList={state.initData?.provinceList || []}
            regionList={state.initData?.regionList || []}
            onExport={async (
                regionId,
                provinceId,
                salespersonId,
                customerTypeId,
                outletTypeId,
                source,
                status,
                neverVisit,
                neverVisitDate,
                hasNoPlan,
            ) => {
                try {
                    await ops.exportCustomer(
                        regionId,
                        provinceId,
                        salespersonId,
                        customerTypeId,
                        outletTypeId,
                        source,
                        status,
                        neverVisit,
                        neverVisitDate,
                        hasNoPlan,
                    );
                    message.success('Export successfully.');
                } catch (error: any) {
                    message.error(error.message || 'Failed to export.');
                }
            }}
        />


        {modals.isVisible('transfer-customers') && <TransferSE
            open={true}
            onOpenChange={(visible) => !visible && modals.hideModal('transfer-customers')} />}

        <UploadData title="Import indirect customer" onCancel={() => setImportData(undefined)} open={!!importData} data={importData} />

    </Spin>
}