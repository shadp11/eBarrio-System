import { useState } from "react";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";

//STYLES
import "../App.css";

//ICONS
import { IoClose } from "react-icons/io5";

function CreateContact({ onClose }) {
  const confirm = useConfirm();
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("+63");
  const [showModal, setShowModal] = useState(true);
  const [mobileNumError, setMobileNumError] = useState("");
  const [nameError, setNameError] = useState("");
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
      return "Number must be between 9 and 10 digits long.";
    }

    return "";
  };

  const handleSubmit = async () => {
    let hasErrors = false;

    const nameValidationError = validateName(name);
    setNameError(nameValidationError);
    if (nameValidationError) {
      hasErrors = true;
    }

    const mobileValidationError = validateMobileNumber(contactNumber);
    setMobileNumError(mobileValidationError);
    if (mobileValidationError) {
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      const isConfirmed = await confirm(
        "Please confirm to proceed with adding this emergency hotline. Make sure all details are correct before submission.",
        "confirm"
      );
      if (!isConfirmed) {
        return;
      }

      if (loading) return;

      setLoading(true);

      let formattedNumber = contactNumber;
      formattedNumber = "0" + contactNumber.slice(3);

      await api.post("/createemergencyhotlines", {
        name,
        contactNumber: formattedNumber,
      });
      confirm("The emergency hotline has been successfully added.", "success");
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

  const smartCapitalize = (word) => {
    if (word === word.toUpperCase()) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  };

  const lettersAndSpaceOnly = (e) => {
    const { name, value } = e.target;
    const filtered = value.replace(/[^a-zA-Z\s.'-]/g, "");

    const capitalized = filtered
      .split(" ")
      .map((word) => smartCapitalize(word))
      .join(" ");

    setName(capitalized);

    setNameError(validateName(capitalized));
  };

  const mobileInputChange = (e) => {
    let { name, value } = e.target;
    value = value.replace(/\D/g, "");

    if (!value.startsWith("+63")) {
      value = "+63" + value.replace(/^0+/, "").slice(2);
    }
    if (value.length > 13) {
      value = value.slice(0, 13);
    }
    if (value.length >= 4 && value[3] === "0") {
      return;
    }

    setContactNumber(value);

    setMobileNumError(validateMobileNumber(value));
  };

  return (
    <>
      {showModal && (
        <div className="modal-container">
          <div className="modal-content h-[16rem] w-[30rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">Add New Contact</h1>
                  <IoClose
                    onClick={handleClose}
                    className="dialog-title-bar-icon"
                  ></IoClose>
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
                <div className="employee-form-group">
                  <label htmlFor="resID" className="form-label">
                    Name<label className="text-red-600">*</label>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={lettersAndSpaceOnly}
                    className="form-input h-[30px]"
                    required
                  />
                  {nameError && (
                    <label className="error-msg">{nameError}</label>
                  )}
                </div>
                <div className="employee-form-group">
                  <label className="form-label">
                    Contact Number<label className="text-red-600">*</label>
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
                  {mobileNumError ? (
                    <label className="error-msg">{mobileNumError}</label>
                  ) : null}
                </div>
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                  >
                    {loading ? "Submitting..." : "Submit"}
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

export default CreateContact;
