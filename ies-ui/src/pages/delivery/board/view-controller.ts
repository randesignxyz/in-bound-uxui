import { ActionData } from "@/pages/type";
import { InstanceBasic, InstanceDetail } from "@/services/delivery/instance.types";
import { SimpleRequestActions } from "@/services/model";
import { ActionType } from "@ant-design/pro-components";
import { MutableRefObject } from "react";


export type UiType = 'LIST' | 'DETAIL'

export type ModalName = 'detail' | 'assign-doc' | 'picking-slip' | 'change-picking-slip'


export interface ViewController {
    requestActions: SimpleRequestActions;
    actions: {
        onOpenModal: (from: UiType, modalName: ModalName, id?: number, isLoadDetail?: boolean, cb?: () => void) => void;
        onCloseModal: (visible?: boolean) => void;
        onClaim: (id?: number, cb?: () => void) => void;
        onRelease: (id?: number, cb?: () => void) => void;
        onRefreshDetailData: (id?: number) => void;
        onRefreshLisViewData: () => void;
    },

    data: {
        itemDetail?: InstanceDetail
    },
    view: {
        loading?: boolean;
        getActions?: (form: UiType, item?: InstanceBasic) => ActionData[];
        actionRef: MutableRefObject<ActionType | undefined>;
    }
}