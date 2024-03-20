import { fetchDataListService } from '@/services/apiGateway';
import { Loaded, LoadedItem, LoadingTeam } from '@/services/delivery/data';
import { SaveLoadedParam, startLoadingParam } from '@/services/delivery/req-params';
import { simpleRequestActions } from '@/services/model';
import { ProFormCheckbox, ProFormSelect, ProTable } from '@ant-design/pro-components';
import {
  ModalForm,
  ModalFormProps,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Card } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';

interface Props extends ModalFormProps {
  loaded: Loaded;
  onSave: (data: startLoadingParam) => void;
  ownedTruckLoading?: boolean;
}

const StartLoadingModal: React.FC<Props> = ({ loaded, ownedTruckLoading, onSave, ...props }) => {

  const requestActions = simpleRequestActions()
  const [loadingTeam, setLoadingTeam] = useState<LoadingTeam[]>()
  const [form] = useForm<{
    id: number;
    loadingTeamId?: number;
    remarks?: string;
  }>();

  useEffect(() => {
    if (!props.open) return;
    initData()
    initDataForm();
  }, [props.open]);



  const initDataForm = () => {
    const items = loaded.items.map((it) => ({
      ...it,
      loadedQty: it.qty,
    }));

    form.setFieldsValue({
      id: loaded.id,
      remarks: loaded.remarks,
    });
  };

  const initData = async () => {
    const rs = await fetchDataListService<LoadingTeam>({
      actionName: 'fetch-all-loading-team',
      endpoint: 'DELIVERY',
      payload: {}

    }).query(requestActions)

    setLoadingTeam(rs)
  }

  return (
    <ModalForm
      form={form}
      onValuesChange={(_, values) => {
        const items = (values.items || []) as { loadedQty: number }[]
        // const hasZeroLoadedQty = items?.some(it => it.loadedQty == 0)

      }}
      title="Start Loading"
      {...props}
      onReset={initDataForm}
      onFinish={async (_) => {
        const formData = await form.validateFields();
        onSave({
          id: loaded.id,
          loadingTeamId: formData.loadingTeamId,
          remarks: formData.remarks,
        });
      }}
    >
      <ProTable<LoadedItem>
        search={false}
        bordered={false}
        dataSource={loaded.items || []}
        pagination={false}
        options={{
          density: false,
          reload: false,
          setting: false,
        }}
        columns={[
          { title: 'Item Code', dataIndex: 'itemCode' },
          { title: 'Item Description', dataIndex: 'itemDescription' },
          { title: 'UoM', dataIndex: 'uom' },
          { title: 'Batch Num', dataIndex: 'batchNum' },
          { title: 'WSH Code', dataIndex: 'whsCode' },
          { title: 'Qty', dataIndex: 'qty', align: 'right' },
        ]}
      />

      <Card style={{ margin: 20 }} size="small" bordered={false}>

        {!ownedTruckLoading && <ProFormSelect name={'loadingTeamId'} allowClear showSearch width={'md'} label="Loading Team" options={loadingTeam?.map(it => ({ label: it.name, value: it.id }))} />}
        <ProFormTextArea name={'loadedRemarks'} label="Remarks" />
      </Card>
    </ModalForm>
  );
};

export default StartLoadingModal;
