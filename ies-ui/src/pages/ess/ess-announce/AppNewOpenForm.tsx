import { 
  ProCard,
  ProFormText,
  ProFormDatePicker,
  ProFormTextArea, 
  ProFormSelect, 
  ModalForm,
  ProFormDigit, 
} from '@ant-design/pro-components';
import { Button, message, Modal, Radio, RadioChangeEvent, Space, Table } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { BookOutlined, CloseOutlined, CopyrightOutlined, DollarOutlined, PoundOutlined, PrinterOutlined, TransactionOutlined } from '@ant-design/icons';

type DataFormType = {
  requestorId: string;
  requestorBuId: number;
};
interface Props {
  open?: boolean;
  onOpenModalChange: (v: boolean) => void;
  refreshTable: () => void;
}

export default ({ open, onOpenModalChange, refreshTable }: Props) => {
  const [formSubmittor] = useForm<DataFormType>();
  const onSaveHandler = async (status: string) => {
    onOpenModalChange?.(false);
    refreshTable();
  };
  return (
    <ModalForm
      modalProps={{
        maskClosable: false,
      }}
      form={formSubmittor}
      open={open}
      width={'30%'}
      title={<div>New Announment ESS</div>}
      submitter={{
        searchConfig: {
          submitText: 'Submit',
        },
        render: (_, defaultDoms) => {
          return [
            defaultDoms[0],
            ( 
              <Button
                key="save_draft"
                onClick={() => {
                  onSaveHandler('SUBMITTING');
                }}
              >
                Save Draft
              </Button>
            ), 
          ];
        },
      }}
      onFinish={() => onSaveHandler('SUBMITTED')}
      onOpenChange={(visible) => !visible && onOpenModalChange?.(visible)}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <ProCard size="small" bordered headerBordered>
          <Space direction="vertical" style={{ width: '100%' }}>
            <ProFormText name = "title_name" /*fieldProps={{ style: { height:'50px',fontSize:'24px' }}} */label = {<div><strong>Title</strong></div>} /> 
            {/* <ProFormSelect
              rules={[{ required: true }]} 
              label="Department" 
              name={'department'}
              // options={lookupList.filter(it => it.type == 'CONTACT_TYPE').map(it => ({ label: it.name, value: it.id }))}
            /> */}
            <Space direction="horizontal" style={{ width: '100%' }}>
              <ProFormDatePicker name = "start_date" /*fieldProps={{ style: { height:'50px',fontSize:'24px' }}}*/ label = {<div><strong>Started Date</strong></div>} />            
              <ProFormDatePicker name = "end_date" /*fieldProps={{ style: { height:'50px',fontSize:'24px' }}}*/ label = {<div><strong>Ended Date</strong></div>} /> 
            </Space> 
            <ProFormTextArea name = "description" /*fieldProps={{ style: { height:'50px',fontSize:'24px' }}}*/ label = {<div><strong>Description</strong></div>} />  
          </Space>
        </ProCard>
      </Space>
    </ModalForm>
  );
};
