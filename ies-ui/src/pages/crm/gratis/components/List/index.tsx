import TableView, { colLink } from "@/components/DataCrud/TableView"
import { CrmPaths } from "@/pages/crm"
import { formatDate, getColorStatus, toReadable } from "@/pages/utils"
import { Paging } from "@/services/API"
import { ContractLess } from "@/services/crm/contract"
import { simpleRequestActions } from "@/services/model"
import { ProColumns } from "@ant-design/pro-table"
import { Button, Radio, Space, Tag, Tooltip } from "antd"
import { history, useModel } from 'umi'
import { GratisServices } from "../../services"
import { ActionType } from "@ant-design/pro-components"
import { useEffect, useRef } from "react"
import { useSafeState } from "ahooks"
import { IncentiveSettlement } from "../../types"
import {ExportOutlined, PlusCircleFilled, SelectOutlined } from "@ant-design/icons"
import AdvanceSearch from "../AdvanceSearch"
import { ContractAdvanceSearchParams } from "@/pages/crm/contract/types"
import Status from "@/components/Status"

  
const cols = (): ProColumns<IncentiveSettlement>[] => ([
    {
        title:'Form No #',
        dataIndex: 'formNo',
        sorter: 'formNo',
        width: 140,
        render: (_, r) => (
          <Space size={1}>
            <Button
            type="link"
            size="small"
            icon={<ExportOutlined />}
            onClick={async () => {
                window.open(`/external/crm/gratis/detail/${r.id}`, '_blank')?.focus();
            }}
            />
            <a onClick={() => history.push(`/crm/gratis/detail/${r.id}`)}>
                {r.formNo? r.formNo:'NA'}
            </a>
          </Space>
        ),
    },
    {
        title: 'Settlement Name',
        dataIndex: 'label',
        sorter: 'label',
        render: (_, item) => `${item.label}`
    },
    {
        title: 'Agreetment Type',
        render: (_, item) => item.contractType?.name
    },
    {
        title: 'Created By',       
        dataIndex: 'createdBy',
        sorter: 'createdBy'
    },
    {
        align: 'right',
        dataIndex: 'createdDate',
        sorter: 'createdDate',
        title: 'Created Date',
        render: (_, item) => formatDate(item.createdDate)
    },
    {
        title: 'Status',
        render: (_, item) => {
            const stausText = (item?.requestStatus=='NONE'||item?.status!='PENDING')?  item?.status: (item?.requestStatus=='COMPLETED'?'APPROVED':item?.requestStatus)
            return <Status value={stausText} text={stausText||'PENDING'}/>
        }
    }
])


const GratisContractCheckListView = (actionHandler: { onDetail?: (record: IncentiveSettlement) => void, onAdd?: () => void, forceReload: number }) => {

    const cacheList = useModel('dataList')
    const requestActions = simpleRequestActions()
    const actionRef = useRef<ActionType>();
    const [advanceSearch, setAdanceSearch] = useSafeState<ContractAdvanceSearchParams>({ status: "ALL", processStatus: 'All' })
    const onRequestHandler = async (criteria?: { searchValue?: string },
        pagination?: {
            pageSize?: number;
            current?: number;
        }, sort?: any) => {
        return GratisServices.gratisContractCheckList({
            criteria: {
                searchValue: criteria?.searchValue,
                advanceSearch: advanceSearch,
                sort: sort
            },
            pagination: pagination
        }).query(requestActions).then(it => {
            return cacheList.cacheDataList({
                type: 'incentive-settlement',
                data: it
            })
        }) as Promise<Paging<IncentiveSettlement>>
    }
    
    useEffect(() => {
        actionRef.current?.reloadAndRest?.()
    }, [advanceSearch])
    useEffect(() => {
        actionHandler.forceReload && actionHandler.forceReload > 0 && actionRef.current?.reloadAndRest?.()
    }, [actionHandler.forceReload])
    const gotoCreate = () => {
        history.push(`/crm/gratis/create`)
    }
    return <div>
        <TableView<IncentiveSettlement, { searchValue?: string; }>
            columns={cols()}
            cache
            tableProps={{
                actionRef: actionRef,
                toolbar: {
                    actions: [
                        <Button onClick= {gotoCreate} type="primary"  icon={<PlusCircleFilled />} >Create</Button>
                    ]
                }
            }}

            extraFilter={
                <Space >
                    <AdvanceSearch onSearch={async (brandId, contractTypeId, termId) => {
                        setAdanceSearch(v => ({ ...v, brandId: brandId, contractTypeId: contractTypeId, termId: termId }))
                        actionRef.current?.reloadAndRest?.()
                    }} trigger={<Button icon={<SelectOutlined style={{ accentColor: 'red' }} />} />} />
                    <Radio.Group optionType="button"
                        defaultValue={"ALL"}
                        options={[
                            { label: "All", value: "ALL" },
                            { label: "Pending", value: "PENDING" },
                            { label: "Issued", value: "ISSUED" },
                            { label: "Canceled", value: "CANCELED" },
                        ]}
                        onChange={(e) => setAdanceSearch(v => ({ ...v, status: e.target.value }))}
                    />
                </Space>
            }
            actionHandlers={{
                onAdd: actionHandler.onAdd,
                onFirstLoad: () => cacheList.fetchDataList('incentive-settlement').then(v => {
                    if (v) return v.dataList;
                    else return onRequestHandler()
                }) as Promise<Paging<IncentiveSettlement>>,
                onRequest: onRequestHandler,
            }}
            /**
             * SKH-20240110: remove this feature
            expandable={{
                expandedRowRender: ((record: any) => <SettlementContractList item={record} />),
                rowExpandable: (record:any) => true,
            }}*/
        />
    </div>
}

export default GratisContractCheckListView