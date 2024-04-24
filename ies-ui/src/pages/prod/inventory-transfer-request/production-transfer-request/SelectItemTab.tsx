import { ModalForm, ModalFormProps } from '@ant-design/pro-components';
import { Tabs } from 'antd';
import { Item } from '../data';
import BOMItemList from './BOMItemList';
import SearchItemList from './SearchItemList';

interface Props extends ModalFormProps {
  onAdd?: (data: Item[]) => void;
  add?: number[];
  tenden: string;
  qty?: (newQuantity: string) => void;
}

export default ({ onAdd, add, tenden, qty, ...rest }: Props) => {
  return (
    <ModalForm {...rest} submitter={false}>
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            label: 'Select Item',
            key: '1',
            children: (
              <SearchItemList
                addedItems={add}
                tendency={tenden}
                // add={items?.map((it) => it.id)}
                // onAddItem={(item: Item) => {
                //   onAdd?.(item)
                // }}
                onAddItem={(itemList: Item | Item[]) => {
                  const itemsArray = Array.isArray(itemList) ? itemList : [itemList];
                  onAdd?.(itemsArray);
                }}
              />
            ),
          },
          {
            label: 'BOM',
            key: '2',
            children: (
              <BOMItemList
                // onAddItem={(item: Item[])=>onAdd?.(item)}
                onAddItem={(itemList: Item | Item[]) => {
                  const itemsArray = Array.isArray(itemList) ? itemList : [itemList];
                  onAdd?.(itemsArray);
                }}
                tendency={tenden}
                updateQuantity={(e) => qty?.(e)}
              />
            ),
          },
        ]}
      />
    </ModalForm>
  );
};
