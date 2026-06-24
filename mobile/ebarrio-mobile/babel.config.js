module.exports = {
  presets: ["babel-preset-expo"],
  plugins: [
    "react-native-reanimated/plugin", // keep this last
    ["@babel/plugin-proposal-private-methods", { loose: true }],
  ],
};
