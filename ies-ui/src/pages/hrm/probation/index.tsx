import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { Spin, message } from "antd"
import AppraisalList from "./components/list"
import AppraisalViewDetail from "./components/detail"
import { HrmPaths } from ".."
import { useState } from "react"

export default () => {
    const [forceUpdate, setForceUpdate] = useState<number>(0)
    const refresh = ()=> {
        setForceUpdate(v => v + 1)
    }
    return (
        <CrudWrapper baseURL={HrmPaths.appraisalSubmit}>
            {
                (view, id, navigate) => {
                    switch (view) {
                        case 'list': return (
                            <AppraisalList
                                onDetail={data => navigate?.goToDetail?.({ id: data.id })}
                                forceRefresh={forceUpdate}
                            />
                        )
                        case 'detail': return id ? <AppraisalViewDetail id={Number(id) || 0} 
                                onBack={()=>{                                  
                                    navigate?.gotToListHandler?.()
                                    refresh()
                                }}
                            /> : <Spin />
                        default: throw Error('Not compatible view')
                    }
                }
            }
        </CrudWrapper>
    )
}

