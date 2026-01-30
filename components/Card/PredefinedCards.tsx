
import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from './Card';
import Cart from '../cardWelkome/Cart';
import RepaireIcon from '../cardWelkome/Repaire';
import PackageIcon from '../cardWelkome/Package';
import ViewIcon from '../cardWelkome/View';

interface CardProps {
  onPress: () => void;
  selected: boolean;
}

export const BuyProductCard = ({ onPress, selected }: CardProps) => {
  const { t } = useTranslation();
  return (
    <Card
      icon={<RepaireIcon/>}
      text={t('home.machineCnc')}
      onPress={onPress}
      selected={selected}
    />
  );
};

export const RepairDeviceCard = ({ onPress, selected }: CardProps) => {
  const { t } = useTranslation();
  return (
    <Card
      icon={<Cart />}
      text={t('home.tools')}
      onPress={onPress}
      selected={selected}
    />
  );
};

export const ReceiveOrderCard = ({ onPress, selected }: CardProps) => {
  const { t } = useTranslation();
  return (
    <Card
      icon={<PackageIcon />}
      text={t('home.learning')}
      onPress={onPress}
      selected={selected}
    />
  );
};
export const ViewIconCard = ({ onPress, selected }: CardProps) => {
  const { t } = useTranslation();
  return (
    <Card
      icon={<ViewIcon />}
      text={t('home.settings')}
      onPress={onPress}
      selected={selected}
    />
  );
};
