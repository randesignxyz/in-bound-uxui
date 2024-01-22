import {  ProCard } from "@ant-design/pro-components"
import { Space, Spin } from "antd"
import { useEffect, useState } from "react";
import { CriteriaExportReport, IncentiveSettlement } from "../types";
import { GratisServices } from "../services";
import { simpleRequestActions } from "@/services/model";
import { DownloadData, downloadReport1 } from "@/services/apiGateway";
import { replace } from "lodash";

const ItemDetail: React.FC<{ id: number,forceRefresh:number}>=({id,forceRefresh}) => {
    const requestActions = simpleRequestActions()
    const [fileurl, setFileUrl] = useState<string>();
    const [loading,setLoading] = useState<boolean>(false)
    useEffect(()=>{
        loadData()
    },[forceRefresh])
    const loadData = async () => {
        const rs = await GratisServices.fetchSettlementDetail(id).query(requestActions)
        // setData(rs)
        setLoading(true)
        const r = await downloadReport1<CriteriaExportReport>(requestActions)(dataReport({id:rs?.id,label:rs?.label,status:rs?.status,contractTypeCode:rs?.contractType?.code},'PDF'))
        setFileUrl(r)
        setLoading(false)
    }
    const dataReport=(data: {id?:number,label?: string,status?: string,contractTypeCode?: string},exportType: 'PDF' | 'EXCEL'): DownloadData<CriteriaExportReport>=> {   
        var direct = data?.contractTypeCode=='IN_DIRECT'? 'Indirect':'Direct'
        var issued=  data?.status=='ISSUED'? 'Issued':''
        var reportName = replace('SettlementIncentive@@##Report','@@',direct)
        reportName = replace(reportName,'##',issued) 
        return {
          reportName: 'gratis-settlement-cycle-report',
          fileName: `Settlement-Cycle-${data?.label}`,
          type: exportType,
          data: {
              id: data?.id||0,
              reportName: reportName
          }
      }
    
    }
    return<Spin spinning={loading} style={{padding:0,margin:0}} size="small">
        <iframe 
            src={fileurl}                     
            allowFullScreen
            allowTransparency            
            style={{ height:'560px', width: '100%',margin:0}} 
            />
    </Spin>

}

export default ItemDetail