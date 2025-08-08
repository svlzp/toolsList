import React from 'react';
import Svg, { Path, G, ClipPath, Rect, Defs } from 'react-native-svg';

const IconSms = ({color="#BFC0C7"}) => (
  <Svg width="60" height="60" viewBox="0 0 60 60" fill="none">
    <Path d="M0 30C0 13.4315 13.4315 0 30 0C46.5685 0 60 13.4315 60 30C60 46.5685 46.5685 60 30 60C13.4315 60 0 46.5685 0 30Z" fill={color}/>
    <G clipPath="url(#clip0)">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 28.4429C12 19.1953 20.2299 12 30 12C39.7701 12 48 19.1953 48 28.4429C48 37.6905 39.7701 44.8858 30 44.8858C28.5478 44.8858 27.1342 44.7287 25.7789 44.4315C23.6334 45.8452 20.6772 47.0017 16.982 47.9413C16.4881 48.0668 15.9669 47.9894 15.5258 47.7248C14.3312 47.0081 14.3899 45.6285 14.9829 44.5397C15.7853 43.053 16.5433 41.5226 17.1025 39.9154C13.9692 36.9774 12 32.9379 12 28.4429Z"
        fill="white"
      />
    </G>
    <Defs>
      <ClipPath id="clip0">
        <Rect width="36" height="36" fill="white" transform="translate(12 12)" />
      </ClipPath>
    </Defs>
  </Svg>
);

export default IconSms;
