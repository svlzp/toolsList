import React from "react";
import Svg, { Path, G, Defs, ClipPath, Rect } from "react-native-svg";

const RU = () => (
  <Svg
    width="44"
    height="44"
    viewBox="0 0 44 44"
    fill="none"
  >
    <G clipPath="url(#clip0)">
      <Path
        d="M22 44C34.1503 44 44 34.1503 44 22C44 9.84974 34.1503 0 22 0C9.84974 0 0 9.84974 0 22C0 34.1503 9.84974 44 22 44Z"
        fill="#F0F0F0"
      />
      <Path
        d="M42.6316 29.6519C43.516 27.2686 44 24.6908 44 21.9998C44 19.3087 43.516 16.731 42.6316 14.3477H1.36838C0.484086 16.731 0 19.3087 0 21.9998C0 24.6908 0.484086 27.2686 1.36838 29.6519L22 31.565L42.6316 29.6519Z"
        fill="#0052B4"
      />
      <Path
        d="M21.9988 44.0002C31.458 44.0002 39.522 38.03 42.6304 29.6523H1.36719C4.47563 38.03 12.5396 44.0002 21.9988 44.0002Z"
        fill="#D80027"
      />
    </G>
    <Defs>
      <ClipPath id="clip0">
        <Rect width="44" height="44" fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

export default RU;
