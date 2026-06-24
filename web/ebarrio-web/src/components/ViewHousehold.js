import { useEffect, useRef, useState, useContext } from "react";
import { IoClose } from "react-icons/io5";
import api from "../api";
import { useConfirm } from "../context/ConfirmContext";
import { InfoContext } from "../context/InfoContext";
import { useNavigate } from "react-router-dom";

//STYLES
import "../App.css";
import "../Stylesheets/CommonStyle.css";

function ViewHousehold({ onClose, householdID }) {
  const confirm = useConfirm();
  const navigation = useNavigate();
  const [showModal, setShowModal] = useState(true);
  const [selectedHousehold, setSelectedHousehold] = useState([]);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editedPosition, setEditedPosition] = useState("");
  const [selectedChangeID, setSelectedChangeID] = useState(null);
  const { fetchResidents, residents } = useContext(InfoContext);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  useEffect(() => {
    fetchHousehold();
  }, []);

  const fetchHousehold = async () => {
    try {
      const response = await api.get(`/gethousehold/${householdID}`);
      setSelectedHousehold(response.data);
      setSelectedChangeID(null);
    } catch (error) {
      console.log("Error in fetching household", error);
    }
  };

  const sortedMembers = Array.isArray(selectedHousehold.members)
    ? [...selectedHousehold.members].sort((a, b) => {
        if (a.position?.toLowerCase() === "head") return -1;
        if (b.position?.toLowerCase() === "head") return 1;
        return 0;
      })
    : [];

  const getHouseholdChange = async (changeID) => {
    try {
      const res = await api.get(`/gethouseholdchange/${changeID}`);
      setSelectedHousehold(res.data);
      setSelectedChangeID(changeID);
    } catch (error) {
      console.log("Error in fetching household change", error);
    }
  };

  const approveHouseholdChange = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to approve this change in household?",
      "confirm"
    );
    if (!isConfirmed) return;
    if (loading) return;

    setLoading(true);
    try {
      const res = await api.post(
        `/approve/household/${householdID}/change/${selectedChangeID}`
      );
      setSelectedChangeID(null);
      setSelectedHousehold(res.data.household);
      confirm(
        "The change in household information has been successfully approved.",
        "success"
      );
    } catch (error) {
      console.log("Error in fetching household change", error);
    } finally {
      setLoading(false);
    }
  };

  const rejectHouseholdChange = async () => {
    const isConfirmed = await confirm(
      "Are you sure you want to reject this change in household?",
      "confirmred"
    );
    if (!isConfirmed) return;
    if (loading) return;

    setLoading(true);
    try {
      const res = await api.post(
        `/reject/household/${householdID}/change/${selectedChangeID}`
      );
      setSelectedChangeID(null);
      setSelectedHousehold(res.data.household);
      confirm(
        "The change in household information has been successfully rejected.",
        "success"
      );
    } catch (error) {
      console.log("Error in rejecting household change", error);
    } finally {
      setLoading(false);
    }
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
          <div className="modal-content w-[80rem] h-[40rem]">
            <div className="dialog-title-bar">
              <div className="flex flex-col w-full">
                <div className="dialog-title-bar-items">
                  <h1 className="modal-title">View Household</h1>
                  <IoClose
                    onClick={handleClose}
                    className="dialog-title-bar-icon"
                  />
                </div>
                <hr className="dialog-line" />
              </div>
            </div>

            {selectedHousehold && (
              <div className="modal-form-container">
                <div className="modal-form">
                  {selectedChangeID ? (
                    <div onClick={() => fetchHousehold()}>
                      <p>Current Info</p>
                    </div>
                  ) : (
                    <>
                      {selectedHousehold.change?.length > 0 && (
                        <>
                          <h2>Change Requests:</h2>
                          {selectedHousehold.change.map((c, index) => (
                            <div
                              key={c.changeID?._id || index}
                              onClick={() => getHouseholdChange(c.changeID)}
                              className="change-item"
                            >
                              <p>Change {index + 1}</p>
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  )}
                  <div className="w-full">
                    {/* Household Information Card */}
                    <div className="w-full p-6 bg-white rounded-lg shadow-md grid grid-cols-1 sm:grid-cols-2 gap-y-6">
                      <div className="flex flex-col">
                        <label className="font-semibold text-gray-700">
                          <strong>Household No.:</strong>
                        </label>
                        <span className="text-gray-600">
                          {selectedHousehold.householdno}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <label className="font-semibold text-gray-700">
                          <strong>Address:</strong>
                        </label>
                        <span className="text-gray-600">
                          {selectedHousehold.address}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <label className="font-semibold text-gray-700">
                          <strong>Ethnicity:</strong>
                        </label>
                        <span className="text-gray-600">
                          {selectedHousehold.ethnicity}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <label className="font-semibold text-gray-700">
                          <strong>Socioeconomic Status:</strong>
                        </label>
                        <span className="text-gray-600">
                          {selectedHousehold.sociostatus}
                        </span>
                      </div>

                      {selectedHousehold.ethnicity === "IP Household" && (
                        <div className="flex flex-col">
                          <label className="font-semibold text-gray-700">
                            <strong>Tribe:</strong>
                          </label>
                          <span className="text-gray-600">
                            {selectedHousehold.tribe}
                          </span>
                        </div>
                      )}

                      {(selectedHousehold.sociostatus === "NHTS Non-4Ps" ||
                        selectedHousehold.sociostatus === "NHTS 4Ps") && (
                        <div className="flex flex-col">
                          <label className="font-semibold text-gray-700">
                            <strong>NHTS No.:</strong>
                          </label>
                          <span className="text-gray-600">
                            {selectedHousehold.nhtsno}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col">
                        <label className="font-semibold text-gray-700">
                          <strong>Water Source:</strong>
                        </label>
                        <span className="text-gray-600">
                          {selectedHousehold.watersource}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <label className="font-semibold text-gray-700">
                          <strong>Toilet Facility:</strong>
                        </label>
                        <span className="text-gray-600">
                          {selectedHousehold.toiletfacility}
                        </span>
                      </div>
                    </div>

                    {/* Members Table */}
                    <div className="w-full mt-8">
                      <h1 className="font-bold">Members:</h1>
                      {selectedHousehold.members &&
                      selectedHousehold.members.length > 0 ? (
                        <div className="h-auto mt-2 overflow-x-auto">
                          <table className="household-tbl-container">
                            <thead>
                              <tr>
                                <th className="household-tbl-th">#</th>
                                <th className="household-tbl-th">Name</th>
                                <th className="household-tbl-th">
                                  Position in the Family
                                </th>
                                <th className="household-tbl-th">Sex</th>
                                <th className="household-tbl-th">Age</th>
                                <th className="household-tbl-th">Birthdate</th>
                                <th className="household-tbl-th">
                                  Civil Status
                                </th>
                                <th className="household-tbl-th">
                                  PhilHealth ID
                                </th>
                                <th className="household-tbl-th">
                                  Membership Type
                                </th>
                                <th className="household-tbl-th">
                                  PhilHealth Category
                                </th>
                                <th className="household-tbl-th">
                                  Medical History
                                </th>
                                <th className="household-tbl-th">
                                  Last Menstrual Period
                                </th>
                                <th className="household-tbl-th">
                                  Using any FP method?
                                </th>
                                <th className="household-tbl-th">
                                  Family Planning Method
                                </th>
                                <th className="household-tbl-th">FP Status</th>
                                <th className="household-tbl-th">
                                  Classification
                                </th>
                                <th className="household-tbl-th">
                                  Educational Attainment
                                </th>
                                <th className="household-tbl-th">Religion</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sortedMembers.map((member, index) => (
                                <tr key={index}>
                                  <td className="household-tbl-th">
                                    {index + 1}
                                  </td>
                                  <td className="household-tbl-th">
                                    {member.resID.lastname},{" "}
                                    {member.resID.firstname}
                                  </td>
                                  <td className="household-tbl-th">
                                    {member.position}
                                  </td>
                                  <td className="household-tbl-th">
                                    {member.resID.sex}
                                  </td>
                                  <td className="household-tbl-th">
                                    {member.resID.age}
                                  </td>
                                  <td className="household-tbl-th">
                                    {member.resID.birthdate}
                                  </td>
                                  <td className="household-tbl-th">
                                    {member.resID.civilstatus}
                                  </td>
                                  <td className="household-tbl-th">
                                    {member.resID.philhealthid || "N/A"}
                                  </td>
                                  <td className="household-tbl-th">
                                    {member.resID.philhealthtype || "N/A"}
                                  </td>
                                  <td className="household-tbl-th">
                                    {member.resID.philhealthcategory || "N/A"}
                                  </td>
                                  <td className="household-tbl-th">
                                    {member.resID.haveDiabetes ||
                                    member.resID.haveHypertension ||
                                    member.resID.haveTubercolosis ||
                                    member.resID.haveSurgery ? (
                                      <>
                                        {member.resID.haveDiabetes && (
                                          <div>Diabetes</div>
                                        )}
                                        {member.resID.haveHypertension && (
                                          <div>Hypertension</div>
                                        )}
                                        {member.resID.haveTubercolosis && (
                                          <div>Tubercolosis</div>
                                        )}
                                        {member.resID.haveSurgery && (
                                          <div>Surgery</div>
                                        )}
                                      </>
                                    ) : (
                                      "N/A"
                                    )}
                                  </td>
                                  <td className="household-tbl-th">
                                    {member.resID.lastmenstrual || "N/A"}
                                  </td>
                                  <td className="household-tbl-th">
                                    {member.resID.haveFPmethod || "N/A"}
                                  </td>
                                  <td className="household-tbl-th">
                                    {member.resID.fpmethod || "N/A"}
                                  </td>
                                  <td className="household-tbl-th">
                                    {member.resID.fpstatus || "N/A"}
                                  </td>
                                  <td className="household-tbl-th">
                                    {member.resID.isSenior ||
                                    member.resID.isInfant ||
                                    member.resID.isPregnant ||
                                    member.resID.isPWD ||
                                    member.resID.isNewborn ||
                                    member.resID.isUnder5 ||
                                    member.resID.isSchoolAge ||
                                    member.resID.isAdolescent ||
                                    member.resID.isAdolescentPregnant ||
                                    member.resID.isAdult ||
                                    member.resID.isPostpartum ||
                                    member.resID.isWomenOfReproductive ? (
                                      <>
                                        {member.resID.isSenior && (
                                          <div>Senior Citizen</div>
                                        )}
                                        {member.resID.isInfant && (
                                          <div>Infant</div>
                                        )}
                                        {member.resID.isPregnant && (
                                          <div>Pregnant</div>
                                        )}
                                        {member.resID.isPWD && <div>PWD</div>}
                                        {member.resID.is4Ps && <div>4Ps</div>}
                                        {member.resID.isSoloParent && (
                                          <div>Solo Parent</div>
                                        )}
                                        {member.resID.isNewborn && (
                                          <div>Newborn</div>
                                        )}
                                        {member.resID.isUnder5 && (
                                          <div>Under 5 y.o.</div>
                                        )}
                                        {member.resID.isSchoolAge && (
                                          <div>School Age</div>
                                        )}
                                        {member.resID.isAdolescent && (
                                          <div>Adolescent</div>
                                        )}
                                        {member.resID.isAdolescentPregnant && (
                                          <div>Adolescent Pregnant</div>
                                        )}
                                        {member.resID.isAdult && (
                                          <div>Adult</div>
                                        )}
                                        {member.resID.isPostpartum && (
                                          <div>Postpartum</div>
                                        )}
                                        {member.resID.isWomenOfReproductive && (
                                          <div>Women of Reproductive Age</div>
                                        )}
                                      </>
                                    ) : (
                                      "N/A"
                                    )}
                                  </td>
                                  <td className="household-tbl-th">
                                    {member.resID.educationalattainment ||
                                      "N/A"}
                                  </td>
                                  <td className="household-tbl-th">
                                    {member.resID.religion || "N/A"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p>No members found.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h1 className="mt-8 font-bold">Vehicles:</h1>
                    {selectedHousehold.vehicles &&
                    selectedHousehold.vehicles.length > 0 ? (
                      <div className="h-auto mt-2">
                        <table className="household-tbl-container">
                          <thead>
                            <tr>
                              <th className="household-tbl-th">#</th>
                              <th className="household-tbl-th">Model</th>
                              <th className="household-tbl-th">Color</th>
                              <th className="household-tbl-th">Kind</th>
                              <th className="household-tbl-th">Plate Number</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedHousehold.vehicles.map(
                              (vehicle, index) => (
                                <tr key={index}>
                                  <td className="household-tbl-th">
                                    {index + 1}
                                  </td>
                                  <td className="household-tbl-th">
                                    {vehicle.model}
                                  </td>
                                  <td className="household-tbl-th">
                                    {vehicle.color}
                                  </td>
                                  <td className="household-tbl-th">
                                    {vehicle.kind}
                                  </td>
                                  <td className="household-tbl-th">
                                    {vehicle.platenumber}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p>No vehicles found.</p>
                    )}
                  </div>
                  {selectedChangeID && (
                    <div>
                      <button
                        type="button"
                        onClick={rejectHouseholdChange}
                        className="actions-btn bg-btn-color-red hover:bg-red-700"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={approveHouseholdChange}
                        className="actions-btn bg-btn-color-blue hover:bg-[#0A7A9D]"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ViewHousehold;
