import { google } from "googleapis";
import { BODY_SHEET_ID } from "../constants/global.js";
import { USAGE_FEATURE } from "../constants/sheetUsageMap.js";
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
      return ranges.map((range) => `${sheetName}!${range}`);
    }

    const getRows = await googleSheets.spreadsheets.values.batchGet({
      spreadsheetId: BODY_SHEET_ID,
      ranges: getRanges(request.query.name),
      auth: auth,
    });

    const result = {};
    const values = getRows.data.valueRanges.map((vr) => vr.values);
    usageFeatures.forEach((uf, idx) => {
      result[uf.trim()] = values[idx];
    });

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
