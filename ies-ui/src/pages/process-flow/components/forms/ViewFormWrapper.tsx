import AttachedFileList from '@/components/Attachment/AttachedFileList';
import { IProcessWorkflowModel } from '@/models/process-flow/data';
import ProcessFlowModel from '@/models/ProcessFlowModel';
import { downloadReport } from '@/services/apiGateway';
import { SimpleRequestActions, simpleRequestActions } from '@/services/model';
import { ProcessInstanceData, UserTask } from '@/services/process-workflow/data';
import { PageContainer } from '@ant-design/pro-components';
import { Flex, message, Modal, Spin, TabPaneProps, Tabs } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { history } from "@umijs/max";
import { DataViewProps } from '../../data';
import { ActionBtn, MoreAction } from '../ActionBtn';
import InstanceInfoComp from '../InstanceInfo';
import { ProcessFlowModalMngt } from '../ProcessFlowModalWrapper';
import ActivityView from './ActivityView';
import { FormOutlined, PaperClipOutlined, UnorderedListOutlined } from '@ant-design/icons';


interface Tab extends Omit<TabPaneProps, 'tab'> {
  key: string;
  label: React.ReactNode;
}
type WorkflfowAttachmentFile = {
  fileId: string, activity: string
}

interface Props<T> {
  workflowModel?: IProcessWorkflowModel;
  workflowProp: DataViewProps;
  moreActions?: (instanceData?: ProcessInstanceData<T>) => (MoreAction | undefined)[];
  attachedFiles?: WorkflfowAttachmentFile[];
  payload?: (instanceData: ProcessInstanceData<T>) => any;
  onSetProcessData?: (instanceData: ProcessInstanceData<T>) => void;
  hideExport?: boolean;
  actionHandlers?: {
    onActionInterceptor?: (action: string, requestActions: SimpleRequestActions, cb?: () => void) => Promise<boolean>;
    onValidate?: (action: String, task?: UserTask) => boolean;
    onRefresh?: () => void;
  };
  children: (instanceData?: ProcessInstanceData<T>, forceReload?: number) => React.ReactNode;
  onUpdateFileIds?: (procInstId: string, fileIds: string[]) => void;
  enabledUplodFile?: false | true;
}

const ViewFormWrapper = <T extends { id: number }>(props: Props<T>) => {

  const workflowModel = props.workflowModel || ProcessFlowModel();
  const { state, actions } = workflowModel
  const [forceReload, setForceReload] = useState(0)
  const requestActions = simpleRequestActions();

  const {
    // workflowModel: { state, actions },
    actionHandlers,
    workflowProp,
    hideExport,
    onSetProcessData,
    attachedFiles,
    moreActions,
    children,
    onUpdateFileIds,
    enabledUplodFile
  } = props;

  const refreshData = async () => {
    try {
      await workflowModel.actions.loadInstanceData(workflowProp.id, workflowProp.type || 'task');
      actionHandlers?.onRefresh?.()
      setForceReload(v => v + 1)
    } catch (error: any) {
      message.error(error.message || "Failed to load data")
    }
  }

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
          hideExport={hideExport}
          item={userTask}
          taskActions={taskActions}
          onValidate={actionHandlers?.onValidate}
          actionHandler={actionHandler}
          moreActions={moreActions?.filter(it => it) as MoreAction[]}
        />
      }
    </>
  );

  // const [contentType, setContentType] = useState('dataForm');

  const handleBackHandler = () => {
    history.back();
  };

  const isExternal = () => history.location.pathname.includes("/external/data-form/");

  const handleAction = async (action: string) => {

    if (actionHandlers?.onActionInterceptor) {

      const skip = await actionHandlers?.onActionInterceptor(action, requestActions, () => { })
      if (skip) return
    }
    if ('flow' == action) {
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
    } else if ('export' == action) {

      if (!state.instanceData?.processInstance?.procInstId) return;

      try {
        await downloadReport<{ processInstId: string; processDefKey: string; }>(requestActions)({
          reportName: 'export-form',
          fileName: `${state.instanceData?.processInstance.procName}_${moment().toDate().toDateString()}`,
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
        props.payload?.(state.instanceData as any),
      );
    }
  };


  const instanceInfo = state.instanceData && (
    <InstanceInfoComp
      requestor={state.instanceData?.requestor}
      userTask={state.instanceData?.task}
      processInstance={state.instanceData.processInstance}
      extra={props.workflowProp.openInTab && extraContent(
        handleAction,
        state.instanceData?.task,
        workflowProp.type == 'task',
        moreActions?.(state.instanceData),
      )}
    />
  );

  const tabList: Tab[] = [
    { key: 'dataForm', icon: <FormOutlined />, tabKey: 'dataForm', label: 'Data Form', children: children(state.instanceData, forceReload) },
    { key: 'activities', icon: <UnorderedListOutlined />, tabKey: 'activities', label: 'Activities', children: <ActivityView activityList={state.instanceData?.activities || []} /> },
    {
      key: 'attachment', icon: <PaperClipOutlined />, tabKey: 'attachment', label: 'Attachments', children: <AttachedFileList readonly={!enabledUplodFile}
        removeButton={false}
        onSetUploadFile={files =>
          //Save file
          files.length > 0 && onUpdateFileIds?.(
            state?.instanceData?.processInstance?.procInstId || '',
            files.map(it => it.response!!))


        }
        initFiles={[...(attachedFiles || []), ...(state.instanceData?.attachmentFiles || [])]} />
    }
  ]


  const notPageContainer = <Flex vertical>
    {instanceInfo}
    <Tabs items={tabList} />
  </Flex>

  const pageContainer = <PageContainer
    onBack={!isExternal() && !props.workflowProp.openInTab ? handleBackHandler : undefined}
    title={state.instanceData?.processInstance?.procName}
    subTitle={`# ${state.instanceData?.processInstance?.businessKey}`}
    content={instanceInfo}
    tabProps={{
      size: 'small',
    }}
    tabList={tabList}
    // onTabChange={setContentType}
    extra={extraContent(
      handleAction,
      state.instanceData?.task,
      workflowProp.type == 'task',
      moreActions?.(state.instanceData),
    )}
  />

  useEffect(() => {
    (async () => {
      try {
        workflowModel.actions.loadInstanceData(workflowProp.id, workflowProp.type || 'task')

      } catch (error) {
        message.error('Failed to load data');
      }
    })()

  }, []);

  useEffect(() => {
    if (state.instanceData)
      onSetProcessData?.(state.instanceData)
  }, [state.instanceData])


  return (
    <Spin spinning={(state.loading || false) || (requestActions.request?.loading || false)}>


      {props.workflowProp.openInTab ? notPageContainer : pageContainer}

      {/* <Spin spinning={(state.loading || false)}>
          {contentType == 'dataForm' && state.instanceData && children(state.instanceData, forceReload)}
          {contentType == 'activities' && (
            <ActivityView activityList={state.instanceData?.activities || []} />
          )}
          {
            contentType == 'attachment' &&
            <AttachedFileList readonly={!enabledUplodFile}
              removeButton={false}
              onSetUploadFile={files =>
                //Save file
                files.length > 0 && onUpdateFileIds?.(
                  state?.instanceData?.processInstance?.procInstId || '',
                  files.map(it => it.response!!))


              }
              initFiles={[...(attachedFiles || []), ...(state.instanceData?.attachmentFiles || [])]} />}
        </Spin> */}

      {/* 
      </PageContainer> */}
      <ProcessFlowModalMngt
        onRefresh={refreshData}
        workflowModel={workflowModel}
      />

    </Spin>
  );
};

export default ViewFormWrapper;
