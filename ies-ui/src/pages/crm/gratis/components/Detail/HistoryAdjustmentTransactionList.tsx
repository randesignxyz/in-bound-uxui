import { ActionType, ProCard, ProFormDateRangePicker, ProTable } from "@ant-design/pro-components"
import { HistoryItem, SearchCriteria } from "../../types"
import { GratisServices } from "../../services"
import { simpleRequestActions } from "@/services/model"
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { formatDate, formatDateTime, toReadable } from "@/pages/utils";
import { Input, Radio, Space } from "antd";

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
    tranType?:string;
  }
const HistoryAdjustmentTransactionList=({verifyContractId}:Props)=>{
    const requestActions = simpleRequestActions()
    // const [data, setData] = useState<DataType[]>()
    const actionRef = useRef<ActionType>();
    const [criteria, setCriteria] = useState<SearchCriteria>()
    const  optionsStatus=[
        { label: "All", value: "ALL",sort:1 },
        { label: "STD", value: "STD",sort:2 },
        { label: "Adj", value: "ADJ",sort:3 }
    ]
    const onSearchHandler = (value: string) => {
        setCriteria(v => ({ ...v, searchValue: value }));
        actionRef.current?.reloadAndRest?.();
    };
    // useEffect(()=>{
    //     loadData()
    // },[])
    // const loadData= async()=>{
    //     const rs = await GratisServices.fetchHistoryGratisTransList(verifyContractId).query(requestActions) 
    //     setData(
    //         rs.map(it =>{
    //             var children = it.items.map(r=>{ 
    //                 return ({
    //                     key: r.id,
    //                     name: `${r.docNum}`,
    //                     id: r.id,
    //                     docNum: r.docNum,
    //                     docDate: r.docDate,
    //                     itemCode: r.itemCode,
    //                     itemName:r.itemName,
    //                     qty: r.qty,
    //                     createdBy: r.createdBy,
    //                     createdDate: r.createdDate,
    //                     modifiedBy: r.modifiedBY,
    //                     modifiedDate: r.modifiedDate,
    //                     actionCode: r.actionCode
    //                 }as DataType)
    //             })
    //             return ({
    //                 key: it.item,
    //                 name: it.item,
    //                 children: children                   
    //             } as DataType)
    //         })
    //     )
    // }
    return (
    <ProTable<DataType> search={false} size="small"
        actionRef={actionRef}
        options={{
            fullScreen: false,
            density: false,
            reload: false,
            setting: false,
        }}
        tableExtraRender={()=>
            <Space direction="horizontal" >
                <Input.Search allowClear style={{marginTop: 0}} onSearch={onSearchHandler}/>
                <ProFormDateRangePicker 
                    fieldProps={{
                        style:{marginTop:10},
                        onChange(values) {
                            if(values && values.length>1){
                                const dateFrom = moment( values[0]?.toDate())
                                const dateTo = moment( values[1]?.toDate())
                                setCriteria(v=> {return{...v, dateFrom: dateFrom,dateTo: dateTo}})
                            } else{
                                setCriteria(v=> {return{...v, dateFrom: undefined,dateTo: undefined}})
                            } 
                            actionRef.current?.reloadAndRest?.();                           
                        },
                    }}                
                />
                <Radio.Group optionType="button"
                defaultValue={"ALL"}
                options={optionsStatus.sort((a,b)=> a.sort-b.sort )}
                onChange={(e) => {
                    const value = e.target.value
                    setCriteria(v => ({ ...v, filter: value }));
                    actionRef.current?.reloadAndRest?.();
                }}
                />
            </Space>
        } 

        // request={ async(page: any)=>{
        //     const rs = await GratisServices.fetchHistoryGratisTransList(verifyContractId).query(requestActions)          
        //     return {               
        //         success: true, 
        //         total: rs.length || 0,
        //         data: rs
        //     }
        // }}
        request={ async(page: any)=>{
            const rs = await GratisServices.fetchHistoryGratisTransList({...criteria,id: verifyContractId}||{id: verifyContractId}).query(requestActions)
            return{               
                success: true, 
                total: rs.length || 0,
                data: rs.map(it =>{
                    const children = it.items.map(r=>{ 
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
                            actionCode: r.actionCode,
                            tranType: r.tranType
                        }as DataType)
                    })
                    return ({
                        key: it.item,
                        name: it.item,
                        children: children                   
                    } as DataType)
                })
            }
        }}
        // dataSource={data}
        columns={[{
            title: 'Doc No',
            dataIndex:'name',
            // width: 120
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
            title: 'Type',     
            render:  (_, r) => toReadable(r.tranType)
        },{
            title: 'Qty',
            dataIndex:'qty'
        },/*{
            title: 'Created By',
            dataIndex:'createdBy'
        },{
            title: 'Created Date',
            dataIndex:'createdDate',
            width: 120,
            render:(_,r)=> formatDateTime(r.createdDate)
        },*/{
            title: 'Modified By',
            dataIndex:'modifiedBy'
        },{
            title: 'Modified Date',
            dataIndex:'modifiedDate',
            width: 120,
            render:(_,r)=> formatDateTime(r.modifiedDate,'YYYY-MM-DD')
        },{
            title: 'Action',
            dataIndex:'actionCode',
            render:(_,r)=> toReadable(r.actionCode)
        }]}
    />)
}
export default HistoryAdjustmentTransactionList
