import { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import { InfoContext } from "../context/InfoContext";
import { useConfirm } from "../context/ConfirmContext";
import api from "../api";

//STYLES
import "../App.css";
import "../Stylesheets/CommonStyle.css";

//ICONS
import { IoClose } from "react-icons/io5";

function CourtReject({ onClose, reservationID }) {
  const [remarks, setRemarks] = useState("");
  const [showModal, setShowModal] = useState(true);
  const confirm = useConfirm();
  const [error, setError] = useState([]);
  const [loading, setLoading] = useState(false);

  const validateRemarks = (text) => {
    const errors = [];

    if (text.length < 10 || text.length > 200) {
      errors.push("Remarks must be between 10 and 200 characters.");
    }

    const invalidChars = /[^a-zA-Z0-9,.\s]/;
    if (invalidChars.test(text)) {
      errors.push("Use only letters, numbers, commas, and periods.");
    }

    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateRemarks(remarks);
    setError(validationErrors);
    const isConfirmed = await confirm(
      "Please confirm to proceed with rejecting this court reservation. This action cannot be undone.",
      "confirmred"
    );
    if (!isConfirmed) {
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      await api.put(`/rejectcourtreservation/${reservationID}`, { remarks });
      confirm("Court reservation request successfully rejected", "success");
      onClose();
    } catch (error) {
      console.log("Error rejecting court reservation request");
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
          <div className="modal-content w-[30rem] h-[22rem] ">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">
                    Reject Court Reservation Request
                  </h1>
                  <IoClose
                    onClick={handleClose}
                    class="dialog-title-bar-icon"
                  ></IoClose>
                </div>
                <hr className="dialog-line" />
              </div>
            </div>

            <div className="modal-form-container">
              <div className="modal-form">
                <textarea
                  placeholder="Enter your reason here..."
                  value={remarks}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRemarks(value);
                    setError(validateRemarks(value));
                  }}
                  rows={5}
                  minLength={20}
                  maxLength={255}
                  className="h-[11rem] textarea-container"
                ></textarea>
                <div className="textarea-length-text">{remarks.length}/255</div>
                {error.length > 0 && (
                  <div className="text-red-500 text-sm mt-1 space-y-1">
                    {error.map((err, index) => (
                      <p key={index}>{err}</p>
                    ))}
                  </div>
                )}
                <div className="flex justify-center">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    type="submit"
                    className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CourtReject;
