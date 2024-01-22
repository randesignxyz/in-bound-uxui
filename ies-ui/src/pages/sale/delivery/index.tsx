import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { SalePaths } from ".."
import DeliveryListView from "./components/list"

export default () => {

    return  <CrudWrapper baseURL={SalePaths.delivery} >
    {
        (view, id, navigate) => {
           return  <DeliveryListView />   
        }
    }
</CrudWrapper>
}