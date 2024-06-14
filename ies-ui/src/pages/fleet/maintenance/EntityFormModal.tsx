import { simpleRequestActions } from '@/services/model';

import FileUploader from '@/components/Attachment/FileUploader';
import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { DeleteOutlined, EditOutlined, FieldTimeOutlined } from '@ant-design/icons';
import {
  ActionType,
  EditableFormInstance,
  EditableProTable,
  ProColumns,
  ProForm,
  ProFormDateTimeRangePicker,
  ProFormDigit,
  ProFormMoney,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Col, message, Modal, Row, Tooltip } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { uniqueId } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { FleetPaths } from '..';
import { AddOnServiceAPI } from '../setting/service';
import { VehicleDriverDTO } from '../driver/data';
import { DriverServiceAPI } from '../driver/service';
import { ServiceReminderCreate, ServiceReminderDTO } from '../servicereminder/data';
import ServiceReminderModalForm from '../servicereminder/EntryFormModel';
import { ReminderServiceAPI } from '../servicereminder/service';
import { ServiceTasksDTO } from '../serviceTask/data';
import { ServiceTasksServiceAPI } from '../serviceTask/service';
import { VehicleListItem } from '../vehicle/data';
import { VehicleServiceAPI } from '../vehicle/service';
import { MaintenanceCreate, MaintenanceItemCreate, MaintenneceDTO } from './data';
import { MaintenanceServiceAPI } from './service';
import { FleetServiceAPI } from '../service';
import { LookUpDataDTO } from '../data';

interface Props extends FormModalProps {
  dataEntry?: MaintenneceDTO;
  actionType?: String;
  id?: string;
  serviceReminder?: ServiceReminderDTO;
}

