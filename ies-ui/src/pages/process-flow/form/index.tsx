import { useParams } from 'umi'
import { DataViewProps } from '../data'
import { getViewForm } from '../form-resources'

export default () => {

    const params = useParams()
    const formKey = params['formKey']
    const id = params['id']
        

    const dataViewProps = (): DataViewProps => {
        return {
            type: 'task',
            id: id || '',
            formKey: formKey||'',
            showDiagramHandler: () => { },
            actionHandler: () => { },
        }
    };

    return <div>{getViewForm(dataViewProps())}</div>
}

