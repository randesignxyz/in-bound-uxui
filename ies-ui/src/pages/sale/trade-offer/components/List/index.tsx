import TableView, { colLink, TableViewProps } from "@/components/DataCrud/TableView";
import { SalePaths } from "@/pages/sale";
import { formatDate } from "@/pages/utils";
import { Paging } from "@/services/API";
import { PackagesLess } from "@/services/sale/data";
import { ActionType } from "@ant-design/pro-table";
import { useAccess, useModel, history } from "@umijs/max";
import { Tag } from "antd";
import React, { useRef } from "react";
import { Model } from "../../model";



const TradeListView: React.FC<TableViewProps<PackagesLess>> = ({actionHandlers}) => {
    
    const actionRef = useRef<ActionType>()
    const access = useAccess()
    const { actions } = Model();
    const cacheList = useModel('dataList');


    const onRequestHandler = (
        criteria?: { searchValue?: string },
        pagination?: {
          pageSize?: number;
          current?: number;
        },
      ) => {
        return actions.listPackages?.(criteria, pagination).then((it) => {
          return cacheList.cacheDataList({
            type: 'trade-offer',
            data: it,
          });
        }) as Promise<Paging<PackagesLess>>;
      };

    return <>
        <TableView<PackagesLess, {}>
            displayOnly={!access.canCreateEditSo}
            tableProps= {
                {
                    actionRef: actionRef
                }
            }
            actionHandlers= {
                {
                    onFirstLoad: () => cacheList.fetchDataList('trade-offer').then(item => {
                        if (item) return item
                        else return onRequestHandler()
                    }) as Promise<Paging<PackagesLess>>,
                    onRequest: onRequestHandler,
                }
            }
            columns= {
                [
                    {
                        title: 'Name',
                        render: colLink(r => history.push(`${SalePaths.tradeOffer}/detail/${r.id}`), r=> r.name || "No Naming")
                    },
                    {
                        title: 'Type',
                        render: (_, item) => {
                            const obj =  item.type === "TRADE_OFFER" ? {value: "TDO", color: "purple"} : item.type === "TRADE_PROMOTION_OFFER" ? {value:"TPO", color:"magenta" } : 
                                item.type === "TRANSPORTATION" ? {value:"TRA", color: "cyan"} : {value:"N/A", color: "gray"}
                            return <Tag color={obj.color}>{obj.value}</Tag>
                        }
                        // dataIndex: 'type',
                    },
                    {
                        title: 'MOQ',
                        dataIndex: 'minQty',
                    },
                    {
                        title: 'Effective Date',
                        render: (_, data) => {
                            return formatDate(data.effectiveDate)
                        }
                    },
                    {
                        title: 'Expired Date',
                        render: (_, data) => {
                            
                            if (data.expiredDate)
                                return formatDate(data.expiredDate)
                            else 
                                return <Tag color='gray'>never</Tag>
                        }
                    },
                    {
                        title: 'Is Mixed',
                        render: (_, data) => {
                            const color = data.isMixed ? 'green' : 'volcano'
                            const value = data.isMixed ? 'Yes' : 'No'
                            return <Tag color={color}>{value}</Tag>
                        }
                    },
                ]
            }
        />
    </>
}

export default TradeListView