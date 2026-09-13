import { message, Modal } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import { useEffect, useState } from 'react';
import FormModalComp, { FormModalProps } from '../FormModal';
import { AttachmentEntry } from './AttachmentEntry';

interface Props extends FormModalProps {
  multiple?: boolean;
  service?: 'WORK_FLOW' | 'FILE';
  data?: UploadFile[];
  actionHandlers?: {
    onAddFiles?: (files: UploadFile[]) => void;
    onSaveAll?: (files: string[]) => Promise<void>;
  };
}

export const AttachmentModal: React.FC<Props> = ({ data, service, actionHandlers, ...rest }) => {
  const files = useState<UploadFile[]>([]);

  useEffect(() => {
    rest.open && files[1](data || []);
  }, [rest.open]);

  return (
    <FormModalComp
      {...rest}
      onResetForm={() => files[1]([])}
      onSubmit={() => {
        if (actionHandlers?.onAddFiles) {
          actionHandlers?.onAddFiles?.(files[0]);
          rest.onCancel?.();
          return;
        }
        Modal.confirm({
          title: 'Confirmation',
          content: 'Are you sure to save.',
          onOk: async () => {
            try {
              await actionHandlers?.onSaveAll?.(files[0].map((it) => it.response));
              message.success('Saved successfully');
              rest.onCancel?.();
            } catch (error) {
              message.error('Failed to save.');
            }
          },
        });
      }}
    >
      <AttachmentEntry
        files={files[0]}
        service={service}
        multiple={rest.multiple == undefined ? true : rest.multiple}
        onAddFile={(file) => {
          files[1]((v) => [...v, file]);
        }}
        onRemoveFile={(file) => {
          files[1]((v) => v.filter((it) => it.uid !== file.uid));
        }}
      />
    </FormModalComp>
  );
};
