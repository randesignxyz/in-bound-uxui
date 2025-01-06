import { simpleRequestActions } from '@/services/model';
import { ReloadOutlined } from '@ant-design/icons';
import { ProDescriptions } from '@ant-design/pro-components';
import { Button, Card, Col, List, message, Modal, Row, Space, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { AccessoriesDTO, AddVehicleAccessory } from '../../accessory/data';
import { AccessoryServiceAPI } from '../../accessory/service';
import AccessoriesModalForm from './AccessorieModal';
import ImageViewer from '@/pages/crm/components/ImageViewer';

interface Props {
  id: string;
}

export default ({ id }: Props) => {
  const requestAction = simpleRequestActions();
  const services = AccessoryServiceAPI(requestAction);
  const [accessories, setAccessories] = useState<AccessoriesDTO[]>([]);
  const [accessorieState, setAccessorieSate] = useState<{
    visible?: {
      name: 'modal';
      type: 'ADD' | 'Edit';
      payload?: { enity: AccessoriesDTO[] | undefined };
    };
  }>({});

  const [dataList, setDataList] = useState<{ quantity: number, accessory: AccessoriesDTO }[]>();
  const onLoadData = async () => {
    const data = await services.list(id);
    setAccessories(data.map(o=>({
      ...o.accessory,
      quantity:o.quantity,
    })))
    setDataList(data);
  }

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
        onLoadData()
      },
    });
  };

  useEffect(() => {
    id && onLoadData()
  }, []);

  return (
    <>
      <Card
        size='small'
        styles={{
          header: {
            border: "none"
          }
        }}
        extra={<Space size={'small'}>
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
            Add
          </Button>
          <Button icon={<ReloadOutlined />} type="link" onClick={() => onLoadData?.()} />
        </Space>}
      >
        <Spin spinning={requestAction.request?.loading}>
          <List
            dataSource={dataList}
            grid={{
              xs:1,
              sm:1,
              md:2,
              lg:2,
              xl:2,
              xxl:2,
              gutter: 12
            }}
            renderItem={(item) => {
              return (
                <List.Item>
                  <Card
                    size='small'
                    styles={{
                      header: {
                        border: "none"
                      },
                      body: {
                        padding: "5px"
                      }
                    }}
                  >
                    <Row gutter={12}>
                      <Col >
                        <Card
                          size='small'
                          styles={{
                            body: {
                              padding: "5px",
                            }
                          }}
                        >
                          <ImageViewer height={100} fileId={item?.accessory?.imageId || ""} />
                        </Card>
                      </Col>
                      <Col span={18}>
                        <ProDescriptions
                          column={1}
                          dataSource={item.accessory}
                          columns={[
                            {
                              title: "Name",
                              dataIndex: "name"
                            },
                            {
                              title: "Part Number",
                              dataIndex: "partNumber"
                            },
                            {
                              title: "Quantity",
                              render: (_, r) =><Typography.Title level={5} type='warning'>{item.quantity}</Typography.Title>
                            },
                          ]}
                        />
                      </Col>
                    </Row>
                  </Card>
                </List.Item>
              )
            }}
          />
        </Spin>
      </Card>

      {/* <ProList

        request={async () => {
          const response = await services.list(id);
          return Promise.resolve({
            data: response,
            success: true,
          });
        }}
        grid={{
          gutter:12,
          column:2
        }}
        metas={{
          avatar:{
            render:(_,r)=><ImageViewer height={100} fileId={r.accessory?.imageId ||""} />
          },
          title:{
            render:(_,r)=>r.accessory.name
          },
          
        }}
      /> */}
      {/* <ProList<AccessoriesDTO>
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
        /> */}
      <AccessoriesModalForm
        id={id}
        onSave={onSave}
        open={accessorieState.visible?.name == 'modal' }
        onCancel={() => setAccessorieSate((v) => ({ ...v, visible: undefined }))}
        data={accessorieState.visible?.payload?.enity}
      />
      
      {/* <AssignToVehicleModal
        open={accessorieState.visible?.name == "modal"}
        onCancel={() => setAccessorieSate({ visible: undefined })}
        onSave={(data) => {

        }}
      /> */}
    </>
  );
};
