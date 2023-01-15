import React from 'react';
import { View, Text, TouchableOpacity, Image, ImageBackground, Touchable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSelector } from 'react-redux';
import { color } from '../../common/colors';
import styles from './styles';

const NewsCard = ({ news, onNewsClick, onBookMarkClick }) => {

    const { cardContainer, imageContainer, titleContainer, title, textContainer, iconContainer } = styles;
    const bookMark = useSelector(state => state.bookmarks);

    return (
        <TouchableOpacity style={cardContainer} onPress={() => { onNewsClick(news?.item) }}>
            <ImageBackground
                source={{ uri: news?.item?.urlToImage }}
                style={imageContainer}
                imageStyle={imageContainer}>
                <TouchableOpacity style={[iconContainer]} onPress={() => { onBookMarkClick(news?.item) }}>
                    <Icon name={bookMark?.data?.some(bookMark => bookMark?.title == news?.item?.title) &&
                        "bookmark" || "bookmark-o"} size={20} color={color.secondary} />
                </TouchableOpacity>
                <View style={textContainer}>
                    <View style={titleContainer}>
                        <Text ellipsizeMode='tail' numberOfLines={2} style={title}>{news?.item?.title}</Text>
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    )
};


export default NewsCard;