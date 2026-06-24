import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RFPercentage } from "react-native-responsive-fontsize";

//ICONS
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

const SafetyTips = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const disasters = [
    {
      image: require("../assets/disasters/earthquake.png"),
      title: "EARTHQUAKE",
      subtitle: "Ground Movement",
      route: "Earthquake",
    },
    {
      image: require("../assets/disasters/fire.png"),
      title: "FIRE",
      subtitle: "Rapid Burning",
      route: "Fire",
    },
    {
      image: require("../assets/disasters/flood.png"),
      title: "FLOOD",
      subtitle: "Water Rise",
      route: "Flood",
    },
    {
      image: require("../assets/disasters/typhoon.png"),
      title: "TYPHOON",
      subtitle: "Wind and Rain",
      route: "Typhoon",
    },
  ];

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
              backgroundColor: "#BC0F0F",
              gap: 10,
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
            Disaster Safety Tips
          </Text>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View style={{ width: "100%", gap: 60 }}>
              {[0, 1].map((row) => (
                <View
                  key={row}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  {disasters.slice(row * 2, row * 2 + 2).map((item, index) => (
                    <TouchableOpacity
                      key={`${row}-${index}`}
                      style={MyStyles.safetyTipsCard}
                      onPress={
                        item.route
                          ? () => navigation.navigate(item.route)
                          : null
                      }
                    >
                      <Image
                        source={item.image}
                        style={[
                          MyStyles.readinessImg,
                          {
                            width: RFPercentage(8),
                            height: RFPercentage(8),
                            marginRight: 0,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          MyStyles.readinessTitle,
                          { fontSize: RFPercentage(2) },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          MyStyles.readinessSubTitle,
                          { textAlign: "center" },
                        ]}
                      >
                        {item.subtitle}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SafetyTips;
