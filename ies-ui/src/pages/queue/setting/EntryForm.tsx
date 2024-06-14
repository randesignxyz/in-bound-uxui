import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { LookupData } from '@/services/data';
import { LoadingDock, QRCode, SaveQueue, TransportSource } from '@/services/delivery/data';
import ProForm, {
  ProFormCheckbox,
  ProFormDigit,
  ProFormRate,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Card, Col, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

const layout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 19 },
};

const layout1 = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

interface Props extends FormModalProps {
  init: {
    transportSourceList?: TransportSource[];
    loadingDockList?: LoadingDock[];
    qrCodeList?: QRCode[];
    warehouses?: LookupData[];
  };
  data?: SaveQueue;
  onSave: (data: SaveQueue) => void;
}

const QueueEntryModal: React.FC<Props> = ({ onSave, data, init, ...props }) => {
  const [form] = useForm<SaveQueue>();

  useEffect(() => {
    props.open && initForm();
  }, [props.open]);

  const initForm = () => {

    form.setFieldsValue({
      name: data?.name,
      format: data?.format,
      qrCodeId: data?.qrCodeId,
      priority: data?.priority,
      loadingDockIds: data?.loadingDockIds,
      transportSourceIds: data?.transportSourceIds,
      resetNum: data?.resetNum || 1000,
      dailyReset: data?.dailyReset || true,
      ownedTruckLoading: data?.ownedTruckLoading,
      overwriteAssigned: data?.overwriteAssigned || false,
      warehouseId: data?.warehouseId,
    });
  };

  return (
    <FormModalComp
      width="1000px"
      title="Queue"
      {...props}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        onSave?.(dataForm);
      }}
      onResetForm={() => {
        initForm();
      }}
    >
      <Card>
        <ProForm layout="horizontal" form={form} submitter={false} {...layout}>
          <Card size="small" bordered={false}>
            <Row gutter={10}>
              <Col flex={'400px'}>
                <ProFormText rules={[{ required: true }]} name={'name'} label="Name" />
                <ProFormText name={'format'} label="Format" />
                <ProFormDigit
                  rules={[{ required: true }]}
                  min={10}
                  max={10000}
                  label="Reset Num"
                  name={'resetNum'}
                />
                <ProFormRate name={'priority'} label="Priority" />
              </Col>
              <Col flex={'400px'}>
                <ProFormSelect
                  rules={[{ required: true }]}
                  label="QR Code"
                  name={'qrCodeId'}
                  options={init.qrCodeList?.map((it) => ({
                    label: [it.code, it.name].join('-'),
                    value: it.id,
                  }))}
                />
                <ProFormCheckbox label="Daily Reset" name={'dailyReset'} />
                <ProFormCheckbox label="Overwirte Assigned" name={'overwriteAssigned'} />
                <ProFormCheckbox label="Owned truck loading" name={'ownedTruckLoading'} />
              </Col>
            </Row>
          </Card>
          <Card size="small" bordered={false}>
            <Row>
              <Col flex={'Auto'}>


                <ProFormSelect
                  {...layout1}
                  label="Warehouse"
                  name={'warehouseId'}
                  options={init.warehouses?.map((it) => ({
                    label: it.name,
                    value: it.id,
                  }))}
                />

                <ProFormSelect
                  {...layout1}
                  rules={[{ required: true }]}
                  mode="multiple"
                  label="Tranport Source"
                  name={'transportSourceIds'}
                  options={init.transportSourceList?.map((it) => ({
                    label: it.name,
                    value: it.id,
                  }))}
                />
                <ProFormSelect
                  {...layout1}
                  rules={[{ required: true }]}
                  mode="multiple"
                  label="Loading Dock"
                  name={'loadingDockIds'}
                  options={init.loadingDockList?.map((it) => ({
                    label: [it.code, it.name].join('-'),
                    value: it.id,
                  }))}
                />
                <ProFormTextArea {...layout1} name={'description'} label="Description" />
              </Col>
            </Row>
          </Card>
        </ProForm>
      </Card>
    </FormModalComp>
  );
};

export default QueueEntryModal;
