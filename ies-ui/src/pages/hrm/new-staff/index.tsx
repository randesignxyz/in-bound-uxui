import { ActionType } from "@ant-design/pro-components";
import { useAccess, useQuery } from '@umijs/max';
import { Button, Flex } from 'antd';
import { useMemo, useRef, useState } from 'react';
import PageWrapper from "@/components/PageWrapper";
import { NewStaffListItem, SearchParams } from "@/pages/fma/new-staff/data.types";

export default () => {
  return (
    <>
      <PageWrapper<NewStaffListItem, SearchParams, any> 
        listView={{
          type: "Table",
          title: "New Staff Support Request",
           props: {
            dataSource:  [],
            // actionRef: actionRef,
            // loading: isLoading,
             columns: []
           }
        }}   
      />
    </>
  );
}
