import { useContext, useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  OverlayView,
} from "@react-google-maps/api";
import { InfoContext } from "../context/InfoContext";
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdArrowDropDown,
} from "react-icons/md";
import ViewSOS from "./ViewSOS";
import { AuthContext } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import Aniban2logo from "../assets/aniban2logo.jpg";
import AppLogo from "../assets/applogo-lightbg.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../api";

//ICONS
import { IoClose } from "react-icons/io5";

const defaultCenter = {
  lat: 14.46,
  lng: 120.966,
};

function SOSUpdateReports({ isCollapsed }) {
  const confirm = useConfirm();
  const [position, setPosition] = useState(defaultCenter);
  const [selectedID, setSelectedID] = useState(null);
  const { fetchReports, reports } = useContext(InfoContext);
  const [report, setReport] = useState([]);
  const { user } = useContext(AuthContext);
  const [isReportClicked, setReportClicked] = useState(false);
  const [isActiveClicked, setActiveClicked] = useState(true);
  const [isHistoryClicked, setHistoryClicked] = useState(false);
  const [filteredReports, setFilteredReports] = useState([]);
  const [sortOption, setSortOption] = useState("Newest");
  const [filterDropdown, setfilterDropdown] = useState(false);
  const [exportDropdown, setexportDropdown] = useState(false);
  const filterRef = useRef(null);
  const exportRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyC3T3SOxoBKrTVpuJwvxGZIBQKg2iuFHGE",
  });
  const toggleFilterDropdown = () => {
    setfilterDropdown(!filterDropdown);
  };
  const toggleExportDropdown = () => {
    setexportDropdown(!exportDropdown);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });

        // Send to backend
        fetch("https://your-backend.com/api/sos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
  }, []);

  function formatAddress(components) {
    let streetNumber = "";
    let route = "";
    let city = "";
    let province = "";

    components.forEach((comp) => {
      if (comp.types.includes("street_number")) streetNumber = comp.long_name;
      if (comp.types.includes("route")) route = comp.long_name;
      if (comp.types.includes("locality")) city = comp.long_name;
      if (comp.types.includes("administrative_area_level_2"))
        province = comp.long_name;
    });

    const addressParts = [streetNumber, route, city, province].filter(Boolean);
    return addressParts.join(", ");
  }

  const getReadableAddress = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyC3T3SOxoBKrTVpuJwvxGZIBQKg2iuFHGE`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        console.log("Results", data.results[0].address_components);
        return formatAddress(data.results[0].address_components);
      }
      return null;
    } catch (error) {
      console.error("Error fetching address:", error);
      return null;
    }
  };

  useEffect(() => {
    if (selectedID) {
      const found = reports.find((r) => r._id === selectedID);

      if (found) {
        (async () => {
          const readableAddress = await getReadableAddress(
            found.location.lat,
            found.location.lng
          );

          setReport({ ...found, readableAddress });
        })();
      } else {
        setReport(null);
      }
    } else {
      setReport(null);
    }
  }, [selectedID, reports]);

  const handleMenu1 = () => {
    setActiveClicked(true);
    setHistoryClicked(false);
    setSelectedID(null);
  };
  const handleMenu2 = () => {
    setHistoryClicked(true);
    setActiveClicked(false);
    setSelectedID(null);
  };

  useEffect(() => {
    if (reports) {
      let filtered = reports;
      if (isActiveClicked) {
        filtered = filtered.filter(
          (report) => report.status === "Pending" || report.status === "Ongoing"
        );
      } else if (isHistoryClicked) {
        filtered = filtered.filter(
          (report) =>
            report.status === "Resolved" ||
            report.status === "False Alarm" ||
            report.status === "Cancelled"
        );
      }
      setFilteredReports(filtered);
    }
  }, [reports, isActiveClicked, isHistoryClicked]);

  const parseDate = (dateStr) => new Date(dateStr.replace(" at ", " "));
  const sortedFilteredReports = [...filteredReports].sort((a, b) => {
    if (sortOption === "Oldest") {
      return parseDate(a.updatedAt) - parseDate(b.updatedAt);
    } else {
      return parseDate(b.updatedAt) - parseDate(a.updatedAt);
    }
  });

  const markerPositions = {};
  const adjustedReports = filteredReports.map((report) => {
    const key = `${report.location.lat}-${report.location.lng}`;
    let offsetLat = report.location.lat;
    let offsetLng = report.location.lng;

    if (markerPositions[key]) {
      offsetLat += 0.00002 * markerPositions[key];
      offsetLng += 0.00002 * markerPositions[key];
      markerPositions[key] += 1;
    } else {
      markerPositions[key] = 1;
    }

    return {
      ...report,
      adjustedLocation: { lat: offsetLat, lng: offsetLng },
    };
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

  //SOS UPDATE ACTIVE PAGINATION
  const [currentPageSOS, setCurrentPageSOS] = useState(1);
  const sosRowsPerPage = 2;
  const sosTotalRows = sortedFilteredReports.length;
  const sosTotalPages = Math.ceil(sosTotalRows / sosRowsPerPage);

  const startIndex = (currentPageSOS - 1) * sosRowsPerPage;
  const endIndex = startIndex + sosRowsPerPage;

  const showingStart = sosTotalRows === 0 ? 0 : startIndex + 1;
  const showingEnd = Math.min(endIndex, sosTotalRows);

  const paginatedReports = sortedFilteredReports
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(startIndex, endIndex);

  const exportCSV = async () => {
    if (filteredReports.length === 0) {
      confirm("No records available for export.", "failed");
      return;
    }
    const title = `Barangay Aniban 2 SOS Reports`;
    const now = new Date().toLocaleString();
    const headers = [
      "No.",
      "Reporter",
      "Responder/s",
      "Type of the Incident",
      "Details",
      "Post-Incident/False Alarm Report",
      "Status",
      "Date Completed",
    ];
    const rows = filteredReports
      .sort((a, b) => {
        const nameA = `${a.resID.lastname}`.toLowerCase();
        const nameB = `${b.resID.lastname}`.toLowerCase();
        return nameA.localeCompare(nameB);
      })
      .map((res, index) => {
        const fullname = res.resID.middlename
          ? `${res.resID.lastname} ${res.resID.middlename} ${res.resID.firstname}`
          : `${res.resID.lastname} ${res.resID.firstname}`;

        const responders = res.responder
          .map((r) => `${r.empID?.resID.firstname} ${r.empID?.resID.lastname}`)
          .join(", ");

        const baseRow = [
          res.SOSno,
          fullname,
          responders,
          res.reporttype ? res.reporttype : "-",
          res.reportdetails ? res.reportdetails : "-",
          res.postreportdetails,
          res.status,
          res.updatedAt.replace(",", " "),
        ];
        return baseRow;
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
      `Barangay_Aniban_2_SOS_by_${user.name.replace(/ /g, "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setexportDropdown(false);

    const action = "Export";
    const target = "SOS";
    const description = `User exported SOS records to CSV.`;
    try {
      await api.post("/logexport", { action, target, description });
    } catch (error) {
      console.log("Error in logging export", error);
    }
  };

  const exportPDF = async () => {
    if (filteredReports.length === 0) {
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
    doc.text(`SOS Reports`, pageWidth / 2, 57, { align: "center" });

    // Table
    const rows = filteredReports
      .sort((a, b) => {
        const nameA = `${a.resID.lastname}`.toLowerCase();
        const nameB = `${b.resID.lastname}`.toLowerCase();
        return nameA.localeCompare(nameB);
      })
      .map((res, index) => {
        const fullname = res.resID.middlename
          ? `${res.resID.lastname} ${res.resID.middlename} ${res.resID.firstname}`
          : `${res.resID.lastname} ${res.resID.firstname}`;

        const responders = res.responder
          .map((r) => `${r.empID?.resID.firstname} ${r.empID?.resID.lastname}`)
          .join(", ");

        const baseRow = [
          res.SOSno,
          fullname,
          responders,
          res.reporttype ? res.reporttype : "-",
          res.reportdetails ? res.reportdetails : "-",
          res.postreportdetails,
          res.status,
          res.updatedAt.replace(",", " "),
        ];
        return baseRow;
      });

    autoTable(doc, {
      head: [
        [
          "No.",
          "Reporter",
          "Responder/s",
          "Type of the Incident",
          "Details",
          "Post-Incident/False Alarm Report",
          "Status",
          "Date Completed",
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

    const filename = `Barangay_Aniban_2_SOS_by_${user.name.replace(
      / /g,
      "_"
    )}.pdf`;
    doc.save(filename);
    setexportDropdown(false);

    const action = "Export";
    const target = "SOS";
    const description = `User exported SOS records to PDF.`;
    try {
      await api.post("/logexport", { action, target, description });
    } catch (error) {
      console.log("Error in logging export", error);
    }
  };

  return (
    <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
      <div className="text-[30px] font-bold font-title text-[#BC0F0F]">
        SOS Update Reports
      </div>

      <div className="status-add-container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-x-8">
          <p
            onClick={handleMenu1}
            className={`status-text ${
              isActiveClicked ? "border-b-4 border-[#BC0F0F]" : "text-[#808080]"
            }`}
          >
            Active
          </p>
          <p
            onClick={handleMenu2}
            className={`status-text ${
              isHistoryClicked
                ? "border-b-4 border-[#BC0F0F]"
                : "text-[#808080]"
            }`}
          >
            History
          </p>
        </div>

        {isHistoryClicked && (
          <>
            <div className="export-sort-btn-container">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="flex flex-row gap-4 sm:gap-4">
                  <div className="relative" ref={exportRef}>
                    {/* Export Button */}
                    <div
                      className="relative flex items-center bg-[#fff] border-btn-color-red h-7 px-2 py-4 cursor-pointer appearance-none border rounded"
                      onClick={toggleExportDropdown}
                    >
                      <h1 className="text-sm font-medium mr-2 text-btn-color-red">
                        Export
                      </h1>
                      <div className="export-sort-btn-dropdown-icon">
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
                  <div className="relative" ref={filterRef}>
                    {/* Filter Button */}
                    <div
                      className="relative flex items-center bg-[#fff] border-btn-color-red h-7 px-2 py-4 cursor-pointer appearance-none border rounded"
                      onClick={toggleFilterDropdown}
                    >
                      <h1 className="text-sm font-medium mr-2 text-btn-color-red">
                        {sortOption}
                      </h1>
                      <div className="export-sort-btn-dropdown-icon">
                        <MdArrowDropDown size={18} color={"#F63131"} />
                      </div>
                    </div>

                    {filterDropdown && (
                      <div className="export-sort-dropdown-menu">
                        <ul className="w-full">
                          <div className="navbar-dropdown-item">
                            <li
                              className="export-sort-dropdown-option !text-[#BC0F0F]"
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
                              className="export-sort-dropdown-option !text-[#BC0F0F]"
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
            </div>
          </>
        )}
      </div>

      <div className="line-container">
        <hr className="line" />
      </div>

      {isActiveClicked ? (
        <>
          <div className={`mt-4 grid grid-cols-3 gap-4`}>
            {/* Map */}
            {isLoaded && (
              <div
                className={
                  "col-span-2 border-4 border-[#BC0F0F] rounded-lg overflow-hidden mt-4"
                }
              >
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "890px" }}
                  center={position}
                  zoom={18}
                >
                  {adjustedReports?.map((report) => (
                    <Marker
                      key={report._id}
                      position={report.adjustedLocation}
                      onClick={() => setSelectedID(report._id)}
                    >
                      <OverlayView
                        position={report.adjustedLocation}
                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                      >
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: "bold",
                            color: "red",
                            whiteSpace: "nowrap",
                            textShadow: "0 1px 2px rgba(255,255,255,0.8)",
                          }}
                        >
                          {report.resID.firstname} {report.resID.lastname}
                        </div>
                      </OverlayView>
                    </Marker>
                  ))}
                </GoogleMap>
              </div>
            )}

            <div>
              {/* Report List */}
              <div className="col-span-1">
                <table className="w-full border-collapse text-left table-fixed">
                  <thead className="bg-[#BC0F0F] text-white">
                    <tr>
                      <th className="px-4 py-2 w-1/2">Name</th>
                      <th className="px-4 py-2 w-1/2">Date Reported</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoaded && paginatedReports.length > 0 ? (
                      paginatedReports.map((rep, i) => (
                        <tr
                          key={i}
                          className="bg-white cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            if (rep.location?.lat && rep.location?.lng) {
                              setPosition({
                                lat: Number(rep.location.lat),
                                lng: Number(rep.location.lng),
                              });
                            }
                            setSelectedID(rep._id);
                          }}
                        >
                          <td className="px-4 py-3">
                            {rep.resID?.firstname} {rep.resID?.lastname}
                          </td>
                          <td className="px-4 py-3">{rep.createdAt}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="bg-white">
                        <td colSpan="2" className="text-center py-3">
                          No reports found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="flex justify-end items-center mt-1 mb-3">
                  <div className="text-sm text-gray-700">
                    {showingStart}-{showingEnd} of {sosTotalRows}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCurrentPageSOS((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPageSOS === 1}
                      className={`p-1 rounded-full ${
                        currentPageSOS === 1
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-200"
                      }`}
                    >
                      <MdKeyboardArrowLeft className="text-2xl text-[#F63131]" />
                    </button>

                    <button
                      onClick={() =>
                        setCurrentPageSOS((prev) =>
                          Math.min(prev + 1, sosTotalPages)
                        )
                      }
                      disabled={currentPageSOS === sosTotalPages}
                      className={`p-1 rounded-full ${
                        currentPageSOS === sosTotalPages
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-200"
                      }`}
                    >
                      <MdKeyboardArrowRight className="text-2xl text-[#F63131]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Reporter Details */}
              {report && (
                <div className="w-full bg-[#BC0F0F] text-white rounded-lg shadow-lg mx-auto overflow-hidden">
                  <div className="h-[700px] overflow-y-auto p-6">
                    {/* Close button */}
                    <div className="flex justify-end">
                      <IoClose
                        onClick={() => setSelectedID(null)}
                        className="text-2xl cursor-pointer hover:text-red-400 transition-colors"
                        title="Close"
                      />
                    </div>

                    {/* Header with picture and name */}
                    <div className="flex flex-col items-center mb-6">
                      <img
                        src={report.resID?.picture || "/default-profile.png"}
                        alt="Resident"
                        className="w-24 h-24 rounded-full bg-white object-cover shadow-md mb-3"
                      />
                      <h2 className="text-2xl font-bold">
                        {report.resID?.firstname} {report.resID?.lastname}
                      </h2>
                      <p className="italic opacity-70 mt-1">Resident</p>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-white">
                      <div>
                        <h3 className="font-semibold mb-1">Age</h3>
                        <p className="opacity-90">{report.resID?.age || "-"}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-1">Mobile</h3>
                        <p className="opacity-90">
                          {report.resID?.mobilenumber || "-"}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <h3 className="font-semibold mb-1">Address</h3>
                        <p className="opacity-90 break-words">
                          {report.resID?.householdno?.address || "-"}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-1">Emergency Type</h3>
                        <p className="opacity-90">{report.reporttype || "-"}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-1">Location</h3>
                        <p className="opacity-90">
                          {report.readableAddress || "-"}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-1">Date Reported</h3>
                        <p className="opacity-90">
                          {report.createdAt?.split(" at ")[0] || "-"}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-1">Time Reported</h3>
                        <p className="opacity-90">
                          {report.createdAt?.split(" at ")[1] || "-"}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <h3 className="font-semibold mb-1">
                          Additional Details
                        </h3>
                        <p className="opacity-90 whitespace-pre-line">
                          {report.reportdetails || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* {report && (
            <div className="mt-6 border rounded-lg shadow overflow-hidden">
              <table className="w-full border-collapse text-left">
                <thead className="bg-[#BC0F0F] text-white">
                  <tr>
                    <th className="px-4 py-2">Emergency Type</th>
                    <th className="px-4 py-2">Location</th>
                    <th className="px-4 py-2">Date Reported</th>
                    <th className="px-4 py-2">Time Reported</th>
                    <th className="px-4 py-2">Additional Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="px-4 py-3">{report.reporttype || "-"}</td>
                    <td className="px-4 py-3">{report.readableAddress}</td>
                    <td className="px-4 py-3">
                      {report.createdAt?.split(" at ")[0]}
                    </td>
                    <td className="px-4 py-3">
                      {report.createdAt?.split(" at ")[1]}
                    </td>
                    <td className="px-4 py-3">{report.reportdetails || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )} */}
        </>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead className="bg-[#BC0F0F]">
                <tr className="cursor-default">
                  <th>No.</th>
                  <th>Reporter</th>
                  <th>Responder/s</th>
                  <th>Type of the Incident</th>
                  <th>Status</th>
                  <th>Date Completed</th>
                </tr>
              </thead>

              <tbody className="bg-[#fff] cursor-fault">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No results found</td>
                  </tr>
                ) : (
                  currentRows.map((report) => (
                    <tr
                      key={report._id}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f0f0";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "";
                      }}
                      className="cursor-default"
                      onClick={() => {
                        setReportClicked(true);
                        setSelectedID(report._id);
                      }}
                    >
                      <td>{report.SOSno}</td>
                      <td>
                        {report.resID.firstname} {report.resID.lastname}
                      </td>

                      <td>
                        {report.responder.length > 0
                          ? report.responder
                              .map(
                                (r) =>
                                  `${r.empID?.resID.firstname} ${r.empID?.resID.lastname}`
                              )
                              .join(", ")
                          : "-"}
                      </td>
                      <td>{report.reporttype ? report.reporttype : "-"}</td>
                      <td>{report.status}</td>
                      <td>{report.updatedAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {isReportClicked && (
              <ViewSOS
                onClose={() => setReportClicked(false)}
                reportID={selectedID}
              />
            )}

            <div className="table-pagination">
              <div className="table-pagination-size">
                <span>Rows per page:</span>
                <div className="relative w-12">
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="table-pagination-btn"
                  >
                    <MdKeyboardArrowLeft
                      color={"#F63131"}
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
                      color={"#F63131"}
                      className="text-xl"
                    />
                  </button>
                </div>
              )}
            </div>
            {currentRows.map((row, index) => (
              <div key={index}>{row.name}</div>
            ))}
          </div>
        </>
      )}
      <div className="mb-20"></div>
    </main>
  );
}

export default SOSUpdateReports;
