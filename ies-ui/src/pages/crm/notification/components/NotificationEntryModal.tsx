import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { NotificationLess } from '@/services/crm/data';
import { LookupData } from '@/services/data';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { Button, Col, message, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

export interface NotificationEntryFromProps extends FormModalProps {
  data?: NotificationLess;
  lookupDataList?: LookupData[];
  actionHandlers?: {
    onSave?: (data: NotificationLess, isSend: boolean) => void;
    onLoadInitData?: () => void;
  };
}

const NotificationEntryModal: React.FC<NotificationEntryFromProps> = ({
  actionHandlers,
  data,
  lookupDataList,
  ...rest
}) => {
  const [form] = useForm<NotificationLess>();
  useEffect(() => {
    if (!rest.open) return;
    actionHandlers?.onLoadInitData?.();
    form.setFieldsValue({ ...data });
  }, [rest.open]);
  return (
    <FormModalComp
      {...rest}
      width="500px"
      footer={[
        <Button key="cancel" onClick={() => rest.onCancel && rest.onCancel()}>
          Cancel
        </Button>,
        <Button key="reset" onClick={() => form.resetFields()}>
          Reset
        </Button>,
        <Button
          loading={rest.confirmLoading}
          disabled={rest.disabled}
          key="submit"
          type="primary"
          onClick={async () => {
            try {
              const dataForm = await form.validateFields();
              actionHandlers?.onSave?.({ ...data, ...dataForm }, false);
            } catch (errors) {
              message.error('Invalid data.');
            }
          }}
        >
          Submit
        </Button>,
        <Button
          loading={rest.confirmLoading}
          disabled={rest.disabled}
          key="submitSend"
          type="primary"
          onClick={async () => {
            try {
              const dataForm = await form.validateFields();
              actionHandlers?.onSave?.({ ...data, ...dataForm }, true);
            } catch (errors) {
              message.error('Invalid data.');
            }
          }}
        >
          Submit & Send
        </Button>,
      ]}
    >
      <ProForm form={form} submitter={false} autoFocusFirstInput>
        <Row gutter={50}>
          <Col flex="800px">
            <ProFormText
              help={<span />}
              rules={[{ required: true }]}
              label="Subject"
              name="title"
            />
            <ProFormTextArea
              help={<span />}
              rules={[{ required: true }]}
              label="Message"
              name="body"
            />
          </Col>
          {/* <Col flex="500px">
                <ProFormSelect
                  name="saleIds"
                  help={<span />}
                  rules={[{ required: true }]}
                  label="Sale Executive"
                  showSearch
                  
                  fieldProps={{
                    optionLabelProp: 'label',
                    popupMatchSelectWidth: 400,
                    filterOption: (input, option) =>
                      (option?.label?.toString() || '')
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0,
                  }}
                  options={initData?.seList?.map((it) => {
                    return { value: it.id, label: `${it.code} - ${it.name}` };
                  })}
                />
              </Col> */}
        </Row>
      </ProForm>
    </FormModalComp>
  );
};

export default NotificationEntryModal;
