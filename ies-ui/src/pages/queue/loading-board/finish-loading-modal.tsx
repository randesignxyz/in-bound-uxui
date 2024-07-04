import { fetchDataListService } from '@/services/apiGateway';
import { Loaded, LoadedItem, LoadingTeam } from '@/services/delivery/data';
import { SaveLoadedParam } from '@/services/delivery/req-params';
import { simpleRequestActions } from '@/services/model';
import { ProFormCheckbox, ProFormSelect } from '@ant-design/pro-components';
import {
  ModalForm,
  ModalFormProps,
  ProFormDigit,
  ProFormList,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Card, Col, Row } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';

interface Props extends ModalFormProps {
  loaded: Loaded;
  onSave: (data: SaveLoadedParam) => void;
}

const FinishLoadingModal: React.FC<Props> = ({ loaded, onSave, ...props }) => {

  const requestActions = simpleRequestActions()
  const [secondaryLoading, setSecondaryLoading] = useState(false)
  const [loadingTeam, setLoadingTeam] = useState<LoadingTeam[]>()
  const [form] = useForm<{
    items: (LoadedItem & { loadedQty: number })[];
    id: number;
    shift: string;
    loadingTeamId?: number;
    remarks?: string;
    loadedRemarks?: string;
    transferZeroLoaded?: boolean;
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
      items: items,
      id: loaded.id,
      shift: loaded.shift,
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
        const hasZeroLoadedQty = items?.some(it => it.loadedQty == 0)
        setSecondaryLoading(!!hasZeroLoadedQty)

      }}
      title="Finish Loading"
      {...props}
      onReset={initDataForm}
      onFinish={async (_) => {
        const formData = await form.validateFields();
        onSave({
          id: loaded.id,
          loadingTeamId: formData.loadingTeamId,
          loadedRemarks: formData.loadedRemarks,
          transferZeroLoaded: formData.transferZeroLoaded,
          items: formData.items.map((it) => ({
            id: it.id,
            loadedQty: it.loadedQty,
          })),
        });
      }}
    >
      <Card size="small" bordered={false}>
        <ProFormList
          name="items"

          children={undefined}
          creatorButtonProps={false}

          copyIconProps={false}
          deleteIconProps={false}
          itemRender={(_, listMeta) => (
            <Row key={`row-0${listMeta.index}`} style={{ width: '1000px' }}>
              <Col
                style={{ alignItems: 'flex-start' }}
                key={`col-0${listMeta.index}`}
                flex={'100px'}
              >
                <ProFormText
                  label={listMeta.index === 0 && 'Item Code'}
                  readonly
                  labelCol={{
                    style: { fontWeight: 'bold', marginBottom: 10 },
                  }}
                  name={'itemCode'}
                />
              </Col>
              <Col
                style={{ alignItems: 'flex-start' }}
                key={`col-1${listMeta.index}`}
                flex={'300px'}
              >
                <ProFormText
                  label={listMeta.index === 0 && 'Item Description'}
                  readonly
                  labelCol={{
                    style: { fontWeight: 'bold', marginBottom: 10 },
                  }}
                  name={'itemDescription'}
                />
              </Col>
              <Col
                style={{ alignItems: 'flex-start' }}
                key={`col-2${listMeta.index}`}
                flex={'100px'}
              >
                <ProFormText
                  label={listMeta.index === 0 && 'UOM'}
                  labelCol={{
                    style: { fontWeight: 'bold', marginBottom: 10 },
                  }}
                  readonly
                  name={'uom'}
                />
              </Col>
              <Col style={{ alignItems: 'flex-end' }} key={`col-3${listMeta.index}`} flex={'100px'}>
                <ProFormText
                  label={listMeta.index === 0 && 'Loading Qty'}
                  labelCol={{
                    style: { fontWeight: 'bold', marginBottom: 10 },
                  }}
                  readonly
                  name={'qty'}
                />
              </Col>
              <Col
                style={{ alignItems: 'flex-start' }}
                key={`col-4${listMeta.index}`}
                flex={'150px'}
              >
                <ProFormDigit
                  label={listMeta.index === 0 && 'Loaded Qty'}
                  placeholder="Loaded Qty"
                  disabled={!loaded.allowedActualLoadingAmount}
                  rules={[{ required: true }]}
                  width={100}
                  min={0}
                  labelCol={{
                    style: { fontWeight: 'bold', marginBottom: 10 },
                  }}
                  help={<span />}
                  proFieldProps={{}}
                  name={'loadedQty'}
                />
              </Col>
            </Row>
          )}


        />

        {/* <ProFormSelect name={'loadingTeamId'} allowClear showSearch width={'md'} label="Loading Team" options={loadingTeam?.map(it => ({ label: it.name, value: it.id }))} /> */}
        <ProFormTextArea name={'loadedRemarks'} label="Remarks" />
        {secondaryLoading && <ProFormCheckbox name={'transferZeroLoaded'} label='Transfer none loaded to second warehouse' />}

        {/* </ProForm> */}
      </Card>
    </ModalForm>
  );
};

export default FinishLoadingModal;
