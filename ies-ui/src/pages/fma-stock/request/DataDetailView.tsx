import { DrawerForm, DrawerFormProps } from "@ant-design/pro-components";
import { StockRequestDetailResponse } from "./data.types";
import ViewData from "./components/ViewData";

interface Props extends DrawerFormProps {
    data?: StockRequestDetailResponse;
    reload?: (id: number) => Promise<void>;
    onEdit?: () => void;
    onAdd?: () => void;
}
export default ({ data, onEdit, onAdd, reload, ...rest }: Props) => {
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
            <ViewData data={data} />
        </DrawerForm>
    )
}