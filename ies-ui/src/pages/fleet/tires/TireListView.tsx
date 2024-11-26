import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import FormModalComp from '@/components/FormModal';
import { simpleRequestActions } from '@/services/model';
import {
  ActionType,
  ProDescriptions,
  ProForm,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProList,
} from '@ant-design/pro-components';
import { Alert, Button, Card, Col, Collapse, Flex, Row, Space, Tag, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useRef, useState } from 'react';
import TiresInterface from '../components/Tires';
import { TireAssignCreate, TireAssignParam, TireVehicleDTO } from '../specification/data';
import { SpecificationServiceAPI } from '../specification/service';
import { TireServiceAPI } from './service';

interface Props {
  vehicleId: string;
}

const TireVehicleAssignListView: React.FC<Props> = ({ vehicleId }) => {
  const requestAction = simpleRequestActions();
  const services = TireServiceAPI(requestAction);
  const actionRef = useRef<ActionType>();
  const [tireDataList, setTireDataList] = useState<TireVehicleDTO[]>();
  const [tireDataLists, setTireDataLists] = useState<TireVehicleDTO[]>();
  const [tireInfo, setTireInfo] = useState<any>();

  const onRequestHandler = async (params: TableViewSearchParams<TireAssignParam>) => {
    try {
      const data = await services.page({
        criteria: {
          advanceSearch: {
            vehicleId: vehicleId,
            tirePosition: params.criteria?.advanceSearch?.tirePosition,
          },
          sort: params.criteria?.sort,
        },
      });
      if (params.criteria?.advanceSearch?.tirePosition == null) {
        setTireDataList(data.items);
      }
      setTireDataLists(data.items);
      return Promise.resolve({
        data: data.items,
        success: true,
      });
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };
  const handleVoid = async (id: number) => {
    const result: { data: string; message: string } = (await services.voidVehicleTire({ id })) as {
      data: string;
      message: string;
    };
    message.success(result.data);
    await onRequestHandler({
      criteria: {
        advanceSearch: {
          vehicleId: vehicleId,
          tirePosition: tireInfo?.value || '',
        },
      },
    });
  };
  const resetTire = async () => {
    setTireInfo(null);
    await onRequestHandler({
      criteria: {},
    });
  };
  // ============= me
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [form] = useForm<TireAssignCreate>();
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    const dataForm = await form.validateFields();
    await SpecificationServiceAPI(requestAction).saveVehicleTire({
      ...dataForm,
      vehicleId,
      tirePosition: tireInfo?.value,
    });
    message.success("SAVED")
    form.resetFields();
    setIsModalOpen(false);
    await onRequestHandler({
      criteria: {},
    });
    await onRequestHandler({
      criteria: {
        advanceSearch: {
          vehicleId: vehicleId,
          tirePosition: tireInfo?.value || '',
        },
      },
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  // ============= end
  return (
    <>
      <Card
        size="small"
        title="Tires"
        key={'tires'}
        extra={[
          <>
          <Space>
          {!tireInfo?.value && <div style={{color: "gray"}}>Select Tire Position First!</div>}
          <Button type='default' size='small' key={1} onClick={showModal} disabled={!tireInfo?.value}>
            Add Tire Information
          </Button>,
          </Space>
          </>
        ]}
      >
        <Row gutter={12}>
          <Col xl={8}>
            <Flex vertical gap={10}>
              <Card>
                <Flex>
                  <ProDescriptions
                    dataSource={tireInfo}
                    column={1}
                    columns={[
                      {
                        label: 'Position',
                        dataIndex: 'label',
                      },
                    ]}
                  />
                  <Button type="primary" size="small" onClick={() => resetTire()}>
                    Reset
                  </Button>
                </Flex>
              </Card>
              <TiresInterface
                onTireClick={(e) => {
                  setTireInfo(e);
                  onRequestHandler({
                    criteria: {
                      advanceSearch: {
                        vehicleId: vehicleId,
                        tirePosition: e?.value || 'Sa',
                      },
                    },
                  });
                }}
                dataSource={tireDataList?.map((it) => ({
                  value: it.tirePosition,
                  key: it.tirePosition,
                }))}
                key={Math.random()}
              />
            </Flex>
          </Col>
          <Col xl={16} sm={24} md={24}>
            <ProList<TireVehicleDTO>
              headerTitle={'Tires History'}
              options={{
                reload: false,
                density: false,
                setting: false,
              }}
              pagination={{}}
              metas={{
                title: {
                  dataIndex: 'tirePosition',
                },
                subTitle: {
                  render: (_, r) => (
                    <Flex>
                      <Tag color="blue">{r.operation}</Tag>
                      <Tag color="cyan">{r.createdBy}</Tag>
                    </Flex>
                  ),
                },
                actions: {
                  render: (_, r) => [
                    <div key={'1'}>
                      {r.status === 'using' ? (
                        <Button onClick={() => handleVoid(r.id)} size="small">
                          Void
                        </Button>
                      ) : (
                        <Button onClick={() => handleVoid(r.id)} size="small">
                          Unvoid
                        </Button>
                      )}
                    </div>,
                  ],
                },
                description: {
                  render: (_, r) => (
                    <ProDescriptions
                      dataSource={r}
                      column={3}
                      size="small"
                      columns={[
                        {
                          title: 'model',
                          dataIndex: 'model',
                        },
                        {
                          title: 'Brand',
                          dataIndex: 'brand',
                        },
                        {
                          title: 'Code',
                          dataIndex: 'code',
                        },
                        {
                          title: 'Tire Width',
                          dataIndex: 'tireWidth',
                        },
                        {
                          title: 'Wheel Diameter ',
                          dataIndex: 'wheelDiameter',
                        },
                        {
                          title: 'Durability',
                          dataIndex: 'durability',
                        },
                        {
                          title: 'Production Date',
                          dataIndex: 'productionDate',
                          valueType: 'date',
                        },
                        {
                          title: 'Purchase Date',
                          dataIndex: 'purchaseDate',
                          valueType: 'date',
                        },
                      ]}
                    />
                  ),
                },
              }}
              dataSource={tireDataLists}
              expandable={{
                showExpandColumn: true,
              }}
              actionRef={actionRef}
              request={(params, sorter) => {
                return onRequestHandler({
                  criteria: {
                    sort: sorter,
                  },
                });
              }}
            />
          </Col>
        </Row>
      </Card>
      <FormModalComp open={isModalOpen} onSubmit={handleOk} onCancel={handleCancel} title={tireInfo?.label}>
        <ProForm form={form} submitter={false} onReset={() => form.resetFields()}>
          <Row justify="space-around">
            <Col span={7}>
              <ProFormDigit name={'tireWidth'} label="Tire Width" />
            </Col>
            <Col span={7}>
              <ProFormDigit name={'wheelDiameter'} label="Diameter" />
            </Col>
            <Col span={7}>
              <ProFormText name={'brand'} label="Brand" />
            </Col>
            <Col span={7}>
              <ProFormText name={'code'} label="Code" />
            </Col>
            <Col span={7}>
              <ProFormText name={'model'} label="Model" />
            </Col>
            <Col span={7}>
              <ProFormText name={'durability'} label="Durability" />
            </Col>
            <Col span={7}>
              <ProFormDatePicker
                name={'productionDate'}
                label="Production Date"
                rules={[{ required: true }]}
              />
            </Col>
            <Col span={7}>
              <ProFormDatePicker
                name={'purchaseDate'}
                label="Purchase Date"
                rules={[{ required: true }]}
              />
            </Col>
            <Col span={7}>
              <ProFormSelect
                name={'operation'}
                label="Operation"
                rules={[{ required: true }]}
                initialValue={'repair'}
                options={[
                  {
                    value: 'change',
                    label: 'Change Position',
                  },
                  {
                    value: 'rotate',
                    label: 'Rotate',
                  },
                  {
                    value: 'repair',
                    label: 'Repair',
                  },
                  {
                    value: 'regroove',
                    label: 'Regroove',
                  },
                ]}
              />
            </Col>
            <Col span={21}>
              <Collapse
                size="small"
                bordered={false}
                ghost
                expandIconPosition="right"
                items={[
                  {
                    label: 'Tire Condiction',
                    children: (
                      <>
                        <ProFormCheckbox.Group
                          name={'notification'}
                          options={[
                            {
                              value: 'reminder',
                              label: 'Reminder',
                            },
                            {
                              value: 'sms',
                              label: 'SMS',
                            },
                          ]}
                        />
                        <Col span={5}>
                          <ProFormDatePicker label="Replacement Date" name="replacementDate" />
                        </Col>
                      </>
                    ),
                  },
                ]}
              />
            </Col>
          </Row>
        </ProForm>
      </FormModalComp>
    </>
  );
};

export default TireVehicleAssignListView;
