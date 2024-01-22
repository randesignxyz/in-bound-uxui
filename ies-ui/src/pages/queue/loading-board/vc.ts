import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { ActionData } from "@/pages/type";
import { Paging } from "@/services/API";
import { LoadingListItem } from "@/services/delivery/data";
import { AllocatedLoadingDockBase, AllocatedLoadingDockDetail } from "@/services/delivery/loading-bay-service-params";
import { SimpleRequestActions } from "@/services/model";
import { ActionType } from "@ant-design/pro-components";
import { MutableRefObject } from "react";

export type UiType = 'LIST' | 'DETAIL'

export type ModalName =  'detail' | 'done' | 'loading-capacity' | 'transfer'

export interface ViewController {
    requestActions: SimpleRequestActions;
    actions: {
        listLoadingItems?: (params: TableViewSearchParams<{ id: number }>) => Promise<Paging<LoadingListItem>>;
    },
    data: {
        item?: AllocatedLoadingDockDetail
    },
    view: {
        getActions?: (form: UiType, item?: AllocatedLoadingDockBase) =>  ActionData[];
    }
}