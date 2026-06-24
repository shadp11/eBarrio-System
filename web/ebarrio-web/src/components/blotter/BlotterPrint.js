import React from "react";
import ReactDOM from "react-dom/client";
import Sumbong from "../../assets/sumbong.png";
import Kasunduan from "../../assets/kasunduan.png";

const BlotterPrint = ({ blotterData, captainData }) => {
  const printContent = (
    <div id="printContent">
      {/* 1st Page (Sumbong) */}

      <div className="id-page">
        {/* MGA MAYSUMBONG */}
        <div
          style={{
            position: "absolute",
            top: "199px",
            left: "80px",
            width: "255px",
            height: "20px",
          }}
        >
          <p style={{ fontSize: 12 }}>
            {blotterData.complainantID
              ? blotterData.complainantID.middlename
                ? `${
                    blotterData.complainantID.firstname
                  } ${blotterData.complainantID.middlename.substring(0, 1)}. ${
                    blotterData.complainantID.lastname
                  } - ${blotterData.complainantID.mobilenumber}`
                : `${blotterData.complainantID.firstname} ${blotterData.complainantID.lastname} - ${blotterData.complainantID.mobilenumber}`
              : `${blotterData.complainantname} - ${blotterData.complainantcontactno}`}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "224px",
            left: "80px",
            width: "270px",
            height: "20px",
          }}
        >
          <p style={{ fontSize: 12 }}>
            {blotterData.complainantID
              ? blotterData.complainantID.householdno?.address
              : blotterData.complainantaddress}
          </p>
        </div>

        {/* MGA IPINAGSUSUMBONG */}
        <div
          style={{
            position: "absolute",
            top: "295px",
            left: "80px",
            width: "255px",
            height: "20px",
          }}
        >
          <p style={{ fontSize: 12 }}>
            {blotterData.subjectID
              ? blotterData.subjectID.middlename
                ? `${
                    blotterData.subjectID.firstname
                  } ${blotterData.subjectID.middlename.substring(0, 1)}. ${
                    blotterData.subjectID.lastname
                  }`
                : `${blotterData.subjectID.firstname} ${blotterData.subjectID.lastname}`
              : blotterData.subjectname}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "320px",
            left: "80px",
            width: "270px",
            height: "20px",
          }}
        >
          <p style={{ fontSize: 12 }}>
            {blotterData.subjectID
              ? blotterData.subjectID.householdno?.address
              : blotterData.subjectaddress}
          </p>
        </div>

        {/* USAPING BARANGAY BLG. */}
        <div
          style={{
            position: "absolute",
            top: "199px",
            left: "600px",
            width: "117px",
            height: "20px",
          }}
        >
          <p style={{ fontSize: 12 }}>{blotterData.blotterno}</p>
        </div>

        {/* UKOL SA */}
        <div
          style={{
            position: "absolute",
            top: "224px",
            left: "520px",
            width: "197px",
            height: "20px",
          }}
        >
          <p style={{ fontSize: 12 }}>{blotterData.type}</p>
        </div>

        {/* SUMBONG */}
        <div
          style={{
            position: "absolute",
            top: "483px",
            left: "80px",
            width: "635px",
            height: "265px",
          }}
        >
          <p style={{ fontSize: 12, lineHeight: "1.9" }}>
            {blotterData.details}
          </p>
        </div>

        {/* GINAGAWA NGAYONG IKA */}
        <div
          style={{
            position: "absolute",
            top: "856px",
            left: "213px",
            width: "37px",
            height: "20px",
          }}
        >
          <p style={{ textDecoration: "underline", fontSize: 12 }}>
            {blotterData.createdAt.split(" ")[1].replace(",", "")}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "856px",
            left: "355px",
            width: "100px",
            height: "20px",
          }}
        >
          <p style={{ textDecoration: "underline", fontSize: 12 }}>
            {`${blotterData.createdAt.split(" ")[0]} ${
              blotterData.createdAt.split(" ")[2]
            }`}
          </p>
        </div>

        {/* MGA MAYSUMBONG */}

        <div
          style={{
            position: "absolute",
            top: "903px",
            left: "545px",
            width: "170px",
            height: "20px",
          }}
        >
          <p style={{ textAlign: "center", fontSize: 12 }}>
            {blotterData.complainantID
              ? blotterData.complainantID.middlename
                ? `${
                    blotterData.complainantID.firstname
                  } ${blotterData.complainantID.middlename.substring(0, 1)}. ${
                    blotterData.complainantID.lastname
                  }`
                : `${blotterData.complainantID.firstname} ${blotterData.complainantID.lastname}`
              : `${blotterData.complainantname}`}
          </p>
        </div>

        {/* TINANGGAP AT INIHAIN */}
        <div
          style={{
            position: "absolute",
            top: "977px",
            left: "278px",
            width: "35px",
            height: "20px",
          }}
        >
          <p style={{ textDecoration: "underline", fontSize: 12 }}>
            {blotterData.scheduleAt.split(" ")[1].replace(",", "")}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "977px",
            left: "423px",
            width: "100px",
            height: "20px",
          }}
        >
          <p style={{ textDecoration: "underline", fontSize: 12 }}>
            {`${blotterData.scheduleAt.split(" ")[0]} ${
              blotterData.scheduleAt.split(" ")[2]
            }`}
          </p>
        </div>

        {/* PUNONG BARANGAY */}

        <div
          style={{
            position: "absolute",
            top: "1025px",
            left: "545px",
            width: "170px",
            height: "20px",
          }}
        >
          <p style={{ textAlign: "center", fontSize: 12 }}>
            {captainData.resID.middlename
              ? `${
                  captainData.resID.firstname
                } ${captainData.resID.middlename.substring(0, 1)}. ${
                  captainData.resID.lastname
                }`
              : `${captainData.resID.firstname} ${captainData.resID.lastname}`}
          </p>
        </div>

        <img className="id-img" src={Sumbong} />
      </div>

      <div className="id-page">
        {/* 2nd Page (Kasunduan ng Pag aayos) */}

        {/* MGA MAYSUMBONG */}
        <div
          style={{
            position: "absolute",
            top: "1322px",
            left: "80px",
            width: "255px",
            height: "20px",
          }}
        >
          <p style={{ fontSize: 12 }}>
            {blotterData.complainantID
              ? blotterData.complainantID.middlename
                ? `${
                    blotterData.complainantID.firstname
                  } ${blotterData.complainantID.middlename.substring(0, 1)}. ${
                    blotterData.complainantID.lastname
                  } - ${blotterData.complainantID.mobilenumber}`
                : `${blotterData.complainantID.firstname} ${blotterData.complainantID.lastname} - ${blotterData.complainantID.mobilenumber}`
              : `${blotterData.complainantname} - ${blotterData.complainantcontactno}`}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "1348px",
            left: "80px",
            width: "270px",
            height: "20px",
          }}
        >
          <p style={{ fontSize: 12 }}>
            {blotterData.complainantID
              ? blotterData.complainantID.address
              : blotterData.complainantaddress}
          </p>
        </div>

        {/* MGA IPINAGSUSUMBONG */}
        <div
          style={{
            position: "absolute",
            top: "1419px",
            left: "80px",
            width: "255px",
            height: "20px",
          }}
        >
          <p style={{ fontSize: 12 }}>
            {blotterData.subjectID
              ? blotterData.subjectID.middlename
                ? `${
                    blotterData.subjectID.firstname
                  } ${blotterData.subjectID.middlename.substring(0, 1)}. ${
                    blotterData.subjectID.lastname
                  }`
                : `${blotterData.subjectID.firstname} ${blotterData.subjectID.lastname}`
              : blotterData.subjectname}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "1444px",
            left: "80px",
            width: "270px",
            height: "20px",
          }}
        >
          <p style={{ fontSize: 12 }}>
            {blotterData.subjectID
              ? blotterData.subjectID.address
              : blotterData.subjectaddress}
          </p>
        </div>

        {/* USAPING BARANGAY BLG. */}
        <div
          style={{
            position: "absolute",
            top: "1322px",
            left: "600px",
            width: "117px",
            height: "20px",
          }}
        >
          <p style={{ fontSize: 12 }}>{blotterData.blotterno}</p>
        </div>

        {/* UKOL SA */}
        <div
          style={{
            position: "absolute",
            top: "1347px",
            left: "520px",
            width: "197px",
            height: "20px",
          }}
        >
          <p style={{ fontSize: 12 }}>{blotterData.type}</p>
        </div>
        {/* <div
          style={{
            position: "absolute",
            top: "1371px",
            left: "460px",
            width: "255px",
            height: "20px",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "1395px",
            left: "460px",
            width: "255px",
            height: "20px",
          }}
        >
          <p style={{ fontSize: 12 }}>SAMPLE TEXT</p>
        </div> */}

        {/* KASUNDUAN NG PAG-AAYOS */}
        <div
          style={{
            position: "absolute",
            top: "1540px",
            left: "77px",
            width: "635px",
            height: "265px",
          }}
        >
          <p
            style={{
              fontSize: 12,
              lineHeight: "1.9",
            }}
          >
            {blotterData.agreementdetails}
          </p>
        </div>

        {/* PINAGKASUNDUAN NGAYONG IKA */}
        <div
          style={{
            position: "absolute",
            top: "1862px",
            left: "287px",
            width: "35px",
            height: "20px",
          }}
        >
          <p style={{ textDecoration: "underline", fontSize: 12 }}>
            {blotterData.updatedAt.split(" ")[1].replace(",", "")}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            top: "1862px",
            left: "430px",
            width: "80px",
            height: "100px",
          }}
        >
          <p style={{ textDecoration: "underline", fontSize: 12 }}>
            {`${blotterData.updatedAt.split(" ")[0]} ${
              blotterData.updatedAt.split(" ")[2]
            }`}
          </p>
        </div>

        {/* MGA MAYSUMBONG */}

        <div
          style={{
            position: "absolute",
            top: "1963px",
            left: "110px",
            width: "167px",
            height: "20px",
          }}
        >
          <p style={{ textAlign: "center", fontSize: 12 }}>
            {blotterData.complainantID
              ? blotterData.complainantID.middlename
                ? `${
                    blotterData.complainantID.firstname
                  } ${blotterData.complainantID.middlename.substring(0, 1)}. ${
                    blotterData.complainantID.lastname
                  }`
                : `${blotterData.complainantID.firstname} ${blotterData.complainantID.lastname}`
              : `${blotterData.complainantname}`}
          </p>
        </div>

        {/* MGA IPINAGSUSUMBONG */}

        <div
          style={{
            position: "absolute",
            top: "1963px",
            left: "510px",
            width: "167px",
            height: "20px",
          }}
        >
          <p style={{ textAlign: "center", fontSize: 12 }}>
            {blotterData.subjectID
              ? blotterData.subjectID.middlename
                ? `${
                    blotterData.subjectID.firstname
                  } ${blotterData.subjectID.middlename.substring(0, 1)}. ${
                    blotterData.subjectID.lastname
                  }`
                : `${blotterData.subjectID.firstname} ${blotterData.subjectID.lastname}`
              : blotterData.subjectname}
          </p>
        </div>

        {/* WITNESS BY */}

        <div
          style={{
            position: "absolute",
            top: "2003px",
            left: "312px",
            width: "167px",
            height: "20px",
          }}
        >
          <p style={{ textAlign: "center", fontSize: 12 }}>
            {blotterData.witnessID
              ? blotterData.witnessID.middlename
                ? `${
                    blotterData.witnessID.firstname
                  } ${blotterData.witnessID.middlename.substring(0, 1)}. ${
                    blotterData.witnessID.lastname
                  }`
                : `${blotterData.witnessID.firstname} ${blotterData.witnessID.lastname}`
              : blotterData.witnessname}
          </p>
        </div>

        {/* PUNONG BARANGAY */}

        <div
          style={{
            position: "absolute",
            top: "2147px",
            left: "547px",
            width: "167px",
            height: "20px",
          }}
        >
          <p style={{ textAlign: "center", fontSize: 12 }}>
            {captainData.resID.middlename
              ? `${
                  captainData.resID.firstname
                } ${captainData.resID.middlename.substring(0, 1)}. ${
                  captainData.resID.lastname
                }`
              : `${captainData.resID.firstname} ${captainData.resID.lastname}`}
          </p>
        </div>

        <img className="id-img" src={Kasunduan} />
      </div>
    </div>
  );

  const printDiv = document.createElement("div");
  document.body.appendChild(printDiv);

  const root = ReactDOM.createRoot(printDiv);
  root.render(printContent);

  const printStyle = document.createElement("style");
  printStyle.innerHTML = `
    @page {
      size: A4;
      margin: 0;
    }
    @media screen {
      #printContent, #printContent * {
        display: none;
      }
    }
    @media print {
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 210mm !important;
        height: 297mm !important;
        overflow: hidden !important;
      }
      body * {
        visibility: hidden;
      }
      #printContent, #printContent * {
        visibility: visible;
      }
      #printContent {
        position: absolute;
        top: 0;
        left: 0;
        width: 210mm;
        height: 297mm;
      }
      .id-page {
        width: 210mm;
        height: 297mm;
        overflow: hidden;
        margin: 0;
        padding: 0;
        page-break-after: avoid;
      }
      .id-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
    }
  `;
  document.head.appendChild(printStyle);

  window.onafterprint = () => {
    document.body.removeChild(printDiv);
    document.head.removeChild(printStyle);
  };

  setTimeout(() => {
    window.print();
  }, 2000);

  return null;
};

export default BlotterPrint;
