import TableView, { colLink } from "@/components/DataCrud/TableView"
import { CrmPaths } from "@/pages/crm"
import { formatDate, getColorStatus, toReadable } from "@/pages/utils"
import { Paging } from "@/services/API"
import { ContractLess } from "@/services/crm/contract"
import { simpleRequestActions } from "@/services/model"
import { ProColumns } from "@ant-design/pro-table"
import { Button, Radio, Space, Spin, Tag, Tooltip, message } from "antd"
import { history, useModel } from 'umi'
import { ContractServices } from "../../services"
import { ActionType } from "@ant-design/pro-components"
import { useEffect, useRef, useState } from "react"
import { useSafeState } from "ahooks"
import { ContractAdvanceSearchParams, ImportedContract } from "../../types"
import { PlusCircleFilled, SelectOutlined } from "@ant-design/icons"
import AdvanceSearch from "../AdvanceSearch"
import ImportFileButton from "@/components/ImportFileButton"
import ImportContract from "../../import-contract"
import { DataResponse } from "@/services/shared/data"
import Status from "@/components/Status"
import { useAccess } from "@umijs/max"

const cols = (onDetail?: (record: ContractLess) => void): ProColumns<ContractLess>[] => ([
    {
        title: 'Customer Id',
        sorter: 'customerNo',
        width: 120,
        render: (_, rd) => <Space>
            <Button
                type="link"
                icon={<SelectOutlined />}
                onClick={async () => {
                    window.open(`/external/crm/customer/detail/${rd.customer.id}`, '_blank')?.focus();
                }}
            />
            <a onClick={() => { history.push(`${CrmPaths.customer}/detail/${rd.customer.id}`) }} >{rd.customer.code || 'Not Assigned'}</a>
        </Space>


    },
    {
        title: 'Business Name',
        sorter: 'customerName',
        render: (_, rd) => rd.customer.name
    },
    {
        title: 'Agreement No',
        render: colLink(onDetail, r => r.contractNo || 'Not Assigned', r => window.open(`/external/crm/contract/detail/${r.id}`, '_blank')?.focus()),
        sorter: 'contractNo'
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

])


const ContractListView = (actionHandler: { onDetail?: (record: ContractLess) => void, onAdd?: () => void }) => {

    const cacheList = useModel('dataList')
    const requestActions = simpleRequestActions()
    const actionRef = useRef<ActionType>();

    const [importContractData, setImportContractData] = useState<DataResponse<ImportedContract>>()
    const [advanceSearch, setAdanceSearch] = useSafeState<ContractAdvanceSearchParams>({ status: "ACTIVE", processStatus: 'All' })
    const onRequestHandler = async (criteria?: { searchValue?: string },
        pagination?: {
            pageSize?: number;
            current?: number;
        }, sort?: any) => {
        return ContractServices.list({
            criteria: {
                searchValue: criteria?.searchValue,
                advanceSearch: advanceSearch,
                sort: sort
            },
            pagination: pagination
        }).query(requestActions).then(it => {
            return cacheList.cacheDataList({
                type: 'contract',
                data: it
            })

        }) as Promise<Paging<ContractLess>>
    }

    const [loading, setLoading] = useSafeState(false)

    const access = useAccess()

    useEffect(() => {
        actionRef.current?.reloadAndRest?.()
    }, [advanceSearch])

    return <Spin spinning={loading}>
        <TableView<ContractLess, { searchValue?: string; }>
            columns={cols(actionHandler.onDetail)}
            cache
            tableProps={{
                actionRef: actionRef,
                toolbar: {
                    actions: [
                        // <Button icon = {<UploadOutlined/>}>Import</Button>,
                        access.canImportContract && <Tooltip placement="top" title="Import">
                            <ImportFileButton<ImportedContract> importedKey="CONTRACT"
                                onDataResponse={setImportContractData}
                                onHandleChange={status => {
                                    setLoading(status == 'uploading')
                                    if (status == 'done') {
                                        message.info("Upload completed.")
                                    }
                                }} />
                        </Tooltip>,
                        access.canAddEditContract && <Button type="primary" onClick={actionHandler.onAdd} icon={<PlusCircleFilled />} >Add</Button>
                    ]
                }

            }}

            extraFilter={
                <Space >
                    <AdvanceSearch onSearch={async (brandId, contractTypeId, termId, startedDateFrom, startedDateTo, endedDateFrom, endedDateTo) => {
                        setAdanceSearch(v => ({ ...v, brandId: brandId, contractTypeId: contractTypeId, termId: termId, startedDateFrom: startedDateFrom, startedDateTo: startedDateTo, endedDateFrom, endedDateTo: endedDateTo }))
                        actionRef.current?.reloadAndRest?.()
                    }} trigger={<Button icon={<SelectOutlined style={{ accentColor: 'red' }} />} />} />
                    <Radio.Group optionType="button"
                        defaultValue={"ACTIVE"}
                        options={[
                            { label: "All", value: "ALL" },
                            { label: "Active", value: "ACTIVE" },
                            { label: "Expired", value: "EXPIRED" },
                            { label: "Terminated", value: "TERMINATED" }
                        ]}
                        onChange={(e) => setAdanceSearch(v => ({ ...v, status: e.target.value }))}
                    />
                </Space>
            }
            actionHandlers={{
                onAdd: actionHandler.onAdd,
                onFirstLoad: () => cacheList.fetchDataList('contract').then(v => {
                    if (v) return v.dataList;
                    else return onRequestHandler()
                }) as Promise<Paging<ContractLess>>,
                onRequest: onRequestHandler,
            }}
        />

        {importContractData && <ImportContract open data={importContractData} onCancel={() => setImportContractData(undefined)} />}
    </Spin>
}

export default ContractListView