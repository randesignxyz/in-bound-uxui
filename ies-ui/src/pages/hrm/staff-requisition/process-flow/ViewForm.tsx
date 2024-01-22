import ViewFormWrapper from "@/pages/process-flow/components/forms/ViewFormWrapper";
import { DataViewProps } from "@/pages/process-flow/data";
import { Modal, Spin, message } from "antd";
import { useState } from "react";
import StaffRequisitionRequestDetail from "./StaffRequisitionRequestDetail";
import { EmployeeServices } from "../../services";
import { simpleRequestActions } from "@/services/model";
// import { at } from "lodash";
import { useAccess } from "@umijs/max";

export default (props: DataViewProps) => {

   const [attatchFiles, setAttatchFiles] = useState<{ fileId: string, activity: string }[]>()
   // const [uploadFileIds, setUploadFileIds] = useState<string[]>([])
   const requestActions = simpleRequestActions();
   const [removeFile, setRemoveFile] = useState<string[]>([]);
   const access = useAccess()
   return (
      <ViewFormWrapper<{ id: number }>
         workflowProp={props}
         attachedFiles={attatchFiles}
         actionHandlers={{
            onRefresh: () => { }
         }}
         enabledUplodFile={access.canSupportHrStaffRequisition}
         onUpdateFileIds={async (procInstId, files) => {

            // if (attatchFiles?.every(it => !files.some(i => i == it.fileId)))
               Modal.confirm({
                  title: "Upload file",
                  content: "Are you sure?",
                  onOk: async () => {
                     try {
                        const saveFiles = files.filter(it => !removeFile.some(i => i == it))
                        const rs = await EmployeeServices.uploadFilesStaffRequisition(procInstId, saveFiles)(requestActions)
                        setAttatchFiles(v => [...(v || []), ...saveFiles.map(it => ({ fileId: it, activity: 'Attached' }))])
                     } catch (error: any) {
                        message.error("Failed to upload." || error.message)
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
               setAttachFiles={files => setAttatchFiles(files.map(it => ({ fileId: it, activity: 'Start' })))}
               processInstanceId={data?.processInstance?.procInstId}
            />
         }}
      </ViewFormWrapper>
   )
}