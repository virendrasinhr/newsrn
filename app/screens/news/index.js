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
import { color } from '../../common/colors'

const News = ({ navigation }) => {

    const dispatch = useDispatch();

    const { container, flexContainer } = commonStyles;
    const { loader, center, newsContainer } = styles;
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        getNewsListing();
    }, [])

    const getNewsListing = async () => {
        try {
            let newsResponse = await getNews({ country: "in" });
            if (newsResponse?.status == "ok") {
                setNews(newsResponse?.articles);
            }
        } catch (err) {
            setNews(data);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const onRefresh = () => {
        setRefreshing(true);
        getNewsListing();
    }

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
            {!loading &&
                <View style={container}>
                    <Header
                        leftIcon={"bars"}
                        title={"News"}
                        rightIcon={"bookmark"}
                        onRightPress={() => { navigation.navigate("BookMark") }}
                    />
                    <FlatList
                        data={news}
                        style={newsContainer}
                        keyExtractor={news => news.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={renderNewsList}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                            />
                        } />
                </View>
                ||
                <View style={center}>
                    <ActivityIndicator style={loader} size="large" color={color.gray1N} />
                </View>}
        </SafeAreaView >
    )
}

export default News;