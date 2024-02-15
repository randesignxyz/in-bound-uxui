import { simpleRequestActions } from "@/services/model";
import { ActionType } from "@ant-design/pro-components";
import { Badge } from "antd"
import { useRef } from "react";


export default () => {

    return (


        <Badge
            count={39}
            offset={[10, -5]}
            overflowCount={10}
            
            >
            <a>Reminder</a>
        </Badge>
    )
}