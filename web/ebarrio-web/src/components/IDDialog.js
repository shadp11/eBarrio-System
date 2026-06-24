//ICONS
import { MdOutlineQuestionMark } from "react-icons/md";
import { IoClose } from "react-icons/io5";

const IDDialog = ({ message, onConfirm, onCancel }) => {
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

        <p className="dialog-question">{message}</p>

        <div className="flex justify-end gap-6">
          <button
            onClick={() => onConfirm("current")}
            className="actions-btn bg-btn-color-gray hover:bg-gray-400"
          >
            Current
          </button>
          <button
            onClick={() => onConfirm("generate")}
            className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};

export default IDDialog;
