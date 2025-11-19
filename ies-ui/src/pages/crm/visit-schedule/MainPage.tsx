import { Badge, Button, Modal, Space, Spin, Tag, Tooltip, Typography, message } from "antd"
import PageWrapper from "@/components/PageWrapper"
import { VisitScheduleAdvanceSearchParams, VisitScheduleItem } from "@/services/crm/data"
import { useEffect, useRef, useState } from "react"
import { FetchPagingParams } from "@/components/DataCrud/TableView"
import { Model } from "./model"
import { useAccess, useQuery } from "@umijs/max"
import { ContractServices } from "../contract/services"
import { MultiRequest, fetchDataListService } from "@/services/apiGateway"
import { LookupData } from "@/services/data"
import { formatDate, formatDateTime, toReadable } from "@/pages/utils"
import { CrmServiceAPI } from "@/services/crm/services"
import {
    CheckCircleOutlined, CheckOutlined, CloseSquareOutlined, EnvironmentOutlined, ExportOutlined,
    EyeOutlined, PaperClipOutlined,
    ScheduleOutlined

} from "@ant-design/icons"
import CustomerDetailView from "../customer/components/Detail"
import VisitScheduleDetailView from "./components/Detail"
import AdvanceSearch from "./components/List/AdvanceSearch"
import QuickView from "./components/quick-view"
import GenerateScheduleModal from "./components/GenerateScheduleModal"
import Status from "@/components/Status"
import { ActionType, LightFilter, ProCard, ProFormDatePicker, ProFormSelect, ProFormSwitch } from "@ant-design/pro-components"
import { Moment } from "moment"
import { history } from "@umijs/max";
import { CrmPaths } from ".."
import CancelModalForm from "./components/CancelModalForm"

