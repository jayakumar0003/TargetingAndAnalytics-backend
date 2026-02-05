import { executeQuery } from "../utils/snowflakeQuery.js";

export const getUsers = async (req, res) => {
  try {
    const query = `
  SELECT *
  FROM ANALYTICS.ANALYTICS_SCHEMA.TTD_SSOT
  LIMIT 20
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

export const updateByPlacementName = async (req, res) => {
  try {
    const body = req.body;

    // 1️⃣ Validation
    if (!body.PLACEMENTNAME) {
      return res.status(400).json({
        success: false,
        message: "PLACEMENTNAME is required",
      });
    }

    // 2️⃣ Build SET clause dynamically
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(body)) {
      // Skip PLACEMENTNAME (used only in WHERE)
      if (key === "PLACEMENTNAME") continue;

      updates.push(`${key} = ?`);
      values.push(value ?? null); // allow null updates
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    // WHERE value last
    values.push(body.PLACEMENTNAME);

    // 3️⃣ Final UPDATE query
    const query = `
      UPDATE ANALYTICS.ANALYTICS_SCHEMA.TTD_SSOT
      SET ${updates.join(", ")}
      WHERE PLACEMENTNAME = ?
    `;

    await executeQuery(query, values);

    res.status(200).json({
      success: true,
      message: "Record updated successfully",
      placementName: body.PLACEMENTNAME,
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
