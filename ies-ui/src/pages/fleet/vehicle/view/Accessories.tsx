import { simpleRequestActions } from '@/services/model';
import { ReloadOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import { ProList } from '@ant-design/pro-components';
import { Button, Drawer, message, Modal, Spin, Tag, Typography } from 'antd';
import { useRef, useState } from 'react';
import { AccessoriesDTO, AddVehicleAccessory } from '../../accessory/data';
import { AccessoryServiceAPI } from '../../accessory/service';
import AccessoriesModalForm from './AccessorieModal';

interface Props {
  id: string;
}

export default ({ id }: Props) => {
  const requestAction = simpleRequestActions();
  const services = AccessoryServiceAPI(requestAction);
  const [accessories, setAccessories] = useState<AccessoriesDTO[]>([]);
  const actionRef = useRef<ActionType>();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<AccessoriesDTO | null>();
  const [accessorieState, setAccessorieSate] = useState<{
    visible?: {
      name: 'modal';
      type: 'ADD' | 'Edit';
      payload?: { enity: AccessoriesDTO[] | undefined };
    };
  }>({});

  const onRequest = async () => {
    const response = await services.list(id);
    setAccessories(response);
    return Promise.resolve({
      data: response,
      success: true,
    });
  };
  const onSave = (data: AddVehicleAccessory) => {
    Modal.confirm({
      title: 'Save Accessories Selected',
      content: 'are you sure?',
      onOk: async () => {
        await services.addAccessoriesToVehicle(data);
        setAccessorieSate((v) => ({
          ...v,
          visible: undefined,
        }));
        message.success('success');
        actionRef.current?.reloadAndRest?.();
        await onRequest()
      },
    });
  };

  const showDrawer = (r: AccessoriesDTO) => {
    setOpen(true);
    setDetail(r);
    console.log(r);
  };

  return (
    <>
      <Spin spinning={requestAction.request?.loading}>
        <ProList<AccessoriesDTO>
          size='small'
          toolBarRender={() => {
            return [
              <Button
                key="3"
                type="link"
                onClick={() => {
                  setAccessorieSate((v) => ({
                    ...v,
                    visible: { name: 'modal', type: 'ADD', payload: { enity: accessories } },
                  }));
                }}
              >
                edit
              </Button>,
              <Button icon={<ReloadOutlined />} type="link" onClick={() => onRequest()} />,
            ];
          }}
          itemLayout="vertical"
          rowKey="id"
          actionRef={actionRef}
          request={() => onRequest()}
          metas={{
            title: {
              render: (_, r) => {
                return (
                  <>
                    <span onClick={() => showDrawer(r)}>{r.name}</span>
                  </>
                );
              },
            },
            description: {
              dataIndex: 'description',
              render: (_, r) => <Typography.Text type='warning'>{r.quantity}</Typography.Text>
            },
          }}
        />
      </Spin>
      <AccessoriesModalForm
        id={id}
        onSave={onSave}
        open={accessorieState.visible?.name == 'modal' }
        onCancel={() => setAccessorieSate((v) => ({ ...v, visible: undefined }))}
        data={accessorieState.visible?.payload?.enity}
      />
      <Drawer title={detail?.name} onClose={() => setOpen(false)} open={open}>
        <p>
          <strong>Description:</strong> {detail?.description}
        </p>
      </Drawer>
    </>
  );
};
