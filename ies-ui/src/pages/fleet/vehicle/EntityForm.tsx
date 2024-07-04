import { FormModalProps } from '@/components/FormModal';
import { simpleRequestActions } from '@/services/model';
import { FooterToolbar, PageContainer, ProFormDependency, ProFormDigit } from '@ant-design/pro-components';
import ProForm, { ProFormDatePicker, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { history } from '@umijs/max';
import { Button, Card, Col, Flex, message, Modal, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { uniqueId } from 'lodash';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { FleetPaths } from '..';
import { SaveVehicle, VehicleListItem } from './data';
import { VehicleServiceAPI } from './service';
import { FleetServiceAPI } from '../service';
import { LookUpDataDTO } from '../data';

interface Props extends FormModalProps {
  type: 'new' | 'edit';
  id?: string;
  onEdit?: (id: string) => void;
  onDetail?: (id: string) => void;
}

export default ({ type, id }: Props) => {
  const [form] = useForm<SaveVehicle>();
  const formRef = useRef(null);
  const requestActions = simpleRequestActions();
  const [lookupDatas, setLookupData] = useState<LookUpDataDTO[]>([]);
  const services = VehicleServiceAPI(requestActions);
  const [vehicle, setVihicle] = useState<VehicleListItem>();
  const loadData = async () => {
    const rsn = await FleetServiceAPI(requestActions).lookupData({ type: 'VEHICLE' });
    setLookupData(rsn);
    if (id) {
      setVihicle(await services.fetchVehicle(id));
    }
  };

  const brands = lookupDatas
    .filter((obj) => obj.code == 'MAKE')
    .map((obj, index) => ({ value: obj.id, label: obj.name, key: uniqueId.toString() }));
  const colors = lookupDatas
    .filter((obj) => obj.code == 'COLOR')
    .map((obj, index) => ({ value: obj.id, label: obj.name, key: uniqueId.toString() }));
  const vehicleTypes = lookupDatas
    .filter((obj) => obj.code == 'VEHICLETYPE')
    .map((obj, index) => ({ value: obj.id, label: obj.name, key: uniqueId.toString() }));
  const statusPurchase = lookupDatas
    .filter((obj) => obj.code == 'STATUSPURCHASE')
    .map((obj, index) => ({ value: obj.id, label: obj.name, key: uniqueId.toString() }));
  const fuelTypes = lookupDatas
    .filter((obj) => obj.code == 'FUELTYPE')
    .map((obj, index) => ({ value: obj.id, label: obj.name, key: uniqueId.toString() }));
  const weight = lookupDatas
    .filter((obj) => obj.code == 'WEIGHT')
    .map((obj, index) => ({ value: obj.id, label: obj.name, key: uniqueId.toString() }));
  const statusId = lookupDatas
    .filter((obj) => obj.code == 'STATUS')
    .map((obj, index) => ({ value: `${obj.name}`, label: obj.name, key: uniqueId.toString() }));
  const brandingType = lookupDatas
    .filter((obj) => obj.code == 'GROUP' && obj.active != 0)
    .map((obj, index) => ({ value: obj.id, label: obj.name, key: uniqueId.toString() }));
  const ownership = lookupDatas
    .filter((obj) => obj.code == 'OWNERSHIP')
    .map((obj, index) => ({ value: obj.id, label: obj.name, key: uniqueId.toString() }));

  useEffect(() => {
    loadData();
  }, []);

  form.setFieldsValue({
    makeId: vehicle?.make?.id,
    colorId: vehicle?.color?.id,
    engine: vehicle?.engine,
    fuelTypeId: vehicle?.fuelType?.id,
    model: vehicle?.model,
    plateNumber: vehicle?.plateNumber,
    vehicleTypeId: vehicle?.vehicleType?.id || vehicleTypes.map((it) => it.value)[0],
    vin: vehicle?.vin,
    year: vehicle?.year.toString(),
    vehicleNote: vehicle?.vehicleNote,
    status: vehicle?.status || statusId.map((it) => it.value)[0],
    brandingType: vehicle?.brandingType?.id,
    weightId: vehicle?.weight.id,
    truckHead: vehicle?.vehicleCapacity?.truckHead,
    boxCBM: vehicle?.vehicleCapacity?.boxCBM,
    boxHigh: vehicle?.vehicleCapacity?.boxHigh,
    boxLength: vehicle?.vehicleCapacity?.boxLength,
    boxWidth: vehicle?.vehicleCapacity?.boxWidth,
    totalLength: vehicle?.vehicleCapacity?.totalLength,
  });

  const onSaveActionHandler = async (isNew?: boolean) => {
    const dataForm = await form.validateFields();
    const y = moment(dataForm.year.toString()).format('YYYY');
    dataForm.year = y;
    const entity: SaveVehicle = {
      ...dataForm,
      id: id,
      vehicleCapacityId: vehicle?.vehicleCapacity?.id,
    };
    try {
      const title = `${id === undefined ? 'Create' : 'Update'} Vehicle.`;
      Modal.confirm({
        title: title,
        content: 'Are you sure:',
        onOk: async () => {
          const result: { data: string; message: string } = (await services.save(entity)) as {
            data: string;
            message: string;
          };
          message.info(result.message);
          if (isNew) {
            form.resetFields();
            history.push(`${FleetPaths.vehicle}/create`);
          } else history.push(`${FleetPaths.vehicle}/detail/${result.data || id}`);
        },
      });
    } catch (e: any) {
      message.error(e.message);
    }
  };


  return (
    <>
      <PageContainer
        loading={requestActions.request?.loading}
        title={`${id ? 'Edit' : 'New'} Vehicle`}
        onBack={() => history.back()}
        subTitle={`${id ? vehicle?.plateNumber : ""}`}
        style={{
          margin: "-30px -40px 0",
        }}
        fixedHeader
      />
      <ProForm
        labelAlign="left"
        title="General info"
        form={form}
        formRef={formRef}
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
                      history.push('/fleet/vehicle/list');
                    }}
                  >
                    Cancel
                  </Button>
                )}
                {type === 'edit' && (
                  <Button
                    onClick={() => {
                      form.resetFields();
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
                  {type === 'new' ? 'Save & View' : 'Update'}
                </Button>
              </FooterToolbar>
            );
          },
        }}
      >
        <Flex vertical gap={18}>
          <Card size='small' title="Identification">
            <Row gutter={12}>
              <Col span={12}>
                <ProFormText
                  label="Plate Number"
                  key={'plateNumber'}
                  name={'plateNumber'}
                  rules={[{ required: true }]}
                />
              </Col>
              <Col span={12}>
                <ProFormText
                  key="vehicleRegisterNumber"
                  label="Vehicle Register Number"
                  name={'vehicleRegisterNumber'}
                />
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={6}>
                <ProFormSelect
                  label="Type"
                  key="vehicleTypeId"
                  name="vehicleTypeId"
                  showSearch={true}
                  options={vehicleTypes}
                  rules={[{ required: true }]}
                />
              </Col>
              <Col span={6}>
                <ProFormSelect
                  label="Fuel Type"
                  key="fueltype"
                  name="fuelTypeId"
                  showSearch={true}
                  options={fuelTypes}
                  rules={[{ required: true }]}
                />
              </Col>
              <Col span={6}>
                <ProFormSelect
                  label="Weight"
                  key="weightId"
                  name="weightId"
                  showSearch={true}
                  options={weight}
                  rules={[{ required: true }]}
                />

              </Col>
              <Col span={6}>
                <ProFormText label="V.I.N" key={'vin'} name={'vin'} />
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={4}>
                <ProFormDatePicker.Year
                  label="Years"
                  key="year"
                  width={"md"}
                  name="year"
                  rules={[{ required: true }]}
                  fieldProps={{
                    disabledDate: (current) => {
                      const currentYear = new Date().getFullYear();
                      return current.year() > currentYear;
                    },
                  }}
                />
              </Col>
              <Col span={4}>
                <ProFormSelect
                  label="Brand"
                  key="makeId"
                  name="makeId"
                  showSearch={true}
                  options={brands}
                  rules={[{ required: true }]}
                />
              </Col>
              <Col span={6}>
                <ProFormText label="Model" key="model" name="model" />
              </Col>
              <Col span={6}>
                <ProFormText label="Engine" key={'engine'} name={'engine'} />
              </Col>
              <Col span={4}>
                <ProFormSelect
                  showSearch={true}
                  label="Color"
                  key="colorId"
                  name="colorId"
                  options={colors}
                />
              </Col>
            </Row>
          </Card>
          <Card size="small" key={'Classification'} title="Classification">
            <Row gutter={12}>
              <Col span={6}>
                <ProFormSelect
                  label="Status"
                  key="stutus"
                  name="status"
                  options={statusId}
                  rules={[{ required: true }]}
                />
              </Col>
              <Col span={6}>
                <ProFormSelect
                  key={'brandingType'}
                  name={'brandingType'}
                  label="Branding Type"
                  options={brandingType}
                />
              </Col>
              {/* <Col span={6}>
                
                <ProFormCascader
                  name={'bu'}
                  label="Group"
                  
                  fieldProps={{
                    showSearch: true
                  }}
                  request={async (k) => {
                    const data = await FleetServiceAPI(requestActions).buList();
                    const items = data.filter(t => t.parentId == null).map((v) => ({
                      label: v.name, value: v.id,
                      children: data.filter(o => v.id == o.parentId).map((b => ({ label: b.name, value: b.id })))
                    }));
                    return items
                  }}
                />

              </Col> */}
              <Col span={6}>
                <ProFormSelect
                  key="ownership "
                  name="ownership"
                  options={ownership}
                  label="Ownership"
                />
              </Col>
            </Row>
          </Card>
          <Card key={'weight'} size="small" title="Vehicle Capacity">
            <Row gutter={4}>
              <Col span={4}>
                <ProFormDigit
                  key="truckHead"
                  name="truckHead"
                  max={20}
                  label="Head of Truck length(m)"
                />
              </Col>
              <Col span={4}>
                <ProFormDigit key={'boxLength'} name={'boxLength'} max={20} label="Box Length(m)" />
              </Col>
              <Col span={4}>
                <ProFormDigit key="boxHigh" name="boxHigh" max={20} label="Box High(m)" />
              </Col>
              <Col span={4}>
                <ProFormDigit key={'boxWidth'} name={'boxWidth'} max={20} label="Box Width(m)" />
              </Col>
              <Col span={4}>
                <ProFormDependency
                  dependencies={['boxHigh', 'boxWidth', 'boxLength']}
                  name={['boxHigh', 'boxWidth', 'boxLength']}
                >
                  {({ boxHigh, boxWidth, boxLength }) => {
                    form.setFieldValue('boxCBM', boxHigh * boxWidth * boxLength);
                    return (
                      <>
                        <ProFormDigit
                          key="boxCBM"
                          name="boxCBM"
                          label="Box CBM(m)"
                          fieldProps={{
                            value: (boxHigh * boxWidth * boxLength) | 0,
                          }}
                        />
                      </>
                    );
                  }}
                </ProFormDependency>
              </Col>
              <Col span={4}>
                <ProFormDependency
                  dependencies={['boxHigh', 'truckHead']}
                  name={['boxHigh', 'truckHead']}
                >
                  {({ boxHigh, truckHead }) => {
                    form.setFieldValue('totalLength', boxHigh + truckHead);
                    return (
                      <>
                        <ProFormDigit
                          key={'totalLength'}
                          name={'totalLength'}
                          label="Total length Of Truck(m)"
                          fieldProps={{
                            value: boxHigh + truckHead || 0,
                          }}
                        />
                      </>
                    );
                  }}
                </ProFormDependency>
              </Col>
            </Row>
          </Card>
        </Flex>
      </ProForm>
    </>
  );
};
