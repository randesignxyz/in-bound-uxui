import { useEffect, useRef, useState } from 'react';
import { Button, Card, Checkbox, Flex, Modal, Select, Space, Switch } from 'antd';
import { history } from 'umi';
import styles from './style.less';
import { ActionType } from '@ant-design/pro-table';
import DefaultFilterComp, { FilterItem } from '@/components/DefaultFilter';
import { UserTask } from '@/services/process-workflow/data';
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { TaskListAdvanceSearchParams } from '@/services/process-workflow/params';
import ProcessFlowModel from '@/models/ProcessFlowModel';
import { SortOrder } from 'antd/lib/table/interface';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import PageWrapper from '@/components/PageWrapper';
import TaskItemListView from './components/TaskItemListView';
import Form from '@/pages/process-flow/form';
import { ProcessFlowModalMngt } from '../components/ProcessFlowModalWrapper';
const TaskList = () => {

  const model = ProcessFlowModel();
  const { state, actions } = ProcessFlowModel();
  const actionRef = useRef<ActionType>();
  const defaultTaskStatus = state.taskStatusFilterList?.[0];
  const [total, setTotal] = useState(0);
  const [latest, setLatest] = useState(true);
  const [searchParams, setSearchParams] =
    useState<TaskListAdvanceSearchParams>({
      isGlobal: true,
      status: defaultTaskStatus?.id || '',
      latest: true,
      myRequest: false,
    });
  const supTitle = (value: number) => (
    <sup
      style={{
        minWidth: 20,
        height: 20,
        padding: '0 6px',
        color: '#fff',
        fontSize: 12,
        lineHeight: '20px',
        borderRadius: 10,
        backgroundColor: '#ff4d4f',
      }}
    >
      {value}
    </sup>
  );
  const onMyRequestHandler = (e: CheckboxChangeEvent) => {
    setSearchParams((v) => ({ ...v, myRequest: e.target.checked }));
    actionRef.current?.reloadAndRest?.();
  };
  const extraContent = (
    <DefaultFilterComp<FilterItem>
      items={state.taskStatusFilterList || []}
      isGlobal
      selectedItem={state.taskStatusFilterList?.find(it => it.id === searchParams.status) || defaultTaskStatus}
      onSearch={data => {
        setSearchParams(prev => ({ ...prev, ...data, latest }));
        actionRef.current?.reloadAndRest?.();
      }}
    />
  );
  const handleGotoDataView = (item: UserTask, newTab?: boolean) => {
    const path = `/data-form/${item.taskDefKey}/${item.taskId}`;
    newTab
      ? window.open(`/external${path}`, '_blank')
      : history.push(path);
  };
  const onRequestHandler = async (
    params: TableViewSearchParams<TaskListAdvanceSearchParams>,
  ) => {
    const criteria: TaskListAdvanceSearchParams = {
      isGlobal: searchParams.isGlobal,
      status: searchParams.status,
      myRequest: searchParams.myRequest,
      latest: searchParams.latest,
    };
    const rs = await actions.fetchMyRequestCount(criteria);
    setTotal(rs.total);
    return actions.loadTaskList(params);
  };
  useEffect(() => {
    setSearchParams((prev) => ({ ...prev, latest }));
    actionRef.current?.reloadAndRest?.();
  }, [latest]);
  const actionHandlers = {
    onGogoDataView: handleGotoDataView,
    onShowActionModal: (key: string, task: UserTask) =>
      task.formKey &&
      actions.openActionForm(
        task.taskName,
        task.formKey,
        key,
        task.instanceInfo.processInstanceId,
        task.taskId,
      ),

    onClaim: (item: UserTask) =>
      Modal.confirm({
        title: 'Claim Task',
        content: 'Are you sure?',
        onOk: async () => {
          await actions.claim({ taskId: item.taskId, ori: 'taskList' });
          actionRef.current?.reloadAndRest?.();
        },
      }),

    onUnclaim: (item: UserTask) =>
      Modal.confirm({
        title: 'Unclaim Task',
        content: 'Are you sure?',
        onOk: async () => {
          await actions.unClaim({ taskId: item.taskId, ori: 'taskList' });
          actionRef.current?.reloadAndRest?.();
        },
      }),

    onRequest: (
      pagination: { pageSize?: number; current?: number },
      sort?: Record<string, SortOrder>,
    ) =>
      onRequestHandler({
        criteria: {
          ...searchParams,
          advanceSearch: { ...searchParams, latest },
          sort,
        },
        pagination,
      }),

    onShowAuthorizedTasksModal: (item: UserTask) =>
      actions.showUserDest(item.taskId),

    onShowDiagram: (item: UserTask) =>
      actions.loadDiagram(item.instanceInfo.processInstanceId),

    onDownload: (item: UserTask) =>
      actions.downloadForm(
        item.instanceInfo.processInstanceId,
        `${item.instanceInfo.processName}.pdf`,
      ),
  };
  return (
    <>
      <PageWrapper<UserTask, TaskListAdvanceSearchParams, undefined>
        tabRender={(entity) => [
          {
            actions: 'view',
            tabLabel: entity?.taskName || 'Untitled',
            panel: (props) => (
              <Form
                openInTab
                formKey={entity?.formKey || ''}
                id={entity?.id as string | number}
                {...props}
              />
            ),
          },
        ]}
        listView={{
          title: 'Task List',
          advanceSearchButton: (
            <Space align="center">
              {extraContent}
              <Switch checked={latest} onChange={setLatest} checkedChildren="Latest" />
            </Space>
          ),
          render: (props) => (
              <TaskItemListView
                {...props}
                data={state.taskList}
                actionRef={actionRef}
                actionHandlers={actionHandlers}
              />
          ),
        }}
      >
        <ProcessFlowModalMngt onRefresh={actionRef.current?.reloadAndRest} workflowModel={model} />
      </PageWrapper>
    </>
  );
};

export default TaskList;
