import React from "react";
import Svg, { Path, G, Circle, Rect, Line } from "react-native-svg";

const Cart = ({ width = 120, height = 120, color = "#3A55F8" }) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 120 120"
    fill="none"
  >
    <G id="Drill-Bit">
      {/* Хвостовик (цилиндрический) */}
      <Rect
        x="52"
        y="50"
        width="16"
        height="45"
        fill="#7F8C8D"
        stroke={color}
        strokeWidth="1.5"
      />
      
      {/* Канавки на хвостовике */}
      <Line
        x1="54"
        y1="50"
        x2="54"
        y2="95"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.6"
      />
      <Line
        x1="66"
        y1="50"
        x2="66"
        y2="95"
        stroke={color}
        strokeWidth="0.8"
        opacity="0.6"
      />

      {/* Основание сверла (переход к спирали) */}
      <Rect
        x="50"
        y="48"
        width="20"
        height="4"
        fill="#95A5A6"
        stroke={color}
        strokeWidth="1"
      />

      {/* Спиральная часть - левая спираль */}
      <Path
        d="M58 48 Q52 40 58 30"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Спиральная часть - правая спираль */}
      <Path
        d="M62 48 Q68 40 62 30"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Конус перехода к острию */}
      <Path
        d="M53 30 L58 20 L67 20 L72 30"
        fill={color}
        opacity="0.3"
      />
      <Path
        d="M53 30 L58 20 L67 20 L72 30"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Острие сверла - левое */}
      <Path
        d="M58 20 L55 10 L58 15"
        fill={color}
        opacity="0.5"
      />
      
      {/* Острие сверла - правое */}
      <Path
        d="M62 20 L65 10 L62 15"
        fill={color}
        opacity="0.5"
      />

      {/* Центральная линия острия */}
      <Line
        x1="58"
        y1="20"
        x2="60"
        y2="8"
        stroke={color}
        strokeWidth="1.5"
      />
      <Line
        x1="62"
        y1="20"
        x2="60"
        y2="8"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Тень на острие */}
      <Path
        d="M58 15 L60 8 L62 15"
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity="0.6"
      />
    </G>
  </Svg>
);

export default Cart;
