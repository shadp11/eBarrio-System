import api from "../api";
import { useState, useEffect } from "react";
import AlertResidents from "./AlertResidents";

//STYLES
import "../Stylesheets/CommonStyle.css";
import "../Stylesheets/Announcements.css";
import Lottie from "react-lottie";

//ICONS
import { X } from "lucide-react";
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdArrowDropDown,
} from "react-icons/md";
function RiverSnapshots({ isCollapsed }) {
  const [latest, setLatest] = useState([]);
  const [isRecentClicked, setRecentClicked] = useState(true);
  const [isHistoryClicked, setHistoryClicked] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModal, setModal] = useState(false);
  const [isAlertClicked, setAlertClicked] = useState(false);
  const [filteredSnapshots, setFilteredSnapshots] = useState([]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await api.get("/latestsnapshot");
        setLatest(res.data.latest);
        setHistory(res.data.history);
      } catch (err) {
        console.error("❌ Could not fetch snapshot:", err);
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 600000);

    return () => clearInterval(interval);
  }, []);

  const handleMenu1 = () => {
    setRecentClicked(true);
    setHistoryClicked(false);
  };
  const handleMenu2 = () => {
    setHistoryClicked(true);
    setRecentClicked(false);
  };

  //For Pagination
  // const [currentPage, setCurrentPage] = useState(1);
  // const [rowsPerPage, setRowsPerPage] = useState("All");
  // const totalRows = history.length;
  // const totalPages =
  //   rowsPerPage === "All" ? 1 : Math.ceil(totalRows / rowsPerPage);
  // const indexOfLastRow =
  //   currentPage * (rowsPerPage === "All" ? totalRows : rowsPerPage);
  // const indexOfFirstRow =
  //   indexOfLastRow - (rowsPerPage === "All" ? totalRows : rowsPerPage);
  // const currentRows =
  //   rowsPerPage === "All"
  //     ? history
  //     : history.slice(indexOfFirstRow, indexOfLastRow);
  // const startRow = totalRows === 0 ? 0 : indexOfFirstRow + 1;
  // const endRow = Math.min(indexOfLastRow, totalRows);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: require("../assets/loading.json"),
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="text-[30px] font-bold font-title text-[#BC0F0F]">
          River Snapshots
        </div>
        <div className="status-add-container flex flex-col md:flex-row items-center justify-between md:space-x-4">
          <div className="status-container flex space-x-4 mb-4 md:mb-0">
            <p
              onClick={handleMenu1}
              className={`status-text ${
                isRecentClicked
                  ? "status-line !border-[#BC0F0F]"
                  : "text-[#808080]"
              }`}
            >
              Recent
            </p>
            <p
              onClick={handleMenu2}
              className={`status-text ${
                isHistoryClicked
                  ? "status-line !border-[#BC0F0F]"
                  : "text-[#808080]"
              }`}
            >
              History
            </p>
          </div>

          <button
            className="hover:bg-red-600 bg-btn-color-red h-7 px-4 py-4 cursor-pointer flex items-center justify-center rounded border"
            onClick={() => setAlertClicked(true)}
          >
            <h1 className="add-new-btn-text"> Alert Residents</h1>
          </button>
        </div>
        <div className="line-container my-4">
          <hr className="line" />
        </div>

        {isRecentClicked && (
          <div className="flex items-center justify-center flex-col">
            {latest.url ? (
              <div>
                <div className="mt-8 flex flex-col justify-center items-center bg-[#0E94D3] rounded-md py-4 w-full md:w-[900px]">
                  <p className="subheader-text !text-[28px] text-white mb-4">Zapote River</p>
                  <img
                    src={latest.url}
                    alt="Latest River Snapshot"
                    className="rounded rounded-lg w-full h-[400px] object-cover"
                  />
                  <p className="text-md mt-4 text-white font-medium">
                    CCTV Snapshot as of{" "}
                    {latest.datetime?.split(" at ")[1] || "Unknown Time"}
                  </p>
                </div>

                <p className="text-md text-[#808080] font-medium text-center mt-4">
                  The next update will be after 10 minutes.
                </p>
              </div>
            ) : (
              <div className="w-full h-screen flex justify-center items-center">
                <Lottie options={defaultOptions} height={150} width={300} />
              </div>
            )}
          </div>
        )}

        {isHistoryClicked && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#BC0F0F]">
                  <tr className="cursor-default">
                    <th className="py-2 px-4 text-center">Date</th>
                    <th className="py-2 px-4 text-center">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-[#fff]">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={6}>No results found</td>
                    </tr>
                  ) : (
                    history.map((snap, index) => {
                      const [datePart, timePart] = snap.datetime.split(" at ");
                      return (
                        <tr
                          key={index}
                          onClick={() => {
                            setSelectedImage(snap.url);
                            setModal(true);
                          }}
                          className="border-t transition-colors duration-300 ease-in-out"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f0f0f0";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "";
                          }}
                        >
                          <td className="py-2 px-4">{datePart}</td>
                          <td className="py-2 px-4">{timePart}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {isModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                <div className="bg-white py-10 px-6 rounded-lg shadow-lg max-w-3xl w-full relative">
                  <button
                    className="absolute top-2 right-2 text-gray-600 hover:text-black text-2xl"
                    onClick={() => setModal(false)}
                  >
                    <X className="text-sm hover:text-red-600" />
                  </button>
                  <img
                    src={selectedImage}
                    alt="Selected Snapshot"
                    className="w-full h-auto rounded"
                  />
                </div>
              </div>
            )}

            {/* <div className="table-pagination mt-4">
              <div className="table-pagination-size flex items-center space-x-2">
                <span className="text-sm">Rows per page:</span>
                <div className="relative w-20">
                  <select
                    value={rowsPerPage === "All" ? "All" : rowsPerPage}
                    onChange={(e) => {
                      const value =
                        e.target.value === "All"
                          ? "All"
                          : Number(e.target.value);
                      setRowsPerPage(value);
                      setCurrentPage(1);
                    }}
                    className="table-pagination-select !border-[#F63131] !text-[#F63131]"
                  >
                    <option value="All">All</option>
                    {[5, 10, 15, 20].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <div className="table-pagination-select-icon">
                    <MdArrowDropDown size={18} color={"#BC0F0F"} />
                  </div>
                </div>
              </div>

              <div className="text-sm">
                {startRow}-{endRow} of {totalRows}
              </div>

              {rowsPerPage !== "All" && (
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="table-pagination-btn"
                  >
                    <MdKeyboardArrowLeft
                      color={"#BC0F0F"}
                      className="text-xl"
                    />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="table-pagination-btn"
                  >
                    <MdKeyboardArrowRight
                      color={"#BC0F0F"}
                      className="text-xl"
                    />
                  </button>
                </div>
              )}
            </div> */}
          </>
        )}

        {isAlertClicked && (
          <AlertResidents onClose={() => setAlertClicked(false)} />
        )}

        <div className="mb-20"></div>
      </main>
    </>
  );
}

export default RiverSnapshots;
