
import { FooterToolbar, ProForm, ProFormDateTimePicker, ProFormDigit, ProFormMoney, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Button, Card, Col, message, Modal, Row, Space, Spin } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import numeral from 'numeral';
import { useEffect } from 'react';
import { history } from "@umijs/max";
import { SalePaths } from '../..';
import { Model } from '../model';

type Props = {
  // id: number;
  // actionHandlers?: {
  //   onBack?: () => void;
  // };
  type: string;
};

const layout1 = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const SettlementEntiryForm: React.FC<Props> = ({ type }) => {
  const { state, actions } = Model();
  const [form] = useForm<{
    name: string;
    description: string;
    memberShip: string;
    vehicleId: string;
  }>();

  useEffect(() => {
    actions.initialData();
  }, []);

  const onValuesChange = (changedValues: any, values: any) => {
    const { memberShip } = values;
    if ('memberShip' in changedValues) {
    }
  };

  const onSaveActionHandler = async (isNew: boolean = false) => {
    try {
      const dataFrom = await form.validateFields();
      Modal.confirm({
        title: type === 'new' ? 'Save Settlement' : 'Update Settlement',
        content: 'Are you sure?',
        onOk: async () => {
          try {
            message.info('The pags is under construction.');
            // const item: SaveStockStore = {
            //   id: id,
            //   name: dataFrom.name,
            //   isActive: true,
            //   description: dataFrom.description,
            //   vehicleIds: [dataFrom.vehicleId],
            //   memberIds: state.data?.members?.map((it) => it.salespersonCode),
            // };
            // console.log(item);
            // const so = await actions.saveData(item);
            // if (isNew) {
            //   actions.clearMember();
            //   form.resetFields();
            // } else {
            //   if (so) history.push(`${SalePaths.store}/detail/${so?.data.id}`);
            // }
          } catch (error: any) {
            message.error(error.message);
          }
        },
      });
    } catch (error) {
      message.error('Invalied Data');
    }
  };
  return (
    <Spin spinning={state.loading}>
      <ProForm
        onValuesChange={onValuesChange}
        {...layout1}
        layout="horizontal"
        submitter={{
          render: () => {
            return (
              <FooterToolbar>
                {type === 'new' && (
                  <Button
                    onClick={() => {
                      history.push(`${SalePaths.settlement}/list`);
                    }}
                  >
                    Cancel
                  </Button>
                )}
                {type === 'new' && (
                  <Button
                    onClick={() => {
                      form.resetFields();
                    }}
                  >
                    Clear
                  </Button>
                )}
                {/* {type === 'edit' && (
                  <Button
                    onClick={() => {
                      history.push(`${SalePaths.settlement}/detail/${id}`);
                    }}
                  >
                    Cancel
                  </Button>
                )} 
                {type === 'edit' && (
                  <Button
                    onClick={() => {
                    }}
                  >
                    Reset
                  </Button>
                )}
                */}
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
        <Card title="Settlement" style={{ marginBottom: 10 }}>
          <Row gutter={50}>
            <Col flex="1">
              <ProFormSelect
                name="salesperson"
                label="Salesperson"
                rules={[{ required: true }]}
                showSearch
                options={state.initData?.salespersonList
                  ?.filter((it) => !it.isApprover && it.isRequester)
                  .map((item) => {
                    return {
                      value: item.salespersonCode,
                      label: <Space size={0}>{item.salespersonName}</Space>,
                    };
                  })}
                placeholder="Please Select member"
              />
              <ProFormText
                rules={[{ required: true }]}
                label="Cashier"
                name="cashierName"
                placeholder=""
              />
              <ProFormDateTimePicker
                initialValue={moment()}
                rules={[{ required: true }]}
                name="requestedDate"
                label="Requested Date"
                placeholder=""
              />

              <ProFormMoney
                rules={[{ required: true }]}
                initialValue={4000}
                min={3900}
                max={4200}
                name="exchangeRate"
                label="Exchange Rate"
                fieldProps={{
                  formatter: (value) => {
                    return numeral(value).format('0,0');
                  },
                }}
              />
              <ProFormMoney
                initialValue={397.5}
                name="soldAmount"
                label="System Amount USD"
                readonly
                locale="en-US"
              />
            </Col>
            <Col flex="1">
              <ProFormDateTimePicker
                initialValue={moment()}
                rules={[{ required: true }]}
                name="settlementDate"
                label="Settlement Date"
                placeholder=""
              />

              <ProFormMoney name="amount" label="Actual Amount (USD)" placeholder="" min={0} />
              <ProFormDigit
                fieldProps={{
                  formatter: (value) => {
                    return numeral(value).format('0,0');
                  },
                }}
                name="amountKH"
                label="Actual Amount (KHR)"
                placeholder=""
                min={0}
              />
              <ProFormMoney name="bankAmount" label="Bank Transfer Amount" placeholder="" min={0} />
              <ProFormTextArea label="Remark" name="remark" placeholder="" />
            </Col>
            <Col flex="Auto" />
          </Row>
        </Card>
      </ProForm>
    </Spin>
  );
};

export default SettlementEntiryForm;
