import ViewFormWrapper from "@/pages/process-flow/components/forms/ViewFormWrapper";
import { DataViewProps } from "@/pages/process-flow/data";
import { Card, Descriptions, Divider, Spin, message } from "antd";
import ViewData from "../components/ViewData";
import { simpleRequestActions } from "@/services/model";
import { useEffect, useState } from "react";
import { TransferRequestDetailResponse } from "../data.types";
import ProcessFlowModel from "@/models/ProcessFlowModel";
import { createService } from "../services";
import { ProCard } from "@ant-design/pro-components";
import { formatDateTime } from "@/pages/utils";

export default (props: DataViewProps & {contribute?:{formNo:number}}) => {
    const workflowModel = ProcessFlowModel();
    const requestActions = simpleRequestActions();
    const services = createService(requestActions);
    const [stockRequest, setStockRequest] = useState<TransferRequestDetailResponse>();

    useEffect(() => {
        loadData();
    }, [workflowModel.state.instanceData]);
    
    const instId = workflowModel.state?.instanceData?.processInstance?.procInstId;
    const loadData = async () => {
      if (!instId) return;
      try {
          const data = await services.detailByProcessFlow(instId);
          setStockRequest({ ...data });
      } catch (error: any) {
          message.error(error.message || 'Failed to load request.');
      }
    };

    return(  
    <ViewFormWrapper<{ id: number }>
        workflowModel={workflowModel}
        workflowProp={props}
        attachedFiles={stockRequest?.fileIds?.map(it => ({ fileId: it, activity: 'Start' }))}
    >
        {(data) => {
        return (<Spin spinning={requestActions.request?.loading}>          
            {instId && <ViewData title="Item Request List" instId={instId}/>}
        </Spin>)
      }}
    </ViewFormWrapper>)
}