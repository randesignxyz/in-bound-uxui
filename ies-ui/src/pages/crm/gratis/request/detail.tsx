import ViewFormWrapper from "@/pages/process-flow/components/forms/ViewFormWrapper"
import { DataViewProps } from "@/pages/process-flow/data"
import DataView from "./data-view"
import { Spin, message } from "antd"
import { replace } from "lodash"
import { CriteriaExportReport } from "../types"
import { DownloadData, downloadReport } from "@/services/apiGateway"
import { GratisServices } from "../services"
import { useState } from "react"
import { ProcessInstanceData } from "@/services/process-workflow/data"
import { FileExcelOutlined } from "@ant-design/icons"
import { SimpleRequestActions, simpleRequestActions } from "@/services/model"

export default (props: DataViewProps) => {
    const [processData, setProcessData] = useState<ProcessInstanceData<{ id: number }>>()
    const requestActions = simpleRequestActions()

    const dataReport=(data: {id?:number,label?: string,status?: string,contractTypeCode?: string},exportType: 'PDF' | 'EXCEL'): DownloadData<CriteriaExportReport>=> { 
      
        var direct = data?.contractTypeCode == 'OTHER' ? 'Display':data?.contractTypeCode == 'IN_DIRECT' ?'Indirect' : 'Direct'
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
    const downloadDataFile =async (exportType: 'PDF' | 'EXCEL',requestAction: SimpleRequestActions)=>{
        const data = await GratisServices.fetchSettlementDetailByInstId(processData?.processInstance?.procInstId!!).query(requestAction)                     
        await downloadReport<CriteriaExportReport>(requestActions)(dataReport({id:data?.id,label:data?.label,status:data?.status,contractTypeCode:data?.contractType?.code},exportType))
    }
    return <Spin spinning={requestActions.request?.loading || false} >
    <ViewFormWrapper<{id: number}>
        workflowProp={props}
        onSetProcessData={setProcessData}
        moreActions={() => [
            {
                icon: <FileExcelOutlined />, key: 'export-excel', name: "Excel",
                action: async () => {                    
                    try {                        
                        downloadDataFile('EXCEL',requestActions)
                    } catch (error: any) {
                        message.error(error.message || 'Failed to export data.')
                    }
                }
              }
        ]}
        actionHandlers={{
            onActionInterceptor:async (action, requestAction, cb) => { 
               if (action == 'export'){
                  try {                        
                    downloadDataFile('PDF',requestAction)
                   } catch (error: any) {
                     message.error(error.message || 'Failed to export data.')
                   }
                  return true
               }
               return false
            }
         }}
      >
        {(data, forceReload) => {
            if(!data?.processInstance?.procInstId) return <Spin spinning = {true}/>
            return <DataView forceReload={forceReload} processInstaceId= {data.processInstance.procInstId}/>
        }}
    </ViewFormWrapper></Spin> 
}