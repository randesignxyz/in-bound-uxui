import { ActionType } from "@ant-design/pro-components";
import { useAccess, useQuery } from '@umijs/max';
import { Button, Flex } from 'antd';
import { useMemo, useRef, useState } from 'react';
import PageWrapper from "@/components/PageWrapper";
import Status from '@/components/Status';
import { simpleRequestActions } from "@/services/model";
import { ExportOutlined, FilterOutlined, PlusOutlined, SelectOutlined } from '@ant-design/icons';
import { formatDateTime, toReadable } from "@/pages/utils";
import Export from "./Export";
import FMANewStaffRequestForm from "./FMANewStaffRequestForm";
import { FMANewStaffFormNames, NewStaffListItem, SearchParams } from "./data.types";
import { createService } from "./services";
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import Form from '@/pages/process-flow/form';
import AdvanceEmployeeSearch from '@/pages/fma/new-staff/AdvanceSearchParams';
import moment from "moment";

export default () => {
  const requestActions = simpleRequestActions();
  const srv = createService(requestActions)
  const access = useAccess()
  const [filter, setFilter] = useState<TableViewSearchParams<SearchParams>>({
    criteria: {
      advanceSearch: {
        keyword: undefined,
        buIds: [],
        depIds: [],
        status: "ALL",
        startDate: undefined,
        endDate: undefined,
      },
    },
  });

  const actionRef = useRef<ActionType>();
  const { data, isLoading, refetch } = useQuery(
    ['fetch-paging-fma-new-staff-request', filter],
    () => srv.fetchPaging(filter),
    { refetchOnWindowFocus: false }
  )
  const [advanceSearchVisible, setAdvanceSearchVisible] = useState(false);
  const isAdvancedFiltered = () => {
    const adv = filter.criteria?.advanceSearch;
    return (
      (adv?.buIds?.length ?? 0) > 0 ||
      (adv?.depIds?.length ?? 0) > 0 ||
      !!adv?.startDate ||
      !!adv?.endDate
    );
  };
  const advanceSearchIcon = useMemo(() => {
    return isAdvancedFiltered()
      ? <FilterOutlined style={{ color: "red" }} />
      : <SelectOutlined />;
  }, [filter.criteria?.advanceSearch]);
  return (
    <>
      <PageWrapper<NewStaffListItem, SearchParams, any>
        tabRender={(item) =>[
          {
            action: 'add',
            tabLabel: "New Request",
            tabIcon: <PlusOutlined />,
            panel: (props) =>(
              <FMANewStaffRequestForm
                open width="1000px" onOpenChange={() =>
                props?.onCloseTab?.()} onRefresh={() => actionRef.current?.reloadAndRest?.()} />
            )},
          {
            action: "view",
            tabLabel: item?.formNo,
            tabIcon: <PlusOutlined/>,
            panel: (props)=> <Form openInTab formKey="fma_new_staff_request" id={item?.processInstId}/>
          }
        ]}
        listView={{
          type: "Table",
          title: "FMA - New Staff Support Request",
          advanceSearchButton: (
            <Button
              onClick={() => setAdvanceSearchVisible(true)}
              icon={advanceSearchIcon}
            />
          ),
          statuses: [
            {
              option: { label: "All", value: "ALL", default: true },
            }, {
              option: {
                label: "Pending", value: "PENDING"
              }
            },
            {
              option: {
                label: "Completed", value: "COMPLETED"
              }
            },
            {
              option: {
                label: "Rejected", value: "REJECTED"
              }
            }
          ],
          actionButtons: [
            access.canRequestFMANewStaffRequestExport && <Export key="export-btn" />
          ],
          onRefresh: refetch,
          onFilter: (params: any) =>{
            setFilter((p)=>({
              ...p,
              criteria: {
                ...p.criteria,
                searchValue: params?.keyword,
                ...params,
                advanceSearch: {
                  ...p.criteria?.advanceSearch,
                  ...params
                }
              }
            }))
          },
          props: {
            dataSource: data?.items || [],
            actionRef: actionRef,
            loading: isLoading,
            pagination: {
              total: data?.total,
              current: filter.pagination?.current,
              pageSize: filter.pagination?.pageSize,
              onChange: (current, pageSize) =>
                setFilter((p) => ({
                  ...p,
                  pagination: { current, pageSize },
                })),
            },
            columns: [
              {
                title: '#',
                render(_, entity, index) {
                  return <Flex gap={5}>
                        <span >
                            { index + 1 }-
                        </span>
                    <Button
                      size="small"
                      type="link"
                      title="Open in new tab"
                      icon={<ExportOutlined />}
                      onClick={() => {
                        window
                          .open(
                            `/external/data-form/${FMANewStaffFormNames.processDefKey}/${entity.processInstId}`,
                          )
                          ?.focus();
                      }}
                    />
                  </Flex>
                }
              },
              {
                title: "Form #",
                width: 160,
                actionProps: (item) => ({
                  type: 'view',
                  label: item.formNo,
                }),
                render: (_, entity) => (
                  <span
                    style={{ color: '#1677ff', cursor: 'pointer' }}
                    onClick={() => {
                      actionRef.current?.open?.({
                        action: 'view',
                        value: entity, // ✅ pass full entity
                        tabLabel: entity.formNo,
                        key: entity.id, // optional unique key
                      });
                    }}
                  >
                    {entity.formNo}
                  </span>
                ),
              },
              { title: 'Requested By', sorter: 'requestedBy', dataIndex: 'requestedBy' },
              {
                title: 'Requested Date', align: 'right', sorter: 'requestedDate', render(_, entity) {
                  return formatDateTime(entity.requestedDate)
                },
              },
              { title: 'Employee ID.', dataIndex: "empNo", sorter: 'empNo' },
              { title: 'Employee Name', dataIndex: "empName", sorter: 'empName' },
              { title: 'Employee Name (KH)', dataIndex: "empLocalName" },
              { title: 'COMPANY', dataIndex: "bu" },
              { title: 'Function', dataIndex: "department", sorter: 'dept' },
              { title: 'Job Title', dataIndex: "jobTitle", sorter: 'jobTitle' },
              { title: 'Approval', dataIndex: 'HOD' },
              { title: "Start Date", dataIndex: "startingDate",
                render: (_ , entity) =>
                  entity.startingDate
                    ? moment(entity.startingDate).format("YYYY-MM-DD")
                    : "-",
              },
              { title: 'Status', render: (_, r) => <Status text={toReadable(r.status)} />, sorter: 'status' },
            ]
          }
        }}
      />
      <AdvanceEmployeeSearch
        open={advanceSearchVisible}
        onClose={() => setAdvanceSearchVisible(false)}
        onSearch={(params) => {
          setFilter((prev) => ({
            ...prev,
            criteria: {
              ...prev.criteria,
              ...prev.criteria?.advanceSearch,
              buIds: params.buIds,
              depIds: params.depIds,
              startDate: params.startDate,
              endDate: params.endDate,
              ...params,
            },
          }));
          setAdvanceSearchVisible(false);
        }}
        onReset={() => {
          setFilter((prev) => ({
            ...prev,
            criteria: {
              ...prev.criteria,
              ...prev.criteria?.advanceSearch,
              buIds: [],
              depIds: [],
              startDate: undefined,
              endDate: undefined,
            },
            pagination: { ...prev.pagination, current: 1 },
          }));
        }}
      />
    </>
  );
}
