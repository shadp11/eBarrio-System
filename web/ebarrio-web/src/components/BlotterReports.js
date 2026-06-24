import { useState, useEffect, useContext, useRef } from "react";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AuthContext } from "../context/AuthContext";
import api from "../api";

//SCREENS
import SearchBar from "./SearchBar";
import ViewBlotter from "./ViewBlotter";

//STYLES
import "../Stylesheets/Residents.css";
import "../Stylesheets/CommonStyle.css";

//ICONS
import { MdArrowDropDown } from "react-icons/md";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import Aniban2logo from "../assets/aniban2logo.jpg";
import AppLogo from "../assets/applogo-lightbg.png";

function BlotterReports({ isCollapsed }) {
  const navigation = useNavigate();
  const { fetchBlotterReports, blotterreports } = useContext(InfoContext);
  const [filteredBlotterReports, setFilteredBlotterReports] = useState([]);
  const [isBlotterClicked, setBlotterClicked] = useState(false);
  const [selectedBlotter, setSelectedBlotter] = useState(null);
  const { user } = useContext(AuthContext);
  const [isPendingClicked, setPendingClicked] = useState(true);
  const [isScheduledClicked, setScheduledClicked] = useState(false);
  const [isSettledClicked, setSettledClicked] = useState(false);
  const [isRejectedClicked, setRejectedClicked] = useState(false);
  const [sortOption, setSortOption] = useState("Newest");

  const [search, setSearch] = useState("");
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
    fetchBlotterReports();
  }, []);

  const handleAdd = () => {
    navigation("/create-blotter");
  };

  const handleSearch = (text) => {
    const sanitizedText = text.replace(/[^a-zA-Z\s.]/g, "");
    setSearch(sanitizedText);
  };

  const handleRowClick = (blotterID) => {
    setBlotterClicked(true);
    setSelectedBlotter(blotterID);
  };

  useEffect(() => {
    let filtered = blotterreports;

    if (isPendingClicked) {
      filtered = blotterreports.filter((blot) => blot.status === "Pending");
    } else if (isScheduledClicked) {
      filtered = blotterreports.filter((blot) => blot.status === "Scheduled");
    } else if (isSettledClicked) {
      filtered = blotterreports.filter((blot) => blot.status === "Settled");
    } else if (isRejectedClicked) {
      filtered = blotterreports.filter((blot) => blot.status === "Rejected");
    }

    if (search) {
      filtered = filtered.filter((blot) => {
        const first = blot.complainantID?.firstname || "";
        const middle = blot.complainantID?.middlename || "";
        const last = blot.complainantID?.lastname || "";
        const complainantname = blot.complainantname || "";

        const fullName =
          first || middle || last
            ? `${first} ${middle} ${last}`.trim()
            : complainantname;

        return fullName.toLowerCase().includes(search.toLowerCase());
      });
    }
    setFilteredBlotterReports(filtered);
  }, [
    search,
    blotterreports,
    isPendingClicked,
    isScheduledClicked,
    isSettledClicked,
    isRejectedClicked,
  ]);

  const handleMenu1 = () => {
    setPendingClicked(true);
    setScheduledClicked(false);
    setSettledClicked(false);
    setRejectedClicked(false);
  };
  const handleMenu2 = () => {
    setScheduledClicked(true);
    setPendingClicked(false);
    setSettledClicked(false);
    setRejectedClicked(false);
  };
  const handleMenu3 = () => {
    setSettledClicked(true);
    setScheduledClicked(false);
    setPendingClicked(false);
    setRejectedClicked(false);
  };

  const handleMenu4 = () => {
    setRejectedClicked(true);
    setSettledClicked(false);
    setScheduledClicked(false);
    setPendingClicked(false);
  };

  //For Pagination
  const parseDate = (dateStr) => new Date(dateStr.replace(" at ", " "));

  const sortedFilteredReports = [...filteredBlotterReports].sort((a, b) => {
    if (sortOption === "Oldest") {
      return parseDate(a.updatedAt) - parseDate(b.updatedAt);
    } else {
      return parseDate(b.updatedAt) - parseDate(a.updatedAt);
    }
  });

  //For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalRows = sortedFilteredReports.length;
  const totalPages =
    rowsPerPage === "All" ? 1 : Math.ceil(totalRows / rowsPerPage);
  const indexOfLastRow =
    currentPage * (rowsPerPage === "All" ? totalRows : rowsPerPage);
  const indexOfFirstRow =
    indexOfLastRow - (rowsPerPage === "All" ? totalRows : rowsPerPage);
  const currentRows =
    rowsPerPage === "All"
      ? sortedFilteredReports
      : sortedFilteredReports.slice(indexOfFirstRow, indexOfLastRow);
  const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  const endRow = Math.min(indexOfLastRow, totalRows);

  const exportCSV = async () => {
    const title = "Barangay Aniban 2 Blotter Reports";
    const now = new Date().toLocaleString();
    const headers = [
      "No.",
      "Complainant",
      "Subject of the Complaint",
      "Type of Incident",
      "Witness",
      "Date Settled",
    ];
    const rows = filteredBlotterReports
      .sort(
        (a, b) =>
          new Date(a.updatedAt.split(" at")[0]) -
          new Date(b.updatedAt.split(" at")[0])
      )
      .map((blot) => {
        const complainant = blot.complainantID
          ? `${blot.complainantID.lastname} ${blot.complainantID.firstname} ${
              blot.complainantID.middlename || ""
            }`.trim()
          : blot.complainantname;
        const subject = blot.subjectID
          ? `${blot.subjectID.lastname} ${blot.subjectID.firstname} ${
              blot.subjectID.middlename || ""
            }`.trim()
          : blot.subjectname;
        const witness = blot.witnessID
          ? `${blot.witnessID.lastname} ${blot.witnessID.firstname} ${
              blot.witnessID.middlename || ""
            }`.trim()
          : blot.witnessname;
        const settledDate = blot.updatedAt.split(" at ")[0];

        return [
          blot.blotterno,
          complainant,
          subject,
          blot.typeofthecomplaint,
          witness,
          `${settledDate.replace(",", "")}`,
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
      `Barangay_Aniban_2_Blotter_Reports_by_${user.name.replace(/ /g, "_")}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setexportDropdown(false);

    const action = "Export";
    const target = "Blotter Reports";
    const description = `User exported settled blotter reports to CSV.`;
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
    doc.text("Blotter Reports", pageWidth / 2, 57, {
      align: "center",
    });

    // Table
    const rows = filteredBlotterReports
      .sort(
        (a, b) =>
          new Date(a.updatedAt.split(" at")[0]) -
          new Date(b.updatedAt.split(" at")[0])
      )
      .map((blot) => {
        const complainant = blot.complainantID
          ? `${blot.complainantID.lastname} ${blot.complainantID.firstname} ${
              blot.complainantID.middlename || ""
            }`.trim()
          : blot.complainantname;
        const subject = blot.subjectID
          ? `${blot.subjectID.lastname} ${blot.subjectID.firstname} ${
              blot.subjectID.middlename || ""
            }`.trim()
          : blot.subjectname;
        const witness = blot.witnessID
          ? `${blot.witnessID.lastname} ${blot.witnessID.firstname} ${
              blot.witnessID.middlename || ""
            }`.trim()
          : blot.witnessname;
        const settledDate = blot.updatedAt.split(" at ")[0];

        return [
          blot.blotterno,
          complainant,
          subject,
          blot.typeofthecomplaint,
          witness,
          `${settledDate.replace(",", "")}`,
        ];
      });

    autoTable(doc, {
      head: [
        [
          "No.",
          "Complainant",
          "Subject of the Complaint",
          "Type of the Complaint",
          "Witness",
          "Date Settled",
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

    const filename = `Barangay_Aniban_2_Blotter_Reports_by_${user.name.replace(
      / /g,
      "_"
    )}.pdf`;
    doc.save(filename);
    setexportDropdown(false);

    const action = "Export";
    const target = "Blotter Reports";
    const description = `User exported settled blotter reports to PDF.`;
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
        <div className="header-text">Blotter Reports</div>

        <SearchBar searchValue={search} handleSearch={handleSearch} />

        <div className="status-add-container">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <p
              onClick={handleMenu1}
              className={`status-text ${
                isPendingClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Pending
              {blotterreports.some(
                (blotter) => blotter.status === "Pending"
              ) && (
                <span className="ml-1 inline-block w-2 h-2 bg-red-600 rounded-full"></span>
              )}
            </p>
            <p
              onClick={handleMenu2}
              className={`status-text ${
                isScheduledClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Scheduled
            </p>
            <p
              onClick={handleMenu3}
              className={`status-text ${
                isSettledClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Settled
            </p>
            <p
              onClick={handleMenu4}
              className={`status-text ${
                isRejectedClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Rejected
            </p>
          </div>

          <div className="export-sort-btn-container">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="flex flex-row gap-4 sm:gap-4">
                {isSettledClicked && (
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
                      <div className="export-sort-dropdown-menu">
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

              <button className="add-new-btn" onClick={handleAdd}>
                <h1 className="add-new-btn-text">Add New Blotter</h1>
              </button>
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
                {isSettledClicked && <th>No.</th>}
                <th>Complainant</th>
                <th>Subject of the Complaint</th>
                <th>Type of the Incident</th>
                {isPendingClicked && <th>Date Submitted</th>}
                {isScheduledClicked && <th>Date Scheduled</th>}
                {isSettledClicked && <th>Witness</th>}
                {isSettledClicked && <th>Date Settled</th>}
                {isRejectedClicked && <th>Date Rejected</th>}
              </tr>
            </thead>

            <tbody className="bg-[#fff]">
              {filteredBlotterReports.length === 0 ? (
                <tr className="bg-white cursor-default">
                  <td
                    colSpan={isSettledClicked ? 6 : 4}
                    className="text-center p-2"
                  >
                    No results found
                  </td>
                </tr>
              ) : (
                currentRows.map((blot) => {
                  return (
                    <tr
                      key={blot._id}
                      onClick={() => handleRowClick(blot._id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f0f0";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "";
                      }}
                    >
                      {isSettledClicked && (
                        <td className="p-2">{blot.blotterno}</td>
                      )}

                      <td className="p-2">
                        {blot.complainantID
                          ? `${blot.complainantID.lastname}, ${
                              blot.complainantID.firstname
                            } ${blot.complainantID.middlename || ""}`.trim()
                          : blot.complainantname}
                      </td>
                      <td className="p-2">
                        {blot.subjectID
                          ? `${blot.subjectID.lastname}, ${
                              blot.subjectID.firstname
                            } ${blot.subjectID.middlename || ""}`.trim()
                          : blot.subjectname}
                      </td>
                      <td className="p-2">{blot.typeofthecomplaint}</td>
                      {isPendingClicked && (
                        <td className="p-2">
                          {blot.createdAt.split(" at ")[0]}
                        </td>
                      )}
                      {isScheduledClicked && (
                        <td className="p-2">
                          {blot.starttime?.split(" at ")[0]},{" "}
                          {blot.starttime?.split(" at ")[1]} -{" "}
                          {blot.endtime?.split(" at ")[1]}
                        </td>
                      )}
                      {isSettledClicked && (
                        <td className="p-2">
                          {blot.witnessID
                            ? `${blot.witnessID.lastname} ${
                                blot.witnessID.firstname
                              } ${blot.witnessID.middlename || ""}`.trim()
                            : blot.witnessname}
                        </td>
                      )}
                      {isSettledClicked && (
                        <td className="p-2">
                          {blot.updatedAt.split(" at ")[0]}
                        </td>
                      )}
                      {isRejectedClicked && (
                        <td className="p-2">
                          {blot.updatedAt.split(" at ")[0]}
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
        {isBlotterClicked && (
          <ViewBlotter
            onClose={() => setBlotterClicked(false)}
            blotterID={selectedBlotter}
          />
        )}

        <div className="mb-20"></div>
      </main>
    </>
  );
}

export default BlotterReports;
