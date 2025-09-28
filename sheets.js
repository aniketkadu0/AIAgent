import { google } from "googleapis";

const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, "base64").toString("utf8")
);

const auth = new google.auth.GoogleAuth({
  credentials,
  //keyFile: "credentials.json", // download from Google Cloud
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

export async function writePatientData(patient) {
  // patient = { name, age, symptoms, medicine, bill, pending, notes }
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      resource: {
        values: [
          [
            formatDateTime(new Date()),
            patient.name,
            patient.age,
            patient.symptoms,
            patient.medicine,
            patient.bill,
            patient.pending,
            patient.notes || "",
          ],
        ],
      },
    });
  } catch (err) {
    console.error(
      "Google Sheets Error:",
      err.message,
      err.response?.data || ""
    );
  }
}

function formatDateTime(date) {
  let dd = String(date.getDate()).padStart(2, "0");
  let mm = String(date.getMonth() + 1).padStart(2, "0"); // Months start at 0
  let yyyy = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 => 12

  return `${dd}/${mm}/${yyyy} ${hours}:${minutes} ${ampm}`;
}
