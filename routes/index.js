var express = require('express')
const sql = require("mssql");
var router = express.Router()

// Database configuration with a connection pool
const config = {
    server: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWD,
    database: process.env.DB,
    schema: process.env.SCHEMA,
    trustServerCertificate: true,
    pool: {
        max: 20, // Increased pool size for better concurrency
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Create a single, shared connection pool
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Successfully connected to MSSQL database.');
        return pool;
    })
    .catch(err => console.error('Database Connection Failed! Check configuration.', err));

// Centralized error handler for routes to avoid repeating try/catch blocks
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(err => {
        console.error("Async Handler Caught Error:", err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
};

router.post("/loadAllPages", asyncHandler(async (req, res) => {
    console.log("----DISPLAY loadAllPages API----\n");
    const { bucketId } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('bucketId', sql.Int, bucketId);
    const result = await request.query(`SELECT PAGE_NAME, GRID_ID FROM ${config.schema}.USER_CHARTS_GRID WHERE BUCKETID = @bucketId ORDER BY PAGE_NAME`);
    res.json(result.recordset);
}));

router.post("/addNewPage", asyncHandler(async (req, res) => {
    console.log("----DISPLAY addNewPage API----\n");
    const { bucketId, page } = req.body;
    const pool = await poolPromise;

    let request = pool.request();
    request.input('page', sql.NVarChar, page);
    const result1 = await request.query(`SELECT USER_CHART_GRID_ID FROM dbo.USER_CHARTS_GRID WHERE PAGE_NAME = @page`);

    if (result1.recordset.length === 0) {
        request = pool.request();
        request.input('bucketId', sql.Int, bucketId);
        request.input('page', sql.NVarChar, page);
        await request.query(`INSERT INTO dbo.USER_CHARTS_GRID (BUCKETID, GRID_ID, PAGE_NAME) VALUES (@bucketId, 1, @page)`);
        res.json({ status: 200 });
    } else {
        res.json({ status: 300 });
    }
}));


router.post("/loadPageGridDaily", asyncHandler(async (req, res) => {
    console.log("----DISPLAY loadPageGridDaily API----\n");
    const { bucketId } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('bucketId', sql.Int, bucketId);
    const result = await request.query(`
        SELECT gm.GRID_HTML, gm.TILE_COUNT
        FROM ${config.schema}.DASHBOARD_GRID dg
        JOIN GRID_MASTER gm ON dg.GRID_ID = gm.GRID_ID
        WHERE dg.BUCKET_ID = @bucketId AND DASHBOARD = 'DAILY'`);
    res.json(result.recordset);
}));

router.post("/loadPageGridMonthly", asyncHandler(async (req, res) => {
    console.log("----DISPLAY loadPageGridMonthly API----\n");
    const { bucketId } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('bucketId', sql.Int, bucketId);
    const result = await request.query(`
        SELECT gm.GRID_HTML, gm.TILE_COUNT
        FROM ${config.schema}.DASHBOARD_GRID dg
        JOIN GRID_MASTER gm ON dg.GRID_ID = gm.GRID_ID
        WHERE dg.BUCKET_ID = @bucketId AND DASHBOARD = 'MONTHLY'`);
    res.json(result.recordset);
}));

router.post("/removeTab", asyncHandler(async (req, res) => {
    console.log("----DISPLAY removeTab API----\n");
    const { page } = req.body;
    const pool = await poolPromise;

    let request1 = pool.request();
    request1.input('page', sql.NVarChar, page);
    await request1.query(`DELETE FROM dbo.USER_CHARTS_GRID WHERE PAGE_NAME = @page`);

    let request2 = pool.request();
    request2.input('page', sql.NVarChar, page);
    await request2.query(`DELETE FROM dbo.USER_CHARTS WHERE PAGE_NAME = @page`);

    res.json({ status: 200 });
}));

router.get("/loadAllGrids", asyncHandler(async (req, res) => {
    console.log("----DISPLAY loadAllGrids API----\n");
    const pool = await poolPromise;
    const request = pool.request();
    const result = await request.query(`SELECT GRID_ID, GRID_HTML, TILE_COUNT FROM ${config.schema}.GRID_MASTER`);
    res.json(result.recordset);
}));

// Helper function to build a dynamic IN clause safely
const buildInClause = (request, baseParamName, values, type) => {
    const params = [];
    values.forEach((value, index) => {
        const paramName = `${baseParamName}${index}`;
        request.input(paramName, type, value);
        params.push(`@${paramName}`);
    });
    return params.join(',');
};

router.post("/getVertical", asyncHandler(async (req, res) => {
    console.log("----DISPLAY getVertical API----\n");
    const { bucketId, userId } = req.body;
    const pool = await poolPromise;
    let request = pool.request();
    request.input('bucketId', sql.Int, bucketId);
    const groupResult = await request.query(`SELECT ANALYTICS_GROUP_LEVEL_NAME FROM ${config.schema}.[ANALYTICS_GROUPS] WHERE ANALYTICS_GROUP_ID = @bucketId`);

    if (groupResult.recordset.length === 0) {
        return res.status(404).json({ error: 'No analytics group found for the provided bucketId' });
    }

    const groupName = groupResult.recordset[0].ANALYTICS_GROUP_LEVEL_NAME;
    if (groupName === "GROUP SECURITY") {
        const result = await pool.request().query(`SELECT DISTINCT VNAME FROM ${config.schema}.VERTICAL WHERE VSTATUS = 'ACTIVE' ORDER BY VNAME ASC`);
        return res.json(result.recordset);
    }

    request = pool.request();
    request.input('userId', sql.Int, userId);
    const userGroupsResult = await request.query(`SELECT DISTINCT VID FROM ${config.schema}.USERGROUPS WHERE USERID = @userId`);

    if (userGroupsResult.recordset.length === 0) {
        return res.status(404).json({ error: 'No matching VID found in USERGROUPS for the provided USERID' });
    }

    const vidList = userGroupsResult.recordset.map(row => row.VID);
    request = pool.request();
    const inClause = buildInClause(request, 'vid', vidList, sql.Int);
    const result = await request.query(`SELECT DISTINCT VNAME FROM ${config.schema}.VERTICAL WHERE VSTATUS = 'ACTIVE' AND VID IN (${inClause}) ORDER BY VNAME ASC`);
    res.json(result.recordset);
}));


router.post("/getBusiness", asyncHandler(async (req, res) => {
    console.log("----DISPLAY getBusiness API----\n");
    const { vertical, bucketId, userId } = req.body;
    const pool = await poolPromise;
    let request = pool.request();
    request.input('bucketId', sql.Int, bucketId);
    const groupResult = await request.query(`SELECT ANALYTICS_GROUP_LEVEL_NAME FROM ${config.schema}.[ANALYTICS_GROUPS] WHERE ANALYTICS_GROUP_ID = @bucketId`);

    if (groupResult.recordset.length === 0) {
        return res.status(404).json({ error: 'No analytics group found for the provided bucketId' });
    }

    const groupName = groupResult.recordset[0].ANALYTICS_GROUP_LEVEL_NAME;
    request = pool.request();
    request.input('vertical', sql.NVarChar, vertical);

    if (groupName === "GROUP SECURITY") {
        const result = await request.query(`SELECT DISTINCT B.BUNAME FROM ${config.schema}.BUSINESS B JOIN ${config.schema}.VERTICAL V ON B.VID = V.VID WHERE V.VNAME = @vertical AND B.BUSTATUS = 'ACTIVE' ORDER BY B.BUNAME ASC`);
        return res.json(result.recordset);
    }

    let userGroupsRequest = pool.request();
    userGroupsRequest.input('userId', sql.Int, userId);
    const userGroupsResult = await userGroupsRequest.query(`SELECT DISTINCT BUID FROM ${config.schema}.USERGROUPS WHERE USERID = @userId`);

    if (userGroupsResult.recordset.length === 0) {
        return res.status(404).json({ error: 'No matching BUID found in USERGROUPS for the provided USERID' });
    }

    const buidList = userGroupsResult.recordset.map(row => row.BUID);
    const inClause = buildInClause(request, 'buid', buidList, sql.Int);
    const result = await request.query(`SELECT DISTINCT B.BUNAME FROM ${config.schema}.BUSINESS B JOIN ${config.schema}.VERTICAL V ON B.VID = V.VID WHERE V.VNAME = @vertical AND BUID IN (${inClause}) AND B.BUSTATUS = 'ACTIVE' ORDER BY B.BUNAME ASC`);
    res.json(result.recordset);
}));

router.post("/getSite", asyncHandler(async (req, res) => {
    console.log("----DISPLAY getSite API----\n");
    const { Business, bucketId, userId } = req.body;
    const pool = await poolPromise;
    let request = pool.request();
    request.input('bucketId', sql.Int, bucketId);
    const groupResult = await request.query(`SELECT ANALYTICS_GROUP_LEVEL_NAME FROM ${config.schema}.[ANALYTICS_GROUPS] WHERE ANALYTICS_GROUP_ID = @bucketId`);

    if (groupResult.recordset.length === 0) {
        return res.status(404).json({ error: 'No analytics group found for the provided bucketId' });
    }

    const groupName = groupResult.recordset[0].ANALYTICS_GROUP_LEVEL_NAME;
    request = pool.request();
    request.input('Business', sql.NVarChar, Business);

    if (groupName === "GROUP SECURITY") {
        const result = await request.query(`SELECT DISTINCT s.SINAME FROM ${config.schema}.SITE s JOIN ${config.schema}.BUSINESS b ON s.BUID = b.BUID WHERE b.BUNAME = @Business AND S.SISTATUS = 'ACTIVE' ORDER BY S.SINAME ASC`);
        return res.json(result.recordset);
    }

    let userGroupsRequest = pool.request();
    userGroupsRequest.input('userId', sql.Int, userId);
    const userGroupsResult = await userGroupsRequest.query(`SELECT DISTINCT SIID FROM ${config.schema}.USERGROUPS WHERE USERID = @userId`);

    if (userGroupsResult.recordset.length === 0) {
        return res.status(404).json({ error: 'No matching SIID found in USERGROUPS for the provided USERID' });
    }

    const siidList = userGroupsResult.recordset.map(row => row.SIID);
    const inClause = buildInClause(request, 'siid', siidList, sql.Int);
    const result = await request.query(`SELECT DISTINCT s.SINAME FROM ${config.schema}.SITE s JOIN ${config.schema}.BUSINESS b ON s.BUID = b.BUID WHERE b.BUNAME = @Business AND s.SIID IN (${inClause}) AND S.SISTATUS = 'ACTIVE' ORDER BY S.SINAME ASC`);
    res.json(result.recordset);
}));



router.get("/getYearsFromSecAuto", asyncHandler(async (req, res) => {
    console.log("----DISPLAY getYearsFromSecAuto API----\n");
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT DISTINCT YEAR FROM ${config.schema}.OL_DSRSECAUTO ORDER BY YEAR DESC`);
    res.json(result.recordset);
}));

router.post("/getMonthFromSecAuto", asyncHandler(async (req, res) => {
    console.log("----DISPLAY getMonthFromSecAuto API----\n");
    const { year } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('year', sql.NVarChar, year);
    const result = await request.query(`SELECT DISTINCT MONTH,MONTHNAME FROM ${config.schema}.OL_DSRSECAUTO WHERE YEAR = @year ORDER BY MONTH DESC`);
    res.json(result.recordset);
}));

router.post("/saveGrid", asyncHandler(async (req, res) => {
    console.log("----DISPLAY saveGrid API----\n");
    const { bucketId, page, gridId } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('bucketId', sql.Int, bucketId);
    request.input('page', sql.NVarChar, page);
    request.input('gridId', sql.Int, gridId);
    await request.query(`UPDATE dbo.USER_CHARTS_GRID SET GRID_ID = @gridId WHERE PAGE_NAME = @page AND BUCKETID = @bucketId`);
    res.json({ status: 200 });
}));

router.post("/loadSetCharts", asyncHandler(async (req, res) => {
    console.log("----DISPLAY loadSetCharts API----\n");
    const { bucketId, page } = req.body;
    const pool = await poolPromise;

    let request1 = pool.request();
    request1.input('bucketId', sql.Int, bucketId);
    request1.input('page', sql.NVarChar, page);
    const tablesResult = await request1.query(`SELECT DISTINCT TABLE_NAME FROM dbo.USER_CHARTS uc WHERE uc.BUCKETID = @bucketId AND uc.PAGE_NAME = @page`);

    let request2 = pool.request();
    request2.input('bucketId', sql.Int, bucketId);
    request2.input('page', sql.NVarChar, page);
    const chartsResult = await request2.query(`
        SELECT uc.USER_CHART_ID, uc.BUCKETID, cm.CHART_NAME, uc.CHART_ID, uc.CHART_OPTIONS_JSON,
               uc.CHART_JSON, uc.DATA_QUERY_PREFIX, uc.DATA_QUERY_SUFFIX, uc.TABLE_NAME,
               uc.TILE_DIV_ID, uc.PAGE_NAME
        FROM dbo.USER_CHARTS uc
        JOIN dbo.CHART_MASTER cm ON cm.CHART_ID = uc.CHART_ID
        WHERE uc.BUCKETID = @bucketId AND uc.PAGE_NAME = @page;`);

    res.json({
        charts: chartsResult.recordset,
        filters: tablesResult.recordset.length === 1
    });
}));

router.post("/loadSetWidgets", asyncHandler(async (req, res) => {
    console.log("----DISPLAY loadSetWidgets API----\n");
    const { bucketId } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('bucketId', sql.Int, bucketId);
    const result = await request.query(`
        SELECT do.*, dwm.WIDGET_NAME
        FROM DASHBOARD_OBJECTS do
        JOIN DASHBOARD_WIDGET_MASTER dwm ON dwm.WIDGET_ID = do.OBJECT_ID
        WHERE do.OBJECT_TYPE = 'Widget' AND do.BUCKET_ID = @bucketId;`);
    res.json({ widgets: result.recordset });
}));

router.get("/loadChartTypes", asyncHandler(async (req, res) => {
    console.log("----DISPLAY loadChartTypes API----\n");
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT CHART_ID, CHART_NAME FROM dbo.CHART_MASTER`);
    res.json(result.recordset);
}));

router.get("/loadWidgetTypes", asyncHandler(async (req, res) => {
    console.log("----DISPLAY loadWidgetTypes API----\n");
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT WIDGET_ID, WIDGET_HTML, WIDGET_CHART_ID, WIDGET_NAME FROM dbo.DASHBOARD_WIDGET_MASTER`);
    res.json(result.recordset);
}));

router.get("/loadAllTables", asyncHandler(async (req, res) => {
    console.log("----DISPLAY loadAllTables API----\n");
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT t.name AS TABLE_NAME, cnm.USABLE_NAME
        FROM sys.tables t
        INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
        JOIN dbo.COLUMN_NAME_MAPPING cnm ON t.name = cnm.ACTUAL_NAME
        WHERE t.name LIKE 'OL%'
        ORDER BY s.name, t.name;`);
    res.json(result.recordset);
}));

