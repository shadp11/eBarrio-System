import React, { useState } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";

const QuickTips = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const quickTipsData = [
    {
      image: require("../assets/quick-tips/fire-extinguisher.jpg"),
      title: "How To Use a Fire Extinguisher",
      steps: [
        "Pull the pin to unlock it.",
        "Aim the nozzle at the base or bottom of the fire.",
        "Squeeze the handle to release the spray.",
        "Sweep from side to side at the bottom of the fire.",
      ],
    },
    {
      image: require("../assets/quick-tips/leaking-gas.jpg"),
      title: "How to Turn Off a Leaking or Burning Gas Tank",
      steps: [
        "Leave the area immediately.",
        "Do not use anything with fire or electricity.",
        "Turn the gas valve clockwise to shut it off.",
        "Call the gas company or emergency services for help.",
      ],
    },
    {
      image: require("../assets/quick-tips/grease-fire.jpg"),
      title: "How to Stop a Grease Fire with Baking Soda",
      steps: [
        "Turn off the stove.",
        "Cover the fire with a metal lid.",
        "Pour a large amount of baking soda on the fire.",
        "Never use water as it makes it worse!",
      ],
    },
    {
      image: require("../assets/quick-tips/breaker.jpg"),
      title: "How to Safely Turn Off the Breaker (Power Box)",
      steps: [
        "Stand on a dry place.",
        "Use a dry stick or insulated tool to switch off the main power.",
        "Never touch anything that is wet!",
      ],
    },
    {
      image: require("../assets/quick-tips/sandbags.jpg"),
      title: "How to Block Flood Water Using Sandbags",
      steps: [
        "Fill sandbags halfway with sand or soil.",
        "Stack them in a line like bricks at entry points.",
        "Cover them with plastic sheets to stop or block water better.",
      ],
    },
    {
      image: require("../assets/quick-tips/float-bottle.jpg"),
      title: "How to Make a DIY Floating Device with Water Gallons",
      steps: [
        "Use empty, tightly sealed water gallons.",
        "Tie them together using rope or tape.",
        "Use them as a floatation device if needed.",
      ],
    },
    {
      image: require("../assets/quick-tips/roof.jpg"),
      title: "How to Tie Down Your Roof",
      steps: [
        "Use strong ropes, straps, or wires.",
        "Tie the roof securely to the main structure or posts.",
        "Add weights like sandbags on the roof to help hold it down and make it stronger.",
      ],
    },
    {
      image: require("../assets/quick-tips/wood-window.jpg"),
      title: "How to Cover Windows",
      steps: [
        "Cut wood (plywood) to fit over your windows.",
        "Nail or screw the wood firmly in place.",
        "You may also use strong storm shutters if available.",
      ],
    },
    {
      image: require("../assets/quick-tips/outlet.jpg"),
      title: "How to Unplug Devices If Outlet Is Wet",
      steps: [
        "Do not touch anything with wet hands or near water!",
        "First, turn off the power from the breaker box.",
        "Then unplug devices once it is safe and dry.",
      ],
    },
    {
      image: require("../assets/quick-tips/drop-cover.jpg"),
      title: "Drop, Cover, and Hold",
      steps: [
        "Drop to your hands and knees to the ground.",
        "Cover your head and neck under a table or with your arms.",
        "Hold on until the shaking stops.",
      ],
    },
    {
      image: require("../assets/quick-tips/triangle-life.jpg"),
      title: "Triangle of Life",
      steps: [
        "Find a strong, large object like a couch, bed, or desk.",
        "Lie down next to it in a curled-up (fetal) position to protect vital organs.",
        "Protect your head with your arms or a pillow.",
      ],
    },
    {
      image: require("../assets/quick-tips/safe-spot.jpg"),
      title: "Find a Safe Spot in Your Home",
      steps: [
        "Under a strong table or desk.",
        "Next to an inside wall, away from windows.",
      ],
    },
  ];

  // Open modal
  const handleItemClick = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

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
            Quick Safety Tips
          </Text>

          <View style={MyStyles.quickImgWrapper}>
            {quickTipsData.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={MyStyles.quickBtnWrapper}
                onPress={() => handleItemClick(item)}
              >
                <View
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <Image source={item.image} style={MyStyles.quickImg} />
                  <View style={MyStyles.quickTipsCard}>
                    <Text style={MyStyles.quickTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <MaterialIcons
                      name="arrow-forward-ios"
                      size={30}
                      color="white"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Modal for showing details when item is clicked */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={MyStyles.modalOverlay}>
            <View style={MyStyles.modalContent}>
              {selectedItem && (
                <>
                  <Image
                    source={selectedItem.image}
                    style={MyStyles.modalImage}
                  />
                  <Text style={MyStyles.modalTitle}>{selectedItem.title}</Text>

                  <ScrollView style={MyStyles.stepsContainer}>
                    {selectedItem.steps.map((step, index) => (
                      <View key={index} style={MyStyles.stepRow}>
                        <View style={MyStyles.stepNumber}>
                          <Text style={MyStyles.stepNumberText}>
                            {index + 1}
                          </Text>
                        </View>
                        <Text style={MyStyles.stepText}>{step}</Text>
                      </View>
                    ))}
                  </ScrollView>

                  <TouchableOpacity
                    onPress={closeModal}
                    style={[MyStyles.button, { backgroundColor: "#BC0F0F" }]}
                  >
                    <Text style={MyStyles.buttonText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default QuickTips;
