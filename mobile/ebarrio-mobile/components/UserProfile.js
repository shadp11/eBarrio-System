import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Modal,
  BackHandler,
  Dimensions,
  Button,
} from "react-native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import CheckBox from "./CheckBox";
import { storage } from "../firebase";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import Signature from "react-native-signature-canvas";
import * as ScreenOrientation from "expo-screen-orientation";
import AlertModal from "./AlertModal";
import api from "../api";
import { RFPercentage } from "react-native-responsive-fontsize";
import sign from "../assets/resident-sign.png";

//ICONSS
import Entypo from "@expo/vector-icons/Entypo";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const UserProfile = () => {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const landscapeWidth = Math.max(screenWidth, screenHeight);
  const landscapeHeight = Math.min(screenWidth, screenHeight);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [residentInfo, setResidentInfo] = useState([]);
  const { user } = useContext(AuthContext);

  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [isIDProcessing, setIsIDProcessing] = useState(false);
  const [isSignProcessing, setIsSignProcessing] = useState(false);
  const [residents, setResidents] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [showBirthdatePicker, setShowBirthdatePicker] = useState(false);
  const [showLastMenstrualPicker, setShowLastMenstrualPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const [residentProfile, setResidentProfile] = useState({
    picture: "",
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

  const [residentForm, setResidentForm] = useState({
    picture: "",
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

  const [householdProfile, setHouseholdProfile] = useState({
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

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await api.get("/getprofile");
        setResidentInfo(response.data);
      } catch (error) {
        console.log("Error fetching profile", error);
      }
    };
    getProfile();
  }, []);

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
      setResidentProfile((prevForm) => ({
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
    }
  }, [residentInfo]);

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
            setResidentProfile((prev) => ({
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
            setHouseholdProfile((prev) => ({
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
            setResidentProfile((prev) => ({
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
    "Widower",
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

  const kindOptions = [
    { label: "Sedan", value: "Sedan" },
    { label: "SUV", value: "SUV" },
    { label: "Motorcycle", value: "Motorcycle" },
    { label: "Van", value: "Van" },
    { label: "Truck", value: "Truck" },
    { label: "Tricycle", value: "Tricycle" },
    { label: "Bicycle", value: "Bicycle" },
    { label: "Other", value: "Other" },
  ];

  const positionList = [
    { label: "Select", value: "" },
    { label: "Spouse", value: "Spouse" },
    { label: "Son", value: "Son" },
    { label: "Daughter", value: "Daughter" },
    { label: "Parent", value: "Parent" },
    { label: "Sibling", value: "Sibling" },
    { label: "Grandparent", value: "Grandparent" },
    { label: "Grandchild", value: "Grandchild" },
    { label: "In-law", value: "In-law" },
    { label: "Relative", value: "Relative" },
    { label: "Housemate", value: "Housemate" },
    { label: "Househelp", value: "Househelp" },
    { label: "Other", value: "Other" },
  ];

  useEffect(() => {
    const fetchResidents = async () => {
      try {
        const response = await axios.get(
          "https://ebarrio-mobile-backend.onrender.com/api/getresidents"
        );
        setResidents(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch residents:", error);
      }
    };
    fetchResidents();
  }, []);

  useEffect(() => {
    const fetchHouseholds = async () => {
      try {
        const response = await axios.get(
          "https://ebarrio-mobile-backend.onrender.com/api/gethouseholds"
        );
        setHouseholds(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch residents:", error);
      }
    };
    fetchHouseholds();
  }, []);

  const pickIDImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setAlertMessage(
          "We need access to your photos to let you upload an image."
        );
        setIsAlertModalVisible(true);
        return;
      }

      setIsIDProcessing(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setResidentForm((prev) => ({
          ...prev,
          picture: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setAlertMessage("Something went wrong while picking the image.");
      setIsAlertModalVisible(true);
    } finally {
      setIsIDProcessing(false);
    }
  };

  const toggleIDCamera = async () => {
    const permissionResult = await ImagePicker.getCameraPermissionsAsync();

    if (!permissionResult.granted) {
      const askPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (!askPermission.granted) {
        setAlertMessage("Camera permission is required.");
        setIsAlertModalVisible(true);
        return;
      }
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 1,
      });

      if (!result.canceled) {
        setResidentForm((prev) => ({
          ...prev,
          picture: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.error("Camera error:", error);
      setAlertMessage("Failed to open camera.");
      setIsAlertModalVisible(true);
    }
  };

  const handleInputChange = (name, value) => {
    setResidentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDropdownChange = (name, value) => {
    setResidentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRadioChange = (name, value) => {
    setResidentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name) => {
    setResidentForm((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleHouseholdRadioChange = (name, value) => {
    setHouseholdForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHouseholdInputChange = (name, value) => {
    setHouseholdForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHouseholdDropdownChange = (name, value) => {
    setHouseholdForm((prev) => ({
      ...prev,
      [name]: value,
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

  const [memberSuggestions, setMemberSuggestions] = useState([[]]);

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...householdForm.members];

    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value,
      resID: field === "residentName" ? null : updatedMembers[index].resID,
    };

    setHouseholdForm((prev) => ({ ...prev, members: updatedMembers }));

    if (field === "residentName") {
      if (!value.trim()) {
        // Clear suggestions
        setMemberSuggestions((prev) => {
          const newSuggestions = [...prev];
          newSuggestions[index] = [];
          return newSuggestions;
        });
        return;
      }

      // Filter residents for suggestions
      const matches = residents
        .filter(
          (r) =>
            r.householdno?._id.toString() !==
            residentForm.householdno.toString()
        )
        .filter(
          (r) =>
            r.status !== "Pending" &&
            r.status !== "Archived" &&
            r.status !== "Rejected"
        )
        .filter((r) => {
          const fullName = `${r.firstname} ${
            r.middlename ? r.middlename + " " : ""
          }${r.lastname}`.toLowerCase();
          return fullName.includes(value.toLowerCase());
        });

      setMemberSuggestions((prev) => {
        const newSuggestions = [...prev];
        newSuggestions[index] = matches;
        return newSuggestions;
      });
    }
  };

  const handleMemberSuggestionClick = (index, res) => {
    const fullName = `${res.firstname} ${
      res.middlename ? res.middlename + " " : ""
    }${res.lastname}`;

    const updatedMembers = [...householdForm.members];
    updatedMembers[index] = {
      ...updatedMembers[index],
      residentName: fullName,
      resID: res._id,
    };

    setHouseholdForm((prev) => ({ ...prev, members: updatedMembers }));

    // Clear suggestions
    setMemberSuggestions((prev) => {
      const newSuggestions = [...prev];
      newSuggestions[index] = [];
      return newSuggestions;
    });
  };

  const addMember = () => {
    setHouseholdForm((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        { residentName: "", position: "", resID: null },
      ],
    }));
    setMemberSuggestions((prev) => [...prev, []]);
  };

  const removeMember = (index) => {
    setHouseholdForm((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
    setMemberSuggestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenSignature = async () => {
    setShowSignModal(true);
  };

  const handleCloseSignature = async () => {
    setShowSignModal(false);
  };

  useEffect(() => {
    const backAction = () => {
      if (showSignModal) {
        handleCloseSignature();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [showSignModal]);

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
      setResidentProfile((prev) => ({
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

  function formatToDateOnly(isoString) {
    const date = new Date(isoString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

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

  const [showSignModal, setShowSignModal] = useState(false);
  const handleSignatureOK = async (signature) => {
    setIsSignProcessing(true);
    setResidentForm({ ...residentForm, signature });
    setShowSignModal(false);

    setTimeout(async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
      setIsSignProcessing(false);
    }, 300);
  };

  const handleSignatureClear = () => {
    setResidentForm((prev) => ({ ...prev, signature: "" }));
  };

  const handleConfirm = () => {
    const hasResidentChanges =
      JSON.stringify(residentProfile) !== JSON.stringify(residentForm);
    const hasChanges =
      JSON.stringify(householdProfile) !== JSON.stringify(householdForm);

    if (!hasChanges && !hasResidentChanges) {
      alert("No changes detected.");
      return;
    }

    if (residentInfo.changeID) {
      alert(
        "You already submitted a change request. Please wait for approval."
      );
      return;
    }
    setIsConfirmModalVisible(true);
  };

  const handleSubmit = async () => {
    setIsConfirmModalVisible(false);

    if (loading) return;

    setLoading(true);
    try {
      let idPicture = residentProfile.picture;
      let signaturePicture = residentProfile.signature;
      if (
        residentForm.picture &&
        residentForm.picture !== residentProfile.picture
      ) {
        idPicture = await uploadToFirebase(residentForm.picture);
      }
      if (
        residentForm.signature &&
        residentForm.signature !== residentProfile.signature
      ) {
        signaturePicture = await uploadToFirebase(residentForm.signature);
      }
      const fulladdress = `${householdForm.housenumber} ${householdForm.street} Aniban 2, Bacoor, Cavite`;

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

      const formattedBirthdate = residentForm.birthdate
        ? formatToDateOnly(residentForm.birthdate)
        : null;

      const formattedLastMenstrual = residentForm.lastmenstrual
        ? formatToDateOnly(residentForm.lastmenstrual)
        : null;

      const { id, signature, ...rest } = residentForm;

      const updatedResidentForm = {
        ...rest,
        mobilenumber: formattedMobileNumber,
        emergencymobilenumber: formattedEmergencyMobileNumber,
        telephone: formattedTelephone,
        birthdate: formattedBirthdate,
        lastmenstrual: formattedLastMenstrual,
        picture: idPicture,
        signature: signaturePicture,
      };

      const updatedHouseholdForm = {
        ...householdForm,
        address: fulladdress,
      };

      await api.put("/updateprofile", {
        ...updatedResidentForm,
        householdForm: updatedHouseholdForm,
      });
      alert("Your profile change request has been submitted successfully.");
    } catch (error) {
      console.log("Error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: "#F0F4F7",
      }}
    >
      <View style={MyStyles.notScrollWrapper}>
        <View
          style={[
            MyStyles.burgerWrapper,
            { paddingHorizontal: 20, paddingVertical: 10 },
          ]}
        >
          <Entypo
            name="menu"
            color="#0E94D3"
            onPress={() => navigation.openDrawer()}
            style={MyStyles.burgerChatIcon}
          />
          <View>
            <Text style={MyStyles.header}>Profile</Text>
          </View>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              MyStyles.scrollContainer,
              {
                paddingBottom: insets.bottom + 100,
                gap: 10,
                padding: 25,
              },
            ]}
          >
            <View style={[MyStyles.loginFormWrapper, { marginVertical: 0 }]}>
              {/* Personal Information */}

              {/* ID */}
              <Text style={MyStyles.FormSectionTitle}>
                Personal Information
              </Text>
              <View style={MyStyles.uploadBox}>
                <View style={MyStyles.previewContainer}>
                  {isIDProcessing ? (
                    <ActivityIndicator size="small" color="#0000ff" />
                  ) : residentForm.picture ? (
                    <Image
                      source={{ uri: residentForm.picture }}
                      style={MyStyles.image}
                    />
                  ) : (
                    <View style={MyStyles.placeholder}>
                      <Text style={MyStyles.placeholderText}>
                        Attach ID Picture
                      </Text>
                    </View>
                  )}
                </View>

                <View style={MyStyles.personalInfobuttons}>
                  <TouchableOpacity
                    onPress={toggleIDCamera}
                    style={MyStyles.personalInfoButton}
                  >
                    <Entypo name="camera" size={20} color="white" />
                    <Text
                      style={{
                        fontFamily: "REMSemiBold",
                        color: "white",
                        fontSize: RFPercentage(1.8),
                      }}
                    >
                      Capture
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={pickIDImage}
                    style={MyStyles.personalInfoButton}
                  >
                    <Feather name="upload" size={20} color="white" />
                    <Text
                      style={{
                        fontFamily: "REMSemiBold",
                        color: "white",
                        fontSize: RFPercentage(1.8),
                      }}
                    >
                      Upload
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Signature */}
              <View style={MyStyles.uploadBox}>
                <View style={MyStyles.previewContainer}>
                  {isSignProcessing ? (
                    <ActivityIndicator size="small" color="#0000ff" />
                  ) : residentForm.signature ? (
                    <Image
                      source={{ uri: residentForm.signature }}
                      style={MyStyles.image}
                    />
                  ) : (
                    <View style={MyStyles.placeholder}>
                      <Text style={MyStyles.placeholderText}>
                        Attach Signature
                      </Text>
                    </View>
                  )}
                </View>

                <View style={MyStyles.personalInfobuttons}>
                  <TouchableOpacity
                    onPress={handleOpenSignature}
                    style={MyStyles.personalInfoButton}
                  >
                    <Image source={sign} style={{ width: 20, height: 20 }} />
                    <Text
                      style={{
                        fontFamily: "REMSemiBold",
                        color: "white",
                        fontSize: RFPercentage(1.8),
                      }}
                    >
                      Sign
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSignatureClear}
                    style={MyStyles.personalInfoButton}
                  >
                    <FontAwesome5 name="trash" size={20} color="white" />
                    <Text
                      style={{
                        fontFamily: "REMSemiBold",
                        color: "white",
                        fontSize: RFPercentage(1.8),
                      }}
                    >
                      Clear
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Signature Modal */}
                <Modal
                  visible={showSignModal}
                  animationType="slide"
                  presentationStyle="fullScreen"
                  onRequestClose={() => setShowSignModal(false)}
                >
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#fff",
                    }}
                  >
                    {/* Rotated container */}
                    <View
                      style={{
                        width: landscapeWidth,
                        height: landscapeHeight,
                        transform: [{ rotate: "90deg" }],
                        backgroundColor: "#fff",
                      }}
                    >
                      <Signature
                        onOK={handleSignatureOK}
                        onClear={() => console.log("Cleared")}
                        descriptionText="Sign Above"
                        clearText="Clear"
                        confirmText="Save"
                        webStyle={`
                .m-signature-pad {
                  margin: 0;
                  height: 100%;
                }
                .m-signature-pad--footer {
                  display: flex;
                  justify-content: space-between !important;
                }
              `}
                      />
                    </View>

                    <View
                      style={{
                        position: "absolute",
                        bottom: 10,
                        left: 10,
                        flexDirection: "row",
                        gap: 8,
                      }}
                    >
                      <Button
                        title="Cancel"
                        onPress={() => setShowSignModal(false)}
                      />
                    </View>
                  </View>
                </Modal>
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>
                  First Name<Text style={{ color: "red" }}>*</Text>
                </Text>
                <TextInput
                  style={MyStyles.input}
                  placeholder="First Name"
                  value={residentForm.firstname}
                  onChangeText={(text) => handleInputChange("firstname", text)}
                />
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>Middle Name</Text>
                <TextInput
                  style={MyStyles.input}
                  placeholder="Middle Name"
                  value={residentForm.middlename}
                  onChangeText={(text) => handleInputChange("middlename", text)}
                />
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>
                  Last Name<Text style={{ color: "red" }}>*</Text>
                </Text>
                <TextInput
                  style={MyStyles.input}
                  placeholder="Last Name"
                  value={residentForm.lastname}
                  onChangeText={(text) => handleInputChange("lastname", text)}
                />
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>Suffix</Text>
                <Dropdown
                  labelField="label"
                  valueField="value"
                  value={residentForm.suffix}
                  data={suffixList.map((purp) => ({
                    label: purp,
                    value: purp,
                  }))}
                  placeholder="Select"
                  placeholderStyle={MyStyles.placeholderText}
                  selectedTextStyle={MyStyles.selectedText}
                  onChange={(item) =>
                    handleDropdownChange("suffix", item.value)
                  }
                  style={MyStyles.input}
                ></Dropdown>
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>Alias</Text>
                <TextInput
                  style={MyStyles.input}
                  placeholder="Alias"
                  value={residentForm.alias}
                  onChangeText={(text) => handleInputChange("alias", text)}
                />
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>Salutation</Text>
                <Dropdown
                  labelField="label"
                  valueField="value"
                  value={residentForm.salutation}
                  data={salutationList.map((purp) => ({
                    label: purp,
                    value: purp,
                  }))}
                  placeholder="Select"
                  placeholderStyle={MyStyles.placeholderText}
                  selectedTextStyle={MyStyles.selectedText}
                  onChange={(item) =>
                    handleDropdownChange("salutation", item.value)
                  }
                  style={MyStyles.input}
                ></Dropdown>
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>
                  Sex<Text style={{ color: "red" }}>*</Text>
                </Text>
                <Dropdown
                  labelField="label"
                  valueField="value"
                  value={residentForm.sex}
                  data={sexList.map((purp) => ({
                    label: purp,
                    value: purp,
                  }))}
                  placeholder="Select"
                  placeholderStyle={MyStyles.placeholderText}
                  selectedTextStyle={MyStyles.selectedText}
                  onChange={(item) => handleDropdownChange("sex", item.value)}
                  style={MyStyles.input}
                ></Dropdown>
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>Gender</Text>
                <Dropdown
                  labelField="label"
                  valueField="value"
                  value={residentForm.gender}
                  data={genderList.map((purp) => ({
                    label: purp,
                    value: purp,
                  }))}
                  placeholder="Select"
                  placeholderStyle={MyStyles.placeholderText}
                  selectedTextStyle={MyStyles.selectedText}
                  onChange={(item) =>
                    handleDropdownChange("gender", item.value)
                  }
                  style={MyStyles.input}
                ></Dropdown>
              </View>

              {/* <View>
                  <Text style={MyStyles.inputLabel}>
                    Birthdate<Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <DateTimePicker
                    value={residentForm.birthdate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        handleInputChange("birthdate", selectedDate);
                      }
                    }}
                  />
                </View> */}

              <View>
                <Text style={MyStyles.inputLabel}>
                  Birthdate<Text style={{ color: "red" }}>*</Text>
                </Text>

                <View style={[MyStyles.input, MyStyles.datetimeRow]}>
                  <Text
                    style={{
                      color: residentForm.birthdate ? "black" : "#808080",
                      fontFamily: "QuicksandMedium",
                      fontSize: RFPercentage(2),
                    }}
                  >
                    {residentForm.birthdate
                      ? new Date(residentForm.birthdate).toLocaleDateString()
                      : "Select date"}
                  </Text>

                  <MaterialIcons
                    name="calendar-today"
                    size={24}
                    color="#C1C0C0"
                    onPress={() => setShowBirthdatePicker((prev) => !prev)}
                  />
                </View>

                {showBirthdatePicker && (
                  <DateTimePicker
                    value={residentForm.birthdate || new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selectedDate) => {
                      if (Platform.OS === "android") {
                        setShowBirthdatePicker(false);
                      }
                      if (selectedDate) {
                        handleInputChange("birthdate", selectedDate);
                      }
                    }}
                  />
                )}
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>Age</Text>
                <TextInput
                  placeholder="Age"
                  value={residentForm.age?.toString() || ""}
                  style={MyStyles.input}
                  editable={false}
                />
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>Birthplace</Text>
                <TextInput
                  placeholder="Birthplace"
                  style={MyStyles.input}
                  value={residentForm.birthplace}
                  onChangeText={(text) => handleInputChange("birthplace", text)}
                />
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>
                  Civil Status<Text style={{ color: "red" }}>*</Text>
                </Text>
                <Dropdown
                  labelField="label"
                  valueField="value"
                  value={residentForm.civilstatus}
                  data={civilstatusList.map((purp) => ({
                    label: purp,
                    value: purp,
                  }))}
                  placeholder="Select"
                  placeholderStyle={MyStyles.placeholderText}
                  selectedTextStyle={MyStyles.selectedText}
                  onChange={(item) =>
                    handleDropdownChange("civilstatus", item.value)
                  }
                  style={MyStyles.input}
                ></Dropdown>
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>PhilHealth ID</Text>
                <TextInput
                  placeholder="Philhealth ID"
                  style={MyStyles.input}
                  keyboardType="numeric"
                  value={residentForm.philhealthid}
                  onChangeText={(text) =>
                    handleInputChange("philhealthid", text)
                  }
                />
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>PhilHealth Category</Text>
                <Dropdown
                  labelField="label"
                  valueField="value"
                  value={residentForm.philhealthcategory}
                  data={philhealthcategoryList.map((purp) => ({
                    label: purp,
                    value: purp,
                  }))}
                  placeholder="Select"
                  placeholderStyle={MyStyles.placeholderText}
                  selectedTextStyle={MyStyles.selectedText}
                  onChange={(item) =>
                    handleDropdownChange("philhealthcategory", item.value)
                  }
                  style={MyStyles.input}
                ></Dropdown>
              </View>

              {residentForm.sex === "Female" && (
                <>
                  <View>
                    <Text style={MyStyles.inputLabel}>
                      Last Menstrual Period
                    </Text>

                    <View style={[MyStyles.input, MyStyles.datetimeRow]}>
                      <Text
                        style={{
                          color: residentForm.lastmenstrual
                            ? "black"
                            : "#808080",
                          fontFamily: "QuicksandMedium",
                          fontSize: RFPercentage(2),
                        }}
                      >
                        {residentForm.lastmenstrual
                          ? new Date(
                              residentForm.lastmenstrual
                            ).toLocaleDateString()
                          : "Select date"}
                      </Text>

                      <MaterialIcons
                        name="calendar-today"
                        size={24}
                        color="#C1C0C0"
                        onPress={() =>
                          setShowLastMenstrualPicker((prev) => !prev)
                        }
                      />
                    </View>

                    {showLastMenstrualPicker && (
                      <DateTimePicker
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        value={residentForm.lastmenstrual || new Date()}
                        onChange={(event, selectedDate) => {
                          if (Platform.OS === "android") {
                            setShowLastMenstrualPicker(false);
                          }
                          if (selectedDate) {
                            handleInputChange("lastmenstrual", selectedDate);
                          }
                        }}
                      />
                    )}
                  </View>

                  <View>
                    <Text style={MyStyles.inputLabel}>
                      Using any FP method?
                    </Text>
                    <View style={MyStyles.radioGroup}>
                      {["Yes", "No"].map((option) => (
                        <Pressable
                          key={option}
                          style={MyStyles.radioOption}
                          onPress={() => handleRadioChange("fpmethod", option)}
                        >
                          <View style={MyStyles.radioCircle}>
                            {residentForm.fpmethod === option && (
                              <View style={MyStyles.radioDot} />
                            )}
                          </View>
                          <Text
                            style={{
                              fontFamily: "QuicksandMedium",
                              fontSize: RFPercentage(2),
                            }}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  <View>
                    <Text style={MyStyles.inputLabel}>
                      Family Planning Method
                    </Text>
                    <Dropdown
                      labelField="label"
                      valueField="value"
                      value={residentForm.fpmethod}
                      data={fpmethodList.map((purp) => ({
                        label: purp,
                        value: purp,
                      }))}
                      placeholder="Select"
                      placeholderStyle={MyStyles.placeholderText}
                      selectedTextStyle={MyStyles.selectedText}
                      onChange={(item) =>
                        handleDropdownChange("fpmethod", item.value)
                      }
                      style={MyStyles.input}
                    ></Dropdown>
                  </View>

                  <View>
                    <Text style={MyStyles.inputLabel}>
                      Family Planning Status
                    </Text>
                    <Dropdown
                      labelField="label"
                      valueField="value"
                      value={residentForm.fpstatus}
                      data={fpstatusList.map((purp) => ({
                        label: purp,
                        value: purp,
                      }))}
                      placeholder="Select"
                      placeholderStyle={MyStyles.placeholderText}
                      selectedTextStyle={MyStyles.selectedText}
                      onChange={(item) =>
                        handleDropdownChange("fpstatus", item.value)
                      }
                      style={MyStyles.input}
                    ></Dropdown>
                  </View>
                </>
              )}
              <View>
                <Text style={MyStyles.inputLabel}>Blood Type</Text>
                <Dropdown
                  labelField="label"
                  valueField="value"
                  value={residentForm.bloodtype}
                  data={bloodtypeList.map((purp) => ({
                    label: purp,
                    value: purp,
                  }))}
                  placeholder="Select"
                  placeholderStyle={MyStyles.placeholderText}
                  selectedTextStyle={MyStyles.selectedText}
                  onChange={(item) =>
                    handleDropdownChange("bloodtype", item.value)
                  }
                  style={MyStyles.input}
                ></Dropdown>
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>Religion</Text>
                <Dropdown
                  labelField="label"
                  valueField="value"
                  value={residentForm.religion}
                  data={religionList.map((purp) => ({
                    label: purp,
                    value: purp,
                  }))}
                  placeholder="Select"
                  placeholderStyle={MyStyles.placeholderText}
                  selectedTextStyle={MyStyles.selectedText}
                  onChange={(item) =>
                    handleDropdownChange("religion", item.value)
                  }
                  style={MyStyles.input}
                ></Dropdown>
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>
                  Nationality<Text style={{ color: "red" }}>*</Text>
                </Text>
                <Dropdown
                  labelField="label"
                  valueField="value"
                  value={residentForm.nationality}
                  data={nationalityList.map((purp) => ({
                    label: purp,
                    value: purp,
                  }))}
                  placeholder="Select"
                  placeholderStyle={MyStyles.placeholderText}
                  selectedTextStyle={MyStyles.selectedText}
                  onChange={(item) =>
                    handleDropdownChange("nationality", item.value)
                  }
                  style={MyStyles.input}
                ></Dropdown>
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>Registered Voter?</Text>
                <View style={MyStyles.radioGroup}>
                  {["Yes", "No"].map((option) => (
                    <Pressable
                      key={option}
                      style={MyStyles.radioOption}
                      onPress={() => handleRadioChange("voter", option)}
                    >
                      <View style={MyStyles.radioCircle}>
                        {residentForm.voter === option && (
                          <View style={MyStyles.radioDot} />
                        )}
                      </View>
                      <Text
                        style={{
                          fontFamily: "QuicksandMedium",
                          fontSize: RFPercentage(2),
                        }}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>Precinct</Text>
                <TextInput
                  style={MyStyles.input}
                  placeholder="Precinct"
                  value={residentForm.precinct}
                  onChangeText={(text) => handleInputChange("precinct", text)}
                />
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>Classification</Text>
                <CheckBox
                  label="Newborn"
                  value={residentForm.isNewborn}
                  onValueChange={() => handleCheckboxChange("isNewborn")}
                  disabled
                />

                <CheckBox
                  label="Infant"
                  value={residentForm.isInfant}
                  onValueChange={() => handleCheckboxChange("isInfant")}
                  disabled
                />

                <CheckBox
                  label="Under 5 y.o"
                  value={residentForm.isUnder5}
                  onValueChange={() => handleCheckboxChange("isUnder5")}
                  disabled
                />

                <CheckBox
                  label="Adolescent"
                  value={residentForm.isAdolescent}
                  onValueChange={() => handleCheckboxChange("isAdolescent")}
                  disabled
                />

                <CheckBox
                  label="Adult"
                  value={residentForm.isAdult}
                  onValueChange={() => handleCheckboxChange("isAdult")}
                  disabled
                />

                <CheckBox
                  label="Senior Citizen"
                  value={residentForm.isSenior}
                  onValueChange={() => handleCheckboxChange("isSenior")}
                  disabled
                />

                {residentForm.sex === "Female" && (
                  <CheckBox
                    label="Women of Reproductive Age"
                    value={residentForm.isWomenOfReproductive}
                    onValueChange={() =>
                      handleCheckboxChange("isWomenOfReproductive")
                    }
                  />
                )}

                {Boolean(
                  residentForm.age &&
                    residentForm.age >= 0 &&
                    residentForm.age <= 5
                ) && (
                  <CheckBox
                    label="School of Age"
                    value={residentForm.isSchoolAge}
                    onValueChange={() => handleCheckboxChange("isSchoolAge")}
                  />
                )}

                {Boolean(
                  residentForm.age &&
                    residentForm.sex === "Female" &&
                    residentForm.age > 19
                ) && (
                  <CheckBox
                    label="Pregnant"
                    value={residentForm.isPregnant}
                    onValueChange={() => handleCheckboxChange("isPregnant")}
                  />
                )}

                {Boolean(
                  residentForm.age &&
                    residentForm.sex === "Female" &&
                    residentForm.age >= 10 &&
                    residentForm.age <= 19
                ) && (
                  <CheckBox
                    label="Adolescent Pregnant"
                    value={residentForm.isAdolescentPregnant}
                    onValueChange={() =>
                      handleCheckboxChange("isAdolescentPregnant")
                    }
                  />
                )}

                {residentForm.sex === "Female" && (
                  <CheckBox
                    label="Postpartum"
                    value={residentForm.isPostpartum}
                    onValueChange={() => handleCheckboxChange("isPostpartum")}
                  />
                )}

                <CheckBox
                  label="Person with Disability (PWD)"
                  value={residentForm.isPWD}
                  onValueChange={() => handleCheckboxChange("isPWD")}
                />
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>Medical History</Text>

                <CheckBox
                  label="Hypertension"
                  value={residentForm.haveHypertension}
                  onValueChange={() => handleCheckboxChange("haveHypertension")}
                />

                <CheckBox
                  label="Diabetes"
                  value={residentForm.haveDiabetes}
                  onValueChange={() => handleCheckboxChange("haveDiabetes")}
                />

                <CheckBox
                  label="Tubercolosis"
                  value={residentForm.haveTubercolosis}
                  onValueChange={() => handleCheckboxChange("haveTubercolosis")}
                />

                <CheckBox
                  label="Surgery"
                  value={residentForm.haveSurgery}
                  onValueChange={() => handleCheckboxChange("haveSurgery")}
                />
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>Deceased</Text>
                <View style={MyStyles.radioGroup}>
                  {["Yes", "No"].map((option) => (
                    <Pressable
                      key={option}
                      style={MyStyles.radioOption}
                      onPress={() => handleRadioChange("deceased", option)}
                    >
                      <View style={MyStyles.radioCircle}>
                        {residentForm.deceased === option && (
                          <View style={MyStyles.radioDot} />
                        )}
                      </View>
                      <Text
                        style={{
                          fontFamily: "QuicksandMedium",
                          fontSize: RFPercentage(2),
                        }}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Contact Information */}

              <Text style={[MyStyles.FormSectionTitle, { marginTop: 30 }]}>
                Contact Information
              </Text>
              <View>
                <Text style={MyStyles.inputLabel}>Email</Text>
                <TextInput
                  placeholder="Email"
                  style={MyStyles.input}
                  value={residentForm.email}
                  onChangeText={(text) => handleInputChange("email", text)}
                />
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>
                  Mobile Number<Text style={{ color: "red" }}>*</Text>
                </Text>
                <TextInput
                  style={MyStyles.input}
                  keyboardType="numeric"
                  value={residentForm.mobilenumber}
                  onChangeText={(text) =>
                    handleInputChange("mobilenumber", text)
                  }
                />
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>Telephone</Text>
                <TextInput
                  style={MyStyles.input}
                  keyboardType="numeric"
                  value={residentForm.telephone}
                  onChangeText={(text) => handleInputChange("telephone", text)}
                />
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>Facebook</Text>
                <TextInput
                  placeholder="Facebook"
                  style={MyStyles.input}
                  value={residentForm.facebook}
                  onChangeText={(text) => handleInputChange("facebook", text)}
                />
              </View>

              {/* In Case Of Emergency Situation */}

              <Text style={[MyStyles.FormSectionTitle, { marginTop: 30 }]}>
                In Case Of Emergency Situation
              </Text>
              <View>
                <Text style={MyStyles.inputLabel}>
                  Name of Guardian<Text style={{ color: "red" }}>*</Text>
                </Text>
                <TextInput
                  placeholder="Full Name"
                  style={MyStyles.input}
                  value={residentForm.emergencyname}
                  onChangeText={(text) =>
                    handleInputChange("emergencyname", text)
                  }
                />
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>
                  Mobile Number<Text style={{ color: "red" }}>*</Text>
                </Text>
                <TextInput
                  style={MyStyles.input}
                  value={residentForm.emergencymobilenumber}
                  keyboardType="numeric"
                  onChangeText={(text) =>
                    handleInputChange("emergencymobilenumber", text)
                  }
                />
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>
                  Address<Text style={{ color: "red" }}>*</Text>
                </Text>
                <TextInput
                  placeholder="Address"
                  style={MyStyles.input}
                  value={residentForm.emergencyaddress}
                  onChangeText={(text) =>
                    handleInputChange("emergencyaddress", text)
                  }
                />
              </View>

              {/* Household Information */}
              <Text style={[MyStyles.FormSectionTitle, { marginTop: 30 }]}>
                Household Information
              </Text>
              <View>
                <Text style={MyStyles.inputLabel}>Head of the Household?</Text>
                <View style={MyStyles.radioGroup}>
                  {["Yes", "No"].map((option) => (
                    <Pressable
                      key={option}
                      style={MyStyles.radioOption}
                      onPress={() => handleRadioChange("head", option)}
                    >
                      <View style={MyStyles.radioCircle}>
                        {residentForm.head === option && (
                          <View style={MyStyles.radioDot} />
                        )}
                      </View>
                      <Text
                        style={{
                          fontFamily: "QuicksandMedium",
                          fontSize: RFPercentage(2),
                        }}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {residentForm.head === "No" && (
                <>
                  <View>
                    <Text style={MyStyles.inputLabel}>Household</Text>
                    <Dropdown
                      labelField="label"
                      valueField="value"
                      value={residentForm.householdno}
                      data={households
                        .filter((h) => h.status !== "Pending")
                        .map((h) => {
                          const head = h.members.find(
                            (m) => m.position === "Head"
                          );
                          const headName = head?.resID
                            ? `${head.resID.lastname}'s Residence - ${h.address}`
                            : "Unnamed";
                          return {
                            label: headName,
                            value: h._id,
                          };
                        })}
                      placeholder="Select"
                      placeholderStyle={MyStyles.placeholderText}
                      selectedTextStyle={MyStyles.selectedText}
                      onChange={(item) =>
                        handleDropdownChange("householdno", item.value)
                      }
                      style={[MyStyles.input, { height: RFPercentage("auto") }]}
                    />
                  </View>

                  <View>
                    <Text style={MyStyles.inputLabel}>Position</Text>
                    <Dropdown
                      labelField="label"
                      valueField="value"
                      value={residentForm.householdposition}
                      data={[
                        "Spouse",
                        "Son",
                        "Daughter",
                        "Parent",
                        "Sibling",
                        "Grandparent",
                        "Grandchild",
                        "In-law",
                        "Relative",
                        "Housemate",
                        "Househelp",
                        "Other",
                      ].map((item) => ({ label: item, value: item }))}
                      placeholder="Select Position"
                      placeholderStyle={MyStyles.placeholderText}
                      selectedTextStyle={MyStyles.selectedText}
                      onChange={(item) =>
                        handleDropdownChange("householdposition", item.value)
                      }
                      style={MyStyles.input}
                    />
                  </View>
                </>
              )}

              {residentForm.head === "Yes" && (
                <>
                  <View>
                    <Text style={MyStyles.inputLabel}>House Number</Text>
                    <TextInput
                      placeholder="House Number"
                      style={MyStyles.input}
                      keyboardType="numeric"
                      value={householdForm.housenumber}
                      onChangeText={(text) =>
                        handleHouseholdInputChange("housenumber", text)
                      }
                    />
                  </View>

                  <View>
                    <Text style={MyStyles.inputLabel}>
                      Street<Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <Dropdown
                      labelField="label"
                      valueField="value"
                      value={householdForm.street}
                      data={streetList.map((purp) => ({
                        label: purp,
                        value: purp,
                      }))}
                      placeholder="Select"
                      placeholderStyle={MyStyles.placeholderText}
                      selectedTextStyle={MyStyles.selectedText}
                      onChange={(item) =>
                        handleHouseholdDropdownChange("street", item.value)
                      }
                      style={MyStyles.input}
                    ></Dropdown>
                  </View>

                  <View>
                    <Text style={MyStyles.inputLabel}>HOA Name</Text>
                    <Dropdown
                      labelField="label"
                      valueField="value"
                      value={householdForm.HOAname}
                      data={[
                        {
                          label: "Bermuda Town Homes",
                          value: "Bermuda Town Homes",
                        },
                      ]}
                      placeholder="Select"
                      placeholderStyle={MyStyles.placeholderText}
                      selectedTextStyle={MyStyles.selectedText}
                      onChange={(item) =>
                        handleHouseholdDropdownChange("street", item.value)
                      }
                      style={MyStyles.input}
                    ></Dropdown>
                  </View>
                  <View>
                    <Text style={MyStyles.inputLabel}>
                      Ethnicity<Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <View style={MyStyles.radioGroup}>
                      {["IP Household", "Non-IP Household"].map((option) => (
                        <Pressable
                          key={option}
                          style={MyStyles.radioOption}
                          onPress={() =>
                            handleHouseholdRadioChange("ethnicity", option)
                          }
                        >
                          <View style={MyStyles.radioCircle}>
                            {householdForm.ethnicity === option && (
                              <View style={MyStyles.radioDot} />
                            )}
                          </View>
                          <Text
                            style={{
                              fontFamily: "QuicksandMedium",
                              fontSize: RFPercentage(2),
                            }}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {householdForm.ethnicity === "IP Household" && (
                    <>
                      <View>
                        <Text style={MyStyles.inputLabel}>Tribe</Text>
                        <TextInput
                          placeholder="Tribe"
                          style={MyStyles.input}
                          value={householdForm.tribe}
                          onChangeText={(text) =>
                            handleHouseholdInputChange("tribe", text)
                          }
                        />
                      </View>
                    </>
                  )}

                  <View>
                    <Text style={MyStyles.inputLabel}>
                      Socioeconomic Status
                      <Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <View style={MyStyles.radioGroup}>
                      {["NHTS 4Ps", "NHTS Non-4Ps", "Non-NHTS"].map(
                        (option) => (
                          <Pressable
                            key={option}
                            style={MyStyles.radioOption}
                            onPress={() =>
                              handleHouseholdRadioChange("sociostatus", option)
                            }
                          >
                            <View style={MyStyles.radioCircle}>
                              {householdForm.sociostatus === option && (
                                <View style={MyStyles.radioDot} />
                              )}
                            </View>
                            <Text
                              style={{
                                fontFamily: "QuicksandMedium",
                                fontSize: RFPercentage(2),
                              }}
                            >
                              {option}
                            </Text>
                          </Pressable>
                        )
                      )}
                    </View>
                  </View>

                  {(householdForm.sociostatus === "NHTS 4Ps" ||
                    householdForm.sociostatus === "NHTS Non-4Ps") && (
                    <>
                      <View>
                        <Text style={MyStyles.inputLabel}>NHTS No.</Text>
                        <TextInput
                          placeholder="NHTS No"
                          style={MyStyles.input}
                          value={householdForm.nhtsno}
                          keyboardType="numeric"
                          onChangeText={(text) =>
                            handleHouseholdInputChange("nhtsno", text)
                          }
                        />
                      </View>
                    </>
                  )}

                  <View>
                    <Text style={MyStyles.inputLabel}>
                      Type of Water Source
                      <Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <Dropdown
                      labelField="label"
                      valueField="value"
                      value={householdForm.watersource}
                      data={watersourceList.map((purp) => ({
                        label: purp,
                        value: purp,
                      }))}
                      placeholder="Select"
                      placeholderStyle={MyStyles.placeholderText}
                      selectedTextStyle={MyStyles.selectedText}
                      onChange={(item) =>
                        handleHouseholdDropdownChange("watersource", item.value)
                      }
                      style={MyStyles.input}
                    ></Dropdown>
                  </View>

                  <View>
                    <Text style={MyStyles.inputLabel}>
                      Type of Toilet Facility
                      <Text style={{ color: "red" }}>*</Text>
                    </Text>
                    <Dropdown
                      labelField="label"
                      valueField="value"
                      value={householdForm.toiletfacility}
                      data={toiletfacilityList.map((purp) => ({
                        label: purp,
                        value: purp,
                      }))}
                      placeholder="Select"
                      placeholderStyle={MyStyles.placeholderText}
                      selectedTextStyle={MyStyles.selectedText}
                      onChange={(item) =>
                        handleHouseholdDropdownChange(
                          "toiletfacility",
                          item.value
                        )
                      }
                      style={MyStyles.input}
                    ></Dropdown>
                  </View>
                  <Text style={MyStyles.inputLabel}>Members</Text>
                  <View>
                    {householdForm.members.map((member, index) => (
                      <View key={index} style={MyStyles.membersWrapper}>
                        <View>
                          <Text style={MyStyles.inputLabel}>Resident Name</Text>
                          <TextInput
                            value={
                              member.resID?.firstname
                                ? `${member.resID.firstname} ${member.resID.lastname}` // existing member
                                : member.residentName || "" // new member being typed
                            }
                            onChangeText={(text) =>
                              handleMemberChange(index, "residentName", text)
                            }
                            placeholder="Enter Resident Name"
                            style={MyStyles.input}
                            editable={!member.resID} // cannot edit existing member
                          />

                          {memberSuggestions[index]?.length > 0 && (
                            <View
                              style={{
                                backgroundColor: "#fff",
                                borderWidth: 1,
                                borderColor: "#ccc",
                                borderRadius: 5,
                                marginBottom: 10,
                              }}
                            >
                              {memberSuggestions[index].map((item) => {
                                const fullName = `${item.firstname} ${
                                  item.middlename ? item.middlename + " " : ""
                                }${item.lastname}`;

                                return (
                                  <TouchableOpacity
                                    key={item._id}
                                    onPress={() =>
                                      handleMemberSuggestionClick(index, item)
                                    }
                                    style={{
                                      padding: 10,
                                      borderBottomWidth: 1,
                                      borderColor: "#eee",
                                    }}
                                  >
                                    <Text>{fullName}</Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          )}
                        </View>

                        <View>
                          <Text style={MyStyles.inputLabel}>Position</Text>
                          <Dropdown
                            data={positionList}
                            labelField="label"
                            valueField="value"
                            placeholder="Select"
                            placeholderStyle={MyStyles.placeholderText}
                            selectedTextStyle={MyStyles.selectedText}
                            value={member.position}
                            onChange={(item) =>
                              handleMemberChange(index, "position", item.value)
                            }
                            style={MyStyles.input}
                            containerStyle={MyStyles.dropdownContainer}
                          />

                          <TouchableOpacity
                            onPress={() => removeMember(index)}
                            style={[
                              MyStyles.residentAddBtn,
                              { borderColor: "red", marginTop: 10 },
                            ]}
                          >
                            <Text
                              style={[
                                MyStyles.buttonText,
                                MyStyles.residentAddText,
                                { color: "red" },
                              ]}
                            >
                              - Remove Member
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}

                    <TouchableOpacity
                      onPress={addMember}
                      style={[MyStyles.residentAddBtn]}
                    >
                      <Text
                        style={[MyStyles.buttonText, MyStyles.residentAddText]}
                      >
                        + Add Member
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={[MyStyles.inputLabel, { fontSize: 18 }]}>
                    Vehicles
                  </Text>
                  <View>
                    {householdForm.vehicles.map((vehicle, index) => (
                      <View key={index} style={MyStyles.membersWrapper}>
                        <View>
                          <Text style={MyStyles.inputLabel}>
                            Vehicle {index + 1}
                          </Text>
                        </View>

                        <View>
                          <Text style={MyStyles.inputLabel}>Model</Text>
                          <TextInput
                            style={MyStyles.input}
                            value={vehicle.model}
                            placeholder="e.g. Toyota Vios"
                            onChangeText={(text) =>
                              handleVehicleChange(index, "model", text)
                            }
                          />
                        </View>

                        <View>
                          <Text style={MyStyles.inputLabel}>Color</Text>
                          <TextInput
                            style={MyStyles.input}
                            value={vehicle.color}
                            placeholder="e.g. Red"
                            onChangeText={(text) =>
                              handleVehicleChange(index, "color", text)
                            }
                          />
                        </View>

                        <View>
                          <Text style={MyStyles.inputLabel}>Kind</Text>
                          <Dropdown
                            data={kindOptions}
                            labelField="label"
                            valueField="value"
                            placeholder="Select Kind"
                            placeholderStyle={MyStyles.placeholderText}
                            selectedTextStyle={MyStyles.selectedText}
                            value={vehicle.kind}
                            onChange={(item) =>
                              handleVehicleChange(index, "kind", item.value)
                            }
                            style={MyStyles.input}
                            containerStyle={MyStyles.dropdownContainer}
                          />
                        </View>

                        <View>
                          <Text style={MyStyles.inputLabel}>Plate Number</Text>
                          <TextInput
                            style={MyStyles.input}
                            value={vehicle.platenumber}
                            placeholder="e.g. ABC1234"
                            onChangeText={(text) =>
                              handleVehicleChange(index, "platenumber", text)
                            }
                          />

                          <TouchableOpacity
                            onPress={() => removeVehicle(index)}
                            style={[
                              MyStyles.button,
                              MyStyles.residentAddBtn,
                              { borderColor: "red", marginTop: 10 },
                            ]}
                          >
                            <Text
                              style={[
                                MyStyles.buttonText,
                                MyStyles.residentAddText,
                                { color: "red" },
                              ]}
                            >
                              Remove Vehicle
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}

                    <TouchableOpacity
                      onPress={addVehicle}
                      style={[MyStyles.residentAddBtn]}
                    >
                      <Text
                        style={[MyStyles.buttonText, MyStyles.residentAddText]}
                      >
                        + Add Vehicle
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Employment Information */}
              <Text style={[MyStyles.FormSectionTitle, { marginTop: 30 }]}>
                Employment Information
              </Text>

              <View>
                <Text style={MyStyles.inputLabel}>
                  Employment Status<Text style={{ color: "red" }}>*</Text>
                </Text>
                <Dropdown
                  labelField="label"
                  valueField="value"
                  value={residentForm.employmentstatus}
                  data={employmentstatusList.map((purp) => ({
                    label: purp,
                    value: purp,
                  }))}
                  placeholder="Select"
                  placeholderStyle={MyStyles.placeholderText}
                  selectedTextStyle={MyStyles.selectedText}
                  onChange={(item) =>
                    handleDropdownChange("employmentstatus", item.value)
                  }
                  style={MyStyles.input}
                ></Dropdown>
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>Occupation</Text>
                <TextInput
                  placeholder="Occupation"
                  style={MyStyles.input}
                  value={residentForm.occupation}
                  onChangeText={(text) => handleInputChange("occupation", text)}
                />
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>Monthly Income</Text>
                <Dropdown
                  labelField="label"
                  valueField="value"
                  value={residentForm.monthlyincome}
                  data={monthlyincomeList.map((purp) => ({
                    label: purp,
                    value: purp,
                  }))}
                  placeholder="Select"
                  placeholderStyle={MyStyles.placeholderText}
                  selectedTextStyle={MyStyles.selectedText}
                  onChange={(item) =>
                    handleDropdownChange("monthlyincome", item.value)
                  }
                  style={MyStyles.input}
                ></Dropdown>
              </View>

              {/* Educational Information */}
              <Text style={[MyStyles.FormSectionTitle, { marginTop: 30 }]}>
                Educational Information
              </Text>

              <View>
                <Text style={MyStyles.inputLabel}>Educational Attainment</Text>
                <Dropdown
                  labelField="label"
                  valueField="value"
                  value={residentForm.educationalattainment}
                  data={educationalattainmentList.map((purp) => ({
                    label: purp,
                    value: purp,
                  }))}
                  placeholder="Select"
                  placeholderStyle={MyStyles.placeholderText}
                  selectedTextStyle={MyStyles.selectedText}
                  onChange={(item) =>
                    handleDropdownChange("educationalattainment", item.value)
                  }
                  style={MyStyles.input}
                ></Dropdown>
              </View>

              <View>
                <Text style={MyStyles.inputLabel}>Course</Text>
                <TextInput
                  placeholder="Course"
                  style={MyStyles.input}
                  value={residentForm.course}
                  onChangeText={(text) => handleInputChange("course", text)}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[MyStyles.button, { marginVertical: 40 }]}
              onPress={handleConfirm}
              disabled={loading}
            >
              <Text style={MyStyles.buttonText}>
                {loading ? "Updating..." : "Update"}
              </Text>
            </TouchableOpacity>

            <AlertModal
              isVisible={isAlertModalVisible}
              message={alertMessage}
              onClose={() => setIsAlertModalVisible(false)}
            />

            <AlertModal
              isVisible={isConfirmModalVisible}
              isConfirmationModal={true}
              title="Update Resident Profile?"
              message="Are you sure you want to update your profile?"
              onClose={() => setIsConfirmModalVisible(false)}
              onConfirm={handleSubmit}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default UserProfile;
