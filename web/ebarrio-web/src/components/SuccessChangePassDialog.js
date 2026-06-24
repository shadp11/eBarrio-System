import { MdCheckCircle } from "react-icons/md";
import Lottie from "react-lottie";

const SuccessChangePassDialog = ({ message }) => {
  return (
    <div className="modal-container">
      <div className="modal-form-confirm-container">
        <Lottie
          height={80}
          width={80}
          options={{
            loop: true,
            autoplay: true,
            animationData: require("../assets/success.json"),
          }}
        />

        <p className="dialog-question">Success!</p>

        <h1 className="dialog-message">{message}</h1>
      </div>
    </div>
  );
};

export default SuccessChangePassDialog;
