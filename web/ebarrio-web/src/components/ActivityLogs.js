import { useContext, useEffect, useState, useRef } from "react";
import { InfoContext } from "../context/InfoContext";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useConfirm } from "../context/ConfirmContext";

//STYLES
import "../Stylesheets/CommonStyle.css";
import "../Stylesheets/ActivityLogs.css";

//ICONS
import { MdArrowDropDown } from "react-icons/md";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import Aniban2logo from "../assets/aniban2logo.jpg";
import AppLogo from "../assets/applogo-lightbg.png";

function ActivityLogs({ isCollapsed }) {
  const { fetchActivityLogs, activitylogs } = useContext(InfoContext);
  const { fetchUsers, users } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const confirm = useConfirm();

  //For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
    fetchActivityLogs();
    fetchUsers();
  }, []);

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setSelectedUser("");
    setFilteredLogs(activitylogs);
    setCurrentPage(1);
  };

  useEffect(() => {
    setFilteredLogs(activitylogs || []);
    setCurrentPage(1);
  }, [activitylogs]);

  const actions = [
    "Login",
    "Logout",
    "Failed Login",
    "Password Set",
    "Password Reset",
    "Create",
    "Cancel",
    "Update",
    "Generate",
    "Archive",
    "Export",
    "Approve",
    "Reject",
    "Settle",
    "Pin",
    "Unpin",
    "Like",
    "Unlike",
    "Notify",
  ];

  const target = [
    "Employees",
    "Residents",
    "Households",
    "Blotter Reports",
    "Document Requests",
    "Court Reservations",
    "Announcements",
    "SOS",
    "River Snapshots",
    "Emergency Hotlines",
    "User Accounts",
    "Activity Logs",
    "Profile",
    "Username",
    "Password",
    "Security Questions",
    "Mobile Number",
    "FAQs",
  ];

  const handleSubmit = () => {
    if (fromDate && toDate && toDate < fromDate) {
      confirm(
        "Invalid date range. Please ensure the 'To' date is not earlier than the 'From' date.",
        "failed"
      );
      return;
    }

    const filtered = activitylogs.filter((log) => {
      const rawDate = log.createdAt.replace(" at ", " ");
      const logDate = new Date(rawDate).toISOString().split("T")[0];

      const isUserMatch = selectedUser
        ? log.userID?.username === selectedUser
        : true;
      const isActionMatch = selectedAction
        ? log.action === selectedAction
        : true;
      const isTargetMatch = selectedTarget
        ? log.target === selectedTarget
        : true;
      const isFromDateMatch = fromDate ? logDate >= fromDate : true;
      const isToDateMatch = toDate ? logDate <= toDate : true;

      return (
        isUserMatch &&
        isActionMatch &&
        isTargetMatch &&
        isFromDateMatch &&
        isToDateMatch
      );
    });

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const getFullName = (userID) => {
    const resID = userID?.empID?.resID || userID?.resID;
    if (!resID) return "No name available";

    const { lastname = "", middlename = "", firstname = "" } = resID;
    return middlename
      ? `${lastname} ${middlename} ${firstname}`
      : `${lastname} ${firstname}`;
  };

  const exportCSV = async () => {
    if (filteredLogs.length === 0) {
      confirm("No records available for export.", "failed");
      return;
    }
    const title = "Activity Logs";
    const now = new Date().toLocaleString();
    const headers = [
      "No",
      "Name",
      "Username",
      "Action",
      "Target",
      "Description",
      "Timestamp",
    ];
    const rows = filteredLogs
      .sort(
        (a, b) =>
          new Date(a.createdAt.split(" at")[0]) -
          new Date(b.createdAt.split(" at")[0])
      )
      .map((log, index) => {
        const fullname = getFullName(log.userID);
        const createdDate = log.createdAt.substring(
          0,
          log.createdAt.indexOf(" at")
        );

        return [
          log.logno,
          fullname,
          log.userID?.username ?? "N/A",
          log.action,
          log.target,
          `${log.description.replace(",", "")}`,
          `${createdDate.replace(",", "")}`,
        ];
      });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        `${title}`,
        `Exported by: ${user?.name ? user.name : "Technical Admin"}`,
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
      `Barangay_Aniban_2_Activity_Logs_by_${
        user?.name ? user.name.replace(/ /g, "_") : "Technical_Admin"
      }.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setexportDropdown(false);

    const action = "Export";
    const target = "Activity Logs";
    const description = `User exported activity logs to CSV.`;
    try {
      await api.post("/logexport", { action, target, description });
    } catch (error) {
      console.log("Error in logging export", error);
    }
  };

  const exportPDF = async () => {
    if (filteredLogs.length === 0) {
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
    doc.text("Activity Logs", pageWidth / 2, 57, {
      align: "center",
    });

    // Table
    const rows = filteredLogs
      .sort(
        (a, b) =>
          new Date(a.createdAt.split(" at")[0]) -
          new Date(b.createdAt.split(" at")[0])
      )
      .map((log, index) => {
        const fullname = getFullName(log.userID);
        const createdDate = log.createdAt.substring(
          0,
          log.createdAt.indexOf(" at")
        );

        return [
          log.logno,
          fullname,
          log.userID?.username ?? "N/A",
          log.action,
          log.target,
          `${log.description.replace(",", "")}`,
          `${createdDate.replace(",", "")}`,
        ];
      });

    autoTable(doc, {
      head: [
        [
          "No.",
          "Name",
          "Username",
          "Action",
          "Target",
          "Description",
          "Timestamp",
        ],
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
        doc.text(
          `Exported by: ${user?.name ? user.name : "Technical Admin"}`,
          logoX + 20,
          logoY + 5
        );
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

    const filename = `Barangay_Aniban_2_Activity_Logs_by_${
      user?.name ? user.name.replace(/ /g, "_") : "Technical_Admin"
    }.pdf`;
    doc.save(filename);
    setexportDropdown(false);

    const action = "Export";
    const target = "Activity Logs";
    const description = `User exported activity logs to PDF.`;
    try {
      await api.post("/logexport", { action, target, description });
    } catch (error) {
      console.log("Error in logging export", error);
    }
  };

  const displayedLogs = filteredLogs;

  const totalRows = displayedLogs.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const sortedLogs = [...displayedLogs].sort((a, b) => b.logno - a.logno);
  const currentRows = sortedLogs.slice(indexOfFirstRow, indexOfLastRow);

  const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  const endRow = Math.min(indexOfLastRow, totalRows);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Activity Logs</div>

        <div className="logs-filter-container">
          <div className="logs-filter-controls flex-wrap">
            <div className="logs-filter-item">
              <label className="logs-filter-label">User</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="logs-filter-select"
              >
                <option value="">All</option>
                {users
                  .filter((u) => u.role !== "Technical Admin")
                  .sort((a, b) => a.username.localeCompare(b.username))
                  .map((user, index) => (
                    <option key={index} value={user.username}>
                      {user.username}
                    </option>
                  ))}
              </select>
            </div>
            <div className="logs-filter-item">
              <label className="logs-filter-label">Action</label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="logs-filter-select"
              >
                <option value="">All</option>
                {actions.map((a, index) => (
                  <option key={index} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div className="logs-filter-item">
              <label className="logs-filter-label">Target</label>
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="logs-filter-select"
              >
                <option value="">All</option>
                {target.map((a, index) => (
                  <option key={index} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div className="logs-filter-item">
              <label className="logs-filter-label">From</label>
              <input
                type="date"
                value={fromDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setFromDate(e.target.value)}
                className="logs-filter-select"
              />
            </div>

            <div className="logs-filter-item">
              <label className="logs-filter-label">To</label>
              <input
                type="date"
                value={toDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setToDate(e.target.value)}
                className="logs-filter-select"
              />
            </div>
          </div>

          <div className="flex justify-between items-center w-full mt-4">
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="bg-btn-color-gray hover:bg-gray-400 logs-reset-submit-btn"
              >
                Reset
              </button>

              <button
                onClick={handleSubmit}
                className="bg-[#0E94D3] hover:bg-[#0A7A9D] logs-reset-submit-btn"
              >
                Submit
              </button>
            </div>

            <div className="relative" ref={exportRef}>
              <div className="export-sort-btn" onClick={toggleExportDropdown}>
                <h1 className="export-sort-btn-text">Export</h1>
                <div className="export-sort-btn-dropdown-icon">
                  <MdArrowDropDown size={18} color={"#0E94D3"} />
                </div>
              </div>

              {exportDropdown && (
                <div className="export-sort-dropdown-menu w-36 absolute right-0">
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
          </div>
        </div>

        <div className="line-container">
          <hr className="line" />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr className="cursor-default">
                <th>No.</th>
                <th>User</th>
                <th>Action</th>
                <th>Target</th>
                <th>Description</th>
                <th>Timestamp</th>
              </tr>
            </thead>

            <tbody className="bg-[#fff]">
              {displayedLogs.length === 0 ? (
                <tr className="cursor-default">
                  <td colSpan={6}>No results found</td>
                </tr>
              ) : (
                currentRows.map((log) => (
                  <tr
                    key={log._id}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f0f0f0";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                    }}
                    className="cursor-default"
                  >
                    <td>{log.logno}</td>
                    <td>
                      <div className="logs-user-cell">
                        {(log.userID?.empID?.resID?.picture ||
                          log.userID?.resID?.picture) && (
                          <img
                            width={40}
                            className="logs-user-img"
                            alt="User"
                            src={
                              log.userID?.empID?.resID?.picture ||
                              log.userID?.resID?.picture
                            }
                          />
                        )}

                        <div className="flex flex-col">
                          <div>
                            {log.userID?.empID?.resID
                              ? log.userID.empID.resID.middlename
                                ? `${log.userID.empID.resID.lastname} ${log.userID.empID.resID.middlename} ${log.userID.empID.resID.firstname}`
                                : `${log.userID.empID.resID.lastname} ${log.userID.empID.resID.firstname}`
                              : log.userID?.resID
                              ? log.userID.resID.middlename
                                ? `${log.userID.resID.lastname} ${log.userID.resID.middlename} ${log.userID.resID.firstname}`
                                : `${log.userID.resID.lastname} ${log.userID.resID.firstname}`
                              : "No name available"}
                          </div>
                          <div style={{ color: "gray" }}>
                            {log.userID?.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{log.action}</td>
                    <td>{log.target}</td>
                    <td>{log.description}</td>
                    <td>{log.createdAt}</td>
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
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
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

          <div className="flex items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded"
            >
              <MdKeyboardArrowLeft color={"#0E94D3"} className="text-xl" />
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded"
            >
              <MdKeyboardArrowRight color={"#0E94D3"} className="text-xl" />
            </button>
          </div>
        </div>

        <div className="mb-20"></div>
      </main>
    </>
  );
}

export default ActivityLogs;
