import React from "react";
import { formatDate, toReadable} from "@/pages/utils";
import {  GratisInvoice, GratisVerifyItem} from "../../types";
import { Button, Modal, message} from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { AuditOutlined, DeleteOutlined, FileTextOutlined } from "@ant-design/icons";
import { ProTable } from "@ant-design/pro-components";
import Tooltip from "antd/lib/tooltip";
import PopconfirmMe from "@/pages/expense/delivery/components/PopconfirmMe";
import { GratisServices } from "../../services";
import { simpleRequestActions } from "@/services/model";



const GratisVerifytemList: React.FC<{item: GratisVerifyItem,isVerify: boolean; onFinish:()=> void}> = ({item, isVerify,onFinish}) => {
  const requestActions = simpleRequestActions()
  const removeHandler= async (id: number) =>{
    try {
      await GratisServices.removeGContractVerifyTrans(id)(requestActions);       
      onFinish()     
    } catch (error: any) {
      message.error(error.message || 'Failed to remove.')
    }
  }

  return <ProTable<GratisInvoice>
    search={false}     
    // actionRef={actionRef}
    cardProps={false}
    options={{
        fullScreen: false,
        density: false,
        reload: false,
        setting: false,
    }} 
    columns={[
      {
        title: 'Doc No',  
        render:  (_, r) => <Tooltip title={toReadable(r.dataSource)}>{r.editable?<FileTextOutlined/> :<AuditOutlined/>} {r.invNum}</Tooltip> 
      },{
        title: 'Doc Date',     
        render:  (_, r) => formatDate(r.invDate)
      },{
        title: 'Type',     
        render:  (_, r) =>r.actionCode
      },{
        title: 'Quantity',
        align: 'right',
        dataIndex: 'qty'
      },{
        title:'',
        align: 'left',
        width: 12,
        render:(_,r) => r.editable && isVerify?
          <PopconfirmMe onConfirm={()=>{removeHandler(r.id)}} placement="leftBottom" title='Confirmation' description="Are you sure to Remove?">
            <Button size="small" type="link" icon={<DeleteOutlined/>} danger></Button>
          </PopconfirmMe>:''      
      }
    ]}
    style = {{background: '#f2c3bd'}}
    rowKey="invItermCode"
    key={`table-${item.itemCode}`}
    dataSource={item.invoices || []}        
    pagination={false}
    size="small"
  />
}
export default GratisVerifytemList;