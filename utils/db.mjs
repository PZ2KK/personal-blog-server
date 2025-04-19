import * as pg from "pg";
const { Pool } = pg.default;
 
const connectionPool = new Pool({
   connectionString:
     "postgresql://neondb_owner:npg_S0fj7tymNJcE@ep-long-dew-a1h73fsb-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
});
 
 export default connectionPool;