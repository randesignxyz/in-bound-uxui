import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import PageWrapper from '@/components/PageWrapper';
import { simpleRequestActions } from '@/services/model';
import { LeadDetail, SalesTeamWorkLess } from '@/services/sale/data';
import { ExportOutlined, PlusOutlined, SwapOutlined } from '@ant-design/icons';
import { useAccess, useQuery } from '@umijs/max';
import { Button, message, Modal, Tag } from 'antd';
import { useEffect, useState } from 'react';
import DSDLeadReport from '../reports/DSDLeadReport';
import { DSDReportAPI } from '../reports/service';
import ChangeSalepersonForm from './ChangeSalepersonForm';
import { LeadAdvanceSearchParams } from './data';
import LeadDetailView from './LeadDetailView';
import LeadEntryFormView from './LeadEntryFormView';
import { LeadServiceAPI } from './services';

interface Props {}

const LeadMainPage: React.FC<Props> = () => {
  const requestActions = simpleRequestActions();
  const services = LeadServiceAPI(requestActions);
  const saleServices = DSDReportAPI(requestActions);
  const [salesperson, setSalesperson] = useState<SalesTeamWorkLess[]>([]);

  useEffect(() => {
    (async () => {
      const salesTeam = await saleServices.salespersonList();
      setSalesperson(salesTeam.filter((it) => it.isApprover === false));
    })();
  }, []);

  const access = useAccess();
  const [filter, setFilter] = useState<TableViewSearchParams<LeadAdvanceSearchParams>>({
    criteria: { advanceSearch: { status: 'ALL' } },
  });
  const { data, isFetching, refetch } = useQuery(
    ['fetch-lead-list', filter],
    () => services.listLead(filter),
    {
      refetchOnWindowFocus: false,
    },
  );
  const [changeSalepersonState, setChangeSalepersonState] = useState<{
    visible?: {
      name: 'MODAL';
      payloads?: any;
    };
  }>();
  const [exportModalState, setExportModalState] = useState<{
    visible?: {
      name: 'MODAL';
      payloads?: any;
    };
  }>();
  return (
    <>
      <PageWrapper<LeadDetail, LeadAdvanceSearchParams, {}>
        tabRender={(items) => [
          {
            tabLabel: 'Add New',
            action: 'add',
            panel: ({ onUpdateTab, key }) => (
              <LeadEntryFormView
                type="new"
                title="Add Lead Entry"
                id={items?.id}
                onView={(id?: number) => {
                  onUpdateTab('view', id, undefined, key);
                  refetch();
                }}
                onBack={() => onUpdateTab('add', undefined, undefined, key)}
              />
            ),
          },
          {
            tabLabel: `${
              items?.internalName
                ? items?.internalName
                : [items?.firstName, items?.lastName].join(' ')
            }`,
            action: 'edit',
            panel: ({ onUpdateTab, key }) => (
              <LeadEntryFormView
                type="edit"
                title="Edit Lead Entry"
                id={items?.id}
                onView={(r) => {
                  onUpdateTab('view', items, undefined, key);
                  refetch();
                }}
                onBack={() => onUpdateTab('add', undefined, undefined, key)}
              />
            ),
          },
          {
            tabLabel: `${
              items?.internalName
                ? items?.internalName
                : [items?.firstName, items?.lastName].join(' ')
            }`,
            action: 'view',
            panel: ({ onUpdateTab, key }) => (
              <LeadDetailView
                onEdit={(items) => onUpdateTab('edit', items, undefined, key)}
                id={items?.id}
              />
            ),
          },
        ]}
        listView={{
          type: 'Table',
          title: 'Lead List',
          actionButtons: [
            {
              icon: <PlusOutlined />,
              type: 'link',
              addNewTab: true,
            },
            <Button
              key={'TransferLead'}
              disabled={!access.canAccessDSD}
              icon={<SwapOutlined />}
              type="link"
              onClick={() => setChangeSalepersonState({ visible: { name: 'MODAL' } })}
            >
              Tranfer Lead
            </Button>,
            <Button
              key={'ExportLead'}
              icon={<ExportOutlined />}
              type="link"
              onClick={() => setExportModalState({ visible: { name: 'MODAL' } })}
            >
              Export
            </Button>,
          ],
          onRefresh: refetch,
          onFilter: (param, page, sort) => {
            setFilter((o) => ({
              criteria: {
                ...o,
                searchValue: param?.searchValue,
                sort: sort,
              },
              pagination: page,
            }));
          },
          props: {
            dataSource: data?.items,
            loading: isFetching,
            pagination: {
              total: data?.total,
            },
            columns: [
              {
                title: 'Code',
                actionProps: (items) => ({
                  label: `${items.leadCode ? items.leadCode : 'N/A'}`,
                  type: 'view',
                }),
                width: 100,
              },
              {
                title: 'Shop Name',
                dataIndex: 'internalName',
                render: (_, r) =>
                  `${
                    r.internalName
                      ? r.internalName
                      : [r.firstName, r.lastName].filter((p) => p).join(' ')
                  }`,
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
                  return [r.salesperson?.salespersonCode, r.salesperson?.salespersonName]
                    .filter((p) => p)
                    .join(' - ');
                  // return `${r.salesperson?.salespersonCode} - ${r.salesperson?.salespersonName}`;
                },
              },
              {
                title: 'Outlet Type',
                render: (_, r) => {
                  return <Tag color="processing">{r.outletType?.name}</Tag>;
                },
              },
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
            ],
          },
        }}
      />

      <DSDLeadReport
        open={exportModalState?.visible?.name === 'MODAL'}
        onCancel={() => setExportModalState({ visible: undefined })}
        salespersons={salesperson}
        title="Generate DSD Reports"
        width="700px"
      />

      <ChangeSalepersonForm
        open={changeSalepersonState?.visible?.name === 'MODAL'}
        onCancel={() => setChangeSalepersonState({ visible: undefined })}
        onSave={(data) => {
          Modal.confirm({
            title: `Update customers to other salesperson`,
            content: 'are you sure?',
            onOk: async () => {
              services
                .updateCustomerOwner(data)
                .then(() => {
                  message.success('Sucess!');
                  setChangeSalepersonState({
                    visible: undefined,
                  });
                  refetch();
                })
                .catch((error) => message.error(error.message));
            },
          });
        }}
      />
    </>
  );
};

export default LeadMainPage;
