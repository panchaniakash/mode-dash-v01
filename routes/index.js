var express = require('express')
const sql = require("mssql");
var router = express.Router()

var config = {
    server: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWD,
    database: process.env.DB,
    schema: process.env.SCHEMA,
    trustServerCertificate: true,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

poolConnect.then((pool) => {
    console.log('Connected to MSSQL');
}).catch((err) => {
    console.error('Database Connection Failed! Bad Config: ', err)
});

router.post("/loadAllPages", async function (req, res) {
    console.log("----DISPLAY loadAllPages API----\n");
    let bucketId = req.body.bucketId;
    try {
        const request = pool.request();
        request.input('bucketId', sql.Int, bucketId);
        const result1 = await request.query(`SELECT PAGE_NAME, GRID_ID FROM ${config.schema}.USER_CHARTS_GRID WHERE BUCKETID = @bucketId ORDER BY PAGE_NAME`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found loadAllPages !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/addNewPage", async function (req, res) {
    console.log("----DISPLAY addNewPage API----\n");
    let bucketId = req.body.bucketId;
    let page = req.body.page;
    try {
        const request = pool.request();
        request.input('page', sql.NVarChar, page);
        request.input('bucketId', sql.Int, bucketId);

        const result1 = await request.query(`SELECT USER_CHART_GRID_ID, BUCKETID, GRID_ID, PAGE_NAME FROM dbo.USER_CHARTS_GRID WHERE PAGE_NAME = @page;`);

        if (result1.recordset.length == 0) {
            await request.query(`INSERT INTO dbo.USER_CHARTS_GRID (BUCKETID, GRID_ID, PAGE_NAME) VALUES(@bucketId, 1, @page);`);
            res.json({ status: 200 });
        } else {
            res.json({ status: 300 });
        }
    } catch (error) {
        console.error("catch error found addNewPage !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post("/loadPageGridDaily", async function (req, res) {
    console.log("----DISPLAY loadPageGridDaily API----\n");
    let bucketId = req.body.bucketId;
    try {
        const request = pool.request();
        request.input('bucketId', sql.Int, bucketId);
        const result1 = await request.query(`SELECT gm.GRID_HTML, gm.TILE_COUNT FROM ${config.schema}.DASHBOARD_GRID dg JOIN GRID_MASTER gm ON dg.GRID_ID = gm.GRID_ID WHERE dg.BUCKET_ID = @bucketId AND DASHBOARD = 'DAILY'`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found loadPageGrid !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/loadPageGridMonthly", async function (req, res) {
    console.log("----DISPLAY loadPageGridMonthly API----\n");
    let bucketId = req.body.bucketId;
    try {
        const request = pool.request();
        request.input('bucketId', sql.Int, bucketId);
        const result1 = await request.query(`SELECT gm.GRID_HTML, gm.TILE_COUNT FROM ${config.schema}.DASHBOARD_GRID dg JOIN GRID_MASTER gm ON dg.GRID_ID = gm.GRID_ID WHERE dg.BUCKET_ID = @bucketId AND DASHBOARD = 'MONTHLY'`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found loadPageGrid !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/removeTab", async function (req, res) {
    console.log("----DISPLAY removeTab API----\n");
    let page = req.body.page;
    try {
        const request = pool.request();
        request.input('page', sql.NVarChar, page);
        await request.query(`DELETE FROM dbo.USER_CHARTS_GRID WHERE PAGE_NAME = @page;`);
        await request.query(`DELETE FROM dbo.USER_CHARTS WHERE PAGE_NAME = @page;`);
        res.json({ status: 200 });
    } catch (error) {
        console.error("catch error found removeTab !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get("/loadAllGrids", async function (req, res) {
    console.log("----DISPLAY loadAllGrids API----\n");
    try {
        const request = pool.request();
        const result1 = await request.query(`SELECT GRID_ID, GRID_HTML, TILE_COUNT FROM ${config.schema}.GRID_MASTER`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found loadAllGrids !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/getVertical", async function (req, res) {
    console.log("----DISPLAY getVertical API----\n");
    try {
        const { bucketId, userId } = req.body;
        const request = pool.request();
        request.input('bucketId', sql.Int, bucketId);
        const result = await request.query(`SELECT ANALYTICS_GROUP_LEVEL_NAME FROM ${config.schema}.[ANALYTICS_GROUPS] WHERE ANALYTICS_GROUP_ID = @bucketId`);

        if (result.recordset.length > 0) {
            if (result.recordset[0].ANALYTICS_GROUP_LEVEL_NAME === "GROUP SECURITY") {
                const result1 = await request.query(`SELECT DISTINCT VNAME FROM ${config.schema}.VERTICAL WHERE VSTATUS = 'ACTIVE' ORDER BY VNAME ASC`);
                res.json(result1.recordset);
            } else {
                request.input('userId', sql.Int, userId);
                const result3 = await request.query(`SELECT DISTINCT VID FROM ${config.schema}.USERGROUPS WHERE USERID = @userId`);
                if (result3.recordset.length > 0) {
                    const vidArray = result3.recordset.map(row => row.VID);
                    const result4 = await request.query(`SELECT DISTINCT VNAME FROM ${config.schema}.VERTICAL WHERE VSTATUS = 'ACTIVE' AND VID IN (${vidArray.join(',')}) ORDER BY VNAME ASC`);
                    res.json(result4.recordset);
                } else {
                    res.status(404).json({ error: 'No matching VID found in USERGROUPS for the provided USERID' });
                }
            }
        } else {
            res.status(404).json({ error: 'No analytics group found for the provided bucketId' });
        }
    } catch (error) {
        console.error("catch error found in getVertical!", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post("/getBusiness", async (req, res) => {
    console.log("----DISPLAY getBusiness API----\n");
    try {
        const { vertical, bucketId, userId } = req.body;
        const request = pool.request();
        request.input('bucketId', sql.Int, bucketId);
        const result = await request.query(`SELECT ANALYTICS_GROUP_LEVEL_NAME FROM ${config.schema}.[ANALYTICS_GROUPS] WHERE ANALYTICS_GROUP_ID = @bucketId`);

        if (result.recordset.length > 0) {
            if (result.recordset[0].ANALYTICS_GROUP_LEVEL_NAME === "GROUP SECURITY") {
                request.input('vertical', sql.NVarChar, vertical);
                const result1 = await request.query(`SELECT DISTINCT B.BUNAME FROM ${config.schema}.BUSINESS B JOIN ${config.schema}.VERTICAL V ON B.VID = V.VID WHERE V.VNAME = @vertical AND B.BUSTATUS = 'ACTIVE' ORDER BY B.BUNAME ASC`);
                res.json(result1.recordset);
            } else {
                request.input('userId', sql.Int, userId);
                const result3 = await request.query(`SELECT DISTINCT BUID FROM ${config.schema}.USERGROUPS WHERE USERID = @userId`);
                if (result3.recordset.length > 0) {
                    const buidArray = result3.recordset.map(row => row.BUID);
                    request.input('vertical', sql.NVarChar, vertical);
                    const result4 = await request.query(`SELECT DISTINCT B.BUNAME FROM ${config.schema}.BUSINESS B JOIN ${config.schema}.VERTICAL V ON B.VID = V.VID WHERE V.VNAME = @vertical AND BUID IN (${buidArray.join(',')}) AND B.BUSTATUS = 'ACTIVE' ORDER BY B.BUNAME ASC`);
                    res.json(result4.recordset);
                } else {
                    res.status(404).json({ error: 'No matching BUID found in USERGROUPS for the provided USERID' });
                }
            }
        } else {
            res.status(404).json({ error: 'No analytics group found for the provided bucketId' });
        }
    } catch (error) {
        console.error("catch error found in getBusiness!", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post("/getSite", async (req, res) => {
    console.log("----DISPLAY getSite API----\n");
    try {
        const { Business, bucketId, userId } = req.body;
        const request = pool.request();
        request.input('bucketId', sql.Int, bucketId);
        const result = await request.query(`SELECT ANALYTICS_GROUP_LEVEL_NAME FROM ${config.schema}.[ANALYTICS_GROUPS] WHERE ANALYTICS_GROUP_ID = @bucketId`);

        if (result.recordset.length > 0) {
            if (result.recordset[0].ANALYTICS_GROUP_LEVEL_NAME === "GROUP SECURITY") {
                request.input('Business', sql.NVarChar, Business);
                const result1 = await request.query(`SELECT DISTINCT s.SINAME FROM ${config.schema}.SITE s JOIN ${config.schema}.BUSINESS b ON s.BUID = b.BUID WHERE b.BUNAME = @Business AND S.SISTATUS = 'ACTIVE' ORDER BY S.SINAME ASC`);
                res.json(result1.recordset);
            } else {
                request.input('userId', sql.Int, userId);
                const result3 = await request.query(`SELECT DISTINCT SIID FROM ${config.schema}.USERGROUPS WHERE USERID = @userId`);
                if (result3.recordset.length > 0) {
                    const siidArray = result3.recordset.map(row => row.SIID);
                    request.input('Business', sql.NVarChar, Business);
                    const result4 = await request.query(`SELECT DISTINCT s.SINAME FROM ${config.schema}.SITE s JOIN ${config.schema}.BUSINESS b ON s.BUID = b.BUID WHERE b.BUNAME = @Business AND s.SIID IN (${siidArray.join(',')}) AND S.SISTATUS = 'ACTIVE' ORDER BY S.SINAME ASC`);
                    res.json(result4.recordset);
                } else {
                    res.status(404).json({ error: 'No matching SIID found in USERGROUPS for the provided USERID' });
                }
            }
        } else {
            res.status(404).json({ error: 'No analytics group found for the provided bucketId' });
        }
    } catch (error) {
        console.error("catch error found in getSite!", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



router.get("/getYearsFromSecAuto", async (req, res) => {
    console.log("----DISPLAY getYearsFromSecAuto API----\n");
    try {
        const request = pool.request();
        const result1 = await request.query(`SELECT DISTINCT YEAR FROM ${config.schema}.OL_DSRSECAUTO ORDER BY YEAR DESC`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found getYearsFromSecAuto !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post("/getMonthFromSecAuto", async (req, res) => {
    console.log("----DISPLAY getMonthFromSecAuto API----\n");
    try {
        const { year } = req.body;
        const request = pool.request();
        request.input('year', sql.NVarChar, year);
        const result1 = await request.query(`SELECT DISTINCT MONTH,MONTHNAME FROM ${config.schema}.OL_DSRSECAUTO WHERE YEAR = @year ORDER BY MONTH DESC`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found getMonthFromSecAuto !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/saveGrid", async (req, res) => {
    console.log("----DISPLAY saveGrid API----\n");
    try {
        const { bucketId, page, gridId } = req.body;
        const request = pool.request();
        request.input('gridId', sql.Int, gridId);
        request.input('page', sql.NVarChar, page);
        request.input('bucketId', sql.Int, bucketId);
        await request.query(`UPDATE dbo.USER_CHARTS_GRID SET GRID_ID = @gridId WHERE PAGE_NAME = @page AND BUCKETID = @bucketId`);
        res.json({ status: 200 });
    } catch (error) {
        console.error("catch error found saveGrid !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/loadSetCharts", async (req, res) => {
    console.log("----DISPLAY loadSetCharts API----\n");
    try {
        const { bucketId, page } = req.body;
        const request = pool.request();
        request.input('bucketId', sql.Int, bucketId);
        request.input('page', sql.NVarChar, page);

        const result1 = await request.query(`SELECT DISTINCT TABLE_NAME FROM dbo.USER_CHARTS uc WHERE uc.BUCKETID = @bucketId AND uc.PAGE_NAME = @page`);
        const result2 = await request.query(`SELECT uc.USER_CHART_ID, uc.BUCKETID, cm.CHART_NAME , uc.CHART_ID, uc.CHART_OPTIONS_JSON, uc.CHART_JSON, uc.DATA_QUERY_PREFIX, uc.DATA_QUERY_SUFFIX, uc.TABLE_NAME, uc.TILE_DIV_ID, uc.PAGE_NAME FROM dbo.USER_CHARTS uc JOIN dbo.CHART_MASTER cm ON cm.CHART_ID = uc.CHART_ID WHERE uc.BUCKETID = @bucketId AND uc.PAGE_NAME = @page;`);

        res.json({
            charts: result2.recordset,
            filters: result1.recordset.length === 1
        });
    } catch (error) {
        console.error("catch error found loadSetCharts !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/loadSetWidgets", async (req, res) => {
    console.log("----DISPLAY loadSetWidgets API----\n");
    try {
        const { bucketId } = req.body;
        const request = pool.request();
        request.input('bucketId', sql.Int, bucketId);
        const result2 = await request.query(`SELECT do.*, dwm.WIDGET_NAME FROM DASHBOARD_OBJECTS do JOIN DASHBOARD_WIDGET_MASTER dwm ON dwm.WIDGET_ID = do.OBJECT_ID WHERE do.OBJECT_TYPE = 'Widget' AND do.BUCKET_ID = @bucketId;`);
        res.json({ widgets: result2.recordset });
    } catch (error) {
        console.error("catch error found loadSetWidgets !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get("/loadChartTypes", async (req, res) => {
    console.log("----DISPLAY loadChartTypes API----\n");
    try {
        const request = pool.request();
        const result1 = await request.query(`SELECT CHART_ID, CHART_NAME FROM dbo.CHART_MASTER`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found loadChartTypes !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get("/loadWidgetTypes", async (req, res) => {
    console.log("----DISPLAY loadWidgetTypes API----\n");
    try {
        const request = pool.request();
        const result1 = await request.query(`SELECT WIDGET_ID, WIDGET_HTML, WIDGET_CHART_ID, WIDGET_NAME FROM dbo.DASHBOARD_WIDGET_MASTER`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found loadWidgetTypes !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get("/loadAllTables", async (req, res) => {
    console.log("----DISPLAY loadAllTables API----\n");
    try {
        const request = pool.request();
        const result1 = await request.query(`SELECT t.name TABLE_NAME, cnm.USABLE_NAME FROM sys.tables t INNER JOIN sys.schemas s ON t.schema_id = s.schema_id JOIN dbo.COLUMN_NAME_MAPPING cnm ON t.name = cnm.ACTUAL_NAME WHERE t.name LIKE 'OL%' ORDER BY s.name, t.name;`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found loadAllTables !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/getChartFromId", async (req, res) => {
    console.log("----DISPLAY getChartFromId API----\n");
    try {
        const { chartId } = req.body;
        const request = pool.request();
        request.input('chartId', sql.Int, chartId);
        const result1 = await request.query(`SELECT CHART_ID, CHART_NAME FROM dbo.CHART_MASTER WHERE CHART_ID = @chartId;`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found getChartFromId !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/deleteChart", async (req, res) => {
    console.log("----DISPLAY deleteChart API----\n");
    try {
        const { userObjectId } = req.body;
        const request = pool.request();
        request.input('userObjectId', sql.Int, userObjectId);
        await request.query(`DELETE FROM dbo.USER_CHARTS WHERE USER_CHART_ID = @userObjectId`);
        res.json({ status: 200 });
    } catch (error) {
        console.error("catch error found deleteChart !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/deleteWidget", async (req, res) => {
    console.log("----DISPLAY deleteWidget API----\n");
    try {
        const { userObjectId } = req.body;
        const request = pool.request();
        request.input('userObjectId', sql.Int, userObjectId);
        await request.query(`DELETE FROM dbo.DASHBOARD_OBJECTS WHERE D_OBJECT_ID = @userObjectId`);
        res.json({ status: 200 });
    } catch (error) {
        console.error("catch error found deleteWidget !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/getWidgetFromId", async (req, res) => {
    console.log("----DISPLAY getWidgetFromId API----\n");
    try {
        const { widgetId } = req.body;
        const request = pool.request();
        request.input('widgetId', sql.Int, widgetId);
        const result1 = await request.query(`SELECT WIDGET_ID, WIDGET_NAME FROM dbo.DASHBOARD_WIDGET_MASTER WHERE WIDGET_ID = @widgetId;`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found getWidgetFromId !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/getTableColumnsAPI", async function (req, res) {
    console.log("----DISPLAY getTableColumnsAPI API----\n");
    let table = req.body.table;
    try {
        await sql.connect(config);
        var request = new sql.Request();
        var q1 = `SELECT i.COLUMN_NAME,cnm.USABLE_NAME , i.DATA_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS i
            JOIN dbo.COLUMN_NAME_MAPPING cnm ON i.COLUMN_NAME = cnm.ACTUAL_NAME 
            WHERE i.TABLE_NAME = '${table}' AND i.DATA_TYPE = 'int' AND NOT i.COLUMN_NAME LIKE '%ID' AND i.COLUMN_NAME NOT LIKE '%MONTH%';`;
        console.log(q1);
        const result1 = await request.query(q1);
        res.json(result1.recordset);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        console.log("catch error found in getTableColumnsAPI !", error);
    }
});


router.post("/getTableGroupByColumnsAPI", async function (req, res) {
    console.log("----DISPLAY getTableGroupByColumnsAPI API----\n");
    let table = req.body.table;
    try {
        await sql.connect(config);
        var request = new sql.Request();
        var q1 = `SELECT i.COLUMN_NAME,cnm.USABLE_NAME , i.DATA_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS i
            JOIN dbo.COLUMN_NAME_MAPPING cnm ON i.COLUMN_NAME = cnm.ACTUAL_NAME 
            WHERE i.TABLE_NAME = '${table}' AND (i.DATA_TYPE = 'nvarchar' OR i.DATA_TYPE = 'text' OR i.DATA_TYPE = 'varchar') AND NOT i.COLUMN_NAME LIKE '%ID' ORDER BY i.COLUMN_NAME ASC;`;
        console.log(q1);
        const result1 = await request.query(q1);
        res.json(result1.recordset);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        console.log("catch error found in getTableGroupByColumnsAPI", error);
    }
});


router.post("/getGroupByValuesAPI", async function (req, res) {
    console.log("----DISPLAY getGroupByValuesAPI API----\n");
    let table = req.body.table;
    let column = req.body.column;
    try {
        await sql.connect(config);
        var request = new sql.Request();
        var q1 = `SELECT DISTINCT ${column} FROM dbo.${table}`;
        console.log(q1);
        const result1 = await request.query(q1);
        res.json(result1.recordset);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        console.log("catch error found in getGroupByValuesAPI", error);
    }
});

router.post("/getChartOptions", async (req, res) => {
    console.log("----DISPLAY getChartOptions API----\n");
    try {
        const { userChartId } = req.body;
        const request = pool.request();
        request.input('userChartId', sql.Int, userChartId);
        const result1 = await request.query(`SELECT * FROM dbo.USER_CHARTS WHERE USER_CHART_ID = @userChartId`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found getChartOptions", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/getWidgetOptions", async (req, res) => {
    console.log("----DISPLAY getWidgetOptions API----\n");
    try {
        const { userChartId } = req.body;
        const request = pool.request();
        request.input('userChartId', sql.Int, userChartId);
        const result1 = await request.query(`SELECT * FROM dbo.DASHBOARD_OBJECTS WHERE D_OBJECT_ID = @userChartId`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found getWidgetOptions", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/getUserLevelFilters", async (req, res) => {
    console.log("----DISPLAY getUserLevelFilters API----\n");
    try {
        const { userId } = req.body;
        const request = pool.request();
        request.input('userId', sql.Int, userId);
        const result1 = await request.query(`SELECT aug.A_UG_ID,aug.ANALYTICS_GROUPS_ID, aug.USERID, ag.ANALYTICS_GROUP_NAME, ag.ANALYTICS_GROUP_LEVEL,ag.ANALYTICS_GROUP_LEVEL_NAME,ag.ANALYTICS_GROUP_LEVEL_ID,V.VID ,B.BUID,S.SIID ,V.VNAME ,B.BUNAME ,S.SINAME, V.VCODE ,B.BUCODE ,S.SICODE FROM dbo.ANALYTICS_USER_GROUP_MAPPING aug JOIN dbo.ANALYTICS_GROUPS ag on ag.ANALYTICS_GROUP_ID = aug.ANALYTICS_GROUPS_ID JOIN dbo.USERGROUPS u ON U.USERID = AUG.USERID JOIN dbo.VERTICAL v ON V.VID = U.VID JOIN dbo.BUSINESS b ON B.BUID = U.BUID JOIN dbo.SITE s ON S.SIID = U.SIID WHERE aug.USERID = @userId;`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found getUserLevelFilters", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/getUserLevelFiltersMonthly", async (req, res) => {
    console.log("----DISPLAY getUserLevelFiltersMonthly API----\n");
    try {
        const { userId } = req.body;
        const request = pool.request();
        request.input('userId', sql.Int, userId);
        const result1 = await request.query(`SELECT aug.A_UG_ID,aug.ANALYTICS_GROUPS_ID, aug.USERID, ag.ANALYTICS_GROUP_NAME, ag.ANALYTICS_GROUP_LEVEL,ag.ANALYTICS_GROUP_LEVEL_NAME,ag.ANALYTICS_GROUP_LEVEL_ID,V.VID ,B.BUID,S.SIID ,V.VNAME ,B.BUNAME ,S.SINAME, V.VCODE ,B.BUCODE ,S.SICODE FROM dbo.ANALYTICS_USER_GROUP_MAPPING_MONTHLY aug JOIN dbo.ANALYTICS_GROUPS ag on ag.ANALYTICS_GROUP_ID = aug.ANALYTICS_GROUPS_ID JOIN dbo.USERGROUPS u ON U.USERID = AUG.USERID JOIN dbo.VERTICAL v ON V.VID = U.VID JOIN dbo.BUSINESS b ON B.BUID = U.BUID JOIN dbo.SITE s ON S.SIID = U.SIID WHERE aug.USERID = @userId;`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found getUserLevelFiltersMonthly", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/getUserLevel", async (req, res) => {
    console.log("----DISPLAY getUserLevel API----\n");
    try {
        const { userId } = req.body;
        const request = pool.request();
        request.input('userId', sql.Int, userId);
        const result1 = await request.query(`SELECT R.RCODE FROM USERPROFILE u JOIN [ROLE] r ON U.RID = R.RID WHERE USERID = @userId`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found getUserLevel", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/saveLinearChartJsonAPI", async (req, res) => {
    console.log("----DISPLAY saveLinearChartJsonAPI API----\n");
    try {
        const { bucketId, pageName, userChartId, chartId, chartOptionsJson, tableName, divId } = req.body;
        const request = pool.request();
        request.input('userChartId', sql.Int, userChartId);
        const result1 = await request.query(`SELECT * FROM dbo.USER_CHARTS uc WHERE uc.USER_CHART_ID = @userChartId`);

        request.input('bucketId', sql.Int, bucketId);
        request.input('chartId', sql.Int, chartId);
        request.input('chartOptionsJson', sql.NVarChar, chartOptionsJson);
        request.input('tableName', sql.NVarChar, tableName);
        request.input('divId', sql.NVarChar, divId);
        request.input('pageName', sql.NVarChar, pageName);

        if (result1.recordset.length > 0) {
            await request.query(`UPDATE dbo.USER_CHARTS SET BUCKETID=@bucketId, CHART_ID=@chartId, CHART_OPTIONS_JSON=@chartOptionsJson, TABLE_NAME=@tableName, TILE_DIV_ID=@divId, PAGE_NAME=@pageName WHERE USER_CHART_ID = @userChartId;`);
        } else {
            await request.query(`INSERT INTO dbo.USER_CHARTS (BUCKETID, CHART_ID, CHART_OPTIONS_JSON, TABLE_NAME, TILE_DIV_ID, PAGE_NAME) VALUES(@bucketId, @chartId, @chartOptionsJson, @tableName, @divId, @pageName);`);
        }

        if (userChartId !== 0) {
            res.json({ userChartID: userChartId });
        } else {
            const result3 = await request.query(`SELECT MAX(USER_CHART_ID) USER_CHART_ID FROM dbo.USER_CHARTS;`);
            res.json({ userChartID: result3.recordset[0].USER_CHART_ID });
        }
    } catch (error) {
        console.error("catch error found saveLinearChartJsonAPI !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/saveObjectJsonAPI", async (req, res) => {
    console.log("----DISPLAY saveObjectJsonAPI API----\n");
    try {
        const { bucketId, userObjectId, objectId, objectOptionsJson, tableName, divId, objectType } = req.body;
        const request = pool.request();
        request.input('userObjectId', sql.Int, userObjectId);
        const result1 = await request.query(`SELECT * FROM dbo.DASHBOARD_OBJECTS do WHERE do.D_OBJECT_ID = @userObjectId`);

        request.input('bucketId', sql.Int, bucketId);
        request.input('objectId', sql.Int, objectId);
        request.input('objectOptionsJson', sql.NVarChar, objectOptionsJson);
        request.input('tableName', sql.NVarChar, tableName);
        request.input('divId', sql.NVarChar, divId);
        request.input('objectType', sql.NVarChar, objectType);

        if (result1.recordset.length > 0) {
            await request.query(`UPDATE dbo.DASHBOARD_OBJECTS SET BUCKET_ID=@bucketId, OBJECT_ID=@objectId, OBJECT_OPTIONS_JSON=@objectOptionsJson, TABLE_NAME=@tableName, TILE_DIV_ID=@divId, OBJECT_TYPE=@objectType WHERE D_OBJECT_ID = @userObjectId;`);
        } else {
            await request.query(`INSERT INTO dbo.DASHBOARD_OBJECTS (BUCKET_ID, OBJECT_ID, OBJECT_OPTIONS_JSON, TABLE_NAME, TILE_DIV_ID, OBJECT_TYPE) VALUES(@bucketId, @objectId, @objectOptionsJson, @tableName, @divId, @objectType);`);
        }

        if (userObjectId !== 0) {
            res.json({ userObjectId: userObjectId });
        } else {
            const result3 = await request.query(`SELECT MAX(D_OBJECT_ID) USER_WIDGET_ID FROM dbo.DASHBOARD_OBJECTS;`);
            res.json({ userObjectId: result3.recordset[0].USER_WIDGET_ID });
        }
    } catch (error) {
        console.error("catch error found saveObjectJsonAPI !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/createDataForCharty", async (req, res) => {
    console.log("----DISPLAY createDataForCharty API----\n");
    try {
        const { userChartId } = req.body;
        const request = pool.request();
        request.input('userChartId', sql.Int, userChartId);
        const result1 = await request.query(`SELECT * FROM dbo.USER_CHARTS WHERE USER_CHART_ID = @userChartId`);

        const chartOptionsJson = JSON.parse(result1.recordset[0].CHART_OPTIONS_JSON);
        const tableName = result1.recordset[0].TABLE_NAME;
        let dataQuery = `SELECT `;
        if (typeof chartOptionsJson["tableColumns"] === 'string') {
            dataQuery += `${chartOptionsJson["aggregation"]}(${chartOptionsJson["tableColumns"]}) "${chartOptionsJson["tableColumnsNames"]}", `;
        } else {
            for (var i = 0; i < chartOptionsJson["tableColumns"].length; i++) {
                dataQuery += `${chartOptionsJson["aggregation"]}(${chartOptionsJson["tableColumns"][i]}) "${chartOptionsJson["tableColumnsNames"][i]}", `;
            }
        }
        dataQuery += `${chartOptionsJson["groupByColumn"]} FROM dbo.${tableName} `;
        if (chartOptionsJson["groupByValues"].length > 0) {
            const gbValues = chartOptionsJson["groupByValues"].map(v => `'${v}'`).join(',');
            dataQuery += `WHERE ${chartOptionsJson["groupByColumn"]} IN (${gbValues}) `;
        } else {
            dataQuery += `WHERE ${chartOptionsJson["groupByColumn"]} LIKE '%%' `;
        }
        const prefixQuery = dataQuery.replace(/'/g, "''");
        const suffixQuery = `GROUP BY ${chartOptionsJson["groupByColumn"]} ORDER BY ${chartOptionsJson["groupByColumn"]}`;
        const suffixQuery1 = suffixQuery.replace(/'/g, "''");

        request.input('prefixQuery', sql.NVarChar, prefixQuery);
        request.input('suffixQuery1', sql.NVarChar, suffixQuery1);
        await request.query(`UPDATE dbo.USER_CHARTS SET DATA_QUERY_PREFIX=@prefixQuery, DATA_QUERY_SUFFIX=@suffixQuery1 WHERE USER_CHART_ID = @userChartId`);
        res.json({ status: 200 });
    } catch (error) {
        console.error("catch error found createDataForCharty", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/createDataForChartDataTrend", async (req, res) => {
    console.log("----DISPLAY createDataForChartDataTrend API----\n");
    try {
        const { userChartId } = req.body;
        const request = pool.request();
        request.input('userChartId', sql.Int, userChartId);
        const result1 = await request.query(`SELECT * FROM dbo.USER_CHARTS WHERE USER_CHART_ID = @userChartId`);

        const chartOptionsJson = JSON.parse(result1.recordset[0].CHART_OPTIONS_JSON);
        const groupBy = chartOptionsJson["groupByColumn"];
        let c = '';
        if (groupBy === 'VNAME') {
            c = `V.VNAME`;
        } else if (groupBy === 'BUNAME') {
            c = 'B.BUNAME';
        } else if (groupBy === 'SINAME') {
            c = 'S.SINAME';
        }
        const dataQuery = `SELECT COUNT(*) COUNT,${c}, I.DSRSTATUS FROM DSRSTATUS I JOIN VERTICAL V ON V.VID = I.VID JOIN BUSINESS B ON B.BUID = I.BUID JOIN SITE S ON S.SIID = I.SIID WHERE '1' = '1' `;
        const prefixQuery = dataQuery.replace(/'/g, "''");
        const suffixQuery = `GROUP BY ${c},I.DSRSTATUS ORDER BY ${c}`;
        const suffixQuery1 = suffixQuery.replace(/'/g, "''");

        request.input('prefixQuery', sql.NVarChar, prefixQuery);
        request.input('suffixQuery1', sql.NVarChar, suffixQuery1);
        await request.query(`UPDATE dbo.USER_CHARTS SET DATA_QUERY_PREFIX=@prefixQuery, DATA_QUERY_SUFFIX=@suffixQuery1 WHERE USER_CHART_ID = @userChartId`);
        res.json({ status: 200 });
    } catch (error) {
        console.error("catch error found createDataForChartDataTrend", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



router.post("/createDataForPercentChart", async (req, res) => {
    console.log("----DISPLAY createDataForPercentChart API----\n");
    try {
        const { userChartId } = req.body;
        const request = pool.request();
        request.input('userChartId', sql.Int, userChartId);
        const result1 = await request.query(`SELECT * FROM dbo.USER_CHARTS WHERE USER_CHART_ID = @userChartId`);

        const chartOptionsJson = JSON.parse(result1.recordset[0].CHART_OPTIONS_JSON);
        const tableName = result1.recordset[0].TABLE_NAME;
        let dataQuery = `SELECT `;
        if (typeof chartOptionsJson["tableColumns"] === 'string') {
            dataQuery += `${chartOptionsJson["aggregation"]}(${chartOptionsJson["tableColumns"]}) "${chartOptionsJson["tableColumnsNames"]}" `;
        } else {
            for (var i = 0; i < chartOptionsJson["tableColumns"].length; i++) {
                if (i == 0) {
                    dataQuery += `${chartOptionsJson["aggregation"]}(${chartOptionsJson["tableColumns"][i]}) "${chartOptionsJson["tableColumnsNames"][i]}", `;
                } else {
                    dataQuery += `${chartOptionsJson["aggregation"]}(${chartOptionsJson["tableColumns"][i]}) "${chartOptionsJson["tableColumnsNames"][i]}" `;
                }
            }
        }
        dataQuery += `FROM dbo.${tableName} WHERE '1' = '1' `;
        const prefixQuery = dataQuery.replace(/'/g, "''");
        const suffixQuery = ``;
        const suffixQuery1 = suffixQuery.replace(/'/g, "''");

        request.input('prefixQuery', sql.NVarChar, prefixQuery);
        request.input('suffixQuery1', sql.NVarChar, suffixQuery1);
        await request.query(`UPDATE dbo.USER_CHARTS SET DATA_QUERY_PREFIX=@prefixQuery, DATA_QUERY_SUFFIX=@suffixQuery1 WHERE USER_CHART_ID = @userChartId`);
        res.json({ status: 200 });
    } catch (error) {
        console.error("catch error found createDataForPercentChart", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/getLinearChartDataAPI", async function (req, res) {
    console.log("----DISPLAY getLinearChartDataAPI API----\n");
    var userChartId = req.body.userChartId;
    var filterString = req.body.filterString;

    try {
        const pool = await sql.connect(config);

        const result1 = await pool.query`SELECT * FROM dbo.USER_CHARTS WHERE USER_CHART_ID = ${userChartId}`;
        const result2 = await pool.query(result1.recordset[0].CHART_JSON == null
            ? `SELECT CHART_JSON FROM dbo.CHART_MASTER WHERE CHART_ID = ${result1.recordset[0].CHART_ID}`
            : `SELECT CHART_JSON FROM dbo.USER_CHARTS WHERE USER_CHART_ID = ${userChartId}`);

        // Check if the DATA_QUERY_PREFIX contains 'dbo.OL_INCIDENTS' and filterString contains 'DATE ='
        if (result1.recordset[0].DATA_QUERY_PREFIX.includes("dbo.OL_INCIDENTS") && filterString.includes("DATE =")) {
            // Replace 'DATE' with 'OCCURREDDATE' in filterString
            filterString = filterString.replace(/DATE =/g, "OCCUREDDATE =");
        }

        // Build the dataQuery with the possibly modified filterString
        const dataQuery = result1.recordset[0].DATA_QUERY_PREFIX + " " + filterString + " " + result1.recordset[0].DATA_QUERY_SUFFIX;
        console.log(dataQuery);
        const result3 = await pool.query(dataQuery , "sssssssssss");

        console.log(result3.recordset);

        var chartOptionsJson = JSON.parse(result1.recordset[0].CHART_OPTIONS_JSON);
        var labelsQuery = `SELECT DISTINCT ${chartOptionsJson["groupByColumn"]} FROM dbo.${result1.recordset[0].TABLE_NAME} `;
        if (chartOptionsJson["groupByValues"].length > 0) {
            var gbValues = `(`;
            for (var i = 0; i < chartOptionsJson["groupByValues"].length; i++) {
                if (i == 0) {
                    gbValues += `'${chartOptionsJson["groupByValues"][i]}'`;
                } else {
                    gbValues += `,'${chartOptionsJson["groupByValues"][i]}'`;
                }
            }
            gbValues += `)`;
            labelsQuery += `WHERE ${chartOptionsJson["groupByColumn"]} IN ${gbValues} `;
        } else {
            labelsQuery += `WHERE ${chartOptionsJson["groupByColumn"]} LIKE '%%' `;
        }
        labelsQuery += filterString;
        labelsQuery += ` ORDER BY ${chartOptionsJson["groupByColumn"]}`;
        console.log(labelsQuery);

        const result4 = await pool.query(labelsQuery);

        res.json({
            chartJson: result2.recordset[0].CHART_JSON,
            chartOptionsJson: result1.recordset[0].CHART_OPTIONS_JSON,
            chartData: result3.recordset,
            labels: result4.recordset
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        console.log("catch error found getLinearChartDataAPI", error);
    }
});

router.post("/getPercentChartDataAPI", async function (req, res) {
    console.log("----DISPLAY getPercentChartDataAPI API----\n");
    var userChartId = req.body.userChartId;
    var filterString = req.body.filterString;

    try {
        const pool = await sql.connect(config);

        const result1 = await pool.query`SELECT * FROM dbo.USER_CHARTS WHERE USER_CHART_ID = ${userChartId}`;
        const result2 = await pool.query(result1.recordset[0].CHART_JSON == null
            ? `SELECT CHART_JSON FROM dbo.CHART_MASTER WHERE CHART_ID = ${result1.recordset[0].CHART_ID}`
            : `SELECT CHART_JSON FROM dbo.USER_CHARTS WHERE USER_CHART_ID = ${userChartId}`);

        // Check if the DATA_QUERY_PREFIX contains 'dbo.OL_INCIDENTS' and filterString contains 'DATE ='
        if (result1.recordset[0].DATA_QUERY_PREFIX.includes("dbo.OL_INCIDENTS") && filterString.includes("DATE =")) {
            // Replace 'DATE' with 'OCCURREDDATE' in filterString
            filterString = filterString.replace(/DATE =/g, "OCCUREDDATE =");
        }

        // Build the dataQuery with the possibly modified filterString
        const dataQuery = result1.recordset[0].DATA_QUERY_PREFIX + " " + filterString + " " + result1.recordset[0].DATA_QUERY_SUFFIX;
        console.log(dataQuery);
        const result3 = await pool.query(dataQuery , "sssssssssss");
        console.log(result3.recordset);

        res.json({
            chartJson: result2.recordset[0].CHART_JSON,
            chartOptionsJson: result1.recordset[0].CHART_OPTIONS_JSON,
            chartData: result3.recordset
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        console.log("catch error found getPercentChartDataAPI", error);
    }
});

router.post("/saveChartJsonAPI", async (req, res) => {
    console.log("----DISPLAY saveChartJsonAPI API----\n");
    try {
        const { userChartId, chartJson } = req.body;
        const request = pool.request();
        request.input('userChartId', sql.Int, userChartId);
        request.input('chartJson', sql.NVarChar, chartJson);
        const result1 = await request.query(`UPDATE dbo.USER_CHARTS SET CHART_JSON = @chartJson WHERE USER_CHART_ID = @userChartId`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found saveChartJsonAPI", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post("/getFilterColumnsAPI", async (req, res) => {
    console.log("----DISPLAY getFilterColumnsAPI API----\n");
    try {
        const { bucketId, page } = req.body;
        const request = pool.request();
        request.input('bucketId', sql.Int, bucketId);
        request.input('page', sql.NVarChar, page);
        const result1 = await request.query(`SELECT DISTINCT TABLE_NAME FROM dbo.USER_CHARTS WHERE BUCKETID = @bucketId AND PAGE_NAME = @page`);

        if (result1.recordset.length > 1) {
            res.json({ filters: false, columnList: [] });
        } else {
            request.input('tableName', sql.NVarChar, result1.recordset[0].TABLE_NAME);
            const result2 = await request.query(`SELECT i.COLUMN_NAME,cnm.USABLE_NAME , i.DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS i JOIN dbo.COLUMN_NAME_MAPPING cnm ON i.COLUMN_NAME = cnm.ACTUAL_NAME WHERE i.TABLE_NAME = @tableName AND (i.COLUMN_NAME NOT LIKE '%ID' AND i.COLUMN_NAME NOT LIKE '%MONTH%' AND i.COLUMN_NAME NOT LIKE '%IDS' AND i.COLUMN_NAME NOT LIKE '%YEAR%' AND i.COLUMN_NAME NOT LIKE '%QUARTER%' AND i.COLUMN_NAME NOT LIKE '%DATE%' AND NOT i.DATA_TYPE = 'INT') ORDER BY cnm.USABLE_NAME;`);
            res.json({ filters: true, columnList: result2.recordset, table: result1.recordset[0].TABLE_NAME });
        }
    } catch (error) {
        console.error("catch error found getFilterColumnsAPI", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/getChartFiltersAPI", async (req, res) => {
    console.log("----DISPLAY getChartFiltersAPI API----\n");
    try {
        let { page, bucketId, columnArray, filterString } = req.body;
        const request = pool.request();
        request.input('bucketId', sql.Int, bucketId);
        request.input('page', sql.NVarChar, page);
        const result1 = await request.query(`SELECT DISTINCT TABLE_NAME FROM dbo.USER_CHARTS WHERE BUCKETID = @bucketId AND PAGE_NAME = @page`);

        if (filterString.length > 0) {
            filterString = "WHERE " + filterString.replace('AND', '');
        }

        let q2 = `SELECT DISTINCT YEAR AS VALUE, 'YEAR' AS COLUMN_NAME FROM dbo.${result1.recordset[0].TABLE_NAME} ${filterString} `;
        q2 += `UNION SELECT DISTINCT QUARTER AS VALUE, 'QUARTER' AS COLUMN_NAME FROM dbo.${result1.recordset[0].TABLE_NAME} ${filterString} `;
        q2 += `UNION SELECT DISTINCT MONTHNAME AS VALUE, 'MONTHNAME' AS COLUMN_NAME FROM dbo.${result1.recordset[0].TABLE_NAME} ${filterString} `;
        if (result1.recordset[0].TABLE_NAME === 'OL_INCIDENTS') {
            q2 += `UNION SELECT DISTINCT OCCUREDDATE AS VALUE, 'OCCUREDDATE' AS COLUMN_NAME FROM dbo.${result1.recordset[0].TABLE_NAME} ${filterString} `;
        } else {
            q2 += `UNION SELECT DISTINCT DSRDATE AS VALUE, 'DSRDATE' AS COLUMN_NAME FROM dbo.${result1.recordset[0].TABLE_NAME} ${filterString} `;
        }

        if (result1.recordset.length <= 1) {
            for (let i = 0; i < columnArray.length; i++) {
                q2 += `UNION SELECT DISTINCT ${columnArray[i]} AS VALUE, '${columnArray[i]}' AS COLUMN_NAME FROM dbo.${result1.recordset[0].TABLE_NAME} ${filterString} `;
            }
        }

        const result2 = await request.query(q2);
        res.json({ valueList: result2.recordset, table: result1.recordset[0].TABLE_NAME });

    } catch (error) {
        console.error("catch error found getChartFiltersAPI", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/getPrevMonthDataAPI', async (req, res) => {
    console.log("----DISPLAY getPrevMonthDataAPI API----\n");
    try {
        let { month, year, userWidgetId, filterString } = req.body;
        month = month.toString();
        year = year.toString();
        let lmonth, lyear;

        if (month == '1') {
            lmonth = '12';
            lyear = (Number(year) - 1).toString();
        } else {
            lmonth = (Number(month) - 1).toString();
            lyear = year;
        }

        const request = pool.request();
        request.input('userWidgetId', sql.Int, userWidgetId);
        const widgetResult = await request.query(`SELECT do.*,dw.WIDGET_HTML FROM DASHBOARD_OBJECTS do JOIN DASHBOARD_WIDGET_MASTER dw ON dw.WIDGET_ID = do.OBJECT_ID WHERE do.D_OBJECT_ID = @userWidgetId`);
        const objectOptionsJson = JSON.parse(widgetResult.recordset[0].OBJECT_OPTIONS_JSON);
        const { tableColumns: tableColumn, tableColumnsNames: tableColumnName, table, groupByColumn, groupByColumnName, aggregation } = objectOptionsJson;

        request.input('month', sql.NVarChar, month);
        request.input('year', sql.NVarChar, year);
        request.input('lmonth', sql.NVarChar, lmonth);
        request.input('lyear', sql.NVarChar, lyear);

        const q1 = `SELECT TOP 5 ${aggregation}(${tableColumn}) AS "${tableColumnName}","${groupByColumn}" "${groupByColumnName}", "BUCODE" "BUSINESS" FROM dbo."${table}" WHERE "VNAME" LIKE '%%' AND "MONTH" = @month AND "YEAR" = @year ${filterString} GROUP BY "${groupByColumn}", "BUCODE" ORDER BY ${aggregation}(${tableColumn}) DESC`;
        const result = await request.query(q1);

        const q2 = `SELECT TOP 5 ${aggregation}(${tableColumn}) AS "${tableColumnName}","${groupByColumn}" "${groupByColumnName}", "BUCODE" "BUSINESS" FROM dbo."${table}" WHERE "VNAME" LIKE '%%' AND "MONTH" = @lmonth AND "YEAR" = @lyear GROUP BY "${groupByColumn}","BUCODE" ORDER BY ${aggregation}(${tableColumn}) DESC`;
        const result2 = await request.query(q2);

        const q3 = `SELECT DISTINCT "SINAME" FROM dbo."OL_INCIDENTS" WHERE (MONTH = @month OR MONTH = @lmonth) AND (YEAR = @year OR YEAR = @lyear)`;
        const result3 = await request.query(q3);

        res.json({ result: result.recordset, result2: result2.recordset, sites: result3.recordset, widget: widgetResult.recordset });

    } catch (error) {
        console.error("Catch error found !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/getAvgMaxMinRangeWidgetAPI', async (req, res) => {
    console.log("----DISPLAY getAvgMaxMinRangeWidgetAPI API----\n");
    try {
        let { month, year, userWidgetId, filterString } = req.body;
        month = month.toString();
        year = year.toString();

        const request = pool.request();
        request.input('userWidgetId', sql.Int, userWidgetId);
        const widgetResult = await request.query(`SELECT do.*,dw.WIDGET_HTML FROM DASHBOARD_OBJECTS do JOIN DASHBOARD_WIDGET_MASTER dw ON dw.WIDGET_ID = do.OBJECT_ID WHERE do.D_OBJECT_ID = @userWidgetId`);
        const objectOptionsJson = JSON.parse(widgetResult.recordset[0].OBJECT_OPTIONS_JSON);
        const { tableColumns: tableColumn, tableColumnsNames: tableColumnName, table, groupByColumn, groupByColumnName, aggregation } = objectOptionsJson;

        request.input('month', sql.NVarChar, month);
        request.input('year', sql.NVarChar, year);

        const q1 = `SELECT ${aggregation}(${tableColumn}) "${tableColumnName}", ${groupByColumn} "${groupByColumnName}" FROM dbo.${table} WHERE '1' = '1' AND "MONTH" = @month AND "YEAR" = @year ${filterString} GROUP BY ${groupByColumn} ORDER BY ${groupByColumn} ASC`;
        const result = await request.query(q1);
        res.json({ result: result.recordset, widget: widgetResult.recordset });

    } catch (error) {
        console.error("Catch error found !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/getIncidentDetails', async (req, res) => {
    console.log("----DISPLAY getIncidentDetails API----\n");
    try {
        let { month, year, userWidgetId, filterString } = req.body;
        month = month.toString();
        year = year.toString();

        if (filterString.includes("DATE =")) {
            filterString = filterString.replace("DATE =", "OCCUREDDATE =");
        }

        const request = pool.request();
        request.input('userWidgetId', sql.Int, userWidgetId);
        const widgetResult = await request.query(`SELECT do.*, dw.WIDGET_HTML FROM DASHBOARD_OBJECTS do JOIN DASHBOARD_WIDGET_MASTER dw ON dw.WIDGET_ID = do.OBJECT_ID WHERE do.D_OBJECT_ID = @userWidgetId`);

        request.input('month', sql.NVarChar, month);
        request.input('year', sql.NVarChar, year);

        const q1 = `SELECT "INCIDENTID", "OCCUREDDATE", "STATUS", "INCIDENTTITLE", "INCIDENTDETAILS" AS "INCIDENTDETAILS", "BUNAME", "SINAME" FROM dbo."OL_INCIDENTS" WHERE "VNAME" LIKE '%%' AND "MONTH" = @month AND "YEAR" = @year ${filterString} ORDER BY "INCIDENTID" DESC`;
        const result = await request.query(q1);

        const q3 = `SELECT DISTINCT "SINAME" FROM dbo."OL_INCIDENTS" WHERE "MONTH" = @month AND "YEAR" = @year`;
        const result3 = await request.query(q3);

        res.json({ result: result.recordset, sites: result3.recordset, widget: widgetResult.recordset });

    } catch (error) {
        console.error("Catch error found!", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/getdailyDSRStatus', async (req, res) => {
    console.log("----DISPLAY getdailyDSRStatus API----\n");
    try {
        let { filterString, userWidgetId } = req.body;

        if (filterString.includes("DATE =")) {
            filterString = filterString.replace("DATE =", "DATE =");
        }

        const request = pool.request();
        request.input('userWidgetId', sql.Int, userWidgetId);
        const widgetResult = await request.query(`SELECT do.*, dw.WIDGET_HTML FROM DASHBOARD_OBJECTS do JOIN DASHBOARD_WIDGET_MASTER dw ON dw.WIDGET_ID = do.OBJECT_ID WHERE do.D_OBJECT_ID = @userWidgetId`);

        const q1 = `SELECT BUNAME, DATE, CASE WHEN STATUS = 1 THEN 'PENDING' WHEN STATUS = 2 THEN 'COMPLETE' ELSE 'INPROGRESS' END AS STATUS, COUNT(*) AS STATUS_COUNT FROM (SELECT BUNAME, DATE, CASE WHEN PENDING = 1 THEN 1 WHEN COMPLETE = 1 THEN 2 ELSE 0 END AS STATUS FROM dbo.OL_DASHBOARD_DAILY_DSRSTATUS WHERE 1=1 ${filterString}) AS STATUS_TABLE GROUP BY BUNAME, DATE, STATUS ORDER BY BUNAME ASC, DATE, STATUS;`;
        const result = await request.query(q1);
        res.json({ result: result.recordset, widget: widgetResult.recordset });

    } catch (error) {
        console.error("Catch error found!", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});





router.post('/getIncidentDataAPI', async (req, res) => {
    console.log("----DISPLAY getIncidentDataAPI API----\n");
    try {
        let { month, year, userWidgetId, filterString } = req.body;
        const startDate = formatDate(new Date(year, parseInt(month) - 1, 1));
        const endDate = formatDate(new Date(year, parseInt(month), 0));
        filterString = filterString.replace(/ AND (\w+)/, " AND INCIDENTS.$1");
        filterString += ` AND INCIDENTS.OCCURDATE BETWEEN '${startDate}' AND '${endDate}'`;

        const request = pool.request();
        request.input('userWidgetId', sql.Int, userWidgetId);
        const widgetResult = await request.query(`SELECT do.*,dw.WIDGET_HTML FROM DASHBOARD_OBJECTS do JOIN DASHBOARD_WIDGET_MASTER dw ON dw.WIDGET_ID = do.OBJECT_ID WHERE do.D_OBJECT_ID = @userWidgetId`);

        const q1 = `SELECT "INCIDENTS"."INCIDENTID","INCIDENTS"."REPORTEDBY","INCIDENTTYPEMASTER"."INCIDENTTYPENAME","INCIDENTCATMASTER"."INCIDENTCATNAME", "INCIDENTCATMASTER_ICON"."ICON","INCIDENTCATMASTER_ICON"."COLOR","INCIDENTS"."BUID" as "BUSINESSID", "BUSINESS"."BUNAME" as BUSINESSNAME,"INCIDENTS"."VID" as VERTICALID, "VERTICAL"."VNAME" as "VERTICALNAME","INCIDENTS"."SIID" as "SITEID", "SITE"."SINAME" as "SITENAME", "INCIDENTS"."USERID","LOCATION"."LNAME" as "LOCATIONNAME","REPORTINGTYPEMASTER"."REPORTTYPENAME","STATUSMASTER"."STATUSNAME", "INCIDENTS"."INCIDENTTITLE", "INCIDENTS"."DESCRIPTION", "INCIDENTS"."OCCURDATE", "INCIDENTS"."OCCURTIME", "INCIDENTS"."REPORTEDDATE", "INCIDENTS"."REPORTEDTIME","INCIDENTS"."EMAILSTATUS","INCIDENTS"."SMSSTATUS", "INCIDENTS"."LASTUPDATEDATE", "INCIDENTS"."LASTUPDATEDTIME","ZONE"."ZNAME" as "ZONENAME","LOCATION"."LATITUDE", "LOCATION"."LONGITUDE", "INCIDENTS"."SEVERITY", "INCIDENTS"."GEOJSON", "INCIDENTS"."GEOTYPE" FROM dbo."INCIDENTS" JOIN dbo."INCIDENTTYPEMASTER" ON dbo."INCIDENTTYPEMASTER"."INCIDENTTYPEID" = dbo."INCIDENTS"."INCIDENTTYPEID" JOIN dbo."INCIDENTCATMASTER" ON dbo."INCIDENTCATMASTER"."INCIDENTCATID" = dbo."INCIDENTS"."INCIDENTCATID" JOIN dbo."BUSINESS" ON dbo."BUSINESS"."BUID" = dbo."INCIDENTS"."BUID" JOIN dbo."VERTICAL" ON dbo."VERTICAL"."VID" = dbo."INCIDENTS"."VID" JOIN dbo."SITE" ON dbo."SITE"."SIID" = dbo."INCIDENTS"."SIID" JOIN dbo."LOCATION" ON dbo."LOCATION"."LID" = dbo."INCIDENTS"."LID" JOIN dbo."REPORTINGTYPEMASTER" ON dbo."REPORTINGTYPEMASTER"."REPORTTYPEID" = dbo."INCIDENTS"."REPORTTYPEID" JOIN dbo."STATUSMASTER" ON dbo."STATUSMASTER"."STATUSID" = dbo."INCIDENTS"."STATUSID" JOIN dbo."INCIDENTCATMASTER_ICON" ON "INCIDENTCATMASTER_ICON"."INCIDENTCATID" = dbo."INCIDENTS"."INCIDENTCATID" JOIN dbo."ZONE" ON dbo."ZONE"."ZID" = dbo."INCIDENTS"."ZID" WHERE '1' = '1' ${filterString} ORDER BY dbo."INCIDENTS"."REPORTEDDATE" DESC;`;
        const result1 = await request.query(q1);
        res.json({ result: result1.recordset, widget: widgetResult.recordset });

    } catch (error) {
        console.error("Catch error found !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

function formatDate(date) {
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add 1 to month because months are zero-indexed
    var day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

router.post('/getPercentBarsWidgetAPI', async (req, res) => {
    console.log("----DISPLAY getPercentBarsWidgetAPI API----\n");
    try {
        let { month, year, userWidgetId, filterString } = req.body;
        month = month.toString();
        year = year.toString();

        const request = pool.request();
        request.input('userWidgetId', sql.Int, userWidgetId);
        const widgetResult = await request.query(`SELECT do.*,dw.WIDGET_HTML FROM DASHBOARD_OBJECTS do JOIN DASHBOARD_WIDGET_MASTER dw ON dw.WIDGET_ID = do.OBJECT_ID WHERE do.D_OBJECT_ID = @userWidgetId`);
        const objectOptionsJson = JSON.parse(widgetResult.recordset[0].OBJECT_OPTIONS_JSON);
        const { tableColumns, tableColumnsNames, table, groupByColumn, groupByColumnName, aggregation } = objectOptionsJson;

        request.input('month', sql.NVarChar, month);
        request.input('year', sql.NVarChar, year);

        const q1 = `SELECT ${aggregation}(${tableColumns[0]}) "${tableColumnsNames[0]}", ${groupByColumn} "${groupByColumnName}" FROM dbo.${table} WHERE '1' = '1' AND "MONTH" = @month AND "YEAR" = @year ${filterString} GROUP BY ${groupByColumn} ORDER BY ${groupByColumn} ASC`;
        const result = await request.query(q1);

        const q2 = `SELECT ${aggregation}(${tableColumns[1]}) "${tableColumnsNames[1]}", ${groupByColumn} "${groupByColumnName}" FROM dbo.${table} WHERE '1' = '1' AND "MONTH" = @month AND "YEAR" = @year ${filterString} GROUP BY ${groupByColumn} ORDER BY ${groupByColumn} ASC`;
        const result2 = await request.query(q2);

        res.json({ result: result.recordset, result2: result2.recordset, widget: widgetResult.recordset });

    } catch (error) {
        console.error("Catch error found !", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




router.post("/getChart3Data", async (req, res) => {
    console.log("----DISPLAY getChart3Data API----\n");
    try {
        const { month, year } = req.body;
        const request = pool.request();
        request.input('month', sql.Int, month);
        request.input('year', sql.NVarChar, year);
        const result1 = await request.query(`SELECT COUNT(INCIDENTCOUNT) INCIDENTCOUNT, OCCUREDDATE FROM dbo.OL_INCIDENTS WHERE [MONTH] = @month AND [YEAR] = @year GROUP BY OCCUREDDATE ORDER BY OCCUREDDATE`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found getChart3Data", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/getChart1Data", async (req, res) => {
    console.log("----DISPLAY getChart1Data API----\n");
    try {
        const { month, year } = req.body;
        const request = pool.request();
        request.input('month', sql.Int, month);
        request.input('year', sql.NVarChar, year);
        const result1 = await request.query(`SELECT COUNT(INCIDENTCOUNT) INCIDENTCOUNT, BUNAME FROM dbo.OL_INCIDENTS WHERE [MONTH] = @month AND [YEAR] = @year GROUP BY BUNAME ORDER BY BUNAME`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found getChart1Data", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/getChart4Data", async (req, res) => {
    console.log("----DISPLAY getChart4Data API----\n");
    try {
        const { month, year } = req.body;
        const request = pool.request();
        request.input('month', sql.Int, month);
        request.input('year', sql.NVarChar, year);
        const result1 = await request.query(`SELECT AVG(AVAILABLE) AVAILABLE, AVG(WORKING) WORKING FROM dbo.OL_DSRSECAUTO od WHERE [MONTH] = @month AND [YEAR] = @year`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found getChart4Data", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/getChart2Data", async (req, res) => {
    console.log("----DISPLAY getChart2Data API----\n");
    try {
        const { month, year } = req.body;
        const request = pool.request();
        request.input('month', sql.Int, month);
        request.input('year', sql.NVarChar, year);
        const result1 = await request.query(`SELECT COUNT(INCIDENTCOUNT) INCIDENTCOUNT, INCIDENTTYPENAME FROM dbo.OL_INCIDENTS WHERE [MONTH] = @month AND [YEAR] = @year GROUP BY INCIDENTTYPENAME`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found getChart2Data", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/getChart5Data", async (req, res) => {
    console.log("----DISPLAY getChart5Data API----\n");
    try {
        const { month, year } = req.body;
        const request = pool.request();
        request.input('month', sql.Int, month);
        request.input('year', sql.NVarChar, year);
        const result1 = await request.query(`SELECT COUNT(INCIDENTCOUNT) INCIDENTCOUNT, INCIDENTCATNAME FROM dbo.OL_INCIDENTS WHERE [MONTH] = @month AND [YEAR] = @year GROUP BY INCIDENTCATNAME`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found getChart5Data", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/getRadialChartData", async (req, res) => {
    console.log("----DISPLAY getRadialChartData API----\n");
    try {
        const { month, year, upperColumn, lowerColumn, table } = req.body;
        const request = pool.request();
        request.input('month', sql.Int, month);
        request.input('year', sql.NVarChar, year);
        request.input('upperColumn', sql.NVarChar, upperColumn);
        request.input('lowerColumn', sql.NVarChar, lowerColumn);
        request.input('table', sql.NVarChar, table);
        const result1 = await request.query(`SELECT SUM(${upperColumn}) ${upperColumn}, SUM(${lowerColumn}) ${lowerColumn} FROM dbo.${table} WHERE [MONTH] = @month AND [YEAR] = @year`);
        res.json(result1.recordset);
    } catch (error) {
        console.error("catch error found getRadialChartData", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router; 