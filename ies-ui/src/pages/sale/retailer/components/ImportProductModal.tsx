import type { ProductItemDto } from '@/services/sale/data';
import { ModalForm, ProList } from '@ant-design/pro-components';
import { Switch } from 'antd';

import { useState } from 'react';

interface Props {
  dataSource: ProductItemDto[];

  isVisible: boolean;
  actionHandler: {
    onCancel: () => void;
    onOk: (item?: ProductItemDto) => void;
  };
}

export default ({ isVisible, dataSource, actionHandler }: Props) => {
  const [selectedItem, setSelectedItem] = useState<ProductItemDto>();

  //   useEffect(() => {
  //     setDataSourceList(dataSource);
  //   }, []);

  return (
    <ModalForm
      title={'Select Product Item'}
      open={isVisible}
      modalProps={{
        destroyOnClose: true,
      }}
      submitter={{
        resetButtonProps: {
          onClick: actionHandler.onCancel,
        },
        submitButtonProps: {
          onClick: () => {
            actionHandler.onOk(selectedItem);
          },
        },
      }}
    >
      <ProList<ProductItemDto>
        // headerTitle="IES Product"
        dataSource={dataSource}
        options={{
          setting: false,
          reload: false,
          fullScreen: false,
          density: false,
          search: false,
        }}
        metas={{
          title: {
            render: (_, r) => {
              return r.name;
            },
          },
          subTitle: {
            render: (_, r) => {
              return r.code;
            },
          },
          actions: {
            render: (_, r) => {
              const isSelected = selectedItem?.id === r.id;
              return (
                <Switch
                  key={r.id}
                  checked={isSelected}
                  onClick={() => {
                    setSelectedItem(r);
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
