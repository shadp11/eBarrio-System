import { useState } from "react";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";

//STYLES
import "../App.css";

//ICONS
import { IoClose } from "react-icons/io5";

function AlertResidents({ onClose, resID }) {
  const confirm = useConfirm();
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState([]);

  const validateMessage = (text) => {
    const errors = [];

    if (!text.trim()) {
      errors.push("Alert message cannot be empty.");
      return errors;
    }

    if (text.length < 10 || text.length > 200) {
      errors.push("Remarks must be minimum of 10 characters.");
    }

    const invalidChars = /[^a-zA-Z0-9,.\s]/;
    if (invalidChars.test(text)) {
      errors.push("Use only letters, numbers, commas, and periods.");
    }

    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateMessage(message);
    setError(validationErrors);

    if (validationErrors.length > 0) {
      return;
    }

    const isConfirmed = await confirm(
      "Please confirm to proceed with sending this alert to residents via SMS. Make sure the message details are correct before sending.",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      await api.post(`/alertresidents`, { message });
      confirm(
        "Your alert has been successfully sent to the residents.",
        "success"
      );
      onClose();
    } catch (error) {
      const response = error.response;
      if (response && response.data) {
        console.log("❌ Error status:", response.status);
        confirm(
          response.data.message || "Something went wrong.",
          "errordialog"
        );
      } else {
        console.log("❌ Network or unknown error:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  return (
    <>
      {showModal && (
        <div className="modal-container">
          <div className="modal-content w-[30rem] h-[22rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">Alert Residents</h1>
                  <IoClose
                    onClick={handleClose}
                    class="dialog-title-bar-icon"
                  ></IoClose>
                </div>
                <hr className="dialog-line" />
              </div>
            </div>

            <div className="modal-form-container">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="modal-form"
              >
                <textarea
                  placeholder="Enter your message here..."
                  value={message}
                  onChange={(e) => {
                    const value = e.target.value;
                    setMessage(value);
                    setError(validateMessage(value));
                  }}
                  rows={5}
                  minLength={20}
                  maxLength={255}
                  className="h-[11rem] textarea-container"
                ></textarea>
                <div className="textarea-length-text">{message.length}/255</div>
                {error.length > 0 && (
                  <div className="text-red-500 text-sm mt-1 space-y-1">
                    {error.map((err, index) => (
                      <p key={index}>{err}</p>
                    ))}
                  </div>
                )}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AlertResidents;
