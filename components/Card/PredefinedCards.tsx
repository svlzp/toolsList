
import React from 'react';
import Card from './Card';
import Cart from '../cardWelkome/Cart';
import RepaireIcon from '../cardWelkome/Repaire';
import PackageIcon from '../cardWelkome/Package';
import ViewIcon from '../cardWelkome/View';

interface CardProps {
  onPress: () => void;
  selected: boolean;
}

export const BuyProductCard = ({ onPress, selected }: CardProps) => (
  <Card
    icon={<Cart />}
    text="Machine CNC"
    onPress={onPress}
    selected={selected}
  />
);

export const RepairDeviceCard = ({ onPress, selected }: CardProps) => (
  <Card
    icon={<RepaireIcon />}
    text="Tools"
    onPress={onPress}
    selected={selected}
  />
);

export const ReceiveOrderCard = ({ onPress, selected }: CardProps) => (
  <Card
    icon={<PackageIcon />}
    text="Learning"
    onPress={onPress}
    selected={selected}
  />
);
export const ViewIconCard = ({ onPress, selected }: CardProps) => (
    <Card
      icon={<ViewIcon />}
      text='Settings'
      onPress={onPress}
      selected={selected}
    />
  );
