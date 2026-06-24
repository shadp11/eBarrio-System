import { useRef, useState, useEffect, useContext } from "react";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useConfirm } from "../context/ConfirmContext";
import { AuthContext } from "../context/AuthContext";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { removeBackground } from "@imgly/background-removal";
import api from "../api";

//STYLES
import "../Stylesheets/Residents.css";
import "../Stylesheets/CommonStyle.css";

//ICONS
import { FiUpload } from "react-icons/fi";
import { GrNext } from "react-icons/gr";

function SettleBlotter({ isCollapsed }) {
  const location = useLocation();
  const { blotterID } = location.state || {};
  const confirm = useConfirm();
  const navigation = useNavigate();
  const [blotter, setBlotter] = useState([]);
  const { fetchResidents, residents } = useContext(InfoContext);
  const hiddenInputRef1 = useRef(null);
  const hiddenInputRef2 = useRef(null);
  const [witnessSuggestions, setWitnessSuggestions] = useState([]);
  const [isSignProcessing, setIsSignProcessing] = useState(false);
  const [isSignProcessing2, setIsSignProcessing2] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [loading, setLoading] = useState(false);
  const [blotterForm, setBlotterForm] = useState({
    complainantID: "",
    complainantname: "",
    complainantaddress: "",
    complainantcontactno: "",
    complainantsignature: "",
    subjectID: "",
    subjectname: "",
    subjectaddress: "",
    typeofthecomplaint: "",
    details: "",
  });

  const validateDetails = (value) => {
    const errors = [];

    if (value.length < 10 || value.length > 200) {
      errors.push("Details must be minimum of 10 characters.");
    }

    const invalidChars = /[^a-zA-Z0-9,.\s]/;
    if (invalidChars.test(value)) {
      errors.push("Use only letters, numbers, commas, and periods.");
    }

    setDetailsError(errors.join(" "));
  };

  const [settleForm, setSettleForm] = useState({
    subjectsignature: "",
    witnessID: "",
    witnessname: "",
    witnesssignature: "",
    agreementdetails: "",
  });

  const typeList = ["Theft", "Sexual Harassment", "Physical Injury"];

  useEffect(() => {
    fetchResidents();
  }, []);

  useEffect(() => {
    const fetchBlotter = async () => {
      try {
        const response = await api.get(`/getblotter/${blotterID}`);
        setBlotter(response.data);

        setBlotterForm((prev) => ({
          ...prev,
          complainantname: response.data.complainantID
            ? `${response.data.complainantID.firstname} ${
                response.data.complainantID.middlename || ""
              } ${response.data.complainantID.lastname}`
            : response.data.complainantname,
          complainantaddress: response.data.complainantID.householdno
            ? response.data.complainantID.householdno.address
            : response.data.complainantaddress,
          complainantcontactno: response.data.complainantID
            ? response.data.complainantID.mobilenumber
            : response.data.complainantcontactno,
          subjectname: response.data.subjectID
            ? `${response.data.subjectID.firstname} ${
                response.data.subjectID.middlename || ""
              } ${response.data.subjectID.lastname}`
            : response.data.subjectname,
          subjectaddress: response.data.subjectID.householdno
            ? response.data.subjectID.householdno.address
            : response.data.subjectaddress,
          typeofthecomplaint: response.data.typeofthecomplaint,
          details: response.data.details,
        }));
      } catch (error) {
        console.log("Error fetching blotter", error);
      }
    };
    fetchBlotter();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettleForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));

    if (name === "agreementdetails") {
      validateDetails(value);
    }
  };

  const smartCapitalize = (word) => {
    if (word === word.toUpperCase()) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  };

  const handleWitnessChange = (e) => {
    const { name, value } = e.target;

    const formattedValue = value
      .split(" ")
      .map((word) => smartCapitalize(word))
      .join(" ");

    if (name === "witnessname") {
      const matches = residents
        .filter((r) => r.status === "Active" || r.status === "Change Requested")
        .filter((res) => {
          const fullName = `${res.firstname} ${
            res.middlename ? res.middlename + " " : ""
          }${res.lastname}`.toLowerCase();
          return fullName.includes(value.toLowerCase());
        });

      setWitnessSuggestions(matches);
      setSettleForm((prevForm) => ({
        ...prevForm,
        witnessID: "",
        witnessname: formattedValue,
      }));
    } else {
      setSettleForm((prevForm) => ({
        ...prevForm,
        [name]: value,
      }));
    }
  };

  const handleWitnessSuggestionClick = (res) => {
    const fullName = `${res.firstname} ${
      res.middlename ? res.middlename + " " : ""
    }${res.lastname}`;

    setSettleForm((prevForm) => ({
      ...prevForm,
      witnessID: res._id,
      witnessname: fullName,
    }));

    setWitnessSuggestions([]);
  };

  const handleUploadSig = (event) => {
    hiddenInputRef1.current.click();
  };
  const handleUploadSig2 = (event) => {
    hiddenInputRef2.current.click();
  };

  const handleChangeSig = async (event) => {
    const fileUploaded = event.target.files[0];
    if (fileUploaded) {
      setIsSignProcessing(true);
      try {
        const blob = await removeBackground(fileUploaded);
        const url = URL.createObjectURL(blob);
        setSettleForm((prevForm) => ({
          ...prevForm,
          subjectsignature: url,
        }));
      } catch (error) {
        console.error("Error removing background:", error);
      } finally {
        setIsSignProcessing(false);
      }
    }
  };

  const handleChangeSig2 = async (event) => {
    const fileUploaded = event.target.files[0];
    if (fileUploaded) {
      setIsSignProcessing2(true);
      try {
        const blob = await removeBackground(fileUploaded);
        const url = URL.createObjectURL(blob);
        setSettleForm((prevForm) => ({
          ...prevForm,
          witnesssignature: url,
        }));
      } catch (error) {
        console.error("Error removing background:", error);
      } finally {
        setIsSignProcessing2(false);
      }
    }
  };

  async function uploadToFirebase(url) {
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `id_blotter/${Date.now()}_${randomString}.png`;
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
      "Please confirm to proceed with settling this blotter. Make sure all details are correct before submission.",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    if (loading) return;

    setLoading(true);
    let updatedForm = { ...settleForm };

    if (updatedForm.witnessID) {
      delete updatedForm.witnessname;
    } else {
      delete updatedForm.witnessID;
      const signaturePicture = await uploadToFirebase(
        updatedForm.witnesssignature
      );
      updatedForm = {
        ...updatedForm,
        witnesssignature: signaturePicture,
      };
    }

    if (blotter.subjectID) {
      delete updatedForm.subjectsignature;
    } else {
      const signaturePicture = await uploadToFirebase(
        updatedForm.subjectsignature
      );
      updatedForm = {
        ...updatedForm,
        subjectsignature: signaturePicture,
      };
    }

    try {
      await api.put(`/settleblotter/${blotterID}`, { updatedForm });
      confirm("The blotter report has been successfully settled.", "success");
      navigation("/blotter-reports");
    } catch (error) {
      console.log("Error settling blotter", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="breadcrumbs-container">
          <h1
            onClick={() => navigation("/blotter-reports")}
            className="breadcrumbs-inactive-text"
          >
            Blotter Reports
          </h1>
          <GrNext className="breadcrumbs-arrow" />
          <h1 className="header-text">Settle Agreement</h1>
        </div>

        <div className="white-bg-container">
          {/*Complainant Information*/}
          <h3 className="section-title">Complainant Information</h3>
          <hr class="section-divider" />
          <div className="form-grid">
            <div>
              <label className="form-label">Name</label>
              <input
                name="complainantname"
                value={blotterForm.complainantname}
                placeholder="Enter name"
                className="form-input h-[30px] w-full"
                readOnly
              />
            </div>

            <div>
              <label className="form-label">Address</label>
              <input
                name="complainantaddress"
                value={blotterForm.complainantaddress}
                placeholder="Enter name"
                className="form-input h-[30px]"
                readOnly
              />
            </div>

            <div>
              <label className="form-label">Contact No.</label>
              <input
                name="complainantcontactno"
                value={blotterForm.complainantcontactno}
                placeholder="Enter name"
                className="form-input h-[30px]"
                readOnly
              />
            </div>
          </div>

          {/*Subject of the Complaint Information*/}
          <h3 className="section-title mt-8">
            Subject of the Complaint Information
          </h3>
          <hr class="section-divider" />

          <div className="form-grid">
            <div>
              <label className="form-label">Name</label>
              <input
                name="subjectname"
                value={blotterForm.subjectname}
                placeholder="Enter name"
                className="form-input h-[30px] w-full"
                readOnly
              />
            </div>

            <div>
              <label className="form-label">Address</label>
              <input
                name="subjectaddress"
                value={blotterForm.subjectaddress}
                placeholder="Enter address"
                className="form-input h-[30px]"
                readOnly
              />
            </div>
          </div>

          <div className="form-grid">
            {/* Signature - Spans the entire first row (3 columns) */}
            <div className="col-span-2">
              {!blotter.complainantID && (
                <div className="picture-upload-wrapper">
                  <h3 className="form-label">
                    Signature<label className="text-red-600">*</label>
                  </h3>
                  <div className="upload-box">
                    <input
                      onChange={handleChangeSig}
                      type="file"
                      name="subjectsignature"
                      style={{ display: "none" }}
                      ref={hiddenInputRef1}
                    />
                    <div className="upload-content">
                      <div className="preview-container">
                        {isSignProcessing ? (
                          <p>Processing...</p>
                        ) : settleForm.subjectsignature ? (
                          <img
                            src={settleForm.subjectsignature}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <p>No Picture Attached</p>
                        )}
                      </div>

                      <div className="upload-signature-btn">
                        <button
                          onClick={handleUploadSig}
                          className="upload-btn"
                        >
                          <FiUpload />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/*Blotter Information*/}
          <h3 className="section-title mt-8">Blotter Information</h3>
          <hr class="section-divider" />
          <div className="form-grid">
            <div className="col-span-1">
              <label for="type" className="form-label">
                Type of the Incident
              </label>
              <select
                id="typeofthecomplaint"
                name="typeofthecomplaint"
                value={blotterForm.typeofthecomplaint}
                className="form-input h-[30px]"
                readOnly
              >
                <option value="" disabled selected hidden>
                  Select
                </option>
                {typeList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>

            <div className="col-span-4">
              <label for="details" className="form-label">
                Details
              </label>
              <textarea
                placeholder="Enter details"
                maxLength={1000}
                id="details"
                name="details"
                value={blotterForm.details}
                readOnly
                className="w-full h-[15rem] resize-none border border-btn-color-gray rounded-md text-justify font-subTitle font-semibold p-2"
              />
              <h3 className="text-end">{blotterForm.details.length}/1000</h3>
            </div>
          </div>

          {/*Agreement Information*/}
          <h3 className="section-title mt-8">Agreement Information</h3>
          <hr class="section-divider" />
          <div className="form-grid">
            <div className="col-span-4">
              <label for="details" className="form-label">
                Details<label className="text-red-600">*</label>
              </label>
              <textarea
                placeholder="Enter details"
                maxLength={1000}
                onChange={handleInputChange}
                id="agreementdetails"
                name="agreementdetails"
                value={settleForm.agreementdetails}
                className="w-full h-[10rem] border border-btn-color-gray rounded-md text-justify font-subTitle font-semibold p-2"
              />
              <h3 className="text-end">
                {settleForm.agreementdetails.length}/1000
              </h3>
              {detailsError && (
                <div className="text-red-500 mt-1 text-sm mb-8">
                  {detailsError}
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {/*Witness Information*/}
            <h3 className="section-title mt-8">Witness Information</h3>
            <hr class="section-divider" />

            <div className="form-grid">
              <div className="form-group relative">
                <div className="cols-span-1">
                  <label for="type" className="form-label">
                    Name<label className="text-red-600">*</label>
                  </label>
                  <input
                    name="witnessname"
                    value={settleForm.witnessname}
                    onChange={handleWitnessChange}
                    placeholder="Enter name"
                    className="form-input h-[30px] w-full"
                    autoComplete="off"
                    required
                  />
                  {settleForm.witnessname?.length > 0 &&
                    witnessSuggestions?.length > 0 && (
                      <ul className="absolute left-0 top-full w-full bg-white border rounded shadow z-[9999] max-h-[150px] overflow-y-auto text-black">
                        {witnessSuggestions.map((res) => {
                          const fullName = `${res.firstname} ${
                            res.middlename ? res.middlename + " " : ""
                          }${res.lastname}`;
                          return (
                            <li
                              key={res.id}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleWitnessSuggestionClick(res)}
                            >
                              {fullName}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="col-span-2">
                {!settleForm.witnessID && (
                  <div className="form-group">
                    <label for="type" className="form-label">
                      Signature<label className="text-red-600">*</label>
                    </label>
                    <div className="upload-box">
                      <input
                        onChange={handleChangeSig2}
                        type="file"
                        name="witnesssignature"
                        accept="image/jpeg, image/png"
                        style={{ display: "none" }}
                        ref={hiddenInputRef2}
                      />
                      <div className="upload-content">
                        <div className="preview-container">
                          {isSignProcessing2 ? (
                            <p>Processing...</p>
                          ) : settleForm.witnesssignature ? (
                            <img
                              src={settleForm.witnesssignature}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <p>No Picture Attached</p>
                          )}
                        </div>

                        <div className="upload-signature-btn">
                          <button
                            onClick={handleUploadSig2}
                            className="upload-btn"
                          >
                            <FiUpload />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end rounded-md mt-4">
              <button
                className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D] ml-auto"
                type="submit"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
        <div className="mb-20"></div>
      </main>
    </>
  );
}

export default SettleBlotter;
