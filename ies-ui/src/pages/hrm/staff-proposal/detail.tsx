import ViewFormWrapper from "@/pages/process-flow/components/forms/ViewFormWrapper"
import { DataViewProps } from "@/pages/process-flow/data"
import { Spin } from "antd"
import DataView from "./data-view"
import { useState } from "react"
import { EmployeeServices } from "../services"
import { simpleRequestActions } from "@/services/model"
import { createService } from "./services"

export default (props: DataViewProps) => {

   const [status, setStatus] = useState<string>()
   const requestActions = simpleRequestActions()
   const services = createService(requestActions)
   return <ViewFormWrapper<{ id: number }>
      workflowProp={props}
      cancelActionEnabled={status != undefined && status != "CANCELED"}
      actionHandlers={{
         onRefresh: () => {

         },
         onCancel: async (remarks, files) => {
            if (props.type == 'inst' && props.id) {
               try {
                  await services.cancelRequest({ processInstanceId: props.id, remarks, fileIds: files.map(it => it.response) })
                  return Promise.resolve()
               } catch (error) {
               }
            }
            return Promise.reject()
         },
      }}
   >
      {(data, forceReload) => {
         if (!data?.processInstance?.procInstId) return <Spin spinning={true} />
         return <DataView onSetStatus={setStatus} forceReload={forceReload} processInstaceId={data.processInstance.procInstId} />
      }}
   </ViewFormWrapper>
}