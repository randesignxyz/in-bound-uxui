import PageWrapper from "@/components/PageWrapper"
import { CustomerAdvanceSearchParams, CustomerItemLess } from "@/services/crm/data"
import { DashOutlined, DownloadOutlined, EnvironmentOutlined, ExportOutlined, SwapOutlined, SyncOutlined } from "@ant-design/icons"
import { useAccess, useQuery } from "@umijs/max"
import { CrmServiceAPI } from "@/services/crm/services";
import { Button, Dropdown, Space, Spin, Typography, message } from "antd";
import Status from "@/components/Status";
import { toReadable } from "@/pages/utils";
import { useEffect, useRef, useState } from "react";
import { FetchPagingParams } from "@/components/DataCrud/TableView";
import { model } from "./model";
import AdvanceSearch from "./components/List/AdvanceSearch";
import TransferSE from "./components/List/TransferSE";
import UploadData from "./components/UploadData";
import ExportCustomer from "./components/List/ExportCustomer";
import { ImportDataItem, ImportDataResponse } from "@/services/shared/data";
import ImportFileButton from "@/components/ImportFileButton";
import { ActionType } from "@ant-design/pro-components";
import { CustomerActionController } from ".";
import CustomerDetailView from "./components/Detail";
import { CustomerServices } from "./services";
import { simpleRequestActions } from "@/services/model";
import MapLocationDrawer from "./components/MapLocation";

const crmServices = CrmServiceAPI();
type FilterType = {
    searchValue?: string;
    status?: string;
} & CustomerAdvanceSearchParams

export default ({ getMenuItems }: CustomerActionController) => {

    const access = useAccess();
    const [filter, setFilter] = useState<FetchPagingParams<FilterType>>()
    const [importData, setImportData] = useState<ImportDataResponse>()
    const [loading, setLoading] = useState(false);
    const requestAction = simpleRequestActions();
    const actionRef = useRef<ActionType>();
    const [constenState, setContentState] = useState<string>("COLUMN");

    const { data, refetch, isFetching } = useQuery(['fetch-customer-list', filter], () => crmServices.findAllCustomer({
        searchValue: filter?.criteria?.searchValue,
        advanceSearch: { ...filter?.criteria },
        sort: filter?.sort,
    }, { page: filter?.pagination?.current, pageSize: filter?.pagination?.pageSize }), {
        refetchOnWindowFocus: false,
        enabled: constenState == "COLUMN" ? true : false
    });


    const { state, ops, modals } = model();



    return <Spin spinning={loading}>
        <PageWrapper<CustomerItemLess, FilterType, {}>
            tabRender={item => [
                {
                    action: 'view',
                    tabLabel: item?.code,
                    panel: (_) => <CustomerDetailView openInTab id={item?.id} getMenuItems={getMenuItems} />
                }
            ]}
            listView={{
                type: 'Table',
                title: 'Customer List',
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
                        pagination: { ...page, current: (page?.current || 1) - 1 },
                        sort: sort
                    }))
                },
                onOpenAdvanceSearch: () => { modals.showModal('advanceSearch') },
                onRefresh: refetch,
                props: {
                    dataSource: data?.items,
                    pagination: {
                        total: data?.total,
                    },
                    // actionRef: actionRef,
                    loading: isFetching,
                    tableRender: (_, dom) => {
                        return (constenState === "COLUMN" && dom) || (<MapLocationDrawer
                            onFilter={(val) => {
                                setFilter((p => (
                                    {
                                        criteria: { ...p?.criteria, advanceSearch: { ...val } },
                                        pagination: {
                                            ...p?.pagination,
                                            pageSize: val.rows
                                        }
                                    }
                                )))
                            }}
                            onClose={() => setContentState("COLUMN")} filter={filter} />)
                    },
                    columns: [
                        {
                            title: 'Customer #',
                            sorter: 'customerCode',
                            width: 120,
                            dataIndex:"code",
                            actionProps: (item) => ({
                                type: 'view',
                                label: item.code || '',
                                actionButtons: [
                                    { type: 'link', size: 'small', icon: <ExportOutlined />, onClick: () => window.open(`/external/crm/customer/detail/${item.id}`, '_blank')?.focus() },
                                ]
                            }),
                        },
                        {
                            title: 'Customer Name',
                            sorter: 'customerName',
                            render: (_, r) => <Space>
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
                            render: (_, r) => <Dropdown disabled={access.crmReadOnly} menu={{
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
                    [
                        <Button
                            icon={<EnvironmentOutlined />}
                            type="link"
                            onClick={() => setContentState("MAP")}

                        >Maps</Button>,
                        <ImportFileButton<ImportDataItem>
                            importedKey="INDIRECT_CUSTOMER"
                            onDataResponse={data => {
                                setImportData(data)
                            }}
                            key={'import-customer'}
                            onHandleChange={(status) => {
                                setLoading(status == 'uploading');
                                if (status == 'done') {
                                    message.info('Data uploaded.');
                                }
                            }}
                        />,
                    ] : []
                ,
                actions: access.crmReadOnly ? [] : [
                    {
                        key: 'EXPORT',
                        label: 'Export',
                        icon: <DownloadOutlined />,
                        disabled: true,
                        onClick: () => {
                            access.can("CRM_CUSTOMER", "EXPORT") ? modals.showModal('export-customer') : message.warning("Unauthorize")
                        },
                    },

                    {
                        key: "SYNC",
                        label: "Sync",
                        icon: <SyncOutlined />,
                        onClick: () => {

                            if (access.can("CRM_CUSTOMER", "SYNC")) {
                                try {
                                    CustomerServices.syncExecStoreProcedureCustomer()(requestAction).then(() => {
                                        actionRef.current?.reload?.();
                                        message.success("Success!")
                                    }).catch((err) => {
                                        message.error("Something went wrong!")
                                    });
                                }
                                catch (e) {
                                }
                            }
                            else {
                                message.warning("Unauthorize")
                            }
                        }
                    },

                    { 
                        key: 'TRANSFER', 
                        label: 'Transfer SE', 
                        onClick: () => access.can("CRM_CUSTOMER", "TRANSFER") ?modals.showModal('transfer-customers'): message.warning("Unauthorize"), 
                        icon: <SwapOutlined style={{ fontSize: '16px', color: '#08c' }} /> 
                    },

                ],
            }}
        />

        <AdvanceSearch
            width="500px"
            closable
            title="Advance Customer Search"
            open={modals.isVisible('advanceSearch')}
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
            lookupDataList={state.initData?.lookupDataList || []}
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