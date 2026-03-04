import FormModalComp from '@/components/FormModal';
import { ProCard } from '@ant-design/pro-components';
import { Space, Spin } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';

import React, { useState } from 'react';
import ActivityView from './ActivityView';
import { ProcessInstanceData } from '@/services/process-workflow/data';
import FileUploader from '@/components/Attachment/FileUploader';

interface Props<T> {
  visible?: boolean;
  title?: string;
  loading?: boolean;
  width?: string;
  children: React.ReactNode;
  instanceData?: ProcessInstanceData<any>;
  uploadProps?: {
    required?: boolean,
    message?: string;
  };
  actionHandlers?: {
    onSetFiles?: (files: UploadFile[]) => void;
    onRemoveFile?: (file: UploadFile) => void;
    onCancel?: () => void;
    onCompleted?: () => void;
    onReset?: () => void;
  };
  okText?: string;
}

const ActionFormWrapper = <T extends {}>(props: Props<T>) => {
  const { visible, instanceData, loading, width, actionHandlers, uploadProps, children, title } = props;
  const [forceClearUpload, setForceClearUpload] = useState(0)
  const onResetHandler = () => {
    setForceClearUpload(v => v + 1)
    actionHandlers?.onSetFiles?.([])
    actionHandlers?.onReset?.()
  }
  return (
    <FormModalComp
      okText={props.okText}
      open={visible}
      width={width}
      onCancel={actionHandlers?.onCancel}
      onResetForm={onResetHandler}
      onSubmit={actionHandlers?.onCompleted}
      title={title}
    >
      <Spin spinning={loading}>
        <Space direction='vertical' style={{ width: '100%' }}>
          {(instanceData?.activities || []).length > 0 && <ProCard boxShadow title="Activities" size='small' bordered collapsible defaultCollapsed>
            <ActivityView activityList={instanceData?.activities || []} />
          </ProCard>}
          {children}
          <FileUploader
            required={uploadProps?.required}
            title={uploadProps?.message}
            showTitle={!!uploadProps?.message}
            key={`upload${forceClearUpload}`}
            onSetFiles={actionHandlers?.onSetFiles}
          />
        </Space>
      </Spin>
    </FormModalComp>
  );
};

export default ActionFormWrapper;
