import { StyleSheet } from 'react-native';
import { color } from '../../../common/colors';
import { fontFamily } from '../../../common/fonts';

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    letterSpacing: 0.04,
    fontFamily: fontFamily.robotoBold,
    textTransform: 'capitalize',
    marginBottom: 10
  },
  tabBarStyle: {
    paddingVertical: 5,
    backgroundColor: color.primary,
    shadowColor: color.black,
  },
  tabImage: {
    width: 25,
    height: 25,
  },
});

export default styles;
