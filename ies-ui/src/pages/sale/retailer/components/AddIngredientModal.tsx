import { simpleRequestActions } from '@/services/model';
import type { ActionType } from '@ant-design/pro-components';
import { ModalForm, ProList } from '@ant-design/pro-components';
import { Switch } from 'antd';
import { useEffect, useRef, useState } from 'react';
import type { IngredientDto } from '../ingredient/data';
import { IngredientServiceAPI } from '../ingredient/services';

interface Props {
  isVisible: boolean;
  selectedDefault: IngredientDto[];
  actionHandler: {
    onCancel: () => void;
    onOk: (items?: IngredientDto[]) => void;
  };
}

export default ({ isVisible, actionHandler, selectedDefault }: Props) => {
  const requestActions = simpleRequestActions();
  const services = IngredientServiceAPI(requestActions);
  const [selectedItems, setSelectedItems] = useState<IngredientDto[]>([]);
  const actionRef = useRef<ActionType>();

  useEffect(() => {
    if (isVisible) {
      setSelectedItems(selectedDefault);
    }
  }, [isVisible]);

  return (
    <ModalForm
      title={'Select Ingredient'}
      open={isVisible}
      onFinish={() => {
        return Promise.resolve(true);
      }}
      modalProps={{
        closable: true,
        destroyOnClose: true,
        onCancel: actionHandler.onCancel,
        //afterClose: () => setSelectedItems([]),
      }}
      submitter={{
        resetButtonProps: {
          onClick: actionHandler.onCancel,
        },
        submitButtonProps: {
          onClick: () => {
            actionHandler.onOk(selectedItems);
          },
        },
      }}
    >
      <ProList<IngredientDto>
        actionRef={actionRef}
        request={async (page) => {
          const result = await services.pageIngredient({
            criteria: { advanceSearch: { status: 'ALL' } },
            pagination: { pageSize: page.pageSize, current: page.current },
          });
          return {
            data: result.items,
            success: !!result,
            total: result.total,
          };
        }}
        //dataSource={dataSource}
        metas={{
          title: {
            render: (_, r) => {
              return `${r.name} - ${r.nameEn}`;
            },
          },
          subTitle: {
            render: (_, r) => {
              return r.code;
            },
          },
          actions: {
            render: (_, r) => {
              const isSelected = selectedItems.find((it) => it.id === r.id) !== undefined;
              return (
                <Switch
                  key={r.id}
                  checked={isSelected}
                  onClick={() => {
                    if (selectedItems.find((it) => it.id === r.id) === undefined) {
                      const copyArray = selectedItems.copyWithin(-1, -1);
                      copyArray.push(r);
                      setSelectedItems(copyArray);
                    } else {
                      const copyArray = selectedItems.filter((it) => it.id !== r.id);
                      setSelectedItems(copyArray);
                    }
                    actionRef.current?.reload();
                  }}
                />
              );
            },
          },
        }}
      />
    </ModalForm>
  );
};
