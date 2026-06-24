import { useEffect, useState, useContext } from "react";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

//SCREENS

//STYLES
import "../App.css";

//ICONS
import { IoClose } from "react-icons/io5";

const containerStyle = {
  width: "50%",
  height: "200px",
};

function ViewSOS({ onClose, reportID }) {
  dayjs.extend(relativeTime);
  dayjs.extend(customParseFormat);
  const confirm = useConfirm();
  const navigation = useNavigate();
  const { reports } = useContext(InfoContext);
  const [showModal, setShowModal] = useState(true);
  const [position, setPosition] = useState(null);

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyC3T3SOxoBKrTVpuJwvxGZIBQKg2iuFHGE",
  });

  const selectedReport = reports.find((r) => r._id === reportID);

  useEffect(() => {
    if (selectedReport)
      setPosition({
        lat: selectedReport.location.lat,
        lng: selectedReport.location.lng,
      });
  }, [selectedReport]);

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl shadow-lg w-[70rem] h-[35rem] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h1 className="text-lg font-semibold text-[#BC0F0F]">
                View Report
              </h1>
              <IoClose
                onClick={handleClose}
                className="text-2xl cursor-pointer hover:text-red-500"
              />
            </div>

            {/* Body */}
            {selectedReport && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Grid Layout */}
                <div className="grid grid-cols-2 gap-4 h-full">
                  {/* Left Column: Map */}
                  <div className="col-span-1 h-full">
                    {isLoaded && position && (
                      <div className="h-full rounded-xl overflow-hidden shadow border-4 border-[#BC0F0F] ">
                        <GoogleMap
                          mapContainerStyle={{ width: "100%", height: "100%" }}
                          center={position}
                          zoom={20}
                        >
                          <Marker
                            key={selectedReport._id}
                            position={position}
                          />
                        </GoogleMap>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Resident Info, Responders, Post Report */}
                  <div className="col-span-1 flex flex-col gap-4 h-full overflow-y-auto">
                    {/* Report Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium text-[#BC0F0F]">
                          {selectedReport.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="font-medium text-[#BC0F0F]">
                          {dayjs(
                            selectedReport.updatedAt,
                            "MMMM D, YYYY [at] h:mm A"
                          ).fromNow()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium text-[#BC0F0F]">
                          {selectedReport.reporttype || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Details</p>
                        <p className="font-medium text-[#BC0F0F]">
                          {selectedReport.reportdetails || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Resident Info */}
                    <div className="flex items-center gap-4 p-4 border rounded-xl bg-gray-50">
                      <img
                        src={selectedReport.resID?.picture}
                        alt="Resident"
                        className="w-16 h-16 rounded-full object-cover shadow-lg"
                      />
                      <div>
                        <p className="font-semibold text-lg text-[#BC0F0F]">
                          {selectedReport.resID.firstname}{" "}
                          {selectedReport.resID.lastname}
                        </p>
                        <p className="text-sm text-gray-600">
                          Age: {selectedReport.resID.age}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedReport.resID.householdno?.address}
                        </p>
                      </div>
                    </div>

                    {/* Responders */}
                    {selectedReport.responder?.length > 0 && (
                      <div>
                        <h2 className="font-semibold mb-2 text-[#BC0F0F]">Responders</h2>
                        <div className="space-y-3">
                          {selectedReport.responder.map((r, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-4 p-3 border rounded-lg bg-white shadow-sm"
                            >
                              <img
                                src={r.empID.resID?.picture}
                                alt="Personnel"
                                className="w-16 h-16 rounded-full object-cover shadow-lg"
                              />
                              <div>
                                <p className="font-semibold text-lg text-[#BC0F0F]">
                                  {r.empID.resID.firstname}{" "}
                                  {r.empID.resID.lastname}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {r.empID.resID.mobilenumber}
                                </p>
                                {r.arrivedat && (
                                  <p className="text-sm text-gray-500">
                                    Arrived: {r.arrivedat}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Post Report */}
                    {selectedReport.postreportdetails && (
                      <div>
                        <h2 className="font-semibold mb-1 text-[#BC0F0F]">
                          Post Report Details
                        </h2>
                        <p className="text-gray-700">
                          {selectedReport.postreportdetails}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ViewSOS;
