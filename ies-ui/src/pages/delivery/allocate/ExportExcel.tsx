import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProFormDateRangePicker, ProFormDateTimeRangePicker, ProFormSelect } from '@ant-design/pro-components';
import ProForm from '@ant-design/pro-form';
import { Card, Col, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
// import { TransferRequestServiceAPI } from './inventory-transfer-request/service';
import { simpleRequestActions } from '@/services/model';
import { AllocateServiceAPI } from './service';
import { LocationList } from './data';
import { Paging } from '@/services/API';

interface Props extends FormModalProps {
  // id: string;
  // transfer_id:string,
  loading: boolean
  onSave: (request_delivery_date: string,route: string,zone: string,province?: string,district?: string,commune?: string,customer?: string) => void;
}

export default ({ loading, onSave, ...props }: Props) => {
  const [form] = useForm<{ customer: string; ordered_date: any; request_delivery_date: string }>();
  const requestActions = simpleRequestActions();
  const services = AllocateServiceAPI(requestActions);
  const [customer, setCustomer] = useState('')
  const [route, setRoute] = useState("");
  const [zone, setZone] = useState("");
  const [province, setProvince] = useState<string | undefined>(undefined);
  const [districtOpt, setDistrictOpt] = useState<any[]>([]);
  const [communeOpt, setCommuneOpt] = useState<any[]>([]);
  const [district, setDistrict] = useState<string | undefined>(undefined);
  const [commune, setCommune] = useState<string | undefined>(undefined);
  const [zoneOptions, setZoneOptions] = useState<any[]>([]);
  useEffect(() => {
    if (props.open) {
      form.resetFields();
      setCustomer('')
      setRoute('')
      setZone('')
      setProvince('')
      setDistrict('')
      setCommune('')
    }
  }, [props.open]);

  return (
    <FormModalComp
      width="700px"
      {...props}
      confirmLoading={loading}
      onResetForm={() => form.resetFields()}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        onSave(dataForm.request_delivery_date,route,zone,province,district,commune,customer);
      }}
    >
      <Card>
        <ProForm form={form} submitter={false}>
          <Row gutter={6}>
            <Col span={24}>
              <ProFormDateRangePicker
                width='100%'
                name="request_delivery_date"
                label="Request Delivery Date"
                placeholder={['From Date', 'To Date']}
                fieldProps={{
                  format: 'YYYY-MM-DD',
                }}
              // rules={[{ required: true }]}
              />
            </Col>
          </Row>
          <Row gutter={6}>
            <Col span={12}>
              <ProFormSelect
                label="Route"
                name="route"
                mode="multiple"
                allowClear
                showSearch
                request={async () => {
                  const res = await services.list_route()
                  return res.map((c: any) => ({
                    value: c.district_id,
                    label: `${c.name}`,
                    id: c.id
                  }));
                }}
                fieldProps={{
                  onChange: async (values: any[], options: any[]) => {
                    const routeString = values.join(",");
                    setRoute(routeString)
                    const routeIds = options.map((opt) => opt.id);
                    const res = await services.list_zone(routeIds);
                    const zones = res.map((c: any) => ({
                      value: c.location_id,
                      label: c.name,
                    }));

                    setZoneOptions(zones);
                  },
                }}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                label="Zone"
                name="zone"
                mode="multiple"
                allowClear
                showSearch
                options={zoneOptions}
                fieldProps={{
                  onChange: (value: any) => {
                    const zoneString = value.join(',');
                    const finalValues = { ...value, zone: zoneString };
                    setZone(finalValues.zone)
                  },
                }}
              />
            </Col>
          </Row>
          
          <Row gutter={6}>
            <Col span={12}>
              <ProFormSelect
                label="Province"
                name="province"
                mode="multiple"
                allowClear
                showSearch
                request={async () => {
                  const res = await services.list_Location("PROVINCE")
                  return res.map((c: any) => ({
                    value: c.id,
                    label: `${c.name}`
                  }));
                }}
                fieldProps={{
                  onChange: async (values: string | undefined) => {
                    // values = [district_id, district_id]
                    // options = [{value,label,id}, ...]
                    setProvince(values)
                    const dis = await services.list_Location("DISTRICT", values);
                    const district = dis.map((c: any) => ({
                      value: c.id,
                      label: c.name,
                    }));
                    setDistrictOpt(district);
                  },
                }}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                label="District"
                name="district"
                mode="multiple"
                allowClear
                showSearch
                options={districtOpt}
                fieldProps={{
                  onChange: async (values: string | undefined) => {
                    setDistrict(values)
                    const com = await services.list_Location("COMMUNE", values);
                    const commune = com.map((c: any) => ({
                      value: c.id,
                      label: c.name,
                    }));
                    setCommuneOpt(commune)
                  },
                }}
              />
            </Col>
          </Row>
          <Row gutter={6}>
            <Col span={12}>
              <ProFormSelect
                label="Commune"
                name="commune"
                mode="multiple"
                allowClear
                showSearch
                options={communeOpt}
                fieldProps={{
                  onChange: async (values: string | undefined) => {
                    setCommune(values)
                  },
                }}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="customer"
                label="Customer"
                mode="multiple"
                request={async ({ keyWords }) => {
                  const res = await services.pageCustomer({
                    criteria: {
                      searchValue: keyWords,
                    },
                    pagination: {
                      current: 1,
                      pageSize: 20,
                    },
                  })

                  return res.items.map((c: any) => ({
                    value: c.code,
                    label: `${c.code} - ${c.name}`,
                  }));
                }}
                fieldProps={{
                  onChange: (value: any) => {
                    const customerString = value.join(',');
                    const finalValues = { ...value, customer: customerString };
                    setCustomer(finalValues.customer)
                  },
                }}
              />
            </Col>
          </Row>
          {/* <Row gutter={6}>
            <Col span={12}>
              <ProFormSelect
                options={[
                  {
                    value: 'PM/RM',
                    label: 'PM/RM',
                  },
                  {
                    value: 'FG',
                    label: 'FG',
                  },
                ]}
                name="request_type"
                label="Type"
              />
            </Col>
            <Col span={11}>
              <ProFormSelect
                options={type == 'request' ? request : type == 'transfer' ? transfer : []}
                name="state"
                label="Status"
                mode="multiple"
                fieldProps={{
                  onChange: (value: any) => {
                    const stateString = value.join(',');
                    const finalValues = { ...value, state: stateString };
                    setState(finalValues.state)
                  },
                }}
              />
            </Col>
          </Row> */}
          {/* <Row gutter={6}>
            <Col span={24}>
              <ProFormDateRangePicker
                width={'lg'}
                name="ordered_date"
                label="Ordered Date"
                placeholder={['From Date', 'To Date']}
                fieldProps={{
                  format: 'YYYY-MM-DD',
                }}
              />
            </Col>
          </Row> */}
        </ProForm>
      </Card>
    </FormModalComp >
  );
};
