
import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { FleetPaths } from "..";
import TaskListView from "./TaskListView";
export default () => {

    return( 
    <CrudWrapper baseURL={FleetPaths.serviceTasks} >
        {(view, id, navigate) => {
            return (
                (view == 'list' && (
                    <TaskListView
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