import { useState, useEffect, useContext } from "react";
import { InfoContext } from "../context/InfoContext";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  //Bar Chart
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";

//STYLES
import "../Stylesheets/Dashboard.css";
import totalresidents from "..//assets/dashboard/residents.png";
import male from "../assets/dashboard/male.png";
import female from "..//assets/dashboard/female.png";

//ICONS
import { IoIosPeople } from "react-icons/io";
import { MdHowToVote, MdWorkOff } from "react-icons/md";
import { FaMale, FaFemale, FaHandsHelping } from "react-icons/fa";
import { FaHouse } from "react-icons/fa6";

function Dashboard({ isCollapsed }) {
  const navigation = useNavigate();
  const [residentsData, setResidentsData] = useState({});
  const [documentData, setDocumentData] = useState({});
  const [blotterData, setBlotterData] = useState({});
  const [classificationsData, setClassificationsData] = useState({});
  const [reservationData, setReservationData] = useState({});
  const {
    announcements,
    fetchAnnouncements,
    fetchReservations,
    courtreservations,
    residents,
    fetchResidents,
    certificates,
    fetchCertificates,
    blotterreports,
    fetchBlotterReports,
    fetchHouseholds,
    household,
  } = useContext(InfoContext);
  const [events, setEvents] = useState([]);
  const [isFetched, setIsFetched] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!isFetched) {
      fetchResidents();
      fetchCertificates();
      fetchAnnouncements();
      fetchReservations();
      fetchBlotterReports();
      fetchHouseholds();
      setIsFetched(true);
    }
  }, []);

  // Demographics Data
  useEffect(() => {
    const fetchResidentData = async () => {
      const totalResidents = residents.filter(
        (element) => element.status === "Active"
      ).length;

      const male = residents
        .filter((element) => element.sex === "Male")
        .filter((element) => element.status === "Active").length;

      const female = residents
        .filter((element) => element.sex === "Female")
        .filter((element) => element.status === "Active").length;

      const seniorCitizens = residents
        .filter((element) => element.age >= 60)
        .filter((element) => element.status === "Active").length;

      const voters = residents
        .filter((element) => element.voter === "Yes")
        .filter((element) => element.status === "Active").length;

      const PWD = residents
        .filter((element) => element.isPWD)
        .filter((element) => element.status === "Active").length;

      const pregnant = residents
        .filter((element) => element.isPregnant)
        .filter((element) => element.status === "Active").length;

      const fourps = household
        .filter((element) => element.sociostatus === "NHTS 4Ps")
        .filter((element) => element.status === "Active").length;

      const unemployed = residents.filter(
        (element) =>
          element.employmentstatus === "Unemployed" &&
          element.status === "Active"
      ).length;

      const totalHouseholds = household.filter(
        (element) =>
          element.status !== "Archived" &&
          element.status !== "Pending" &&
          element.status !== "Rejected"
      ).length;

      setClassificationsData({
        Newborn: residents
          .filter(
            (element) =>
              element.status !== "Archived" &&
              element.status !== "Pending" &&
              element.status !== "Rejected"
          )
          .filter((r) => r.isNewborn).length,
        Infant: residents
          .filter(
            (element) =>
              element.status !== "Archived" &&
              element.status !== "Pending" &&
              element.status !== "Rejected"
          )
          .filter((r) => r.isInfant).length,
        "Under 5 y.o": residents
          .filter(
            (element) =>
              element.status !== "Archived" &&
              element.status !== "Pending" &&
              element.status !== "Rejected"
          )
          .filter((r) => r.isUnder5).length,
        "School of Age": residents
          .filter(
            (element) =>
              element.status !== "Archived" &&
              element.status !== "Pending" &&
              element.status !== "Rejected"
          )
          .filter((r) => r.isSchoolAge).length,
        Adolescent: residents
          .filter(
            (element) =>
              element.status !== "Archived" &&
              element.status !== "Pending" &&
              element.status !== "Rejected"
          )
          .filter((r) => r.isAdolescent).length,
        "Adolescent Pregnant": residents
          .filter(
            (element) =>
              element.status !== "Archived" &&
              element.status !== "Pending" &&
              element.status !== "Rejected"
          )
          .filter((r) => r.isAdolescentPregnant).length,
        Adult: residents
          .filter(
            (element) =>
              element.status !== "Archived" &&
              element.status !== "Pending" &&
              element.status !== "Rejected"
          )
          .filter((r) => r.isAdult).length,
        Postpartum: residents
          .filter(
            (element) =>
              element.status !== "Archived" &&
              element.status !== "Pending" &&
              element.status !== "Rejected"
          )
          .filter((r) => r.isPostpartum).length,
        "Women of Reproductive Age": residents
          .filter(
            (element) =>
              element.status !== "Archived" &&
              element.status !== "Pending" &&
              element.status !== "Rejected"
          )
          .filter((r) => r.isWomenOfReproductive).length,
        "Senior Citizens": residents
          .filter(
            (element) =>
              element.status !== "Archived" &&
              element.status !== "Pending" &&
              element.status !== "Rejected"
          )
          .filter((r) => r.isSenior).length,
        Pregnant: residents
          .filter(
            (element) =>
              element.status !== "Archived" &&
              element.status !== "Pending" &&
              element.status !== "Rejected"
          )
          .filter((r) => r.isPregnant).length,
        PWD: residents
          .filter(
            (element) =>
              element.status !== "Archived" &&
              element.status !== "Pending" &&
              element.status !== "Rejected"
          )
          .filter((r) => r.isPWD).length,
      });

      setResidentsData({
        total: totalResidents,
        totalHouseholds: totalHouseholds,
        male: male,
        female: female,
        seniorCitizens: seniorCitizens,
        voters: voters,
        PWD: PWD,
        pregnant: pregnant,
        fourps: fourps,
        unemployed: unemployed,
      });
    };
    fetchResidentData();
  }, [residents]);

  // Certificates Data
  useEffect(() => {
    const fetchCertificatesData = () => {
      const monthlyCounts = {};

      certificates.forEach((certificate) => {
        const rawDate = certificate.createdAt;
        const fixedDateStr = rawDate.replace(" at ", " ");
        const date = new Date(fixedDateStr);

        const month = date.toLocaleString("default", { month: "long" });
        const status = certificate.status;

        if (!monthlyCounts[month]) {
          monthlyCounts[month] = {
            Pending: 0,
            "Not Yet Collected": 0,
            Collected: 0,
            Rejected: 0,
          };
        }

        if (monthlyCounts[month][status] !== undefined) {
          monthlyCounts[month][status]++;
        }
      });

      setDocumentData(monthlyCounts);
    };

    fetchCertificatesData();
  }, [certificates]);

  // Reservation Data
  useEffect(() => {
    const fetchReservationsData = async () => {
      const monthlyCounts = {};

      courtreservations.forEach((court) => {
        const rawDate = court.createdAt;
        const fixedDateStr = rawDate.replace(" at ", " ");
        const date = new Date(fixedDateStr);

        const month = date.toLocaleString("default", { month: "long" });
        const status = court.status;

        if (!monthlyCounts[month]) {
          monthlyCounts[month] = { Pending: 0, Approved: 0, Rejected: 0 };
        }

        if (monthlyCounts[month][status] !== undefined) {
          monthlyCounts[month][status]++;
        }
      });

      setReservationData(monthlyCounts);
    };
    fetchReservationsData();
  }, [courtreservations]);

  // Blotter Data
  useEffect(() => {
    const fetchBlotterData = async () => {
      const monthlyCounts = {};

      blotterreports.forEach((blotter) => {
        const rawDate = blotter.createdAt;
        const fixedDateStr = rawDate.replace(" at ", " ");
        const date = new Date(fixedDateStr);

        const month = date.toLocaleString("default", { month: "long" });
        const status = blotter.status;

        if (!monthlyCounts[month]) {
          monthlyCounts[month] = {
            Pending: 0,
            Scheduled: 0,
            Settled: 0,
            Rejected: 0,
          };
        }

        if (monthlyCounts[month][status] !== undefined) {
          monthlyCounts[month][status]++;
        }
      });

      setBlotterData(monthlyCounts);
    };
    fetchBlotterData();
  }, [blotterreports]);

  useEffect(() => {
    if (user.role === "Secretary" || user.role === "Technical Admin") {
      const announcementEvents = (announcements || [])
        .filter((a) => a.status !== "Archived")
        .filter((a) => a.times)
        .flatMap((a) =>
          Object.entries(a.times).map(([dateKey, timeObj]) => ({
            title: a.title,
            start: new Date(timeObj.starttime),
            end: new Date(timeObj.endtime),
            backgroundColor:
              a.category === "General"
                ? "#4A90E2"
                : a.category === "Health & Sanitation"
                ? "#7ED321"
                : a.category === "Public Safety & Emergency"
                ? "#FF0000"
                : a.category === "Education & Youth"
                ? "#FFD942"
                : a.category === "Social Services"
                ? "#808080"
                : a.category === "Infrastructure"
                ? "#EC9300"
                : a.category === "Court Reservations"
                ? "#9B59B6"
                : a.category === "Blotter"
                ? "#00796B"
                : "#4A90E2",
          }))
        );
      const approvedReservationEvents = (courtreservations || [])
        .filter((r) => r.status === "Approved")
        .flatMap((r) =>
          Object.entries(r.times || {}).map(([dateKey, timeObj]) => ({
            title: `${r.resID?.lastname}, ${r.resID?.firstname} - ${r.purpose}`,
            start: new Date(timeObj.starttime),
            end: new Date(timeObj.endtime),
            backgroundColor: "#770ED3",
          }))
        );
      const scheduledBlotters = (blotterreports || [])
        .filter((b) => b.status === "Scheduled")
        .map((b) => ({
          title: `${b.complainantID?.lastname}, ${b.complainantID?.firstname}`,
          start: parseCustomDateString(b.starttime),
          end: parseCustomDateString(b.endtime),
          backgroundColor: "#00796B",
        }));

      setEvents([
        ...announcementEvents,
        ...approvedReservationEvents,
        ...scheduledBlotters,
      ]);
    } else if (user.role === "Clerk") {
      const announcementEvents = (announcements || [])
        .filter((a) => a.status !== "Archived")
        .filter((a) => a.times)
        .flatMap((a) =>
          Object.entries(a.times).map(([dateKey, timeObj]) => ({
            title: a.title,
            start: new Date(timeObj.starttime),
            end: new Date(timeObj.endtime),
            backgroundColor:
              a.category === "General"
                ? "#4A90E2"
                : a.category === "Health & Sanitation"
                ? "#7ED321"
                : a.category === "Public Safety & Emergency"
                ? "#FF0000"
                : a.category === "Education & Youth"
                ? "#FFD942"
                : a.category === "Social Services"
                ? "#808080"
                : a.category === "Infrastructure"
                ? "#EC9300"
                : a.category === "Court Reservations"
                ? "#9B59B6"
                : a.category === "Blotter"
                ? "#00796B"
                : "#4A90E2",
          }))
        );
      const approvedReservationEvents = (courtreservations || [])
        .filter((r) => r.status === "Approved")
        .flatMap((r) =>
          Object.entries(r.times || {}).map(([dateKey, timeObj]) => ({
            title: `${r.resID?.lastname}, ${r.resID?.firstname} - ${r.purpose}`,
            start: new Date(timeObj.starttime),
            end: new Date(timeObj.endtime),
            backgroundColor: "#770ED3",
          }))
        );

      setEvents([...announcementEvents, ...approvedReservationEvents]);
    } else if (
      user.role === "Justice" ||
      user.role === "Secretary" ||
      user.role === "Technical Admin"
    ) {
      const scheduledBlotters = (blotterreports || [])
        .filter((b) => b.status === "Scheduled")
        .map((b) => ({
          title: `${b.complainantID?.lastname}, ${b.complainantID?.firstname}`,
          start: parseCustomDateString(b.starttime),
          end: parseCustomDateString(b.endtime),
          backgroundColor: "#00796B",
        }));
      setEvents([...scheduledBlotters]);
    }
  }, [user.role, blotterreports, announcements, courtreservations]);

  function parseCustomDateString(dateStr) {
    if (!dateStr || typeof dateStr !== "string") {
      console.warn("Invalid or empty date string:", dateStr);
      return null;
    }
    const [datePart, timePart] = dateStr.split(" at ");
    const fullStr = `${datePart} ${timePart}`;
    const parsedDate = new Date(fullStr);

    if (isNaN(parsedDate.getTime())) {
      console.warn("Invalid date string:", dateStr);
      return null;
    }

    return parsedDate.toISOString();
  }

  //To render the document requests, reservation requests, and blotters in bar graph
  const documentChartData = Object.entries(documentData).map(
    ([month, counts]) => ({
      month,
      ...counts,
    })
  );

  const reservationChartData = Object.entries(reservationData).map(
    ([month, counts]) => ({
      month,
      ...counts,
    })
  );

  const blotterChartData = Object.entries(blotterData).map(
    ([month, counts]) => ({
      month,
      ...counts,
    })
  );

  const classificationArray = Object.entries(classificationsData).map(
    ([key, value]) => ({
      category: key,
      Total: value,
    })
  );

  //To show single graph per status when click
  const allDocumentStatuses = [
    "Pending",
    "Not Yet Collected",
    "Collected",
    "Rejected",
  ];
  const allReservationStatuses = ["Pending", "Approved", "Rejected"];
  const allBlotterStatuses = ["Pending", "Scheduled", "Rejected", "Settled"];

  const [activeDocumentKeys, setActiveDocumentKeys] =
    useState(allDocumentStatuses);
  const [activeReservationKeys, setActiveReservationKeys] = useState(
    allReservationStatuses
  );
  const [activeBlotterKeys, setActiveBlotterKeys] =
    useState(allBlotterStatuses);

  const handleLegendClick = (dataKey, activeKeys, setActiveKeys, allKeys) => {
    if (activeKeys.length === 1 && activeKeys[0] === dataKey) {
      setActiveKeys(allKeys);
    } else {
      setActiveKeys([dataKey]);
    }
  };

  //To set the frequency (y-axis) of graph
  const maxDocumentFrequency = Math.max(
    ...documentChartData.flatMap((d) => [
      d.Pending || 0,
      d["Not Yet Collected"] || 0,
      d.Collected || 0,
      d.Rejected || 0,
    ])
  );

  const maxReservationFrequency = Math.max(
    ...reservationChartData.flatMap((d) => [
      d.Pending || 0,
      d.Issued || 0,
      d.Rejected || 0,
    ])
  );

  const maxBlotterFrequency = Math.max(
    ...blotterChartData.flatMap((d) => [
      d.Pending || 0,
      d.Scheduled || 0,
      d.Settled || 0,
      d.Rejected || 0,
    ])
  );

  function roundUp(value, step) {
    return Math.ceil(value / step) * step;
  }

  // to generate even ticks
  function generateTicks(maxValue, numberOfTicks = 6) {
    if (maxValue === 0) return [0];

    const interval = maxValue / (numberOfTicks - 1);
    const ticks = [];

    for (let i = 0; i < numberOfTicks; i++) {
      ticks.push(Math.round(interval * i));
    }

    // Rounded to remove duplicate
    return [...new Set(ticks)].sort((a, b) => a - b);
  }

  // Round up max frequencies to nearest 5
  const roundedMaxDocumentFrequency = roundUp(maxDocumentFrequency, 5);
  const roundedMaxReservationFrequency = roundUp(maxReservationFrequency, 5);
  const roundedMaxBlotterFrequency = roundUp(maxBlotterFrequency, 5);

  const documentYTicks = generateTicks(roundedMaxDocumentFrequency);
  const reservationYTicks = generateTicks(roundedMaxReservationFrequency);
  const blotterYTicks = generateTicks(roundedMaxBlotterFrequency);

  //To remove the label of Chart when screen size is small
  function useWindowWidth() {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return width;
  }

  const width = useWindowWidth();
  const isSmallScreen = width < 640;

  //To display the total at the top of Bar
  const renderTopLabel =
    (fill = "#04384E") =>
    ({ x, y, width, value }) =>
      value > 0 ? (
        <text
          x={x + width / 2}
          y={y - 6}
          fill={fill}
          fontSize={12}
          textAnchor="middle"
        >
          {value}
        </text>
      ) : null;

  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [animatedTotalHouseholds, setAnimatedTotalHouseholds] = useState(0);
  const [animatedMale, setAnimatedMale] = useState(0);
  const [animatedFemale, setAnimatedFemale] = useState(0);
  const [animatedFourps, setAnimatedFourps] = useState(0);
  const [animatedUnemployed, setAnimatedUnemployed] = useState(0);
  const [animatedVoters, setAnimatedVoters] = useState(0);

  const animateCount = (targetCount, setAnimatedValue) => {
    let currentCount = 0;
    const interval = Math.max(1, 200 / targetCount); // Fast increment in 0.5 seconds

    const intervalId = setInterval(() => {
      if (currentCount < targetCount) {
        currentCount += 1;
        setAnimatedValue(currentCount); // Update the state to re-render
      } else {
        clearInterval(intervalId); // Clear the interval when the count reaches the target
      }
    }, interval); // Fast update interval
  };

  useEffect(() => {
    if (residentsData.total)
      animateCount(residentsData.total, setAnimatedTotal);
  }, [residentsData.total]);

  useEffect(() => {
    if (residentsData.totalHouseholds)
      animateCount(residentsData.totalHouseholds, setAnimatedTotalHouseholds);
  }, [residentsData.totalHouseholds]);

  useEffect(() => {
    if (residentsData.male) animateCount(residentsData.male, setAnimatedMale);
  }, [residentsData.male]);

  useEffect(() => {
    if (residentsData.female)
      animateCount(residentsData.female, setAnimatedFemale);
  }, [residentsData.female]);

  useEffect(() => {
    if (residentsData.fourps)
      animateCount(residentsData.fourps, setAnimatedFourps);
  }, [residentsData.fourps]);

  useEffect(() => {
    if (residentsData.unemployed)
      animateCount(residentsData.unemployed, setAnimatedUnemployed);
  }, [residentsData.unemployed]);

  useEffect(() => {
    if (residentsData.voters)
      animateCount(residentsData.voters, setAnimatedVoters);
  }, [residentsData.voters]);

  const paddedroundedMaxDocumentFrequency = roundedMaxDocumentFrequency + 4;
  const paddedMaxReservationFrequency = roundedMaxReservationFrequency + 4;
  const paddedroundedMaxBlotterFrequency = roundedMaxBlotterFrequency + 4;

  return (
    <>
      <main className={`main ${isCollapsed ? "ml-[5rem]" : "ml-[18rem]"}`}>
        <div className="header-text">Dashboard</div>

        <div className="form-grid mt-4">
          {(user.role === "Secretary" ||
            user.role === "Clerk" ||
            user.role === "Technical Admin") && (
            <>
              <div
                className="form-group cursor-pointer"
                onClick={() => navigation("/residents")}
              >
                <div className="demog-card-container hover:bg-[#009B3D]/10">
                  <div class="demog-card-left-border bg-[#00C853]"></div>

                  <div class="flex-grow pt-8">
                    <h2 class="demog-total">{animatedTotal}</h2>
                    <p class="text-[#00C853] demog-text">Total Residents</p>
                  </div>

                  <div class="demog-icon">
                    <img
                      src={totalresidents}
                      alt="Total Residents Icon"
                      width="40"
                      height="40"
                      classname="icon-image"
                    ></img>
                  </div>
                </div>
              </div>

              <div
                className="form-group cursor-pointer"
                onClick={() => navigation("/households")}
              >
                <div className="demog-card-container hover:bg-[#EB5B00]/10">
                  <div class="demog-card-left-border bg-[#E65C00]"></div>

                  <div class="flex-grow pt-8">
                    <h2 class="demog-total ">{animatedTotalHouseholds}</h2>
                    <p class="text-[#EB5B00] demog-text">Total Households</p>
                  </div>

                  <div class="demog-icon">
                    <FaHouse />
                  </div>
                </div>
              </div>

              <div
                className="form-group cursor-pointer"
                onClick={() =>
                  navigation("/residents", {
                    state: {
                      selectedSort: "Male",
                    },
                  })
                }
              >
                <div className="demog-card-container hover:bg-[#1565C0]/10">
                  <div class="demog-card-left-border bg-[#1E88E5]"></div>

                  <div class="flex-grow pt-8">
                    <h2 class="demog-total">{animatedMale}</h2>
                    <p class="text-[#1E88E5] demog-text">Male</p>
                  </div>

                  <div class="demog-icon">
                    <img
                      src={male}
                      alt="Male Icon"
                      width="25"
                      height="25"
                    ></img>
                  </div>
                </div>
              </div>

              <div
                className="form-group cursor-pointer"
                onClick={() =>
                  navigation("/residents", {
                    state: {
                      selectedSort: "Female",
                    },
                  })
                }
              >
                <div className="demog-card-container hover:bg-[#F50057]/10">
                  <div class="demog-card-left-border bg-[#FF4081]"></div>

                  <div class="flex-grow pt-8">
                    <h2 class="demog-total ">{animatedFemale}</h2>
                    <p class="text-[#FF4081] demog-text">Female</p>
                  </div>

                  <div class="demog-icon">
                    <img
                      src={female}
                      alt="Female Icon"
                      width="25"
                      height="25"
                      classname="icon-image"
                    ></img>
                  </div>
                </div>
              </div>

              <div
                className="form-group cursor-pointer"
                onClick={() =>
                  navigation("/households", {
                    state: {
                      selectedSort: "4Ps",
                    },
                  })
                }
              >
                <div className="demog-card-container hover:bg-[#AA00D4]/10">
                  <div class="demog-card-left-border bg-[#D500F9]"></div>

                  <div class="flex-grow pt-8">
                    <h2 class="demog-total ">{animatedFourps}</h2>
                    <p class="text-[#D500F9] demog-text">4Ps</p>
                  </div>

                  <div class="demog-icon">
                    <FaHandsHelping />
                  </div>
                </div>
              </div>

              {/* <div
                className="form-group cursor-pointer"
                onClick={() =>
                  navigation("/residents", {
                    state: {
                      selectedSort: "Solo Parent",
                    },
                  })
                }
              >
                <div className="demog-card-container">
                  <div class="demog-card-left-border bg-[#00DFA2]"></div>

                  <div class="flex-grow">
                    <h2 class="font-title text-[24px] font-bold">
                      {residentsData.soloparent}
                    </h2>
                    <p class="text-[#00DFA2] font-title text-[16px] font-semibold">
                      Solo Parent
                    </p>
                  </div>

                  <div class="demog-icon">
                    <MdElderly />
                  </div>
                </div>
              </div> */}

              <div
                className="form-group cursor-pointer"
                onClick={() =>
                  navigation("/residents", {
                    state: {
                      selectedSort: "Unemployed",
                    },
                  })
                }
              >
                <div className="demog-card-container hover:bg-[#D50032]/10">
                  <div class="demog-card-left-border bg-[#FF000D]"></div>

                  <div class="flex-grow pt-8">
                    <h2 class="demog-total ">{animatedUnemployed}</h2>
                    <p class="text-[#FF000D] demog-text">Unemployed</p>
                  </div>

                  <div class="demog-icon">
                    <MdWorkOff />
                  </div>
                </div>
              </div>

              <div
                className="form-group cursor-pointer"
                onClick={() =>
                  navigation("/residents", {
                    state: {
                      selectedSort: "Voters",
                    },
                  })
                }
              >
                <div className="demog-card-container hover:bg-[#FFCC00]/10">
                  <div class="demog-card-left-border bg-[#FFD600]"></div>

                  <div class="flex-grow pt-8">
                    <h2 class="demog-total ">{animatedVoters}</h2>
                    <p class="text-[#FFD600] demog-text">Voters</p>
                  </div>

                  <div class="demog-icon">
                    <MdHowToVote />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-8">
          <h1 className="subheader-text">Reports</h1>
          <div className="reports-container">
            {(user.role === "Secretary" ||
              user.role === "Clerk" ||
              user.role === "Technical Admin") && (
              <div className="col-span-2 white-bg-container">
                <h2 className="reports-title">Classification by Age/Health</h2>
                {classificationArray.length > 0 ? (
                  <div className="w-full h-[20rem]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={classificationArray}
                        margin={{ top: 20, right: 30, bottom: 80 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorBlue"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#0096FF"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#0096FF"
                              stopOpacity={0.3}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" />
                        <XAxis
                          dataKey="category"
                          tick={
                            isSmallScreen
                              ? false
                              : { fontSize: 12, fill: "#04384E" }
                          }
                          interval={0}
                          angle={isSmallScreen ? 0 : -30}
                          textAnchor={isSmallScreen ? "middle" : "end"}
                          tickLine={false}
                          axisLine={{ stroke: "#ccc" }}
                          fontFamily="Quicksand"
                          fontWeight="550"
                        />
                        <YAxis tickLine={false} axisLine={{ stroke: "#ccc" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#f9f9f9",
                            borderRadius: 10,
                          }}
                        />
                        <Legend
                          iconType="square"
                          iconSize={14}
                          layout="horizontal"
                          align="center"
                          verticalAlign="top"
                          wrapperStyle={{
                            fontSize: "14px",
                            fontFamily: "Quicksand",
                            color: "#04384E",
                            paddingBottom: "10px",
                          }}
                        />
                        <Bar
                          dataKey="Total"
                          fill="url(#colorBlue)"
                          radius={[10, 10, 0, 0]}
                          animationDuration={1000}
                          onClick={(data, index) => {
                            const clickedCategory =
                              classificationArray[index].category;
                            navigation("/residents", {
                              state: {
                                selectedSort: clickedCategory,
                              },
                            });
                          }}
                        >
                          <LabelList
                            dataKey="Total"
                            content={renderTopLabel()}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="reports-empty-container">
                    <h1 className="reports-empty-label">
                      No classification data available.
                    </h1>
                  </div>
                )}
              </div>
            )}

            {(user.role === "Secretary" ||
              user.role === "Clerk" ||
              user.role === "Technical Admin") && (
              <>
                {/* Document Requests */}
                <div className="col-span-2 md:col-span-1 lg:col-span-1 white-bg-container">
                  <h2 className="reports-title">Document Requests</h2>
                  {documentChartData.length > 0 ? (
                    <div className="w-full h-[18rem]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={documentChartData}
                          margin={{ top: 20, right: 30, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient
                              id="yellowGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#FFC107"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#FFC107"
                                stopOpacity={0.3}
                              />
                            </linearGradient>
                            <linearGradient
                              id="greenGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#4CAF50"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#4CAF50"
                                stopOpacity={0.3}
                              />
                            </linearGradient>
                            <linearGradient
                              id="redGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#F63131"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#F63131"
                                stopOpacity={0.3}
                              />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            stroke="#e0e0e0"
                            strokeDasharray="4 4"
                          />

                          <XAxis
                            dataKey="month"
                            tick={({ x, y, payload }) => (
                              <text
                                x={x}
                                y={y + 15}
                                textAnchor="middle"
                                fontSize={14}
                                fontFamily="Quicksand"
                                fill="#04384E"
                                fontWeight="550"
                              >
                                {payload.value}
                              </text>
                            )}
                            tickLine={false}
                            axisLine={{ stroke: "#ccc" }}
                          />

                          <YAxis
                            domain={[0, paddedroundedMaxDocumentFrequency]}
                            ticks={documentYTicks}
                            tickLine={false}
                            axisLine={{ stroke: "#ccc" }}
                            tick={{
                              fontSize: 14,
                              fill: "#04384E",
                              fontWeight: 600,
                            }}
                          />

                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#f9f9f9",
                              borderRadius: 10,
                              borderColor: "#ccc",
                            }}
                            itemStyle={{ fontWeight: 500, color: "#333" }}
                            labelStyle={{ color: "#666" }}
                          />

                          <Legend
                            iconType="square"
                            iconSize={14}
                            layout="horizontal"
                            align="center"
                            verticalAlign="top"
                            wrapperStyle={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#04384E",
                              fontFamily: "Quicksand",
                              paddingBottom: "10px",
                            }}
                            onClick={(e) =>
                              handleLegendClick(
                                e.dataKey,
                                activeDocumentKeys,
                                setActiveDocumentKeys,
                                allDocumentStatuses
                              )
                            }
                          />

                          {activeDocumentKeys.includes("Pending") && (
                            <Bar
                              dataKey="Pending"
                              fill="url(#yellowGradient)"
                              radius={[10, 10, 0, 0]}
                              animationDuration={800}
                            >
                              <LabelList
                                dataKey="Pending"
                                content={renderTopLabel()}
                              />
                            </Bar>
                          )}
                          {activeDocumentKeys.includes("Not Yet Collected") && (
                            <Bar
                              dataKey="Not Yet Collected"
                              fill="url(#blueGradient)"
                              radius={[10, 10, 0, 0]}
                              animationDuration={800}
                            >
                              <LabelList
                                dataKey="Not Yet Collected"
                                content={renderTopLabel()}
                              />
                            </Bar>
                          )}
                          {activeDocumentKeys.includes("Collected") && (
                            <Bar
                              dataKey="Collected"
                              fill="url(#greenGradient)"
                              radius={[10, 10, 0, 0]}
                              animationDuration={800}
                            >
                              <LabelList
                                dataKey="Collected"
                                content={renderTopLabel()}
                              />
                            </Bar>
                          )}
                          {activeDocumentKeys.includes("Rejected") && (
                            <Bar
                              dataKey="Rejected"
                              fill="url(#redGradient)"
                              radius={[10, 10, 0, 0]}
                              animationDuration={800}
                            >
                              <LabelList
                                dataKey="Rejected"
                                content={renderTopLabel()}
                              />
                            </Bar>
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="reports-empty-container">
                      <h1 className="reports-empty-label text-gray-500">
                        No document request data available.
                      </h1>
                    </div>
                  )}
                </div>

                {/* Court Reservations */}
                <div className="col-span-2 md:col-span-1 lg:col-span-1 white-bg-container">
                  <h2 className="reports-title">Court Reservation</h2>
                  {reservationChartData.length > 0 ? (
                    <div className="w-full h-[18rem]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={reservationChartData}
                          margin={{ top: 20, right: 30, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient
                              id="yellowGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#FFC107"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#FFC107"
                                stopOpacity={0.3}
                              />
                            </linearGradient>
                            <linearGradient
                              id="greenGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#4CAF50"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#4CAF50"
                                stopOpacity={0.3}
                              />
                            </linearGradient>
                            <linearGradient
                              id="redGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#F63131"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#F63131"
                                stopOpacity={0.3}
                              />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            stroke="#e0e0e0"
                            strokeDasharray="4 4"
                          />

                          <XAxis
                            dataKey="month"
                            tick={({ x, y, payload }) => (
                              <text
                                x={x}
                                y={y + 15}
                                textAnchor="middle"
                                fontSize={14}
                                fontFamily="Quicksand"
                                fill="#04384E"
                                fontWeight="550"
                              >
                                {payload.value}
                              </text>
                            )}
                            tickLine={false}
                            axisLine={{ stroke: "#ccc" }}
                          />

                          <YAxis
                            domain={[0, paddedMaxReservationFrequency]}
                            ticks={reservationYTicks}
                            tickLine={false}
                            axisLine={{ stroke: "#ccc" }}
                            tick={{
                              fontSize: 14,
                              fill: "#04384E",
                              fontWeight: 600,
                            }}
                          />

                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#f9f9f9",
                              borderRadius: 10,
                              borderColor: "#ccc",
                            }}
                            itemStyle={{ fontWeight: 500, color: "#333" }}
                            labelStyle={{ color: "#666" }}
                          />

                          <Legend
                            iconType="square"
                            iconSize={14}
                            layout="horizontal"
                            align="center"
                            verticalAlign="top"
                            wrapperStyle={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#04384E",
                              fontFamily: "Quicksand",
                              paddingBottom: "10px",
                            }}
                            onClick={(e) =>
                              handleLegendClick(
                                e.dataKey,
                                activeReservationKeys,
                                setActiveReservationKeys,
                                allReservationStatuses
                              )
                            }
                          />

                          {activeReservationKeys.includes("Pending") && (
                            <Bar
                              dataKey="Pending"
                              fill="url(#yellowGradient)"
                              radius={[10, 10, 0, 0]}
                              animationDuration={800}
                            >
                              <LabelList
                                dataKey="Pending"
                                content={renderTopLabel()}
                              />
                            </Bar>
                          )}
                          {activeReservationKeys.includes("Approved") && (
                            <Bar
                              dataKey="Approved"
                              fill="url(#greenGradient)"
                              radius={[10, 10, 0, 0]}
                              animationDuration={800}
                            >
                              <LabelList
                                dataKey="Approved"
                                content={renderTopLabel()}
                              />
                            </Bar>
                          )}
                          {activeReservationKeys.includes("Rejected") && (
                            <Bar
                              dataKey="Rejected"
                              fill="url(#redGradient)"
                              radius={[10, 10, 0, 0]}
                              animationDuration={800}
                            >
                              <LabelList
                                dataKey="Rejected"
                                content={renderTopLabel()}
                              />
                            </Bar>
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="reports-empty-container">
                      <h1 className="reports-empty-label text-gray-500">
                        No court reservation data available.
                      </h1>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Blotter Reports */}
            {(user.role === "Justice" ||
              user.role === "Secretary" ||
              user.role === "Technical Admin") && (
              <div className="col-span-2 white-bg-container">
                <h2 className="reports-title">Blotter Reports</h2>
                {blotterChartData.length > 0 ? (
                  <div className="w-full h-[18rem]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={blotterChartData}
                        margin={{ top: 20, right: 30, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient
                            id="yellowGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#FFC107"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#FFC107"
                              stopOpacity={0.3}
                            />
                          </linearGradient>
                          <linearGradient
                            id="blueGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#0096FF"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#0096FF"
                              stopOpacity={0.3}
                            />
                          </linearGradient>
                          <linearGradient
                            id="greenGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#4CAF50"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#4CAF50"
                              stopOpacity={0.3}
                            />
                          </linearGradient>
                          <linearGradient
                            id="redGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#F63131"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#F63131"
                              stopOpacity={0.3}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid stroke="#e0e0e0" strokeDasharray="4 4" />
                        <XAxis
                          dataKey="month"
                          tick={({ x, y, payload }) => (
                            <text
                              x={x}
                              y={y + 15}
                              textAnchor="middle"
                              fontSize={14}
                              fontFamily="Quicksand"
                              fill="#04384E"
                              fontWeight="550"
                            >
                              {payload.value}
                            </text>
                          )}
                          tickLine={false}
                          axisLine={{ stroke: "#ccc" }}
                        />
                        <YAxis
                          domain={[0, paddedroundedMaxBlotterFrequency]}
                          ticks={blotterYTicks}
                          tickLine={false}
                          axisLine={{ stroke: "#ccc" }}
                          tick={{
                            fontSize: 14,
                            fill: "#04384E",
                            fontWeight: 600,
                          }}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#f9f9f9",
                            borderRadius: 10,
                            borderColor: "#ccc",
                          }}
                          itemStyle={{ fontWeight: 500, color: "#333" }}
                          labelStyle={{ color: "#666" }}
                        />
                        <Legend
                          iconType="square"
                          iconSize={14}
                          layout="horizontal"
                          align="center"
                          verticalAlign="top"
                          wrapperStyle={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#04384E",
                            fontFamily: "Quicksand",
                            paddingBottom: "10px",
                          }}
                          onClick={(e) =>
                            handleLegendClick(
                              e.dataKey,
                              activeBlotterKeys,
                              setActiveBlotterKeys,
                              allBlotterStatuses
                            )
                          }
                        />
                        {activeBlotterKeys.includes("Pending") && (
                          <Bar
                            dataKey="Pending"
                            fill="url(#yellowGradient)"
                            radius={[10, 10, 0, 0]}
                            animationDuration={800}
                          >
                            <LabelList
                              dataKey="Pending"
                              content={renderTopLabel()}
                            />
                          </Bar>
                        )}
                        {activeBlotterKeys.includes("Scheduled") && (
                          <Bar
                            dataKey="Scheduled"
                            fill="url(#blueGradient)"
                            radius={[10, 10, 0, 0]}
                            animationDuration={800}
                          >
                            <LabelList
                              dataKey="Scheduled"
                              content={renderTopLabel()}
                            />
                          </Bar>
                        )}
                        {activeBlotterKeys.includes("Settled") && (
                          <Bar
                            dataKey="Settled"
                            fill="url(#greenGradient)"
                            radius={[10, 10, 0, 0]}
                            animationDuration={800}
                          >
                            <LabelList
                              dataKey="Settled"
                              content={renderTopLabel()}
                            />
                          </Bar>
                        )}
                        {activeBlotterKeys.includes("Rejected") && (
                          <Bar
                            dataKey="Rejected"
                            fill="url(#redGradient)"
                            radius={[10, 10, 0, 0]}
                            animationDuration={800}
                          >
                            <LabelList
                              dataKey="Rejected"
                              content={renderTopLabel()}
                            />
                          </Bar>
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="reports-empty-container">
                    <h1 className="reports-empty-label text-gray-500">
                      No blotter report data available.
                    </h1>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h1 className="subheader-text">Events Calendar</h1>
          <div className="white-bg-container">
            <div className="form-grid mt-4 mb-8">
              {(user.role === "Secretary" ||
                user.role === "Clerk" ||
                user.role === "Technical Admin") && (
                <>
                  <div className="form-group">
                    <div className="legend-container">
                      <div className="bg-[#4A90E2] legend-box"></div>
                      <span className="legend-text">General</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="legend-container">
                      <div className="bg-[#7ED321] legend-box"></div>
                      <span className="legend-text">Health & Sanitation</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="legend-container">
                      <div className="bg-[#FF0000] legend-box"></div>
                      <span className="legend-text">
                        Public Safety & Emergency
                      </span>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="legend-container">
                      <div className="bg-[#FFD942] legend-box"></div>
                      <span className="legend-text">Education & Youth</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="legend-container">
                      <div className="bg-[#808080] legend-box"></div>
                      <span className="legend-text">Social Services</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="legend-container">
                      <div className="bg-[#EC9300] legend-box"></div>
                      <span className="legend-text">Infrastructure</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="legend-container">
                      <div className="bg-[#9B59B6] legend-box"></div>
                      <span className="legend-text">Court Reservation</span>
                    </div>
                  </div>
                </>
              )}
              {(user.role === "Secretary" ||
                user.role === "Justice" ||
                user.role === "Technical Admin") && (
                <div className="form-group">
                  <div className="legend-container">
                    <div className="bg-[#00796B] legend-box"></div>
                    <span className="legend-text">Blotter</span>
                  </div>
                </div>
              )}
            </div>

            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              slotEventOverlap={false}
              dayMaxEventRows={true}
              allDaySlot={false}
              events={events}
              height="auto"
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              datesSet={(viewInfo) => {
                document.body.classList.remove(
                  "fc-month-view",
                  "fc-week-view",
                  "fc-day-view"
                );
                if (viewInfo.view.type === "dayGridMonth") {
                  document.body.classList.add("fc-month-view");
                } else {
                  document.body.classList.add("fc-week-view");
                }
              }}
            />
          </div>
        </div>

        <div className="mb-20"></div>
      </main>
    </>
  );
}

export default Dashboard;
