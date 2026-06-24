import { useState, useEffect, useContext, useRef } from "react";
import React from "react";
import { InfoContext } from "../context/InfoContext";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useConfirm } from "../context/ConfirmContext";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

//SCREENS
import CreateEmployee from "./CreateEmployee";
import SearchBar from "./SearchBar";
import EditEmployee from "./EditEmployee";
import EmployeeID from "./id/EmployeeID";

//STYLES
import "../Stylesheets/Employees.css";
import "../Stylesheets/CommonStyle.css";

//ICONS
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdArrowDropDown,
} from "react-icons/md";
import Aniban2logo from "../assets/aniban2logo.jpg";
import AppLogo from "../assets/applogo-lightbg.png";
import { IoArchiveSharp } from "react-icons/io5";
import { FaIdCard, FaEdit, FaArchive } from "react-icons/fa";

function Employees({ isCollapsed }) {
  const confirm = useConfirm();
  const { fetchEmployees, employees } = useContext(InfoContext);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isCreateClicked, setCreateClicked] = useState(false);
  const [isEditClicked, setEditClicked] = useState(false);
  const { user } = useContext(AuthContext);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [search, setSearch] = useState("");
  const [isActiveClicked, setActiveClicked] = useState(true);
  const [isArchivedClicked, setArchivedClicked] = useState(false);
  const [sortOption, setSortOption] = useState("All");
  const [loading, setLoading] = useState(false);

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

  const handleRowClick = (residentId) => {
    setExpandedRow(expandedRow === residentId ? null : residentId);
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

  const handleEmployeeID = async (e, empID) => {
    e.stopPropagation();
    const action = await confirm(
      "Do you want to print the current employee ID or generate a new one?",
      "id"
    );

    if (action === "cancel") {
      return;
    }

    const employee = employees.filter((emp) => empID === emp._id);

    if (action === "generate") {
      if (!employee[0].resID.picture && !employee[0].resID.signature) {
        confirm(
          "This employee doesn't have a 2x2 picture and a signature.",
          "failed"
        );
        return;
      } else if (!employee[0].resID.picture) {
        confirm("This employee doesn't have a 2x2 picture.", "failed");
        return;
      } else if (!employee[0].resID.signature) {
        confirm("This employee doesn't have a signature.", "failed");
        return;
      }
      if (loading) return;

      setLoading(true);
      try {
        const res = await api.post(`/generateemployeeID/${empID}`);
        const qrCode = await uploadToFirebase(res.data.qrCode);

        const res2 = await api.put(`/saveemployeeID/${empID}`, {
          idNumber: res.data.idNumber,
          expirationDate: res.data.expirationDate,
          qrCode,
          qrToken: res.data.qrToken,
        });

        const response = await api.get(`/getemployee/${empID}`);
        const response2 = await api.get(`/getcaptain/`);
        EmployeeID({
          empData: response.data,
          captainData: response2.data,
        });
      } catch (error) {
        console.log("Error generating employee ID", error);
      } finally {
        setLoading(false);
      }
    } else if (action === "current") {
      if (loading) return;

      setLoading(true);
      try {
        const response = await api.get(`/getemployee/${empID}`);
        const response2 = await api.get(`/getcaptain/`);
        if (
          !Array.isArray(response.data.employeeID) ||
          response.data.employeeID.length === 0
        ) {
          confirm("This employee has not yet been issued an ID.", "failed");
          return;
        }
        EmployeeID({
          empData: response.data,
          captainData: response2.data,
        });
      } catch (error) {
        console.log("Error generating employee ID", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAdd = () => {
    setCreateClicked(true);
  };

  const archiveBtn = async (e, empID) => {
    e.stopPropagation();
    const isConfirmed = await confirm(
      "Please confirm to proceed with archiving this employee. You can restore this record later if needed.",
      "confirmred"
    );
    if (!isConfirmed) return;

    if (loading) return;

    setLoading(true);

    try {
      await api.put(`/archiveemployee/${empID}`);
      confirm("The employee has been successfully archived.", "success");
    } catch (error) {
      console.log("Error", error);
    } finally {
      setLoading(false);
    }
  };

  const recoverBtn = async (e, empID) => {
    e.stopPropagation();
    const isConfirmed = await confirm(
      "Please confirm to proceed with recovering this employee.",
      "confirmred"
    );
    if (!isConfirmed) return;
    if (loading) return;

    setLoading(true);
    try {
      await api.put(`/recoveremployee/${empID}`);
      confirm("The employee has been successfully recovered.", "success");
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
        confirm("An unexpected error occurred.", "errorialog");
      }
    } finally {
      setLoading(false);
    }
  };

  const editBtn = async (e, empID) => {
    e.stopPropagation();
    setEditClicked(true);
    setSelectedEmployee(empID);
  };

  const handleSearch = (text) => {
    const sanitizedText = text.replace(/[^a-zA-Z0-9\s]/g, "");
    setSearch(sanitizedText);
  };

  useEffect(() => {
    let filtered = employees;
    if (isActiveClicked) {
      filtered = employees.filter((emp) => emp.status === "Active");
    } else if (isArchivedClicked) {
      filtered = employees.filter((emp) => emp.status === "Archived");
    }

    switch (sortOption) {
      case "Captain":
        filtered = filtered.filter(
          (emp) => emp.position?.toLowerCase() === "captain"
        );
        break;
      case "Secretary":
        filtered = filtered.filter(
          (emp) => emp.position?.toLowerCase() === "secretary"
        );
        break;
      case "Clerk":
        filtered = filtered.filter(
          (emp) => emp.position?.toLowerCase() === "clerk"
        );
        break;
      case "Kagawad":
        filtered = filtered.filter(
          (emp) => emp.position?.toLowerCase() === "kagawad"
        );
        break;
      case "Tanod":
        filtered = filtered.filter(
          (emp) => emp.position?.toLowerCase() === "tanod"
        );
        break;
      case "Justice":
        filtered = filtered.filter(
          (emp) => emp.position?.toLowerCase() === "justice"
        );
        break;
      default:
        break;
    }
    if (search) {
      const searchParts = search.toLowerCase().split(" ").filter(Boolean);
      filtered = filtered.filter((emp) => {
        const first = emp.resID.firstname || "";
        const middle = emp.resID.middlename || "";
        const last = emp.resID.lastname || "";

        const fullName = `${first} ${middle} ${last}`.trim().toLowerCase();

        return searchParts.every(
          (part) =>
            fullName.includes(part) ||
            emp.resID.householdno?.address.toLowerCase().includes(part)
        );
      });
    }
    setFilteredEmployees(filtered);
  }, [search, employees, isActiveClicked, isArchivedClicked, sortOption]);

  const handleMenu1 = () => {
    setActiveClicked(true);
    setArchivedClicked(false);
  };
  const handleMenu2 = () => {
    setArchivedClicked(true);
    setActiveClicked(false);
  };

  //For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState("All");
  const totalRows = filteredEmployees.length;
  const totalPages =
    rowsPerPage === "All" ? 1 : Math.ceil(totalRows / rowsPerPage);
  const indexOfLastRow =
    currentPage * (rowsPerPage === "All" ? totalRows : rowsPerPage);
  const indexOfFirstRow =
    indexOfLastRow - (rowsPerPage === "All" ? totalRows : rowsPerPage);
  const currentRows =
    rowsPerPage === "All"
      ? filteredEmployees
      : filteredEmployees.slice(indexOfFirstRow, indexOfLastRow);
  const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  const endRow = Math.min(indexOfLastRow, totalRows);

  const exportCSV = async () => {
    if (filteredEmployees.length === 0) {
      confirm("No records available for export.", "failed");
      return;
    }
    const title = "Barangay Aniban 2 Employees";
    const now = new Date().toLocaleString();
    const headers = ["Name", "Age", "Sex", "Mobile No.", "Address", "Position"];
    const rows = filteredEmployees
      .sort((a, b) => {
        const nameA = `${a.lastname}`.toLowerCase();
        const nameB = `${b.lastname}`.toLowerCase();
        return nameA.localeCompare(nameB);
      })
      .map((emp) => {
        const fullname = emp.resID
          ? emp.resID.middlename
            ? `${emp.resID.lastname} ${emp.resID.middlename} ${emp.resID.firstname}`
            : `${emp.resID.lastname} ${emp.resID.firstname}`
          : "N/A";

        return [
          fullname,
          emp.resID.age,
          emp.resID.sex,
          `"${emp.resID.mobilenumber.replace(/"/g, '""')}"`,
          `"${emp.resID.householdno?.address.replace(/"/g, '""')}"`,
          emp.position,
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
      `Barangay_Aniban_2_Employees_by_${user.name.replace(/ /g, "_")}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setexportDropdown(false);

    const action = "Export";
    const target = "Employees";
    const description = "User exported employee records to CSV.";
    try {
      await api.post("/logexport", { action, target, description });
    } catch (error) {
      console.log("Error in logging export", error);
    }
  };

  const exportPDF = async () => {
    if (filteredEmployees.length === 0) {
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
    doc.text("Employees Reports", pageWidth / 2, 57, { align: "center" });

    const rows = filteredEmployees
      .sort((a, b) => {
        const nameA = `${a.resID.lastname}`.toLowerCase();
        const nameB = `${b.resID.lastname}`.toLowerCase();
        return nameA.localeCompare(nameB);
      })
      .map((emp) => {
        const fullname = emp.resID.middlename
          ? `${emp.resID.lastname} ${emp.resID.middlename} ${emp.resID.firstname}`
          : `${emp.resID.lastname} ${emp.resID.firstname}`;

        return [
          fullname,
          emp.resID.age,
          emp.resID.sex,
          emp.resID.mobilenumber,
          emp.resID.householdno?.address,
          emp.position,
        ];
      });

    autoTable(doc, {
      head: [["Name", "Age", "Sex", "Mobile No.", "Address", "Position"]],
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

    const filename = `Barangay_Aniban_2_Employees_by_${user.name.replace(
      / /g,
      "_"
    )}.pdf`;
    doc.save(filename);
    setexportDropdown(false);

    const action = "Export";
    const target = "Employees";
    const description = "User exported employee records to PDF.";
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
        <div className="header-text">Employees</div>

        <SearchBar handleSearch={handleSearch} searchValue={search} />

        <div className="status-add-container">
          <div className="status-container">
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
                isArchivedClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Archived
            </p>
          </div>
          {isActiveClicked && (
            <div className="export-sort-btn-container">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="flex flex-row gap-4 sm:gap-4">
                  {user.role !== "Technical Admin" && (
                    <>
                      {sortOption === "All" && (
                        <div className="relative" ref={exportRef}>
                          {/* Export Button */}
                          <div
                            className="export-sort-btn"
                            onClick={toggleExportDropdown}
                          >
                            <h1 className="export-sort-btn-text">Export</h1>
                            <div className="export-sort-btn-dropdown-icon ">
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
                      )}
                    </>
                  )}

                  <div className="relative" ref={filterRef}>
                    {/* Filter Button */}
                    <div
                      className="export-sort-btn"
                      onClick={toggleFilterDropdown}
                    >
                      <h1 className="export-sort-btn-text">Filter</h1>
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
                                setSortOption("Captain");
                                setfilterDropdown(false);
                              }}
                            >
                              Captain
                            </li>
                          </div>
                          <div className="navbar-dropdown-item">
                            <li
                              className="export-sort-dropdown-option"
                              onClick={() => {
                                setSortOption("Secretary");
                                setfilterDropdown(false);
                              }}
                            >
                              Secretary
                            </li>
                          </div>
                          <div className="navbar-dropdown-item">
                            <li
                              className="export-sort-dropdown-option"
                              onClick={() => {
                                setSortOption("Clerk");
                                setfilterDropdown(false);
                              }}
                            >
                              Clerk
                            </li>
                          </div>
                          <div className="navbar-dropdown-item">
                            <li
                              className="export-sort-dropdown-option"
                              onClick={() => {
                                setSortOption("Kagawad");
                                setfilterDropdown(false);
                              }}
                            >
                              Kagawad
                            </li>
                          </div>
                          <div className="navbar-dropdown-item">
                            <li
                              className="export-sort-dropdown-option"
                              onClick={() => {
                                setSortOption("Tanod");
                                setfilterDropdown(false);
                              }}
                            >
                              Tanod
                            </li>
                          </div>
                          <div className="navbar-dropdown-item">
                            <li
                              className="export-sort-dropdown-option"
                              onClick={() => {
                                setSortOption("Justice");
                                setfilterDropdown(false);
                              }}
                            >
                              Justice
                            </li>
                          </div>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <button className="add-new-btn" onClick={handleAdd}>
                  <h1 className="add-new-btn-text">Add New Employee</h1>
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
                <th>Position</th>
                <th></th>
              </tr>
            </thead>

            <tbody className="bg-[#fff]">
              {filteredEmployees.length === 0 ? (
                <tr className="bg-white cursor-default">
                  <td colSpan={7}>No results found</td>
                </tr>
              ) : (
                currentRows
                  .sort((a, b) => {
                    const nameA = a.resID?.lastname?.toLowerCase() || "";
                    const nameB = b.resID?.lastname?.toLowerCase() || "";
                    return nameA.localeCompare(nameB);
                  })
                  .map((emp) => (
                    <React.Fragment key={emp._id}>
                      <tr
                        onClick={() => handleRowClick(emp._id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f0f0f0";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "";
                        }}
                      >
                        {expandedRow === emp._id ? (
                          <td colSpan={7}>
                            {/* Additional Information for the resident */}
                            <div className="profile-container">
                              <div className="my-4 text-xs">
                                <div className="add-info-table-container">
                                  <div className="add-info-img-container">
                                    {emp.resID.picture ? (
                                      <img
                                        src={emp.resID.picture}
                                        alt="Profile"
                                        className="profile-img"
                                      />
                                    ) : null}
                                  </div>

                                  {/* Name */}
                                  <div className="add-info-title">Name</div>
                                  <div className="add-info-container">
                                    {emp.resID
                                      ? emp.resID.middlename
                                        ? `${emp.resID.lastname}, ${emp.resID.middlename} ${emp.resID.firstname}`
                                        : `${emp.resID.lastname}, ${emp.resID.firstname}`
                                      : "N/A"}
                                  </div>

                                  {/* Position */}
                                  <div className="add-info-title">Position</div>
                                  <div className="add-info-container">
                                    {emp.position}
                                  </div>

                                  {/* Age */}
                                  <div className="add-info-title">Age</div>
                                  <div className="add-info-container">
                                    {emp.resID?.age}
                                  </div>

                                  <div className="add-info-title">
                                    Chairmanship
                                  </div>

                                  <div className="add-info-container">
                                    {emp.chairmanship || "N/A"}
                                  </div>

                                  {/* Sex */}
                                  <div className="add-info-title">Sex</div>
                                  <div className="add-info-container">
                                    {emp.resID?.sex}
                                  </div>

                                  {/* Emergency Contact */}
                                  <div className="border border-[#C1C0C0] bg-white col-span-2 flex items-center justify-center">
                                    Emergency Contact
                                  </div>

                                  {/* Civil Status */}
                                  <div className="add-info-title">
                                    Civil Status
                                  </div>
                                  <div className="add-info-container">
                                    {emp.resID?.civilstatus}
                                  </div>

                                  {/* Name */}
                                  <div className="add-info-title">Name</div>
                                  <div className="add-info-container">
                                    {emp.resID?.emergencyname}
                                  </div>
                                  {/* Mobile Number */}
                                  <div className="add-info-title">
                                    Mobile Number
                                  </div>
                                  <div className="add-info-container">
                                    {emp.resID?.mobilenumber}
                                  </div>

                                  <div className="add-info-title">
                                    Mobile Number
                                  </div>
                                  <div className="add-info-container">
                                    {emp.resID?.emergencymobilenumber}
                                  </div>

                                  {/* Address */}
                                  <div className="add-info-title">Address</div>
                                  <div className="add-info-container">
                                    {emp.resID?.householdno?.address}
                                  </div>
                                  <div className="add-info-title">Address</div>
                                  <div className="add-info-container min-w-[250px] max-w-[250px]">
                                    {emp.resID?.emergencyaddress}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {emp.status === "Active" ? (
                              <div className="btn-container">
                                {user.empID !== emp._id && (
                                  <button
                                    className="table-actions-container"
                                    type="submit"
                                    onClick={(e) => archiveBtn(e, emp._id)}
                                  >
                                    <FaArchive className="text-[24px] text-btn-color-blue" />
                                    <label className="text-btn-color-blue table-actions-text">
                                      ARCHIVE
                                    </label>
                                  </button>
                                )}
                                {user.role !== "Technical Admin" && (
                                  <button
                                    className="table-actions-container"
                                    type="submit"
                                    onClick={(e) =>
                                      handleEmployeeID(e, emp._id)
                                    }
                                  >
                                    <FaIdCard className="text-[24px] text-btn-color-blue" />
                                    <label className="text-btn-color-blue table-actions-text">
                                      EMPLOYEE ID
                                    </label>
                                  </button>
                                )}
                                {user.empID !== emp._id && (
                                  <button
                                    className="table-actions-container"
                                    type="submit"
                                    onClick={(e) => editBtn(e, emp._id)}
                                  >
                                    <FaEdit className="text-[24px] text-btn-color-blue" />
                                    <label className="text-btn-color-blue table-actions-text">
                                      EDIT
                                    </label>
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="btn-container">
                                <button
                                  className="table-actions-container"
                                  type="submit"
                                  onClick={(e) => recoverBtn(e, emp._id)}
                                >
                                  <FaArchive className="text-[24px] text-btn-color-blue" />
                                  <label className="text-btn-color-blue table-actions-text">
                                    RECOVER
                                  </label>
                                </button>
                              </div>
                            )}
                          </td>
                        ) : (
                          <>
                            <td>
                              {emp.resID
                                ? emp.resID.middlename
                                  ? `${emp.resID.lastname}, ${emp.resID.middlename} ${emp.resID.firstname}`
                                  : `${emp.resID.lastname}, ${emp.resID.firstname}`
                                : "N/A"}
                            </td>
                            <td>{emp.resID?.age}</td>
                            <td>{emp.resID?.sex}</td>
                            <td>{emp.resID?.mobilenumber}</td>
                            <td>{emp.resID?.householdno?.address}</td>
                            <td>{emp.position}</td>

                            {/* Dropdown Arrow */}
                            <td className="text-center">
                              <span
                                className={`cursor-pointer transition-transform ${
                                  expandedRow === emp.resID ? "rotate-180" : ""
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
                <option value="All">All</option>
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

        {isCreateClicked && (
          <CreateEmployee onClose={() => setCreateClicked(false)} />
        )}

        {isEditClicked && (
          <EditEmployee
            onClose={() => setEditClicked(false)}
            empID={selectedEmployee}
          />
        )}

        <div className="mb-20"></div>
      </main>
    </>
  );
}

export default Employees;
