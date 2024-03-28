import { Paging } from "@/services/API";
import { Button, Radio, Space, Spin, Tag } from "antd";
import TableView from "@/components/DataCrud/TableView";
import { simpleRequestActions } from "@/services/model";
import { TermServices } from "../../service";
import { ActionType, ProColumns } from "@ant-design/pro-components";
import { CheckCircleOutlined, SelectOutlined } from "@ant-design/icons";
import { CrmPaths } from "@/pages/crm";
import { history, useModel } from 'umi'
import { Term } from "../../types";
import { TermAdvanceSearchParams } from "../../model";
import { useEffect, useRef, useState } from "react";

export interface Props{
    loading?: boolean;
    data: {
        itemList?: Paging<Term>;
    }
   onDetail?: (record: Term) => void
   onAdd?: () => void
   forceRefresh?: number
}

export const TermListView: React.FC<Props> = ({ loading,  data,onDetail,onAdd,forceRefresh}) => {

    const cacheList = useModel('dataList')
    const actionRef = useRef<ActionType>();
    const requestActions = simpleRequestActions()
    const [advanceSearch, setAdanceSearch] = useState<TermAdvanceSearchParams>({ status: "ALL" })   
    const onRequestHandler = async (criteria?: { searchValue?: string },
        pagination?: {
            pageSize?: number;
            current?: number;
        }, sort?: any) => {
        return TermServices.list({
            criteria: {
                searchValue: criteria?.searchValue,
                advanceSearch: advanceSearch,
                sort: sort
            },
            pagination: pagination
        }).query(requestActions).then(it => {
            return cacheList.cacheDataList({
                type: 'term',
                data: it
            })

        }) as Promise<Paging<Term>>
    }
    useEffect(() => {
        actionRef.current?.reloadAndRest?.()
    }, [advanceSearch,forceRefresh])
    const cols = (onDetail?: (record: Term) => void): ProColumns<Term>[] => ([
        {
            title: 'Code',
            sorter: 'code',
            width: 120,
            render: (_, rd) => <Space>
                <Button
                    type="link"
                    icon={<SelectOutlined />}
                    onClick={async () => {
                        window.open(`/external/crm/term/detail/${rd.id}`, '_blank')?.focus();
                    }}
                />
                <a onClick={() => { history.push(`${CrmPaths.terms}/detail/${rd.id}`) }} >{rd.code || 'Not Assigned'}</a>
            </Space>
        },{
            title: 'Description',
            dataIndex: 'description',
            sorter: 'description'
        },
        {
            title: 'Configed',
            width: 40,
            render: (_,r)=>  r.isConfigured &&<Tag icon={<CheckCircleOutlined />} color="#2db7f5">{'Mapping'}</Tag>
        }
    ])

    return <Spin spinning={false}>
        <TableView<Term,  { searchValue?: string; }>
            columns={cols(onDetail)}
            cache
            tableProps={{
                actionRef: actionRef,
            }}
            extraFilter={
                <Space>
                    <Radio.Group optionType="button"
                        defaultValue={"ACTIVE"}
                        options={[
                            { label: "All", value: "ALL" },
                            { label: "Mapping", value: "MAPPING" },
                            { label: "None", value: "NA" },
                        ]}
                        onChange={(e) => setAdanceSearch(v => ({ ...v, status: e.target.value }))}
                    />
                </Space>
            }
            actionHandlers={{
                onAdd: onAdd,
                onFirstLoad: () => cacheList.fetchDataList('term').then(v => {
                    if (v) return v.dataList;
                    else return onRequestHandler()
                }) as Promise<Paging<Term>>,
                onRequest: onRequestHandler,
            }}
        />
    </Spin>
}