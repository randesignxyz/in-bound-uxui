
import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { FleetPaths } from "..";
import ListView from "./ListView";
export default () => {

    return( 
    <CrudWrapper baseURL={FleetPaths.mantenence} >
        {(view) => {
            return (
                (view == 'list' && (
                    <ListView/>
                ))
               
            )
        }}
    </CrudWrapper>
    )
}