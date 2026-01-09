import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { Spin } from "antd"
import { HrmPaths } from ".."
import { useState } from "react"
import ProbationList from "./components/list"

export default () => {
  const [forceUpdate, setForceUpdate] = useState<number>(0)
  const refresh = ()=> {
    setForceUpdate(v => v + 1)
  }
  return (
    <CrudWrapper baseURL={HrmPaths.probationEvaluation} disablePageContainer={true}>
      {
        (view, id, navigate) => {
          switch (view) {
            case 'list': return (
              <ProbationList
                onAdd={id => navigate?.goToCreate?.({id})}
                onDetail={data => navigate?.goToDetail?.({ id: data.id })}
                forceRefresh={forceUpdate}
              />
            )
            default: throw Error('Not compatible view')
          }
        }
      }
    </CrudWrapper>
  )
}

