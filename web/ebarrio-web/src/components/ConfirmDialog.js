//STYLES
import "../Stylesheets/Dialog.css";

//ICONS
import { IoClose } from "react-icons/io5";
import { MdOutlineQuestionMark } from "react-icons/md";

const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="modal-container">
      <div className="modal-form-confirm-container">
        <div className="flex justify-end w-full">
          <IoClose
            onClick={onCancel}
            className="dialog-title-bar-icon text-2xl cursor-pointer"
          />
        </div>

        <div class="bg-[rgba(4,56,78,0.3)] p-3 rounded-full">
          <MdOutlineQuestionMark className="text-white text-4xl" />
        </div>

        <p className="dialog-question">Are you sure?</p>

        <h1 className="dialog-message">{message}</h1>

        <div className="flex gap-x-4">
          <button
            onClick={onCancel}
            className="actions-btn bg-btn-color-gray hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
