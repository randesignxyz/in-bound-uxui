import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { SalesTeamWorkLess, TopupLess } from '@/services/sale/data';
import ProForm, { ProFormDateTimePicker, ProFormMoney, ProFormSelect } from '@ant-design/pro-form';
import { Button, Col, message, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

export interface TransferEntryFromProps extends FormModalProps {
  // data?: TopupLess;
  // lookupDataList?: LookupData[];
  seCode?: string;
  seList?: SalesTeamWorkLess[];
  actionHandlers?: {
    onSave?: (data: TopupLess, isView: boolean) => void;
    onLoadInitData?: () => void;
    // onCancel?: () => void;
  };
}

const TransferEntryModal: React.FC<TransferEntryFromProps> = ({
  actionHandlers,
  // data,
  seCode,
  seList,
  ...rest
}) => {
  const [form] = useForm<TopupLess>();
  useEffect(() => {
    if (!rest.visible) return;
    actionHandlers?.onLoadInitData?.();
    form.resetFields();
    form.setFieldsValue({ empNo: seCode });
  }, [rest.visible]);
  return (
    <FormModalComp
      {...rest}
      width="350px"
      footer={[
        !seCode && (
          <Button key="reset" onClick={() => form.resetFields()}>
            Reset
          </Button>
        ),
        seCode && (
          <Button key="reset" onClick={() => rest.onCancel && rest.onCancel()}>
            Cancel
          </Button>
        ),
        <Button
          loading={rest.confirmLoading}
          disabled={rest.disabled}
          key="submit"
          type="primary"
          onClick={async () => {
            try {
              const dataForm = await form.validateFields();

              actionHandlers?.onSave?.({ ...dataForm }, false);
            } catch (errors) {
              message.error('Invalid data.');
            }
          }}
        >
          Submit
        </Button>,
        !seCode && (
          <Button
            loading={rest.confirmLoading}
            disabled={rest.disabled}
            key="submitView"
            type="primary"
            onClick={async () => {
              try {
                const dataForm = await form.validateFields();
                actionHandlers?.onSave?.({ ...dataForm }, true);
              } catch (errors) {
                message.error('Invalid data.');
              }
            }}
          >
            Submit & Detail
          </Button>
        ),
      ]}
    >
      <ProForm form={form} submitter={false} autoFocusFirstInput>
        <Row gutter={50}>
          <Col flex="350px">
            <ProFormSelect
              disabled={seCode !== null ? true : false}
              name="empNo"
              help={<span />}
              rules={[{ required: true }]}
              label="Sale Executive"
              showSearch
              fieldProps={{
                optionLabelProp: 'label',
                // dropdownMatchSelectWidth: 400,
                filterOption: (input, option) =>
                  (option?.label?.toString() || '').toLowerCase().indexOf(input.toLowerCase()) >= 0,
              }}
              options={seList?.map((it) => {
                return {
                  value: it.salespersonCode,
                  label: `${it.salespersonCode} - ${it.salespersonName}`,
                };
              })}
            />
            {!seCode && (
              <ProFormDateTimePicker
                label="Request Date"
                name="requestedDate"
                rules={[{ required: true }]}
              />
            )}
            <ProFormMoney
              help={<span />}
              customSymbol="$"
              label="Amount"
              name="amount"
              rules={[{ required: true }]}
              fieldProps={{
                moneySymbol: false,
              }}
              locale="en-US"
              min={0}
              // width="lg"
            />
            {/* <ProFormTextArea
              help={<span />}
              rules={[{ required: true }]}
              label="Message"
              name="body"
            /> */}
          </Col>
          {/* <Col flex="500px">
                
              </Col> */}
        </Row>
      </ProForm>
    </FormModalComp>
  );
};

export default TransferEntryModal;
