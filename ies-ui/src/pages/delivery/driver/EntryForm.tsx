import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { Company, Driver, SaveDriver, Truck } from '@/services/delivery/data';
import { ProFormCheckbox } from '@ant-design/pro-components';
import ProForm, {
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { useAccess } from '@umijs/max';
import { Card, Col, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';

interface Props extends FormModalProps {
  companyList: Company[];
  truckList: Truck[];
  data?: Driver;
  onSave: (data: SaveDriver) => void;
}

const TruckEntryModal: React.FC<Props> = ({ companyList, truckList, onSave, data, ...props }) => {
  const [form] = useForm<SaveDriver>();
  const access = useAccess();
  const [availableTrucks, setAvailableTrucks] = useState<Truck[]>([]);

  useEffect(() => {
    props.open && initFormData();
  }, [props.open]);

  const initFormData = () => {
    setAvailableTrucks(truckList.filter((it) => it.company.id === data?.company.id));

    form.setFieldsValue({
      firstName: data?.firstName,
      lastName: data?.lastName,
      idCard: data?.idCard,
      multiTicket: data?.multiTicket,
      companyId: data?.company?.id,
      truckIds: data?.trucks?.map((it) => it.id || 0),
      driverLicense: data?.driverLicense,
      driverLicenseType: data?.driverLicenseType,
      driverLicenseExpiredDate: data?.driverLicenseExpiredDate,
      description: data?.description,
      accountName: data?.accountName,
      deliveryTracking: data?.deliveryTracking == undefined ? true : data.deliveryTracking
    });
  };

  return (
    <FormModalComp
      title="Driver"
      width="900px"
      {...props}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        onSave?.(dataForm);
      }}
      onResetForm={() => {
        form.resetFields();
      }}
    >
      <Card>
        <ProForm
          form={form}
          submitter={false}
          onValuesChange={(changedValues) => {
            const { companyId } = changedValues;

            if ('companyId' in changedValues) {
              setAvailableTrucks(truckList.filter((it) => it.company.id === companyId));
              form.resetFields(['truckIds']);
            }
          }}
        >
          <Row gutter={20}>
            <Col flex={400}>
              <ProFormText
                rules={[{ required: true }]}
                name={'firstName'}
                label="First Name"
                help={<span />}
              />
              <ProFormText
                rules={[{ required: true }]}
                name={'lastName'}
                label="lastName"
                help={<span />}
              />
              <ProFormText
                rules={[{ required: true }]}
                name={'idCard'}
                label="ID Card"
                help={<span />}
              />

              <ProFormText
                // rules={[{ required: true }]}
                name={'accountName'}
                label="Account Name"
                help={<span />}
              />

              <ProFormSelect
                // rules={[{ required: true }]}
                name={'driverLicenseType'}
                label="Driver License Type"
                options={[
                  { label: 'C', value: 'C' },
                  { label: 'D', value: 'D' },
                  { label: 'E', value: 'E' },
                ]}
              />
              <ProFormText
                // rules={[{ required: true }]}
                name={'driverLicense'}
                label="Driver License"
                help={<span />}
              />
            </Col>
            <Col flex={400}>
              <ProFormDatePicker
                rules={[{ required: true }]}
                // name={'driverLicenseExpiredDate'}
                label="Driver License Expired Date"
                help={<span />}
              />
              <ProFormSelect
                rules={[{ required: true }]}
                options={companyList.map((it) => ({
                  label: it.name,
                  value: it.id || 0,
                }))}
                name={'companyId'}
                showSearch
                label="Company"
                help={<span />}
              />
              <ProFormSelect
                name={'truckIds'}
                label="Trucks"
                mode="multiple"
                options={availableTrucks.map((it) => ({
                  label: it.licensePlate,
                  value: it.id || 0,
                }))}
              />
              <ProFormCheckbox name={'multiTicket'} label="Issued Multi Ticket" disabled={!access.canAccessIssuedMultiTicket} />
              <ProFormCheckbox name={'deliveryTracking'} label="Delivery Tracking" />
              <ProFormTextArea name={'description'} label="Description" />
            </Col>
            <Col flex={'Auto'} />
          </Row>
        </ProForm>
      </Card>
    </FormModalComp>
  );
};

export default TruckEntryModal;