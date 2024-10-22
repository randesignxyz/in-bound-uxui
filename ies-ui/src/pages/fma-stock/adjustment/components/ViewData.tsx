import { ActionType, ProCard, ProColumns, ProTable } from "@ant-design/pro-components";
import { AdjRequestDetailResponse, AdjRequestItemDetailResponse } from "../data.types";
import { Descriptions, Table } from "antd";
import { formatDate, formatDateTime, formatter } from "@/pages/utils";
import { useForm } from "antd/es/form/Form";
import { useEffect, useRef, useState } from "react";
import { simpleRequestActions } from "@/services/model";
import { createService } from "../services";
import Status from "@/components/Status";
import { AdjustmentRequestFormNames } from "../process-flow";

interface Props {
    title?:string; 
    instId?: string;
    forceRefresh?: number;
    formKey?: string;
}
  
export default ({title,instId, forceRefresh,formKey }: Props) => {
    const [form] = useForm<{stockRemarks:string}>()
    const requestActions = simpleRequestActions();
    const services = createService(requestActions);
    const actionRef = useRef<ActionType>();
    const [stockRequest, setStockRequest] = useState<AdjRequestDetailResponse>();

    useEffect(()=>{
        actionRef.current?.reload()
    },[forceRefresh])

    const columns: ProColumns<AdjRequestItemDetailResponse>[] = [
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
            title: 'Request Type',
            width: 150,
            dataIndex:'requestType'

        },
        {
            title: 'Quantity Requested',
            width: 100,
            align: 'right',
            dataIndex:'qty'

        },
        {
            title:'UoM',
            width: 80,
            dataIndex:'uom'

        },
        {
            title:'BudgetCode',
            width: 120,
            dataIndex:'budgetCode'

        },
        
    ]
    const isViewCost = AdjustmentRequestFormNames.whApproval!=formKey
    if(isViewCost){
        columns.push(
            {
                title: 'Item Cost',
                width: 110,
                align: 'right',
                dataIndex:'itemCost',
                render:(_,r)=> formatter.format(r.itemCost)
    
            }
        )
        columns.push(
            {
                title: 'Amout',
                width: 110,
                align: 'right',
                dataIndex:'qty',
                render:(_,r) => {
                    return formatter.format((r.qty<0?-1:1)*(r.qty*r.itemCost))
                },
            }
        )
    }
    
    columns.push(
        {
            title:'Remarks',
            dataIndex:'remarks'

        }
    )
    
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
            
            {/* <Descriptions.Item style={{ fontWeight: 'bolder' }} label="From Warehouse">
                {stockRequest?.warehouseFrom}{' '}
            </Descriptions.Item>   */}
            {/* <Descriptions.Item label="Posted Date">{stockRequest?.postedDate && formatDate(stockRequest?.postedDate)}</Descriptions.Item> */}

            {/* <Descriptions.Item label="Expected Date">
                {stockRequest?.requestedDate && formatDate(stockRequest?.requestedDate)}
            </Descriptions.Item>
            <Descriptions.Item style={{ fontWeight: 'bolder' }} label="To Warehouse">
                {stockRequest?.warehouseTo}{' '} */}
            {/* </Descriptions.Item>           */}
            {/* <Descriptions.Item label="SAP Doc Num">{stockRequest?.sapDocNo}</Descriptions.Item>         */}
            <Descriptions.Item label="Reason" span={2}>{stockRequest?.reason}</Descriptions.Item>   
            {/* <Descriptions.Item label="SAP Transfer Status">{stockRequest?.integratedStatus &&<Status text={stockRequest?.integratedStatus} />}</Descriptions.Item>               */}
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
            <ProTable<AdjRequestItemDetailResponse>
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
                summary={(data) => {
                    var totalAmount = 0
                    data?.forEach((it) => {
                        totalAmount += (it.qty<0?-1:1)*(it.qty*it.itemCost)
                    })
                    return isViewCost&&(
                      <Table.Summary.Row style={{ textAlign: 'right', fontWeight: 'bold' }}>
                        <Table.Summary.Cell colSpan={8} index={8}>
                          {'Total Amount'}
                        </Table.Summary.Cell>
                        <Table.Summary.Cell colSpan={1} index={9} align="right">
                          {formatter.format(totalAmount || 0)}
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
            />
        </ProCard>
    </>
}