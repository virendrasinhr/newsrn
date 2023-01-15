import React from 'react'
import styles from './styles'
import { ScrollView, View, Text, Image, Switch, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native'
import moment from 'moment';
import Header from '../../commonComponents/header';
import commonStyles from '../../common/commonStyles';

const NewsDetails = ({ navigation, ...props }) => {

    const { container, flexContainer } = commonStyles;
    const { title, textContainer, image, parentContainer, description,
        infotxt, source, content } = styles
    const newsDetails = props?.route?.params?.newsDetails;

    return (
        <SafeAreaView style={flexContainer}>
            <View style={container}>
                <Header
                    leftIcon={"arrow-left"}
                    title={"Details News"}
                    rightIcon={"bookmark"}
                    onLeftPress={() => { navigation.goBack() }}
                    onRightPress={() => { navigation.navigate("BookMark") }}
                />
                <ScrollView>
                    <View style={parentContainer}>
                        <Image source={{ uri: newsDetails?.urlToImage }} style={image} />
                        <Text style={title}>{newsDetails?.title}</Text>
                        <View style={textContainer}>
                            <Text style={infotxt}>Author: {newsDetails?.author}</Text>
                            <Text style={infotxt}>Published at: {moment(newsDetails?.publishedAt).format("DD MMM YYYY")}</Text>
                        </View>
                        <Text style={description}>{newsDetails?.description}</Text>
                        <Text style={content}>{newsDetails?.content}</Text>
                        {newsDetails?.source?.name && <Text style={source}>Source: {newsDetails?.source?.name}</Text>}

                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>


        // <SafeAreaView style={{ flex: 1, }}>
        //     <StatusBar barStyle="dark-content" backgroundColor="transparent" cont translucent={true} />

        //     <View style={[container, { backgroundColor: 'red' }]}>
        //         <Header
        //             leftIcon={"arrow-left"}
        //             title={"Details News"}
        //             rightIcon={"bookmark"}
        //             onLeftPress={() => { navigation.goBack() }}
        //             onRightPress={() => { navigation.navigate("BookMark") }}
        //         />

        //             <View style={{flex:1, minHeight: "100%", borderRadius:6}}>
        //                 <Image
        //                     style={image}
        //                     source={{ uri: newsDetails?.urlToImage }}
        //                 />
        //                 </View>
        //                 <View style={{flex:1}}>
        //                 <Text style={title}>{newsDetails?.title}</Text>
        //                 <View style={newsDetails?.author && authorContainer}>
        //                     {newsDetails?.author && <Text style={author}>Author: {newsDetails?.author}</Text>}
        //                     {newsDetails?.publishedAt && <Text style={[date]}>Date: {moment(newsDetails?.publishedAt).format("DD MMM YYYY")}</Text>}
        //                 </View>
        //                 <Text style={description}>{newsDetails?.description}</Text>
        //                 <Text style={content}>{newsDetails?.content}</Text>
        //             </View>
        //         </ScrollView>
        //     </View>
        // </SafeAreaView >
    )
}

export default NewsDetails;