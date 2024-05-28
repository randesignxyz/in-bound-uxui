import { simpleRequestActions } from '@/services/model';
import {
  ModalForm,
  ModalFormProps,
  ProFormDatePicker,
  ProFormDependency,
  ProFormRadio,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Col, Row } from 'antd';
import { useForm } from 'antd/es/form/Form';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { VehicleServiceAPI } from '../vehicle/service';
import { DriverDTO, VehicleDriverCreate, VehicleDriverDTO } from './data';
import { DriverServiceAPI } from './service';
import { VehicleListItem } from '../vehicle/data';
interface Props extends ModalFormProps {
  defualtData?: DriverDTO;
  onSave: (data: VehicleDriverCreate) => void;
  vehicleId?: VehicleListItem;
  vehicleDriver?: VehicleDriverDTO
}

export default ({ defualtData, vehicleId,vehicleDriver, onSave, ...props }: Props) => {
  const requestAction = simpleRequestActions();
  const [form] = useForm<VehicleDriverCreate>();
  const [vehicleData, setVehicleData] = useState<VehicleListItem[]>();
  const [driverData, setDriverData] = useState<DriverDTO[]>();

  useEffect(() => {
    props.open && initailForm();
    props.open && onVehicleData();
    props.open && onDriverData();
  }, [props.open]);

  const initailForm = () => {
    form.setFieldsValue({
      ...defualtData?.vehicleDriver || vehicleDriver,
      vehicleId: vehicleId?.id || defualtData?.vehicle?.id,
      driverId: defualtData?.id || vehicleId?.driver?.id,
    });
  };

  const onVehicleData = (keyWords?: string) => {
    VehicleServiceAPI(requestAction).pageVehicle({
      criteria: { searchValue: keyWords || defualtData?.vehicle?.id || vehicleId?.id },
    }).then(it => {
      setVehicleData(it.items);
    });
  }

  const onDriverData = (keyWords?: string) => {
    DriverServiceAPI(requestAction).page({
      criteria: { searchValue: keyWords, advanceSearch: keyWords ? undefined : { id: defualtData?.id || vehicleId?.driver?.id } },
    }).then(it => {
      setDriverData(it.items);
    });
  }

  return (
    <ModalForm
      {...props}
      title="Assign Operator to Vehicle"
      width={700}
      form={form}
      onFinish={async () => {
        const dataForm = await form.validateFields();

        const entry = {
          ...dataForm,
        };

        onSave(entry);
      }}
    >
      <Row gutter={6}>
        <Col span={24}>
          <ProFormSelect
            name="vehicleId"
            label="Vehicle"
            showSearch
            debounceTime={500}
            initialValue={vehicleId}
            key={`${vehicleId?.id || defualtData?.vehicle?.id}_job_id`}
            disabled={vehicleId ? true : false}
            rules={[{ required: true }]}
            options={vehicleData?.map(it => ({ label: it.plateNumber, value: it.id }))}
            fieldProps={{
              onSearch: (e) => {
                onVehicleData(e);
              }
            }}

          />
        </Col>
        <Col span={18}>
          <ProFormSelect
            name="driverId"
            label="Driver"
            rules={[{ required: true }]}
            showSearch
            debounceTime={500}
            disabled={defualtData ? true : false}
            options={driverData?.map(it => ({ label: [it.firstName, it.lastName].filter((it) => it).join(' '), value: it.id }))}
            fieldProps={{
              onSearch: (e) => {
                onDriverData(e);
              }
            }}

          />
        </Col>
        <Col span={6}>
          <ProFormSelect
            name={'status'}
            label="Status"
            initialValue={'active'}
            options={[
              {
                value: 'active',
                label: 'Active',
              },
              {
                value: 'inActive',
                label: 'Inactive',
              },
            ]}
          />
        </Col>
        <Col span={24}>
          <ProFormRadio.Group
            name={'driverType'}
            label="Driver Type"
            layout="horizontal"
            initialValue={'instead'}
            rules={[{ required: true }]}
            options={[
              {
                value: 'permanent',
                label: 'Permanent ',
              },
              {
                value: 'instead',
                label: 'Temporary',
              },
            ]}
          />
        </Col>
        <ProFormDependency dependencies={['driverType']} name={['driverType']}>
          {({ driverType }) => {
            return driverType != 'permanent' ? (
              <>
                <Col span={10}>
                  <ProFormDatePicker
                    name="startDate"
                    label="Start Date"
                    width={'lg'}
                    initialValue={moment()}
                    rules={[{ required: true }]}
                  />
                </Col>
                <Col span={10}>
                  <ProFormDatePicker
                    name="endDate"
                    label="End Date"
                    width={'lg'}
                    rules={[{ required: true }]}
                  />
                </Col>

                <Col span={24}>
                  <ProFormTextArea name={'reason'} label="Reason" />
                </Col>
              </>
            ) : (
              <span style={{ color: 'red' }}>
                (As Permanent Driver) ,the driver will be replace old driver of truck{' '}
              </span>
            );
          }}
        </ProFormDependency>
      </Row>
    </ModalForm>
  );
};
