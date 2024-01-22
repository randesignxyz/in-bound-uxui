import {
  ProForm,
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';

import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { useGetState } from 'ahooks';
import { Col, message, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';
import UploadImagePreview from '../components/UploadImagePreview';
import { DriverCreate } from './data';

interface Props extends FormModalProps {
  data?: DriverCreate;
  onSave: (data: DriverCreate) => void;
  actionType?: String;
  id?: string;
}

const DriverModalForm: React.FC<Props> = ({ onSave, data, actionType, id, ...props }) => {
  const [form] = useForm<DriverCreate>();
  const [imageId, setImageId] = useGetState('');

  useEffect(() => {
    props.open && initFormData();
    props.open && !data && form.resetFields();
  }, [props.open]);

  const initFormData = () => {
    form.setFieldsValue({
      ...data,
    });
  };

  return (
    <FormModalComp
      title="Driver Infomation"
      {...props}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        if (data) {
          dataForm['id'] = data.id;
          dataForm['imageId'] = imageId;
        }
        onSave(dataForm);
      }}
      onResetForm={() => {
        form.resetFields();
      }}
    >
      <ProForm form={form} size={'middle'} submitter={false} onReset={() => form.resetFields()}>
        <Row gutter={12}>
          <Col span={18}>
            <Row gutter={6}>
              <Col span={12}>
                <ProFormText
                  name={'firstName'}
                  label="FirstName"
                  rules={[{ required: true, max: 40 }]}
                />
              </Col>
              <Col span={12}>
                <ProFormText
                  name={'lastName'}
                  label="Last Name"
                  rules={[{ required: true, max: 40 }]}
                />
              </Col>
              <Col span={12}>
                <ProFormDatePicker width={'md'} name={'dob'} label="Date of Birth" />
              </Col>

              <Col span={12}>
                <ProFormText name="cardId" label="Card Id Number" rules={[{ max: 40 }]} />
              </Col>
              <Col span={12}>
                <ProFormText name={'phone'} label="Phone Number" rules={[{ max: 20 }]} />
              </Col>
              <Col span={12}>
                <ProFormText name={'email'} label="Email" rules={[{ max: 40 }]} />
              </Col>
            </Row>
          </Col>
          <Col span={6}>
            <UploadImagePreview
              imageId={data?.imageId}
              style={{
                height: 200,
              }}
              defualtImage="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              onSave={async (fileId) => {
                setImageId(fileId);
                try {
                  // profile && await ProfileServices.saveProfileImage({
                  //     employeeId: profile.id,
                  //     imageId: fileId
                  // })(requestActions)
                } catch (error: any) {
                  message.error(error.message || 'failed to upload image.');
                }
              }}
            />
          </Col>
        </Row>
        <Row gutter={6}>
          <Col span={6}>
            <ProFormText
              name={'jobTitle'}
              label="Job Title"
              initialValue={'Driver'}
              rules={[{ required: true, max: 40 }]}
            />
          </Col>
          <Col span={6}>
            <ProFormText name={'driverLicense'} label="License Number" rules={[{ max: 40 }]} />
          </Col>
          <Col span={6}>
            <ProFormText name={'employeeNumber'} label="Employee Number" rules={[{ max: 40 }]} />
          </Col>
          <Col span={3}>
            <ProFormSelect
              name={'status'}
              placeholder={''}
              label="Status"
              initialValue={'Active'}
              rules={[{ required: true }]}
              options={[
                {
                  value: 'Active',
                  label: 'Active',
                },
                {
                  value: 'Inactive',
                  label: 'Inactive',
                },
              ]}
            />
          </Col>
          <Col span={3}>
            <ProFormSelect
              name={'resign'}
              label="Resign"
              initialValue={'NO'}
              rules={[{ required: true }]}
              placeholder={''}
              options={[
                {
                  value: 'NO',
                  label: 'NO',
                },
                {
                  value: 'YES',
                  label: 'YES',
                },
              ]}
            />
          </Col>
        </Row>

        <ProFormTextArea name="address" label="Address" />
      </ProForm>
    </FormModalComp>
  );
};

export default DriverModalForm;
