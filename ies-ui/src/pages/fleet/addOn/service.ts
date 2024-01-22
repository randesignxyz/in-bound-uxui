import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { Paging } from "@/services/API";
import { ServiceApiType, RequestActions, singleRequest } from "@/services/apiGateway";


const AddOnAction  =  {

    save: (v:VendorCreate):ServiceApiType<VendorCreate> =>({
        type:"EXEC",
        actionName: 'save-vendor',
        endpoint:'FLEET',
        payload: {...v}

    }),

    
    page: (
        params: TableViewSearchParams<SearchVendorParam>,
      ): ServiceApiType<{ searchValue?: string }> => ({
        type: "PAGING_QUERY",
        actionName: "page-vendor",
        endpoint: "FLEET",
        payload: { ...params.criteria },
        pagination: {
          pageSize: params.pagination?.pageSize,
          page: params.pagination?.current,
        },
      }),

}


export const AddOnServiceAPI = (requestActions: RequestActions) => {
    return {
       page : (params: TableViewSearchParams<SearchVendorParam>)=>
       singleRequest<VendorDTO>(AddOnAction.page(params))(requestActions) as Promise<Paging<VendorDTO>> ,

      save: (params: VendorCreate) =>
      singleRequest<{ data: string; message: string }>(AddOnAction.save(params))(
        requestActions,
      ),


      // tire position
    
    }
};
  