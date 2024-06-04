import { Badge, Button, Checkbox, Modal, Space, Spin, Tag, Tooltip, Typography, message } from "antd"
import PageWrapper from "@/components/PageWrapper"
import { VisitScheduleAdvanceSearchParams, VisitScheduleItem } from "@/services/crm/data"
import { useEffect, useState } from "react"
import { FetchPagingParams } from "@/components/DataCrud/TableView"
import { Model } from "./model"
import { useQuery, history } from "@umijs/max"
import { ContractServices } from "../contract/services"
import { MultiRequest, fetchDataListService } from "@/services/apiGateway"
import { LookupData } from "@/services/data"
import { formatDate, formatDateTime } from "@/pages/utils"
import { CrmServiceAPI } from "@/services/crm/services"
import { CheckCircleOutlined, EyeOutlined, PaperClipOutlined, ScheduleOutlined, SelectOutlined } from "@ant-design/icons"
import CustomerDetailView from "../customer/components/Detail"
import { CrmPaths } from ".."
import VisitScheduleDetailView from "./components/Detail"
import AdvanceSearch from "./components/List/AdvanceSearch"
import QuickView from "./components/quick-view"
import GenerateScheduleModal from "./components/GenerateScheduleModal"

type FilterType = {

}
export default () => {

    const { state, actions, modals } = Model();

    const crmServices = CrmServiceAPI()
    const [filter, setFilter] = useState<FetchPagingParams<VisitScheduleAdvanceSearchParams>>({
        criteria: {
            status: 'COMPLETED',
        }
    })



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
        () => crmServices.listVisitSchedule({ ...filter }, filter.pagination,),
        { refetchOnWindowFocus: false }
    )




    const quickViewHandler = async (data: VisitScheduleItem) => {
        await actions.detail(data.id);
        modals.showModal('quick-view');
    };


    useEffect(() => {
        actions.initialData();
    }, []);

    return (
        <Spin spinning={false}>

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
                    statuses: [
                        { option: { label: 'All', value: 'ALL' }, subOptions: [] },
                        { option: { label: 'Pending', value: 'PENDING' }, subOptions: [] },
                        { option: { label: 'Completed', value: 'COMPLETED' }, subOptions: [] },
                        { option: { label: 'Canceled', value: 'CANCELED' }, subOptions: [] }
                    ],
                    actionButtons: [<Tooltip title="Genderate visit schedule">
                        <Button
                            type="link"
                            onClick={() => modals.showModal('generate-schedule')}
                            icon={<ScheduleOutlined />}
                        />
                    </Tooltip>],
                    onOpenAdvanceSearch: () => { modals.showModal('advanceSearch') },
                    type: 'Table',
                    props: {
                        loading: isFetching,
                        dataSource: data?.items,
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
                                                icon={<SelectOutlined />}
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
                                    tabLabel: item?.scheduleDate && formatDate(item.scheduleDate),
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
                    // setAdvanceSearchParams((v) => ({
                    //     ...v,
                    //     ...data,
                    // }));
                    // actionRef.current?.reloadAndRest?.();
                }}
                onReset={() => {
                    // setAdvanceSearchParams((v) => ({ status: v.status }));
                    // actionRef.current?.reloadAndRest?.();
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

