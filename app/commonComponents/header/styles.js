import { StyleSheet } from 'react-native';
import { color } from '../../common/colors';
import { fontFamily } from '../../common/fonts';

const styles = StyleSheet.create({
    headerContainer: {
        height: 50,
        paddingHorizontal: 5,
        flexDirection: 'row',
        alignItems: 'center',
      },
      centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
      leftContainer: {
        width: 50,
        alignItems: 'flex-start',
      },
      rightContainer: {
        width: 50,
        alignItems: 'flex-end',
      },
      headerTitle: {
        fontFamily: fontFamily.robotoBold,
        fontSize: 18,
        textAlign: 'center',
        color: color.secondary
      },
      icon: {
        width: 25,
        height: 25,
        resizeMode: 'contain',
      }
});

export default styles;
