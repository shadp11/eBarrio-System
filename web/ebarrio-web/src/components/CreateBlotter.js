import { useRef, useState, useEffect, useContext } from "react";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "../context/ConfirmContext";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { FiUpload } from "react-icons/fi";
import { removeBackground } from "@imgly/background-removal";
import api from "../api";

//STYLES
import "../Stylesheets/Residents.css";
import "../Stylesheets/CommonStyle.css";
import "../Stylesheets/CommonStyle.css";

//ICONS
import { GrNext } from "react-icons/gr";

function CreateBlotter({ isCollapsed }) {
  const confirm = useConfirm();
  const navigation = useNavigate();
  const { fetchResidents, residents } = useContext(InfoContext);
  const { blotterreports, fetchBlotterReports } = useContext(InfoContext);
  const hiddenInputRef1 = useRef(null);
  const [complainantSuggestions, setComplainantSuggestions] = useState([]);
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);
  const [mobileNumError, setMobileNumError] = useState("");
  const [isSignProcessing, setIsSignProcessing] = useState(false);
  const initialForm = {
    complainantID: "",
    complainantname: "",
    complainantaddress: "",
    complainantcontactno: "+63",
    complainantsignature: "",
    subjectID: "",
    subjectname: "",
    subjectaddress: "",
    typeofthecomplaint: "",
    typeofthecomplaint2: "",
    details: "",
    date: "",
    starttime: "",
    endtime: "",
  };

  const { blotterForm, setBlotterForm } = useContext(InfoContext);
  const [loading, setLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  useEffect(() => {
    fetchResidents();
    fetchBlotterReports();
  }, []);

  const typeList = [
    "Theft",
    "Sexual Harassment",
    "Physical Injury",
    "Trespassing",
    "Property Damage",
    "Domestic Dispute",
    "Others",
  ];

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBlotterForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));

    if (name === "details") {
      validateDetails(value);
    }
  };

  const smartCapitalize = (word) => {
    if (word === word.toUpperCase()) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  };

  const handleComplainantChange = (e) => {
    const { name, value } = e.target;
    const filtered = value.replace(/[^a-zA-Z\s.'-]/g, "");

    const formatted = filtered
      .split(" ")
      .map((word) => smartCapitalize(word))
      .join(" ");

    if (name === "complainantname") {
      const matches = residents.filter((res) => {
        const fullName = `${res.firstname} ${
          res.middlename ? res.middlename + " " : ""
        }${res.lastname}`.toLowerCase();
        return fullName.includes(value.toLowerCase());
      });

      setComplainantSuggestions(matches);
      setBlotterForm((prevForm) => ({
        ...prevForm,
        complainantID: "",
        complainantname: formatted,
        complainantaddress: "",
        complainantcontactno: "",
      }));
    }
  };

  const handleComplainantSuggestionClick = (res) => {
    const fullName = `${res.firstname} ${
      res.middlename ? res.middlename + " " : ""
    }${res.lastname}`;

    setBlotterForm((prevForm) => ({
      ...prevForm,
      complainantID: res._id,
      complainantname: fullName,
      complainantaddress: res.address,
      complainantcontactno: res.mobilenumber,
    }));

    setComplainantSuggestions([]);
  };

  const lettersNumbersAndSpaceOnly = (e) => {
    const { name, value } = e.target;
    const lettersAndNumbersOnly = value.replace(/[^a-zA-Z0-9\s.,]/g, "");
    const capitalizeFirstLetter = lettersAndNumbersOnly
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    setBlotterForm((prev) => ({
      ...prev,
      [name]: capitalizeFirstLetter,
    }));
  };

  const handleSubjectChange = (e) => {
    const { name, value } = e.target;
    const filtered = value.replace(/[^a-zA-Z\s.'-]/g, "");

    const formatted = filtered
      .split(" ")
      .map((word) => smartCapitalize(word))
      .join(" ");

    if (name === "subjectname") {
      const matches = residents.filter((res) => {
        const fullName = `${res.firstname} ${
          res.middlename ? res.middlename + " " : ""
        }${res.lastname}`.toLowerCase();
        return fullName.includes(value.toLowerCase());
      });

      setSubjectSuggestions(matches);
      setBlotterForm((prevForm) => ({
        ...prevForm,
        subjectname: formatted,
        subjectID: "",
        subjectaddress: "",
      }));
    }
  };

  const handleSubjectSuggestionClick = (res) => {
    const fullName = `${res.firstname} ${
      res.middlename ? res.middlename + " " : ""
    }${res.lastname}`;

    setBlotterForm((prevForm) => ({
      ...prevForm,
      subjectID: res._id,
      subjectname: fullName,
      subjectaddress: res.address,
    }));

    setSubjectSuggestions([]);
  };

  const handleUploadSig = (event) => {
    hiddenInputRef1.current.click();
  };

  const handleChangeSig = async (event) => {
    const fileUploaded = event.target.files[0];
    if (fileUploaded) {
      setIsSignProcessing(true);
      try {
        const blob = await removeBackground(fileUploaded);
        const url = URL.createObjectURL(blob);
        setBlotterForm((prevForm) => ({
          ...prevForm,
          complainantsignature: url,
        }));
      } catch (error) {
        console.error("Error removing background:", error);
      } finally {
        setIsSignProcessing(false);
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
    let hasErrors = false;
    if (
      blotterForm.complainantcontactno &&
      blotterForm.complainantcontactno.length !== 13
    ) {
      setMobileNumError("Invalid mobile number.");
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }
    try {
      const isConfirmed = await confirm(
        "Please confirm to proceed with adding this blotter report. Make sure all information is correct before submission.",
        "confirm"
      );
      if (!isConfirmed) {
        return;
      }
      if (loading) return;

      setLoading(true);
      let updatedForm = { ...blotterForm };

      if (updatedForm.complainantID) {
        delete updatedForm.complainantname;
        delete updatedForm.complainantaddress;
        delete updatedForm.complainantcontactno;
        delete updatedForm.complainantsignature;
      } else {
        let formattedMobileNumber = blotterForm.complainantcontactno;
        formattedMobileNumber = "0" + blotterForm.complainantcontactno.slice(3);
        delete updatedForm.complainantID;
        const signaturePicture = await uploadToFirebase(
          updatedForm.complainantsignature
        );
        updatedForm = {
          ...updatedForm,
          complainantsignature: signaturePicture,
          complainantcontactno: formattedMobileNumber,
        };
      }

      if (updatedForm.subjectID) {
        delete updatedForm.subjectname;
        delete updatedForm.subjectaddress;
      } else {
        delete updatedForm.subjectID;
      }

      if (updatedForm.typeofthecomplaint === "Others") {
        updatedForm.typeofthecomplaint = updatedForm.typeofthecomplaint2;
        delete updatedForm.typeofthecomplaint2;
      } else {
        delete updatedForm.typeofthecomplaint2;
      }
      try {
        await api.post("/createblotter", { updatedForm });
        confirm(
          "A new blotter report has been successfully created.",
          "success"
        );
        setBlotterForm(initialForm);
        navigation("/blotter-reports");
      } catch (error) {
        console.log("Error creating blotter report", error);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleDateChange = (e) => {
    const newDateStr = e.target.value;

    setBlotterForm((prev) => {
      return {
        ...prev,
        date: newDateStr,
        starttime: "",
        endtime: "",
      };
    });
  };

  const checkIfTimeSlotIsAvailable = (startTime, endTime) => {
    const selectedStartTime = new Date(startTime);
    const selectedEndTime = new Date(endTime);

    const parseCustomDate = (dateStr) => {
      if (!dateStr) return null;
      if (dateStr.includes(" at ")) {
        const [datePart, timePart] = dateStr.split(" at ");
        const d = new Date(`${datePart} ${timePart}`);
        return isNaN(d.getTime()) ? null : d;
      }
      return new Date(dateStr);
    };

    if (
      isNaN(selectedStartTime.getTime()) ||
      isNaN(selectedEndTime.getTime())
    ) {
      console.warn("Invalid selected time range");
      return { isAvailable: false, conflict: null };
    }

    const conflict = blotterreports
      .filter((blot) => blot.status === "Scheduled")
      .find((blot) => {
        const reservedStart = parseCustomDate(blot.starttime);
        const reservedEnd = parseCustomDate(blot.endtime);
        if (!reservedStart || !reservedEnd) return false;
        return (
          selectedStartTime < reservedEnd && selectedEndTime > reservedStart
        );
      });

    if (conflict) {
      return {
        isAvailable: false,
        conflict: {
          start: parseCustomDate(conflict.starttime),
          end: parseCustomDate(conflict.endtime),
        },
      };
    }

    return { isAvailable: true, conflict: null };
  };

  const handleReset = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to clear all the fields?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    setBlotterForm(initialForm);
  };

  const handleStartTimeChange = (e) => {
    const time = e.target.value;
    const newStartTime = new Date(`${blotterForm.date}T${time}:00`);

    if (!time) {
      setBlotterForm((prev) => ({ ...prev, starttime: "" }));
      return;
    }
    if (!blotterForm.date) {
      confirm("Please select a date first.", "failed");
      return;
    }

    setBlotterForm((prev) => ({
      ...prev,
      starttime: newStartTime.toISOString(),
      endtime: "",
    }));
  };

  const handleEndTimeChange = (e) => {
    const time = e.target.value;
    const newEndTime = new Date(`${blotterForm.date}T${time}:00`);
    const startTime = new Date(blotterForm.starttime);

    if (!time) {
      setBlotterForm((prev) => ({ ...prev, endtime: "" }));
      return;
    }
    if (!blotterForm.date) {
      confirm("Please select a date first.", "failed");
      return;
    }
    if (!blotterForm.starttime) {
      confirm("Please select a start time first.", "failed");
      return;
    }

    if (newEndTime <= startTime) {
      confirm("The end time must be after the start time.", "failed");
      return;
    }

    const { isAvailable, conflict } = checkIfTimeSlotIsAvailable(
      startTime,
      newEndTime
    );

    if (!isAvailable) {
      const conflictInfo = conflict
        ? `This time slot overlaps with an existing schedule of ${conflict.start.toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )} - ${conflict.end.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}.`
        : null;
      confirm(conflictInfo, "failed");
      setBlotterForm((prev) => ({ ...prev, endtime: "" }));
      return;
    }

    setBlotterForm((prev) => ({
      ...prev,
      endtime: newEndTime.toISOString(),
    }));
  };

  const formatTimeToHHMM = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
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

    setBlotterForm((prev) => ({ ...prev, [name]: value }));

    if (value.length >= 13) {
      setMobileNumError(null);
    } else {
      setMobileNumError("Invalid mobile number.");
    }
  };

  const lettersAndSpaceOnly = (e) => {
    const { name, value } = e.target;
    const filtered = value.replace(/[^a-zA-Z\s.'-]/g, "");

    const capitalized = filtered
      .split(" ")
      .map((word) => smartCapitalize(word))
      .join(" ");

    setBlotterForm((prev) => ({
      ...prev,
      [name]: capitalized,
    }));
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
          <h1 className="header-text">Blotter Form</h1>
        </div>

        <form
          className="white-bg-container"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/*Complainant Information*/}
          <h3 className="section-title">Complainant Information</h3>
          <hr className="section-divider" />

          <div className="form-grid">
            <div className="form-group relative">
              <div>
                <label className="form-label">
                  Name<label className="text-red-600">*</label>
                </label>
                <input
                  name="complainantname"
                  value={blotterForm.complainantname}
                  onChange={handleComplainantChange}
                  placeholder="Enter name"
                  minLength={2}
                  maxLength={150}
                  className="form-input h-[30px] w-full"
                  autoComplete="off"
                  required
                />
                {blotterForm.complainantname?.length > 0 &&
                  complainantSuggestions?.length > 0 && (
                    <ul className="blotter-suggestions-list">
                      {complainantSuggestions.map((res) => {
                        const fullName = `${res.firstname} ${
                          res.middlename ? res.middlename + " " : ""
                        }${res.lastname}`;
                        return (
                          <li
                            key={res.id}
                            className="blotter-suggestions-item"
                            onClick={() =>
                              handleComplainantSuggestionClick(res)
                            }
                          >
                            {fullName}
                          </li>
                        );
                      })}
                    </ul>
                  )}
              </div>
            </div>

            <div>
              <label className="form-label">
                Address<label className="text-red-600">*</label>
              </label>
              <input
                name="complainantaddress"
                onChange={lettersNumbersAndSpaceOnly}
                value={blotterForm.complainantaddress}
                placeholder="Enter address"
                minLength={5}
                maxLength={100}
                className="form-input h-[30px]"
                required
              />
            </div>

            <div>
              <label className="form-label">
                Contact No.<label className="text-red-600">*</label>
              </label>
              <input
                name="complainantcontactno"
                onChange={mobileInputChange}
                value={blotterForm.complainantcontactno}
                placeholder="Enter contact no."
                maxLength={13}
                className="form-input h-[30px]"
                required
              />
              {mobileNumError ? (
                <label className="error-msg">{mobileNumError}</label>
              ) : null}
            </div>
          </div>

          <div className="form-grid">
            <div className="col-span-2">
              {!blotterForm.complainantID && (
                <div className="picture-upload-wrapper">
                  <h3 className="form-label">
                    Signature<label className="text-red-600">*</label>
                  </h3>
                  <div className="upload-box">
                    <input
                      onChange={handleChangeSig}
                      type="file"
                      accept="image/jpeg, image/png"
                      style={{ display: "none" }}
                      ref={hiddenInputRef1}
                    />
                    <div className="upload-content">
                      <div className="preview-container">
                        {isSignProcessing ? (
                          <p>Processing...</p>
                        ) : blotterForm.complainantsignature ? (
                          <img
                            src={blotterForm.complainantsignature}
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

          {/*Subject of the Complaint Information*/}
          <h3 className="section-title mt-8">
            Subject of the Complaint Information
          </h3>
          <hr className="section-divider" />
          <div className="form-grid">
            <div className="form-group relative">
              <label className="form-label">
                Name<label className="text-red-600">*</label>
              </label>
              <input
                name="subjectname"
                value={blotterForm.subjectname}
                onChange={handleSubjectChange}
                placeholder="Enter name"
                minLength={2}
                maxLength={150}
                className="form-input h-[30px] w-full"
                autoComplete="off"
                required
              />
              {blotterForm.subjectname?.length > 0 &&
                subjectSuggestions?.length > 0 && (
                  <ul className="blotter-suggestions-list">
                    {subjectSuggestions.map((res) => {
                      const fullName = `${res.firstname} ${
                        res.middlename ? res.middlename + " " : ""
                      }${res.lastname}`;
                      return (
                        <li
                          key={res.id}
                          className="blotter-suggestions-item"
                          onClick={() => handleSubjectSuggestionClick(res)}
                        >
                          {fullName}
                        </li>
                      );
                    })}
                  </ul>
                )}
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                name="subjectaddress"
                onChange={lettersNumbersAndSpaceOnly}
                value={blotterForm.subjectaddress}
                placeholder="Enter address"
                minLength={2}
                maxLength={100}
                className="form-input h-[30px]"
              />
            </div>
          </div>

          {/*Blotter Information*/}
          <h3 className="section-title mt-8">Blotter Information</h3>
          <hr className="section-divider" />
          <div className="form-grid">
            <div className="form-group">
              <label for="type" className="form-label">
                Type of the Incident<label className="text-red-600">*</label>
              </label>
              <select
                id="typeofthecomplaint"
                name="typeofthecomplaint"
                onChange={handleInputChange}
                value={blotterForm.typeofthecomplaint}
                className="form-input h-[30px]"
                required
              >
                <option value="" disabled selected hidden>
                  Select
                </option>
                {typeList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>
            {blotterForm.typeofthecomplaint === "Others" && (
              <div>
                <label className="form-label">
                  Others (Please Specify)
                  <label className="text-red-600">*</label>
                </label>
                <input
                  name="typeofthecomplaint2"
                  onChange={lettersAndSpaceOnly}
                  value={blotterForm.typeofthecomplaint2}
                  placeholder="Enter type of the incident"
                  className="form-input h-[30px]"
                  required
                />
              </div>
            )}

            <div className="col-span-4">
              <label for="details" className="form-label">
                Details of the Incident<label className="text-red-600">*</label>
              </label>
              <textarea
                placeholder="Enter details"
                maxLength={1000}
                id="details"
                name="details"
                value={blotterForm.details}
                onChange={handleInputChange}
                className="h-[15rem] textarea-container"
                required
              />
              <h3 className="textarea-length-text">
                {blotterForm.details.length}/1000
              </h3>
              {detailsError && (
                <div className="text-red-500 mt-1 text-sm mb-8">
                  {detailsError}
                </div>
              )}
            </div>
          </div>

          {/*Settlement Proceedings*/}
          <label className="section-title text-start">
            Schedule Information
          </label>
          <hr class="section-divider" />
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3 mt-4">
            <div>
              <label className="form-label">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={blotterForm.date ? blotterForm.date : ""}
                onChange={handleDateChange}
                className="form-input h-[30px] pr-2"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label className="form-label">Start Time</label>
              <input
                type="time"
                id="starttime"
                name="starttime"
                className="form-input h-[30px] pr-2"
                onChange={handleStartTimeChange}
                value={formatTimeToHHMM(blotterForm.starttime)}
              />
            </div>
            <div>
              <label className="form-label">End Time </label>
              <input
                type="time"
                id="endtime"
                name="endtime"
                className="form-input h-[30px] pr-2"
                onChange={handleEndTimeChange}
                value={formatTimeToHHMM(blotterForm.endtime)}
              />
            </div>
          </div>

          <div className="function-btn-container">
            <button
              type="button"
              onClick={handleReset}
              className="actions-btn bg-btn-color-gray hover:bg-gray-400"
            >
              Clear
            </button>
            <button
              className="actions-btn bg-btn-color-blue"
              type="submit"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
        <div className="mb-20"></div>
      </main>
    </>
  );
}

export default CreateBlotter;
