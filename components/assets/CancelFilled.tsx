/* eslint-disable react/require-default-props */
import React from "react";

interface CancelFilledProps {
    color: string;
    width?: string;  // Необязательный пропс для ширины
    height?: string; // Необязательный пропс для высоты
}

const CancelFilled: React.FC<CancelFilledProps> = ({
    color,
    width = "24",  // Значение по умолчанию
    height = "24", // Значение по умолчанию
}) => (
    <svg
    cursor='pointer'
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g id="24/cancel_filled">
            <path
                id="&#226;&#134;&#179; Icon Color"
                d="M18.7017 5.2983C19.0994 5.69604 19.0994 6.3409 18.7017 6.73864L12.9403 12.5L18.7017 18.2614C19.0994 18.6591 19.0994 19.304 18.7017 19.7017C18.304 20.0994 17.6591 20.0994 17.2614 19.7017L11.5 13.9403L5.73864 19.7017C5.3409 20.0994 4.69604 20.0994 4.2983 19.7017C3.90057 19.304 3.90057 18.6591 4.2983 18.2614L10.0597 12.5L4.2983 6.73864C3.90057 6.3409 3.90057 5.69604 4.2983 5.2983C4.69604 4.90057 5.3409 4.90057 5.73864 5.2983L11.5 11.0597L17.2614 5.2983C17.6591 4.90057 18.304 4.90057 18.7017 5.2983Z"
                fill={color || "#3A55F8"}
            />
        </g>
    </svg>
);

export default CancelFilled;
