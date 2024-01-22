import { LoadingCapacityListItem } from "@/services/delivery/data";
import { CheckCard, ModalForm, ModalFormProps } from "@ant-design/pro-components";
import { Typography } from "antd";
import { useState } from "react";

interface Props extends  ModalFormProps<{loadingCapacities: number[]}> {
    loadingDockIds: number[];
    loadingCapacities: LoadingCapacityListItem[];
    onSave: (loadingCapacityIds: number[]) => Promise<void>;
}

export default ({loadingDockIds, loadingCapacities, onSave, ...rest}:Props) => {

    const [selectedItems, setSelectedItems] = useState<number[]>([])
    return <ModalForm 
            title = "Loading Capacity" {...rest}
            onFinish = {() => onSave(selectedItems)}
        >
        
        < CheckCard.Group
            multiple
            onChange = { ( value ) => {  
                setSelectedItems(value as number[])
            } }
            defaultValue = { loadingDockIds }
            
        >
            {
                loadingCapacities.map(it => {
                    return  <CheckCard
                    size="small"
                    key={it.id}
                    title = {<Typography.Title>{it.name}</Typography.Title>}
                    value = {it.id}
                />
                })
            }
        </CheckCard.Group>
    </ModalForm>
}