router.post("/getChartFromId", asyncHandler(async (req, res) => {
    console.log("----DISPLAY getChartFromId API----\n");
    const { chartId } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('chartId', sql.Int, chartId);
    const result = await request.query(`SELECT CHART_ID, CHART_NAME FROM dbo.CHART_MASTER WHERE CHART_ID = @chartId`);
    res.json(result.recordset);
}));

router.post("/deleteChart", asyncHandler(async (req, res) => {
    console.log("----DISPLAY deleteChart API----\n");
    const { userObjectId } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('userChartId', sql.Int, userObjectId);
    await request.query(`DELETE FROM dbo.USER_CHARTS WHERE USER_CHART_ID = @userChartId`);
    res.json({ status: 200 });
}));

router.post("/deleteWidget", asyncHandler(async (req, res) => {
    console.log("----DISPLAY deleteWidget API----\n");
    const { userObjectId } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('userObjectId', sql.Int, userObjectId);
    await request.query(`DELETE FROM dbo.DASHBOARD_OBJECTS WHERE D_OBJECT_ID = @userObjectId`);
    res.json({ status: 200 });
}));

router.post("/getWidgetFromId", asyncHandler(async (req, res) => {
    console.log("----DISPLAY getWidgetFromId API----\n");
    const { widgetId } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('widgetId', sql.Int, widgetId);
    const result = await request.query(`SELECT WIDGET_ID, WIDGET_NAME FROM dbo.DASHBOARD_WIDGET_MASTER WHERE WIDGET_ID = @widgetId`);
    res.json(result.recordset);
}));

