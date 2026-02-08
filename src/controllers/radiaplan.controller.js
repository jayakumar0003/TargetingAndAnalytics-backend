import { executeQuery } from "../utils/snowflakeQuery.js";

export const getRadiaplan = async (req, res) => {
  try {
    const query = `
  SELECT *
  FROM ANALYTICS.ANALYTICS_SCHEMA.RADIA_PLAN
    LIMIT 100
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