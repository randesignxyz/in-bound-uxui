import { simpleRequestActions } from '@/services/model';
import {
  ActionType,
  EditableFormInstance,
  EditableProTable,
  ProFormText,
} from '@ant-design/pro-components';

import { Modal, ModalProps, Switch, Tag } from 'antd';
import { uniqueId } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { AccessoriesDTO, AddVehicleAccessory } from '../../accessory/data';
import { AccessoryServiceAPI } from '../../accessory/service';

interface Props extends ModalProps {
  data?: AccessoriesDTO[];
  actionType?: String;
  id?: string;
  onSave: (param: AddVehicleAccessory) => void;
}

const AccessoriesModalForm: React.FC<Props> = ({ data, actionType, onSave, id, ...props }) => {
  const requestActions = simpleRequestActions();
  const services = AccessoryServiceAPI(requestActions);
  const [accessories, setAccessories] = useState<AccessoriesDTO[]>([]);
  const actionRef = useRef<ActionType>();
  const editableFormRef = useRef<EditableFormInstance>();

  const loadData = async () => {
    const result = await services.page({
      criteria: { searchValue: '' },
    });
    setAccessories(
      result.items.map((it) => ({
        ...it,
        name: it.name,
        avatar: it.imageLink,
        quantity: data?.find((it1) => it1.id == it.id)?.quantity,
        selected: data?.find((it2) => it2.id == it.id)?.quantity ? true : false,
        key: uniqueId.toString(),
      })),
    );
  };

  useEffect(() => {
    props.open && loadData();
  }, [props.open]);

  const onRequest = async (param?: string) => {
    const result = await services.page({
      criteria: { searchValue: param },
    });
    setAccessories(
      result.items.map((it) => ({
        ...it,
        name: it.name,
        avatar: it.imageLink,
        quantity: data?.find((it1) => it1.id == it.id)?.quantity,
        selected: data?.find((it2) => it2.id == it.id)?.quantity ? true : false,
        key: uniqueId.toString(),
      })),
    );
  };

  return (
    <Modal
      title="Accessory & Tool"
      {...props}
      width={'800px'}
      onOk={async () => {
        const entry = {
          vehicleId: id,
          items: accessories
          .filter((it) => it.selected === true)
          .map((it) => ({ accessoryId: it.id, quantity: it.quantity })),
        };
        
        onSave(entry);
        await editableFormRef.current?.validateFields();
        await onRequest()
      }}
    >
      <hr />

      <ProFormText
        label="Search"
        labelAlign="left"
        fieldProps={{
          onChange: (param) => {
            onRequest(param.target.value);
          },
        }}
      />

      <EditableProTable<AccessoriesDTO>
        value={accessories}
        rowKey={'id'}
        recordCreatorProps={false}
        editableFormRef={editableFormRef}
        actionRef={actionRef}
        editable={{
          type: 'multiple',
          editableKeys: accessories?.map((it) => it.id),
          actionRender: (row, config, defaultDoms) => {
            return [defaultDoms.delete];
          },
          onValuesChange: (record, recordList) => {
            setAccessories(recordList);
          },
        }}
        columns={[
          {
            dataIndex: 'name',
            editable: false,
            render:(_,r)=><>{r.name} <Tag color='geekblue' bordered={false}>{r.qty}</Tag></>
          },
          {
            dataIndex: 'quantity',
            valueType: 'digit',
            width: 100,
            fieldProps: {
              max: 50,
              placeholder: 'quantity',
            },
            formItemProps: (form, confige) => {
              const item = form.getFieldValue([confige.rowKey || '']);
              return {
                ...confige,
                rules: [{ required: item?.selected }],
              };
            },
          },
          {
            dataIndex: 'selected',
            width: 50,
            renderFormItem: (s, b) => {
              return (
                <Switch
                  size="small"
                  checked={b.record?.selected}
                  key={b.record?.id}
                  onClick={(e) => {
                    editableFormRef.current?.setFieldValue([b.record?.id || '', 'selected'], e);
                  }}
                />
              );
            },
          },
        ]}
      />
    </Modal>
  );
};
export default AccessoriesModalForm;
