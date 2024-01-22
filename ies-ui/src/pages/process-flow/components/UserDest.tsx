import { UserDestItem } from '@/services/process-workflow/data';
import { Modal, Table } from 'antd';
import moment from 'moment';
import React from 'react';

export interface UserDestProps {
  visible?: boolean;
  onCancel: () => void;
  data?: UserDestItem[];
}

export const UserDest: React.FC<UserDestProps> = ({ visible, data, onCancel }) => {
  return (
    <Modal
      open={visible}
      title="Destination Users"
      destroyOnClose
      width="900px"
      footer={false}
      onCancel={onCancel}
    >
      <Table<UserDestItem>
        columns={[
          { title: 'Emp No', dataIndex: 'empNo' },
          {
            title: 'Name',
            render: (_, it) => {
              return it.empNo ? `${it.firstName} ${it.lastName}` : it.userId;
            },
          },
          {
            title: 'Start Date',
            render: (_, it) => {
              return moment(it.startedDate).add(-7, 'hour').format('YYYY-MM-DD h:mm:ss a');
            },
          },
          {
            title: 'End Date',
            render: (_, it) => {
              return it.endedDate && moment(it.endedDate).add(-7, 'hour').format('YYYY-MM-DD h:mm:ss a');
            },
          },
        ]}
        dataSource={data}
        pagination={false}
        rowKey="userId"
        size="small"
      />
    </Modal>
  );
};

export default UserDest;
