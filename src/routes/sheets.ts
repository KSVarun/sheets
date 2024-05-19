import { BODY_SHEET_ID } from "../constants/global.js";
import {
  CONFIGURATIONS_RANGE,
  DEFAULT_RANGE,
} from "../constants/sheetUsageMap.js";
import { IResult } from "../types/global.js";
import { googleSheets, auth, formatData } from "../utils/global.js";

export async function sheets(fastify) {
  fastify.get("/sheets", async (request, reply) => {
    const rows = await googleSheets.spreadsheets.values.batchGet({
      spreadsheetId: BODY_SHEET_ID,
      ranges: [DEFAULT_RANGE, CONFIGURATIONS_RANGE],
      auth: auth,
      majorDimension: "COLUMNS",
    });

    const result: IResult = {
      track: {},
      configurations: {},
    };
    const trackerData: string[][] = rows.data.valueRanges[0].values;
    const configurations: string[][] = rows.data.valueRanges[1].values;
    const dates: string[] = trackerData[0];
    const configKeys: string[] = configurations[0];
    formatData(result, trackerData, dates, "track");
    formatData(result, configurations, configKeys, "configurations");

    return { result };
  });

  fastify.put("/sheets", async (request, reply) => {
    const sheet = request.body.sheet;
    const range = request.body.ranges;
    const values = request.body.values;

    googleSheets.spreadsheets.values.batchUpdate({
      spreadsheetId: BODY_SHEET_ID,
      auth: auth,
      requestBody: {
        data: [{ range: `${sheet}!${range}`, values: [values] }],
        valueInputOption: "USER_ENTERED",
      },
    });

    return { message: "Updated" };
  });
}
