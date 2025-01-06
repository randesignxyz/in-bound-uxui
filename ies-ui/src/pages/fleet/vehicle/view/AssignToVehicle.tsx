import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { AddVehicleAccessory } from "../../accessory/data";
import { ProFormSelect } from "@ant-design/pro-components";
import { simpleRequestActions } from "@/services/model";
import { AccessoryServiceAPI } from "../../accessory/service";

interface Props extends FormModalProps{
    onSave:( data :AddVehicleAccessory) =>void
}

const AssignToVehicleModal:React.FC<Props> =  ({ onSave ,...props }) =>{
    const requestAction = simpleRequestActions();
    return (
        <FormModalComp
            title="Accessories Assign to Vehicle Form"
            {...props}
        >
            
            <ProFormSelect
                name={"accessorie"}
                label={"Accessories"}
                request={async({keyWords})=>{
                    const data = await AccessoryServiceAPI(requestAction).page({
                        criteria:{
                            searchValue:keyWords
                        }
                    });
                    return data.items.map(p=>({
                        label:p.name,
                        value:p.id
                    }))
                }}
            />


        </FormModalComp>
    )
}

export default AssignToVehicleModal