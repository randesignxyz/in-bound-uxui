import { ActionType, ProCard, ProColumns, ProTable } from "@ant-design/pro-components";
import { TransferRequestDetailResponse, TransferRequestItemDetailResponse } from "../data.types";
import { Descriptions } from "antd";
import { formatDate, formatDateTime } from "@/pages/utils";
import { useForm } from "antd/es/form/Form";
import { useEffect, useRef, useState } from "react";
import { simpleRequestActions } from "@/services/model";
import { createService } from "../services";
import Status from "@/components/Status";

interface Props {
    title?:string; 
    instId?: string;
    forceRefresh?: number;
}
  
export default ({title,instId, forceRefresh }: Props) => {
    const [form] = useForm<{stockRemarks:string}>()
    const requestActions = simpleRequestActions();
    const services = createService(requestActions);
    const actionRef = useRef<ActionType>();
    const [stockRequest, setStockRequest] = useState<TransferRequestDetailResponse>();

    useEffect(()=>{
        actionRef.current?.reload()
    },[forceRefresh])

    const columns: ProColumns<TransferRequestItemDetailResponse>[] = [
        {
            title:'No',
            dataIndex:'seqNo',
            width: 50
        },
        {
            title:'Item Code',
            dataIndex:'itemCode'
        },
        {
            title:'Item Name',
            dataIndex:'itemName'

        },
        {
            title: 'Quantity Requested',
            width: 100,
            align: 'right',
            dataIndex:'qty'

        },
        {
            title:'UoM',
            dataIndex:'uom'

        },
        {
            title: 'To be Returned in Full or Partial (F/P)',
            width: 110,
            dataIndex:'returnType'

        },
        {
            title: 'Expected Return Date',
            width: 110,
            dataIndex:'returnDate',
            render: (_, r) => formatDate(r?.returnDate)

        },
        {
            title:'Remarks',
            dataIndex:'remarks'

        } ,{
            title:'Stock Comment',
            dataIndex:'stockRemarks'

        }

    ]
    
    return <>
        <ProCard title='Request Info' collapsible={true}>
            <Descriptions>
            <Descriptions.Item label="From No" style={{ fontWeight: 'bolder' }}>
                {stockRequest?.formNo}
            </Descriptions.Item>
            <Descriptions.Item label="Created By">{stockRequest?.createdBy}</Descriptions.Item>
           
            <Descriptions.Item label="Created Date">
                {stockRequest?.createdDate && formatDateTime(stockRequest?.createdDate)}
            </Descriptions.Item>
           
            <Descriptions.Item style={{ fontWeight: 'bolder' }} label="Group">
                {stockRequest?.groupName}{' '}
            </Descriptions.Item>  
            
            <Descriptions.Item style={{ fontWeight: 'bolder' }} label="From Warehouse">
                {stockRequest?.warehouseFrom}{' '}
            </Descriptions.Item>  
            <Descriptions.Item label="Posted Date">{stockRequest?.postedDate && formatDate(stockRequest?.postedDate)}</Descriptions.Item>

            <Descriptions.Item label="Expected Date">
                {stockRequest?.requestedDate && formatDate(stockRequest?.requestedDate)}
            </Descriptions.Item>
            <Descriptions.Item style={{ fontWeight: 'bolder' }} label="To Warehouse">
                {stockRequest?.warehouseTo}{' '}
            </Descriptions.Item>          
            <Descriptions.Item label="SAP Doc Num">{stockRequest?.sapDocNo}</Descriptions.Item>        
            <Descriptions.Item label="Reason" span={2}>{stockRequest?.reason}</Descriptions.Item>   
            <Descriptions.Item label="SAP Transfer Status">{stockRequest?.integratedStatus &&<Status text={stockRequest?.integratedStatus} />}</Descriptions.Item>              
            {stockRequest?.lastModifiedDate && (
                <Descriptions.Item label="Last Modified Date">
                {formatDateTime(stockRequest?.lastModifiedDate)}
                </Descriptions.Item>
            )}
            {stockRequest?.lastModifiedBy && (
                <Descriptions.Item label="Last Modified By">
                {stockRequest?.lastModifiedBy}
                </Descriptions.Item>
            )}
            </Descriptions>

        </ProCard>
        <ProCard title={title||'Item Request List'} collapsible={false} defaultCollapsed={false} style={{ marginTop: 10 }}>        
            <ProTable<TransferRequestItemDetailResponse>
                actionRef = {actionRef}
                search={false}  
                cardProps={false}
                options={{
                    fullScreen: false,
                    density: false,
                    reload: false,
                    setting: false,
                }} 
                
                request={async(page: any)=>{                
                    const rs = await services.detailByProcessFlow(instId||'')               
                    setStockRequest({ ...rs });
                    return {               
                        success: true, 
                        total: rs.items.length || 0,
                        data: rs.items
                    }
                }}
                columns={columns}
            />
        </ProCard>
    </>
}