router.post("/getTableColumnsAPI", asyncHandler(async (req, res) => {
    console.log("----DISPLAY getTableColumnsAPI API----\n");
    const { table } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('table', sql.NVarChar, table);
    const query = `
        SELECT i.COLUMN_NAME, cnm.USABLE_NAME, i.DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS i
        JOIN dbo.COLUMN_NAME_MAPPING cnm ON i.COLUMN_NAME = cnm.ACTUAL_NAME
        WHERE i.TABLE_NAME = @table
        AND i.DATA_TYPE = 'int'
        AND NOT i.COLUMN_NAME LIKE '%ID'
        AND i.COLUMN_NAME NOT LIKE '%MONTH%';`;
    const result = await request.query(query);
    res.json(result.recordset);
}));

router.post("/getTableGroupByColumnsAPI", asyncHandler(async (req, res) => {
    console.log("----DISPLAY getTableGroupByColumnsAPI API----\n");
    const { table } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('table', sql.NVarChar, table);
    const query = `
        SELECT i.COLUMN_NAME, cnm.USABLE_NAME, i.DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS i
        JOIN dbo.COLUMN_NAME_MAPPING cnm ON i.COLUMN_NAME = cnm.ACTUAL_NAME
        WHERE i.TABLE_NAME = @table
        AND (i.DATA_TYPE = 'nvarchar' OR i.DATA_TYPE = 'text' OR i.DATA_TYPE = 'varchar')
        AND NOT i.COLUMN_NAME LIKE '%ID'
        ORDER BY i.COLUMN_NAME ASC;`;
    const result = await request.query(query);
    res.json(result.recordset);
}));

