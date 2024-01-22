import { QRCode, Truck } from '@/services/delivery/data';
import {
  ModalForm,
  ModalFormProps,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Button, message, Modal, Spin } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { TicketServices } from './services';
import { simpleRequestActions } from '@/services/model';
import { ProFormDependency, ProFormText } from '@ant-design/pro-components';

interface Props extends ModalFormProps {

  qrCodes: QRCode[];
  onRefresh: () => void
}

interface FormData {
  issuedDate: moment.Moment;
  pickup: boolean;
  qrCodeId: number;
  driverId: number;
  truckId: number;
  licensePlate: string;
  driverName: string;
  phoneNumber: string;
  remarks: string;
}

const IssueTicketModal: React.FC<Props> = ({ qrCodes, onRefresh, ...rest }) => {
  const [form] = useForm<FormData>();
  const requestActions = simpleRequestActions()
  const [trucks, setTrucks] = useState<Truck[]>([])


  const onSearchDriver = async (params: { keyWords?: string }) => {
    return (await TicketServices.listDriver(params.keyWords).query(requestActions)).map(it => ({ label: [it.firstName, it.lastName].join(" "), value: it.id }))
  }

  const findDriver = async (driverId: number) => {
    try {
      const rs = await TicketServices.findDriverById(driverId).query(requestActions)
      setTrucks(rs.trucks || [])
    } catch (error: any) {
      setTrucks([])
      message.error(error.message || 'failed to fetch driver and trucks')
    }

  }

  const issueTicketHandler = async (
    qrCodeId: number,
    driverId: number,
    truckId: number,
    remarks?: string) => {
    Modal.confirm({
      title: 'Issue ticket manually.',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await TicketServices.issueManualDiliveryTicket({ qrCodeId: qrCodeId, driverId: driverId, truckId: truckId, remarks: remarks })(requestActions)
          message.success('Ticket issued successfully.');

        } catch (error: any) {
          message.error(error.message || 'Failed to issue ticket.');
        }
      },
    });
  };


  const issuePickupTicketHandler = async (
    qrCodeId: number,
    licensePlate: string,
    remarks?: string
  ) => {
    Modal.confirm({
      title: 'Issue ticket manually.',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await TicketServices.issueManualPickupTicket({ qrCodeId: qrCodeId, licensePlate: licensePlate, remarks: remarks })(requestActions)
          message.success('Ticket issued successfully.');
        } catch (error: any) {
          message.error(error.message || 'Failed to issue ticket.');
        }
      },
    });
  }

  useEffect(() => {
    if (rest.open) {
      form.setFieldsValue({
        qrCodeId: qrCodes.find(it => it)?.id
      })
    }
  }, [rest.open])

  return (
    <ModalForm
      onValuesChange={async (changedValued) => {
        console.log('change', changedValued);

        if ('driverId' in changedValued) {
          const { driverId } = changedValued
          console.log('change driver', driverId);

          form.resetFields(['truckId'])
          findDriver(driverId)
        }
      }}
      modalProps={{
        destroyOnClose: true,
      }}
      form={form}
      initialValues={{
        pickup: true,
      }}
      title="Queue Ticket"
      submitter={{
        render: (props, defaultDoms) => {
          return [
            { ...defaultDoms[0] },
            <Button key={'bt_reset'} onClick={() => props.reset()}>
              Reset
            </Button>,
            defaultDoms[1],
          ];
        },
        searchConfig: {
          submitText: 'Issue',
        },
      }}
      onFinish={async () => {
        const dataForm = await form.validateFields()
        if (dataForm.driverId == 16) {
          await issuePickupTicketHandler(dataForm.qrCodeId, dataForm.licensePlate, dataForm.remarks)
        } else {
          await issueTicketHandler(dataForm.qrCodeId, dataForm.driverId, dataForm.truckId, dataForm.remarks,)
        }
      }}
      {...rest}
    >
      <Spin spinning={requestActions.request?.loading}>
        <ProFormSelect rules={[{ required: true }]} name="qrCodeId" label="QR Code" options={qrCodes.map(it => ({ value: it.id, label: it.name }))} />
        <ProFormSelect
          label={'Driver'}
          rules={[{ required: true }]}
          name="driverId"
          showSearch
          request={onSearchDriver}
        />


        {/* <ProFormSelect
          name={'truckId'}

          showSearch
          allowClear

          rules={[{ required: true }]}
          options={trucks?.map((it) => ({
            value: it.id,
            label: it.licensePlate,
          })) || []}
          label="License Plate"
        /> */}

        <ProFormDependency dependencies={['driverId']} name={['driverId']}  >{
          ({ driverId }) => {
            if (driverId == 16) {
              return <ProFormText rules={[{ required: true }]} name={'licensePlate'} label="License Plate" />
            } else {
              return <ProFormSelect

                name={'truckId'}
                showSearch
                allowClear
                rules={[{ required: true }]}
                options={trucks?.map((it) => ({
                  value: it.id,
                  label: it.licensePlate,
                })) || []}
                label="License Plate"
              />
            }

          }
        }</ProFormDependency>
        <ProFormTextArea name={'remarks'} label="Remarks" />
      </Spin>
    </ModalForm>
  );
};

export default IssueTicketModal;
