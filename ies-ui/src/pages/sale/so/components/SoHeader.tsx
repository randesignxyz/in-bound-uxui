import RemoteSelectBox from '@/components/RemoteSelectBox';
import { AddressInfo, SalePerson } from '@/services/crm/data';
import { CrmService } from '@/services/crm/services';
import { LookupDataItem } from '@/services/data';
import { CustomerLookup, SoDeliveryMethod, SoDetail } from '@/services/sale/data';
import {
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Card, Col, Form, Row } from 'antd';

interface Props {
  data: {
    so?: SoDetail;
    salePersonList?: SalePerson[];
    addressList?: AddressInfo[];
    deliveryMethodList?: SoDeliveryMethod[];
    requiredFields?: { deliveryDate?: boolean; shippingAddress?: boolean };
    //budgetCodes?: LookupDataItem[];
    isIndirectCustomer?: boolean;
    distributors?: LookupDataItem[];
  };
}

const SoHeader: React.FC<Props> = ({ data }) => {
  const { so, salePersonList, addressList, deliveryMethodList } = data;

  // function disabledDate(current: any) {
  //     return current && current < moment().endOf('day');
  // }

  return (
    <div>
      <Card size="small" title="General">
        <Row gutter={50}>
          <Col flex="500px">
            <Form.Item
              help={<span />}
              name="customerId"
              label="Customer"
              rules={[{ required: true }]}
            >
              <RemoteSelectBox<CustomerLookup, { searchValue: any }>
                width={'300px'}
                popupMatchSelectWidth={500}
                initData={so?.associatedTo.customer ? [{ ...so.associatedTo.customer }] : []}
                transforms={{
                  onCriteria: (value) => {
                    return { searchValue: value };
                  },

                  onOptionData: (item) => {
                    return {
                      value: item.id,
                      label: [item.code, item.name].filter((it) => it !== null).join('-'),
                    };
                  },
                }}
                service={CrmService('search-basic-customer')}
              />
            </Form.Item>

            <ProFormSelect
              help={<span />}
              label="Sale Person"
              name="salespersonId"
              rules={[{ required: true }]}
              allowClear={false}
              showSearch
              fieldProps={{
                filterOption: (input, option) =>
                  (option?.label?.toString() || '').toLowerCase().indexOf(input.toLowerCase()) >= 0,
              }}
              options={salePersonList?.map((item) => {
                return { value: item.id, label: [item.code, item.name].join('-') };
              })}
            />
          </Col>

          <Col flex="500px">
            {/* <ProFormSelect help={<span />} label='Budget Code' name='budgetCode'
                        rules={[{ required: true }]}
                        allowClear = {false}
                        showSearch
                        // fieldProps={{
                        //     filterOption: (input, option) => (option?.label?.toString() || '').toLowerCase().indexOf(input.toLowerCase()) >= 0,
                        // }}
                        options={data.budgetCodes?.map(item => {
                            return { value: item.code!!, label: item.name }
                        })}
                    /> */}
            <ProFormDatePicker
              help={<span />}
              rules={[{ required: true }]}
              width="md"
              label="Order Date"
              name="orderDate"
            />
            {data.isIndirectCustomer && (
              <ProFormSelect
                help={<span />}
                label="Distributor"
                name="distributorId"
                rules={[{ required: true }]}
                allowClear={false}
                showSearch
                fieldProps={{
                  filterOption: (input, option) =>
                    (option?.label?.toString() || '').toLowerCase().indexOf(input.toLowerCase()) >=
                    0,
                }}
                options={data.distributors?.map((item) => {
                  return { value: item.id, label: [item.code, item.name].join('-') };
                })}
              />
            )}
            <ProFormText help={<span />} label="Ref #" name="refNo" />
            <ProFormTextArea help={<span />} label="Remark" name="remarks" />
          </Col>
          <Col flex="Auto" />
        </Row>
      </Card>

      <Card style={{ marginTop: '10px' }} size="small" title="Shipping">
        <Row gutter={50}>
          <Col flex="500px">
            <ProFormSelect
              help={<span />}
              label="Delivery Method"
              name="deliveryMethodId"
              rules={[{ required: true }]}
              showSearch
              allowClear={false}
              fieldProps={{
                filterOption: (input, option) =>
                  (option?.label?.toString() || '').toLowerCase().indexOf(input.toLowerCase()) >= 0,
              }}
              options={deliveryMethodList?.map((item) => {
                return { value: item.id, label: item.name };
              })}
            />
            <ProFormDatePicker
              // fieldProps = {{
              //     disabledDate: disabledDate
              // }}
              rules={[{ required: true }]}
              allowClear
              width="md"
              label="Delivery Date"
              name="deliveryDate"
            />
            <ProFormSelect
              help={<span />}
              label="Ship To Code"
              name="shippingAddressId"
              rules={[{ required: true }]}
              showSearch
              allowClear={false}
              fieldProps={{
                defaultActiveFirstOption: true,
                popupMatchSelectWidth: 500,
                filterOption: (input, option) =>
                  (option?.label?.toString() || '').toLowerCase().indexOf(input.toLowerCase()) >= 0,
              }}
              options={addressList?.map((item) => {
                return { value: item.id, label: item.address };
              })}
            />
          </Col>
          <Col flex="500px">
            <ProFormTextArea
              readonly
              help={<span />}
              label="Ship to Address"
              disabled={true}
              name="address"
            />
          </Col>
          <Col flex="Auto" />
        </Row>
      </Card>
    </div>
  );
};

export default SoHeader;
