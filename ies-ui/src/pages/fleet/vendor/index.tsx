
import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { FleetPaths } from "..";
import ListView from "./VendorListView";
export default () => {

    return( 
    <CrudWrapper baseURL={FleetPaths.mantenence} >
        {(view, id, navigate) => {
            return (
                (view == 'list' && (
                    <ListView
                        onAdd={()=>navigate?.goToCreate?.()}
                        onDetail={(id) => {
                        navigate?.goToDetail?.({ id: id });
                        
                      }}
                      onEdit={(id) => {
                        navigate?.gotoEdit?.({ id: id });
                      }}
                    />
                ))

            )
        }}
    </CrudWrapper>
    )
}