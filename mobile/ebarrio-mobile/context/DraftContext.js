import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const DraftContext = createContext(undefined);

export const DraftProvider = ({ children }) => {
  const residentInitialForm = {
    id: "",
    signature: "",
    firstname: "",
    middlename: "",
    lastname: "",
    suffix: "",
    alias: "",
    salutation: "",
    sex: "",
    gender: "",
    birthdate: "",
    age: "",
    birthplace: "",
    civilstatus: "",
    bloodtype: "",
    religion: "",
    nationality: "",
    voter: "",
    precinct: "",
    deceased: "",
    email: "",
    mobilenumber: "+63",
    telephone: "+63",
    facebook: "",
    emergencyname: "",
    emergencymobilenumber: "+63",
    emergencyaddress: "",
    employmentstatus: "",
    employmentfield: "",
    occupation: "",
    monthlyincome: "",
    educationalattainment: "",
    householdno: "",
    householdposition: "",
    head: "",
    course: "",
    isSenior: false,
    isInfant: false,
    isNewborn: false,
    isUnder5: false,
    isSchoolAge: false,
    isAdolescent: false,
    isAdolescentPregnant: false,
    isAdult: false,
    isPostpartum: false,
    isWomenOfReproductive: false,
    isPregnant: false,
    isPWD: false,
    philhealthid: "",
    philhealthtype: "",
    philhealthcategory: "",
    haveHypertension: false,
    haveDiabetes: false,
    haveTubercolosis: false,
    haveSurgery: false,
    lastmenstrual: "",
    haveFPmethod: "",
    fpmethod: "",
    fpstatus: "",
  };

  const householdInitialForm = {
    members: [],
    vehicles: [],
    ethnicity: "",
    tribe: "",
    sociostatus: "",
    nhtsno: "",
    watersource: "",
    toiletfacility: "",
    housenumber: "",
    street: "",
    HOAname: "",
    address: "",
  };

  const [residentForm, setResidentForm] = useState(residentInitialForm);
  const [householdForm, setHouseholdForm] = useState(householdInitialForm);

  // Load saved forms on mount
  useEffect(() => {
    (async () => {
      try {
        const savedResidentForm = await AsyncStorage.getItem("residentForm");
        if (savedResidentForm) setResidentForm(JSON.parse(savedResidentForm));

        const savedHouseholdForm = await AsyncStorage.getItem("householdForm");
        if (savedHouseholdForm)
          setHouseholdForm(JSON.parse(savedHouseholdForm));
      } catch (error) {
        console.error("Error loading forms from AsyncStorage:", error);
      }
    })();
  }, []);

  // Save forms whenever they change
  useEffect(() => {
    const saveForms = async () => {
      try {
        await AsyncStorage.setItem(
          "residentForm",
          JSON.stringify(residentForm)
        );
        await AsyncStorage.setItem(
          "householdForm",
          JSON.stringify(householdForm)
        );
      } catch (error) {
        console.error("Error saving forms to AsyncStorage:", error);
      }
    };

    saveForms();
  }, [residentForm, householdForm]);

  return (
    <DraftContext.Provider
      value={{
        residentForm,
        householdForm,
        setHouseholdForm,
        setResidentForm,
      }}
    >
      {children}
    </DraftContext.Provider>
  );
};
