import { View, SafeAreaView, Animated } from "react-native";
import React, { useRef, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppLogo from "../assets/applogo-lightbg.png";
import { useNavigation } from "@react-navigation/native";

const StartScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.sequence([
        //Scale logo from small to big
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        //Flash effect
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setTimeout(() => {
          navigation.navigate("Preview");
        }, 3000);
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: "#F0F4F7",
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Animated.Image
          source={AppLogo}
          style={{
            width: 180,
            height: 180,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default StartScreen;
