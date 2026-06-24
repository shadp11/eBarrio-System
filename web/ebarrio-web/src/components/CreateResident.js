import { useContext, useEffect, useRef, useState } from "react";
import { removeBackground } from "@imgly/background-removal";
import { storage } from "../firebase";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { useConfirm } from "../context/ConfirmContext";
import { InfoContext } from "../context/InfoContext";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";

//SCREENS
import OpenCamera from "./OpenCamera";
import "../Stylesheets/CommonStyle.css";

//ICONS
import { FiCamera, FiUpload } from "react-icons/fi";
import { BiSolidImageAlt } from "react-icons/bi";
import { GrNext } from "react-icons/gr";
import { LuCirclePlus } from "react-icons/lu";

function CreateResident({ isCollapsed }) {
  const location = useLocation();
  const navigation = useNavigate();
  const confirm = useConfirm();
  const { fetchResidents, residents, fetchHouseholds, household } =
    useContext(InfoContext);
  const [isIDProcessing, setIsIDProcessing] = useState(false);
  const [isSignProcessing, setIsSignProcessing] = useState(false);
  const [mobileNumError, setMobileNumError] = useState("");
  const [emMobileNumError, setEmMobileNumError] = useState("");
  const [telephoneNumError, setTelephoneNumError] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const hiddenInputRef1 = useRef(null);
  const hiddenInputRef2 = useRef(null);
  const initialForm = {
    id: "",
    signature: "",
    firstname: "",
    middlename: "",
    lastname: "",
    suffix: "",
    alias: "",
    salutation: "",
    sex: "",
    gender: "",
    birthdate: "",
    age: "",
    birthplace: "",
    civilstatus: "",
    bloodtype: "",
    religion: "",
    nationality: "",
    voter: "",
    precinct: "",
    deceased: "",
    email: "",
    mobilenumber: "+63",
    telephone: "+63",
    facebook: "",
    emergencyname: "",
    emergencymobilenumber: "+63",
    emergencyaddress: "",
    employmentstatus: "",
    employmentfield: "",
    occupation: "",
    monthlyincome: "",
    educationalattainment: "",
    typeofschool: "",
    householdno: "",
    householdposition: "",
    head: "",
    course: "",
    isSenior: false,
    isInfant: false,
    isNewborn: false,
    isUnder5: false,
    isSchoolAge: false,
    isAdolescent: false,
    isAdolescentPregnant: false,
    isAdult: false,
    isPostpartum: false,
    isWomenOfReproductive: false,
    isPregnant: false,
    isPWD: false,
    philhealthid: "",
    philhealthtype: "",
    philhealthcategory: "",
    haveHypertension: false,
    haveDiabetes: false,
    haveTubercolosis: false,
    haveSurgery: false,
    lastmenstrual: "",
    haveFPmethod: "",
    fpmethod: "",
    fpstatus: "",
  };
  const { residentForm, setResidentForm } = useContext(InfoContext);

  const initialHouseholdForm = {
    members: [],
    vehicles: [],
    ethnicity: "",
    tribe: "",
    sociostatus: "",
    nhtsno: "",
    watersource: "",
    toiletfacility: "",
    housenumber: "",
    street: "",
    HOAname: "",
    address: "",
  };
  const { householdForm, setHouseholdForm } = useContext(InfoContext);
  const [memberSuggestions, setMemberSuggestions] = useState([]);

  useEffect(() => {
    fetchResidents();
    fetchHouseholds();
  }, []);

  useEffect(() => {
    if (location.state?.fetchAgain) {
      fetchResidents();
      navigation(location.pathname, { replace: true });
    }
  }, [location.state?.fetchAgain]);

  useEffect(() => {
    if (residents.length > 0 && householdForm.members.length > 0) {
      const newSuggestions = householdForm.members.map((member) => {
        if (!member.resident?.trim() || member.resID) return [];

        return residents
          .filter(
            (r) =>
              r.status !== "Archived" &&
              r.status !== "Pending" &&
              r.status !== "Rejected"
          )
          .filter((res) => {
            const fullName = `${res.firstname} ${
              res.middlename ? res.middlename + " " : ""
            }${res.lastname}`.toLowerCase();
            return fullName.includes(member.resident.toLowerCase());
          });
      });

      setMemberSuggestions(newSuggestions);
    }
  }, [residents, householdForm.members]);

  // DROPDOWN VALUES
  const suffixList = ["Jr.", "Sr.", "I", "II", "III", "IV"];
  const salutationList = [
    "Mr.",
    "Mrs.",
    "Mx.",
    "Dr.",
    "Prof.",
    "Rev.",
    "Hon.",
    "Capt.",
    "Col.",
    "Gen.",
    "Lt.",
    "Sgt.",
  ];
  const sexList = ["Male", "Female"];
  const genderList = [
    "Male",
    "Female",
    "Non-binary",
    "Genderfluid",
    "Agender",
    "Other",
  ];
  const civilstatusList = [
    "Single",
    "Married",
    "Widow-er",
    "Separated",
    "Annulled",
    "Cohabitation",
  ];
  const bloodtypeList = ["A", "A-", "B", "B-", "AB", "AB-", "O", "O-"];
  const religionList = [
    "Adventist",
    "Aglipayan (Philippine Independence Church)",
    "Baptist World Alliance",
    "Born Again Christian",
    "Church of Christ",
    "Church Jesus Christ and the Latter Day Saints",
    "Church of the Nazarene",
    "El Shaddai",
    "Evangelical",
    "Full Gospel",
    "Iglesia ni Cristo",
    "Islam",
    "Jehovah’s Witnesses",
    "Judaism",
    "MCGI (Dating Daan)",
    "Methodist",
    "Mormons",
    "Pentecost",
    "Protestants",
    "Roman Catholic",
    "Seventh Day Adventists (Central Phil. Union Conf.)",
    "Worldwide Church of God",
    "Other",
  ];
  const nationalityList = [
    "Filipino",
    "American",
    "Chinese",
    "Indian",
    "Japanese",
    "Korean",
    "Australian",
    "British",
    "Canadian",
    "German",
    "French",
    "Spanish",
    "Italian",
    "Mexican",
    "Russian",
    "Other",
  ];

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
  ];

  const employmentstatusList = [
    "Employed",
    "Part-Time",
    "Student",
    "Unemployed",
    "Seasonal",
    "Contractual",
    "Compensation",
    "Self-Employed",
    "Retired",
    "Displaced Worker",
    "Homemaker",
    "Intern",
    "Working for Private Household",
    "Working for Private Business/Establishment/Farm",
    "Working for Government/Government Corporation",
    "Self-Employed with No Paid Employee",
    "Employer in Own Family-Oriented Farm/Business",
    "Working with Pay on Own-Family Operated Farm/Business",
    "Working without Pay on Own-Family Operated Farm/Business",
  ];

  const monthlyincomeList = [
    "0-1,000",
    "1,001-5,000",
    "5,001-10,000",
    "10,001-25,000",
    "25,001-50,000",
    "50,001-75,000",
    "75,001-100,000",
    "100,001-250,000",
    "250,001-500,000",
    "500,001-1,000,000",
    "1,000,001+",
  ];

  const educationalattainmentList = [
    "None",
    "Kinder",
    "Elementary Student",
    "Elementary Undergrad",
    "Elementary Graduate",
    "High School Student",
    "High School Undergrad",
    "High School Graduate",
    "Vocational Course",
    "College Student",
    "College Undergrad",
    "College Graduate",
    "Postgraduate",
  ];

  const philhealthcategoryList = [
    "Formal Economy Private",
    "Formal Economy Government",
    "Informal Economy",
    "NHTS",
    "Senior Citizen",
    "Indigenous People",
    "Unknown",
  ];

  const fpmethodList = [
    "COC",
    "POP",
    "Injectables",
    "IUD",
    "Condom",
    "LAM",
    "BTL",
    "Implant",
    "SDM",
    "DPT",
    "Withdrawal",
    "Others",
  ];

  const fpstatusList = [
    "New Acceptor",
    "Current User",
    "Changing Method",
    "Changing Clinic",
    "Dropout",
    "Restarter",
  ];

  const watersourceList = [
    "Point Source",
    "Communal Faucet",
    "Individual Connection",
    "Others",
  ];

  const toiletfacilityList = [
    "Pour/flush type connected to septic tank",
    "Pour/flush toilet connected to septic tank AND to sewerage system",
    "Ventilated Pit Latrine",
    "Water-sealed Toilet",
    "Overhung Latrine",
    "Open Pit Latrine",
    "Without Toilet",
  ];

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setResidentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    setResidentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    setResidentForm((prev) => ({
      ...prev,
      [name]: capitalized,
    }));
  };

  const occupationChange = (e) => {
    const { name, value } = e.target;
    const filtered = value.replace(/[^a-zA-Z0-9\s.'-]/g, "");

    const capitalized = filtered
      .split(" ")
      .map((word) => smartCapitalize(word))
      .join(" ");

    setResidentForm((prev) => ({
      ...prev,
      [name]: capitalized,
    }));
  };

  const birthplaceChange = (e) => {
    const { name, value } = e.target;
    const filtered = value.replace(/[^a-zA-Z\s.,'-]/g, "");

    const capitalized = filtered
      .split(" ")
      .map((word) => smartCapitalize(word))
      .join(" ");

    setResidentForm((prev) => ({
      ...prev,
      [name]: capitalized,
    }));
  };

  const numbersAndNoSpaceOnly = (e) => {
    const { name, value } = e.target;
    const numbersOnly = value.replace(/[^0-9]/g, "");
    setResidentForm((prev) => ({
      ...prev,
      [name]: numbersOnly,
    }));
  };

  const precinctChange = (e) => {
    const { name, value } = e.target;
    const precinct = value.replace(/[^a-zA-Z0-9\s]/g, "");
    setResidentForm((prev) => ({
      ...prev,
      [name]: precinct.toUpperCase(),
    }));
  };

  const lettersNumbersAndSpaceOnly = (e) => {
    const { name, value } = e.target;
    const lettersAndNumbersOnly = value.replace(/[^a-zA-Z0-9\s.,]/g, "");
    const capitalizeFirstLetter = lettersAndNumbersOnly
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    setResidentForm((prev) => ({
      ...prev,
      [name]: capitalizeFirstLetter,
    }));
  };

  const stringsAndNoSpaceOnly = (e) => {
    const { name, value } = e.target;
    const stringsOnly = value.replace(/[^a-zA-Z0-9@_./:?&=-]/g, "");
    setResidentForm((prev) => ({
      ...prev,
      [name]: stringsOnly,
    }));
  };

  const toggleCamera = () => {
    setIsCameraOpen(true);
  };

  const handleUploadID = (event) => {
    hiddenInputRef1.current.click();
  };

  const handleUploadSig = (event) => {
    hiddenInputRef2.current.click();
  };

  const handleChangeID = async (event) => {
    const fileUploaded = event.target.files[0];

    const maxSize = 1 * 1024 * 1024;

    if (fileUploaded && fileUploaded.size > maxSize) {
      confirm("File is too large. Maximum allowed size is 1 MB.", "failed");
      event.target.value = "";
      return;
    }

    setIsIDProcessing(true);
    try {
      const url = URL.createObjectURL(fileUploaded);
      setResidentForm((prev) => ({ ...prev, id: url }));
    } catch (error) {
      console.error("Error removing background:", error);
    } finally {
      setIsIDProcessing(false);
    }
  };

  const handleDone = (url) => {
    setIsIDProcessing(true);
    setTimeout(() => {
      setIsCameraOpen(false);
      setResidentForm((prev) => ({ ...prev, id: url }));
      setIsIDProcessing(false);
    }, 500);
  };

  const handleClose = () => {
    setIsCameraOpen(false);
  };
  const handleReset = async () => {
    const isConfirmed = await confirm(
      "Please confirm to proceed with clearing all fields. This action will remove all current inputs.",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    setResidentForm(initialForm);
    setHouseholdForm(initialHouseholdForm);
  };
  async function uploadToFirebase(url) {
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `id_images/${Date.now()}_${randomString}.png`;
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

    if (residentForm.mobilenumber && residentForm.mobilenumber.length !== 13) {
      setMobileNumError("Invalid mobile number format!");
      hasErrors = true;
    }
    if (
      residentForm.emergencymobilenumber &&
      residentForm.emergencymobilenumber.length !== 13
    ) {
      setEmMobileNumError("Invalid mobile number format!");
      hasErrors = true;
    }

    if (
      residentForm.telephone &&
      residentForm.telephone.length > 3 &&
      residentForm.telephone.length < 12
    ) {
      setTelephoneNumError("Invalid telephone number format!");
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      const isConfirmed = await confirm(
        "Please confirm to proceed with adding this resident. Make sure all information is correct before submission.",
        "confirm"
      );
      if (!isConfirmed) {
        return;
      }

      if (loading) return;

      setLoading(true);
      const fulladdress = `${householdForm.housenumber} ${householdForm.street} Aniban 2, Bacoor, Cavite`;
      let idPicture;
      let signaturePicture;
      if (residentForm.id) {
        idPicture = await uploadToFirebase(residentForm.id);
      }

      if (residentForm.signature) {
        signaturePicture = await uploadToFirebase(residentForm.signature);
      }

      let formattedMobileNumber = residentForm.mobilenumber;
      formattedMobileNumber = "0" + residentForm.mobilenumber.slice(3);

      let formattedEmergencyMobileNumber = residentForm.emergencymobilenumber;
      formattedEmergencyMobileNumber =
        "0" + residentForm.emergencymobilenumber.slice(3);

      let formattedTelephone = residentForm.telephone;
      if (residentForm.telephone !== "+63") {
        formattedTelephone = "0" + residentForm.telephone.slice(3);
        delete residentForm.telephone;
      } else {
        formattedTelephone = "";
      }

      delete residentForm.mobilenumber;
      delete residentForm.emergencymobilenumber;
      delete residentForm.id;
      delete residentForm.signature;

      const updatedResidentForm = {
        ...residentForm,
        address: fulladdress,
        mobilenumber: formattedMobileNumber,
        emergencymobilenumber: formattedEmergencyMobileNumber,
        telephone: formattedTelephone,
      };

      const updatedHouseholdForm = {
        ...householdForm,
        address: fulladdress,
      };

      const response = await api.post("/createresident", {
        picture: idPicture,
        signature: signaturePicture,
        ...updatedResidentForm,
        householdForm: updatedHouseholdForm,
      });

      confirm(
        "A new resident record has been successfully created.",
        "success"
      );
      setResidentForm(initialForm);
      navigation("/residents");
    } catch (error) {
      console.log("Error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSig = async (event) => {
    const fileUploaded = event.target.files[0];

    const maxSize = 1 * 1024 * 1024;

    if (fileUploaded && fileUploaded.size > maxSize) {
      confirm(
        "The file is too large. The maximum allowed size is 1 MB.",
        "failed"
      );
      event.target.value = "";
      return;
    }

    setIsSignProcessing(true);
    try {
      const url = URL.createObjectURL(fileUploaded);
      setResidentForm((prev) => ({ ...prev, signature: url }));
    } catch (error) {
      console.error("Error removing background:", error);
    } finally {
      setIsSignProcessing(false);
    }
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

    setResidentForm((prev) => ({ ...prev, [name]: value }));

    if (name === "mobilenumber") {
      if (value.length >= 13) {
        setMobileNumError(null);
      } else {
        setMobileNumError("Invalid mobile number format!");
      }
    }

    if (name === "emergencymobilenumber") {
      if (value.length >= 13) {
        setEmMobileNumError(null);
      } else {
        setEmMobileNumError("Invalid mobile number format!");
      }
    }
  };

  const telephoneInputChange = (e) => {
    let { name, value } = e.target;
    value = value.replace(/\D/g, ""); // numbers only

    // Ensure it starts with +63
    if (!value.startsWith("63")) {
      value = "63" + value.replace(/^0+/, "");
    }

    value = "+" + value; // Add the '+' at the start

    // Max length for landline: +63 + (1-2 digit area code) + (5-7 digit number)
    if (value.length > 13) {
      value = value.slice(0, 13);
    }

    // Prevent extra leading zero after +63
    if (value.length >= 4 && value[3] === "0") {
      return;
    }

    setResidentForm((prev) => ({ ...prev, [name]: value }));

    if (name === "telephone") {
      // Optional field: no error if just +63
      if (value === "+63") {
        setTelephoneNumError(null);
      }
      // Allow between +63XYYYYYY (min 1-digit area code) and +63XXYYYYYYY (max length)
      else if (/^\+63\d{6,9}$/.test(value)) {
        setTelephoneNumError(null);
      } else {
        setTelephoneNumError("Invalid telephone number format!");
      }
    }
  };

  //HOUSEHOLD
  const handleHouseholdChange = (e) => {
    const value = e.target.value;
    setResidentForm({ ...residentForm, head: value });
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...householdForm.members];

    if (field === "resident") {
      updatedMembers[index] = {
        ...updatedMembers[index],
        resident: value,
        resID: "",
      };

      setHouseholdForm((prev) => ({
        ...prev,
        members: updatedMembers,
      }));

      if (value.trim() === "") {
        setMemberSuggestions((prev) => {
          const newSuggestions = [...prev];
          newSuggestions[index] = [];
          return newSuggestions;
        });
        return;
      }

      const matches = residents
        .filter(
          (r) =>
            r.status !== "Archived" &&
            r.status !== "Pending" &&
            r.status !== "Rejected"
        )
        .filter((res) => {
          const fullName = `${res.firstname} ${
            res.middlename ? res.middlename + " " : ""
          }${res.lastname}`.toLowerCase();
          return fullName.includes(value.toLowerCase());
        });

      setMemberSuggestions((prev) => {
        const newSuggestions = [...prev];
        newSuggestions[index] = matches;
        return newSuggestions;
      });
    } else {
      updatedMembers[index][field] = value;
      setHouseholdForm((prev) => ({
        ...prev,
        members: updatedMembers,
      }));
    }
  };

  const handleMemberSuggestionClick = (index, res) => {
    const fullName = `${res.firstname} ${
      res.middlename ? res.middlename + " " : ""
    }${res.lastname}`;

    const updatedMembers = [...householdForm.members];
    updatedMembers[index] = {
      ...updatedMembers[index],
      resident: fullName,
      resID: res._id,
    };

    setHouseholdForm((prev) => ({
      ...prev,
      members: updatedMembers,
    }));

    setMemberSuggestions((prev) => {
      const newSuggestions = [...prev];
      newSuggestions[index] = [];
      return newSuggestions;
    });
  };

  const addMember = () => {
    setHouseholdForm((prev) => ({
      ...prev,
      members: [...prev.members, { resident: "", position: "" }],
    }));
  };

  const removeMember = (index) => {
    setHouseholdForm((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setResidentForm((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  useEffect(() => {
    if (residentForm.birthdate) {
      const birthDate = new Date(residentForm.birthdate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }

      const isSenior = age >= 60;

      const ageInDays = Math.floor((today - birthDate) / (1000 * 60 * 60 * 24));

      const isNewborn = age === 0 && ageInDays <= 28;
      const isInfant = (age === 0 && ageInDays > 28) || age === 1;
      const isUnder5 = age >= 2 && age <= 4;
      const isAdolescent = age >= 10 && age <= 19;
      const isAdult = age > 25;
      const isWomenOfReproductive = age >= 15 && age <= 49;

      setResidentForm((prev) => ({
        ...prev,
        age,
        isSenior,
        isNewborn,
        isInfant,
        isUnder5,
        isAdolescent,
        isAdult,
        isWomenOfReproductive,
      }));
    }
  }, [residentForm.birthdate]);

  const handleHouseholdRadioChange = (e) => {
    const { name, value } = e.target;
    setHouseholdForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHouseholdDropdownChange = (e) => {
    const { name, value } = e.target;
    setHouseholdForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const householdNumbersAndNoSpaceOnly = (e) => {
    const { name, value } = e.target;
    const numbersOnly = value.replace(/[^0-9]/g, "");
    setHouseholdForm((prev) => ({
      ...prev,
      [name]: numbersOnly,
    }));
  };

  const householdLettersAndSpaceOnly = (e) => {
    const { name, value } = e.target;
    const filtered = value.replace(/[^a-zA-Z\s.'-]/g, "");

    const capitalized = filtered
      .split(" ")
      .map((word) => smartCapitalize(word))
      .join(" ");

    setHouseholdForm((prev) => ({
      ...prev,
      [name]: capitalized,
    }));
  };

  const addVehicle = () => {
    setHouseholdForm((prev) => ({
      ...prev,
      vehicles: [
        ...prev.vehicles,
        { model: "", color: "", kind: "", platenumber: "" },
      ],
    }));
  };

  const removeVehicle = (index) => {
    setHouseholdForm((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index),
    }));
  };

  const handleVehicleChange = (index, field, value) => {
    const updatedVehicles = [...householdForm.vehicles];
    updatedVehicles[index][field] = value;

    setHouseholdForm((prev) => ({
      ...prev,
      vehicles: updatedVehicles,
    }));
  };

  return (
    <div className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
      {(loading || isIDProcessing || isSignProcessing) && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <div className="breadcrumbs-container">
        <h1
          onClick={() => navigation("/residents")}
          className="breadcrumbs-inactive-text"
        >
          Residents
        </h1>
        <GrNext className="breadcrumbs-arrow" />
        <h1 className="header-text">Create Resident</h1>
      </div>

      {/* Personal Information */}
      <div className="white-bg-container">
        <h3 className="section-title">Personal Information</h3>
        <hr class="section-divider" />
        <div className="upload-container">
          <div className="picture-upload-wrapper">
            <h3 className="form-label">2x2 Picture</h3>
            <div className="upload-box">
              <input
                onChange={handleChangeID}
                type="file"
                accept="image/jpeg, image/png"
                style={{ display: "none" }}
                ref={hiddenInputRef1}
              />

              <div className="upload-content">
                <div className="preview-container">
                  {isIDProcessing ? (
                    <p>Processing...</p>
                  ) : residentForm.id ? (
                    <img
                      alt="ID"
                      src={residentForm.id}
                      className="upload-img"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <BiSolidImageAlt className="w-16 h-16" />
                      <p>Attach Picture</p>
                    </div>
                  )}
                </div>

                <div className="upload-picture-btn ">
                  <button onClick={toggleCamera} className="upload-btn">
                    <FiCamera />
                  </button>
                  <button onClick={handleUploadID} className="upload-btn">
                    <FiUpload />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="picture-upload-wrapper">
            <h3 className="form-label">Signature</h3>
            <div className="upload-box">
              <input
                onChange={handleChangeSig}
                type="file"
                accept="image/jpeg, image/png"
                style={{ display: "none" }}
                ref={hiddenInputRef2}
              />
              <div className="upload-content">
                <div className="preview-container">
                  {isSignProcessing ? (
                    <p>Processing...</p>
                  ) : residentForm.signature ? (
                    <img
                      alt="Signature"
                      src={residentForm.signature}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <BiSolidImageAlt className="w-16 h-16" />
                      <p>Attach Signature</p>
                    </div>
                  )}
                </div>

                <div className="upload-signature-btn">
                  <button onClick={handleUploadSig} className="upload-btn">
                    <FiUpload />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                First Name<label className="text-red-600">*</label>
              </label>
              <input
                type="text"
                name="firstname"
                maxLength={50}
                value={residentForm.firstname}
                onChange={lettersAndSpaceOnly}
                placeholder="Enter first name"
                required
                className="form-input input-box"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Middle Name</label>
              <input
                name="middlename"
                value={residentForm.middlename}
                minLength={2}
                maxLength={100}
                onChange={lettersAndSpaceOnly}
                placeholder="Enter middle name"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Last Name<label className="text-red-600">*</label>
              </label>
              <input
                name="lastname"
                value={residentForm.lastname}
                minLength={2}
                maxLength={100}
                onChange={lettersAndSpaceOnly}
                placeholder="Enter last name"
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label for="suffix" className="form-label">
                Suffix
              </label>
              <select
                id="suffix"
                name="suffix"
                onChange={handleDropdownChange}
                className="form-input"
                value={residentForm.suffix}
              >
                <option value="Select" selected>
                  Select
                </option>
                {suffixList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Alias</label>
              <input
                name="alias"
                value={residentForm.alias}
                maxLength={50}
                onChange={lettersAndSpaceOnly}
                placeholder="Enter alias"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label for="salutation" className="form-label">
                Salutation
              </label>
              <select
                id="salutation"
                name="salutation"
                onChange={handleDropdownChange}
                value={residentForm.salutation}
                className="form-input"
              >
                <option value="Select" selected>
                  Select
                </option>
                {salutationList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label for="sex" className="form-label">
                Sex<label className="text-red-600">*</label>
              </label>
              <select
                id="sex"
                name="sex"
                onChange={handleDropdownChange}
                value={residentForm.sex}
                required
                className="form-input"
              >
                <option value="" selected>
                  Select
                </option>
                {sexList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label for="gender" className="form-label">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                onChange={handleDropdownChange}
                value={residentForm.gender}
                className="form-input"
              >
                <option value="" selected>
                  Select
                </option>
                {genderList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Birthdate<label className="text-red-600">*</label>
              </label>
              <input
                type="date"
                name="birthdate"
                onChange={(e) => {
                  const { name, value } = e.target;
                  setResidentForm((prev) => ({
                    ...prev,
                    [name]: value,
                  }));
                }}
                value={residentForm.birthdate}
                placeholder="Enter birthdate"
                min="1900-01-01"
                required
                className="form-input p-2"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="text"
                name="age"
                value={residentForm.age}
                readOnly
                className="form-input p-2"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Birthplace</label>
              <input
                name="birthplace"
                value={residentForm.birthplace}
                minLength={2}
                maxLength={150}
                onChange={birthplaceChange}
                placeholder="Enter birthplace"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label for="civilstatus" className="form-label">
                Civil Status<label className="text-red-600">*</label>
              </label>
              <select
                id="civilstatus"
                name="civilstatus"
                onChange={handleDropdownChange}
                value={residentForm.civilstatus}
                required
                className="form-input"
              >
                <option value="" selected>
                  Select
                </option>
                {civilstatusList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">PhilHealth ID</label>
              <input
                name="philhealthid"
                value={residentForm.philhealthid}
                onChange={numbersAndNoSpaceOnly}
                placeholder="Enter philhealth ID"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label for="philhealthtype" className="form-label">
                PhilHealth Membership
              </label>
              <select
                id="philhealthtype"
                name="philhealthtype"
                onChange={handleDropdownChange}
                value={residentForm.philhealthtype}
                className="form-input"
              >
                <option value="" selected>
                  Select
                </option>
                <option value="Member">Member</option>
                <option value="Dependent">Dependent</option>
              </select>
            </div>

            <div className="form-group">
              <label for="philhealthcategory" className="form-label">
                PhilHealth Category
              </label>
              <select
                id="philhealthcategory"
                name="philhealthcategory"
                onChange={handleDropdownChange}
                value={residentForm.philhealthcategory}
                className="form-input"
              >
                <option value="" selected>
                  Select
                </option>
                {philhealthcategoryList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>

            {residentForm.sex === "Female" && (
              <>
                <div className="form-group">
                  <label className="form-label">Last Menstrual Period</label>
                  <input
                    type="date"
                    name="lastmenstrual"
                    onChange={(e) => {
                      const { name, value } = e.target;
                      setResidentForm((prev) => ({
                        ...prev,
                        [name]: value,
                      }));
                    }}
                    value={residentForm.lastmenstrual}
                    placeholder="Enter date"
                    min="1900-01-01"
                    className="form-input p-2"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Using any FP method?</label>
                  <div className="radio-container">
                    <div className="radio-item">
                      <input
                        type="radio"
                        name="haveFPmethod"
                        onChange={handleRadioChange}
                        value="Yes"
                        checked={residentForm.haveFPmethod === "Yes"}
                      />
                      <h1>Yes</h1>
                    </div>
                    <div className="radio-item">
                      <input
                        type="radio"
                        name="haveFPmethod"
                        onChange={handleRadioChange}
                        value="No"
                        checked={residentForm.haveFPmethod === "No"}
                      />
                      <h1>No</h1>
                    </div>
                  </div>
                </div>

                {residentForm.haveFPmethod === "Yes" && (
                  <>
                    <div className="form-group">
                      <label for="philhealthcategory" className="form-label">
                        Family Planning Method
                      </label>
                      <select
                        id="fpmethod"
                        name="fpmethod"
                        onChange={handleDropdownChange}
                        value={residentForm.fpmethod}
                        className="form-input"
                      >
                        <option value="" selected>
                          Select
                        </option>
                        {fpmethodList.map((element) => (
                          <option value={element}>{element}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label for="philhealthcategory" className="form-label">
                        Family Planning Status
                      </label>
                      <select
                        id="fpstatus"
                        name="fpstatus"
                        onChange={handleDropdownChange}
                        value={residentForm.fpstatus}
                        className="form-input"
                      >
                        <option value="" selected>
                          Select
                        </option>
                        {fpstatusList.map((element) => (
                          <option value={element}>{element}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </>
            )}
            <div className="form-group">
              <label for="bloodtype" className="form-label">
                Blood Type
              </label>
              <select
                id="bloodtype"
                name="bloodtype"
                onChange={handleDropdownChange}
                value={residentForm.bloodtype}
                className="form-input"
              >
                <option value="" selected>
                  Select
                </option>
                {bloodtypeList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label for="religion" className="form-label">
                Religion
              </label>
              <select
                id="religion"
                name="religion"
                onChange={handleDropdownChange}
                value={residentForm.religion}
                className="form-input"
              >
                <option value="" selected>
                  Select
                </option>
                {religionList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label for="nationality" className="form-label">
                Nationality<label className="text-red-600">*</label>
              </label>
              <select
                id="nationality"
                name="nationality"
                onChange={handleDropdownChange}
                value={residentForm.nationality}
                required
                className="form-input"
              >
                <option value="" selected>
                  Select
                </option>
                {nationalityList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Registered Voter</label>
              <div className="radio-container">
                <div className="radio-item">
                  <input
                    type="radio"
                    name="voter"
                    onChange={handleRadioChange}
                    value="Yes"
                    checked={residentForm.voter === "Yes"}
                  />
                  <h1>Yes</h1>
                </div>
                <div className="radio-item">
                  <input
                    type="radio"
                    name="voter"
                    onChange={handleRadioChange}
                    value="No"
                    checked={residentForm.voter === "No"}
                  />
                  <h1>No</h1>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Precinct</label>
              <input
                name="precinct"
                onChange={precinctChange}
                value={residentForm.precinct}
                placeholder="Enter precinct"
                className="form-input"
                minLength={2}
                maxLength={4}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Classification by Age/Health</label>
              <div className="checkbox-container">
                {/* <label className="checkbox-btn-container">
                  <input
                    type="checkbox"
                    name="is4Ps"
                    checked={residentForm.is4Ps}
                    onChange={handleCheckboxChange}
                  />
                  <span>4Ps Beneficiary</span>
                </label> */}
                <label className="checkbox-btn-container">
                  <input
                    type="checkbox"
                    name="isNewborn"
                    checked={residentForm.isNewborn}
                    onChange={handleCheckboxChange}
                    disabled
                  />
                  <span>Newborn</span>
                </label>
                <label className="checkbox-btn-container">
                  <input
                    type="checkbox"
                    name="isInfant"
                    checked={residentForm.isInfant}
                    onChange={handleCheckboxChange}
                    disabled
                  />
                  <span>Infant</span>
                </label>
                <label className="checkbox-btn-container">
                  <input
                    type="checkbox"
                    name="isUnder5"
                    checked={residentForm.isUnder5}
                    onChange={handleCheckboxChange}
                    disabled
                  />
                  <span>Under 5 y.o</span>
                </label>
                <label className="checkbox-btn-container">
                  <input
                    type="checkbox"
                    name="isAdolescent"
                    checked={residentForm.isAdolescent}
                    onChange={handleCheckboxChange}
                    disabled
                  />
                  <span>Adolescent</span>
                </label>
                <label className="checkbox-btn-container">
                  <input
                    type="checkbox"
                    name="isAdult"
                    checked={residentForm.isAdult}
                    onChange={handleCheckboxChange}
                    disabled
                  />
                  <span>Adult</span>
                </label>
                <label className="checkbox-btn-container">
                  <input
                    type="checkbox"
                    name="isSenior"
                    checked={residentForm.isSenior}
                    onChange={handleCheckboxChange}
                    disabled
                  />
                  <span>Senior Citizen</span>
                </label>
                {residentForm.sex === "Female" && (
                  <label className="checkbox-btn-container">
                    <input
                      type="checkbox"
                      name="isWomenOfReproductive"
                      checked={residentForm.isWomenOfReproductive}
                      onChange={handleCheckboxChange}
                      disabled
                    />
                    <span>Women of Reproductive Age</span>
                  </label>
                )}
                {Boolean(
                  residentForm.age &&
                    residentForm.age >= 0 &&
                    residentForm.age <= 5
                ) && (
                  <label className="checkbox-btn-container">
                    <input
                      type="checkbox"
                      name="isSchoolAge"
                      checked={residentForm.isSchoolAge}
                      onChange={handleCheckboxChange}
                    />
                    <span>School of Age</span>
                  </label>
                )}
                {Boolean(
                  residentForm.age &&
                    residentForm.sex === "Female" &&
                    residentForm.age > 19
                ) && (
                  <label className="checkbox-btn-container">
                    <input
                      type="checkbox"
                      name="isPregnant"
                      checked={residentForm.isPregnant}
                      onChange={handleCheckboxChange}
                    />
                    <span>Pregnant</span>
                  </label>
                )}
                {Boolean(
                  residentForm.age &&
                    residentForm.sex === "Female" &&
                    residentForm.age >= 10 &&
                    residentForm.age <= 19
                ) && (
                  <label className="checkbox-btn-container">
                    <input
                      type="checkbox"
                      name="isAdolescentPregnant"
                      checked={residentForm.isAdolescentPregnant}
                      onChange={handleCheckboxChange}
                    />
                    <span>Adolescent Pregnant</span>
                  </label>
                )}
                {residentForm.sex === "Female" && (
                  <label className="checkbox-btn-container">
                    <input
                      type="checkbox"
                      name="isPostpartum"
                      checked={residentForm.isPostpartum}
                      onChange={handleCheckboxChange}
                    />
                    <span>Postpartum</span>
                  </label>
                )}
                <label className="checkbox-btn-container">
                  <input
                    type="checkbox"
                    name="isPWD"
                    checked={residentForm.isPWD}
                    onChange={handleCheckboxChange}
                  />
                  <span>Person with Disability (PWD)</span>
                </label>
                {/* <label className="checkbox-btn-container">
                  <input
                    type="checkbox"
                    name="isSoloParent"
                    checked={residentForm.isSoloParent}
                    onChange={handleCheckboxChange}
                  />
                  <span>Solo Parent</span>
                </label> */}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Medical History</label>
              <div className="checkbox-container">
                <label className="checkbox-btn-container">
                  <input
                    type="checkbox"
                    name="haveHypertension"
                    checked={residentForm.haveHypertension}
                    onChange={handleCheckboxChange}
                  />
                  <span>Hypertension</span>
                </label>
                <label className="checkbox-btn-container">
                  <input
                    type="checkbox"
                    name="haveDiabetes"
                    checked={residentForm.haveDiabetes}
                    onChange={handleCheckboxChange}
                  />
                  <span>Diabetes</span>
                </label>
                <label className="checkbox-btn-container">
                  <input
                    type="checkbox"
                    name="haveTubercolosis"
                    checked={residentForm.haveTubercolosis}
                    onChange={handleCheckboxChange}
                  />
                  <span>Tubercolosis</span>
                </label>
                <label className="checkbox-btn-container">
                  <input
                    type="checkbox"
                    name="haveSurgery"
                    checked={residentForm.haveSurgery}
                    onChange={handleCheckboxChange}
                  />
                  <span>Surgery</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Deceased</label>
              <div className="radio-container">
                <div className="radio-item">
                  <input
                    type="radio"
                    name="deceased"
                    onChange={handleRadioChange}
                    value="Yes"
                    checked={residentForm.deceased === "Yes"}
                  />
                  <h1>Yes</h1>
                </div>
                <div className="radio-item">
                  <input
                    type="radio"
                    name="deceased"
                    onChange={handleRadioChange}
                    value="No"
                    checked={residentForm.deceased === "No"}
                  />
                  <h1>No</h1>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <h3 className="section-title mt-8">Contact Information</h3>
          <hr class="section-divider" />

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                name="email"
                type="email"
                value={residentForm.email}
                onChange={stringsAndNoSpaceOnly}
                placeholder="Enter email"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Mobile Number<label className="text-red-600">*</label>
              </label>
              <input
                name="mobilenumber"
                value={residentForm.mobilenumber}
                onChange={mobileInputChange}
                placeholder="Enter mobile number"
                required
                maxLength={13}
                className="form-input"
              />
              {mobileNumError ? (
                <label className="text-red-500 font-semibold font-subTitle text-[14px]">
                  {mobileNumError}
                </label>
              ) : null}
            </div>
            <div className="form-group">
              <label className="form-label">Telephone</label>
              <input
                name="telephone"
                value={residentForm.telephone}
                onChange={telephoneInputChange}
                placeholder="Enter telephone"
                className="form-input"
                maxLength={13}
              />
              {telephoneNumError ? (
                <label className="text-red-500 font-semibold font-subTitle text-[14px]">
                  {telephoneNumError}
                </label>
              ) : null}
            </div>

            <div className="form-group">
              <label className="form-label">Facebook</label>
              <input
                name="facebook"
                value={residentForm.facebook}
                onChange={stringsAndNoSpaceOnly}
                placeholder="Enter facebook"
                className="form-input"
              />
            </div>
          </div>

          {/* In Case Of Emergency Situation */}
          <h3 className="section-title mt-8">In Case Of Emergency Situation</h3>
          <hr class="section-divider" />
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Name<label className="text-red-600">*</label>
              </label>
              <input
                name="emergencyname"
                value={residentForm.emergencyname}
                onChange={lettersAndSpaceOnly}
                minLength={2}
                maxLength={150}
                placeholder="Enter name"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Mobile Number<label className="text-red-600">*</label>
              </label>
              <input
                name="emergencymobilenumber"
                value={residentForm.emergencymobilenumber}
                onChange={mobileInputChange}
                placeholder="Enter mobile number"
                required
                maxLength={13}
                className="form-input"
              />
              {emMobileNumError ? (
                <label className="text-red-500 font-semibold font-subTitle text-[14px]">
                  {emMobileNumError}
                </label>
              ) : null}
            </div>

            <div className="form-group">
              <label className="form-label">
                Address<label className="text-red-600">*</label>
              </label>
              <input
                name="emergencyaddress"
                value={residentForm.emergencyaddress}
                minLength={5}
                maxLength={100}
                onChange={lettersNumbersAndSpaceOnly}
                placeholder="Enter address"
                required
                className="form-input"
              />
            </div>
          </div>

          {/* Household Information */}
          <h3 className="section-title mt-8">Household Information</h3>
          <hr class="section-divider" />

          <div className="form-group">
            <label className="form-label">
              Head of the Household<label className="text-red-600">*</label>
            </label>
            <div className="radio-container">
              <div className="radio-item">
                <input
                  type="radio"
                  name="head"
                  onChange={handleHouseholdChange}
                  value="Yes"
                  checked={residentForm.head === "Yes"}
                />
                <h1>Yes</h1>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="head"
                  onChange={handleHouseholdChange}
                  value="No"
                  checked={residentForm.head === "No"}
                />
                <h1>No</h1>
              </div>
            </div>
            {residentForm.head === "No" && (
              <>
                <div className="form-grid">
                  <div className="form-group">
                    <label for="householdno" className="form-label">
                      Household
                    </label>
                    <select
                      id="householdno"
                      name="householdno"
                      value={residentForm.householdno}
                      onChange={handleDropdownChange}
                      className="form-input"
                    >
                      <option value="" selected>
                        Select
                      </option>
                      {household
                        .filter((h) => h.status !== "Rejected")
                        .map((h) => {
                          const head = h.members.find(
                            (m) => m.position === "Head"
                          );
                          const headName = head.resID
                            ? `${head.resID.lastname}'s Residence - ${h.address}`
                            : "Unnamed";
                          return (
                            <option key={h._id} value={h._id}>
                              {headName}
                            </option>
                          );
                        })}
                    </select>
                  </div>
                  <div className="form-group">
                    <label for="HOAname" className="form-label">
                      Relationship
                    </label>
                    <select
                      id="householdposition"
                      name="householdposition"
                      value={residentForm.householdposition}
                      onChange={handleDropdownChange}
                      className="form-input"
                    >
                      <option value="">Select Relationship</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Grandparent">Grandparent</option>
                      <option value="Grandchild">Grandchild</option>
                      <option value="In-law">In-law</option>
                      <option value="Relative">Relative</option>
                      <option value="Housemate">Housemate</option>
                      <option value="Househelp">Househelp</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Head = Yes: show members table */}
            {residentForm.head === "Yes" && (
              <div className="mt-4">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">House Number</label>
                    <input
                      name="housenumber"
                      value={householdForm.housenumber}
                      onChange={householdNumbersAndNoSpaceOnly}
                      placeholder="Enter house number"
                      maxLength={3}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label for="street" className="form-label">
                      Street<label className="text-red-600">*</label>
                    </label>
                    <select
                      id="street"
                      name="street"
                      onChange={handleHouseholdDropdownChange}
                      required
                      value={householdForm.street}
                      className="form-input"
                    >
                      <option value="" selected>
                        Select
                      </option>
                      {streetList.map((element) => (
                        <option value={element}>{element}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label for="HOAname" className="form-label">
                      Homeowners Association (HOA) Name
                    </label>
                    <select
                      id="HOAname"
                      name="HOAname"
                      value={householdForm.HOAname}
                      onChange={handleHouseholdDropdownChange}
                      className="form-input"
                    >
                      <option value="" selected>
                        Select
                      </option>
                      <option value="Bermuda Town Homes">
                        Bermuda Town Homes
                      </option>
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="col-span-2">
                    <label className="form-label">
                      Ethnicity<label className="text-red-600">*</label>
                    </label>
                    <div className="radio-container">
                      <div className="radio-item">
                        <input
                          type="radio"
                          name="ethnicity"
                          onChange={handleHouseholdRadioChange}
                          value="IP Household"
                          checked={householdForm.ethnicity === "IP Household"}
                        />
                        <h1>Indigenous Peoples (IP) Household</h1>
                      </div>
                      <div className="radio-item">
                        <input
                          type="radio"
                          name="ethnicity"
                          onChange={handleHouseholdRadioChange}
                          value="Non-IP Household"
                          checked={
                            householdForm.ethnicity === "Non-IP Household"
                          }
                        />
                        <h1>Non-Indigenous Peoples (Non-IP) Household</h1>
                      </div>
                    </div>
                  </div>

                  {householdForm.ethnicity === "IP Household" && (
                    <div className="col-span-1">
                      <label className="form-label">Tribe</label>
                      <input
                        name="tribe"
                        value={householdForm.tribe}
                        onChange={householdLettersAndSpaceOnly}
                        placeholder="Enter tribe"
                        className="form-input"
                      />
                    </div>
                  )}
                </div>

                <div className="form-grid">
                  <div className="col-span-2">
                    <label className="form-label">
                      Socioeconomic Status
                      <label className="text-red-600">*</label>
                    </label>
                    <div className="radio-container">
                      <div className="radio-item">
                        <input
                          type="radio"
                          name="sociostatus"
                          onChange={handleHouseholdRadioChange}
                          value="NHTS 4Ps"
                          checked={householdForm.sociostatus === "NHTS 4Ps"}
                        />
                        <h1>National Household Targeting System (NHTS) 4Ps</h1>
                      </div>
                      <div className="radio-item">
                        <input
                          type="radio"
                          name="sociostatus"
                          onChange={handleHouseholdRadioChange}
                          value="NHTS Non-4Ps"
                          checked={householdForm.sociostatus === "NHTS Non-4Ps"}
                        />
                        <h1>
                          National Household Targeting System (NHTS) Non-4Ps
                        </h1>
                      </div>
                      <div className="radio-item">
                        <input
                          type="radio"
                          name="sociostatus"
                          onChange={handleHouseholdRadioChange}
                          value="Non-NHTS"
                          checked={householdForm.sociostatus === "Non-NHTS"}
                        />
                        <h1>
                          Non-National Household Targeting System (Non-NHTS)
                        </h1>
                      </div>
                    </div>
                  </div>

                  {(householdForm.sociostatus === "NHTS 4Ps" ||
                    householdForm.sociostatus === "NHTS Non-4Ps") && (
                    <div className="col-san-1">
                      <label className="form-label">
                        National Household Targeting System (NHTS) No.
                      </label>
                      <input
                        name="nhtsno"
                        value={householdForm.nhtsno}
                        onChange={householdNumbersAndNoSpaceOnly}
                        placeholder="Enter no."
                        className="form-input"
                      />
                    </div>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label for="employmentstatus" className="form-label">
                      Type of Water Source
                      <label className="text-red-600">*</label>
                    </label>
                    <select
                      id="watersource"
                      name="watersource"
                      value={householdForm.watersource}
                      onChange={handleHouseholdDropdownChange}
                      className="form-input"
                      required
                    >
                      <option value="" selected>
                        Select
                      </option>
                      {watersourceList.map((element) => (
                        <option value={element}>{element}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label for="employmentstatus" className="form-label">
                      Type of Toilet Facility
                      <label className="text-red-600">*</label>
                    </label>
                    <select
                      id="toiletfacility"
                      name="toiletfacility"
                      value={householdForm.toiletfacility}
                      onChange={handleHouseholdDropdownChange}
                      className="form-input"
                      required
                    >
                      <option value="" selected>
                        Select
                      </option>
                      {toiletfacilityList.map((element) => (
                        <option value={element}>{element}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <table className="household-tbl-container">
                  <thead>
                    <tr>
                      <th className="household-tbl-th">Relationship</th>
                      <th className="household-tbl-th">Name</th>
                      <th className="household-tbl-th">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {householdForm.members.map((member, index) => (
                      <tr key={index}>
                        <td className="household-tbl-th">
                          <select
                            value={member.position}
                            onChange={(e) =>
                              handleMemberChange(
                                index,
                                "position",
                                e.target.value
                              )
                            }
                            className="form-input"
                          >
                            <option value="">Select Relationship</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Son">Son</option>
                            <option value="Daughter">Daughter</option>
                            <option value="Parent">Parent</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Grandparent">Grandparent</option>
                            <option value="Grandchild">Grandchild</option>
                            <option value="In-law">In-law</option>
                            <option value="Relative">Relative</option>
                            <option value="Housemate">Housemate</option>
                            <option value="Househelp">Househelp</option>
                            <option value="Other">Other</option>
                          </select>
                        </td>
                        <td className="household-tbl-th">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Enter name"
                              value={member.resident}
                              onChange={(e) =>
                                handleMemberChange(
                                  index,
                                  "resident",
                                  e.target.value
                                )
                              }
                              className="form-input"
                            />
                            {memberSuggestions[index] &&
                              memberSuggestions[index].length > 0 && (
                                <ul className="absolute z-10 bg-white border w-full max-h-40 overflow-y-auto">
                                  {memberSuggestions[index].map((res) => {
                                    const fullName = `${res.firstname} ${
                                      res.middlename ? res.middlename + " " : ""
                                    }${res.lastname}`;
                                    return (
                                      <li
                                        key={res._id}
                                        className="p-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() =>
                                          handleMemberSuggestionClick(
                                            index,
                                            res
                                          )
                                        }
                                      >
                                        {fullName}
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}

                            {member.resident.trim() !== "" && !member.resID && (
                              <p className="text-gray-500 text-xs mt-1">
                                ⚠️ No matching resident found.{" "}
                                <span
                                  onClick={() =>
                                    navigation("/household/create-resident", {
                                      state: { create: true },
                                    })
                                  }
                                  className="text-[#0E94D3] cursor-pointer hover:underline"
                                >
                                  Click here
                                </span>{" "}
                                if you want to create a resident profile.
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="household-tbl-th">
                          {/* Prevent removing the Head */}
                          {member.position !== "Head" && (
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => removeMember(index)}
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div class="flex justify-end mt-2">
                  <button
                    type="button"
                    className="household-tbl-add-btn"
                    onClick={addMember}
                  >
                    <LuCirclePlus className="text-lg" />
                    <label>Add Member</label>
                  </button>
                </div>

                <table className="household-tbl-container">
                  <thead>
                    <tr>
                      <th className="household-tbl-th">Model</th>
                      <th className="household-tbl-th">Color</th>
                      <th className="household-tbl-th">Kind</th>
                      <th className="household-tbl-th">Plate Number</th>
                      <th className="household-tbl-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {householdForm.vehicles.map((vehicle, index) => (
                      <tr key={index}>
                        <td className="household-tbl-th">
                          <input
                            type="text"
                            className="form-input w-full"
                            value={vehicle.model || ""}
                            onChange={(e) =>
                              handleVehicleChange(
                                index,
                                "model",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="household-tbl-th">
                          <input
                            type="text"
                            className="form-input w-full"
                            value={vehicle.color || ""}
                            onChange={(e) =>
                              handleVehicleChange(
                                index,
                                "color",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="household-tbl-th">
                          <select
                            className="form-input w-full"
                            value={vehicle.kind || ""}
                            onChange={(e) =>
                              handleVehicleChange(index, "kind", e.target.value)
                            }
                          >
                            <option value="">Select kind</option>
                            <option value="Sedan">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="Motorcycle">Motorcycle</option>
                            <option value="Van">Van</option>
                            <option value="Truck">Truck</option>
                            <option value="Tricycle">Tricycle</option>
                            <option value="Bicycle">Bicycle</option>
                            <option value="Other">Other</option>
                          </select>
                        </td>
                        <td className="household-tbl-th">
                          <input
                            type="text"
                            className="form-input w-full"
                            value={vehicle.platenumber || ""}
                            onChange={(e) =>
                              handleVehicleChange(
                                index,
                                "platenumber",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="household-tbl-th">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => removeVehicle(index)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div class="flex justify-end mt-2">
                  <button
                    type="button"
                    className="household-tbl-add-btn"
                    onClick={addVehicle}
                  >
                    <LuCirclePlus className="text-lg" />
                    <label> Add Vehicle</label>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Employment Information */}
          <h3 className="section-title mt-8">Employment Information</h3>
          <hr class="section-divider" />

          <div className="form-grid">
            <div className="form-group">
              <label for="employmentstatus" className="form-label">
                Employment Status
              </label>
              <select
                id="employmentstatus"
                name="employmentstatus"
                value={residentForm.employmentstatus}
                onChange={handleDropdownChange}
                className="form-input"
              >
                <option value="" selected>
                  Select
                </option>
                {employmentstatusList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Occupation</label>
              <input
                name="occupation"
                value={residentForm.occupation}
                minLength={2}
                maxLength={100}
                onChange={occupationChange}
                placeholder="Enter occupation"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label for="monthlyincome" className="form-label">
                Monthly Income
              </label>
              <select
                id="monthlyincome"
                name="monthlyincome"
                value={residentForm.monthlyincome}
                onChange={handleDropdownChange}
                className="form-input"
              >
                <option value="" selected>
                  Select
                </option>
                {monthlyincomeList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Educational Information */}
          <h3 className="section-title mt-8">Educational Information</h3>
          <hr class="section-divider" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div className="form-group">
              <label for="educationalattainment" className="form-label">
                Educational Attainment
              </label>
              <select
                id="educationalattainment"
                name="educationalattainment"
                value={residentForm.educationalattainment}
                onChange={handleDropdownChange}
                className="form-input"
              >
                <option value="" selected>
                  Select
                </option>
                {educationalattainmentList.map((element) => (
                  <option value={element}>{element}</option>
                ))}
              </select>
            </div>
            {[
              "Vocational Course",
              "College Student",
              "College Undergrad",
              "College Graduate",
              "Postgraduate",
            ].includes(residentForm.educationalattainment) && (
              <div className="form-group">
                <label className="form-label">Course</label>
                <input
                  name="course"
                  value={residentForm.course}
                  minLength={2}
                  maxLength={100}
                  onChange={lettersAndSpaceOnly}
                  placeholder="Enter course"
                  className="form-input"
                />
              </div>
            )}
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
              type="submit"
              className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
            >
              Submit
            </button>
          </div>
        </form>

        {isCameraOpen && (
          <OpenCamera onDone={handleDone} onClose={handleClose} />
        )}
      </div>

      <div className="mb-20"></div>
    </div>
  );
}

export default CreateResident;
