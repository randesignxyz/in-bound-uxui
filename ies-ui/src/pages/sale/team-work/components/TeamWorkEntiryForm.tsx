import { SalesTeamWorkLess, SaveTeamWork, VehicleLess } from '@/services/sale/data';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { FooterToolbar, ProForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';

import ProTable, { ActionType } from '@ant-design/pro-table';
import { useSetState } from 'ahooks';
import { Button, Card, Col, Form, message, Modal, Row, Space, Tooltip } from 'antd';
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
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const TeamWorkEntryForm: React.FC<Props> = ({ type, id }) => {
  const { state, actions } = Model();
  const [form] = Form.useForm<{
    teamName: string;
    description?: string;
    requesterCode: string;
    vehicleId: string;
    memberShip: string;
  }>();
  const [vehicleModal, setVehicleModal] = useSetState<{ visible?: boolean }>({});
  //const [memberModal, setMemberModal] = useSetState<{ visible?: boolean }>();
  const [memberShip, setMemberShip] = useState<SalesTeamWorkLess>();
  //const [selectedMembers, setSelectedMembers] = useState<SalesTeamWorkLess[]>([]);
  const actionRefMembers = useRef<ActionType>();

  useEffect(() => {
    actions.initData(id);
  }, []);

  useEffect(() => {
    if (state.data?.detail) {
      form.setFieldsValue({
        teamName: state.data?.detail?.teamName,
        requesterCode: state.data?.detail?.requester?.salespersonCode,
        description: state.data?.detail?.description,
        vehicleId: state.data.detail.vehicle?.plateNumber,
      });
    }
  }, [state.data?.detail]);

  const onSaveActionHandler = async (isNew: boolean = false) => {
    try {
      const dataFrom = await form.validateFields();
      console.log(dataFrom);
      Modal.confirm({
        title: 'Save Team work',
        content: 'Are you sure?',
        onOk: async () => {
          try {
            const item: SaveTeamWork = {
              id: id,
              teamName: dataFrom.teamName,
              requesterCode: dataFrom.requesterCode,
              description: dataFrom.description,
              vehicleIds: [dataFrom.vehicleId],
              memberIds: state.data?.members?.map((it) => it.salespersonCode),
            };
            console.log(item);
            const so = await actions.saveTeamWork(item);
            if (isNew) {
              form.resetFields();
            } else history.push(`${SalePaths.teamWork}/detail/${so?.data.id}`);
          } catch (error: any) {
            message.error('Failed to save.');
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
        ?.filter((it) => !it.isRequester && !it.isApprover)
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
              {type === 'new' && (
                <Button
                  onClick={() => {
                    form.resetFields();
                  }}
                >
                  Clear
                </Button>
              )}

              {type === 'edit' && (
                <Button
                  onClick={() => {
                    history.push(`${SalePaths.teamWork}/detail/${id}`);
                  }}
                >
                  Cancel
                </Button>
              )}
              {type === 'edit' && (
                <Button
                  onClick={() => {
                    //form.resetFields()
                  }}
                >
                  Reset
                </Button>
              )}
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
              label="Team Name"
              name="teamName"
              rules={[{ required: true }]}
              help={<span />}
            />
            <ProFormTextArea help={<span />} label="Description" name="description" />
          </Col>

          <Col flex="500px">
            <ProFormSelect
              help={<span />}
              label="Owner"
              name="requesterCode"
              rules={[{ required: true }]}
              allowClear={true}
              showSearch
              // fieldProps={{
              //     filterOption: (input, option) => (option?.label?.toString() || '').toLowerCase().indexOf(input.toLowerCase()) >= 0,
              // }}
              options={state.data?.initData?.salespersonList
                ?.filter((it) => it.isRequester)
                .map((item) => {
                  return { value: item.salespersonCode, label: item.salespersonName };
                })}
            />
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
                //setPhoneNumber(keyWords);
                const result =
                  keyWords &&
                  keyWords.length > 1 &&
                  (await actions.searchVehicleByPlateNumber(keyWords));
                return result.map((it: { plateNumber: string }) => ({
                  label: it.plateNumber,
                  value: it.plateNumber,
                }));
              }}
              placeholder="Please select plate number"
            />
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
                          actions.addMember(memberShip);
                          //setSelectedMembers([...selectedMembers, memberShip]);
                          form.setFieldsValue({ memberShip: undefined });
                          setMemberShip(undefined);
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
                ?.filter((it) => !it.isRequester && !it.isApprover)
                .map((item) => {
                  return { value: item.salespersonCode, label: item.salespersonName };
                })}
              placeholder="Please Select member"
            />,
            // <Button
            //   type="primary"
            //   size="small"
            //   disabled={state.loading}
            //   onClick={() => setMemberModal({ visible: true })}
            //   icon={<PlusOutlined />}
            // />,
          ]}
          options={{
            setting: false,
            density: false,
            fullScreen: false,
            reload: false,
          }}
          columns={[
            { title: 'Code', dataIndex: 'salespersonCode' },
            { title: 'Full Name', dataIndex: 'salespersonName' },
            { title: 'Phone Number', dataIndex: 'phoneNumber' },
            { title: 'Position', dataIndex: 'position' },
            {
              title: 'Action',
              render: (_, data) => {
                return (
                  <Space size={0}>
                    {/* <Button size="small" type="link" icon={<EditOutlined />} onClick={(_) => {}} /> */}
                    <Button
                      size="small"
                      type="link"
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        actions.removeMember(data);
                        // var copyArray = selectedMembers
                        //   .copyWithin(-1, -1)
                        //   .filter((it) => it.salespersonCode !== data.salespersonCode);
                        // setSelectedMembers(copyArray);
                        // actionRefMembers.current?.reload();
                      }}
                    />
                  </Space>
                );
              },
            },
          ]}
        />
      </Card>
      {/* <ListMembersModal
        title="Select Members"
        visible={memberModal.visible}
        onCancel={() => setMemberModal({ visible: false })}
        data={state.data?.initData?.salespersonList?.filter(
          (it) => !it.isRequester && !it.isApprover,
        )}
        loading={state.loading}
        actionsHandler={{
          onAdd: (items) => {
            if (items) setSelectedMembers(items);
            setMemberModal({ visible: false });
          },
        }}
      /> */}
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

export default TeamWorkEntryForm;
