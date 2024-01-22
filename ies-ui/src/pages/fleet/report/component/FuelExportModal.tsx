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
import { DieselMonthlyReportParams } from '../../fuel/data';
import { LookupDataServiceAPI } from '../../lookupData/service';

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
              // {
              //   label: 'WEEKLY',
              //   value: 'WEEKLY',
              // },
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
        {/* <Col span={24}>
          <ProFormSelect
            name={'vehicle'}
            label="Vehicle"
            showSearch
            request={async (k: { keyWords: string }) => {
              const response = await VehicleServiceAPI(requestActions).pageVehicle({
                criteria: { searchValue: k.keyWords },
              });
              return response.items.map((it) => ({ value: it.id, label: it.plateNumber }));
            }}
          />
        </Col> */}
        {/* <Col span={24}>
          <ProFormSelect
            name={'driver'}
            label="Driver"
            showSearch
            request={async (k: { keyWords: string }) => {
              const response = await DriverServiceAPI(requestActions).page({
                criteria: { searchValue: k.keyWords },
              });
              return response.items.map((it) => ({
                value: it.id,
                label: [it.firstName, it.lastName].filter((it) => it).join(' '),
              }));
            }}
          />
        </Col> */}
        <Col span={24}>

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
          {/* <ProFormRadio.Group
            name={'dateType'}
            initialValue={'DATE'}
            label="Select Date"
            options={[
              {
                label: 'Date',
                value: 'DATE',
              },
              {
                label: 'Date Rank',
                value: 'DATERANK',
              },
            ]}
          /> */}
          <ProFormDatePicker.Month width={'md'} label="Select Date" name={'date'} rules={[{ required: true }]} />
          {/* <ProFormDependency dependencies={['reportType']} name={['reportType']}>
            {({ reportType }) => {
              return (
                // reportType == "DIALY" && (<ProFormDependency dependencies={["dateType"]} name={["dateType"]}>
                //     {({ dateType }) => {
                //         return (
                //             dateType == "DATE" && <ProFormDatePicker width={"md"} label="Select Date" name={"date"} /> ||
                //             dateType == "DATERANK" && <ProFormDateRangePicker width={"md"} label="Select Date Rank" name={"dateRank"}/>
                //         )
                //     }}
                // </ProFormDependency>) ||
                <ProFormDependency dependencies={['dateType']} name={['dateType']}>
                  {({ dateType }) => {
                    return (
                      (dateType == 'DATE' && (
                        <ProFormDatePicker.Month width={'md'} label="Select Date" name={'date'} />
                      )) ||
                      (dateType == 'DATERANK' && (
                        <ProFormDateMonthRangePicker
                          width={'md'}
                          label="Select Date Rank"
                          name={'dateRank'}
                        />
                      ))
                    );
                  }}
                </ProFormDependency>
              );
            }}
          </ProFormDependency> */}
        </Col>
      </Row>
    </ModalForm>
  );
};
