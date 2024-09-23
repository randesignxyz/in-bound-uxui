import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { Spin, message } from "antd"
import AppraisalList from "./components/list"
import AppraisalViewDetail from "./components/detail"
import { HrmPaths } from ".."
import { useState } from "react"
import DataEntryView from "./DataEntryView"

export default () => {
    const [forceUpdate, setForceUpdate] = useState<number>(0)
    const refresh = ()=> {
        setForceUpdate(v => v + 1)
    }
    return (
        <CrudWrapper baseURL={HrmPaths.probationEvaluation}>
            {
                (view, id, navigate) => {
                    switch (view) {
                        case 'list': return (
                            <AppraisalList
                                onAdd={id => navigate?.goToCreate?.({id})}
                                onDetail={data => navigate?.goToDetail?.({ id: data.id })}
                                forceRefresh={forceUpdate}
                            />
                        )
                        case 'create':
                            return <DataEntryView onBack={()=> navigate?.gotToListHandler?.()} type="CREATE" id={id as number}/>
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

