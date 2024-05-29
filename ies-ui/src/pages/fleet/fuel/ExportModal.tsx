import { simpleRequestActions } from '@/services/model';
import {
  ModalForm,
  ModalFormProps,
  ProFormDatePicker,
  ProFormDependency,
  ProFormRadio,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Col, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { DieselMonthlyReportParams } from './data';
import { LookupDataServiceAPI } from '../lookupData/service';

interface Props extends ModalFormProps {
  onSubmitExport: (param: DieselMonthlyReportParams) => void;
}
export default ({ onSubmitExport, ...props }: Props) => {
  const [form] = useForm();
  const requestActions = simpleRequestActions();
  return (
    <ModalForm
      {...props}
      layout="horizontal"
      title="Exports Fuel"
      labelAlign="right"
      labelCol={{ md: 4 }}
      form={form}
      onFinish={async () => {
        const dataEntry = await form.validateFields();
        const entry = {
          ...dataEntry,
          truckCapacity:dataEntry.truckCapacity?.toString()
        }
        onSubmitExport(entry);
      }}
    >
      <Row>
        <Col span={24}>
          <ProFormRadio.Group
            name={'reportType'}
            radioType="button"
            label="Report Type"
            initialValue={'DAILY'}
            rules={[{ required: true }]}
            options={[
              {
                label: 'DAILY',
                value: 'DAILY',
              },
              {
                label: 'MONTHLY',
                value: 'MONTHLY',
              },
              {
                label: 'AVG Diesel Chart',
                value: 'AVGCHART',
              },
            ]}
          />
        </Col>
        <Col span={24}>
          <ProFormDependency dependencies={["reportType"]} name={["reportType"]}>
            {({ reportType }) => {
              return reportType === "AVGCHART" && (<ProFormSelect
                mode='multiple'
                name={"truckCapacity"}
                label={"Truck Capacity"}
                rules={[{required:true}]}
                request={async () => {
                  const data = await LookupDataServiceAPI(requestActions).lookupData({ type: "VEHICLE" });
                  return data.filter(it => it.code === "WEIGHT").map(it => ({ value: it.id, label: it.name }));
                }}
              />) ||
                reportType != "AVGCHART" && (
                  <ProFormSelect
                    name={"fuelType"}
                    label={"Fuel Type"}
                    rules={[{required:true}]}
                    request={async () => {
                      const data = await LookupDataServiceAPI(requestActions).lookupData({ type: "VEHICLE" });
                      return data.filter(it => it.code === "FUELTYPE").map(it => ({ value: it.id, label: it.name }));
                    }}
                  />
                )
            }}
          </ProFormDependency>
        </Col>
        <Col span={24}>
          <ProFormDatePicker.Month width={'md'} label="Select Date" name={'date'} rules={[{ required: true }]} />
        </Col>
      </Row>
    </ModalForm>
  );
};
