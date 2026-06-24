import { useEffect, useState, useContext } from "react";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";

//SCREENS
import BlotterReject from "./BlotterReject";
import BlotterPrint from "./blotter/BlotterPrint";

//STYLES
import "../App.css";

//ICONS
import { IoClose } from "react-icons/io5";

function ViewBlotter({ onClose, blotterID }) {
  const confirm = useConfirm();
  const navigation = useNavigate();
  const [blotter, setBlotter] = useState([]);
  const [captain, setCaptain] = useState([]);
  const { blotterreports, fetchBlotterReports } = useContext(InfoContext);
  const [isRejectClicked, setRejectClicked] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    starttime: "",
    endtime: "",
  });
  const [expandedDetails, setExpandedDetails] = useState([]);

  useEffect(() => {
    const fetchCaptain = async () => {
      try {
        const response = await api.get("/getcaptain");
        setCaptain(response.data);
      } catch (error) {
        console.log("Error fetching captain");
      }
    };
    fetchCaptain();
  }, []);

  useEffect(() => {
    const fetchBlotter = async () => {
      try {
        const response = await api.get(`/getblotter/${blotterID}`);
        setBlotter(response.data);

        const starttime = response.data.starttime
          ? new Date(response.data.starttime)
          : null;
        const endtime = response.data.endtime
          ? new Date(response.data.endtime)
          : null;

        setScheduleForm((prev) => ({
          ...prev,
          date: starttime ? starttime.toISOString().split("T")[0] : null,
          starttime: starttime ? starttime.toISOString() : null,
          endtime: endtime ? endtime.toISOString() : null,
        }));
      } catch (error) {
        console.log("Error fetching blotter", error);
      }
    };
    fetchBlotter();
    fetchBlotterReports();
  }, []);

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  const handleDateChange = (e) => {
    const newDateStr = e.target.value;

    setScheduleForm((prev) => {
      return {
        ...prev,
        date: newDateStr,
        starttime: "",
        endtime: "",
      };
    });
  };

  const checkIfTimeSlotIsAvailable = (startTime, endTime) => {
    const selectedStartTime = new Date(startTime);
    const selectedEndTime = new Date(endTime);

    const parseCustomDate = (dateStr) => {
      if (!dateStr) return null;

      // Check if it contains ' at ' (old format), else assume ISO
      if (dateStr.includes(" at ")) {
        const [datePart, timePart] = dateStr.split(" at ");
        const d = new Date(`${datePart} ${timePart}`);
        return isNaN(d.getTime()) ? null : d;
      }

      // ISO string
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? null : d;
    };

    if (
      isNaN(selectedStartTime.getTime()) ||
      isNaN(selectedEndTime.getTime())
    ) {
      console.warn("Invalid selected time range");
      return { isAvailable: false, conflict: null };
    }

    const conflict = blotterreports
      .filter((blot) => blot.status === "Scheduled" && blot._id !== blotterID)
      .find((blot) => {
        const reservedStart = parseCustomDate(blot.starttime);
        const reservedEnd = parseCustomDate(blot.endtime);

        if (!reservedStart || !reservedEnd) return false;

        return (
          selectedStartTime < reservedEnd && selectedEndTime > reservedStart
        );
      });

    if (conflict) {
      return {
        isAvailable: false,
        conflict: {
          start: parseCustomDate(conflict.starttime),
          end: parseCustomDate(conflict.endtime),
        },
      };
    }

    return { isAvailable: true, conflict: null };
  };

  const handleStartTimeChange = (e) => {
    const time = e.target.value;
    const newStartTime = new Date(`${scheduleForm.date}T${time}:00`);

    if (!time) {
      setScheduleForm((prev) => ({ ...prev, starttime: "" }));
      return;
    }

    if (!scheduleForm.date) {
      confirm("Please select a date first.", "failed");
      return;
    }

    setScheduleForm((prev) => ({
      ...prev,
      starttime: newStartTime.toISOString(),
      endtime: "",
    }));
  };

  const handleEndTimeChange = (e) => {
    const time = e.target.value;
    const newEndTime = new Date(`${scheduleForm.date}T${time}:00`);
    const startTime = new Date(scheduleForm.starttime);

    if (!time) {
      setScheduleForm((prev) => ({ ...prev, endtime: "" }));
      return;
    }
    if (!scheduleForm.date) {
      confirm("Please select a date first.", "failed");
      return;
    }
    if (!scheduleForm.starttime) {
      confirm("Please select a start time first.", "failed");
      return;
    }

    if (newEndTime <= startTime) {
      confirm("The end time must be after the start time.", "failed");
      return;
    }

    const { isAvailable, conflict } = checkIfTimeSlotIsAvailable(
      startTime,
      newEndTime
    );

    if (!isAvailable) {
      const conflictInfo = conflict
        ? `This time slot overlaps with an existing schedule of ${conflict.start.toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )} - ${conflict.end.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}.`
        : null;
      confirm(conflictInfo, "failed");
      setScheduleForm((prev) => ({ ...prev, endtime: "" }));
      return;
    }

    setScheduleForm((prev) => ({
      ...prev,
      endtime: newEndTime.toISOString(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { date, starttime, endtime } = scheduleForm;

    if (!date || !starttime || !endtime) {
      confirm(
        "Please fill in the Date, Start Time, and End Time before submitting.",
        "failed"
      );
      return;
    }

    const isConfirmed = await confirm(
      "Please confirm to proceed with scheduling this pending blotter. Make sure the time and date are correct before submission.",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      await api.put(`/scheduleblotter/${blotterID}`, { scheduleForm });
      confirm("The hearing has been successfully scheduled.", "success");
      onClose();
    } catch (error) {
      console.log("Error scheduling blotter", error);
    }
  };

  const handleEdit = async () => {
    const { date, starttime, endtime } = scheduleForm;

    if (!date || !starttime || !endtime) {
      confirm(
        "Please fill in the Date, Start Time, and End Time before submitting.",
        "failed"
      );
      return;
    }

    const isConfirmed = await confirm(
      "Please confirm to proceed with updating the date and time of this scheduled blotter. Make sure the new schedule is correct before submission.",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      await api.put(`/editscheduleblotter/${blotterID}`, { scheduleForm });
      confirm("The hearing has been successfully rescheduled.", "success");
      onClose();
    } catch (error) {
      console.log("Error updating blotter", error);
    }
  };

  const handleSettle = () => {
    navigation("/settle-blotter", { state: { blotterID: blotterID } });
    onClose();
  };

  const handlePrint = () => {
    BlotterPrint({
      blotterData: blotter,
      captainData: captain,
    });
  };

  const handleReject = () => {
    setRejectClicked(true);
  };

  const toggleExpanded = (id) => {
    setExpandedDetails((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  const renderDetails = (blotter) => {
    const details = blotter.details || "";
    const words = details.split(" ") || "";
    const isLong = words.length > 50;
    const isExpanded = expandedDetails.includes(blotter._id);
    const displayText = isExpanded
      ? blotter.details
      : words.slice(0, 50).join(" ") + (isLong ? "..." : "");

    return (
      <div className="text-sm font-normal text-justify">
        {displayText}
        {isLong && (
          <span
            className="text-blue-500 cursor-pointer ml-1"
            onClick={() => toggleExpanded(blotter._id)}
          >
            {isExpanded ? "See less" : "See more"}
          </span>
        )}
      </div>
    );
  };

  const formatTimeToHHMM = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <>
      {showModal && (
        <div className="modal-container">
          <div className="modal-content w-[70rem] h-[35rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">View Blotter</h1>
                  <IoClose
                    onClick={handleClose}
                    class="dialog-title-bar-icon"
                  ></IoClose>
                </div>
                <hr className="dialog-line" />
              </div>
            </div>

            <div className="modal-form-container">
              <div className="modal-form">
                <div>
                  <div className="w-full mx-auto space-y-6">
                    {/* Complainant Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 mb-4">
                      <div>
                        <label className="section-title text-start">
                          Complainant Information
                        </label>
                        <div className="grid gap-4 mt-4 mb-4">
                          <div>
                            <label className="form-label">Name</label>
                            <label className="text-sm font-regular">
                              {blotter.complainantID
                                ? `${blotter.complainantID.firstname} ${
                                    blotter.complainantID.middlename || ""
                                  } ${blotter.complainantID.lastname}`.trim()
                                : blotter.complainantname}
                            </label>
                          </div>

                          <div>
                            <label className="form-label">Address</label>
                            <label className="text-sm font-regular">
                              {blotter.complainantID
                                ? blotter.complainantID.householdno?.address
                                : blotter.complainantaddress}
                            </label>
                          </div>

                          <div>
                            <label className="form-label">Contact No.</label>
                            <label className="text-sm font-regular">
                              {blotter.complainantID
                                ? blotter.complainantID.mobilenumber
                                : blotter.complainantcontactno}
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Subject Information */}
                      <div>
                        <label className="section-title text-start">
                          Subject Information
                        </label>
                        <div className="grid gap-4 mt-4 mb-4">
                          <div>
                            <label className="form-label">Name</label>
                            <label className="text-sm font-regular">
                              {blotter.subjectID
                                ? `${blotter.subjectID.firstname} ${
                                    blotter.subjectID.middlename || ""
                                  } ${blotter.subjectID.lastname}`.trim()
                                : blotter.subjectname}
                            </label>
                          </div>

                          <div>
                            <label className="form-label">Address</label>
                            <label className="text-sm font-regular">
                              {blotter.subjectID
                                ? blotter.subjectID.householdno?.address
                                : blotter.subjectaddress}
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Blotter Information */}
                      <div>
                        <label className="section-title text-start">
                          Blotter Information
                        </label>
                        <div className="grid grid-cols-1 gap-4 mt-4 mb-4">
                          <div>
                            <label className="form-label">
                              Type of the Incident
                            </label>
                            <label className="text-sm font-regular">
                              {blotter.typeofthecomplaint}
                            </label>
                          </div>

                          <div>
                            <label className="form-label">
                              Details of the Incident
                            </label>
                            <label className="text-sm font-regular">
                              {renderDetails(blotter)}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {blotter.status === "Rejected" && (
                    <>
                      <label className="section-title text-start">
                        Reason for Rejection
                      </label>
                      <hr class="section-divider" />
                      <div>
                        <label className="form-label">Remarks</label>
                        <label className="text-sm font-regular">
                          {blotter.remarks}
                        </label>
                      </div>
                    </>
                  )}

                  {(blotter.status === "Pending" ||
                    blotter.status === "Scheduled") && (
                    <>
                      {/*Settlement Proceedings*/}
                      <label className="section-title text-start">
                        Schedule Information
                      </label>
                      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3 mt-4">
                        <div>
                          <label className="form-label">Date</label>
                          <input
                            type="date"
                            id="date"
                            name="date"
                            value={scheduleForm.date ? scheduleForm.date : ""}
                            onChange={handleDateChange}
                            className="form-input h-[30px] pr-2"
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>

                        <div>
                          <label className="form-label">Start Time</label>
                          <input
                            type="time"
                            id="starttime"
                            name="starttime"
                            className="form-input h-[30px] pr-2"
                            onChange={handleStartTimeChange}
                            value={formatTimeToHHMM(scheduleForm.starttime)}
                          />
                        </div>
                        <div>
                          <label className="form-label">End Time </label>
                          <input
                            type="time"
                            id="endtime"
                            name="endtime"
                            className="form-input h-[30px] pr-2"
                            onChange={handleEndTimeChange}
                            value={formatTimeToHHMM(scheduleForm.endtime)}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {blotter.status === "Settled" && (
                    <>
                      <label className="section-title text-start">
                        Settlement Information
                      </label>
                      <hr className="section-divider" />
                      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3 mt-4">
                        <div>
                          <label className="form-label">Date</label>
                          <label className="text-sm font-regular">
                            {scheduleForm.date}
                          </label>
                        </div>
                        <div>
                          <label className="form-label">Start Time</label>
                          <label className="text-sm font-regular">
                            {new Date(
                              scheduleForm.starttime
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </label>
                        </div>
                        <div>
                          <label className="form-label">End Time</label>
                          <label className="text-sm font-regular">
                            {new Date(scheduleForm.endtime).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </label>
                        </div>

                        <div className="col-span-1">
                          <label className="form-label">Details</label>
                          <label className="text-sm font-regular">
                            {blotter.agreementdetails}
                          </label>
                        </div>

                        <div className="col-span-1">
                          <label className="form-label">Witness</label>
                          <label className="text-sm font-regular">
                            {blotter.witnessID
                              ? `${blotter.witnessID.firstname} ${
                                  blotter.witnessID.middlename || ""
                                } ${blotter.witnessID.lastname}`
                              : blotter.witnessname}
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  {blotter.status === "Pending" && (
                    <>
                      <div className="flex justify-center gap-4 mt-4">
                        <button
                          type="button"
                          onClick={handleReject}
                          className="actions-btn bg-btn-color-red hover:bg-red-700"
                        >
                          Reject
                        </button>
                        <button
                          type="submit"
                          onClick={handleSubmit}
                          className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                        >
                          Schedule
                        </button>
                      </div>
                    </>
                  )}

                  {blotter.status === "Scheduled" && (
                    <>
                      <div className="flex justify-center gap-4 mt-4">
                        <button
                          type="button"
                          onClick={handleReject}
                          className="actions-btn bg-btn-color-red hover:bg-red-700"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={handleEdit}
                          className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={handleSettle}
                          className="actions-btn bg-[#06D001] hover:bg-[#04A700]"
                        >
                          Settle
                        </button>
                      </div>
                    </>
                  )}
                  {blotter.status === "Settled" && (
                    <>
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={handlePrint}
                          className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                        >
                          Print
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isRejectClicked && (
        <BlotterReject
          blotterID={blotterID}
          onClose={() => setRejectClicked(false)}
          onViewClose={onClose}
        />
      )}
    </>
  );
}

export default ViewBlotter;
