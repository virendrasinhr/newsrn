import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { color } from '../../common/colors';
import styles from './styles';

const Header = ({ title, leftIcon, rightIcon, onLeftPress, onRightPress }) => {

    const { headerContainer, leftContainer, icon, centerContainer, headerTitle, rightContainer } = styles;

    return (
        <View style={styles.headerContainer}>
            <View style={styles.leftContainer}>
                <TouchableOpacity onPress={onLeftPress}>
                    <Icon name={leftIcon} size={20} color={color.secondary} />
                </TouchableOpacity>
            </View>
            <View style={styles.centerContainer}>
                <Text style={styles.headerTitle}>{title}</Text>
            </View>
            <View style={styles.rightContainer}>
                <TouchableOpacity onPress={onRightPress}>
                    <Icon name={rightIcon} size={20} color={color.secondary} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default Header;
