import { StyleSheet } from "react-native";
import { color } from "../../common/colors";
import { fontFamily } from "../../common/fonts";

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        marginVertical: 10,
    },
    imageContainer: {
        flex: 1,
        minHeight: 200,
        flexDirection: 'column',
        borderRadius: 6,
        backgroundColor: color.primary,
    },
    iconContainer:{
        alignItems: 'flex-end',
        paddingHorizontal: 20
    },  
    textContainer: {
        flex: 1 ,
        borderRadius: 6,
        justifyContent: 'flex-end'
    },  
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    titleContainer: {
        width: "100%",
        padding: 10,
        borderRadius: 6,
        backgroundColor: color.primary,
        alignSelf: 'flex-end',
        bottom: 0
    },
    title: {
        fontSize: 16,
        color: color.gray1N,
        fontFamily: fontFamily.robotoBold
    },
    loader:{
        flex:1,
        alignSelf: 'center'
    },
    center:{
        flex:1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    flexContainer:{
        flex:1
    }
})

export default styles