import connection from "../config/snowflake.js";

export const executeQuery = (sqlText, binds = []) => {
  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText,
      binds,
      complete: (err, stmt, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      },
    });
  });
};
