import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import LottieView from "lottie-react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RFPercentage } from "react-native-responsive-fontsize";

const AlertModal = ({
  isVisible,
  message,
  title = "Error!",
  isSuccess,
  onClose,
  onConfirm,
  isResidentConfirmationModal = false,
  isConfirmationModal = false,
  isHaveAnAccountModal = false,
  isChatConfirm = false,
}) => {
  if (!isVisible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            padding: 30,
            borderRadius: 10,
            width: RFPercentage(35),
            alignItems: "center",
          }}
        >
          {isSuccess ? (
            // Success Modal
            <>
              <LottieView
                source={require("../assets/lottieanimation/check.json")}
                autoPlay
                loop
                style={{
                  width: 100,
                  height: RFPercentage(10),
                }}
              />
              <Text
                style={{
                  fontSize: RFPercentage(2.4),
                  fontFamily: "REMBold",
                  marginVertical: 20,
                  color: "#808080",
                }}
              >
                Success!
              </Text>
              <Text
                style={{
                  fontSize: RFPercentage(2),
                  color: "#808080",
                  marginBottom: 30,
                  fontFamily: "QuicksandMedium",
                  textAlign: "center",
                }}
              >
                {message}
              </Text>
              <TouchableOpacity
                onPress={onConfirm}
                style={{
                  borderWidth: 3,
                  borderColor: "#2cda94",
                  backgroundColor: "#2cda94",
                  padding: 10,
                  borderRadius: 10,
                  marginHorizontal: 10,
                  width: RFPercentage(14),
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: RFPercentage(2),
                    fontFamily: "QuicksandBold",
                    textAlign: "center",
                  }}
                >
                  OK
                </Text>
              </TouchableOpacity>
            </>
          ) : isResidentConfirmationModal ? (
            // Resident Confirmation Modal
            <>
              <LottieView
                source={require("../assets/lottieanimation/X.json")}
                autoPlay
                loop
                style={{
                  width: 100,
                  height: RFPercentage(10),
                }}
              />
              <Text
                style={{
                  fontSize: RFPercentage(2.4),
                  fontFamily: "REMBold",
                  marginVertical: 20,
                  color: "#04384E",
                  textAlign: "center",
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  fontSize: RFPercentage(2),
                  color: "#808080",
                  marginBottom: 20,
                  fontFamily: "QuicksandMedium",
                  textAlign: "center",
                }}
              >
                {message}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    borderWidth: 3,
                    borderColor: "#BC0F0F",
                    padding: 10,
                    borderRadius: 10,
                    marginHorizontal: 10,
                    width: RFPercentage(14),
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#BC0F0F",
                      fontSize: RFPercentage(2),
                      fontFamily: "QuicksandBold",
                      textAlign: "center",
                    }}
                  >
                    CANCEL
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onConfirm}
                  style={{
                    borderWidth: 3,
                    borderColor: "#BC0F0F",
                    backgroundColor: "#BC0F0F",
                    padding: 10,
                    borderRadius: 10,
                    marginHorizontal: 10,
                    width: RFPercentage(14),
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: RFPercentage(2),
                      fontFamily: "QuicksandBold",
                      textAlign: "center",
                    }}
                  >
                    CONFIRM
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : isConfirmationModal ? (
            // Confirmation Modal (Help Icon)
            <>
              <Ionicons
                name="help-circle-outline"
                color="#BC0F0F"
                style={{ fontSize: RFPercentage(8) }}
              />
              <Text
                style={{
                  fontSize: RFPercentage(2.4),
                  fontFamily: "REMBold",
                  marginVertical: 10,
                  color: "#04384E",
                  textAlign: "center",
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  fontSize: RFPercentage(2),
                  color: "#808080",
                  marginBottom: 20,
                  fontFamily: "QuicksandMedium",
                  textAlign: "center",
                }}
              >
                {message}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  gap: 10,
                }}
              >
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    borderWidth: 3,
                    borderColor: "#BC0F0F",
                    padding: 10,
                    borderRadius: 10,
                    width: RFPercentage(14),
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#BC0F0F",
                      fontSize: RFPercentage(2),
                      fontFamily: "QuicksandBold",
                      textAlign: "center",
                    }}
                  >
                    CANCEL
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onConfirm}
                  style={{
                    borderWidth: 3,
                    borderColor: "#BC0F0F",
                    backgroundColor: "#BC0F0F",
                    padding: 10,
                    borderRadius: 10,
                    width: RFPercentage(14),
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: RFPercentage(2),
                      fontFamily: "QuicksandBold",
                      textAlign: "center",
                    }}
                  >
                    CONFIRM
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : isChatConfirm ? (
            // Confirmation Modal (Help Icon)
            <>
              <Ionicons
                name="help-circle-outline"
                color="#0E94D3"
                style={{ fontSize: RFPercentage(8) }}
              />
              <Text
                style={{
                  fontSize: RFPercentage(2.4),
                  fontFamily: "REMBold",
                  marginVertical: 10,
                  color: "#04384E",
                  textAlign: "center",
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  fontSize: RFPercentage(2),
                  color: "#808080",
                  marginBottom: 20,
                  fontFamily: "QuicksandMedium",
                  textAlign: "center",
                }}
              >
                {message}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  gap: 10,
                }}
              >
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    borderWidth: 3,
                    borderColor: "#0E94D3",
                    padding: 10,
                    borderRadius: 10,
                    width: RFPercentage(14),
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#0E94D3",
                      fontSize: RFPercentage(2),
                      fontFamily: "QuicksandBold",
                      textAlign: "center",
                    }}
                  >
                    CANCEL
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onConfirm}
                  style={{
                    borderWidth: 3,
                    borderColor: "#0E94D3",
                    backgroundColor: "#0E94D3",
                    padding: 10,
                    borderRadius: 10,
                    width: RFPercentage(14),
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: RFPercentage(2),
                      fontFamily: "QuicksandBold",
                      textAlign: "center",
                    }}
                  >
                    CONFIRM
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : isHaveAnAccountModal ? (
            // Already Have an Account Modal
            <>
              <LottieView
                source={require("../assets/lottieanimation/X.json")}
                autoPlay
                loop
                style={{
                  width: 100,
                  height: RFPercentage(10),
                }}
              />
              <Text
                style={{
                  fontSize: RFPercentage(2.4),
                  fontFamily: "REMBold",
                  marginVertical: 20,
                  color: "#04384E",
                  textAlign: "center",
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  fontSize: RFPercentage(2),
                  color: "#808080",
                  marginBottom: 30,
                  fontFamily: "QuicksandMedium",
                  textAlign: "center",
                }}
              >
                {message}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    backgroundColor: "#FF0000",
                    padding: 10,
                    borderRadius: 10,
                    marginHorizontal: 10,
                    width: RFPercentage(14),
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: RFPercentage(2),
                      fontFamily: "QuicksandBold",
                      textAlign: "center",
                    }}
                  >
                    TRY AGAIN
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Error Modal
            <>
              <LottieView
                source={require("../assets/lottieanimation/X.json")}
                autoPlay
                loop
                style={{
                  width: 100,
                  height: RFPercentage(10),
                }}
              />
              <Text
                style={{
                  fontSize: RFPercentage(2.4),
                  fontFamily: "REMBold",
                  marginVertical: 20,
                  color: "#04384E",
                  textAlign: "center",
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  fontSize: RFPercentage(2),
                  color: "#808080",
                  marginBottom: 30,
                  fontFamily: "QuicksandMedium",
                  textAlign: "center",
                }}
              >
                {message}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    backgroundColor: "#FF0000",
                    padding: 10,
                    borderRadius: 10,
                    marginHorizontal: 10,
                    width: RFPercentage(14),
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: RFPercentage(2),
                      fontFamily: "QuicksandBold",
                      textAlign: "center",
                    }}
                  >
                    TRY AGAIN
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default AlertModal;
