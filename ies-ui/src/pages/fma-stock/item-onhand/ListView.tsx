import TableView, { FetchPagingParams } from "@/components/DataCrud/TableView";
import { ActionType, PageContainer, ProFormCheckbox, ProFormDigitRange  } from "@ant-design/pro-components";
import { history, useModel } from 'umi';
import { ItemAdvanceSearchParams, ItemOnHandList, SearchItemParams } from "./data.types";
import { simpleRequestActions } from "@/services/model";
// import { createService } from "./services";
import { createService as Srv } from "../request/services";
import { Paging } from "@/services/API";
import { Button, Radio, Space, Tooltip, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { ItemGroupListItem } from "../request/data.types";
import CheckableTag from "antd/es/tag/CheckableTag";
import { DownloadOutlined, EditOutlined, ExportOutlined, ReloadOutlined} from "@ant-design/icons";
import { createService } from "./services";
import NCMItemReportModalForm from "../request/reports/NCMItemReportModalForm";

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
    const [refNo, setRefNo] = useState<string>('-1');

    useEffect(()=>{
        initData()
    },[forceRefresh])
    const initData = async () => {
        const data = await src.listAllItemGroup();
        setItemGroups(data);
        // actionRef.current?.reload()
    };
    const onRequestHandler = async (params: FetchPagingParams<SearchItemParams&{keyword?:string}>)=>{
        try {
            const data = services.fetchPaging(params).then((it) => {
                return cacheList.cacheDataList({
                    type: 'fma-item-on-hand-list',
                    criteria: params,
                    data: it,
                });
            }) as Promise<Paging<ItemOnHandList>>;
            console.log('data',(await data).refNo)
            const refNo1  = (await data).refNo ||''
            setRefNo(refNo1)
             return data
        } catch (error: any) {
            message.error(error.message);
            return Promise.reject();
        }
    }
    const syncSAP = async ()=>{
        await services.syncItemOnHand()
        actionRef.current?.reload()
        console.log('syncSAP')  
    }

    return<PageContainer onBack={history.back} title="NCM Item Stock On Hand List" loading={requestActions.request?.loading}>
        <TableView<ItemOnHandList, SearchItemParams> 
            displayOnly={true}
            tableProps={{               
                actionRef: actionRef,
                options: { reload: false, density: false, fullScreen: false, setting: false },
                toolbar: {actions: [
                    <span><b>Last Sync:</b> {refNo}</span>,
                    <Tooltip title="Sync Stock on Hand from SAP">
                         <Button style={{marginTop:0}}
                            key={'bt'}
                            type="link"
                            onClick={syncSAP}
                            icon={<ReloadOutlined />}
                            >Sync</Button>,
                    </Tooltip>
                    
                ]}
            }}              
            refKey={(key: string)=> setRefNo(key)}   
<<<<<<< HEAD
            extraFilter={<Space style={{marginTop:'21px'}}>    
=======
            extraFilter={<Space align="baseline" style={{ right: '12px' }}>    
>>>>>>> skh-04
                 {/* <Radio.Group
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
                </Radio.Group>     */}
                <Space align="baseline" style={{ left: '12px',marginBottom:'-24px' }}>
                    <ProFormDigitRange  proFieldProps={{width:'100%'}}
                    // options={itemGroups.map(i=>({label:i.itemGroupName, value: i.id}))}                    
                        rules={[{ required: false}]}
                        placeholder="Enter stock on hand"
                        // label="On Hand"
                        name={'onHand'}
                        fieldProps={{
                        onChange:(values: any) => {
                                console.log('onHand',values)
                            setAdvanceSearchParams((v) => ({
                            ...v,
                            onHandFrom: values?.[0],
                            onHandTo: values?.[1]
                            }));
                            actionRef.current?.reloadAndRest?.();
                        }
                        }}
                    />
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
                                }} 
                                checked={advanceSearchParams.groupIds?.some((it1) => it1 == it.id) || false}
                            >
                            {it.itemGroupName}
                            </CheckableTag>
                        ))}
                    </ProFormCheckbox.Group>  
                </Space>
                 
            </Space>
            }
            extraRightFilter={<Space> 
                <NCMItemReportModalForm refNo={refNo} trigger={<Button type="link"  icon={<DownloadOutlined />} disabled={refNo=='-1'} >Export</Button>} />
            </Space>}
            actionHandlers={{
                // onAdd: onAdd,
                onRequest: (criteria, pagination, sort) => {
                    console.log('pagination: ',pagination)
                    return onRequestHandler({
                    criteria: {
                      ...criteria,
                      searchValue: criteria?.searchValue ?? '',
                      advanceSearch: advanceSearchParams,
                      // sort,
                    },
                    pagination,
                    sort,
                  })
                }
            }}
            columns={[
                {
                    title: 'Product Code',
                    sorter: 'itemCode',
                    dataIndex: 'itemCode',
                    width: 120,
                },
                {
                    title:'Product Name',
                    sorter: 'itemName',
                    dataIndex: 'itemName'
                }, 
                {
                    title:'UoM',
                    sorter: 'uoMName',
                    dataIndex: 'uoMName'
                },
                {
                    title: 'Group',
                    sorter: 'sapItemGroupName',
                    render: (_, rd)=> rd?.sapItemGroupName
                },                
                {
                    title:'Function',
                    sorter: 'itemGroupName',
                    dataIndex: 'itemGroupName',
                },              
                {
                    title:'Stock Balance',
                    sorter: 'onHand',
                    dataIndex: 'onHand'
                },                
                // {
                //     title:'Active',
                //     dataIndex: 'active'
                // },
                // {
                //     title: 'Action',
                //     width: 20,
                //     render: (_, rd)=> <Button type="link" size="small" icon={<EditOutlined/>} onClick={()=> onEdit?.(rd.id)}/>
                // }
            ]}        
        />
    </PageContainer>
}