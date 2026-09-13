import { FetchPagingParams } from "@/components/DataCrud/TableView";
import { Paging } from "./API";
import { RequestActions } from "./apiGateway";

export interface CrudBaseServices<
    A extends { id: number },
    B extends { id: number },
    S extends { keyword?: string },
    V extends { id?: number }
> {
    fetchPaging: (params: FetchPagingParams<S>) => Promise<Paging<A>>;
    fetchList: (params: S) => Promise<A[]>;
    fetchItem: (id: number) => Promise<B>;
    saveItem: (data: V) => Promise<any>;

}

export interface CrudBaseServices1<
    A extends { id?: number },
    B extends { id?: number },
    S extends { keyword?: string },
    V extends { id?: number }
> {
    fetchPaging: (params: FetchPagingParams<S>) => Promise<Paging<A>>;
    fetchList: (params: S) => Promise<A[]>;
    fetchItem: (id: number) => Promise<B>;
    saveItem: (data: V) => Promise<any>;
    requestAction: RequestActions;

}

export interface FetchProcessInstance<A extends { id: number }> {
    fetchProcessInstance: (id: string) => Promise<A>;
}