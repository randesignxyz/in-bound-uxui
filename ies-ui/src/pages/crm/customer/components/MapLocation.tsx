import { DrawerForm, DrawerFormProps } from "@ant-design/pro-components";
import React from "react";


interface Props extends DrawerFormProps{

}

const MapLocationDrawer:React.FC<Props> = ({ ...props }) =>{

    return (
        <DrawerForm
            {...props}
            title={"Map Location"}
        >


        </DrawerForm>
    )
}

export default MapLocationDrawer