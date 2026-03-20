import { ActionType } from "@ant-design/pro-components";
import {  useRef, useState } from 'react';
import {useQuery } from '@umijs/max';
import PageWrapper from "@/components/PageWrapper";
import { FMANewStaffFormNames, NewStaffListItem, SearchParams } from "@/pages/fma/new-staff/data.types";
import { simpleRequestActions } from "@/services/model";
import { createService } from "@/pages/fma/new-staff/services";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { formatDateTime, toReadable } from "@/pages/utils";
import moment from "moment";
import Status from "@/components/Status";
import { Button, Flex } from "antd";
import { ExportOutlined, PlusOutlined } from "@ant-design/icons";
import Detail from "./detail";
import NewStaffRequestForm from "./NewStaffRequestForm";
import { NewStaffService } from "./service";

export default () => {
  const requestActions = simpleRequestActions();
  const srv = createService(requestActions)
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
    ['fetch-paging-new-staff-request', filter],
    () => NewStaffService.fetchPaging(filter),
    { refetchOnWindowFocus: false }
  )

  return (
    <>
      <PageWrapper<NewStaffListItem, SearchParams, any> 
         tabRender={(item) =>[
          {
            action: 'add',
            tabLabel: "New Request",
            tabIcon: <PlusOutlined />,
            panel: (props) =>(
              <NewStaffRequestForm
                formKey=""
                visible  
                onClose={() => props?.onCloseTab?.()}
                cb={()=>{refetch()}}               
              />
            )},
          {
            action: "view",
            tabLabel: item?.formNo,
            // tabIcon: <PlusOutlined/>,
            // panel: (props)=> <Form openInTab formKey="fma_new_staff_request" id={item?.processInstId}/>
             panel: (props)=> <Detail item={item}/>
          }
        ]}
        listView={{
          type: "Table",
          title: "New Staff Support Request",
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
            dataSource:  data?.items||[],
            actionRef: actionRef,
            loading: isLoading,
             columns: [
              {
                title: '#',
                render(_, entity, index) {
                  return <Flex gap={5}>
                        <span >
                            { index + 1 }
                        </span>
                    {/* <Button
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
                    /> */}
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
                // render: (_, entity) => (
                //   <span
                //     style={{ color: '#1677ff', cursor: 'pointer' }}
                //     onClick={() => {
                //       actionRef.current?.open?.({
                //         action: 'view',
                //         value: entity, // ✅ pass full entity
                //         tabLabel: entity.formNo,
                //         key: entity.id, // optional unique key
                //       });
                //     }}
                //   >
                //     {entity.formNo}
                //   </span>
                // ),
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
              // { title: 'Approval', dataIndex: 'HOD' },
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
    </>
  );
}
