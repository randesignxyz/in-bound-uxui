import ViewFormWrapper from "@/pages/process-flow/components/forms/ViewFormWrapper";
import { DataViewProps } from "@/pages/process-flow/data";
import { Card, Spin, message } from "antd";
import ViewData from "../components/ViewData";
import { simpleRequestActions } from "@/services/model";
import { useEffect, useState } from "react";
import { StockRequestDetailResponse } from "../data.types";
import ProcessFlowModel from "@/models/ProcessFlowModel";
import { createService } from "../services";

export default (props: DataViewProps) => {
    const workflowModel = ProcessFlowModel();
    const requestActions = simpleRequestActions();
    const services = createService(requestActions);
    const [stockRequest, setStockRequest] = useState<StockRequestDetailResponse>();

    useEffect(() => {
        loadData();
      }, [workflowModel.state.instanceData]);
    
    const loadData = async () => {
    const instId = workflowModel.state?.instanceData?.processInstance?.procInstId;
    if (!instId) return;
    try {
        const data = await services.detailByProcessFlow(instId);
        setStockRequest({ ...data });
    } catch (error: any) {
        message.error(error.message || 'Failed to load stock request.');
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
          <Card title='Item list' size='small' style={{ marginTop: 10 }}>
            <ViewData data={stockRequest} />
          </Card>
          {/* <Flow
            open={!!openFlow}
            onOpenChange={(visible) => !visible && setOpenFlow(undefined)}
            type={'PR'}
            fromId={openFlow || 0}
          /> */}
        </Spin>)
      }}
    </ViewFormWrapper>)
}