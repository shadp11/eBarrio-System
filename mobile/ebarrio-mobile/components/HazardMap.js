import React, { useState } from "react";
import {
  Text,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import ImageViewing from "react-native-image-viewing";

const HazardMap = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Separate visibility states for each image
  const [visibleFire, setVisibleFire] = useState(false);
  const [visibleFlood, setVisibleFlood] = useState(false);
  const [visibleEarthquake, setVisibleEarthquake] = useState(false);

  const fireHazardMap = Image.resolveAssetSource(
    require("../assets/hazard-map/fire-hazard-map.jpg")
  ).uri;

  const floodHazardMap = Image.resolveAssetSource(
    require("../assets/hazard-map/flood-hazard-map.png")
  ).uri;

  const earthquakeHazardMap = Image.resolveAssetSource(
    require("../assets/hazard-map/earthquake-hazard-map.png")
  ).uri;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: "#BC0F0F",
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            MyStyles.scrollContainer,
            {
              gap: 10,
              backgroundColor: "#BC0F0F",
            },
          ]}
        >
          <AntDesign
            onPress={() => navigation.navigate("Readiness")}
            name="arrowleft"
            style={[MyStyles.backArrow, { color: "#fff" }]}
          />

          <Text
            style={[MyStyles.servicesHeader, { marginTop: 0, color: "#fff" }]}
          >
            Hazard Maps
          </Text>

          {/* Fire Map */}
          <View>
            <Text style={MyStyles.hazardTitle}>Fire</Text>

            <TouchableOpacity onPress={() => setVisibleFire(true)}>
              <Image
                source={require("../assets/hazard-map/fire-hazard-map.jpg")}
                style={MyStyles.evacuationImg}
                resizeMode="cover"
              />
              <View style={MyStyles.mapOverlay}>
                <Text style={MyStyles.mapOverlayText}>Click to View</Text>
              </View>
            </TouchableOpacity>

            <ImageViewing
              images={[{ uri: fireHazardMap }]}
              imageIndex={0}
              visible={visibleFire}
              onRequestClose={() => setVisibleFire(false)}
            />
          </View>

          {/* Flood Map */}
          <View>
            <Text style={MyStyles.hazardTitle}>Flood</Text>

            <TouchableOpacity onPress={() => setVisibleFlood(true)}>
              <Image
                source={require("../assets/hazard-map/flood-hazard-map.png")}
                style={MyStyles.evacuationImg}
                resizeMode="cover"
              />
              <View style={MyStyles.mapOverlay}>
                <Text style={MyStyles.mapOverlayText}>Click to View</Text>
              </View>
            </TouchableOpacity>

            <ImageViewing
              images={[{ uri: floodHazardMap }]}
              imageIndex={0}
              visible={visibleFlood}
              onRequestClose={() => setVisibleFlood(false)}
            />
          </View>

          {/* Earthquake Map */}
          <View>
            <Text style={MyStyles.hazardTitle}>Earthquake</Text>

            <TouchableOpacity onPress={() => setVisibleEarthquake(true)}>
              <Image
                source={require("../assets/hazard-map/earthquake-hazard-map.png")}
                style={MyStyles.evacuationImg}
                resizeMode="cover"
              />
              <View style={MyStyles.mapOverlay}>
                <Text style={MyStyles.mapOverlayText}>Click to View</Text>
              </View>
            </TouchableOpacity>

            <ImageViewing
              images={[{ uri: earthquakeHazardMap }]}
              imageIndex={0}
              visible={visibleEarthquake}
              onRequestClose={() => setVisibleEarthquake(false)}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default HazardMap;
