import { simpleRequestActions } from '@/services/model';
import {
  ProDescriptions,
  ProForm,
  ProFormDependency,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';

import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { Col, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useCallback, useEffect } from 'react';
import { TankCreate, TankDTO } from './data';
import { FleetServiceAPI } from '../service';

interface Props extends FormModalProps {
  data?: TankDTO;
  onSave: (data: TankCreate) => void;
  actionType?: String;
  id?: string;
  type?: string | 'ADDNEW' | 'STOCKIN';
}

const FuelStockEntryForm: React.FC<Props> = ({ onSave, data, actionType, type, id, ...props }) => {
  const [form] = useForm<TankCreate>();
  const requestActions = simpleRequestActions();

  const lookupData = useCallback(async () => {
    const dataLookup = FleetServiceAPI(requestActions).lookupData({ type: 'FUEL' });
  }, []);

  useEffect(() => {
    props.open && initFormData();
    lookupData();
  }, [props.open]);

  const initFormData = () => {
    form.setFieldsValue({
    });
  };

  return (
    <FormModalComp
      title="Tank Infomation"
      {...props}
      width={'800px'}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        const entry = {
          id: data?.id,
          ...dataForm,
        };
        onSave(entry);
      }}
      onResetForm={() => {
        form.resetFields();
      }}
    >
      {type == 'ADDNEW' ? (
        <>
          <ProForm form={form} size={'middle'} submitter={false} onReset={() => form.resetFields()}>
            <Row gutter={10}>
              <Col span={12}>
                <ProFormText
                  name={'tankName'}
                  label="Tank Name"
                  rules={[{ required: true, max: 40 }]}
                />
                <ProFormSelect
                  name={'fuelType'}
                  label="Fuel Type"
                  rules={[{ required: true }]}
                  request={async () => {
                    const data = await FleetServiceAPI(requestActions).lookupData({
                      type: 'VEHICLE',
                    });
                    return data
                      .filter((it) => it.code == 'FUELTYPE')
                      .map((it) => ({ value: it.id, label: it.name }));
                  }}
                />
                <ProFormDigit
                  name={'tankCapacity'}
                  label="Tank Capacity"
                  rules={[{ required: true }]}
                />
                <ProFormDependency dependencies={['tankCapacity']} name={['tankCapacity']}>
                  {({ tankCapacity }) => {
                    return (
                      <ProFormDigit
                        name={'beginningInventory'}
                        label="Beginning Inventory"
                        initialValue={0}
                        rules={[
                          {
                            type: 'number',
                          },
                        ]}
                        hidden
                      />
                    );
                  }}
                </ProFormDependency>
              </Col>
              <Col span={12}>
                <ProFormDependency dependencies={['tankCapacity']} name={['tankCapacity']}>
                  {({ tankCapacity }) => {
                    return (
                      <ProFormDigit
                        name={'currentInventory'}
                        label="Initial Balance"
                        rules={[
                          {
                            type: 'number',
                          },
                        ]}
                      />
                    );
                  }}
                </ProFormDependency>
                <ProFormDependency dependencies={['tankCapacity']} name={['tankCapacity']}>
                  {({ tankCapacity }) => {
                    return (
                      <ProFormDigit
                        name={'tankUsages'}
                        rules={[
                          {
                            type: 'number',
                          },
                        ]}
                        hidden
                        initialValue={0}
                        label="Tank Usages"
                      />
                    );
                  }}
                </ProFormDependency>

                <ProFormSelect
                  name={'location'}
                  label="Location"
                  rules={[{ required: true }]}
                  request={async () => {
                    const data = await FleetServiceAPI(requestActions).lookupData({
                      type: 'FUEL',
                    });
                    return data
                      .filter((it) => it.code == 'GASSTATION')
                      .map((it) => ({ value: it.id, label: it.name }));
                  }}
                />
                <ProFormSelect
                  name={'status'}
                  label="Status"
                  rules={[{ required: true }]}
                  options={[
                    {
                      value: 'active',
                      label: 'Active',
                    },
                    {
                      value: 'inactive',
                      label: 'Inactive',
                    },
                  ]}
                />
              </Col>
            </Row>
            <ProFormTextArea name={'description'} label="Description" />
          </ProForm>

          <span>
            NOTE: The following fields display information that cannot be added or modified.
          </span>
        </>
      ) : (
        <>
          <ProForm submitter={false}>
            <ProDescriptions<TankDTO>
              dataSource={data}
              contentStyle={{ fontWeight: 'bold' }}
              columns={[
                {
                  title: 'Tank Capacity',
                  key: 1,
                  dataIndex: 'tankCapacity',
                  render:(_,r)=>r.tankCapacity?.toFixed(2)
                },
                {
                  title: 'Tank Usages',
                  key: 1,
                  dataIndex: 'tankUsages',
                },
                {
                  title: 'Current Inventory',
                  key: 1,
                  dataIndex: 'currentInventory',
                  render:(_,r)=>r.currentInventory?.toFixed(2)
                },
              ]}
            />
            <ProFormDigit name={'quantity'} label="Quantity" />
          </ProForm>
        </>
      )}
    </FormModalComp>
  );
};

export default FuelStockEntryForm;
