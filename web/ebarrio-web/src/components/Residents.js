import { useState, useEffect, useContext, useRef } from "react";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useLocation, useNavigate } from "react-router-dom";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useConfirm } from "../context/ConfirmContext";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { removeBackground } from "@imgly/background-removal";
//SCREENS
import SearchBar from "./SearchBar";
import CreateCertificate from "./CreateCertificate";
import BarangayID from "./id/BarangayID";
import ResidentReject from "./ResidentReject";

//STYLES
import "../Stylesheets/Residents.css";
import "../Stylesheets/CommonStyle.css";
import Aniban2logo from "../assets/aniban2logo.jpg";
import AppLogo from "../assets/applogo-lightbg.png";

//ICONS
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdArrowDropDown,
} from "react-icons/md";
import { IoArchiveSharp } from "react-icons/io5";
import { FaIdCard, FaEdit, FaTrashRestoreAlt, FaArchive } from "react-icons/fa";
import { HiDocumentAdd } from "react-icons/hi";
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6";
import { CgEyeAlt } from "react-icons/cg";

function Residents({ isCollapsed }) {
  const location = useLocation();
  const confirm = useConfirm();
  const navigation = useNavigate();
  const { selectedSort } = location.state || {};
  const { fetchResidents, residents } = useContext(InfoContext);
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isCertClicked, setCertClicked] = useState(false);
  const [isRejectClicked, setRejectClicked] = useState(false);
  const [isChangeClicked, setChangedClicked] = useState(false);
  const [selectedResID, setSelectedResID] = useState(null);
  const [search, setSearch] = useState("");
  const { user } = useContext(AuthContext);
  const [isActiveClicked, setActiveClicked] = useState(true);
  const [isArchivedClicked, setArchivedClicked] = useState(false);
  const [isPendingClicked, setPendingClicked] = useState(false);
  const [sortOption, setSortOption] = useState(selectedSort || "All");
  const exportRef = useRef(null);
  const filterRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const [exportDropdown, setexportDropdown] = useState(false);
  const [filterDropdown, setfilterDropdown] = useState(false);

  const toggleExportDropdown = () => {
    setexportDropdown(!exportDropdown);
  };

  const toggleFilterDropdown = () => {
    setfilterDropdown(!filterDropdown);
  };

  const handleAdd = () => {
    navigation("/create-resident");
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

  async function uploadToFirebaseImages(data) {
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `id_images/${Date.now()}_${randomString}.png`;
    const storageRef = ref(storage, fileName);

    // Convert to Blob if it’s not already
    let blob;
    if (data instanceof Blob) {
      blob = data;
    } else {
      blob = new Blob([data], { type: "image/png" });
    }

    await uploadBytes(storageRef, blob, { contentType: "image/png" });

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  }

  const handleBRGYID = async (e, resID) => {
    e.stopPropagation();
    const action = await confirm(
      "Do you want to print the current barangay ID or generate a new one?",
      "id"
    );

    if (action === "cancel") {
      return;
    }

    const resident = residents.filter((res) => resID === res._id);
    if (action === "generate") {
      if (!resident.picture && !resident.signature) {
        confirm(
          "This resident doesn't have a 2x2 picture and a signature.",
          "failed"
        );
        return;
      } else if (!resident.picture) {
        confirm("This resident doesn't have a 2x2 picture.", "failed");
        return;
      } else if (!resident.signature) {
        confirm("This resident doesn't have a signature.", "failed");
        return;
      }
      if (loading) return;

      setLoading(true);
      try {
        const response = await api.post(`/generatebrgyID/${resID}`);
        const qrCode = await uploadToFirebase(response.data.qrCode);
        try {
          await api.put(`/savebrgyID/${resID}`, {
            idNumber: response.data.idNumber,
            expirationDate: response.data.expirationDate,
            qrCode,
            qrToken: response.data.qrToken,
          });
        } catch (error) {
          console.log("Error saving barangay ID", error);
        }
        const response2 = await api.get(`/getresident/${resID}`);
        const response3 = await api.get(`/getcaptain/`);
        BarangayID({
          resData: response2.data,
          captainData: response3.data,
        });
      } catch (error) {
        console.log("Error generating barangay ID", error);
      } finally {
        setLoading(false);
      }
    } else if (action === "current") {
      if (loading) return;

      setLoading(true);
      try {
        const response = await api.get(`/getresident/${resID}`);
        const response2 = await api.get(`/getcaptain/`);
        if (
          !Array.isArray(response.data.brgyID) ||
          response.data.brgyID.length === 0
        ) {
          confirm("This resident has not yet been issued an ID.", "failed");
          return;
        }
        BarangayID({
          resData: response.data,
          captainData: response2.data,
        });
      } catch (error) {
        console.log("Error viewing current barangay ID", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRowClick = (residentId) => {
    setExpandedRow(expandedRow === residentId ? null : residentId);
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const approveBtn = async (e, resID) => {
    e.stopPropagation();
    const isConfirmed = await confirm(
      "Please confirm to proceed with approving this residency application request. This action cannot be undone.",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      await api.post(`/approveresident/${resID}`);

      setActiveClicked(true);
      setPendingClicked(false);
      confirm("The resident has been successfully approved.", "success");
    } catch (error) {
      console.log("Error in approving resident details", error);
      confirm(
        "An unexpected error occurred while approving the resident.",
        "errordialog"
      );
    } finally {
      setLoading(false);
    }
  };

  const viewBtn = async (resID) => {
    try {
      navigation("/view-resident", { state: { resID } });
    } catch (error) {
      console.log("Error in viewing resident details", error);
    }
  };

  const editBtn = async (resID) => {
    try {
      navigation(`/edit-resident/${resID}`);
    } catch (error) {
      console.log("Error in viewing resident details", error);
    }
  };

  const certBtn = (e, resID) => {
    e.stopPropagation();
    setSelectedResID(resID);
    setCertClicked(true);
  };

  const rejectBtn = (e, resID) => {
    e.stopPropagation();
    setSelectedResID(resID);
    setRejectClicked(true);
  };

  const archiveBtn = async (e, resID) => {
    e.stopPropagation();
    const isConfirmed = await confirm(
      "Please confirm to proceed with archiving this resident. You can restore this record later if needed.",
      "confirmred"
    );
    if (!isConfirmed) {
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      await api.put(`/archiveresident/${resID}`);
      confirm("The resident has been successfully archived.", "success");
    } catch (error) {
      console.log("Error", error);
    } finally {
      setLoading(false);
    }
  };

  const recoverBtn = async (e, resID) => {
    e.stopPropagation();
    const isConfirmed = await confirm(
      "Please confirm to proceed with recovering this archived resident. The resident will be restored to the active list.",
      "confirmred"
    );
    if (!isConfirmed) {
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      await api.put(`/recoverresident/${resID}`);
      confirm("The resident has been successfully recovered.", "success");
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
        confirm("An unexpected error occurred.", "errordialog");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    const sanitizedText = text.replace(/[^a-zA-Z0-9\s]/g, "");
    setSearch(sanitizedText);
  };

  useEffect(() => {
    let filtered = residents;
    if (isActiveClicked) {
      filtered = residents.filter((res) => res.status === "Active");
    } else if (isArchivedClicked) {
      filtered = residents.filter(
        (res) => res.status === "Archived" || res.status === "Rejected"
      );
    } else if (isChangeClicked) {
      filtered = residents.filter((res) => res.status === "Change Requested");
    } else if (isPendingClicked) {
      filtered = residents.filter((res) => res.status === "Pending");
    }

    switch (sortOption) {
      case "Female":
        filtered = filtered.filter(
          (res) => res.sex?.toLowerCase() === "female"
        );
        break;
      case "Male":
        filtered = filtered.filter((res) => res.sex?.toLowerCase() === "male");
        break;
      case "Senior Citizens":
        filtered = filtered.filter((res) => res.age >= 60 || res.isSenior);
        break;
      case "PWD":
        filtered = filtered.filter((res) => res.isPWD);
        break;
      case "Pregnant":
        filtered = filtered.filter((res) => res.isPregnant);
        break;
      case "Unemployed":
        filtered = filtered.filter(
          (res) => res.employmentstatus === "Unemployed"
        );
        break;
      case "Voters":
        filtered = filtered.filter((res) => res.voter === "Yes");
        break;
      case "Newborn":
        filtered = filtered.filter((res) => res.isNewborn);
        break;
      case "Infant":
        filtered = filtered.filter((res) => res.isInfant);
        break;
      case "Under 5 y.o":
        filtered = filtered.filter((res) => res.isUnder5);
        break;
      case "School of Age":
        filtered = filtered.filter((res) => res.isSchoolAge);
        break;
      case "Adolescent":
        filtered = filtered.filter((res) => res.isAdolescent);
        break;
      case "Adolescent Pregnant":
        filtered = filtered.filter((res) => res.isAdolescentPregnant);
        break;
      case "Adult":
        filtered = filtered.filter((res) => res.isAdult);
        break;
      case "Postpartum":
        filtered = filtered.filter((res) => res.isPostpartum);
        break;
      case "Women of Reproductive Age":
        filtered = filtered.filter((res) => res.isWomenOfReproductive);
        break;
      default:
        break;
    }
    if (search) {
      const searchParts = search.toLowerCase().split(" ").filter(Boolean);
      filtered = filtered.filter((resident) => {
        const first = resident.firstname || "";
        const middle = resident.middlename || "";
        const last = resident.lastname || "";

        const fullName = `${first} ${middle} ${last}`.trim().toLowerCase();

        return searchParts.every(
          (part) =>
            fullName.includes(part) ||
            resident.householdno?.address.toLowerCase().includes(part)
        );
      });
    }
    setFilteredResidents(filtered);
  }, [
    search,
    residents,
    isActiveClicked,
    isArchivedClicked,
    isPendingClicked,
    isChangeClicked,
    sortOption,
  ]);

  const handleMenu1 = () => {
    setActiveClicked(true);
    setArchivedClicked(false);
    setPendingClicked(false);
    setChangedClicked(false);
  };
  const handleMenu2 = () => {
    setPendingClicked(true);
    setActiveClicked(false);
    setChangedClicked(false);
    setArchivedClicked(false);
  };
  const handleMenu3 = () => {
    setChangedClicked(true);
    setPendingClicked(false);
    setActiveClicked(false);
    setArchivedClicked(false);
  };
  const handleMenu4 = () => {
    setArchivedClicked(true);
    setChangedClicked(false);
    setPendingClicked(false);
    setActiveClicked(false);
  };

  //For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalRows = filteredResidents.length;
  const totalPages =
    rowsPerPage === "All" ? 1 : Math.ceil(totalRows / rowsPerPage);
  const indexOfLastRow =
    currentPage * (rowsPerPage === "All" ? totalRows : rowsPerPage);
  const indexOfFirstRow =
    indexOfLastRow - (rowsPerPage === "All" ? totalRows : rowsPerPage);
  const currentRows =
    rowsPerPage === "All"
      ? filteredResidents
      : filteredResidents.slice(indexOfFirstRow, indexOfLastRow);
  const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  const endRow = Math.min(indexOfLastRow, totalRows);

  const exportCSV = async () => {
    if (filteredResidents.length === 0) {
      confirm("No records available for export.", "failed");
      return;
    }
    const title = `Barangay Aniban 2 ${
      sortOption === "All" ? "Residents" : sortOption
    }`;
    const now = new Date().toLocaleString();
    const headers =
      sortOption === "Voters"
        ? ["No.", "Name", "Age", "Sex", "Mobile No.", "Address", "Precinct"]
        : ["No.", "Name", "Age", "Sex", "Mobile No.", "Address"];
    const rows = filteredResidents
      .sort((a, b) => {
        const nameA = `${a.lastname}`.toLowerCase();
        const nameB = `${b.lastname}`.toLowerCase();
        return nameA.localeCompare(nameB);
      })
      .map((res, index) => {
        const fullname = res.middlename
          ? `${res.lastname} ${res.middlename} ${res.firstname}`
          : `${res.lastname} ${res.firstname}`;

        const baseRow = [
          index + 1,
          fullname,
          res.age,
          res.sex,
          `"${res.mobilenumber.replace(/"/g, '""')}"`,
          `"${res.householdno?.address.replace(/"/g, '""')}"`,
        ];
        if (sortOption === "Voters") {
          return [...baseRow, res.precinct || "N/A"];
        } else {
          return baseRow;
        }
      });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        `${title}`,
        `Exported by: ${user.name}`,
        `Exported on: ${now}`,
        "",
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${
        sortOption === "All"
          ? `Barangay_Aniban_2_Residents_by_${user.name.replace(/ /g, "_")}.csv`
          : `Barangay_Aniban_2_${sortOption}_by_${user.name.replace(
              / /g,
              "_"
            )}.csv`
      }`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setexportDropdown(false);

    const action = "Export";
    const target = "Residents";
    const description = `User exported ${
      sortOption === "All" ? "resident" : sortOption.toLowerCase()
    } records to CSV.`;
    try {
      await api.post("/logexport", { action, target, description });
    } catch (error) {
      console.log("Error in logging export", error);
    }
  };

  const exportPDF = async () => {
    if (filteredResidents.length === 0) {
      confirm("No records available for export.", "failed");
      return;
    }
    const now = new Date().toLocaleString();
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.width;
    const imageWidth = 30;
    const centerX = (pageWidth - imageWidth) / 2;

    //Header
    doc.addImage(Aniban2logo, "JPEG", centerX, 10, imageWidth, 30);
    doc.setFont("times");
    doc.setFontSize(14);
    doc.text("Barangay Aniban 2, Bacoor, Cavite", pageWidth / 2, 50, {
      align: "center",
    });

    //Title
    doc.setFontSize(12);
    doc.text(
      `${sortOption === "All" ? "Residents" : sortOption}`,
      pageWidth / 2,
      57,
      { align: "center" }
    );

    // Table
    const rows = filteredResidents
      .sort((a, b) => a.lastname.localeCompare(b.lastname))
      .map((res, index) => {
        const fullname = res.middlename
          ? `${res.lastname} ${res.middlename} ${res.firstname}`
          : `${res.lastname} ${res.firstname}`;
        const baseRow = [
          index + 1,
          fullname,
          res.age,
          res.sex,
          res.mobilenumber,
          res.householdno?.address,
        ];
        if (sortOption === "Voters") {
          return [...baseRow, res.precinct || "N/A"];
        } else {
          return baseRow;
        }
      });

    autoTable(doc, {
      head: [
        sortOption === "Voters"
          ? ["No.", "Name", "Age", "Sex", "Mobile No.", "Address", "Precinct"]
          : ["No.", "Name", "Age", "Sex", "Mobile No.", "Address"],
      ],
      body: rows,
      startY: 65,
      margin: { bottom: 30 },
      didDrawPage: function (data) {
        const pageHeight = doc.internal.pageSize.height;

        // Footer
        const logoX = 10;
        const logoY = pageHeight - 20;

        doc.setFontSize(8);
        doc.text("Powered by", logoX + 7.5, logoY - 2, { align: "center" });

        // App Logo (left)
        doc.addImage(AppLogo, "PNG", logoX, logoY, 15, 15);

        // Exported by & exported on
        doc.setFontSize(10);
        doc.text(`Exported by: ${user.name}`, logoX + 20, logoY + 5);
        doc.text(`Exported on: ${now}`, logoX + 20, logoY + 10);

        // Page number
        const pageWidth = doc.internal.pageSize.width;
        const pageCount = doc.internal.getNumberOfPages();
        const pageText = `Page ${
          doc.internal.getCurrentPageInfo().pageNumber
        } of ${pageCount}`;
        doc.setFontSize(10);
        doc.text(pageText, pageWidth - 40, pageHeight - 10);
      },
    });

    const filename = `${
      sortOption === "All"
        ? `Barangay_Aniban_2_Residents_by_${user.name.replace(/ /g, "_")}.pdf`
        : `Barangay_Aniban_2_${sortOption}_by_${user.name.replace(
            / /g,
            "_"
          )}.pdf`
    }`;
    doc.save(filename);
    setexportDropdown(false);

    const action = "Export";
    const target = "Residents";
    const description = `User exported ${
      sortOption === "All" ? "residents'" : sortOption.toLowerCase()
    } records to PDF.`;
    try {
      await api.post("/logexport", { action, target, description });
    } catch (error) {
      console.log("Error in logging export", error);
    }
  };

  //To handle close when click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        exportRef.current &&
        !exportRef.current.contains(event.target) &&
        exportDropdown
      ) {
        setexportDropdown(false);
      }

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
  }, [exportDropdown, filterDropdown]);

  const sortOptionsList = [
    "All",
    "Female",
    "Male",
    "Newborn",
    "Infant",
    "Under 5 y.o",
    "School of Age",
    "Adolescent",
    "Adolescent Pregnant",
    "Adult",
    "Postpartum",
    "Women of Reproductive Age",
    "Senior Citizens",
    "Pregnant",
    "PWD",
    "Unemployed",
    "Voters",
  ];

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
        <div className="header-text">Residents</div>

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
              {residents.some((resident) => resident.status === "Pending") && (
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
              {residents.some(
                (resident) => resident.status === "Change Requested"
              ) && (
                <span className="ml-1 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
              )}
            </p>
            <p
              onClick={handleMenu4}
              className={`status-text ${
                isArchivedClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Archived/Rejected
            </p>
          </div>
          {isActiveClicked && (
            <div className="export-sort-btn-container">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="flex flex-row gap-4 sm:gap-4">
                  {user.role !== "Technical Admin" && (
                    <>
                      <div className="relative" ref={exportRef}>
                        {/* Export Button */}
                        <div
                          className="export-sort-btn"
                          onClick={toggleExportDropdown}
                        >
                          <h1 className="export-sort-btn-text">Export</h1>
                          <div className="export-sort-btn-dropdown-icon">
                            <MdArrowDropDown size={18} color={"#0E94D3"} />
                          </div>
                        </div>

                        {exportDropdown && (
                          <div className="export-sort-dropdown-menu w-36">
                            <ul className="w-full">
                              <div className="navbar-dropdown-item">
                                <li
                                  className="export-sort-dropdown-option"
                                  onClick={exportCSV}
                                >
                                  Export as CSV
                                </li>
                              </div>
                              <div className="navbar-dropdown-item">
                                <li
                                  className="export-sort-dropdown-option"
                                  onClick={exportPDF}
                                >
                                  Export as PDF
                                </li>
                              </div>
                            </ul>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="relative" ref={filterRef}>
                    {/* Filter Button */}
                    <div
                      className="export-sort-btn"
                      onClick={toggleFilterDropdown}
                    >
                      <h1 className="export-sort-btn-text">{sortOption}</h1>
                      <div className="export-sort-btn-dropdown-icon">
                        <MdArrowDropDown size={18} color={"#0E94D3"} />
                      </div>
                    </div>

                    {filterDropdown && (
                      <div className="absolute mt-2 w-40 bg-white shadow-md z-10 rounded-md max-h-60 overflow-y-auto">
                        <ul className="dropdown-list">
                          {sortOptionsList.map((option) => (
                            <div className="navbar-dropdown-item" key={option}>
                              <li
                                className="export-sort-dropdown-option"
                                onClick={() => {
                                  setSortOption(option);
                                  setfilterDropdown(false);
                                }}
                              >
                                {option}
                              </li>
                            </div>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <button className="add-new-btn" onClick={handleAdd}>
                  <h1 className="add-new-btn-text">Add New Resident</h1>
                </button>
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
                <th>Name</th>
                <th>Age</th>
                <th>Sex</th>
                <th>Mobile No.</th>
                <th>Address</th>
                {sortOption === "Voters" && <th>Precinct</th>}
                <th></th>
              </tr>
            </thead>

            <tbody className="bg-[#fff]">
              {filteredResidents.length === 0 ? (
                <tr className="bg-white cursor-default">
                  <td colSpan={sortOption === "Voters" ? 7 : 6}>
                    No results found
                  </td>
                </tr>
              ) : (
                currentRows
                  .sort((a, b) => {
                    const nameA = `${a.lastname}`.toLowerCase();
                    const nameB = `${b.lastname}`.toLowerCase();
                    return nameA.localeCompare(nameB);
                  })
                  .map((res) => (
                    <React.Fragment key={res._id}>
                      <tr
                        onClick={() => handleRowClick(res._id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f0f0f0";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "";
                        }}
                      >
                        {expandedRow === res._id ? (
                          <td colSpan={sortOption === "Voters" ? 7 : 6}>
                            {/* Additional Information for the resident */}
                            <div className="profile-container">
                              <div className="my-4 text-xs">
                                <div className="add-info-table-container">
                                  <div className="add-info-img-container">
                                    {res.picture ? (
                                      <img
                                        src={res.picture}
                                        alt="Profile"
                                        className="profile-img"
                                      />
                                    ) : null}
                                  </div>

                                  {/* Name */}
                                  <div className="add-info-title">Name</div>
                                  <div className="add-info-container">
                                    {res.middlename
                                      ? `${res.firstname} ${res.middlename} ${res.lastname}`
                                      : `${res.firstname} ${res.lastname}`}
                                  </div>
                                  {/* Status */}
                                  <div className="add-info-title">Status</div>
                                  <div className="add-info-container">
                                    {res.voter === "Yes"
                                      ? "Voter"
                                      : "Not Voter"}
                                  </div>
                                  {/* Age */}
                                  <div className="add-info-title">Age</div>
                                  <div className="add-info-container">
                                    {res.age}
                                  </div>
                                  {/* Precinct */}
                                  <div className="add-info-title">Precinct</div>
                                  <div className="add-info-container">
                                    {res.precinct || "N/A"}
                                  </div>
                                  {/* Sex */}
                                  <div className="add-info-title">Sex</div>
                                  <div className="add-info-container">
                                    {res.sex}
                                  </div>

                                  <div className="border border-[#C1C0C0] bg-white col-span-2 flex items-center justify-center">
                                    Emergency Contact
                                  </div>

                                  {/* Civil Status */}
                                  <div className="add-info-title">
                                    Civil Status
                                  </div>
                                  <div className="add-info-container">
                                    {res.civilstatus}
                                  </div>
                                  {/* Name */}
                                  <div className="add-info-title">Name</div>
                                  <div className="add-info-container">
                                    {res.emergencyname}
                                  </div>

                                  {/* Mobile Number */}
                                  <div className="add-info-title">
                                    Mobile Number
                                  </div>
                                  <div className="add-info-container">
                                    {res.mobilenumber}
                                  </div>
                                  <div className="add-info-title">
                                    Mobile Number
                                  </div>
                                  <div className="add-info-container">
                                    {res.emergencymobilenumber}
                                  </div>

                                  {/* Address */}
                                  <div className="add-info-title">Address</div>
                                  <div className="add-info-container">
                                    {res.householdno?.address}
                                  </div>
                                  <div className="add-info-title">Address</div>
                                  <div className="add-info-container min-w-[250px] max-w-[250px]">
                                    {res.emergencyaddress}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {res.status === "Active" ? (
                              <div className="btn-container">
                                {user.resID !== res._id && (
                                  <button
                                    className="table-actions-container"
                                    type="submit"
                                    onClick={(e) => archiveBtn(e, res._id)}
                                  >
                                    <FaArchive className="text-[24px] text-btn-color-blue" />
                                    <label className="text-btn-color-blue text-xs">
                                      ARCHIVE
                                    </label>
                                  </button>
                                )}
                                {user.role !== "Technical Admin" && (
                                  <>
                                    <button
                                      className="table-actions-container"
                                      type="submit"
                                      onClick={(e) => handleBRGYID(e, res._id)}
                                    >
                                      <FaIdCard className="text-[24px] text-btn-color-blue" />
                                      <label className="text-btn-color-blue text-xs">
                                        BRGY ID
                                      </label>
                                    </button>
                                    <button
                                      className="table-actions-container"
                                      type="submit"
                                      onClick={(e) => certBtn(e, res._id)}
                                    >
                                      <HiDocumentAdd className="text-[24px] text-btn-color-blue" />
                                      <label className="text-btn-color-blue text-xs">
                                        DOCUMENT
                                      </label>
                                    </button>
                                  </>
                                )}
                                {user.resID !== res._id && (
                                  <button
                                    className="table-actions-container"
                                    type="submit"
                                    onClick={() => editBtn(res._id)}
                                  >
                                    <FaEdit className="text-[24px] text-btn-color-blue" />
                                    <label className="text-btn-color-blue text-xs">
                                      EDIT
                                    </label>
                                  </button>
                                )}
                              </div>
                            ) : res.status === "Archived" ? (
                              <div className="btn-container">
                                <button
                                  className="table-actions-container"
                                  type="submit"
                                  onClick={(e) => recoverBtn(e, res._id)}
                                >
                                  <FaArchive className="text-[24px] text-btn-color-blue" />
                                  <label className="text-btn-color-blue text-xs">
                                    RECOVER
                                  </label>
                                </button>
                              </div>
                            ) : res.status === "Pending" ||
                              res.status === "Change Requested" ? (
                              <>
                                <div className="btn-container">
                                  <button
                                    className="table-actions-container"
                                    type="submit"
                                    onClick={(e) => rejectBtn(e, res._id)}
                                  >
                                    <FaCircleXmark className="text-[24px] text-btn-color-blue" />
                                    <label className="text-btn-color-blue text-xs">
                                      REJECT
                                    </label>
                                  </button>
                                  <button
                                    className="table-actions-container"
                                    type="submit"
                                    onClick={(e) => approveBtn(e, res._id)}
                                  >
                                    <FaCircleCheck className="text-[24px] text-btn-color-blue" />
                                    <label className="text-btn-color-blue text-xs">
                                      APPROVE
                                    </label>
                                  </button>
                                  <button
                                    className="table-actions-container"
                                    type="submit"
                                    onClick={() => viewBtn(res._id)}
                                  >
                                    <CgEyeAlt className="text-[24px] text-btn-color-blue" />
                                    <label className="text-btn-color-blue text-xs">
                                      VIEW
                                    </label>
                                  </button>
                                </div>
                              </>
                            ) : null}
                          </td>
                        ) : (
                          <>
                            <td>
                              {res.middlename
                                ? `${res.lastname}, ${res.middlename} ${res.firstname}`
                                : `${res.lastname}, ${res.firstname}`}
                            </td>
                            <td>{res.age}</td>
                            <td>{res.sex}</td>
                            <td>{res.mobilenumber}</td>
                            <td>{res.householdno?.address}</td>
                            {sortOption === "Voters" && (
                              <td>{res.precinct ? res.precinct : "N/A"}</td>
                            )}
                            {/* Dropdown Arrow */}
                            <td className="text-center">
                              <span
                                className={`cursor-pointer transition-transform ${
                                  expandedRow === res._id ? "rotate-180" : ""
                                }`}
                              >
                                ▼
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    </React.Fragment>
                  ))
              )}
            </tbody>
          </table>
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

        {isCertClicked && (
          <CreateCertificate
            resID={selectedResID}
            onClose={() => setCertClicked(false)}
          />
        )}
        {isRejectClicked && (
          <ResidentReject
            resID={selectedResID}
            onClose={() => setRejectClicked(false)}
          />
        )}

        <div className="mb-20"></div>
      </main>
    </>
  );
}

export default Residents;
