import { Badge, Button, Checkbox, Modal, Space, Spin, Switch, Tag, Tooltip, Typography, message } from "antd"
import PageWrapper from "@/components/PageWrapper"
import { VisitScheduleAdvanceSearchParams, VisitScheduleItem } from "@/services/crm/data"
import { useEffect, useRef, useState } from "react"
import { FetchPagingParams } from "@/components/DataCrud/TableView"
import { Model } from "./model"
import { useQuery } from "@umijs/max"
import { ContractServices } from "../contract/services"
import { MultiRequest, fetchDataListService } from "@/services/apiGateway"
import { LookupData } from "@/services/data"
import { formatDate, formatDateTime, toReadable } from "@/pages/utils"
import { CrmServiceAPI } from "@/services/crm/services"
import {
    CheckCircleOutlined, ExportOutlined,
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

type FilterType = VisitScheduleAdvanceSearchParams & { searchValue?: string; status?: string; }
export default () => {

    const { state, actions, modals } = Model();
    const crmServices = CrmServiceAPI()
    const [filter, setFilter] = useState<FetchPagingParams<VisitScheduleAdvanceSearchParams>>({
        criteria: {
            status: 'COMPLETED',
        }
    })

    interface LightFilterProp {
        hasAttachment?: boolean;
        checkFilter?: string[];
        contractVerified?: string;
        posmVerified?: string;
        month?: Moment;
        divisionIds?: number[];
    }


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
            // const hasAttachment =
            //     'hasAttachment' in values ? values['hasAttachment'] === 'yes' ? true
            //         : values['hasAttachment'] === 'null' ? undefined : false
            //         : undefined;

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
                    divisionIds: values.divisionIds,
                }
            }));

            actionRef.current?.reloadAndRest?.();
        }}>
            <ProFormSelect
                name="checkFilter"
                label="For Verify"
                mode="multiple"
                options={[
                    { label: 'Has Contract', value: 'hasContract' },
                    { label: 'Has POSM', value: 'hasPosm' },
                ]}
            />

            <ProFormDatePicker.Month name={'month'} label="Month" />
            <ProFormSelect
                label="Division"
                name="divisionIds"
                mode="multiple"
                width="md"
                showSearch
                allowClear
                options={lookup?.data?.lookupDataList
                    ?.filter((it) => it.type === 'CUSTOMER_DIVISION')
                    ?.map((it) => {
                        return { value: it.id, label: it.name };
                    })}
            />

            {(filter.criteria?.status || 'COMPLETED') === 'COMPLETED' && <ProFormSelect
                name="contractVerified"
                label="Contract Verified"
                options={[
                    { label: 'Yes', value: 'yes' },
                    { label: 'No', value: 'no' },
                ]}
            />
            }
            {(filter.criteria?.status || 'COMPLETED') === 'COMPLETED' && <ProFormSelect
                name="posmVerified"
                label="POSM Verified"
                options={[
                    { label: 'Yes', value: 'yes' },
                    { label: 'No', value: 'no' },
                ]}
            />}

            {(filter.criteria?.status || 'COMPLETED') === 'COMPLETED' && (
                <Space>
                    <Typography.Text type="secondary">Has Error Attachment</Typography.Text>
                    <ProFormSwitch
                        // onChange={_onChange}
                        name={"hasAttachment"}
                    />
                </Space>
            )}
        </LightFilter>
    </ProCard>

    return (
        <Spin spinning={state.loading || false}>

            {/* <CrudWrapper baseURL={CrmPaths.visitSchedule}>
                {
                    (view, id, navigate) => {
                        switch (view) {
                            case 'list': return (
                                <VisitScheduleListView
                                    onDetail={data => navigate?.goToDetail?.({ id: data.id })}
                                />
                            )
                            case 'detail': return id ? <VisitScheduleDetailView id={Number(id) || 0} onBack={navigate?.gotToListHandler} /> : <Spin />
                            default: throw Error('Not compatible view')
                        }
                    }
                }
            </CrudWrapper> */}

            <PageWrapper<VisitScheduleItem, FilterType, {}>
                detailViewRender={(id) => <VisitScheduleDetailView id={id} />}

                listView={{
                    onExtraFilterRender: () => filter.criteria?.status || 'COMPLETED' == "COMPLETED" ? extraFilter : <div />,
                    statuses: [
                        { option: { label: 'All', value: 'ALL', }, subOptions: [] },
                        { option: { label: 'Pending', value: 'PENDING' }, subOptions: [] },
                        { option: { label: 'Completed', value: 'COMPLETED', default: true }, subOptions: [] },
                        { option: { label: 'Canceled', value: 'CANCELED' }, subOptions: [] }
                    ],
                    onRefresh: refetch,

                    actionButtons: [<Tooltip title="Genderate visit schedule">
                        <Button
                            type="link"
                            onClick={() => modals.showModal('generate-schedule')}
                            icon={<ScheduleOutlined />}
                        />
                    </Tooltip>],
                    onOpenAdvanceSearch: () => { modals.showModal('advanceSearch') },
                    type: 'Table',
                    onFilter(params, page, sort) {
                        setFilter(v => ({
                            ...v,
                            keywords: params?.searchValue,
                            criteria: { ...v.criteria, ...params, status: params?.status == "ALL" ? undefined : params?.status },
                            pagination: { ...page },
                            sort: sort
                        }))
                    },
                    props: {
                        loading: isFetching,
                        dataSource: data?.items,
                        actionRef: actionRef,
                        pagination: {
                            total: data?.total
                        },
                        primaryCol: {
                            title: 'Schedule Date',
                            sorter: 'scheduleDate',
                            key: 'scheduleId',

                            width: 130,
                        },
                        columns: [
                            {
                                width: 20,
                                render: (_, r) => (
                                    <Space size={1}>
                                        <Tooltip title="View data in new browser tab.">
                                            <Button
                                                type="link"
                                                size="small"
                                                icon={<ExportOutlined />}
                                                onClick={async () => {
                                                    window.open(`/external/crm/visit-schedule/detail/${r.id}`, '_blank')?.focus();
                                                }}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Quick data review">
                                            <Button
                                                type="link"
                                                size="small"
                                                icon={<EyeOutlined />}
                                                onClick={() => quickViewHandler(r)}
                                            />
                                        </Tooltip>
                                        {r.status === 'COMPLETED' && r.hasAttachment && (
                                            <PaperClipOutlined
                                                style={{ color: `${r.hasErrorAttachment === false ? '#A0A0A0' : 'red'}` }}
                                            />
                                        )}
                                    </Space>
                                ),
                            },
                            {
                                title: 'Schedule Date',
                                sorter: 'scheduleDate',
                                key: 'scheduleDate',
                                width: 130,
                                tabRender: item => ({
                                    // onOpenIconClick: () => window.open(`/external/crm/visit-schedule/detail/${item.id}`, '_blank')?.focus(),
                                    value: item?.scheduleDate && formatDate(item.scheduleDate),
                                    panel: <VisitScheduleDetailView id={item.id} />,
                                    tabLabel: `${item?.scheduleDate && formatDate(item.scheduleDate)}(${item.customer.code})`,
                                })
                            },
                            {
                                title: 'Cust. Code',
                                // render: (_, r) => r.customer.code,
                                width: 110,
                                key: 'customerCode',
                                // [r.customer.code, r.customer.name].filter((it) => it).join(' - ')
                                sorter: 'customerCode',
                                tabRender: item => ({
                                    value: item?.customer.code,
                                    onOpenIconClick: () => window.open(`/external/crm/customer/detail/${item.customer.id}`, '_blank')?.focus(),
                                    panel: <CustomerDetailView getMenuItems={() => []} id={item?.customer.id} openInTab={true} />,
                                    tabLabel: <Badge dot><Typography.Text>{item?.customer.code}</Typography.Text>  </Badge>,
                                })
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
                                    return r.scheduleType != 'Planned' && <Checkbox checked={true} />
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

            <GenerateScheduleModal
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

            <AdvanceSearch
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

            {modals.isVisible('quick-view') && (
                <QuickView
                    title="Vsisit Schedule Detail"
                    open={modals.isVisible('quick-view')}
                    submitter={false}
                    detail={state.data?.detail}
                    onRefresh={async () => {
                        await actions.detail(state.data?.detail?.id || 0);
                    }}
                    onOpenChange={(v) => !v && modals.hideModal('quick-view')}
                />
            )}
        </Spin>
    )
}

