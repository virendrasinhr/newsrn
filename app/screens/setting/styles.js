import { StyleSheet } from "react-native";
import { color } from "../../common/colors";
import { fontFamily } from "../../common/fonts";

const styles = StyleSheet.create({
    profileImageStyle: {
        width: 50,
        height: 50,
        borderRadius: 80
    },
    profileTitleStyle: {
        fontSize: 20,
        color: color.black,
        fontFamily: fontFamily.robotoBold
    },
    profileSubTitleStyle: {
        color: color.gray1N,
        fontFamily: fontFamily.robotoLight
    },
    rightIconStyle: {
        width: 10
    },
    titleStyle: {
        color: color.black,
        fontFamily: fontFamily.robotoBold,
        fontSize: 25,
        marginTop: 40
    },
    mainContainer: {
        flex: 1,
        backgroundColor: color.primary,
        padding: 16,
        paddingVertical: 10
    },
    borderTop: {
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        marginTop: 20
    },
    borderBottom: {
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10
    },
    borderTopBotView: {
        borderRadius: 10
    },
    profileTitle: {
        fontSize: 20,
        fontFamily: fontFamily.robotoBold,
        color: color.black
    },
    settingSubTitle: {
        fontSize: 12,
        fontFamily: fontFamily.robotoBold,
        color: color.black
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 50 / 2,
        marginRight: 10
    },
    containerflex: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    rightContainer: {
        marginLeft: 10,
    },
    leftIconImage: {
        width: 20,
        height: 20,
        borderRadius: 20 / 8,
        marginRight: 10
    },
    rightIconImage: {
        width: 12,
        height: 12,
    },
    settingTitle: {
        color: color.black,
        fontFamily: fontFamily.robotoLight,
        fontSize: 14,
        marginBottom: 2
    },
    childContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    rightViewContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    statusParent: {
        marginRight: 5
    },
    switchBorder: {
        borderRadius: 20
    },
    versionNumber: {
        alignSelf: 'flex-end',
        marginVertical: 10,
        marginHorizontal: 10,
        color: color.black,
        fontFamily: fontFamily.robotoLight,
        fontSize: 10
    }
})

export default styles