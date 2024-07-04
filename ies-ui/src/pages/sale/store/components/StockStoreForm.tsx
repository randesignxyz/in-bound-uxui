import { SalesTeamWorkLess, SaveStockStore, VehicleLess } from '@/services/sale/data';
import { CrownOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { FooterToolbar, ProForm, ProFormCheckbox, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { useSetState } from 'ahooks';
import { Button, Card, Col, message, Modal, Row, Space, Tooltip } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useRef, useState } from 'react';
import { history } from "@umijs/max";
import { SalePaths } from '../..';
import VehicleFormModal from '../../stock-control/VehicleFormModal';
import { Model } from '../model';

type Props = {
  type: 'new' | 'edit';
  id?: number;
};

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 16 },
};

const StockStoreForm: React.FC<Props> = ({ id, type }) => {
  const { state, actions } = Model();
  const [form] = useForm<{
    name: string;
    description: string;
    memberShip: string;
    vehicleId: string;
    isInitialize: boolean;
  }>();
  const actionRefMembers = useRef<ActionType>();
  const [vehicleModal, setVehicleModal] = useSetState<{ visible?: boolean }>({});
  const [memberShip, setMemberShip] = useState<SalesTeamWorkLess>();

  useEffect(() => {
    actions.initData(id);
  }, []);

  useEffect(() => {
    if (state.data?.detail) {
      form.setFieldsValue({
        name: state.data.detail.name,
        // requesterCode: state.data?.detail?.requester?.salespersonCode,
        description: state.data?.detail?.description,
        vehicleId: state.data.detail.vehicle?.plateNumber,
        isInitialize: state.data.detail.isInitialize,
      });
    }
  }, [state.data?.detail]);

  const onSaveActionHandler = async (isNew: boolean = false) => {
    if (!state.data?.members?.some((it) => it.isRequester)) {
      message.warning('Add a requester into list members.');
      return;
    }

    try {
      const dataFrom = await form.validateFields();
      Modal.confirm({
        title: type === 'new' ? 'Save New Store' : 'Update the store',
        content: 'Are you sure?',
        onOk: async () => {
          try {
            const item: SaveStockStore = {
              id: id,
              name: dataFrom.name,
              isActive: true,
              description: dataFrom.description,
              vehicleIds: [dataFrom.vehicleId],
              memberIds: state.data?.members?.map((it) => it.salespersonCode),
              isInitialize: dataFrom.isInitialize,
            };
            console.log(item);
            const so = await actions.saveData(item);
            if (isNew) {
              actions.clearMember();
              form.resetFields();
            } else {
              if (so) history.push(`${SalePaths.store}/detail/${so?.data.id}`);
            }
          } catch (error: any) {
            message.error(error.message);
          }
        },
      });
    } catch (error) {
      message.error('Invalied Data');
    }
  };

  const onValuesChange = (changedValues: any, values: any) => {
    const { memberShip } = values;
    if ('memberShip' in changedValues) {
      const item = state.data?.initData?.salespersonList
        ?.filter((it) => !it.isApprover)
        .find((it) => it.salespersonCode === memberShip);
      if (item) setMemberShip(item);
    }
  };

  return (
    <ProForm
      onValuesChange={onValuesChange}
      form={form}
      style={{ fontWeight: 'bolder' }}
      layout="horizontal"
      {...layout}
      submitter={{
        render: () => {
          return (
            <FooterToolbar>
              <Button
                onClick={() => {
                  if (type === 'edit') history.push(`${SalePaths.store}/detail/${id}`);
                  else history.push(`${SalePaths.store}/list`);
                }}
              >
                Cancel
              </Button>
              {type === 'new' && (
                <Button
                  onClick={() => {
                    actions.clearMember();
                    form.resetFields();
                  }}
                >
                  Clear
                </Button>
              )}

              {/* {type === 'edit' && (
                <Button
                  onClick={() => {
                    form.resetFields();
                  }}
                >
                  Reset
                </Button>
              )} */}
              {type === 'new' && (
                <Button
                  type="primary"
                  onClick={() => {
                    onSaveActionHandler(true);
                  }}
                >
                  Save & Add New
                </Button>
              )}
              <Button
                type="primary"
                onClick={() => {
                  onSaveActionHandler();
                }}
              >
                {type === 'new' ? 'Save & View' : 'Edit'}
              </Button>
            </FooterToolbar>
          );
        },
      }}
    >
      <Card size="small" title="General Info" style={{ marginBottom: 10 }}>
        <Row gutter={50}>
          <Col flex="1">
            <ProFormText
              label="Store Name"
              name="name"
              rules={[{ required: true }]}
              help={<span />}
            />
            <ProFormTextArea help={<span />} label="Description" name="description" />
          </Col>

          <Col flex="500px">
            <ProFormSelect
              rules={[{ required: true }]}
              name="vehicleId"
              label="Plate Number"
              showSearch
              debounceTime={300}
              addonAfter={
                <Tooltip placement="topLeft" title="Add Vehicle">
                  <Button
                    size="small"
                    icon={<PlusOutlined />}
                    type="primary"
                    onClick={() => {
                      setVehicleModal({ visible: true });
                    }}
                  />
                </Tooltip>
              }
              request={async ({ keyWords }) => {
                const result = keyWords && (await actions.searchVehicleByPlateNumber(keyWords));
                return result.map((it: { plateNumber: string }) => ({
                  label: it.plateNumber,
                  value: it.plateNumber,
                }));
              }}
              placeholder="Please select plate number"
            />
            <ProFormCheckbox label="Initialize Stock" name="isInitialize" />
          </Col>
          <Col flex="Auto" />
        </Row>
        {/* stockStoreId isActive memberIds?: string[]; vehicleIds?: number[]; */}
      </Card>
      <Card size="small" style={{ marginBottom: 10 }} title="Members">
        <ProTable<SalesTeamWorkLess>
          actionRef={actionRefMembers}
          size="small"
          rowKey="id"
          pagination={false}
          bordered={false}
          search={false}
          dataSource={state.data?.members}
          toolBarRender={() => [
            <ProFormSelect
              key={"salesteamwork"}
              width="sm"
              name="memberShip"
              //label="Select member"

              showSearch
              addonAfter={
                <Tooltip placement="topLeft" title="Add Member">
                  <Button
                    size="small"
                    icon={<PlusOutlined />}
                    type="primary"
                    disabled={memberShip === undefined}
                    onClick={() => {
                      if (memberShip) {
                        const existing = state.data?.members?.find(
                          (it) => it.salespersonCode === memberShip.salespersonCode,
                        );
                        if (!existing && memberShip) {
                          const requestersInList =
                            state.data?.members?.some((it) => it.isRequester) &&
                            memberShip.isRequester;
                          if (requestersInList) {
                            // todo
                            message.warning('There are a requester in list.');
                          } else {
                            actions.addMember(memberShip);
                            //setSelectedMembers([...selectedMembers, memberShip]);
                            form.setFieldsValue({ memberShip: undefined });
                            setMemberShip(undefined);
                          }
                        } else if (existing) {
                          message.warning(
                            `${existing.salespersonCode} - ${existing.salespersonName} is added already.`,
                          );
                        }
                      }
                    }}
                  />
                </Tooltip>
              }
              options={state.data?.initData?.salespersonList
                ?.filter((it) => !it.isApprover)
                .map((item) => {
                  return {
                    value: item.salespersonCode,
                    label: (
                      <Space size={0}>
                        {item.salespersonName} &nbsp;&nbsp;
                        {item.isRequester ? <CrownOutlined style={{ color: 'blue' }} /> : undefined}
                      </Space>
                    ),
                  };
                })}
              placeholder="Please Select member"
            />,
          ]}
          options={{
            setting: false,
            density: false,
            fullScreen: false,
            reload: false,
          }}
          columns={[
            { title: 'Code', dataIndex: 'salespersonCode' },
            {
              title: 'Salesperson',
              dataIndex: 'salespersonName',
              render: (_, r) => {
                return (
                  <>
                    {r.salespersonName}&nbsp;&nbsp;
                    <Tooltip placement="top" title={r.isRequester ? 'Requester' : 'Member'}>
                      {r.isRequester ? <CrownOutlined style={{ color: 'blue' }} /> : undefined}
                    </Tooltip>
                  </>
                );
              },
            },
            { title: 'Phone Number', dataIndex: 'phoneNumber' },
            { title: 'Role', dataIndex: 'role' },
            {
              title: 'Action',
              render: (_, data) => {
                return (
                  (type === 'new' || (id && !data.isRequester)) && (
                    <Space size={0}>
                      <Tooltip placement="top" title="Remove">
                        <Button
                          size="small"
                          type="link"
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            actions.removeMember(data);
                          }}
                        />
                      </Tooltip>
                    </Space>
                  )
                );
              },
            },
          ]}
        />
      </Card>
      <VehicleFormModal
        title="Add New Vehicle"
        open={vehicleModal.visible}
        onCancel={() => setVehicleModal({ visible: false })}
        loading={state.loading}
        actionHandlers={{
          onSave: async (item: VehicleLess) => {
            const rs = await actions.saveVehicle(item);
            if (rs?.message === 'Ok') {
              form.setFieldsValue({ vehicleId: rs.data?.plateNumber });
            }
            setVehicleModal({ visible: false });
          },
        }}
      />
    </ProForm>
  );
};

export default StockStoreForm;
