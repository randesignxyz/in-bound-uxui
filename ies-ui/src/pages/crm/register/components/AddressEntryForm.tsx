import { UIBuilder } from '@/components/UIBuilder';
import { Locations } from '@/services/crm/data';
import { LookupData } from '@/services/data';
import { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { Card, Form, Select, Space } from 'antd';

const width = 215;

export interface AddressEntryFormProps {
  addressReadonly?: boolean;
  enableVisitPlan?: boolean;
  defaultAddress?: boolean;
  isEdit?: boolean;
  initData?: {
    // lookupDataList?: LookupData[];
    provinceList?: Locations[];
  };
  locations?: {
    districtList?: Locations[];
    communeList?: Locations[];
    villageList?: Locations[];
  };
}

const AddressEntryForm: React.FC<AddressEntryFormProps> = ({
  addressReadonly,
  defaultAddress,
  isEdit,
  initData,
  locations,
}) => {
  return (
    <div>
      {!addressReadonly && (
        <Card style={{ marginBottom: 10 }} size="small">
          {/* {!defaultAddress && !isEdit && <ProFormSelect
            label="Type"
            name="typeId"
            width="md"
            allowClear={false}
            help={<span />}
            rules={[{ required: true }]}
            options={UIBuilder.toOption(
              initData?.lookupDataList?.filter((it) => it.type == 'ADDRESS_TYPE'),
            )}
          />} */}
          <ProFormText
            name="address"
            width="md"
            label="Address Name"
            help={<span />}
          // rules={[{ required: true }]}
          />
          <Form.Item label="Address(KH)">
            <Space>
              <ProFormText
                width={width}
                help={<span />}
                name="houseNoKh"
                // rules={[{ required: true, message: 'House No is required' }]}
                placeholder="House #"
              />
              <ProFormText
                width={width}
                help={<span />}
                name="streetNoKh"
                // rules={[{ required: true }]}
                placeholder="Street No"
              />
              <ProFormText
                width={width}
                help={<span />}
                name="streetNameKh"
                // rules={[{ required: true }]}
                placeholder="Street Name"
              />
            </Space>
          </Form.Item>
          <Form.Item required label="Address(Latin)">
            <Space size={2} direction="vertical">
              <Space>
                <ProFormText width={width} help={<span />} name="houseNo" placeholder="House #" />
                <ProFormText width={width} help={<span />} name="streetNo" placeholder="Street No" />
                <ProFormText width={width} help={<span />} name="streetName" placeholder="Street Name" />
              </Space>
              <Space>
                <Form.Item name="provinceId" help={<span />} rules={[{ required: true }]} hasFeedback={false}>
                  <Select placeholder="Province" showSearch
                    style={{ width: width }} options={initData?.provinceList?.map?.((it) => {
                      return { label: it.name, value: it.id };
                    })}
                  />
                </Form.Item>

                <Form.Item name="districtId" help={<span />} rules={[{ required: true }]}>
                  <Select
                    placeholder="District"
                    showSearch
                    style={{ width: width }}
                    optionLabelProp="label"
                    filterOption={(input, option) =>
                      (option?.label?.toString() || '')
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    options={locations?.districtList?.map((it) => {
                      return { value: it.id, label: it.name };
                    })}
                  />
                </Form.Item>
                <Form.Item name="communeId" help={<span />} rules={[{ required: true }]}>
                  <Select
                    showSearch
                    placeholder="Commune"
                    optionLabelProp="label"
                    style={{ width: width }}
                    filterOption={(input, option) =>
                      (option?.label?.toString() || '')
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    options={locations?.communeList?.map((it) => {
                      return { value: it.id, label: it.name };
                    })}
                  />
                </Form.Item>
              </Space>
              <Space>
                <Form.Item help={<span />} name="villageId">
                  <Select
                    optionLabelProp="label"
                    showSearch
                    allowClear
                    style={{ width: width }}
                    placeholder="Village"
                    filterOption={(input, option) =>
                      (option?.label?.toString() || '')
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    options={locations?.villageList?.map((it) => {
                      return { value: it.id, label: it.name };
                    })}
                  />
                </Form.Item>
              </Space>
            </Space>
          </Form.Item>
          <Form.Item help={<span />} required label="Lat/Long">
            <Space>
              <ProFormText
                help={<span />}
                width={width}
                name="latitude"
                rules={[{ required: true }]}
                placeholder="Latitude"
              />
              <ProFormText
                help={<span />}
                width={width}
                name="longitude"
                rules={[{ required: true }]}
                placeholder="Longitude"
              />
            </Space>
          </Form.Item>
          <ProFormText name="hotspot" width="md" label="Hotspot" />
          <ProFormText name="direction" width="md" label="Direction" />
        </Card>
      )}
    </div>
  );
};

export default AddressEntryForm;
