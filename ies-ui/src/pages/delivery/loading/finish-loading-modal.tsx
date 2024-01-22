import { Loaded, LoadedItem, LoadingListItem } from '@/services/delivery/data';
import { SaveLoadedParam } from '@/services/delivery/req-params';
import ProForm, {
  ModalForm,
  ModalFormProps,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { EditableProTable } from '@ant-design/pro-table';
import { Card } from 'antd';
import { useForm } from 'antd/lib/form/Form';
interface Props extends ModalFormProps {
  loadingItem: LoadingListItem;
  loaded: Loaded;
  onSave: (data: SaveLoadedParam) => void;
}

const FinishLoadingModal: React.FC<Props> = ({ loadingItem, loaded, onSave, ...props }) => {
  const [form] = useForm<{
    loadedRemarks?: string;
  }>();

  return (
    <ModalForm
     
      title="Finish Loading"
      {...props}
      // onResetForm={initDataForm}
      onReset={() => form.resetFields()}
      onFinish={async (_) => {    
        const formData = await form.validateFields();

        const items = loaded.items.map(it=> {
          const item = formData[it.id]
          return {
            id: it.id,
            loadedQty: item['loadedQty']
          }
        })
        
        onSave({
          id: loaded.id,
          loadedRemarks: formData.loadedRemarks,
          items: items
        });


      }}
    >
      <Card size="small" bordered={false}>
        <ProForm form={form} submitter={false}>

        <EditableProTable<LoadedItem & { loadedQty: number }>
          value={loaded.items.map(it => ({...it, loadedQty: it.qty}))}
          recordCreatorProps = {false}
          rowKey = 'id'
          columns = {[
            {title: 'Item Code',width: 100, dataIndex: 'itemCode', editable: false},
            {title: 'Item Description', dataIndex: 'itemDescription', editable: false},
            {title: 'UoM', width: 60 ,dataIndex: 'uom', editable: false},
            {title: 'Qty', width: 70, dataIndex: 'qty', editable: false},
            {title: 'Loaded Qty', width: 120, dataIndex: 'loadedQty', formItemProps: {
              rules: [{
                required: true
              }]
            }},
          ]}

          editable={{
            type: 'multiple',
            editableKeys:  loaded.items.map(it => it.id),
            form: form
          }}
        />
        <ProFormTextArea name={'loadedRemarks'} label="Remarks" />
        </ProForm>
      </Card>
    </ModalForm>
  );
};

export default FinishLoadingModal;
