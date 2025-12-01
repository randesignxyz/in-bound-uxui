import ViewFormWrapper from "@/pages/process-flow/components/forms/ViewFormWrapper";
import { DataViewProps } from "@/pages/process-flow/data";
import { Modal, Spin, message } from "antd";
import { useState } from "react";
import StaffRequisitionRequestDetail from "./StaffRequisitionRequestDetail";
import { EmployeeServices } from "../../services";
import { simpleRequestActions } from "@/services/model";
import { useAccess } from "@umijs/max";

export default (props: DataViewProps) => {

   const [attatchFiles, setAttatchFiles] = useState<{ fileId: string, activity: string }[]>()
   const requestActions = simpleRequestActions();
   const [removeFile, setRemoveFile] = useState<string[]>([]);
   const access = useAccess()
   const [status, setStatus] = useState<string>()
   return (
      <ViewFormWrapper<{ id: number }>
         workflowProp={props}
         attachedFiles={attatchFiles}
         cancelActionEnabled={status != undefined && status != "CANCELED"}
         actionHandlers={{
            onRefresh: () => {
            },
            onCancel: async (remarks, files) => {
               if (props.type == 'inst' && props.id) {
                  try {
                     await EmployeeServices.cancelRequisitionRequest({ processInstanceId: props.id, remarks, fileIds: files.map(it => it.response) })(requestActions)
                     return Promise.resolve()
                  } catch (error) {
                  }
               }
               return Promise.reject()
            },

         }}
         enabledUplodFile={access.canSupportHrStaffRequisition}
         onUpdateFileIds={async (procInstId, files) => {

            Modal.confirm({
               title: "Upload file",
               content: "Are you sure?",
               onOk: async () => {
                  try {
                     const saveFiles = files.filter(it => !removeFile.some(i => i == it))
                     await EmployeeServices.uploadFilesStaffRequisition(procInstId, saveFiles)(requestActions)
                     setAttatchFiles(v => [...(v || []), ...saveFiles.map(it => ({ fileId: it, activity: 'Attached' }))])
                  } catch (error: any) {
                     message.error(error.message || "Failed to upload.")
                  }
               },
               onCancel: () => {
                  setRemoveFile(files)
               }
            })
         }}
      >
         {(data) => {
            if (!data?.processInstance?.procInstId) return <Spin spinning={true} />
            return <StaffRequisitionRequestDetail
               onSetStatus={setStatus}
               setAttachFiles={files => setAttatchFiles(files.map(it => ({ fileId: it, activity: 'Start' })))}
               processInstanceId={data?.processInstance?.procInstId}
            />
         }}
      </ViewFormWrapper>
   )
}
