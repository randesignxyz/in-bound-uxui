import React from 'react';
import { ActionDataType, UserTask } from '@/services/process-workflow/data';
import {
  CheckCircleOutlined,
  CheckOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  HolderOutlined,
  IssuesCloseOutlined,
  PartitionOutlined,
  SelectOutlined,
  StopOutlined,
  UnorderedListOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { Button, Space } from 'antd';
import { history} from 'umi';

const ActionIcons = {
  flow: <PartitionOutlined style={{ fontSize: '16px', color: '#08c' }} />,
};

export interface MoreAction {
  icon: JSX.Element;
  key: string;
  name: string;
  danger?: boolean;
  hidden?: boolean;
  action: () => void;
}

interface ActionBtnProps {
  item?: UserTask;
  taskActions?: boolean;
  hideExport?: boolean;
  processEnded?: boolean,
  cancelActionEnabled?: boolean;
  moreActions?: MoreAction[];
  onValidate?: (action: string, task?: UserTask) => boolean;
  actionHandler: (key: string, item?: UserTask) => void;
}

const getIcon = (action?: string) => {
  const iconMap: Record<string, JSX.Element> = {
    Approved: <CheckOutlined />,
    Completed: <CheckOutlined />,
    Rejected: <StopOutlined />,
    Reassigned: <UserSwitchOutlined />,
    OnHold: <HolderOutlined />,
    Closed: <IssuesCloseOutlined />,
  };
  return iconMap[action || ''] || <SelectOutlined />;
};

const ActionButton: React.FC<{
  action: ActionDataType | undefined;
  item?: UserTask;
  actionHandler: (key: string, item?: UserTask) => void;
}> = ({ action, item, actionHandler }) => (
  <Button
    icon={getIcon(action?.value)}
    onClick={() => actionHandler(action?.value || '', item)}
    danger={action?.value === 'Rejected'}
    size="middle"
    type={action?.value !== 'Rejected' ? 'primary' : undefined}
    key={action?.value}
  >
    {action?.name}
  </Button>
);

const MoreActionsButtons: React.FC<{
  moreActions?: MoreAction[];
}> = ({ moreActions }) => (
  <>
    {moreActions?.filter(action => !action?.hidden).map(action => (
      <Button
        danger={action.danger}
        icon={action.icon}
        key={action.key}
        onClick={action.action}
      >
        {action.name}
      </Button>
    ))}
  </>
);

const TaskActionButtons: React.FC<{
  item?: UserTask;
  taskActions?: boolean;
  actionHandler: (key: string, item?: UserTask) => void;
}> = ({ item, taskActions, actionHandler }) => (
  <>
    {item && taskActions && !item.completed && (
      <Button size="middle" onClick={() => actionHandler(item.claimed ? 'unclaimed' : 'claimed', item)}>
        {item.claimed ? (
          <>
            <StopOutlined /> Unclaim
          </>
        ) : (
          <>
            <CheckCircleOutlined /> Claim
          </>
        )}
      </Button>
    )}
  </>
);

export const ActionBtn: React.FC<ActionBtnProps> = ({
  item,
  hideExport,
  processEnded,
  cancelActionEnabled,
  taskActions,
  moreActions,
  actionHandler,
}) => {
  const actionList: (ActionDataType | undefined)[] = [
    item?.createSubTask ? { value: 'createSubTask', name: 'Create Sub Task', groupName: '' } : undefined,
    ...(item && taskActions ? item.actions : []),
  ];
  const isExternal = () => history.location.pathname.includes("/external/data-form/");
  return (
    <Space size="large">

      <Space>
        {isExternal() && <Button icon={<UnorderedListOutlined/>} type='link'  onClick={() => history.push(`/task-list`)}>Task List</Button>}
        <MoreActionsButtons moreActions={moreActions} />
        {actionList.filter(action => action).map(action => (
          <ActionButton key={action?.value} action={action} item={item} actionHandler={actionHandler} />
        ))}
      </Space>

      <Space>
        {processEnded && cancelActionEnabled && <Button danger onClick={() => actionHandler('cancel', item)} icon={<DeleteOutlined />}>Cancel</Button>}
        <Button onClick={() => actionHandler('flow', item)} icon={<PartitionOutlined />}>
          Diagram
        </Button>
        {!hideExport && (
          <Button onClick={() => actionHandler('export', item)} icon={<FilePdfOutlined />}>
            Export
          </Button>
        )}

        <TaskActionButtons item={item} taskActions={taskActions} actionHandler={actionHandler} />
        
      </Space>
    </Space>
  );
};

export const ActionIconText: React.FC<{
  icon: any;
  text: string;
  action: string;
  item: UserTask;
  actionHandler: (key: string, item: UserTask) => void;
}> = ({ icon, text, action, item, actionHandler }) => (
  <span onClick={() => actionHandler(action, item)}>
    {React.createElement(icon, { style: { marginRight: 8 } })}
    {text}
  </span>
);
