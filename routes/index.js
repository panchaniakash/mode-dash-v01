var express = require('express')
const sql = require("mssql");
var router = express.Router()

const pool = new sql.ConnectionPool({
    server: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWD,
    database: process.env.DB,
    options: {
        trustServerCertificate: true,
    },
});

pool.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to MSSQL');
    }
});

router.post("/loadAllPages", async (req, res) => {
    console.log("----DISPLAY loadAllPages API----\n");
    let bucketId = req.body.bucketId;
    try {
        const request = pool.request();
        const q1 = `SELECT PAGE_NAME, GRID_ID FROM dbo.USER_CHARTS_GRID WHERE BUCKETID = ${bucketId} ORDER BY PAGE_NAME`;
        const result1 = await request.query(q1);
        res.json(result1.recordset);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        console.log("catch error found loadAllPages !", error);
    }
});

router.post("/addNewPage", async (req, res) => {
    console.log("----DISPLAY addNewPage API----\n");
    let bucketId = req.body.bucketId;
    let page = req.body.page
    try {
        const request = pool.request();
        var q1 = `SELECT USER_CHART_GRID_ID, BUCKETID, GRID_ID, PAGE_NAME
            FROM dbo.USER_CHARTS_GRID WHERE PAGE_NAME = '${page}';`;
        const result1 = await request.query(q1);
        if (result1.recordset.length == 0) {
            var q2 = `INSERT INTO dbo.USER_CHARTS_GRID
                    (BUCKETID, GRID_ID, PAGE_NAME)
                    VALUES(${bucketId}, 1, '${page}');
                    `
            await request.query(q2);
            res.json({ status: 200 })
        } else {
            res.json({ status: 300 })
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found addNewPage !", error);
    }
})


router.post("/loadPageGridDaily", async (req, res) => {
    console.log("----DISPLAY loadPageGridDaily API----\n");
    let bucketId = req.body.bucketId;
    try {
        const request = pool.request();
        var q1 = `SELECT gm.GRID_HTML, gm.TILE_COUNT FROM dbo.DASHBOARD_GRID dg
            JOIN GRID_MASTER gm ON dg.GRID_ID = gm.GRID_ID
            WHERE dg.BUCKET_ID = ${bucketId} AND DASHBOARD = 'DAILY'`;
        console.log(q1);
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found loadPageGrid !", error);
    }
})

router.post("/loadPageGridMonthly", async (req, res) => {
    console.log("----DISPLAY loadPageGridDaily API----\n");
    let bucketId = req.body.bucketId;
    try {
        const request = pool.request();
        var q1 = `SELECT gm.GRID_HTML, gm.TILE_COUNT FROM dbo.DASHBOARD_GRID dg
            JOIN GRID_MASTER gm ON dg.GRID_ID = gm.GRID_ID
            WHERE dg.BUCKET_ID = ${bucketId} AND DASHBOARD = 'MONTHLY'`;
        console.log(q1);
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found loadPageGrid !", error);
    }
})

router.post("/removeTab", async (req, res) => {
    console.log("----DISPLAY removeTab API----\n");
    let page = req.body.page
    try {
        const request = pool.request();
        var q1 = `DELETE FROM dbo.USER_CHARTS_GRID WHERE PAGE_NAME = '${page}';`;
        await request.query(q1);
        var q2 = `DELETE FROM dbo.USER_CHARTS WHERE PAGE_NAME = '${page}';`
        await request.query(q2);
        res.json({ status: 200 })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found removeTab !", error);
    }
})

router.get("/loadAllGrids", async (req, res) => {
    console.log("----DISPLAY loadAllGrids API----\n");
    try {
        const request = pool.request();
        var q1 = `SELECT GRID_ID, GRID_HTML, TILE_COUNT FROM dbo.GRID_MASTER`;
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found loadAllGrids !", error);
    }
})

router.post("/getVertical", async (req, res) => {
    console.log("----DISPLAY getVertical API----\n");
    try {
        var DATA = req.body;
        var bucketId = DATA.bucketId;
        var userId = DATA.userId; // Assuming USERID is part of the incoming request body
        console.log(bucketId, "jjjjjjjjjjjjjjjjjjjjj");

        const request = pool.request();
        // First, get the ANALYTICS_GROUP_LEVEL_NAME from ANALYTICS_GROUPS based on bucketId
        var q1 = `
                SELECT ANALYTICS_GROUP_LEVEL_NAME 
                FROM dbo.[ANALYTICS_GROUPS]
                WHERE ANALYTICS_GROUP_ID = @bucketId
            `;
        request.input('bucketId', sql.Int, bucketId); // Use parameterized queries to avoid SQL injection
        const result = await request.query(q1);
        // Log the fetched ANALYTICS_GROUP_LEVEL_NAME
        if (result.recordset.length > 0) {
            console.log("Analytics Group Level Name:", result.recordset[0].ANALYTICS_GROUP_LEVEL_NAME);

            if (result.recordset[0].ANALYTICS_GROUP_LEVEL_NAME === "GROUP SECURITY") {
                // If ANALYTICS_GROUP_LEVEL_NAME is "CHAIRMAN", execute the original query
                var q2 = `SELECT DISTINCT VNAME FROM dbo.VERTICAL WHERE VSTATUS = 'ACTIVE' ORDER BY VNAME ASC`;
                const result1 = await request.query(q2);
                res.json(result1.recordset);
            } else {
                // If it's not "CHAIRMAN", we need to get VID from USERGROUPS based on USERID
                var q3 = `
                            SELECT DISTINCT VID 
                            FROM dbo.USERGROUPS
                            WHERE USERID = @userId
                        `;
                console.log(q3);
                request.input('userId', sql.Int, userId); // Assuming USERID is provided in the request
                const result3 = await request.query(q3);
                // If VID is found, adjust the query to filter by VID
                if (result3.recordset.length > 0) {
                    var vidArray = result3.recordset.map(row => row.VID);  // Extract VID from result
                    console.log(vidArray);

                    // Convert the array into a comma-separated string
                    var vidList = vidArray.join(',');

                    var q4 = `
                                    SELECT DISTINCT VNAME 
                                    FROM dbo.VERTICAL
                                    WHERE VSTATUS = 'ACTIVE' 
                                    AND VID IN (${vidList})  -- Directly include the comma-separated VID list
                                    ORDER BY VNAME ASC
                                `;
                    console.log(q4);

                    const result4 = await request.query(q4);
                    res.json(result4.recordset);
                } else {
                    res.status(404).json({ error: 'No matching VID found in USERGROUPS for the provided USERID' });
                }
            }
        } else {
            res.status(404).json({ error: 'No analytics group found for the provided bucketId' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        console.log("catch error found in getVertical!", error);
    }
});


router.post("/getBusiness", async (req, res) => {
    console.log("----DISPLAY getBusiness API----\n");
    try {
        var DATA = req.body;
        var vertical = DATA.vertical;
        var bucketId = DATA.bucketId;
        var userId = DATA.userId; // Assuming USERID is part of the incoming request body
        console.log(bucketId, "jjjjjjjjjjjjjjjjjjjjj");

        const request = pool.request();

        // First, get the ANALYTICS_GROUP_LEVEL_NAME from ANALYTICS_GROUPS based on bucketId
        var q1 = `
                SELECT ANALYTICS_GROUP_LEVEL_NAME 
                FROM dbo.[ANALYTICS_GROUPS]
                WHERE ANALYTICS_GROUP_ID = @bucketId
            `;
        request.input('bucketId', sql.Int, bucketId); // Use parameterized queries to avoid SQL injection
        const result = await request.query(q1);

        // Log the fetched ANALYTICS_GROUP_LEVEL_NAME
        if (result.recordset.length > 0) {
            console.log("Analytics Group Level Name:", result.recordset[0].ANALYTICS_GROUP_LEVEL_NAME);

            if (result.recordset[0].ANALYTICS_GROUP_LEVEL_NAME === "GROUP SECURITY") {
                // If ANALYTICS_GROUP_LEVEL_NAME is "CHAIRMAN", execute the original query
                var q2 = `  SELECT DISTINCT B.BUNAME
                FROM dbo.BUSINESS B
                JOIN dbo.VERTICAL V ON B.VID = V.VID
                WHERE V.VNAME = '${vertical}' AND B.BUSTATUS = 'ACTIVE' ORDER BY B.BUNAME ASC`;
                const result1 = await request.query(q2);
                res.json(result1.recordset);
            } else {
                // If it's not "CHAIRMAN", we need to get VID from USERGROUPS based on USERID
                var q3 = `
                            SELECT DISTINCT BUID 
                            FROM dbo.USERGROUPS
                            WHERE USERID = @userId
                        `;
                request.input('userId', sql.Int, userId); // Assuming USERID is provided in the request
                const result3 = await request.query(q3);

                // If VID is found, adjust the query to filter by VID
                if (result3.recordset.length > 0) {
                    var buidArray = result3.recordset.map(row => row.BUID);  // Extract VID from result
                    console.log(buidArray);


                    var buidString = buidArray.join(',');
                    var q4 = `
                                SELECT DISTINCT B.BUNAME
                                FROM dbo.BUSINESS B
                                JOIN dbo.VERTICAL V ON B.VID = V.VID
                                WHERE V.VNAME = '${vertical}' AND BUID IN (${buidString}) AND B.BUSTATUS = 'ACTIVE' ORDER BY B.BUNAME ASC`;

                    const result4 = await request.query(q4);
                    res.json(result4.recordset);
                } else {
                    res.status(404).json({ error: 'No matching VID found in USERGROUPS for the provided USERID' });
                }
            }
        } else {
            res.status(404).json({ error: 'No analytics group found for the provided bucketId' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        console.log("catch error found in getVertical!", error);
    }
});
router.post("/getSite", async (req, res) => {
    console.log("----DISPLAY getSite API----\n");
    try {
        var DATA = req.body;
        var Business = DATA.Business;
        var bucketId = DATA.bucketId;
        var userId = DATA.userId; // Assuming USERID is part of the incoming request body
        console.log(bucketId, "jjjjjjjjjjjjjjjjjjjjj");

        const request = pool.request();

        // First, get the ANALYTICS_GROUP_LEVEL_NAME from ANALYTICS_GROUPS based on bucketId
        var q1 = `
                SELECT ANALYTICS_GROUP_LEVEL_NAME 
                FROM dbo.[ANALYTICS_GROUPS]
                WHERE ANALYTICS_GROUP_ID = @bucketId
            `;
        request.input('bucketId', sql.Int, bucketId); // Use parameterized queries to avoid SQL injection
        const result = await request.query(q1);

        // Log the fetched ANALYTICS_GROUP_LEVEL_NAME
        if (result.recordset.length > 0) {
            console.log("Analytics Group Level Name:", result.recordset[0].ANALYTICS_GROUP_LEVEL_NAME);

            if (result.recordset[0].ANALYTICS_GROUP_LEVEL_NAME === "GROUP SECURITY") {
                // If ANALYTICS_GROUP_LEVEL_NAME is "CHAIRMAN", execute the original query
                console.log("QUERY RUNNING");
                var q2 = `
                            SELECT DISTINCT s.SINAME
                            FROM dbo.SITE s
                            JOIN dbo.BUSINESS b ON s.BUID = b.BUID
                            WHERE b.BUNAME = @Business AND S.SISTATUS = 'ACTIVE' 
                            ORDER BY S.SINAME ASC
                        `;
                console.log(q2, "GYGYGGG");
                request.input('Business', sql.NVarChar, Business);
                const result1 = await request.query(q2);
                res.json(result1.recordset);
            } else {
                // If it's not "CHAIRMAN", we need to get SIID from USERGROUPS based on USERID
                var q3 = `
                            SELECT DISTINCT SIID 
                            FROM dbo.USERGROUPS
                            WHERE USERID = @userId
                        `;
                request.input('userId', sql.Int, userId); // Assuming USERID is provided in the request
                const result3 = await request.query(q3);

                // If SIID is found, adjust the query to filter by SIID
                if (result3.recordset.length > 0) {
                    var siidArray = result3.recordset.map(row => row.SIID);  // Extract SIID from result
                    console.log(siidArray, "yftfrrrtyrtruy");

                    // Convert the SIID array to a comma-separated string
                    var siidString = siidArray.join(',');

                    var q4 = `
                                    SELECT DISTINCT s.SINAME
                                    FROM dbo.SITE s
                                    JOIN dbo.BUSINESS b ON s.BUID = b.BUID
                                    WHERE b.BUNAME = @Business 
                                    AND s.SIID IN (${siidString}) 
                                    AND S.SISTATUS = 'ACTIVE' 
                                    ORDER BY S.SINAME ASC
                                `;

                    request.input('Business', sql.NVarChar, Business);
                    // Don't need to bind the `siidArray` as a parameter now, since we're using the `siidString` directly
                    const result4 = await request.query(q4);
                    res.json(result4.recordset);
                } else {
                    res.status(404).json({ error: 'No matching SIID found in USERGROUPS for the provided USERID' });
                }
            }
        } else {
            res.status(404).json({ error: 'No analytics group found for the provided bucketId' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        console.log("catch error found in getSite!", error);
    }
});



router.get("/getYearsFromSecAuto", async (req, res) => {
    console.log("----DISPLAY getYearsFromSecAuto API----\n");
    try {
        const request = pool.request();
        var q1 = `SELECT DISTINCT YEAR FROM dbo.OL_DSRSECAUTO ORDER BY YEAR DESC`;
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found getYearsFromSecAuto !", error);
    }
})
router.post("/getMonthFromSecAuto", async (req, res) => {
    console.log("----DISPLAY getMonthFromSecAuto API----\n");
    try {
        var year = req.body.year
        const request = pool.request();
        var q1 = `SELECT DISTINCT MONTH,MONTHNAME FROM dbo.OL_DSRSECAUTO WHERE YEAR = '${year}' ORDER BY MONTH DESC`;
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found getMonthFromSecAuto !", error);
    }
})

router.post("/saveGrid", async (req, res) => {
    console.log("----DISPLAY saveGrid API----\n");
    let bucketId = req.body.bucketId;
    let page = req.body.page
    let gridId = req.body.gridId;
    try {
        const request = pool.request();
        var q1 = `UPDATE dbo.USER_CHARTS_GRID SET GRID_ID = ${gridId}
            WHERE PAGE_NAME = '${page}' AND BUCKETID = ${bucketId}`;
        console.log(q1);
        await request.query(q1);
        res.json({ status: 200 })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found saveGrid !", error);
    }
})

router.post("/loadSetCharts", async (req, res) => {
    console.log("----DISPLAY loadSetCharts API----\n");
    let bucketId = req.body.bucketId;
    let page = req.body.page
    try {
        const request = pool.request();
        var q1 = `SELECT DISTINCT TABLE_NAME FROM dbo.USER_CHARTS uc WHERE uc.BUCKETID = ${bucketId} AND uc.PAGE_NAME = '${page}'`;
        const result1 = await request.query(q1);
        var q2 = `SELECT uc.USER_CHART_ID, uc.BUCKETID, cm.CHART_NAME , uc.CHART_ID, uc.CHART_OPTIONS_JSON, uc.CHART_JSON, uc.DATA_QUERY_PREFIX, uc.DATA_QUERY_SUFFIX, uc.TABLE_NAME, uc.TILE_DIV_ID, uc.PAGE_NAME
                FROM dbo.USER_CHARTS uc
                JOIN dbo.CHART_MASTER cm ON cm.CHART_ID = uc.CHART_ID 
                WHERE uc.BUCKETID = ${bucketId} AND uc.PAGE_NAME = '${page}';`
        const result2 = await request.query(q2);
        if (result1.recordset.length == 1) {
            res.json({ charts: result2.recordset, filters: true })

        } else {
            res.json({ charts: result2.recordset, filters: false })
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found loadSetCharts !", error);
    }
})

router.post("/loadSetWidgets", async (req, res) => {
    console.log("----DISPLAY loadSetWidgets API----\n");
    let bucketId = req.body.bucketId;
    try {
        const request = pool.request();
        var q2 = `SELECT do.*, dwm.WIDGET_NAME FROM DASHBOARD_OBJECTS do
                JOIN DASHBOARD_WIDGET_MASTER dwm ON dwm.WIDGET_ID = do.OBJECT_ID 
                WHERE do.OBJECT_TYPE = 'Widget' AND do.BUCKET_ID = ${bucketId};`
        const result2 = await request.query(q2);
        res.json({ widgets: result2.recordset })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found loadSetWidgets !", error);
    }
})

router.get("/loadChartTypes", async (req, res) => {
    console.log("----DISPLAY loadChartTypes API----\n");
    try {
        const request = pool.request();
        var q1 = `SELECT CHART_ID, CHART_NAME FROM dbo.CHART_MASTER`;
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found loadChartTypes !", error);
    }
})

router.get("/loadWidgetTypes", async (req, res) => {
    console.log("----DISPLAY loadWidgetTypes API----\n");
    try {
        const request = pool.request();
        var q1 = `SELECT WIDGET_ID, WIDGET_HTML, WIDGET_CHART_ID, WIDGET_NAME
            FROM dbo.DASHBOARD_WIDGET_MASTER`;
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found loadWidgetTypes !", error);
    }
})

router.get("/loadAllTables", async (req, res) => {
    console.log("----DISPLAY loadAllTables API----\n");
    try {
        const request = pool.request();
        var q1 = `SELECT t.name TABLE_NAME, cnm.USABLE_NAME
            FROM sys.tables t
            INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
            JOIN dbo.COLUMN_NAME_MAPPING cnm ON t.name = cnm.ACTUAL_NAME 
            WHERE t.name LIKE 'OL%'
            ORDER BY s.name, t.name;`;
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found loadAllTables !", error);
    }
})

router.post("/getChartFromId", async (req, res) => {
    console.log("----DISPLAY getChartFromId API----\n");
    let chartId = req.body.chartId;
    try {
        const request = pool.request();
        var q1 = `SELECT CHART_ID, CHART_NAME
            FROM dbo.CHART_MASTER WHERE CHART_ID = ${chartId};`;
        console.log(q1);
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found getChartFromId !", error);
    }
})

router.post("/deleteChart", async (req, res) => {
    console.log("----DISPLAY deleteChart API----\n");
    let userChartId = req.body.userObjectId
    try {
        const request = pool.request();
        var q1 = `DELETE FROM dbo.USER_CHARTS WHERE USER_CHART_ID = ${userChartId}`;
        console.log(q1);
        await request.query(q1);
        res.json({ status: 200 })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found deleteChart !", error);
    }
})

router.post("/deleteWidget", async (req, res) => {
    console.log("----DISPLAY deleteWidget API----\n");
    let userChartId = req.body.userObjectId
    try {
        const request = pool.request();
        var q1 = `DELETE FROM dbo.DASHBOARD_OBJECTS WHERE D_OBJECT_ID = ${userChartId}`;
        console.log(q1);
        await request.query(q1);
        res.json({ status: 200 })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found deleteWidget !", error);
    }
})

router.post("/getWidgetFromId", async (req, res) => {
    console.log("----DISPLAY getWidgetFromId API----\n");
    let widgetId = req.body.widgetId;
    try {
        const request = pool.request();
        var q1 = `SELECT WIDGET_ID, WIDGET_NAME
            FROM dbo.DASHBOARD_WIDGET_MASTER WHERE WIDGET_ID = ${widgetId};`;
        console.log(q1);
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found getWidgetFromId !", error);
    }
})

router.post("/getTableColumnsAPI", async function (req, res) {
    console.log("----DISPLAY getTableColumnsAPI API----\n");
    let table = req.body.table;
    try {
        const request = pool.request();
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
        const request = pool.request();
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
        const request = pool.request();
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
    var userChartId = req.body.userChartId
    try {
        const request = pool.request();
        //var q1 = `SELECT * FROM dbo.DASHBOARD_OBJECTS WHERE D_OBJECT_ID = ${userChartId}`;
        var q1 = `SELECT * FROM dbo.USER_CHARTS WHERE USER_CHART_ID = ${userChartId}`
        console.log(q1);
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found getChartOptions", error);
    }
})

router.post("/getWidgetOptions", async (req, res) => {
    console.log("----DISPLAY getWidgetOptions API----\n");
    var userChartId = req.body.userChartId
    try {
        const request = pool.request();
        var q1 = `SELECT * FROM dbo.DASHBOARD_OBJECTS WHERE D_OBJECT_ID = ${userChartId}`;
        //var q1 = `SELECT * FROM dbo.USER_CHARTS WHERE USER_CHART_ID = ${userChartId}`
        console.log(q1);
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found getWidgetOptions", error);
    }
})

router.post("/getUserLevelFilters", async (req, res) => {
    console.log("----DISPLAY getUserLevelFilters API----\n");
    var userId = req.body.userId
    try {
        const request = pool.request();
        var q1 = `SELECT aug.A_UG_ID,aug.ANALYTICS_GROUPS_ID, aug.USERID, ag.ANALYTICS_GROUP_NAME, ag.ANALYTICS_GROUP_LEVEL,ag.ANALYTICS_GROUP_LEVEL_NAME,ag.ANALYTICS_GROUP_LEVEL_ID,V.VID ,B.BUID,S.SIID ,V.VNAME ,B.BUNAME ,S.SINAME, V.VCODE ,B.BUCODE ,S.SICODE
            FROM dbo.ANALYTICS_USER_GROUP_MAPPING aug
            JOIN dbo.ANALYTICS_GROUPS ag on ag.ANALYTICS_GROUP_ID = aug.ANALYTICS_GROUPS_ID
            JOIN dbo.USERGROUPS u ON U.USERID = AUG.USERID
            JOIN dbo.VERTICAL v ON V.VID = U.VID 
            JOIN dbo.BUSINESS b ON B.BUID = U.BUID 
            JOIN dbo.SITE s ON S.SIID = U.SIID 
            WHERE aug.USERID = ${userId};`;
        console.log(q1);
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found getUserLevelFilters", error);
    }
})

router.post("/getUserLevelFiltersMonthly", async (req, res) => {
    console.log("----DISPLAY getUserLevelFiltersMonthly API----\n");
    var userId = req.body.userId
    try {
        const request = pool.request();
        var q1 = `SELECT aug.A_UG_ID,aug.ANALYTICS_GROUPS_ID, aug.USERID, ag.ANALYTICS_GROUP_NAME, ag.ANALYTICS_GROUP_LEVEL,ag.ANALYTICS_GROUP_LEVEL_NAME,ag.ANALYTICS_GROUP_LEVEL_ID,V.VID ,B.BUID,S.SIID ,V.VNAME ,B.BUNAME ,S.SINAME, V.VCODE ,B.BUCODE ,S.SICODE
            FROM dbo.ANALYTICS_USER_GROUP_MAPPING_MONTHLY aug
            JOIN dbo.ANALYTICS_GROUPS ag on ag.ANALYTICS_GROUP_ID = aug.ANALYTICS_GROUPS_ID
            JOIN dbo.USERGROUPS u ON U.USERID = AUG.USERID
            JOIN dbo.VERTICAL v ON V.VID = U.VID 
            JOIN dbo.BUSINESS b ON B.BUID = U.BUID 
            JOIN dbo.SITE s ON S.SIID = U.SIID 
            WHERE aug.USERID = ${userId};`;
        console.log(q1);
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found getUserLevelFilters", error);
    }
})

router.post("/getUserLevel", async (req, res) => {
    console.log("----DISPLAY getUserLevel API----\n");
    var userId = req.body.userId
    try {
        const request = pool.request();
        var q1 = `SELECT R.RCODE  FROM USERPROFILE u
            JOIN [ROLE] r ON U.RID = R.RID 
            WHERE USERID = ${userId}`;
        console.log(q1);
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found getUserLevel", error);
    }
})

router.post("/saveLinearChartJsonAPI", async (req, res) => {
    console.log("----DISPLAY saveLinearChartJsonAPI API----\n");
    let bucketId = req.body.bucketId;
    let page = req.body.pageName
    let userChartId = req.body.userChartId
    let chartId = req.body.chartId
    let chartOptionsJsonString = req.body.chartOptionsJson
    let tableName = req.body.tableName
    let divId = req.body.divId
    try {
        const request = pool.request();
        var q1 = `SELECT * FROM dbo.USER_CHARTS uc WHERE uc.USER_CHART_ID = ${userChartId}`;
        const result1 = await request.query(q1);
        if (result1.recordset.length > 0) {
            var q2 = `UPDATE dbo.USER_CHARTS
                    SET BUCKETID=${bucketId}, CHART_ID=${chartId}, CHART_OPTIONS_JSON='${chartOptionsJsonString}', TABLE_NAME='${tableName}', TILE_DIV_ID='${divId}', PAGE_NAME='${page}' WHERE USER_CHART_ID = ${userChartId};`
        } else {
            var q2 = `INSERT INTO dbo.USER_CHARTS
                    (BUCKETID, CHART_ID, CHART_OPTIONS_JSON, TABLE_NAME, TILE_DIV_ID, PAGE_NAME)
                    VALUES(${bucketId}, ${chartId}, '${chartOptionsJsonString}', '${tableName}', '${divId}', '${page}');`
        }
        await request.query(q2);
        var q3 = `SELECT MAX(USER_CHART_ID) USER_CHART_ID FROM dbo.USER_CHARTS;`
        const result3 = await request.query(q3);
        if (userChartId !== 0) {
            res.json({ userChartID: userChartId })
        } else {
            res.json({ userChartID: result3.recordset[0].USER_CHART_ID })
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found saveLinearChartJsonAPI !", error);
    }
})

router.post("/saveObjectJsonAPI", async (req, res) => {
    console.log("----DISPLAY saveLinearChartJsonAPI API----\n");
    let bucketId = req.body.bucketId;
    let userObjectId = req.body.userObjectId
    let objectId = req.body.objectId
    let objectOptionsJsonString = req.body.objectOptionsJson
    let tableName = req.body.tableName
    let divId = req.body.divId
    let objectType = req.body.objectType
    try {
        const request = pool.request();
        var q1 = `SELECT * FROM dbo.DASHBOARD_OBJECTS do WHERE do.D_OBJECT_ID = ${userObjectId}`;
        const result1 = await request.query(q1);
        if (result1.recordset.length > 0) {
            var q2 = `UPDATE dbo.DASHBOARD_OBJECTS
                    SET BUCKET_ID=${bucketId}, OBJECT_ID=${objectId}, OBJECT_OPTIONS_JSON='${objectOptionsJsonString}', TABLE_NAME='${tableName}', TILE_DIV_ID='${divId}', OBJECT_TYPE='${objectType}' WHERE D_OBJECT_ID = ${userObjectId};`
        } else {
            var q2 = `INSERT INTO dbo.DASHBOARD_OBJECTS
                    (BUCKET_ID, OBJECT_ID, OBJECT_OPTIONS_JSON, TABLE_NAME, TILE_DIV_ID, OBJECT_TYPE)
                    VALUES(${bucketId}, ${objectId}, '${objectOptionsJsonString}', '${tableName}', '${divId}', '${objectType}');`

        }
        console.log(q2);
        await request.query(q2);
        var q3 = `SELECT MAX(D_OBJECT_ID) USER_WIDGET_ID FROM dbo.DASHBOARD_OBJECTS;`
        const result3 = await request.query(q3);
        if (userObjectId !== 0) {
            res.json({ userObjectId: userObjectId })
        } else {
            res.json({ userObjectId: result3.recordset[0].USER_WIDGET_ID })
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found saveLinearChartJsonAPI !", error);
    }
})

router.post("/createDataForCharty", async (req, res) => {
    console.log("----DISPLAY createDataForCharty API----\n");
    var userChartId = req.body.userChartId
    try {
        const request = pool.request();
        var q1 = `SELECT * FROM dbo.USER_CHARTS WHERE USER_CHART_ID = ${userChartId}`
        console.log(q1);
        const result1 = await request.query(q1);
        var chartOptionsJson = JSON.parse(result1.recordset[0].CHART_OPTIONS_JSON)
        var tableName = result1.recordset[0].TABLE_NAME
        var dataQuery = `SELECT `
        if (typeof chartOptionsJson["tableColumns"] === 'string') {
            dataQuery += `${chartOptionsJson["aggregation"]}(${chartOptionsJson["tableColumns"]}) "${chartOptionsJson["tableColumnsNames"]}", `
        } else {
            for (var i = 0; i < chartOptionsJson["tableColumns"].length; i++) {
                dataQuery += `${chartOptionsJson["aggregation"]}(${chartOptionsJson["tableColumns"][i]}) "${chartOptionsJson["tableColumnsNames"][i]}", `
            }
        }
        dataQuery += `${chartOptionsJson["groupByColumn"]} FROM dbo.${tableName} `
        if (chartOptionsJson["groupByValues"].length > 0) {
            var gbValues = `(`
            for (var i = 0; i < chartOptionsJson["groupByValues"].length; i++) {
                if (i == 0) {
                    gbValues += `'${chartOptionsJson["groupByValues"][i]}'`
                } else {
                    gbValues += `,'${chartOptionsJson["groupByValues"][i]}'`
                }
            }
            gbValues += `)`
            dataQuery += `WHERE ${chartOptionsJson["groupByColumn"]} IN ${gbValues} `
        } else {
            dataQuery += `WHERE ${chartOptionsJson["groupByColumn"]} LIKE '%%' `
        }
        var prefixQuery = dataQuery.replace(/'/g, "''")
        var suffixQuery = `GROUP BY ${chartOptionsJson["groupByColumn"]} ORDER BY ${chartOptionsJson["groupByColumn"]}`
        var suffixQuery1 = suffixQuery.replace(/'/g, "''")
        dataQuery += suffixQuery
        var q2 = `UPDATE dbo.USER_CHARTS SET DATA_QUERY_PREFIX='${prefixQuery}', DATA_QUERY_SUFFIX='${suffixQuery1}' WHERE USER_CHART_ID = ${userChartId}`
        console.log(q2);
        await request.query(q2);
        res.json({ status: 200 })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found createDataForCharty", error);
    }
})

router.post("/createDataForChartDataTrend", async (req, res) => {
    console.log("----DISPLAY createDataForChartDataTrend API----\n");
    var userChartId = req.body.userChartId
    try {
        const request = pool.request();
        var q1 = `SELECT * FROM dbo.USER_CHARTS WHERE USER_CHART_ID = ${userChartId}`
        console.log(q1);
        const result1 = await request.query(q1);
        var chartOptionsJson = JSON.parse(result1.recordset[0].CHART_OPTIONS_JSON)
        var data = chartOptionsJson["data"]
        var groupBy = chartOptionsJson["groupByColumn"]
        if (groupBy === 'VNAME') {
            var c = `V.VNAME`
        } else if (groupBy === 'BUNAME') {
            var c = 'B.BUNAME'
        } else if (groupBy === 'SINAME') {
            var c = 'S.SINAME'
        }
        var dataQuery = `SELECT  COUNT(*) COUNT,${c}, I.DSRSTATUS FROM DSRSTATUS I
                JOIN 
    VERTICAL V ON V.VID = I.VID
JOIN 
    BUSINESS B ON B.BUID = I.BUID
                JOIN 
                    SITE S ON S.SIID = I.SIID WHERE '1' = '1' `

        var prefixQuery = dataQuery.replace(/'/g, "''")
        var suffixQuery = `GROUP BY ${c},I.DSRSTATUS ORDER BY ${c}`
        var suffixQuery1 = suffixQuery.replace(/'/g, "''")
        dataQuery += suffixQuery
        var q2 = `UPDATE dbo.USER_CHARTS SET DATA_QUERY_PREFIX='${prefixQuery}', DATA_QUERY_SUFFIX='${suffixQuery1}' WHERE USER_CHART_ID = ${userChartId}`
        console.log(q2);
        await request.query(q2);
        res.json({ status: 200 })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found createDataForChartDataTrend", error);
    }
})



router.post("/createDataForPercentChart", async (req, res) => {
    console.log("----DISPLAY createDataForPercentChart API----\n");
    var userChartId = req.body.userChartId
    try {
        const request = pool.request();
        var q1 = `SELECT * FROM dbo.USER_CHARTS WHERE USER_CHART_ID = ${userChartId}`
        console.log(q1);
        const result1 = await request.query(q1);
        var chartOptionsJson = JSON.parse(result1.recordset[0].CHART_OPTIONS_JSON)
        var tableName = result1.recordset[0].TABLE_NAME
        var dataQuery = `SELECT `
        if (typeof chartOptionsJson["tableColumns"] === 'string') {
            dataQuery += `${chartOptionsJson["aggregation"]}(${chartOptionsJson["tableColumns"]}) "${chartOptionsJson["tableColumnsNames"]}" `
        } else {
            for (var i = 0; i < chartOptionsJson["tableColumns"].length; i++) {
                if (i == 0) {
                    dataQuery += `${chartOptionsJson["aggregation"]}(${chartOptionsJson["tableColumns"][i]}) "${chartOptionsJson["tableColumnsNames"][i]}", `
                } else {
                    dataQuery += `${chartOptionsJson["aggregation"]}(${chartOptionsJson["tableColumns"][i]}) "${chartOptionsJson["tableColumnsNames"][i]}" `
                }
            }
        }
        dataQuery += `FROM dbo.${tableName} WHERE '1' = '1' `
        var prefixQuery = dataQuery.replace(/'/g, "''")
        var suffixQuery = ``
        var suffixQuery1 = suffixQuery.replace(/'/g, "''")
        dataQuery += suffixQuery
        var q2 = `UPDATE dbo.USER_CHARTS SET DATA_QUERY_PREFIX='${prefixQuery}', DATA_QUERY_SUFFIX='${suffixQuery1}' WHERE USER_CHART_ID = ${userChartId}`
        console.log(q2);
        await request.query(q2);
        res.json({ status: 200 })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found createDataForPercentChart", error);
    }
})

router.post("/getLinearChartDataAPI", async function (req, res) {
    console.log("----DISPLAY getLinearChartDataAPI API----\n");
    var userChartId = req.body.userChartId;
    var filterString = req.body.filterString;

    try {
        const request = pool.request();

        const result1 = await request.query`SELECT * FROM dbo.USER_CHARTS WHERE USER_CHART_ID = ${userChartId}`;
        const result2 = await request.query(result1.recordset[0].CHART_JSON == null
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
        const result3 = await request.query(dataQuery);

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

        const result4 = await request.query(labelsQuery);

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
        const request = pool.request();

        const result1 = await request.query`SELECT * FROM dbo.USER_CHARTS WHERE USER_CHART_ID = ${userChartId}`;
        const result2 = await request.query(result1.recordset[0].CHART_JSON == null
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
        const result3 = await request.query(dataQuery);
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
    let userChartID = req.body.userChartId;
    let chartJson = req.body.chartJson
    try {
        const request = pool.request();
        var q1 = `UPDATE dbo.USER_CHARTS SET CHART_JSON = '${chartJson}' WHERE USER_CHART_ID = ${userChartID}`;
        console.log(q1);
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found saveChartJsonAPI", error);
    }
})


router.post("/getFilterColumnsAPI", async (req, res) => {
    console.log("----DISPLAY getFilterColumnsAPI API----\n");
    let bucketId = req.body.bucketId;
    let page = req.body.page
    try {
        const request = pool.request();
        var q1 = `SELECT DISTINCT TABLE_NAME FROM dbo.USER_CHARTS WHERE BUCKETID = ${bucketId} AND PAGE_NAME = '${page}'`;
        console.log(q1);
        const result1 = await request.query(q1);
        if (result1.recordset.length > 1) {
            res.json({ filters: false, columnList: [] })
        } else {
            var q2 = `SELECT i.COLUMN_NAME,cnm.USABLE_NAME , i.DATA_TYPE
                    FROM INFORMATION_SCHEMA.COLUMNS i
                    JOIN dbo.COLUMN_NAME_MAPPING cnm ON i.COLUMN_NAME = cnm.ACTUAL_NAME 
                    WHERE i.TABLE_NAME = '${result1.recordset[0].TABLE_NAME}'
                    AND (i.COLUMN_NAME NOT LIKE '%ID' AND i.COLUMN_NAME NOT LIKE '%MONTH%' AND i.COLUMN_NAME NOT LIKE '%IDS' AND i.COLUMN_NAME NOT LIKE '%YEAR%' AND i.COLUMN_NAME NOT LIKE '%QUARTER%' AND i.COLUMN_NAME NOT LIKE '%DATE%' AND NOT i.DATA_TYPE = 'INT') ORDER BY cnm.USABLE_NAME;`
            const result2 = await request.query(q2);
            res.json({ filters: true, columnList: result2.recordset, table: result1.recordset[0].TABLE_NAME })
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found getFilterColumnsAPI", error);
    }
})

router.post("/getChartFiltersAPI", async (req, res) => {
    console.log("----DISPLAY getChartFiltersAPI API----\n");
    let page = req.body.page
    let bucketId = req.body.bucketId
    let columnArray = req.body.columnArray
    let columnArrayNames = req.body.columnArrayName
    let filterString = req.body.filterString
    try {
        const request = pool.request();
        var q1 = `SELECT DISTINCT TABLE_NAME FROM dbo.USER_CHARTS WHERE BUCKETID = ${bucketId} AND PAGE_NAME = '${page}'`;
        console.log(q1);
        const result1 = await request.query(q1);
        if (result1.recordset.length > 1) {
            if (filterString.length > 0) {
                filterString = "WHERE " + filterString.replace('AND', '');
            }
            var q2 = `SELECT DISTINCT YEAR AS VALUE, 'YEAR' AS COLUMN_NAME FROM dbo.${result1.recordset[0].TABLE_NAME} ${filterString} `
            q2 += `UNION SELECT DISTINCT QUARTER AS VALUE, 'QUARTER' AS COLUMN_NAME FROM dbo.${result1.recordset[0].TABLE_NAME} ${filterString} `
            q2 += `UNION SELECT DISTINCT MONTHNAME AS VALUE, 'MONTHNAME' AS COLUMN_NAME FROM dbo.${result1.recordset[0].TABLE_NAME} ${filterString} `
            if (result1.recordset[0].TABLE_NAME === 'OL_INCIDENTS') {
                q2 += `UNION SELECT DISTINCT OCCUREDDATE AS VALUE, 'OCCUREDDATE' AS COLUMN_NAME FROM dbo.${result1.recordset[0].TABLE_NAME} ${filterString} `
            } else {
                q2 += `UNION SELECT DISTINCT DSRDATE AS VALUE, 'DSRDATE' AS COLUMN_NAME FROM dbo.${result1.recordset[0].TABLE_NAME} ${filterString} `
            }
            console.log(q2, "gfffftftftgfvtfgftuftyftydftydtydfty");
            const result2 = await request.query(q2);
            res.json({ valueList: result2.recordset, table: result1.recordset[0].TABLE_NAME })
        } else {
            if (filterString.length > 0) {
                filterString = "WHERE " + filterString.replace('AND', '');
            }
            var q2 = `SELECT DISTINCT YEAR AS VALUE, 'YEAR' AS COLUMN_NAME FROM dbo.${result1.recordset[0].TABLE_NAME} ${filterString} `
            q2 += `UNION SELECT DISTINCT QUARTER AS VALUE, 'QUARTER' AS COLUMN_NAME FROM dbo.${result1.recordset[0].TABLE_NAME} ${filterString} `
            q2 += `UNION SELECT DISTINCT MONTHNAME AS VALUE, 'MONTHNAME' AS COLUMN_NAME FROM dbo.${result1.recordset[0].TABLE_NAME} ${filterString} `
            if (result1.recordset[0].TABLE_NAME === 'OL_INCIDENTS') {
                q2 += `UNION SELECT DISTINCT OCCUREDDATE AS VALUE, 'OCCUREDDATE' AS COLUMN_NAME FROM dbo.${result1.recordset[0].TABLE_NAME} ${filterString} `
            } else {
                q2 += `UNION SELECT DISTINCT DSRDATE AS VALUE, 'DSRDATE' AS COLUMN_NAME FROM dbo.${result1.recordset[0].TABLE_NAME} ${filterString} `
            }
            for (let i = 0; i < columnArray.length; i++) {
                q2 += `UNION SELECT DISTINCT  ${columnArray[i]} AS VALUE, '${columnArray[i]}' AS COLUMN_NAME FROM dbo.${result1.recordset[0].TABLE_NAME} ${filterString} `
            }
            console.log(q2);
            const result2 = await request.query(q2);
            res.json({ valueList: result2.recordset, table: result1.recordset[0].TABLE_NAME })
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found getChartFiltersAPI", error);
    }
})

router.post('/getPrevMonthDataAPI', async (req, res) => {
    console.log("----DISPLAY getDataforSiteTable API----\n")

    var month = req.body.month.toString()
    var year = req.body.year.toString()
    var userWidgetId = req.body.userWidgetId;
    var filterString = req.body.filterString;
    var lmonth;
    var lyear;

    if (month == '1') {
        lmonth = '12'
        lyear = (Number(year) - 1).toString()
    }
    else {
        lmonth = (Number(month) - 1).toString()
        lyear = year
    }
    console.log(month, year, lmonth, lyear)

    try {
        const request = pool.request();

        var widgetQuery = `SELECT do.*,dw.WIDGET_HTML  FROM DASHBOARD_OBJECTS do
            JOIN DASHBOARD_WIDGET_MASTER dw ON dw.WIDGET_ID = do.OBJECT_ID WHERE do.D_OBJECT_ID = ${userWidgetId}`
        console.log(widgetQuery);
        const widgetResult = await request.query(widgetQuery);
        var objectOptionsJson = JSON.parse(widgetResult.recordset[0].OBJECT_OPTIONS_JSON)
        var tableColumn = objectOptionsJson["tableColumns"]
        var tableColumnName = objectOptionsJson["tableColumnsNames"]
        var table = objectOptionsJson["table"]
        var groupByColumn = objectOptionsJson["groupByColumn"]
        var groupByColumnName = objectOptionsJson["groupByColumnName"]
        var aggregation = objectOptionsJson["aggregation"]


        var q1 = `SELECT TOP 5 ${aggregation}(${tableColumn}) AS "${tableColumnName}","${groupByColumn}" "${groupByColumnName}", "BUCODE" "BUSINESS" FROM dbo."${table}" WHERE "VNAME" LIKE '%%'
        AND "MONTH" = '${month}' AND "YEAR" = '${year}' ${filterString} GROUP BY "${groupByColumn}", "BUCODE" ORDER BY ${aggregation}(${tableColumn}) DESC`

        console.log(q1)
        const result = await request.query(q1);


        var q2 = `SELECT TOP 5 ${aggregation}(${tableColumn}) AS "${tableColumnName}","${groupByColumn}" "${groupByColumnName}", "BUCODE" "BUSINESS"  FROM dbo."${table}" WHERE "VNAME" LIKE '%%'
                AND "MONTH" = '${lmonth}' AND "YEAR" = '${lyear}' GROUP BY "${groupByColumn}","BUCODE"  ORDER BY ${aggregation}(${tableColumn}) DESC`
        console.log(q2)
        const result2 = await request.query(q2);

        var q3 = `SELECT DISTINCT "SINAME" FROM dbo."OL_INCIDENTS" WHERE (MONTH = '${month}' OR MONTH = '${lmonth}') AND (YEAR = '${year}' OR YEAR = '${lyear}')`


        const result3 = await request.query(q3)

        res.json({ result: result.recordset, result2: result2.recordset, sites: result3.recordset, widget: widgetResult.recordset })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("Catch error found !", error);
    }
})

router.post('/getAvgMaxMinRangeWidgetAPI', async (req, res) => {
    console.log("----DISPLAY getAvgMaxMinRangeWidgetAPI API----\n")

    var month = req.body.month.toString()
    var year = req.body.year.toString()
    var userWidgetId = req.body.userWidgetId;
    var filterString = req.body.filterString;
    var lmonth;
    var lyear;

    if (month == '1') {
        lmonth = '12'
        lyear = (Number(year) - 1).toString()
    }
    else {
        lmonth = (Number(month) - 1).toString()
        lyear = year
    }
    console.log(month, year, lmonth, lyear)

    try {
        const request = pool.request();

        var widgetQuery = `SELECT do.*,dw.WIDGET_HTML  FROM DASHBOARD_OBJECTS do
            JOIN DASHBOARD_WIDGET_MASTER dw ON dw.WIDGET_ID = do.OBJECT_ID WHERE do.D_OBJECT_ID = ${userWidgetId}`
        console.log(widgetQuery);
        const widgetResult = await request.query(widgetQuery)
        var objectOptionsJson = JSON.parse(widgetResult.recordset[0].OBJECT_OPTIONS_JSON)
        var tableColumn = objectOptionsJson["tableColumns"]
        var tableColumnName = objectOptionsJson["tableColumnsNames"]
        var table = objectOptionsJson["table"]
        var groupByColumn = objectOptionsJson["groupByColumn"]
        var groupByColumnName = objectOptionsJson["groupByColumnName"]
        var aggregation = objectOptionsJson["aggregation"]


        var q1 = `SELECT ${aggregation}(${tableColumn}) "${tableColumnName}", ${groupByColumn} "${groupByColumnName}" FROM dbo.${table} WHERE '1' = '1'
                AND "MONTH" = '${month}' AND "YEAR" = '${year}' ${filterString}
                GROUP BY ${groupByColumn} ORDER BY ${groupByColumn} ASC`

        console.log(q1)
        const result = await request.query(q1)
        res.json({ result: result.recordset, widget: widgetResult.recordset })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("Catch error found !", error);
    }
})


router.post('/getIncidentDetails', async (req, res) => {
    console.log("----DISPLAY getIncidentDetails API----\n");

    var month = req.body.month.toString();
    var year = req.body.year.toString();
    var userWidgetId = req.body.userWidgetId;
    var filterString = req.body.filterString;
    console.log(userWidgetId);
    console.log(filterString, "gyuu");

    // Check and modify the filterString if it contains DATE = 'some_date'
    if (filterString.includes("DATE =")) {
        filterString = filterString.replace("DATE =", "OCCUREDDATE =");
        console.log("Updated filterString:", filterString);
    }

    var lmonth;
    var lyear;

    if (month == '1') {
        lmonth = '12';
        lyear = (Number(year) - 1).toString();
    } else {
        lmonth = (Number(month) - 1).toString();
        lyear = year;
    }

    console.log(month, year, lmonth, lyear);

    try {
        const request = new sql.Request(pool);

        var widgetQuery = `SELECT do.*, dw.WIDGET_HTML FROM DASHBOARD_OBJECTS do
                JOIN DASHBOARD_WIDGET_MASTER dw ON dw.WIDGET_ID = do.OBJECT_ID WHERE do.D_OBJECT_ID = ${userWidgetId}`;
        console.log(widgetQuery);
        const widgetResult = await request.query(widgetQuery);

        var objectOptionsJson = JSON.parse(widgetResult.recordset[0].OBJECT_OPTIONS_JSON);
        var tableColumn = objectOptionsJson["tableColumns"];
        var tableColumnName = objectOptionsJson["tableColumnsNames"];
        var table = objectOptionsJson["table"];
        var groupByColumn = objectOptionsJson["groupByColumn"];
        var groupByColumnName = objectOptionsJson["groupByColumnName"];
        var aggregation = objectOptionsJson["aggregation"];

        // Construct the query to get data for the current month
        var q1 = `SELECT "INCIDENTID",
                "OCCUREDDATE",

                                "STATUS", 
                                "INCIDENTTITLE", 
                                "INCIDENTDETAILS" AS "INCIDENTDETAILS",
                                "BUNAME",
								"SINAME"
                        FROM dbo."OL_INCIDENTS"
                        WHERE "VNAME" LIKE '%%'
                          AND "MONTH" = '${month}' 
                          AND "YEAR" = '${year}'
                          ${filterString}
                        ORDER BY "INCIDENTID" DESC`;

        console.log(q1);
        const result = await request.query(q1);

        // Query for distinct sites (SINAME) for the current month only
        var q3 = `SELECT DISTINCT "SINAME"
                              FROM dbo."OL_INCIDENTS" 
                              WHERE "MONTH" = '${month}' 
                                AND "YEAR" = '${year}'`;

        const result3 = await request.query(q3);

        // Send the final response with results
        res.json({
            result: result.recordset,
            sites: result3.recordset,
            widget: widgetResult.recordset
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        console.log("Catch error found!", error);
    }
});

router.post('/getdailyDSRStatus', async (req, res) => {
    console.log("----DISPLAY getdailyDSRStatus API----\n");
    var month = req.body.month.toString();
    var year = req.body.year.toString();
    var userWidgetId = req.body.userWidgetId;
    var filterString = req.body.filterString;
    console.log(userWidgetId);
    console.log(filterString, "gyuu");
    // Check and modify the filterString if it contains DATE = 'some_date'
    if (filterString.includes("DATE =")) {
        filterString = filterString.replace("DATE =", "DATE =");
        console.log("Updated filterString:", filterString);
    }
    var lmonth;
    var lyear;
    if (month == '1') {
        lmonth = '12';
        lyear = (Number(year) - 1).toString();
    } else {
        lmonth = (Number(month) - 1).toString();
        lyear = year;
    }
    console.log(month, year, lmonth, lyear);
    try {
        const request = pool.request();
        var widgetQuery = `SELECT do.*, dw.WIDGET_HTML FROM DASHBOARD_OBJECTS do
            JOIN DASHBOARD_WIDGET_MASTER dw ON dw.WIDGET_ID = do.OBJECT_ID WHERE do.D_OBJECT_ID = ${userWidgetId}`;
        console.log(widgetQuery);

        const widgetResult = await request.query(widgetQuery);

        var objectOptionsJson = JSON.parse(widgetResult.recordset[0].OBJECT_OPTIONS_JSON);
        var tableColumn = objectOptionsJson["tableColumns"];
        var tableColumnName = objectOptionsJson["tableColumnsNames"];
        var table = objectOptionsJson["table"];
        var groupByColumn = objectOptionsJson["groupByColumn"];
        var groupByColumnName = objectOptionsJson["groupByColumnName"];
        var aggregation = objectOptionsJson["aggregation"];

        // Construct the query to get data for the current month
        var q1 = `SELECT
                BUNAME,
                DATE,
                CASE
                    WHEN STATUS = 1 THEN 'PENDING'
                    WHEN STATUS = 2 THEN 'COMPLETE'
                    ELSE 'INPROGRESS'
                END AS STATUS,
                COUNT(*) AS STATUS_COUNT
            FROM
                (
                    SELECT
                        BUNAME,
                        DATE,
                        CASE
                            WHEN PENDING = 1 THEN 1  -- PENDING
                            WHEN COMPLETE = 1 THEN 2  -- COMPLETE
                            ELSE 0  -- INPROGRESS
                        END AS STATUS
                    FROM
                        dbo.OL_DASHBOARD_DAILY_DSRSTATUS
                    WHERE
                    1=1 
                        ${filterString}
                ) AS STATUS_TABLE
            GROUP BY
                BUNAME, DATE, STATUS
            ORDER BY
                BUNAME ASC, DATE, STATUS;
            `;

        console.log(q1);
        const result = await request.query(q1);

        // Send the final response with results
        res.json({
            result: result.recordset,
            widget: widgetResult.recordset
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
        console.log("Catch error found!", error);
    }
});





router.post('/getIncidentDataAPI', async (req, res) => {
    console.log("----DISPLAY getIncidentDataAPI API----\n")

    var month = parseInt(req.body.month.toString())
    var year = parseInt(req.body.year.toString())
    var userWidgetId = req.body.userWidgetId;
    var filterString = req.body.filterString;
    var startDate = formatDate(new Date(year, month - 1, 1));
    var endDate = formatDate(new Date(year, month, 0));
    filterString = filterString.replace(/ AND (\w+)/, " AND INCIDENTS.$1");
    filterString += ` AND INCIDENTS.OCCURDATE BETWEEN '${startDate}' AND '${endDate}'`
    try {
        const request = pool.request();
        var widgetQuery = `SELECT do.*,dw.WIDGET_HTML  FROM DASHBOARD_OBJECTS do
            JOIN DASHBOARD_WIDGET_MASTER dw ON dw.WIDGET_ID = do.OBJECT_ID WHERE do.D_OBJECT_ID = ${userWidgetId}`
        console.log(widgetQuery);
        const widgetResult = await request.query(widgetQuery);
        var q1 = `SELECT "INCIDENTS"."INCIDENTID","INCIDENTS"."REPORTEDBY","INCIDENTTYPEMASTER"."INCIDENTTYPENAME","INCIDENTCATMASTER"."INCIDENTCATNAME",
            "INCIDENTCATMASTER_ICON"."ICON","INCIDENTCATMASTER_ICON"."COLOR","INCIDENTS"."BUID" as "BUSINESSID", "BUSINESS"."BUNAME" as BUSINESSNAME,"INCIDENTS"."VID" as VERTICALID,
             "VERTICAL"."VNAME" as "VERTICALNAME","INCIDENTS"."SIID" as "SITEID", "SITE"."SINAME" as "SITENAME", 
             "INCIDENTS"."USERID","LOCATION"."LNAME" as "LOCATIONNAME","REPORTINGTYPEMASTER"."REPORTTYPENAME","STATUSMASTER"."STATUSNAME", 
             "INCIDENTS"."INCIDENTTITLE", "INCIDENTS"."DESCRIPTION", "INCIDENTS"."OCCURDATE", "INCIDENTS"."OCCURTIME", "INCIDENTS"."REPORTEDDATE", 
             "INCIDENTS"."REPORTEDTIME","INCIDENTS"."EMAILSTATUS","INCIDENTS"."SMSSTATUS", "INCIDENTS"."LASTUPDATEDATE", "INCIDENTS"."LASTUPDATEDTIME","ZONE"."ZNAME" as "ZONENAME","LOCATION"."LATITUDE",
              "LOCATION"."LONGITUDE", "INCIDENTS"."SEVERITY", "INCIDENTS"."GEOJSON", "INCIDENTS"."GEOTYPE"
            FROM dbo."INCIDENTS"
          JOIN dbo."INCIDENTTYPEMASTER" ON dbo."INCIDENTTYPEMASTER"."INCIDENTTYPEID" = dbo."INCIDENTS"."INCIDENTTYPEID"
          JOIN dbo."INCIDENTCATMASTER" ON dbo."INCIDENTCATMASTER"."INCIDENTCATID" = dbo."INCIDENTS"."INCIDENTCATID"
          JOIN dbo."BUSINESS" ON dbo."BUSINESS"."BUID" = dbo."INCIDENTS"."BUID"
          JOIN dbo."VERTICAL" ON dbo."VERTICAL"."VID" = dbo."INCIDENTS"."VID"	  
          JOIN dbo."SITE" ON dbo."SITE"."SIID" = dbo."INCIDENTS"."SIID"
          JOIN dbo."LOCATION" ON dbo."LOCATION"."LID" = dbo."INCIDENTS"."LID"
          JOIN dbo."REPORTINGTYPEMASTER" ON dbo."REPORTINGTYPEMASTER"."REPORTTYPEID" = dbo."INCIDENTS"."REPORTTYPEID"
          JOIN dbo."STATUSMASTER" ON dbo."STATUSMASTER"."STATUSID" = dbo."INCIDENTS"."STATUSID" 
          JOIN dbo."INCIDENTCATMASTER_ICON" ON "INCIDENTCATMASTER_ICON"."INCIDENTCATID" = dbo."INCIDENTS"."INCIDENTCATID"
          JOIN dbo."ZONE" ON dbo."ZONE"."ZID" = dbo."INCIDENTS"."ZID" WHERE '1' = '1' `+
            filterString +
            ` ORDER BY dbo."INCIDENTS"."REPORTEDDATE" DESC;`
        console.log(q1);
        const result1 = await request.query(q1);
        res.json({ result: result1.recordset, widget: widgetResult.recordset })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("Catch error found !", error);
    }
})

function formatDate(date) {
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add 1 to month because months are zero-indexed
    var day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

router.post('/getPercentBarsWidgetAPI', async (req, res) => {
    console.log("----DISPLAY getPercentBarsWidgetAPI API----\n")

    var month = req.body.month.toString()
    var year = req.body.year.toString()
    var userWidgetId = req.body.userWidgetId;
    var filterString = req.body.filterString;
    var lmonth;
    var lyear;

    if (month == '1') {
        lmonth = '12'
        lyear = (Number(year) - 1).toString()
    }
    else {
        lmonth = (Number(month) - 1).toString()
        lyear = year
    }
    console.log(month, year, lmonth, lyear)

    try {
        const request = pool.request();

        var widgetQuery = `SELECT do.*,dw.WIDGET_HTML  FROM DASHBOARD_OBJECTS do
            JOIN DASHBOARD_WIDGET_MASTER dw ON dw.WIDGET_ID = do.OBJECT_ID WHERE do.D_OBJECT_ID = ${userWidgetId}`
        console.log(widgetQuery);
        const widgetResult = await request.query(widgetQuery)
        var objectOptionsJson = JSON.parse(widgetResult.recordset[0].OBJECT_OPTIONS_JSON)
        var tableColumn = objectOptionsJson["tableColumns"]
        var tableColumnName = objectOptionsJson["tableColumnsNames"]
        var table = objectOptionsJson["table"]
        var groupByColumn = objectOptionsJson["groupByColumn"]
        var groupByColumnName = objectOptionsJson["groupByColumnName"]
        var aggregation = objectOptionsJson["aggregation"]


        var q1 = `SELECT ${aggregation}(${tableColumn[0]}) "${tableColumnName[0]}", ${groupByColumn} "${groupByColumnName}" FROM dbo.${table} WHERE '1' = '1'
                AND "MONTH" = '${month}' AND "YEAR" = '${year}' ${filterString}
                GROUP BY ${groupByColumn} ORDER BY ${groupByColumn} ASC`

        var q2 = `SELECT ${aggregation}(${tableColumn[1]}) "${tableColumnName[1]}", ${groupByColumn} "${groupByColumnName}" FROM dbo.${table} WHERE '1' = '1'
                AND "MONTH" = '${month}' AND "YEAR" = '${year}' ${filterString}
                GROUP BY ${groupByColumn} ORDER BY ${groupByColumn} ASC`

        console.log(q1)
        const result = await request.query(q1)
        const result2 = await request.query(q2)
        res.json({ result: result.recordset, result2: result2.recordset, widget: widgetResult.recordset })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("Catch error found !", error);
    }
})




router.post("/getChart3Data", async (req, res) => {
    console.log("----DISPLAY getChart3Data API----\n");
    var month = req.body.month
    var year = req.body.year
    try {
        const request = pool.request();
        var q1 = `SELECT COUNT(INCIDENTCOUNT) INCIDENTCOUNT, OCCUREDDATE  FROM dbo.OL_INCIDENTS WHERE [MONTH] = ${month} AND [YEAR] = '${year}' GROUP BY OCCUREDDATE ORDER BY OCCUREDDATE`;
        console.log(q1);
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found getChart3Data", error);
    }
})

router.post("/getChart1Data", async (req, res) => {
    console.log("----DISPLAY getChart3Data API----\n");
    var month = req.body.month
    var year = req.body.year
    try {
        const request = pool.request();
        var q1 = `SELECT COUNT(INCIDENTCOUNT) INCIDENTCOUNT, BUNAME FROM dbo.OL_INCIDENTS WHERE [MONTH] = ${month} AND [YEAR] = '${year}' GROUP BY BUNAME ORDER BY BUNAME`;
        console.log(q1);
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found getChart3Data", error);
    }
})

router.post("/getChart4Data", async (req, res) => {
    console.log("----DISPLAY getChart3Data API----\n");
    var month = req.body.month
    var year = req.body.year
    try {
        const request = pool.request();
        var q1 = `SELECT AVG(AVAILABLE) AVAILABLE, AVG(WORKING) WORKING  FROM dbo.OL_DSRSECAUTO od WHERE [MONTH] = ${month} AND [YEAR] = '${year}'`;
        console.log(q1);
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found getChart3Data", error);
    }
})

router.post("/getChart2Data", async (req, res) => {
    console.log("----DISPLAY getChart3Data API----\n");
    var month = req.body.month
    var year = req.body.year
    try {
        const request = pool.request();
        var q1 = `SELECT COUNT(INCIDENTCOUNT) INCIDENTCOUNT, INCIDENTTYPENAME FROM dbo.OL_INCIDENTS WHERE [MONTH] = ${month} AND [YEAR] = '${year}' GROUP BY INCIDENTTYPENAME`;
        console.log(q1);
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found getChart3Data", error);
    }
})

router.post("/getChart5Data", async (req, res) => {
    console.log("----DISPLAY getChart3Data API----\n");
    var month = req.body.month
    var year = req.body.year
    try {
        const request = pool.request();
        var q1 = `SELECT COUNT(INCIDENTCOUNT) INCIDENTCOUNT, INCIDENTCATNAME FROM dbo.OL_INCIDENTS WHERE [MONTH] = ${month} AND [YEAR] = '${year}' GROUP BY INCIDENTCATNAME`;
        console.log(q1);
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found getChart3Data", error);
    }
})

router.post("/getRadialChartData", async (req, res) => {
    console.log("----DISPLAY getRadialChartData API----\n");
    var month = req.body.month
    var year = req.body.year
    var upperColumn = req.body.upperColumn
    var lowerColumn = req.body.lowerColumn
    var table = req.body.table
    try {
        const request = pool.request();
        var q1 = `SELECT SUM(${upperColumn}) ${upperColumn}, SUM(${lowerColumn}) ${lowerColumn} FROM dbo.${table} WHERE [MONTH] = ${month} AND [YEAR] = '${year}'`;
        console.log(q1);
        const result1 = await request.query(q1);
        res.json(result1.recordset)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        console.log("catch error found getRadialChartData", error);
    }
})



module.exports = router; 