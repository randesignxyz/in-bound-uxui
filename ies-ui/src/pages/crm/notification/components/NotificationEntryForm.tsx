import { NotificationLess } from '@/services/crm/data';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { Button, Card, Col, Form, Row, Space, Spin } from 'antd';
import { useEffect } from 'react';
import { Model } from '../Model';

type Props = {
  type: 'new' | 'edit';
  id?: number;
};

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const NotificationEntryForm: React.FC<Props> = ({ type, id }) => {
  const { state, actions } = Model();
  const { data } = state;
  const [form] = Form.useForm<NotificationLess>();

  useEffect(() => {
    if (!id) return;
    actions.detail(id);
  }, [data, id]);

  useEffect(() => {
    actions.initData();
    initialFormData();
  }, [data?.detail]);

  const initialFormData = () => {
    if (!data?.detail) return;
    form.setFieldsValue({
      title: data.detail.title,
      body: data.detail?.body,
      type: data.detail.type,
      status: data.detail.status,
      createdDate: data.detail.createdDate,
      imageUrl: data.detail.imageUrl,
    });
  };

  const onSaveAndSendActionHandler = async () => {};

  const onSaveAndViewActionHandler = async () => {
    console.log(form.isFieldValidating('title'));
  };

  const onValuesChange = (changedValues: any, values: NotificationLess) => {};

  return (
    <Spin spinning={state.loading}>
      <Form.Provider>
        <ProForm
          autoFocusFirstInput
          layout="horizontal"
          {...layout}
          form={form}
          submitter={{
            render: () => {
              return (
                <Row align="middle" style={{ backgroundColor: '#FFFFFF', height: '50px' }}>
                  {type == 'new' && (
                    <>
                      <Col flex="700px">
                        <Space
                          direction="horizontal"
                          size={'middle'}
                          style={{ float: 'right' }}
                          wrap={true}
                        >
                          <Button
                            onClick={() => {
                              form.resetFields();
                            }}
                          >
                            Clear
                          </Button>
                          <Button
                            type="primary"
                            onClick={() => {
                              onSaveAndViewActionHandler();
                            }}
                          >
                            Save & View
                          </Button>
                          <Button
                            type="primary"
                            onClick={() => {
                              onSaveAndSendActionHandler();
                            }}
                          >
                            Save & Send
                          </Button>
                          &nbsp;
                        </Space>
                      </Col>
                      <Col></Col>
                    </>
                  )}
                </Row>
              );
            },
          }}
          onValuesChange={onValuesChange}
        >
          <Card size="small" title="General">
            <Row gutter={50}>
              <Col flex="800px">
                <ProFormText
                  help={<span />}
                  rules={[{ required: true }]}
                  label="Title"
                  name="title"
                />
                <ProFormTextArea
                  help={<span />}
                  rules={[{ required: true }]}
                  label="Message"
                  name="body"
                />
              </Col>
              {/* <Col flex="500px">
                <ProFormSelect
                  name="saleIds"
                  help={<span />}
                  rules={[{ required: true }]}
                  label="Sale Executive"
                  showSearch
                  
                  fieldProps={{
                    optionLabelProp: 'label',
                    popupMatchSelectWidth: 400,
                    filterOption: (input, option) =>
                      (option?.label?.toString() || '')
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0,
                  }}
                  options={initData?.seList?.map((it) => {
                    return { value: it.id, label: `${it.code} - ${it.name}` };
                  })}
                />
              </Col> */}
            </Row>
          </Card>
        </ProForm>
      </Form.Provider>
    </Spin>
  );
};

export default NotificationEntryForm;