router.post("/getGroupByValuesAPI", asyncHandler(async (req, res) => {
    console.log("----DISPLAY getGroupByValuesAPI API----\n");
    const { table, column } = req.body;
    // Column and table names cannot be parameterized directly.
    // Ensure that 'table' and 'column' values are validated/sanitized before this point.
    const pool = await poolPromise;
    const query = `SELECT DISTINCT [${column}] FROM dbo.[${table}]`;
    const result = await pool.request().query(query);
    res.json(result.recordset);
}));

router.post("/getChartOptions", asyncHandler(async (req, res) => {
    console.log("----DISPLAY getChartOptions API----\n");
    const { userChartId } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('userChartId', sql.Int, userChartId);
    const result = await request.query(`SELECT * FROM dbo.USER_CHARTS WHERE USER_CHART_ID = @userChartId`);
    res.json(result.recordset);
}));

router.post("/getWidgetOptions", asyncHandler(async (req, res) => {
    console.log("----DISPLAY getWidgetOptions API----\n");
    const { userChartId } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('userChartId', sql.Int, userChartId);
    const result = await request.query(`SELECT * FROM dbo.DASHBOARD_OBJECTS WHERE D_OBJECT_ID = @userChartId`);
    res.json(result.recordset);
}));

router.post("/getUserLevelFilters", asyncHandler(async (req, res) => {
    console.log("----DISPLAY getUserLevelFilters API----\n");
    const { userId } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('userId', sql.Int, userId);
    const query = `
        SELECT aug.A_UG_ID, aug.ANALYTICS_GROUPS_ID, aug.USERID, ag.ANALYTICS_GROUP_NAME,
               ag.ANALYTICS_GROUP_LEVEL, ag.ANALYTICS_GROUP_LEVEL_NAME, ag.ANALYTICS_GROUP_LEVEL_ID,
               V.VID, B.BUID, S.SIID, V.VNAME, B.BUNAME, S.SINAME, V.VCODE, B.BUCODE, S.SICODE
        FROM dbo.ANALYTICS_USER_GROUP_MAPPING aug
        JOIN dbo.ANALYTICS_GROUPS ag ON ag.ANALYTICS_GROUP_ID = aug.ANALYTICS_GROUPS_ID
        JOIN dbo.USERGROUPS u ON U.USERID = AUG.USERID
        JOIN dbo.VERTICAL v ON V.VID = U.VID
        JOIN dbo.BUSINESS b ON B.BUID = U.BUID
        JOIN dbo.SITE s ON S.SIID = U.SIID
        WHERE aug.USERID = @userId;`;
    const result = await request.query(query);
    res.json(result.recordset);
}));

router.post("/getUserLevelFiltersMonthly", asyncHandler(async (req, res) => {
    console.log("----DISPLAY getUserLevelFiltersMonthly API----\n");
    const { userId } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('userId', sql.Int, userId);
    const query = `
        SELECT aug.A_UG_ID, aug.ANALYTICS_GROUPS_ID, aug.USERID, ag.ANALYTICS_GROUP_NAME,
               ag.ANALYTICS_GROUP_LEVEL, ag.ANALYTICS_GROUP_LEVEL_NAME, ag.ANALYTICS_GROUP_LEVEL_ID,
               V.VID, B.BUID, S.SIID, V.VNAME, B.BUNAME, S.SINAME, V.VCODE, B.BUCODE, S.SICODE
        FROM dbo.ANALYTICS_USER_GROUP_MAPPING_MONTHLY aug
        JOIN dbo.ANALYTICS_GROUPS ag ON ag.ANALYTICS_GROUP_ID = aug.ANALYTICS_GROUPS_ID
        JOIN dbo.USERGROUPS u ON U.USERID = AUG.USERID
        JOIN dbo.VERTICAL v ON V.VID = U.VID
        JOIN dbo.BUSINESS b ON B.BUID = U.BUID
        JOIN dbo.SITE s ON S.SIID = U.SIID
        WHERE aug.USERID = @userId;`;
    const result = await request.query(query);
    res.json(result.recordset);
}));

