import { CustomerSaleInfo } from '@/services/sale/data';
import { Col, Form, Input, Row } from 'antd';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

interface Props {
  data?: CustomerSaleInfo;
}

export default ({ data }: Props) => {
  return (
    <div>
      <Row>
        <Col flex="500px">
          <Form {...layout}>
            <Form.Item label="Customer Group">
              <Input
                disabled={data == undefined}
                value={data ? data?.customerGroup?.name : 'Error: Sale info not found'}
              />
            </Form.Item>
            <Form.Item label="Price Group">
              <Input
                disabled={data == undefined}
                value={data ? data?.customerPriceGroup?.name : 'Error: Sale info not found'}
              />
            </Form.Item>
            <Form.Item label="VAT">
              <Input
                disabled={data == undefined}
                value={data ? data?.vat?.code || 'N/A' : 'Error: Sale info not found'}
              />
            </Form.Item>
          </Form>
        </Col>
        <Col flex="Auto" />
      </Row>
    </div>
  );
};
