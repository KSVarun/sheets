import { google } from "googleapis";

export const googleSheets = google.sheets("v4");
export const auth = new google.auth.JWT({
  keyFile: "steam-verve-416904-9cad7c4e9315.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
