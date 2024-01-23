import React from "react";
import "./Button.css"

export type Props = {
    label: string;
}

const Button = (props: Props) => {
    return <button>{props.label}</button>
}

export default Button