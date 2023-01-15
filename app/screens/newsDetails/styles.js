import { StyleSheet } from "react-native";
import { color } from "../../common/colors";
import { fontFamily } from "../../common/fonts";

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        marginBottom: 10,
      },
      textContainer: {
        flex: 1,
        marginTop: 5,
        flexDirection: 'row',
        justifyContent: 'space-between'
      },
      infotxt: {
        fontSize: 13,
        color: color.black,
        fontFamily: fontFamily.robotoLight,
        marginBottom: 5,
        width: '50%'
      },
      content: {
        fontSize: 16,
        textAlign: 'justify',
        color: color.gray0N,
        fontFamily: fontFamily.robotoBold
      },
      title:{
        fontSize: 18,
        textAlign: 'justify',
        color: color.black,
        fontFamily: fontFamily.robotoBold
      },
      description:{
        fontSize: 16,
        marginBottom: 5,
        textAlign: 'justify',
        color: color.black,
        fontFamily: fontFamily.robotoLight
      },
      source:{
        fontSize: 13,
        color: color.black,
        marginVertical: 10,
        fontFamily: fontFamily.robotoLight
      },
      parentContainer:{
        marginVertical: 10
      }
})

export default styles