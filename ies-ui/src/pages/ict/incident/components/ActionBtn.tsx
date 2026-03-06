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
import React from 'react';

export interface MoreAction {
  icon: JSX.Element;
  key: string;
  name: string;
  action: () => void;
}
export const ActionBtn: React.FC<{
  item?: UserTask;
  taskActions?: Boolean;
  moreActions?: (MoreAction | undefined)[];
  onValidate?: (action: String, task?: UserTask) => boolean;
  actionHandler: (key: string, item?: UserTask) => void;
  noExport?: Boolean;
}> = ({ item, taskActions, moreActions, onValidate, actionHandler, noExport }) => {
  const actionList: (ActionDataType | undefined)[] = [
    item?.createSubTask
      ? { value: 'createSubTask', name: 'Create Sub Task', groupName: '' }
      : undefined,
    ...(item && taskActions ? item.actions : []),
  ];

  const onActionClick = () => {
    if (item?.completed) return;
    item && actionHandler(item?.claimed ? 'unclaimed' : 'claimed', item);
  };

  const getIcon = (action?: string) => {
    if (['Approved', 'Completed'].some((it) => it === action)) {
      return <CheckOutlined />;
    } else if (action === 'Rejected') {
      return <StopOutlined />;
    } else if (action === 'Reassigned') {
      return <UserSwitchOutlined />;
    } else if (action === 'On_Hold') {
      return <HolderOutlined />;
    } else if (action === 'Closed') {
      return <IssuesCloseOutlined />;
    } else {
      return <SelectOutlined />;
    }
  };

  return (
    <Space size={'large'}>
      <Space size={1}>
        {actionList
          .filter((it) => it)
          .map((it) => (
            <Button
              icon={getIcon(it?.value)}
              onClick={() => actionHandler(it?.value || '', item)}
              danger={it?.value === 'Rejected'}
              size="middle"
              type="primary"
              key={it?.value}
            >
              {it?.name}
            </Button>
          ))}
      </Space>
      <Space size={1}>
        <Button onClick={() => actionHandler('flow', item)} icon={<PartitionOutlined />}>
          Diagram
        </Button>
        {!noExport && <Button onClick={() => actionHandler('export', item)} icon={<FilePdfOutlined />}>
          Export
        </Button>}

        {taskActions && !item?.completed && (
          <Button
            size="middle"
            onClick={onActionClick}
            icon={item?.claimed ? <StopOutlined /> : <CheckCircleOutlined />}
          >

            {item?.claimed ? "Unclaim" : "Claim"}

          </Button>
        )}
      </Space>
    </Space>
  );
};

export const ActionIconText = ({
  icon,
  text,
  action,
  item,
  actionHandler,
}: {
  icon: any;
  text: string;
  action: string;
  item: UserTask;
  actionHandler: (key: string, item: UserTask) => void;
}) => (
  <span onClick={() => actionHandler(action, item)}>
    {React.createElement(icon, { style: { marginRight: 8 } })}
    {text}
  </span>
);
