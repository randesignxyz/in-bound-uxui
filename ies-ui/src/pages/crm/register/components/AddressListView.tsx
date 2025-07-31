import { LocationType } from '@/services/crm/services';
import { AddressData, AddresssView, Locations } from '@/services/crm/data';
import { LookupData } from '@/services/data';
import { AimOutlined, DeleteOutlined, EditOutlined, MinusCircleOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, List, Row, Space, Tag } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import AddressModalEntry from './AddressModalEntry';
import styles from './style.less';

const DEFAULT_ADDRESS_TYPE_ID = 14033;

export interface AddressListViewProps {
  addressReadonly?: boolean;
  data: {
    list: AddresssView[];
    init: {
      // lookupDataList?: LookupData[];
      provinceList?: Locations[];
    };
    locations: {
      districtList?: Locations[];
      communeList?: Locations[];
      villageList?: Locations[];
    };
  };
  actionHandlers: {
    loadData: () => Promise<AddresssView[]>;
    onAdd: (address: AddresssView, cb?: (sucess: boolean) => void) => void;
    onEdit: (address: AddresssView, cb?: (sucess: boolean) => void) => void;
    onRemove?: (address: AddresssView) => void;
    onLoadLocations?: (type: LocationType, parentId?: number) => void;
    onLoadMultiLocations?: (ids: number[]) => void;
    onCleaLocation?: (types: LocationType[]) => void;
  };
}

export interface AddressDataForm extends AddressData {
  weekOfTheMonths?: number[];
  dayOfTheWeek?: number;
}

const AddressListView: React.FC<AddressListViewProps> = ({
  addressReadonly,
  data,
  actionHandlers,
}) => {
  const [form] = useForm<AddressDataForm>();
  const [modal, setModal] = useState<{ visible: boolean; data?: AddressDataForm }>({
    visible: false,
  });
  const { list } = data
  useEffect(() => {
    if (modal.visible) {
      actionHandlers.onLoadMultiLocations?.([
        modal.data?.provinceId || -1,
        modal.data?.districtId || -1,
        modal.data?.communeId || -1,
      ]);
      // modal.data?.address='Hello'
      form.setFieldsValue({ ...modal.data,address:'Hello' });
    }
    return () => {
      form.resetFields();
    };
  }, [modal.visible]);

  useEffect(() => {
    actionHandlers.loadData?.();
  }, []);

  const onEdit = (item: AddresssView) => {
    setModal({
      visible: true,
      data: {
        id: item.id,
        key: item.key || item.id?.toString(),
        address: item.address,
        // typeId: item.type?.id,
        houseNo: item.houseNo,
        streetNo: item.streetNo,
        streetName: item.streetName,
        houseNoKh: item.houseNoKh,
        streetNoKh: item.streetNoKh,
        streetNameKh: item.streetNameKh,
        latitude: item.latitude,
        longitude: item.longitude,
        provinceId: item.province?.id || 0,
        districtId: item.district?.id || 0,
        communeId: item.commune?.id || 0,
        villageId: item.village?.id || 0,
        hotspot: item.hotspot,
        direction: item.direction,
      },
    });
  };

  return (
    // <div className={styles.standardList}>
    <div>
      <List<AddresssView>
        size="small"
        locale={{ emptyText: 'No Address added' }}
        dataSource={list}
        itemLayout="horizontal"
        rowKey="key"
        renderItem={(item,index) => (
          <List.Item
            extra={[
              !addressReadonly && (
                <Button key="b1" onClick={() => onEdit(item)} type="link" icon={<EditOutlined />} />
              ),
              !addressReadonly && //item.type?.id !== DEFAULT_ADDRESS_TYPE_ID && 
              (
                <Button
                  key="b2"
                  onClick={() => actionHandlers.onRemove?.(item)}
                  type="link"
                  icon={<MinusCircleOutlined />}
                />
              ),
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  {' '}
                  <AimOutlined /> {index+'-'+item.address} {/*<Tag>{item.type?.name}</Tag>{' '}*/}
                </Space>
              }
              description={
                <div>
                  <Row>
                    <Col>
                      {[
                        { name: 'Street Name', value: item?.streetName },
                        { name: 'Street No', value: item?.streetNo },
                        { name: 'House', value: item?.houseNo },
                        { name: 'Village', value: item?.village?.name },
                        { name: 'Commune', value: item?.commune?.name },
                        { name: 'District', value: item?.district?.name },
                        { name: 'Province', value: item?.province?.name },
                      ]
                        .filter((it) => it.value)
                        .map((it) => `${it.name} ${it.value}`)
                        .join(', ')}
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      {' '}
                      Hotspot: {item.hotspot || 'N/A'}, Direction: {item.direction || 'N/A'}{' '}
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      {' '}
                      Latitute: {item.latitude || 'N/A'}, Longitude: {item.longitude || 'N/A'}
                    </Col>
                  </Row>
                </div>
              }
            />

            {/* {(item.visitPlanOptionList || []).length > 0 && <ListContent item={item} />} */}
          </List.Item>
        )}
      />
      {!addressReadonly && (
        <Button
          size="small"
          style={{ width: '100%', marginBottom: 8 }}
          type="dashed"
          onClick={() => setModal({ visible: true })}
          icon={<PlusOutlined />}
        />
      )}

      <AddressModalEntry
        title="Address"
        open={modal.visible}
        addressReadonly={addressReadonly}
        onCancel={() => setModal({ visible: false })}
        data={modal.data}
        initData={{
          // lookupDataList: data.init.lookupDataList?.filter(
          //   (it) =>
          //     it.type !== 'ADDRESS_TYPE' ||
          //     !list?.some((i) => i.type?.id == 14033) ||
          //     it.id !== 14033,
          // ),
          provinceList: data.init.provinceList,
        }}
        locations={data.locations}
        actionHandlers={{
          onAdd: (data) =>
            actionHandlers.onAdd(data, (success) => {
              if (success) {
                // actionHandlers.loadData?.();
                setModal({ visible: false });
              }
            }),
          onEdit: (data) =>
            actionHandlers.onEdit(data, (success) => {
              if (success) {
                // actionHandlers.loadData?.();
                setModal({ visible: false });
              }
            }),
          onLoadLocations: actionHandlers.onLoadLocations,
          onLoadMultiLocations: actionHandlers.onLoadMultiLocations,
          onCleaLocation: actionHandlers.onCleaLocation,
        }}
      />
    </div>
  );
};

export default AddressListView;
