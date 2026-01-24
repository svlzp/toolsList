import React from "react";
import Svg, { Path, G, Rect, Line, Circle, Polygon } from "react-native-svg";

const Package = ({ color = "#3A55F8" }) => (
  <Svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    fill="none"
  >
    <G id="Learning-Icon">
      {/* Открытая книга */}
      <Path
        d="M20 35 L60 30 L60 85 L20 90 Z"
        fill={color}
        opacity="0.2"
        stroke={color}
        strokeWidth="2"
      />
      <Path
        d="M60 30 L100 35 L100 90 L60 85 Z"
        fill={color}
        opacity="0.3"
        stroke={color}
        strokeWidth="2"
      />

      {/* Линии текста на левой странице */}
      <Line
        x1="28"
        y1="42"
        x2="52"
        y2="42"
        stroke={color}
        strokeWidth="1.5"
      />
      <Line
        x1="28"
        y1="50"
        x2="52"
        y2="50"
        stroke={color}
        strokeWidth="1.5"
      />
      <Line
        x1="28"
        y1="58"
        x2="52"
        y2="58"
        stroke={color}
        strokeWidth="1.5"
      />
      <Line
        x1="28"
        y1="66"
        x2="48"
        y2="66"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Линии текста на правой странице */}
      <Line
        x1="68"
        y1="42"
        x2="92"
        y2="42"
        stroke={color}
        strokeWidth="1.5"
      />
      <Line
        x1="68"
        y1="50"
        x2="92"
        y2="50"
        stroke={color}
        strokeWidth="1.5"
      />
      <Line
        x1="68"
        y1="58"
        x2="92"
        y2="58"
        stroke={color}
        strokeWidth="1.5"
      />
      <Line
        x1="68"
        y1="66"
        x2="88"
        y2="66"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Корешок книги */}
      <Rect
        x="58"
        y="30"
        width="4"
        height="55"
        fill={color}
        opacity="0.4"
      />

      {/* Лампочка (идея/знания) сверху */}
      <Circle
        cx="85"
        cy="18"
        r="6"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Цоколь лампочки */}
      <Rect
        x="82"
        y="24"
        width="6"
        height="3"
        fill={color}
        opacity="0.5"
      />

      {/* Свет от лампочки */}
      <Path
        d="M85 12 L85 8"
        stroke={color}
        strokeWidth="1"
        opacity="0.6"
      />
      <Path
        d="M80 13 L77 10"
        stroke={color}
        strokeWidth="1"
        opacity="0.6"
      />
      <Path
        d="M90 13 L93 10"
        stroke={color}
        strokeWidth="1"
        opacity="0.6"
      />

      {/* Звёздочка (успех) */}
      <Polygon
        points="35,95 37,102 44,102 39,107 41,114 35,110 29,114 31,107 26,102 33,102"
        fill={color}
        opacity="0.6"
      />
    </G>
  </Svg>
);

export default Package;
