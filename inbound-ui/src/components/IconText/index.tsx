import { Button } from "antd";
import React from "react";

const IconText = ({
    icon,
    text,
    action,
    actionHandler,
}: {
    icon: any;
    text: string;
    action: string;
    actionHandler: (action: string) => void
}) => (
        <a
            onClick={() => {
                actionHandler(action)
            }}
        >
            {React.createElement(icon, { style: { marginRight: 8 } })}
            {text}
        </a>
    );

export default IconText