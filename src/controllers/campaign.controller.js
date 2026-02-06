import { executeQuery } from "../utils/snowflakeQuery.js";

export const getCampaign = async (req, res) => {
  try {
    const query = `
  SELECT *
  FROM ANALYTICS.ANALYTICS_SCHEMA.CAMPAIGN_OVERVIEW
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

