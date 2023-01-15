import React, { useEffect, useState } from 'react'
import styles from './styles'
import { ScrollView, View, Text, SafeAreaView, StatusBar, RefreshControl, ActivityIndicator } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import Header from '../../commonComponents/header'
import commonStyles from '../../common/commonStyles'
import { useDispatch, useSelector } from 'react-redux'
import { toggleBookmark } from '../../store/Slice/bookmarkSlice'
import { getNews } from '../../store/services/newsService'
import NewsCard from '../../commonComponents/newsCard'

const BookMark = ({ navigation }) => {

    const dispatch = useDispatch();
    const bookMark = useSelector(state => state.bookmarks);

    const { container, parentView } = commonStyles;
    const { flexContainer } = styles;

    const onBookMarkClick = (bookMark) => {
        dispatch(toggleBookmark({ bookMark: bookMark, title: bookMark?.title }));
    }

    const renderNewsList = (news, index) => (
        <NewsCard
            news={news}
            onNewsClick={(newsDetails) => { navigation.navigate("NewsDetails", { newsDetails: newsDetails }) }}
            onBookMarkClick={(bookMark) => { onBookMarkClick(bookMark) }}
        />
    );

    return (
        <SafeAreaView style={flexContainer}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" cont translucent={true} />
            <View style={container}>
                <Header
                    leftIcon={"arrow-left"}
                    title={"BookMark"}
                    onLeftPress={() => { navigation.goBack() }}
                />
                <View style={parentView}>
                    <FlatList
                        data={bookMark?.data}
                        keyExtractor={news => news.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={renderNewsList}
                    />
                </View>
            </View>
        </SafeAreaView >
    )
}

export default BookMark;