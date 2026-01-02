declare module 'react-native-vector-icons/MaterialIcons' {
  import { ComponentType } from 'react';
  type Props = {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  };
  const Icon: ComponentType<Props>;
  export default Icon;
}
