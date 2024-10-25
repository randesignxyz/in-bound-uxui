import ViewFormWrapper from "@/pages/process-flow/components/forms/ViewFormWrapper"
import { DataViewProps } from "@/pages/process-flow/data"
import { Spin } from "antd"
import DataView from "./data-view"
import { useState } from "react"

export default (props: DataViewProps) => {

   const [status, setStatus] = useState<string>()

   return <ViewFormWrapper<{ id: number }>
      workflowProp={props}
      cancelActionEnabled={status != undefined && status != "CANCELED"}
      actionHandlers={{
         onRefresh: () => {

         },
         onCancel: (remarks, files) => {
            console.log(remarks, files);
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