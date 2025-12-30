import React, { useRef, useState, useMemo } from 'react';
import {
  PlusOutlined,
  ExportOutlined,
  FilterOutlined,
  SelectOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Button, Flex } from "antd";
import { useAccess, history, useQuery } from "@umijs/max";
import PageWrapper from "@/components/PageWrapper";
import Status from "@/components/Status";
import {
  EmployeeAdvanceSearchParams,
  EmployeeListItem,
} from '../data';
import { EmployeeServices } from "../services";
import { simpleRequestActions } from "@/services/model";
import RequestModal from "./EmployeeModal";
import AdvanceSearchDrawer from "./AdvanceEmployeeSearch";
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { ActionType } from '@ant-design/pro-components';

export default function EmployeePage() {
  const access = useAccess();
  const requestActions = simpleRequestActions();
  const actionRef = useRef<ActionType>();

  return <CrudWrapper baseURL={HrmPaths.employee} >
    {(view, id, navigate) => {
      switch (view) {
        case 'list':
          return <ListView onAdd={id => navigate?.goToCreate?.({ id })} onEdit={id => navigate?.gotoEdit?.({ id })} />
        case 'create':
          return <DataEntry onBack={() => navigate?.gotToListHandler?.()} type="CREATE" id={id as number} />
        case 'edit':
          return <div></div>
        default:
          throw Error('Not supported')
      }
    }}


  </CrudWrapper>
}
