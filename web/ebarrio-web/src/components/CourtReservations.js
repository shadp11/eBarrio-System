import { useRef, useState, useEffect, useContext } from "react";
import { InfoContext } from "../context/InfoContext";
import { useLocation } from "react-router-dom";
import { useConfirm } from "../context/ConfirmContext";
import api from "../api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

//SCREENS
import SearchBar from "./SearchBar";
import CreateReservation from "./CreateReservation";
import CourtReject from "./CourtReject";

//STYLES
import "../Stylesheets/Residents.css";
import "../Stylesheets/CommonStyle.css";

//ICONS
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6";
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdArrowDropDown,
} from "react-icons/md";
import { AuthContext } from "../context/AuthContext";
import Aniban2logo from "../assets/aniban2logo.jpg";
import AppLogo from "../assets/applogo-lightbg.png";

function CourtReservations({ isCollapsed }) {
  const confirm = useConfirm();
  const location = useLocation();
  const { cancelled } = location.state || {};
  const { user } = useContext(AuthContext);
  const { fetchReservations, courtreservations } = useContext(InfoContext);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [isCreateClicked, setCreateClicked] = useState(false);
  const [search, setSearch] = useState("");
  const [isRejectClicked, setRejectClicked] = useState(false);
  const [selectedReservationID, setSelectedReservationID] = useState(null);
  const [sortOption, setSortOption] = useState("Newest");
  const [loading, setLoading] = useState(false);

  const [isPendingClicked, setPendingClicked] = useState(true);
  const [isApprovedClicked, setApprovedClicked] = useState(false);
  const [isRejectedClicked, setRejectedClicked] = useState(false);

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

  useEffect(() => {
    if (cancelled) {
      setRejectedClicked(true);
      setPendingClicked(false);
      setApprovedClicked(false);
    }
    console.log(cancelled);
  }, [cancelled]);

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleSearch = (text) => {
    const sanitizedText = text.replace(/[^a-zA-Z\s.]/g, "");
    setSearch(sanitizedText);
  };

  useEffect(() => {
    let filtered = courtreservations;

    if (isPendingClicked) {
      filtered = courtreservations.filter(
        (court) => court.status === "Pending"
      );
    } else if (isApprovedClicked) {
      filtered = courtreservations.filter(
        (court) => court.status === "Approved"
      );
    } else if (isRejectedClicked) {
      filtered = courtreservations.filter(
        (court) => court.status === "Rejected" || court.status === "Cancelled"
      );
    }
    if (search) {
      filtered = filtered.filter((court) => {
        const first = court.resID.firstname || "";
        const middle = court.resID.middlename || "";
        const last = court.resID.lastname || "";

        const fullName = `${first} ${middle} ${last}`.trim().toLowerCase();

        return fullName.includes(search.toLowerCase());
      });
    }
    setFilteredReservations(filtered);
  }, [
    search,
    courtreservations,
    isPendingClicked,
    isApprovedClicked,
    isRejectedClicked,
  ]);

  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return "Invalid date";

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "Invalid date";

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    const timeOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    const startFormatted = new Intl.DateTimeFormat("en-US", options).format(
      start
    );
    const endFormatted = new Intl.DateTimeFormat("en-US", timeOptions).format(
      end
    );

    return `${startFormatted} - ${endFormatted}`;
  };

  const rejectBtn = (e, reservationID) => {
    e.stopPropagation();
    setRejectClicked(true);
    setSelectedReservationID(reservationID);
  };

  const handleAdd = () => {
    setCreateClicked(true);
  };

  const approveBtn = async (e, reservationID) => {
    e.stopPropagation();
    const isConfirmed = await confirm(
      "Please confirm to proceed with approving this court reservation. This action cannot be undone.",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      await api.put(`/approvereservation/${reservationID}`);
      confirm(
        "The court reservation has been successfully approved.",
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
  };

  const handleMenu1 = () => {
    setPendingClicked(true);
    setApprovedClicked(false);
    setRejectedClicked(false);
  };
  const handleMenu2 = () => {
    setApprovedClicked(true);
    setPendingClicked(false);
    setRejectedClicked(false);
  };
  const handleMenu3 = () => {
    setRejectedClicked(true);
    setPendingClicked(false);
    setApprovedClicked(false);
  };

  //For Pagination
  const parseDate = (dateStr) => new Date(dateStr.replace(" at ", " "));

  const sortedFilteredCourt = [...filteredReservations].sort((a, b) => {
    if (sortOption === "Oldest") {
      return parseDate(a.updatedAt) - parseDate(b.updatedAt);
    } else {
      return parseDate(b.updatedAt) - parseDate(a.updatedAt);
    }
  });
  //For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalRows = sortedFilteredCourt.length;
  const totalPages =
    rowsPerPage === "All" ? 1 : Math.ceil(totalRows / rowsPerPage);
  const indexOfLastRow =
    currentPage * (rowsPerPage === "All" ? totalRows : rowsPerPage);
  const indexOfFirstRow =
    indexOfLastRow - (rowsPerPage === "All" ? totalRows : rowsPerPage);
  const currentRows =
    rowsPerPage === "All"
      ? sortedFilteredCourt
      : sortedFilteredCourt.slice(indexOfFirstRow, indexOfLastRow);
  const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  const endRow = Math.min(indexOfLastRow, totalRows);

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

  const exportCSV = async () => {
    const title = "Barangay Aniban 2 Court Reservations Reports";
    const now = new Date().toLocaleString();
    const headers = ["No.", "Name", "Date & Time"];
    const rows = filteredReservations
      .sort(
        (a, b) =>
          new Date(a.updatedAt.split(" at")[0]) -
          new Date(b.updatedAt.split(" at")[0])
      )
      .map((court) => {
        const fullname = court.resID.middlename
          ? `${court.resID.lastname} ${court.resID.middlename} ${court.resID.firstname}`
          : `${court.resID.lastname} ${court.resID.firstname}`;

        const datetime =
          court.times && Object.entries(court.times).length > 0
            ? Object.entries(court.times)
                .map(
                  ([dateKey, time]) =>
                    `${formatDateRange(time.starttime, time.endtime)}`
                )
                .join("\n")
            : "N/A";

        return [court.reservationno, fullname, `"${datetime}"`];
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
      `Barangay_Aniban_2_Court_Reservations_by_${user.name.replace(
        / /g,
        "_"
      )}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setexportDropdown(false);

    const action = "Export";
    const target = "Court Reservations";
    const description = `User exported court reservations to CSV.`;
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
    doc.text("Court Reservations Reports", pageWidth / 2, 57, {
      align: "center",
    });

    // Table
    const rows = filteredReservations
      .sort(
        (a, b) =>
          new Date(a.updatedAt.split(" at")[0]) -
          new Date(b.updatedAt.split(" at")[0])
      )
      .map((court) => {
        const fullname = court.resID.middlename
          ? `${court.resID.lastname} ${court.resID.middlename} ${court.resID.firstname}`
          : `${court.resID.lastname} ${court.resID.firstname}`;

        const datetime =
          court.times && Object.entries(court.times).length > 0
            ? Object.entries(court.times)
                .map(
                  ([dateKey, time]) =>
                    `${formatDateRange(time.starttime, time.endtime)}`
                )
                .join("\n")
            : "N/A";

        return [court.reservationno, fullname, datetime];
      });

    autoTable(doc, {
      head: [["No.", "Name", "Date & Time"]],
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
        doc.text(pageText, pageWidth - 20, pageHeight - 10);
      },
    });

    const filename = `Barangay_Aniban_2_Court_Reservations_by_${user.name.replace(
      / /g,
      "_"
    )}.pdf`;
    doc.save(filename);
    setexportDropdown(false);

    const action = "Export";
    const target = "Court Reservations";
    const description = `User exported court reservations to PDF.`;
    try {
      await api.post("/logexport", { action, target, description });
    } catch (error) {
      console.log("Error in logging export", error);
    }
  };

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
        <div className="header-text">Court Reservations</div>

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
              {courtreservations.some(
                (court) => court.status === "Pending"
              ) && (
                <span className="ml-1 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
              )}
            </p>
            <p
              onClick={handleMenu2}
              className={`status-text ${
                isApprovedClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Approved
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
          <div className="flex flex-row gap-x-2 mt-4">
            {isApprovedClicked && (
              <div className="relative" ref={exportRef}>
                {/* Export Button */}
                <div className="export-sort-btn" onClick={toggleExportDropdown}>
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

            <button className="add-new-btn" onClick={handleAdd}>
              <h1 className="add-new-btn-text">Add New Reservation</h1>
            </button>
          </div>
        </div>

        <div className="line-container">
          <hr className="line" />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr className="cursor-default">
                {isApprovedClicked && <th>No.</th>}
                <th>Name</th>
                <th>Purpose</th>
                <th>Date & Time</th>
                {isPendingClicked && <th>Date Requested</th>}
                {isRejectedClicked && <th>Remarks</th>}
                {isRejectedClicked && <th>Date Cancelled/Rejected</th>}
                {isApprovedClicked && <th>Date Approved</th>}
                {isPendingClicked && <th>Action</th>}
              </tr>
            </thead>

            <tbody className="bg-[#fff]">
              {filteredReservations.length === 0 ? (
                <tr className="bg-white cursor-default">
                  <td colSpan={5} className="text-center p-2">
                    No results found
                  </td>
                </tr>
              ) : (
                currentRows.map((court) => {
                  return (
                    <tr key={court._id} className="cursor-default">
                      {isApprovedClicked && (
                        <td className="p-2">{court.reservationno}</td>
                      )}
                      <td className="p-2">
                        {court.resID.middlename
                          ? `${court.resID.lastname}, ${court.resID.middlename} ${court.resID.firstname}`
                          : `${court.resID.lastname}, ${court.resID.firstname}`}
                      </td>
                      <td className="p-2">{court.purpose}</td>
                      <td>
                        {court.times &&
                        Object.entries(court.times).length > 0 ? (
                          Object.entries(court.times).map(
                            ([dateKey, time], index) => (
                              <div key={index}>
                                {formatDateRange(time.starttime, time.endtime)}
                              </div>
                            )
                          )
                        ) : (
                          <div>No times available</div>
                        )}
                      </td>
                      {isPendingClicked && (
                        <td>
                          {court.createdAt.substring(
                            0,
                            court.createdAt.indexOf(" at")
                          )}
                        </td>
                      )}
                      {isApprovedClicked && (
                        <td>
                          {court.updatedAt.substring(
                            0,
                            court.updatedAt.indexOf(" at")
                          )}
                        </td>
                      )}

                      {isPendingClicked && court.status == "Pending" && (
                        <td className="flex justify-center gap-x-8">
                          <>
                            <div className="table-actions-container">
                              <button
                                type="button"
                                onClick={(e) => approveBtn(e, court._id)}
                                className="table-actions-btn"
                              >
                                <FaCircleCheck className="text-lg text-[#06D001]" />
                                <label className="table-actions-text text-[#06D001]">
                                  Approve
                                </label>
                              </button>
                            </div>

                            <div className="table-actions-container">
                              <button
                                type="button"
                                onClick={(e) => rejectBtn(e, court._id)}
                                className="table-actions-btn"
                              >
                                <FaCircleXmark className="text-lg text-btn-color-red" />
                                <label className="table-actions-text text-btn-color-red">
                                  Reject
                                </label>
                              </button>
                            </div>
                          </>
                        </td>
                      )}
                      {isRejectedClicked &&
                        (court.status == "Rejected" ||
                          court.status == "Cancelled") && (
                          <td>{court.remarks}</td>
                        )}
                      {isRejectedClicked && (
                        <td>
                          {court.updatedAt.substring(
                            0,
                            court.updatedAt.indexOf(" at")
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
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
        {isCreateClicked && (
          <CreateReservation onClose={() => setCreateClicked(false)} />
        )}
        {isRejectClicked && (
          <CourtReject
            reservationID={selectedReservationID}
            onClose={() => setRejectClicked(false)}
          />
        )}

        <div className="mb-20"></div>
      </main>
    </>
  );
}

export default CourtReservations;
