import { simpleRequestActions } from '@/services/model';
import {
  FooterToolbar,
  ProForm,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Card, Col, message, Modal, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { RetailerPath } from '..';
import { SalePaths } from '../..';
import BreadCrumbCom from '../components/BreadCrumbCom';

import { CustomerGroup } from './data';
import { GroupCustomerServiceAPI } from './service';

interface Props {
  type: 'new' | 'edit';
  id?: string;
}

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

export default ({ id, type }: Props) => {
  const requestActions = simpleRequestActions();
  const services = GroupCustomerServiceAPI(requestActions);
  const [form] = useForm<CustomerGroup>();
  const [disabledDefault, setDisabledDefault] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (id) {
        const customerGroup = await services.detailGroupCustomer(id);
        form.setFieldsValue({
          description: customerGroup.description,
          name: customerGroup.name,
          isDefault: customerGroup.isDefault,
        });
        setDisabledDefault(true);
      } else {
        try {
          await services.fetchDefaultCustomerGroup();
          setDisabledDefault(true);
        } catch (e) {
          setDisabledDefault(false);
        }
      }
    })();
  }, []);

  const routes = [
    {
      path: SalePaths.retailer,
      label: 'Retailer',
    },
    {
      path: `${RetailerPath.customergroup}/list`,
      label: 'Customer Group',
    },
    {
      path: '',
      label: type === 'new' ? 'Create' : 'Edit',
    },
  ];

  const onSaveActionHandler = async (isNew?: boolean) => {
    const dataForm = await form.validateFields();

    const entity = {
      ...dataForm,
      id: id,
    };

    console.log(entity);
    try {
      const title = `${id === undefined ? 'Create' : 'Update'} Customer Group.`;
      Modal.confirm({
        title: title,
        content: 'Are you sure:',
        onOk: async () => {
          try {
            const result = (await services.saveGroupCustomer(entity)) as {
              message: string;
              data: string;
            };
            message.info(result.message);
            if (isNew) {
              form.resetFields();
              history.push(`${RetailerPath.customergroup}/create`);
            } else history.push(`${RetailerPath.customergroup}/detail/${result.data}`);
          } catch (e: any) {
            message.error(e.message);
          }
        },
      });
    } catch (e: any) {
      message.error(e.message);
    }
  };

  return (
    <ProForm
      form={form}
      {...layout}
      layout="horizontal"
      submitter={{
        render: () => {
          return (
            <FooterToolbar>
              {type === 'new' && (
                <Button
                  onClick={() => {
                    history.push(`${RetailerPath.customergroup}/list`);
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
              {type === 'edit' && (
                <Button
                  onClick={() => {
                    history.push(`${RetailerPath.customergroup}/detail/${id}`);
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
      <BreadCrumbCom separator=">" routes={routes} />
      <Card
        title={
          'General Info'
          // <TitleCard
          // title="General Info"
          // tagLable={type === 'new' ? 'New' : 'Edit'}
          // color={type === 'new' ? 'blue' : 'warning'}
          // />
        }
        size="small"
        style={{ marginTop: 10, marginBottom: 20 }}
      >
        <Row gutter={50}>
          <Col span={12}>
            <ProFormText
              label="Group Name"
              name="name"
              rules={[{ message: 'Please select product item.' }]}
              required={true}
            />
            <ProFormTextArea label="Description" name="description" fieldProps={{ rows: 3 }} />
            {type === 'new' && (
              <ProFormSwitch name="isDefault" label="Set Default" disabled={disabledDefault} />
            )}
          </Col>
        </Row>
      </Card>
    </ProForm>
  );
};