router.post("/getUserLevel", asyncHandler(async (req, res) => {
    console.log("----DISPLAY getUserLevel API----\n");
    const { userId } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('userId', sql.Int, userId);
    const result = await request.query(`
        SELECT R.RCODE FROM USERPROFILE u
        JOIN [ROLE] r ON U.RID = R.RID
        WHERE USERID = @userId`);
    res.json(result.recordset);
}));

router.post("/saveLinearChartJsonAPI", asyncHandler(async (req, res) => {
    console.log("----DISPLAY saveLinearChartJsonAPI API----\n");
    const { bucketId, pageName, userChartId, chartId, chartOptionsJson, tableName, divId } = req.body;
    const pool = await poolPromise;
    let request = pool.request();
    request.input('userChartId', sql.Int, userChartId);
    const existingChart = await request.query(`SELECT * FROM dbo.USER_CHARTS WHERE USER_CHART_ID = @userChartId`);

    request = pool.request(); // Re-initialize request for the next operation
    request.input('bucketId', sql.Int, bucketId);
    request.input('chartId', sql.Int, chartId);
    request.input('chartOptionsJson', sql.NVarChar, chartOptionsJson);
    request.input('tableName', sql.NVarChar, tableName);
    request.input('divId', sql.NVarChar, divId);
    request.input('pageName', sql.NVarChar, pageName);

    if (existingChart.recordset.length > 0) {
        request.input('userChartId', sql.Int, userChartId);
        await request.query(`
            UPDATE dbo.USER_CHARTS
            SET BUCKETID=@bucketId, CHART_ID=@chartId, CHART_OPTIONS_JSON=@chartOptionsJson,
                TABLE_NAME=@tableName, TILE_DIV_ID=@divId, PAGE_NAME=@pageName
            WHERE USER_CHART_ID = @userChartId;`);
        res.json({ userChartID: userChartId });
    } else {
        await request.query(`
            INSERT INTO dbo.USER_CHARTS (BUCKETID, CHART_ID, CHART_OPTIONS_JSON, TABLE_NAME, TILE_DIV_ID, PAGE_NAME)
            VALUES (@bucketId, @chartId, @chartOptionsJson, @tableName, @divId, @pageName);`);
        const result = await pool.request().query(`SELECT MAX(USER_CHART_ID) AS newUserChartId FROM dbo.USER_CHARTS`);
        res.json({ userChartID: result.recordset[0].newUserChartId });
    }
}));

router.post("/saveObjectJsonAPI", asyncHandler(async (req, res) => {
    console.log("----DISPLAY saveObjectJsonAPI API----\n");
    const { bucketId, userObjectId, objectId, objectOptionsJson, tableName, divId, objectType } = req.body;
    const pool = await poolPromise;
    let request = pool.request();
    request.input('userObjectId', sql.Int, userObjectId);
    const existingObject = await request.query(`SELECT * FROM dbo.DASHBOARD_OBJECTS WHERE D_OBJECT_ID = @userObjectId`);

    request = pool.request();
    request.input('bucketId', sql.Int, bucketId);
    request.input('objectId', sql.Int, objectId);
    request.input('objectOptionsJson', sql.NVarChar, objectOptionsJson);
    request.input('tableName', sql.NVarChar, tableName);
    request.input('divId', sql.NVarChar, divId);
    request.input('objectType', sql.NVarChar, objectType);

    if (existingObject.recordset.length > 0) {
        request.input('userObjectId', sql.Int, userObjectId);
        await request.query(`
            UPDATE dbo.DASHBOARD_OBJECTS
            SET BUCKET_ID=@bucketId, OBJECT_ID=@objectId, OBJECT_OPTIONS_JSON=@objectOptionsJson,
                TABLE_NAME=@tableName, TILE_DIV_ID=@divId, OBJECT_TYPE=@objectType
            WHERE D_OBJECT_ID = @userObjectId;`);
        res.json({ userObjectId: userObjectId });
    } else {
        await request.query(`
            INSERT INTO dbo.DASHBOARD_OBJECTS (BUCKET_ID, OBJECT_ID, OBJECT_OPTIONS_JSON, TABLE_NAME, TILE_DIV_ID, OBJECT_TYPE)
            VALUES (@bucketId, @objectId, @objectOptionsJson, @tableName, @divId, @objectType);`);
        const result = await pool.request().query(`SELECT MAX(D_OBJECT_ID) AS newUserObjectId FROM dbo.DASHBOARD_OBJECTS`);
        res.json({ userObjectId: result.recordset[0].newUserObjectId });
    }
}));

