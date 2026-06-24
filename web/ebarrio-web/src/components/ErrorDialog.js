import { MdCancel, MdCheckCircle } from "react-icons/md";
import Lottie from "react-lottie";

const ErrorDialog = ({ message, onConfirm }) => {
  return (
    <div className="modal-container">
      <div className="modal-form-confirm-container">
        <Lottie
          height={80}
          width={80}
          options={{
            loop: true,
            autoplay: true,
            animationData: require("../assets/failed.json"),
          }}
        />

        <p className="dialog-question">Error!</p>

        <h1 className="dialog-message">{message}</h1>

        <div className="flex gap-x-4">
          <button
            onClick={onConfirm}
            className="actions-btn bg-btn-color-red hover:bg-red-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDialog;
