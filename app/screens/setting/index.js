import React, { useState } from 'react'
import styles from './styles'
import { ScrollView, View, Text, Image, Switch, TouchableOpacity, SafeAreaView } from 'react-native'
import { listOfSettings } from '../../common/constant'
import Header from '../../commonComponents/header'
import commonStyles from '../../common/commonStyles'
import { color } from '../../common/colors'


const Setting = ({ navigation, ...props }) => {

    const { settingTitleStyle, profileImageStyle, profileTitleStyle, profileSubTitleStyle,
        rightIconStyle, settingStatusStyle, mainContainer, borderTop, borderBottom, borderTopBotView,
        settingTitle, settingSubTitle, profileImage, containerflex, rightContainer, rightIconImage,
        profileTitle, childContainer, rightViewContainer, statusParent, switchBorder, versionNumber } = styles

    const { container, parentView } = commonStyles;
    const [settingList, setSettingList] = useState(listOfSettings);
    const [refresh, setRefresh] = useState(!refresh);

    const setSwitch = (index, value) => {
        settingList[index].isSwitchEnabled = value;
        setSettingList(settingList);
        setRefresh(!refresh);
    }

    return (
        <SafeAreaView>
            <ScrollView>
                <View style={container}>
                    <Header
                        leftIcon={"bars"}
                        title={"Settings"}
                        rightIcon={"bookmark"}
                        onRightPress={() => { navigation.navigate("BookMark") }}
                    />
                    <View style={parentView}>
                        {settingList.map((data, index) => {
                            let borderTopView = false;
                            let borderTopBottom = false;
                            if (index == 0) {
                                borderTopBottom = true;
                            }
                            if (settingList[index - 1]?.isBreak == true) {
                                borderTopView = true;
                            }

                            return (
                                <>
                                    {!data?.isVersionTxt && <TouchableOpacity key={index} disabled={data?.isSwitch} onPress={() => { }}>
                                        <View style={[mainContainer, borderTopView && borderTop, data?.isBreak && borderBottom, borderTopBottom && borderTopBotView]}>
                                            <View style={containerflex}>
                                                <View style={childContainer}>
                                                    {data?.leftIcon && data?.isProfile && <Image source={{ uri: data?.leftIcon }} style={[profileImage, profileImageStyle]} />}
                                                    <View style={rightContainer}>
                                                        <Text style={data?.isProfile && [profileTitle, profileTitleStyle] || [settingTitle, settingTitleStyle]}>{data?.titleTxt}</Text>
                                                        {data?.isProfile && <Text style={[settingSubTitle, profileSubTitleStyle]}>{data?.subTxt}</Text>}
                                                    </View>
                                                </View>
                                                {data?.isSwitch && data?.rightIcon &&
                                                    <View style={[{ backgroundColor: data?.isSwitchEnabled ? color.secondary : color.gray2N }, switchBorder]} >
                                                        <Switch
                                                            trackColor={{ false: color.gray2N, true: color.secondary }}
                                                            thumbColor={color.primary}
                                                            ios_backgroundColor={color.gray2N}
                                                            onValueChange={(value) => { setSwitch(index, value) }}
                                                            value={data?.isSwitchEnabled}
                                                        />
                                                    </View>
                                                    ||
                                                    <View style={rightViewContainer}>
                                                        <View style={statusParent}>
                                                            <Text style={[settingTitle, settingStatusStyle]}>{data?.statusTxt}</Text>
                                                        </View>
                                                        {data?.rightIcon && <Image source={{ uri: data?.rightIcon }} style={[rightIconImage, rightIconStyle]} />}
                                                    </View>
                                                }
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                        ||
                                        <Text style={versionNumber}>{data?.titleTxt + " " + data?.versionNumber}</Text>
                                    }
                                </>
                            )
                        })}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Setting;