import React, { useEffect, useState } from 'react';

import { Card, Descriptions, Divider, Space, Tag, Typography } from 'antd';
import moment from 'moment';
import { ProcessInstance, UserResult, UserTask } from '@/services/process-workflow/data';
import { BasicContactData } from '@/pages/profile/data';
import { simpleRequestActions } from '@/services/model';
import { ProfileServices } from '@/pages/profile/service';
import QuickContactView from '@/pages/profile/QuickContactView';
import { toReadable } from '@/pages/utils';
import { ProCard } from '@ant-design/pro-components';

const statusColor = (status: string) => {
  if (status == 'PENDING') {
    return 'processing'
  } else if (status == "CANCELED" || status == "REJECTED") {
    return "error"
  } else {
    return "success"
  }
}

const InstanceInfoComp: React.FC<{
  requestor?: UserResult,
  processInstance?: ProcessInstance;
  userTask?: UserTask;
  loading?: boolean;
  title?: string;
  extra?: React.ReactNode;
}> = ({ title, requestor, processInstance, userTask, extra }) => {

  const requestActions = simpleRequestActions();
  const [contact, setContact] = useState<BasicContactData>()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const rs = processInstance?.startUserInfo && await ProfileServices.fetchBasicContact(processInstance.startUserInfo.id).query(requestActions)
        setContact(rs)
      } catch (error) {

      }

    })()
  }, [])

  const items: { label: string; value: string | React.ReactNode }[] = processInstance ? [
    //{ label: 'Job Title', value: requestor?.employee?.jobTitle || '' },
    { label: 'Org Info ', value: [requestor?.employee?.subDepartment, requestor?.employee?.department, requestor?.employee?.buName || processInstance.tenant].filter(it => it).join(", ") || '' },
    { label: 'Process Status', value: <Tag color={statusColor(processInstance.state)} >{toReadable(processInstance.state)}</Tag> },
  ] : [];

  type DisplayType = { label: string; value: string | React.ReactNode } | undefined

  const taskDisplay: DisplayType[] | undefined = userTask && [
    //{ label: 'Task Name', value: userTask.taskName },
    //{ label: 'Assignee', value: userTask.assigneeInfo ? [userTask.assigneeInfo?.name, userTask.assigneeInfo?.employee?.empNo].filter(it => it).join(' - ') : 'N/A' },
    { label: 'Task Started Date', value: moment(userTask.created).format("YYYY-MM-DD HH:mm:ss") },
    { label: 'Task Ended Date', value: userTask.ended ? moment(userTask?.ended).format("YYYY-MM-DD HH:mm:ss") : 'N/A' },
    userTask.description ? { label: 'Description', value: userTask.description } : undefined,
    { label: 'Task Status', value: <Tag color={userTask.completed ? "success" : "processing"}  >{userTask.completed ? "Completed" : "Active"}</Tag> },
  ]

  return <ProCard collapsible size='small' title="Request Info" subTitle={title} direction="row" gutter={[5, 5]} extra={extra}>
    <ProCard bordered size='small' title="Requested By " subTitle={`${[requestor?.employee?.empNo, requestor?.name].filter(it => it).join(' ')} - ${requestor?.employee?.jobTitle || ''}`}>
      <Descriptions column={taskDisplay ? 2 : undefined} contentStyle={{ fontWeight: 'bold' }} size='small' >
        {items.map(it => (
          <Descriptions.Item key={it.label} label={it.label}>{it.value}</Descriptions.Item>
        ))}
        {<Descriptions.Item label=" Contact">
          <Typography.Link onClick={() => setVisible(true)}>{contact?.contacts?.map(it => `${it.value} (${it.type.name})`).join(", ") || 'N/A'} </Typography.Link>
        </Descriptions.Item>}
      </Descriptions>
      {contact && <QuickContactView open={visible} onCancel={() => setVisible(false)} data={contact} />}
    </ProCard>
    {taskDisplay && <ProCard bordered size='small' title={userTask?.taskName} subTitle={`Assigned to ${[userTask?.assigneeInfo?.name].filter(it => it).join(' - ') || "N/A"} `} >
      <Descriptions column={2} contentStyle={{ fontWeight: 'bold' }} size='small' >
        {taskDisplay.map(it => (
          it && <Descriptions.Item key={it.label} label={it.label}>{it.value}</Descriptions.Item>
        ))}
      </Descriptions>

    </ProCard>}
  </ProCard>
};

export default InstanceInfoComp;
