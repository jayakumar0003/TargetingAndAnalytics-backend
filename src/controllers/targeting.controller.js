import { executeQuery } from "../utils/snowflakeQuery.js";

export const getTargeting = async (req, res) => {
  try {
    const query = `
  SELECT *
  FROM ANALYTICS.ANALYTICS_SCHEMA.TTD_SSOT
  LIMIT 50
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
      message: "Failed to fetch data from Snowflake",
    });
  }
};

export const updateByPackageName = async (req, res) => {
  try {
    const body = req.body;

    // 1️⃣ Validation
    if (!body.RADIA_OR_PRISMA_PACKAGE_NAME) {
      return res.status(400).json({
        success: false,
        message: "RADIA_OR_PRISMA_PACKAGE_NAME is required",
      });
    }

    // 2️⃣ Build SET clause dynamically
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(body)) {
  
      if (
        key === "TACTIC" ||
        key === "BRAND_SAFETY" ||
        key === "BLS_MEASUREMENT" ||
        key === "LIVE_DATE"  
      ) {
        updates.push(`${key} = ?`);
        values.push(value ?? null); // allow null updates
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    // 3️⃣ WHERE value (order matters)
    values.push(body.RADIA_OR_PRISMA_PACKAGE_NAME);

    // 4️⃣ Final UPDATE query
    const query = `
      UPDATE ANALYTICS.ANALYTICS_SCHEMA.TTD_SSOT
      SET ${updates.join(", ")}
      WHERE RADIA_OR_PRISMA_PACKAGE_NAME = ?
    `;

    await executeQuery(query, values);

    res.status(200).json({
      success: true,
      message: "Record(s) updated successfully",
      key: {
        RADIA_OR_PRISMA_PACKAGE_NAME: body.RADIA_OR_PRISMA_PACKAGE_NAME,
      },
      updatedColumns: updates.length,
    });
  } catch (error) {
    console.error("Snowflake UPDATE error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update record",
    });
  }
};

export const updateByPackageNameAndPlacementName = async (req, res) => {
  try {
    const body = req.body;

    // 1️⃣ Validation (composite key required)
    if (!body.PLACEMENTNAME || !body.RADIA_OR_PRISMA_PACKAGE_NAME) {
      return res.status(400).json({
        success: false,
        message:
          "Both PLACEMENTNAME and RADIA_OR_PRISMA_PACKAGE_NAME are required",
      });
    }

    // 2️⃣ Build SET clause dynamically
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(body)) {
      // Skip composite key columns (used only in WHERE)
      if (
        key === "RADIA_OR_PRISMA_PACKAGE_NAME" ||
        key === "PLACEMENTNAME" ||
        key === "BUY_MODEL" ||
        key === "TACTIC" ||
        key === "BRAND_SAFETY" ||
        key === "BLS_MEASUREMENT" ||
        key === "LIVE_DATE"  
      ) {
        continue;
      }

      updates.push(`${key} = ?`);
      values.push(value ?? null); // allow null updates
    }
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    // 3️⃣ WHERE values (order matters!)
    values.push(body.RADIA_OR_PRISMA_PACKAGE_NAME);
    values.push(body.PLACEMENTNAME);

    // 4️⃣ Final UPDATE query (composite key)
    const query = `
      UPDATE ANALYTICS.ANALYTICS_SCHEMA.TTD_SSOT
      SET ${updates.join(", ")}
      WHERE RADIA_OR_PRISMA_PACKAGE_NAME = ? AND PLACEMENTNAME = ?
    `;

    await executeQuery(query, values);

    res.status(200).json({
      success: true,
      message: "Record updated successfully",
      keys: {
        PLACEMENTNAME: body.PLACEMENTNAME,
        RADIA_OR_PRISMA_PACKAGE_NAME: body.RADIA_OR_PRISMA_PACKAGE_NAME,
      },
      updatedColumns: updates.length,
    });
  } catch (error) {
    console.error("Snowflake UPDATE error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update record",
    });
  }
};

export const updateByLineItem = async (req, res) => {
  try {
    const body = req.body;

    // 1️⃣ Validation
    if (!body.LINE_ITEM_BREAK_DSP_SPECIFIC || !body.RADIA_OR_PRISMA_PACKAGE_NAME) {
      return res.status(400).json({
        success: false,
        message: "LINE_ITEM_BREAK_DSP_SPECIFIC & RADIA_OR_PRISMA_PACKAGE_NAME is required",
      });
    }

    // 2️⃣ Build SET clause dynamically
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(body)) {
      // Skip composite key columns (used only in WHERE)
      if (
        key === "RADIA_OR_PRISMA_PACKAGE_NAME" ||
        key === "TACTIC" ||
        key === "BUY_MODEL" ||
        key === "BRAND_SAFETY" ||
        key === "BLS_MEASUREMENT" ||
        key === "LIVE_DATE" ||
        key === "PLACEMENTNAME" ||
        key === "LINE_ITEM_BREAK_DSP_SPECIFIC"
      ) {
        continue;
      }

      updates.push(`${key} = ?`);
      values.push(value ?? null); // allow null updates
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    // 3️⃣ WHERE value (order matters)
    values.push(body.LINE_ITEM_BREAK_DSP_SPECIFIC);
    values.push(body.RADIA_OR_PRISMA_PACKAGE_NAME);

    // 4️⃣ Final UPDATE query
    const query = `
      UPDATE ANALYTICS.ANALYTICS_SCHEMA.TTD_SSOT
      SET ${updates.join(", ")}
      WHERE LINE_ITEM_BREAK_DSP_SPECIFIC = ? AND RADIA_OR_PRISMA_PACKAGE_NAME = ?
    `;

    await executeQuery(query, values);

    res.status(200).json({
      success: true,
      message: "Record(s) updated successfully",
      key: {
        LINE_ITEM_BREAK_DSP_SPECIFIC: body.LINE_ITEM_BREAK_DSP_SPECIFIC,
        RADIA_OR_PRISMA_PACKAGE_NAME: body.RADIA_OR_PRISMA_PACKAGE_NAME,
      },
      updatedColumns: updates.length,
    });
  } catch (error) {
    console.error("Snowflake UPDATE error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update record",
    });
  }
};