import { ProCard, ProTable } from "@ant-design/pro-components"
import { HistoryItem } from "../../types"
import { GratisServices } from "../../services"
import { simpleRequestActions } from "@/services/model"
import moment from "moment";
import { useEffect, useState } from "react";
import { formatDate, formatDateTime, toReadable } from "@/pages/utils";

interface Props{
    verifyContractId: number;
}
interface DataType {
    key: React.ReactNode;
    name: string; 
    children?: DataType[];   
    id?: number;
    docNum?: number;
    docDate?: moment.Moment;   
    itemCode?: string;
    itemName?: string;
    qty?: number;
    createdBy?: string;
    createdDate?:moment.Moment;
    modifiedBy?:string;
    modifiedDate?:moment.Moment;
    actionCode?:string;
  }
const HistoryAdjustmentTransactionList=({verifyContractId}:Props)=>{
    const requestActions = simpleRequestActions()
    const [data, setData] = useState<DataType[]>()
    useEffect(()=>{
        loadData()
    },[])
    const loadData= async()=>{
        const rs = await GratisServices.fetchHistoryGratisTransList(verifyContractId).query(requestActions) 
        setData(
            rs.map(it =>{
                var children = it.items.map(r=>{ 
                    return ({
                        key: r.id,
                        name: `${r.docNum}`,
                        id: r.id,
                        docNum: r.docNum,
                        docDate: r.docDate,
                        itemCode: r.itemCode,
                        itemName:r.itemName,
                        qty: r.qty,
                        createdBy: r.createdBy,
                        createdDate: r.createdDate,
                        modifiedBy: r.modifiedBY,
                        modifiedDate: r.modifiedDate,
                        actionCode: r.actionCode
                    }as DataType)
                })
                return ({
                    key: it.item,
                    name: it.item,
                    children: children                   
                } as DataType)
            })
        )
    }
    return (
    <ProTable<DataType> search={false} size="small"
        options={{
            fullScreen: false,
            density: false,
            reload: false,
            setting: false,
        }} 
        // request={ async(page: any)=>{
        //     const rs = await GratisServices.fetchHistoryGratisTransList(verifyContractId).query(requestActions)          
        //     return {               
        //         success: true, 
        //         total: rs.length || 0,
        //         data: rs
        //     }
        // }}
        dataSource={data}
        columns={[{
            title: 'Doc No',
            dataIndex:'name',
            width: 120
        },{
            title: 'Doc Date',
            dataIndex:'docDate',
            render:(_,r)=> formatDate(r.docDate),
            width: 120
        },{
            title: 'Item Code',
            dataIndex:'itemCode'
        },{
            title: 'Item Name',
            dataIndex:'itemName'
        },{
            title: 'Qty',
            dataIndex:'qty'
        },{
            title: 'Created By',
            dataIndex:'createdBy'
        },{
            title: 'Created Date',
            dataIndex:'createdDate',
            width: 120,
            render:(_,r)=> formatDateTime(r.createdDate)
        },{
            title: 'Modified By',
            dataIndex:'modifiedBy'
        },{
            title: 'Modified Date',
            dataIndex:'modifiedDate',
            width: 120,
            render:(_,r)=> formatDateTime(r.modifiedDate)
        },{
            title: 'Action',
            dataIndex:'actionCode',
            render:(_,r)=> toReadable(r.actionCode)
        }]}
    />)
}
export default HistoryAdjustmentTransactionList
