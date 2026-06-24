// components/CheckBox.js
import React from "react";
import { Pressable, Text, View } from "react-native";

const CheckBox = ({ value, onValueChange, label, disabled }) => {
  return (
    <Pressable
      onPress={onValueChange}
      disabled={disabled}
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View
        style={{
          height: 20,
          width: 20,
          borderWidth: 2,
          borderColor: "#000",
          marginRight: 10,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: value ? "#000" : "#fff",
        }}
      >
        {value && (
          <View
            style={{
              height: 10,
              width: 10,
              backgroundColor: "#fff",
            }}
          />
        )}
      </View>
      <Text>{label}</Text>
    </Pressable>
  );
};

export default CheckBox;
