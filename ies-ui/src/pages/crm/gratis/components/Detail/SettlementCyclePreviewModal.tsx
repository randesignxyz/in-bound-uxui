import { ActionType, ModalForm, ModalFormProps, ProTable } from "@ant-design/pro-components"
import { SettlementCycle } from "../../types";
import { GratisServices } from "../../services";
import { simpleRequestActions } from "@/services/model";
import { Paging } from "@/services/API";
import { formatDate, toReadable } from "@/pages/utils";
import moment from "moment";
import { useEffect, useRef } from "react";

interface Props {
    id: number;
    trigger?: JSX.Element;
}
export default({id,trigger}:Props)=>{
    const requestActions = simpleRequestActions()
    const actionRef = useRef<ActionType>();
    useEffect(()=>{
        actionRef.current?.reload()
    },[])
    return(<ModalForm width={'98%'} size="small"
        trigger={trigger}
        title={'Settlement Cycle'}
        onFinish = {async dataForm => {
            return false;
        }}       
        submitter={false}
    >
        <ProTable<SettlementCycle>
            actionRef={actionRef}
            size={'small'}
            search={false}
            options={{
                fullScreen: false,
                density: false,
                reload: false,
                setting: false,
            }} 
            request = {async (page) => {
                return  GratisServices.fetchSettlementCycle(id,page.current||0, page?.pageSize||20).query(requestActions).then(it=>{
                    return{
                        success: true, 
                        total: it.total,
                        data: it.items
                    }
                }) as Promise<Paging<SettlementCycle>>
            }}
            columns={[
                {
                    title:'Process Period',
                    render:(_,r)=> formatDate(r.endedDate,'YYYY-MM')
                },
                {
                    title:'Customer Id',
                    dataIndex:'customerCode'
                },
                {
                    title:'Customer Name',
                    dataIndex:'customerName'
                },
                {
                    title:'Provine',
                    width:120,
                    dataIndex:'provine'
                }
                ,
                {
                    title:'Region',
                    dataIndex:'region'
                },
                {
                    title:'Budget Code',
                    width:120,
                    dataIndex:'budgetCode'
                },
                {
                    title:'Sub Contract',
                    dataIndex:'contractType'
                },
                {
                    title:'Settlem Frequency',
                    dataIndex:'settledFrequency'
                },
                {
                    title:'SKU is Settled',
                    dataIndex:'skuSettled'
                },
                {
                    title:'Quantity',
                    align:'right',
                    dataIndex:'offers'
                },
                {
                    title:'Term',
                    dataIndex:'term'
                },
                {
                    title:'Remark',
                    dataIndex:'status',
                    render: (_, r) => {
                        var status = r.status==='ACHIEVED'? `(${r.achieved}/${r.months})${ toReadable(r.status)}`: toReadable(r.status)
                       return `from ${formatDate(r.effectiveDate,'YYYY-MM')} ${formatDate(r.expiryDate,'YYYY-MM')} ${status}`
                    }
                }
            ]}
        />

    </ModalForm>

    )
}