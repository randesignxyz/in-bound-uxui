import { useRef, useState } from "react"
import ContractModal from "./components/ContractModal"
import PageWrapper from "@/components/PageWrapper"
import { ActionType } from "@ant-design/pro-components"
import { useQuery, useAccess } from "@umijs/max"
import { ContractServices } from "./services"
import { FetchPagingParams } from "@/components/DataCrud/TableView"
import { ContractAdvanceSearchParams, ImportedContract } from "./types"
import { ContractLess } from "@/services/crm/contract"
import { Badge, Button, Space, Tooltip, Typography, message } from "antd"
import { ExportOutlined, FileSearchOutlined, PlusOutlined } from "@ant-design/icons"
import { formatDate } from "@/pages/utils"
import Status from "@/components/Status"
import ImportFileButton from "@/components/ImportFileButton"
import { useSafeState } from "ahooks"
import { DataResponse } from "@/services/shared/data"
import ImportContract from "./import-contract"
import AdvanceSearch from "./components/AdvanceSearch"
import CustomerDetailView from "../customer/components/Detail"
import ContactDetailView from "./components/Detail"

export default () => {
    const [modalVisible, setModalVisible] = useState<{ type: 'ADD', id?: number, cb?: undefined } | { type: 'EDIT', id?: number, cb?: () => void }>()
    const actionRef = useRef<ActionType>();
    const access = useAccess()
    const [loading, setLoading] = useSafeState(false)
    const onEditHandler = (id: number, cb?: () => void) => {
        setModalVisible({ type: 'EDIT', id: id, cb: cb })
    }

    const [filter, setFilter] = useState<FetchPagingParams<ContractAdvanceSearchParams>>({ criteria: { status: "ACTIVE", processStatus: 'All' } })
    const [importContractData, setImportContractData] = useState<DataResponse<ImportedContract>>()
    const { data, refetch, isFetching } = useQuery(['fetch-contract-list', filter], () => ContractServices.list({
        criteria: {
            searchValue: filter.criteria?.searchValue,
            advanceSearch: filter.criteria,
            sort: filter.sort,
        },
        pagination: {
            pageSize: filter.pagination?.pageSize,
            current: filter.pagination?.current
        }
    }).query(), {
        refetchOnWindowFocus: false,
        staleTime: 1000,
    })

    return (<>
        <PageWrapper<ContractLess, ContractAdvanceSearchParams, {} >
            tabRender={item => [
                { action: 'view', tabLabel: item?.contractNo || `For ${item?.customer.code}`, panel: _ => item?.id && <ContactDetailView onEdit={onEditHandler} openInTab id={item.id} /> },
                {
                    action: 'action1', value: item?.customer.code,
                    onOpenIconClick: () => window.open(`/external/crm/customer/detail/${item?.customer.id}`, '_blank')?.focus(),
                    panel: (_) => <CustomerDetailView getMenuItems={() => []} id={item?.customer.id} openInTab={true} />,
                    tabLabel: <Badge dot><Typography.Text>{item?.customer.code}</Typography.Text>  </Badge>,
                }
            ]}
            listView={{
                type: 'Table',
                title: "Contract List",
                statuses: [{
                    option: { label: 'All', value: 'ALL' },
                },
                {
                    option: { label: 'Active', value: 'ACTIVE' },
                }, 
                {
                    option: { label: 'Expired', value: 'EXPIRED' },
                }, 
                {
                    option: { label: 'Terminated', value: 'TERMINATED' },
                }],
                advanceSearchButton: <AdvanceSearch onSearch={async (
                    brandId, contractTypeId, termId,
                    startedDateFrom, startedDateTo,
                    endedDateFrom, endedDateTo
                ) => {
                    setFilter(v => ({
                        ...v,
                        criteria: {
                            ...v.criteria,
                            status: v.criteria?.status || 'ACTIVE',
                            processStatus: 'All',
                            brandId: brandId,
                            contractTypeId: contractTypeId,
                            termId: termId,
                            startedDateFrom: startedDateFrom,
                            startedDateTo: startedDateTo, endedDateFrom,
                            endedDateTo: endedDateTo,
                        },
                        pagination: {
                        },
                    }))
                    actionRef.current?.reload?.(true)
                }} trigger={<Button icon={<FileSearchOutlined />} />} />,
                onRefresh: refetch,
                actionButtons: [
                    access.canImportContract && <Tooltip placement="top" key={'upload-contact'} title="Import">
                        <ImportFileButton<ImportedContract> importedKey="CONTRACT"
                            onDataResponse={setImportContractData}

                            onHandleChange={status => {
                                setLoading(status == 'uploading')
                                if (status == 'done') {
                                    message.info("Upload completed.")
                                }
                            }} />
                    </Tooltip>,
                    access.canAddEditContract && <Button type="link"
                        onClick={() => setModalVisible({ type: 'ADD' })}
                        key={'add-contact'}
                        icon={<PlusOutlined />} >Add
                    </Button>
                ].filter(it => it) as React.ReactElement[],
                onFilter: (params, pages, sorts) => {

                    setFilter(v => ({
                        ...v,
                        keywords: params?.searchValue?.replaceAll(/,/g, "").trim(),
                        criteria: { ...v.criteria, ...params, status: params?.status || 'ACTIVE', processStatus: 'All' },
                        sort: sorts,
                        pagination: pages
                    }))
                },
                props: {
                    dataSource: data?.items.map(it => ({ ...it, code: it.contractNo })),
                    pagination: { total: data?.total },
                    actionRef: actionRef,
                    loading: isFetching,
                    columns: [
                        {
                            title: 'Agreement #',
                            width: 170,
                            key: 'agreementNo',
                            actionProps: (item) => ({
                                type: 'view',
                                label: item.contractNo || 'n/a',
                                actionButtons: [
                                    { icon: <ExportOutlined />, type: 'link', size: 'small', onClick: () => window.open(`/external/crm/contract/detail/${item.id}`, '_blank')?.focus() }
                                ]
                            })
                            // tabRender: item => ({
                            //     value: item.contractNo || 'n/a',
                            //     onOpenIconClick: () => window.open(`/external/crm/contract/detail/${item.id}`, '_blank')?.focus(),
                            //     panel: (_) => <ContactDetailView onEdit={onEditHandler} openInTab id={item.id} />,
                            //     tabLabel: item?.contractNo || `For ${item.customer.code}`,
                            // })

                        },
                        {
                            title: 'Customer #',
                            key: 'customerNo',
                            sorter: 'customerNo',
                            width: 120,
                            actionProps: (item) => ({
                                type: 'action1',
                                label: item.customer.code || '',
                                actionButtons: [
                                    { icon: <ExportOutlined />, type: 'link', size: 'small', onClick: () => window.open(`/external/crm/customer/detail/${item.customer.id}`, '_blank')?.focus() }
                                ]
                            }),
                            tabRender: item => ({
                                value: item.customer.code,
                                onOpenIconClick: () => window.open(`/external/crm/customer/detail/${item.customer.id}`, '_blank')?.focus(),
                                panel: (_) => <CustomerDetailView getMenuItems={() => []} id={item?.customer.id} openInTab={true} />,
                                tabLabel: <Badge dot><Typography.Text>{item?.customer.code}</Typography.Text>  </Badge>,
                            })
                        },
                        {
                            title: 'Business Name',
                            sorter: 'customerName',
                            render: (_, rd) => <Space>
                                {<Typography.Text>{rd.customer.name}</Typography.Text>}
                                {<Typography.Text type="secondary">{rd.customer?.description}</Typography.Text>}
                            </Space>
                        },
                        {
                            dataIndex: 'contractType',
                            title: 'Agreement Type',
                            sorter: 'contractType',
                            render: (_, r) => r.contractType
                        }, {
                            dataIndex: 'brand',
                            title: 'Brand',

                        }, {
                            title: 'Budget Code',
                            sorter: 'budgetCode',
                            width: 120,
                            render: (_, r) => r.budgetCode
                        }, {
                            align: 'right',
                            dataIndex: 'effectiveDate',
                            sorter: 'effectiveDate',
                            title: 'Start Date',
                            width: 100,
                            render: (_, item) => formatDate(item.effectiveDate)
                        },
                        {
                            align: 'right',
                            dataIndex: 'expiryDate',
                            sorter: 'expiryDate',
                            title: 'End Date',
                            width: 100,
                            render: (_, item) => formatDate(item.expiryDate)
                        },
                        {
                            title: 'Status',
                            width: 110,
                            render: (_, item) => item.status && <Status text={item.status} />
                        },
                        {
                            title: 'Terms',
                            render: (_, item) => item.terms
                        },

                    ]
                }

            }}
        />
        {importContractData && <ImportContract open data={importContractData} onCancel={() => setImportContractData(undefined)} />}
        {modalVisible?.type && <ContractModal onRefresh={modalVisible.cb} contractId={modalVisible.id} open={true} onOpenChange={visible => !visible && setModalVisible(undefined)} />}
    </>
    )
}