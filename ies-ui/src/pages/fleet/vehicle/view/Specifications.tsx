import { simpleRequestActions } from '@/services/model';
import { EditOutlined } from '@ant-design/icons';
import { ActionType, ProDescriptions, ProTable } from '@ant-design/pro-components';
import { Badge, Button, Card, Col, message, Row, Space } from 'antd';
import { useEffect, useRef, useState } from 'react';
import BatteryModalForm from '../../specification/BatteryModalForm';
import {
  BatteryVehicleCreate,
  BatteryVehicleDTO,
  NormFuelConsumptionCreate,
  NormFuelConsumptionDTO,
  TireAssignCreate as TireAssignCreate,
  TireAssignParam,
  TireVehicleDTO,
} from '../../specification/data.d';
import NormFuelConsumption from '../../specification/NormFuelConsumption';
import { SpecificationServiceAPI } from '../../specification/service';
import TireModalForm from '../../specification/TiresModalForm';
import TiresInterface from '../../components/Tires';
import TableView from '@/components/DataCrud/TableView';
import { VehicleListItem } from '../data';
import TireVehicleAssignListView from '../../tires/TireListView';

interface Props {
  id: string;
}

export default ({ id }: Props) => {
  const requestActions = simpleRequestActions();
  const actionRef = useRef<ActionType>();
  const actionRefNorm = useRef<ActionType>();
  const actionTireRef = useRef<ActionType>();
  const services = SpecificationServiceAPI(requestActions);

  const [normFuelConsuption, setNormFuelConsuption] = useState<{
    visible?: {
      name: 'modal';
      type: 'ADD' | 'Edit';
      title?: string;
      action: number;
      payload?: { enity: NormFuelConsumptionDTO | undefined };
    };
  }>({});

  const [tireList, setTireList] = useState<TireVehicleDTO[]>();
  const [tireItemState, setTireItemState] = useState<{
    visible?: {
      name: 'modal';
      type: 'ADD' | 'Edit';
      payload?: { enity: TireVehicleDTO | undefined };
    };
  }>({});

  const [battery, setBattery] = useState<{
    visible?: {
      name: 'modal';
      type: 'ADD' | 'Edit';
      payload?: { enity: BatteryVehicleDTO | undefined };
    };
  }>({});

  const onSaveTireItem = async (data: TireAssignCreate) => {
    const response = (await services.saveVehicleTire(data)) as {
      data: string;
      message: string;
    };
    setTireItemState((v) => ({ visible: undefined }));
    message.success(response.message);
    actionTireRef.current?.reloadAndRest?.();
  };

  const onSaveBattery = async (data: BatteryVehicleCreate) => {
    const response = (await services.saveBattery(data)) as {
      data: string;
      message: string;
    };
    setBattery((v) => ({ visible: undefined }));
    message.success(response.message);
    actionRef.current?.reloadAndRest?.();
  };

  const onTireRequest = async (param:TireAssignParam) => {
    const data = await services.listVehicleTire(
      {
        vehicleId:param.vehicleId,
        tirePosition:param.tirePosition
      }
    );
    if(param.tirePosition ==""){
      setTireList(data);
    }
    
    return Promise.resolve({
      data: data,
      success: true,
    });
  }

  useEffect(()=>{
    
  },[]);
  return (
    <>
      <Space direction="vertical" size={15}>
        <Card
          size="small"
          title="Fuel Consumption Norm"
          key={'dimensions'}
          extra={[
            <Button
              type="link"
              onClick={async () => {
                try {
                  const record = await services.fetchNormFuelConsumption(id);
                  setNormFuelConsuption((v) => ({
                    ...v,
                    visible: {
                      name: 'modal',
                      type: 'ADD',
                      title: 'Dimensions',
                      action: 1,
                      payload: { enity: record },
                    },
                  }));
                } catch (e) {
                  setNormFuelConsuption((v) => ({
                    ...v,
                    visible: { name: 'modal', type: 'ADD', title: 'Dimensions', action: 1 },
                  }));
                }
              }}
            >
              edit
            </Button>,
          ]}
        >
          <ProDescriptions<NormFuelConsumptionDTO>
            column={4}
            request={async () => {
              const record = await services.fetchNormFuelConsumption(id);
              return Promise.resolve({
                data: record,
                success: true,
              });
            }}
            actionRef={actionRefNorm}
            contentStyle={{ fontWeight: 'bold' }}
            columns={[
              {
                title: 'Tank Capacity',
                key: '1',
                dataIndex: 'tankCapacity',
              },
              {
                title: 'Usage (WH2)',
                key: '2',
                dataIndex: 'usage',
              },
              {
                title: 'Km/Month',
                key: '3',
                dataIndex: 'kilometer',
              },
              {
                title: 'Usage Rate',
                key: '4',
                dataIndex: 'usageRate',
              },
              {
                title: 'Remark',
                key: '5',
                dataIndex: 'remark',
              },
            ]}
          />
        </Card>
        <Card
          size="small"
          title="Battery"
          key={'tires'}
          extra={[
            <Button
              type="link"
              onClick={() => {
                setBattery((v) => ({
                  ...v,
                  visible: { name: 'modal', type: 'ADD' },
                }));
              }}
            >
              add
            </Button>,
          ]}
        >
          <ProTable<BatteryVehicleDTO>
            toolBarRender={false}
            search={false}
            request={async () => {
              const data = await services.listBattery(id);

              return Promise.resolve({
                data: data,
                success: true,
              });
            }}
            actionRef={actionRef}
            columns={[
              {
                title: 'Band',
                key: 'brand',
                dataIndex: 'brand',
              },
              {
                title: 'Code',
                key: 'code',
                dataIndex: 'code',
              },
              {
                title: 'Power',
                key: 'power',
                dataIndex: 'power',
              },
              {
                title: 'Quantity',
                key: 'quantity',
                dataIndex: 'quantity',
              },
              {
                title: 'Production Date',
                key: 'productionDate',
                dataIndex: 'productionDate',
              },
              {
                title: 'Durability',
                key: 'durability',
                dataIndex: 'durability',
              },
              {
                title: 'Purchase Date',
                key: 'purchase',
                valueType: 'date',
                dataIndex: 'purchaseDate',
              },
              {
                render: (_, r) => {
                  return (
                    <>
                      <Button
                        icon={<EditOutlined />}
                        type="link"
                        onClick={() => {
                          setBattery((v) => ({
                            ...v,
                            visible: { name: 'modal', type: 'Edit', payload: { enity: r } },
                          }));
                        }}
                      />
                    </>
                  );
                },
              },
            ]}
          />
        </Card>
        {/* <Card
          size="small"
          title="Tires"
          key={'tires'}
          extra={[
            <Button
              type="link"
              onClick={() => {
                setTireItemState((v) => ({
                  visible: { name: 'modal', type: 'ADD' },
                }));
              }}
            >
              add
            </Button>,
          ]}
        > */}
          <TireVehicleAssignListView vehicleId={id}/>
          {/* <Row gutter={12}>
            <Col span={8}>
              <Card>
                <TiresInterface
                  onTireClick={(e) => {
                      onTireRequest({
                        tirePosition: e?.value||"",
                        vehicleId: id
                      });
                  }}
                  dataSource={tireList?.map(it => ({ value: it.tirePosition, key: it.tirePosition, }))}
                  key={Math.random()}
                />
              </Card>
            </Col>
            <Col span={16}>
              <Card>
                <TableView<VehicleListItem,{searchValue?:string}>
                    columns={[
                      {
                        key: 'tireSize',
                        title: 'Tire Size',
                        render: (_, r) => [r.tireWidth, r.wheelDiameter].filter((it) => it).join('/'),
                      },
                      {
                        key: 'tireInfo',
                        title: 'Tire Info',
                        render: (_, r) => [r.brand, r.model, r.code].filter((it) => it).join('/'),
                      },
  
                      {
                        key: 'position',
                        title: 'Position',
                        dataIndex: 'tirePosition',
                      },
                      {
                        key: 'durability',
                        title: 'Durability',
                        dataIndex: 'durability',
                      },
                      {
                        key: 'purchaseDate',
                        title: 'Purchase Date',
                        valueType: 'date',
                        dataIndex: 'purchaseDate',
                      },
                      {
                        key: 'lastModified',
                        title: 'Last Modified by',
                        dataIndex: 'lastModifiedBy',
                      },
                      {
                        title: "Status",
                        dataIndex: "status",
                        render: (_, r) => <Badge text={r.status} status={r.status == "using" ? "processing" : "error"} />
                      },
                      {
                        render: (_, r) => {
                          return (
                            <>
                              <Button
                                icon={<EditOutlined />}
                                type="link"
                                onClick={() => {
                                  setTireItemState((v) => ({
                                    ...v,
                                    visible: { name: 'modal', type: 'Edit', payload: { enity: r } },
                                  }));
                                }}
                              />
                            </>
                          );
                        },
                      },
                    ]}
                />
                <ProTable<TireVehicleDTO>
                  size='small'
                  toolBarRender={false}
                  search={false}
                  request={()=>{
                    return onTireRequest({
                      vehicleId:id,
                      tirePosition:""
                    })
                  }}
                  actionRef={actionTireRef}
                  columns={[
                    {
                      key: 'tireSize',
                      title: 'Tire Size',
                      render: (_, r) => [r.tireWidth, r.wheelDiameter].filter((it) => it).join('/'),
                    },
                    {
                      key: 'tireInfo',
                      title: 'Tire Info',
                      render: (_, r) => [r.brand, r.model, r.code].filter((it) => it).join('/'),
                    },

                    {
                      key: 'position',
                      title: 'Position',
                      dataIndex: 'tirePosition',
                    },
                    {
                      key: 'durability',
                      title: 'Durability',
                      dataIndex: 'durability',
                    },
                    {
                      key: 'purchaseDate',
                      title: 'Purchase Date',
                      valueType: 'date',
                      dataIndex: 'purchaseDate',
                    },
                    {
                      key: 'lastModified',
                      title: 'Last Modified by',
                      dataIndex: 'lastModifiedBy',
                    },
                    {
                      title: "Status",
                      dataIndex: "status",
                      render: (_, r) => <Badge text={r.status} status={r.status == "using" ? "processing" : "error"} />
                    },
                    {
                      render: (_, r) => {
                        return (
                          <>
                            <Button
                              icon={<EditOutlined />}
                              type="link"
                              onClick={() => {
                                setTireItemState((v) => ({
                                  ...v,
                                  visible: { name: 'modal', type: 'Edit', payload: { enity: r } },
                                }));
                              }}
                            />
                          </>
                        );
                      },
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row> */}
        {/* </Card> */}

      </Space>
      <TireModalForm
        id={id}
        open={tireItemState.visible?.name == 'modal'}
        onCancel={() => setTireItemState((v) => ({ ...v, visible: undefined }))}
        loadData={() => actionRef.current?.reload()}
        onSave={onSaveTireItem}
        data={tireItemState.visible?.payload?.enity}
      />

      <BatteryModalForm
        id={id}
        open={battery.visible?.name == 'modal'}
        onCancel={() => setBattery((v) => ({ ...v, visible: undefined }))}
        loadData={() => actionRef.current?.reload()}
        onSave={onSaveBattery}
        data={battery.visible?.payload?.enity}
      />

      <NormFuelConsumption
        onSave={async (data: NormFuelConsumptionCreate) => {
          const response = (await services.saveNormFuelConsumption(data)) as {
            data: NormFuelConsumptionCreate;
            message: string;
          };
          message.success(response.message);
          actionRefNorm.current?.reload?.();
          setNormFuelConsuption((v) => ({ ...v, visible: undefined }));
        }}
        vehicleId={id}
        data={normFuelConsuption.visible?.payload?.enity}
        open={normFuelConsuption.visible?.name == 'modal'}
        onCancel={() => setNormFuelConsuption((v) => ({ ...v, visible: undefined }))}
      />
    </>
  );
};
