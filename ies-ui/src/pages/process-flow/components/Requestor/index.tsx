import React, { useState } from 'react';
import { Card, Modal, Descriptions, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import moment from 'moment';
import { UserResult } from '@/services/process-workflow/data';
import { formatConfig } from '@/pages/utils';
import SearchAccountComp from '../SearchAccount';
import { SearchAccount } from '@/services/account/data';

const RequestorComp: React.FC<{
  requestor?: UserResult;
  notAllowToChangeRequestor?: boolean;
  actionHandlers?: {
    onSearchRequestor?: (searchValue?: string) => void;
    onSetRequestor?: (userId: string) => Promise<void>;
  };
}> = ({ requestor, notAllowToChangeRequestor, actionHandlers }) => {
  const [modelVisible, setModelVisible] = useState(false);

  const onAddedHandler = async (item: SearchAccount) => {
    try {
      await actionHandlers?.onSetRequestor?.(item.id);
      setModelVisible(false);
    } catch (error) {
      message.error('Failed to select requestor.');
    }
  };

  const hideModalHandler = () => {
    setModelVisible(false);
  };

  return (
    <Card bodyStyle={{ backgroundColor: '#fffbe6' }} size="small">
      <Descriptions>
        <Descriptions.Item label="Requestor">
          <a
            onClick={() => {
              !notAllowToChangeRequestor  && setModelVisible(true);
            }}
          >
            {requestor?.name || 'N/A'}  
            {!notAllowToChangeRequestor && <EditOutlined />}
          </a>
        </Descriptions.Item>
        <Descriptions.Item label="Request Date">
          <b> {moment().format(formatConfig.date)} </b>
        </Descriptions.Item>

        <Descriptions.Item label="Emp No">
          <b> {requestor?.employee?.empNo} </b>
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          <b> {requestor?.email} </b>
        </Descriptions.Item>

        <Descriptions.Item label="Dept">
          <b> {requestor?.employee?.department} </b>
        </Descriptions.Item>
        <Descriptions.Item label="Report To">
          <b>
            {' '}
            {requestor?.employee?.reportTo
              ? requestor?.employee?.reportTo
              : requestor?.employee?.hod}{' '}
          </b>
        </Descriptions.Item>
      </Descriptions>

      <Modal
        title="Search"
        open={modelVisible}
        destroyOnClose
        footer={false}
        onCancel={hideModalHandler}
      >
        {
          <SearchAccountComp
            type={'user'}
            approverOnly={false}
            selected={
              requestor
                ? [
                    {
                      ...requestor,
                      type: 'user',
                    },
                  ]
                : []
            }
            onAdded={onAddedHandler}
          />
        }
      </Modal>
    </Card>
  );
};

export default RequestorComp;
