import { useRef, useState, useEffect, useContext } from "react";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { useLocation, useNavigate } from "react-router-dom";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { useConfirm } from "../context/ConfirmContext";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

//SCREENS
import SearchBar from "./SearchBar";
import IndigencyPrint from "./certificates/IndigencyPrint";
import BusinessClearancePrint from "./certificates/BusinessClearancePrint";
import ClearancePrint from "./certificates/ClearancePrint";
import Reject from "./Reject";

//STYLES
import "../Stylesheets/Residents.css";
import "../Stylesheets/CommonStyle.css";

//ICONS
import { IoIosPrint, IoIosSend } from "react-icons/io";
import { RiUserReceived2Fill } from "react-icons/ri";
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6";
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdArrowDropDown,
} from "react-icons/md";
import Aniban2logo from "../assets/aniban2logo.jpg";
import AppLogo from "../assets/applogo-lightbg.png";

function CertificateRequests({ isCollapsed }) {
  const location = useLocation();
  const { cancelled } = location.state || {};
  const confirm = useConfirm();
  const { fetchCertificates, certificates } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortOption, setSortOption] = useState("Newest");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [isRejectClicked, setRejectClicked] = useState(false);

  const [isPendingClicked, setPendingClicked] = useState(true);
  const [isIssuedClicked, setIssuedClicked] = useState(false);
  const [isRejectedClicked, setRejectedClicked] = useState(false);
  const [selectedCertID, setSelectedCertID] = useState(null);
  const exportRef = useRef(null);
  const filterRef = useRef(null);

  const [exportDropdown, setexportDropdown] = useState(false);
  const [filterDropdown, setfilterDropdown] = useState(false);

  const toggleExportDropdown = () => {
    setexportDropdown(!exportDropdown);
  };

  const toggleFilterDropdown = () => {
    setfilterDropdown(!filterDropdown);
  };

  const handleSearch = (text) => {
    const sanitizedText = text.replace(/[^a-zA-Z\s.]/g, "");
    setSearch(sanitizedText);
  };

  useEffect(() => {
    if (cancelled) {
      setRejectedClicked(true);
      setPendingClicked(false);
      setIssuedClicked(false);
    }
  }, [cancelled]);

  useEffect(() => {
    fetchCertificates();
  }, []);

  useEffect(() => {
    let filtered = certificates;

    if (isPendingClicked) {
      filtered = certificates.filter((cert) => cert.status === "Pending");
    } else if (isIssuedClicked) {
      filtered = certificates.filter(
        (cert) =>
          cert.status === "Not Yet Collected" || cert.status === "Collected"
      );
    } else if (isRejectedClicked) {
      filtered = certificates.filter(
        (cert) => cert.status === "Rejected" || cert.status === "Cancelled"
      );
    }
    if (search) {
      filtered = filtered.filter((cert) => {
        const first = cert.resID.firstname || "";
        const middle = cert.resID.middlename || "";
        const last = cert.resID.lastname || "";

        const fullName = `${first} ${middle} ${last}`.trim();

        return fullName.toLowerCase().includes(search.toLowerCase());
      });
    }
    setFilteredCertificates(filtered);
  }, [
    certificates,
    search,
    isPendingClicked,
    isIssuedClicked,
    isRejectedClicked,
  ]);

  const handleRowClick = (certId) => {
    setExpandedRow(expandedRow === certId ? null : certId);
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

  const rejectBtn = (e, certID) => {
    e.stopPropagation();
    setRejectClicked(true);
    setSelectedCertID(certID);
  };

  const notifyBtn = async (e, certID) => {
    e.stopPropagation();
    const isConfirmed = await confirm(
      "Please confirm to proceed with notifying the resident that their document is ready for pickup.",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      await api.put(`/notifycert/${certID}`);
      confirm("The resident has been duly notified.", "success");
    } catch (error) {
      console.log("Error in notifying user", error);
    } finally {
      setLoading(false);
    }
  };

  const collectedBtn = async (e, certID) => {
    e.stopPropagation();
    const isConfirmed = await confirm(
      "Please confirm to proceed with marking this document as collected. This action cannot be undone.",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      await api.put(`/collectedcert/${certID}`);
      confirm(
        "The resident has successfully collected their document.",
        "success"
      );
    } catch (error) {
      console.log("Error in updating the status", error);
    } finally {
      setLoading(false);
    }
  };

  const certBtn = async (e, certID, isPrint) => {
    e.stopPropagation();
    let response3 = await api.get(`/getcertificate/${certID}`);
    const response4 = await api.get(`/getcaptain/`);
    const response5 = await api.get(`/getprepared/${user.userID}`);

    if (response3.data.typeofcertificate === "Barangay Indigency") {
      if (response3.data.status === "Pending") {
        const isConfirmed = await confirm(
          "Please confirm to proceed with issuing this document. This action cannot be undone.",
          "confirm"
        );
        if (!isConfirmed) return;
        if (loading) return;

        setLoading(true);

        try {
          const gencert = await api.put(`/generatecertificatereq/${certID}`);
          const qrCode = await uploadToFirebase(gencert.data.qrCode);
          const savecert = await api.put(`/savecertificatereq/${certID}`, {
            qrCode,
          });
          response3 = await api.get(`/getcertificate/${certID}`);
        } catch (error) {
          console.log("Error in issuing document", error);
        } finally {
          setLoading(false);
        }
      }
      setIssuedClicked(true);
      setPendingClicked(false);
      if (isPrint) {
        IndigencyPrint({
          certID,
          certData: response3.data,
          captainData: response4.data,
          preparedByData: response5.data,
          updatedAt: response3.data.updatedAt,
        });
      } else {
        IndigencyPrint({
          certID,
          isFirstIssue: true,
          certData: response3.data,
          captainData: response4.data,
          preparedByData: response5.data,
          updatedAt: response3.data.updatedAt,
        });
      }
    }

    if (response3.data.typeofcertificate === "Barangay Clearance") {
      if (response3.data.status === "Pending") {
        const isConfirmed = await confirm(
          "Please confirm to proceed with issuing this document. This action cannot be undone.",
          "confirm"
        );
        if (!isConfirmed) return;
        if (loading) return;

        setLoading(true);
        try {
          const gencert = await api.put(`/generatecertificatereq/${certID}`);
          const qrCode = await uploadToFirebase(gencert.data.qrCode);
          const savecert = await api.put(`/savecertificatereq/${certID}`, {
            qrCode,
          });
          response3 = await api.get(`/getcertificate/${certID}`);
        } catch (error) {
          console.log("Error in issuing document", error);
        } finally {
          setLoading(false);
        }
      }
      setIssuedClicked(true);
      setPendingClicked(false);

      if (isPrint) {
        ClearancePrint({
          certID,
          certData: response3.data,
          captainData: response4.data,
          preparedByData: response5.data,
          updatedAt: response3.data.updatedAt,
        });
      } else {
        ClearancePrint({
          certID,
          isFirstIssue: true,
          certData: response3.data,
          captainData: response4.data,
          preparedByData: response5.data,
          updatedAt: response3.data.updatedAt,
        });
      }
    }

    if (response3.data.typeofcertificate === "Barangay Business Clearance") {
      if (response3.data.status === "Pending") {
        const isConfirmed = await confirm(
          "Please confirm to proceed with issuing this document. This action cannot be undone.",
          "confirm"
        );
        if (!isConfirmed) return;
        if (loading) return;

        setLoading(true);
        try {
          const gencert = await api.put(`/generatecertificatereq/${certID}`);
          const qrCode = await uploadToFirebase(gencert.data.qrCode);
          const savecert = await api.put(`/savecertificatereq/${certID}`, {
            qrCode,
          });
          response3 = await api.get(`/getcertificate/${certID}`);
        } catch (error) {
          console.log("Error in issuing document", error);
        } finally {
          setLoading(false);
        }
      }
      setIssuedClicked(true);
      setPendingClicked(false);

      if (isPrint) {
        BusinessClearancePrint({
          certID,
          certData: response3.data,
          captainData: response4.data,
          preparedByData: response5.data,
          updatedAt: response3.data.updatedAt,
        });
      } else {
        BusinessClearancePrint({
          certID,
          isFirstIssue: true,
          certData: response3.data,
          captainData: response4.data,
          preparedByData: response5.data,
          updatedAt: response3.data.updatedAt,
        });
      }
    }
  };

  const handleMenu1 = () => {
    setPendingClicked(true);
    setIssuedClicked(false);
    setRejectedClicked(false);
  };
  const handleMenu2 = () => {
    setIssuedClicked(true);
    setPendingClicked(false);
    setRejectedClicked(false);
  };
  const handleMenu3 = () => {
    setRejectedClicked(true);
    setPendingClicked(false);
    setIssuedClicked(false);
  };

  //For Pagination
  const parseDate = (dateStr) => new Date(dateStr.replace(" at ", " "));

  const sortedFilteredCert = [...filteredCertificates].sort((a, b) => {
    if (sortOption === "Oldest") {
      return parseDate(a.updatedAt) - parseDate(b.updatedAt);
    } else {
      return parseDate(b.updatedAt) - parseDate(a.updatedAt);
    }
  });
  //For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalRows = sortedFilteredCert.length;
  const totalPages =
    rowsPerPage === "All" ? 1 : Math.ceil(totalRows / rowsPerPage);
  const indexOfLastRow =
    currentPage * (rowsPerPage === "All" ? totalRows : rowsPerPage);
  const indexOfFirstRow =
    indexOfLastRow - (rowsPerPage === "All" ? totalRows : rowsPerPage);
  const currentRows =
    rowsPerPage === "All"
      ? sortedFilteredCert
      : sortedFilteredCert.slice(indexOfFirstRow, indexOfLastRow);
  const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  const endRow = Math.min(indexOfLastRow, totalRows);

  const exportCSV = async () => {
    const title = "Barangay Aniban 2 Document Requests Reports";
    const now = new Date().toLocaleString();
    const headers = ["No", "Name", "Type of Certificate", "Date Issued"];
    const rows = filteredCertificates
      .sort(
        (a, b) =>
          new Date(a.updatedAt.split(" at")[0]) -
          new Date(b.updatedAt.split(" at")[0])
      )
      .map((cert) => {
        const fullname = cert.resID.middlename
          ? `${cert.resID.lastname} ${cert.resID.middlename} ${cert.resID.firstname}`
          : `${cert.resID.lastname} ${cert.resID.firstname}`;
        const issuedDate = cert.updatedAt.substring(
          0,
          cert.updatedAt.indexOf(" at")
        );

        return [
          cert.certno,
          fullname,
          cert.typeofcertificate,
          `${issuedDate.replace(",", "")}`,
        ];
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
      `Barangay_Aniban_2_Document_Requests_by_${user.name.replace(
        / /g,
        "_"
      )}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setexportDropdown(false);

    const action = "Export";
    const target = "Document Requests";
    const description = `User exported issued documents to CSV.`;
    try {
      await api.post("/logexport", { action, target, description });
    } catch (error) {
      console.log("Error in logging export", error);
    }
  };

  const exportPDF = async () => {
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
    doc.text("Document Requests Reports", pageWidth / 2, 57, {
      align: "center",
    });

    // Table
    const rows = filteredCertificates
      .sort(
        (a, b) =>
          new Date(a.updatedAt.split(" at")[0]) -
          new Date(b.updatedAt.split(" at")[0])
      )
      .map((cert) => {
        const fullname = cert.resID.middlename
          ? `${cert.resID.lastname} ${cert.resID.middlename} ${cert.resID.firstname}`
          : `${cert.resID.lastname} ${cert.resID.firstname}`;
        const issuedDate = cert.updatedAt.substring(
          0,
          cert.updatedAt.indexOf(" at")
        );

        return [cert.certno, fullname, cert.typeofcertificate, issuedDate];
      });

    autoTable(doc, {
      head: [["No.", "Name", "Type of Certificate", "Date Issued"]],
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

    const filename = `Barangay_Aniban_2_Document_Requests_by_${user.name.replace(
      / /g,
      "_"
    )}.pdf`;
    doc.save(filename);
    setexportDropdown(false);

    const action = "Export";
    const target = "Document Requests";
    const description = `User exported issued documents to CSV.`;
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

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
        <div className="header-text">Document Requests</div>

        <SearchBar handleSearch={handleSearch} searchValue={search} />
        <div className="status-add-container">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-x-8 mt-5">
            <p
              onClick={handleMenu1}
              className={`status-text ${
                isPendingClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Pending
              {certificates.some((cert) => cert.status === "Pending") && (
                <span className="ml-1 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
              )}
            </p>
            <p
              onClick={handleMenu2}
              className={`status-text ${
                isIssuedClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Issued
            </p>
            <p
              onClick={handleMenu3}
              className={`status-text ${
                isRejectedClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Cancelled/Rejected
            </p>
          </div>

          <div className="export-sort-btn-container">
            {isIssuedClicked && (
              <div className="relative" ref={exportRef}>
                {/* Export Button */}
                <div className="export-sort-btn" onClick={toggleExportDropdown}>
                  <h1 className="export-sort-btn-text">Export</h1>
                  <div className="export-sort-btn-dropdown-icon">
                    <MdArrowDropDown size={18} color={"#0E94D3"} />
                  </div>
                </div>

                {exportDropdown && (
                  <div
                    className="export-sort-dropdown-menu"
                    style={{ marginLeft: "-70px" }}
                  >
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
            )}

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
                          setSortOption("Newest");
                          setfilterDropdown(false);
                        }}
                      >
                        Newest
                      </li>
                    </div>
                    <div className="navbar-dropdown-item">
                      <li
                        className="export-sort-dropdown-option"
                        onClick={() => {
                          setSortOption("Oldest");
                          setfilterDropdown(false);
                        }}
                      >
                        Oldest
                      </li>
                    </div>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="line-container">
          <hr className="line" />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr className="cursor-default">
                {isIssuedClicked && <th>No.</th>}
                <th>Name</th>
                <th>Type of Certificate</th>
                {isPendingClicked && <th>Date Requested</th>}
                {isIssuedClicked && <th>Date Issued</th>}
                {isIssuedClicked && <th>Status</th>}
                {isRejectedClicked && <th>Date Cancelled/Rejected</th>}
                <th></th>
              </tr>
            </thead>

            <tbody className="bg-[#fff]">
              {filteredCertificates.length === 0 ? (
                <tr className="bg-[#fff] cursor-default">
                  <td colSpan={isIssuedClicked ? 6 : 4}>No results found</td>
                </tr>
              ) : (
                currentRows.map((cert) => (
                  <React.Fragment key={cert._id}>
                    <tr
                      onClick={() => handleRowClick(cert._id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f0f0";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "";
                      }}
                    >
                      {expandedRow === cert._id ? (
                        <td colSpan={isIssuedClicked ? 6 : 4}>
                          {/* Additional Information for the resident */}
                          {(cert.typeofcertificate === "Barangay Clearance" ||
                            cert.typeofcertificate ===
                              "Barangay Indigency") && (
                            <>
                              <div className="profile-container">
                                <div className="my-4 text-xs">
                                  <div className="grid grid-cols-[1fr_1fr] border border-[#C1C0C0]">
                                    {/* Name */}
                                    <h1 className="add-info-title min-w-[200px] max-w-[200px]">
                                      Name
                                    </h1>
                                    <p className="add-info-container">
                                      {cert.resID.middlename
                                        ? `${cert.resID.firstname} ${cert.resID.middlename} ${cert.resID.lastname}`
                                        : `${cert.resID.firstname} ${cert.resID.lastname}`}
                                    </p>
                                    {/* Type of Certificate */}
                                    <h1 className="add-info-title min-w-[200px] max-w-[200px]">
                                      Type of Certificate
                                    </h1>
                                    <p className="add-info-container">
                                      {cert.typeofcertificate}
                                    </p>
                                    {/*  Purpose of Request */}
                                    <h1 className="add-info-title min-w-[200px] max-w-[200px]">
                                      Purpose of Request
                                    </h1>
                                    <p className="add-info-container">
                                      {cert.purpose}
                                    </p>
                                    {/*     Date Requested */}
                                    <h1 className="add-info-title min-w-[200px] max-w-[200px]">
                                      Date Requested
                                    </h1>
                                    <p className="add-info-container">
                                      {cert.createdAt.substring(
                                        0,
                                        cert.createdAt.indexOf(" at")
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              {(cert.status === "Rejected" ||
                                cert.status === "Cancelled") && (
                                <>
                                  {/* Remarks */}
                                  <h1 className="text-start text-red-600">
                                    Remarks:
                                  </h1>
                                  <p className="text-start">{cert.remarks}</p>
                                </>
                              )}

                              <div className="btn-container">
                                {cert.status === "Pending" ? (
                                  <>
                                    <button
                                      className="table-actions-container"
                                      type="submit"
                                      onClick={(e) => rejectBtn(e, cert._id)}
                                    >
                                      <FaCircleXmark className="text-btn-color-blue table-actions-icons" />
                                      <label className="text-btn-color-blue table-actions-text">
                                        REJECT
                                      </label>
                                    </button>
                                    <button
                                      className="table-actions-container"
                                      type="submit"
                                      onClick={(e) => certBtn(e, cert._id)}
                                    >
                                      <FaCircleCheck className="text-btn-color-blue table-actions-icons" />
                                      <label className="text-btn-color-blue table-actions-text">
                                        ISSUE
                                      </label>
                                    </button>
                                  </>
                                ) : cert.status === "Not Yet Collected" ? (
                                  <>
                                    <button
                                      className="table-actions-container"
                                      type="submit"
                                      onClick={(e) => notifyBtn(e, cert._id)}
                                    >
                                      <IoIosSend className="text-btn-color-blue table-actions-icons" />
                                      <label className="text-btn-color-blue table-actions-text">
                                        NOTIFY
                                      </label>
                                    </button>
                                    <button
                                      className="table-actions-container"
                                      type="submit"
                                      onClick={(e) =>
                                        certBtn(e, cert._id, true)
                                      }
                                    >
                                      <IoIosPrint className="text-btn-color-blue table-actions-icons" />
                                      <label className="text-btn-color-blue table-actions-text">
                                        PRINT
                                      </label>
                                    </button>

                                    <button
                                      className="table-actions-container"
                                      type="submit"
                                      onClick={(e) => collectedBtn(e, cert._id)}
                                    >
                                      <RiUserReceived2Fill className="text-btn-color-blue table-actions-icons" />
                                      <label className="text-btn-color-blue table-actions-text">
                                        COLLECTED
                                      </label>
                                    </button>
                                  </>
                                ) : null}
                              </div>
                            </>
                          )}
                          {cert.typeofcertificate ===
                            "Barangay Business Clearance" && (
                            <>
                              <div className="profile-container">
                                <div className="my-4 text-xs">
                                  <div className="grid grid-cols-[1fr_1fr] border border-[#C1C0C0]">
                                    {/* Name */}
                                    <h1 className="add-info-title min-w-[200px] max-w-[200px]">
                                      Name
                                    </h1>
                                    <p className="add-info-container">
                                      {cert.resID.middlename
                                        ? `${cert.resID.firstname} ${cert.resID.middlename} ${cert.resID.lastname}`
                                        : `${cert.resID.firstname} ${cert.resID.lastname}`}
                                    </p>
                                    {/* Type of Certificate */}
                                    <h1 className="add-info-title min-w-[200px] max-w-[200px]">
                                      Type of Certificate
                                    </h1>
                                    <p className="add-info-container">
                                      {cert.typeofcertificate}
                                    </p>
                                    {/*  Business Name */}
                                    <h1 className="add-info-title min-w-[200px] max-w-[200px]">
                                      Business Name
                                    </h1>
                                    <p className="add-info-container">
                                      {cert.businessname}
                                    </p>
                                    {/* Line of Business */}
                                    <h1 className="add-info-title min-w-[200px] max-w-[200px]">
                                      Line of Business
                                    </h1>
                                    <p className="add-info-container">
                                      {cert.lineofbusiness}
                                    </p>
                                    {/* Location of Business */}
                                    <h1 className="add-info-title min-w-[200px] max-w-[200px]">
                                      Location of Business
                                    </h1>
                                    <p className="add-info-container">
                                      {cert.locationofbusiness ===
                                      "Resident's Address"
                                        ? `${cert.resID.householdno?.address}`
                                        : `${cert.locationofbusiness}`}
                                    </p>
                                    {/* Date Requested */}
                                    <h1 className="add-info-title min-w-[200px] max-w-[200px]">
                                      Date Requested
                                    </h1>
                                    <p className="add-info-container">
                                      {cert.createdAt.substring(
                                        0,
                                        cert.createdAt.indexOf(" at")
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="btn-container">
                                {cert.status === "Pending" ? (
                                  <>
                                    <button
                                      className="table-actions-container"
                                      type="submit"
                                      onClick={(e) => rejectBtn(e, cert._id)}
                                    >
                                      <FaCircleXmark className="text-btn-color-blue table-actions-icons" />
                                      <label className="text-btn-color-blue table-actions-text">
                                        REJECT
                                      </label>
                                    </button>
                                    <button
                                      className="table-actions-container"
                                      type="submit"
                                      onClick={(e) => certBtn(e, cert._id)}
                                    >
                                      <FaCircleCheck className="text-btn-color-blue table-actions-icons" />
                                      <label className="text-btn-color-blue table-actions-text">
                                        ISSUE
                                      </label>
                                    </button>
                                  </>
                                ) : cert.status === "Not Yet Collected" ? (
                                  <>
                                    <button
                                      className="table-actions-container"
                                      type="submit"
                                      onClick={(e) => notifyBtn(e, cert._id)}
                                    >
                                      <IoIosSend className="text-btn-color-blue table-actions-icons" />
                                      <label className="text-btn-color-blue table-actions-text">
                                        NOTIFY
                                      </label>
                                    </button>

                                    <button
                                      className="table-actions-container"
                                      type="submit"
                                      onClick={(e) =>
                                        certBtn(e, cert._id, true)
                                      }
                                    >
                                      <IoIosPrint className="text-btn-color-blue table-actions-icons" />
                                      <label className="text-btn-color-blue table-actions-text">
                                        PRINT
                                      </label>
                                    </button>

                                    <button
                                      className="table-actions-container"
                                      type="submit"
                                      onClick={(e) => collectedBtn(e, cert._id)}
                                    >
                                      <RiUserReceived2Fill className="text-btn-color-blue table-actions-icons" />
                                      <label className="text-btn-color-blue table-actions-text">
                                        COLLECTED
                                      </label>
                                    </button>
                                  </>
                                ) : null}
                              </div>
                            </>
                          )}
                        </td>
                      ) : (
                        <>
                          {isIssuedClicked && <td>{cert.certno}</td>}
                          <td>
                            {cert.resID.middlename
                              ? `${cert.resID.lastname}, ${cert.resID.middlename} ${cert.resID.firstname}`
                              : `${cert.resID.lastname}, ${cert.resID.firstname}`}
                          </td>
                          <td>{cert.typeofcertificate}</td>
                          {isPendingClicked && (
                            <td>
                              {cert.createdAt.substring(
                                0,
                                cert.createdAt.indexOf(" at")
                              )}
                            </td>
                          )}
                          {(isIssuedClicked || isRejectedClicked) && (
                            <td>
                              {cert.updatedAt.substring(
                                0,
                                cert.updatedAt.indexOf(" at")
                              )}
                            </td>
                          )}
                          {isIssuedClicked && (
                            <td>
                              <span
                                className={`table-actions-text font-semibold table-pagination-btn-full
                      ${
                        cert.status === "Not Yet Collected"
                          ? "bg-red-100 text-red-800"
                          : cert.status === "Collected"
                          ? "bg-green-100 text-green-800"
                          : cert.status === "Deactivated"
                      }`}
                              >
                                {cert.status}
                              </span>
                            </td>
                          )}

                          {/* Dropdown Arrow */}
                          <td className="text-center">
                            <span
                              className={`cursor-pointer transition-transform ${
                                expandedRow === cert.resID ? "rotate-180" : ""
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

        {isRejectClicked && (
          <Reject
            certID={selectedCertID}
            onClose={() => setRejectClicked(false)}
          />
        )}

        <div className="mb-20"></div>
      </main>
    </>
  );
}

export default CertificateRequests;
