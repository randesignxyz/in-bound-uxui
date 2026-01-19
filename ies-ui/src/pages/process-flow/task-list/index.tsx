import { useEffect, useRef, useState } from 'react';
import { Checkbox, Modal, Space, Switch } from 'antd';
import { history } from 'umi';
import { ProTableProps } from '@ant-design/pro-components';
import { ActionType } from '@ant-design/pro-table';

import styles from './style.less';
import DefaultFilterComp, { FilterItem } from '@/components/DefaultFilter';
import { UserTask } from '@/services/process-workflow/data';
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { TaskListAdvanceSearchParams } from '@/services/process-workflow/params';
import TaskItemListView from './components/TaskItemListView';
import { ProcessFlowModalMngt } from '../components/ProcessFlowModalWrapper';
import ProcessFlowModel from '@/models/ProcessFlowModel';
import { SortOrder } from 'antd/lib/table/interface';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { set } from 'lodash';
import PageWrapper from '@/components/PageWrapper';
import Form from '../form';

const TaskList = () => {
  const model = ProcessFlowModel();
  const { state, actions } = model;
  const actionRef = useRef<ActionType>();
  const defaultTaskStatus = state.taskStatusFilterList?.[0];
  const [total, setTotal] = useState(0)

  const [searchParams, setSearchParams] = useState<TaskListAdvanceSearchParams>({
    isGlobal: true,
    status: defaultTaskStatus?.id || '',
    latest: true,
    myRequest: false
  });
  const [latest, setLatest] = useState(true);
  const supTitle = (total: number) => {
    return <sup
      style={
        {
          zIndex: 'auto',
          minWidth: '20px',
          height: '20px',
          padding: '0 6px',
          color: 'white',
          fontWeight: '400',
          fontSize: '12px',
          lineHeight: '20px',
          borderRadius: '10px',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          backgroundColor: '#ff4d4f',
        }
      }>{total}
    </sup>
  }
  const onMyRequestHandler = (e: CheckboxChangeEvent) => {
    var value = e.target.checked
    setSearchParams((v) => ({
      ...v,
      myRequest: value
    }))
  }

  const extraContent = (
    <Space align="baseline" style={{ right: '12px' }}>
      <DefaultFilterComp<FilterItem>
        items={state.taskStatusFilterList || []}
        isGlobal
        selectedItem={state.taskStatusFilterList?.find(it => it.id === searchParams.status) || defaultTaskStatus}
        onSearch={data => {
          setSearchParams(prev => ({ ...prev, ...data }));
        }}
      />
      {(total > 0) && <Checkbox name="myRequest" onChange={onMyRequestHandler}>My Request{supTitle(total)}</Checkbox>}
    </Space>
  );


  const handleGogoDataView = (item: UserTask, newTab?: boolean) => {
    const path = `/data-form/${item.taskDefKey}/${item.taskId}`;
    newTab ? window.open(`/external${path}`, "_blank") : history.push(path);
  };

  const onRequestHandler = async (params: TableViewSearchParams<TaskListAdvanceSearchParams>) => {
    try {
      const criteria = {
        isGlobal: searchParams.isGlobal,
        status: searchParams.status,
        myRequest: searchParams.myRequest,
        latest: searchParams.latest
      } as TaskListAdvanceSearchParams
      await actions.fetchMyRequestCount(criteria).then(rs => setTotal(rs.total))
      return await actions.loadTaskList(params);
    } catch (error) {
      return Promise.reject();
    }
  };

  useEffect(() => {
    actionRef.current?.reload();
  }, [searchParams, latest]);

  const actionHandlers = {
    onGogoDataView: handleGogoDataView,
    onShowActionModal: (key: string, task: UserTask) => task.formKey && actions.openActionForm(
      task.taskName, task.formKey,
      key, task.instanceInfo.processInstanceId,
      task.taskId
    ),
    onClaim: (item: UserTask) => {
      Modal.confirm({
        title: "Claim Task",
        content: "Are you sure?",
        onOk: async () => {
          await actions.claim({ taskId: item.taskId, ori: 'taskList' });
          actionRef.current?.reloadAndRest?.();
        },
      });
    },
    onUnclaim: (item: UserTask) => {
      Modal.confirm({
        title: "Unclaim Task",
        content: "Are you sure?",
        onOk: async () => {
          await actions.unClaim({ taskId: item.taskId, ori: 'taskList' });
          actionRef.current?.reloadAndRest?.();
        },
      });
    },
    onAssign: (item: UserTask) => { },
    onRequest: (pagination: {
      pageSize?: number;
      current?: number;
    },
      sort?: Record<string, SortOrder>,) => onRequestHandler({
        criteria: { ...searchParams, advanceSearch: { ...searchParams, latest }, sort },
        pagination,
      }),
    onShowAuthorizedTasksModal: (item: UserTask) => actions.showUserDest(item.taskId),
    onShowDiagram: (item: UserTask) => actions.loadDiagram(item.instanceInfo.processInstanceId),
    onDownload: (item: UserTask) => actions.downloadForm(item.instanceInfo.processInstanceId, `${item.instanceInfo.processName}.pdf`)
  };

  return (
    <>
      <PageWrapper<UserTask, TaskListAdvanceSearchParams, undefined>
        tabRender={(entity) => [
          {
            action: 'view',
            tabKey: entity?.taskId,
            tabLabel: entity?.instanceInfo?.businessKey || entity?.taskName || 'Task Detail',
            panel: (props) => (
              <Form openInTab formKey={entity?.formKey || ''} id={entity?.taskId} {...props} />
            ),
          },
        ]}
        listView={
          {
            type: 'Table',
            title: 'Task List',
            disableSearch: true,
            advanceSearchButton: (
              <Space align="center">
                {extraContent}
              </Space>
            ),
            actionButtons: [
              <Space align="center">
              <Switch checked={latest} onChange={setLatest} checkedChildren="Latest" />
              </Space>
            ],
            props: {
              tableRender: (
                props: ProTableProps<UserTask, TaskListAdvanceSearchParams>,
              ) => {
                return (
                  <TaskItemListView
                    {...props}
                    data={state.taskList}
                    actionRef={actionRef}
                    actionHandlers={actionHandlers}
                  />
                );
              },
              onFilter: (values: any) => {
                setSearchParams(prev => ({
                  ...prev,
                  status: values.status,
                }))
              },
              request: async (params, sort) => {
                const result = await onRequestHandler({
                  pagination: { current: params.criteria.current, pageSize: params.criteria.pageSize },
                  criteria: {
                    ...searchParams,
                    sort: sort as Record<string, SortOrder>,
                    advanceSearch: { ...searchParams, latest },
                  },
                });
                return {
                  data: result.items,
                  success: true,
                  total: result.total,
                };
              },
              columns: [],
            },
          } as any
        }
      />
      <ProcessFlowModalMngt onRefresh={actionRef.current?.reloadAndRest} workflowModel={model} />
    </>
  );
};

export default TaskList;
