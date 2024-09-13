import { CrmPaths } from '@/pages/crm';
import { AddresssView, BasicData, PurchaseEstData } from '@/services/crm/data';
import { FooterToolbar } from '@ant-design/pro-components';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { Button, Card, Col, message, Modal, Row, Spin } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { head, uniq } from 'lodash';
import { useEffect, useState } from 'react';
import { history } from "@umijs/max";
import { model } from '../../model';
import AddressListView from '../address/AddressListView';
import BasicEntryForm from '../basic/BasicEntryForm';
import ForcastingEntryForm from '../forcasting/ForcastingEntryForm';

const layout = {
  labelCol: { span: 11 },
  wrapperCol: { span: 13 },
};

interface Props {
  actionHandlers?: {
    onBack?: () => void;
  };
}

interface FormData extends BasicData {
  forcasting: PurchaseEstData[];
  supplySourceId?: number;
  regionId: number;
  internalOwnerName: string;
  ownerName?: string;
  phone1: string;
  phone2?: string;
  phone3?: string;
  email?: string;
}

const CreateCustomer: React.FC<Props> = () => {
  const { state, ops, actions } = model();

  const [addressList, setAddressList] = useState<AddresssView[]>([]);
  const [layoutConfig, setLayoutConfig] = useState<{ sourceOfSupply?: boolean }>();

  const [form] = useForm<FormData>();
  useEffect(() => {
    ops.initData('Create');
    initFormValue();
  }, []);

  useEffect(() => {
    if (!state.initData?.currentSalesperson) return;
    state.initData.seList?.find((it) => it.id == state.initData?.currentSalesperson?.id) &&
      form.setFieldsValue({
        saleId: state.initData?.currentSalesperson.id,
      });
  }, [state.initData?.currentSalesperson]);

  useEffect(() => {
    if ((state.initData?.regionList || []).length == 0) {
      form.resetFields(['regionId']);
    } else {
      form.setFieldsValue({
        regionId: head(state.initData?.regionList)?.id,
      });
    }
  }, [state.initData?.regionList]);

  const initFormValue = () => {
    form.setFieldsValue({
      typeId: 102,
      forcasting: [{}],
    });
  };

  const onSaveAddressHandler = (
    data: AddresssView,
    isNew: boolean = true,
    cb?: (sucess: boolean) => void,
  ) => {
    if (isNew) {
      setAddressList((v) => {
        const list = [...v, data];
        updateAddressRelatedData(list);
        return list;
      });
    } else {
      setAddressList((v) => {
        const list = v.map((it) => {
          if (it.key == data.key) {
            return { ...it, ...data };
          } else {
            return it;
          }
        });
        updateAddressRelatedData(list);
        return list;
      });
    }

    cb?.(true);
  };

  const updateAddressRelatedData = (list: AddresssView[]) => {
    actions.findRegionsAndSupplySource(uniq(list.map((it) => it.province?.id || 0)));
    const typeId = form.getFieldValue('typeId');
    sourceOfSupplyCheck(typeId, list);
  };

  const onRemoveAddress = (data: AddresssView) => {
    setAddressList((v) => {
      const list = v.filter((it) => it.key !== data.key);
      updateAddressRelatedData(list);
      return list;
    });
  };

  const onValuesChangeHandler = (changedValues: any, values: BasicData) => {
    const { outletTypeId, typeId } = changedValues;
    if (outletTypeId || 'outletTypeId' in changedValues) {
      const outlet = state?.initData?.outletTypeList?.find((it) => it.id == outletTypeId);
      form.setFieldsValue({
        mainChannel: outlet?.mainChannel,
        subChannel: outlet?.subChannel,
      });
    }

    if ('typeId' in changedValues) {
      sourceOfSupplyCheck(typeId, addressList);
    }
  };

  const sourceOfSupplyCheck = (typeId?: number, list?: AddresssView[]) => {
    setLayoutConfig((v) => ({
      ...v,
      sourceOfSupply: 102 == typeId && !!list?.find((it) => it.province?.id !== 12),
    }));
  };

  const saveActionHandlers = async (clear?: boolean) => {
    try {
      const formData = await form.validateFields();
      Modal.confirm({
        title: 'New Customer',
        content: 'Are you sure?',
        onOk: async () => {
          try {
            const rs = await ops.create({
              basicInfo: {
                internalName: formData.internalName,
                name: formData.name,
                typeId: formData.typeId,
                outletTypeId: formData.outletTypeId,
                supplySourceId: formData.supplySourceId,
                // regionId: formData.regionId,
                // mainChannel: formData.mainChannel,
                // subChannel:  form.s,

                saleId: formData.saleId,
                description: formData.description,
              },
              addressList: addressList.map((it) => {
                return {
                  typeId: it.type?.id,
                  address: it.address,
                  houseNo: it.houseNo,
                  streetNo: it.streetNo,
                  streetName: it.streetName,
                  villageId: it.village?.id,
                  communeId: it.commune?.id || 0,
                  districtId: it.district?.id || 0,
                  provinceId: it.province?.id || 0,
                  latitude: it.latitude,
                  longitude: it.longitude,
                  direction: it.direction,
                  hotspot: it.hotspot,
                  visitPlanOptionIds: it.visitPlanOptionList,
                };
              }),
              contact: {
                internalName: formData.internalOwnerName,
                name: formData.ownerName,
                phone1: formData.phone1,
                phone2: formData.phone2,
                phone3: formData.phone3,
                email: formData.email,
              },
              purchaseEstList: [],
            });
            clear && form.resetFields();
            !clear && history.push(`${CrmPaths.customer}/detail/${rs.id}`);
          } catch (error: any) {
            message.error(error.message || 'Failed to create customer.');
          }
        },
      });
    } catch (error) {
      message.error('Invalid data.');
    }
  };

  return (
    <Spin spinning={state.loading}>
      <ProForm
        layout="horizontal"
        {...layout}
        form={form}
        submitter={{
          render: (props) => {
            return (
              <FooterToolbar>
                <Button
                  onClick={() => {
                    props.reset();
                    setAddressList([]);
                    initFormValue();
                  }}
                >
                  Clear
                </Button>
                <Button type="primary" onClick={() => saveActionHandlers(true)}>
                  Save & Clear
                </Button>
                <Button type="primary" onClick={() => saveActionHandlers()}>
                  Save & View
                </Button>
              </FooterToolbar>
            );
          },
        }}
      >
        <Card title="Basic Info" size="small">
          <BasicEntryForm
            layoutConfig={{
              supplySource: false,
            }}
            outletTypeList={state.initData?.outletTypeList}
            seList={state.initData?.seList}
            lookupDataList={state.initData?.lookupDataList}
            supplySourceList={state.initData?.supplySources}
          />
        </Card>
        <Card title="Default Contact" size="small" style={{ marginTop: 10 }}>
          <Row gutter={50}>
            <Col flex="400px">
              <ProFormText
                help={<span />}
                rules={[{ required: true }]}
                label="Owner name (KH)"
                name="internalOwnerName"
              />
              <ProFormText label="Owner name (Latin)" name="ownerName" />
              <ProFormText
                help={<span />}
                rules={[{ required: true }]}
                label="Phone 1"
                name="phone1"
              />
            </Col>
            <Col flex="400px">
              <ProFormText label="Phone 2" name="phone2" />
              <ProFormText label="Phone 3" name="phone3" />
              <ProFormText label="Email" name="Email" />
            </Col>
            <Col flex="Auto" />
          </Row>
        </Card>
      </ProForm>

      <Card title="Average Purchase" size="small" style={{ marginTop: 10 }}>
        <ProForm submitter={false} form={form}>
          <ForcastingEntryForm itemList={state.initData?.itemList} />
        </ProForm>
      </Card>

      <Card size="small" style={{ marginTop: 10 }} title="Address">
        <AddressListView
          data={{
            list: state.draftData?.addressList || addressList,
            init: {
              lookupDataList: state.initData?.lookupDataList,
              provinceList: state.initData?.provinceList,
            },
            locations: {
              communeList: state.data?.locations?.communeList,
              districtList: state.data?.locations?.districtList,
              villageList: state.data?.locations?.villageList,
            },
          }}
          actionHandlers={{
            onAdd: (data, cb) => onSaveAddressHandler(data, true, cb),
            onEdit: (data, cb) => onSaveAddressHandler(data, false, cb),
            onRemove: onRemoveAddress,
            onLoadLocations: ops.loadLocations,
            onLoadMultiLocations: ops.loadMultiLocations,
            onCleaLocation: actions.clearLocations,
          }}
        />
      </Card>

      <Card size="small" title="Others" style={{ marginTop: 10, marginBottom: 20 }}>
        <ProForm
          form={form}
          layout="horizontal"
          {...layout}
          submitter={false}
          onValuesChange={onValuesChangeHandler}
        >
          <Row gutter={50}>
            <Col flex="400px">
              <ProFormSelect
                label="Region"
                name="regionId"
                help={<span />}
                rules={[{ required: true }]}
                showSearch
                allowClear={false}
                fieldProps={{
                  optionLabelProp: 'label',
                  filterOption: (input, option) =>
                    (option?.label?.toString() || '').toLowerCase().indexOf(input.toLowerCase()) >=
                    0,
                }}
                options={state.initData?.regionList?.map((it) => {
                  return { value: it.id, label: it.name };
                })}
              />
            </Col>
            <Col flex="400px">
              {layoutConfig?.sourceOfSupply && (
                <ProFormSelect
                  label="Source of Supply"
                  name="supplySourceId"
                  rules={[{ required: true }]}
                  showSearch
                  allowClear={false}
                  help={<span />}
                  fieldProps={{
                    popupMatchSelectWidth: 400,
                    optionLabelProp: 'label',
                    filterOption: (input, option) =>
                      (option?.label?.toString() || '')
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0,
                  }}
                  options={state.initData?.supplySources?.map((it) => {
                    return { value: it.id, label: `${it.code} - ${it.name}` };
                  })}
                />
              )}
            </Col>
            <Col flex="Auto" />
          </Row>
        </ProForm>
      </Card>
    </Spin>
  );
};

export default CreateCustomer;