const MaintenanceModalForm: React.FC<Props> = ({
  dataEntry,
  actionType,
  id,
  serviceReminder,
  ...props
}) => {
  const [form] = useForm<MaintenanceCreate>();
  const requestActions = simpleRequestActions();
  const editableFormRef = useRef<EditableFormInstance>();
  const actionRef = useRef<ActionType>();
  const [lookupData, setLookupData] = useState<LookUpDataDTO[]>([]);
  const [vehicleDriver, setVehicleDriver] = useState<VehicleDriverDTO[]>([]);
  const [odometer, setOdometer] = useState();
  const [uploadFileIds, setUploadFileIds] = useState<string[]>([]);
  const services = MaintenanceServiceAPI(requestActions);
  const [reminderModalState, setReminderModalState] = useState<{
    visible?: {
      name: 'modal';
      type: 'ADD' | 'EDIT';
      payload: { vehicle: VehicleListItem; serviceTask?: ServiceTasksDTO };
    };
  }>();
  const [dataSource, setDataSource] = useState<MaintenanceItemCreate[]>();
  const onServiceTaskData = async (k?: { keyWords: string }) => {
    const data = await ServiceTasksServiceAPI(requestActions).page({
      criteria: { searchValue: k?.keyWords || serviceReminder?.serviceTask?.name },
    });
    const items = data.items.map((it) => ({ label: it.name, value: it.id }));
    if (
      dataEntry?.item &&
      !items.some((ob) => dataEntry.item?.find((it) => it.serviceId?.id === ob.value))
    ) {
      const expenceData = dataEntry.item.map((it) => ({
        value: it.serviceId.id,
        label: it.serviceId.name,
        key: uniqueId('ïtems').toString(),
      }));
      return [...expenceData, ...items];
    }
    if (serviceReminder && !items.some((ob) => serviceReminder.serviceTask?.id === ob.value)) {
      const expenceData = {
        value: serviceReminder.serviceTask?.id,
        label: serviceReminder.serviceTask?.name,
      };
      return [expenceData, ...items];
    }
    return items;
  };
  useEffect(() => {
    props.open && initFormData();
    dataLoad();
    dataEntry && onVehicleChange(dataEntry?.vehicle?.id);
    serviceReminder && onVehicleChange(serviceReminder.vehicleId.id);
    props.open &&
      dataEntry?.item &&
      setDataSource(
        dataEntry?.item?.map((it, index) => ({
          ...it,
          id: it.id,
          serviceId: it.serviceId?.id,
          maintenanceType: it.maintenanceType?.id,
          sparePart: it.sparePart?.id,
          itemName: it.itemName?.id,
          warranty: [it.warrantyStartDate, it.warrantyEndDate],
          key: uniqueId.toString() + index,
        })),
      );
    props.open && onServiceTaskData();
  }, [props.open]);
  const dataLoad = async () => {
    setLookupData(await FleetServiceAPI(requestActions).lookupData({ type: 'MAINTENANCE' }));
  };
  const initFormData = () => {
    form.setFieldsValue({
      ...dataEntry,
      vendorName: dataEntry?.vendorName.id,
      vehicleId: dataEntry?.vehicle?.id || serviceReminder?.vehicleId.id,
      attacheFile: [],
      item: [],
      driverId: dataEntry?.driver?.id,
      duration: dataEntry?.formDate ? [dataEntry?.formDate, dataEntry?.toDate] : [],
    });
    setDataSource([]);
  };
  const columns: ProColumns<MaintenanceItemCreate>[] = [
    {
      title: 'Item Service',
      width: 200,
      dataIndex: 'serviceId',
      valueType: 'select',
      debounceTime: 500,
      initialValue: serviceReminder?.serviceTask?.id,
      request: onServiceTaskData,
      ellipsis: true,
      fieldProps: {
        showSearch: true,
        debounce: 500,
        popupMatchSelectWidth: 400,
        placeholder: 'service name',
      },
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
    },
    {
      title: 'Category',
      dataIndex: 'sparePart',
      valueType: 'select',
      request: async () => {
        return lookupData
          .filter((obj) => obj.code == 'SPAREPART')
          .map((it) => ({ value: it.id, label: it.name }));
      },
      ellipsis: true,
      fieldProps: {
        showSearch: true,
        popupMatchSelectWidth: 200,
        placeholder: 'category',
      },
    },
    {
      title: 'Type',
      dataIndex: 'maintenanceType',
      valueType: 'select',
      request: async () => {
        return lookupData
          .filter((obj) => obj.code == 'MAINTENANCETYPE')
          .map((it) => ({ value: it.id, label: it.name }));
      },
      ellipsis: true,
      fieldProps: {
        popupMatchSelectWidth: 200,
        placeholder: 'type',
      },
    },
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      fieldProps: {
        placeholder: ""
      }
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      valueType: 'digit',
      initialValue: 1,
      ellipsis: true,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
    },
    {
      title: 'UOM',
      dataIndex: 'uom',
      valueType: 'select',
      fieldProps: {
        options: [
          {
            label: 'Pair',
            value: 'pair',
          },
          {
            label: 'Liter',
            value: 'litre',
          },
          {
            label: 'Km',
            value: 'km',
          },
          {
            label: 'Each',
            value: 'each',
          },
          {
            label: 'Unit',
            value: 'unit',
          },
          {
            label: 'Set',
            value: 'set',
          },
          {
            label: 'Piece',
            value: 'piece',
          },
        ],
        placeholder: '',
      },
      ellipsis: true,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
    },
    {
      title: 'Unit Cost',
      dataIndex: 'cost',
      valueType: 'money',
      initialValue: 0,
      fieldProps: {
        placeholder: 'cost',
        min: 0,
      },
      ellipsis: true,
      formItemProps: {
        rules: [
          {
            required: true,
          },
        ],
      },
    },
    {
      title: 'Total Cost',
      dataIndex: 'totalCost',
      valueType: 'money',
      ellipsis: true,
      fieldProps: {
        placeholder: 'total Cost',
      },
    },
    {
      title: 'Warranty',
      dataIndex: 'warranty',
      valueType: 'dateRange',
      width: 150,
      fieldProps: {
        placeholder: ['start', 'end'],
      },
    },
    {
      valueType: 'option',
      width: 40,
      render: (_, row) => [
        <a
          key="edit"
          onClick={() => {
            actionRef.current?.startEditable(row.key);
          }}
        >
          <Tooltip title="Edit Record">
            <EditOutlined />
          </Tooltip>
        </a>,
      ],
    },
  ];
  const onSaveActionHandler = (data: MaintenanceCreate) => {
    Modal.confirm({
      title: 'Save Maintenance Record',
      content: ' are you sure?',
      onOk: async () => {
        const response = (await services.save(data)) as {
          data: string;
          message: string;
        };
        actionRef.current?.reloadAndRest?.();
        history.push(`${FleetPaths.mantenence}/detail/${response.data}`);
        message.success(response.message);
      },
    });
  };
  const onVehicleChange = async (e: string | undefined) => {
    const data = await DriverServiceAPI(requestActions).listVehicleDriver({
      id: e || serviceReminder?.vehicleId.id,
      status: 'active',
    });
    VehicleServiceAPI(requestActions)
      .findMeterHistory({
        vehicleId: e || '',
        meterType: 'maintenance',
      })
      .then((it) => {
        setOdometer(it.meterValue);
      });
    if (data.length > 0) {
      setVehicleDriver(data);
      form.setFieldValue(['driverId'], data.map((it) => it.driverId?.id)[0]);
    } else {
      setVehicleDriver(data);
      form.setFieldValue(['driverId'], '');
    }
  };
  return (
    <FormModalComp
      title="Service & Maintenance"
      {...props}
      width={'1200px'}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        await editableFormRef.current?.validateFields();
        const totalAmount = dataSource
          ?.filter((it) => it.cost != null)
          .reduce((sum, current) => sum + current.totalCost, 0);
        const entity = {
          ...dataForm,
          totalCost: totalAmount || 0,
          item: dataSource,
          serviceReminder: serviceReminder,
          attacheFile: uploadFileIds,
        };
        onSaveActionHandler(entity);
      }}
    >
      <ProForm form={form} submitter={false} onReset={() => form.resetFields()}>
        <Row gutter={6}>
          <Col span={8}>
            <ProFormSelect
              placeholder={'choose vehicle'}
              labelAlign="left"
              label="Vehicle"
              name="vehicleId"
              rules={[{ required: true }]}
              showSearch={true}
              debounceTime={500}
              initialValue={dataEntry?.vehicle?.id}
              request={async ({ keyWords }) => {
                const data = await VehicleServiceAPI(requestActions).pageVehicle({
                  criteria: {
                    searchValue:
                      keyWords || dataEntry?.vehicle?.id || serviceReminder?.vehicleId?.id,
                  },
                });
                return data.items.map((obj) => ({ value: obj.id, label: `${obj.plateNumber}` }));
              }}
              fieldProps={{
                onChange: (e: string) => {
                  onVehicleChange(e);
                },
              }}
            />
          </Col>
          <Col span={8}>
            <ProFormSelect
              key={'drivername'}
              placeholder={'Driver Name'}
              labelAlign="left"
              width={'lg'}
              label="Driver Name"
              name="driverId"
              rules={[{ required: true }]}
              showSearch={true}
              options={vehicleDriver
                .filter((it) => it.status === 'active')
                .map((obj, index) => ({
                  value: obj.driverId.id,
                  label: (
                    <span>
                      {[obj.driverId?.firstName, obj.driverId?.lastName]
                        .filter((it) => it)
                        .join(' ')}{' '}
                      (<span style={{ color: '#808080' }}> {obj.driverType}</span> )
                    </span>
                  ),
                  key: index,
                  selected: true,
                }))}
            />
          </Col>
          <Col span={8}>
            <ProFormSelect
              name={'vendorName'}
              label={'Vendor Name'}
              placeholder={'choose vendor'}
              showSearch
              request={async ({ keyWords }) => {
                const data = await AddOnServiceAPI(requestActions).page({
                  criteria: { searchValue: keyWords },
                });
                return data?.items
                  ?.filter((it) => it.referTo === 'maintenance')
                  .map((it) => ({ value: it.id, label: it.name }));
              }}
              rules={[{ required: true }]}
            />
          </Col>
          <Col span={8}>
            <ProFormDigit
              name={'odometer'}
              label="Odometer"
              placeholder="odometer"
              rules={[
                {
                  required: true,
                  min: odometer || dataEntry?.odometer || serviceReminder?.meterHistory?.meterValue,
                  type: 'integer',
                },
              ]}
            />
          </Col>
          <Col span={8}>
            <ProFormText
              name="referentNumber"
              label="Receipt Number"
              placeholder="receipt number (optional)"
              fieldProps={{
                onKeyUp: (e) => {
                  const newValue = ('0'.repeat(6) + e.currentTarget?.value.toString()).slice(-6);
                  form.setFieldValue('referentNumber', newValue);
                },
              }}
            />
          </Col>
          <Col span={8}>
            <ProFormDateTimeRangePicker
              width={'lg'}
              name="duration"
              label="Duration Maintenance"
              placeholder={['start', 'end']}
              fieldProps={{
                format: 'YYYY-MM-DD HH:mm',
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col span={20}>
            <label>Item</label>
          </Col>
          <Col span={4}>
            <ProFormMoney
              placeholder={''}
              addonBefore="Total"
              fieldProps={{
                value: dataSource
                  ?.filter((it) => it.cost != null)
                  .reduce((sum, current) => sum + current.totalCost, 0),
              }}
            />
          </Col>
        </Row>
        <Row>
          <EditableProTable<MaintenanceItemCreate & { key: string }>
            toolBarRender={false}
            rowKey={'key'}
            editableFormRef={editableFormRef}
            actionRef={actionRef}
            controlled
            size="small"
            headerTitle="item"
            value={dataSource}
            formItemProps={{
              rules: [
                {
                  validator: async (_, value) => {
                    if (value.length < 1) {
                      throw new Error('no value');
                    }

                    if (value.length > 5) {
                      throw new Error('no Value');
                    }
                  },
                },
              ],
            }}
            columns={columns}
            recordCreatorProps={{
              newRecordType: 'dataSource',
              record: (index) => ({ key: uniqueId().toString() + index } as any),
              creatorButtonText: 'New Item',
            }}
            editable={{
              type: 'multiple',
              editableKeys: dataSource?.map((it) => it.key),
              actionRender: (row, config) => [
                <Button
                  onClick={() => {
                    config.onDelete?.(config.recordKey, row);
                  }}
                  type="link"
                  style={{ color: 'red' }}
                  key={`del-${row.key}`}
                  icon={<DeleteOutlined />}
                />,
                <Tooltip title="Add Service Reminder">
                  <Button
                    onClick={async () => {
                      const itemName = editableFormRef.current?.getFieldValue([
                        row.key,
                        'serviceId',
                      ]);
                      const serviceTaskItem = await ServiceTasksServiceAPI(requestActions).fetch(
                        row.serviceId,
                      );
                      if ((await form.validateFields(['vehicleId'])) && itemName != null) {
                        const vehicleId = form.getFieldValue('vehicleId');
                        const vehicle = await VehicleServiceAPI(requestActions).fetchVehicle(
                          vehicleId,
                        );
                        setReminderModalState({
                          visible: {
                            name: 'modal',
                            type: 'ADD',
                            payload: { vehicle: vehicle, serviceTask: serviceTaskItem },
                          },
                        });
                      }
                    }}
                    type="link"
                    key={`del-${row.key}`}
                    icon={<FieldTimeOutlined />}
                  />
                </Tooltip>,
              ],
              onValuesChange: (record, data) => {
                const changeCateRecord = dataSource?.find((it) => it.key == record?.key);
                setDataSource(
                  data.map((it) =>
                    it.key == changeCateRecord?.key
                      ? ({ ...it, totalCost: record?.cost * record?.quantity } as any)
                      : { ...it },
                  ),
                );
              },
            }}
          />
        </Row>
        <FileUploader
          service="FILE"
          title="Attachment file"
          onSetFiles={(files) => setUploadFileIds(files.map((it) => it.response))}
        />
      </ProForm>
      <ServiceReminderModalForm
        open={reminderModalState?.visible?.name === 'modal'}
        onSave={(data: ServiceReminderCreate) => {
          Modal.confirm({
            title: 'Save Service Reminder Record',
            content: ' are you sure?',
            onOk: async () => {
              await ReminderServiceAPI(requestActions).save(data);
              setReminderModalState((v) => ({ ...v, visible: undefined }));
            },
          });
        }}
        onCancel={() => setReminderModalState((v) => ({ ...v, visible: undefined }))}
        outReminder={reminderModalState?.visible?.payload}
      />
    </FormModalComp>
  );
};

export default MaintenanceModalForm;
