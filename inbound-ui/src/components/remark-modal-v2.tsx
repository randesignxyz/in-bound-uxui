import { ModalForm } from '@ant-design/pro-components';
import { ProFormTextArea } from '@ant-design/pro-form';
import { Card, Modal } from 'antd';
import { useState } from 'react';

export default <T extends { id: number }>({
  trigger,
  required,
  title,
  item,
  confirm,
  onSave,
}: {
  trigger?: JSX.Element;
  title?: string;
  required?: boolean;
  confirm?: boolean;
  item: T;
  onSave: (item: T, remarks?: string) => Promise<boolean>;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <ModalForm<{ remarks: string }>
      title={title}
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
      onFinish={async (dataForm) => {
        if (confirm) {
          Modal.confirm({
            title: title,
            content: 'Are you sure?',
            onOk: async () => {
              const rs = await onSave(item, dataForm.remarks);
              setOpen(false);
            },
          });
        } else {
          return await onSave(item, dataForm.remarks);
        }
      }}
    >
      <Card>
        <ProFormTextArea rules={[{ required: required }]} label="Remarks" name={'remarks'} />
      </Card>
    </ModalForm>
  );
};
