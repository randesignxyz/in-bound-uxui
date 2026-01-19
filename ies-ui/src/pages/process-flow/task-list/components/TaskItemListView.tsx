import ContributorFinder from '@/components/ContributorFinder';
import TaskStatus from '@/components/TaskStatus';
import { formatDateTime } from '@/pages/utils';
import { Paging } from '@/services/API';
import { execDataService0 } from '@/services/apiGateway';
import { simpleRequestActions } from '@/services/model';
import { UserTask } from '@/services/process-workflow/data';
import { Contributor } from '@/services/shared/data';
import {
  CheckCircleOutlined,
  DownOutlined,
  ExportOutlined,
  EyeOutlined,
  PartitionOutlined,
  SendOutlined,
  StarTwoTone,
  StopOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import ProList from '@ant-design/pro-list';
import { ActionType } from '@ant-design/pro-table';
import { useAccess } from '@umijs/max';
import { BackTop, Button, Col, Descriptions, Dropdown, Flex, Menu, message, Modal, Row, Space, SpinProps, Tag, Tooltip } from 'antd';
import { SortOrder } from 'antd/lib/table/interface';
import moment from 'moment';
import React, { MutableRefObject, useState, useContext } from 'react';
import { getQuikview } from '../../form-resources';
import DefaultQuickView from './DefaultQuickView';
import { PageWrapperContext } from '@/components/PageWrapper';

interface Props {
  data?: Paging<UserTask>;
  loading?: boolean | SpinProps;
  actionRef?: MutableRefObject<ActionType | undefined>;
  actionHandlers?: {
    onGotoPage?: (page: number, pageSize?: number) => void;
    onGogoDataView?: (item: UserTask, newTab?: boolean) => void;
    onSelectTaskFilter?: (value: any) => void;
    onSearchTask?: (value: string) => void;
    onShowDiagram?: (item: UserTask) => void;
    onShowAuthorizedTasksModal?: (item: UserTask) => void;
    onUnclaim?: (item: UserTask) => void;
    onClaim?: (item: UserTask) => void;
    onAssign?: (item: UserTask, cb?: (close: boolean) => void) => void;
    onShowActionModal?: (key: string, item: UserTask) => void;
    onDownload?: (item: UserTask) => void;
    onRequest?: (
      pagination: {
        pageSize?: number;
        current?: number;
      },
      sort?: Record<string, SortOrder>,
    ) => Promise<Paging<UserTask>>;
  };
}

const ListContent = ({ data }: { data: UserTask }) => (
  <Row justify="end">
    <Col flex={1}></Col>
    <Col flex={'400px'}>
      <Descriptions size="small" layout="vertical">
        <Descriptions.Item label="Task Name">{data.taskName}</Descriptions.Item>
        <Descriptions.Item style={{ width: 120 }} label="Created Date">
          {formatDateTime(moment(data.created).add(-7, 'hour'))}
        </Descriptions.Item>
        <Descriptions.Item style={{ width: 100 }} label="Assignee">
          {data.assignee || 'N/A'}
        </Descriptions.Item>
      </Descriptions>
    </Col>
  </Row>
);

export default ({ data, actionRef, actionHandlers }: Props) => {

  const access = useAccess()
  const { onAddTab, tabRender } = useContext(PageWrapperContext);
  const [assignModal, setAssignModal] = useState<UserTask>()
  const requestActions = simpleRequestActions()
  const ActionBtn: React.FC<{
    item: UserTask;
  }> = ({ item }) => {
    const items = [
      { key: 'detail', icon: <EyeOutlined />, onClick: () => actionHandlers?.onGogoDataView?.(item), label: 'Detail', visible: true },
      { key: 'diagram', icon: <PartitionOutlined />, onClick: () => actionHandlers?.onShowDiagram?.(item), label: 'View Diagram', visible: true },
      { key: 'destination', icon: <TeamOutlined />, onClick: () => actionHandlers?.onShowAuthorizedTasksModal?.(item), label: 'Approvers', visible: true },
      { key: 'unclaim', icon: <StopOutlined />, onClick: () => actionHandlers?.onUnclaim?.(item), label: 'Unclaim', visible: item.claimed && !item.completed },
      { key: 'claim', icon: <CheckCircleOutlined />, onClick: () => actionHandlers?.onClaim?.(item), label: 'Claim', visible: !item.claimed && !item.completed },
      { key: 'assign', icon: <UserOutlined />, onClick: () => setAssignModal(item), label: 'Assign', visible: access.canAssignWorkflow && !item.completed },
    ]
    const actions = item.actions.map(it => ({
      key: it.value,
      icon: <SendOutlined />,
      danger: ['rejected', 'canceled'].some(i => i == it.value.toLowerCase()),

      onClick: () => actionHandlers?.onShowActionModal?.(it.value, item),
      label: it.name, visible: item.claimed && !item.completed
    }))
    return (
      <Dropdown
        trigger={['click', 'hover']}
        menu={{
          items: [
            ...items.filter(it => it.visible),
            { type: 'divider' },
            ...actions.filter(it => it.visible),
          ]
        }}

      >
        <a>
          Actions <DownOutlined />
        </a>
      </Dropdown>
    );
  };

  const onRequestHandler = async (
    pagination: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    const data = await actionHandlers?.onRequest?.(pagination, sort);
    return {
      success: !!data,
      total: data?.total,
      data: data?.items,
    };
  };

  const onAssignHandler = (user: Contributor, cb?: (closed?: true) => void) => {
    if (!assignModal?.taskId) {
      message.error("No task selected.")
      return
    }
    Modal.confirm({
      title: "Assign Task",
      content: "Are you sure?",
      onOk: async () => {
        try {
          await execDataService0<{
            taskId: string;
            userId: string | number;
          }>({
            actionName: 'assign-task',
            endpoint: 'WORK_FLOW',
            payload: {
              taskId: assignModal.taskId,
              userId: user.id
            }
          })(requestActions)
          cb?.(true)
        } catch (error: any) {
          message.error(error.message || "Failed to assign.")
        }
      }
    })
  }
  return (<div>
    <ProList<UserTask>
      rowKey="id"
      actionRef={actionRef}
      request={onRequestHandler}
      columns={[{ title: 'test', dataIndex: 'instanceComment' }]}
      pagination={{}}
      metas={{
        avatar: {
          render: (_, r) => <TaskStatus status={r.completed ? 'COMPLETED' : 'PENDING'} />,
        },
        title: {
          render: (_, r) => (
            <Flex align='baseline'>
              <Button type='link' onClick={() => {
                actionHandlers?.onGogoDataView?.(r, true)
              }} title='Open in new tab' icon={<ExportOutlined size={5} />} />
              <a onClick={(e) => {
                const tabProp = tabRender?.(r).find(it => it.action == 'view')
                if (tabProp && onAddTab) {
                  onAddTab(r, tabProp)
                } else {
                  actionHandlers?.onGogoDataView?.(r)
                }
              }}>
                {' '}
                {r.instanceInfo.businessKey}{' '}
              </a></Flex>

          ),
        },
        subTitle: { render: (_, r) => <Space>{r.instanceInfo.processName}  {r.subTask && <Tag>Sub Task</Tag>}  {(r.subTasks?.length || 0) > 0 && <Tooltip title={`${r.subTasks?.length} sub task${(r.subTasks?.length || 0) > 0 && 's'} pending`}><StarTwoTone twoToneColor='#b49900' /></Tooltip>}</Space> },
        content: { render: (_, r) => ListContent({ data: r }) },
        description: {
          render: (_, r) => <Space direction='vertical'>{getQuikview(r) || <DefaultQuickView {...r} />}
            {(r.subTasks?.length || 0) > 0 && <Descriptions>
              <Descriptions.Item label="Sub taks"> {r.subTasks?.map(it => `${it.assignee || 'NA'} on ${formatDateTime(it.created)}`).join(", ")} </Descriptions.Item>
            </Descriptions>}
          </Space>
        },
        actions: {
          render: (_, r) => <ActionBtn key="more" item={r} />,
        },
      }}
    >
      <BackTop />
    </ProList>
    {assignModal && <ContributorFinder
      title="Assign contributor"
      onOpenChange={(visible) => !visible && setAssignModal(undefined)}
      open={true}
      width={1000}
      onSelectItem={(item, cb) => onAssignHandler(item, cb)}
      selectedList={[]} type={'USER'} />}
  </div>
  );
};
