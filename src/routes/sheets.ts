import { google } from "googleapis";
import { BODY_SHEET_ID } from "../constants/global.js";
import { DEFAULT_RANGE, USAGE_FEATURE } from "../constants/sheetUsageMap.js";
import { googleSheets, auth } from "../utils/global.js";

export async function sheets(fastify) {
  fastify.get("/sheets", async (request, reply) => {
    //bad request if query has empty spaces in it
    if (!request.query.name && !request.query.usage) {
      reply
        .status(400)
        .send({ error: "name and usage is required in query param" });
    }
    if (!request.query.name) {
      reply.status(400).send({ error: "name is required in query param" });
    }
    if (!request.query.usage) {
      reply.status(400).send({ error: "usage is required in query param" });
    }

    const usageFeatures = request.query.usage.split(",");

    //validate if sheet name if more than one word
    function getRanges(sheetName) {
      const ranges = usageFeatures.map((uf) => USAGE_FEATURE[uf.trim()]);
      return [DEFAULT_RANGE, ranges.map((range) => `${sheetName}!${range}`)];
    }

    const getRows = await googleSheets.spreadsheets.values.batchGet({
      spreadsheetId: BODY_SHEET_ID,
      ranges: getRanges(request.query.name),
      auth: auth,
      majorDimension: "COLUMNS",
    });

    const result = {};
    const values = getRows.data.valueRanges.flatMap((v) => v.values);
    const dates: string[] = values[0];
    for (let i = 1; i < values.length; i++) {
      for (let j = 0; j < values[i].length; j++) {
        if (j > 0) {
          result[dates[j]] = {
            ...result[dates[j]],
            [values[i][0]]: values[i][j],
          };
        }
      }
    }

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
