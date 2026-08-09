import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTabContentBottomInset } from '../utils/tabLayout';

export { TAB_BAR_BASE_HEIGHT } from '../utils/tabLayout';

export const useTabContentBottomInset = () => {
  const { bottom } = useSafeAreaInsets();
  return getTabContentBottomInset(bottom);
};
