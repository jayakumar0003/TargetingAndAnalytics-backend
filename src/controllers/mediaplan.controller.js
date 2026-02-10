import { executeQuery } from "../utils/snowflakeQuery.js";

export const getMediaplan = async (req, res) => {
  
  try {
    const query = `
  SELECT *
  FROM ANALYTICS.ANALYTICS_SCHEMA.MEDIA_PLAN
  LIMIT 500
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

export const updateMediaPlanAndTargetingAnalyticsTables = async (req, res) => {
  try {
    const body = req.body;

    /* -------------------- GLOBAL VALIDATION -------------------- */

    const table1RequiredKeys = [
      "CLIENT",
      "PRODUCT",
      "CAMPAIGN_ID",
      "CAMPAIGN_NAME",
      "PACKAGE",
      "PLACMENT",
    ];

    // STRICT validation: undefined or null only
    const missingTable1Keys = table1RequiredKeys.filter(
      (key) => body[key] === undefined
    );

    if (missingTable1Keys.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields for Table 1",
        missingFields: missingTable1Keys,
      });
    }

    /* -------------------- NORMALIZE WHERE VALUES -------------------- */

    const normalize = (v) =>
      typeof v === "string" ? v.trim() : v;

    body.CLIENT = normalize(body.CLIENT);
    body.PRODUCT = normalize(body.PRODUCT);
    body.CAMPAIGN_ID = normalize(body.CAMPAIGN_ID);
    body.CAMPAIGN_NAME = normalize(body.CAMPAIGN_NAME);
    body.PACKAGE = normalize(body.PACKAGE);
    body.PLACMENT = normalize(body.PLACMENT);

    /* -------------------- TABLE 2 KEY MAPPING -------------------- */

    body.PLACEMENTNAME =
      body.PLACEMENTNAME ?? body.PLACMENT;

    body.RADIA_OR_PRISMA_PACKAGE_NAME =
      body.RADIA_OR_PRISMA_PACKAGE_NAME ?? body.PACKAGE;

    const table2RequiredKeys = [
      "PLACEMENTNAME",
      "RADIA_OR_PRISMA_PACKAGE_NAME",
    ];

    const missingTable2Keys = table2RequiredKeys.filter(
      (key) => body[key] === undefined || body[key] === null
    );

    if (missingTable2Keys.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields for Table 2",
        missingFields: missingTable2Keys,
      });
    }

    /* -------------------- TABLE 1 UPDATE (MEDIA_PLAN) -------------------- */

    const table1Columns = [
      "AUDIENCE",
      "TARGETING",
      "DEMO",
      "GEO",
      "FORMAT",
      "KPI",
      "AD_SERVING",
      "RATE_TYPE",
      "PACKAGE_BUDGET",
      "PERCENTAGE_OF_BUDGET",
    ];

    const updates1 = [];
    const values1 = [];

    for (const col of table1Columns) {
      if (col in body) {
        updates1.push(`${col} = ?`);
        values1.push(body[col] ?? null);
      }
    }

    if (updates1.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update in Table 1",
      });
    }

    // Add PRODUCT to values array for WHERE clause
    values1.push(body.CLIENT);
    values1.push(body.PRODUCT);
    values1.push(body.CAMPAIGN_ID);
    values1.push(body.CAMPAIGN_NAME);
    values1.push(body.PACKAGE);
    values1.push(body.PLACMENT);

    // Build the WHERE clause condition for PRODUCT
    // If PRODUCT is null, use "PRODUCT IS NULL", otherwise use "PRODUCT = ?"
    const productWhereCondition = body.PRODUCT === null || body.PRODUCT === '' ? "PRODUCT IS NULL" : "PRODUCT = ?";
    
    // If PRODUCT is not null, we've already added it to values1, so we need to adjust
    if (body.PRODUCT === null || body.PRODUCT === '') {
      // Remove PRODUCT from values1 since we're not using it as a parameter
      values1.pop(); // Remove the last value (PLACMENT)
      values1.pop(); // Remove PACKAGE
      values1.pop(); // Remove CAMPAIGN_NAME
      values1.pop(); // Remove CAMPAIGN_ID
      values1.pop(); // Remove PRODUCT
      values1.pop(); // Remove CLIENT
      
      // Re-add values in correct order without PRODUCT parameter
      values1.push(body.CLIENT);
      values1.push(body.CAMPAIGN_ID);
      values1.push(body.CAMPAIGN_NAME);
      values1.push(body.PACKAGE);
      values1.push(body.PLACMENT);
    }

    const table1Query = `
      UPDATE ANALYTICS.ANALYTICS_SCHEMA.MEDIA_PLAN
      SET ${updates1.join(", ")}
      WHERE CLIENT = ?
        ${body.PRODUCT === null || body.PRODUCT === '' ? "AND PRODUCT IS NULL" : "AND PRODUCT = ?"}
        AND CAMPAIGN_ID = ?
        AND CAMPAIGN_NAME = ?
        AND PACKAGE = ?
        AND PLACMENT = ?
    `;

    if (values1.some((v) => v === undefined)) {
      throw new Error("Undefined bind variable detected in Table 1 update");
    }

    await executeQuery(table1Query, values1);

    /* -------------------- TABLE 2 UPDATE (TTD_SSOT) -------------------- */

    const table2Mapping = {
      AUDIENCE: "AUDIENCE_INFO",
      TARGETING: "TARGETING_BLURB",
      DEMO: "DEMOGRAPHICS",
      GEO: "GEO",
      KPI: "PRIMARY_KPI",
    };

    const updates2 = [];
    const values2 = [];

    for (const [sourceKey, targetColumn] of Object.entries(table2Mapping)) {
      if (sourceKey in body) {
        updates2.push(`${targetColumn} = ?`);
        values2.push(body[sourceKey] ?? null);
      }
    }

    if (updates2.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update in Table 2",
      });
    }

    values2.push(
      body.RADIA_OR_PRISMA_PACKAGE_NAME,
      body.PLACEMENTNAME
    );

    if (values2.some((v) => v === undefined)) {
      throw new Error("Undefined bind variable detected in Table 2 update");
    }

    const table2Query = `
      UPDATE ANALYTICS.ANALYTICS_SCHEMA.TTD_SSOT
      SET ${updates2.join(", ")}
      WHERE RADIA_OR_PRISMA_PACKAGE_NAME = ?
        AND PLACEMENTNAME = ?
    `;

    await executeQuery(table2Query, values2);

    /* -------------------- SUCCESS RESPONSE -------------------- */

    res.status(200).json({
      success: true,
      message: "Both tables updated successfully",
      table1UpdatedColumns: updates1.length,
      table2UpdatedColumns: updates2.length,
    });
  } catch (error) {
    console.error("Snowflake multi-table UPDATE error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update Snowflake tables",
    });
  }
};