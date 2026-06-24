import {
  StyleSheet,
  Text,
  View,
  Alert,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Image,
} from "react-native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const Profile = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <SafeAreaView
      style={{ flex: 1, paddingTop: insets.top, backgroundColor: "#DCE5EB" }}
    >
      {/* <ScrollView
        contentContainerStyle={[
          MyStyles.scrollContainer,
          {
            paddingBottom: insets.bottom + 70,
          },
        ]}
      >
        <MaterialIcons
          onPress={() => navigation.navigate("BottomTabs")}
          name="arrow-back-ios"
          size={24}
          color="#04384E"
        />
        <Text style={[MyStyles.header, { marginTop: 10 }]}>Profile</Text>
        <Image
          source={{
            uri: userDetails.resID?.picture || userDetails.empID?.resID.picture,
          }}
          style={{
            width: 160,
            height: 160,
            borderRadius: 100,
            backgroundColor: "white",
            borderWidth: 3,
            borderColor: "#C1C0C0",
            alignSelf: "center",
          }}
        />

        <View style={{ gap: 15 }}>
          <View>
            <Text
              style={{ color: "#04384E", fontWeight: "bold", fontSize: 16 }}
            >
              First Name
            </Text>
            <Text
              style={{
                width: "100%",
                height: 45,
                borderWidth: 1,
                borderColor: "#ACACAC",
                backgroundColor: "#fff",
                borderRadius: 15,
                textAlign: "start", 
                textAlignVertical: "start", 
                lineHeight: 45, 
                paddingLeft: 10, 
              }}
            >
              {userDetails.resID?.firstname ||
                userDetails.empID?.resID.firstname}
            </Text>
          </View>

          <View>
            <Text
              style={{ color: "#04384E", fontWeight: "bold", fontSize: 16 }}
            >
              Last Name
            </Text>
            <Text
              style={{
                width: "100%",
                height: 45,
                borderWidth: 1,
                borderColor: "#ACACAC",
                backgroundColor: "#fff",
                borderRadius: 15,
                textAlign: "start",
                textAlignVertical: "start", 
                lineHeight: 45, 
                paddingLeft: 10, 
              }}
            >
              {userDetails.resID?.lastname || userDetails.empID?.resID.lastname}
            </Text>
          </View>

          <View>
            <Text
              style={{ color: "#04384E", fontWeight: "bold", fontSize: 16 }}
            >
              Username
            </Text>
            <Text
              style={{
                width: "100%",
                height: 45,
                borderWidth: 1,
                borderColor: "#ACACAC",
                backgroundColor: "#fff",
                borderRadius: 15,
                textAlign: "start", 
                textAlignVertical: "start", 
                lineHeight: 45,
                paddingLeft: 10, 
              }}
            >
              {userDetails.resID?.username || userDetails.empID?.resID.username}
            </Text>
          </View>

          <View>
            <Text
              style={{ color: "#04384E", fontWeight: "bold", fontSize: 16 }}
            >
              Email Address
            </Text>
            <Text
              style={{
                width: "100%",
                height: 45,
                borderWidth: 1,
                borderColor: "#ACACAC",
                backgroundColor: "#fff",
                borderRadius: 15,
                textAlign: "start", 
                textAlignVertical: "start", 
                lineHeight: 45, 
                paddingLeft: 10, 
              }}
            >
              {userDetails.resID?.email || userDetails.empID?.resID.email}
            </Text>
          </View>

          <View>
            <Text
              style={{ color: "#04384E", fontWeight: "bold", fontSize: 16 }}
            >
              Mobile Number
            </Text>
            <Text
              style={{
                width: "100%",
                height: 45,
                borderWidth: 1,
                borderColor: "#ACACAC",
                backgroundColor: "#fff",
                borderRadius: 15,
                textAlign: "start",
                textAlignVertical: "start", 
                lineHeight: 45,
                paddingLeft: 10,
              }}
            >
              {userDetails.resID?.mobilenumber ||
                userDetails.empID?.resID.mobilenumber}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: "#04384E", fontWeight: "bold", fontSize: 16 }}
              >
                Gender
              </Text>
              <Text
                style={{
                  width: "100%",
                  height: 45,
                  borderWidth: 1,
                  borderColor: "#ACACAC",
                  backgroundColor: "#fff",
                  borderRadius: 15,
                  textAlign: "start", 
                  textAlignVertical: "start", 
                  lineHeight: 45,
                  paddingLeft: 10,
                }}
              >
                {userDetails.resID?.sex || userDetails.empID?.resID.sex}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{ color: "#04384E", fontWeight: "bold", fontSize: 16 }}
              >
                Birthdate
              </Text>
              <Text
                style={{
                  width: "100%",
                  height: 45,
                  borderWidth: 1,
                  borderColor: "#ACACAC",
                  backgroundColor: "#fff",
                  borderRadius: 15,
                  textAlign: "start", 
                  textAlignVertical: "start", 
                  lineHeight: 45,
                  paddingLeft: 10,
                }}
              >
                {userDetails.resID?.birthdate ||
                  userDetails.empID?.resID.birthdate}
              </Text>
            </View>
          </View>

          <View>
            <Text
              style={{ color: "#04384E", fontWeight: "bold", fontSize: 16 }}
            >
              Address
            </Text>
            <Text
              style={{
                width: "100%",
                height: 45,
                borderWidth: 1,
                borderColor: "#ACACAC",
                backgroundColor: "#fff",
                borderRadius: 15,
                textAlign: "start", 
                textAlignVertical: "start", 
                lineHeight: 45,
                paddingLeft: 10, 
              }}
            >
              {userDetails.resID?.address || userDetails.empID?.resID.address}
            </Text>
          </View>
        </View>
      </ScrollView> */}
    </SafeAreaView>
  );
};

export default Profile;
