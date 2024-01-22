import FileUploader from '@/components/Attachment/FileUploader';
import FormModalComp from '@/components/FormModal';
import { UserResult } from '@/services/process-workflow/data';
import { Button, Card, Space, Spin } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { ReactNode, useState } from 'react';
import RequestorComp from '../Requestor';

interface Props<T> {
  visible?: boolean;
  loading?: boolean;
  requestor?: UserResult;
  draft?: boolean;
  noAttachment?: true;
  notAllowToChangeRequestor?: boolean;
  uploadFiles?: UploadFile[];
  actionHandlers?: {
    onSetRequestor?: (userId: string) => Promise<void>;
    onSetFiles?: (file: UploadFile[]) => void;
    onCancel?: () => void;
    onReset?: () => void;
    onSaveDraft?: () => void;
    onOk?: () => void;
  };
  data?: {
    entity?: {
      id: number;
      code: string;
      name: string;
    };
  };
  onDataTransform?: {
    save: () => Promise<{ data: T; comment?: string } | false>;
    amendment?: boolean;
    test?: boolean;
  };
  // onClearData?: () => void
  children?: ReactNode;
}
const StartFromWrapper = <T extends {}>(props: Props<T>) => {
  const { visible, data, loading, uploadFiles, draft, requestor, actionHandlers, children } = props;
  const [forceClearUpload, setForceClearUpload ] = useState(0)
  const onReset = () => {
    setForceClearUpload(v => v+1)
    actionHandlers?.onSetFiles?.([])
    actionHandlers?.onReset?.()
  }
  return (
    <FormModalComp
      open={visible}
      onCancel={actionHandlers?.onCancel}
      onSubmit={actionHandlers?.onOk}
      onResetForm={ onReset}
      footer={[
        <Button key="cancel" onClick={actionHandlers?.onCancel}>
          Cancel
        </Button>,
        <Button key="reset" onClick={onReset}>
          Reset
        </Button>,
        draft && (
          <Button key="draft" onClick={actionHandlers?.onSaveDraft}>
            Save Draft
          </Button>
        ),
        <Button key="submit" type="primary" onClick={actionHandlers?.onOk}>
          {'Submit'}
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <Space direction="vertical">
          {data?.entity?.id && (
            <Card size="small" bodyStyle={{ backgroundColor: '#fafafa' }}>
              {<h2 style={{ color: '#096dd9' }}>Company: {data?.entity?.name}</h2>}
            </Card>
          )}
          <RequestorComp
            requestor={requestor}
            notAllowToChangeRequestor = {props.notAllowToChangeRequestor}
            actionHandlers={{
              onSetRequestor: actionHandlers?.onSetRequestor,
            }}
          />

          {children}

          {!props.noAttachment && (
            <FileUploader
              key={`upload-${forceClearUpload}`}
              multiple
              onSetFiles={actionHandlers?.onSetFiles}
            />
          )}
        </Space>
      </Spin>
    </FormModalComp>
  );
};

export default StartFromWrapper;
