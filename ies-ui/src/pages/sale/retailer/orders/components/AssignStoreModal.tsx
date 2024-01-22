import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { simpleRequestActions } from '@/services/model';
//import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { ProForm, ProFormRadio, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { Col, Modal, Row } from 'antd';
import useForm from 'antd/lib/form/hooks/useForm';
import React, { useEffect, useState } from 'react';
// import MapView from './MapView';

// import { isEmpty } from 'lodash';
// import pineIcon from '@/assets/store.png';
import { SalesTeamWorkLess } from '@/services/sale/data';

import { join, max } from 'lodash';
import { CustomerDistance } from '../data';
import { OrderServiceAPI } from '../services';
import OrderGoogleMap from './OrderGoogleMap';

interface Props extends FormModalProps {
  centerPoint: {
    id: string;
    lat: number;
    lng: number;
    name: string;
    internalName: string;
    phone: string;
  };
  purchaseOrderId: string;
  comment?: string;
  referenceCode?: string;
  stroeType?: string;
  deliveryId?: string;

  callback: () => void;
}

const layout = {
  labelCol: { span: 6 },
  //   wrapperCol: { span: 22 },
};

enum StoreType {
  WHOLESALER = 'wholesaler',
  MPU = 'mpu',
  MOBILE_SALE = 'mobile',
}

// declare global {
//   const WHOLESALER: string = 'wholesaler';
//   const MPU: string = 'mpu';
//   const MOBILE_SALE: string = 'mobile';
// }