router.post("/createDataForCharty", asyncHandler(async (req, res) => {
    console.log("----DISPLAY createDataForCharty API----\n");
    const { userChartId } = req.body;
    const pool = await poolPromise;
    let request = pool.request();
    request.input('userChartId', sql.Int, userChartId);
    const result = await request.query(`SELECT * FROM dbo.USER_CHARTS WHERE USER_CHART_ID = @userChartId`);

    if (result.recordset.length === 0) {
        return res.status(404).json({ error: "Chart not found" });
    }

    const chartOptionsJson = JSON.parse(result.recordset[0].CHART_OPTIONS_JSON);
    const tableName = result.recordset[0].TABLE_NAME;
    let dataQuery = `SELECT `;
    if (typeof chartOptionsJson["tableColumns"] === 'string') {
        dataQuery += `${chartOptionsJson["aggregation"]}([${chartOptionsJson["tableColumns"]}]) AS [${chartOptionsJson["tableColumnsNames"]}], `;
    } else {
        for (let i = 0; i < chartOptionsJson["tableColumns"].length; i++) {
            dataQuery += `${chartOptionsJson["aggregation"]}([${chartOptionsJson["tableColumns"][i]}]) AS [${chartOptionsJson["tableColumnsNames"][i]}], `;
        }
    }
    dataQuery += `[${chartOptionsJson["groupByColumn"]}] FROM dbo.[${tableName}] `;

    // This part remains tricky to parameterize safely without Table-Valued Parameters.
    // The original logic is preserved but is not fully secure.
    if (chartOptionsJson["groupByValues"].length > 0) {
        const gbValues = chartOptionsJson["groupByValues"].map(v => `'${v.replace(/'/g, "''")}'`).join(',');
        dataQuery += `WHERE [${chartOptionsJson["groupByColumn"]}] IN (${gbValues}) `;
    } else {
        dataQuery += `WHERE [${chartOptionsJson["groupByColumn"]}] LIKE '%%' `;
    }

    const prefixQuery = dataQuery;
    const suffixQuery = `GROUP BY [${chartOptionsJson["groupByColumn"]}] ORDER BY [${chartOptionsJson["groupByColumn"]}]`;

    request = pool.request();
    request.input('prefixQuery', sql.NVarChar, prefixQuery);
    request.input('suffixQuery', sql.NVarChar, suffixQuery);
    request.input('userChartId', sql.Int, userChartId);
    await request.query(`UPDATE dbo.USER_CHARTS SET DATA_QUERY_PREFIX=@prefixQuery, DATA_QUERY_SUFFIX=@suffixQuery WHERE USER_CHART_ID = @userChartId`);

    res.json({ status: 200 });
}));

router.post("/createDataForChartDataTrend", asyncHandler(async (req, res) => {
    console.log("----DISPLAY createDataForChartDataTrend API----\n");
    const { userChartId } = req.body;
    const pool = await poolPromise;
    let request = pool.request();
    request.input('userChartId', sql.Int, userChartId);
    const result = await request.query(`SELECT * FROM dbo.USER_CHARTS WHERE USER_CHART_ID = @userChartId`);

    if (result.recordset.length === 0) {
        return res.status(404).json({ error: "Chart not found" });
    }

    const chartOptionsJson = JSON.parse(result.recordset[0].CHART_OPTIONS_JSON);
    const groupBy = chartOptionsJson["groupByColumn"];
    let c;
    if (groupBy === 'VNAME') c = `V.VNAME`;
    else if (groupBy === 'BUNAME') c = 'B.BUNAME';
    else if (groupBy === 'SINAME') c = 'S.SINAME';
    else c = 'V.VNAME'; // Default case

    const dataQuery = `SELECT COUNT(*) AS COUNT, ${c}, I.DSRSTATUS FROM DSRSTATUS I JOIN VERTICAL V ON V.VID = I.VID JOIN BUSINESS B ON B.BUID = I.BUID JOIN SITE S ON S.SIID = I.SIID WHERE '1' = '1' `;
    const suffixQuery = `GROUP BY ${c}, I.DSRSTATUS ORDER BY ${c}`;

    request = pool.request();
    request.input('prefixQuery', sql.NVarChar, dataQuery);
    request.input('suffixQuery', sql.NVarChar, suffixQuery);
    request.input('userChartId', sql.Int, userChartId);
    await request.query(`UPDATE dbo.USER_CHARTS SET DATA_QUERY_PREFIX=@prefixQuery, DATA_QUERY_SUFFIX=@suffixQuery WHERE USER_CHART_ID = @userChartId`);

    res.json({ status: 200 });
}));

router.post("/createDataForPercentChart", asyncHandler(async (req, res) => {
    console.log("----DISPLAY createDataForPercentChart API----\n");
    const { userChartId } = req.body;
    const pool = await poolPromise;
    let request = pool.request();
    request.input('userChartId', sql.Int, userChartId);
    const result = await request.query(`SELECT * FROM dbo.USER_CHARTS WHERE USER_CHART_ID = @userChartId`);

    if (result.recordset.length === 0) {
        return res.status(404).json({ error: "Chart not found" });
    }

    const chartOptionsJson = JSON.parse(result.recordset[0].CHART_OPTIONS_JSON);
    const tableName = result.recordset[0].TABLE_NAME;
    let dataQuery = `SELECT `;
    if (typeof chartOptionsJson["tableColumns"] === 'string') {
        dataQuery += `${chartOptionsJson["aggregation"]}([${chartOptionsJson["tableColumns"]}]) AS [${chartOptionsJson["tableColumnsNames"]}] `;
    } else {
        for (let i = 0; i < chartOptionsJson["tableColumns"].length; i++) {
            const colName = chartOptionsJson["tableColumns"][i];
            const colAlias = chartOptionsJson["tableColumnsNames"][i];
            dataQuery += `${chartOptionsJson["aggregation"]}([${colName}]) AS [${colAlias}]${i < chartOptionsJson["tableColumns"].length - 1 ? ',' : ''} `;
        }
    }
    dataQuery += `FROM dbo.[${tableName}] WHERE '1' = '1' `;

    request = pool.request();
    request.input('prefixQuery', sql.NVarChar, dataQuery);
    request.input('suffixQuery', sql.NVarChar, '');
    request.input('userChartId', sql.Int, userChartId);
    await request.query(`UPDATE dbo.USER_CHARTS SET DATA_QUERY_PREFIX=@prefixQuery, DATA_QUERY_SUFFIX=@suffixQuery WHERE USER_CHART_ID = @userChartId`);

    res.json({ status: 200 });
}));

router.post("/saveChartJsonAPI", asyncHandler(async (req, res) => {
    console.log("----DISPLAY saveChartJsonAPI API----\n");
    const { userChartId, chartJson } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('userChartId', sql.Int, userChartId);
    request.input('chartJson', sql.NVarChar, chartJson);
    await request.query(`UPDATE dbo.USER_CHARTS SET CHART_JSON = @chartJson WHERE USER_CHART_ID = @userChartId`);
    res.json({ status: 200 });
}));


