import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProFormDateRangePicker, ProFormDateTimeRangePicker, ProFormSelect } from '@ant-design/pro-components';
import ProForm, { ProFormRadio } from '@ant-design/pro-form';
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
  initValues?: any
  onSave: (customer: string, ordered_date: any, request_delivery_date: string,province:any,reportType:string) => void;
}

export default ({ loading, onSave, ...props }: Props) => {
  const [form] = useForm<{ customer: string; ordered_date: any; request_delivery_date: string, type: string,province:any,reportType:string }>();
  const requestActions = simpleRequestActions();
  const services = AllocateServiceAPI(requestActions);
  const [customer, setCustomer] = useState('')
  const [selectedReportType, setSelectedReportType] = useState('dop_listing');
  const [route, setRoute] = useState("");
  const [zone, setZone] = useState<string[]>([]);
  const [type, seType] = useState("");
  const [districtOpt, setDistrictOpt] = useState<any[]>([]);
  const [communeOpt, setCommuneOpt] = useState<any[]>([]);
  const [district, setDistrict] = useState<string | undefined>(undefined);
  const [commune, setCommune] = useState<string | undefined>(undefined);
  const [zoneOptions, setZoneOptions] = useState<any[]>([]);

  // useEffect(() => {
    // if (props.open) {
      // form.resetFields();
      // setCustomer('')
      // setRoute('')
      // setZone('')
      // setProvince('')
      // setDistrict('')
      // setCommune('')
    // }
  // }, [props.open]);

  // useEffect(() => {
  //   if (props.open && props.initValues) {

  //     form.setFieldsValue({
  //       type: props.initValues.sap_delivery_date ?? 'as_of_now',

  //       request_delivery_date:
  //         props.initValues.sap_from_date && props.initValues.sap_to_date
  //           ? [props.initValues.sap_from_date, props.initValues.sap_to_date]
  //           : undefined,

  //       province: props.initValues.province_id,
  //       district: props.initValues.district_id,
  //       commune: props.initValues.commune_id,
  //       route: props.initValues.route,
  //       zone: props.initValues.zone,
  //       customer: props.initValues.customer,
  //     });

  //     setRoute(props.initValues.route?.join(',') ?? '');
  //     setZone(props.initValues.zone ?? []);
  //     setCustomer(props.initValues.customer?.join(',') ?? '');
  //     seType(props.initValues.sap_delivery_date ?? 'as_of_now');
  //     setProvince(props.initValues.province_id);
  //     setDistrict(props.initValues.district_id);
  //     setCommune(props.initValues.commune_id);

  //     // 🔥 ADD THIS BLOCK
  //     if (props.initValues.route?.length) {
  //       (async () => {
  //         const res = await services.list_zone(props.initValues.route);
  //         const zones = res.map((c: any) => ({
  //           value: c.location_id,
  //           label: c.name,
  //         }));
  //         setZoneOptions(zones);
  //       })();
  //     }
  //     if (props.initValues.province_id?.length) {
  //       (async () => {
  //         const dis = await services.list_Location("DISTRICT", props.initValues.province_id);
  //         setDistrictOpt(dis.map((c: any) => ({
  //           value: c.id, label: c.name
  //         })));
  //       })();
  //     }
  //     if (props.initValues.district_id?.length) {
  //       (async () => {
  //         const com = await services.list_Location("COMMUNE", props.initValues.district_id);

  //         const options = com.map((c: any) => ({
  //           value: c.id,
  //           label: c.name
  //         }));

  //         setCommuneOpt(options);

  //         // ⭐ rebind value after options exist
  //         form.setFieldsValue({
  //           commune: props.initValues.commune_id
  //         });
  //       })();
  //     }

  //     // 🔥 END
  //   }
  // }, [props.open]);
  useEffect(() => {
    if (props.open) {
      form.resetFields();
      setCustomer('')
    }
  }, [props.open]);



  return (
    <FormModalComp
      width="550px"
      {...props}
      confirmLoading={loading}
      onResetForm={() => form.resetFields()}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        console.log(dataForm)
        onSave(customer, dataForm.ordered_date, dataForm.request_delivery_date,dataForm.province,dataForm.reportType);
      }}
    >
      <Card>
        <ProForm form={form} submitter={false}>
          {/* <Row gutter={6} hidden>
            <Col span={12}>
              <ProFormSelect
                name="type"
                label="Type"
                initialValue="as_of_now"

                onChange={(val: string) => {
                  seType(val)
                }}
                options={[
                  { value: 'all', label: 'ALL' },
                  { value: 'as_of_now', label: 'As Date' },
                  // { value: 'today', label: 'Today' },
                  { value: 'unplan', label: 'DOP Pending' },
                  { value: 'TBA', label: 'TBA' },
                  { value: 'walk-in', label: 'Self Pickup' },
                  { value: 'hold', label: 'On Hold' },
                ]}
                // width={150}
                showSearch
              />
            </Col>
            <Col span={12}>
              <ProFormDateRangePicker
                disabled={type == 'unplan'}
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
          <Row gutter={6} hidden>
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
                    value: c.id,
                    label: c.name,
                    district_id: c.district_id
                  }));
                }}
                fieldProps={{
                  onChange: async (values: any[], options: any[]) => {
                    const routeString = values.join(",");
                    setRoute(routeString)

                    const routeIds = values;  // already ids

                    const districtIds = options.map(o => o.district_id);
                    setDistrict(districtIds);

                    const res = await services.list_zone(routeIds);
                    setZoneOptions(
                      res.map((c: any) => ({
                        value: c.location_id,
                        label: c.name
                      }))
                    );
                  }
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
                  onChange: (value: string[]) => {
                    const zoneString = value.join(',');
                    const finalValues = { ...value, zone: zoneString };
                    setZone(value)
                    console.log(value)
                  },
                }}
              />
            </Col>
          </Row>

          <Row gutter={6} hidden>
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
                  value:
                    form.getFieldValue('route')?.length
                      ? []                 // ⭐ hide tags
                      : district,
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
          <Row gutter={6} hidden>
            <Col span={12}>
              <ProFormSelect
                label="Commune"
                name="commune"
                mode="multiple"
                allowClear
                showSearch
                options={communeOpt}
                fieldProps={{
                  value:
                    form.getFieldValue('zone')?.length
                      ? []                 // ⭐ hide tags
                      : commune,
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
          </Row> */}
          <ProFormRadio.Group
            label="Report Type"
            name="reportType"
            rules={[{ required: true }]}
            initialValue={selectedReportType}
            options={[
              { value: 'dop_listing', label: 'DOP Listing' },
              { value: 'normal', label: 'Outstanding' },
            ]}
            fieldProps={{
              onChange: (e) => {
                const value = e.target.value;
                setSelectedReportType(value);
                console.log("Selected:", value);
              },
            }}
          />
          {selectedReportType == 'normal' && (
            <>
              <Row gutter={6}>
                <Col span={24}>
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
              <Row gutter={6}>
                <Col span={24}>
                  <ProFormDateRangePicker
                    width={'lg'}
                    name="ordered_date"
                    label="Ordered Date"
                    placeholder={['From Date', 'To Date']}
                    fieldProps={{
                      format: 'YYYY-MM-DD',
                    }}
                    rules={[{ required: true }]}
                  />
                </Col>
              </Row>
              <Row gutter={6}>
                <Col span={24}>
                  <ProFormDateRangePicker
                    width={'lg'}
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
            </>)}
          {selectedReportType == 'dop_listing' && (
            <>
              <Row gutter={6}>
                <Col span={24}>
                  <ProFormDateRangePicker
                    width={'lg'}
                    name="request_delivery_date"
                    label="Request Delivery Date (DOD)"
                    placeholder={['From Date', 'To Date']}
                    fieldProps={{
                      format: 'YYYY-MM-DD',
                    }}
                  rules={[{ required: true }]}
                  />
                </Col>
              </Row>
              <Row gutter={6}>
                <Col span={24}>
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
              <Row gutter={12} >
                <Col span={24}>
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
                  />
                </Col>

              </Row>
            </>)}
        </ProForm>
      </Card>
    </FormModalComp >
  );
};
