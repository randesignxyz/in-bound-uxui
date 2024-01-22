import { fetchDataListService } from "@/services/apiGateway";
import { LoadingBayListItem, LoadingDockListItem } from "@/services/delivery/data";

export const LoadingLocationServices = {
    fetchListLoadingBay: fetchDataListService<LoadingBayListItem>({
        actionName: 'list-all-loading-bay',
        endpoint: 'DELIVERY'
    }),

    fetchListLoadDockByLoadingBays: (ids: number[]) => fetchDataListService<LoadingDockListItem, {ids: number[]}>({
        actionName: 'list-loading-dock-by-loading-bay-ids',
        endpoint: 'DELIVERY',
        payload: {
            ids
        }
    })
}

