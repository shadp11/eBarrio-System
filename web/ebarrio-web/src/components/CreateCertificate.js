import { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";

//SCREENS
import IndigencyPrint from "./certificates/IndigencyPrint";
import BusinessClearancePrint from "./certificates/BusinessClearancePrint";
import ClearancePrint from "./certificates/ClearancePrint";

//STYLES
import "../App.css";

//ICONS
import { IoClose } from "react-icons/io5";

function CreateCertificate({ resID, onClose }) {
  const confirm = useConfirm();
  const { user } = useContext(AuthContext);
  const [certificateForm, setCertificateForm] = useState({
    typeofcertificate: "",
    amount: "",
    purpose: "",
    purpose2: "",
    businessname: "",
    lineofbusiness: "",
    addressnumber: "",
    street: "",
    locationofbusiness: "",
    ornumber: "",
  });
  const [showModal, setShowModal] = useState(true);
  const [loading, setLoading] = useState(false);

  const certificates = [
    { name: "Barangay Indigency", price: "₱10.00" },
    { name: "Barangay Clearance", price: "₱10.00" },
    { name: "Barangay Business Clearance", price: "₱30.00" },
  ];

  const certificateFields = {
    "Barangay Indigency": [
      "typeofcertificate",
      "purpose",
      "purpose2",
      "amount",
    ],
    "Barangay Clearance": [
      "typeofcertificate",
      "purpose",
      "purpose2",
      "amount",
    ],
    "Barangay Business Clearance": [
      "typeofcertificate",
      "addressnumber",
      "street",
      "businessname",
      "lineofbusiness",
      "amount",
    ],
  };

  const streetList = [
    "Zapote-Molino Road",
    "1st Street",
    "2nd Street",
    "3rd Street",
    "4th Street",
    "5th Street",
    "6th Street",
    "8th Street",
    "8th Street Exnt",
    "5th Street Exnt",
    "Dominga Rivera Street",
    "Tabing-Ilog Street",
    "Arko",
    "9th Street",
    "10th Street",
    "11th Street",
    "Resident's Address",
  ];

  const purpose = ["ALS Requirement", "Financial Assistance", "Others"];

  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    if (name === "typeofcertificate") {
      const selectedCert = certificates.find((cert) => cert.name === value);
      setCertificateForm((prev) => ({
        ...prev,
        [name]: value,
        amount: selectedCert ? selectedCert.price : "",
      }));
    } else {
      setCertificateForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCertificateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function uploadToFirebase(url) {
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `id_qrcode/${Date.now()}_${randomString}.png`;
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  }

  const handleSubmit = async () => {
    const isConfirmed = await confirm(
      "Please confirm to proceed with issuing this document. Make sure the document details are correct before submission.",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    if (loading) return;

    setLoading(true);
    const requiredFields =
      certificateFields[certificateForm.typeofcertificate] || [];

    const filteredData = requiredFields.reduce((obj, key) => {
      if (certificateForm[key] !== undefined) {
        obj[key] = certificateForm[key];
      }
      return obj;
    }, {});

    if (
      certificateForm.typeofcertificate === "Barangay Business Clearance" &&
      certificateForm.street
    ) {
      const fullAddress = certificateForm.addressnumber
        ? `${certificateForm.addressnumber} ${certificateForm.street} Aniban 2, Bacoor, Cavite`
        : `${certificateForm.street} Aniban 2, Bacoor, Cavite`;

      filteredData.locationofbusiness = fullAddress;
      delete filteredData.addressnumber;
      delete filteredData.street;
    }

    if (
      certificateForm.typeofcertificate === "Barangay Business Clearance" &&
      certificateForm.street === "Resident's Address"
    ) {
      filteredData.locationofbusiness = certificateForm.street;
      delete filteredData.addressnumber;
      delete filteredData.street;
    }

    if (filteredData.purpose === "Others") {
      filteredData.purpose = filteredData.purpose2;
      delete filteredData.purpose2;
    } else {
      delete filteredData.purpose2;
    }
    try {
      const response = await api.post("/generatecertificate", {
        filteredData,
        resID,
      });
      const qrCode = await uploadToFirebase(response.data.qrCode);
      try {
        const response2 = await api.put(
          `/savecertificate/${response.data.certID}`,
          {
            qrCode,
          }
        );
      } catch (error) {
        console.log("Error saving barangay ID", error);
      }
      try {
        const response3 = await api.get(
          `/getcertificate/${response.data.certID}`
        );
        const response4 = await api.get(`/getcaptain/`);
        const response5 = await api.get(`/getprepared/${user.userID}`);

        if (response3.data.typeofcertificate === "Barangay Indigency") {
          try {
            IndigencyPrint({
              certData: response3.data,
              captainData: response4.data,
              preparedByData: response5.data,
              updatedAt: response3.data.updatedAt,
            });
          } catch (error) {
            console.log("Error in issuing a document", error);
          }
        } else if (response3.data.typeofcertificate === "Barangay Clearance") {
          try {
            ClearancePrint({
              certData: response3.data,
              captainData: response4.data,
              preparedByData: response5.data,
              updatedAt: response3.data.updatedAt,
            });
          } catch (error) {
            console.log("Error in issuing a document", error);
          }
        } else if (
          response3.data.typeofcertificate === "Barangay Business Clearance"
        ) {
          try {
            BusinessClearancePrint({
              certData: response3.data,
              captainData: response4.data,
              preparedByData: response5.data,
              updatedAt: response3.data.updatedAt,
            });
          } catch (error) {
            console.log("Error in issuing a document", error);
          }
        }
        setTimeout(() => {
          handleClose();
        }, 3000);
      } catch (error) {
        console.log("Error generating barangay certificate", error);
      }
    } catch (error) {
      console.log("Error generating barangay certificate", error);
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

    setCertificateForm((prev) => ({
      ...prev,
      [name]: capitalized,
    }));
  };
  return (
    <>
      {setShowModal && (
        <div className="modal-container">
          <div className="modal-content w-[30rem] h-[16rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">Create Document</h1>
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
                  <label for="typeofcertificate" className="form-label">
                    Type of Document<label className="text-red-600">*</label>
                  </label>
                  <select
                    id="typeofcertificate"
                    name="typeofcertificate"
                    onChange={handleDropdownChange}
                    required
                    className="form-input h-[30px] appearance-none"
                  >
                    <option value="" disabled selected hidden>
                      Select
                    </option>
                    {certificates.map((element) => (
                      <option value={element.name}>{element.name}</option>
                    ))}
                  </select>
                </div>

                {["Barangay Indigency", "Barangay Clearance"].includes(
                  certificateForm.typeofcertificate
                ) && (
                  <div className="employee-form-group">
                    <label htmlFor="purpose" className="form-label">
                      Purpose<span className="text-red-600">*</span>
                    </label>
                    <select
                      id="purpose"
                      name="purpose"
                      onChange={handleDropdownChange}
                      required
                      className="form-input h-[30px] appearance-none"
                    >
                      <option value="" disabled selected hidden>
                        Select
                      </option>
                      {purpose.map((element, index) => (
                        <option key={index} value={element}>
                          {element}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {certificateForm.typeofcertificate ===
                  "Barangay Business Clearance" && (
                  <>
                    {certificateForm.street &&
                      certificateForm.street !== "Resident's Address" && (
                        <div className="employee-form-group">
                          <label className="form-label">Address Number</label>
                          <input
                            type="text"
                            id="addressnumber"
                            name="addressnumber"
                            onChange={handleInputChange}
                            className="form-input h-[30px]"
                          />
                        </div>
                      )}

                    <div className="employee-form-group">
                      <label htmlFor="street" className="form-label">
                        Street <span className="text-red-600">*</span>
                      </label>
                      <select
                        id="street"
                        name="street"
                        onChange={handleDropdownChange}
                        required
                        className="form-input h-[30px] appearance-none"
                      >
                        <option value="" disabled selected hidden>
                          Select
                        </option>
                        {streetList.map((element, index) => (
                          <option key={index} value={element}>
                            {element}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="employee-form-group">
                      <label className="form-label">
                        Business Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="businessname"
                        name="businessname"
                        onChange={handleInputChange}
                        className="form-input h-[30px]"
                      />
                    </div>

                    <div className="employee-form-group">
                      <label className="form-label">
                        Line of Business <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        id="lineofbusiness"
                        name="lineofbusiness"
                        onChange={handleInputChange}
                        className="form-input h-[30px]"
                      />
                    </div>
                  </>
                )}
                {certificateForm.purpose === "Others" && (
                  <div className="employee-form-group">
                    <label className="form-label">
                      Others (Please Specify)
                      <label className="text-red-600">*</label>
                    </label>

                    <input
                      type="text"
                      id="purpose2"
                      name="purpose2"
                      onChange={lettersAndSpaceOnly}
                      value={certificateForm.purpose2}
                      required
                      className="form-input h-[30px]"
                    />
                  </div>
                )}

                <div className="employee-form-group">
                  <label className="form-label">Amount</label>

                  <input
                    type="text"
                    id="amount"
                    name="amount"
                    value={certificateForm.amount}
                    readOnly
                    className="form-input h-[30px]"
                  />
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

export default CreateCertificate;
