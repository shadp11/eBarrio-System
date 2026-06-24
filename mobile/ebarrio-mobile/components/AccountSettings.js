import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { InfoContext } from "../context/InfoContext";
import LoadingScreen from "./LoadingScreen";

//ICONS
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { MaterialIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";

const AccountSettings = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [pushNotifEnabled, setPushNotifEnabled] = useState(false);
  const [appNotifEnabled, setAppNotifEnabled] = useState(false);
  const { userDetails, fetchUserDetails } = useContext(InfoContext);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  if (!userDetails) {
    return <LoadingScreen />;
  }

  const pictureUri =
    userDetails.resID?.picture || userDetails.empID?.resID?.picture;

  const firstName =
    userDetails.resID?.firstname || userDetails.empID?.resID?.firstname;

  const lastName =
    userDetails.resID?.lastname || userDetails.empID?.resID?.lastname;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: "#F0F4F7",
      }}
    >
      <ScrollView
        contentContainerStyle={[MyStyles.scrollContainer, { gap: 10 }]}
      >
        <AntDesign
          onPress={() => navigation.navigate("BottomTabs")}
          name="arrowleft"
          style={MyStyles.backArrow}
        />

        {/* First Calendar Text */}
        <Text style={[MyStyles.servicesHeader, { marginTop: 0 }]}>
          Account Settings
        </Text>

        {/* <View
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={{
              uri: pictureUri,
            }}
            onLoad={() => setImageLoaded(true)}
            style={[
              MyStyles.profilePic,
              { width: 150, height: 150, borderRadius: 75 },
            ]}
          />
          <Text
            style={{
              fontSize: 18,
              color: "#04384E",
              fontFamily: "REMSemiBold",
            }}
          >
            {`${firstName} ${lastName}`}
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: "#808080",
              fontFamily: "QuicksandBold",
            }}
          >
            {userDetails.username}
          </Text>
        </View> */}
        <Text style={MyStyles.securityText}>Security</Text>

        <View style={MyStyles.menuWrapper}>
          <TouchableOpacity
            onPress={() => navigation.navigate("EditMobileNumber")}
            style={MyStyles.rowAlignment}
          >
            <View style={MyStyles.rowAlignment}>
              <AntDesign name="mobile1" style={MyStyles.menuIcons} />
              <Text style={MyStyles.menuText}>Mobile Number</Text>
            </View>

            <MaterialIcons name="navigate-next" style={MyStyles.menuArrow} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("ChangeUsername")}
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <FontAwesome5 name="user" style={MyStyles.menuIcons} />
              <Text style={MyStyles.menuText}>Username</Text>
            </View>

            <MaterialIcons name="navigate-next" style={MyStyles.menuArrow} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("ChangePassword")}
            style={MyStyles.rowAlignment}
          >
            <View style={MyStyles.rowAlignment}>
              <MaterialIcons name="password" style={MyStyles.menuIcons} />
              <Text style={MyStyles.menuText}>Password</Text>
            </View>

            <MaterialIcons name="navigate-next" style={MyStyles.menuArrow} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("EditSecurityQuestions")}
            style={MyStyles.rowAlignment}
          >
            <View style={MyStyles.rowAlignment}>
              <MaterialCommunityIcons
                name="comment-question-outline"
                style={MyStyles.menuIcons}
              />
              <Text style={MyStyles.menuText}>Security Questions</Text>
            </View>

            <MaterialIcons name="navigate-next" style={MyStyles.menuArrow} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountSettings;
