import { useRef, useState, useEffect, useContext } from "react";
import { InfoContext } from "../context/InfoContext";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

//SCREENS
import CreateAccount from "./CreateAccount";
import SearchBar from "./SearchBar";
import EditAccount from "./EditAccount";

//STYLES
import "../Stylesheets/CommonStyle.css";
import "../Stylesheets/Accounts.css";

//ICONS
import { FaEdit } from "react-icons/fa";
import { FaUserXmark, FaUserCheck } from "react-icons/fa6";
import { MdArrowDropDown } from "react-icons/md";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import Aniban2logo from "../assets/aniban2logo.jpg";
import AppLogo from "../assets/applogo-lightbg.png";

function Accounts({ isCollapsed }) {
  const confirm = useConfirm();
  const { fetchUsers, users } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isCreateClicked, setCreateClicked] = useState(false);
  const [isEditClicked, setEditClicked] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUserID, setSelectedUserID] = useState(null);
  const [selectedUsername, setSelectedUsername] = useState(null);
  const [sortOption, setSortOption] = useState("Newest");
  const [loading, setLoading] = useState(false);

  const [isCurrentClicked, setCurrentClicked] = useState(true);
  const [isPendingClicked, setPendingClicked] = useState(false);
  const [isArchivedClicked, setArchivedClicked] = useState(false);

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

  const handleAdd = () => {
    setCreateClicked(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (userID, username) => {
    setEditClicked(true);
    setSelectedUserID(userID);
    setSelectedUsername(username);
  };

  useEffect(() => {
    let otherUsers = [];
    if (isCurrentClicked) {
      otherUsers = users.filter(
        (emp) =>
          emp.status === "Active" ||
          emp.status === "Inactive" ||
          emp.status === "Deactivated"
      );
    } else if (isPendingClicked) {
      otherUsers = users.filter((emp) => emp.status === "Password Not Set");
    } else if (isArchivedClicked) {
      otherUsers = users.filter((emp) => emp.status === "Archived");
    }

    if (user.userID) {
      otherUsers = otherUsers.filter(
        (u) => u._id !== user.userID && u.role !== "Technical Admin"
      );
    } else {
      otherUsers = otherUsers.filter((u) => u.role !== "Technical Admin");
    }
    if (search) {
      otherUsers = otherUsers.filter((user) => {
        const resFirst = user.resID?.firstname || "";
        const resMiddle = user.resID?.middlename || "";
        const resLast = user.resID?.lastname || "";
        const username = user.username || "";

        const empFirst = user.empID?.resID.firstname || "";
        const empMiddle = user.empID?.resID.middlename || "";
        const empLast = user.empID?.resID.lastname || "";

        const resFullName = `${resFirst} ${resMiddle} ${resLast}`.trim();
        const empFullName = `${empFirst} ${empMiddle} ${empLast}`.trim();

        const lowerSearch = search.toLowerCase();

        return (
          resFullName.toLowerCase().includes(lowerSearch) ||
          empFullName.toLowerCase().includes(lowerSearch) ||
          username.toLowerCase().includes(lowerSearch)
        );
      });
    }
    setFilteredUsers(otherUsers);
  }, [search, users, isCurrentClicked, isPendingClicked, isArchivedClicked]);

  const handleSearch = (text) => {
    const sanitizedText = text.replace(/[^a-zA-Z\s.]/g, "");
    const formattedText = sanitizedText
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    setSearch(formattedText);
  };

  const handleDeactivate = async (userID) => {
    const isConfirmed = await confirm(
      "Please confirm to proceed with deactivating this user account. This action can not be undone.",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      await api.put(`/deactivateuser/${userID}`);
      confirm("User has been successfully deactivated.", "success");
    } catch (error) {
      console.log("Error in deactivating user", error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (userID) => {
    const isConfirmed = await confirm(
      "Please confirm to proceed with activating this user account. The account will be restored and the user can log in.",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      await api.put(`/activateuser/${userID}`);
      confirm("User has been successfully activated.", "success");
    } catch (error) {
      console.log("Error while activating user", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenu1 = () => {
    setCurrentClicked(true);
    setPendingClicked(false);
    setArchivedClicked(false);
  };
  const handleMenu2 = () => {
    setPendingClicked(true);
    setCurrentClicked(false);
    setArchivedClicked(false);
  };

  const handleMenu3 = () => {
    setArchivedClicked(true);
    setCurrentClicked(false);
    setPendingClicked(false);
  };

  //For Pagination
  const parseDate = (dateStr) => new Date(dateStr.replace(" at ", " "));

  const sortedFilteredUsers = [...filteredUsers].sort((a, b) => {
    if (sortOption === "Oldest") {
      return parseDate(a.createdAt) - parseDate(b.createdAt);
    } else {
      return parseDate(b.createdAt) - parseDate(a.createdAt);
    }
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const totalRows = filteredUsers.length;
  const totalPages =
    rowsPerPage === "All" ? 1 : Math.ceil(totalRows / rowsPerPage);
  const indexOfLastRow =
    currentPage * (rowsPerPage === "All" ? totalRows : rowsPerPage);
  const indexOfFirstRow =
    indexOfLastRow - (rowsPerPage === "All" ? totalRows : rowsPerPage);
  const currentRows =
    rowsPerPage === "All"
      ? filteredUsers
      : filteredUsers.slice(indexOfFirstRow, indexOfLastRow);
  const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  const endRow = Math.min(indexOfLastRow, totalRows);

  const exportCSV = async () => {
    if (
      filteredUsers.filter((u) => u.role !== "Technical Admin").length === 0
    ) {
      confirm("No records available for export.", "failed");
      return;
    }
    const title = "Barangay Aniban 2 Accounts Reports";
    const now = new Date().toLocaleString();
    const headers = ["No", "Name", "Username", "User Role", "Date Created"];
    const rows = users
      .filter((user) => user.status === "Inactive" || user.status === "Active")
      .filter((user) => user.role !== "Technical Admin")
      .sort(
        (a, b) =>
          new Date(a.createdAt.split(" at")[0]) -
          new Date(b.createdAt.split(" at")[0])
      )
      .map((user, index) => {
        const fullname = user.empID
          ? user.empID.resID.middlename
            ? `${user.empID.resID.lastname} ${user.empID.resID.middlename} ${user.empID.resID.firstname}`
            : `${user.empID.resID.lastname} ${user.empID.resID.firstname}`
          : user.resID
          ? user.resID.middlename
            ? `${user.resID.lastname} ${user.resID.middlename} ${user.resID.firstname}`
            : `${user.resID.lastname} ${user.resID.firstname}`
          : "";
        const createdDate = user.createdAt.substring(
          0,
          user.createdAt.indexOf(" at")
        );

        return [
          index + 1,
          fullname,
          user.username,
          user.role,
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
      `Barangay_Aniban_2_Accounts_by_${
        user?.name ? user.name.replace(/ /g, "_") : "Technical_Admin"
      }.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setexportDropdown(false);

    const action = "Export";
    const target = "User Accounts";
    const description = `User exported accounts to CSV.`;
    try {
      await api.post("/logexport", { action, target, description });
    } catch (error) {
      console.log("Error in logging export", error);
    }
  };

  const exportPDF = async () => {
    if (
      filteredUsers.filter((u) => u.role !== "Technical Admin").length === 0
    ) {
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
    doc.text("Accounts Reports", pageWidth / 2, 57, {
      align: "center",
    });

    // Table
    const rows = users
      .filter((user) => user.status === "Inactive" || user.status === "Active")
      .filter((user) => user.role !== "Technical Admin")
      .sort(
        (a, b) =>
          new Date(a.createdAt.split(" at")[0]) -
          new Date(b.createdAt.split(" at")[0])
      )
      .map((user, index) => {
        const fullname = user.empID
          ? user.empID.resID.middlename
            ? `${user.empID.resID.lastname} ${user.empID.resID.middlename} ${user.empID.resID.firstname}`
            : `${user.empID.resID.lastname} ${user.empID.resID.firstname}`
          : user.resID
          ? user.resID.middlename
            ? `${user.resID.lastname} ${user.resID.middlename} ${user.resID.firstname}`
            : `${user.resID.lastname} ${user.resID.firstname}`
          : "";
        const createdDate = user.createdAt.substring(
          0,
          user.createdAt.indexOf(" at")
        );

        return [
          index + 1,
          fullname,
          user.username,
          user.role,
          `${createdDate.replace(",", "")}`,
        ];
      });

    autoTable(doc, {
      head: [["No.", "Name", "Username", "User Role", "Date Created"]],
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

    const filename = `Barangay_Aniban_2_Accounts_by_${
      user?.name ? user.name.replace(/ /g, "_") : "Technical_Admin"
    }.pdf`;
    doc.save(filename);
    setexportDropdown(false);

    const action = "Export";
    const target = "User Accounts";
    const description = `User exported accounts to PDF.`;
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

        <div className="header-text">User Accounts</div>

        <SearchBar handleSearch={handleSearch} searchValue={search} />

        <div className="status-add-container">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-x-8 mt-5">
            <p
              onClick={handleMenu1}
              className={`status-text ${
                isCurrentClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Current
            </p>
            <p
              onClick={handleMenu2}
              className={`status-text ${
                isPendingClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Pending
            </p>
            <p
              onClick={handleMenu3}
              className={`status-text ${
                isArchivedClicked ? "status-line" : "text-[#808080]"
              }`}
            >
              Archived
            </p>
          </div>
          {isCurrentClicked && (
            <div className="export-sort-btn-container">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="flex flex-row gap-4 sm:gap-4">
                  <div className="relative" ref={exportRef}>
                    {/* Export Button */}
                    <div
                      className="export-sort-btn"
                      onClick={toggleExportDropdown}
                    >
                      <h1 className="export-sort-btn-text">Export</h1>
                      <div className="export-btn-dropdown-icon">
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

                  <div className="relative" ref={filterRef}>
                    {/* Filter Button */}
                    <div
                      className="export-sort-btn"
                      onClick={toggleFilterDropdown}
                    >
                      <h1 className="export-sort-btn-text">Sort</h1>
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
                  <h1 className="add-new-btn-text ">Add New User</h1>
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
                <th>Username</th>
                <th>User Role</th>
                {isCurrentClicked && <th>Status</th>}
                {isArchivedClicked && <th>Date Archived</th>}
                {(isPendingClicked || isCurrentClicked) && (
                  <th>Date Created</th>
                )}
                {(isPendingClicked || isCurrentClicked) && <th>Action</th>}
              </tr>
            </thead>

            <tbody className="bg-[#fff] cursor-default">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={isArchivedClicked ? 4 : 6}>No results found</td>
                </tr>
              ) : (
                currentRows.map((user) => (
                  <tr
                    key={user._id}
                    className="accounts-table-row cursor-default"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f0f0f0";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                    }}
                  >
                    <td>
                      <div className="accounts-name-container">
                        {(user.empID?.resID?.picture ||
                          user.resID?.picture) && (
                          <img
                            width={40}
                            className="accounts-img-container"
                            alt="User"
                            src={
                              user.empID?.resID?.picture || user.resID?.picture
                            }
                          />
                        )}

                        {user.empID
                          ? user.empID.resID.middlename
                            ? `${user.empID.resID.lastname}, ${user.empID.resID.middlename} ${user.empID.resID.firstname}`
                            : `${user.empID.resID.lastname}, ${user.empID.resID.firstname}`
                          : user.resID
                          ? user.resID.middlename
                            ? `${user.resID.lastname} ${user.resID.middlename} ${user.resID.firstname}`
                            : `${user.resID.lastname} ${user.resID.firstname}`
                          : "No name available"}
                      </div>
                    </td>
                    <td>{user.username}</td>
                    <td>
                      {user.role === "Official" ? "Personnel" : user.role}
                    </td>
                    {isCurrentClicked && (
                      <td>
                        <span
                          className={`accounts-status-badge
                      ${
                        user.status === "Inactive"
                          ? "bg-red-100 text-red-800"
                          : user.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : user.status === "Deactivated"
                          ? "bg-yellow-100 text-yellow-800"
                          : ""
                      }`}
                        >
                          {user.status}
                        </span>
                      </td>
                    )}

                    {isArchivedClicked && (
                      <td>
                        {user.updatedAt.substring(
                          0,
                          user.updatedAt.indexOf(" at")
                        )}
                      </td>
                    )}
                    {(isPendingClicked || isCurrentClicked) && (
                      <td>
                        {user.createdAt.substring(
                          0,
                          user.createdAt.indexOf(" at")
                        )}
                      </td>
                    )}

                    {!isArchivedClicked && (
                      <td className="accounts-action-cell">
                        {(user.status === "Inactive" ||
                          user.status === "Active" ||
                          user.status === "Password Not Set") && (
                          <div className="table-actions-container">
                            <button
                              type="button"
                              className="table-actions-btn"
                              onClick={() =>
                                handleEdit(user._id, user.username)
                              }
                            >
                              <FaEdit className="table-actions-icons text-[#06D001]" />
                              <label className="table-actions-text text-[#06D001]">
                                Edit
                              </label>
                            </button>
                          </div>
                        )}

                        {(user.status === "Inactive" ||
                          user.status === "Active") && (
                          <div className="table-actions-container">
                            <button
                              type="button"
                              className="table-actions-btn"
                              onClick={() => handleDeactivate(user._id)}
                            >
                              <FaUserXmark className="table-actions-icons text-btn-color-red" />
                              <label className="table-actions-text text-btn-color-red">
                                Deactivate
                              </label>
                            </button>
                          </div>
                        )}

                        {user.status === "Deactivated" && (
                          <div className="table-actions-container">
                            <button
                              type="button"
                              className="table-actions-btn"
                              onClick={() => handleActivate(user._id)}
                            >
                              <FaUserCheck className="table-actions-icons" />
                              <label className="table-actions-text text-[#06D001]">
                                Activate
                              </label>
                            </button>
                          </div>
                        )}
                      </td>
                    )}
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

        {isCreateClicked && (
          <CreateAccount onClose={() => setCreateClicked(false)} />
        )}
        {isEditClicked && (
          <EditAccount
            onClose={() => setEditClicked(false)}
            userID={selectedUserID}
            userUsername={selectedUsername}
          />
        )}

        <div className="mb-20"></div>
      </main>
    </>
  );
}

export default Accounts;