// WARNING: The following routes still use dynamic query generation, which is a security risk.
// They are being converted to use the connection pool, but a full refactoring
// of the query generation logic is recommended for better security.
const applyDynamicFilter = (query, filterString) => {
    if (filterString && typeof filterString === 'string') {
        // Basic sanitization to prevent comment-based SQL injection
        const sanitizedFilter = filterString.replace(/--/g, '');
        return `${query} ${sanitizedFilter}`;
    }
    return query;
};

router.post("/getFilterColumnsAPI", asyncHandler(async (req, res) => {
    const { bucketId, page } = req.body;
    const pool = await poolPromise;
    let request = pool.request();
    request.input('bucketId', sql.Int, bucketId);
    request.input('page', sql.NVarChar, page);
    const result1 = await request.query(`SELECT DISTINCT TABLE_NAME FROM dbo.USER_CHARTS WHERE BUCKETID = @bucketId AND PAGE_NAME = @page`);

    if (result1.recordset.length > 1 || result1.recordset.length === 0) {
        return res.json({ filters: false, columnList: [] });
    }

    const tableName = result1.recordset[0].TABLE_NAME;
    request = pool.request();
    request.input('tableName', sql.NVarChar, tableName);
    const result2 = await request.query(`
        SELECT i.COLUMN_NAME, cnm.USABLE_NAME, i.DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS i
        JOIN dbo.COLUMN_NAME_MAPPING cnm ON i.COLUMN_NAME = cnm.ACTUAL_NAME
        WHERE i.TABLE_NAME = @tableName
        AND (i.COLUMN_NAME NOT LIKE '%ID' AND i.COLUMN_NAME NOT LIKE '%MONTH%' AND i.COLUMN_NAME NOT LIKE '%IDS' AND i.COLUMN_NAME NOT LIKE '%YEAR%' AND i.COLUMN_NAME NOT LIKE '%QUARTER%' AND i.COLUMN_NAME NOT LIKE '%DATE%' AND NOT i.DATA_TYPE = 'INT')
        ORDER BY cnm.USABLE_NAME;`);

    res.json({ filters: true, columnList: result2.recordset, table: tableName });
}));

router.post("/getChartFiltersAPI", asyncHandler(async (req, res) => {
    const { page, bucketId, columnArray = [], filterString } = req.body;
    const pool = await poolPromise;
    let request = pool.request();
    request.input('bucketId', sql.Int, bucketId);
    request.input('page', sql.NVarChar, page);
    const result1 = await request.query(`SELECT DISTINCT TABLE_NAME FROM dbo.USER_CHARTS WHERE BUCKETID = @bucketId AND PAGE_NAME = @page`);

    if (result1.recordset.length === 0) {
        return res.json({ valueList: [], table: null });
    }

    const tableName = result1.recordset[0].TABLE_NAME;
    let whereClause = '';
    if (filterString && filterString.length > 0) {
        whereClause = "WHERE " + filterString.replace(/^ AND/i, '').replace(/--/g, '');
    }

    let unionQueries = [
        `SELECT DISTINCT YEAR AS VALUE, 'YEAR' AS COLUMN_NAME FROM dbo.[${tableName}] ${whereClause}`,
        `SELECT DISTINCT QUARTER AS VALUE, 'QUARTER' AS COLUMN_NAME FROM dbo.[${tableName}] ${whereClause}`,
        `SELECT DISTINCT MONTHNAME AS VALUE, 'MONTHNAME' AS COLUMN_NAME FROM dbo.[${tableName}] ${whereClause}`
    ];

    if (tableName === 'OL_INCIDENTS') {
        unionQueries.push(`SELECT DISTINCT OCCUREDDATE AS VALUE, 'OCCUREDDATE' AS COLUMN_NAME FROM dbo.[${tableName}] ${whereClause}`);
    } else {
        unionQueries.push(`SELECT DISTINCT DSRDATE AS VALUE, 'DSRDATE' AS COLUMN_NAME FROM dbo.[${tableName}] ${whereClause}`);
    }

    columnArray.forEach(column => {
        // Sanitize column name before including in query
        const safeColumn = column.replace(/[^a-zA-Z0-9_]/g, '');
        unionQueries.push(`SELECT DISTINCT [${safeColumn}] AS VALUE, '${safeColumn}' AS COLUMN_NAME FROM dbo.[${tableName}] ${whereClause}`);
    });

    const finalQuery = unionQueries.join(' UNION ');
    const result = await pool.request().query(finalQuery);
    res.json({ valueList: result.recordset, table: tableName });
}));

