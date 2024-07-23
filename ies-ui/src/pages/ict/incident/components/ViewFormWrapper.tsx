import AttachedFileList from '@/components/Attachment/AttachedFileList';
import { IProcessWorkflowModel } from '@/models/process-flow/data';
import { MoreAction } from '@/pages/process-flow/components/ActionBtn';
import ActivityView from '@/pages/process-flow/components/forms/ActivityView';
import InstanceInfoComp from '@/pages/process-flow/components/InstanceInfo';
import { ProcessFlowModalMngt } from '@/pages/process-flow/components/ProcessFlowModalWrapper';
import { DataViewProps } from '@/pages/process-flow/data';
import { downloadReport } from '@/services/apiGateway';
import { simpleRequestActions } from '@/services/model';
import { ProcessInstanceData, UserTask } from '@/services/process-workflow/data';
import { PageContainer } from '@ant-design/pro-components';
import { message, Modal, Spin } from 'antd';
import moment from 'moment';
import { useState } from 'react';
import { history } from "@umijs/max";
import { ActionBtn } from './ActionBtn';

interface Props<T> {
  workflowModel: IProcessWorkflowModel;
  workflowProp: DataViewProps;
  moreActions?: (instanceData?: ProcessInstanceData<T>) => (MoreAction | undefined)[];
  attachedFiles?: { fileId: string, activity: string }[];
  payload?: (instanceData?: ProcessInstanceData<T>) => any;
  actionHandlers?: {
    onValidate?: (action: String, task?: UserTask) => boolean;
    onRefresh?: () => void;
  };
  children: React.ReactNode;
}

const ViewFormWrapper = <T extends { id: number }>(props: Props<T>) => {

  const requestActions = simpleRequestActions();

  const {
    workflowModel: { state, actions },
    actionHandlers,
    workflowProp,
    attachedFiles,
    moreActions,
    children,
  } = props;
  const extraContent = (
    actionHandler: (key: string, item?: UserTask) => void,
    userTask?: UserTask,
    taskActions?: boolean,
    moreActions?: (MoreAction | undefined)[],
  ) => (
    <>
      {
        <ActionBtn
          key="action"
          item={userTask}

          taskActions={taskActions}
          onValidate={actionHandlers?.onValidate}
          actionHandler={actionHandler}
          moreActions={moreActions}
          noExport={true}
        />
      }
    </>
  );

  const [contentType, setContentType] = useState('dataForm');

  const instanceInfo = state.instanceData && (
    <InstanceInfoComp
      requestor={state.instanceData?.requestor}
      userTask={state.instanceData?.task}
      processInstance={state.instanceData.processInstance}
    />
  );

  const handleBackHandler = () => {
    history.back();
  };

  const isExternal = () => history.location.pathname.includes("/external/data-form/");


  const handleAction = async (action: string) => {
    if ('flow' === action) {
      if (!state.instanceData?.processInstance?.procInstId) return;
      actions.loadDiagram();
    } else if ('claimed' === action) {
      Modal.confirm({
        title: 'Claim Task',
        content: 'Are you sure?',
        onOk: actions.claim,
      });
    } else if ('unclaimed' === action) {
      Modal.confirm({
        title: 'Claim Task',
        content: 'Are you sure?',
        onOk: actions.unClaim,
      });
    } else if ('export' === action) {

      if (!state.instanceData?.processInstance?.procInstId) return;

      try {
        await downloadReport<{ processInstId: string; processDefKey: string; }>(requestActions)({
          reportName: 'export-form',
          fileName: `purchase_requisiton_${moment().toDate().toDateString()}`,
          type: 'PDF',
          data: {
            processInstId: state.instanceData?.processInstance.procInstId,
            processDefKey: state.instanceData?.processInstance.procDefKey
          }
        })
      } catch (error: any) {
        message.error(error.message || 'Failed to export data.')
      }

    }

    else {
      actions.openActionForm(
        state.instanceData?.task?.taskName || '',
        workflowProp.formKey,
        action,
        state.instanceData?.processInstance?.procInstId || '',
        state.instanceData?.task?.taskId,
        props.payload?.(state.instanceData),
      );
    }
  };

  return (
    <Spin spinning={(state.loading || false) || (requestActions.request?.loading || false)}>
      <PageContainer
        content={instanceInfo}
        onBack={!isExternal() ? handleBackHandler : undefined}
        title={state.instanceData?.processInstance?.procName}
        subTitle={`# ${state.instanceData?.processInstance?.businessKey}`}
        tabList={[
          { tab: 'Data Form', key: 'dataForm', tabKey: 'dataForm' },
          { tab: 'Activities', key: 'activities', tabKey: 'activities' },
          { tab: 'Attachments', disabled: (attachedFiles?.length || 0) == 0 && (state.instanceData?.attachmentFiles.length || 0) === 0, key: 'attachment', tabKey: 'attachment' },
        ]}
        onTabChange={setContentType}
        extra={extraContent(
          handleAction,
          state.instanceData?.task,
          workflowProp.type === 'task',
          moreActions?.(state.instanceData),
        )}
      >
        <Spin spinning={(state.loading || false)}>
          {contentType === 'dataForm' && children}
          {contentType === 'activities' && (
            <ActivityView activityList={state.instanceData?.activities || []} />
          )}
          {contentType == 'attachment' && <AttachedFileList readonly initFiles={[...(attachedFiles || []), ...(state.instanceData?.attachmentFiles || [])]} />}
        </Spin>

        <ProcessFlowModalMngt
          onRefresh={props.actionHandlers?.onRefresh}
          workflowModel={props.workflowModel}
        />
      </PageContainer>
    </Spin>
  );
};

export default ViewFormWrapper;
