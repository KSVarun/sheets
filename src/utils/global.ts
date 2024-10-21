import { google } from "googleapis";
import { IResult } from "../types/global";

export const googleSheets = google.sheets("v4");
export const auth = new google.auth.JWT({
  keyFile: "steam-verve-416904-9cad7c4e9315.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export function formatData(
  result: IResult,
  data: string[][],
  dataKey: string[],
  resultKey: string
) {
  for (let i = 1; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      if (j > 0) {
        result[resultKey][dataKey[j]] = {
          ...result[resultKey][dataKey[j]],
          [data[i][0]]: data[i][j],
        };
      }
    }
  }
}

export function getRowNumberToUpdate(
  dateRowData: string[],
  currentDate: string
) {
  const dateIndex = dateRowData.findIndex((date) => date === currentDate);
  if (dateIndex > 0) {
    return dateIndex + 1;
  }
  return dateRowData.length;
}
