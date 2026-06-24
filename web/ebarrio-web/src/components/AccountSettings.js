import { useRef, useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import { InfoContext } from "../context/InfoContext";
import { removeBackground } from "@imgly/background-removal";
import { storage } from "../firebase";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";

//SCREENS
import OpenCamera from "./OpenCamera";

//STYLES
import "../Stylesheets/Residents.css";
import "../Stylesheets/CommonStyle.css";
import "../Stylesheets/AccountSettings.css";

//ICONS
import { useConfirm } from "../context/ConfirmContext";
import { BiSolidImageAlt } from "react-icons/bi";
import { FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { FiCamera, FiUpload } from "react-icons/fi";
import { LuCirclePlus } from "react-icons/lu";
import { FaArchive, FaEdit } from "react-icons/fa";
import { FaCircleXmark } from "react-icons/fa6";
import { useLocation, useNavigate } from "react-router-dom";

function AccountSettings({ isCollapsed }) {
  const location = useLocation();
  const navigation = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [userDetails, setUserDetails] = useState(null);
  const [isProfileClicked, setProfileClicked] = useState(
    user.role !== "Technical Admin"
  );
  const [isUsernameClicked, setUsernameClicked] = useState(
    user.role === "Technical Admin"
  );
  const [isPasswordClicked, setPasswordClicked] = useState(false);
  const [isQuestionsClicked, setQuestionsClicked] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newpassword, setNewPassword] = useState("");
  const [renewpassword, setRenewPassword] = useState("");
  const [securityquestions, setSecurityQuestions] = useState([
    { question: "", answer: "" },
    { question: "", answer: "" },
  ]);
  const confirm = useConfirm();
  const [residentInfo, setResidentInfo] = useState([]);
  const [isIDProcessing, setIsIDProcessing] = useState(false);
  const [isSignProcessing, setIsSignProcessing] = useState(false);
  const [mobileNumError, setMobileNumError] = useState("");
  const [curPasswordError, setCurPasswordError] = useState("");
  const [emMobileNumError, setEmMobileNumError] = useState("");
  const [telephoneNumError, setTelephoneNumError] = useState("");
  const { fetchResidents, residents, fetchHouseholds, household } =
    useContext(InfoContext);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [repasswordErrors, setRePasswordErrors] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [id, setId] = useState();
  const [signature, setSignature] = useState(null);
  const hiddenInputRef1 = useRef(null);
  const hiddenInputRef2 = useRef(null);
  const [memberSuggestions, setMemberSuggestions] = useState([]);
  const [residentForm, setResidentForm] = useState({
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
    mobilenumber: "",
    telephone: "+63",
    facebook: "",
    emergencyname: "",
    emergencymobilenumber: "",
    emergencyaddress: "",
    employmentstatus: "",
    employmentfield: "",
    occupation: "",
    monthlyincome: "",
    educationalattainment: "",
    typeofschool: "",
    course: "",
    householdno: "",
    householdposition: "",
    head: "",
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
  });

  const [householdForm, setHouseholdForm] = useState({
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
  });

  const [showUserPassword, setShowUserPassword] = useState(false);
  const [showCurrPassword, setShowCurrPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameErrors, setUsernameErrors] = useState([]);
  const [showAnswer1, setShowAnswer1] = useState(false);
  const [showAnswer2, setShowAnswer2] = useState(false);
  const [showSecurityPass, setShowSecurityPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (user.role !== "Technical Admin") {
      fetchResidents();
      fetchHouseholds();
    }
  }, [user]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await api.get(`/getcurrentuser/${user.userID}`);

        setUserDetails(response.data);

        if (user.role !== "Technical Admin") {
          try {
            const response2 = await api.get(
              `/getresident/${response.data.empID.resID._id}`
            );
            setResidentInfo(response2.data);
          } catch (error) {
            console.log("Error fetching resident", error);
          }
        }

        if (
          !Array.isArray(response.data.securityquestions) ||
          response.data.securityquestions.length === 0
        ) {
          return;
        }

        setSecurityQuestions([
          {
            question: response.data.securityquestions[0]?.question || "",
            answer: "",
          },
          {
            question: response.data.securityquestions[1]?.question || "",
            answer: "",
          },
        ]);
      } catch (error) {
        console.log("Error fetching user details", error);
      }
    };
    fetchUserDetails();
  }, [user.userID]);

  const handleMenu1 = () => {
    setPassword("");
    setCurPasswordError("");
    setUsernameErrors([]);
    setPasswordErrors([]);
    setRePasswordErrors([]);
    setNewPassword("");
    setRenewPassword("");
    setProfileClicked(true);
    setUsernameClicked(false);
    setPasswordClicked(false);
    setQuestionsClicked(false);
  };
  const handleMenu2 = () => {
    setPassword("");
    setCurPasswordError("");
    setUsernameErrors([]);
    setPasswordErrors([]);
    setRePasswordErrors([]);
    setNewPassword("");
    setRenewPassword("");
    setUsernameClicked(true);
    setProfileClicked(false);
    setPasswordClicked(false);
    setQuestionsClicked(false);
  };
  const handleMenu3 = () => {
    setPassword("");
    setCurPasswordError("");
    setUsernameErrors([]);
    setPasswordErrors([]);
    setRePasswordErrors([]);
    setNewPassword("");
    setRenewPassword("");
    setPasswordClicked(true);
    setUsernameClicked(false);
    setProfileClicked(false);
    setQuestionsClicked(false);
  };

  const handleMenu4 = () => {
    setPassword("");
    setCurPasswordError("");
    setUsernameErrors([]);
    setPasswordErrors([]);
    setRePasswordErrors([]);
    setNewPassword("");
    setRenewPassword("");
    setQuestionsClicked(true);
    setPasswordClicked(false);
    setUsernameClicked(false);
    setProfileClicked(false);
  };

  const handleSecurityChange = (index, field, value) => {
    const updated = [...securityquestions];
    updated[index][field] = value;
    setSecurityQuestions(updated);
  };

  const securityQuestionsList = [
    "What was the name of your first pet?",
    "What is your mother's maiden name?",
    "What was the name of your first school?",
    "What was your childhood name?",
    "What is your favorite book?",
    "What is your favorite movie of all time?",
    "What is the name of your first crush?",
    "What is the name of your favorite teacher?",
    "What is the name of of your first childhood friend?",
    "What city you were born in?",
  ];

  const handleUsernameChange = async () => {
    let hasErrors = false;

    if (usernameErrors.length !== 0) {
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      const isConfirmed = await confirm(
        "Please confirm to proceed with changing the username. You can only change it once every 30 days.",
        "confirm"
      );
      if (!isConfirmed) {
        return;
      }

      if (loading) return;

      setLoading(true);
      try {
        await api.get(`/checkusername/${username}`);
        try {
          await api.put(`/changeusername/${user.userID}`, {
            username,
            password,
          });
          confirm("Your username has been successfully updated.", "success");
          setUsername("");
          setPassword("");
        } catch (error) {
          const response = error.response;
          if (response && response.data) {
            console.log("❌ Error status:", response.status);
            confirm(response.data.message || "Something went wrong.", "failed");
          } else {
            console.log("❌ Network or unknown error:", error.message);
          }
        }
      } catch (error) {
        const response = error.response;
        if (response && response.data) {
          console.log("❌ Error status:", response.status);
          confirm(response.data.message || "Something went wrong.", "failed");
        } else {
          console.log("❌ Network or unknown error:", error.message);
        }
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.log("Error in changing username", error);
    }
  };

  const handlePasswordChange = async () => {
    let hasErrors = false;

    if (passwordErrors.length !== 0) {
      hasErrors = true;
    }

    if (repasswordErrors.length !== 0) {
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }
    try {
      const isConfirmed = await confirm(
        "Please confirm to proceed with changing your password.",
        "confirm"
      );
      if (!isConfirmed) {
        return;
      }

      if (loading) return;

      setLoading(true);
      try {
        await api.put(`/changepassword/${user.userID}`, {
          newpassword,
          password,
        });
        confirm(
          "Your password has been successully updated. Please log in again.",
          "success"
        );
      } catch (error) {
        const response = error.response;
        if (response && response.data) {
          console.log("❌ Error status:", response.status);
          confirm(response.data.message || "Something went wrong.", "failed");
        } else {
          console.log("❌ Network or unknown error:", error.message);
          confirm("An unexpected error occurred.", "errordialog");
        }
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.log("Error in changing password", error);
    }
  };

  const handleQuestionsChange = async () => {
    let hasErrors = false;
    const modifiedQuestions = securityquestions?.map((q, index) => {
      const current = userDetails?.securityquestions?.[index];
      const isSameQuestion = current?.question === q.question;
      const hasNewAnswer = q.answer?.trim() !== "";

      if (!isSameQuestion && hasNewAnswer) {
        return q;
      } else if (isSameQuestion && hasNewAnswer) {
        return { question: q.question, answer: q.answer };
      } else {
        return null;
      }
    });

    const hasChanges = modifiedQuestions.some((q) => q !== null);

    if (!hasChanges) {
      confirm(
        "No changes detected in your security questions. Please enter answer to change your security questions",
        "failed"
      );
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }
    try {
      const isConfirmed = await confirm(
        "Please confirm to proceed with changing your security questions.",
        "confirm"
      );
      if (!isConfirmed) {
        return;
      }

      if (loading) return;

      setLoading(true);
      try {
        await api.put(`/changesecurityquestions/${user.userID}`, {
          securityquestions: modifiedQuestions,
          password,
        });
        confirm(
          "Your security questions has been successfully updated.",
          "success"
        );
        setPassword("");
        setSecurityQuestions((prevQuestions) =>
          prevQuestions.map((q) => ({
            ...q,
            answer: "",
          }))
        );
      } catch (error) {
        const response = error.response;
        if (response && response.data) {
          console.log("❌ Error status:", response.status);
          confirm(response.data.message || "Something went wrong.", "failed");
        } else {
          console.log("❌ Network or unknown error:", error.message);
          confirm("An unexpected error occurred.", "errordialog");
        }
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.log("Error in changing security questions", error);
    }
  };

  /* Profile */

  useEffect(() => {
    if (residentInfo) {
      let houseNumber = "";
      let streetName = "";
      const siblingsLength = residentInfo.siblings
        ? residentInfo.siblings.length
        : 0;
      const childrenLength = residentInfo.children
        ? residentInfo.children.length
        : 0;

      const address = residentInfo.address || "";

      const firstWord = address.trim().split(" ")[0];
      const isNumber = !isNaN(firstWord);

      if (isNumber) {
        houseNumber = firstWord;
        const preStreetName = address.split("Aniban")[0].trim();
        const streetWords = preStreetName.split(" ");
        streetWords.shift();
        streetName = streetWords.join(" ");
      } else {
        streetName = address.split("Aniban")[0].trim();
        houseNumber = "";
      }

      let formattedNumber =
        residentInfo.mobilenumber && residentInfo.mobilenumber.length > 0
          ? "+63" + residentInfo.mobilenumber.slice(1)
          : "";

      let formattedEmergencyNumber =
        residentInfo.emergencymobilenumber &&
        residentInfo.emergencymobilenumber.length > 0
          ? "+63" + residentInfo.emergencymobilenumber.slice(1)
          : "";

      let formattedTelephone =
        residentInfo.telephone && residentInfo.telephone.length > 0
          ? "+63" + residentInfo.telephone.slice(1)
          : "+63";

      setResidentForm((prevForm) => ({
        ...prevForm,
        ...residentInfo,
        numberofsiblings: siblingsLength,
        numberofchildren: childrenLength,
        street: streetName,
        housenumber: houseNumber,
        mobilenumber: formattedNumber,
        emergencymobilenumber: formattedEmergencyNumber,
        telephone: formattedTelephone,
        householdno: residentInfo.householdno?._id,
      }));
      if (residentInfo.picture) setId(residentInfo.picture);
      if (residentInfo.signature) setSignature(residentInfo.signature);
    }
  }, [residentInfo]);

  useEffect(() => {
    if (user.role !== "Technical Admin") {
      const fetchResident = async () => {
        try {
          const response = await api.get(`/getresident/${user.resID}`);
          setResidentInfo(response.data);
        } catch (error) {
          console.log("Error fetching resident", error);
        }
      };
      fetchResident();
    }
  }, [user]);

  useEffect(() => {
    if (residentInfo.householdno) {
      let houseNumber = "";
      let streetName = "";
      const fetchHousehold = async () => {
        try {
          const res = await api.get(
            `/gethousehold/${residentInfo.householdno._id}`
          );

          const address = res.data.address || "";

          const firstWord = address.trim().split(" ")[0];
          const isNumber = !isNaN(firstWord);

          if (isNumber) {
            houseNumber = firstWord;
            const preStreetName = address.split("Aniban")[0].trim();
            const streetWords = preStreetName.split(" ");
            streetWords.shift();
            streetName = streetWords.join(" ");
          } else {
            streetName = address.split("Aniban")[0].trim();
            houseNumber = "";
          }

          const head = res.data.members.find(
            (member) => member.position === "Head"
          );

          const isHead = head?.resID?._id === user.resID;

          if (isHead) {
            setResidentForm((prev) => ({
              ...prev,
              head: "Yes",
            }));

            const otherMembers = res.data.members.filter(
              (member) => member.position !== "Head"
            );

            setHouseholdForm((prev) => ({
              ...prev,
              ...res.data,
              members: otherMembers,
              vehicles: res.data.vehicles,
              housenumber: houseNumber,
              street: streetName,
            }));
          } else {
            const currentMember = res.data.members.find(
              (member) => member.resID?._id === user.resID
            );
            setResidentForm((prev) => ({
              ...prev,
              head: "No",
              householdposition: currentMember?.position || "",
            }));
          }
        } catch (error) {
          console.log("Error in fetching household", error);
        }
      };

      fetchHousehold();
    }
  }, [residentInfo.householdno]);
  // DROPDOWN VALUES
  const suffixList = ["Jr.", "Sr.", "I", "II", "III", "IV", "None"];
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
    "None",
  ];
  const sexList = ["Male", "Female"];
  const genderList = [
    "Male",
    "Female",
    "Non-binary",
    "Genderfluid",
    "Agender",
    "Other",
    "Prefer not to say",
  ];
  const civilstatusList = [
    "Single",
    "Married",
    "Widow-er",
    "Separated",
    "Annulled",
    "Cohabitation",
  ];
  const bloodtypeList = [
    "A",
    "A-",
    "B",
    "B-",
    "AB",
    "AB-",
    "O",
    "O-",
    "Unknown",
  ];
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
    "Prefer not to say",
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
      confirm(
        "The file is too large. The maximum allowed size is 1 MB.",
        "failed"
      );
      event.target.value = "";
      return;
    }
    setIsIDProcessing(true);
    try {
      const blob = await removeBackground(fileUploaded);
      const url = URL.createObjectURL(blob);
      setId(url);
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
      setId(url);
      setIsIDProcessing(false);
    }, 500);
  };

  const handleClose = () => {
    setIsCameraOpen(false);
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

    if (!id) {
      confirm("Please attach a picture!", "failed");
      hasErrors = true;
    } else if (!signature) {
      confirm("Please attach a signature", "failed");
      hasErrors = true;
    }
    if (residentForm.mobilenumber && residentForm.mobilenumber.length !== 13) {
      setMobileNumError("Invalid mobile number format!");
      hasErrors = true;
    }
    if (residentForm.mobilenumber && residentForm.mobilenumber.length !== 13) {
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
      let idPicture;
      let signaturePicture;
      const isConfirmed = await confirm(
        "Please confirm to save the updated resident profile. Make sure all information is correct before submission.",
        "confirm"
      );
      if (!isConfirmed) {
        return;
      }
      if (loading) return;

      setLoading(true);
      const fulladdress = `${householdForm.housenumber} ${householdForm.street} Aniban 2, Bacoor, Cavite`;
      if (id !== residentInfo.picture) {
        console.log("Uploading new picture...");
        idPicture = await uploadToFirebase(id);
      } else {
        idPicture = residentInfo.picture;
      }

      if (signature !== residentInfo.signature) {
        signaturePicture = await uploadToFirebase(signature);
      } else {
        signaturePicture = residentInfo.signature;
      }

      let formattedMobileNumber = residentForm.mobilenumber;
      formattedMobileNumber = "0" + residentForm.mobilenumber.slice(3);

      let formattedEmergencyMobileNumber = residentForm.emergencymobilenumber;
      formattedEmergencyMobileNumber =
        "0" + residentForm.emergencymobilenumber.slice(3);

      let formattedTelephone = residentForm.telephone;
      if (residentForm.telephone) {
        formattedTelephone = "0" + residentForm.telephone.slice(3);
        delete residentForm.telephone;
      }

      delete residentForm.mobilenumber;
      delete residentForm.emergencymobilenumber;
      const updatedHouseholdForm = {
        ...householdForm,
        address: fulladdress,
      };

      const updatedResidentForm = {
        ...residentForm,
        picture: idPicture,
        signature: signaturePicture,
        mobilenumber: formattedMobileNumber,
        emergencymobilenumber: formattedEmergencyMobileNumber,
        telephone: formattedTelephone,
        householdForm: updatedHouseholdForm,
      };

      await api.put(`/updateresident/${user.resID}`, updatedResidentForm);
      confirm("Your profile has been successfully updated.", "success");
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
      const blob = await removeBackground(fileUploaded);
      const url = URL.createObjectURL(blob);
      setSignature(url);
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
    value = value.replace(/\D/g, "");

    if (!value.startsWith("+63")) {
      value = "+63" + value.replace(/^0+/, "").slice(2);
    }
    if (value.length > 11) {
      value = value.slice(0, 13);
    }
    if (value.length >= 4 && value[3] === "0") {
      return;
    }

    setResidentForm((prev) => ({ ...prev, [name]: value }));

    if (name === "telephone") {
      if (value === "+63") {
        setTelephoneNumError(null);
      } else if (value.length > 11) {
        setTelephoneNumError(null);
      } else {
        setTelephoneNumError("Invalid telephone number format!");
      }
    }
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

  //HOUSEHOLD
  const handleHouseholdChange = (e) => {
    const value = e.target.value;
    setResidentForm({ ...residentForm, head: value });
  };

  const handleMemberSuggestionClick = (index, resident) => {
    setNewMembers((prev) => {
      const updated = [...prev];
      updated[index].resID = resident;
      updated[index].resident = `${resident.firstname} ${
        resident.middlename ? resident.middlename + " " : ""
      }${resident.lastname}`;
      return updated;
    });

    setMemberSuggestions((prev) => ({
      ...prev,
      [index]: [],
    }));
  };

  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editedPosition, setEditedPosition] = useState("");
  const [newMembers, setNewMembers] = useState([]);

  const [newVehicles, setNewVehicles] = useState([]);
  const [editingVehicleIndex, setEditingVehicleIndex] = useState(null);
  const [editedVehicle, setEditedVehicle] = useState({});

  const handleSavePosition = async (member) => {
    const isConfirmed = await confirm(
      "Are you sure you want to update this member?",
      "confirm"
    );
    if (!isConfirmed) return;
    try {
      await api.put(
        `/household/${residentInfo.householdno._id}/member/${member._id}`,
        {
          position: editedPosition,
        }
      );

      setHouseholdForm((prev) => ({
        ...prev,
        members: prev.members.map((m) =>
          m._id === member._id ? { ...m, position: editedPosition } : m
        ),
      }));

      setEditingMemberId(null);
      setEditedPosition("");
      confirm(
        "The member's position has been successfully updated.",
        "success"
      );
    } catch (error) {
      console.error("Error updating position:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingMemberId(null);
    setEditedPosition("");
  };

  const handleRemoveMember = async (member) => {
    const isConfirmed = await confirm(
      "Are you sure you want to remove this member?",
      "confirmred"
    );
    if (!isConfirmed) return;

    try {
      await api.delete(
        `/household/${residentInfo.householdno._id}/member/${member._id}`
      );
      setHouseholdForm((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m._id !== member._id),
      }));
      confirm("The member has been successfully removed.", "success");
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const handleAddMember = () => {
    setNewMembers((prev) => [
      ...prev,
      {
        tempId: Date.now(),
        resID: null,
        position: "",
        resident: "",
        isNew: true,
      },
    ]);
  };

  const handleSaveNewMember = async (member) => {
    if (!member.resID || !member.position) {
      confirm("Please fill out both the resident and position.", "failed");
      return;
    }
    const isConfirmed = await confirm(
      "Are you sure you want to add this resident as household member?",
      "confirm"
    );
    if (!isConfirmed) return;
    try {
      const payload = {
        resID: member.resID._id,
        position: member.position,
      };

      console.log("Payload", payload);

      const response = await api.post(
        `/household/${residentInfo.householdno._id}/member`,
        payload
      );

      setHouseholdForm((prev) => ({
        ...prev,
        members: [...(prev.members || []), response.data],
      }));

      setNewMembers((prev) => prev.filter((m) => m.tempId !== member.tempId));
      confirm("The new member has been successfully added.", "success");
    } catch (error) {
      console.error("Error adding new member:", error);
    }
  };

  const handleCancelNewMember = (tempId) => {
    setNewMembers((prev) => prev.filter((m) => m.tempId !== tempId));
  };

  const handleMemberInputChange = (index, value) => {
    setNewMembers((prev) => {
      const updated = [...prev];
      updated[index].resident = value;
      updated[index].resID = null;
      return updated;
    });
    if (value.length > 0) {
      const filtered = residents
        .filter((r) => r._id !== user.resID)
        .filter((r) => r.householdno?._id !== residentInfo.householdno._id)
        .filter(
          (r) =>
            r.status !== "Archived" &&
            r.status !== "Pending" &&
            r.status !== "Rejected"
        )
        .filter((r) => {
          const fullName = `${r.firstname} ${
            r.middlename ? r.middlename + " " : ""
          }${r.lastname}`.toLowerCase();
          return fullName.includes(value.toLowerCase());
        });
      setMemberSuggestions((prev) => ({
        ...prev,
        [index]: filtered,
      }));
    } else {
      setMemberSuggestions((prev) => ({
        ...prev,
        [index]: [],
      }));
    }
  };

  const handleAddVehicle = () => {
    setNewVehicles([
      ...newVehicles,
      { model: "", color: "", kind: "", platenumber: "", tempId: Date.now() },
    ]);
  };

  const handleRemoveVehicle = async (vehicleID) => {
    const isConfirmed = await confirm(
      "Are you sure you want to remove this vehicle?",
      "confirmred"
    );
    if (!isConfirmed) return;

    try {
      await api.delete(
        `/household/${residentInfo.householdno._id}/vehicle/${vehicleID}`
      );
      setHouseholdForm((prev) => ({
        ...prev,
        vehicles: prev.vehicles.filter((v) => v._id !== vehicleID),
      }));
      confirm("The vehicle has been successfully removed.", "success");
    } catch (error) {
      console.error("Error removing vehicle:", error);
    }
  };

  const handleSaveNewVehicle = async (vehicle) => {
    const isConfirmed = await confirm(
      "Are you sure you want to add this vehicle?",
      "confirm"
    );
    if (!isConfirmed) return;
    try {
      const payload = {
        model: vehicle.model,
        color: vehicle.color,
        kind: vehicle.kind,
        platenumber: vehicle.platenumber,
      };
      const response = await api.post(
        `/household/${residentInfo.householdno._id}/vehicle`,
        payload
      );

      setHouseholdForm((prev) => ({
        ...prev,
        vehicles: [...(prev.vehicles || []), response.data],
      }));
      setNewVehicles((prev) => prev.filter((v) => v.tempId !== vehicle.tempId));
      confirm("The vehicle has been successfully added.", "success");
    } catch (error) {
      console.error("Error adding new vehicle:", error);
    }
  };
  const handleSaveEditedVehicle = async (vehicle) => {
    const isConfirmed = await confirm(
      "Are you sure you want to update this vehicle?",
      "confirm"
    );
    if (!isConfirmed) return;
    try {
      const payload = {
        model: editedVehicle.model,
        color: editedVehicle.color,
        kind: editedVehicle.kind,
        platenumber: editedVehicle.platenumber,
      };

      await api.put(
        `/household/${residentInfo.householdno._id}/vehicle/${editedVehicle._id}`,
        { payload }
      );

      setHouseholdForm((prev) => ({
        ...prev,
        vehicles: prev.vehicles.map((v) =>
          v._id === editedVehicle._id ? { ...v, ...payload } : v
        ),
      }));

      setEditingVehicleIndex(null);
      setEditedVehicle("");
      confirm("The vehicle has been successfully updated.", "success");
    } catch (error) {
      console.error("Error updating position:", error);
    }
  };

  const handleNewVehicleChange = (index, field, value) => {
    const updated = [...newVehicles];
    updated[index][field] = value;
    setNewVehicles(updated);
  };

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

  const usernameValidation = (e) => {
    let val = e.target.value;
    let errors = [];
    let formattedVal = val.replace(/\s+/g, "");
    setUsername(formattedVal);

    if (
      (formattedVal && formattedVal.length < 3) ||
      (formattedVal && formattedVal.length > 16)
    ) {
      errors.push("Username must be between 3 and 16 characters only!");
    }
    if (formattedVal && !/^[a-zA-Z0-9_]+$/.test(formattedVal)) {
      errors.push(
        "Username can only contain letters, numbers, and underscores!"
      );
    }
    if (
      (formattedVal && formattedVal.startsWith("_")) ||
      (formattedVal && formattedVal.endsWith("_"))
    ) {
      errors.push("Username must not start or end with an underscore!");
    }

    setUsernameErrors(errors);
  };

  const repasswordValidation = (e) => {
    let val = e.target.value;
    let errors = [];
    let formattedVal = val.replace(/\s+/g, "");
    setRenewPassword(formattedVal);

    if (formattedVal !== newpassword && formattedVal.length > 0) {
      errors.push("Passwords do not match!");
    }
    setRePasswordErrors(errors);
  };

  const curpasswordValidation = (e) => {
    let val = e.target.value;
    let formattedVal = val.replace(/\s+/g, "");
    setPassword(formattedVal);
  };

  const passwordValidation = (e) => {
    let val = e.target.value;
    let errors = [];
    let errors2 = [];
    let formattedVal = val.replace(/\s+/g, "");
    setNewPassword(formattedVal);

    if (
      (formattedVal && formattedVal.length < 8) ||
      (formattedVal && formattedVal.length > 64)
    ) {
      errors.push("Password must be between 8 and 64 characters only!");
    }
    if (formattedVal && !/^[a-zA-Z0-9!@\$%\^&*\+#]+$/.test(formattedVal)) {
      errors.push(
        "Password can only contain letters, numbers, and !, @, $, %, ^, &, *, +, #"
      );
    }

    if (renewpassword && formattedVal !== renewpassword) {
      errors2.push("Passwords do not match!");
    }
    setPasswordErrors(errors);
    setRePasswordErrors(errors2);
  };

  const maskUsername = (uname) => {
    if (!uname) return "";
    if (uname.length <= 2) return uname[0] + "*";

    const firstChar = uname[0];
    const lastChar = uname[uname.length - 1];
    const maskedLength = uname.length - 2;
    const masked = "*".repeat(maskedLength);
    return `${firstChar}${masked}${lastChar}`;
  };

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        {(loading || isIDProcessing || isSignProcessing) && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
        <div className="header-text">Account Settings</div>
        <div className="settings-container">
          {/* Left Panel */}
          <div className="settings-left-container">
            {user.role !== "Technical Admin" && (
              <p
                onClick={handleMenu1}
                className={`settings-left-tab ${
                  isProfileClicked
                    ? "settings-left-tab-active"
                    : "p-2 font-medium"
                }`}
              >
                Profile
              </p>
            )}

            <p
              onClick={handleMenu2}
              className={`settings-left-tab ${
                isUsernameClicked
                  ? "settings-left-tab-active"
                  : "p-2 font-medium"
              }`}
            >
              Username
            </p>
            <p
              onClick={handleMenu3}
              className={`settings-left-tab ${
                isPasswordClicked
                  ? "settings-left-tab-active"
                  : "p-2 font-medium"
              }`}
            >
              Password
            </p>
            <p
              onClick={handleMenu4}
              className={`settings-left-tab ${
                isQuestionsClicked
                  ? "settings-left-tab-active"
                  : "p-2 font-medium"
              }`}
            >
              Security Questions
            </p>
          </div>

          {/* Right Panel */}
          <div className="cols-span-3">
            {/* Profile */}
            <div>
              {isProfileClicked && (
                <>
                  <div className="white-bg-container">
                    <h3 className="section-title">Personal Information</h3>
                    <hr class="section-divider" />
                    <div className="upload-container">
                      <div className="picture-upload-wrapper">
                        <h3 className="form-label">
                          Picture<label className="text-red-600">*</label>
                        </h3>
                        <div className="upload-box">
                          <input
                            onChange={handleChangeID}
                            type="file"
                            style={{ display: "none" }}
                            ref={hiddenInputRef1}
                          />
                          <div className="upload-content">
                            <div className="preview-container ">
                              {isIDProcessing ? (
                                <p>Processing...</p>
                              ) : id ? (
                                <img alt="ID" src={id} className="upload-img" />
                              ) : (
                                <div className="upload-placeholder-container">
                                  <BiSolidImageAlt className="w-16 h-16" />
                                  <p>Attach Image</p>
                                </div>
                              )}
                            </div>

                            <div className="upload-picture-btn">
                              <button
                                onClick={toggleCamera}
                                className="upload-btn"
                              >
                                <FiCamera />
                              </button>
                              <button
                                onClick={handleUploadID}
                                className="upload-btn"
                              >
                                <FiUpload />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="picture-upload-wrapper">
                        <h3 className="form-label">
                          Signature<label className="text-red-600">*</label>
                        </h3>
                        <div className="upload-box">
                          <input
                            onChange={handleChangeSig}
                            type="file"
                            style={{ display: "none" }}
                            ref={hiddenInputRef2}
                          />
                          <div className="upload-content">
                            <div className="preview-container">
                              {isSignProcessing ? (
                                <p>Processing...</p>
                              ) : signature ? (
                                <img
                                  alt="Signature"
                                  src={signature}
                                  className="upload-img"
                                />
                              ) : (
                                <div className="upload-placeholder-container">
                                  <BiSolidImageAlt className="w-16 h-16" />
                                  <p>Attach Image</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="upload-signature-btn">
                            <button
                              onClick={handleUploadSig}
                              className="upload-btn"
                            >
                              <FiUpload className="upload-btn-img" />
                            </button>
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
                            value={residentForm.suffix}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
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
                            <option value="" disabled selected hidden>
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
                            required
                            value={residentForm.sex}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
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
                            <option value="" disabled selected hidden>
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
                            Civil Status
                            <label className="text-red-600">*</label>
                          </label>
                          <select
                            id="civilstatus"
                            name="civilstatus"
                            onChange={handleDropdownChange}
                            required
                            value={residentForm.civilstatus}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
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
                          <label
                            for="philhealthcategory"
                            className="form-label"
                          >
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
                              <label className="form-label">
                                Last Menstrual Period
                              </label>
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
                              <label className="form-label">
                                Using any FP method?
                              </label>
                              <div className="radio-container">
                                <div className="radio-item">
                                  <input
                                    type="radio"
                                    name="haveFPmethod"
                                    onChange={handleRadioChange}
                                    value="Yes"
                                    checked={
                                      residentForm.haveFPmethod === "Yes"
                                    }
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
                                  <label
                                    for="philhealthcategory"
                                    className="form-label"
                                  >
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
                                  <label
                                    for="philhealthcategory"
                                    className="form-label"
                                  >
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
                            <option value="" disabled selected hidden>
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
                            <option value="" disabled selected hidden>
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
                            required
                            value={residentForm.nationality}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
                              Select
                            </option>
                            {nationalityList.map((element) => (
                              <option value={element}>{element}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group space-x-5">
                          <label className="form-label ">
                            Registered Voter
                          </label>
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
                            value={residentForm.precinct}
                            onChange={precinctChange}
                            placeholder="Enter precinct"
                            className="form-input"
                            minLength={2}
                            maxLength={4}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Classification</label>
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
                      <h3 className="section-title mt-8">
                        Contact Information
                      </h3>
                      <hr class="section-divider" />

                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Email</label>
                          <input
                            name="email"
                            value={residentForm.email}
                            onChange={stringsAndNoSpaceOnly}
                            placeholder="Enter email"
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Mobile Number
                            <label className="text-red-600">*</label>
                          </label>
                          <input
                            name="mobilenumber"
                            value={residentForm.mobilenumber}
                            onChange={mobileInputChange}
                            placeholder="Enter mobile number"
                            required
                            className="form-input"
                            maxLength={13}
                          />
                          {mobileNumError ? (
                            <label className="error-msg">
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
                            <label className="error-msg">
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
                      <h3 className="section-title mt-8">
                        In Case Of Emergency Situation
                      </h3>
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
                            placeholder="Enter name"
                            required
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Mobile Number
                            <label className="text-red-600">*</label>
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
                            <label className="error-msg">
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
                            onChange={lettersNumbersAndSpaceOnly}
                            placeholder="Enter address"
                            required
                            className="form-input"
                          />
                        </div>
                      </div>

                      {/* Household Information */}
                      <h3 className="section-title mt-8">
                        Household Information
                      </h3>
                      <hr class="section-divider" />

                      <div className="form-group">
                        <label className="form-label">
                          Head of the Household
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
                                    .filter(
                                      (h) =>
                                        h.status !== "Rejected" &&
                                        h.status !== "Pending" &&
                                        h.status !== "Archived"
                                    )
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
                                  <option value="Grandparent">
                                    Grandparent
                                  </option>
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
                          <>
                            <div className="mt-4">
                              <div className="form-grid">
                                <div className="form-group">
                                  <label className="form-label">
                                    House Number
                                  </label>
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
                                    Street
                                    <label className="text-red-600">*</label>
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

                                <div className="col-span-2">
                                  <label className="form-label">
                                    Ethnicity
                                    <label className="text-red-600">*</label>
                                  </label>
                                  <div className="radio-container">
                                    <div className="radio-item">
                                      <input
                                        type="radio"
                                        name="ethnicity"
                                        onChange={handleHouseholdRadioChange}
                                        value="IP Household"
                                        checked={
                                          householdForm.ethnicity ===
                                          "IP Household"
                                        }
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
                                          householdForm.ethnicity ===
                                          "Non-IP Household"
                                        }
                                      />
                                      <h1>
                                        Non-Indigenous Peoples (Non-IP)
                                        Household
                                      </h1>
                                    </div>
                                  </div>
                                </div>

                                {householdForm.ethnicity === "IP Household" && (
                                  <div className="form-group">
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
                                        checked={
                                          householdForm.sociostatus ===
                                          "NHTS 4Ps"
                                        }
                                      />
                                      <h1>
                                        National Household Targeting System
                                        (NHTS) 4Ps
                                      </h1>
                                    </div>
                                    <div className="radio-item">
                                      <input
                                        type="radio"
                                        name="sociostatus"
                                        onChange={handleHouseholdRadioChange}
                                        value="NHTS Non-4Ps"
                                        checked={
                                          householdForm.sociostatus ===
                                          "NHTS Non-4Ps"
                                        }
                                      />
                                      <h1>
                                        National Household Targeting System
                                        (NHTS) Non-4Ps
                                      </h1>
                                    </div>
                                    <div className="radio-item">
                                      <input
                                        type="radio"
                                        name="sociostatus"
                                        onChange={handleHouseholdRadioChange}
                                        value="Non-NHTS"
                                        checked={
                                          householdForm.sociostatus ===
                                          "Non-NHTS"
                                        }
                                      />
                                      <h1>
                                        Non-National Household Targeting System
                                        (Non-NHTS)
                                      </h1>
                                    </div>
                                  </div>
                                </div>

                                {(householdForm.sociostatus === "NHTS 4Ps" ||
                                  householdForm.sociostatus ===
                                    "NHTS Non-4Ps") && (
                                  <div className="form-group">
                                    <label className="form-label">
                                      National Household Targeting System (NHTS)
                                      No.
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
                                  <label
                                    for="employmentstatus"
                                    className="form-label"
                                  >
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
                                  <label
                                    for="employmentstatus"
                                    className="form-label"
                                  >
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
                                    <th className="household-tbl-th">
                                      Relationship
                                    </th>
                                    <th className="household-tbl-th">Name</th>
                                    <th className="household-tbl-th">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {/* Existing Members */}
                                  {(householdForm.members || []).map(
                                    (member, index) => (
                                      <tr key={member._id}>
                                        <td className="household-tbl-th">
                                          {editingMemberId === member._id ? (
                                            <select
                                              value={editedPosition}
                                              onChange={(e) =>
                                                setEditedPosition(
                                                  e.target.value
                                                )
                                              }
                                              className="form-input"
                                            >
                                              <option value="">
                                                Select Relationship
                                              </option>
                                              <option value="Spouse">
                                                Spouse
                                              </option>
                                              <option value="Son">Son</option>
                                              <option value="Daughter">
                                                Daughter
                                              </option>
                                              <option value="Parent">
                                                Parent
                                              </option>
                                              <option value="Sibling">
                                                Sibling
                                              </option>
                                              <option value="Grandparent">
                                                Grandparent
                                              </option>
                                              <option value="Grandchild">
                                                Grandchild
                                              </option>
                                              <option value="In-law">
                                                In-law
                                              </option>
                                              <option value="Relative">
                                                Relative
                                              </option>
                                              <option value="Housemate">
                                                Housemate
                                              </option>
                                              <option value="Househelp">
                                                Househelp
                                              </option>
                                              <option value="Other">
                                                Other
                                              </option>
                                            </select>
                                          ) : (
                                            member.position
                                          )}
                                        </td>
                                        <td className="household-tbl-th">
                                          {member.resID?.firstname}{" "}
                                          {member.resID?.middlename
                                            ? member.resID.middlename + " "
                                            : ""}
                                          {member.resID?.lastname}
                                        </td>
                                        <td className="household-tbl-th">
                                          {editingMemberId === member._id ? (
                                            <>
                                              <div className="flex flex-row justify-center w-full gap-x-4">
                                                <div
                                                  className="flex flex-col items-center"
                                                  onClick={() =>
                                                    handleSavePosition(member)
                                                  }
                                                >
                                                  <FaCheckCircle className="text-lg mb-1 text-[#06D001]" />
                                                  <button
                                                    type="button"
                                                    className="text-[#06D001]"
                                                  >
                                                    Save
                                                  </button>
                                                </div>

                                                <div
                                                  className="flex flex-col items-center"
                                                  onClick={handleCancelEdit}
                                                >
                                                  <FaCircleXmark className="text-lg mb-1 text-[#F63131]" />
                                                  <button
                                                    type="button"
                                                    className="text-[#F63131]"
                                                  >
                                                    Cancel
                                                  </button>
                                                </div>
                                              </div>
                                            </>
                                          ) : (
                                            <div className="flex flex-row justify-center w-full gap-x-4">
                                              <div
                                                className="flex flex-col items-center"
                                                onClick={() => {
                                                  setEditingMemberId(
                                                    member._id
                                                  );
                                                  setEditedPosition(
                                                    member.position
                                                  );
                                                }}
                                              >
                                                <FaEdit className="text-base mb-1 text-[#06D001]" />
                                                <button
                                                  type="button"
                                                  className="text-[#06D001]"
                                                >
                                                  Edit
                                                </button>
                                              </div>

                                              {member.position !== "Head" && (
                                                <div
                                                  className="flex flex-col items-center"
                                                  onClick={() =>
                                                    handleRemoveMember(member)
                                                  }
                                                >
                                                  <FaArchive className="text-base mb-1 text-[#F63131]" />
                                                  <button
                                                    type="button"
                                                    className="text-[#F63131]"
                                                  >
                                                    Remove
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                    )
                                  )}

                                  {/* New Members */}
                                  {newMembers.map((member, index) => (
                                    <tr key={member.tempId}>
                                      <td className="household-tbl-th">
                                        <select
                                          value={member.position}
                                          onChange={(e) => {
                                            const updated = [...newMembers];
                                            updated[index].position =
                                              e.target.value;
                                            setNewMembers(updated);
                                          }}
                                          className="form-input"
                                        >
                                          <option value="">
                                            Select Position
                                          </option>
                                          <option value="Spouse">Spouse</option>
                                          <option value="Child">Child</option>
                                          <option value="Parent">Parent</option>
                                          <option value="Sibling">
                                            Sibling
                                          </option>
                                          <option value="Grandparent">
                                            Grandparent
                                          </option>
                                          <option value="Grandchild">
                                            Grandchild
                                          </option>
                                          <option value="In-law">In-law</option>
                                          <option value="Relative">
                                            Relative
                                          </option>
                                          <option value="Housemate">
                                            Housemate
                                          </option>
                                          <option value="Househelp">
                                            Househelp
                                          </option>
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
                                              handleMemberInputChange(
                                                index,
                                                e.target.value
                                              )
                                            }
                                            className="form-input"
                                          />
                                          {memberSuggestions[index] &&
                                            memberSuggestions[index].length >
                                              0 && (
                                              <ul className="absolute z-10 bg-white border w-full max-h-40 overflow-y-auto">
                                                {memberSuggestions[index].map(
                                                  (res) => {
                                                    const fullName = `${
                                                      res.firstname
                                                    } ${
                                                      res.middlename
                                                        ? res.middlename + " "
                                                        : ""
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
                                                  }
                                                )}
                                              </ul>
                                            )}
                                          {member.resident.trim() !== "" &&
                                            !member.resID && (
                                              <p className="text-gray-500 text-xs mt-1">
                                                ⚠️ No matching resident found.{" "}
                                                <span
                                                  onClick={() =>
                                                    navigation(
                                                      "/household/create-resident",
                                                      {
                                                        state: {
                                                          account: true,
                                                        },
                                                      }
                                                    )
                                                  }
                                                  className="text-[#0E94D3] cursor-pointer hover:underline"
                                                >
                                                  Click here
                                                </span>{" "}
                                                if you want to create a resident
                                                profile.
                                              </p>
                                            )}
                                        </div>
                                      </td>
                                      <td className="household-tbl-th">
                                        <div className="flex flex-row justify-center w-full gap-x-4">
                                          <div
                                            className="flex flex-col items-center"
                                            onClick={() =>
                                              handleSaveNewMember(member)
                                            }
                                          >
                                            <FaCheckCircle className="text-lg mb-1 text-[#06D001]" />
                                            <button
                                              type="button"
                                              className="text-[#06D001]"
                                            >
                                              Save
                                            </button>
                                          </div>

                                          <div
                                            className="flex flex-col items-center"
                                            onClick={() =>
                                              handleCancelNewMember(
                                                member.tempId
                                              )
                                            }
                                          >
                                            <FaCircleXmark className="text-lg mb-1 text-[#F63131]" />
                                            <button
                                              type="button"
                                              className="text-[#F63131]"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>

                              <button
                                type="button"
                                className="household-tbl-add-btn"
                                onClick={handleAddMember}
                              >
                                <LuCirclePlus className="text-lg" />
                                <label>Add Member</label>
                              </button>
                            </div>

                            <div className="form-group mt-6">
                              <table className="household-tbl-container">
                                <thead>
                                  <tr>
                                    <th className="household-tbl-th">Model</th>
                                    <th className="household-tbl-th">Color</th>
                                    <th className="household-tbl-th">Kind</th>
                                    <th className="household-tbl-th">
                                      Plate Number
                                    </th>
                                    <th className="household-tbl-th">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {/* Existing Vehicles */}
                                  {householdForm.vehicles.map(
                                    (vehicle, index) => (
                                      <tr key={index}>
                                        {editingVehicleIndex === index ? (
                                          <>
                                            <td className="household-tbl-th">
                                              <input
                                                type="text"
                                                value={editedVehicle.model}
                                                onChange={(e) =>
                                                  setEditedVehicle({
                                                    ...editedVehicle,
                                                    model: e.target.value,
                                                  })
                                                }
                                                className="form-input w-full"
                                              />
                                            </td>
                                            <td className="household-tbl-th">
                                              <input
                                                type="text"
                                                value={editedVehicle.color}
                                                onChange={(e) =>
                                                  setEditedVehicle({
                                                    ...editedVehicle,
                                                    color: e.target.value,
                                                  })
                                                }
                                                className="form-input w-full"
                                              />
                                            </td>
                                            <td className="household-tbl-th">
                                              <select
                                                value={editedVehicle.kind}
                                                onChange={(e) =>
                                                  setEditedVehicle({
                                                    ...editedVehicle,
                                                    kind: e.target.value,
                                                  })
                                                }
                                                className="form-input w-full"
                                              >
                                                <option value="">
                                                  Select kind
                                                </option>
                                                <option value="Sedan">
                                                  Sedan
                                                </option>
                                                <option value="SUV">SUV</option>
                                                <option value="Motorcycle">
                                                  Motorcycle
                                                </option>
                                                <option value="Van">Van</option>
                                                <option value="Truck">
                                                  Truck
                                                </option>
                                                <option value="Tricycle">
                                                  Tricycle
                                                </option>
                                                <option value="Bicycle">
                                                  Bicycle
                                                </option>
                                                <option value="Other">
                                                  Other
                                                </option>
                                              </select>
                                            </td>
                                            <td className="household-tbl-th">
                                              <input
                                                type="text"
                                                value={
                                                  editedVehicle.platenumber
                                                }
                                                onChange={(e) =>
                                                  setEditedVehicle({
                                                    ...editedVehicle,
                                                    platenumber: e.target.value,
                                                  })
                                                }
                                                className="form-input w-full"
                                              />
                                            </td>
                                            <td className="household-tbl-th">
                                              <div className="flex flex-row justify-center w-full gap-x-4">
                                                <div
                                                  className="flex flex-col items-center"
                                                  onClick={
                                                    handleSaveEditedVehicle
                                                  }
                                                >
                                                  <FaCheckCircle className="text-lg mb-1 text-[#06D001]" />
                                                  <button
                                                    type="button"
                                                    className="text-[#06D001]"
                                                  >
                                                    Save
                                                  </button>
                                                </div>

                                                <div
                                                  className="flex flex-col items-center"
                                                  onClick={() =>
                                                    setEditingVehicleIndex(null)
                                                  }
                                                >
                                                  <FaCircleXmark className="text-lg mb-1 text-[#F63131]" />
                                                  <button
                                                    type="button"
                                                    className="text-[#F63131]"
                                                  >
                                                    Cancel
                                                  </button>
                                                </div>
                                              </div>
                                            </td>
                                          </>
                                        ) : (
                                          <>
                                            <td className="household-tbl-th">
                                              {vehicle.model}
                                            </td>
                                            <td className="household-tbl-th">
                                              {vehicle.color}
                                            </td>
                                            <td className="household-tbl-th">
                                              {vehicle.kind}
                                            </td>
                                            <td className="household-tbl-th">
                                              {vehicle.platenumber}
                                            </td>
                                            <td className="household-tbl-th">
                                              <div className="flex flex-row justify-center w-full gap-x-4">
                                                <div
                                                  className="flex flex-col items-center"
                                                  onClick={() => {
                                                    setEditingVehicleIndex(
                                                      index
                                                    );
                                                    setEditedVehicle({
                                                      ...vehicle,
                                                    });
                                                  }}
                                                >
                                                  <FaEdit className="text-base mb-1 text-[#06D001]" />
                                                  <button
                                                    type="button"
                                                    className="text-[#06D001]"
                                                  >
                                                    Edit
                                                  </button>
                                                </div>

                                                <div
                                                  className="flex flex-col items-center"
                                                  onClick={() =>
                                                    handleRemoveVehicle(
                                                      vehicle._id
                                                    )
                                                  }
                                                >
                                                  <FaArchive className="text-base mb-1 text-[#F63131]" />
                                                  <button
                                                    type="button"
                                                    className="text-[#F63131]"
                                                  >
                                                    Remove
                                                  </button>
                                                </div>
                                              </div>
                                            </td>
                                          </>
                                        )}
                                      </tr>
                                    )
                                  )}
                                  {/* New Vehicles */}
                                  {newVehicles.map((vehicle, index) => (
                                    <tr key={vehicle.tempId}>
                                      <td className="household-tbl-th">
                                        <input
                                          value={vehicle.model}
                                          onChange={(e) =>
                                            handleNewVehicleChange(
                                              index,
                                              "model",
                                              e.target.value
                                            )
                                          }
                                          className="form-input w-full"
                                        />
                                      </td>
                                      <td className="household-tbl-th">
                                        <input
                                          value={vehicle.color}
                                          onChange={(e) =>
                                            handleNewVehicleChange(
                                              index,
                                              "color",
                                              e.target.value
                                            )
                                          }
                                          className="form-input w-full"
                                        />
                                      </td>
                                      <td className="household-tbl-th">
                                        <select
                                          value={vehicle.kind}
                                          onChange={(e) =>
                                            handleNewVehicleChange(
                                              index,
                                              "kind",
                                              e.target.value
                                            )
                                          }
                                          className="form-input w-full"
                                        >
                                          <option value="">Select kind</option>
                                          <option value="Sedan">Sedan</option>
                                          <option value="SUV">SUV</option>
                                          <option value="Motorcycle">
                                            Motorcycle
                                          </option>
                                          <option value="Van">Van</option>
                                          <option value="Truck">Truck</option>
                                          <option value="Tricycle">
                                            Tricycle
                                          </option>
                                          <option value="Bicycle">
                                            Bicycle
                                          </option>
                                          <option value="Other">Other</option>
                                        </select>
                                      </td>
                                      <td className="household-tbl-th">
                                        <input
                                          value={vehicle.platenumber}
                                          onChange={(e) =>
                                            handleNewVehicleChange(
                                              index,
                                              "platenumber",
                                              e.target.value
                                            )
                                          }
                                          className="form-input w-full"
                                        />
                                      </td>
                                      <td className="household-tbl-th">
                                        <div className="flex flex-row justify-center w-full gap-x-4">
                                          <div
                                            className="flex flex-col items-center"
                                            onClick={() =>
                                              handleSaveNewVehicle(
                                                vehicle,
                                                index
                                              )
                                            }
                                          >
                                            <FaCheckCircle className="text-lg mb-1 text-[#06D001]" />
                                            <button
                                              type="button"
                                              className="text-[#06D001]"
                                            >
                                              Save
                                            </button>
                                          </div>

                                          <div
                                            className="flex flex-col items-center"
                                            onClick={() =>
                                              handleRemoveVehicle(index, "new")
                                            }
                                          >
                                            <FaCircleXmark className="text-lg mb-1 text-[#F63131]" />
                                            <button
                                              type="button"
                                              className="text-[#F63131]"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>

                              <button
                                type="button"
                                className="flex flex-row items-center justify-center space-x-1 ml-auto mt-4 text-[#0E94D3] border border-[#0E94D3] rounded-full px-1"
                                onClick={handleAddVehicle}
                              >
                                <LuCirclePlus className="text-lg" />
                                <label> Add Vehicle</label>
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Employment Information */}
                      <h3 className="section-title mt-8">
                        Employment Information
                      </h3>
                      <hr class="section-divider" />

                      <div className="form-grid">
                        <div className="form-group">
                          <label for="employmentstatus" className="form-label">
                            Employment Status
                          </label>
                          <select
                            id="employmentstatus"
                            name="employmentstatus"
                            onChange={handleDropdownChange}
                            value={residentForm.employmentstatus}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
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
                            onChange={handleDropdownChange}
                            value={residentForm.monthlyincome}
                            className="form-input"
                          >
                            <option value="" disabled selected hidden>
                              Select
                            </option>
                            {monthlyincomeList.map((element) => (
                              <option value={element}>{element}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Educational Information */}
                      <h3 className="section-title mt-8">
                        Educational Information
                      </h3>
                      <hr class="section-divider" />

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        <div className="form-group">
                          <label
                            for="educationalattainment"
                            className="form-label"
                          >
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
                          type="submit"
                          disabled={loading}
                          className="settings-btn actions-btn"
                        >
                          {loading ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </div>

            {/* Change Username */}
            {isUsernameClicked && (
              <div className="settings-form-card white-bg-container">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleUsernameChange();
                  }}
                >
                  <div className="header-text">Change Username</div>
                  <div className="p-4">
                    <div>
                      <label className="form-label">Current Username</label>
                      <div>
                        <label className="text-[#808080]">
                          {maskUsername(user.username)}
                        </label>
                      </div>
                    </div>

                    <div className="employee-form-group mt-4">
                      <label for="newusername" className="form-label">
                        New Username
                      </label>
                      <input
                        placeholder="Enter New Username"
                        type="text"
                        id="name"
                        name="name"
                        value={username}
                        minLength={3}
                        maxLength={16}
                        onChange={(e) => usernameValidation(e)}
                        className="form-input"
                        required
                      />
                      {usernameErrors.length > 0 && (
                        <div>
                          {usernameErrors.map((error, index) => (
                            <p key={index} className="error-msg">
                              {error}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="employee-form-group mt-4">
                      <label for="password" className="form-label">
                        Password
                      </label>

                      <div className="relative w-full">
                        <input
                          placeholder="Enter Password"
                          type={showUserPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={password}
                          onChange={(e) => curpasswordValidation(e)}
                          className="form-input"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowUserPassword((prev) => !prev)}
                          className="eye-toggle"
                          tabIndex={-1}
                        >
                          {showUserPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                      </div>
                      {curPasswordError ? (
                        <label className="error-msg">{curPasswordError}</label>
                      ) : null}
                    </div>

                    <div className="function-btn-container">
                      <button
                        className="settings-btn actions-btn"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Change Password */}
            {isPasswordClicked && (
              <div className="settings-form-card white-bg-container">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePasswordChange();
                  }}
                >
                  <div className="header-text">Change Password</div>
                  <div className="p-4">
                    <div className="employee-form-group">
                      <label for="password" className="form-label">
                        Current Password
                      </label>
                      <div className="relative w-full">
                        <input
                          placeholder="Enter Current Password"
                          type={showCurrPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          value={password}
                          minLength={8}
                          maxLength={64}
                          onChange={(e) => curpasswordValidation(e)}
                          className="form-input"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrPassword((prev) => !prev)}
                          className="eye-toggle"
                          tabIndex={-1}
                        >
                          {showCurrPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                      </div>
                      {curPasswordError ? (
                        <label className="error-msg">{curPasswordError}</label>
                      ) : null}
                    </div>
                    <div className="employee-form-group mt-4">
                      <label for="newpassword" className="form-label">
                        New Password
                      </label>
                      <div className="relative w-full">
                        <input
                          placeholder="Enter New Password"
                          type={showNewPassword ? "text" : "password"}
                          id="newpassword"
                          name="newpassword"
                          value={newpassword}
                          minLength={8}
                          maxLength={64}
                          onChange={(e) => passwordValidation(e)}
                          className="form-input"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          className="eye-toggle"
                          tabIndex={-1}
                        >
                          {showNewPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                      </div>
                      {passwordErrors.length > 0 && (
                        <div>
                          {passwordErrors.map((error, index) => (
                            <p key={index} className="error-msg">
                              {error}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="employee-form-group mt-4">
                      <label for="renewpassword" className="form-label">
                        Reenter Password
                      </label>
                      <div className="relative w-full">
                        <input
                          placeholder="Enter Reenter Password"
                          type={showConfirmPassword ? "text" : "password"}
                          id="renewpassword"
                          name="renewpassword"
                          minLength={8}
                          maxLength={64}
                          value={renewpassword}
                          onChange={(e) => repasswordValidation(e)}
                          className="form-input"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          className="eye-toggle"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                      </div>
                      {repasswordErrors.length > 0 && (
                        <div>
                          {repasswordErrors.map((error, index) => (
                            <p key={index} className="error-msg">
                              {error}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="function-btn-container">
                      <button
                        className="settings-btn actions-btn"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Edit Security Questions */}
            {isQuestionsClicked && (
              <div className="settings-form-card white-bg-container">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleQuestionsChange();
                  }}
                >
                  <div className="header-text">Change Security Questions</div>
                  <div className="p-4">
                    <div>
                      <label className="form-label">Security Question #1</label>
                      <select
                        onChange={(e) =>
                          handleSecurityChange(0, "question", e.target.value)
                        }
                        className="form-input mb-2"
                        value={securityquestions[0].question}
                      >
                        <option value="" disabled selected hidden>
                          Select
                        </option>
                        {securityQuestionsList
                          .filter(
                            (element) =>
                              element !== securityquestions[1].question
                          )
                          .map((element) => (
                            <option value={element}>{element}</option>
                          ))}
                      </select>

                      <div className="relative w-full">
                        <input
                          placeholder="Enter answer"
                          value={securityquestions[0].answer}
                          type={showAnswer1 ? "text" : "password"}
                          onChange={(e) =>
                            handleSecurityChange(
                              0,
                              "answer",
                              e.target.value.toLowerCase()
                            )
                          }
                          className="form-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAnswer1((prev) => !prev)}
                          className="eye-toggle"
                          tabIndex={-1}
                        >
                          {showAnswer1 ? <FaEye /> : <FaEyeSlash />}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="form-label">Security Question #2</label>
                      <select
                        onChange={(e) =>
                          handleSecurityChange(1, "question", e.target.value)
                        }
                        className="form-input mb-2"
                        value={securityquestions[1].question}
                      >
                        <option value="" disabled selected hidden>
                          Select
                        </option>
                        {securityQuestionsList
                          .filter(
                            (element) =>
                              element !== securityquestions[0].question
                          )
                          .map((element) => (
                            <option value={element}>{element}</option>
                          ))}
                      </select>

                      <div className="relative w-full">
                        <input
                          placeholder="Enter answer"
                          value={securityquestions[1].answer}
                          type={showAnswer2 ? "text" : "password"}
                          onChange={(e) =>
                            handleSecurityChange(
                              1,
                              "answer",
                              e.target.value.toLowerCase()
                            )
                          }
                          className="form-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAnswer2((prev) => !prev)}
                          className="eye-toggle"
                          tabIndex={-1}
                        >
                          {showAnswer2 ? <FaEye /> : <FaEyeSlash />}
                        </button>
                      </div>
                    </div>

                    <div className="employee-form-group mt-4">
                      <label for="password" className="form-label">
                        Password
                      </label>
                      <div className="relative w-full">
                        <input
                          placeholder="Enter Password"
                          id="password"
                          name="password"
                          value={password}
                          type={showSecurityPass ? "text" : "password"}
                          onChange={(e) => curpasswordValidation(e)}
                          className="form-input"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecurityPass((prev) => !prev)}
                          className="eye-toggle"
                          tabIndex={-1}
                        >
                          {showSecurityPass ? <FaEye /> : <FaEyeSlash />}
                        </button>
                      </div>
                      {curPasswordError ? (
                        <label className="error-msg">{curPasswordError}</label>
                      ) : null}
                    </div>
                    <div className="function-btn-container">
                      <button
                        className="settings-btn actions-btn"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {isCameraOpen && (
          <OpenCamera onDone={handleDone} onClose={handleClose} />
        )}

        <div className="mb-20"></div>
      </main>
    </>
  );
}

export default AccountSettings;
