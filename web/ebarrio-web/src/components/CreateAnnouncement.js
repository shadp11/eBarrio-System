import { useRef, useState, useContext, useEffect } from "react";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";
import { AuthContext } from "../context/AuthContext";
import { storage } from "../firebase";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import DatePicker from "react-multi-date-picker";
import React from "react";
import { InfoContext } from "../context/InfoContext";

//STYLES
import "../App.css";
import "../Stylesheets/CommonStyle.css";

//ICONS
import { MdInsertPhoto, MdCalendarMonth } from "react-icons/md";
import { IoClose } from "react-icons/io5";

function CreateAnnouncement({ onClose }) {
  const confirm = useConfirm();
  const [havePicture, setHavePicture] = useState(false);
  const { user } = useContext(AuthContext);
  const hiddenInputRef1 = useRef(null);
  const [showDateTimeInputs, setShowDateTimeInputs] = useState(false);
  const initialForm = {
    category: "",
    title: "",
    content: "",
    picture: "",
    date: [],
    times: {},
    eventdetails: "",
  };
  const { announcementForm, setAnnouncementForm } = useContext(InfoContext);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    if (announcementForm.picture) {
      setHavePicture(true);
    }
  }, []);

  const handleDateChange = (dates) => {
    // Format dates to ISO YYYY-MM-DD strings
    const formattedDates = dates.map((d) => d.format("YYYY-MM-DD"));

    // Remove times for deselected dates
    const newTimes = {};
    formattedDates.forEach((date) => {
      if (announcementForm.times[date]) {
        newTimes[date] = announcementForm.times[date];
      }
    });

    setAnnouncementForm((prev) => ({
      ...prev,
      date: formattedDates,
      times: newTimes,
    }));
  };

  const handleStartTimeChange = (date, time) => {
    if (!time) return;

    const newStartTime = new Date(`${date}T${time}:00`);

    setAnnouncementForm((prev) => {
      const currentTimes = prev.times[date] || {};
      return {
        ...prev,
        times: {
          ...prev.times,
          [date]: {
            ...currentTimes,
            starttime: newStartTime.toISOString(),
            endtime: null, // reset endtime if starttime changes
          },
        },
      };
    });
  };

  const handleEndTimeChange = (date, time) => {
    if (!time) return;

    const currentTimes = announcementForm.times[date] || {};
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

    setAnnouncementForm((prev) => {
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

  async function uploadToFirebase(url) {
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `id_announcements/${Date.now()}_${randomString}.png`;
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  }

  const handleSubmit = async () => {
    try {
      const isConfirmed = await confirm(
        "Please confirm to proceed with creating this announcement. Make sure all details are correct as this will be shared with the community.",
        "confirm"
      );
      if (!isConfirmed) {
        return;
      }
      if (loading) return;

      setLoading(true);
      delete announcementForm.date;
      if (announcementForm.picture !== "") {
        const pictureUrl = await uploadToFirebase(announcementForm.picture);
        const response = await api.post("/createannouncement", {
          announcementForm: { ...announcementForm, picture: pictureUrl },
        });
      } else {
        const response = await api.post("/createannouncement", {
          announcementForm,
        });
      }

      confirm("Your announcement has been successfully posted.", "success");
      setAnnouncementForm(initialForm);
    } catch (error) {
      console.log("Error creating announcement", error);
    } finally {
      onClose();
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  const categoryList = [
    "General",
    "Public Safety & Emergency",
    "Health & Sanitation",
    "Social Services",
    "Infrastructure",
    "Education & Youth",
  ];

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "picture") {
      console.log("Picture input triggered");
      if (files && files[0]) {
        setHavePicture(true);
        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          setAnnouncementForm((prev) => ({
            ...prev,
            picture: reader.result,
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setHavePicture(false);
      }
    } else {
      setAnnouncementForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEvent = () => {
    setShowDateTimeInputs((prev) => !prev);
  };

  const handleRemovePic = () => {
    setAnnouncementForm((prev) => ({
      ...prev,
      picture: "",
    }));
    setHavePicture(false);
    hiddenInputRef1.current.value = "";
  };

  const handleUploadPicture = (event) => {
    hiddenInputRef1.current.click();
  };

  const handleOK = () => {
    if (!announcementForm.date.length) {
      setAnnouncementForm((prev) => {
        return {
          ...prev,
          eventdetails: "",
        };
      });
      return;
    }

    const hasMissingTimes = announcementForm.date.some((date) => {
      const times = announcementForm.times[date];
      return !times || !times.starttime || !times.endtime;
    });

    if (hasMissingTimes) {
      confirm(
        "Please provide both the start and end times for all selected dates.",
        "failed"
      );
      return;
    }

    const detailsArray = announcementForm.date.map((date) => {
      const times = announcementForm.times[date];
      if (!times || !times.starttime || !times.endtime) return "";

      const formattedDate = new Date(times.starttime).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );
      const formattedStart = new Date(times.starttime).toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
      const formattedEnd = new Date(times.endtime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return `📅 ${formattedDate} 🕒 ${formattedStart} - ${formattedEnd}`;
    });

    setAnnouncementForm((prev) => {
      return {
        ...prev,
        eventdetails: detailsArray.filter(Boolean).join("\n"),
      };
    });
    setShowDateTimeInputs(false);
  };

  const handleCancel = () => {
    setAnnouncementForm((prev) => ({
      ...prev,
      date: [],
      times: {},
    }));
    setAnnouncementForm((prev) => {
      return {
        ...prev,
        eventdetails: "",
      };
    });
    setShowDateTimeInputs(false);
  };

  return (
    <>
      {showModal && (
        <div className="modal-container">
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
            </div>
          )}
          <div className="modal-content w-[45rem] h-[30rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">Add New Announcement</h1>
                  <IoClose
                    onClick={handleClose}
                    class="dialog-title-bar-icon"
                  ></IoClose>
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
              <div className="create-announcement-form-container">
                <div className="create-announcement-scrollable-area">
                  {/*UPLOADER - DETAILS*/}
                  <div className="create-announcement-uploader">
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="navbar-profile-img"
                    />
                    <div className="create-announcement-info-container">
                      <label className="font-bold font-subTitle text-[15px]">
                        {user.name}
                      </label>
                      <label className="announcement-uploadedby-position">
                        {user.role}
                      </label>
                    </div>
                  </div>
                  {/*CATEGORY, TITLE, CONTENT*/}
                  <div className="create-announcement-body">
                    <div className="employee-form-group">
                      <label for="resID" className="form-label">
                        Category<label className="text-red-600">*</label>
                      </label>
                      <select
                        id="category"
                        value={announcementForm.category}
                        name="category"
                        onChange={handleInputChange}
                        className="form-input h-[30px]"
                        required
                      >
                        <option value="" selected>
                          Select
                        </option>
                        {categoryList.map((element) => (
                          <option value={element}>{element}</option>
                        ))}
                      </select>
                    </div>
                    <div className="employee-form-group">
                      <label className="form-label">
                        Title<label className="text-red-600">*</label>
                      </label>
                      <input
                        type="text"
                        value={announcementForm.title}
                        id="title"
                        name="title"
                        onChange={handleInputChange}
                        className="form-input h-[30px]"
                        required
                      />
                    </div>
                  </div>
                  <div className="employee-form-group">
                    <label className="form-label">
                      Content<label className="text-red-600">*</label>
                    </label>

                    <textarea
                      type="text"
                      id="content"
                      name="content"
                      value={announcementForm.content}
                      onChange={handleInputChange}
                      maxLength={1000}
                      className="block w-full h-[140px] resize-none rounded-[8px] border border-btn-color-gray shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-subTitle font-medium text-sm p-2"
                      required
                    />
                    <div className="textarea-length-text">
                      {announcementForm.content.length}/1000
                    </div>
                  </div>
                  {/* Event Details */}
                  {announcementForm.eventdetails && (
                    <div className="employee-form-group">
                      <label className="font-semibold text-navy-blue">
                        Event Details
                      </label>
                      <p>
                        {announcementForm.eventdetails
                          .split("\n")
                          .map((line, index) => (
                            <React.Fragment key={index}>
                              {line}
                              <br />
                            </React.Fragment>
                          ))}
                      </p>
                    </div>
                  )}
                  {havePicture && (
                    <div className="employee-form-group">
                      <label className="font-semibold text-navy-blue">
                        Attachment
                      </label>
                      <div className="create-announcement-attach-box">
                        <IoClose
                          onClick={handleRemovePic}
                          class="create-announcement-close-btn"
                        ></IoClose>

                        <img
                          src={announcementForm.picture}
                          className="create-announcement-attach-img"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="create-announcement-bottom-container">
                  {/*ADD TO YOUR POST AND SUBMIT BUTTON*/}
                  <div className="create-announcement-fixed-btns">
                    <label className="font-semibold text-navy-blue">
                      Add to your post
                    </label>
                    <div className="flex flex-row items-center justify-center">
                      <button
                        type="button"
                        onClick={handleUploadPicture}
                        className=" text-[#50C700] "
                      >
                        <MdInsertPhoto className="create-announcement-icons" />
                      </button>
                      <input
                        name="picture"
                        onChange={handleInputChange}
                        type="file"
                        style={{ display: "none" }}
                        ref={hiddenInputRef1}
                      />

                      <button
                        type="button"
                        onClick={handleEvent}
                        className=" text-[#FFB200] "
                      >
                        <MdCalendarMonth className="create-announcement-icons" />
                      </button>

                      {/*SHOW EVENT DETAILS */}
                      {showDateTimeInputs && (
                        <div className="modal-container">
                          <div className="create-announcement-event-details">
                            <div className="dialog-title-bar">
                              <div className="flex flex-col w-full">
                                <div className="dialog-title-bar-items">
                                  <h1 className="modal-title">Event Details</h1>
                                  <IoClose
                                    onClick={handleCancel}
                                    class="dialog-title-bar-icon"
                                  ></IoClose>
                                </div>
                                <hr className="dialog-line" />
                              </div>
                            </div>

                            <div className="modal-form-container">
                              <div className="modal-form">
                                <div className="employee-form-group">
                                  <label className="form-label">
                                    Date
                                    <label className="text-red-600">*</label>
                                  </label>
                                  <DatePicker
                                    multiple
                                    value={announcementForm.date}
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
                                      boxShadow:
                                        "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                                      fontFamily: "Quicksand",
                                      fontWeight: 500,
                                      fontSize: "0.875rem",
                                      appearance: "none",
                                      outline: "none",
                                    }}
                                  />
                                </div>

                                {announcementForm.date?.length > 0 && (
                                  <div className="employee-form-group">
                                    <label className="form-label">
                                      Select Start and End Times
                                    </label>
                                    {announcementForm.date.map((date) => {
                                      const times =
                                        announcementForm.times[date] || {};
                                      return (
                                        <div
                                          key={date}
                                          className="timedate-container"
                                        >
                                          <span className="timedate-label">
                                            {date}
                                          </span>
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
                                              handleStartTimeChange(
                                                date,
                                                e.target.value
                                              )
                                            }
                                            className="form-input h-[30px] w-24"
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
                                              handleEndTimeChange(
                                                date,
                                                e.target.value
                                              )
                                            }
                                            className="form-input h-[30px] w-24"
                                            required
                                          />
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                                <div className="flex justify-center">
                                  <button
                                    onClick={handleOK}
                                    type="button"
                                    className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                                  >
                                    OK
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="hover:bg-[#0A7A9D] px-8 py-3 rounded-[8px] items-center text-[#fff] font-bold shadow-box-shadow font-title truncate overflow-hidden whitespace-nowrap bg-btn-color-blue w-full"
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

export default CreateAnnouncement;
