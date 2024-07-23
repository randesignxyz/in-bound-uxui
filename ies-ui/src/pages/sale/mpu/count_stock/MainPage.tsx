import PageWrapper from "@/components/PageWrapper"
import CountStockDetail from "./Detail"
import { CountStockServiceAPI } from "./service";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { simpleRequestActions } from "@/services/model";
import { ActionType } from "@ant-design/pro-components";
import { useQuery } from "@umijs/max";
import { useRef, useState } from "react";
import { formatterQty } from "@/pages/utils";

interface Props{
}

const CountStockMainPage:React.FC<Props> = () =>{
    const requestActions  = simpleRequestActions();
    const services = CountStockServiceAPI(requestActions);
    const actionRef = useRef<ActionType>();
    const [filter, setFilter] = useState<TableViewSearchParams<CountStockAdvanceSearch>>({
        criteria: { advanceSearch: { status: 'ALL' } }
    });
    const { data, isFetching, refetch } = useQuery(['fetch-customer-list', filter], () => services.page(filter), {
        refetchOnWindowFocus: false
    });
    return (
        <PageWrapper<StockCountDto, CountStockAdvanceSearch ,{}>
            tabRender={items=>[
                {
                    tabLabel:`${items?.countedNo}`,
                    action:"view",
                    panel:({})=><CountStockDetail id={items?.id} />
                }
            ]}
            listView={{
                type:"Table",
                title:"Count Stock",
                onRefresh:refetch,
                onFilter:(params, page, sort) =>{
                    setFilter(k=>({
                      ...k,
                      criteria:{
                        searchValue:params?.searchValue,
                        advanceSearch:params,
                        sort
                      },
                      pagination:{...page}
                    }))
                },
                props:{
                    dataSource:data?.items,
                    actionRef:actionRef,
                    loading:isFetching,
                    pagination:{
                      total:data?.total
                    },
                    columns:[
                        {
                            title:"Counted No",
                            dataIndex:"countedNo",
                            actionProps:(items) =>({
                              label:`${items.countedNo}`,
                              type:"view",
                            })
                          },
                          {
                            title:"Saleperson",
                            dataIndex:"type",
                            render:(_,r)=>[r.salespersonCode, r.salespersonName].join("-")
                          },
                          {
                            title:"Stock code",
                            dataIndex:"storeCode"
                          },
                          {
                            title:"Sales Volume",
                            dataIndex:"soldQuantity",
                            render:(_,r)=>formatterQty.format(r.soldQuantity)
                          },
                          {
                            title:"Sales Amount",
                            dataIndex:"soldAmount",
                            valueType:"money"
                          },
                          {
                            title:"Sales Amount",
                            dataIndex:"soldAmount",
                            valueType:"money"
                          },
                          {
                            title:"Counted Date",
                            dataIndex:"countedDate",
                            valueType:"date"
                          },
                    ]
                }
            }}
        />
    )
}

export default CountStockMainPage