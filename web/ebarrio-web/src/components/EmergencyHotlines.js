import { useRef, useState, useEffect, useContext } from "react";
import { InfoContext } from "../context/InfoContext";
import { useConfirm } from "../context/ConfirmContext";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

//SCREENS
import CreateContact from "./CreateContact";
import EditContact from "./EditContact";
import SearchBar from "./SearchBar";

//STYLES
import "../Stylesheets/CommonStyle.css";

//ICONS
import { FaArchive, FaEdit } from "react-icons/fa";
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdArrowDropDown,
} from "react-icons/md";
import Aniban2logo from "../assets/aniban2logo.jpg";
import AppLogo from "../assets/applogo-lightbg.png";

function EmergencyHotlines({ isCollapsed }) {
  const confirm = useConfirm();
  const { fetchEmergencyHotlines, emergencyhotlines } = useContext(InfoContext);
  const [filteredEmergencyHotlines, setFilteredEmergencyHotlines] = useState(
    []
  );
  const [isCreateClicked, setCreateClicked] = useState(false);
  const [isEditClicked, setEditClicked] = useState(false);
  const [selectedEmergencyID, setSelectedEmergencyID] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState({});
  const [search, setSearch] = useState("");
  const { user } = useContext(AuthContext);
  const [isActiveClicked, setActiveClicked] = useState(true);
  const [isArchivedClicked, setArchivedClicked] = useState(false);
  const [loading, setLoading] = useState(false);

  const exportRef = useRef(null);

  const [exportDropdown, setexportDropdown] = useState(false);

  const toggleExportDropdown = () => {
    setexportDropdown(!exportDropdown);
  };

  useEffect(() => {
    fetchEmergencyHotlines();
  }, []);

  const handleAdd = () => {
    setCreateClicked(true);
  };

  const handleArchive = async (emergencyID) => {
    const isConfirmed = await confirm(
      "Please confirm to proceed with archiving this emergency hotline. You can restore it later if needed.",
      "confirmred"
    );
    if (!isConfirmed) {
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      await api.put(`/archiveemergencyhotlines/${emergencyID}`);
      confirm(
        "The emergency hotline has been successfully archived.",
        "success"
      );
    } catch (error) {
      console.log("Error archiving emergency contact", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (emergencyID) => {
    const isConfirmed = await confirm(
      "Please confirm to proceed with recovering this emergency contact. The contact will be restored to the active list.",
      "confirmred"
    );
    if (!isConfirmed) {
      return;
    }
    if (loading) return;

    setLoading(true);

    try {
      await api.put(`/recoveremergencyhotlines/${emergencyID}`);
      confirm(
        "The emergency hotline has been successfully recovered.",
        "success"
      );
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

  const handleEdit = (emergencyID, name, contactnumber) => {
    setEditClicked(true);
    setSelectedEmergencyID(emergencyID);
    setSelectedEmergency({ name: name, contactnumber: contactnumber });
  };

  const handleSearch = (text) => {
    const sanitizedText = text.replace(/[^a-zA-Z\s.]/g, "");
    setSearch(sanitizedText);
  };

  useEffect(() => {
    let filtered = emergencyhotlines;
    if (isActiveClicked) {
      filtered = emergencyhotlines.filter(
        (emergency) => emergency.status === "Active"
      );
    } else if (isArchivedClicked) {
      filtered = emergencyhotlines.filter(
        (emergency) => emergency.status === "Archived"
      );
    }
    if (search) {
      filtered = filtered.filter((emergency) => {
        return emergency.name.toLowerCase().includes(search.toLowerCase());
      });
    }
    setFilteredEmergencyHotlines(filtered);
  }, [search, emergencyhotlines, isActiveClicked, isArchivedClicked]);

  const handleMenu1 = () => {
    setActiveClicked(true);
    setArchivedClicked(false);
  };
  const handleMenu2 = () => {
    setArchivedClicked(true);
    setActiveClicked(false);
  };

  //For Pagination
  //For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalRows = filteredEmergencyHotlines.length;
  const totalPages =
    rowsPerPage === "All" ? 1 : Math.ceil(totalRows / rowsPerPage);
  const indexOfLastRow =
    currentPage * (rowsPerPage === "All" ? totalRows : rowsPerPage);
  const indexOfFirstRow =
    indexOfLastRow - (rowsPerPage === "All" ? totalRows : rowsPerPage);
  const currentRows =
    rowsPerPage === "All"
      ? filteredEmergencyHotlines
      : filteredEmergencyHotlines.slice(indexOfFirstRow, indexOfLastRow);
  const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  const endRow = Math.min(indexOfLastRow, totalRows);

  const exportCSV = async () => {
    const title = "Barangay Aniban 2 Emergency Hotlines";
    const now = new Date().toLocaleString();
    const headers = ["No", "Public Service Facilities", "Contact No."];
    const rows = filteredEmergencyHotlines.map((emergency, index) => {
      return [index + 1, emergency.name, emergency.contactnumber];
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
      `Barangay_Aniban_2_Emergency_Hotlines_by_${user.name.replace(
        / /g,
        "_"
      )}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setexportDropdown(false);

    const action = "Export";
    const target = "Emergency Hotlines";
    const description = `User exported emergency hotlines to CSV.`;
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
    doc.setFontSize(14);
    doc.text("Barangay Aniban 2, Bacoor, Cavite", pageWidth / 2, 45, {
      align: "center",
    });

    //Title
    doc.setFontSize(12);
    doc.text("Emergency Hotlines", pageWidth / 2, 55, {
      align: "center",
    });

    // Table
    const rows = filteredEmergencyHotlines.map((emergency, index) => {
      return [index + 1, emergency.name, emergency.contactnumber];
    });

    autoTable(doc, {
      head: [["No.", "Public Services Facilities", "Contact No."]],
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

    const filename = `Barangay_Aniban_2_Emergency_Hotlines_by_${user.name.replace(
      / /g,
      "_"
    )}.pdf`;
    doc.save(filename);
    setexportDropdown(false);

    const action = "Export";
    const target = "Emergency Hotlines";
    const description = `User exported emergency hotlines to PDF.`;
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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportDropdown]);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
        <div className="text-[30px] font-extrabold font-title text-[#BC0F0F]">
          Emergency Hotlines
        </div>

        <SearchBar handleSearch={handleSearch} searchValue={search} />
        <div className="status-add-container">
          <div className="status-container">
            <p
              onClick={handleMenu1}
              className={`status-text ${
                isActiveClicked
                  ? "border-b-4 border-[#BC0F0F]"
                  : "text-[#808080]"
              }`}
            >
              Active
            </p>
            <p
              onClick={handleMenu2}
              className={`status-text ${
                isArchivedClicked
                  ? "border-b-4 border-[#BC0F0F]"
                  : "text-[#808080]"
              }`}
            >
              Archived
            </p>
          </div>
          {isActiveClicked && (
            <div className="export-sort-btn-container">
              <div className="relative" ref={exportRef}>
                {/* Export Button */}
                <div
                  className="relative flex items-center bg-[#fff] border-btn-color-red h-7 px-2 py-4 cursor-pointer appearance-none border rounded"
                  onClick={toggleExportDropdown}
                >
                  <h1 className="text-sm font-medium mr-2 text-btn-color-red">
                    Export
                  </h1>
                  <div className="pointer-events-none flex text-gray-600">
                    <MdArrowDropDown size={18} color={"#F63131"} />
                  </div>
                </div>

                {exportDropdown && (
                  <div className="export-sort-dropdown-menu w-36">
                    <ul className="w-full">
                      <div className="navbar-dropdown-item">
                        <li
                          className="export-sort-dropdown-option !text-[#BC0F0F]"
                          onClick={exportCSV}
                        >
                          Export as CSV
                        </li>
                      </div>
                      <div className="navbar-dropdown-item">
                        <li
                          className="export-sort-dropdown-option !text-[#BC0F0F]"
                          onClick={exportPDF}
                        >
                          Export as PDF
                        </li>
                      </div>
                    </ul>
                  </div>
                )}
              </div>
              <button
                className="hover:bg-red-600 bg-btn-color-red h-7 px-4 py-4 cursor-pointer flex items-center justify-center rounded border"
                onClick={handleAdd}
              >
                <h1 className="add-new-btn-text">Add New Contact</h1>
              </button>
            </div>
          )}
        </div>
        <div className="line-container">
          <hr className="line" />
        </div>

        <div className="table-container">
          <table>
            <thead className="bg-[#BC0F0F]">
              <tr className="cursor-default">
                <th>Public Service Facilities</th>
                <th>Contact Number</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody className="bg-[#fff] cursor-fault">
              {filteredEmergencyHotlines.length === 0 ? (
                <tr>
                  <td colSpan={3}>No results found</td>
                </tr>
              ) : (
                currentRows.map((emergency) => (
                  <tr
                    key={emergency._id}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f0f0f0";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                    }}
                    className="cursor-default"
                  >
                    <td>{emergency.name}</td>
                    <td>{emergency.contactnumber}</td>
                    <td className="flex justify-center gap-x-8">
                      {emergency.status === "Active" ? (
                        <>
                          <div className="table-actions-container">
                            <button
                              type="button"
                              className="table-actions-btn"
                              onClick={() =>
                                handleEdit(
                                  emergency._id,
                                  emergency.name,
                                  emergency.contactnumber
                                )
                              }
                            >
                              <FaEdit className="text-lg text-[#06D001]" />
                              <label className="table-actions-text text-[#06D001]">
                                Edit
                              </label>
                            </button>
                          </div>

                          <div className="table-actions-container">
                            <button
                              type="button"
                              className="table-actions-btn"
                              onClick={() => handleArchive(emergency._id)}
                            >
                              <FaArchive className="text-lg text-btn-color-red" />
                              <label className="table-actions-text text-btn-color-red">
                                Archive
                              </label>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="table-actions-container">
                          <button
                            type="button"
                            className="table-actions-btn"
                            onClick={() => handleRecover(emergency._id)}
                          >
                            <FaArchive className="text-lg text-btn-color-red" />
                            <label className="table-actions-text text-btn-color-red">
                              Recover
                            </label>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
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
                className="table-pagination-select !border-[#F63131] !text-[#F63131]"
              >
                {[5, 10, 15, 20].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <div className="table-pagination-select-icon">
                <MdArrowDropDown size={18} color={"#F63131"} />
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
                <MdKeyboardArrowLeft color={"#F63131"} className="text-xl" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="table-pagination-btn"
              >
                <MdKeyboardArrowRight color={"#F63131"} className="text-xl" />
              </button>
            </div>
          )}
        </div>

        {isCreateClicked && (
          <CreateContact onClose={() => setCreateClicked(false)} />
        )}
        {isEditClicked && (
          <EditContact
            onClose={() => setEditClicked(false)}
            emergencyID={selectedEmergencyID}
            emergencyDetails={selectedEmergency}
          />
        )}

        <div className="mb-20"></div>
      </main>
    </>
  );
}

export default EmergencyHotlines;
