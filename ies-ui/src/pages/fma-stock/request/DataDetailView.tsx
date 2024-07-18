import { DrawerForm, DrawerFormProps } from "@ant-design/pro-components";
import { StockRequestDetailResponse } from "./data.types";
import ViewData from "./components/ViewData";
import { useState } from "react";

interface Props extends DrawerFormProps {
    instId?: string;
    forceRefresh?: number;
    reload?: (id: number) => Promise<void>;
    onEdit?: () => void;
    onAdd?: () => void;
}
export default ({ instId, forceRefresh, onEdit, onAdd, reload, ...rest }: Props) => {
   
    return(
        <DrawerForm
            title="Stock Request Detail"
            {...rest}
            resize={{
            maxWidth: window.innerWidth * 0.9,
            minWidth: 1000,
            }}
            submitter={false}
        >
        <ViewData instId={instId} forceRefresh={forceRefresh} />
        </DrawerForm>
    )
}