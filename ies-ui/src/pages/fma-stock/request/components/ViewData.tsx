import { ActionType, ProCard, ProColumns, ProForm, ProFormTextArea, ProTable } from "@ant-design/pro-components";
import { StockRequestDetailResponse, StockRequestItemDetailResponse } from "../data.types";
import { Button, Checkbox, Descriptions, Divider, message } from "antd";
import { formatDate, formatDateTime } from "@/pages/utils";
import { useForm } from "antd/es/form/Form";
import PopconfirmMe from "@/pages/expense/delivery/components/PopconfirmMe";
import { CommentOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { simpleRequestActions } from "@/services/model";
import { createService } from "../services";

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
    const [stockRequest, setStockRequest] = useState<StockRequestDetailResponse>();

    useEffect(()=>{
        actionRef.current?.reload()
    },[forceRefresh])

    const columns: ProColumns<StockRequestItemDetailResponse>[] = [
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
            title:'Qty',
            dataIndex:'qty'

        },
        {
            title:'UoM',
            dataIndex:'uom'

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
        <ProCard title='Request Info'>
            <Descriptions>
            <Descriptions.Item label="From No" style={{ fontWeight: 'bolder' }}>
                {stockRequest?.formNo}
            </Descriptions.Item>
            <Descriptions.Item label="Expected Date">
                {stockRequest?.requestedDate && formatDateTime(stockRequest?.requestedDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Created Date">
                {stockRequest?.createdDate && formatDateTime(stockRequest?.createdDate)}
            </Descriptions.Item>
            <Descriptions.Item style={{ fontWeight: 'bolder' }} label="Group">
                {stockRequest?.groupName}{' '}
            </Descriptions.Item>    
            <Descriptions.Item style={{ fontWeight: 'bolder' }} label="Reason">{stockRequest?.reason} </Descriptions.Item>       
            <Descriptions.Item label="Created By">{stockRequest?.createdBy}</Descriptions.Item>
            <Descriptions.Item label="Remark">{stockRequest?.remarks}</Descriptions.Item>                
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
            <ProTable<StockRequestItemDetailResponse>
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