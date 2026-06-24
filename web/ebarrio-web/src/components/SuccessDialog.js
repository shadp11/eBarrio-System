import { MdCheckCircle } from "react-icons/md";
import Lottie from "react-lottie";

const SuccessDialog = ({ message, onConfirm }) => {
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

        <div className="flex gap-x-4">
          <button
            onClick={onConfirm}
            className="actions-btn bg-[#2cda94] hover:bg-[#28b984]"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessDialog;
