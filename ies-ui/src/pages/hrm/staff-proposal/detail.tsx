import ViewFormWrapper from "@/pages/process-flow/components/forms/ViewFormWrapper"
import { DataViewProps } from "@/pages/process-flow/data"
import { Spin } from "antd"
import DataView from "./data-view"
import { useState } from "react"
import { EmployeeServices } from "../services"
import { simpleRequestActions } from "@/services/model"
import { createService } from "./services"

export default (props: DataViewProps) => {

  // === States ===
  const [status, setStatus] = useState<string>();

  // === Services ===
  const requestActions = simpleRequestActions();
  const services = createService(requestActions);

  // === JSX / ViewFormWrapper ===
  return (
    <ViewFormWrapper<{ id: number }>
      workflowProp={props}
      cancelActionEnabled={status != undefined && status != "CANCELED"}
      actionHandlers={{
        onRefresh: () => {}, // optional refresh handler
        onCancel: async (remarks, files) => {
          if (props.type == 'inst' && props.id) {
            try {
              await services.cancelRequest({
                processInstanceId: props.id,
                remarks,
                fileIds: files.map(it => it.response)
              });
              return Promise.resolve();
            } catch (error) {
              return Promise.reject(error);
            }
          }
          return Promise.reject();
        },
      }}
    >
      {(data, forceReload) => {
        if (!data?.processInstance?.procInstId) return <Spin spinning={true} />;

        return (
          <DataView
            onSetStatus={setStatus}
            forceReload={forceReload}
            processInstaceId={data.processInstance.procInstId}
          />
        );
      }}
    </ViewFormWrapper>
  );
};
