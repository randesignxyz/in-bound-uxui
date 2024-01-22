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

import FileUploader from '@/components/Attachment/FileUploader';
import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { FieldTimeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Divider, message, Modal, Row, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { VehicleDriverDTO } from '../driver/data';
import { DriverServiceAPI } from '../driver/service';
import { TankDTO } from '../fuelStock/data';
import { TankFuelServiceAPI } from '../fuelStock/service';
import { LookUpDataDTO } from '../lookupData/data';
import { LookupDataServiceAPI } from '../lookupData/service';
import { ServiceReminderCreate } from '../servicereminder/data';
import ServiceReminderModalForm from '../servicereminder/EntryFormModel';
import { ReminderServiceAPI } from '../servicereminder/service';
import { VehicleListItem } from '../vehicle/data';
import { VehicleServiceAPI } from '../vehicle/service';
import { FuelCreate, FuelDTO } from './data';
import { FuelServiceAPI } from './service';
import { AddOnServiceAPI } from '../addOn/service';

interface Props extends FormModalProps {
  data?: FuelDTO;
  onSave: (data: FuelCreate) => void;
  actionType?: String;
  id?: string;
}

const FuelModalForm: React.FC<Props> = ({ onSave, data, actionType, id, ...props }) => {
  const [form] = useForm<FuelCreate>();
  const requestActions = simpleRequestActions();
  const [fuelLookup, setFuelLookup] = useState<LookUpDataDTO[]>([]);
  const [vehicleDriver, setVehicleDriver] = useState<VehicleDriverDTO[]>([]);
  const [odometer, setOdometer] = useState<number>(0);
  const [vehicle, setVehicle] = useState<VehicleListItem[]>([]);
  const [uploadFileIds, setUploadFileIds] = useState<string[]>([]);
  const [oldFuelConsumption, setOldFuelConsumption] = useState<FuelDTO>();
  const [pumpbyForm] = useForm<VendorCreate>();
  const [gasStaion, setGasStation] = useState<TankDTO[]>([]);
  const [reminderModalState, setReminderModalState] = useState<{
    visible?: {
      name: 'modal';
      type: 'ADD' | 'EDIT';
      payload: { vehicle: string };
    };
  }>();


  const lookupData = async () => {
    const dataLookup = LookupDataServiceAPI(requestActions).lookupData({ type: 'VEHICLE' });
    setFuelLookup(await dataLookup);
    setGasStation(await TankFuelServiceAPI(requestActions).list(''));
  };
  useEffect(() => {
    props.open && initFormData();
    lookupData();
    props.open && onVehicleChange(data?.vehicleId?.id);
  }, [props.open]);

  const initFormData = () => {
    form.setFieldsValue({
      ...data,
      vehicleId: data?.vehicleId?.id,
      odometer: data?.kilometer,
      dateRefilled: data?.refilledDate,
      quantity: data?.quantity,
      gasType: data?.gasType?.id,
      location: data?.location?.id,
      gasStation: data?.gasStation?.id
    });
  };

  const onVehicleChange = async (e: string | undefined) => {
    const data = await DriverServiceAPI(requestActions).listVehicleDriver({
      id: e || '',
      status: 'active',
    });

    if (data.length > 0) {
      setVehicleDriver(data);
      form.setFieldValue(['driverId'], data.map((it) => it.driverId?.id)[0]);
    } else {
      setVehicleDriver(data);
      form.setFieldValue(['driverId'], '');
    }
  };
  const loadLatFuelByVehicle = async (vehicleId: string) => {
    const record = await FuelServiceAPI(requestActions).fetchFuelVehicle(vehicleId);
    setOldFuelConsumption(record);
  };

  return (
    <FormModalComp
      title="Fuel Consumption"
      {...props}
      width={'800px'}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        const entity = {
          ...dataForm,
          id: data?.id,
          fileId: uploadFileIds,
        };
        onSave(entity);
      }}
      onResetForm={() => {
        form.resetFields();
      }}
    >
      <ProForm
        form={form}
        size={'middle'}
        submitter={false}
        onReset={() => form.resetFields()}
        onValuesChange={(s) => {
          (s.gasType || s.location) && form.setFieldValue(['gasStation'], '');
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <ProFormRadio.Group
            name={'gasType'}
            radioType="button"
            noStyle={true}
            initialValue={fuelLookup.filter((it) => it.code === 'FUELTYPE')[0]?.id}
            options={fuelLookup
              .filter((it) => it.code === 'FUELTYPE')
              .map((it) => ({ value: it?.id, label: it?.name }))}
          />

          <ProFormSelect
            addonBefore="Location"
            name={'location'}
            rules={[{ required: true }]}
            initialValue={1001}
            request={async () => {
              const data = await LookupDataServiceAPI(requestActions).lookupData({ type: 'FUEL' });
              return data
                .filter((it) => it.code == 'GASSTATION')
                .map((it, index) => ({ value: it?.id, label: it?.name, key: index, selected: true }));
            }}
          />
        </div>
        {/* </Space> */}
        <ProFormDependency dependencies={['vehicleId', 'gasType']} name={['vehicleId', 'gasType']}>
          {({ vehicleId, gasType }) => {
            return gasType == 1063 ? (
              <Button
                type="link"
                icon={<FieldTimeOutlined />}
                onClick={async () => {
                  await form.validateFields(['vehicleId']);
                  setReminderModalState({
                    visible: { name: 'modal', type: 'ADD', payload: { vehicle: vehicleId } },
                  });
                }}
              >
                Add service reminder
              </Button>
            ) : (
              ''
            );
          }}
        </ProFormDependency>
        <Row gutter={10}>
          <Col span={12}>
            <ProFormSelect
              key={'vehicleid'}
              placeholder={'choose vehicle'}
              labelAlign="left"
              width={'lg'}
              label="Select Vehicle"
              name="vehicleId"
              debounceTime={500}
              disabled={data ? true : false}
              rules={[{ required: true }]}
              showSearch
              request={async (k: { keyWords: string }) => {
                const data = await VehicleServiceAPI(requestActions).pageVehicle({
                  criteria: { searchValue: k.keyWords },
                });
                setVehicle(data.items);
                return data.items.map((obj, index) => ({
                  value: obj?.id,
                  label: `${obj?.plateNumber}`,
                  key: index,
                }));
              }}
              fieldProps={{
                onChange: (e: string) => {
                  const odometer = vehicle
                    ?.filter((it) => it?.id == e && it.currentMeter?.type == "fuel")
                    .map((it) => it.currentMeter?.meterValue);
                  const gasType = vehicle?.filter((it) => it?.id == e).map((it) => it.fuelType?.id);
                  VehicleServiceAPI(requestActions).findMeterHistory({
                    vehicleId: e,
                    meterType: "fuel"
                  }).then(it => {
                    setOdometer(it.meterValue);
                  })
                  onVehicleChange(e);
                  loadLatFuelByVehicle(e);
                },
              }}
            />
            <ProFormSelect
              key={'drivername'}
              placeholder={'choose driver'}
              labelAlign="left"
              width={'lg'}
              label="Driver "
              name="driverId"
              rules={[{ required: true }]}
              showSearch={true}
              options={vehicleDriver.map((obj, index) => ({
                value: obj.driverId?.id,
                label: [obj.driverId?.firstName, obj.driverId?.lastName].join(' '),
                key: index,
                selected: true,
              }))}
            />
            <ProFormDatePicker
              key={'date'}
              width={'lg'}
              name={'refilledDate'}
              initialValue={moment()}
              label="Refille Date"
              required
            />
            <ProFormDependency
              dependencies={['gasType', 'location']}
              name={['gasType', 'location']}
            >
              {({ gasType, location }) => {
                return (
                  <ProFormSelect
                    key="placeRefiled"
                    labelAlign="left"
                    width={'lg'}
                    label="Gas Station"
                    // disabled={data?true:false}
                    name="gasStation"
                    initialValue={gasStaion[0]?.id}

                    options={gasStaion
                      .filter(
                        (it) =>
                          it.fuelType?.id == gasType &&
                          it.status == 'active' &&
                          it.location.id == location,
                      )
                      .map((it, index) => ({
                        value: it.id,
                        label: it.tankName,
                        key: index,
                        selected: true,
                      }))}
                    rules={[{ required: true }]}
                    showSearch={true}
                  />
                );
              }}
            </ProFormDependency>
          </Col>
          <Col span={12}>
            <ProFormDigit
              key="qty"
              name={'quantity'}
              min={1}
              label="Quantity(L)"
              placeholder="quantity"
              max={500}
              rules={[{ required: true }]}
            />

            <ProFormDependency dependencies={["gasType"]} name={["gasType"]}>
              {({ gasType }) => {
                return (
                  <ProFormDigit
                    key="odometer"
                    name={'kilometer'}
                    label="Odometer"
                    placeholder="current odometer"
                    rules={[
                      {
                        required: true,
                        min: gasType == 1063 ? 0 : odometer,
                        type: 'integer',
                      },
                    ]}
                  />
                )
              }}
            </ProFormDependency>

            <ProFormSelect
              name={'pumpBy'}
              label={'Pump Attendent'}
              showSearch
              request={async (kw) => {
                const data = await AddOnServiceAPI(requestActions).page({
                  criteria: { searchValue: kw.keyWord },
                });
                return data?.items
                  ?.filter((it) => it.referTo === 'fuel')
                  .map((it) => ({ value: it.name, label: it.name }));
              }}
              rules={[{ required: true }]}
              fieldProps={{
                dropdownRender: (menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <Space style={{ padding: '0 8px 4px' }}>
                      <ProForm
                        form={pumpbyForm}
                        submitter={{
                          render: () => (
                            <>
                              <Button
                                style={{
                                  position: 'absolute',
                                  bottom: 30,
                                  right: 5,
                                }}
                                type="link"
                                icon={<PlusOutlined />}
                                onClick={async () => {
                                  const dataForm = await pumpbyForm.validateFields();
                                  const entity = {
                                    ...dataForm,
                                    phone: '',
                                    address: '',
                                    lateLong: '',
                                    type: '',
                                    referTo: 'fuel',
                                  };
                                  const response = (await AddOnServiceAPI(requestActions).save(
                                    entity,
                                  )) as { data: string; message: string };
                                  pumpbyForm.resetFields();
                                  message.success(response.message);
                                }}
                              >
                                Add
                              </Button>
                            </>
                          ),
                        }}
                      >
                        <ProFormText name="name" rules={[{ required: true, max: 255 }]} />
                      </ProForm>
                    </Space>
                  </>
                ),
              }}
            />
            <ProFormText
              key="receptNumber"
              name={'receiptNumber'}
              label="Receipt Number"
              placeholder="reciept number (optional)"
              allowClear
              fieldProps={{
                onKeyUp: (e) => {
                  const newValue = ("0".repeat(6) + e.currentTarget?.value.toString()).slice(-6);
                  form.setFieldValue("receiptNumber", newValue)
                },

              }}
            />
          </Col>
          {/* <ProFormText hidden={true} name={'status'} initialValue={'Normal'} /> */}
          <ProFormText hidden={true} name={'numberKilometer'} />

          <ProFormDependency
            dependencies={['quantity', 'kilometer', 'vehicleId']}
            name={['quantity', 'kilometer', 'vehicleId']}
          >
            {({ quantity, kilometer, vehicleId }) => {
              const destination = kilometer - odometer;
              const currentRate = (quantity / destination) * 100;
              const previousRate = vehicle.find(it => it.id === vehicleId)?.normFuelConsumption?.usage;

              // previousRate && console.log(
              //   currentRate,
              //   previousRate,
              //   (currentRate-previousRate )
              // );
              form.setFieldValue("numberKilometer", destination);
              if (previousRate) {
                if (currentRate > previousRate) {
                  // setWaringElement({
                  //   status:"Over rate",
                  //   kilometer:destination
                  // })
                  // form.setFieldValue("status", "Over rate");


                  return (<Col span={24}>
                    <span style={{ color: 'red' }}>This truck consumes more fuel than the limit, this is just a warning</span>
                  </Col>)
                }
                else {
                  return ""
                }

              }

              return "No consumption rate setup yet!"


              // if (usageRate > normFuelConsumption[0]!?.usageRate) {
              //   form.setFieldValue('status', 'Over Rate');

              //   return (

              //   );
              // } else {
              //   return '';
              // }
            }}
          </ProFormDependency>

          <Col span={24}>
            <FileUploader
              service="FILE"
              title="Attachment file"
              onSetFiles={(files) => setUploadFileIds(files.map((it) => it.response))}
            />
          </Col>
        </Row>
      </ProForm>

      <ServiceReminderModalForm
        open={reminderModalState?.visible?.name === 'modal'}
        onSave={(data: ServiceReminderCreate) => {
          Modal.confirm({
            title: 'Save Service Reminder Record',
            content: ' are you sure?',
            onOk: async () => {
              const response = (await ReminderServiceAPI(requestActions).save(data)) as {
                data: string;
                message: string;
              };
              setReminderModalState((v) => ({ ...v, visible: undefined }));
            },
          });
        }}
        onCancel={() => setReminderModalState((v) => ({ ...v, visible: undefined }))}
        fromFuel={reminderModalState?.visible?.payload.vehicle}
      />
    </FormModalComp>
  );
};

export default FuelModalForm;
