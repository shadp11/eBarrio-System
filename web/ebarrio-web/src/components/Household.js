import { useContext, useEffect, useState, useRef } from "react";
import { InfoContext } from "../context/InfoContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AuthContext } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import api from "../api";

//SCREENS
import ViewHousehold from "./ViewHousehold";
import SearchBar from "./SearchBar";

//STYLES
import "../Stylesheets/CommonStyle.css";
import "../Stylesheets/Announcements.css";

//ICONS
import { FiDownload } from "react-icons/fi";
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdArrowDropDown,
} from "react-icons/md";

function Household({ isCollapsed }) {
  const location = useLocation();
  const { selectedSort } = location.state || {};
  const { fetchHouseholds, household } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  const [isHouseholdClicked, setHouseholdClicked] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [isActiveClicked, setActiveClicked] = useState(true);
  const [isPendingClicked, setPendingClicked] = useState(false);
  const [isChangeClicked, setChangedClicked] = useState(false);
  const [isRejectedClicked, setRejectedClicked] = useState(false);
  const [filteredHousehold, setFilteredHousehold] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState(selectedSort || "All");
  const exportRef = useRef(null);
  const filterRef = useRef(null);
  const [filterDropdown, setfilterDropdown] = useState(false);

  const toggleFilterDropdown = () => {
    setfilterDropdown(!filterDropdown);
  };

  useEffect(() => {
    fetchHouseholds();
  }, []);

  //To handle close when click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target) &&
        filterDropdown
      ) {
        setfilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterDropdown]);

  const handleRowClick = (householdID) => {
    setHouseholdClicked(true);
    setSelectedHousehold(householdID);
  };

  const exportPDF = async () => {
    const now = new Date().toLocaleString();
    const doc = new jsPDF("landscape", "mm", [722.54, 472.44]);
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;

    const generatePage = (household, index) => {
      if (household.status === "Change Requested") return;

      const headMember = household.members.find(
        (member) => member.position === "Head"
      );

      // Sort members by position: Head first, then Spouse, then Son/Daughter, then others
      const sortedMembers = household.members.sort((a, b) => {
        // Prioritize Head
        if (a.position === "Head") return -1;
        if (b.position === "Head") return 1;

        // Prioritize Spouse
        if (a.position === "Spouse") return -1;
        if (b.position === "Spouse") return 1;

        // Prioritize Son (3rd)
        if (a.position === "Son") return -1;
        if (b.position === "Son") return 1;

        // Prioritize Daughter (4th)
        if (a.position === "Daughter") return -1;
        if (b.position === "Daughter") return 1;

        // For all other positions (e.g., Grandparent, Sibling, In-law), keep their current order
        return 0;
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      const title = "HOUSEHOLD PROFILING FORM";
      const titleWidth =
        (doc.getStringUnitWidth(title) * doc.internal.getFontSize()) /
        doc.internal.scaleFactor;
      doc.text(title, (pageWidth - titleWidth) / 2, margin + 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);

      doc.text(`Municipality/City/District:`, margin, 40);
      doc.line(margin + 58, 40, margin + 150, 40);
      doc.text("Bacoor", margin + 58, 39);
      doc.text(`Province:`, margin, 48);
      doc.line(margin + 28, 48, margin + 150, 48);
      doc.text("Cavite", margin + 28, 47);
      doc.text(`Interviewed by:`, margin + 170, 40);
      doc.line(margin + 205, 40, margin + 300, 40);
      doc.text(`Reviewed by:`, margin + 170, 48);
      doc.line(margin + 205, 48, margin + 300, 48);
      const dateBoxX = pageWidth - margin - 80;
      const dateBoxY = margin + 10;
      doc.setLineWidth(0.5);
      doc.rect(dateBoxX, dateBoxY, 80, 35);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Date of Visit (mm/dd/yyyy)", dateBoxX + 40, dateBoxY + 7, {
        align: "center",
      });
      doc.line(dateBoxX, dateBoxY + 10, dateBoxX + 80, dateBoxY + 10);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("First Quarter:", dateBoxX + 2, dateBoxY + 15);
      doc.text("Second Quarter:", dateBoxX + 2, dateBoxY + 21);
      doc.text("Third Quarter:", dateBoxX + 2, dateBoxY + 27);
      doc.text("Fourth Quarter:", dateBoxX + 2, dateBoxY + 33);

      //To display the code for relationship of members to HH head
      const relationshipMap = {
        1: "Head",
        2: "Spouse",
        3: "Son",
        4: "Daughter",
        5: "Others, specify relation",
      };

      const getRelationshipCode = (description) => {
        // Check if the description exists in relationshipMap
        const code = Object.entries(relationshipMap).find(
          ([code, desc]) => desc === description
        );
        if (code) {
          return code[0]; // Return the code if it exists
        } else {
          return `5 - ${description}`; // If not found, return "5" with the position description
        }
      };

      //To display the code for sex
      const getSexCode = (sex) => {
        const sexMap = {
          Male: "M",
          Female: "F",
        };
        return sexMap[sex] || "";
      };

      // To format the date
      const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();

        const formattedMonth = month < 10 ? `0${month}` : month;
        const formattedDay = day < 10 ? `0${day}` : day;

        return `${formattedMonth}/${formattedDay}/${year}`;
      };

      //To display the code for civil status
      const getCivilStatusCode = (civilstatus) => {
        const civilstatusMap = {
          Married: "M",
          Single: "S",
          "Widow-er": "W",
          Separated: "SP",
          Cohabitation: "C",
        };
        return civilstatusMap[civilstatus] || "";
      };

      //To display the code for membership type
      const getPhilhealthTypeCode = (philhealthtype) => {
        const philhealthtypeMap = {
          Member: "M",
          Dependent: "D",
        };
        return philhealthtypeMap[philhealthtype] || "";
      };

      //To display the code for philhealth category
      const getPhilhealthCategoryCode = (philhealthcategory) => {
        const philhealthcategoryMap = {
          "Formal Economy Private": "FEP",
          "Formal Economy Government": "FEG",
          "Informal Economy": "IE",
          NHTS: "N",
          "Senior Citizen": "SC",
          "Indigenous People": "IP",
          Unknown: "U",
        };
        return philhealthcategoryMap[philhealthcategory] || "";
      };

      // To display the code for medical history
      const getMedicalHistoryCode = (member) => {
        let history = [];

        if (member.resID?.haveDiabetes) history.push("DB");
        if (member.resID?.haveHypertension) history.push("HPN");
        if (member.resID?.haveSurgery) history.push("S");
        if (member.resID?.haveTubercolosis) history.push("TB");

        if (history.length === 0) return "N/A";

        return history.join(" ");
      };

      // To display the code for using any fp method
      const getUsingFPMethodCode = (member) => {
        if (member.resID?.haveFPmethod === "Yes") {
          return "Y";
        } else if (member.resID?.haveFPmethod === "No") {
          return "N";
        } else {
          return "";
        }
      };

      //To display the code for FP status
      const getFPStatusCode = (fpstatus) => {
        const fpstatusMap = {
          "New Acceptor": "N/A",
          "Current User": "CU",
          "Changing Method": "CM",
          "Changing Clinic": "CC",
          Dropout: "DO",
          Restarter: "R",
        };

        return fpstatusMap[fpstatus] || "";
      };

      //To display the code for age/class
      const getClassificationCode = (member) => {
        let classification = [];

        if (member.resID?.isNewborn) classification.push("N");
        if (member.resID?.isAdult) classification.push("AB");
        if (member.resID?.isSenior) classification.push("SC");
        if (member.resID?.isWomenOfReproductive) classification.push("WRA");
        if (member.resID?.isSchoolAge) classification.push("S");
        if (member.resID?.isAdolescent) classification.push("A");
        if (member.resID?.isPregnant) classification.push("P");
        if (member.resID?.isAdolescentPregnant) classification.push("AP");
        if (member.resID?.isPostpartum) classification.push("PP");
        if (member.resID?.isInfant) classification.push("I");
        if (member.resID?.isUnder5) classification.push("U");
        if (member.resID?.isPWD) classification.push("PWD");

        if (classification.length === 0) return "";

        return classification.join(" ");
      };

      const getEducationCode = (education) => {
        const educationMap = {
          None: "N",
          Kinder: "K",
          "Elementary Student": "ES",
          "Elementary Undergrad": "EU",
          "Elementary Graduate": "EG",
          "High School Student": "HS",
          "High School Undergrad": "HU",
          "High School Graduate": "HG",
          "Vocational Course": "V",
          "College Student": "CS",
          "College Undergrad": "CU",
          "College Graduate": "CG",
          Postgraduate: "PG",
        };
        return educationMap[education] || "";
      };

      doc.setFontSize(12);

      autoTable(doc, {
        startY: 60,
        margin: { left: margin, right: margin },
        head: [
          [
            { content: "Household Information", colSpan: 3 },
            { content: "Name of Respondent", colSpan: 3 },
            { content: "Ethnicity (Please Tick)", colSpan: 3 },
            { content: "Socioeconomic Status (Please Tick)", colSpan: 3 },
            { content: "Environmental Health Data", colSpan: 14 },
          ],
        ],
        body: [
          [
            {
              content: `Sitio/Purok: `,
              colSpan: 3,
              styles: {
                fontSize: 11,
              },
            },
            {
              content: `Lastname: ${headMember.resID.lastname || ""}
`,
              colSpan: 3,
              styles: {
                fontSize: 11,
              },
            },
            {
              content:
                `${
                  household.ethnicity === "IP Household" ? "[x]" : "[ ]"
                } IP Household\n` +
                `If IP Household, indicate tribe: ${household.tribe || ""}`,
              rowSpan: 2,
              colSpan: 3,
              styles: { valign: "top", fontSize: 11 },
            },
            {
              content:
                `${
                  household.sociostatus === "NHTS 4Ps" ? "[x]" : "[ ]"
                } NHTS 4Ps\n` +
                `${
                  household.sociostatus === "NHTS Non-4Ps" ? "[x]" : "[ ]"
                } NHTS Non-4Ps\n` +
                `${
                  household.sociostatus === "Non-NHTS" ? "[x]" : "[ ]"
                } Non-NHTS\n\n` +
                `If NHTS, please indicate the NHTS No.: ${
                  household.nhtsno || ""
                }`,
              rowSpan: 3,
              colSpan: 3,
              styles: { valign: "top", fontSize: 11 },
            },
            {
              content: `Type of Water Source: ${
                household.watersource === "Point Source"
                  ? "LEVEL I"
                  : household.watersource === "Communcal Faucet"
                  ? "LEVEL II"
                  : household.watersource === "Individual Connection"
                  ? "LEVEL III"
                  : household.watersource === "Others"
                  ? "Others"
                  : ""
              }`,
              colSpan: 3,
              styles: { fontSize: 11 },
            },
            {
              content: `Type of Toilet Facility: ${
                household.toiletfacility ===
                "Poor/flush type connected to septic tank"
                  ? "A"
                  : household.toiletfacility ===
                    "Pour/flush toilet connected to septic tank AND to sewerage system"
                  ? "B"
                  : household.toiletfacility === "Ventilated Pit latrine"
                  ? "C"
                  : household.toiletfacility === "Water-sealed toilet"
                  ? "D"
                  : household.toiletfacility === "Overhung latrine"
                  ? "E"
                  : household.toiletfacility === "Open pit latrine"
                  ? "F"
                  : household.toiletfacility === "Without toilet"
                  ? "G"
                  : ""
              }`,
              colSpan: 9,
              styles: { fontSize: 11 },
            },
            { content: "", colSpan: 2 },
          ],
          [
            {
              content: `Barangay: Aniban 2`,
              colSpan: 3,
              styles: { fontSize: 11 },
            },
            {
              content: `First Name: ${headMember.resID.firstname || ""}`,
              colSpan: 3,
              styles: { fontSize: 11 },
            },
            {
              content: `select from the following:\n\nLEVEL I - Point Source\nLEVEL II - Communal Faucet\nLEVEL III - Individual Connection\nOthers - For doubtful sources, open dug well etc.\n\n*write the type of toilet facility in the box provided`,
              rowSpan: 3,
              colSpan: 3,
              styles: { fontSize: 10, valign: "top" },
            },
            {
              content:
                `select from the following:\n\n` +
                `A - Poor/flush type connected to septic tank           E - Overhung latrine\n` +
                `B - Pour/flush toilet connected to septic tank AND to sewerage system           F - Open pit latrine\n` +
                `C - Ventilated Pit latrine                                        G - Without toilet\n` +
                `D - Water-sealed toilet\n\n` +
                `*write the type of toilet facility in the box provided`,
              rowSpan: 3,
              colSpan: 11,
              styles: { fontSize: 10, valign: "top" },
            },
          ],
          [
            {
              content: `Household (HH) Number: ${household.householdno || ""}`,
              colSpan: 3,
              styles: { fontSize: 11 },
            },
            {
              content: `Middle Name: ${headMember.resID.middlename || ""}`,
              colSpan: 3,
              styles: { fontSize: 11 },
            },

            { content: "", colSpan: 3 },
          ],
          [
            { content: "", colSpan: 3 },
            {
              content: `Relationship to HH Head: Head`,
              colSpan: 3,
              styles: { fontSize: 11 },
            },
            {
              content: `${
                household.ethnicity === "Non-IP Household" ? "[x]" : "[ ]"
              } Non-IP Household\n`,
              rowSpan: 1,
              colSpan: 3,
              styles: { valign: "top", fontSize: 11 },
            },
            { content: "", colSpan: 3 },
            { content: "", colSpan: 3 },
          ],

          [
            {
              content: `Name of Household Members`,
              colSpan: 3,
              styles: {
                halign: "center",
                valign: "middle",
                fontStyle: "bold",
                fontSize: 13,
              },
            },
            {
              content: `Relationship of members to HH Head`,
              styles: {
                halign: "center",
                valign: "middle",
                fontStyle: "bold",
                fontSize: 13,
              },
            },
            {
              content: `Sex`,
              styles: {
                halign: "center",
                valign: "middle",
                fontStyle: "bold",
                fontSize: 13,
              },
            },
            {
              content: `Date of Birth`,
              styles: {
                halign: "center",
                valign: "middle",
                fontStyle: "bold",
                fontSize: 13,
              },
            },
            {
              content: `Civil Status`,
              styles: {
                halign: "center",
                valign: "middle",
                fontStyle: "bold",
                fontSize: 13,
              },
            },
            {
              content: `Philheath ID Number`,
              styles: {
                halign: "center",
                valign: "middle",
                fontStyle: "bold",
                fontSize: 13,
              },
            },
            {
              content: `Membership Type`,
              styles: {
                halign: "center",
                valign: "middle",
                fontStyle: "bold",
                fontSize: 13,
              },
            },
            {
              content: `Philhealth Category`,
              styles: {
                halign: "center",
                valign: "middle",
                fontStyle: "bold",
                fontSize: 13,
              },
            },
            {
              content: `Medical History`,
              styles: {
                halign: "center",
                valign: "middle",
                fontStyle: "bold",
                fontSize: 13,
              },
            },
            {
              content: `Last Menstrual Period (LMP)`,
              styles: {
                halign: "center",
                valign: "middle",
                fontStyle: "bold",
                fontSize: 13,
              },
            },
            {
              content: `Women of Reproductive Age`,
              colSpan: 3,
              styles: {
                halign: "center",
                valign: "middle",
                fontStyle: "bold",
                fontSize: 13,
              },
            },
            {
              content: `Classification by Age/Health Risk Group`,
              colSpan: 8,
              styles: {
                halign: "center",
                valign: "middle",
                fontStyle: "bold",
                fontSize: 13,
              },
            },
            {
              content: `Educational Attainment`,
              styles: {
                halign: "center",
                valign: "middle",
                fontStyle: "bold",
                fontSize: 13,
              },
            },
            {
              content: `Religion`,
              styles: {
                halign: "center",
                valign: "middle",
                fontStyle: "bold",
                fontSize: 13,
              },
            },
            {
              content: `Remarks`,
              styles: {
                halign: "center",
                valign: "middle",
                fontStyle: "bold",
                fontSize: 13,
              },
            },
          ],
          [
            {
              colSpan: 3,
              content:
                "(Please provide the names of the members of the household starting from the household head followed by the spouse, son/daughter (oldest to youngest), and other members)",
              style: {
                fontSize: 10,
                halign: "center",
                valign: "middle",
              },
            },
            {
              colSpan: 1,
              rowSpan: 2,
              content:
                "1 - Head\n2-Spouse\n3 - Son\n4 - Daughter\n5 - Others, specify relation",
              styles: {
                fontSize: 11,
              },
            },
            {
              colSpan: 1,
              rowSpan: 2,
              content: "M - Male\nF - Female",
              styles: {
                fontSize: 11,
                halign: "center",
                valign: "top",
              },
            },
            {
              colSpan: 1,
              rowSpan: 2,
              content: "Write the birthday in this date format:\nmm/dd/yyyy",
              styles: {
                fontSize: 11,
                halign: "center",
                valign: "top",
              },
            },
            {
              colSpan: 1,
              rowSpan: 2,
              content:
                "M - Married\nS - Single\nW - Widow-er\nSP - Separated\nC - Cohabitation",
              styles: {
                fontSize: 11,
              },
            },
            {
              colSpan: 1,
              rowSpan: 2,
              content: "",
            },
            {
              colSpan: 1,
              rowSpan: 2,
              content: "M - Member\nD - Dependent",
              styles: {
                fontSize: 11,
              },
            },
            {
              colSpan: 1,
              rowSpan: 2,
              content:
                "FEP - Formal Economy Private\nFEG - Formal Economy Government\nIE - Informal Economy\nN - NHTS\nSC - Senior Citizen\nIP - Indigenous People\nU - Unknown",
              styles: {
                fontSize: 11,
              },
            },
            {
              colSpan: 1,
              rowSpan: 2,
              content:
                "HPN - Hypertension\nDB - Diabetes\nTB - Tuberculosis\nS - Surgery",
              styles: {
                fontSize: 11,
              },
            },
            {
              colSpan: 1,
              rowSpan: 2,
              content: "Write the LMP in this date format:\nmm/dd/yyyy",
              styles: {
                fontSize: 11,
                halign: "center",
                valign: "top",
              },
            },
            {
              colSpan: 1,
              content: "Using any FP method?",
              styles: {
                fontSize: 11,
                halign: "center",
                valign: "top",
              },
            },
            {
              colSpan: 1,
              content: "Family Planning Method Used",
              styles: {
                fontSize: 11,
                halign: "center",
                valign: "top",
              },
            },
            {
              colSpan: 1,
              content: "FP Status",
              styles: {
                fontSize: 11,
                halign: "center",
                valign: "top",
              },
            },
            {
              colSpan: 8,
              content: `N  - Newborn                    AB - Adult > 25 y.o
P  - Pregnant                   AP - Adolescent Pregnant
SC - Senior Citizen             PP - Postpartum
WRA - Women with Rep. Age       I  - Infant
S  - School of Age (0-5 y.o)    U  - Under 5 y.o
A  - Adolescent (10-19 y.o)     PWD - Person with Disability`,
              styles: {
                fontSize: 11,
              },
            },
            {
              colSpan: 1,
              rowSpan: 2,
              content:
                "N - None\nK - Kinder\nES - Elem Student\nEU - Elem Undergrad\nEG - Elem Graduate\nHS - HS Student\nHU - HS Undergrad\nHG - HS Graduate\nV - Vocational Course\nCS - College Student\nCU - College Undergrad\nCG - College Graduate\nPG - Postgraduate",
              styles: {
                fontSize: 11,
              },
            },
            {
              colSpan: 1,
              rowSpan: 2,
              content:
                "Example:\nRoman Catholic, Christian, INC, Catholic, Islam, Baptist, Born Again, Christian, Buddhism, Church of God, Jehovah's Witness, Protestant, Seventh Day Adventist, LDS-Mormons, Evangelical, Pentecostal, Unknown, Other",
              styles: {
                fontSize: 11,
                halign: "center",
                valign: "top",
                fontStyle: "italic",
              },
            },
            {
              colSpan: 1,
              rowSpan: 2,
              content:
                "Write additional notes such as occupation, nutritional status, or any other detail related to each member of the household",
              styles: {
                fontSize: 11,
                halign: "center",
                valign: "top",
                fontStyle: "italic",
              },
            },
          ],
          [
            {
              colSpan: 1,
              content: "Last Name",
              styles: {
                halign: "center",
                valign: "middle",
                fontStyle: "bold",
                fontSize: 13,
              },
            },
            {
              colSpan: 1,
              content: "First Name",
              styles: {
                halign: "center",
                valign: "middle",
                fontStyle: "bold",
                fontSize: 13,
              },
            },
            {
              colSpan: 1,
              content: "Middle Name",
              styles: {
                halign: "center",
                valign: "middle",
                fontStyle: "bold",
                fontSize: 13,
              },
            },

            {
              colSpan: 1,
              content: "Y - Yes\nN - No",
              style: {
                fontSize: 11,
              },
            },
            {
              colSpan: 1,
              content:
                "Choose from the following:COC, POP, Injectables, IUD, Condom, LAM, BTL, Implant, SDM, DPT, Withdrawal, Others",
              style: {
                fontSize: 11,
              },
            },
            {
              colSpan: 1,
              content:
                "N/A - New Acceptor\nCU - Current User\nCM - Changing Method\nCC - Changing Clinic\nDO - Dropout\nR - Restarter",
              style: {
                fontSize: 11,
              },
            },
            {
              colSpan: 2,
              content: "1st Quarter",
              style: {
                fontSize: 11,
                halign: "center",
                valign: "middle",
              },
            },
            {
              colSpan: 2,
              content: "2nd Quarter",
              style: {
                fontSize: 11,
                halign: "center",
                valign: "middle",
              },
            },
            {
              colSpan: 2,
              content: "3rd Quarter",
              style: {
                fontSize: 11,
                halign: "center",
                valign: "middle",
              },
            },
            {
              colSpan: 2,
              content: "4th Quarter",
              style: {
                fontSize: 11,
                halign: "center",
                valign: "middle",
              },
            },
          ],
          [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            {
              colSpan: 1,
              content: "Age",
              style: {
                fontSize: 10,
              },
            },
            {
              colSpan: 1,
              content: "Class",
              style: {
                fontSize: 10,
              },
            },
            {
              colSpan: 1,
              content: "Age",
              style: {
                fontSize: 10,
              },
            },
            {
              colSpan: 1,
              content: "Class",
              style: {
                fontSize: 10,
              },
            },
            {
              colSpan: 1,
              content: "Age",
              style: {
                fontSize: 10,
              },
            },
            {
              colSpan: 1,
              content: "Class",
              style: {
                fontSize: 10,
              },
            },
            {
              colSpan: 1,
              content: "Age",
              style: {
                fontSize: 10,
              },
            },
            {
              colSpan: 1,
              content: "Class",
              style: {
                fontSize: 10,
              },
            },
            null,
            null,
            null,
          ],

          ...sortedMembers.map((member) => [
            {
              content: member.resID?.lastname || "",
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: member.resID?.firstname || "",
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: member.resID?.middlename || "",
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: getRelationshipCode(member.position),
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: getSexCode(member.resID?.sex),
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: formatDate(member.resID?.birthdate || ""),
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: getCivilStatusCode(member.resID?.civilstatus),
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: member.resID?.philhealthid || "",
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: getPhilhealthTypeCode(member.resID?.philhealthtype),
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: getPhilhealthCategoryCode(
                member.resID?.philhealthcategory
              ),
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: getMedicalHistoryCode(member),
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content:
                member.resID.sex === "Female" && member.resID.lastmenstrual
                  ? formatDate(member.resID.lastmenstrual)
                  : "",
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content:
                member.resID.sex === "Female"
                  ? getUsingFPMethodCode(member)
                  : "",
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content:
                member.resID.sex === "Female"
                  ? member.resID.fpmethod || ""
                  : "",
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content:
                member.resID.sex === "Female"
                  ? getFPStatusCode(member.resID.fpStatus)
                  : "",
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: member.resID.age || "",
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: getClassificationCode(member),
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: "", //age2 cell
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: "", //class2 cell
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: "", //age3 cell
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: "", //class3 cell
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: "", //age4 cell
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: "", //class4 cell
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: getEducationCode(member.resID?.educationalattainment),
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: member.resID?.religion || "",
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
            {
              content: "", //remarks cell
              styles: { fontSize: 12, halign: "center", valign: "middle" },
            },
          ]),

          ...Array(
            14 - sortedMembers.length > 0 ? 14 - sortedMembers.length : 0
          ).fill([
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
          ]),
        ],
        columnStyles: {
          0: { cellWidth: 35 }, // Last Name
          1: { cellWidth: 35 }, // First Name
          2: { cellWidth: 35 }, // Middle Name
          3: { cellWidth: 35 }, // Relationship of members
          4: { cellWidth: 18 }, // Sex
          5: { cellWidth: 34 }, // Date of Birth
          6: { cellWidth: 35 }, // Civil Status
          7: { cellWidth: 40 }, // Philhealth ID Number
          8: { cellWidth: 35 }, // Membership Type
          9: { cellWidth: 36 }, // Philhealth Category
          10: { cellWidth: 35 }, // Medical History
          11: { cellWidth: 34 }, // Last Menstrual Period (LMP)
          12: { cellWidth: 20 }, // WRA - Using any FP Method?
          13: { cellWidth: 35 }, // WRA - Family Planning Method Used
          14: { cellWidth: 30 }, // WRA - FP Status
          15: { cellWidth: 14 }, // Classification - Age Q1
          16: { cellWidth: 14 }, // Classification - Class Q1
          17: { cellWidth: 14 }, // Classification - Age Q2
          18: { cellWidth: 14 }, // Classification - Class Q2
          19: { cellWidth: 14 }, // Classification - Age Q3
          20: { cellWidth: 14 }, // Classification - Class Q3
          21: { cellWidth: 14 }, // Classification - Age Q4
          22: { cellWidth: 14 }, // Classification - Class Q4
          23: { cellWidth: 35 }, // Educational Attainment
          24: { cellWidth: 35 }, // Religion
          25: { cellWidth: 28 }, // Remarks
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: 0,
          fontStyle: "bold",
          fontSize: 14,
          halign: "center",
          valign: "middle",
          lineWidth: 0.5,
          lineColor: 0,
          cellPadding: 1.5,
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: 0,
          halign: "left",
          valign: "top",
          lineWidth: 0.5,
          lineColor: 0,
          cellPadding: 2,
          minCellHeight: 13,
        },
        didParseCell: function (data) {},
        theme: "grid",
      });

      const pageCount = doc.internal.getNumberOfPages();
      const currentPage = index + 1;

      doc.setFontSize(14);
      const footerText = `Exported by: ${user.name} | Exported on: ${now}`;
      const pageText = `Page ${currentPage} of ${pageCount}`;

      // Footer positioning
      doc.text(footerText, margin, pageHeight - 10);
      doc.text(pageText, pageWidth - margin - 30, pageHeight - 10);
    };

    // Loop through each household and generate a new page for each
    filteredHousehold.forEach((household, index) => {
      if (index > 0) doc.addPage(); // Add new page after the first household
      generatePage(household, index);
    });

    // Save the generated PDF
    doc.save(`Household_Profiling_Form_${now}.pdf`);

    const action = "Export";
    const target = "Households";
    const description = `User exported household records to PDF.`;
    try {
      await api.post("/logexport", { action, target, description });
    } catch (error) {
      console.log("Error in logging export", error);
    }
  };

  const handleMenu1 = () => {
    setActiveClicked(true);
    setPendingClicked(false);
    setChangedClicked(false);
    setRejectedClicked(false);
  };
  const handleMenu2 = () => {
    setPendingClicked(true);
    setActiveClicked(false);
    setChangedClicked(false);
    setRejectedClicked(false);
  };
  const handleMenu3 = () => {
    setChangedClicked(true);
    setPendingClicked(false);
    setActiveClicked(false);
    setRejectedClicked(false);
  };
  const handleMenu4 = () => {
    setRejectedClicked(true);
    setChangedClicked(false);
    setPendingClicked(false);
    setActiveClicked(false);
  };

  const handleSearch = (text) => {
    const sanitizedText = text.replace(/[^a-zA-Z0-9\s]/g, "");
    setSearch(sanitizedText);
  };

  useEffect(() => {
    let filtered = household;
    if (isActiveClicked) {
      filtered = household.filter((res) => res.status === "Active");
    } else if (isPendingClicked) {
      filtered = household.filter((res) => res.status === "Pending");
    } else if (isChangeClicked) {
      filtered = household.filter((res) => res.status === "Change Requested");
    } else if (isRejectedClicked) {
      filtered = household.filter(
        (res) => res.status === "Rejected" || res.status === "Archived"
      );
    }

    switch (sortOption) {
      case "4Ps":
        filtered = filtered.filter((h) => h.sociostatus === "NHTS 4Ps");
        break;
      default:
        break;
    }

    if (search) {
      const searchParts = search.toLowerCase().split(" ").filter(Boolean);

      filtered = filtered.filter((h) => {
        const head = h.members.find((m) => m.position === "Head");

        if (!head || !head.resID) return false;

        const first = head.resID.firstname || "";
        const middle = head.resID.middlename || "";
        const last = head.resID.lastname || "";
        const address = h.address || "";

        const fullName = `${first} ${middle} ${last}`.trim().toLowerCase();

        return searchParts.every(
          (part) =>
            fullName.includes(part) || address.toLowerCase().includes(part)
        );
      });
    }
    setFilteredHousehold(filtered);
  }, [
    search,
    household,
    isActiveClicked,
    isPendingClicked,
    isRejectedClicked,
    isChangeClicked,
    sortOption,
  ]);

  console.log(household);

  //For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalRows = filteredHousehold.length;
  const totalPages =
    rowsPerPage === "All" ? 1 : Math.ceil(totalRows / rowsPerPage);
  const indexOfLastRow =
    currentPage * (rowsPerPage === "All" ? totalRows : rowsPerPage);
  const indexOfFirstRow =
    indexOfLastRow - (rowsPerPage === "All" ? totalRows : rowsPerPage);
  const currentRows =
    rowsPerPage === "All"
      ? filteredHousehold
      : filteredHousehold.slice(indexOfFirstRow, indexOfLastRow);
  const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  const endRow = Math.min(indexOfLastRow, totalRows);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Households</div>
        <SearchBar handleSearch={handleSearch} searchValue={search} />

        <div className="status-add-container">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-x-8 mt-5">
            <p
              onClick={handleMenu1}
              className={`status-text ${
                isActiveClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Active
            </p>
            <p
              onClick={handleMenu2}
              className={`status-text ${
                isPendingClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Pending
              {household.some((house) => house.status === "Pending") && (
                <span className="ml-1 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
              )}
            </p>
            <p
              onClick={handleMenu3}
              className={`status-text ${
                isChangeClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Change Requested
              {household.some(
                (house) => house.status === "Change Requested"
              ) && (
                <span className="ml-1 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
              )}
            </p>
            <p
              onClick={handleMenu4}
              className={`status-text ${
                isRejectedClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Archived/Rejected
            </p>
          </div>
          {isActiveClicked && (
            <div className="export-sort-btn-container">
              <div className="relative" ref={exportRef}>
                {/* Export Button */}
                <div className="export-sort-btn" onClick={exportPDF}>
                  <FiDownload className="text-[#0E94D3] mr-1" size={16} />
                  <h1 className="export-sort-btn-text">PDF</h1>
                </div>
              </div>
              <div className="relative" ref={filterRef}>
                {/* Filter Button */}
                <div className="export-sort-btn" onClick={toggleFilterDropdown}>
                  <h1 className="export-sort-btn-text">{sortOption}</h1>
                  <div className="export-sort-btn-dropdown-icon">
                    <MdArrowDropDown size={18} color={"#0E94D3"} />
                  </div>
                </div>

                {filterDropdown && (
                  <div className="export-sort-dropdown-menu">
                    <ul className="w-full">
                      <div className="navbar-dropdown-item">
                        <li
                          className="export-sort-dropdown-option"
                          onClick={() => {
                            setSortOption("All");
                            setfilterDropdown(false);
                          }}
                        >
                          All
                        </li>
                      </div>
                      <div className="navbar-dropdown-item">
                        <li
                          className="export-sort-dropdown-option"
                          onClick={() => {
                            setSortOption("4Ps");
                            setfilterDropdown(false);
                          }}
                        >
                          4Ps
                        </li>
                      </div>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="line-container">
          <hr className="line" />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr className="cursor-default">
                <th>No</th>
                <th>Household Name</th>
                <th>Head of the Household</th>
                <th>Address</th>
                <th>Household Size</th>
                <th>Number of Vehicles</th>
              </tr>
            </thead>

            <tbody className="bg-[#fff]">
              {filteredHousehold.length === 0 ? (
                <tr className="bg-white cursor-default">
                  <td colSpan={6}>No results found</td>
                </tr>
              ) : (
                currentRows.map((house, index) => {
                  const headMember = house.members.find(
                    (member) => member.position === "Head"
                  );
                  const headName = `${headMember.resID.lastname} ${headMember.resID.firstname}`;
                  const householdName = `${headMember.resID.lastname}'s Residence`;
                  return (
                    <tr
                      key={index}
                      onClick={() => handleRowClick(house._id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f0f0";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "";
                      }}
                    >
                      <td>{house.householdno}</td>
                      <td>{householdName}</td>
                      <td>{headName}</td>
                      <td>{house.address}</td>
                      <td>{house.members.length}</td>
                      <td>{house.vehicles.length}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {isHouseholdClicked && (
            <ViewHousehold
              onClose={() => setHouseholdClicked(false)}
              householdID={selectedHousehold}
            />
          )}
        </div>

        <div className="table-pagination">
          <div className="table-pagination-size">
            <span>Rows per page:</span>
            <div className="relative w-12">
              <select
                value={rowsPerPage === "All" ? "All" : rowsPerPage}
                onChange={(e) => {
                  const value =
                    e.target.value === "All" ? "All" : Number(e.target.value);
                  setRowsPerPage(value);
                  setCurrentPage(1);
                }}
                className="table-pagination-select"
              >
                {[5, 10, 15, 20].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <div className="table-pagination-select-icon">
                <MdArrowDropDown size={18} color={"#0E94D3"} />
              </div>
            </div>
          </div>

          <div>
            {startRow}-{endRow} of {totalRows}
          </div>

          {rowsPerPage !== "All" && (
            <div>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="table-pagination-btn"
              >
                <MdKeyboardArrowLeft color={"#0E94D3"} className="text-xl" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="table-pagination-btn"
              >
                <MdKeyboardArrowRight color={"#0E94D3"} className="text-xl" />
              </button>
            </div>
          )}
        </div>
        {currentRows.map((row, index) => (
          <div key={index}>{row.name}</div>
        ))}

        <div className="mb-20"></div>
      </main>
    </>
  );
}

export default Household;
