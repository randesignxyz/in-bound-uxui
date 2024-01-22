import { CrmPaths } from '@/pages/crm';
import { EditOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Button, message, Spin } from 'antd';
import { useEffect } from 'react';
import { history } from 'umi';
import { Model } from '../../Model';
import NotificationFormView from './NotificationFormView';

interface Props {
  id?: number;
  actionHandlers?: {
    onBack?: () => void;
  };
}

const DetailNotification: React.FC<Props> = ({ id, actionHandlers }) => {
  const { state, actions } = Model();

  useEffect(() => {
    try {
      id && actions.detail(id);
    } catch {
      message.error('Failed to load so.');
    }
  }, []);

  return (
    <PageContainer
      breadcrumb={undefined}
      onBack={actionHandlers?.onBack}
      extra={
        <Button
          type="link"
          htmlType="button"
          icon={<EditOutlined />}
          onClick={() => history.push(`${CrmPaths.notification}/edit/${id}`)}
          key="edit"
        >
          Edit
        </Button>
      }
    >
      <Spin spinning={state.loading}>
        {id && <NotificationFormView notification={state.data?.detail} />}
      </Spin>
    </PageContainer>
  );
};

export default DetailNotification;
