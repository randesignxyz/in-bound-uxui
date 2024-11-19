import TableView, { FetchPagingParams } from "@/components/DataCrud/TableView";
import { ActionType, PageContainer } from "@ant-design/pro-components";
import { history, useModel } from 'umi';
import { EmpWhsMappingList, ItemAdvanceSearchParams, SearchItemParams } from "./data.types";
import { simpleRequestActions } from "@/services/model";
import { createService } from "./services";
import { createService as Srv } from "../request/services";
import { Paging } from "@/services/API";
import { Button, Radio, Space, Tag, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { CheckCircleOutlined, EditOutlined} from "@ant-design/icons";

interface Props {
    onAdd?: (id?: number) => void;
    onEdit?: (id: number) => void;
    forceRefresh?: number
}
export default ({ onAdd, onEdit, forceRefresh }: Props) => {
    const cacheList = useModel('dataList');
    const actionRef = useRef<ActionType>();
    const requestActions = simpleRequestActions();
    const services = createService(requestActions);
    const src = Srv(requestActions);
    const [advanceSearchParams, setAdvanceSearchParams] = useState<ItemAdvanceSearchParams>({groupIds:[],status:'ALL'});

    useEffect(()=>{
        initData()
    },[forceRefresh])
    const initData = async () => {
        actionRef.current?.reload()
    };
    const onRequestHandler = async (params: FetchPagingParams<SearchItemParams&{keyword?:string}>)=>{
        try {
            return services.fetchPaging(params).then((it) => {
            return cacheList.cacheDataList({
                type: 'fma-emp-whs-mapping-list',
                criteria: params,
                data: it,
            });
            }) as Promise<Paging<EmpWhsMappingList>>;
        } catch (error: any) {
            message.error(error.message);
            return Promise.reject();
        }
    }

    return<PageContainer onBack={history.back} title="Employee Warehouse Mapping">
        <TableView<EmpWhsMappingList, SearchItemParams> 
            tableProps={{
                actionRef: actionRef
            }}      
            extraFilter={<Space>    
                 <Radio.Group
                    value={advanceSearchParams.status}
                  onChange={(e) => {
                    console.log('status',e.target.value)
                      setAdvanceSearchParams((v) => ({
                          ...v,
                          status: e.target.value
                      }));
                      actionRef.current?.reloadAndRest?.();
                  }}
                >
                    <Radio.Button value="ALL">All</Radio.Button>
                    <Radio.Button value="Y">Active</Radio.Button>     
                    <Radio.Button value="N">Inactive</Radio.Button> 
                </Radio.Group>  
            </Space>
            }
            actionHandlers={{
                onAdd: onAdd,
                onRequest: (criteria, pagination, sort) => onRequestHandler({
                    criteria: {
                      ...criteria,
                      searchValue: criteria?.searchValue ?? '',
                      advanceSearch: advanceSearchParams,
                      // sort,
                    },
                    pagination,
                    sort,
                  })
            }}
            columns={[
                {
                    title: 'Emp No',
                    sorter: 'itemCode',
                    dataIndex: 'empNo',
                    width: 120,
                },
                {
                    title:'Emp Info.',
                    dataIndex: 'firstName',
                    render: (_,r) => //`${r.internalName}  ${r.firstName} ${r.lastName} `
                    <Space direction="vertical">
                        <div>{`${r.internalName}  ${r.firstName} ${r.lastName} `}</div>
                        <div style={{right:10}}>{r.whsList?.map(it=> <Tag icon={<CheckCircleOutlined/>} color="success">{it}</Tag>)}</div>
                    </Space>
                },
                {
                    title: 'Active',
                    sorter: 'active',
                    dataIndex: 'active',
                    width: 50,
                },
                {
                    title: 'Action',
                    width: 20,
                    render: (_, rd)=> <Button type="link" size="small" icon={<EditOutlined/>} onClick={()=> onEdit?.(rd.id)}/>
                }
            ]}        
        />
    </PageContainer>
}