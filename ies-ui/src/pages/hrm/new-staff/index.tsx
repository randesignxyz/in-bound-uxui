import { ActionType } from "@ant-design/pro-components";
import { useRef, useState } from 'react';
import { useAccess, useQuery } from '@umijs/max';
import PageWrapper from "@/components/PageWrapper";
import { NewStaffListItem, SearchParams } from "@/pages/fma/new-staff/data.types";
import { simpleRequestActions } from "@/services/model";
import { createService } from "@/pages/fma/new-staff/services";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";

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
    () => srv.page(filter),
    { refetchOnWindowFocus: false }
  )

  return (
    <>
      <PageWrapper<NewStaffListItem, SearchParams, any> 
        listView={{
          type: "Table",
          title: "New Staff Support Request",
           props: {
            dataSource:  data?.items||[],
            // actionRef: actionRef,
            // loading: isLoading,
             columns: []
           }
        }}   
      />
    </>
  );
}
