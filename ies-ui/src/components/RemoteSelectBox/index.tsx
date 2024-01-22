import { ServiceType } from '@/services/API';
import { findAllService } from '@/services/apiGateway';
import { simpleRequestActions } from '@/services/model';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Select, Space } from 'antd';
import { debounce } from 'lodash';
import React, { Key, useEffect, useState } from 'react';

interface Props<T, S> {
  service?: ServiceType;
  value?: string;
  width?: string;
  popupMatchSelectWidth?: number;
  searchResultLimit?: number;
  allowClear?: boolean;
  initData?: T[];
  disabled?: boolean;
  transforms?: {
    onOptionData?: (item: T) => {
      key?: Key;
      disabled?: boolean;
      value: Key;
      title?: string;
      className?: string;
      style?: React.CSSProperties;
      label?: React.ReactNode;
    };
    onCriteria?: (value: any) => S;
    onInitCriteria?: () => S;
  };
  onChange?: (value: Key, item?: T) => void;
  onClickMore?: () => void;
  addButton?: boolean;
  mode?: 'multiple' | 'tags';
  placeholder?: string;
  loadDefaultData?: boolean;
}
/**
 * T = Item Search result
 * S = Search criteria
 * @param props
 */
const RemoteSelectBox = <T extends { id: number }, S>(props: Props<T, S>) => {
  const {
    service,
    value,
    disabled,
    width,
    onClickMore,
    searchResultLimit,
    onChange,
    mode,
    placeholder,
    allowClear,
    loadDefaultData,
    addButton,
    popupMatchSelectWidth,
    ...rest
  } = props;

  const [data, setData] = useState<T[]>();
  const requestActions = simpleRequestActions();
  const listData = service && findAllService<S, T>(service, requestActions);
  const [selected, setSelected] = useState<Key>();

  useEffect(() => {
    const params = rest?.transforms?.onInitCriteria?.();
    if (loadDefaultData && params) listData?.(params).then(setData);
  }, []);

  const fetchData = async (value: string) => {
    const params = rest?.transforms?.onCriteria?.(value);
    setData(params && (await listData?.(params)));
  };

  const handleChange = (value: any) => {
    setSelected(value);
    const item = data?.find((it) => it.id.toString() == value);
    onChange?.(value, item);
  };

  return (
    <Space>
      <Select
        disabled={disabled}
        mode={mode}
        showSearch
        filterOption={false}
        value={value}
        allowClear={allowClear}
        placeholder={placeholder}
        loading={requestActions.request?.loading}
        notFoundContent={`Items not found`}
        onSearch={debounce(fetchData, 800)}
        onChange={handleChange}
        style={{ width: width || '500px' }}
        popupMatchSelectWidth={popupMatchSelectWidth}
        options={(data || props.initData || []).map((item) =>
          rest?.transforms?.onOptionData
            ? rest?.transforms?.onOptionData(item)
            : { label: item['name'] || '', value: item['id'] || '' },
        )}
        dropdownRender={(menu) => {
          return <div>{menu}</div>;
        }}
      />
      {addButton && (
        <Button
          disabled={!selected}
          onClick={() => selected && onChange?.(selected)}
          type="link"
          icon={<PlusOutlined />}
        />
      )}
    </Space>
  );
};

export default RemoteSelectBox;
