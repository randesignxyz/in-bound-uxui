import type { Paging } from '@/services/API';
import { FilterOutlined, PlusOutlined, SelectOutlined } from '@ant-design/icons';
import { ProCard, ProCardProps } from '@ant-design/pro-components';
import type { ActionType, ListToolBarProps, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { OptionConfig } from '@ant-design/pro-table/lib/components/ToolBar';
import { Button, Input, Space } from 'antd';
import type { SortOrder } from 'antd/lib/table/interface';
import type { MutableRefObject } from 'react';
import React, { useEffect, useRef, useState } from 'react';

export type FetchPagingParams<T extends { keyword?: string }> = {
  keywords?: string;
  criteria?: T;
  sort?: Record<string, SortOrder>;
  pagination?: {
    pageSize?: number;
    current?: number;
  };
};

export interface TableViewSearchParams<T> {
  criteria?: { searchValue?: string; advanceSearch?: T; sort?: Record<string, SortOrder> };
  pagination?: {
    pageSize?: number;
    current?: number;
  };
}

export interface TableViewProps<T extends { id?: number }> {
  forceUpdate?: number;
  actionHandlers?: {
    onAdd?: () => void;
    onDetail?: (data: T) => void;
  };
}

interface Props<T extends { id: number }, C> {
  columns: ProColumns<T>[];
  rowKey?: string;
  bordered?: boolean;
  // title?: string;
  addButtonLabel?: string;
  displayOnly?: boolean;
  disableSearch?: true;
  advanceSearch?: true;
  hasCriteria?: boolean;
  extraFilter?: React.ReactNode;
  extraRightFilter?: React.ReactNode;
  forceUpdate?: number;
  pagination?: false | undefined;
  cache?: true;
  cardProps?: ProCardProps | false
  tableProps?: {
    actionRef?: MutableRefObject<ActionType | undefined>;
    options?: OptionConfig;
    toolbar?: ListToolBarProps;
  };
  actionHandlers?: {
    onAdvanceSearchClicked?: () => void;
    onSearchCriteria?: (searchValue?: string) => C;
    onAdd?: () => void;
    onFirstLoad?: (
      criteria: C,
      pagination: {
        pageSize?: number;
        current?: number;
      },
    ) => Promise<Paging<T>>;
    onRequest?: (
      criteria: C,
      pagination: {
        pageSize?: number;
        current?: number;
      },
      sort?: Record<string, SortOrder>,
    ) => Promise<Paging<T>>;
  };
  expandable?: any;
}

export const colLink =
  <T extends { id?: any }>(onDetail?: (data: T) => void, displayData?: (data: T) => any) =>
  (dom: React.ReactNode, data: T) => {
    return <a onClick={() => onDetail?.(data)}>{displayData?.(data) || dom} </a>;
  };

const TableView = <T extends { id: any }, C extends { searchValue?: string }>(
  props: Props<T, C>,
) => {
  const {
    bordered,
    columns,
    // title,
    addButtonLabel,
    displayOnly,
    cache,
    disableSearch,
    pagination,
    actionHandlers,
    forceUpdate,
    extraFilter,
    extraRightFilter,
    expandable,
  } = props;

  const innerActionRef = props.tableProps?.actionRef || useRef<ActionType>();
  const [searchValue, setSearchValue] = useState<string>();
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (forceUpdate) {
      innerActionRef.current?.reloadAndRest?.();
    }
  }, [forceUpdate]);

  const onSearchHandler = (value: string) => {
    setSearchValue(value);
    innerActionRef.current?.reloadAndRest?.();
  };

  const onRequestHandler = async (
    params: {
      pageSize?: number;
      current?: number;
      keyword?: string;
    },
    sort: Record<string, SortOrder>,
  ) => {
    const searchParams =
      actionHandlers?.onSearchCriteria?.(searchValue) || ({ searchValue: searchValue } as C);
    const data =
      !loaded && cache
        ? await actionHandlers?.onFirstLoad?.(searchParams, params)
        : await actionHandlers?.onRequest?.(searchParams, params, sort);

    setLoaded(true);
    return {
      success: !!data,
      total: data?.total,
      data: data?.items.map((it: T) => it).filter((it: any) => !!it),
    };
  };
  return (
    <ProTable<T>
      actionRef={innerActionRef}
      columns={columns}
      bordered
      rowKey={props.rowKey || 'id'}
      tableExtraRender={() =>
        disableSearch ?? (
          <ProCard bordered>
            <div style={{float:'left'}}>
              <Space>
                <Input.Search allowClear onSearch={onSearchHandler} />

                {props.advanceSearch && (
                  <Button
                    onClick={actionHandlers?.onAdvanceSearchClicked}
                    icon={
                      props.hasCriteria ? (
                        <FilterOutlined style={{ color: 'red' }} />
                      ) : (
                        <SelectOutlined />
                      )
                    }
                  />
                )}
                {extraFilter}
              </Space>
            </div>
            <div style={{float:'right'}}> {extraRightFilter}</div>
          </ProCard>
        )
      }
      cardProps={props.cardProps}
      options={
        props.tableProps?.options || {
          density: false,
          setting: false,
        }
      }
      size="small"
      toolbar={
        props.tableProps?.toolbar ||
        (displayOnly
          ? undefined
          : {
              actions: [
                <Button
                  key={'bt'}
                  type="link"
                  onClick={() => actionHandlers?.onAdd?.()}
                  icon={<PlusOutlined />}
                >
                  {addButtonLabel}
                </Button>,
              ],
            })
      }
      search={false}
      request={onRequestHandler}
      pagination={pagination}
      expandable={expandable}
    />
  );
};

export default TableView;
