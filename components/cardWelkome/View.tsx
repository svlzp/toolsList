import React from "react";
import Svg, { Path, G, Circle } from "react-native-svg";

const View = ({ color = "#3A55F8" }) => {
  // Функция для создания зубьев шестеренки
  const createGearPath = () => {
    let path = "M 60 15 ";
    const teeth = 12;
    const outerRadius = 45;
    const innerRadius = 30;
    const toothDepth = 8;

    for (let i = 0; i < teeth; i++) {
      const angle = (i * 360) / teeth;
      const nextAngle = ((i + 1) * 360) / teeth;
      const midAngle = (angle + nextAngle) / 2;

      // Внешняя точка (конец зуба)
      const outerAngle = (angle - 90) * (Math.PI / 180);
      const outerX = 60 + outerRadius * Math.cos(outerAngle);
      const outerY = 60 + outerRadius * Math.sin(outerAngle);

      // Следующая внешняя точка
      const nextOuterAngle = (nextAngle - 90) * (Math.PI / 180);
      const nextOuterX = 60 + outerRadius * Math.cos(nextOuterAngle);
      const nextOuterY = 60 + outerRadius * Math.sin(nextOuterAngle);

      // Внутренняя точка (основание зуба)
      const innerAngle = (angle - 90) * (Math.PI / 180);
      const innerX = 60 + innerRadius * Math.cos(innerAngle);
      const innerY = 60 + innerRadius * Math.sin(innerAngle);

      // Следующая внутренняя точка
      const nextInnerAngle = (nextAngle - 90) * (Math.PI / 180);
      const nextInnerX = 60 + innerRadius * Math.cos(nextInnerAngle);
      const nextInnerY = 60 + innerRadius * Math.sin(nextInnerAngle);

      path += `L ${outerX} ${outerY} L ${nextOuterX} ${nextOuterY} L ${nextInnerX} ${nextInnerY} L ${innerX} ${innerY} `;
    }

    path += "Z";
    return path;
  };

  return (
    <Svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
    >
      <G id="Gear-Icon">
        {/* Основная шестеренка с зубьями */}
        <Path
          d={createGearPath()}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="miter"
        />

        {/* Внутренний круг */}
        <Circle
          cx="60"
          cy="60"
          r="18"
          fill="none"
          stroke={color}
          strokeWidth="2"
        />

        {/* Центральное отверстие */}
        <Circle
          cx="60"
          cy="60"
          r="8"
          fill={color}
          opacity="0.15"
        />

        {/* Центральная точка */}
        <Circle
          cx="60"
          cy="60"
          r="3"
          fill={color}
        />
      </G>
    </Svg>
  );
};

export default View;
