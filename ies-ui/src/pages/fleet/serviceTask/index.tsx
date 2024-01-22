
import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { FleetPaths } from "..";
import Listview from "./ListView";
export default () => {

    return( 
    <CrudWrapper baseURL={FleetPaths.serviceTasks} >
        {(view, id, navigate) => {
            return (
                (view == 'list' && (
                    <Listview
                        onAdd={()=>navigate?.goToCreate?.()}
                        onDetail={(id) => {
                        navigate?.goToDetail?.({ id: id });
                        
                      }}
                      onEdit={(id) => {
                        navigate?.gotoEdit?.({ id: id });
                      }}
                    />
                ))
                
                // ||
                // (view === 'create' && <EntryForm  />) 

                // ||(view ==="detail" && <DetailView id={id as string} />)
            )
        }}
    </CrudWrapper>
    )
}