import { simpleRequestActions } from '@/services/model';
import {
  ProFormDatePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Checkbox, Col, Row, Space } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { ServiceTasksServiceAPI } from '../serviceTask/service';
import { VehicleServiceAPI } from '../vehicle/service';
import { ServiceReminderCreate } from './data';
export default () => {
  const [form] = useForm<ServiceReminderCreate>();
  const requestActions = simpleRequestActions();
  return (
    <>
      <Row gutter={4}>
        <Col span={24}>
          <ProFormSelect
            name={'vehicleId'}
            label="Select Vehicle"
            placeholder="Please choose truck"
            showSearch
            debounceTime={500}
            request={async ({ keyWords }) => {
              const data = await VehicleServiceAPI(requestActions).pageVehicle({
                criteria: { searchValue: keyWords },
              });
              return data.items.map((it, index) => ({
                value: it.id,
                label: [it.plateNumber].join('-'),
                key: index,
              }));
            }}
            fieldProps={{
              onChange: (value) => {},
            }}
          />
          <ProFormDependency dependencies={['vehicleId']} name={['vehicleId']}>
            {({ vehicleId }) => {
              return (
                <ProFormSelect
                  name={'serviceTaskId'}
                  label="Service Tasks"
                  mode="multiple"
                  placeholder="Please select service tasks"
                  showSearch
                  debounceTime={500}
                  request={async ({ keyWords }) => {
                    const response = await ServiceTasksServiceAPI(requestActions).page({
                      criteria: { searchValue: keyWords },
                    });
                    const data = response.items
                      .filter((it) => it.serviceTaskVehicle != null)
                      .map((it) => ({
                        value: it.id,
                        label: it.name,
                        disabled: it.serviceTaskVehicle?.vehicleId === vehicleId ? true : false,
                      }));
                    return response.items.map((it) => ({ value: it.id, label: it.name }));
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
                        />
                      </Col>
                      <Col span={5}>
                        <ProFormSelect
                          style={{ marginTop: 30 }}
                          name={'timeFrequency'}
                          rules={[{ required: true }]}
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
                          fieldProps={{
                            onChange: () => {},
                          }}
                        />
                      </Col>
                      <Col span={5}>
                        <ProFormSelect
                          name={'dueSoonTimeThresholdFrequency'}
                          style={{ marginTop: 30 }}
                          fieldProps={{
                            onChange: () => {},
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
          <Row gutter={6} style={{ display: 'none' }}>
            <Space>
              <Checkbox
                defaultChecked={false}
                id="manuanlly"
              />
            </Space>
          </Row>
          <Row gutter={6}>
            <Col span={10}>
              <ProFormDatePicker
                disabled={true}
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
                {({ meterInterval, vehicleId }) => {
                  return (
                    <ProFormDigit
                      disabled={true}
                      name="nextDueMeter"
                      width={'md'}
                      allowClear
                      label="Next Due Primary Meter"
                      fieldProps={{
                        placeholder: 'enter kilometer',
                      }}
                    />
                  );
                }}
              </ProFormDependency>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};
