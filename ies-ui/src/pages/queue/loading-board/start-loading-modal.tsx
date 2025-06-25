import { formatterQty } from '@/pages/utils';
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
import { Card, Checkbox, Col, Row } from 'antd';
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
  const [isPallet, setIsPallet] = useState<number | null>();
    const [form] = useForm<{
    id: number;
    loadingTeamId?: number;
    loadingType?: number;
    remarks?: string;
  }>();

  useEffect(() => {
    if (!props.open) return;
    initData()
    initDataForm();
    {!ownedTruckLoading? setIsPallet(0):setIsPallet(null)}
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
console.log(isPallet)
  const initData = async () => {
    const rs = await fetchDataListService<LoadingTeam>({
      actionName: 'fetch-all-loading-team',
      endpoint: 'DELIVERY',
      payload: {}

    }).query(requestActions)

    // const type = await fetchDataListService<LoadingTeam>({
    //   actionName: 'fetch-all-loading-type',
    //   endpoint: 'DELIVERY',
    //   payload: {}

    // }).query(requestActions)

    setLoadingTeam(rs)
    // setLoadingType(type)
  }

  console.log(isPallet)
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
          loadingType: isPallet,
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
        footer={(data) => (
          <Row>
            <Col flex={'Auto'} style={{ fontWeight: 'bold' }}>
              Total
            </Col>
            <Col flex={'100px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
              {formatterQty.format(data.map((it) => (it.qty || 0))?.reduce((p, c) => p + c, 0))}
            </Col>
          </Row>
        )}

      />

      <Card style={{ margin: 20 }} size="small" bordered={false}>

        {!ownedTruckLoading && (
          <Row>
            <Col flex={'Auto'}>
              <ProFormSelect name={'loadingTeamId'} allowClear showSearch width={'md'} label="Loading Team" options={loadingTeam?.map(it => ({ label: it.name, value: it.id }))} />
            </Col>
            <Col flex={'Auto'}>
              {/* <ProFormSelect name={'loadingTypeId'} allowClear showSearch width={'md'} label="Loading Type" options={loadingType?.map(it => ({ label: it.name, value: it.id }))} /> */}
              <Checkbox key={'loadingType'} 
              // defaultChecked 
              onChange={e => {
                setIsPallet((e.target.checked && !ownedTruckLoading) ? 1 : (!ownedTruckLoading) ? 0: null);
              }}>By Pallet </Checkbox>
            </Col>
          </Row>
        )}
        <ProFormTextArea name={'loadedRemarks'} label="Remarks" />
      </Card>
    </ModalForm>
  );
};

export default StartLoadingModal;