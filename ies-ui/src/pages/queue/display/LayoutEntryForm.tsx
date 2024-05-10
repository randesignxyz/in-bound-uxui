import { LoadingBayListItem, LoadingDockListItem } from '@/services/delivery/data';
import { simpleRequestActions } from '@/services/model';
import {
  ModalForm,
  ModalFormProps,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Button, Flex, message, Modal, Space, Spin } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { LoadingLocationServices } from '../services/loading-bay-services';
import { QueueLayoutItemList, QueueLayoutSaveParams } from '../services/queue';
import { QueueServices } from '../services/queue-service';

interface Props extends ModalFormProps<QueueLayoutSaveParams> {
  data?: QueueLayoutItemList;
  onReload?: () => void;
}

export default ({ data, onReload, ...props }: Props) => {
  const requestActions = simpleRequestActions();

  const [form] = useForm<QueueLayoutSaveParams>();

  const [state, setState] = useState<{
    loadingBays?: LoadingBayListItem[];
    loadingDocks?: LoadingDockListItem[];
  }>();

  useEffect(() => {
    if (!props.open) return;
    initialData();
    return () => {
      form.resetFields();
    };
  }, [props.open]);

  useEffect(() => { }, [state?.loadingDocks]);

  const initialData = async () => {
    const loadingBays = await LoadingLocationServices.fetchListLoadingBay.query(requestActions);
    const loadingBayIds = data?.loadingBays?.map((it) => it.id);
    const loadingDockIds = data?.loadingDocks?.map((it) => it.id);
    onLoadLoadingDock(loadingBayIds || [], loadingDockIds);
    setState((v) => ({ ...v, loadingBays: loadingBays }));

    form.setFieldsValue({
      layoutName: data?.layoutName,
      columns: data?.columns,
      rows: data?.rows,
      displayBoxWidth: data?.displayBoxWidth,
      displayBoxHeight: data?.displayBoxHeight,
      loadingBayIds: loadingBayIds,
      loadingDockIds: data?.loadingDocks?.map((it) => it.id),
      defaultForUser: data?.defaultForUser
    });
  };

  const onLoadLoadingDock = async (ids: number[], currentLoadingDocks?: number[]) => {
    const rs = await LoadingLocationServices.fetchListLoadDockByLoadingBays(ids).query(
      requestActions,
    );
    setState((v) => ({ ...v, loadingDocks: rs }));

    form.setFieldsValue({
      loadingDockIds: currentLoadingDocks?.filter((id) => rs.some((it) => it.id === id)),
    });
  };

  return (
    <ModalForm
      title="Queue Layout Config"
      {...props}
      form={form}
      onFinish={async (dataForm) => {
        try {
          await QueueServices.saveQueueLayout({ ...dataForm, id: data?.id })(requestActions);
          onReload?.();
          return Promise.resolve();
        } catch (error: any) {
          message.error(error.message || 'Failed to save.');
          return Promise.reject();
        }
      }}
      onValuesChange={async (valuesChanged, values) => {
        const { loadingBayIds } = valuesChanged;
        if ('loadingBayIds' in valuesChanged) {
          await onLoadLoadingDock(loadingBayIds as number[], values.loadingDockIds);
        }
      }}
      submitter={{
        render: (actionProps) => {
          return (
            <Space>
              <Button onClick={() => props.onVisibleChange?.(false)}>Close</Button>
              <Button onClick={actionProps.reset}>Reset</Button>
              <Button
                type="primary"
                onClick={async () => {
                  await actionProps.form?.validateFields();
                  Modal.confirm({
                    title: 'Save Queue Layout Configuration',
                    content: 'Are you sure?',
                    onOk: () => {
                      actionProps.submit?.();
                    },
                  });
                }}
              >
                Submit
              </Button>
            </Space>
          );
        },
      }}
    >
      <Flex style={{ width: '100%' }} gap={"middle"}>
        <Flex flex={1} vertical>
          <ProFormText rules={[{ required: true }]} label="Name" name={'layoutName'} />
          <ProFormDigit rules={[{ required: true }]} label="Columns" name="columns" />
          <ProFormDigit rules={[{ required: true }]} label="Rows" name="rows" />
          <ProFormDigit
            rules={[{ required: true }]}
            label="Dispay Block Width"
            name="displayBoxWidth"
          />
        </Flex>
        <Flex flex={1} vertical>
          <ProFormDigit
            rules={[{ required: true }]}
            label="Dispay Block Height"
            name="displayBoxHeight"
          />
          <ProFormSelect
            mode="multiple"
            label="Loading bay"
            name={'loadingBayIds'}
            options={state?.loadingBays?.map((it) => ({
              label: it.name,
              value: it.id,
            }))}
          />
          <ProFormSelect
            mode="multiple"
            label="Loading Dock"
            name={'loadingDockIds'}
            options={state?.loadingDocks?.map((it) => ({
              label: it.name,
              value: it.id,
            }))}
          />
          <ProFormText label="Default for user" name={"defaultForUser"} />
        </Flex>
      </Flex>
      <ProFormTextArea label="Description" name="description" />
    </ModalForm>
  );
};
