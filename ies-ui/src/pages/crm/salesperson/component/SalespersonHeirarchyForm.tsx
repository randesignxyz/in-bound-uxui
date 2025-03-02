import { simpleRequestActions } from "@/services/model"
import { ModalForm, ModalFormProps, ProFormSelect } from "@ant-design/pro-components"
import { SalespersonAPI } from "../service"

interface Props extends ModalFormProps{

}

const SalespersonHeirarchyForm: React.FC<Props> = ({ ...props }) => {
    const requestActions = simpleRequestActions()

    return <ModalForm
        {...props}
        width={600}
    >
        
        <ProFormSelect
            name={"salespersonId"}
            label={"Please Select Salesperson"}
            showSearch
            request={async () => {
                const data = await SalespersonAPI(requestActions).salespersonList()
                return data.map(o => ({ value: o.id, label: o.name }))
            }}
        />
        <ProFormSelect
            label="Position"
            name={"positionId"}
            options={[
                {
                    value:"NSM",
                    label:"NSM"
                },
                {
                    value:"RSM",
                    label:"RSM"
                },
                {
                    value:"ASM",
                    label:"ASM"
                },
                {
                    value:"SE",
                    label:"SE"
                },
                {
                    value:"SA",
                    label:"SA"
                },
            ]}
        />

    </ModalForm>
}

export default SalespersonHeirarchyForm