type FilterType = VisitScheduleAdvanceSearchParams & { searchValue?: string; status?: string; }
export default () => {
    const access = useAccess()
    const { state, actions, modals } = Model();
    const crmServices = CrmServiceAPI()
    const [filter, setFilter] = useState<FetchPagingParams<VisitScheduleAdvanceSearchParams>>({
        criteria: {
            status: 'COMPLETED',
        }
    })

    interface LightFilterProp {
        hasAttachment?: boolean;
        hasErrorAttachment?: boolean;
        checkFilter?: string[];
        contractVerified?: string;
        posmVerified?: string;
        month?: Moment;
        divisionIds?: number[];
    }
    const [cancelState, setCancelStatus] = useState<{
        visible?: {
            name: "MODAL",
            payloads?: any;
            filter?: VisitScheduleAdvanceSearchParams
        }
    }>();
    const lookup = useQuery(['visit-schedule-lookup-data'], () => MultiRequest<{
        contractTypes: LookupData[];
        lookupDataList: LookupData[];
    }>([
        ContractServices.listContractType().queryParams,
        fetchDataListService<LookupData, { list: string[] }>({
            actionName: 'lookupDataList',
            endpoint: 'CRM',
            payload: { list: ['CUSTOMER_DIVISION'] },
        }).queryParams
    ])(), { refetchOnWindowFocus: false })

    const { data, refetch, isFetching } = useQuery(
        ['fetch-visit-schedule-paging', filter],
        () => crmServices.listVisitSchedule({
            ...filter,
        }, { ...filter.pagination, page: (filter.pagination?.current || 1) - 1 },),
        { refetchOnWindowFocus: false, staleTime: 1000 }
    )

    const quickViewHandler = async (data: VisitScheduleItem) => {
        await actions.detail(data.id);
        modals.showModal('quick-view');
    };

    const actionRef = useRef<ActionType>()

    useEffect(() => {
        actions.initialData();
    }, []);

    const extraFilter = <ProCard>
        <LightFilter<LightFilterProp> onValuesChange={(_, values) => {
            setFilter((v) => ({
                ...v,
                criteria: {
                    ...v.criteria,
                    hasContractOnly: values.checkFilter?.includes('hasContract'),
                    hasPosmCheckedOnly: values.checkFilter?.includes('hasPosm'),
                    contractVerified: values.contractVerified
                        ? values.contractVerified === 'yes'
                        : undefined,
                    posmVerified: values.posmVerified ? values.posmVerified === 'yes' : undefined,
                    month: values.month,
                    hasAttachment: values.hasAttachment,
                    hasErrorAttachment: values.hasErrorAttachment,
                    divisionIds: values.divisionIds,
                }
            }));

            actionRef.current?.reloadAndRest?.();
        }}>
            <ProFormDatePicker.Month initialValue={filter.criteria?.month} name={'month'} label="Month" />
            <ProFormSelect
                label="Division"
                name="divisionIds"
                mode="multiple"
                width="md"
                showSearch
                allowClear
                initialValue={filter.criteria?.divisionIds}
                options={lookup?.data?.lookupDataList
                    ?.filter((it) => it.type === 'CUSTOMER_DIVISION')
                    ?.map((it) => {
                        return { value: it.id, label: it.name };
                    })}
            />
            <ProFormSelect
                name="checkFilter"
                label="For Verify"
                mode="multiple"
                initialValue={[filter.criteria?.hasContractOnly ? 'hasContract' : undefined, filter.criteria?.hasPosmCheckedOnly ? 'hasPosm' : undefined].filter(it => it)}
                options={[
                    { label: 'Has Contract', value: 'hasContract' },
                    { label: 'Has POSM', value: 'hasPosm' },
                ]}
            />
            {(filter.criteria?.status || 'COMPLETED') === 'COMPLETED' && <ProFormSelect
                name="contractVerified"
                label="Contract Verified"
                initialValue={filter.criteria?.contractVerified == undefined ? undefined : filter.criteria?.contractVerified ? 'yes' : 'no'}
                options={[
                    { label: 'Yes', value: 'yes' },
                    { label: 'No', value: 'no' },
                ]}
            />
            }
            {(filter.criteria?.status || 'COMPLETED') === 'COMPLETED' && <ProFormSelect
                name="posmVerified"
                label="POSM Verified"
                initialValue={filter.criteria?.posmVerified == undefined ? undefined : filter.criteria?.posmVerified ? 'yes' : 'no'}
                options={[
                    { label: 'Yes', value: 'yes' },
                    { label: 'No', value: 'no' },
                ]}
            />}

            {(filter.criteria?.status || 'COMPLETED') === 'COMPLETED' && (
                <Space>
                    <Typography.Text type="secondary">Attachment Only</Typography.Text>
                    <ProFormSwitch
                        initialValue={filter.criteria?.hasAttachment}
                        name={"hasAttachment"}
                    />
                </Space>
            )}

            {(filter.criteria?.status || 'COMPLETED') === 'COMPLETED' && filter.criteria?.hasAttachment && (
                <Space>
                    <Typography.Text type="secondary">Upload Failed</Typography.Text>
                    <ProFormSwitch
                        initialValue={filter.criteria?.hasErrorAttachment}
                        name={"hasErrorAttachment"}
                    />
                </Space>
            )}
        </LightFilter>
    </ProCard>

    return (
        <Spin spinning={state.loading || false}>
            <PageWrapper<VisitScheduleItem, FilterType, {}>
                tabRender={item => [
                    {
                        action: 'view',
                        value: item?.scheduleDate && formatDate(item.scheduleDate),
                        panel: (_) => <VisitScheduleDetailView openInTab id={item?.id!!} />,
                        tabLabel: `${item?.scheduleDate && formatDate(item.scheduleDate)} (${item?.customer.code})`,
                    },
                    {
                        action: 'action1',
                        value: item?.customer.code,
                        panel: (_) => <CustomerDetailView getMenuItems={() => []} id={item?.customer.id} openInTab={true} />,
                        tabLabel: <Badge dot><Typography.Text>{item?.customer.code}</Typography.Text></Badge>,
                    }
                ]}
                listView={{
                    onExtraFilterRender: () => filter.criteria?.status || 'COMPLETED' == "COMPLETED" ? extraFilter : <div />,
                    statuses: [
                        { option: { label: 'All', value: 'ALL', }, subOptions: [] },
                        { option: { label: 'Pending', value: 'PENDING' }, subOptions: [] },
                        { option: { label: 'Completed', value: 'COMPLETED', default: true }, subOptions: [] },
                        { option: { label: 'Canceled', value: 'CANCELED' }, subOptions: [] }
                    ],
                    onRefresh: refetch,
                    title: "Visit Schedule List",
                    actionButtons: [
                        <>
                           {access.canAccessVisitScheduleCancelBtn &&<Tooltip key={'generate-visit-plan '} title="Cancel Visit Schedule">
                                <Button
                                    type="link"
                                    danger
                                    key={"cancel"}
                                    onClick={() => setCancelStatus({ visible: { name: "MODAL" } })}
                                    icon={<CloseSquareOutlined />}
                                />
                            </Tooltip>}
                            {access.canAccessVisitScheduleTrackingLocationBtn &&<Tooltip key={'generate-visit-plan '} title="Tracking Loaction"><Button
                                type="link"
                                onClick={() => history.push(CrmPaths.locationTracking)}
                                icon={<EnvironmentOutlined />}
                            /></Tooltip>}
                            {access.canAccessVisitScheduleGenerateBtn &&<Tooltip key={'generate-visit-plan '} title="Generate visit schedule"><Button
                                type="link"
                                onClick={() => modals.showModal('generate-schedule')}
                                icon={<ScheduleOutlined />}
                            /></Tooltip >}
                        </>
                    ],
                    onOpenAdvanceSearch: () => { modals.showModal('advanceSearch') },
                    type: 'Table',
                    onFilter(params, page, sort) {
                        setFilter(v => ({
                            ...v,
                            keywords: params?.searchValue,
                            criteria: { ...v.criteria, ...params, status: params?.status == "ALL" ? undefined : params?.status || 'COMPLETED' },
                            pagination: { ...page },
                            sort: sort
                        }))
                    },
                    props: {
                        loading: isFetching,
                        dataSource: data?.items,
                        actionRef: actionRef,
                        scroll: { x: 'min-content' },
                        pagination: {
                            total: data?.total
                        },
                        primaryCol: {
                            title: 'Schedule Date',
                            sorter: 'scheduleDate',
                            key: 'scheduleId',
                            width: 130,
                        },
                        actionButtonsColumnRender: item => [
                            {
                                type: "link",
                                size: "small",
                                icon: <ExportOutlined />,
                                onClick: () => window.open(`/external/crm/visit-schedule/detail/${item.id}`, '_blank')?.focus(),
                                tooltip: "View data in new browser tab."
                            },
                            {
                                tooltip: 'Quick data review',
                                type: "link",
                                size: "small",
                                icon: <EyeOutlined />,
                                onClick: () => quickViewHandler(item)
                            }
                        ],
                        columns: [
                            {
                                title: 'Schedule Date',
                                sorter: 'scheduleDate',
                                key: 'scheduleDate',
                                width: 130,
                                actionProps: (item) => ({
                                    type: 'view',
                                    label: `${formatDate(item.scheduleDate)}`,
                                    actionButtons: [
                                        { hidden: !(item.status === 'COMPLETED' && item.hasAttachment), type: 'link', size: 'small', position: 'last', icon: <PaperClipOutlined style={{ color: `${item.hasErrorAttachment === false ? '#A0A0A0' : 'red'}` }} /> }
                                    ]
                                }),

                            },
                            {
                                title: 'Cust. Code',
                                // render: (_, r) => r.customer.code,
                                width: 110,
                                key: 'customerCode',
                                // [r.customer.code, r.customer.name].filter((it) => it).join(' - ')
                                sorter: 'customerCode',
                                actionProps: (item) => ({
                                    type: 'action1',
                                    label: item?.customer.code,
                                    actionButtons: [{
                                        size: 'small',
                                        type: 'link',
                                        icon: <ExportOutlined />,
                                        onClick: () => window.open(`/external/crm/customer/detail/${item.customer.id}`, '_blank')?.focus(),
                                    }]
                                }),

                            },
                            {
                                title: 'Salesperson',
                                render: (_, r) => r.salesperson.name,
                                width: 150,
                                // [r.salesperson?.code, r.salesperson.name].filter((it) => it).join(' - '),
                                sorter: 'salespersonName',
                            },

                            { title: 'Address', render: (_, r) => r.address.name },
                            { title: 'Division', render: (_, r) => r.customer.division },
                            {
                                title: 'Manual',
                                width: 60,
                                render: (_, r) => {
                                    // let color = r.scheduleType === 'Planned' ? 'green' : 'volcano';
                                    return r.scheduleType != 'Planned' && <CheckOutlined size={10} />
                                },
                            },
                            {
                                title: 'Created By',
                                width: 120,
                                dataIndex: 'createdBy',
                                sorter: 'createdBy',
                            },
                            {
                                title: 'Created Date',
                                render: (_, r) => formatDateTime(r.createdDate),
                                width: 150,
                                sorter: 'createdDate',
                            },
                            {
                                title: 'Completed Date',
                                render: (_, r) => formatDateTime(r.completedDate),
                                width: 150,
                                // hideInTable: advanceSearchParams.status === 'PENDING',
                                sorter: 'completedDate',
                            },
                            {
                                title: 'Status',
                                width: 100,
                                render: (_, r) => <Status value={r.status} text={toReadable(r.status)} />
                            },
                            {
                                title: 'Verified',
                                render: (_, r) => (
                                    <Space>
                                        {r.contractChecked && (
                                            <Tag icon={<CheckCircleOutlined />} color="#2db7f5">
                                                {'Contract'}
                                            </Tag>
                                        )}
                                        {r.posmChecked && (
                                            <Tag icon={<CheckCircleOutlined />} color="#87d068">
                                                {'POSM'}
                                            </Tag>
                                        )}
                                    </Space>
                                ),
                            },
                        ]
                    },

                }} />

            < GenerateScheduleModal
                seList={state.initData?.seList || []}
                open={modals.isVisible('generate-schedule')}
                onCancel={() => modals.hideModal('generate-schedule')}
                actionHandlers={{
                    onSubmit: (mothCreated, effectiveDate, salespersonId, overwritePending, remarks) => {
                        Modal.confirm({
                            title: 'Generate Visit Schedule',
                            content: 'Are you sure?',
                            onOk: async () => {
                                const rs = await actions.createSchedule(
                                    mothCreated,
                                    effectiveDate,
                                    salespersonId,
                                    overwritePending,
                                    remarks,
                                );
                                modals.hideModal('generate-schedule');
                                if (rs.data === 0) {
                                    message.warning('No schedule has been generated.');
                                } else message.success(`${rs.data} schedules have been generated sucessfully.`);
                            },
                        });
                    },
                }}
            />

            < AdvanceSearch
                width="600px"
                placement="right"
                initData={filter.criteria}
                // closable
                title="Advance Search"
                open={modals.isVisible('advanceSearch')}
                onClose={() => modals.hideModal('advanceSearch')}
                seList={state.initData?.seList || []}
                contractTypes={lookup.data?.contractTypes || []}
                lookupList={lookup.data?.lookupDataList || []}
                onSearch={(data) => {
                    setFilter(v => ({ ...v, criteria: { ...v.criteria, ...data }, pagination: {} }))
                    actionRef.current?.reload?.(true);
                }}
                onReset={() => {
                    setFilter(v => ({ ...v, criteria: { status: v.criteria?.status }, pagination: {} }))
                    actionRef.current?.reload?.(true);
                }}
            />

            {
                modals.isVisible('quick-view') && (
                    <QuickView
                        title="Vsisit Schedule Detail"
                        editable={access.canAccessVisitScheduleEdit}
                        open={modals.isVisible('quick-view')}
                        submitter={false}
                        detail={state.data?.detail}
                        onRefresh={async () => {
                            await actions.detail(state.data?.detail?.id || 0);
                        }}
                        onOpenChange={(v) => !v && modals.hideModal('quick-view')}
                    />
                )
            }

            <CancelModalForm
                open={cancelState?.visible?.name == "MODAL"}
                onCancel={() => setCancelStatus({ visible: undefined })}
                filterParam={filter}
                onSave={(data) => {
                    Modal.confirm({
                        title: "Cancel Visit Schedule",
                        content: "are you sure?",
                        onOk: async () => {
                            await crmServices.cancelMultiVisitSchedule(data);
                            refetch();
                            setCancelStatus({ visible: undefined });
                            message.success("Success!")
                        }
                    })
                }}
            />
        </Spin >
    )
}

