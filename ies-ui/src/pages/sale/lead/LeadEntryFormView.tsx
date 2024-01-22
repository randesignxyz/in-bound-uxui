import type { Locations } from '@/services/crm/data';
import { LookupData } from '@/services/data';
import { simpleRequestActions } from '@/services/model';
import type { LeadLess } from '@/services/sale/data';
import {
  FooterToolbar,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Card, Col, message, Modal, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { SalePaths } from '..';
import { LeadServiceAPI } from './services';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

interface Props {
  type: 'new' | 'edit';
  id?: number;
}

const width = 215;

interface InitData {
  regionList?: Locations[];
  locations?: {
    provinceList?: Locations[];
    districtList?: Locations[];
    communeList?: Locations[];
    villageList?: Locations[];
  };
  outletTypes?: LookupData[];
}

export default ({ id, type }: Props) => {
  const requestActions = simpleRequestActions();
  const services = LeadServiceAPI(requestActions);
  const [form] = useForm<LeadLess>();

  const [initData, setInitData] = useState<InitData>();
  const [remarkRequired, setRemarkRequired] = useState(false);

  useEffect(() => {
    (async () => {
      if (id) {
        const lead = await services.detailLead(id);
        if (lead) {
          // setLead(lead);

          const region = await services.location('DIVISION');
          const ids = [
            lead.region?.id ?? -1,
            lead.province?.id ?? -1,
            lead.commune?.id ?? -1,
            lead.district?.id ?? -1,
            lead.village?.id ?? -1,
          ];
          const locations = await services.locations(ids);
          const outletTypes = await services.outletTypes();
          setInitData({
            ...initData,
            regionList: region,
            locations: {
              provinceList: locations.filter((it) => it.type === 'PROVINCE'),
              districtList: locations.filter((it) => it.type === 'DISTRICT'),
              communeList: locations.filter((it) => it.type === 'COMMUNE'),
              villageList: locations.filter((it) => it.type === 'VILLAGE'),
            },
            outletTypes: outletTypes,
          });

          setRemarkRequired(
            form.getFieldValue('outletTypeId') ===
              initData?.outletTypes?.find((e) => e.name.toLowerCase() === 'others')?.id,
          );

          form.setFieldsValue({
            ...lead,
            villageId: lead.village?.id,
            communeId: lead.commune?.id,
            districtId: lead.district?.id,
            provinceId: lead.province?.id,
            regionId: lead.region?.id,
            outletTypeId: lead.outletType?.id,
            remark: lead.remark,
          });
        }
      }
    })();
  }, []);

  const onSaveActionHandler = async (isNew?: boolean) => {
    const dataForm = await form.validateFields();

    const entity: LeadLess = {
      ...dataForm,
      id: id,
    };

    try {
      const title = `${id === undefined ? 'Create' : 'Update'} Lead.`;
      Modal.confirm({
        title: title,
        content: 'Are you sure:',
        onOk: async () => {
          const result: { data: number; message: string } = (await services.save(entity)) as {
            data: number;
            message: string;
          };
          message.info(result.message);
          if (isNew) {
            form.resetFields();
            history.push(`${SalePaths.lead}/create`);
          } else history.push(`${SalePaths.lead}/detail/${result.data}`);
        },
      });
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const onValuesChangeHandler = async (changedValues: any, values: LeadLess) => {
    const { regionId, provinceId, districtId, communeId, outletTypeId } = changedValues;

    if (regionId && 'regionId' in changedValues) {
      const provinces = await services.location('PROVINCE', values.regionId);
      setInitData({
        ...initData,
        locations: {
          provinceList: provinces,
          districtList: [],
          communeList: [],
          villageList: [],
        },
      });
      form.setFieldsValue({
        provinceId: undefined,
        districtId: undefined,
        communeId: undefined,
        villageId: undefined,
      });
    }

    if (provinceId && 'provinceId' in changedValues) {
      const district = await services.location('DISTRICT', values.provinceId);
      setInitData({
        ...initData,
        locations: {
          ...initData?.locations,
          districtList: district,
          communeList: [],
          villageList: [],
        },
      });
      form.setFieldsValue({
        districtId: undefined,
        communeId: undefined,
        villageId: undefined,
      });
    }

    if (districtId && 'districtId' in changedValues) {
      const commune = await services.location('COMMUNE', values.districtId);
      setInitData({
        ...initData,
        locations: {
          ...initData?.locations,
          communeList: commune,
          villageList: [],
        },
      });
      form.setFieldsValue({
        communeId: undefined,
        villageId: undefined,
      });
    }

    if (communeId && 'communeId' in changedValues) {
      const village = await services.location('VILLAGE', values.communeId);
      setInitData({
        ...initData,
        locations: {
          ...initData?.locations,
          villageList: village,
        },
      });
      form.setFieldsValue({
        villageId: undefined,
      });
    }
    if (outletTypeId && 'outletTypeId' in changedValues) {
      console.log(values.outletTypeId);
      setRemarkRequired(
        values.outletTypeId ===
          initData?.outletTypes?.find((e) => e.name.toLowerCase() === 'others')?.id,
      );
    }
  };

  return (
    <ProForm
      form={form}
      {...layout}
      layout="horizontal"
      onValuesChange={onValuesChangeHandler}
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
                    history.push(`${SalePaths.lead}/detail/${id}`);
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
                {type === 'new' ? 'Save & View' : 'Edit'}
              </Button>
            </FooterToolbar>
          );
        },
      }}
    >
      <Card title={'Lead'} size="small" style={{ marginTop: 10, marginBottom: 20 }}>
        {/* <ProFormSelect
          label="Type"
          name="typeId"
          width="md"
          allowClear={false}
          help={<span />}
          rules={[{ required: true }]}
          options={UIBuilder.toOption(
            initData?.lookupDataList?.filter((it) => it.type === 'ADDRESS_TYPE'),
          )}
        /> */}
        <Row gutter={80}>
          <Col>
            <ProFormText
              width={width}
              help={<span />}
              label="Shop Name"
              name="internalName"
              rules={[{ required: true }]}
            />
            <ProFormText
              width={width}
              help={<span />}
              label="Phone Number"
              name="phone"
              rules={[{ required: true }]}
            />
            <ProFormText width={width} help={<span />} label="House No" name="houseNo" />
            <ProFormSelect
              label="Region"
              name="regionId"
              showSearch
              style={{ width: width }}
              options={initData?.regionList?.map((it) => ({
                label: it.name,
                value: it.id,
                key: it.id,
              }))}
            />
            <ProFormSelect
              label="Commune"
              name="communeId"
              showSearch
              style={{ width: width }}
              options={initData?.locations?.communeList?.map((it) => ({
                label: `${it.internalName} - ${it.name}`,
                value: it.id,
                key: it.id,
              }))}
            />

            <ProFormText
              help={<span />}
              width={width}
              name="latitude"
              // rules={[{ required: true }]}
              label="Latitude"
            />
          </Col>

          <Col>
            <ProFormText width={width} help={<span />} label="First Name" name="firstName" />
            <ProFormText width={width} help={<span />} label="Phone 1" name="phone1" />
            <ProFormText width={width} help={<span />} label="Street Name" name="streetName" />
            <ProFormSelect
              label="Province"
              name="provinceId"
              showSearch
              options={initData?.locations?.provinceList?.map((it) => ({
                label: `${it.internalName} - ${it.name}`,
                value: it.id,
                key: it.id,
              }))}
              style={{ width: width }}
            />

            <ProFormSelect
              label="Village"
              name="villageId"
              showSearch
              style={{ width: width }}
              options={initData?.locations?.villageList?.map((it) => ({
                label: `${it.internalName} - ${it.name}`,
                value: it.id,
                key: it.id,
              }))}
            />
            <ProFormText
              help={<span />}
              width={width}
              name="longitude"
              // rules={[{ required: true }]}
              label="Longitude"
            />
          </Col>
          <Col>
            <ProFormText width={width} help={<span />} label="Last Name" name="lastName" />
            <ProFormText width={width} help={<span />} label="Phone 2" name="phone2" />
            <ProFormText width={width} help={<span />} label="Street No" name="streetNo" />
            <ProFormSelect
              label="District"
              name="districtId"
              showSearch
              style={{ width: width }}
              options={initData?.locations?.districtList?.map((it) => ({
                label: `${it.internalName} - ${it.name}`,
                value: it.id,
                key: it.id,
              }))}
            />
            <ProFormSelect
              label="Outlet Type"
              name="outletTypeId"
              showSearch
              allowClear={false}
              style={{ width: width }}
              options={initData?.outletTypes?.map((it) => ({
                label: `${it.name}`,
                value: it.id,
                key: it.id,
              }))}
            />
            <ProFormTextArea
              width={width}
              help={<span />}
              label="remark"
              name="remark"
              required={remarkRequired}
            />
          </Col>
        </Row>
      </Card>
    </ProForm>
  );
};
