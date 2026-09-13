import { CrudBaseServices } from '@/services/CrudBaseSevices';
import {
  ActionType,
  PageContainer,
  PageContainerProps,
  ProCard,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import { Button, Input, message, Radio, RadioGroupProps, Space } from 'antd';
import { SortOrder } from 'antd/lib/table/interface';
import { useEffect, useRef, useState } from 'react';
import { Action } from '../core/comp';

/**
 * A: Item list type
 *
 * B: Detail date Type
 */

interface Props<
  A extends { id: number },
  B extends { id: number },
  S extends { keyword?: string; status?: string },
  V extends { id?: number },
> {
  services: CrudBaseServices<A, B, S, V>;
  listView: {
    bordered?: boolean;
    extra?: React.ReactNode;
    columns: () => ProColumns<A>[];
    quickSearch?: true;
    addNewAction?: Action<any>;
    forceReload?: number;
    statusProps?: RadioGroupProps | false;
    subStatusProps?: (
      status?: string,
      setCriteria?: (crieria?: S) => void,
    ) => RadioGroupProps | undefined;
    onBeforeSearch?: (criteria: S) => S;
  };
  actions?: Action<any>[];
  detailView?: {};
  title: string;
}

type ViewType = 'list' | 'create' | 'detail' | 'edit' | undefined;

export default <
  A extends { id: number },
  B extends { id: number },
  S extends { keyword?: string; status?: string },
  V extends { id?: number },
>({
  listView: {
    bordered,
    extra,
    columns,
    forceReload,
    quickSearch,
    addNewAction,
    statusProps,
    subStatusProps,
    onBeforeSearch,
  },
  services,
  ...rest
}: Props<A, B, S, V> & PageContainerProps) => {
  const params = useParams();
  const view: ViewType = (params['view'] as ViewType) || undefined;
  //const id = params['*']
  const actionRef = useRef<ActionType>();
  const [actionState, setActionState] = useState<{ type: any; cb?: () => void }>();
  const [criteria, setCriteria] = useState<{ keyword?: string; status?: string }>({});

  const onRequestHandler = async (
    params: S & {
      pageSize?: number;
      current?: number;
    },

    sort: Record<string, SortOrder>,
    filter: Record<string, React.Key[] | null>,
  ) => {
    try {
      const rs = await services.fetchPaging({
        keywords: criteria.keyword,
        criteria: (onBeforeSearch?.(criteria as S) || criteria) as S,
        sort: sort,
        pagination: {
          pageSize: params.pageSize,
          current: params.current,
        },
      });
      return {
        data: rs.items,
        success: true,
        total: rs.total,
      };
    } catch (error: any) {
      message.error(error.message || 'Failed to fetch data.');
      return {
        success: false,
      };
    }
  };

  const statusOptions =
    statusProps == undefined
      ? {
        defaultValue: 'ALL',
        options: [
          { label: 'All', value: 'ALL' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'Rejected', value: 'REJECTED' },
        ],
      }
      : statusProps != false
        ? statusProps
        : undefined;

  useEffect(() => {
    if (forceReload && forceReload > 1) {
      actionRef.current?.reloadAndRest?.()
    }
  }, [forceReload])
  return (
    <PageContainer onBack={() => history.back()} {...rest}>
      {view == 'list' && (
        <ProTable<A, S>
          columns={columns()}
          search={false}
          rowKey={'id'}
          bordered={bordered}
          actionRef={actionRef}
          size="small"
          tableExtraRender={() => (
            <ProCard bordered extra>
              <ProCard>
                <Space>
                  {quickSearch && (
                    <Input.Search
                      onSearch={(value) => {
                        setCriteria((v) => ({ ...v, keyword: value }));
                        actionRef.current?.reloadAndRest?.();
                      }}
                      style={{ width: 300 }}
                    />
                  )}
                  {statusOptions && (
                    <Space>
                      <Radio.Group
                        optionType="button"
                        onChange={(v) => {
                          setCriteria((c) => ({ ...c, status: v.target.value }));
                          actionRef.current?.reloadAndRest?.();
                        }}
                        {...statusOptions}
                      />

                      {subStatusProps && (
                        <Radio.Group
                          optionType="button"
                          {...subStatusProps?.(criteria.status, (v) => {
                            setCriteria((c) => ({ ...c, ...v }));
                            actionRef.current?.reloadAndRest?.();
                          })}
                        />
                      )}
                    </Space>
                  )}
                </Space>
              </ProCard>
              {extra && (
                <ProCard style={{ alignItems: 'end' }} colSpan={'200px'}>
                  {extra}
                </ProCard>
              )}
            </ProCard>
          )}
          toolBarRender={() => {
            return [
              addNewAction?.onAddNew && (
                <Button
                  type="link"
                  onClick={() => addNewAction?.onAddNew?.()}
                  icon={addNewAction.icon}
                >
                  {' '}
                  {addNewAction.label}{' '}
                </Button>
              ),

              addNewAction?.onRenderComp && (
                <Button
                  type="link"
                  onClick={() =>
                    setActionState({
                      type: addNewAction.key,
                      cb: () => {
                        actionRef.current?.reloadAndRest?.();
                      },
                    })
                  }
                  icon={addNewAction.icon}
                >
                  {' '}
                  {addNewAction.label}{' '}
                </Button>
              ),
            ];
          }}
          showHeader
          options={{
            search: false,
            density: false,
            fullScreen: false,
            setting: false
          }}
          request={onRequestHandler}
        />
      )}
      {actionState?.type == addNewAction?.key &&
        addNewAction?.onRenderComp &&
        addNewAction?.onRenderComp({
          visisble: true,
          onClose() {
            setActionState(undefined);
          },
          cb: () => {
            actionRef.current?.reloadAndRest?.();
          },
          formKey: '',
        })}
    </PageContainer>
  );
};
