//STYLES
import "../Stylesheets/Dialog.css";

//ICONS
import { IoClose, IoArchiveSharp } from "react-icons/io5";

const ConfirmRedDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="session-container">
      <div className="modal-form-confirm-container">
        <div className="flex justify-end w-full">
          <IoClose
            onClick={onCancel}
            className="dialog-title-bar-icon text-2xl cursor-pointer"
          />
        </div>

        <div class="bg-red-100 p-3 rounded-full">
          <IoArchiveSharp className="text-red-500 text-4xl" />
        </div>

        <p className="dialog-question">Are you sure?</p>

        <p className="dialog-message">{message}</p>

        <div className="flex justify-end gap-6">
          <button
            onClick={onCancel}
            className="actions-btn bg-btn-color-gray hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="actions-btn bg-btn-color-red hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRedDialog;
