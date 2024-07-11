import { simpleRequestActions } from '@/services/model';
import {
  ActionType,
  EditableFormInstance,
  EditableProTable,
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProForm,
  ProFormDatePicker,
  ProFormDependency,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useForm } from 'antd/es/form/Form';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Flex, message, Modal, Row, Spin } from 'antd';
import { PurChaseRequestAPIService } from './service';
import { ProductItemsServiceAPI } from '../../product/services';
import { CrmServiceAPI } from '@/services/crm/services';
import { uniqueId } from 'lodash';
import { DeleteOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { MPUPath } from '..';
import { formatter } from '@/pages/utils';
import { DistributorCreate, PurchaseRequestCreate, PurchaseRequestItemCreate } from './data';
interface Props {
  type?: string;
  id?: number;
}
interface Amount {
  grantAmount?: number;
  discountAmount?: number;
  totalAmount?: number
}

const MpuRequestEntryForm: React.FC<Props> = ({ type, id, ...props }) => {
  const requestActions = simpleRequestActions();
  const [form] = useForm<PurchaseRequestCreate>();
  const services = PurChaseRequestAPIService(requestActions);
  const editableFormRef = useRef<EditableFormInstance>();
  const [dataSourceItems, setDataSourceItems] = useState<PurchaseRequestItemCreate[]>();
  const [distributor, setDistributor] = useState<DistributorCreate>();
  const [saleperson, setSaleperson] = useState<{ assignedTo: string; assignedToCode?: string }>();
  const actionRef = useRef<ActionType>();
  const [amount, setAmount] = useState<Amount>({
    discountAmount: 0,
    grantAmount: 0,
    totalAmount: 0
  });
  const onTotalAmoun = async () => {
    const result = dataSourceItems
      ?.map((o) => ({
        totalAmoun: (o.pricing * o.quantity) || 0
      }))
      .reduce((p, c) => ({ totalAmoun: (p.totalAmoun + c.totalAmoun) || 0 }));
    result ? setAmount((t => ({
      ...t,
      totalAmount: result.totalAmoun,
      grantAmount: result.totalAmoun,
      discountAmount: 0
    }))
    ) : { totalAmount: 0, discountAmount: 0, grantAmount: 0 }
  }
  const loadData = async () => {
    await services.fetchData(id).then(o => {
      form.setFieldsValue({
        ...o,
        assignedTo: o.assignedTo,
      });
      setDistributor({
        id: o.distributorId,
        code: o.distributorCode,
        latitude: o.latitude,
        longitude: o.longitude,
        name: o.distributorName,
        phone: o.distributorPhone
      });
      setSaleperson({
        assignedTo: o.assignedTo,
        assignedToCode: o.assignedToCode
      })
      setDataSourceItems(o?.items.map((r, index) => ({
        ...r,
        total: (r.quantity * r.pricing),
        key: uniqueId().toString() + index
      })))
    });
  }
  useEffect(() => {
    id && loadData();
  }, []);
  useEffect(() => {
    dataSourceItems?.length && onTotalAmoun?.()
  }, [dataSourceItems]);
  return (
    <PageContainer
      title={"Purchase Order Form"}
      onBack={() => history.push("/sale/mpu/list")}
    >
      <Spin spinning={requestActions.request?.loading}>
        <ProForm
          layout='horizontal'
          labelCol={{md:8}}
          labelAlign='left'
          form={form}
          submitter={{
            render: () => {
              return (
                <FooterToolbar>
                  <Button onClick={() => history.push(`${MPUPath.rsmRequest}/list`)}>Cancel</Button>
                  {type === 'new' && <Button onClick={() => form.resetFields()}>Clear</Button>}
                  <Button type="primary"
                    disabled={dataSourceItems?.length?false:true}
                    onClick={async () => {
                      await form.validateFields();
                      await editableFormRef.current?.validateFields();
                      Modal.confirm({
                        title: "Save Data into Database",
                        content: "Are you sure ?",
                        onOk: async () => {
                          const entry = {
                            id: id,
                            ...saleperson,
                            items: dataSourceItems || [],
                            distributor: distributor,
                            ...amount
                          }
                          const response = await services.save(entry) as { data?: PurchaseRequestCreate, message?: string };
                          history.push(`/sale/mpu/detail/${response.data?.id}`)
                        }
                      });
                    }}
                  >
                    {type === 'new' ? 'Save' : 'Edit'}
                  </Button>
                </FooterToolbar>
              );
            },
          }}
        >
          <Flex vertical gap={12}>
            <Card
              size='small'
              title="General Infomation"
            >
              <Row gutter={24}>
                <Col span={10}>
                  <ProFormSelect
                    name={"assignedTo"}
                    label={"Saleperson"}
                    debounceTime={500}
                    rules={[
                      { required: true }
                    ]}
                    showSearch
                    onChange={(e: string) => {
                      const assigned = e.split(",");
                      setSaleperson({
                        assignedTo: assigned[1],
                        assignedToCode: assigned[0]
                      })
                    }}
                    request={async (k: { keyWords: string }) => {
                      const data = await services.salespersonList({
                        searchValue: k.keyWords
                      });
                      return data.filter(t => t.isRequester === true).map(p => ({ value: [p.salespersonCode, p.salespersonName].join(","), label: p.salespersonName }))
                    }}
                  />
                  <ProFormSelect
                    showSearch
                    debounceTime={500}
                    name={"distributorId"}
                    rules={[
                      { required: true }
                    ]}
                    onChange={async (s: number) => {
                      const y = await CrmServiceAPI(requestActions).findDetailCustomer({ id: s });
                      setDistributor({
                        code: y.code,
                        id: y.id,
                        name: y.name,
                        phone: y.contacts?.[0].phone1,
                        latitude: y?.addressList?.[0]?.latitude,
                        longitude: y?.addressList?.[0]?.longitude
                      });
                    }}
                    label={"Distributor"}
                    request={async (k: { keyWords: string }) => {
                      const data = await CrmServiceAPI(requestActions).findAllCustomer({
                        searchValue: k.keyWords
                      });
                      return data.items.map(p => ({ value: p.id, label: p.name }));
                    }}
                  />
                  <ProFormDatePicker
                    name={"purchaseDate"}
                    label="Purchase Order Date"
                    width={"md"}
                    rules={[{required:true}]}
                  />
                </Col>
                <Col span={14}>
                    <ProFormTextArea
                      placeholder={"remark"}
                      name={"remark"}
                    />
                </Col>
              </Row>
            </Card>
            <EditableProTable<PurchaseRequestItemCreate & { key: string } >
              headerTitle={"Items"}
              editableFormRef={editableFormRef}
              rowKey="key"
              size="small"
              actionRef={actionRef}
              onValuesChange={(e) => {
                setDataSourceItems(e);
              }}
              value={dataSourceItems}
              recordCreatorProps={{
                newRecordType: 'dataSource',
                record: (index) => ({ key: uniqueId().toString() + index } as any),
                creatorButtonText: "New Item",
              }}
              controlled
              editable={{
                type: 'multiple',
                editableKeys: dataSourceItems?.map((t) => t.key),
                onlyAddOneLineAlertMessage: "",
                actionRender: (row, config) => [
                  <Button
                    icon={<DeleteOutlined />}
                    type='link'
                    danger
                    onClick={() => {
                      config.onDelete?.(config.recordKey, row)
                    }}
                  />
                ]
              }}
              columns={[
                {
                  title: "Product Name",
                  dataIndex: "itemId",
                  width: 350,
                  fieldProps: (_, config) => {
                    return {
                      onChange:(e:number)=>{
                        if(dataSourceItems?.filter(o=>o.itemId ===e).length){
                          message.error("This Item was ready added!");
                          console.log(config.entity.itemId==undefined)
                          
                        }
                      },
                      showSearch: true,
                      debounceTime: 500,
                      allowClear:true,
                      ...config,
                    }
                  },
                  valueType: "select",
                  formItemProps: {
                    rules: [{
                      required: true
                    }],
                  },
                  request: async (k: { keywords: string }) => {
                    const data = await ProductItemsServiceAPI(requestActions).pageProducts({
                      criteria: {
                        searchValue: k.keywords
                      }
                    });
                    return data.items.map(p => ({
                      value: p.id,
                      label: p.name,
                      disabled: dataSourceItems?.some(ot => ot.itemId == p.id)
                    }));
                  }
                },
                {
                  title: 'Category',
                  dataIndex: 'stockCategoryId',
                  fieldProps: {
                    showSearch: true,
                    debounceTime: 500,
                  },
                  formItemProps: {
                    rules: [{
                      required: true,
                    }],
                  },
                  request: async () => {
                    const data = await services.stockCategory();
                    return data.map(p => ({ value: p.id, label: p.name }));
                  }
                },
                {
                  title: 'UOM',
                  dataIndex: 'uom',
                  initialValue: "CASE",
                  fieldProps: {
                    showSearch: true,
                    debounceTime: 500,
                  },
                  formItemProps: {
                    rules: [{
                      required: true,
                    }],
                  },
                  request: async () => {
                    const data = await services.uom();
                    return data.map(p => ({ value: p.name, label: p.name }));
                  }
                },
                {
                  title: 'Quantity',
                  dataIndex: 'quantity',
                  valueType: "digit",
                  initialValue: 1,
                  ellipsis: true,
                  fieldProps: {
                    allowClear: true,
                  },
                  formItemProps: {
                    rules: [
                      {
                        required: true,
                      },
                    ]
                  }
                },
                {
                  title: 'Unit Price ',
                  dataIndex: 'pricing',
                  valueType: "digit",
                  initialValue: 0,
                  ellipsis: true,
                  formItemProps: {
                    rules: [{
                      required: true,
                    },
                    ]
                  },
                },
                {
                  title: 'Total',
                  dataIndex: 'total',
                  valueType: "money",
                  initialValue: 0,
                  ellipsis: true,
                  readonly: true,
                  renderFormItem: (_, r) => {
                    const total = r.record ? r.record?.pricing * r.record?.quantity : 0;
                    r.value = total
                    return <>{formatter.format(total)}</>
                  },
                  formItemProps: {
                    rules: [{
                      required: true,
                    }]
                  },
                },
                {
                  width: 50,
                  valueType: "option"
                }
              ]}
            />
            <Card size='small'>
              <Flex
                justify='space-between'
              >
                <div></div>
                <ProDescriptions<Amount>
                  column={1}
                  editable={{
                    onSave: (_, record, originRow, __) => {
                      const total = (originRow.grantAmount as number - (originRow.grantAmount as number * (record.discountAmount || 0) / 100))
                      setAmount((c) => ({
                        ...c,
                        ...record,
                        discountAmount: record.discountAmount,
                        totalAmount: total,
                      }))
                      return Promise.resolve({
                        data: record,
                        sucess: true
                      })
                    },
                  }}
                  style={{
                    width: "300px",
                  }}
                  labelStyle={{
                    width: 150
                  }}
                  contentStyle={{
                    fontWeight: "bold"
                  }}
                  dataSource={amount}
                  columns={[
                    {
                      title: "Grand Amount",
                      dataIndex: "grandAmount",
                      valueType: "money",
                      editable: false,
                      render: (_, r) => r.grantAmount ? formatter.format(r.grantAmount) : "$0.00"
                    },
                    {
                      title: "Discount Amount",
                      dataIndex: "discountAmount",
                      valueType: "percent",
                    },
                    {
                      title: "Total Amount",
                      dataIndex: "totalAmount",
                      valueType: "money",
                      editable: false,
                      render: (_, r) => r.totalAmount ? formatter.format(r.totalAmount) : "$0.00"
                    },
                  ]}
                />
              </Flex>
            </Card>
          </Flex>
        </ProForm>
      </Spin>
    </PageContainer>
  );
};

export default MpuRequestEntryForm