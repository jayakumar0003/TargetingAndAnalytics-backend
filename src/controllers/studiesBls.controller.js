import { executeQuery } from "../utils/snowflakeQuery.js";

/**
 * GET STUDIES BLS DATA
 */
export const getStudiesBls = async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM ANALYTICS.ANALYTICS_SCHEMA.STUDIES_BLS
    `;

    const data = await executeQuery(query);

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Snowflake query error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch Studies BLS data",
    });
  }
};


/**
 * CREATE NEW STUDIES BLS ROW
 */
export const createStudiesBlsRow = async (req, res) => {
  try {
    const body = req.body;

    if (!body.PACKAGE_NAME || !body.BLS_MEASUREMENT) {
      return res.status(400).json({
        success: false,
        message: "PACKAGE_NAME and BLS_MEASUREMENT are required",
      });
    }

    const packages = body.PACKAGE_NAME.split(",").map(p => p.trim());
    const measurement = body.BLS_MEASUREMENT.trim();

    const checkQuery = `
      SELECT BLS_MEASUREMENT
      FROM ANALYTICS.ANALYTICS_SCHEMA.TTD_SSOT
      WHERE RADIA_OR_PRISMA_PACKAGE_NAME = ?
    `;

    const insertQuery = `
      INSERT INTO ANALYTICS.ANALYTICS_SCHEMA.STUDIES_BLS (
        PACKAGE_NAME,
        BLS_MEASUREMENT,
        SURVEY_COMPANIES,
        SURVEY_METHODOLOGY,
        CAMPAIGN_OBJECTIVE_KPI,
        AD_SPEND_MINIMUMS,
        AD_SET_CHANNEL_TYPES,
        STUDY_FEES,
        STUDY_BRAND_SAFETY,
        SURVEY_QUESTIONS,
        TARGET_AUDIENCE,
        FLIGHT_DATES,
        BRAND
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const pkg of packages) {

      const result = await executeQuery(checkQuery, [pkg]);

      if (!result.length) {
        console.log(`Package not found in SSOT: ${pkg}`);
        continue;
      }

      const allowedMeasurements =
        result[0].BLS_MEASUREMENT?.split(",").map(m => m.trim()) || [];

      if (!allowedMeasurements.includes(measurement)) {
        console.log(`Skipping ${pkg} - measurement not allowed`);
        continue;
      }

      const values = [
        pkg,
        measurement,
        body.SURVEY_COMPANIES ?? null,
        body.SURVEY_METHODOLOGY ?? null,
        body.CAMPAIGN_OBJECTIVE_KPI ?? null,
        body.AD_SPEND_MINIMUMS ?? null,
        body.AD_SET_CHANNEL_TYPES ?? null,
        body.STUDY_FEES ?? null,
        body.STUDY_BRAND_SAFETY ?? null,
        body.SURVEY_QUESTIONS ?? null,
        body.TARGET_AUDIENCE ?? null,
        body.FLIGHT_DATES ?? null,
        body.BRAND ?? null,
      ];

      await executeQuery(insertQuery, values);
    }

    res.status(201).json({
      success: true,
      message: "Rows inserted successfully",
    });

  } catch (error) {
    console.error("Snowflake INSERT error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create Studies BLS row",
    });
  }
};


/**
 * UPDATE STUDIES BLS ROW
 */
export const updateStudiesBlsRow = async (req, res) => {
  try {
    const body = req.body;

    if (!body.PACKAGE_NAME || !body.BLS_MEASUREMENT) {
      return res.status(400).json({
        success: false,
        message: "PACKAGE_NAME and BLS_MEASUREMENT are required",
      });
    }

    const packages = body.PACKAGE_NAME.split(",").map(p => p.trim());
    const measurement = body.BLS_MEASUREMENT.trim();

    const checkQuery = `
      SELECT BLS_MEASUREMENT
      FROM ANALYTICS.ANALYTICS_SCHEMA.TTD_SSOT
      WHERE RADIA_OR_PRISMA_PACKAGE_NAME = ?
    `;

    const updates = [];
    const updateValues = [];

    for (const [key, value] of Object.entries(body)) {
      if (key === "PACKAGE_NAME" || key === "BLS_MEASUREMENT") continue;

      updates.push(`${key} = ?`);
      updateValues.push(value ?? null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    const updateQuery = `
      UPDATE ANALYTICS.ANALYTICS_SCHEMA.STUDIES_BLS
      SET ${updates.join(", ")}
      WHERE PACKAGE_NAME = ? AND BLS_MEASUREMENT = ?
    `;

    for (const pkg of packages) {

      const result = await executeQuery(checkQuery, [pkg]);

      if (!result.length) continue;

      const allowedMeasurements = result[0].BLS_MEASUREMENT
        .split(",")
        .map(v => v.trim());

      const exists = allowedMeasurements.includes(measurement);

      if (!exists) {
        console.log(`Skipping ${pkg} - measurement not allowed`);
        continue;
      }

      const values = [
        ...updateValues,
        pkg,
        measurement
      ];

      await executeQuery(updateQuery, values);
    }

    res.status(200).json({
      success: true,
      message: "Rows updated successfully",
    });

  } catch (error) {
    console.error("Snowflake UPDATE error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update Studies BLS row",
    });
  }
};

/**
 * GET PACKAGE NAMES BASED ON CAMPAIGN START DATE
 */
export const getPackagesByCampaignDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    const query = `
      SELECT DISTINCT t.RADIA_OR_PRISMA_PACKAGE_NAME
      FROM ANALYTICS.ANALYTICS_SCHEMA.RADIA_PLAN r
      JOIN ANALYTICS.ANALYTICS_SCHEMA.TTD_SSOT t
        ON r.CAMPAIGN_ID = t.CAMPAIGN_ID
      WHERE r.CAMPAIGN_FLIGHT_START_DATE
      BETWEEN ? AND ?
      AND t.RADIA_OR_PRISMA_PACKAGE_NAME IS NOT NULL
    `;

    const values = [startDate, endDate];

    const data = await executeQuery(query, values);

    res.status(200).json({
      success: true,
      count: data.length,
      packages: data.map((row) => row.RADIA_OR_PRISMA_PACKAGE_NAME),
    });
  } catch (error) {
    console.error("Snowflake query error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch packages by campaign date",
    });
  }
};