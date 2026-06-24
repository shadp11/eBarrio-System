import { useRef, useState, useEffect, useContext } from "react";
import { InfoContext } from "../context/InfoContext";
import { AuthContext } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import api from "../api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

//SCREENS
import EditAnnouncement from "./EditAnnouncement";
import CreateAnnouncement from "./CreateAnnouncement";

//STYLES
import "../Stylesheets/CommonStyle.css";
import "../Stylesheets/Announcements.css";

//ICONS
import { BsPinAngleFill, BsPinAngle, BsThreeDots } from "react-icons/bs";
import { FaHeart, FaArchive, FaEdit } from "react-icons/fa";

function Announcements({ isCollapsed }) {
  dayjs.extend(relativeTime);
  const confirm = useConfirm();
  const { fetchAnnouncements, announcements } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  const [isCreateClicked, setCreateClicked] = useState(false);
  const [isEditClicked, setEditClicked] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All Announcement");
  const [pinnedAnnouncements, setPinnedAnnouncements] = useState([]);
  const [menuVisible, setMenuVisible] = useState(null);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState([]);
  const [sortOption, setSortOption] = useState("Newest");
  const menuRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    setPinnedAnnouncements(
      announcements.filter((announcement) => announcement.status === "Pinned")
    );
  }, [announcements]);

  const handleAdd = () => {
    setCreateClicked(true);
  };

  const handleEdit = (announcementID) => {
    setEditClicked(true);
    setSelectedAnnouncement(announcementID);
  };

  /* FILTER CATEGORY */
  const filteredAnnouncements = announcements.filter(
    (announcement) =>
      selectedCategory === "All Announcement" ||
      announcement.category === selectedCategory
  );

  /* SORTED ANNOUNCEMENTS */
  let sortedAnnouncements;
  if (sortOption === "Newest") {
    sortedAnnouncements = [...filteredAnnouncements].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  } else if (sortOption === "Oldest") {
    sortedAnnouncements = [...filteredAnnouncements].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  } else if (sortOption === "Archived") {
    sortedAnnouncements = filteredAnnouncements.filter(
      (item) => item.status === "Archived"
    );
  }

  /* PIN ANNOUNCEMENT */
  const togglePin = async (announcementID) => {
    if (loading) return;

    setLoading(true);
    try {
      await api.put(`/pinannouncement/${announcementID}`);
    } catch (error) {
      console.log("Error pinning announcement", error);
    } finally {
      setLoading(false);
    }
  };

  /* UNPIN ANNOUNCEMENT */
  const toggleUnpin = async (announcementID) => {
    if (loading) return;

    setLoading(true);
    try {
      await api.put(`/unpinannouncement/${announcementID}`);
    } catch (error) {
      console.log("Error pinning announcement", error);
    } finally {
      setLoading(false);
    }
  };

  /* ANNOUNCEMENT MENU */
  const toggleMenu = (id) => {
    setMenuVisible(menuVisible === id ? null : id);
  };

  /* EXPANDED ANNOUNCEMENTS */
  const toggleExpanded = (id) => {
    setExpandedAnnouncements((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const renderContent = (announcement) => {
    const words = announcement.content.split(" ");
    const isLong = words.length > 25;
    const isExpanded = expandedAnnouncements.includes(announcement._id);
    const displayText = isExpanded
      ? announcement.content
      : words.slice(0, 25).join(" ") + (isLong ? "..." : "");

    return (
      <div className="text-sm font-[600] mt-4 font-subTitle whitespace-pre-wrap">
        {announcement.eventdetails && (
          <>
            {announcement.eventdetails}
            <br />
          </>
        )}

        {displayText}
        {isLong && (
          <span
            className="text-blue-500 cursor-pointer ml-1 font-bold"
            onClick={() => toggleExpanded(announcement._id)}
          >
            {isExpanded ? "See less" : "See more"}
          </span>
        )}
      </div>
    );
  };

  const handleArchive = async (announcementID) => {
    const isConfirmed = await confirm(
      "Please confirm to proceed with archiving this announcement. You can restore this announcement later if needed.",
      "confirmred"
    );
    if (!isConfirmed) {
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      await api.put(`/archiveannouncement/${announcementID}`);
      confirm("The announcement has been successfully archived.", "success");
    } catch (error) {
      console.log("Error in archiving announcement", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (announcementID) => {
    const isConfirmed = await confirm(
      "Are you sure you want to recover this announcement?",
      "confirm"
    );
    if (!isConfirmed) {
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      await api.put(`/recoverannouncement/${announcementID}`);
      confirm("The announcement has been successfully recovered.", "success");
    } catch (error) {
      console.log("Error in recovering announcement", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        menuVisible
      ) {
        setMenuVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuVisible]);

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
        <div className="header-text">Announcements</div>

        <div className="announcement-container">
          {/* LEFT - CATEGORY */}
          <div className="announcement-category-panel ">
            <label className="announcement-subheader">Category</label>
            <div className="announcement-left-container font-subTitle font-medium text-[#5A5A5A]">
              {[
                "All Announcement",
                "General",
                "Public Safety & Emergency",
                "Health & Sanitation",
                "Social Services",
                "Infrastructure",
                "Education & Youth",
              ].map((cat) => (
                <div
                  key={cat}
                  className={`cursor-pointer px-3 py-2 ${
                    selectedCategory === cat ? "text-navy-blue font-bold" : ""
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-2/5 p-4">
            {(user.role === "Secretary" || user.role === "Clerk") && (
              <div className="announcement-create">
                <img
                  src={user.picture}
                  alt="Profile"
                  className="announcement-profile-img"
                />
                <button
                  onClick={handleAdd}
                  className="announcement-create-button"
                >
                  <label className="create-announcement-text">
                    Create Announcement
                  </label>
                </button>
              </div>
            )}

            {/* SORT OPTIONS - NEWEST, LATEST */}

            <div className="announcement-sort-container">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="announcement-sort-dropdown"
              >
                <option value="Newest">Newest</option>
                <option value="Oldest">Oldest</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* ALL ANNOUNCEMENTS */}
            {sortedAnnouncements
              .filter((announcement) =>
                sortOption === "Archived"
                  ? announcement.status === "Archived"
                  : announcement.status === "Not Pinned"
              )
              .map((announcement) => (
                <div key={announcement._id} className="announcement-card">
                  <div className="announcement-pin-date-menu">
                    <h1 className="announcement-time">
                      {dayjs(announcement.createdAt).fromNow()}
                    </h1>

                    <div>
                      {(user.role === "Secretary" || user.role === "Clerk") &&
                        sortOption !== "Archived" && (
                          <button
                            onClick={() => togglePin(announcement._id)}
                            className="mr-1"
                          >
                            <BsPinAngle />
                          </button>
                        )}

                      {(user.role === "Secretary" ||
                        announcement.uploadedby._id === user.empID) && (
                        <button
                          onClick={() => toggleMenu(announcement._id)}
                          className="mr-1"
                        >
                          <BsThreeDots />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* MENU */}
                  {menuVisible === announcement._id && (
                    <div className="announcement-menu" ref={menuRef}>
                      <ul className="w-full">
                        {sortOption === "Archived" ? (
                          <div
                            className="navbar-dropdown-item justify-start"
                            onClick={() => handleRecover(announcement._id)}
                          >
                            <FaEdit className="ml-2" />
                            <li className="announcement-menu-text">Recover</li>
                          </div>
                        ) : (
                          <>
                            <div
                              className="navbar-dropdown-item justify-start"
                              onClick={() => handleEdit(announcement._id)}
                            >
                              <FaEdit className="ml-2" />
                              <li className="announcement-menu-text">Edit</li>
                            </div>
                            <div
                              className="navbar-dropdown-item justify-start"
                              onClick={() => handleArchive(announcement._id)}
                            >
                              <FaArchive className="text-red-600 ml-2 text-sm" />

                              <li className="text-red-600 announcement-menu-text">
                                Archive
                              </li>
                            </div>
                          </>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* UPLOADED BY - DETAILS */}
                  <div className="announcement-uploadedby-container">
                    <img
                      src={announcement.uploadedby?.resID?.picture}
                      alt="Profile"
                      className="announcement-profile-img"
                    />
                    <div className="flex flex-col">
                      <label className="font-bold font-subTitle text-[15px]">
                        {announcement.uploadedby?.resID?.firstname}{" "}
                        {announcement.uploadedby?.resID?.lastname}
                      </label>
                      <label className="announcement-uploadedby-position">
                        {announcement.uploadedby?.position}
                      </label>
                    </div>
                  </div>

                  {/* CATEGORY, TITLE */}
                  <div>
                    <label className="announcement-heart-value">
                      {announcement.category}
                    </label>
                  </div>
                  <div>
                    <label className="announcement-heart-value text-gray-500 !font-semibold">
                      {announcement.title}
                    </label>
                  </div>

                  {/* CONTENT */}
                  {renderContent(announcement)}

                  {/* ATTACHMENT */}
                  {announcement.picture &&
                    announcement.picture.trim() !== "" && (
                      <img
                        src={announcement.picture}
                        alt="Attachment"
                        className="w-full mt-4 rounded-md"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    )}

                  <div className="announcement-heart-container">
                    <FaHeart className="announcement-heart" />
                    <h3 className="announcement-heart-value">
                      {announcement.hearts}
                    </h3>
                  </div>
                </div>
              ))}
          </div>

          {/* RIGHT - PINNED ANNOUNCEMENTS */}
          <div className="announcement-pinned-panel ">
            <h1 className="font-bold mb-2">Pinned Announcements</h1>

            {/* ALL PINNED ANNOUNCEMENTS */}
            {pinnedAnnouncements.map((announcement) => (
              <div key={announcement._id} className="announcement-card">
                <div className="announcement-pin-date-menu">
                  <h1 className="announcement-time">
                    {dayjs(announcement.createdAt).fromNow()}
                  </h1>
                  <div>
                    {(user.role === "Secretary" || user.role === "Clerk") && (
                      <button
                        onClick={() => toggleUnpin(announcement._id)}
                        className="mr-1"
                      >
                        <BsPinAngleFill />
                      </button>
                    )}
                    {(user.role === "Secretary" ||
                      announcement.uploadedby?._id === user.empID) && (
                      <button
                        onClick={() => toggleMenu(announcement._id)}
                        className="mr-1"
                      >
                        <BsThreeDots />
                      </button>
                    )}
                  </div>

                  {/* MENU */}
                  {menuVisible === announcement._id && (
                    <div className="announcement-menu" ref={menuRef}>
                      <ul className="w-full">
                        <div
                          className="navbar-dropdown-item justify-start"
                          onClick={() => handleEdit(announcement._id)}
                        >
                          <FaEdit className="ml-2" />
                          <li className="announcement-menu-text">Edit</li>
                        </div>
                        <div
                          className="navbar-dropdown-item justify-start"
                          onClick={handleArchive}
                        >
                          <FaArchive className="text-red-600 ml-2 text-sm" />
                          <li className="text-red-600 announcement-menu-text">
                            Archive
                          </li>
                        </div>
                      </ul>
                    </div>
                  )}
                </div>

                {/* UPLOADED BY - DETAILS */}
                <div className="announcement-uploadedby-container">
                  <img
                    src={announcement.uploadedby?.resID?.picture}
                    alt="Profile"
                    className="announcement-profile-img"
                  />
                  <div className="flex flex-col">
                    <label className="font-bold font-subTitle text-[15px]">
                      {announcement.uploadedby?.resID?.firstname}{" "}
                      {announcement.uploadedby?.resID?.lastname}
                    </label>
                    <label className="announcement-uploadedby-position">
                      {announcement.uploadedby?.position}
                    </label>
                  </div>
                </div>
 
                {/* CATEGORY, TITLE */}

                <div>
                  <label className="announcement-info-label">Category: </label>
                  <label className="announcement-heart-value">
                    {announcement.category}
                  </label>
                </div>
                <div>
                  <label className="announcement-info-label">Title: </label>
                  <label className="announcement-heart-value">
                    {announcement.title}
                  </label>
                </div>

                {/* CONTENT */}

                {renderContent(announcement)}

                {/* ATTACHMENT */}
                {announcement.picture && announcement.picture.trim() !== "" && (
                  <img
                    src={announcement.picture}
                    alt="Attachment"
                    className="w-full mt-4 rounded-md"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}

                <div className="announcement-heart-container">
                  <FaHeart className="announcement-heart" />
                  <h3 className="announcement-heart-value">
                    {announcement.hearts}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20"></div>
      </main>

      {isCreateClicked && (
        <CreateAnnouncement onClose={() => setCreateClicked(false)} />
      )}

      {isEditClicked && (
        <EditAnnouncement
          onClose={() => setEditClicked(false)}
          announcementID={selectedAnnouncement}
        />
      )}
    </>
  );
}

export default Announcements;