const AssignStoreModal: React.FC<Props> = ({ ...props }) => {
  // const AnyReactComponent = ({ text }) => <div>{text}</div>;

  const requestActions = simpleRequestActions();
  const [form] = useForm<{ storeType?: string; referenceCode?: string; remark?: string }>();
  // const services = CustomerServiceAPI(requestActions);
  const orderServices = OrderServiceAPI(requestActions);
  const [selectedStoreType, setSelectedStoreType] = useState(StoreType.WHOLESALER.toString());
  // const [selectedWholeSaler, setSelectedWholeSaler] = useState<CustomerDistance>();
  // const [salesperson, setSalesperson] = useState<SalesTeamWorkLess>();
  const [customers, setCustomers] = useState<CustomerDistance[]>([]);
  // const [CRM, setCRM] = useState<CRMDTO[]>([]);
  const [salespersons, setSalespersons] = useState<SalesTeamWorkLess[]>([]);

  useEffect(() => {
    if (!props.open) return;
    (async () => {
      // const data = await services.crmList({ searchValue: undefined });
      // setCRM(data);
      setSalespersons(await orderServices.listSalesTeamWork());
      if (props.stroeType) {
        setSelectedStoreType(props.stroeType);
        form.setFieldsValue({ storeType: props.stroeType });
      }
      if (props.comment) {
        form.setFieldsValue({ remark: props.comment });
      }
      if (props.referenceCode) {
        form.setFieldsValue({ referenceCode: props.referenceCode });
      }

      setCustomers(
        await orderServices
          .fetchCutomers(props.centerPoint.lat, props.centerPoint.lng)
          .query(requestActions),
      );

      //if (pro)
    })();
  }, [props.open]);

  // const containerStyle = {
  //   width: '100%',
  //   height: '400px',
  // };

  const initData = async (params?: string) => {
    // const data = await services.crmList({ searchValue: params });
    // setCRM(data);
    console.log(props.centerPoint);
    setCustomers(
      await orderServices
        .fetchCutomers(props.centerPoint.lat, props.centerPoint.lng, params)
        .query(requestActions),
    );
  };

  const onFormvalueChanged = (changedValues: any) => {
    const { storeType } = changedValues;
    //referenceCode
    if (storeType && 'storeType' in changedValues) {
      console.log(storeType);
      form.setFieldsValue({ referenceCode: undefined });
      setSelectedStoreType(storeType);
      // setSelectedWholeSaler(undefined);
    }
    // if (referenceCode && 'referenceCode' in changedValues) {
    //   console.log(changedValues);
    //   if (selectedStoreType === StoreType.WHOLESALER.toString()) {
    //     const wholesaler = customers.find((it) => it.code === referenceCode);
    //     setSelectedWholeSaler(wholesaler);
    //   } else {
    //     const se = salespersons.find((it) => it.salespersonCode === referenceCode);
    //     setSalesperson(se);
    //   }
    // }
  };

  const onSubmit = async () => {
    const formData = await form.validateFields();
    const referencePhone =
      selectedStoreType === StoreType.WHOLESALER
        ? customers.find((it) => it.code === formData.referenceCode)?.name
        : salespersons.find((it) => it.salespersonCode === formData.referenceCode)?.salespersonName;

    Modal.confirm({
      title: 'Are you Sure?',
      content: 'Assign Store',
      onOk: async () => {
        const entry = {
          id: props.purchaseOrderId,
          status: 'assigned',
          deliveryId: props.deliveryId,
          assignTo: {
            storeType: formData.storeType ?? '',
            referenceCode: formData.referenceCode ?? '',
            referencePhone: referencePhone,
            comment: formData.remark,
          },
        };
        const result = await orderServices.updateStatus(entry);
        if (result.message.toLocaleLowerCase() === 'ok') {
          props.onCancel?.();
          props.callback();
        }
      },
    });
  };

  return (
    <FormModalComp {...props} onResetForm={() => form.resetFields()} onSubmit={onSubmit}>
      <ProForm
        submitter={false}
        form={form}
        layout="horizontal"
        {...layout}
        onValuesChange={onFormvalueChanged}
      >
        <Row gutter={8}>
          <Col span={10}>
            <ProFormRadio.Group
              colSize={6}
              label="Store Type"
              name="storeType"
              rules={[{ required: true }]}
              initialValue={selectedStoreType}
              options={[
                {
                  label: 'Wholesaler',
                  value: StoreType.WHOLESALER,
                },
                {
                  label: 'MPU',
                  value: StoreType.MPU,
                },
                {
                  label: 'Rickshaw',
                  value: StoreType.MOBILE_SALE,
                },
              ]}
            />
          </Col>
          <Col span={10}>
            {/* {selectedStoreType === 'wholesaler' && (
              
            )} */}

            <ProFormSelect
              label={selectedStoreType === StoreType.WHOLESALER ? 'Store' : 'Salesperson'}
              name="referenceCode"
              showSearch={selectedStoreType === StoreType.WHOLESALER}
              fieldProps={{
                onSearch: (value) => {
                  if (selectedStoreType === StoreType.WHOLESALER) {
                    initData(value);
                  }
                },
              }}
              rules={[{ required: true }]}
              options={
                selectedStoreType === StoreType.WHOLESALER
                  ? customers.map((obj) => ({
                      key: obj.id,
                      value: obj.code,
                      label: `${[obj.code, obj.name ?? obj.name].join(' - ')} (${
                        obj.internalName
                      })`,
                    }))
                  : salespersons
                      .filter((it) =>
                        selectedStoreType === StoreType.MPU
                          ? !it.isApprover && it.teamType === 'MPU'
                          : !it.isApprover && it.teamType === 'Mobile Sales',
                      )
                      .map((it) => ({
                        key: it.id,
                        value: it.salespersonCode,
                        label: [it.salespersonCode, it.salespersonName].join(' - '),
                      }))
              }
            />
            <ProFormTextArea label="Remark" name={'remark'} />
          </Col>
        </Row>
      </ProForm>
      {selectedStoreType === StoreType.WHOLESALER && (
        <OrderGoogleMap
          googleMapApiKey="AIzaSyACftO4Dtfn7BQETFuT4YQZ_wOrO3hgszc"
          zoomNumber={
            (max(customers.map((it) => it.distance)) ?? 0) <= 5 &&
            (max(customers.map((it) => it.distance)) ?? 0) >= 4
              ? 12
              : 15
          }
          center={props.centerPoint}
          positions={customers.map((it) => ({
            id: it.id.toString(),
            lat: parseFloat(it.latitude),
            lng: parseFloat(it.longitude),
            name: join([it.code, it.name], ' - '),
            internalName: it.internalName,
            phone:
              it.phone3 && it.phone2
                ? join([it.phone1, it.phone2, it.phone3], ' - ')
                : it.phone2
                ? join([it.phone1, it.phone2], ' - ')
                : it.phone1,
          }))}
        />
        // <LoadScript googleMapsApiKey="AIzaSyACftO4Dtfn7BQETFuT4YQZ_wOrO3hgszc">
        //   <GoogleMap mapContainerStyle={containerStyle} center={props.center} zoom={13}>
        //     {/* Child components, such as markers, info windows, etc. */}
        //     <Marker key={props.center.lat} position={props.center} icon={userLocationIcon} />
        //   </GoogleMap>
        // </LoadScript>
      )}
    </FormModalComp>
  );
};

export default AssignStoreModal;
