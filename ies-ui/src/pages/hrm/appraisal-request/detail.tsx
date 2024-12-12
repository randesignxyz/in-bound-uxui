import ViewFormWrapper from "@/pages/process-flow/components/forms/ViewFormWrapper"
import { DataViewProps } from "@/pages/process-flow/data"
import { Spin, message } from "antd"
import DataView from "./data-view"
import { useState } from "react"
import { downloadReport } from "@/services/apiGateway"
import { ProcessInstanceData } from "@/services/process-workflow/data"
import moment from "moment"

export default (props: DataViewProps & {contributor?: {editable: boolean,showRating5: boolean, showImport: boolean}}) => {
   const [processData, setProcessData] = useState<ProcessInstanceData<{ id: number }>>()
    return <ViewFormWrapper<{ id: number }>
         workflowProp={props}
         onSetProcessData={setProcessData}
         actionHandlers={{
            onActionInterceptor:async (action, requestAction, cb) => {
              
               if (action == 'export'){
                  try {
                     await downloadReport<{ processInstId: string; processDefKey: string; }>(requestAction)({
                       reportName: 'export-form',
                       fileName: `${processData?.processInstance?.procName}_${moment().toDate().toDateString()}`,
                       type: 'EXCEL',
                       data: {
                        processInstId: processData?.processInstance?.procInstId!!,
                         processDefKey: processData?.processInstance?.procDefKey!!
                       }
                     })
                   } catch (error: any) {
                     message.error(error.message || 'Failed to export data.')
                   }
                  return true
               }
               return false
            }
         }}
         // moreActions={() => [{
         //    icon: <PartitionOutlined/>, key: 'view-flow', name: "Flow", action: () => {
         //       // setOpenFlow(priceComparisonDetail?.id)
         //     },
         // }]}
      >
         {(data, forceReload) => {      
            if(!data?.processInstance?.procInstId) return <Spin spinning = {true}/>
            return <DataView 
               taskCompleted={data?.task?.completed||false} 
               formStarted ={props?.type=='inst'?true:false}
               editable={(props.contributor?.editable||false)} 
               showRating5={(props.contributor?.showRating5||false)}
               showImport = {(props.contributor?.showImport||false)}
               forceReload={forceReload} 
               processInstaceId= {data.processInstance.procInstId} 
               processDefKey={processData?.processInstance?.currTaskName||''}
            />
         }}
      </ViewFormWrapper>
}