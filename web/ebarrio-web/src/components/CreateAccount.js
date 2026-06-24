import { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import { InfoContext } from "../context/InfoContext";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";

//STYLES
import "../App.css";
import "../Stylesheets/CommonStyle.css";

//ICONS
import { MdAutorenew } from "react-icons/md";
import { IoClose } from "react-icons/io5";

function CreateAccount({ onClose }) {
  const confirm = useConfirm();
  const { fetchResidents, residents } = useContext(InfoContext);
  const [usernameErrors, setUsernameErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    resID: "",
    role: "",
  });
  const [showModal, setShowModal] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResidents();
  }, []);

  const usernameValidation = (e) => {
    const { name, value } = e.target;
    let errors = [];
    let formattedVal = value.replace(/\s+/g, "");

    if (!formattedVal) {
      errors.push("Username must not be empty");
    }
    if (
      (formattedVal && formattedVal.length < 3) ||
      (formattedVal && formattedVal.length > 16)
    ) {
      errors.push("Username must be between 3 and 16 characters only");
    }
    if (formattedVal && !/^[a-zA-Z0-9_]+$/.test(formattedVal)) {
      errors.push(
        "Username can only contain letters, numbers, and underscores."
      );
    }
    if (
      (formattedVal && formattedVal.startsWith("_")) ||
      (formattedVal && formattedVal.endsWith("_"))
    ) {
      errors.push("Username must not start or end with an underscore");
    }

    setUsernameErrors(errors);
    setUserForm((prev) => ({
      ...prev,
      [name]: formattedVal,
    }));
  };

  const passwordValidation = (e) => {
    const { name, value } = e.target;
    let errors = [];
    let formattedVal = value.replace(/\s+/g, "");

    if (!formattedVal) {
      errors.push("Password must not be empty");
    }
    if (
      (formattedVal && formattedVal.length < 8) ||
      (formattedVal && formattedVal.length > 64)
    ) {
      errors.push("Password must be between 8 and 64 characters only");
    }
    if (formattedVal && !/^[a-zA-Z0-9!@\$%\^&*\+#]+$/.test(formattedVal)) {
      errors.push(
        "Password can only contain letters, numbers, and !, @, $, %, ^, &, *, +, #"
      );
    }
    setPasswordErrors(errors);
    setUserForm((prev) => ({
      ...prev,
      [name]: formattedVal,
    }));
  };

  const generatePassword = () => {
    const characters = "0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      const randomChar = characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
      password += randomChar;
    }

    setUserForm((prev) => ({
      ...prev,
      password: password,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "resID") {
      const selectedResident = residents.find((res) => res._id === value);

      let roleFromPosition = "";
      if (selectedResident.empID) {
        if (selectedResident.empID.position === "Secretary") {
          roleFromPosition = "Secretary";
        } else if (selectedResident.empID.position === "Clerk") {
          roleFromPosition = "Clerk";
        } else if (selectedResident.empID.position === "Justice") {
          roleFromPosition = "Justice";
        } else {
          roleFromPosition = "Official";
        }
      } else {
        roleFromPosition = "Resident";
      }

      setUserForm((prev) => ({
        ...prev,
        [name]: value,
        role: roleFromPosition || "",
      }));
    }
  };

  const handleSubmit = async () => {
    const isConfirmed = await confirm(
      "Please confirm to proceed with adding this new user account. Make sure all details are correct before submission.",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      await api.post("/createuser", userForm);
      confirm("The account has been successfully created.", "success");
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
      onClose();
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
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
            </div>
          )}
          <div className="modal-content h-[25rem] w-[30rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">Add New User</h1>
                  <IoClose
                    onClick={handleClose}
                    class="dialog-title-bar-icon"
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
                  <label for="resID" className="form-label">
                    Name<label className="text-red-600">*</label>
                  </label>
                  <select
                    id="resID"
                    name="resID"
                    onChange={handleInputChange}
                    required
                    className="form-input h-[30px]"
                  >
                    <option value="" disabled selected hidden>
                      Select
                    </option>
                    {residents
                      .filter(
                        (element) =>
                          !element.userID &&
                          !(element.empID && element.empID.userID)
                      )
                      .filter(
                        (element) =>
                          element.status !== "Archived" &&
                          element.status !== "Rejected" &&
                          element.status !== "Pending"
                      )
                      .map((element) => (
                        <option value={element._id}>
                          {element.middlename
                            ? `${element.firstname} ${element.middlename} ${element.lastname}`
                            : `${element.firstname} ${element.lastname}`}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="employee-form-group">
                  <label className="form-label">
                    Role<label className="text-red-600">*</label>
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={userForm.role}
                    onChange={handleInputChange}
                    readOnly
                    className="form-input h-[30px]"
                    placeholder="Enter role"
                  />
                </div>

                <div className="employee-form-group">
                  <label className="form-label">
                    Username<label className="text-red-600">*</label>
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    onChange={usernameValidation}
                    required
                    minLength={3}
                    maxLength={16}
                    className="form-input h-[30px]"
                    placeholder="Enter username"
                  />
                  <div className="text-start">
                    {usernameErrors.length > 0 && (
                      <ul className="error-msg">
                        {usernameErrors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="employee-form-group">
                  <label className="form-label">
                    Password<label className="text-red-600">*</label>
                  </label>
                  <div className="relative w-full h-[30px]">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      readOnly
                      onChange={passwordValidation}
                      value={userForm.password}
                      required
                      className="form-input h-[30px]"
                      placeholder="Enter password"
                    />
                    <div className="text-start">
                      {passwordErrors.length > 0 && (
                        <ul className="error-msg">
                          {passwordErrors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <button
                      type="button"
                      className="eye-toggle mr-1"
                      onClick={generatePassword}
                    >
                      <MdAutorenew />
                    </button>
                  </div>
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

export default CreateAccount;
