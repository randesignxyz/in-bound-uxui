import React from 'react';
import { ActionDataType, UserTask } from '@/services/process-workflow/data';
import {
  CheckCircleOutlined,
  CheckOutlined,
  FilePdfOutlined,
  HolderOutlined,
  IssuesCloseOutlined,
  PartitionOutlined,
  SelectOutlined,
  StopOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { Button, Space } from 'antd';

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
  moreActions?: (MoreAction | undefined)[];
  onValidate?: (action: string, task?: UserTask) => boolean;
  actionHandler: (key: string, item?: UserTask) => void;
}

const getIcon = (action?: string) => {
  switch (action) {
    case 'Approved':
    case 'Completed':
      return <CheckOutlined />;
    case 'Rejected':
      return <StopOutlined />;
    case 'Reassigned':
      return <UserSwitchOutlined />;
    case 'OnHold':
      return <HolderOutlined />;
    case 'Closed':
      return <IssuesCloseOutlined />;
    default:
      return <SelectOutlined />;
  }
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

export const ActionBtn: React.FC<ActionBtnProps> = ({
  item,
  hideExport,
  taskActions,
  moreActions,
  actionHandler,
}) => {
  const actionList: (ActionDataType | undefined)[] = [
    item?.createSubTask ? { value: 'createSubTask', name: 'Create Sub Task', groupName: '' } : undefined,
    ...(item && taskActions ? item.actions : []),
  ];

  const onActionClick = () => {
    if (item?.completed) return;
    actionHandler(item?.claimed ? 'unclaimed' : 'claimed', item);
  };

  return (
    <Space size="large">
      <Space>
        {moreActions?.filter(action => !action?.hidden).map(action => (
          <Button
            danger={action?.danger}
            icon={action?.icon}
            key={action?.key}
            onClick={action?.action}
          >
            {action?.name}
          </Button>
        ))}
        {actionList.filter(action => action).map(action => (
          <ActionButton key={action?.value} action={action} item={item} actionHandler={actionHandler} />
        ))}
      </Space>
      <Space>
        <Button onClick={() => actionHandler('flow', item)} icon={<PartitionOutlined />}>
          Diagram
        </Button>
        {!hideExport && (
          <Button onClick={() => actionHandler('export', item)} icon={<FilePdfOutlined />}>
            Export
          </Button>
        )}
        {taskActions && !item?.completed && (
          <Button size="middle" onClick={onActionClick}>
            {item?.claimed ? (
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
