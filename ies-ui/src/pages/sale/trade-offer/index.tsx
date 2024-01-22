import { useAccess } from "umi"
import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { SalePaths } from ".."
import TradeListView from "./components/List"


export default () => {
    const asscess = useAccess()
    
    return <CrudWrapper baseURL= {SalePaths.tradeOffer}>
        {
            (view, id, navigate) => {
                return view === 'list' && <TradeListView 
                    actionHandlers = {
                        {
                            onAdd: () => {

                            },
                            onDetail: (item) => {

                            } 
                        }
                    }
                /> ||
                view === 'create' && <div>Create</div>
            }
        }
    </CrudWrapper>
}