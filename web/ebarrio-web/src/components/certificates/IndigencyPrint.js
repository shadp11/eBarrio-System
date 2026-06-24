// BarangayIndigencyPrint.jsx
import html2pdf from "html2pdf.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ReactDOM from "react-dom/client";
import BrgyIndigency from "../../assets/brgyindigency.png";
import api from "../../api";

const IndigencyPrint = async ({
  certID,
  isFirstIssue,
  certData,
  captainData,
  preparedByData,
  updatedAt,
}) => {
  const printContent = (
    <div id="printContent" style={{ fontFamily: "Arial, sans-serif" }}>
      <div
        className="id-page"
        style={{
          width: "210mm",
          height: "297mm",
          position: "relative",
          backgroundImage: `url(${BrgyIndigency})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="id-page">
          <div
            style={{
              position: "absolute",
              top: "295px",
              left: "294px",
              width: "126px",
              height: "120px",
            }}
          >
            {certData.resID.picture && (
              <img
                style={{ width: "100%", height: "100%" }}
                src={certData.resID.picture}
                alt="Resident"
              />
            )}
          </div>
          <div
            style={{
              position: "absolute",
              top: "290px",
              left: "540px",
              width: "200px",
              height: "150px",
            }}
          >
            <p style={{ fontSize: "12px", paddingBottom: "3px" }}>
              {certData.resID.middlename
                ? `${certData.resID.firstname.toUpperCase()} ${certData.resID.middlename.substring(
                    0,
                    1
                  )}. ${certData.resID.lastname.toUpperCase()}`
                : `${certData.resID.firstname.toUpperCase()} ${certData.resID.lastname.toUpperCase()}`}
            </p>
            <p style={{ fontSize: "12px", paddingBottom: "3.5px" }}>
              {certData.resID.birthdate}
            </p>
            <p style={{ fontSize: "12px", paddingBottom: "4px" }}>
              {certData.resID.sex}
            </p>
            <p style={{ fontSize: "12px", paddingBottom: "5px" }}>
              {certData.resID.civilstatus}
            </p>
            <p style={{ fontSize: "12px", paddingBottom: "5px" }}>
              {certData.resID.nationality}
            </p>
            <p style={{ fontSize: "12px" }}>
              {certData.resID.precinct ? certData.resID.precinct : "N/A"}
            </p>
          </div>

          <div
            style={{
              position: "absolute",
              top: "426px",
              left: "360px",
              width: "250px",
              height: "20px",
            }}
          >
            <p style={{ fontSize: "12px" }}>
              {certData.resID.householdno?.address}
            </p>
          </div>

          <div
            style={{
              position: "absolute",
              top: "630px",
              left: "296px",
              width: "250px",
              height: "20px",
              fontWeight: "bold",
            }}
          >
            <p style={{ fontSize: "12px" }}>{certData.purpose}</p>
          </div>

          <div
            style={{
              position: "absolute",
              top: "673px",
              left: "385px",
              width: "250px",
              height: "20px",
              fontWeight: "bold",
            }}
          >
            <p style={{ fontSize: "12px" }}>
              {updatedAt.substring(0, updatedAt.indexOf(" at"))}
            </p>
          </div>

          <div
            style={{
              position: "absolute",
              top: "700px",
              left: "565px",
              width: "200px",
              height: "65px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              flexDirection: "column",
              fontWeight: "bold",
            }}
          >
            <p style={{ fontSize: "12px" }}>
              {preparedByData.name.toUpperCase()}
            </p>
          </div>

          <div
            style={{
              position: "absolute",
              top: "833px",
              left: "565px",
              width: "200px",
              height: "65px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              flexDirection: "column",
              fontWeight: "bold",
            }}
          >
            <p style={{ fontSize: "12px" }}>
              {captainData.resID.middlename
                ? `${captainData.resID.firstname.toUpperCase()} ${captainData.resID.middlename.substring(
                    0,
                    1
                  )}. ${captainData.resID.lastname.toUpperCase()}`
                : `${captainData.resID.firstname.toUpperCase()} ${captainData.resID.lastname.toUpperCase()}`}
            </p>
          </div>

          <div
            style={{
              position: "absolute",
              top: "983px",
              left: "655px",
              width: "105px",
              height: "93px",
            }}
          >
            <img
              style={{ width: "100%", height: "100%" }}
              src={certData.certID.qrCode}
              alt="QR Code"
            />
          </div>

          <div
            style={{
              position: "absolute",
              top: "1010px",
              left: "110px",
              width: "100px",
              height: "70px",
            }}
          >
            <p style={{ fontSize: "11px", paddingBottom: "4px" }}>
              {certData.certID.controlNumber}
            </p>
            <p style={{ fontSize: "11px", paddingBottom: "5px" }}>
              {updatedAt.substring(0, updatedAt.indexOf(" at"))}
            </p>
            <p style={{ fontSize: "11px" }}>
              {updatedAt.substring(updatedAt.indexOf("at") + 3).trim()}
            </p>
          </div>
          <img className="id-img" src={BrgyIndigency} />
        </div>
        {isFirstIssue && (
          <div
            className="watermark"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-30deg)",
              fontSize: "60px",
              fontWeight: "bold",
              color: "rgba(128,128,128,0.25)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              userSelect: "none",
              zIndex: 9999,
            }}
          >
            FOR VIEWING ONLY
          </div>
        )}
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
    .watermark {
    display: none !important;
    visibility: hidden !important;
  }
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
        page-break-after: never;
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

  setTimeout(() => {
    window.print();
  }, 3000);

  if (isFirstIssue) {
    const waitForReact = () =>
      new Promise((res) =>
        requestAnimationFrame(() => requestAnimationFrame(res))
      );

    await waitForReact();
    const contentElement = printDiv.querySelector(".id-page");
    if (!contentElement) throw new Error("printContent element not found");

    const waitForImages = (container) => {
      const imgs = container.querySelectorAll("img");
      return Promise.all(
        Array.from(imgs).map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((res) => {
                img.onload = img.onerror = res;
              })
        )
      );
    };
    await waitForImages(printDiv);

    const opt = {
      margin: 0,
      filename: `${certData.certID.controlNumber}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2, useCORS: true, logging: true },
      jsPDF: {
        unit: "px",
        format: [794, 1123],
        orientation: "portrait",
      },
    };
    const pdfBlob = await html2pdf()
      .set(opt)
      .from(contentElement)
      .outputPdf("blob");

    const storage = getStorage();
    const fileRef = ref(
      storage,
      `certificates/${certData.certID.controlNumber}.pdf`
    );
    await uploadBytes(fileRef, pdfBlob);
    const url = await getDownloadURL(fileRef);

    console.log("Uploaded PDF URL:", url);

    try {
      await api.put(`/savepdf/${certID}`, { url });
    } catch (error) {
      console.log("Error saving PDF", error);
    }

    root.unmount();
    document.body.removeChild(printDiv);
    document.head.removeChild(printStyle);
    return url;
  }
};

export default IndigencyPrint;
