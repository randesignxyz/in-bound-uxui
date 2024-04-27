import { useAccess, useModel } from 'umi';
import TableView, { TableViewProps } from '@/components/DataCrud/TableView';
import { CustomerAdvanceSearchParams, CustomerItemLess } from '@/services/crm/data';
import { useEffect, useRef, useState } from 'react';
import { model } from '../../model';
import { Paging } from '@/services/API';
import { Button, Dropdown, message, Radio, Space, Spin, Tag, Tooltip } from 'antd';
import { ActionType } from '@ant-design/pro-table';
import { SortOrder } from 'antd/lib/table/interface';
import AdvanceSearch from './AdvanceSearch';
import Omit from 'omit.js';
import { CloudDownloadOutlined, DashOutlined, DownOutlined, SelectOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { CrmPaths } from '@/pages/crm';
import { history } from "@umijs/max";
import ExportCustomer from './ExportCustomer';
import ImportFileButton from '@/components/ImportFileButton';
import TransferSE from './TransferSE';
import { CustomerActionController } from '../..';
import { ImportDataItem, ImportDataResponse } from '@/services/shared/data';
import UploadData from '../UploadData';
import Status from '@/components/Status';

export const CustomerListView: React.FC<TableViewProps<CustomerItemLess> & { actl: CustomerActionController }> = ({
  actionHandlers, actl
}) => {
  const { state, ops, modals } = model();
  const cacheList = useModel('dataList');
  const [advanceSearchParams, setAdvanceSearchParams] = useState<CustomerAdvanceSearchParams>({
    status: 'Y',
  });
  const actionRef = useRef<ActionType>();
  const [loading, setLoading] = useState(false);
  const access = useAccess();

  const [importData, setImportData] = useState<ImportDataResponse>()

  const onRequestHandler = (
    criteria?: { searchValue?: string; advanceSearch?: CustomerAdvanceSearchParams },

    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return ops
      .list?.(criteria || { advanceSearch: advanceSearchParams }, pagination, sort)
      .then((it) => {
        return cacheList.cacheDataList({
          type: 'customer',
          criteria: criteria?.advanceSearch || advanceSearchParams,
          data: it,
        });
      }) as Promise<Paging<CustomerItemLess>>;
  };

  useEffect(() => {
    ops.initData('List');
  }, []);

  const onExportCustomerHandler = () => {
    modals.showModal('export-customer');
  };

  return (
    <Spin spinning={loading}>
      <TableView<
        CustomerItemLess,
        { searchValue?: string; advanceSearch?: CustomerAdvanceSearchParams }
      >
        cache
        advanceSearch
        displayOnly
        hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
        tableProps={{
          actionRef: actionRef,
          toolbar: {
            actions: [
              access.crmAdmin && (
                <ImportFileButton<ImportDataItem>
                  importedKey="INDIRECT_CUSTOMER"
                  onDataResponse={data => {
                    setImportData(data)
                  }}
                  onHandleChange={(status) => {
                    setLoading(status == 'uploading');
                    if (status == 'done') {
                      message.info('Data uploaded.');
                    }
                  }}
                />
              ),
              <Tooltip placement="top" title="Export">
                <Button
                  type="link"
                  onClick={onExportCustomerHandler}
                  icon={<CloudDownloadOutlined />}
                >
                  Export
                </Button>
              </Tooltip>,
              access.saleAdmin && (<Tooltip placement="top" title="Transfer SEs">
                <Button
                  type="link"
                  onClick={() => modals.showModal('transfer-customers')}
                  icon={<UserSwitchOutlined />}
                >
                  Transfer SE
                </Button>
              </Tooltip>)
            ],
          },
        }}
        extraFilter={
          <Radio.Group
            value={advanceSearchParams.status || 'Y'}
            onChange={(e) => {
              setAdvanceSearchParams((v) => ({
                ...v,
                status: e.target.value,
              }));

              actionRef.current?.reloadAndRest?.();
            }}
          >
            <Radio.Button value="Y">Active</Radio.Button>
            <Radio.Button value="N">Inactive</Radio.Button>
          </Radio.Group>
        }
        actionHandlers={{
          onAdvanceSearchClicked: () => modals.showModal('advanceSearch'),
          onAdd: actionHandlers?.onAdd,
          onSearchCriteria: (data) => {
            return { searchValue: data, advanceSearch: advanceSearchParams };
          },
          onFirstLoad: () =>
            cacheList.fetchDataList('customer').then((v) => {
              if (v) {
                setAdvanceSearchParams(v.creteria);
                return v.dataList;
              } else return onRequestHandler();
            }) as Promise<Paging<CustomerItemLess>>,
          onRequest: onRequestHandler,
        }}
        columns={[
          {
            title: 'Customer Code',
            dataIndex: 'code',
            width: 130,
            sorter: 'customerCode',
            render: (_, r) => (
              <Space>
                <Button
                  type="link"
                  icon={<SelectOutlined />}
                  onClick={async () => {
                    window.open(`/external/crm/customer/detail/${r.id}`, '_blank')?.focus();
                  }}
                />
                <a onClick={() => history.push(CrmPaths.customer + `/detail/${r.id}`)}>
                  {r.code || 'Not Assigned'}
                </a>
              </Space>
            ),
          },
          {
            title: 'Name',
            dataIndex: 'name',
            sorter: 'customerName',
          },
          {
            title: 'Name (Kh)',
            dataIndex: 'internalName',
            sorter: 'internalName',
          },
          {
            title: 'Type',
            // dataIndex: 'type'
            width: 100,
            render: (_, r) => {
              const color =
                r.type?.name == 'Direct' ? 'processing' : r.type?.name == 'In Direct' ? 'warning' : 'default';
              return <Tag color={color}>{r.type.name}</Tag>;
            },
          },
          {
            title: 'Region',
            dataIndex: 'region',
          },
          {
            title: 'SE',
            dataIndex: 'sale',
          },
          {
            title: 'Outlet Type',
            dataIndex: 'outletType',
          },
          {
            title: 'Status',
            render: (_, r) => <Status text={r.status} />
            // dataIndex: 'status'
          },
          {
            title: 'Source',
            dataIndex: 'source',
          },
          {
            render: (_, r) => <Dropdown menu={{

              items: actl.getMenuItems(r, 'List', () => actionRef.current?.reloadAndRest?.()).filter(it => it.display)

            }}>

              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  <DashOutlined />
                </Space>
              </a>
            </Dropdown>
          }
        ]}
      />
      <AdvanceSearch
        width="400px"
        placement="right"
        // closable
        title="Advance Customer Search"
        open={modals.isVisible('advanceSearch')}
        initData={advanceSearchParams}
        lookupDataList={state.initData?.lookupDataList}
        seList={state.initData?.seList}
        outletTypeList={state.initData?.outletTypeList}
        onClose={() => {
          //setAdvanceSearchParams(undefined)
          modals.hideModal('advanceSearch');
        }}
        onReset={() => {
          setAdvanceSearchParams({ status: 'Y' });
          actionRef.current?.reloadAndRest?.();
        }}
        onSearch={(data) => {
          setAdvanceSearchParams((v) => ({ ...v, ...data }));
          actionRef.current?.reloadAndRest?.();
        }}
      />
      <ExportCustomer
        title="Export Customer"
        open={modals.isVisible('export-customer')}
        onCancel={() => modals.hideModal('export-customer')}
        confirmLoading={state.loading}
        lookupDataList={state.initData?.lookupDataList || []}
        outletTypeList={state.initData?.outletTypeList || []}
        seList={state.initData?.seList || []}
        provinceList={state.initData?.provinceList || []}
        regionList={state.initData?.regionList || []}
        onExport={async (
          regionId,
          provinceId,
          salespersonId,
          customerTypeId,
          outletTypeId,
          source,
          status,
          neverVisit,
          neverVisitDate,
          hasNoPlan,
        ) => {
          try {
            await ops.exportCustomer(
              regionId,
              provinceId,
              salespersonId,
              customerTypeId,
              outletTypeId,
              source,
              status,
              neverVisit,
              neverVisitDate,
              hasNoPlan,
            );
            message.success('Export successfully.');
          } catch (error: any) {
            message.error(error.message || 'Failed to export.');
          }
        }}
      />
      {modals.isVisible('transfer-customers') && <TransferSE
        open={true}
        onOpenChange={(visible) => !visible && modals.hideModal('transfer-customers')} />}

      <UploadData title="Import indirect customer" onCancel={() => setImportData(undefined)} open={!!importData} data={importData} />
    </Spin>
  );
};
