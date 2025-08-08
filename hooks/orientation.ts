import { Dimensions } from "react-native";



export const getOrientation = () => {
  const { width, height } = Dimensions.get('window');
  return width < height ? 'portrait' : 'landscape';
}