router.post('/getPrevMonthDataAPI', asyncHandler(async (req, res) => {
    const { month, year, userWidgetId, filterString } = req.body;
    const lmonth = (month === '1') ? '12' : (Number(month) - 1).toString();
    const lyear = (month === '1') ? (Number(year) - 1).toString() : year;

    const pool = await poolPromise;
    let request = pool.request();
    request.input('userWidgetId', sql.Int, userWidgetId);
    const widgetResult = await request.query(`SELECT do.*, dw.WIDGET_HTML FROM DASHBOARD_OBJECTS do JOIN DASHBOARD_WIDGET_MASTER dw ON dw.WIDGET_ID = do.OBJECT_ID WHERE do.D_OBJECT_ID = @userWidgetId`);

    if (!widgetResult.recordset.length) return res.status(404).json({ error: 'Widget not found' });

    const options = JSON.parse(widgetResult.recordset[0].OBJECT_OPTIONS_JSON);
    const { aggregation, tableColumns, tableColumnsNames, groupByColumn, groupByColumnName, table } = options;
    const safeTable = table.replace(/[^a-zA-Z0-9_]/g, ''); // Sanitize table name

    const currentMonthQuery = applyDynamicFilter(`SELECT TOP 5 ${aggregation}(${tableColumns}) AS [${tableColumnsNames}], [${groupByColumn}] AS [${groupByColumnName}], [BUCODE] AS [BUSINESS] FROM dbo.[${safeTable}] WHERE [MONTH] = @month AND [YEAR] = @year`, filterString) + ` GROUP BY [${groupByColumn}], [BUCODE] ORDER BY ${aggregation}(${tableColumns}) DESC`;
    request = pool.request();
    request.input('month', sql.VarChar, month);
    request.input('year', sql.VarChar, year);
    const currentResult = await request.query(currentMonthQuery);

    const prevMonthQuery = `SELECT TOP 5 ${aggregation}(${tableColumns}) AS [${tableColumnsNames}], [${groupByColumn}] AS [${groupByColumnName}], [BUCODE] AS [BUSINESS] FROM dbo.[${safeTable}] WHERE [MONTH] = @lmonth AND [YEAR] = @lyear GROUP BY [${groupByColumn}], [BUCODE] ORDER BY ${aggregation}(${tableColumns}) DESC`;
    request = pool.request();
    request.input('lmonth', sql.VarChar, lmonth);
    request.input('lyear', sql.VarChar, lyear);
    const prevResult = await request.query(prevMonthQuery);

    const sitesQuery = `SELECT DISTINCT [SINAME] FROM dbo."OL_INCIDENTS" WHERE (MONTH = @month OR MONTH = @lmonth) AND (YEAR = @year OR YEAR = @lyear)`;
    request = pool.request();
    request.input('month', sql.VarChar, month);
    request.input('lmonth', sql.VarChar, lmonth);
    request.input('year', sql.VarChar, year);
    request.input('lyear', sql.VarChar, lyear);
    const sitesResult = await request.query(sitesQuery);

    res.json({ result: currentResult.recordset, result2: prevResult.recordset, sites: sitesResult.recordset, widget: widgetResult.recordset });
}));

router.post("/getChart1Data", asyncHandler(async (req, res) => {
    const { month, year } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('month', sql.Int, month);
    request.input('year', sql.NVarChar, year);
    const result = await request.query(`SELECT COUNT(INCIDENTCOUNT) INCIDENTCOUNT, BUNAME FROM dbo.OL_INCIDENTS WHERE [MONTH] = @month AND [YEAR] = @year GROUP BY BUNAME ORDER BY BUNAME`);
    res.json(result.recordset);
}));

router.post("/getChart2Data", asyncHandler(async (req, res) => {
    const { month, year } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('month', sql.Int, month);
    request.input('year', sql.NVarChar, year);
    const result = await request.query(`SELECT COUNT(INCIDENTCOUNT) INCIDENTCOUNT, INCIDENTTYPENAME FROM dbo.OL_INCIDENTS WHERE [MONTH] = @month AND [YEAR] = @year GROUP BY INCIDENTTYPENAME`);
    res.json(result.recordset);
}));

router.post("/getChart3Data", asyncHandler(async (req, res) => {
    const { month, year } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('month', sql.Int, month);
    request.input('year', sql.NVarChar, year);
    const result = await request.query(`SELECT COUNT(INCIDENTCOUNT) INCIDENTCOUNT, OCCUREDDATE FROM dbo.OL_INCIDENTS WHERE [MONTH] = @month AND [YEAR] = @year GROUP BY OCCUREDDATE ORDER BY OCCUREDDATE`);
    res.json(result.recordset);
}));

router.post("/getChart4Data", asyncHandler(async (req, res) => {
    const { month, year } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('month', sql.Int, month);
    request.input('year', sql.NVarChar, year);
    const result = await request.query(`SELECT AVG(AVAILABLE) AVAILABLE, AVG(WORKING) WORKING FROM dbo.OL_DSRSECAUTO od WHERE [MONTH] = @month AND [YEAR] = @year`);
    res.json(result.recordset);
}));

router.post("/getChart5Data", asyncHandler(async (req, res) => {
    const { month, year } = req.body;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('month', sql.Int, month);
    request.input('year', sql.NVarChar, year);
    const result = await request.query(`SELECT COUNT(INCIDENTCOUNT) INCIDENTCOUNT, INCIDENTCATNAME FROM dbo.OL_INCIDENTS WHERE [MONTH] = @month AND [YEAR] = @year GROUP BY INCIDENTCATNAME`);
    res.json(result.recordset);
}));

router.post("/getRadialChartData", asyncHandler(async (req, res) => {
    const { month, year, upperColumn, lowerColumn, table } = req.body;
    // Sanitize table and column names
    const safeUpperColumn = upperColumn.replace(/[^a-zA-Z0-9_]/g, '');
    const safeLowerColumn = lowerColumn.replace(/[^a-zA-Z0-9_]/g, '');
    const safeTable = table.replace(/[^a-zA-Z0-9_]/g, '');

    const pool = await poolPromise;
    const request = pool.request();
    request.input('month', sql.Int, month);
    request.input('year', sql.NVarChar, year);
    const query = `SELECT SUM(${safeUpperColumn}) AS ${safeUpperColumn}, SUM(${safeLowerColumn}) AS ${safeLowerColumn} FROM dbo.${safeTable} WHERE [MONTH] = @month AND [YEAR] = @year`;
    const result = await request.query(query);
    res.json(result.recordset);
}));



module.exports = router; 