import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { FleetPaths } from ".."
import DetailView from "./DetailView"
import EntityForm from "./EntityForm"
import ListView from "./ListView"

export default () => {

    return( 
    <CrudWrapper baseURL={FleetPaths.vehicle} >
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
                ))||
                (view == "create" && (
                    <EntityForm 
                        type={"new"} 
                        onDetail={(id) => {
                            navigate?.goToDetail?.({ id: id });
                          }}
                        onEdit={(id) => {
                            navigate?.gotoEdit?.({ id: id });
                          }}
                    />
                ))||
                (view == "detail" && (
                    <DetailView
                    id={id as string}
                    onEdit={(id) => {
                        navigate?.gotoEdit?.({ id: id });
                      }}
                    onAdd={()=>navigate?.goToCreate?.()}
                    />
                ))||
                (view == "edit" && (
                    <EntityForm type={"edit"}  
                        id={id as string}
                     />
                ))
            )
            // switch (view) {
            //     case 'list':
            //         return <ListView />
            //     default:
            //         throw Error('Not supported')
            // }
        }}
    </CrudWrapper>
    )
}