
import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import MainPage from "./MainPage"
import { HrmPaths } from ".."
import DataEntryFormView from "./DataEntryFormView"
import { Card } from "antd"

export default () => {
  return(
    <CrudWrapper baseURL={HrmPaths.jobdes} >
      {(view, id, navigate) => {
        switch (view) {
          case 'list':
            return <MainPage />
          case 'detail':
            return (
              <Card>
                <DataEntryFormView
                  id={id}
                  type="EDIT"
                  onCloseTab={() => navigate?.gotToListHandler?.()}
                ></DataEntryFormView>
              </Card>
            );
          default:
            throw Error('Not supported')
        }
      }}
    </CrudWrapper>
  )
}
