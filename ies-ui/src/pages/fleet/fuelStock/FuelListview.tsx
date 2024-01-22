import { simpleRequestActions } from '@/services/model';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DashOutlined,
  FileMarkdownOutlined,
  HistoryOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Liquid } from '@ant-design/plots';
import { ActionType, ProDescriptions } from '@ant-design/pro-components';
import { Button, Card, Dropdown, MenuProps, message, Modal, Row, Space, Tag } from 'antd';
import Col from 'antd/lib/grid/col';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FleetPaths } from '..';
import BreadCrumbCom from '../components/BreadCrumbCom';
import { TankCreate, TankDTO, TankMonthlyEndingCreate, TankTransactionCreate } from './data';
import FuelStockEntryForm from './FuelStockEntryForm';
import HistoryDrawer from './HistoryDrawer';
import MonthlyEndingFormModal from './MonthlyEnding';
import { TankFuelServiceAPI } from './service';
import TankRefileFormModal from './TankRefillFormModal';

interface Props {
  onAdd?: () => void;
  onDetail?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default ({ onAdd, onDetail, onEdit, ...props }: Props) => {
  const [fuelStock, setFuelStock] = useState<TankDTO[]>([]);
  const requestActions = simpleRequestActions();
  const services = TankFuelServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [fuelStockState, setFuelStockState] = useState<{
    visible?: { name: 'modal'; type: 'STOCKIN' | 'ADDNEW'; payload?: { entry: TankDTO } };
  }>({});
  const [tankRefileState, setTankRefileState] = useState<{
    visible?: {
      name: 'modal';
      type: 'ADDNEW';
      actionType: 1 | 2 | 3;
      title: string;
      payload: { entry: TankDTO };
    };
  }>({});

  const [monthlyEndingState, setMonthlyEndingState] = useState<{
    visible?: {
      name: 'modal';
      type: 'ADDNEW';
      actionType: 1 | 2 | 3;
      title: string;
      payload: { entry: TankDTO };
    };
  }>({});

  const [historyState, setHistoryState] = useState<{
    visible?: { open: boolean; payloads?: { entry: TankDTO } };
  }>({});

  const loadData = useCallback(async () => {
    const data = await services.list('');
    setFuelStock(data);
  }, []);
  useEffect(() => {
    loadData();
  }, [actionRef]);

  const config = {
    percent: 0.75,
    outline: {
      border: 4,
      distance: 8,
    },
    wave: {
      length: 128,
    },
  };

  const onSaveFuelTransaction = (data: TankTransactionCreate) => {
    Modal.confirm({
      title: 'Save Tank Refill',
      content: 'are you sure?',
      onOk: async () => {
        const response = (await TankFuelServiceAPI(requestActions).saveFuelTransaction(data)) as {
          data?: string;
          message?: string;
        };
        message.success(response.message);
        actionRef.current?.reloadAndRest?.();
        setTankRefileState((v) => ({ ...v, visible: undefined }));
        loadData();
      },
    });
  };

  const onSaveMonthlyEnding = (data: TankMonthlyEndingCreate) => {
    Modal.confirm({
      title: 'Save Tank Refill',
      content: 'are you sure?',
      onOk: async () => {
        const response = (await TankFuelServiceAPI(requestActions).saveTankMonthlyEnding(data)) as {
          data?: string;
          message?: string;
        };
        message.success(response.message);
        actionRef.current?.reloadAndRest?.();
        setMonthlyEndingState((v) => ({ ...v, visible: undefined }));
        loadData();
      },
    });
  };

  const onSaveTank = (data: TankCreate) => {
    Modal.confirm({
      title: 'are you sure',
      content: 'save this record?',
      onOk: async () => {
        const response = (await TankFuelServiceAPI(requestActions).save(data)) as {
          data?: TankCreate;
          message?: string;
        };

        setFuelStockState((v) => ({ ...v, visible: undefined }));
        message.success(response.message);
        actionRef.current?.reloadAndRest?.();
      },
    });
  };

  const getMenuItems = (r: TankDTO): MenuProps['items'] => {
    return [
      {
        key: '1',
        label: 'Tank Refuel',
        disabled: r.status === 'active' ? false : true,
        itemIcon: <SyncOutlined />,
        onClick: () => {
          setTankRefileState((v) => ({
            ...v,
            visible: {
              name: 'modal',
              type: 'ADDNEW',
              title: 'Refuel Tank',
              actionType: 1,
              payload: { entry: r },
            },
          }));
        },
      },
      {
        key: '2',
        label: 'Ending',
        disabled: r.status === 'active' ? false : true,
        itemIcon: <FileMarkdownOutlined />,
        onClick: () => {
          setMonthlyEndingState((v) => ({
            ...v,
            visible: {
              name: 'modal',
              type: 'ADDNEW',
              title: 'Monthly Ending',
              actionType: 2,
              payload: { entry: r },
            },
          }));
        },
      },
      {
        key: '3',
        label: 'Stock Deduction',
        disabled: r.status === 'active' ? false : true,
        itemIcon: <MinusCircleOutlined />,
        onClick: () => {
          setTankRefileState((v) => ({
            ...v,
            visible: {
              name: 'modal',
              type: 'ADDNEW',
              title: 'Stock Deduction',
              actionType: 3,
              payload: { entry: r },
            },
          }));
        },
      },
      {
        key: '4',
        label: 'View History',
        itemIcon: <HistoryOutlined />,
        disabled: r.status === 'active' ? false : true,
        onClick: () => {
          setHistoryState((v) => ({ ...v, visible: { open: true, payloads: { entry: r } } }));
        },
      },
      {
        type: 'divider',
      },
      {
        key: '5',
        label: r.status == 'active' ? 'Inactive' : 'Active',
        style: { color: r.status == 'active' ? 'red' : 'green' },
        danger: r.status == 'active' ? true : false,
        itemIcon: r.status == 'active' ? <CloseCircleOutlined /> : <CheckCircleOutlined />,
        onClick: () => {
          Modal.confirm({
            title: 'Are you sure',
            content: 'Inactive Fuel Tank',
            onOk: async () => {
              const statusParam = {
                status: r.status == 'active' ? 'inactive' : 'active',
                id: r.id,
              };
              const response = await services.blockTank(statusParam);
              loadData();
              actionRef.current?.reload?.();
            },
          });
        },
      },
    ];
  };

  const routes = [
    {
      path: FleetPaths.fleet,
      label: 'Fleet',
    },
    {
      path: '',
      label: 'Stock',
    },
  ];
  return (
    <>
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <BreadCrumbCom separator=">" routes={routes} />
        <Space>
          <Button
            type="link"
            style={{ float: 'right' }}
            icon={<PlusOutlined />}
            onClick={() =>
              setFuelStockState({ visible: { name: 'modal', type: 'ADDNEW', payload: undefined } })
            }
          />
          <Button
            type="link"
            style={{ float: 'right' }}
            icon={<ReloadOutlined />}
            onClick={() => loadData()}
          />
        </Space>
      </div>

      <Row gutter={[16, 24]}>
        {fuelStock.map((it, key) => (
          <Col sm={24} lg={12}>
            <Card
              title={it.tankName}
              extra={
                <>
                  <Dropdown
                    menu={{
                      items: getMenuItems(it),
                      style: { width: 200 },
                    }}
                  >
                    <a onClick={(e) => e.preventDefault()}>
                      <DashOutlined />
                    </a>
                  </Dropdown>
                </>
              }
            >
              <Row gutter={[16, 24]}>
                <Col span={12}>
                  <ProDescriptions
                    dataSource={fuelStock[key]}
                    column={1}
                    columns={[
                      // {
                      //     title: "Tank Name",
                      //     dataIndex: "tankName",
                      //     key: "volume",

                      // },
                      {
                        title: 'Fuel Type',
                        dataIndex: 'fuelType',
                        render: (_, r) => r?.fuelType?.name,
                        key: 'ullage',
                      },
                      {
                        title: 'Tank Capacity',
                        dataIndex: 'tankCapacity',
                        key: '1',
                      },
                      // {
                      //     title: "Beginning Balance",
                      //     dataIndex: "beginningInventory",
                      //     key: "height"
                      // },
                      // {
                      //     title: "Tank Usages",
                      //     dataIndex: "tankUsages",
                      //     key: "waterVolume"
                      // },
                      {
                        title: 'Current Balance',
                        dataIndex: 'currentInventory',
                        key: 'waterVolume',
                        render: (_, r) => r.currentInventory?.toFixed(2),
                      },
                      {
                        title: 'Location',
                        dataIndex: 'location',
                        render: (_, r) => r?.location?.name,
                        key: 'location',
                      },
                      {
                        title: 'Status',
                        dataIndex: 'status',
                        key: 'status',
                        render: (_, r) => (
                          <Tag color={r.status == 'active' ? 'green' : 'red'}>{r.status}</Tag>
                        ),
                      },
                    ]}
                  />
                </Col>
                <Col span={12}>
                  <Liquid
                    percent={it.currentInventory / it.tankCapacity}
                    autoFit={true}
                    color={it.currentInventory / it.tankCapacity < 0.5 ? 'red' : ''}
                    outline={{
                      border: 4,
                      distance: 8,
                    }}
                    wave={{
                      length: 128,
                    }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      <FuelStockEntryForm
        open={fuelStockState.visible?.name == 'modal'}
        onCancel={() => setFuelStockState((v) => ({ ...v, visible: undefined }))}
        data={fuelStockState.visible?.payload?.entry}
        type={fuelStockState.visible?.type}
        onSave={onSaveTank}
      />
      <HistoryDrawer
        open={historyState.visible?.open == true}
        onClose={() => setHistoryState((v) => ({ ...v, visible: undefined }))}
        data={historyState.visible?.payloads?.entry}
      />

      <TankRefileFormModal
        onSave={onSaveFuelTransaction}
        data={tankRefileState.visible?.payload.entry}
        open={tankRefileState.visible?.name == 'modal'}
        onCancel={() => setTankRefileState((v) => ({ ...v, visible: undefined }))}
        actionType={tankRefileState.visible?.actionType}
        title={tankRefileState.visible?.title}
      />

      <MonthlyEndingFormModal
        onSave={onSaveMonthlyEnding}
        data={monthlyEndingState.visible?.payload.entry}
        open={monthlyEndingState.visible?.name == 'modal'}
        onCancel={() => setMonthlyEndingState((v) => ({ ...v, visible: undefined }))}
        actionType={monthlyEndingState.visible?.actionType}
        title={monthlyEndingState.visible?.title}
      />
    </>
  );
};
