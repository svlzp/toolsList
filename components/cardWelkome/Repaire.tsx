import React from "react";
import Svg, { Path, G, Line, Circle, Rect } from "react-native-svg";

const Repaire = () => (
  <Svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    fill="none"
  >
    <G id="CNC-Machine">
      {/* Основание станка */}
      <Path
        d="M15 90 L15 100 Q15 105 20 105 L100 105 Q105 105 105 100 L105 90"
        fill="#2D3E50"
        stroke="#3A55F8"
        strokeWidth="1.5"
      />
      
      {/* Корпус/рама станка */}
      <Rect
        x="20"
        y="50"
        width="80"
        height="45"
        fill="#34495E"
        stroke="#3A55F8"
        strokeWidth="2"
      />
      
      {/* Верхняя часть - портал */}
      <Path
        d="M25 50 L35 25 L45 30 L45 50"
        fill="none"
        stroke="#3A55F8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M95 50 L85 25 L75 30 L75 50"
        fill="none"
        stroke="#3A55F8"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Горизонтальная балка */}
      <Line
        x1="35"
        y1="25"
        x2="85"
        y2="25"
        stroke="#3A55F8"
        strokeWidth="2.5"
      />
      
      {/* Шпиндель/фреза (центр) */}
      <Circle
        cx="60"
        cy="28"
        r="4"
        fill="#FF6B6B"
        stroke="#3A55F8"
        strokeWidth="1"
      />
      
      {/* Рабочая область */}
      <Rect
        x="30"
        y="55"
        width="60"
        height="30"
        fill="#1A252F"
        stroke="#3A55F8"
        strokeWidth="1.5"
        strokeDasharray="3,3"
      />
      
      {/* Линии сетки рабочей области */}
      <Line x1="40" y1="55" x2="40" y2="85" stroke="#3A55F8" strokeWidth="0.8" opacity="0.5" />
      <Line x1="50" y1="55" x2="50" y2="85" stroke="#3A55F8" strokeWidth="0.8" opacity="0.5" />
      <Line x1="60" y1="55" x2="60" y2="85" stroke="#3A55F8" strokeWidth="0.8" opacity="0.5" />
      <Line x1="70" y1="55" x2="70" y2="85" stroke="#3A55F8" strokeWidth="0.8" opacity="0.5" />
      <Line x1="80" y1="55" x2="80" y2="85" stroke="#3A55F8" strokeWidth="0.8" opacity="0.5" />
      
      <Line x1="30" y1="65" x2="90" y2="65" stroke="#3A55F8" strokeWidth="0.8" opacity="0.5" />
      <Line x1="30" y1="75" x2="90" y2="75" stroke="#3A55F8" strokeWidth="0.8" opacity="0.5" />
      
      {/* Направляющие (рельсы) */}
      <Rect x="28" y="52" width="64" height="1.5" fill="#7F8C8D" />
      <Rect x="28" y="86" width="64" height="1.5" fill="#7F8C8D" />
      
      {/* Панель управления справа */}
      <Rect
        x="92"
        y="58"
        width="10"
        height="18"
        fill="#2C3E50"
        stroke="#3A55F8"
        strokeWidth="1"
      />
      
      {/* Кнопки/индикаторы */}
      <Circle cx="95" cy="62" r="1.5" fill="#27AE60" />
      <Circle cx="99" cy="62" r="1.5" fill="#27AE60" />
      <Circle cx="95" cy="68" r="1.5" fill="#FF6B6B" />
      <Circle cx="99" cy="68" r="1.5" fill="#F39C12" />
    </G>
  </Svg>
);

export default Repaire;
