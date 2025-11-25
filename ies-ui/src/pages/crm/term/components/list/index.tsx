import { Paging } from "@/services/API";
import { Radio, Space, Spin, Tag, message } from "antd";
import TableView from "@/components/DataCrud/TableView";
import { simpleRequestActions } from "@/services/model";
import { TermServices } from "../../service";
import { ActionType, LightFilter, ProColumns, ProForm, ProFormSelect } from "@ant-design/pro-components";
import { CheckCircleOutlined, CheckOutlined, ExclamationCircleOutlined, SelectOutlined, TagsOutlined } from "@ant-design/icons";
import { CrmPaths } from "@/pages/crm";
import { history, useAccess, useModel } from 'umi'
import { Term } from "../../types";
import { TermAdvanceSearchParams } from "../../model";
import { useEffect, useRef, useState } from "react";
import { useForm } from "antd/es/form/Form";
import { LookupData } from "@/services/data";
import { MultiRequest } from "@/services/apiGateway";
import { ContractServices } from "@/pages/crm/contract/services";
import PopconfirmMe from "@/pages/expense/delivery/components/PopconfirmMe";
import { Button } from "antd";

export interface Props{
   onDetail?: (record: Term) => void
   onAdd?: () => void
   forceRefresh?: number
   contractTypes?: LookupData[]
}
type LightFilterProp = {
    tag?: string[]
}
export const TermListView: React.FC<Props> = ({onDetail,onAdd,forceRefresh,contractTypes}) => {
    const access = useAccess();
    const cacheList = useModel('dataList')
    const actionRef = useRef<ActionType>();
    const [form] = useForm<{tag:string[]}>()
    const requestActions = simpleRequestActions()
    const [advanceSearch, setAdanceSearch] = useState<TermAdvanceSearchParams>({ status: "ALL" })   
    const [lookupData, setLookupData] = useState<{
        contractTypes?: LookupData[];
      }>();
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
        onLoad()
    }, [advanceSearch,forceRefresh])

    const onLoad = async () => {
        const rs = await MultiRequest<{
            contractTypes: LookupData[];
          }>([
            ContractServices.listContractType().queryParams,
          ])(requestActions);    
          setLookupData(rs);
        actionRef.current?.reloadAndRest?.()
    }
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
            sorter: 'description',
            render: (_,r )=><Space direction="vertical">
                <div>{r.description}</div>
                <div style={{right:10}}>{r.tag?.map(it=> <Tag icon={<CheckCircleOutlined/>} color="success">{it}</Tag>)}</div>
            </Space>
        },
        {
            title: 'Configed',
            width: 40,
            render: (_,r)=>  r.isConfigured &&<Tag icon={<CheckCircleOutlined />} color="#2db7f5">{'Mapping'}</Tag>
        },
        {
            title: 'Action',
            width: 30,
            render: (_,r) => {

                return <PopconfirmMe title={`Tag - ${r.code}`}  
                    icon= {<TagsOutlined/>}
                    placement="left"               
                    description={
                        <ProForm form={form} submitter={false} style={{width:550}}>
                            <ProFormSelect mode="tags" colSize={1} readonly={false} options={contractTypes?.map(it =>{ return {label: it.name,value: it.name}})} name={'tag'}/>
                        </ProForm>
                    }
                    onConfirm={ async()=>{ 
                        try {
                            const formData = await form.validateFields();    
                            const data = {...formData,termId:r.id}
                            await TermServices.saveTermTag(data)(requestActions).then(it=>{
                                actionRef.current?.reloadAndRest?.()
                                message.success('Saved successfully.');
                            }) 
                        }catch(error: any){
                            message.error(error.message || 'Failed to save')
                        }
                    }}
                >
                    <Button type="link" icon={<TagsOutlined/>} 
                        onClick={()=> {
                            form.setFieldsValue({tag: r.tag})
                        }}
                    />
                </PopconfirmMe>
            }
        }
    ])

    return <Spin spinning={false}>
        <TableView<Term,  { searchValue?: string; }>
            columns={cols(onDetail)}
            cache
            tableProps={{
                actionRef: actionRef,
            }}
            displayOnly={access.crmReadOnly}
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
                    <LightFilter<LightFilterProp> 
                        onValuesChange={(_, values) => {
                            const tags = values.tag;
                            console.log('tag',tags)
                            setAdanceSearch(v => { return {...v,tag: tags}})
                        }}
                    >
                        <ProFormSelect 
                            name="tag"
                            label="Tag"
                            mode="multiple"
                            options={lookupData?.contractTypes?.map(it =>{ return {label: it.name,value: it.name}})}
                        />
                     </LightFilter>
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