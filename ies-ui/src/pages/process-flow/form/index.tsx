import { useParams } from 'umi'
import { DataViewProps } from '../data'
import { getViewForm } from '../form-resources'

export default (props: { formKey?: string; id?: string, openInTab?: true }) => {

    const params = useParams()
    const formKey = props.formKey || params['formKey']
    const id = props.id || params['id']

    const dataViewProps = (): DataViewProps => {
        return {
            type: 'task',
            id: id || '',
            openInTab: props.openInTab,
            formKey: formKey || '',
            showDiagramHandler: () => { },
            actionHandler: () => { },
        }
    };

    return <div>{getViewForm(dataViewProps())}</div>
}

