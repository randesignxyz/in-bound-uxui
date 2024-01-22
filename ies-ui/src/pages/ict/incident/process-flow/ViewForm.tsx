import ProcessFlowModel from '@/models/ProcessFlowModel';
import { DataViewProps } from '@/pages/process-flow/data';
// import ViewFormWrapper from '@/pages/process-flow/components/forms/ViewFormWrapper';
import { Card, message, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { simpleRequestActions } from '@/services/model';
import { IncidentServiceAPI } from '@/services/ict/services';
import { IncidentDetailResponse } from '@/services/ict/data';
import AnalystViewData from '../components/AnalystViewData';
import { UserResult } from '@/services/process-workflow/data';
import { WorkflowServiceAPI } from '@/services/process-workflow/services';
import ViewFormWrapper from '../components/ViewFormWrapper';

export default (props: DataViewProps) => {
  const workflowModel = ProcessFlowModel();
  const requestActions = simpleRequestActions();
  const services = IncidentServiceAPI(requestActions);
  const workflowServices = WorkflowServiceAPI(requestActions);

  const [incident, setIncident] = useState<IncidentDetailResponse>();
  const [requestor, setRequestor] = useState<UserResult>();

  useEffect(() => {

    (async () => {
      try {
        workflowModel.actions.loadInstanceData(props.id, props.type || 'task');
      } catch (error) {
        message.error('Failed to load data');
      }
    })()

  }, []);

  useEffect(() => {

    loadData();
  }, [workflowModel.state.instanceData]);

  const loadData = async () => {

    const instId = workflowModel.state?.instanceData?.processInstance?.procInstId;

    if (!instId) return;
    try {
      const data = await services.detailByProcessFlow(instId);
      setIncident({ ...data });
      const userResult = await workflowServices.findUser({ id: data.requestedBy });
      setRequestor(userResult);
    } catch (error: any) {
      message.error(error.message || 'Failed to load incident.');
    }
  };

  const refreshData = async () => {

    try {
      await workflowModel.actions.loadInstanceData(props.id, props.type || 'task');
    } catch (error: any) {
      message.error(error.message || "Failed to load data")
    }
  }

  return (
    <ViewFormWrapper<{ id: number }>
      workflowModel={workflowModel}
      workflowProp={props}
      attachedFiles={incident?.fileIds?.map(it => ({ fileId: it, activity: 'Start' }))}
      actionHandlers={{
        onRefresh: refreshData
      }}
    >
      <Spin spinning={requestActions.request?.loading}>
        <Card title='Incident' size='small' style={{ marginTop: 10 }}>
          <AnalystViewData workflowModel={workflowModel} data={incident} requestor={requestor} />
        </Card>
      </Spin>
    </ViewFormWrapper>
  );
};
