import { useEffect, useRef, useState, useContext } from "react";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";

//STYLES
import "../App.css";
import "../Stylesheets/CommonStyle.css";

//ICONS
import { MdAutorenew } from "react-icons/md";
import { IoClose } from "react-icons/io5";

function EditAccount({ onClose, userID, userUsername }) {
  const confirm = useConfirm();
  const [userForm, setUserForm] = useState({
    username: userUsername,
    password: "",
  });
  const [showModal, setShowModal] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (userForm.username === userUsername && userForm.password === "") {
      confirm("No changes have been detected.", "success");
      return;
    }
    const isConfirmed = await confirm(
      "Please confirm to proceed with editing this user account. Make sure the updated information is correct before submission.",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      if (userForm.username === userUsername) {
        delete userForm.username;
      }
      if (userForm.password === "") {
        delete userForm.password;
      }
      await api.put(`/edituser/${userID}`, { userForm });
      confirm("The user account has been successfully updated.", "success");
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
      onClose();
      setLoading(false);
    }
  };
  const handleClose = () => {
    setShowModal(false);
    onClose();
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
    setUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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
                  <h1 className="modal-title">Edit Account</h1>
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
                    Username<label className="text-red-600">*</label>
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={userForm.username}
                    onChange={handleInputChange}
                    className="form-input h-[30px]"
                    required
                  />
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
                      value={userForm.password}
                      required
                      className="form-input h-[30px]"
                    />
                    <button
                      type="button"
                      className="eye-toggle"
                      onClick={generatePassword}
                    >
                      <MdAutorenew />
                    </button>
                  </div>
                </div>
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

export default EditAccount;
