import { useEffect, useState, useContext } from "react";
import { InfoContext } from "../context/InfoContext";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";
import DatePicker from "react-multi-date-picker";

//STYLES
import "../App.css";

//ICONS
import { IoClose } from "react-icons/io5";

function CreateReservation({ onClose }) {
  const confirm = useConfirm();
  const { fetchResidents, residents, courtreservations, fetchReservations } =
    useContext(InfoContext);

  const [showModal, setShowModal] = useState(true);
  const [reservationForm, setReservationForm] = useState({
    resID: "",
    purpose: "",
    purpose2: "",
    date: [],
    times: {},
    amount: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchResidents();
    fetchReservations();
  }, []);

  useEffect(() => {
    const hourlyRate = 100;
    let totalHours = 0;

    for (const dateKey in reservationForm.times) {
      const t = reservationForm.times[dateKey];
      if (t?.starttime && t?.endtime) {
        const start = new Date(t.starttime);
        const end = new Date(t.endtime);

        if (!isNaN(start) && !isNaN(end) && end > start) {
          totalHours += (end - start) / (1000 * 3600);
        }
      }
    }

    const totalAmount = "₱" + Math.round(totalHours * hourlyRate);
    setReservationForm((prev) => ({ ...prev, amount: totalAmount }));
  }, [reservationForm.times]);

  const handleSubmit = async () => {
    const isConfirmed = await confirm(
      "Please confirm to proceed with adding this court reservation. Make sure all details are correct before submission.",
      "confirm"
    );
    if (!isConfirmed) return;
    if (loading) return;

    setLoading(true);

    let updatedForm = { ...reservationForm };
    if (updatedForm.purpose === "Others") {
      updatedForm.purpose = updatedForm.purpose2;
      delete updatedForm.purpose2;
    } else {
      delete updatedForm.purpose2;
    }
    try {
      await api.post("/createreservation", { reservationForm: updatedForm });
      confirm("The court reservation has been successfully added.", "success");
      onClose();
    } catch (error) {
      console.error("Error creating court reservation", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  const purposeList = ["Basketball", "Birthday", "Zumba", "Others"];

  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    setReservationForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (dates) => {
    const formattedDates = dates.map((d) => d.format("YYYY-MM-DD"));

    const newTimes = {};
    formattedDates.forEach((date) => {
      if (reservationForm.times[date]) {
        newTimes[date] = reservationForm.times[date];
      }
    });

    setReservationForm((prev) => ({
      ...prev,
      date: formattedDates,
      times: newTimes,
    }));
  };

  const handleStartTimeChange = (date, time) => {
    if (!time) return;

    const newStartTime = new Date(`${date}T${time}:00`);

    setReservationForm((prev) => {
      const currentTimes = prev.times[date] || {};
      return {
        ...prev,
        times: {
          ...prev.times,
          [date]: {
            ...currentTimes,
            starttime: newStartTime.toISOString(),
            endtime: null,
          },
        },
      };
    });
  };

  const handleEndTimeChange = (date, time) => {
    if (!time) return;

    const currentTimes = reservationForm.times[date] || {};
    if (!currentTimes.starttime) {
      confirm("Please select a start time first for " + date, "failed");
      return;
    }

    const [year, month, day] = date.split("-");
    const [hours, minutes] = time.split(":");
    const newEndTime = new Date(year, month - 1, day, hours, minutes, 0);
    const startTime = new Date(currentTimes.starttime);

    if (newEndTime <= startTime) {
      confirm(`End time must be after start time for ${date}`, "failed");
      return;
    }

    const conflict = courtreservations
      .filter(
        (r) =>
          r.status === "Approved" &&
          r.times?.[date]?.starttime &&
          r.times?.[date]?.endtime
      )
      .find((r) => {
        const reservedStart = new Date(r.times[date].starttime);
        const reservedEnd = new Date(r.times[date].endtime);

        console.log(
          "Checking overlap:",
          { selectedStart: startTime, selectedEnd: newEndTime },
          { reservedStart, reservedEnd }
        );

        return startTime < reservedEnd && newEndTime > reservedStart;
      });

    if (conflict) {
      confirm(
        `Time slot overlaps with existing reservation on ${date} (${new Date(
          conflict.times[date].starttime
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })} - ${new Date(conflict.times[date].endtime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}).`,
        "failed"
      );
      return;
    }

    setReservationForm((prev) => {
      const updatedTimes = prev.times[date] || {};
      return {
        ...prev,
        times: {
          ...prev.times,
          [date]: {
            ...updatedTimes,
            endtime: newEndTime.toISOString(),
          },
        },
      };
    });
  };

  const smartCapitalize = (word) => {
    if (word === word.toUpperCase()) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  };

  const lettersAndSpaceOnly = (e) => {
    const { name, value } = e.target;
    const filtered = value.replace(/[^a-zA-Z\s.'-]/g, "");

    const capitalized = filtered
      .split(" ")
      .map((word) => smartCapitalize(word))
      .join(" ");

    setReservationForm((prev) => ({
      ...prev,
      [name]: capitalized,
    }));
  };

  return (
    <>
      {showModal && (
        <div className="modal-container">
          <div className="modal-content h-[25rem] w-[30rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">Add New Reservation</h1>
                  <IoClose
                    onClick={handleClose}
                    className="dialog-title-bar-icon"
                  />
                </div>
                <hr className="dialog-line" />
              </div>
            </div>

            <form
              className="modal-form-container"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="modal-form">
                {/* Resident Select */}
                <div className="employee-form-group">
                  <label htmlFor="resID" className="form-label">
                    Name<label className="text-red-600">*</label>
                  </label>
                  <select
                    id="resID"
                    name="resID"
                    onChange={handleDropdownChange}
                    className="form-input"
                    value={reservationForm.resID}
                    required
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    {residents
                      .filter(
                        (res) =>
                          res.status === "Active" ||
                          res.status === "Change Requested"
                      )
                      .map((element) => (
                        <option key={element._id} value={element._id}>
                          {element.middlename
                            ? `${element.firstname} ${element.middlename} ${element.lastname}`
                            : `${element.firstname} ${element.lastname}`}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Purpose Select */}
                <div className="employee-form-group">
                  <label htmlFor="purpose" className="form-label">
                    Purpose<label className="text-red-600">*</label>
                  </label>
                  <select
                    id="purpose"
                    name="purpose"
                    onChange={handleDropdownChange}
                    className="form-input"
                    value={reservationForm.purpose}
                    required
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    {purposeList.map((element) => (
                      <option key={element} value={element}>
                        {element}
                      </option>
                    ))}
                  </select>
                </div>

                {reservationForm.purpose === "Others" && (
                  <div className="employee-form-group">
                    <label htmlFor="amount" className="form-label">
                      Others (Please Specify)
                      <label className="text-red-600">*</label>
                    </label>
                    <input
                      value={reservationForm.purpose2}
                      type="text"
                      id="purpose2"
                      name="purpose2"
                      required
                      className="form-input"
                      onChange={lettersAndSpaceOnly}
                    />
                  </div>
                )}

                {/* Date picker */}
                <div className="employee-form-group">
                  <label className="form-label">
                    Date<label className="text-red-600">*</label>
                  </label>
                  <DatePicker
                    required
                    multiple
                    value={reservationForm.date}
                    onChange={handleDateChange}
                    format="YYYY-MM-DD"
                    placeholder="Select multiple dates"
                    editable={false}
                    minDate={new Date()}
                    style={{
                      display: "block",
                      width: "100%",
                      height: "35px",
                      borderRadius: "8px",
                      paddingLeft: "0.5rem",
                      border: "1px solid #C1C0C0",
                      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                      fontFamily: "Quicksand",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                      appearance: "none",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Start/End time inputs per date */}
                {reservationForm.date.length > 0 && (
                  <div className="employee-form-group">
                    <label className="form-label">
                      Select Start and End Times
                    </label>
                    {reservationForm.date.map((date) => {
                      const times = reservationForm.times[date] || {};
                      return (
                        <div key={date} className="timedate-container">
                          <span className="timedate-label">{date}</span>

                          <input
                            type="time"
                            value={
                              times.starttime
                                ? new Date(times.starttime)
                                    .toTimeString()
                                    .slice(0, 5)
                                : ""
                            }
                            onChange={(e) =>
                              handleStartTimeChange(date, e.target.value)
                            }
                            className="form-input"
                            required
                          />
                          <input
                            type="time"
                            value={
                              times.endtime
                                ? new Date(times.endtime)
                                    .toTimeString()
                                    .slice(0, 5)
                                : ""
                            }
                            onChange={(e) =>
                              handleEndTimeChange(date, e.target.value)
                            }
                            className="form-input"
                            required
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Amount (readonly) */}
                <div className="employee-form-group">
                  <label htmlFor="amount" className="form-label">
                    Amount
                  </label>
                  <input
                    value={reservationForm.amount}
                    type="text"
                    id="amount"
                    name="amount"
                    className="form-input"
                    readOnly
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateReservation;
