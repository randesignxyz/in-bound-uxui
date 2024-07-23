import CrudWrapper from "@/components/DataCrud/CrudWrapper";
import { FleetPaths } from "..";
import AccessoriesListView from "./AccessoriesListView";

export default ()=>{

    return <CrudWrapper baseURL={FleetPaths.mantenence}>
    {(view, id, navigate) => {
      return (
        view == 'list' && (
          <AccessoriesListView
          />
        )
      );
    }}
  </CrudWrapper>
}