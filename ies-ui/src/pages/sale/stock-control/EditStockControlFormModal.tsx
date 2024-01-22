import FormModalComp, { FormModalProps } from '@/components/FormModal';
import {
  SalesTeamWorkLess,
  StockControlLess,
  UpdateStockControlDto,
  VehicleLess,
} from '@/services/sale/data';
import { PlusOutlined } from '@ant-design/icons';
import ProForm, { ProFormDateTimePicker, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { useSetState } from 'ahooks';
import { Button, Card, Col, message, Row, Tooltip } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';
import { Model } from './model';
import VehicleFormModal from './VehicleFormModal';

interface EditStockControlFormModalProps extends FormModalProps {
  data?: {
    stockControl?: StockControlLess;
    seList?: SalesTeamWorkLess[];
  };
  isLoading: boolean;
  actionHandlers?: {
    onSaveVehicle?: (item: VehicleLess) => void;
    onSearchVehicle?: (text: string) => void;
    onUpdate?: (item: UpdateStockControlDto) => void;
  };
}

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 14 },
};

const EditStockControlFormModal: React.FC<EditStockControlFormModalProps> = ({
  actionHandlers,
  data,
  isLoading,
  ...rest
}) => {
  const { actions } = Model();
  const [form] = useForm<StockControlLess>();
  const [vehicleModal, setVehicleModal] = useSetState<{ visible?: boolean }>({});

  const onValuesChange = (changedValues: any, values: any) => {};

  const onSubmitActionHandler = async () => {
    try {
      const dataForm = await form.validateFields();
      const item: UpdateStockControlDto = {
        ...dataForm,
        id: data?.stockControl?.id || 0,
      };
      actionHandlers && actionHandlers.onUpdate && actionHandlers.onUpdate(item);
    } catch (e: any) {
      message.error(e);
    }
  };

  useEffect(() => {
    if (!rest.open) {
      return;
    }
    if (data?.stockControl) {
      form.setFieldsValue({
        plateNumber: data?.stockControl?.plateNumber,
        approvedBy: splitStr(data?.stockControl?.approvedBy),
        createdDate: data?.stockControl?.requestedDate,
        approvedDate: data.stockControl.approvedDate,
        owner: data?.stockControl?.owner,
        referenceNo: data?.stockControl?.referenceNo,
        receivedBy: splitStr(data?.stockControl?.receivedBy),
      });
    }
  }, [rest.open]);

  const splitStr = (str?: string): string => {
    const list = str?.split(' - ');
    return list && list.length > 0 ? list[0] : '';
  };

  return (
    <FormModalComp
      {...rest}
      width="850px"
      footer={[
        <Button key="button" onClick={() => rest.onCancel && rest.onCancel()}>
          Cancel
        </Button>,
        // <Button key="reset" onClick={() => form.resetFields}>
        //   Reset
        // </Button>,
        <Button
          disabled={data?.stockControl?.id === null}
          loading={rest.confirmLoading}
          key="submit"
          type="primary"
          onClick={onSubmitActionHandler}
        >
          Update
        </Button>,
      ]}
    >
      <Card size="small" title="General Info" style={{ marginBottom: 10 }}>
        <ProForm
          {...layout}
          form={form}
          submitter={false}
          autoFocusFirstInput
          layout="horizontal"
          onValuesChange={onValuesChange}
        >
          <Row gutter={50}>
            <Col flex="1">
              <ProFormSelect
                name="owner"
                disabled={data?.stockControl?.id !== null}
                rules={[{ required: true }]}
                label="Sales Executive"
                showSearch
                fieldProps={{
                  optionLabelProp: 'label',
                  // dropdownMatchSelectWidth: 400,
                  filterOption: (input, option) =>
                    (option?.label?.toString() || '').toLowerCase().indexOf(input.toLowerCase()) >=
                    0,
                }}
                options={data?.seList
                  ?.filter((it) => it.isRequester)
                  .map((it) => {
                    return {
                      value: it.salespersonCode,
                      label: `${it.salespersonCode} - ${it.salespersonName}`,
                    };
                  })}
              />
              <ProFormSelect
                rules={[{ required: true }]}
                name="plateNumber"
                label="Plate Number"
                showSearch
                debounceTime={300}
                addonAfter={
                  <Tooltip placement="topLeft" title="Add Vehicle">
                    <Button
                      size="small"
                      icon={<PlusOutlined />}
                      type="primary"
                      onClick={() => {
                        setVehicleModal({ visible: true });
                      }}
                    />
                  </Tooltip>
                }
                request={async ({ keyWords }) => {
                  //setPhoneNumber(keyWords);
                  const result =
                    keyWords &&
                    keyWords.length > 1 &&
                    (await actions.searchVehicleByPlateNumber(keyWords));
                  return result.map((it: { plateNumber: string }) => ({
                    label: it.plateNumber,
                    value: it.plateNumber,
                  }));
                }}
                placeholder="Please select plate number"
              />
              <ProFormSelect
                name="receivedBy"
                rules={[{ required: true }]}
                label="Received By"
                showSearch
                fieldProps={{
                  optionLabelProp: 'label',
                  //dropdownMatchSelectWidth: 400,
                  filterOption: (input, option) =>
                    (option?.label?.toString() || '').toLowerCase().indexOf(input.toLowerCase()) >=
                    0,
                }}
                options={data?.seList
                  ?.filter((it) => !it.isApprover)
                  .map((it) => {
                    return {
                      value: it.salespersonCode,
                      label: `${it.salespersonCode} - ${it.salespersonName}`,
                    };
                  })}
              />
              {/*<ProFormText
                      help={<span />}
                      label="Plate Number"
                      name="plateNumber"
                      rules={[{ required: true }]}
                      // width="md"
                    />
                    <ProFormCheckbox
                      disabled={data?.selectedSE ? true : false}
                      label="Van Sale"
                      name="isVanSale"

                    /> */}
            </Col>
            <Col flex="1">
              <ProFormText
                label="Serial Number"
                name="referenceNo"
                // rules={[{ required: true }]}
                // width="md"
              />
              <ProFormDateTimePicker
                disabled={data?.stockControl?.id !== null}
                label="Request Date"
                name="createdDate"
                rules={[{ required: true }]}
              />
              <ProFormSelect
                name="approvedBy"
                rules={[{ required: true }]}
                label="Approve By"
                showSearch
                fieldProps={{
                  optionLabelProp: 'label',
                  // dropdownMatchSelectWidth: 400,
                  filterOption: (input, option) =>
                    (option?.label?.toString() || '').toLowerCase().indexOf(input.toLowerCase()) >=
                    0,
                }}
                options={data?.seList
                  ?.filter((it) => it.isApprover)
                  .map((it) => {
                    return {
                      value: it.salespersonCode,
                      label: `${it.salespersonCode} - ${it.salespersonName}`,
                    };
                  })}
              />
              <ProFormDateTimePicker
                label="Approved Date"
                name="approvedDate"
                rules={[{ required: true }]}
                help={<span />}
              />
            </Col>
          </Row>
        </ProForm>
      </Card>

      <VehicleFormModal
        title="Add New Vehicle"
        open={vehicleModal.visible}
        onCancel={() => setVehicleModal({ visible: false })}
        loading={isLoading}
        actionHandlers={{
          onSave: (item: VehicleLess) => {
            if (actionHandlers && actionHandlers.onSaveVehicle) {
              actionHandlers.onSaveVehicle(item);
              form.setFieldsValue({ plateNumber: item.plateNumber });
            }
            setVehicleModal({ visible: false });
          },
        }}
      />
    </FormModalComp>
  );
};

export default EditStockControlFormModal;
