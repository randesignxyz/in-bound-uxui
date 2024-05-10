import { simpleRequestActions } from '@/services/model';
import { CheckCircleFilled, PlusOutlined, ReloadOutlined, StarFilled, StarOutlined, StarTwoTone } from '@ant-design/icons';
import ProList from '@ant-design/pro-list';
import { ActionType } from '@ant-design/pro-table';
import { Button, Col, Drawer, DrawerProps, List, Row, Space } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { QueueLayoutItemList } from '../services/queue';
import { QueueServices } from '../services/queue-service';
import LayoutEntryForm from './LayoutEntryForm';

interface Props extends DrawerProps {
  selectedItem?: QueueLayoutItemList;
  onSelectedLayout: (data?: QueueLayoutItemList) => void;
}

export default ({ selectedItem, onSelectedLayout, ...props }: Props) => {
  const requestActions = simpleRequestActions();
  const actionRef = useRef<ActionType>();
  const [state, setState] = useState<{
    modal?: {
      type: 'ENTRY';
      payload?: QueueLayoutItemList;
    };
  }>();

  const closeModal = (visible: boolean) => {
    !visible && setState((v) => ({ ...v, modal: undefined }));
  };

  const onReload = () => {
    actionRef.current?.reloadAndRest?.();
  };

  useEffect(() => {
    if (!props.open) return;
    actionRef.current?.reloadAndRest?.();
  }, [props.open]);

  return (
    <Drawer width={500} title={'Layout Config'} {...props}>
      <Row>
        <Col flex={'Auto'} />
        <Col>
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={() => setState((v) => ({ ...v, modal: { type: 'ENTRY' } }))}
          />
          <Button
            type="link"
            onClick={() => {
              actionRef.current?.reloadAndRest?.();
            }}
            icon={<ReloadOutlined />}
          />
        </Col>
      </Row>
      <ProList<QueueLayoutItemList>
        renderItem={(item) => {
          return (
            <List.Item
              actions={[
                <Button
                  type="link"
                  disabled={item.id == selectedItem?.id}
                  onClick={() => onSelectedLayout(item)}
                  icon={<CheckCircleFilled />}
                />,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space><a
                    onClick={() => {
                      setState((v) => ({
                        ...v,
                        modal: {
                          type: 'ENTRY',
                          payload: item,
                        },
                      }));
                    }}
                  >
                    {item.layoutName}
                  </a>
                    {item.isDefault && <StarTwoTone />}

                  </Space>

                }


                description={`Rows: ${item.rows}, Columns: ${item.columns}, Width: ${item.displayBoxWidth}`}

              />
            </List.Item>
          );
        }}
        actionRef={actionRef}
        onDataSourceChange={(data) => {
          if (selectedItem) {
            onSelectedLayout(data.find((it) => it.id === selectedItem?.id));
          }
        }}
        request={async () => {
          const rs = await QueueServices.fetchListQueueLayout.query(requestActions);
          return {
            data: rs,
          };
        }}
      />
      <LayoutEntryForm
        onReload={onReload}
        open={state?.modal?.type == 'ENTRY'}
        data={state?.modal?.payload}
        onVisibleChange={closeModal}
      />
    </Drawer>
  );
};
