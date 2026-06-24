import Resident from "../models/Residents.js";
import Household from "../models/Households.js";
import User from "../models/Users.js";
import ChangeHousehold from "../models/ChangeHouseholds.js";
import ChangeResident from "../models/ChangeResident.js";
import moment from "moment";
import ActivityLog from "../models/ActivityLogs.js";

export const updateResident = async (req, res) => {
  try {
    const { userID, resID, empID } = req.user;
    const {
      picture,
      signature,
      firstname,
      middlename,
      lastname,
      suffix,
      alias,
      salutation,
      sex,
      gender,
      birthdate,
      birthplace,
      civilstatus,
      bloodtype,
      religion,
      nationality,
      voter,
      precinct,
      deceased,
      email,
      mobilenumber,
      telephone,
      facebook,
      emergencyname,
      emergencymobilenumber,
      emergencyaddress,
      HOAname,
      employmentstatus,
      occupation,
      monthlyincome,
      educationalattainment,
      typeofschool,
      course,
      isPregnant,
      isSenior,
      isInfant,
      isNewborn,
      isUnder5,
      isSchoolAge,
      isAdolescent,
      isAdolescentPregnant,
      isAdult,
      isPostpartum,
      isWomenOfReproductive,
      isPWD,
      philhealthid,
      philhealthtype,
      philhealthcategory,
      haveHypertension,
      haveDiabetes,
      haveTubercolosis,
      haveSurgery,
      lastmenstrual,
      haveFPmethod,
      fpmethod,
      fpstatus,
      householdno,
      householdposition,
      head,
      householdForm,
    } = req.body;

    const birthDate = moment(birthdate, "YYYY/MM/DD");
    const age = moment().diff(birthDate, "years");

    const resident = await Resident.findById(resID);

    const household = await Household.findById(resident.householdno);

    const personalPayload = {
      picture,
      signature,
      firstname,
      middlename,
      lastname,
      suffix,
      alias,
      salutation,
      sex,
      gender,
      birthdate,
      age,
      birthplace,
      civilstatus,
      bloodtype,
      religion,
      nationality,
      voter,
      precinct,
      deceased,
      email,
      mobilenumber,
      telephone,
      facebook,
      emergencyname,
      emergencymobilenumber,
      emergencyaddress,
      HOAname,
      employmentstatus,
      occupation,
      monthlyincome,
      educationalattainment,
      typeofschool,
      course,
      isSenior,
      isInfant,
      isNewborn,
      isUnder5,
      isSchoolAge,
      isAdolescent,
      isAdolescentPregnant,
      isAdult,
      isPostpartum,
      isWomenOfReproductive,
      isPWD,
      isPregnant,
      philhealthid,
      philhealthtype,
      philhealthcategory,
      haveHypertension,
      haveDiabetes,
      haveTubercolosis,
      haveSurgery,
      lastmenstrual,
      haveFPmethod,
      fpmethod,
      fpstatus,
      householdno,
    };
    let changePayload = {};

    if (empID) {
      Object.assign(resident, personalPayload);
    } else {
      Object.assign(changePayload, personalPayload);
    }

    // If the resident has chosen household
    if (household) {
      const isHead = household?.members?.some(
        (member) =>
          member.resID.toString() === resident._id.toString() &&
          member.position === "Head"
      );

      if (isHead) {
        const headMember = household.members.find((m) => m.position === "Head");

        if (!empID) {
          // ✅ Case A: Head is moving OUT of this household
          if (
            householdno &&
            householdno.toString() !== resident.householdno.toString()
          ) {
            changePayload.householdno = householdno;
            changePayload.householdposition = householdposition;
            changePayload.head = head;
          } else if (
            householdno &&
            householdno.toString() === resident.householdno.toString()
          ) {
            const normalizeMembers = (members) =>
              members
                .filter((m) => m.position !== "Head")
                .map((m) => ({
                  resID: (m.resID?._id || m.resID)?.toString(),
                  position: m.position,
                }))
                .sort((a, b) => a.resID.localeCompare(b.resID)); // prevent order mismatch

            const normalizeArray = (arr) => (arr || []).map(String).sort();

            const oldMembers = normalizeMembers(household.members);
            const newMembers = normalizeMembers(householdForm.members);

            const oldVehicles = normalizeArray(household.vehicles);
            const newVehicles = normalizeArray(householdForm.vehicles);

            console.log("🔎 Debug Household Comparison:");
            console.log("Members (DB):", JSON.stringify(oldMembers, null, 2));
            console.log("Members (Form):", JSON.stringify(newMembers, null, 2));
            console.log("Vehicles (DB):", JSON.stringify(oldVehicles, null, 2));
            console.log(
              "Vehicles (Form):",
              JSON.stringify(newVehicles, null, 2)
            );
            console.log(
              "Ethnicity DB vs Form:",
              household.ethnicity,
              householdForm.ethnicity
            );
            console.log(
              "Tribe DB vs Form:",
              household.tribe,
              householdForm.tribe
            );
            console.log(
              "Socio DB vs Form:",
              household.sociostatus,
              householdForm.sociostatus
            );
            console.log(
              "NHTS DB vs Form:",
              household.nhtsno,
              householdForm.nhtsno
            );
            console.log(
              "Water DB vs Form:",
              household.watersource,
              householdForm.watersource
            );
            console.log(
              "Toilet DB vs Form:",
              household.toiletfacility,
              householdForm.toiletfacility
            );
            console.log(
              "Address DB vs Form:",
              household.address,
              householdForm.address
            );

            const hasHouseholdChanges =
              JSON.stringify(oldMembers) !== JSON.stringify(newMembers) ||
              JSON.stringify(oldVehicles) !== JSON.stringify(newVehicles) ||
              (household.ethnicity || "") !== (householdForm.ethnicity || "") ||
              (household.tribe || "") !== (householdForm.tribe || "") ||
              (household.sociostatus || "") !==
                (householdForm.sociostatus || "") ||
              (household.nhtsno || "") !== (householdForm.nhtsno || "") ||
              (household.watersource || "") !==
                (householdForm.watersource || "") ||
              (household.toiletfacility || "") !==
                (householdForm.toiletfacility || "") ||
              (household.address || "") !== (householdForm.address || "");

            console.log("➡️ hasHouseholdChanges:", hasHouseholdChanges);

            if (hasHouseholdChanges) {
              const updated = await ChangeHousehold.create({
                members: [headMember, ...householdForm.members],
                vehicles: householdForm.vehicles,
                ethnicity: householdForm.ethnicity,
                tribe: householdForm.tribe,
                sociostatus: householdForm.sociostatus,
                nhtsno: householdForm.nhtsno,
                watersource: householdForm.watersource,
                toiletfacility: householdForm.toiletfacility,
                address: householdForm.address,
              });
              household.status = "Change Requested";
              household.change.push({ changeID: updated._id });

              console.log("✅ ChangeHousehold created:", updated._id);
            } else {
              console.log(
                "🚫 No household changes detected. Skipping ChangeHousehold creation."
              );
            }
          }
        } else {
          if (
            householdno &&
            householdno.toString() !== resident.householdno.toString()
          ) {
            const newHouse = await Household.findById(householdno);
            const otherActiveMembers = household.members.filter(
              (mem) => mem.resID.toString() !== resident._id.toString()
            );

            let eligibleMembers = otherActiveMembers.filter(
              (mem) => mem.resID.age >= 18
            );

            if (!eligibleMembers.length) eligibleMembers = otherActiveMembers;

            if (eligibleMembers.length) {
              // Pick oldest as new Head
              const newHead = eligibleMembers.reduce((prev, curr) =>
                curr.resID.age > prev.resID.age ? curr : prev
              );

              household.members = household.members.map((mem) => {
                if (mem.resID.toString() === newHead.resID.toString()) {
                  return { ...mem, position: "Head" };
                }
                return mem;
              });

              household.members = household.members.filter(
                (mem) => mem.resID.toString() !== resident._id.toString()
              );
            } else {
              // No eligible members → archive household
              household.status = "Archived";
            }
            resident.householdno = newHouse._id;
            newHouse.members.push({
              resID: resident._id,
              position: householdposition,
            });
            await newHouse.save();
          } else if (
            householdno &&
            householdno.toString() === resident.householdno.toString()
          ) {
            // Employee override
            const oldMemberIds = household.members
              .filter((m) => m.position !== "Head")
              .map((m) =>
                m.resID._id ? m.resID._id.toString() : m.resID.toString()
              );
            const newMemberIds = householdForm.members.map((m) =>
              m.resID._id ? m.resID._id.toString() : m.resID.toString()
            );

            const memberIdsChanged =
              oldMemberIds.length !== newMemberIds.length ||
              oldMemberIds.some((id) => !newMemberIds.includes(id));

            if (memberIdsChanged) {
              // Only then do the remove/add logic
              for (const oldId of oldMemberIds) {
                if (!newMemberIds.includes(oldId)) {
                  const resident = await Resident.findById(oldId);
                  if (resident) {
                    resident.householdno = undefined;
                    await resident.save();
                  }
                }
              }

              for (const newId of newMemberIds) {
                if (!oldMemberIds.includes(newId)) {
                  const resident = await Resident.findById(newId);
                  if (resident) {
                    resident.householdno = household._id;
                    await resident.save();
                  }
                }
              }
            }

            // Update household fields no matter what

            const headMember = household.members.find(
              (m) => m.position === "Head"
            );
            household.members = [headMember, ...householdForm.members];
            household.vehicles = householdForm.vehicles;
            household.ethnicity = householdForm.ethnicity;
            household.tribe = householdForm.tribe;
            household.sociostatus = householdForm.sociostatus;
            household.nhtsno = householdForm.nhtsno;
            household.watersource = householdForm.watersource;
            household.toiletfacility = householdForm.toiletfacility;
            household.address = householdForm.address;
          }
        }

        await household.save();
      } else {
        // 🟢 Case C: Resident is NOT head and moving to another household
        if (householdno) {
          if (householdno.toString() !== resident.householdno.toString()) {
            if (!empID) {
              changePayload.householdno = householdno;
              changePayload.householdposition = householdposition;
              changePayload.head = head;
            } else {
              // Employee override (non-head)
              const newHousehold = await Household.findById(householdno);
              if (newHousehold) {
                newHousehold.members.push({
                  resID: resident._id,
                  position: householdposition,
                });
                await newHousehold.save();
              }

              const oldHousehold = await Household.findById(
                resident.householdno
              );
              if (oldHousehold) {
                oldHousehold.members = oldHousehold.members.filter(
                  (m) => m.resID.toString() !== resident._id.toString()
                );
                await oldHousehold.save();
              }
              resident.householdno = householdno;
            }
          } else {
            let members = [...householdForm.members];
            // Resident becomes head in new household
            if (head === "Yes") {
              if (!empID) {
                members.push({
                  resID: resident._id,
                  position: "Head",
                });
                const newhousehold = new Household({
                  ...householdForm,
                  members,
                });
                newhousehold.status = "Pending";
                await newhousehold.save();

                changePayload.householdno = newhousehold._id;
                changePayload.head = head;
              } else {
                members.push({
                  resID: resident._id,
                  position: "Head",
                });
                const newhousehold = new Household({
                  ...householdForm,
                  members,
                });
                newhousehold.status = "Active";
                await newhousehold.save();

                if (resident.householdno) {
                  const oldHousehold = await Household.findById(
                    resident.householdno
                  );
                  if (oldHousehold) {
                    // IDs of all members moving to new household
                    const movingMemberIds = members.map((m) =>
                      m.resID.toString()
                    );

                    // Check if any moved member was Head
                    const headsMoving = oldHousehold.members.filter(
                      (m) =>
                        movingMemberIds.includes(m.resID.toString()) &&
                        m.position === "Head"
                    );

                    // Remove them from old household
                    oldHousehold.members = oldHousehold.members.filter(
                      (m) => !movingMemberIds.includes(m.resID.toString())
                    );

                    // If any of the moved members was Head, assign a new Head
                    if (headsMoving.length && oldHousehold.members.length) {
                      // Pick oldest remaining member as new Head
                      const newHead = oldHousehold.members.reduce(
                        (prev, curr) =>
                          curr.resID.age > prev.resID.age ? curr : prev
                      );
                      oldHousehold.members = oldHousehold.members.map((m) =>
                        m.resID.toString() === newHead.resID.toString()
                          ? { ...m, position: "Head" }
                          : m
                      );
                    }

                    // Archive old household if empty
                    if (!oldHousehold.members.length)
                      oldHousehold.status = "Archived";

                    await oldHousehold.save();
                  }
                }

                // Update householdno for all moved members
                for (const m of members) {
                  const movedResident = await Resident.findById(m.resID);
                  if (movedResident) {
                    movedResident.householdno = newhousehold._id;
                    await movedResident.save();
                  }
                }

                resident.householdno = newhousehold._id;
                await resident.save();
              }
            } else {
              // Resident stays in the SAME household → only position changes
              if (!empID) {
                changePayload.householdno = householdno;
                changePayload.householdposition = householdposition;
                changePayload.head = head;
              } else {
                // Employee override (directly update position)
                household.members = household.members.map((m) => {
                  if (m.resID.toString() === resident._id.toString()) {
                    return {
                      ...(m.toObject ? m.toObject() : m),
                      position: householdposition,
                    };
                  }
                  return m;
                });

                await household.save();
              }
            }
          }
        }
      }
    }

    if (!empID && Object.keys(changePayload).length > 0) {
      const updated = await ChangeResident.create(changePayload);
      resident.changeID = updated._id;
      resident.status = "Change Requested";
    }

    await resident.save();

    if (empID) {
      await ActivityLog.insertOne({
        userID,
        action: "Update",
        target: "Residents",
        description: `User updated their resident profile.`,
      });
    } else {
      await ActivityLog.insertOne({
        userID,
        action: "Update",
        target: "Residents",
        description: `User requested a change to their resident profile.`,
      });
    }

    res.status(200).json({ message: "Resident successfully updated" });
  } catch (error) {
    console.log("Error updating resident", error);
    res.status(500).json({ message: "Failed to update resident" });
  }
};

export const getHousehold = async (req, res) => {
  try {
    const { householdID } = req.params;
    const household = await Household.findById(householdID).populate(
      "members.resID"
    );
    res.status(200).json(household);
  } catch (error) {
    console.log("Error fetching household", error);
    res.status(500).json({ message: "Failed to fetch household" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { resID } = req.user;
    const resident = await Resident.findById(resID)
      .select("-empID")
      .populate("empID")
      .populate("householdno")
      .exec();
    res.status(200).json(resident);
  } catch (error) {
    console.log("Error fetching profile", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
