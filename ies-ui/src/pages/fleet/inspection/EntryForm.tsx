import { simpleRequestActions } from '@/services/model';
import {
  ActionType,
  EditableFormInstance,
  EditableProTable,
  FooterToolbar,
  ProForm,
  ProFormDatePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Card, Checkbox, Col, Input, message, Modal, Row, Spin } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { FleetPaths } from '..';
import BreadCrumbCom from '../components/BreadCrumbCom';
import { DriverServiceAPI } from '../driver/service';
import { VehicleListItem } from '../vehicle/data';
import { VehicleServiceAPI } from '../vehicle/service';
import { InspectionCreate, InspectionItemCreate } from './data';
import { InspectionServiceAPI } from './service';

export default () => {
  const requestActions = simpleRequestActions();
  const [form] = useForm<InspectionCreate>();
  const services = InspectionServiceAPI(requestActions);
  const editableFormRef = useRef<EditableFormInstance>();
  const [items, setItems] = useState<InspectionItemCreate[]>([]);
  const [odometer, setOdometer] = useState();
  const [vehicle, setVehicle] = useState<VehicleListItem[]>([]);
  const startDate = new Date();
  const actionRef = useRef<ActionType>();

  const loadData = async (codeType: string) => {
    const rsn = await services.inspectionLookupList(codeType);
    setItems(
      rsn
        .filter((obj) => obj.parentId != 0)
        .map((it) => ({
          id: it.id,
          item: it.item,
          itemId: it.id,
          remark: '',
          itemKh: it.itemKh,
          result: false,
          key: it.id.toString(),
        })),
    );
  };
  const [reminderModalState, setReminderModalState] = useState<{
    visible?: {
      name: 'modal';
      type: 'ADD' | 'EDIT';
      payload: { vehicle: string; serviceTask?: number };
    };
  }>();

  useEffect(() => {
    loadData('DAILY');
  }, []);

  const onSaveActionHandler = async () => {
    const dataForm = await form.validateFields();
    const duration = +new Date() - +startDate;

    await editableFormRef.current?.validateFields();

    const entity = {
      ...dataForm,
      item: items,
      odometer: form.getFieldValue("odometer"),
      duration: duration
    }


    Modal.confirm({
      title: 'save Inspection record',
      content: 'Are you sure?',
      onOk: async () => {
        await services.save(entity);
        form.resetFields(['vehicleId', 'odometer']);
        editableFormRef.current?.resetFields();
        message.success('success submit');
        history.push(`${FleetPaths.inspection}/list`);
      },
    });
  };

  const routes = [
    {
      path: FleetPaths.fleet,
      label: 'Fleet',
    },
    {
      path: FleetPaths.inspection + '/list',
      label: 'List',
    },
    {
      path: '',
      label: 'Inspection',
    },
  ];





  return (
    <Spin spinning={requestActions.request?.loading || false}>
      <BreadCrumbCom separator=">" routes={routes} />
      <Card>
        <ProForm
          form={form}
          layout={'vertical'}
          style={{ paddingBottom: 9 }}
          key="form-inspection"
          rowProps={{
            gutter: [12, 'inline' ? 16 : 0],
          }}
          submitter={{
            render: () => {
              return (
                <FooterToolbar>
                  <Button type="primary" onClick={() => history.push('/fleet/inspection/list')}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      onSaveActionHandler();
                    }}
                  >
                    Save
                  </Button>
                </FooterToolbar>
              );
            },
          }}
        >
          <Row gutter={4}>
            <Col span={8}>
              <ProFormSelect
                label="Vehicle"
                name="vehicle"
                key="vehicle"
                rules={[{ required: true }]}
                showSearch
                debounceTime={500}
                request={async ({ keyWords }) => {
                  const data = await VehicleServiceAPI(requestActions).pageVehicle({
                    criteria: { searchValue: keyWords },
                  });
                  setVehicle(data.items);
                  return data.items.map((obj) => ({
                    value: obj.id,
                    label: `${obj.plateNumber}`,
                  }));
                }}
                fieldProps={{
                  onChange: (e: string) => {
                    // const odometer = vehicle?.filter(it => it.id == e).map((it) => it.currentMeter?.meterValue);
                    // setOdometer(odometer[0]);
                    const data = VehicleServiceAPI(requestActions)
                      .findMeterHistory({
                        vehicleId: e,
                        meterType: 'Inspection',
                      })
                      .then((it) => {
                        setOdometer(it.meterValue);
                      });
                  },
                }}
              />
            </Col>

            <Col span={8}>
              <ProFormDatePicker
                key={'date'}
                width={'lg'}
                name={'date'}
                initialValue={moment()}
                label="Inspection Date"
                required
              />
            </Col>

            <Col span={8}>
              <ProFormSelect
                label="Inspection Type"
                name="inspectionType"
                key="inspection"
                initialValue={'DAILY'}
                rules={[{ required: true }]}
                fieldProps={{
                  onChange: (e) => {

                    if (e === "DAILY") {
                      loadData("DAILY")
                    }
                    else if (e === "WEEKLY") {
                      loadData("DAILY")
                    }
                    else {
                      loadData("MONTHLY")
                    }
                  }
                }}
                options={[
                  {
                    value: "DAILY",
                    label: "Daily "
                  },
                  {
                    value: "WEEKLY",
                    label: "Weekly"
                  },
                  {
                    value: "MONTHLY",
                    label: "Monthly "
                  },
                  {
                    value: "ANNUALLY",
                    label: "Annually "
                  },
                ]}
              />
            </Col>
            <Col span={8}>
              <ProFormDigit
                name="odometer"
                label="Odometer"
                rules={[
                  {
                    required: true,
                    min: odometer,
                    type: 'integer',
                  },
                ]}
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                name={'inspectedBy'}
                label="Inspected by"
                showSearch
                rules={[{ required: true }]}
                request={async (k: { keyWords: string }) => {
                  const data = await DriverServiceAPI(requestActions).list({
                    searchValue: k.keyWords,
                  });
                  return data.map((it) => ({
                    value: it.id,
                    label: [it.firstName, it.lastName].filter((it) => it).join(' '),
                  }));
                }}
              />
            </Col>
            <ProFormDependency dependencies={['inspectionType']} name={['inspectionType']}>
              {({ inspectionType }) => {
                return (inspectionType != "DAILY" && inspectionType != "WEEKLY") ? <Col span={8}>
                  <ProFormText
                    allowClear
                    name="technicianName"
                    label="Technician Name"
                    rules={[
                      {
                        required: true,
                        max: 40
                      },
                    ]}
                  />

                </Col> : ""
              }}
            </ProFormDependency>
          </Row>
          <EditableProTable<InspectionItemCreate>
            value={items}
            editableFormRef={editableFormRef}
            rowKey="key"
            size="small"
            recordCreatorProps={false}
            controlled
            actionRef={actionRef}
            editable={{
              type: 'multiple',
              editableKeys: items?.map((it) => it.key),
            }}
            columns={[
              {
                title: 'No',
                width: 50,
                editable: false,
                render: (_, index, i = 1) => (i += 1),
              },
              {
                width: 1,
                formItemProps: {
                  hidden: true,
                },
                dataIndex: 'itemId',
              },
              {
                width: 1,
                formItemProps: {
                  hidden: true,
                },
                dataIndex: 'item',
              },
              {
                title: 'Performance Checks',
                editable: false,
                render: (_, r) => (
                  <>
                    {r.item}
                    <br />
                    {r.itemKh}
                  </>
                ),
              },
              {
                title: 'Result (Pass)',
                width: 100,
                dataIndex: 'result',
                renderFormItem: (s, b) => (
                  <Checkbox
                    onChange={(e) => {
                      const data = items.filter((it) => it.id == b.record?.id)[0];
                      data.result = e.target.checked;
                      editableFormRef.current?.setFieldValue(
                        [b.record?.key || 0, 'result'],
                        e.target.checked,
                      );
                    }}
                  />
                ),
              },
              {
                title: 'Corrective Actions',
                dataIndex: 'remark',
                renderFormItem: (s, b) => (
                  <Input
                    onChange={(e) => {
                      const data = items.filter((it) => it.id == b.record?.id)[0];
                      data.remark = e.target.value;
                    }}
                  />
                ),
                formItemProps: (form, confige) => {
                  const item = form.getFieldValue(confige.rowKey || '');

                  return {
                    ...confige,
                    rules: [{ required: item?.result ? false : true }],
                  };
                },
              },
            ]}
          />
          <ProFormTextArea name="remark" placeholder={'remark...'} />
        </ProForm>
      </Card>

      {/* <ServiceReminderModalForm
        open={reminderModalState?.visible?.name === "modal"}
        onSave={(data: ServiceReminderCreate) => {
          Modal.confirm({
            title: "Save Service Reminder Record",
            content: " are you sure?",
            onOk: async () => {
              const response = await ReminderServiceAPI(requestActions).save(data) as ({
                data: string,
                message: string
              });
              setReminderModalState((v) => ({ ...v, visible: undefined }));

            }
          })
        }}
        onCancel={() => setReminderModalState((v) => ({ ...v, visible: undefined }))}
        outReminder={reminderModalState?.visible?.payload}
      /> */}
    </Spin>
  );
};
