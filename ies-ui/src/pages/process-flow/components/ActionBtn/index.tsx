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
import { Button, Dropdown, Flex, Menu, Space } from 'antd';
import React from 'react';

const ActionIcons = { flow: <PartitionOutlined style={{ fontSize: '16px', color: '#08c' }} /> };

export interface MoreAction {
  icon: JSX.Element;
  key: string;
  name: string;
  danger?: boolean;
  hidden?: boolean;
  action: () => void;
}
export const ActionBtn: React.FC<{
  item?: UserTask;
  taskActions?: Boolean;
  hideExport?: boolean;
  moreActions?: (MoreAction | undefined)[];
  onValidate?: (action: String, task?: UserTask) => boolean;
  actionHandler: (key: string, item?: UserTask) => void;
}> = ({ item, hideExport, taskActions, moreActions, onValidate, actionHandler }) => {
  const actionList: (ActionDataType | undefined)[] = [
    // { value: 'flow', name: 'View Flow', groupName: '' },
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
    if (['Approved', 'Completed'].some((it) => it == action)) {
      return <CheckOutlined />;
    } else if (action == 'Rejected') {
      return <StopOutlined />;
    } else if (action == 'Reassigned') {
      return <UserSwitchOutlined />;
    } else if (action == 'OnHold') {
      return <HolderOutlined />;
    } else if (action == 'Closed') {
      return <IssuesCloseOutlined />;
    } else {
      return <SelectOutlined />;
    }
  };

  return (
    <Space size={'large'}>
      <Flex gap={5}>
        {moreActions?.filter(it => !it?.hidden)?.map(it => (<Button danger={it?.danger} icon={it?.icon} key={it?.key} onClick={it?.action}>
          {it?.name}
        </Button>))}
        {actionList
          .filter((it) => it)
          .map((it) => (
            <Button
              icon={getIcon(it?.value)}
              onClick={() => actionHandler(it?.value || '', item)}
              danger={it?.value == 'Rejected'}
              size="middle"
              type={it?.value != 'Rejected' ? "primary" : undefined}
              key={it?.value}
            >
              {it?.name}
            </Button>
          ))}
      </Flex>
      <Flex gap={5}>
        <Button onClick={() => actionHandler('flow', item)} icon={<PartitionOutlined />}>
          Diagram
        </Button>
        {!hideExport && <Button onClick={() => actionHandler('export', item)} icon={<FilePdfOutlined />}>
          Export
        </Button>}

        {taskActions && !item?.completed && (
          <Button
            size="middle"
            onClick={onActionClick}
          >
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


      </Flex>
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
