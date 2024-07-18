import TableView, { FetchPagingParams } from "@/components/DataCrud/TableView";
import { ActionType, PageContainer, ProFormCheckbox  } from "@ant-design/pro-components";
import { history, useModel } from 'umi';
import { ItemAdvanceSearchParams, ItemList, SearchItemParams } from "./data.types";
import { simpleRequestActions } from "@/services/model";
import { createService } from "./services";
import { createService as Srv } from "../request/services";
import { Paging } from "@/services/API";
import { Button, Radio, Space, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { ItemGroupListItem } from "../request/data.types";
import CheckableTag from "antd/es/tag/CheckableTag";
import { EditOutlined} from "@ant-design/icons";

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
    const [itemGroups, setItemGroups] = useState<ItemGroupListItem[]>([]);
    const [advanceSearchParams, setAdvanceSearchParams] = useState<ItemAdvanceSearchParams>({groupIds:[],status:'ALL'});

    useEffect(()=>{
        initData()
    },[forceRefresh])
    const initData = async () => {
        const data = await src.listAllItemGroup();
        setItemGroups(data);
        actionRef.current?.reload()
    };
    const onRequestHandler = async (params: FetchPagingParams<SearchItemParams&{keyword?:string}>)=>{
        try {
            return services.fetchPaging(params).then((it) => {
            return cacheList.cacheDataList({
                type: 'fma-item-list',
                criteria: params,
                data: it,
            });
            }) as Promise<Paging<ItemList>>;
        } catch (error: any) {
            message.error(error.message);
            return Promise.reject();
        }
    }

    return<PageContainer onBack={history.back} title="NCM Item List">
        <TableView<ItemList, SearchItemParams> 
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
                <ProFormCheckbox.Group name={'itemGroup'}  style={{fontSize:24,marginTop:'15px'}}>
                    {itemGroups.map((it) => (
                        <CheckableTag
                            key={it.id}
                            onChange={(checked) => {
                                if (checked)
                                    setAdvanceSearchParams((v) => ({ ...v, groupIds: [...(v.groupIds || []), it.id] }));
                                else
                                setAdvanceSearchParams((v) => ({
                                    ...v,
                                    groupIds: v.groupIds?.filter((it1) => it1 !== it.id),
                                    }));
                                actionRef.current?.reloadAndRest?.();
                            } } 
                            checked={advanceSearchParams.groupIds?.some((it1) => it1 == it.id) || false}
                        >
                        {it.itemGroupName}
                        </CheckableTag>
                    ))}
                </ProFormCheckbox.Group>   
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
                    title: 'Item Code',
                    sorter: 'itemCode',
                    dataIndex: 'itemCode',
                    width: 120,
                },
                {
                    title:'Abr.',
                    dataIndex: 'itemAbr'
                },
                {
                    title:'Item Name',
                    dataIndex: 'itemName'
                },               
              
                {
                    title:'UoM',
                    dataIndex: 'defaultUoM'
                },
                {
                    title: 'Group',
                    render: (_, rd)=> rd?.itemGroup?.itemGroupName
                },                
                {
                    title:'Description',
                    dataIndex: 'description'
                },                
                {
                    title:'Active',
                    dataIndex: 'active'
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