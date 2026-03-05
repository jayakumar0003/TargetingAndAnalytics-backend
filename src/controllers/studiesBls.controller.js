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
console.log("controller 1")
    if (!body.PACKAGE_NAME || !body.BLS_MEASUREMENT) {
      return res.status(400).json({
        success: false,
        message: "PACKAGE_NAME and BLS_MEASUREMENT are required",
      });
    }

    const query = `
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

    const values = [
      body.PACKAGE_NAME,
      body.BLS_MEASUREMENT,
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

    await executeQuery(query, values);

    res.status(201).json({
      success: true,
      message: "Studies BLS row created successfully",
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

    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(body)) {

      if (key === "PACKAGE_NAME" || key === "BLS_MEASUREMENT") {
        continue;
      }

      updates.push(`${key} = ?`);
      values.push(value ?? null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    values.push(body.PACKAGE_NAME);
    values.push(body.BLS_MEASUREMENT);

    const query = `
      UPDATE ANALYTICS.ANALYTICS_SCHEMA.STUDIES_BLS
      SET ${updates.join(", ")}
      WHERE PACKAGE_NAME = ? AND BLS_MEASUREMENT = ?
    `;

    await executeQuery(query, values);

    res.status(200).json({
      success: true,
      message: "Studies BLS row updated successfully",
      key: {
        PACKAGE_NAME: body.PACKAGE_NAME,
        BLS_MEASUREMENT: body.BLS_MEASUREMENT,
      },
    });

  } catch (error) {
    console.error("Snowflake UPDATE error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update Studies BLS row",
    });
  }
};