import * as pg from "pg";
const { Pool } = pg.default;
 
const connectionPool = new Pool({
   connectionString:
     "postgresql://postgres:159753@localhost:5432/personal-blog-database",
});
 
 export default connectionPool;