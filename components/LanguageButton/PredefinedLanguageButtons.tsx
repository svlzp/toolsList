import React from 'react';
import LangvichButton, { LanguageButtonProps } from './LanguageButton';
import RU from '../assetsTablet/iconButtonLanguage/RU';
import EN from '../assetsTablet/iconButtonLanguage/EN';
import HE from '../assetsTablet/iconButtonLanguage/HE';


interface PredefinedButtonProps extends Omit<LanguageButtonProps, 'icon' | 'tooltip'> {}


export const RussianButton: React.FC<PredefinedButtonProps> = ({
  onPress = ()=>('Russian Button Clicked'),
  selected,
  selectedRadio,
  color = '#000',
  size = 24,
  style,
}) => (
  <LangvichButton
    icon={<RU />}
    onPress={onPress}
    color={color}
    size={size}
    tooltip="Русский"
    selected={selected}
    selectedRadio={selectedRadio}
    style={style}
  />
);


export const EnglishButton: React.FC<PredefinedButtonProps> = ({
  onPress = () => ('English Button Clicked'),
  selected,
  selectedRadio,
  color = '#000',
  size = 24,
  style,
}) => (
  <LangvichButton
    icon={<EN />}
    onPress={onPress}
    color={color}
    size={size}
    tooltip="English"
    selected={selected}
    selectedRadio={selectedRadio}
    style={style}
  />
);

export const HebrewButton: React.FC<PredefinedButtonProps> = ({
  onPress = () => ('Hebrew Button Clicked'),
  selected,
  selectedRadio,
  color = '#000',
  size = 24,
  style,
}) => (
  <LangvichButton
    icon={<HE />}
    onPress={onPress}
    color={color}
    size={size}
    tooltip="עברית"
    selected={selected}
    selectedRadio={selectedRadio}
    style={style}
  />
);
