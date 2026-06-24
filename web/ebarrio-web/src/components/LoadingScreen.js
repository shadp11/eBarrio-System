import { useEffect } from "react";
import Lottie from "react-lottie";

//STYLES
import "../Stylesheets/CommonStyle.css";

function LoadingScreen() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: require("../assets/loading.json"),
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    console.log("Lottie animation loaded", defaultOptions);
  }, []);

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <Lottie options={defaultOptions} height={150} width={300} />
    </div>
  );
}

export default LoadingScreen;
