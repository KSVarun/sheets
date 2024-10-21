import { BODY_SHEET_ID } from "../constants/global.js";
import {
  CONFIGURATIONS_RANGE,
  DEFAULT_RANGE,
} from "../constants/sheetUsageMap.js";
import { IResult } from "../types/global.js";
import {
  googleSheets,
  auth,
  formatData,
  getRowNumberToUpdate,
} from "../utils/global.js";

export async function sheets(fastify) {
  fastify.get("/sheets", async (request, reply) => {
    const sheetData = await googleSheets.spreadsheets.values.batchGet({
      spreadsheetId: BODY_SHEET_ID,
      ranges: [DEFAULT_RANGE, CONFIGURATIONS_RANGE],
      auth: auth,
      majorDimension: "COLUMNS",
    });

    const result: IResult = {
      track: {},
      configurations: {},
    };

    const trackerData: string[][] = sheetData.data.valueRanges[0].values;
    const configurations: string[][] = sheetData.data.valueRanges[1].values;
    const dates: string[] = trackerData[0];
    const configKeys: string[] = configurations[0];
    formatData(result, trackerData, dates, "track");
    formatData(result, configurations, configKeys, "configurations");

    return { result };
  });

  fastify.put("/sheets", async (request) => {
    const sheet = "DailyTrack";

    const sheetData = await googleSheets.spreadsheets.values.batchGet({
      spreadsheetId: BODY_SHEET_ID,
      ranges: [DEFAULT_RANGE, CONFIGURATIONS_RANGE],
      auth: auth,
      majorDimension: "COLUMNS",
    });
    const dateRow = sheetData.data.valueRanges[0].values[0];
    const row = getRowNumberToUpdate(dateRow, request.body.values[0]);
    const range = `A${row}:Z2000`;
    const values = request.body.values;

    googleSheets.spreadsheets.values.batchUpdate({
      spreadsheetId: BODY_SHEET_ID,
      auth: auth,
      requestBody: {
        data: [
          {
            range: `${sheet}!${range}`,
            values: [values],
          },
        ],
        valueInputOption: "USER_ENTERED",
      },
    });

    return { message: "Updated" };
  });
}
