import { simpleRequestActions } from '@/services/model';
import {
  ProForm,
  ProFormDatePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { Checkbox, Col, Row, Space } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect, useState } from 'react';
import { ServiceTasksServiceAPI } from '../serviceTask/service';
import { VehicleListItem } from '../vehicle/data';
import { VehicleServiceAPI } from '../vehicle/service';
import { ServiceReminderCreate, ServiceReminderDTO } from './data';
import { ReminderServiceAPI } from './service';
import { ServiceTasksDTO } from '../serviceTask/data';

interface Props extends FormModalProps {
  data?: ServiceReminderDTO | undefined;
  onSave: (data: ServiceReminderCreate) => void;
  actionType?: String;
  id?: number;
  fromFuel?: string;
  outReminder?: { vehicle: VehicleListItem; serviceTask?: ServiceTasksDTO };
}
const ServiceReminderModalForm: React.FC<Props> = ({
  onSave,
  outReminder,
  data,
  actionType,
  id,
  fromFuel,
  ...props
}) => {
  const [form] = useForm<ServiceReminderCreate>();
  const requestActions = simpleRequestActions();
  const [manually, setManuanlly] = useState(true);
  const [vehicle, setVehicle] = useState<VehicleListItem>();
  useEffect(() => {
    props.open && initFormData();
    props.open && data
      ? data
      : form.resetFields(['timeInterval', 'vehicleId', 'serviceTask', 'meterInterval']);
    props.open &&
      outReminder  &&
      onAutoCompleteVehicleService(outReminder.vehicle.id , outReminder.serviceTask?.id || 0);
    props.open && fromFuel && form.setFieldValue("vehicleId", fromFuel)
  }, [props.open]);
  const initFormData = () => {
    form.setFieldsValue({
      ...data,
      serviceTaskId: data?.serviceTask?.id,
      vehicleId: data?.vehicleId.id,
    });
  };
  const onSetTimeNextDue = (date: Date) => {
    const timeFrequency = form.getFieldValue('timeFrequency');
    const timeInterval = form.getFieldValue('timeInterval');
    if (timeFrequency == 'days') {
      form.setFieldValue('nextDueAt', new Date(date.setDate(date.getDate() + timeInterval)));
    } else if (timeFrequency == 'weeks') {
      form.setFieldValue('nextDueAt', new Date(date.setDate(date.getDate() + timeInterval * 7)));
    } else if (timeFrequency == 'months') {
      form.setFieldValue('nextDueAt', new Date(date.setDate(date.getDate() + timeInterval * 30)));
    } else {
      form.setFieldValue('nextDueAt', new Date(date.setDate(date.getDate() + timeInterval * 366)));
    }
  };
  const onServiceLoad = async (keyWords?: string, vehicleId?: string) => {
    const response = await ServiceTasksServiceAPI(requestActions).page({
      criteria: { searchValue: keyWords },
    });
    const data = response.items.map((it) => {
      return {
        value: it.id,
        label: it.name,
      };
    });
    return data;
  };
  const onAutoCompleteVehicleService = (vehicleId: string, serviceId: number) => {
    ReminderServiceAPI(requestActions)
      .fetchVehicleServiceTask({ vehicleId: vehicleId, serviceTaskId: serviceId })
      .then((item) => {
        return form.setFieldsValue({
          dueSoonMeterThreshold: item.dueSoonMeterThreshold,
          nextDueAt: item.nextDueAt,
          dueSoonTimeThresholdInterval: item.dueSoonTimeThresholdInterval,
          dueSoonTimeThresholdFrequency: item.dueSoonTimeThresholdFrequency,
          meterInterval: item.meterInterval,
          nextDueMeter: item.nextDueMeter,
          timeFrequency: item.timeFrequency,
          timeInterval: item.timeInterval,
          scheduleType: item.scheduleType || "ALL",
          id: item.id,

        });
      })
      .catch((error) => {
        form.setFieldsValue({
          dueSoonMeterThreshold: undefined,
          nextDueAt: undefined,
          dueSoonTimeThresholdInterval: undefined,
          dueSoonTimeThresholdFrequency: undefined,
          meterInterval: undefined,
          nextDueMeter: undefined,
          timeFrequency: undefined,
          timeInterval: undefined,
        });
      });
  };
  return (
    <FormModalComp
      title="Service Reminder"
      {...props}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        const entity = {
          ...dataForm,
          status: 'Upcoming',
        };
        onSave(entity);
      }}
    >
      <ProForm form={form} submitter={false} onReset={() => form.resetFields()}>
        <Row gutter={4}>
          <Col span={24}>
            <ProFormText name={'id'} hidden initialValue={data?.id} />
            <ProFormSelect
              name={'vehicleId'}
              label="Select Vehicle"
              placeholder="Please choose truck"
              showSearch
              disabled={data?.vehicleId || outReminder?.vehicle || fromFuel? true : false}
              debounceTime={500}
              initialValue={outReminder ? outReminder.vehicle.id : ''}
              request={async (k: { keyWords: string }) => {
                const recordList = await VehicleServiceAPI(requestActions).pageVehicle({
                  criteria: { searchValue: k.keyWords || data?.vehicleId?.id || outReminder?.vehicle?.id || fromFuel },
                });
                return recordList.items.map((it, index) => ({
                  value: it.id,
                  label: [it.plateNumber].join('-'),
                  key: index,
                }));
              }}
              fieldProps={{
                onSelect: async (e) => {
                  setVehicle(await VehicleServiceAPI(requestActions).fetchVehicle(e))
                },
                onChange: (value:string) => {
                  onServiceLoad('', value);
                },
              }}
            />
            <ProFormDependency dependencies={['vehicleId']} name={['vehicleId']}>
              {({ vehicleId }) => {
                return (
                  <ProFormSelect
                    name={'serviceTaskId'}
                    label="Service Tasks"
                    placeholder="Please select service tasks"
                    showSearch
                    debounceTime={500}
                    initialValue={outReminder?.serviceTask?.id || ''}
                    disabled={outReminder?.serviceTask ? true : false}
                    request={async ({ keyWords }) => {
                      const response = await ServiceTasksServiceAPI(requestActions).page({
                        criteria: { searchValue: keyWords, advanceSearch: { id: data?.serviceTask?.id } },
                      });
                      const items = response.items.map(it => ({ label: it.name, value: it.id }));

                      if (data && !response.items.some(it => it.id == data.serviceTask?.id)) {
                        return [{ label: data.serviceTask?.name, value: data.serviceTask?.id }, ...items]
                      }
                      if (outReminder?.serviceTask) {
                        return [{ label: outReminder.serviceTask?.name, value: outReminder.serviceTask?.id }, ...items]
                      }
                      return items
                    }}
                    fieldProps={{
                      onChange: (e:number) => onAutoCompleteVehicleService(vehicleId, e),
                    }}
                    rules={[
                      {
                        required: true,
                      },
                    ]}
                  />
                );
              }}
            </ProFormDependency>
            <ProFormRadio.Group
              name={'scheduleType'}
              layout="horizontal"
              label="Set Schedule"
              initialValue="ALL"
              options={[
                { label: 'Time', value: 'TIME' },
                { label: 'Meter', value: 'METER' },
                { label: 'Both', value: 'ALL' },
              ]}
            />
            <ProFormDependency dependencies={['scheduleType']} name={['scheduleType']}>
              {({ scheduleType }) => {
                scheduleType == 'TIME' && form.resetFields(['meterInterval', 'nextDueMeter']);
                scheduleType == 'METER' && form.resetFields(['timeInterval', 'nextDueAt']);
                return (
                  <>
                    {(scheduleType == 'TIME' || scheduleType == 'ALL') && (
                      <Row gutter={6}>
                        <Col span={7}>
                          <ProFormDigit
                            name="timeInterval"
                            rules={[{ required: true }]}
                            min={1}
                            label="Time Interval (every)"
                            fieldProps={{
                              onChange: () => onSetTimeNextDue(new Date()),
                            }}
                          />
                        </Col>
                        <Col span={5}>
                          <ProFormSelect
                            style={{ marginTop: 30 }}
                            name={'timeFrequency'}
                            rules={[{ required: true }]}
                            fieldProps={{
                              onChange: () => onSetTimeNextDue(new Date()),
                            }}
                            options={[
                              {
                                value: 'days',
                                label: 'Day (s)',
                              },
                              {
                                value: 'weeks',
                                label: 'week (s)',
                              },
                              {
                                value: 'months',
                                label: 'Month (s)',
                              },
                              {
                                value: 'years',
                                label: 'Year (s)',
                              },
                            ]}
                          />
                        </Col>
                        <Col span={7}>
                          <ProFormDigit
                            name={'dueSoonTimeThresholdInterval'}
                            label="Time Due Soon"
                            min={1}
                          />
                        </Col>
                        <Col span={5}>
                          <ProFormSelect
                            name={'dueSoonTimeThresholdFrequency'}
                            style={{ marginTop: 30 }}
                            fieldProps={{
                              onChange: () => { },
                            }}
                            options={[
                              {
                                value: 'days',
                                label: 'Day (s)',
                              },
                              {
                                value: 'weeks',
                                label: 'week (s)',
                              },
                              {
                                value: 'months',
                                label: 'Month (s)',
                              },
                              {
                                value: 'years',
                                label: 'Year (s)',
                              },
                            ]}
                          />
                        </Col>
                      </Row>
                    )}
                    {(scheduleType == 'METER' || scheduleType == 'ALL') && (
                      <Row gutter={6}>
                        <Col span={12}>
                          <ProFormDigit
                            name={'meterInterval'}
                            label="Primary Meter Interval"
                            rules={[{ required: true }]}
                            min={1}
                          />
                        </Col>
                        <Col span={12}>
                          <ProFormDigit
                            min={0}
                            name={'dueSoonMeterThreshold'}
                            label="Primary Meter Due Soon Threshold"
                            max={parseInt(form.getFieldValue('meterInterval'))}
                            rules={[
                              {
                                max: parseInt(form.getFieldValue('meterInterval')),
                                type: 'integer',
                              },
                            ]}
                          />
                        </Col>
                      </Row>
                    )}
                  </>
                );
              }}
            </ProFormDependency>
            <Row gutter={6} style={{ display: '' }}>
              <Space>
                <Checkbox
                  defaultChecked={false}
                  onChange={(e) => setManuanlly(!e.target.checked)}
                  id="manuanlly"
                />
                <label itemID="manuanlly">
                    Manually set the due date and/or meter for the next reminder.
                  <p style={{ fontSize: 11, color: 'gray', margin: 0, padding: 0 }}>
                    Adjust the schedule by updating the next reminder's meter and/or date.
                  </p>
                </label>
              </Space>
            </Row>
            <Row gutter={6}>
              <Col span={10}>
                <ProFormDatePicker
                  disabled={manually}
                  width={'md'}
                  name="nextDueAt"
                  label="Next Due Date"
                />
              </Col>
              <Col span={10}>
                <ProFormDependency
                  dependencies={['meterInterval', 'vehicleId']}
                  name={['meterInterval', 'vehicleId']}
                >
                  {({ meterInterval }) => {
                    const vehicleData = vehicle?.currentMeter?.meterValue || data?.meterHistory?.meterValue || outReminder?.vehicle?.currentMeter?.meterValue
                    const value = (parseFloat(meterInterval) + parseFloat(vehicleData)) | 0;
                    form.setFieldValue('nextDueMeter', value);
                    return (
                      <></>
                    );
                  }}
                </ProFormDependency>
                <ProFormDigit
                  disabled={manually}
                  name="nextDueMeter"
                  width={'md'}
                  allowClear
                  label="Next Due Primary Meter"
                  fieldProps={{
                    placeholder: 'enter kilometer',
                  }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </ProForm>
    </FormModalComp>
  );
};

export default ServiceReminderModalForm;
