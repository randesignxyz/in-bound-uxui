
import { Drawer, DrawerProps } from "antd";
import HistoryTableView from "../history/HistoryTableView";

interface Props extends DrawerProps {
    docId?: number;
}

export default ({ docId, ...props }: Props) => {


    return (
        <>
            <Drawer
                title={"History"}
                {...props}
                width={600}
            >
                <HistoryTableView intantId={docId} source="DOCUMENTATION" />

            </Drawer>
        </>
    )
}