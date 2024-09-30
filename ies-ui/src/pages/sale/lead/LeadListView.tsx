import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import type { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import type { LeadDetail, SalesTeamWorkLess } from '@/services/sale/data';
import { DownloadOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, Input, Space, Tag, Tooltip } from 'antd';
import type { SortOrder } from 'antd/lib/table/interface';
import { useEffect, useRef, useState } from 'react';
import { ReportName } from '../reports';
import DSDLeadReport from '../reports/DSDLeadReport';
import { DSDReportAPI } from '../reports/service';
import type { LeadAdvanceSearchParams } from './data';
import { LeadServiceAPI } from './services';

interface Props {
  // onAdd?: () => void;
  onDetail?: (id?: number) => void;
  onEdit?: (id: string) => void;
}

export default ({ onDetail }: Props) => {
  const requestActions = simpleRequestActions();
  const services = LeadServiceAPI(requestActions);
  const dsdService = DSDReportAPI(requestActions);
  const cacheList = useModel('dataList');
  const innerActionRef = useRef<ActionType>();
  const [report, setReport] = useState<ReportName>();

  const [salespersons, setSalespersons] = useState<SalesTeamWorkLess[]>([]);
  // const [advanceSearchParams, setAdvanceSearchParams] = useState<LeadAdvanceSearchParams>({
  //   status: 'ALL',
  // });

  const onSearchCriteria = (value: string | undefined) => {
    return { searchValue: value };
  };

  const onRequestHandler = async (params: TableViewSearchParams<LeadAdvanceSearchParams>) => {
    return services.listLead?.(params).then((it) => {
      return cacheList.cacheDataList({
        type: 'lead-ld',
        criteria: params,
        data: it,
      });
    }) as Promise<Paging<LeadDetail>>;
  };

  useEffect(() => {
    (async () => {
      const salesTeam = await dsdService.salespersonList();
      setSalespersons(salesTeam.filter((it: { isApprover: boolean }) => it.isApprover === false));
    })();
  }, []);

  // const onSearchHandler = async (value: string) => {
  //   setSearchValue(value);
  //   console.log('value ' + value);
  //   await innerActionRef.current?.reloadAndRest?.();
  // };

  return (
    <>
      <ProTable<LeadDetail, { searchValue?: string }>
        actionRef={innerActionRef}
        key={'saleInvoice'}
        rowKey={'id'}
        toolBarRender={() => [
          <Tooltip key="export_lead" placement="top" title="Export Customer">
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={() => setReport('dsd-lead-report')}
            />
          </Tooltip>,
        ]}
        // headerTitle={
        //   <Space size="large">
        //     <Input.Search allowClear />
        //     <Radio.Group
        //       value={advanceSearchParams.status}
        //       onChange={(e) => {
        //         setAdvanceSearchParams((v) => ({
        //           ...v,
        //           status: e.target.value,
        //         }));

        //         innerActionRef.current?.reloadAndRest?.();
        //       }}
        //     >
        //       <Radio.Button value="ALL">All</Radio.Button>
        //       <Badge size="small" offset={[-20, 0]} count={0}>
        //         <Radio.Button value="active">Active</Radio.Button>
        //       </Badge>
        //       <Badge size="small" offset={[-20, 0]} count={0}>
        //         <Radio.Button value="inactive">Inactive</Radio.Button>
        //       </Badge>
        //     </Radio.Group>
        //   </Space>
        // }
        options={{
          density: false,
          setting: false,
          reload: true,
          // search: false,
          search: true ?? (
            <Space size={[1, 'small']}>
              <Input.Search allowClear />
            </Space>
          ),
        }}
        search={false}
        request={async (
          params: {
            pageSize?: number;
            current?: number;
            keyword?: string;
          },
          sort: Record<string, SortOrder>,
        ) => {
          const searchParams = onSearchCriteria(params.keyword);
          const data = await onRequestHandler({
            criteria: {
              ...searchParams,
              // advanceSearch: advanceSearchParams,
              sort,
            },
            pagination: {
              current: params.current,
              pageSize: params.pageSize,
            },
          });

          return {
            success: !!data,
            total: data?.total,
            data: data?.items.map((it: LeadDetail) => it).filter((it: any) => !!it),
          };
        }}
        columns={[
          {
            title: 'Shop Name',
            // dataIndex: 'internalName',
            render: (_, r) => {
              return (
                <Button type="link" onClick={() => onDetail?.(r.id)}>
                  {r.internalName
                    ? r.internalName
                    : `${r.firstName} ${r.lastName ? r.lastName : ''}`}
                </Button>
              );
            },
          },
          {
            title: 'First Name',
            dataIndex: 'firstName',
          },
          {
            title: 'Last Name',
            dataIndex: 'lastName',
          },
          {
            title: 'Phone Number',
            dataIndex: 'phone',
          },
          {
            title: 'Salesperson',
            render: (_, r) => {
              return `${r.salesperson?.salespersonCode} - ${r.salesperson?.salespersonName}`;
            },
          },
          {
            title: 'Outlet Type',
            render: (_, r) => {
              return <Tag color="processing">{r.outletType?.name}</Tag>;
            },
          },
          //   {
          //     title: 'Phone Number 2',
          //     dataIndex: 'phone2',
          //   },
          // {
          //   title: 'House No',
          //   dataIndex: 'houseNo',
          // },
          // {
          //   title: 'Street Name',
          //   dataIndex: 'streetName',
          // },
          // {
          //   title: 'Street No',
          //   dataIndex: 'streetNo',
          // },
          // {
          //   title: 'Region',
          //   render: (_, r) => {
          //     return r.region?.name;
          //   },
          // },
          {
            title: 'Province',
            render: (_, r) => {
              return r.province?.name;
            },
          },

          {
            title: 'District',
            render: (_, r) => {
              return r.district?.name;
            },
          },
          {
            title: 'Commune',
            render: (_, r) => {
              return r.commune?.name;
            },
          },
          {
            title: 'Village',
            render: (_, r) => {
              return r.village?.name;
            },
          },
        ]}
      />
      <DSDLeadReport
        salespersons={salespersons}
        title="Lead Report"
        width="700px"
        open={report === 'dsd-lead-report'}
        onCancel={() => setReport(undefined)}
      />
    </>
  );
};
