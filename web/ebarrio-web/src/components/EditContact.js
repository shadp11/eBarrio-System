import { useState } from "react";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";

//STYLES
import "../App.css";
import "../Stylesheets/CommonStyle.css";

//ICONS
import { IoClose } from "react-icons/io5";

function EditContact({ onClose, emergencyID, emergencyDetails }) {
  const confirm = useConfirm();
  const [name, setName] = useState(emergencyDetails.name);
  const [showModal, setShowModal] = useState(true);

  let formattedNumber = "+63" + emergencyDetails.contactnumber.slice(1);
  const [contactNumber, setContactNumber] = useState(formattedNumber);

  const [nameError, setNameError] = useState("");
  const [mobileNumError, setMobileNumError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateName = (name) => {
    if (name.length < 10 || name.length > 50) {
      return "Name must be between 10 and 50 characters.";
    }
    return "";
  };

  const validateMobileNumber = (contactNumber) => {
    const numberWithoutPrefix = contactNumber.slice(3);
    const isValidLength =
      numberWithoutPrefix.length >= 9 && numberWithoutPrefix.length <= 10;

    if (!isValidLength) {
      return "Number must be between 9 and 10 digits.";
    }

    return "";
  };

  const handleSubmit = async () => {
    if (
      emergencyDetails.name === name &&
      emergencyDetails.contactnumber === contactNumber
    ) {
      confirm("No changes have been detected.", "success");
      return;
    }
    const nameValidationError = validateName(name);
    const mobileValidationError = validateMobileNumber(contactNumber);

    setNameError(nameValidationError);
    setMobileNumError(mobileValidationError);

    if (nameValidationError || mobileValidationError) {
      return;
    }

    const isConfirmed = await confirm(
      "Please confirm to proceed with editing this emergency hotline. Make sure the updated information is correct before submission.",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      let formattednumber = contactNumber;
      formattednumber = "0" + contactNumber.slice(3);
      await api.post(`/editemergencyhotlines/${emergencyID}`, {
        name,
        contactNumber: formattednumber,
      });
      confirm(
        "The emergency hotline has been successfully updated.",
        "success"
      );
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
        confirm("An unexpected error occurred.", "errordialog");
      }
    } finally {
      onClose();
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  const mobileInputChange = (e) => {
    let input = e.target.value;
    input = input.replace(/\D/g, "");
    if (!input.startsWith("+63")) {
      input = "+63" + input.replace(/^0+/, "").slice(2);
    }
    if (input.length > 13) {
      input = input.slice(0, 13);
    }
    if (input.length >= 4 && input[3] === "0") {
      return;
    }

    setContactNumber(input);

    setMobileNumError(validateMobileNumber(input));
  };

  return (
    <>
      {showModal && (
        <div className="modal-container">
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
            </div>
          )}
          <div className="modal-content w-[30rem] h-[16rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">Edit Contact</h1>
                  <IoClose
                    onClick={handleClose}
                    className="dialog-title-bar-icon"
                  />
                </div>
                <hr className="dialog-line" />
              </div>
            </div>

            <form
              className="modal-form-container"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="modal-form">
                {/* Name Input Field */}
                <div className="employee-form-group">
                  <label htmlFor="name" className="form-label">
                    Name <label className="text-red-600">*</label>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setName(value);
                      setNameError(validateName(value));
                    }}
                    className="form-input h-[30px]"
                    required
                  />
                  {nameError && (
                    <label className="error-msg">{nameError}</label>
                  )}
                </div>

                {/* Mobile Number Input Field */}
                <div className="employee-form-group">
                  <label className="form-label">
                    Contact Number <label className="text-red-600">*</label>
                  </label>
                  <input
                    type="text"
                    id="contactnumber"
                    name="contactnumber"
                    value={contactNumber}
                    onChange={(e) => mobileInputChange(e)}
                    className="form-input h-[30px]"
                    required
                  />
                  {mobileNumError && (
                    <label className="error-msg">{mobileNumError}</label>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default EditContact;
