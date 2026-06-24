import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
} from "react-native";
import React, { useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MyStyles } from "./stylesheet/MyStyles";
import * as SecureStore from "expo-secure-store";

const Preview = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = Dimensions.get("window");

  const slides = [
    {
      id: "1",
      image: require("../assets/preview/firstprev.png"),
      title: "Request and Track",
      description:
        "Get barangay clearances, reserve court, file blotters, and track them in real-time — all in one place.",
    },
    {
      id: "2",
      image: require("../assets/preview/secondprev.png"),
      title: "Be Prepared and Safe",
      description:
        "Access SOS, emergency hotlines, river monitoring, and disaster tips anytime.",
    },
    {
      id: "3",
      image: require("../assets/preview/thirdprev.png"),
      title: "Stay Updated",
      description:
        "Get the latest announcements, events, and weather info straight from your barangay.",
    },
  ];

  const handleScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  const isLastSlide = currentIndex === slides.length - 1;

  const renderItem = ({ item }) => (
    <View
      style={[
        MyStyles.slideContainer,
        {
          width,
        },
      ]}
    >
      <Image source={item.image} style={MyStyles.slideImg} />
      <Text style={[MyStyles.header, MyStyles.previewTitle]}>{item.title}</Text>
      <Text
        style={[MyStyles.textMedium, { marginTop: 10, textAlign: "center" }]}
      >
        {item.description}
      </Text>
    </View>
  );

  const handleLogin = async () => {
    await SecureStore.setItemAsync("hasLaunched", "true");
    navigation.navigate("Login");
  };

  const handleSignUp = async () => {
    await SecureStore.setItemAsync("hasLaunched", "true");
    navigation.navigate("Signup");
  };

  const goToNextSlide = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < slides.length) {
      flatListRef.current.scrollToIndex({ index: nextIndex });
      setCurrentIndex(nextIndex);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: "#fff",
      }}
    >
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onMomentumScrollEnd={handleScroll}
        />

        {/* Pagination Dots */}
        <View style={MyStyles.paginationDotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                MyStyles.paginationDot,
                {
                  backgroundColor: currentIndex === index ? "#0E94D3" : "#ccc",
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Bottom Buttons */}
      <View
        style={{
          width: "100%",
          alignItems: "center",
          justifyContent: "flex-end",
          flex: 1,
          padding: 20,
        }}
      >
        {isLastSlide ? (
          <>
            {/* Join Us Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              style={MyStyles.button}
              accessibilityLabel="Join the community"
              activeOpacity={0.8}
            >
              <Text style={MyStyles.buttonsText}>Join Us</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={MyStyles.haveanaccounttext}>Have an account? </Text>
              <TouchableOpacity
                onPress={handleLogin}
                accessibilityLabel="Go to Login"
              >
                <Text style={MyStyles.logintext}> Login</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* Next Button */
          <View
            style={{
              width: "100%",
              alignItems: "center",
              justifyContent: "flex-end",
              flex: 1,
              padding: 20,
            }}
          >
            <TouchableOpacity
              onPress={goToNextSlide}
              style={[MyStyles.button]}
              accessibilityLabel="Go to Next Slide"
              activeOpacity={0.8}
            >
              <Text style={MyStyles.buttonsText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Preview;
