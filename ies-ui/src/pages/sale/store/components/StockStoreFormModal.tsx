import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { SaveStockStore, StockStoreLess, TeamWorkLess } from '@/services/sale/data';
import ProForm, {
  ProFormCheckbox,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Button, Card, Col, message, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';

export interface StockControlFormModalProps extends FormModalProps {
  data?: {
    teamWork?: TeamWorkLess[];
    detail?: StockStoreLess;
  };
  actionHandlers?: {
    onSave?: (item: SaveStockStore, isView: Boolean) => void;
  };
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 14 },
};

const StockStoreFormModal: React.FC<StockControlFormModalProps> = ({
  data,
  actionHandlers,
  ...rest
}) => {
  const [form] = useForm<SaveStockStore>();
  const [removeTeamWorkId, setRemoveTeamWorkId] = useState<number>();

  useEffect(() => {
    if (!rest.open) return;
    if (data?.detail) {
      form.setFieldsValue({
        name: data.detail.name,
        description: data.detail.description,
        id: data.detail.id,
        isActive: data.detail.isActive,
        teamWorkId: data.detail.teamWork?.id,
        isInitialize: data.detail.isInitialize,
      });
    }
    return () => {
      form.resetFields();
    };
  }, [rest.open]);

  const onSubmitActionHandler = async (isView: Boolean) => {
    try {
      const dataForm = await form.validateFields();
      const item: SaveStockStore = {
        isActive: true,
        name: dataForm.name,
        description: dataForm.description,
        teamWorkId: dataForm.teamWorkId,
        id: data?.detail?.id,
        removeTeamWorkId: removeTeamWorkId,
        isInitialize: dataForm.isInitialize,
      };
      console.log(item);
      actionHandlers?.onSave?.(item, isView);
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const onValuesChange = (changedValues: any, values: any) => {
    const { teamWorkId } = values;

    if (data?.detail && teamWorkId === undefined) {
      console.log(data?.detail.teamWork?.id);
      setRemoveTeamWorkId(data?.detail.teamWork?.id);
      return;
    }
    setRemoveTeamWorkId(undefined);
  };

  return (
    <FormModalComp
      {...rest}
      width="850px"
      footer={[
        <Button key="button" onClick={() => rest.onCancel && rest.onCancel()}>
          Cancel
        </Button>,
        <Button
          key="reset"
          onClick={() => {
            form.resetFields();
          }}
        >
          Reset
        </Button>,
        <Button
          loading={rest.confirmLoading}
          disabled={rest.disabled}
          key="submit"
          type="primary"
          onClick={async () => await onSubmitActionHandler(false)}
        >
          {data?.detail ? 'Update' : 'Submit'}
        </Button>,
        <Button
          loading={rest.confirmLoading}
          disabled={rest.disabled}
          key="submitView"
          type="primary"
          onClick={async () => await onSubmitActionHandler(true)}
        >
          {data?.detail ? 'Update' : 'Submit'} & Detail
        </Button>,
      ]}
    >
      <Card size="small" title="General Info" style={{ marginBottom: 10 }}>
        <ProForm
          {...layout}
          form={form}
          submitter={false}
          autoFocusFirstInput
          layout="horizontal"
          onValuesChange={onValuesChange}
        >
          <Row gutter={50}>
            <Col flex="1">
              <ProFormText
                label="Store Name"
                name="name"
                rules={[{ required: true }]}
                help={<span />}
                width="md"
              />
              <ProFormSelect
                name="teamWorkId"
                label="Team Work"
                showSearch
                fieldProps={{
                  optionLabelProp: 'label',
                  // dropdownMatchSelectWidth: 400,
                  filterOption: (input, option) =>
                    (option?.label?.toString() || '').toLowerCase().indexOf(input.toLowerCase()) >=
                    0,
                }}
                options={data?.teamWork?.map((it) => {
                  return {
                    value: it.id,
                    label: it.teamName,
                  };
                })}
              />
            </Col>
            <Col flex="1">
              <ProFormTextArea help={<span />} label="Description" name="description" />
              <ProFormCheckbox label="Initialize Stock" name="isInitialize" />
            </Col>
          </Row>
        </ProForm>
      </Card>
    </FormModalComp>
  );
};

export default StockStoreFormModal;
