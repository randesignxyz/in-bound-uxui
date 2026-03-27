import BreadCrumbCom from '@/pages/prod/shared/BreadCrumbCom';
import { simpleRequestActions } from '@/services/model';
import {
  EditableFormInstance,
  FooterToolbar,
  ProForm,
  ProFormText,
} from '@ant-design/pro-components';
import { history } from '@@/exports';
import { Button, Col, Modal, Row, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useRef } from 'react';
import { ProdPaths } from '@/pages/prod';
import { TransferCreate } from './data';
import { TransferServiceAPI } from './service';

export default () => {
  const [form] = useForm<TransferCreate>();
  const editableFormRef = useRef<EditableFormInstance>();
  const requestActions = simpleRequestActions();
  const services = TransferServiceAPI(requestActions);

  const routes = [
    {
      path: ProdPaths.prod,
      label: 'Prod',
    },
    {
      path: `${ProdPaths.inventoryInboundOutbound}/list`,
      label: 'Inventory Inbound Outbound',
    },
    {
      path: ProdPaths.inventoryOutboundTransfer + '/list',
      label: 'Inventory Outbound Transfer',
    },
    {
      path: '',
      label: 'Create',
    },
  ];

  const onSave = async () => {
    const dataForm = await form.validateFields();

    await editableFormRef.current?.validateFields();

    const entity = {
      ...dataForm,
    };

    Modal.confirm({
      title: 'save testing record',
      content: 'Are you sure?',
      onOk: async () => {
        await services.save(entity);
        message.success('success submit');
        history.push(`${ProdPaths.inventoryOutboundTransfer}/list`);
      },
    });
  };

  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />
      <ProForm
        form={form}
        layout={'vertical'}
        style={{ paddingBottom: 9 }}
        key="form-inspection"
        rowProps={{
          gutter: [12, 16],
        }}
        submitter={{
          render: () => {
            return (
              <FooterToolbar>
                <Button
                  type="primary"
                  onClick={() => history.push(`${ProdPaths.inventoryOutboundTransfer}/list`)}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    onSave();
                  }}
                >
                  Save
                </Button>
              </FooterToolbar>
            );
          },
        }}
      ></ProForm>
      <ProForm form={form} size={'middle'} submitter={false} onReset={() => form.resetFields()}>
        <Row gutter={10}>
          <Col span={12}>
            <ProFormText
              name={'first_name'}
              label="First Name"
              rules={[{ required: true, max: 40 }]}
            />
          </Col>
          <Col span={12}>
            <ProFormText
              name={'last_name'}
              label="Last Name"
              rules={[{ required: true, max: 40 }]}
            />
          </Col>
        </Row>
      </ProForm>
    </>
  );
};

// import FormModalComp, { FormModalProps } from '@/components/FormModal';
// import { Testing, TestingCreate } from './data';
// import { useForm } from 'antd/lib/form/Form';
// import {
//   ProDescriptions,
//   ProForm,
//   ProFormDependency,
//   ProFormDigit,
//   ProFormSelect,
//   ProFormText,
//   ProFormTextArea,
// } from '@ant-design/pro-components';
// import { Col, Row } from 'antd';
// import { TestingServiceAPI } from './service';

// interface Props extends FormModalProps {
//   data?: Testing,
//   onSave: (data: TestingCreate) => void,
//   actionType?: String,
//   id: string
// }

// const EntryForm: React.FC<Props> = ({ onSave, data, actionType, id, ...props }) => {
//   const [form] = useForm<TestingCreate>();
//   return (
//     <FormModalComp
//       title="Tank Infomation"
//       {...props}
//       width={'800px'}
//       onSubmit={async () => {
//         const dataForm = await form.validateFields();
//         const entry = {
//           id: data?.id,
//           ...dataForm,
//         };
//         onSave(entry);
//       }}
//       onResetForm={() => {
//         form.resetFields();
//       }}
//     >
//       <ProForm form={form} size={'middle'} submitter={false} onReset={() => form.resetFields()}>
//         <Row gutter={10}>
//           <Col span={12}>
//             <ProFormText
//               name={'tankName'}
//               label="Tank Name"
//               rules={[{ required: true, max: 40 }]}
//             />

//             <ProFormDigit
//               name={'tankCapacity'}
//               label="Tank Capacity"
//               rules={[{ required: true }]}
//             />
//             <ProFormDependency dependencies={['tankCapacity']} name={['tankCapacity']}>
//               {({ tankCapacity }) => {
//                 return (
//                   <ProFormDigit
//                     name={'beginningInventory'}
//                     label="Beginning Inventory"
//                     initialValue={0}
//                     rules={[
//                       {
//                         //   required: true,
//                         //   max: tankCapacity,
//                         type: 'number',
//                       },
//                     ]}
//                     hidden
//                   />
//                 );
//               }}
//             </ProFormDependency>
//           </Col>
//           <Col span={12}>
//             <ProFormDependency dependencies={['tankCapacity']} name={['tankCapacity']}>
//               {({ tankCapacity }) => {
//                 return (
//                   <ProFormDigit
//                     name={'currentInventory'}
//                     label="Initial Balance"
//                     rules={[
//                       {
//                         //   required: true,
//                         //   max: tankCapacity,
//                         type: 'number',
//                       },
//                     ]}
//                   />
//                 );
//               }}
//             </ProFormDependency>
//             <ProFormDependency dependencies={['tankCapacity']} name={['tankCapacity']}>
//               {({ tankCapacity }) => {
//                 return (
//                   <ProFormDigit
//                     name={'tankUsages'}
//                     rules={[
//                       {
//                         type: 'number',
//                       },
//                     ]}
//                     hidden
//                     initialValue={0}
//                     label="Tank Usages"
//                   />
//                 );
//               }}
//             </ProFormDependency>

//             <ProFormSelect
//               name={'status'}
//               label="Status"
//               rules={[{ required: true }]}
//               options={[
//                 {
//                   value: 'active',
//                   label: 'Active',
//                 },
//                 {
//                   value: 'inactive',
//                   label: 'Inactive',
//                 },
//               ]}
//             />
//           </Col>
//         </Row>
//         <ProFormTextArea name={'description'} label="Description" />
//       </ProForm>
//     </FormModalComp>
//   )
// }
// export default EntryForm;
