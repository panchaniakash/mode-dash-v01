var dashboardName = ''

var date = new Date();
var day = date.getDate();
if (day.toString().length == 1) {
    day = `0${day}`;
}
var month

var year

var monthsAbbrev = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
var monthName

getDashboardInitData()


var mode = 'edit'
var filterString = ``
var filterStringForId = ``
var userLevelFilterString = ``  
var userLevelFilterStringForId = ``
var vFilter = ``
var bFilter = ``
var sFilter = ``
var monthFilter = ``

var filterArray = []
var uL = `VNAME`
var uLName = 'VERTICAL'


function populateVerticals(data) {
    let verticals = document.getElementById('VerticalDashboardFilter');
    let html = '<option value="All" selected = "selected">SELECT ALL</option>';
    vFilter = `VNAME IN (`;
    for (var i = 0; i < data.length; i++) {
        if (i == 0) {
            vFilter += `'${data[i].VNAME}'`;
        } else {
            vFilter += `,'${data[i].VNAME}'`;
        }
        html += `<option value="${data[i].VNAME}">${data[i].VNAME}</option>`;
    }
    vFilter += `)`;
    verticals.innerHTML = html;
    $('#VerticalDashboardFilter').val('All').trigger('change');
    var site = document.getElementById('SiteDashboardFilter');
    var business = document.getElementById('BusinessDashboardFilter');
    site.innerHTML = `<option value="">Select</option>`;
    business.innerHTML = `<option value="">Select</option>`;
}

function getBusiness(select) {

    if (select.value === 'All') {
        document.getElementById('BusinessDashboardFilter').innerHTML = `<option value="All">SELECT ALL</option>`
        document.getElementById('SiteDashboardFilter').innerHTML = `<option value="All">SELECT ALL</option>`
        document.getElementById('SiteDashboardFilter').setAttribute('disabled', 'true')
        document.getElementById('BusinessDashboardFilter').setAttribute('disabled', 'true')
    } else {
        document.getElementById('SiteDashboardFilter').removeAttribute('disabled')
        document.getElementById('BusinessDashboardFilter').removeAttribute('disabled')
        if (select.value != "") {
            let business = document.getElementById('BusinessDashboardFilter')
            let bucketId = sessionStorage.getItem('bucketId')
            const myUrl = new URL(window.location.toLocaleString()).searchParams;
            var userId = myUrl.get('uid')
            let newObj = {};
            newObj['bucketId'] = bucketId
            newObj["userId"] = userId
            newObj['vertical'] = select.value

            $.ajax({
                "url": `/index/getBusiness`,
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Content-Type": "application/json"
                },
                "data": JSON.stringify(newObj)
            }).done(function (data) {
                let html = '<option value="All">SELECT ALL</option>';
                bFilter = `BUNAME IN (`
                // data.forEach(element => {
                //     html += `<option value="${element.VID}">${element.VNAME} </option>`;
                // });
                for (var i = 0; i < data.length; i++) {
                    if (i == 0) {
                        bFilter += `'${data[i].BUNAME}'`
                    } else {
                        bFilter += `,'${data[i].BUNAME}'`
                    }
                    html += `<option value="${data[i].BUNAME}">${data[i].BUNAME} </option>`;
                }
                bFilter += `)`
                business.innerHTML = html

             $('#BusinessDashboardFilter').val(data[0]?.BUNAME).trigger('change')
//$('#BusinessDashboardFilter').val(All).trigger('change')

            })

            var site = document.getElementById('SiteDashboardFilter');
            site.innerHTML = `<option value="">Select</option>`;

        }
    }
}


function getSite(select) {
    if (select.value === 'All') {
        document.getElementById('SiteDashboardFilter').innerHTML = `<option value="All">SELECT ALL</option>`
        document.getElementById('SiteDashboardFilter').setAttribute('disabled', 'true')
    } else {
        document.getElementById('SiteDashboardFilter').removeAttribute('disabled')
        if (select.value != "") {
            let site = document.getElementById('SiteDashboardFilter');
            let bucketId = sessionStorage.getItem('bucketId')
            const myUrl = new URL(window.location.toLocaleString()).searchParams;
            var userId = myUrl.get('uid')
            let newObj = {}

            newObj['bucketId'] = bucketId
            newObj["userId"] = userId
            newObj['Business'] = select.value
            $.ajax({
                "url": `/index/getSite`,
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Content-Type": "application/json"
                },
                "data": JSON.stringify(newObj)
            }).done(function (data) {
                console.log(data);
                let html = '<option value="All">SELECT ALL</option>';
                sFilter = `SINAME IN (`

                for (var i = 0; i < data.length; i++) {
                    if (i == 0) {
                        sFilter += `'${data[i].SINAME}'`
                    } else {
                        sFilter += `,'${data[i].SINAME}'`
                    }
                    html += `<option value="${data[i].SINAME}">${data[i].SINAME} </option>`;
                }
                sFilter += `)`
                site.innerHTML = html
                $('#SiteDashboardFilter').val(data[0]?.SINAME).trigger('change')
 //$('#SiteDashboardFilter').val(All).trigger('change')

            });

        }
    }
    

}
function populateYears(data) {
    document.getElementById('yearDashboardFilter').innerHTML = ``;
    var yearOptions = ``;
    data.forEach(year => {
        yearOptions += `<option value="${year.YEAR}">${year.YEAR}</option>`;
    });
    document.getElementById('yearDashboardFilter').innerHTML = yearOptions;
    getMonthFromSecAuto(`${data[0]?.YEAR}`);
}

function getMonthFromSecAuto(year) {
   var jsonObj = {}
   jsonObj["year"] = year
   $.ajax({
       "url": `/index/getMonthFromSecAuto`,
       "method": "POST",
       "timeout": 0,
       "headers": {
           "Content-Type": "application/json"
       }, "data": JSON.stringify(jsonObj)
   }).done(function (data) {
       document.getElementById('monthDashboardFilter').innerHTML = ``
       var yearOptions = ``//

       data.forEach(year => {
           yearOptions += `<option value="${year.MONTH}">${year.MONTHNAME}</option>`
       })
       document.getElementById('monthDashboardFilter').innerHTML = yearOptions
       getDate()
       setYearMonth()
   })
}

// function getMonthFromSecAuto(year) {
//     let month = document.getElementById('monthDashboardFilter');
//     var jsonObj = {}
//     jsonObj["year"] = year
//     $.ajax({
//         "url": `/index/getMonthFromSecAuto`,
//         "method": "POST",
//         "timeout": 0,
//         "headers": {
//             "Content-Type": "application/json"
//         }, "data": JSON.stringify(jsonObj)
//     }).done(function (data) {
//         console.log(data);
//         let html = '<option value="All">SELECT ALL</option>';
//         monthFilter = `MONTHNAME IN (`

//         for (var i = 0; i < data.length; i++) {
//             if (i == 0) {
//                 monthFilter += `'${data[i].MONTHNAME}'`
//             } else {
//                 monthFilter += `,'${data[i].MONTHNAME}'`
//             }
//             html += `<option value="${data[i].MONTH}">${data[i].MONTHNAME}</option>`;
//         }
//         monthFilter += `)`
//         month.innerHTML = html;
//         $('#monthDashboardFilter').val('All').trigger('change')
//     })

// }


// function getDate() {
//     var year1 = document.getElementById('yearDashboardFilter').value;  // Get the year from the dropdown
//     var month1 = document.getElementById('monthDashboardFilter').value;  // Get the month from the dropdown

//     // Determine the number of days in the selected month/year
//     var numberOfDays = new Date(year1, month1, 0).getDate(); // This gets the last day of the month (e.g., 31st, 30th, etc.)

//     // Get the Date dropdown element
//     var dateDropdown = document.getElementById('DateDashboardFilter');

//     // Clear existing options
//     dateDropdown.innerHTML = '';

//     // Add a default "Select Date" option
//     //var defaultOption = document.createElement('option');
//     //defaultOption.value = '';
//     //defaultOption.textContent = 'Select Date';
//     //dateDropdown.appendChild(defaultOption);

//     // Loop through the number of days in the month and add options
//     for (var day = 1; day <= numberOfDays; day++) {
//         var option = document.createElement('option');
//         var dayFormatted = day < 10 ? '0' + day : day; // Ensure the day is 2 digits (e.g., 01, 02, ..., 31)
//         var monthFormatted = month1 < 10 ? '0' + month1 : month1; // Ensure the month is 2 digits (e.g., 01, 02, ..., 12)
        
//         // Format the date in 'YYYY-MM-DD'
//         var formattedDate = `${year1}-${monthFormatted}-${dayFormatted}`;

//         option.value = formattedDate;  // Set the formatted date as the option value
//         option.textContent = formattedDate;  // Display the formatted date in the dropdown
//         dateDropdown.appendChild(option);
//     }
// }

//currentdate
// function getDate() {
//     var year1 = document.getElementById('yearDashboardFilter').value;  // Get the year from the dropdown
//     var month1 = document.getElementById('monthDashboardFilter').value;  // Get the month from the dropdown

//     // Determine the number of days in the selected month/year
//     var numberOfDays = new Date(year1, month1, 0).getDate(); // This gets the last day of the month (e.g., 31st, 30th, etc.)

//     // Get the Date dropdown element
//     var dateDropdown = document.getElementById('DateDashboardFilter');

//     // Clear existing options
//     dateDropdown.innerHTML = '';

//     // Loop through the number of days in the month and add options
//     var currentDate = new Date();  // Get the current date
//     var currentYear = currentDate.getFullYear(); // Get the current year
//     var currentMonth = currentDate.getMonth() + 1; // Get the current month (1-based index, so add 1)
//     var currentDay = currentDate.getDate(); // Get the current day

//     // Add a default "Select Date" option
//     var defaultOption = document.createElement('option');
//     defaultOption.value = '';
//     defaultOption.textContent = 'Select Date';
//     dateDropdown.appendChild(defaultOption);

//     // Loop through the number of days in the month and add options
//     for (var day = 1; day <= numberOfDays; day++) {
//         var option = document.createElement('option');
//         var dayFormatted = day < 10 ? '0' + day : day; // Ensure the day is 2 digits (e.g., 01, 02, ..., 31)
//         var monthFormatted = month1 < 10 ? '0' + month1 : month1; // Ensure the month is 2 digits (e.g., 01, 02, ..., 12)
        
//         // Format the date in 'YYYY-MM-DD'
//         var formattedDate = `${year1}-${monthFormatted}-${dayFormatted}`;

//         option.value = formattedDate;  // Set the formatted date as the option value
//         option.textContent = formattedDate;  // Display the formatted date in the dropdown
//         dateDropdown.appendChild(option);

//         // Select the current date (if it matches)
//         if (formattedDate === `${currentYear}-${currentMonth < 10 ? '0' + currentMonth : currentMonth}-${currentDay < 10 ? '0' + currentDay : currentDay}`) {
//             option.selected = true;
//         }
//     }
// }

function getDate() {
    var year1 = document.getElementById('yearDashboardFilter').value;  // Get the year from the dropdown
    var month1 = document.getElementById('monthDashboardFilter').value;  // Get the month from the dropdown

    // Determine the number of days in the selected month/year
    var numberOfDays = new Date(year1, month1, 0).getDate(); // This gets the last day of the month (e.g., 31st, 30th, etc.)

    // Get the Date dropdown element
    var dateDropdown = document.getElementById('DateDashboardFilter');

    // Clear existing options
    dateDropdown.innerHTML = '';

    // Get the current date and subtract 1 day to get the previous date
    var currentDate = new Date();  // Get today's date
    currentDate.setDate(currentDate.getDate() - 1);  // Subtract 1 day

    var prevYear = currentDate.getFullYear(); // Get the previous year
    var prevMonth = currentDate.getMonth() + 1; // Get the previous month (1-based index)
    var prevDay = currentDate.getDate(); // Get the previous day

    // Format the previous day in 'YYYY-MM-DD'
    var prevDateFormatted = `${prevYear}-${prevMonth < 10 ? '0' + prevMonth : prevMonth}-${prevDay < 10 ? '0' + prevDay : prevDay}`;

    // Add a default "Select Date" option
    var defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Date';
    dateDropdown.appendChild(defaultOption);

    // Loop through the number of days in the month and add options
    for (var day = 1; day <= numberOfDays; day++) {
        var option = document.createElement('option');
        var dayFormatted = day < 10 ? '0' + day : day; // Ensure the day is 2 digits (e.g., 01, 02, ..., 31)
        var monthFormatted = month1 < 10 ? '0' + month1 : month1; // Ensure the month is 2 digits (e.g., 01, 02, ..., 12)
        
        // Format the date in 'YYYY-MM-DD'
        var formattedDate = `${year1}-${monthFormatted}-${dayFormatted}`;

        option.value = formattedDate;  // Set the formatted date as the option value
        option.textContent = formattedDate;  // Display the formatted date in the dropdown
        dateDropdown.appendChild(option);

        // Select the previous day (if it matches)
        if (formattedDate === prevDateFormatted) {
            option.selected = true;
        }
    }
}



//function setYearMonth() {
//    var year1 = document.getElementById('yearDashboardFilter').value;
//    var month1 = document.getElementById('monthDashboardFilter').value;
//    var VNAME = document.getElementById('VerticalDashboardFilter').value;
//    var BUNAME = document.getElementById('BusinessDashboardFilter').value;
//    var SINAME = document.getElementById('SiteDashboardFilter').value;
//
//    var selectElement = document.getElementById("monthDashboardFilter");
//    var selectedIndex = selectElement.selectedIndex;
//
//    // Get the selected option
//    var selectedOption = selectElement.options[selectedIndex];
//
//    // Get the text of the selected option
//    var monthName1 = selectedOption.text;
//
//    month = month1;
//    year = year1;
//    monthName = monthName1;
//    verticalName = VNAME;
//    businessName = BUNAME;
//    siteNamess = SINAME;
//
//    if (verticalName != 'SELECT ALL' || businessName != 'SELECT ALL' || siteNamess != 'SELECT ALL')  {
//        filterString = userLevelFilterString + ` AND YEAR = ${year} AND MONTHNAME = '${monthName}' AND VNAME = '${verticalName}' AND BUNAME = '${businessName}' AND SINAME = '${siteNamess}' `;
//    }else if (verticalName === 'SELECT ALL' || businessName === 'SELECT ALL' || siteNamess != 'SELECT ALL')  {
//        filterString = userLevelFilterString + ` AND YEAR = ${year} AND MONTHNAME = '${monthName}' AND SINAME = '${siteNamess}' `;
//    }
//    else if (verticalName === 'SELECT ALL' || businessName != 'SELECT ALL' || siteNamess === 'SELECT ALL')  {
//        filterString = userLevelFilterString + ` AND YEAR = ${year} AND MONTHNAME = '${monthName}' AND BUNAME = '${businessName}' `;
//    }else{
//        filterString = userLevelFilterString + ` AND YEAR = ${year} AND MONTHNAME = '${monthName}' `;
//    }
//
//    filterStringForId = userLevelFilterStringForId + ``;
//
//    // Log the filter strings
//    console.log('filterString:', filterString);
//    console.log('filterStringForId:', filterStringForId);
//
//    // Resolve the page grid load
//    resolveLoadPageGrid()
//        .then(() => {
//            // Now that resolveLoadPageGrid is complete, execute setUserView
//            setUserView();
//        })
//        .catch(function (error) {
//            console.error('Error:', error);
//        });
//}


function setYearMonth() {
    var year1 = document.getElementById('yearDashboardFilter').value;
    var month1 = document.getElementById('monthDashboardFilter').value;
    var VID = document.getElementById('VerticalDashboardFilter').value;
    var BUID = document.getElementById('BusinessDashboardFilter').value;
    var SIID = document.getElementById('SiteDashboardFilter').value;
    var DATE = document.getElementById('DateDashboardFilter').value;
    var selectElement = document.getElementById("monthDashboardFilter");
    var selectedIndex = selectElement.selectedIndex;

    // Get the selected option for month
    var selectedOption = selectElement.options[selectedIndex];
    var monthName1 = selectedOption.text;

    var dataFilterString = ``;
    if (VID === 'All') {
        dataFilterString = vFilter;
    } else {
        if (BUID === 'All') {
            dataFilterString = bFilter;
        } else  {
            if (SIID === 'All') {
                dataFilterString = sFilter;
            }
        }
    }
    console.log(dataFilterString);

    // Determine the month filter string
    var monthFilterString = ``;
    if (month1 === 'All') {
        // If 'All' is selected, apply the entire month filter
        monthFilterString = monthFilter;
    } else {
        // If a single month is selected, apply that month only
        monthFilterString = ` MONTHNAME = '${monthName1}'`;
    }

    month = month1;
    year = year1;
    monthName = monthName1;
    date = DATE;

    // Check if DATE is not empty or blank
    var dateIsValid = DATE && DATE.trim() !== '';

    // Building the filter string for the dropdown
    var filterStringDropdown = ``;
    if (VID == 'All') {
        filterStringDropdown = `AND YEAR = ${year} AND ${monthFilterString} ${dateIsValid ? `AND DATE = '${DATE}'` : ''} AND ${dataFilterString}`;
    } else if (BUID == 'All') {
        filterStringDropdown = ` AND "VNAME" = '${VID}' AND YEAR = ${year} AND ${monthFilterString} ${dateIsValid ? `AND DATE = '${DATE}'` : ''} AND ${dataFilterString}`;
    } else if (SIID == 'All') {
        filterStringDropdown = ` AND "VNAME" = '${VID}' AND "BUNAME" = '${BUID}' AND YEAR = ${year} AND ${monthFilterString} ${dateIsValid ? `AND DATE = '${DATE}'` : ''} AND ${dataFilterString}`;
    } else {
        filterStringDropdown = ` AND "VNAME" = '${VID}' AND "BUNAME" = '${BUID}' AND "SINAME" = '${SIID}' AND YEAR = ${year} AND ${monthFilterString} ${dateIsValid ? `AND DATE = '${DATE}'` : ''}`;
    }

    filterString = userLevelFilterString + filterStringDropdown;

    // filterStringForId (if needed, but no change here)
    filterStringForId = userLevelFilterStringForId + ``;

    resolveLoadPageGrid()
        .then(() => {
            // Now that resolveLoadPageGrid is complete, execute setUserView
            setUserView();
        })
        .catch(function (error) {
            console.error('Error:', error);
        });
}

//function setYearMonth() {
//    var year1 = document.getElementById('yearDashboardFilter').value;
//    var month1 = document.getElementById('monthDashboardFilter').value;
//    var VID = document.getElementById('VerticalDashboardFilter').value;
//    var BUID = document.getElementById('BusinessDashboardFilter').value;
//    var SIID = document.getElementById('SiteDashboardFilter').value;
//    var DATE = document.getElementById('DateDashboardFilter').value;
//    var selectElement = document.getElementById("monthDashboardFilter");
//    var selectedIndex = selectElement.selectedIndex;
//
//    // Get the selected option
//    var selectedOption = selectElement.options[selectedIndex];
//
//    // Get the text of the selected option
//    var monthName1 = selectedOption.text;
//
//    var dataFilterString = ``;
//    if (VID === 'All') {
//        dataFilterString = vFilter;
//    } else {
//        if (BUID === 'All') {
//            dataFilterString = bFilter;
//        } else {
//            if (SIID === 'All') {
//                dataFilterString = sFilter;
//            }
//        }
//    }
//
//    console.log(dataFilterString);
//
//    month = month1;
//    year = year1;
//    monthName = monthName1;
//    date = DATE;
//
//    // Check if DATE is not empty or blank
//    var dateIsValid = DATE && DATE.trim() !== '';
//
//    // Building the filter string for the dropdown
//    var filterStringDropdown = ``;
//    if (VID == 'All') {
//        filterStringDropdown = `AND YEAR = ${year} AND MONTHNAME = '${monthName}' ${dateIsValid ? `AND DATE = '${DATE}'` : ''} AND ${dataFilterString}`;
//    } else if (BUID == 'All') {
//        filterStringDropdown = ` AND "VNAME" = '${VID}' AND YEAR = ${year} AND MONTHNAME = '${monthName}' ${dateIsValid ? `AND DATE = '${DATE}'` : ''} AND ${dataFilterString}`;
//    } else if (SIID == 'All') {
//        filterStringDropdown = ` AND "VNAME" = '${VID}' AND "BUNAME" = '${BUID}' AND YEAR = ${year} AND MONTHNAME = '${monthName}' ${dateIsValid ? `AND DATE = '${DATE}'` : ''} AND ${dataFilterString}`;
//    } else {
//        filterStringDropdown = ` AND "VNAME" = '${VID}' AND "BUNAME" = '${BUID}' AND "SINAME" = '${SIID}' AND YEAR = ${year} AND MONTHNAME = '${monthName}' ${dateIsValid ? `AND DATE = '${DATE}'` : ''}`;
//    }
//
//    filterString = userLevelFilterString + filterStringDropdown;
//
//    // filterStringForId (if needed, but no change here)
//    filterStringForId = userLevelFilterStringForId + ``;
//
//    resolveLoadPageGrid()
//        .then(() => {
//            // Now that resolveLoadPageGrid is complete, execute setUserView
//            setUserView();
//        })
//        .catch(function (error) {
//            console.error('Error:', error);
//        });
//}

//function setYearMonth() {
//    var year1 = document.getElementById('yearDashboardFilter').value
//    var month1 = document.getElementById('monthDashboardFilter').value
//    var VID = document.getElementById('VerticalDashboardFilter').value
//    var BUID = document.getElementById('BusinessDashboardFilter').value
//    var SIID = document.getElementById('SiteDashboardFilter').value
//    var selectElement = document.getElementById("monthDashboardFilter")
//    var selectedIndex = selectElement.selectedIndex;
//
//    // Get the selected option
//    var selectedOption = selectElement.options[selectedIndex];
//
//    // Get the text of the selected option
//    var monthName1 = selectedOption.text;
//
//    var dataFilterString = ``
//    if (VID === 'All') {
//        dataFilterString = vFilter
//    } else {
//        if (BUID === 'All') {
//            dataFilterString = bFilter
//        } else {
//            if (SIID === 'All') {
//                dataFilterString = sFilter
//            }
//        }
//    }
//console.log(dataFilterString);
//
//    month = month1
//    year = year1
//    monthName = monthName1
//    //filterString = userLevelFilterString +  ` AND YEAR = ${year} AND MONTHNAME = '${monthName}' AND VNAME = '${VID}' AND BUNAME = '${BUID}' AND SINAME = '${SIID}' `
//
//    var filterStringDropdown = ``
//    if (VID == 'All') {
//        filterStringDropdown =   `AND YEAR = ${year} AND MONTHNAME = '${monthName}' AND ${dataFilterString}` 
//    } else if (BUID == 'All') {
//        filterStringDropdown = ` AND "VNAME" = '${VID}' AND  YEAR = ${year} AND MONTHNAME = '${monthName}' AND ${dataFilterString} `
//    
//    } else if (SIID == 'All') {
//        filterStringDropdown =  ` AND "VNAME" = '${VID}' AND "BUNAME" = '${BUID}' AND  YEAR = ${year} AND MONTHNAME = '${monthName}' AND ${dataFilterString}  `
//    } else {
//        filterStringDropdown =  ` AND "VNAME" = '${VID}' AND "BUNAME" = '${BUID}' AND "SINAME" = '${SIID}' AND YEAR = ${year} AND MONTHNAME = '${monthName}'`  
//    }
//
//        filterString = userLevelFilterString +     filterStringDropdown 
//
//
//    //var filterString = ``
//    //if (VID == 'All') {
//    //    filterString =  `YEAR = ${year} AND MONTHNAME = '${monthName}'` + dataFilterString 
//    //} else if (BUID == 'All') {
//    //    filterString = `"VID" = '${VID}' AND  YEAR = ${year} AND MONTHNAME = '${monthName}' AND` + dataFilterString
//    //} else if (SIID == 'All') {
//    //    filterString = `"VID" = '${VID}' AND "BUID" = '${BUID}' AND  YEAR = ${year} AND MONTHNAME = '${monthName}' AND` + dataFilterString
//    //} else {
//    //    filterString = `"VID" = '${VID}' AND "BUID" = '${BUID}' AND "SIID" = '${SIID}' AND YEAR = ${year} AND MONTHNAME = '${monthName}'`  
//    //}
//
//    filterStringForId = userLevelFilterStringForId + ``
//
//
//    resolveLoadPageGrid()
//        .then(() => {
//            // Now that resolveLoadPageGrid is complete, execute setUserView
//            setUserView();
//        })
//        .catch(function (error) {
//            console.error('Error:', error);
//        });
//}



function getDashboardInitData() {
    const loader = document.getElementById('loader');
    loader.style.display = 'flex';

    const myUrl = new URL(window.location.toLocaleString()).searchParams;
    const userId = myUrl.get('uid');
    const bucketId = sessionStorage.getItem('bucketId');

    $.ajax({
        url: `/index/getDashboardInitData`,
        method: "POST",
        timeout: 0,
        headers: {
            "Content-Type": "application/json"
        },
        data: JSON.stringify({ userId, bucketId }),
    }).done(function (data) {
        if (data.userLevelFilters.length > 0) {
            const userLevelFilters = data.userLevelFilters;
            sessionStorage.setItem('bucketId', parseInt(userLevelFilters[0].ANALYTICS_GROUPS_ID));
            dashboardName = `${userLevelFilters[0].ANALYTICS_GROUP_LEVEL_NAME} LEVEL DASHBOARD`;
            if (userLevelFilters[0].ANALYTICS_GROUP_LEVEL !== 'ALL') {
                uL = userLevelFilters[0].ANALYTICS_GROUP_LEVEL;
                uLName = userLevelFilters[0].ANALYTICS_GROUP_LEVEL_NAME;
                userLevelFilterString += ` AND ${userLevelFilters[0].ANALYTICS_GROUP_LEVEL} IN (`;
                userLevelFilterStringForId += ` AND ${userLevelFilters[0].ANALYTICS_GROUP_LEVEL_ID} IN (`;
                for (var i = 0; i < userLevelFilters.length; i++) {
                    if (i == 0) {
                        userLevelFilterString += `'${userLevelFilters[i][`${userLevelFilters[0].ANALYTICS_GROUP_LEVEL}`]}'`;
                        userLevelFilterStringForId += `'${userLevelFilters[i][`${userLevelFilters[0].ANALYTICS_GROUP_LEVEL_ID}`]}'`;
                    } else {
                        userLevelFilterString += `,'${userLevelFilters[i][`${userLevelFilters[0].ANALYTICS_GROUP_LEVEL}`]}'`;
                        userLevelFilterStringForId += `,'${userLevelFilters[i][`${userLevelFilters[0].ANALYTICS_GROUP_LEVEL_ID}`]}'`;
                    }
                }
                userLevelFilterString += `)`;
                userLevelFilterStringForId += `)`;
            }
            document.getElementById('dashboardTitle').textContent = `${userLevelFilters[0].ANALYTICS_GROUP_LEVEL_NAME} DASHBOARD `;

            populateVerticals(data.verticals);
            populateYears(data.years);
            populateChartTypes(data.chartTypes);
            populateAllTables(data.tables);
            populateWidgetTypes(data.widgetTypes);
            loadAllGrids(data.grids);
            loadAllPages(data.pages);

        } else {
            Swal.fire({
                title: "You are not authorized to view analytics. Please contact your system administrator",
                icon: "error",
                timer: 2000,
                showConfirmButton: false,
            });
        }
    }).always(function() {
        loader.style.display = 'none';
    });
}

function populateChartTypes(data) {
    document.getElementById('chartType').innerHTML = ``;
    var chartOptions = ``;
    chartOptions += `<option value="0">Select Chart</option>`;
    data.forEach(chart => {
        chartOptions += `<option value="${chart.CHART_ID}">${chart.CHART_NAME}</option>`;
    });
    document.getElementById('chartType').innerHTML = chartOptions;
}

function populateWidgetTypes(data) {
    document.getElementById('widgetType').innerHTML = ``;
    var chartOptions = ``;
    chartOptions += `<option value="0">Select Widget</option>`;
    data.forEach(chart => {
        chartOptions += `<option value="${chart.WIDGET_ID}">${chart.WIDGET_NAME}</option>`;
    });
    document.getElementById('widgetType').innerHTML = chartOptions;
}

function toggleChartWidgetForForm(a) {
    if (a === '1') {
        $('#chartTypeSelector').css('display', 'block')
        $('#widgetTypeSelector').css('display', 'none')
    } else if ($('#objectType').val() === '2') {
        $('#chartTypeSelector').css('display', 'none')
        $('#widgetTypeSelector').css('display', 'block')
    }
}

function toggleChartWidget(userObjectId, divId, page) {
    const objectTypeValue = $('#objectType').val();

    if (userObjectId !== 0) {
        const APIName = (objectTypeValue === '1') ? 'deleteWidget' : 'deleteChart';
        const jsonObj = { userObjectId };

        Swal.fire({
            title: `Do you want to save the changes? - ${APIName}`,
            showDenyButton: true,
            confirmButtonText: 'Save',
            denyButtonText: `Don't save`
        }).then((result) => {
            if (result.isConfirmed) {
                saveChanges(APIName, jsonObj, divId, page);
            } else if (result.isDenied) {
                handleDeniedChanges(objectTypeValue, divId, page);
            }
        });
    } else {
        handleObjectTypeDisplay(objectTypeValue);
    }
}

function saveChanges(APIName, jsonObj, divId, page) {
    $.ajax({
        url: `/index/${APIName}`,
        method: 'POST',
        timeout: 0,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(jsonObj),
    }).done(function (data) {
        if (data.status === 200) {
            handleSuccessChanges(divId, page);
        } else {
            Swal.fire('Changes are not saved', '', 'info');
        }
    });
}

function handleDeniedChanges(objectTypeValue, divId, page) {
    $('#objectType').removeAttr('onchange');

    if (objectTypeValue === '1') {
        $('#objectType').val('2').trigger('change');
        editWidgetOptions(0, divId, page);
    } else {
        $('#objectType').val('1').trigger('change');
        editChartOptions(0, divId, page);
    }

    Swal.fire('Changes are not saved', '', 'info');
}

function handleObjectTypeDisplay(objectTypeValue) {
    const chartTypeSelector = $('#chartTypeSelector');
    const widgetTypeSelector = $('#widgetTypeSelector');

    if (objectTypeValue === '1') {
        chartTypeSelector.css('display', 'block');
        widgetTypeSelector.css('display', 'none');
    } else if (objectTypeValue === '2') {
        chartTypeSelector.css('display', 'none');
        widgetTypeSelector.css('display', 'block');
    }
}

function handleSuccessChanges(divId, page) {
    const objectTypeValue = $('#objectType').val();

    if (objectTypeValue === '1') {
        editChartOptions(0, divId, page);
    } else if (objectTypeValue === '2') {
        editWidgetOptions(0, divId, page);
    }

    resolveLoadPageGrid()
        .then(() => changeView())
        .catch(error => console.error('Error:', error));

    Swal.fire('Saved!', '', 'success');
}



function populateAllTables(data) {
    document.getElementById('tableDropdown').innerHTML = ``;
    var tableOptions = ``;
    tableOptions += `<option value="0">Select Table</option>`;
    data.forEach(table => {
        tableOptions += `<option value="${table.TABLE_NAME}">${table.USABLE_NAME}</option>`;
    });
    document.getElementById('tableDropdown').innerHTML = tableOptions;
}
function getTableColumns(table) {
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["table"] = table
        $.ajax({
            "url": `/index/getTableColumnsAPI`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            if (data.length > 0) {
                document.getElementById('columns').innerHTML = ``
                var columnOptions = ``
                data.forEach(column => {
                    columnOptions += `<option value="${column.COLUMN_NAME}">${column.USABLE_NAME}</option>`
                })
                document.getElementById('columns').innerHTML = columnOptions
            }
            resolve(data); // Resolve the Promise with the data
        })
            .fail(function (error) {
                reject(error); // Reject the Promise if there's an error
            });
    });

}

function getActMaxColumns(table) {
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["table"] = table
        $.ajax({
            "url": `/index/getTableColumnsAPI`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            if (data.length > 0) {
                document.getElementById('actValColumn').innerHTML = ``
                document.getElementById('maxValColumn').innerHTML = ``
                var columnOptions = ``
                data.forEach(column => {
                    columnOptions += `<option value="${column.COLUMN_NAME}">${column.USABLE_NAME}</option>`
                })
                document.getElementById('actValColumn').innerHTML = columnOptions
                document.getElementById('maxValColumn').innerHTML = columnOptions
            }
            resolve(data); // Resolve the Promise with the data
        })
            .fail(function (error) {
                reject(error); // Reject the Promise if there's an error
            });
    });
}


function getTableGroupByColumns(table) {
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["table"] = table
        $.ajax({
            "url": `/index/getTableGroupByColumnsAPI`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            if (data.length > 0) {
                document.getElementById('groupBy').innerHTML = ``
                var columnOptions = ``
                columnOptions += `<option value="0">Select Column</option>`
                data.forEach(column => {
                    columnOptions += `<option value="${column.COLUMN_NAME}">${column.USABLE_NAME}</option>`
                })
                document.getElementById('groupBy').innerHTML = columnOptions
                var groupByValuesElement = document.getElementById('groupByValues');
                if (groupByValuesElement) {
                    groupByValuesElement.innerHTML = '';
                }
            }
            resolve(data); // Resolve the Promise with the data
        })
            .fail(function (error) {
                reject(error); // Reject the Promise if there's an error
            });
    });

}

function getGroupByValues(column) {
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["column"] = column
        jsonObj["table"] = $('#tableDropdown').val()
        $.ajax({
            "url": `/index/getGroupByValuesAPI`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            document.getElementById('groupByValues').innerHTML = ``
            var valueOptions = ``
            data.forEach(item => {
                valueOptions += `<option value="${item[`${column}`]}">${item[`${column}`]}</option>`
            })
            document.getElementById('groupByValues').innerHTML = valueOptions
            resolve(data); // Resolve the Promise with the data
        })
            .fail(function (error) {
                reject(error); // Reject the Promise if there's an error
            });
    });

}

function loadAllGrids(data) {
    var gridContainer = document.getElementById('grid-container');
    data.forEach(item => {
        console.log(item);
        var radioBtn = document.createElement('input');
        radioBtn.type = 'radio';
        radioBtn.name = 'gridRadio'; // Use the same name for all radio buttons to make them exclusive
        radioBtn.value = item.GRID_ID;
        radioBtn.id = 'grid' + "-" + item.TILE_COUNT + "-" + item.GRID_ID
        // radioBtn.style.position = 'absolute';
        // radioBtn.style.left = '-9999px'; // Position off-screen

        // Create label to wrap both radio button and HTML content
        var label = document.createElement('label');
        label.className = 'grid-box';
        label.setAttribute('for', radioBtn.id); // Set the "for" attribute to associate with the radio button
        label.appendChild(radioBtn);

        // Modify the HTML string to include a curved border
        var html = modifyHtmlString(item.GRID_HTML, '10vh', true);
        label.innerHTML += html;

        // Append label to the container
        gridContainer.appendChild(label);

    });
}

function loadAllPages(data) {
    document.getElementById('myTabs').innerHTML = ``;
    document.getElementById('tabContents').innerHTML = ``;
    var tabHTML = ``;
    var contentHTML = ``;
    console.log(data);
    var i = 0;
    data.forEach(page => {
        var pageId = page.PAGE_NAME.replace(/\s/g, '');
        if (i == 0) {
            tabHTML += `<li class="nav-item">
        <a class="nav-link active" id="tab${i + 1}" onclick="resolveLoadPageGrid('${page.PAGE_NAME}')" data-toggle="tab" href="#${pageId}">
          <div class="tab-title-container">
            <span class="tab-title">${page.PAGE_NAME}</span>
            <button class="edit edit-tab-button" name="editModalButton" title="Change Grid" id="${pageId}editButton" onclick="openEditModal('tab${i + 1}', ${page.GRID_ID})"><i class="fa-solid fa-table-cells-large fa-sm"></i></button>
            <button class="close close-tab-button" name="removeTabButton" onclick="confirmRemoveTab('tab${i + 1}','${pageId}')">&times;</button>
          </div>
        </a>
      </li>`;
            contentHTML += `<div id="${pageId}" name="pageContent" class="tab-pane fade show active">
      <p>Content for ${page.PAGE_NAME}</p>
    </div>`;
        } else {
            tabHTML += `<li class="nav-item">
        <a class="nav-link" id="tab${i + 1}" onclick="resolveLoadPageGrid('${page.PAGE_NAME}')" data-toggle="tab" href="#${pageId}">
          <div class="tab-title-container">
            <span class="tab-title">${page.PAGE_NAME}</span>
            <button class="edit edit-tab-button" name="editModalButton" id="${pageId}editButton" onclick="openEditModal('tab${i + 1}', ${page.GRID_ID})"><i class="fa-solid fa-table-cells-large fa-sm"></i></button>
            <button class="close close-tab-button" name="removeTabButton" onclick="confirmRemoveTab('tab${i + 1}','${pageId}')">&times;</button>
          </div>
        </a>
      </li>`;
            contentHTML += `<div id="${pageId}" name="pageContent" class="tab-pane fade">
      <p>Content for ${page.PAGE_NAME}</p>
    </div>`;
        }
        i += 1;
    });

    tabHTML += ``;
    document.getElementById('myTabs').innerHTML = tabHTML;

    resolveLoadPageGrid(data[0].PAGE_NAME)
        .then(() => {
            // Now that resolveLoadPageGrid is complete, execute setUserView
            setUserView();
        })
        .catch(function (error) {
            console.error('Error:', error);
        });
}

function changeView() {
    if (mode === 'edit') {
        $('[id^="editChart"].position-absolute').css('visibility', 'hidden');
        $('#addPageButton').css('visibility', 'hidden');
        $('[name="editModalButton"]').css('visibility', 'hidden');
        $('[name="removeTabButton"]').css('display', 'none');
        //$('#chooseFilterColumsButton').css('display', 'block');
        $('#chooseFiltersButton').css('display', 'none');
        $('#editChartFormCard').html('')
        var filterColumnsHTML = `<div class="card-header">
        Choose Filter Columns
      </div>
      <div class="card-body" id="filterColumnList" style="height: 76vh;overflow: auto;margin-left:1vw">
      
  
      
      </div>
      <div class="card-footer">
        <div class="form-row">
          <div class="form-group col-md-12" style="margin-top: 1vh;">
            <button type="button" class="btn btn-primary" id="setFilterColumnButton">Submit</button>
            <button type="button" class="btn btn-danger" style="float: right;" id="resetFilterColumnButton">Reset</button>
          </div>
        </div>
      </div>`
        $('#editChartFormCard').html(filterColumnsHTML)
        //getChartFilters(page)
        var page = $('.nav-link.active').children().children().text().slice(0, -1)
        $('#chooseFilterColumsButton').click(function () {
            var slider = document.getElementById('editChartSlider');
            slider.classList.add('open');
            getFilterColumns(dashboardName)
        })
        $('#chooseFiltersButton').click(function () {
            $('#filterSlider').css('left', '0');
        })
        //getChartFilters(dashboardName)
        mode = 'view'
    } else {
        $('[id^="editChart"].position-absolute').css('visibility', 'visible');
        $('#addPageButton').css('visibility', 'visible');
        $('[name="editModalButton"]').css('visibility', 'visible');
        $('[name="removeTabButton"]').css('display', 'block');
        $('#chooseFilterColumsButton').css('display', 'none');
        $('#chooseFiltersButton').css('display', 'none');
        $('#editChartFormCard').html('')
        var html = `<div class="card-header">
        Edit Chart
      </div>
      <div class="card-body" style="height: 76vh;overflow-x: hidden;">
        <form>
          <div class="form-row">
            <div class="form-group col-md-12">
              <label for="pageName">Page Name</label>
              <input type="text" class="form-control" id="pageName" placeholder="Enter Page Name" disabled>
            </div>
          </div>
    
          <div class="form-row">
            <div class="form-group col-md-12">
              <label for="chartTitle">Title</label>
              <input type="text" class="form-control" id="chartTitle" placeholder="Enter Chart Title" required>
            </div>
          </div>

          <div class="form-row">
                <div class="form-group col-md-12">
                  <label for="objectType">Object Type</label>
                  <select class="form-control select2" id="objectType">
                    <option value="1">Chart</option>
                    <option value="2">Widget</option>
                    <!-- Add more options as needed -->
                  </select>
                </div>
              </div>
    
          <div class="form-row" id="chartTypeSelector">
            <div class="form-group col-md-12">
              <label for="chartType">Chart Type</label>
              <select class="form-control select2" id="chartType">
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                <!-- Add more options as needed -->
              </select>
            </div>
          </div>

          <div class="form-row" id="widgetTypeSelector">
                <div class="form-group col-md-12">
                  <label for="widgetType">Widget Type</label>
                  <select class="form-control select2" id="widgetType">
                  <option value="bar">Bar Chart</option>
                  </select>
                </div>
              </div>

          <div class="form-row">
            <div class="form-group col-md-12">
              <label for="colorSelector">Choose Colors</label>
<select class="form-control select2" id="colorSelector" name="selectedColor"  onchange="changeColorDiv(this.value),disableSelect(this.id)">
<option value=""></option>
</select>
            </div>
          </div>
          <div class="form-row">
          <div class="form-group col-md-12">
            <label for="colorSelector">Custom Colors</label>
<select class="form-control" id="colorSelect" name="Color" onchange="disableSelect(this.id)">
</select>
          </div>
        </div>
        <div id="colorContainer"></div>
    
          <div class="form-row">
            <div class="form-group col-md-12">
              <label for="tableDropdown">Table</label>
              <select class="form-control select2" id="tableDropdown" onchange="getTableColumns(this.value);getTableGroupByColumns(this.value)">
                <!-- Add options for tables -->
              </select>
            </div>
          </div>
    
          <!-- <div class="form-row">
            <div class="form-group col-md-12">
              <label for="colorScheme">Color Scheme</label>
              <select class="form-control" id="colorScheme">
                <option value="['#E63946', '#A8DADC', '#457B9D', '#fb8500', '#ffb703', '#b5179e']">
                  
                  <div class="horizontal-bar" style="background-color: #f0f0f0;">
                    <div class="color-rectangle" style="background-color: #E63946;"></div>
                    <div class="color-rectangle" style="background-color: #A8DADC;"></div>
                    <div class="color-rectangle" style="background-color: #457B9D;"></div>
                    <div class="color-rectangle" style="background-color: #fb8500;"></div>
                    <div class="color-rectangle" style="background-color: #ffb703;"></div>
                    <div class="color-rectangle" style="background-color: #b5179e;"></div>
                  </div>
                </option>
                <option value="green">Green</option>
                <option value="red">Red</option>
                
              </select>
            </div>
          </div> -->
          <div id="editChartWiseForm">
          </div>
    
          
        </form>
      </div>
      <div class="card-footer">
        <div class="form-row">
          <div class="form-group col-md-12" style="margin-top: 1vh;">
            <button type="button" class="btn btn-primary" id="submitChartButton">Submit</button>
            <button type="button" class="btn btn-danger" style="float: right;" id="deleteChartButton">Delete Chart</button>
          </div>
        </div>
      </div>`
        $('#editChartFormCard').html(html)
        setTimeout(() => {
            loadChartTypes()
            loadWidgetTypes()
            loadAllTables()
            generateColorPalette()
            generateCustomColors()
            //toggleChartWidget()
        }, 1000);
        $('.select2').select2({
        });
        mode = 'edit'

    }
}


function resolveLoadPageGrid() {
    return loadPageGrid()
        .then(data => {
           // alert("runn")
            console.log(data);
            var slider = document.getElementById('editChartSlider');
            slider.classList.remove('open');
            mode = 'edit'
            //$('#tabContents').html('')
            //$('#tabContents').html(data[0].GRID_HTML)
//
            //if (i === 6) {
            //    content += `
            //        <a href="javascript:void(0);" onclick="openExpandedGrid()" style="text-decoration: none; color: black;">Details -></a>
            //    `;
            //}
            
            changeView()
            return loadSetCharts(data[0].TILE_COUNT);

        })
        .then(chartsData => {
            const [charts, tileCount, dashboardName, divArray] = chartsData;
            return loadSetWidgets(tileCount, divArray);
        })
        .catch(function (error) {
            console.error('Error:', error);
        });
}

// Function to open the expanded grid (Grid-8)
function openExpandedGrid() {
    // Hide Grid-7 and show Grid-8
    document.querySelector('#laningpage').style.display = 'none';
   
    document.querySelector('#incidentpage').style.display = 'block';

}

// Function to go back to Grid-7
function goBackToGrid7() {
    // Show Grid-7 and hide Grid-8
    document.querySelector('#laningpage').style.display = 'block';

    document.querySelector('#incidentpage').style.display = 'none';
}

function openAutomationGrid() {
    // Hide Grid-7 and show Grid-8
    document.querySelector('#laningpage').style.display = 'none';
   
    document.querySelector('#automationPage').style.display = 'block';

}

function goBackToGrid8() {
    // Show Grid-7 and hide Grid-8
    document.querySelector('#laningpage').style.display = 'block';

    document.querySelector('#automationPage').style.display = 'none';
}

function openOnrollPage(){
       // Hide Grid-7 and show Grid-8
       document.querySelector('#laningpage').style.display = 'none';
   
   document.querySelector('#onrollPage').style.display = 'block';
}

function goBackToGrid9() {
    // Show Grid-7 and hide Grid-8
    document.querySelector('#laningpage').style.display = 'block';

    document.querySelector('#onrollPage').style.display = 'none';
}


function visitorPage(){
       // Hide Grid-7 and show Grid-8
       document.querySelector('#laningpage').style.display = 'none';
   
   document.querySelector('#visitorPage').style.display = 'block';
}

function goBackToGrid10() {
    // Show Grid-7 and hide Grid-8
    document.querySelector('#laningpage').style.display = 'block';

    document.querySelector('#visitorPage').style.display = 'none';
}



function setUserView() {
    const myUrl = new URL(window.location.toLocaleString()).searchParams;
    var userId = myUrl.get('uid')
    var jsonObj = {}
    jsonObj["userId"] = userId
    $.ajax({
        "url": `/index/getUserLevel`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {

        var level = data[0].RCODE
        if (level !== 'SYA') {
            mode = 'edit'
            changeView()
            // document.getElementById("toggleSwitch").setAttribute('disabled', 'true')
            document.getElementById("switch-mode-button").style.display = 'none';

        }
    })


}


function getFilterColumns(page) {
    var jsonObj = {}
    jsonObj["page"] = page
    jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
    $.ajax({
        "url": `/index/getFilterColumnsAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        console.log(data);
        var columnHTML = ``
        $('#filterColumnList').html('')
        var columns = data.columnList
        if (columns.length > 0) {
            for (var i = 0; i < columns.length; i++) {
                columnHTML += `<div class="custom-checkbox">
                <input type="checkbox" id="column${columns[i].COLUMN_NAME}" name="filterColumns" value="${columns[i].COLUMN_NAME}">
                <label for="column${columns[i].COLUMN_NAME}">${columns[i].USABLE_NAME}</label>
              </div>`
            }
            $('#filterColumnList').html(columnHTML)
            $('#setFilterColumnButton').click(function () {
                var slider = document.getElementById('editChartSlider');
                slider.classList.remove('open');
                $('#filterSlider').css('left', '0');
                getChartFilters(page)
            })
        }

    })
}

function getChartFilters(page) {
    const checkboxes = document.querySelectorAll('input[name="filterColumns"]:checked');
    var selectedValues = []
    var selectedValuesNames = []
    var jsonObj = {}
    jsonObj["page"] = page
    jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
    jsonObj["columnArray"] = selectedValues
    jsonObj["columnArrayName"] = selectedValuesNames
    jsonObj["filterString"] = filterString
    $.ajax({
        "url": `/index/getChartFiltersAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        console.log(data);
        var dateColumn
        if (data.table === 'OL_INCIDENTS') {
            dateColumn = 'OCCUREDDATE'
            selectedValues.unshift('OCCUREDDATE')
            selectedValuesNames.unshift('OCCURED DATE')
        } else {
            dateColumn = 'DSRDATE'
            selectedValues.unshift('DSRDATE')
            selectedValuesNames.unshift('DSRDATE')
        }

        selectedValues.unshift('MONTHNAME')
        selectedValues.unshift('QUARTER')
        selectedValues.unshift('YEAR')
        selectedValuesNames.unshift('MONTH NAME')
        selectedValuesNames.unshift('QUARTER')
        selectedValuesNames.unshift('YEAR')
        var filterOptionList = []
        for (var i = 0; i < selectedValues.length; i++) {
            var filterOptionJson = {}
            filterOptionJson["COLUMN"] = selectedValues[i]
            filterOptionJson["COLUMNNAME"] = selectedValuesNames[i]
            filterOptionList.push(filterOptionJson)
        }
        var filterHTML = ``
        $('#filterList').html('')
        filterOptionList.forEach(column => {

            if (column.COLUMN == 'MONTH NAME' || column.COLUMN == 'QUARTER') {
                filterHTML += `<div class="card custom-card" style="display: none;" id="${column.COLUMN}Filter">`
            } else if (column.COLUMN == dateColumn) {
                filterHTML += `<div class="card custom-card" style="display: none;" id="DATEFilter">`
            } else {
                filterHTML += `<div class="card custom-card" id="${column.COLUMN}Filter">`
            }
            filterHTML += `<div class="card-header">
              ${column.COLUMNNAME}
            </div>
            <div class="card-body" id="filterBody${column.COLUMN}" style="max-height:20vh;overflow:auto;min-height:fit-content" name=${column.COLUMN}>`

            filterHTML += `
            </div>
          </div>`
        });
        $('#filterList').html(filterHTML)
        setFilters(page)
    })

}

function setFilters(page) {
    const checkboxes = document.querySelectorAll('input[name="filterColumns"]:checked');
    var selectedValues = []
    var selectedValuesNames = []
    var jsonObj = {}
    jsonObj["page"] = page
    jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
    jsonObj["columnArray"] = selectedValues
    jsonObj["columnArrayName"] = selectedValuesNames
    jsonObj["filterString"] = ''
    $.ajax({
        "url": `/index/getChartFiltersAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        console.log(data);
        if (data.table === 'OL_INCIDENTS') {
            selectedValues.unshift('OCCUREDDATE')
            selectedValuesNames.unshift('OCCURED DATE')
        } else {
            selectedValues.unshift('DSRDATE')
            selectedValuesNames.unshift('DSRDATE')
        }
        selectedValues.unshift('MONTHNAME')
        selectedValues.unshift('QUARTER')
        selectedValues.unshift('YEAR')
        selectedValuesNames.unshift('MONTH NAME')
        selectedValuesNames.unshift('QUARTER')
        selectedValuesNames.unshift('YEAR')
        var filterOptionList = []
        for (var i = 0; i < selectedValues.length; i++) {
            var filterOptionJson = {}
            filterOptionJson["COLUMN"] = selectedValues[i]
            var values = []
            for (var j = 0; j < data.valueList.length; j++) {
                if (data.valueList[j].COLUMN_NAME === selectedValues[i]) {
                    values.push(data.valueList[j].VALUE)
                }
            }
            filterOptionJson["values"] = values
            filterOptionList.push(filterOptionJson)
        }
        filterOptionList.forEach(column => {
            var filterHTML = ``
            $(`#filterBody${column.COLUMN}`).html('')
            column.values.forEach(value => {
                var onclickFunctions = ``
                if (column.COLUMN === 'YEAR') {
                    onclickFunctions = `getMonths('${column.COLUMN}','${value}')`
                } else if (column.COLUMN === 'MONTHNAME') {
                    onclickFunctions = `getSelectFilters('${selectedValues}','${selectedValuesNames}','${page}')`

                }
                // ... (previous code remains unchanged)

                // Update the filterHTML generation part
                filterHTML += `<div class="custom-radio">
<input type="radio" id="value${column.COLUMN}${value}" name="${column.COLUMN}ChartFilter" value="${value}" onclick="${onclickFunctions}">
<label for="value${column.COLUMN}${value}">${value}</label>
</div>`;
                // ... (rest of the code remains unchanged)

            })
            $(`#filterBody${column.COLUMN}`).html(filterHTML)
        })

        for (var i = 0; i < filterArray.length; i++) {
            var checkboxes = document.querySelectorAll(`input[name="${filterArray[i]["column"]}ChartFilter"]`)
            for (const checkbox of checkboxes) {
                for (var j = 0; filterArray[i]["values"].length; j++) {
                    if (filterArray[i]["values"][j] === checkbox.value) {
                        checkbox.checked = true
                        break
                    }
                }

            }

        }

    })
}

function getMonths(column, value) {
    var monthCardDisplay = false
    const checkboxes = document.querySelectorAll(`input[name="${column}ChartFilter"]`);
    for (const checkbox of checkboxes) {
        if (checkbox.checked) {
            $('#MONTHNAMEFilter').css('display', 'block')
            monthCardDisplay = true
            return;
        }
    }
    if (!monthCardDisplay) {
        $('#MONTHNAMEFilter').css('display', 'none')
    }
}

function getQuarters(column, value) {
    var monthCardDisplay = false
    const checkboxes = document.querySelectorAll(`input[name="${column}ChartFilter"]`);
    for (const checkbox of checkboxes) {
        if (checkbox.checked) {
            $('#QUARTERFilter').css('display', 'block')
            monthCardDisplay = true
            return;
        }
    }
    if (!monthCardDisplay) {
        $('#QUARTERFilter').css('display', 'none')
    }
}

function getDates(column, value) {
    var monthCardDisplay = false
    const checkboxes = document.querySelectorAll(`input[name="${column}ChartFilter"]`);
    for (const checkbox of checkboxes) {
        if (checkbox.checked) {
            $(`#DATEFilter`).css('display', 'block')
            monthCardDisplay = true
            return;
        }
    }
    if (!monthCardDisplay) {
        $(`#DATEFilter`).css('display', 'none')
    }
};

function getSelectFilters(columns, columnNames, page) {
    var columnArray = columns.split(',').map(value => String(value));
    var columnArrayNames = columnNames.split(',').map(value => String(value));
    filterArray = []
    for (var i = 0; i < columnArray.length; i++) {
        var filterJson = {}
        filterJson["column"] = columnArray[i]
        filterJson["columnName"] = columnArrayNames[i]
        var checkboxes = document.querySelectorAll(`input[name="${columnArray[i]}ChartFilter"]`)
        var selected = []
        for (const checkbox of checkboxes) {
            if (checkbox.checked) {
                selected.push(checkbox.value)
            }
        }
        filterJson["values"] = selected
        filterArray.push(filterJson)
    }

    console.log(filterArray);
    filterString = userLevelFilterString + ``
    filterStringForId = userLevelFilterStringForId + ``
    let filterHtml = '';
    for (var i = 0; i < filterArray.length; i++) {
        if (filterArray[i]["values"].length > 0) {
            filterString += `AND ${filterArray[i]["column"]} IN (`
            filterHtml += `<div class="filter">
                            <strong>${filterArray[i]["columnName"]} : </strong>
                            <small>${filterArray[i]["values"].join(', ')}</small>
                        </div>`;
            for (let j = 0; j < filterArray[i]["values"].length; j++) {
                if (j == 0) {
                    filterString += `'${filterArray[i]["values"][j]}'`
                } else {
                    filterString += `,'${filterArray[i]["values"][j]}'`
                }

            }
            filterString += `) `
        }
    }
    const filterDiv = document.getElementById('filterDiv');
    filterDiv.innerHTML = filterHtml;
    console.log(filterString);
    console.log(page);
    resolveLoadPageGrid(page)
    //setFilters(page)

}

function addNewTabFromModal() {
    var newTabTitle = $("#newTabTitle").val();
    if (newTabTitle.trim() !== "") {
        var jsonObj = {}
        jsonObj["page"] = newTabTitle.trim().toUpperCase()
        jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
        $.ajax({
            "url": `/index/addNewPage`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            if (data.status == 200) {
                newTabTitle = newTabTitle.trim().toUpperCase()
                var pageId = newTabTitle.trim().toUpperCase().replace(/\s/g, '');
                // Find the maximum index currently present in the tab array
                var maxIndex = 0;
                $(".nav-tabs li").each(function () {
                    var tabIndex = parseInt($(this).find('a').attr('id').replace('tab', ''), 10);
                    maxIndex = Math.max(maxIndex, tabIndex);
                });

                var newTabIndex = maxIndex + 1;
                var newTabId = "tab" + newTabIndex;
                var newContentId = pageId;
                var newTabContent = "<div id='" + newContentId + "' name='pageContent' class='tab-pane fade'></div>";

                var newTab = $("<li class='nav-item'>" +
                    "<a class='nav-link' id='" + newTabId + "' onclick='resolveLoadPageGrid(" + newTabTitle + ")'" + "data-toggle='tab' href='#" + newContentId + "'>" +
                    "<div class='tab-title-container'>" +
                    "<span class='tab-title'>" + newTabTitle + "</span>" +
                    "<button class='edit edit-tab-button' id=" + newContentId + "editButton\" onclick='openEditModal(\"" + newTabId + "\",1)''><i class='fa-regular fa-pen-to-square fa-sm'></i></button>" +
                    "<button class='close close-tab-button' onclick='confirmRemoveTab(\'" + newTabId + "\',\'" + pageId + "\')'>&times;</button>" +
                    "</div>" +
                    "</a>" +
                    "</li>");

                $(".nav-tabs").append(newTab);
                $(".tab-content").append(newTabContent);

                // Activate the newly added tab
                $("#" + newTabId).tab("show");

                // Close the modal
                $("#addTabModal").modal("hide");

                // Clear the input field
                $("#newTabTitle").val("");
                resolveLoadPageGrid(jsonObj.page)
            } else {
                Swal.fire({
                    title: "Page already exists",
                    icon: "warning"
                });
            }
            $("#newTabTitle").val('')

        })
    }
}
function loadPageGrid() {
    return new Promise((resolve, reject) => {

        var jsonObj = {}
        jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
        $.ajax({
            "url": `/index/loadPageGridDaily`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            $('#tabContents').html('')
            $('#tabContents').html(data[0].GRID_HTML)

            for (var i = 0; i < data[0].TILE_COUNT; i++) {
                document.getElementById(`editChart${i + 1}`).innerHTML = `<button type="button" class="btn btn-light" id="editChartButton${i + 1}">
                <i class="fas fa-edit"></i>
              </button>`
            }
           // if (i === 6) {
             //   content += `
               //     <a href="javascript:void(0);" onclick="openExpandedGrid()" style="text-decoration: none; color: black;>Details -></a>
                //`;
           // }
            
            resolve(data); // Resolve the Promise with the data
        })
            .fail(function (error) {
                reject(error); // Reject the Promise if there's an error
            });
    });
}




function confirmRemoveTab(tabId, pageId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            removeTab(tabId)
                .then(data => {
                    if (data[0].status == 200) {
                        var tabContentId = $("#" + tabId).attr("href").substring(1); // Extract the content ID
                        //console.log(tabContentId, "tabContentId");
                        var tabContainer = $("#" + tabId).parent();
                        //console.log(tabContainer, "tabcontainer");

                        // Get the index of the tab to be deleted
                        var tabIndex = tabContainer.index();


                        // Remove the tab from the tab bar and the corresponding content
                        tabContainer.remove();
                        $("#" + tabContentId).remove();
                        // If there are remaining tabs, activate the appropriate tab content
                        if ($(".nav-tabs li").length > 0) {
                            var newActiveTab;
                            newActiveTab = $(".nav-tabs li")[($(".nav-tabs li").length) - 1].children[0];
                            //newActiveTab.classList.add('active')
                            //$(newActiveTab.getAttribute('href')).show()
                            //resolveLoadPageGrid(newActiveTab.children[0].children[0].textContent)
                        }
                        Swal.fire(
                            'Deleted!',
                            'Your tab has been deleted.',
                            'success'
                        );
                    }

                })
                .catch(function (error) {
                    console.error('Error:', error);
                });

        }
    });
}

function removeTab(tabId) {
    return new Promise((resolve, reject) => {
        //console.log(document.getElementById(tabId).children[0].children[0].textContent);
        var jsonObj = {}
        jsonObj["page"] = document.getElementById(tabId).children[0].children[0].textContent.trim()
        $.ajax({
            "url": `/index/removeTab`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            resolve([data, tabId]); // Resolve the Promise with the data
        })
            .fail(function (error) {
                reject(error); // Reject the Promise if there's an error
            });
    });
}

function openEditModal(tabId, gridId) {
    var currentTitle = $("#" + tabId + " .tab-title").text();
    $("#gridModalLabel").text(currentTitle)
    setGridRadioChecked(gridId);
    $("#gridModal").modal("show");
    document.getElementById('selectGridButton').setAttribute('onclick', `saveGrid('${currentTitle}','${tabId}')`)
}

function saveGrid(page, tabId) {
    var radioButtons = document.getElementsByName('gridRadio');
    var gridId = 0
    // Loop through radio buttons to find the selected one
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            // Return the value of the selected radio button
            gridId = radioButtons[i].value;
        }
    }

    Swal.fire({
        title: 'Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, update it!'
    }).then((result) => {
        if (result.isConfirmed) {
            var jsonObj = {}
            jsonObj["page"] = page
            jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
            jsonObj["gridId"] = gridId
            $.ajax({
                "url": `/index/saveGrid`,
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Content-Type": "application/json"
                },
                "data": JSON.stringify(jsonObj),
            }).done(function (data) {
                if (data.status == 200) {
                    Swal.fire(
                        'Grid Updated!',
                        'Your grid has been updated.',
                        'success'
                    );
                    var pageId = page.replace(/\s/g, '');
                    console.log(pageId, tabId, gridId);
                    document.getElementById(`${pageId}editButton`).setAttribute('onclick', `openEditModal('${tabId}', ${gridId})`)
                    resolveLoadPageGrid(page)
                }
            })




        }

    })
}

function loadSetCharts(tileCount) {
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["page"] = dashboardName
        jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
        $.ajax({
            "url": `/index/loadSetCharts`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(async function (data) {
            var charts = data.charts
            var i
            var divArray = []
            for (i = 0; i < charts.length; i++) {
                await setChart(charts[i].USER_CHART_ID, charts[i].CHART_NAME, charts[i].TILE_DIV_ID)
                document.getElementById(`${charts[i].TILE_DIV_ID}`).children[0].children[0].setAttribute('onclick', `editChartOptions(${charts[i].USER_CHART_ID},'${charts[i].TILE_DIV_ID}','${dashboardName}')`)
                divArray.push(charts[i].TILE_DIV_ID)
            }

            resolve([data, tileCount, dashboardName, divArray]); // Resolve the Promise with the data
        })
            .fail(function (error) {
                reject(error); // Reject the Promise if there's an error
            });
    });
}

function loadSetWidgets(tileCount, divArray) {
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
        $.ajax({
            "url": `/index/loadSetWidgets`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(async function (data) {
            var widgets = data.widgets

            var i
            for (i = 0; i < widgets.length; i++) {
                await setWidget(widgets[i].D_OBJECT_ID, widgets[i].WIDGET_NAME, widgets[i].TILE_DIV_ID)
                document.getElementById(`${widgets[i].TILE_DIV_ID}`).children[0].children[0].setAttribute('onclick', `editWidgetOptions(${widgets[i].D_OBJECT_ID},'${widgets[i].TILE_DIV_ID}','${dashboardName}')`)
                divArray.push(widgets[i].TILE_DIV_ID)
            }

            for (var j = 0; j < tileCount; j++) {
                if (!divArray.includes(`new-card-${j + 1}`)) {
                    console.log(document.getElementById(`new-card-${j + 1}`).children[1])
                    document.getElementById(`new-card-${j + 1}`).children[0].children[0].setAttribute('onclick', `editWidgetOptions(0,'new-card-${j + 1}','${dashboardName}')`)
                }

            }
            if (mode === 'view') {
                $('[id^="editChart"].position-absolute').css('visibility', 'hidden');
            }
            resolve([data, tileCount, dashboardName]); // Resolve the Promise with the data
        })
            .fail(function (error) {
                reject(error); // Reject the Promise if there's an error
            });
    });
}


function editChartOptions(userChartId, divId, page) {
    document.getElementById('objectType').removeAttribute('onchange')
    $('#objectType').val('1').trigger('change')
    toggleChartWidgetForForm('1')
    document.getElementById('objectType').setAttribute('onchange', `toggleChartWidget(${userChartId},'${divId}','${page}')`)
    document.getElementById('editChartWiseForm').innerHTML = ``
    document.getElementById('chartTitle').value = ''
    $('#chartType').val(0).trigger('change')
    $('#tableDropdown').val(0).trigger('change')
    $('#colorSelector').val([]).trigger('change')
    var slider = document.getElementById('editChartSlider');
    slider.classList.add('open');
    $('#pageName').val(page)
    document.getElementById('submitChartButton').setAttribute('onclick', `submitChartButton(${userChartId},'${divId}')`)
    document.getElementById('deleteChartButton').setAttribute('onclick', `deleteChartButton(${userChartId},'${divId}')`)
    document.getElementById('deleteChartButton').removeAttribute('disabled')
    if (userChartId !== 0) {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        $.ajax({
            "url": `/index/getChartOptions`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            var chartOptionJson = JSON.parse(data[0].CHART_OPTIONS_JSON)
            document.getElementById('chartTitle').value = chartOptionJson["chartTitle"]
            $('#chartType').val(data[0].CHART_ID).trigger('change')
            createChartForm(data[0].CHART_ID, userChartId, divId)
            //document.getElementById('chartType').setAttribute('onchange', `createChartForm(this.value,${userChartId},'${divId}')`)
        })
    } else {
        document.getElementById('deleteChartButton').setAttribute('disabled', true)
    }
    document.getElementById('chartType').setAttribute('onchange', `createChartForm(this.value,${userChartId},'${divId}')`)
    document.getElementById('widgetType').setAttribute('onchange', `createWidgetForm(this.value,0,'${divId}')`)
}

function editWidgetOptions(userWidgetId, divId, page) {
    document.getElementById('objectType').removeAttribute('onchange')
    $('#objectType').val('2').trigger('change')
    toggleChartWidgetForForm('2')
    document.getElementById('objectType').setAttribute('onchange', `toggleChartWidget(${userWidgetId},'${divId}','${page}')`)
    document.getElementById('editChartWiseForm').innerHTML = ``
    document.getElementById('chartTitle').value = ''
    $('#widgetType').val(0).trigger('change')
    $('#tableDropdown').val(0).trigger('change')
    $('#colorSelector').val([]).trigger('change')
    var slider = document.getElementById('editChartSlider');
    slider.classList.add('open');
    $('#pageName').val(page)
    document.getElementById('submitChartButton').setAttribute('onclick', `submitChartButton(${userWidgetId},'${divId}')`)
    document.getElementById('deleteChartButton').setAttribute('onclick', `deleteChartButton(${userWidgetId},'${divId}')`)
    document.getElementById('deleteChartButton').removeAttribute('disabled')
    if (userWidgetId !== 0) {
        var jsonObj = {}
        jsonObj["userChartId"] = userWidgetId
        $.ajax({
            "url": `/index/getWidgetOptions`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            var chartOptionJson = JSON.parse(data[0].OBJECT_OPTIONS_JSON)
            document.getElementById('chartTitle').value = chartOptionJson["objectTitle"]
            $('#widgetType').val(data[0].OBJECT_ID).trigger('change')
            createWidgetForm(data[0].OBJECT_ID, userWidgetId, divId)

        })
    } else {
        document.getElementById('deleteChartButton').setAttribute('disabled', true)
    }
    document.getElementById('widgetType').setAttribute('onchange', `createWidgetForm(this.value,${userWidgetId},'${divId}')`)
    document.getElementById('chartType').setAttribute('onchange', `createChartForm(this.value,0,'${divId}')`)

}

function createDataQueries(userChartId, chartName, divId, page) {
    var jsonObj = {}
    jsonObj["userChartId"] = userChartId
    $.ajax({
        "url": `/index/createDataForCharty`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        setChart(userChartId, chartName, divId)
        document.getElementById(`${divId}`).children[0].children[0].removeAttribute('onclick')
        document.getElementById(`${divId}`).children[0].children[0].setAttribute('onclick', `editChartOptions(${userChartId},'${divId}','${page}')`)
    })
}

function createDataQueriesDataTrend(userChartId, chartName, divId, page) {
    var jsonObj = {}
    jsonObj["userChartId"] = userChartId
    $.ajax({
        "url": `/index/createDataForChartDataTrend`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        setChart(userChartId, chartName, divId)
        document.getElementById(`${divId}`).children[0].children[0].removeAttribute('onclick')
        document.getElementById(`${divId}`).children[0].children[0].setAttribute('onclick', `editChartOptions(${userChartId},'${divId}','${page}')`)
    })
}

function createDataPercentQueries(userChartId, chartName, divId, page) {
    var jsonObj = {}
    jsonObj["userChartId"] = userChartId
    $.ajax({
        "url": `/index/createDataForPercentChart`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        setChart(userChartId, chartName, divId)
        document.getElementById(`${divId}`).children[0].children[0].removeAttribute('onclick')
        document.getElementById(`${divId}`).children[0].children[0].setAttribute('onclick', `editChartOptions(${userChartId},'${divId}','${page}')`)
    })
}

function saveChartJson(userChartId, newChartJson) {
    var jsonObj = {}
    jsonObj["userChartId"] = userChartId
    jsonObj["chartJson"] = JSON.stringify(newChartJson)
    $.ajax({
        "url": `/index/saveChartJsonAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {

    })
}

// switch case function to set charts
function setChart(userChartId, chartName, divId) {
    return new Promise((resolve, reject) => {
        switch (chartName) {
            case 'Bar Chart':
                setBarChart(userChartId, divId)
                break;
            case 'Column Chart':
                setColumnChart(userChartId, divId)
                break;
            case 'Line Chart':
                setLineChart(userChartId, divId)
                break;
            case 'Donut Chart':
                setDonutChart(userChartId, divId)
                break
            case 'Area Chart':
                setAreaChart(userChartId, divId)
                break
            case 'Pie Chart':
                setPieChart(userChartId, divId)
                break
            case 'Half Radial Chart':
                setHalfRadialChart(userChartId, divId)
                break
            case 'Full Radial Chart':
                setFullRadialChart(userChartId, divId)
                break
            case 'Absolute Value Comparison':
                setAbsValComp(userChartId, divId)
                break
            case 'Absolute Value':
                setAbsVal(userChartId, divId)
                break
            case 'Stacked Column Chart':
                setColumnChart(userChartId, divId)
                break;
            case 'Data Trend Chart':
                setDataTrendChart(userChartId, divId)
                break;
            default:
                break;
        }
        resolve();
    });
}


// switch case function to set widget
function setWidget(userObjectId, widgetName, divId) {
    return new Promise((resolve, reject) => {
        switch (widgetName) {
            case 'PREVIOUS MONTH COMPARISON TABLE':
                setPrevMonthComp(userObjectId, divId, month, year)
                break;
            case 'AVG MAX MIN RANGE WIDGET':
                setAvgMaxMinRangeWidget(userObjectId, divId, month, year)
                break;
            case 'PERCENTAGE BARS WIDGET':
                setPercentBarsWidget(userObjectId, divId, month, year)
                break
            case 'INCIDENT DETAILS':
                setIncidentDetails(userObjectId, divId, month, year)
                break
            case 'DAILY DSR STATUS':
                    setDailyDSRStatus(userObjectId, divId, month, year)
                    break
            case 'INCIDENT MAP':
                setIncidentMap(userObjectId, divId, month, year)
            default:
                break;
        }
        resolve();
    });
}



function createWidgetForm(widgetId, userWidgetId, divId) {
    document.getElementById("colorSelector").disabled = false
    document.getElementById("colorSelect").disabled = false
    document.getElementById("tableDropdown").disabled = false
    $('#tableDropdown').val('0').trigger('change')
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["widgetId"] = widgetId
        $.ajax({
            "url": `/index/getWidgetFromId`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            console.log(data);
            switch (data[0]?.WIDGET_NAME) {
                case 'PREVIOUS MONTH COMPARISON TABLE':
                    createPrevMonthComp(userWidgetId)
                    break
                case 'AVG MAX MIN RANGE WIDGET':
                    createAvgMaxMinRangeWidget(userWidgetId)
                    break
                case 'PERCENTAGE BARS WIDGET':
                    createPercentBarsWidget(userWidgetId)
                    break
                case 'INCIDENT DETAILS':
                    createIncidentDetails(userWidgetId)
                    break
                    case 'DAILY DSR STATUS':
                        createDailyDSRStatus(userWidgetId)
                        break
                case 'INCIDENT MAP':
                    createIncidentMap(userWidgetId)
                    break
                default:
                    break;
            }
            resolve([data, userWidgetId]); // Resolve the Promise with the data
        })
            .fail(function (error) {
                reject(error); // Reject the Promise if there's an error
            });
    });
}

function createIncidentDetails(userWidgetId){
    document.getElementById('tableDropdown').removeAttribute('onchange')
    document.getElementById('editChartWiseForm').innerHTML = ``
    document.getElementById("colorSelector").disabled = true
    document.getElementById("colorSelect").disabled = true
    document.getElementById("tableDropdown").disabled = true
    $('#tableDropdown').val('OL_INCIDENTS').trigger('change')
}
function createDailyDSRStatus(userWidgetId){
    document.getElementById('tableDropdown').removeAttribute('onchange')
    document.getElementById('editChartWiseForm').innerHTML = ``
    document.getElementById("colorSelector").disabled = true
    document.getElementById("colorSelect").disabled = true
    document.getElementById("tableDropdown").disabled = true
    $('#tableDropdown').val('OL_DASHBOARD_DAILY_DSRSTATUS').trigger('change')
}



function saveIncidentDetails(userWidgetId, divId){
    var widgetName = $('#widgetType option:selected').text();
    var page = $('#pageName').val()
    var objectOptionJson = {}
    objectOptionJson["objectTitle"] = document.getElementById('chartTitle').value
    var jsonObj = {}
    jsonObj["userObjectId"] = userWidgetId
    jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
    jsonObj["objectId"] = $('#widgetType').val()
    jsonObj["objectOptionsJson"] = JSON.stringify(objectOptionJson)
    jsonObj["tableName"] = 'INCIDENTS'
    jsonObj["divId"] = divId
    jsonObj["objectType"] = $('#objectType').find('option:selected').text()
    console.log(jsonObj);
    
    $.ajax({
        "url": `/index/saveObjectJsonAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        setWidget(data["userObjectId"], widgetName, divId)
    })
}

function saveDailyDSRSTatus(userWidgetId, divId){
    var widgetName = $('#widgetType option:selected').text();
    var page = $('#pageName').val()
    var objectOptionJson = {}
    objectOptionJson["objectTitle"] = document.getElementById('chartTitle').value
    var jsonObj = {}
    jsonObj["userObjectId"] = userWidgetId
    jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
    jsonObj["objectId"] = $('#widgetType').val()
    jsonObj["objectOptionsJson"] = JSON.stringify(objectOptionJson)
    jsonObj["tableName"] = 'OL_DASHBOARD_DAILY_DSRSTATUS'
    jsonObj["divId"] = divId
    jsonObj["objectType"] = $('#objectType').find('option:selected').text()
    console.log(jsonObj);
    
    $.ajax({
        "url": `/index/saveObjectJsonAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        setWidget(data["userObjectId"], widgetName, divId)
    })
}



function setIncidentDetails(userWidgetId, divId, month, year) {
    return new Promise((resolve, reject) => {
        var jsonObj = {
            "userWidgetId": userWidgetId,
            "filterString": filterString,
            "filterStringForId" : filterStringForId,
            "month": month,
            "year": year
        };
        console.log(jsonObj);

        $.ajax({
            "url": `/index/getIncidentDetails`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            console.log(data);

            // Extract data from API response
            var widget = data.widget[0];  // Assuming there's only one widget
            var objectOptionsJson = JSON.parse(widget.OBJECT_OPTIONS_JSON);
            var result = data.result;  // List of incidents from the `result` array
            var divId = widget.TILE_DIV_ID;
            const parentDiv = document.getElementById(divId);
            const existingH6 = parentDiv.querySelector('h6');

            // Set widget title
            if (existingH6) {
                parentDiv.querySelector('h6').innerHTML = `${objectOptionsJson["objectTitle"]}`;
            } else {
                var widgetDivId = document.getElementById(divId).children[1].getAttribute('id');
                var headingElement = $('<h6>').attr('id', `${userWidgetId}siteMonth`);
                $(`#${widgetDivId}`).before(headingElement);
                $(`#${userWidgetId}siteMonth`).addClass('m-2').css('font-weight', 'bolder');
            }

            // Update widget HTML and set list for incidents
            $(widgetDivId).html('');
            var parentHeightInVh = document.getElementById(widgetDivId).offsetHeight;
            var widgetHTML = widget.WIDGET_HTML;
            document.getElementById(widgetDivId).innerHTML = widgetHTML;

            var list = document.getElementById('siteList');
            list.innerHTML = ``;
            document.getElementById(widgetDivId).children[0].setAttribute('style', `max-height:${parentHeightInVh}px;overflow:auto;width:100%`);
            
            // Set current and previous months
            // var prev = (month === '1') ? '12' : (Number(month) - 1).toString();
            // document.getElementById(`${userWidgetId}siteMonth`).innerHTML = `${objectOptionsJson["objectTitle"]}`;
            // document.getElementById('cmon').innerHTML = `${getMonth(month)}`;
            // document.getElementById('pmon').innerHTML = `${getMonth(prev)}`;

            // Loop through the incidents and display them
            for (var i = 0; i < result.length; i++) {
                var incident = result[i];  // Current incident

                // Extract necessary fields from the incident data
                var title = incident.INCIDENTTITLE;  // Incident title
                var occuredDate = incident.OCCUREDDATE;  // Incident title
                var business = incident.BUNAME;  // Incident title
                var site = incident.SINAME;  // Incident title
                var status = incident.STATUS || "No Status";  // Incident status
                var details = incident.INCIDENTDETAILS || "No details provided";  // Incident details
                var incidentId = incident.INCIDENTID || "N/A";  // Incident ID
                var current = Number(incident["INCIDENTCOUNT"] || 0);  // Default to 0 if not available

                // Set direction and color based on the count
                var dir = 'minus'; // Default to no change
                var color = 'warning'; // Default to neutral color
                 // Set the background color and label based on the status
                 var statusSpan = '';
                 if (status === 'OPEN') {
                     statusSpan = `<span style="background-color: green; color: white; padding: 4px 8px; border-radius: 4px;">${status}</span>`;
                 } else if (status === 'CLOSED') {
                     statusSpan = `<span style="background-color: red; color: white; padding: 4px 8px; border-radius: 4px;">${status}</span>`;
                 } else {
                     statusSpan = `<span style="background-color: grey; color: white; padding: 4px 8px; border-radius: 4px;">${status}</span>`;
                 }
 

                // Create the row for this incident
                list.innerHTML += `
                    <tr>
                        <td style="text-align:center;font-weight:bold;">
                            <span class="bg-info" style="border-radius:4px;color:white;font-size:25px">&nbsp;&nbsp;${i + 1}&nbsp;&nbsp;</span>
                        </td>
                        <td  style="text-align:center;width:7%">${incidentId}</td>
                        <td  style="text-align:center;width:7%">${occuredDate}</td>
                        <td style="text-align:center;width:7%">${statusSpan}</td>
                        <td style="text-align:center;width:7%">${business}</td>
                        <td style="text-align:center;width:7%">${site}</td>
                        <td style="text-align:left">${title}</td>
                        <td style="text-align:left">${details}</td>

                    </tr>
                `;
            }

            // Update the widget onclick event
            document.getElementById(divId).children[0].removeAttribute('onclick');
            document.getElementById(divId).children[0].setAttribute('onclick', `editWidgetOptions(${userWidgetId},'${divId}','${dashboardName}')`);

            resolve();
        }).fail(function (error) {
            reject(error);
        });
    });
}

function setDailyDSRStatus(userWidgetId, divId, month, year) {
    return new Promise((resolve, reject) => {
        var jsonObj = {
            "userWidgetId": userWidgetId,
            "filterString": filterString,
            "filterStringForId" : filterStringForId,
            "month": month,
            "year": year
        };
        console.log(jsonObj);

        $.ajax({
            "url": `/index/getdailyDSRStatus`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            console.log(data);

            // Extract data from API response
            var widget = data.widget[0];  // Assuming there's only one widget
            var objectOptionsJson = JSON.parse(widget.OBJECT_OPTIONS_JSON);
            var result = data.result;  // List of incidents from the `result` array
            var divId = widget.TILE_DIV_ID;
            const parentDiv = document.getElementById(divId);
            const existingH6 = parentDiv.querySelector('h6');

            // Set widget title
            if (existingH6) {
                parentDiv.querySelector('h6').innerHTML = `${objectOptionsJson["objectTitle"]}`;
            } else {
                var widgetDivId = document.getElementById(divId).children[1].getAttribute('id');
                var headingElement = $('<h6>').attr('id', `${userWidgetId}siteMonth`);
                $(`#${widgetDivId}`).before(headingElement);
                $(`#${userWidgetId}siteMonth`).addClass('m-2').css('font-weight', 'bolder');
            }

            // Update widget HTML and set list for incidents
            $(widgetDivId).html('');
            var parentHeightInVh = document.getElementById(widgetDivId).offsetHeight;
            var widgetHTML = widget.WIDGET_HTML;
            document.getElementById(widgetDivId).innerHTML = widgetHTML;

            var list = document.getElementById('siteList');
            list.innerHTML = ``;
            document.getElementById(widgetDivId).children[0].setAttribute('style', `max-height:${parentHeightInVh}px;overflow:auto;width:100%`);
            
            // Set current and previous months
            // var prev = (month === '1') ? '12' : (Number(month) - 1).toString();
            // document.getElementById(`${userWidgetId}siteMonth`).innerHTML = `${objectOptionsJson["objectTitle"]}`;
            // document.getElementById('cmon').innerHTML = `${getMonth(month)}`;
            // document.getElementById('pmon').innerHTML = `${getMonth(prev)}`;

            // Loop through the incidents and display them
            for (var i = 0; i < result.length; i++) {
                var incident = result[i];  // Current incident

                // Extract necessary fields from the incident data
                var occuredDate = incident.DATE;  // Incident title
                var business = incident.BUNAME;  // Incident title
                var status = incident.STATUS || "No Status";  // Incident status
                var statuscount = incident.STATUS_COUNT || "No details provided";  // Incident details
              

                // Set direction and color based on the count
                var dir = 'minus'; // Default to no change
                var color = 'warning'; // Default to neutral color
                 // Set the background color and label based on the status
                 var statusSpan = '';
                 if (status === 'COMPLETE') {
                     statusSpan = `<span style="background-color: green; color: white; padding: 4px 8px; border-radius: 4px;">${status}</span>`;
                 } else if (status === 'PENDING') {
                     statusSpan = `<span style="background-color: red; color: white; padding: 4px 8px; border-radius: 4px;">${status}</span>`;
                 } else {
                     statusSpan = `<span style="background-color: blue; color: white; padding: 4px 8px; border-radius: 4px;">${status}</span>`;
                 }
 

                // Create the row for this incident
                list.innerHTML += `
                    <tr>
                        <td style="text-align:left;font-weight:bold;" class= "col-1">
                            <span class="bg-info" style="border-radius:4px;color:white;font-size:25px">&nbsp;&nbsp;${i + 1}&nbsp;&nbsp;</span>
                        </td>
                        <td  style="text-align:left;width:7%">${occuredDate}</td>
                        <td style="text-align:left;width:7%">${business}</td>
                        <td style="text-align:left;width:7%">${statusSpan}</td>
                        <td style="text-align:center">${statuscount}</td>

                    </tr>
                `;
            }

            // Update the widget onclick event
            document.getElementById(divId).children[0].removeAttribute('onclick');
            document.getElementById(divId).children[0].setAttribute('onclick', `editWidgetOptions(${userWidgetId},'${divId}','${dashboardName}')`);

            resolve();
        }).fail(function (error) {
            reject(error);
        });
    });
}



// INCIDENT MAP
function createIncidentMap(userWidgetId){
    document.getElementById('tableDropdown').removeAttribute('onchange')
    document.getElementById('editChartWiseForm').innerHTML = ``
    document.getElementById("colorSelector").disabled = true
    document.getElementById("colorSelect").disabled = true
    document.getElementById("tableDropdown").disabled = true
    $('#tableDropdown').val('OL_INCIDENTS').trigger('change')
}

function saveIncidentMap(userWidgetId, divId){
    var widgetName = $('#widgetType option:selected').text();
    var page = $('#pageName').val()
    var objectOptionJson = {}
    objectOptionJson["objectTitle"] = document.getElementById('chartTitle').value
    var jsonObj = {}
    jsonObj["userObjectId"] = userWidgetId
    jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
    jsonObj["objectId"] = $('#widgetType').val()
    jsonObj["objectOptionsJson"] = JSON.stringify(objectOptionJson)
    jsonObj["tableName"] = 'INCIDENTS'
    jsonObj["divId"] = divId
    jsonObj["objectType"] = $('#objectType').find('option:selected').text()
    console.log(jsonObj);
    $.ajax({
        "url": `/index/saveObjectJsonAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        setWidget(data["userObjectId"], widgetName, divId)
    })
}

function setIncidentMap(userWidgetId, divId, month, year){
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["userWidgetId"] = userWidgetId
        jsonObj["filterString"] = filterStringForId
        jsonObj["month"] = month
        jsonObj["year"] = year
        console.log(jsonObj);
        $.ajax({
            "url": `/index/getIncidentDataAPI`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            console.log(data);
            var widget = data.widget[0]
            var objectOptionsJson = JSON.parse(widget.OBJECT_OPTIONS_JSON)
            var result = data.result
            console.log(result,"incident for map");
            var divId = widget.TILE_DIV_ID
            const parentDiv = document.getElementById(divId);
            const existingH6 = parentDiv.querySelector('h6');
            if (existingH6) {
                var widgetDivId = document.getElementById(divId).children[2].getAttribute('id')

            } else {
                var widgetDivId = document.getElementById(divId).children[1].getAttribute('id')
                var headingElement = $('<h6>').attr('id', `${userWidgetId}avgMinMax`);
                $(`#${widgetDivId}`).before(headingElement);
                $(`#${userWidgetId}avgMinMax`).addClass('m-2').css('font-weight', 'bolder');
            }
            parentDiv.querySelector('h6').innerHTML = `${objectOptionsJson["objectTitle"]}`

            $(widgetDivId).html('')
            var inHtml = `<div id="map${divId}" style="height:100%;width:100%"></div>`
            
            setHtmlAndExecute(widgetDivId, inHtml, function () {
                var map = L.map(`map${divId}`).setView([22.7041, 79.1025], 4);
                L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                    maxZoom: 20,
                    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
                }).addTo(map);
                var drawnItems = new L.FeatureGroup();
                map.addLayer(drawnItems);
                var markers = L.markerClusterGroup();
                result.forEach(incident => {
                    var iconImage = incident.ICON
                    //getTasksD(incident.INCIDENTID);

                    var customIcon = L.AwesomeMarkers.icon({
                        icon: iconImage,
                        markerColor: getMarkerColor(incident.SEVERITY)
                    });

                    //console.log(customIcon, "iconnn")

                    markers.addLayer(L.marker([incident.LATITUDE, incident.LONGITUDE], {
                        icon: customIcon
                    }).bindPopup(makePopupContent(incident)));
                })
                console.log(markers);
                map.addLayer(markers);
                console.log("HTML content is set. Now executing additional code...");
            });
            $(widgetDivId).html(inHtml)
            document.getElementById(divId).children[0].removeAttribute('onclick')
            document.getElementById(divId).children[0].setAttribute('onclick', `editWidgetOptions(${userWidgetId},'${divId}','${dashboardName}')`)



            resolve();
        }).fail(function (error) {
            reject(error);
        });
    });
}

function makePopupContent(incident) {

    // console.log(incident);
    let popupHeader = document.createElement('div')
    // popupHeader.style.backgroundColor = '#6f8fee'
    popupHeader.innerHTML = `<h4 class="text-center m-0" style="font-size:medium;font-weight:bold"><span><i class="${incident.ICON}" style="color:${incident.COLOR};font-size:1rem"></i></span>&nbsp;&nbsp;${incident.INCIDENTTITLE}</h4><br>`
    // console.log(popupHeader.innerHTML)
    inci = incident

    let div = document.createElement('div');
    let ul = document.createElement('ul');
    // ul.style.backgroundColor = '#970808'
    ul.className = "p-3 m-0 list-unstyled  "

    // let data0 = document.createElement('li');
    // data0.innerHTML = `<div class="row"><div class="col-5"><span>INCIDENT ID</span></div><div class="col-7">:<span  class="ml-2" style="color:#127618 !important"><b>${incident.INCIDENTID}</b></span></div></div>`
    // ul.append(data0);

    // let data12 = document.createElement('li');
    // data12.innerHTML = `<div class="row"><div class="col-5"><span>VERTICAL</span></div><div class="col-7">:<span  class="ml-2" style="color:#127618 !important">${incident.VERTICALNAME}</span></div></div>`
    // ul.append(data12);


    // let data13 = document.createElement('li');
    // data13.innerHTML = `<div class="row"><div class="col-5"><span>BUSINESS</span></div><div class="col-7">:<span  class="ml-2" style="color:#127618 !important">${incident.BUSINESSNAME}</span></div></div>`
    // ul.append(data13);



    let data14 = document.createElement('li');
    data14.innerHTML = `<div class="row"><div class="col-5"><span>SITE</span></div><div class="col-7">:<span  class="ml-2" style="color:#127618 !important">${incident.SITENAME}</span></div></div>`
    ul.append(data14);

    let data1 = document.createElement('li');
    data1.innerHTML = `<div class="row"><div class="col-5"><span>INCIDENT TYPE</span></div><div class="col-7">: <span  class="ml-1" style="color:#127618 !important">${incident.INCIDENTTYPENAME}</span></div></div>`
    ul.append(data1);


    let data4 = document.createElement('li');
    data4.innerHTML = `<div class="row"><div class="col-5"><span >REPORTING TYPE</span></div><div class="col-7">: <span  class="ml-1" style="color:#127618 !important">${incident.REPORTTYPENAME}</span></div></div>`
    ul.append(data4);


    // let data5 = document.createElement('li');
    // data5.innerHTML = `<div class="row"><div class="col-5"><span >CATEGORY</span></div><div class="col-7">: <span  class="ml-1" style="color:#127618 !important">${incident.INCIDENTCATNAME}</span></div></div>`
    // ul.append(data5);


    if (incident.STATUSNAME == 'OPEN') {

        let data3 = document.createElement('li');
        data3.innerHTML = `<div class="row"><div class="col-5"><span >STATUS</span></div><div class="col-7">: <span class="badge badge-success ml-1 text-dark">${incident.STATUSNAME}</span></div></div>`
        ul.append(data3);
    } else if (incident.STATUSNAME == 'CLOSE') {
        let data3 = document.createElement('li');
        data3.innerHTML = `<div class="row"><div class="col-5"><span >STATUS</span></div><div class="col-7">: <span class="badge badge-danger ml-1 text-dark">${incident.STATUSNAME}</span></div></div>`
        ul.append(data3);
    }


    // let data10 = document.createElement('li');
    // data10.innerHTML = `<div class="row"><div class="col-5"><span>SEVERITY</span></div><div class="col-7">: <span  class="ml-1" style="color:#127618 !important">${incident.SEVERITY}</span></div></div>`
    // ul.append(data10);


    if (incident.SEVERITY == 'Low') {

        let data10 = document.createElement('li');
        data10.innerHTML = `<div class="row"><div class="col-5"><span >SEVERITY</span></div><div class="col-7">: <span class="badge badge-success ml-1 text-dark">${incident.SEVERITY}</span></div></div>`
        ul.append(data10);
    } else if (incident.SEVERITY == 'Medium') {
        let data10 = document.createElement('li');
        data10.innerHTML = `<div class="row"><div class="col-5"><span >SEVERITY</span></div><div class="col-7">: <span class="badge badge-warning ml-1 text-dark">${incident.SEVERITY}</span></div></div>`
        ul.append(data10);
    } else if (incident.SEVERITY == 'High') {
        let data10 = document.createElement('li');
        data10.innerHTML = `<div class="row"><div class="col-5"><span >SEVERITY</span></div><div class="col-7">: <span class="badge badge-danger ml-1 text-dark">${incident.SEVERITY}</span></div></div>`
        ul.append(data10);
    }

    var dateString = incident.OCCURDATE
    let date = new Date(dateString),
        day = date.getDate(),
        month = date.getMonth(),
        year = date.getFullYear(),
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var FormattedDate = day + ' ' + months[month] + ', ' + year;


    var timeString = incident.OCCURTIME.replace(':', '')

    occurd = incident.OCCURDATE
    occurd = occurd.slice(8, 10) + '-' + getMonth(occurd.slice(5, 7)) + '-' + occurd.slice(0, 4)


    // let data6 = document.createElement('li');
    // data6.innerHTML = `<div class="row"><div class="col-5"><span >OCCURED DATE & TIME</span></div><div class="col-7">: <span  class="ml-1"style="color:#127618 !important">${occurd}&nbsp;&nbsp;${timeString} hrs</span></div></div>`
    // ul.append(data6);


    // let data8 = document.createElement('li');
    // data8.innerHTML = `<div class="row"><div class="col-5"><span >DESCRIPTION</span></div><div class="col-7">:<span class="ml-2"style="color:#127618 !important">${incident.DESCRIPTION}</span></div></div>`
    // ul.append(data8);
    div.append(popupHeader)
    div.append(ul)
    
    //<a href="#" class="col-sm" onclick = "myMap.closePopup()"><h5 class="text-center m-0"><i class="fa fa-times mr-1" style="color:#f3463b;"></i>Close</h5></a>
    return div;
}

function getMarkerColor(colorCode) {
    if (colorCode == 'Low') {
        return 'red'
    } else if (colorCode == 'Medium') {
        return 'orange'
    } else if (colorCode == 'High') {
        return 'green'
    }
}

// utility
function setHtmlAndExecute(widgetDivId, inHtml, callback) {
    $('#'+widgetDivId).html(inHtml);
    callback();
}


// AVG MAX MIN RANGE CHART WIDGET
function createAvgMaxMinRangeWidget(userWidgetId) {
    document.getElementById('tableDropdown').removeAttribute('onchange')
    document.getElementById('tableDropdown').setAttribute('onchange', 'getTableColumns(this.value);getTableGroupByColumns(this.value)')
    document.getElementById('editChartWiseForm').innerHTML = ``
    var formHTML = `<div class="form-row">
    <div class="form-group col-md-12">
        <label for="columns">Colums</label>
        <select class="form-control" id="columns">
        
        </select>
    </div>
</div>
<div class="form-row">
    <div class="form-group col-md-12">
        <label for="aggregation">Aggregation</label>
        <select class="form-control" id="aggregation">
        <option value="SUM">SUM</option>
        <option value="COUNT">COUNT</option>
        <option value="AVG">AVG</option>
        <option value="MAX">MAX</option>
        <option value="MIN">MIN</option>
        </select>
    </div>
</div>
<div class="form-row">
    <div class="form-group col-md-12">
        <label for="groupBy">Group By Column</label>
        <select class="form-control" id="groupBy">
        </select>
    </div>
</div>`
    document.getElementById('editChartWiseForm').innerHTML = formHTML
    $('#columns').select2({
        width: '21vw'
    });
    $('#groupBy').select2({
        width: '21vw'
    });

    $('#aggregation').select2({
        width: '21vw'
    });
    if (userWidgetId !== 0) {
        var jsonObj = {}
        jsonObj["userChartId"] = userWidgetId
        $.ajax({
            "url": `/index/getWidgetOptions`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            var chartOptionJson = JSON.parse(data[0].OBJECT_OPTIONS_JSON)
            $('#tableDropdown').val(`${data[0].TABLE_NAME}`).trigger('change')
            if ($('#colorSelector option[value="' + chartOptionJson[`colors`].toString() + '"]').length > 0) {
                $('#colorSelector').val(chartOptionJson[`colors`].toString()).trigger('change');
            } else {
                $('#colorSelect').val(chartOptionJson[`colors`]).trigger('change');
            }
            setTimeout(() => {
                $('#columns').val(chartOptionJson[`tableColumns`]).trigger('change')
                $('#groupBy').val(chartOptionJson[`groupByColumn`]).trigger('change')
                $('#aggregation').val(chartOptionJson[`aggregation`]).trigger('change')
            }, 1000);

        })
    }
}
function saveAvgMaxMinRangeWidget(userWidgetId, divId) {
    var widgetName = $('#widgetType option:selected').text();
    var page = $('#pageName').val()
    var objectOptionJson = {}
    objectOptionJson["objectTitle"] = document.getElementById('chartTitle').value
    objectOptionJson["aggregation"] = $('#aggregation').val()
    objectOptionJson["groupByColumn"] = $('#groupBy').val()
    objectOptionJson["groupByColumnName"] = $('#groupBy').find('option:selected').text()
    objectOptionJson["tableColumns"] = $('#columns').val()
    objectOptionJson["tableColumnsNames"] = $('#columns').find('option:selected').text()
    objectOptionJson["table"] = $('#tableDropdown').val()
    objectOptionJson["tableName"] = $('#tableDropdown').find('option:selected').text()
    if ($('#colorSelector').val() === '') {
        objectOptionJson["colors"] = $('#colorSelect').val()
    } else {
        objectOptionJson["colors"] = $('#colorSelector').val().split(',')
    }

    var jsonObj = {}
    jsonObj["userObjectId"] = userWidgetId
    jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
    jsonObj["objectId"] = $('#widgetType').val()
    jsonObj["objectOptionsJson"] = JSON.stringify(objectOptionJson)
    jsonObj["tableName"] = $('#tableDropdown').val()
    jsonObj["divId"] = divId
    jsonObj["objectType"] = $('#objectType').find('option:selected').text()
    console.log(jsonObj);
    $.ajax({
        "url": `/index/saveObjectJsonAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        setWidget(data["userObjectId"], widgetName, divId)
    })

}

function setAvgMaxMinRangeWidget(userWidgetId, divId, month, year) {
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["userWidgetId"] = userWidgetId
        jsonObj["filterString"] = filterString
        jsonObj["month"] = month
        jsonObj["year"] = year
        $.ajax({
            "url": `/index/getAvgMaxMinRangeWidgetAPI`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            console.log(data);
            var widget = data.widget[0]
            var objectOptionsJson = JSON.parse(widget.OBJECT_OPTIONS_JSON)
            var result = data.result
            var divId = widget.TILE_DIV_ID
            const parentDiv = document.getElementById(divId);
            const existingH6 = parentDiv.querySelector('h6');
            if (existingH6) {
                var widgetDivId = document.getElementById(divId).children[2].getAttribute('id')

            } else {
                var widgetDivId = document.getElementById(divId).children[1].getAttribute('id')
                var headingElement = $('<h6>').attr('id', `${userWidgetId}avgMinMax`);
                $(`#${widgetDivId}`).before(headingElement);
                $(`#${userWidgetId}avgMinMax`).addClass('m-2').css('font-weight', 'bolder');
            }
            parentDiv.querySelector('h6').innerHTML = `${objectOptionsJson["objectTitle"]}`

            $(widgetDivId).html('')
            var widgetHTML = widget.WIDGET_HTML
            console.log(widgetHTML)
            document.getElementById(widgetDivId).innerHTML = widgetHTML
            var countArray = []
            result.forEach(day => {
                countArray.push(parseInt(day[`${objectOptionsJson["tableColumnsNames"]}`]))
            })
            var maxCount = getMaxValue(countArray)
            var minCount = getMinValue(countArray)
            var avgCount = getAverageValue(countArray)
            document.getElementById(widgetDivId).children[0].children[0].children[0].innerText = avgCount
            if (objectOptionsJson["colors"][0]) {
                document.getElementById(widgetDivId).children[0].children[0].children[0].style.color = objectOptionsJson["colors"][0]
            }
            document.getElementById(widgetDivId).children[0].children[0].children[1].innerText = `AVG ${objectOptionsJson["tableColumnsNames"]}`
            document.getElementById(widgetDivId).children[0].children[1].children[2].children[0].children[0].innerText = minCount
            if (objectOptionsJson["colors"][1]) {
                document.getElementById(widgetDivId).children[0].children[1].children[2].children[0].children[0].style.color = objectOptionsJson["colors"][1]
            }
            document.getElementById(widgetDivId).children[0].children[1].children[2].children[0].children[1].innerText = `MIN ${objectOptionsJson["tableColumnsNames"]}`
            document.getElementById(widgetDivId).children[0].children[1].children[0].children[0].children[0].innerText = maxCount
            if (objectOptionsJson["colors"][2]) {
                document.getElementById(widgetDivId).children[0].children[1].children[0].children[0].children[0].style.color = objectOptionsJson["colors"][2]
            }
            document.getElementById(widgetDivId).children[0].children[1].children[0].children[0].children[1].innerText = `MAX ${objectOptionsJson["tableColumnsNames"]}`
            var obj = {}
            var labels = []
            obj["name"] = objectOptionsJson["tableColumnsNames"]
            var set = []
            for (var j = 0; j < result.length; j++) {
                set.push(result[j][`${objectOptionsJson["tableColumnsNames"]}`])
                labels.push(result[j][`${objectOptionsJson["groupByColumnName"]}`])
            }
            obj["data"] = set
            var dataset = []
            dataset.push(obj)

            console.log(dataset);
            var options = {
                series: dataset,
                chart: {
                    height: '90%',
                    type: 'area'
                },
                dataLabels: {
                    enabled: false
                },
                colors: [`${objectOptionsJson["colors"][3]}`],
                stroke: {
                    curve: 'smooth'
                },
                labels: labels
            };

            var chart = new ApexCharts(document.getElementById(widgetDivId).children[1].children[0], options);
            chart.render();

            document.getElementById(divId).children[0].removeAttribute('onclick')
            document.getElementById(divId).children[0].setAttribute('onclick', `editWidgetOptions(${userWidgetId},'${divId}','${dashboardName}')`)



            resolve();
        }).fail(function (error) {
            reject(error);
        });
    });
}


// percentage bars
function createPercentBarsWidget(userWidgetId) {
    document.getElementById('tableDropdown').removeAttribute('onchange')
    document.getElementById('tableDropdown').setAttribute('onchange', 'getActMaxColumns(this.value);getTableGroupByColumns(this.value)')
    document.getElementById('editChartWiseForm').innerHTML = ``
    var formHTML = `<div class="form-row">
    <div class="form-group col-md-12">
        <label for="actValColumn">Actual Value Colum</label>
        <select class="form-control" id="actValColumn">
        
        </select>
    </div>
</div>
<div class="form-row">
    <div class="form-group col-md-12">
        <label for="maxValColumn">Maximum Value Colum</label>
        <select class="form-control" id="maxValColumn">
        
        </select>
    </div>
</div>
<div class="form-row">
    <div class="form-group col-md-12">
        <label for="aggregation">Aggregation</label>
        <select class="form-control" id="aggregation">
        <option value="SUM">SUM</option>
        <option value="COUNT">COUNT</option>
        <option value="AVG">AVG</option>
        <option value="MAX">MAX</option>
        <option value="MIN">MIN</option>
        </select>
    </div>
</div>
<div class="form-row">
    <div class="form-group col-md-12">
        <label for="groupBy">Group By Column</label>
        <select class="form-control" id="groupBy">
        </select>
    </div>
</div>`
    document.getElementById('editChartWiseForm').innerHTML = formHTML
    $('#actValColumn').select2({
        width: '21vw'
    });
    $('#maxValColumn').select2({
        width: '21vw'
    });
    $('#groupBy').select2({
        width: '21vw'
    });

    $('#aggregation').select2({
        width: '21vw'
    });
    if (userWidgetId !== 0) {
        var jsonObj = {}
        jsonObj["userChartId"] = userWidgetId
        $.ajax({
            "url": `/index/getWidgetOptions`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            var chartOptionJson = JSON.parse(data[0].OBJECT_OPTIONS_JSON)
            $('#tableDropdown').val(`${data[0].TABLE_NAME}`).trigger('change')
            if ($('#colorSelector option[value="' + chartOptionJson[`colors`].toString() + '"]').length > 0) {
                $('#colorSelector').val(chartOptionJson[`colors`].toString()).trigger('change');
            } else {
                $('#colorSelect').val(chartOptionJson[`colors`]).trigger('change');
            }
            setTimeout(() => {
                $('#actValColumn').val(chartOptionJson[`actValColumn`]).trigger('change')
                $('#maxValColumn').val(chartOptionJson[`maxValColumn`]).trigger('change')
                $('#groupBy').val(chartOptionJson[`groupByColumn`]).trigger('change')
                $('#aggregation').val(chartOptionJson[`aggregation`]).trigger('change')
            }, 1000);

        })
    }
}

function savePercentBarsWidget(userWidgetId, divId) {
    var widgetName = $('#widgetType option:selected').text();
    var page = $('#pageName').val()
    var objectOptionJson = {}
    objectOptionJson["objectTitle"] = document.getElementById('chartTitle').value
    objectOptionJson["aggregation"] = $('#aggregation').val()
    objectOptionJson["groupByColumn"] = $('#groupBy').val()
    objectOptionJson["groupByColumnName"] = $('#groupBy').find('option:selected').text()
    objectOptionJson["tableColumns"] = [$('#actValColumn').val(), $('#maxValColumn').val()]
    objectOptionJson["tableColumnsNames"] = [$('#actValColumn').find('option:selected').text(), $('#maxValColumn').find('option:selected').text()]
    objectOptionJson["actValColumn"] = $('#actValColumn').val()
    objectOptionJson["maxValColumn"] = $('#maxValColumn').val()
    objectOptionJson["table"] = $('#tableDropdown').val()
    objectOptionJson["tableName"] = $('#tableDropdown').find('option:selected').text()
    if ($('#colorSelector').val() === '') {
        objectOptionJson["colors"] = $('#colorSelect').val()
    } else {
        objectOptionJson["colors"] = $('#colorSelector').val().split(',')
    }

    var jsonObj = {}
    jsonObj["userObjectId"] = userWidgetId
    jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
    jsonObj["objectId"] = $('#widgetType').val()
    jsonObj["objectOptionsJson"] = JSON.stringify(objectOptionJson)
    jsonObj["tableName"] = $('#tableDropdown').val()
    jsonObj["divId"] = divId
    jsonObj["objectType"] = $('#objectType').find('option:selected').text()
    console.log(jsonObj);
    $.ajax({
        "url": `/index/saveObjectJsonAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        setWidget(data["userObjectId"], widgetName, divId)
    })
}

function setPercentBarsWidget(userWidgetId, divId, month, year) {
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["userWidgetId"] = userWidgetId
        jsonObj["filterString"] = filterString
        jsonObj["month"] = month
        jsonObj["year"] = year
        $.ajax({
            "url": `/index/getPercentBarsWidgetAPI`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            console.log(data);
            var widget = data.widget[0]
            var objectOptionsJson = JSON.parse(widget.OBJECT_OPTIONS_JSON)
            var result = data.result
            var result2 = data.result2
            var divId = widget.TILE_DIV_ID
            const parentDiv = document.getElementById(divId);
            const existingH6 = parentDiv.querySelector('h6');
            if (existingH6) {
                var widgetDivId = document.getElementById(divId).children[2].getAttribute('id')

            } else {
                var widgetDivId = document.getElementById(divId).children[1].getAttribute('id')
                var headingElement = $('<h6>').attr('id', `${userWidgetId}avgMinMax`);
                $(`#${widgetDivId}`).before(headingElement);
                $(`#${userWidgetId}avgMinMax`).addClass('m-2').css('font-weight', 'bolder');
            }
            parentDiv.querySelector('h6').innerHTML = `${objectOptionsJson["objectTitle"]}`

            $(widgetDivId).html('')
            var widgetHTML = widget.WIDGET_HTML
            console.log(widgetHTML)
            document.getElementById(widgetDivId).innerHTML = widgetHTML
            document.getElementById(widgetDivId).children[0].children[0].children[1].innerText = objectOptionsJson["groupByColumnName"]
            document.getElementById(widgetDivId).children[0].children[0].children[2].innerText = objectOptionsJson["tableColumnsNames"][0] + ' PERCENTAGE'
            for (var i = 0; i < 6; i++) {

                var percentage = Math.round(parseInt(result[i][`${objectOptionsJson["tableColumnsNames"][0]}`]) / parseInt(result2[i][`${objectOptionsJson["tableColumnsNames"][1]}`]) * 100)
                var row = `<div class="row" style="margin-top:2vh">
            <div class="col-1" style="display: flex; justify-content: center; align-items: center">
              ${i + 1}.
            </div>
            <div class="col-4" style="display: flex; justify-content: center; align-items: center">
              ${result[i][`${objectOptionsJson["groupByColumnName"]}`]}
            </div>
            <div class="col-6 curved-border">
           <span id="${widgetDivId}${result[i][`${objectOptionsJson["groupByColumnName"]}`]}percentageSpan" style="width: ${percentage}%; background-color: ${objectOptionsJson["colors"][i]}; display: flex; justify-content: center; align-items: center;margin-left:-5%;" onload="">${percentage}%</span>
       </div>               
          </div>`
                document.getElementById(widgetDivId).children[0].innerHTML += row
                setContrastTextColor(`${widgetDivId}${result[i][`${objectOptionsJson["groupByColumnName"]}`]}percentageSpan`)
            }





            // var countArray = []
            // result.forEach(day=>{
            //     countArray.push(parseInt(day[`${objectOptionsJson["tableColumnsNames"]}`]))
            // })
            // var maxCount = getMaxValue(countArray)
            // var minCount = getMinValue(countArray)
            // var avgCount = getAverageValue(countArray)
            // document.getElementById(widgetDivId).children[0].children[0].children[0].innerText = avgCount
            // if(objectOptionsJson["colors"][0]){
            //     document.getElementById(widgetDivId).children[0].children[0].children[0].style.color = objectOptionsJson["colors"][0]
            // }
            // document.getElementById(widgetDivId).children[0].children[0].children[1].innerText = `AVG ${objectOptionsJson["tableColumnsNames"]}`
            // document.getElementById(widgetDivId).children[0].children[1].children[2].children[0].children[0].innerText = minCount
            // if(objectOptionsJson["colors"][1]){
            //     document.getElementById(widgetDivId).children[0].children[1].children[2].children[0].children[0].style.color = objectOptionsJson["colors"][1]
            // }
            // document.getElementById(widgetDivId).children[0].children[1].children[2].children[0].children[1].innerText = `MIN ${objectOptionsJson["tableColumnsNames"]}`
            // document.getElementById(widgetDivId).children[0].children[1].children[0].children[0].children[0].innerText = maxCount
            // if(objectOptionsJson["colors"][2]){
            //     document.getElementById(widgetDivId).children[0].children[1].children[0].children[0].children[0].style.color = objectOptionsJson["colors"][2]
            // }
            // document.getElementById(widgetDivId).children[0].children[1].children[0].children[0].children[1].innerText = `MAX ${objectOptionsJson["tableColumnsNames"]}`
            // var obj = {}
            // var labels = []
            //     obj["name"] = objectOptionsJson["tableColumnsNames"]
            //     var set = []
            //     for (var j = 0; j < result.length; j++) {
            //         set.push(result[j][`${objectOptionsJson["tableColumnsNames"]}`])
            //         labels.push(result[j][`${objectOptionsJson["groupByColumnName"]}`])
            //     }
            //     obj["data"] = set
            //     var dataset = []
            //     dataset.push(obj)

            //     console.log(dataset);
            // var options = {
            //     series: dataset,
            //     chart: {
            //     height: '90%',
            //     type: 'area'
            //   },
            //   dataLabels: {
            //     enabled: false
            //   },
            //   colors:[`${objectOptionsJson["colors"][3]}`],
            //   stroke: {
            //     curve: 'smooth'
            //   },
            //   labels:labels
            //   };

            //   var chart = new ApexCharts(document.getElementById(widgetDivId).children[1].children[0], options);
            //   chart.render();

            document.getElementById(divId).children[0].removeAttribute('onclick')
            document.getElementById(divId).children[0].setAttribute('onclick', `editWidgetOptions(${userWidgetId},'${divId}','${dashboardName}')`)



            resolve();
        }).fail(function (error) {
            reject(error);
        });
    });
}


// PREVIOUS MONTH COMPARISON TABLE
function createPrevMonthComp(userWidgetId) {
    document.getElementById('tableDropdown').removeAttribute('onchange')
    document.getElementById('tableDropdown').setAttribute('onchange', 'getTableColumns(this.value);getTableGroupByColumns(this.value)')
    document.getElementById('editChartWiseForm').innerHTML = ``
    var formHTML = `<div class="form-row">
    <div class="form-group col-md-12">
        <label for="columns">Colums</label>
        <select class="form-control" id="columns">
        
        </select>
    </div>
</div>
<div class="form-row">
    <div class="form-group col-md-12">
        <label for="aggregation">Aggregation</label>
        <select class="form-control" id="aggregation">
        <option value="SUM">SUM</option>
        <option value="COUNT">COUNT</option>
        <option value="AVG">AVG</option>
        <option value="MAX">MAX</option>
        <option value="MIN">MIN</option>
        </select>
    </div>
</div>
<div class="form-row">
    <div class="form-group col-md-12">
        <label for="groupBy">Group By Column</label>
        <select class="form-control" id="groupBy">
        </select>
    </div>
</div>`
    document.getElementById('editChartWiseForm').innerHTML = formHTML
    $('#columns').select2({
        width: '21vw'
    });
    $('#groupBy').select2({
        width: '21vw'
    });

    $('#aggregation').select2({
        width: '21vw'
    });
    if (userWidgetId !== 0) {
        var jsonObj = {}
        jsonObj["userChartId"] = userWidgetId
        $.ajax({
            "url": `/index/getWidgetOptions`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            var chartOptionJson = JSON.parse(data[0].OBJECT_OPTIONS_JSON)
            $('#tableDropdown').val(`${data[0].TABLE_NAME}`).trigger('change')
            if ($('#colorSelector option[value="' + chartOptionJson[`colors`].toString() + '"]').length > 0) {
                $('#colorSelector').val(chartOptionJson[`colors`].toString()).trigger('change');
            } else {
                $('#colorSelect').val(chartOptionJson[`colors`]).trigger('change');
            }
            setTimeout(() => {
                $('#columns').val(chartOptionJson[`tableColumns`]).trigger('change')
                $('#groupBy').val(chartOptionJson[`groupByColumn`]).trigger('change')
                $('#aggregation').val(chartOptionJson[`aggregation`]).trigger('change')
            }, 1000);

        })
    }



}

function savePrevMonthCompJson(userWidgetId, divId) {
    var widgetName = $('#widgetType option:selected').text();
    var page = $('#pageName').val()
    var objectOptionJson = {}
    objectOptionJson["objectTitle"] = document.getElementById('chartTitle').value
    objectOptionJson["aggregation"] = $('#aggregation').val()
    objectOptionJson["groupByColumn"] = $('#groupBy').val()
    objectOptionJson["groupByColumnName"] = $('#groupBy').find('option:selected').text()
    objectOptionJson["tableColumns"] = $('#columns').val()
    objectOptionJson["tableColumnsNames"] = $('#columns').find('option:selected').text()
    objectOptionJson["table"] = $('#tableDropdown').val()
    objectOptionJson["tableName"] = $('#tableDropdown').find('option:selected').text()
    if ($('#colorSelector').val() === '') {
        objectOptionJson["colors"] = $('#colorSelect').val()
    } else {
        objectOptionJson["colors"] = $('#colorSelector').val().split(',')
    }

    var jsonObj = {}
    jsonObj["userObjectId"] = userWidgetId
    jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
    jsonObj["objectId"] = $('#widgetType').val()
    jsonObj["objectOptionsJson"] = JSON.stringify(objectOptionJson)
    jsonObj["tableName"] = $('#tableDropdown').val()
    jsonObj["divId"] = divId
    jsonObj["objectType"] = $('#objectType').find('option:selected').text()
    console.log(jsonObj);
    $.ajax({
        "url": `/index/saveObjectJsonAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        setWidget(data["userObjectId"], widgetName, divId)
    })

}

//function setPrevMonthComp(userWidgetId, divId, month, year) {
//    return new Promise((resolve, reject) => {
//        var jsonObj = {}
//        jsonObj["userWidgetId"] = userWidgetId
//        jsonObj["filterString"] = filterString
//        jsonObj["month"] = month
//        jsonObj["year"] = year
//        $.ajax({
//            "url": `/index/getPrevMonthDataAPI`,
//            "method": "POST",
//            "timeout": 0,
//            "headers": {
//                "Content-Type": "application/json"
//            },
//            "data": JSON.stringify(jsonObj),
//        }).done(function (data) {
//            console.log(data);
//            var widget = data.widget[0]
//            var objectOptionsJson = JSON.parse(widget.OBJECT_OPTIONS_JSON)
//            var result = data.result
//            var result2 = data.result2
//            var sites = data.sites
//            var divId = widget.TILE_DIV_ID
//            const parentDiv = document.getElementById(divId);
//            const existingH6 = parentDiv.querySelector('h6');
//            if (existingH6) {
//                var widgetDivId = document.getElementById(divId).children[2].getAttribute('id')
//                parentDiv.querySelector('h6').innerHTML = `${objectOptionsJson["objectTitle"]}`
//            } else {
//                var widgetDivId = document.getElementById(divId).children[1].getAttribute('id')
//                var headingElement = $('<h6>').attr('id', `${userWidgetId}siteMonth`);
//                $(`#${widgetDivId}`).before(headingElement);
//                $(`#${userWidgetId}siteMonth`).addClass('m-2').css('font-weight', 'bolder');
//            }
//
//
//            $(widgetDivId).html('')
//            var parentHeightInVh = document.getElementById(widgetDivId).offsetHeight
//            var widgetHTML = widget.WIDGET_HTML
//            console.log(widgetHTML)
//            document.getElementById(widgetDivId).innerHTML = widgetHTML
//            var list = document.getElementById('siteList')
//            list.innerHTML = ``
//            document.getElementById(widgetDivId).children[0].setAttribute('style', `max-height:${parentHeightInVh}px;overflow:auto;widht:100%`)
//            var prev = ``
//
//            if (month == '1') {
//                prev = '12'
//            }
//            else {
//                prev = (Number(month) - 1).toString()
//            }
//            document.getElementById(`${userWidgetId}siteMonth`).innerHTML = `${objectOptionsJson["objectTitle"]}`
//            document.getElementById('cmon').innerHTML = `${getMonth(month)}`
//            document.getElementById('pmon').innerHTML = `${getMonth(prev)}`
//
//            var site;
//            var current;
//            var last;
//            var dir;
//            var color;
//            var bus;
//
//            for (var i = 0; i < data.result.length; i++) {
//                site = data.result[i][`${objectOptionsJson["groupByColumnName"]}`]
//                bus = data.result[i]["BUSINESS"]
//                current = Number(data.result[i][`${objectOptionsJson["tableColumnsNames"]}`])
//                check = 0;
//                for (var j = 0; j < data.result2.length; j++) {
//                    if (data.result[i][`${objectOptionsJson["groupByColumnName"]}`] === data.result2[j][`${objectOptionsJson["groupByColumnName"]}`]) {
//                        last = Number(data.result2[j][`${objectOptionsJson["tableColumnsNames"]}`])
//                        check = 1
//                        break
//                    }
//                }
//                if (check == 0) {
//                    last = 0
//                }
//
//                //alert(current + "," + last + "," + site)
//                //alert(current > last)
//                if (current > last) {
//                    // per = Math.round(((current - last) / last) * 100)
//                    dir = 'arrow-up'
//                    color = 'danger'
//
//                }
//                else if (current < last) {
//                    // per = Math.round(((last - current) / last) * 100)
//                    dir = 'arrow-down'
//                    color = 'success'
//
//                } else if (current == last) {
//                    // per = 0
//                    dir = 'minus'
//                    color = 'warning'
//                }
//                //alert(last + " " + current + " " + dir + " " + color)
//
//
//
//
//                list.innerHTML += `<tr><td style="text-align:center;font-weight:bold;"><span class="bg-info" style="border-radius:4px;color:white;font-size:25px">&nbsp;&nbsp;${i + 1}&nbsp;&nbsp;<span></td><td style="text-align:left">${bus}</td><td style="text-align:left">${site}</td><td style="text-align:center">${current}&nbsp;<span class="text-${color}"><i class="fa fa-${dir}" aria-hidden="true"></i>&nbsp;<strong><small></small></strong></span></td><td style="text-align:center">${last}</td></tr>`
//            }
//
//            document.getElementById(divId).children[0].removeAttribute('onclick')
//            document.getElementById(divId).children[0].setAttribute('onclick', `editWidgetOptions(${userWidgetId},'${divId}','${dashboardName}')`)
//
//            resolve();
//        }).fail(function (error) {
//            reject(error);
//        });
//    });
//}

function setPrevMonthComp(userWidgetId, divId, month, year) {
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["userWidgetId"] = userWidgetId
        jsonObj["filterString"] = filterString
        jsonObj["month"] = month
        jsonObj["year"] = year
        console.log(jsonObj);
        return
        $.ajax({
            "url": `/index/getPrevMonthDataAPI`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            console.log(data);
            var widget = data.widget[0]
            var objectOptionsJson = JSON.parse(widget.OBJECT_OPTIONS_JSON)
            var result = data.result
            var result2 = data.result2
            var sites = data.sites
            var divId = widget.TILE_DIV_ID
            const parentDiv = document.getElementById(divId);
            const existingH6 = parentDiv.querySelector('h6');
            if (existingH6) {
                var widgetDivId = document.getElementById(divId).children[2].getAttribute('id')
                parentDiv.querySelector('h6').innerHTML = `${objectOptionsJson["objectTitle"]}`
            } else {
                var widgetDivId = document.getElementById(divId).children[1].getAttribute('id')
                var headingElement = $('<h6>').attr('id', `${userWidgetId}siteMonth`);
                $(`#${widgetDivId}`).before(headingElement);
                $(`#${userWidgetId}siteMonth`).addClass('m-2').css('font-weight', 'bolder');
            }


            $(widgetDivId).html('')
            var parentHeightInVh = document.getElementById(widgetDivId).offsetHeight
            var widgetHTML = widget.WIDGET_HTML
            console.log(widgetHTML)
            document.getElementById(widgetDivId).innerHTML = widgetHTML
            var list = document.getElementById('siteList')
            list.innerHTML = ``
            document.getElementById(widgetDivId).children[0].setAttribute('style', `max-height:${parentHeightInVh}px;overflow:auto;widht:100%`)
            var prev = ``

            if (month == '1') {
                prev = '12'
            }
            else {
                prev = (Number(month) - 1).toString()
            }
            document.getElementById(`${userWidgetId}siteMonth`).innerHTML = `${objectOptionsJson["objectTitle"]}`
            document.getElementById('cmon').innerHTML = `${getMonth(month)}`
            document.getElementById('pmon').innerHTML = `${getMonth(prev)}`

            var site;
            var current;
            var last;
            var dir;
            var color;
            var bus;

            for (var i = 0; i < data.result.length; i++) {
                site = data.result[i][`${objectOptionsJson["groupByColumnName"]}`]
                bus = data.result[i]["BUSINESS"]
                console.log(bus,"business");
                current = Number(data.result[i][`${objectOptionsJson["tableColumnsNames"]}`])
                check = 0;
                for (var j = 0; j < data.result2.length; j++) {
                    if (data.result[i][`${objectOptionsJson["groupByColumnName"]}`] === data.result2[j][`${objectOptionsJson["groupByColumnName"]}`]) {
                        last = Number(data.result2[j][`${objectOptionsJson["tableColumnsNames"]}`])
                        check = 1
                        break
                    }
                }
                if (check == 0) {
                    last = 0
                }

                //alert(current + "," + last + "," + site)
                //alert(current > last)
                if (current > last) {
                    // per = Math.round(((current - last) / last) * 100)
                    dir = 'arrow-up'
                    color = 'danger'

                }
                else if (current < last) {
                    // per = Math.round(((last - current) / last) * 100)
                    dir = 'arrow-down'
                    color = 'success'

                } else if (current == last) {
                    // per = 0
                    dir = 'minus'
                    color = 'warning'
                }
                //alert(last + " " + current + " " + dir + " " + color)




                list.innerHTML += `<tr><td style="text-align:center;font-weight:bold;"><span class="bg-info" style="border-radius:4px;color:white;font-size:25px">&nbsp;&nbsp;${i + 1}&nbsp;&nbsp;<span></td><td style="text-align:left">${bus}</td><td style="text-align:left">${site}</td><td style="text-align:center">${current}&nbsp;<span class="text-${color}"><i class="fa fa-${dir}" aria-hidden="true"></i>&nbsp;<strong><small></small></strong></span></td><td style="text-align:center">${last}</td></tr>`
            }

            document.getElementById(divId).children[0].removeAttribute('onclick')
            document.getElementById(divId).children[0].setAttribute('onclick', `editWidgetOptions(${userWidgetId},'${divId}','${dashboardName}')`)

            resolve();
        }).fail(function (error) {
            reject(error);
        });
    });
}








// switch case function to create chart forms
function createChartForm(chartId, userChartId, divId) {
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["chartId"] = chartId
        $.ajax({
            "url": `/index/getChartFromId`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            switch (data[0]?.CHART_NAME) {
                case 'Bar Chart':
                    createBarChartForm(chartId, userChartId, divId, data[0].CHART_NAME)
                    break;
                case 'Column Chart':
                    createColumnChartForm(chartId, userChartId, divId, data[0].CHART_NAME)
                    break;
                case 'Line Chart':
                    createLineChartForm(chartId, userChartId, divId, data[0].CHART_NAME)
                    break;
                case 'Donut Chart':
                    createDonutChartForm(chartId, userChartId, divId, data[0].CHART_NAME)
                    break;
                case 'Area Chart':
                    createAreaChartForm(chartId, userChartId, divId, data[0].CHART_NAME)
                    break;
                case 'Pie Chart':
                    createPieChartForm(chartId, userChartId, divId, data[0].CHART_NAME)
                    break;
                case 'Half Radial Chart':
                    createHalfRadialChartForm(chartId, userChartId, divId, data[0].CHART_NAME)
                    break;
                case "Full Radial Chart":
                    createFullRadialChartForm(chartId, userChartId, divId, data[0].CHART_NAME)
                    break;
                case 'Absolute Value Comparison':
                    createAbsValCompForm(chartId, userChartId, divId, data[0].CHART_NAME)
                    break
                case "Absolute Value":
                    createAbsValForm(chartId, userChartId, divId, data[0].CHART_NAME)
                    break;
                case "Stacked Column Chart":
                    createColumnChartForm(chartId, userChartId, divId, data[0].CHART_NAME)
                    break;
                case "Data Trend Chart":
                    createDataTrendChartForm(chartId, userChartId, divId, data[0].CHART_NAME)
                    break;
                default:
                    break;
            }
            resolve([data, userChartId]); // Resolve the Promise with the data
        })
            .fail(function (error) {
                reject(error); // Reject the Promise if there's an error
            });
    });

}
// switch case function to save chart details
function submitChartButton(userChartId, divId) {
    var slider = document.getElementById('editChartSlider');
    slider.classList.remove('open');
    if ($('#objectType').val() === '1') {
        var chartName = $('#chartType option:selected').text();
        switch (chartName) {
            case "Bar Chart":
                saveBarJson(userChartId, divId)
                break;
            case "Column Chart":
                saveColumnJson(userChartId, divId)
                break;
            case "Line Chart":
                saveLineJson(userChartId, divId)
                break;
            case "Donut Chart":
                saveDonutJson(userChartId, divId)
                break
            case "Area Chart":
                saveAreaJson(userChartId, divId)
                break
            case "Pie Chart":
                savePieJson(userChartId, divId)
                break
            case "Half Radial Chart":
                saveHalfRadialJson(userChartId, divId)
                break
            case "Full Radial Chart":
                saveFullRadialJson(userChartId, divId)
                break
            case 'Absolute Value Comparison':
                saveAbsValCompJson(userChartId, divId)
                break
            case 'Absolute Value':
                saveAbsValJson(userChartId, divId)
            case 'Stacked Column Chart':
                saveColumnJson(userChartId, divId)
            case 'Data Trend Chart':
                saveDataTrendJson(userChartId, divId)
            default:
                break;
        }
    } else {
        var widgetName = $('#widgetType option:selected').text();
        switch (widgetName) {
            case 'PREVIOUS MONTH COMPARISON TABLE':
                savePrevMonthCompJson(userChartId, divId)
                break;
            case 'AVG MAX MIN RANGE WIDGET':
                saveAvgMaxMinRangeWidget(userChartId, divId)
                break;
            case 'PERCENTAGE BARS WIDGET':
                savePercentBarsWidget(userChartId, divId)
                break;
            case 'INCIDENT DETAILS':
                saveIncidentDetails(userChartId, divId)
                break;
                case 'DAILY DSR STATUS':
                    saveDailyDSRSTatus(userChartId, divId)
                    break;
            case 'INCIDENT MAP':
                saveIncidentMap(userChartId, divId)
                break;
            default:
                break;
        }
    }
}



// create chart and set chart functions


// data trend chart

function createDataTrendChartForm(chartId, userChartId, divId, chartName) {
    // document.getElementById('tableDropdown').setAttribute('disabled','true')
    document.getElementById('editChartWiseForm').innerHTML = ``
    document.getElementById('editChartWiseForm').innerHTML = ``
    var formHTML = `<div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="data">Data</label>
                            <select class="form-control" id="data">
                            <option value="DSR">DSR<option>
                            </select>
                        </div>
                    </div>`
    document.getElementById('editChartWiseForm').innerHTML = formHTML
    $('#data').select2({
        width: '21vw'
    });
    if (userChartId !== 0) {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        $.ajax({
            "url": `/index/getChartOptions`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            var chartOptionJson = JSON.parse(data[0].CHART_OPTIONS_JSON)
            console.log(chartOptionJson["groupByColumns"]);
            // $('#tableDropdown').val(`${data[0].TABLE_NAME}`).trigger('change')
            if ($('#colorSelector option[value="' + chartOptionJson[`colors`].toString() + '"]').length > 0) {
                $('#colorSelector').val(chartOptionJson[`colors`].toString()).trigger('change');
            } else {
                $('#colorSelect').val(chartOptionJson[`colors`]).trigger('change');
            }
            $('#data').val(chartOptionJson[`data`]).trigger('change');
        })
    }
}

function saveDataTrendJson(userChartId, divId) {
    var chartName = $('#chartType option:selected').text();
    var page = $('#pageName').val()
    var chartOptionJson = {}
    chartOptionJson["chartTitle"] = document.getElementById('chartTitle').value
    if ($('#colorSelector').val() === '') {
        chartOptionJson["colors"] = $('#colorSelect').val()
    } else {
        chartOptionJson["colors"] = $('#colorSelector').val().split(',')
    }
    chartOptionJson["data"] = $('#data').val()
    chartOptionJson["groupByColumn"] = uL
    chartOptionJson["groupByColumnName"] = uLName
    var jsonObj = {}
    jsonObj["userChartId"] = userChartId
    jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
    jsonObj["chartId"] = $('#chartType').val()
    jsonObj["chartOptionsJson"] = JSON.stringify(chartOptionJson)
    jsonObj["tableName"] = ''
    jsonObj["divId"] = divId
    jsonObj["pageName"] = $('#pageName').val()
    console.log(jsonObj);
    $.ajax({
        "url": `/index/saveLinearChartJsonAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        createDataQueriesDataTrend(data.userChartID, chartName, divId, page)
    })
}

function setDataTrendChart(userChartId, divId) {
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        jsonObj["filterString"] = filterString
        $.ajax({
            "url": `/index/getLinearChartDataAPI`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            console.log(data);
            var chartJson = JSON.parse(data.chartJson)
            var chartOptionsJson = JSON.parse(data.chartOptionsJson)
            var chartData = data.chartData
            var labels = data.labels
            var groupByColumn = chartOptionsJson["groupByColumn"]
            var tableColumns = chartOptionsJson["tableColumnsNames"]
            var dataset = []
            var labelDataset = []

            resolve();
        }).fail(function (error) {
            reject(error);
        });
    });
}

// bar chart
function createBarChartForm(chartId, userChartId, divId, chartName) {
    document.getElementById('tableDropdown').removeAttribute('onchange')
    document.getElementById('tableDropdown').setAttribute('onchange', 'getTableColumns(this.value);getTableGroupByColumns(this.value)')
    document.getElementById('editChartWiseForm').innerHTML = ``
    var formHTML = `<div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="columns">Colums</label>
                            <select class="form-control" id="columns" multiple>
                            
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="aggregation">Aggregation</label>
                            <select class="form-control" id="aggregation">
                            <option value="SUM">SUM</option>
                            <option value="COUNT">COUNT</option>
                            <option value="AVG">AVG</option>
                            <option value="MAX">MAX</option>
                            <option value="MIN">MIN</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="groupBy">Group By Column</label>
                            <select class="form-control" id="groupBy" onchange="getGroupByValues(this.value)">
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="groupByValues">Group By Column Values</label>
                            <select class="form-control" id="groupByValues" multiple>
                            </select>
                        </div>
                    </div>
  `
    document.getElementById('editChartWiseForm').innerHTML = formHTML
    $('#columns').select2({
        width: '21vw'
    });
    $('#groupByValues').select2({
        width: '21vw'
    });
    $('#groupBy').select2({
        width: '21vw'
    });

    $('#aggregation').select2({
        width: '21vw'
    });
    if (userChartId !== 0) {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        $.ajax({
            "url": `/index/getChartOptions`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            var chartOptionJson = JSON.parse(data[0].CHART_OPTIONS_JSON)
            console.log(chartOptionJson["groupByColumns"]);
            $('#tableDropdown').val(`${data[0].TABLE_NAME}`).trigger('change')
            if ($('#colorSelector option[value="' + chartOptionJson[`colors`].toString() + '"]').length > 0) {
                $('#colorSelector').val(chartOptionJson[`colors`].toString()).trigger('change');
            } else {
                $('#colorSelect').val(chartOptionJson[`colors`]).trigger('change');
            }
            setTimeout(() => {
                $('#columns').val(chartOptionJson[`tableColumns`]).trigger('change')
                $('#groupBy').val(chartOptionJson[`groupByColumn`]).trigger('change')
                $('#aggregation').val(chartOptionJson[`aggregation`]).trigger('change')
            }, 1000);

            var intervalId = setInterval(function () {
                if (document.getElementById('groupByValues').children.length > 0) {
                    $('#groupByValues').val(chartOptionJson[`groupByValues`]).trigger('change')
                    clearInterval(intervalId)
                }
            }, 200);

        })
    }


}
function saveBarJson(userChartId, divId) {
    var chartName = $('#chartType option:selected').text();
    var page = $('#pageName').val()
    var chartOptionJson = {}
    chartOptionJson["chartTitle"] = document.getElementById('chartTitle').value
    chartOptionJson["aggregation"] = $('#aggregation').val()
    chartOptionJson["groupByColumn"] = $('#groupBy').val()
    chartOptionJson["groupByColumnName"] = $('#groupBy').find('option:selected').text()
    chartOptionJson["tableColumns"] = $('#columns').val()
    var selectedValues = $('#columns').val()
    var selectedLabels = [];

    // Iterate over selected values and get corresponding labels
    $.each(selectedValues, function (index, value) {
        var label = $('#columns option[value="' + value + '"]').text();
        selectedLabels.push(label);
    });
    chartOptionJson["tableColumnsNames"] = selectedLabels
    chartOptionJson["table"] = $('#tableDropdown').val()
    chartOptionJson["tableName"] = $('#tableDropdown').find('option:selected').text()
    chartOptionJson["groupByValues"] = $('#groupByValues').val()
    if ($('#colorSelector').val() === '') {
        chartOptionJson["colors"] = $('#colorSelect').val()
    } else {
        chartOptionJson["colors"] = $('#colorSelector').val().split(',')
    }

    var jsonObj = {}
    jsonObj["userChartId"] = userChartId
    jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
    jsonObj["chartId"] = $('#chartType').val()
    jsonObj["chartOptionsJson"] = JSON.stringify(chartOptionJson)
    jsonObj["tableName"] = $('#tableDropdown').val()
    jsonObj["divId"] = divId
    jsonObj["pageName"] = $('#pageName').val()
    $.ajax({
        "url": `/index/saveLinearChartJsonAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        console.log(data.userChartID);
        createDataQueries(data.userChartID, chartName, divId, page)
    })


}
function setBarChart(userChartId, divId) {
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        jsonObj["filterString"] = filterString
        $.ajax({
            "url": `/index/getLinearChartDataAPI`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            console.log(data);
            var chartJson = JSON.parse(data.chartJson)
            var chartOptionsJson = JSON.parse(data.chartOptionsJson)
            var chartData = data.chartData
            var labels = data.labels
            var groupByColumn = chartOptionsJson["groupByColumn"]
            var tableColumns = chartOptionsJson["tableColumnsNames"]
            var dataset = []
            var labelDataset = []
            for (var i = 0; i < tableColumns.length; i++) {
                var obj = {}
                obj["name"] = tableColumns[i]
                var set = []
                for (var j = 0; j < chartData.length; j++) {
                    var column = tableColumns[i]
                    set.push(chartData[j][`${column}`])
                }
                obj["data"] = set
                dataset.push(obj)
            }
            for (var i = 0; i < labels.length; i++) {
                labelDataset.push(labels[i][`${groupByColumn}`])
            }

            var newJson = {}
            newJson["series"] = dataset
            newJson["text"] = chartOptionsJson["chartTitle"]
            newJson["categories"] = labelDataset
            newJson["colors"] = chartOptionsJson["colors"]
            console.log(chartJson, newJson);
            var newChartJson = replaceLeafKeys(chartJson, newJson)
            console.log(newChartJson);
            document.getElementById(divId).setAttribute('name', 'chart')
            var chartDivId = document.getElementById(divId).children[1].getAttribute('id')
            document.querySelector(`#${chartDivId}`).innerHTML = ``
            var chart = new ApexCharts(document.querySelector(`#${chartDivId}`), newChartJson);
            chart.render();
            //saveChartJson(userChartId,newChartJson)

            resolve();
        }).fail(function (error) {
            reject(error);
        });
    });
}



// column chart
function createColumnChartForm(chartId, userChartId, divId, chartName) {
    document.getElementById('tableDropdown').removeAttribute('onchange')
    document.getElementById('tableDropdown').setAttribute('onchange', 'getTableColumns(this.value);getTableGroupByColumns(this.value)')
    document.getElementById('editChartWiseForm').innerHTML = ``
    var formHTML = `<div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="columns">Colums</label>
                            <select class="form-control" id="columns" multiple>
                            
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="aggregation">Aggregation</label>
                            <select class="form-control" id="aggregation">
                            <option value="SUM">SUM</option>
                            <option value="COUNT">COUNT</option>
                            <option value="AVG">AVG</option>
                            <option value="MAX">MAX</option>
                            <option value="MIN">MIN</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="groupBy">Group By Column</label>
                            <select class="form-control" id="groupBy" onchange="getGroupByValues(this.value)">
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="groupByValues">Group By Column Values</label>
                            <select class="form-control" id="groupByValues" multiple>
                            </select>
                        </div>
                    </div>
  `
    document.getElementById('editChartWiseForm').innerHTML = formHTML
    $('#columns').select2({
        width: '21vw'
    });
    $('#groupByValues').select2({
        width: '21vw'
    });
    $('#groupBy').select2({
        width: '21vw'
    });

    $('#aggregation').select2({
        width: '21vw'
    });
    if (userChartId !== 0) {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        $.ajax({
            "url": `/index/getChartOptions`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            var chartOptionJson = JSON.parse(data[0].CHART_OPTIONS_JSON)
            console.log(chartOptionJson["groupByColumns"]);
            $('#tableDropdown').val(`${data[0].TABLE_NAME}`).trigger('change')
            // $('#colorSelector').val(chartOptionJson[`colors`].toString()).trigger('change')
            if ($('#colorSelector option[value="' + chartOptionJson[`colors`].toString() + '"]').length > 0) {
                $('#colorSelector').val(chartOptionJson[`colors`].toString()).trigger('change');
            } else {
                $('#colorSelect').val(chartOptionJson[`colors`]).trigger('change');
            }
            setTimeout(() => {
                $('#columns').val(chartOptionJson[`tableColumns`]).trigger('change')
                $('#groupBy').val(chartOptionJson[`groupByColumn`]).trigger('change')
                $('#aggregation').val(chartOptionJson[`aggregation`]).trigger('change')
            }, 1000);

            var intervalId = setInterval(function () {
                if (document.getElementById('groupByValues').children.length > 0) {
                    $('#groupByValues').val(chartOptionJson[`groupByValues`]).trigger('change')
                    clearInterval(intervalId)
                }
            }, 200);

        })
    }


}



function saveColumnJson(userChartId, divId) {
    var chartName = $('#chartType option:selected').text();
    var page = $('#pageName').val()
    var chartOptionJson = {}
    chartOptionJson["chartTitle"] = document.getElementById('chartTitle').value
    chartOptionJson["aggregation"] = $('#aggregation').val()
    chartOptionJson["groupByColumn"] = $('#groupBy').val()
    chartOptionJson["groupByColumnName"] = $('#groupBy').find('option:selected').text()
    chartOptionJson["tableColumns"] = $('#columns').val()
    var selectedValues = $('#columns').val()
    var selectedLabels = [];

    // Iterate over selected values and get corresponding labels
    $.each(selectedValues, function (index, value) {
        var label = $('#columns option[value="' + value + '"]').text();
        selectedLabels.push(label);
    });
    chartOptionJson["tableColumnsNames"] = selectedLabels
    chartOptionJson["table"] = $('#tableDropdown').val()
    chartOptionJson["tableName"] = $('#tableDropdown').find('option:selected').text()
    chartOptionJson["groupByValues"] = $('#groupByValues').val()


    if ($('#colorSelector').val() === '') {
        chartOptionJson["colors"] = $('#colorSelect').val()
    } else {
        chartOptionJson["colors"] = $('#colorSelector').val().split(',')
    }
    var jsonObj = {}
    jsonObj["userChartId"] = userChartId
    jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
    jsonObj["chartId"] = $('#chartType').val()
    jsonObj["chartOptionsJson"] = JSON.stringify(chartOptionJson)
    jsonObj["tableName"] = $('#tableDropdown').val()
    jsonObj["divId"] = divId
    jsonObj["pageName"] = $('#pageName').val()
    $.ajax({
        "url": `/index/saveLinearChartJsonAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        console.log(data.userChartID);
        createDataQueries(data.userChartID, chartName, divId, page)
    })


}

function setColumnChart(userChartId, divId) {
    return new Promise((resolve, reject) => {
        var jsonObj = {};
        jsonObj["userChartId"] = userChartId;
        jsonObj["filterString"] = filterString;
        
        $.ajax({
            "url": `/index/getLinearChartDataAPI`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            console.log(data);

            var chartJson = JSON.parse(data.chartJson);
            var chartOptionsJson = JSON.parse(data.chartOptionsJson);
            var chartData = data.chartData;
            var labels = data.labels;
            var groupByColumn = chartOptionsJson["groupByColumn"];
            var tableColumns = chartOptionsJson["tableColumnsNames"];
            var dataset = [];
            var labelDataset = [];

            // Define custom sort orders for two different sets of values
            const sortOrder1 = {  // Order for 'AVAILABLE', 'WORKING', 'NOTWORKING'
                "AVAILABLE": 1,
                "WORKING": 2,
                "NOTWORKING": 3
            };

            const sortOrder2 = {  // Order for 'AUTHORIZED', 'AVAILABLE', 'GAP'
               
                "REQUIRED": 1,
                "AVAILABLE": 2,
                "GAP": 3
            };

            // Month abbreviation to month number mapping (3-letter uppercase abbreviations)
            const monthAbbreviationToNumber = {
                "JAN": 1,
                "FEB": 2,
                "MAR": 3,
                "APR": 4,
                "MAY": 5,
                "JUN": 6,
                "JUL": 7,
                "AUG": 8,
                "SEP": 9,
                "OCT": 10,
                "NOV": 11,
                "DEC": 12
            };

            // Sort the labels by month abbreviation
            labels.sort((a, b) => {
                let monthA = a[groupByColumn]; // Ensure uppercase
                let monthB = b[groupByColumn]; // Ensure uppercase
                return monthAbbreviationToNumber[monthA] - monthAbbreviationToNumber[monthB]; // Sort by month number
            });

            // Extract sorted month abbreviations into labelDataset
            for (var i = 0; i < labels.length; i++) {
                labelDataset.push(labels[i][`${groupByColumn}`]);
            }

            // Sort chartData to align with sorted labels and apply custom sort order for specific values
            let sortedChartData = [];
            for (let i = 0; i < labels.length; i++) {
                let labelMonth = labels[i][groupByColumn];
                for (let j = 0; j < chartData.length; j++) {
                    if (chartData[j][groupByColumn] === labelMonth) {
                        sortedChartData.push(chartData[j]);
                        break;
                    }
                }
            }

            // Function to apply the correct sorting order based on the value in the column
            function applySortingOrder(value, orderMap) {
                return orderMap[value] || Number.MAX_VALUE; // Default to max value if not found
            }

            // Apply sorting order for each relevant value in chartData
            sortedChartData.forEach((dataPoint) => {
                tableColumns.forEach((column) => {
                    if (dataPoint[column]) {
                        const value = dataPoint[column];
                        // Check which order to apply based on the value
                        if (sortOrder1[value] !== undefined) {
                            // Apply sorting order from the first set
                            dataPoint[column] = value;
                        } else if (sortOrder2[value] !== undefined) {
                            // Apply sorting order from the second set
                            dataPoint[column] = value;
                        }
                    }
                });
            });

            // Sort the chartData array based on the order of values
            sortedChartData.sort((a, b) => {
                let result = 0;
                tableColumns.forEach((column) => {
                    if (a[column] && b[column]) {
                        const valueA = a[column];
                        const valueB = b[column];
                        if (sortOrder1[valueA] !== undefined && sortOrder1[valueB] !== undefined) {
                            result = sortOrder1[valueA] - sortOrder1[valueB];
                        } else if (sortOrder2[valueA] !== undefined && sortOrder2[valueB] !== undefined) {
                            result = sortOrder2[valueA] - sortOrder2[valueB];
                        }
                    }
                });
                return result;
            });

            // Prepare dataset (make sure to align chartData with sorted labels)
            for (var i = 0; i < tableColumns.length; i++) {
                var obj = {};
                obj["name"] = tableColumns[i];
                var set = [];
                for (var j = 0; j < sortedChartData.length; j++) {
                    var column = tableColumns[i];
                    set.push(sortedChartData[j][`${column}`]);
                }
                obj["data"] = set;
                dataset.push(obj);
            }

            // Create a new chart JSON with sorted months and aligned data
            var newJson = {};
            newJson["series"] = dataset;
            newJson["text"] = chartOptionsJson["chartTitle"];
            newJson["categories"] = labelDataset;
            newJson["colors"] = chartOptionsJson["colors"];
            console.log(chartJson, newJson);

            // Replace the chart JSON keys and render the chart
            var newChartJson = replaceLeafKeys(chartJson, newJson);
            console.log(newChartJson);
            document.getElementById(divId).setAttribute('name', 'chart');
            var chartDivId = document.getElementById(divId).children[1].getAttribute('id');
            document.querySelector(`#${chartDivId}`).innerHTML = ``;

            var chart = new ApexCharts(document.querySelector(`#${chartDivId}`), newChartJson);
            chart.render();

            resolve();
        }).fail(function (error) {
            reject(error);
        });
    });
}




// line chart
function createLineChartForm(chartId, userChartId, divId, chartName) {
    document.getElementById('tableDropdown').removeAttribute('onchange')
    document.getElementById('tableDropdown').setAttribute('onchange', 'getTableColumns(this.value);getTableGroupByColumns(this.value)')
    document.getElementById('editChartWiseForm').innerHTML = ``
    var formHTML = `<div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="columns">Colums</label>
                            <select class="form-control" id="columns" multiple>
                            
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="aggregation">Aggregation</label>
                            <select class="form-control" id="aggregation">
                            <option value="SUM">SUM</option>
                            <option value="COUNT">COUNT</option>
                            <option value="AVG">AVG</option>
                            <option value="MAX">MAX</option>
                            <option value="MIN">MIN</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="groupBy">Group By Column</label>
                            <select class="form-control" id="groupBy" onchange="getGroupByValues(this.value)">
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="groupByValues">Group By Column Values</label>
                            <select class="form-control" id="groupByValues" multiple>
                            </select>
                        </div>
                    </div>
  `
    document.getElementById('editChartWiseForm').innerHTML = formHTML
    $('#columns').select2({
        width: '21vw'
    });
    $('#groupByValues').select2({
        width: '21vw'
    });
    $('#groupBy').select2({
        width: '21vw'
    });

    $('#aggregation').select2({
        width: '21vw'
    });
    if (userChartId !== 0) {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        $.ajax({
            "url": `/index/getChartOptions`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            var chartOptionJson = JSON.parse(data[0].CHART_OPTIONS_JSON)
            console.log(chartOptionJson["groupByColumns"]);
            $('#tableDropdown').val(`${data[0].TABLE_NAME}`).trigger('change')
            if ($('#colorSelector option[value="' + chartOptionJson[`colors`].toString() + '"]').length > 0) {
                $('#colorSelector').val(chartOptionJson[`colors`].toString()).trigger('change');
            } else {
                $('#colorSelect').val(chartOptionJson[`colors`]).trigger('change');
            } setTimeout(() => {
                $('#columns').val(chartOptionJson[`tableColumns`]).trigger('change')
                $('#groupBy').val(chartOptionJson[`groupByColumn`]).trigger('change')
                $('#aggregation').val(chartOptionJson[`aggregation`]).trigger('change')
            }, 1000);

            var intervalId = setInterval(function () {
                if (document.getElementById('groupByValues').children.length > 0) {
                    $('#groupByValues').val(chartOptionJson[`groupByValues`]).trigger('change')
                    clearInterval(intervalId)
                }
            }, 200);

        })
    }


}
function saveLineJson(userChartId, divId) {
    var chartName = $('#chartType option:selected').text();
    var page = $('#pageName').val()
    var chartOptionJson = {}
    chartOptionJson["chartTitle"] = document.getElementById('chartTitle').value
    chartOptionJson["aggregation"] = $('#aggregation').val()
    chartOptionJson["groupByColumn"] = $('#groupBy').val()
    chartOptionJson["groupByColumnName"] = $('#groupBy').find('option:selected').text()
    chartOptionJson["tableColumns"] = $('#columns').val()
    var selectedValues = $('#columns').val()
    var selectedLabels = [];

    // Iterate over selected values and get corresponding labels
    $.each(selectedValues, function (index, value) {
        var label = $('#columns option[value="' + value + '"]').text();
        selectedLabels.push(label);
    });
    chartOptionJson["tableColumnsNames"] = selectedLabels
    chartOptionJson["table"] = $('#tableDropdown').val()
    chartOptionJson["tableName"] = $('#tableDropdown').find('option:selected').text()
    chartOptionJson["groupByValues"] = $('#groupByValues').val()
    if ($('#colorSelector').val() === '') {
        chartOptionJson["colors"] = $('#colorSelect').val()
    } else {
        chartOptionJson["colors"] = $('#colorSelector').val().split(',')
    }
    var jsonObj = {}
    jsonObj["userChartId"] = userChartId
    jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
    jsonObj["chartId"] = $('#chartType').val()
    jsonObj["chartOptionsJson"] = JSON.stringify(chartOptionJson)
    jsonObj["tableName"] = $('#tableDropdown').val()
    jsonObj["divId"] = divId
    jsonObj["pageName"] = $('#pageName').val()
    $.ajax({
        "url": `/index/saveLinearChartJsonAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        console.log(data.userChartID);
        createDataQueries(data.userChartID, chartName, divId, page)
    })


}
function setLineChart(userChartId, divId) {
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        jsonObj["filterString"] = filterString
        $.ajax({
            "url": `/index/getLinearChartDataAPI`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            console.log(data);
            var chartJson = JSON.parse(data.chartJson)
            var chartOptionsJson = JSON.parse(data.chartOptionsJson)
            var chartData = data.chartData
            var labels = data.labels
            var groupByColumn = chartOptionsJson["groupByColumn"]
            var tableColumns = chartOptionsJson["tableColumnsNames"]
            var dataset = []
            var labelDataset = []
            for (var i = 0; i < tableColumns.length; i++) {
                var obj = {}
                obj["name"] = tableColumns[i]
                var set = []
                for (var j = 0; j < chartData.length; j++) {
                    var column = tableColumns[i]
                    set.push(chartData[j][`${column}`])
                }
                obj["data"] = set
                dataset.push(obj)
            }
            for (var i = 0; i < labels.length; i++) {
                labelDataset.push(labels[i][`${groupByColumn}`])
            }

            var newJson = {}
            newJson["series"] = dataset
            newJson["text"] = chartOptionsJson["chartTitle"]
            newJson["categories"] = labelDataset
            newJson["colors"] = chartOptionsJson["colors"]
            console.log(chartJson, newJson);
            var newChartJson = replaceLeafKeys(chartJson, newJson)
            console.log(newChartJson);
            document.getElementById(divId).setAttribute('name', 'chart')
            var chartDivId = document.getElementById(divId).children[1].getAttribute('id')
            document.querySelector(`#${chartDivId}`).innerHTML = ``
            var chart = new ApexCharts(document.querySelector(`#${chartDivId}`), newChartJson);
            chart.render();
            //saveChartJson(userChartId,newChartJson)

            resolve();
        }).fail(function (error) {
            reject(error);
        });
    });
}


// Donut Form
function createDonutForm(chartId, userChartId, divId, chartName) {
    document.getElementById('tableDropdown').removeAttribute('onchange')
    document.getElementById('tableDropdown').setAttribute('onchange', 'getTableColumns(this.value);getTableGroupByColumns(this.value)')
    document.getElementById('editChartWiseForm').innerHTML = ``
    var formHTML = `<div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="columns">Colums</label>
                            <select class="form-control" id="columns" multiple>
                            
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="aggregation">Aggregation</label>
                            <select class="form-control" id="aggregation">
                            <option value="SUM">SUM</option>
                            <option value="COUNT">COUNT</option>
                            <option value="AVG">AVG</option>
                            <option value="MAX">MAX</option>
                            <option value="MIN">MIN</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="groupBy">Group By Column</label>
                            <select class="form-control" id="groupBy" onchange="getGroupByValues(this.value)">
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="groupByValues">Group By Column Values</label>
                            <select class="form-control" id="groupByValues" multiple>
                            </select>
                        </div>
                    </div>
  `
    document.getElementById('editChartWiseForm').innerHTML = formHTML
    $('#columns').select2({
        width: '21vw'
    });
    $('#groupByValues').select2({
        width: '21vw'
    });
    $('#groupBy').select2({
        width: '21vw'
    });

    $('#aggregation').select2({
        width: '21vw'
    });
    if (userChartId !== 0) {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        $.ajax({
            "url": `/index/getChartOptions`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            var chartOptionJson = JSON.parse(data[0].CHART_OPTIONS_JSON)
            console.log(chartOptionJson["groupByColumns"]);
            $('#tableDropdown').val(`${data[0].TABLE_NAME}`).trigger('change')
            $('#colorSelector').val(chartOptionJson[`colors`]).trigger('change')

            setTimeout(() => {
                $('#columns').val(chartOptionJson[`tableColumns`]).trigger('change')
                $('#groupBy').val(chartOptionJson[`groupByColumn`]).trigger('change')
                $('#aggregation').val(chartOptionJson[`aggregation`]).trigger('change')
            }, 1000);

            var intervalId = setInterval(function () {
                if (document.getElementById('groupByValues').children.length > 0) {
                    $('#groupByValues').val(chartOptionJson[`groupByValues`]).trigger('change')
                    clearInterval(intervalId)
                }
            }, 200);

        })
    }


}
function saveDonutJson(userChartId, divId) {
    var chartName = $('#chartType option:selected').text();
    var page = $('#pageName').val()
    var chartOptionJson = {}
    chartOptionJson["chartTitle"] = document.getElementById('chartTitle').value
    chartOptionJson["aggregation"] = $('#aggregation').val()
    chartOptionJson["groupByColumn"] = $('#groupBy').val()
    chartOptionJson["groupByColumnName"] = $('#groupBy').find('option:selected').text()
    chartOptionJson["tableColumns"] = $('#columns').val()
    var selectedValues = $('#columns').val()
    var selectedLabels = [];

    // Iterate over selected values and get corresponding labels
    $.each(selectedValues, function (index, value) {
        var label = $('#columns option[value="' + value + '"]').text();
        selectedLabels.push(label);
    });
    chartOptionJson["tableColumnsNames"] = selectedLabels
    chartOptionJson["table"] = $('#tableDropdown').val()
    chartOptionJson["tableName"] = $('#tableDropdown').find('option:selected').text()
    chartOptionJson["groupByValues"] = $('#groupByValues').val()

    var jsonObj = {}
    jsonObj["userChartId"] = userChartId
    jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
    jsonObj["chartId"] = $('#chartType').val()
    jsonObj["chartOptionsJson"] = JSON.stringify(chartOptionJson)
    jsonObj["tableName"] = $('#tableDropdown').val()
    jsonObj["divId"] = divId
    jsonObj["pageName"] = $('#pageName').val()
    $.ajax({
        "url": `/index/saveLinearChartJsonAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        console.log(data.userChartID);
        createDataQueries(data.userChartID, chartName, divId, page)
    })


}
function setDonutChart(userChartId, divId) {
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        jsonObj["filterString"] = filterString
        $.ajax({
            "url": `/index/getLinearChartDataAPI`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            console.log(data);
            var chartJson = JSON.parse(data.chartJson)
            var chartOptionsJson = JSON.parse(data.chartOptionsJson)
            var chartData = data.chartData
            var labels = data.labels
            var groupByColumn = chartOptionsJson["groupByColumn"]
            var tableColumns = chartOptionsJson["tableColumnsNames"]
            var dataset = []
            var labelDataset = []
            for (var i = 0; i < tableColumns.length; i++) {
                var obj = {}
                obj["name"] = tableColumns[i]
                var set = []
                for (var j = 0; j < chartData.length; j++) {
                    var column = tableColumns[i]
                    set.push(chartData[j][`${column}`])
                }
                obj["data"] = set
                dataset.push(obj)
            }
            for (var i = 0; i < labels.length; i++) {
                labelDataset.push(labels[i][`${groupByColumn}`])
            }

            var newJson = {}
            newJson["series"] = dataset
            newJson["text"] = chartOptionsJson["chartTitle"]
            newJson["categories"] = labelDataset
            console.log(chartJson, newJson);
            var newChartJson = replaceLeafKeys(chartJson, newJson)
            console.log(newChartJson);
            document.getElementById(divId).setAttribute('name', 'chart')
            var chartDivId = document.getElementById(divId).children[1].getAttribute('id')
            document.querySelector(`#${chartDivId}`).innerHTML = ``
            var chart = new ApexCharts(document.querySelector(`#${chartDivId}`), newChartJson);
            chart.render();
            //saveChartJson(userChartId,newChartJson)

            resolve();
        }).fail(function (error) {
            reject(error);
        });
    });
}


// Area chart
function createAreaChartForm(chartId, userChartId, divId, chartName) {
    document.getElementById('tableDropdown').removeAttribute('onchange')
    document.getElementById('tableDropdown').setAttribute('onchange', 'getTableColumns(this.value);getTableGroupByColumns(this.value)')
    document.getElementById('editChartWiseForm').innerHTML = ``
    var formHTML = `<div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="columns">Colums</label>
                            <select class="form-control" id="columns" multiple>
                            
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="aggregation">Aggregation</label>
                            <select class="form-control" id="aggregation">
                            <option value="SUM">SUM</option>
                            <option value="COUNT">COUNT</option>
                            <option value="AVG">AVG</option>
                            <option value="MAX">MAX</option>
                            <option value="MIN">MIN</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="groupBy">Group By Column</label>
                            <select class="form-control" id="groupBy" onchange="getGroupByValues(this.value)">
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="groupByValues">Group By Column Values</label>
                            <select class="form-control" id="groupByValues" multiple>
                            </select>
                        </div>
                    </div>
  `
    document.getElementById('editChartWiseForm').innerHTML = formHTML
    $('#columns').select2({
        width: '21vw'
    });
    $('#groupByValues').select2({
        width: '21vw'
    });
    $('#groupBy').select2({
        width: '21vw'
    });

    $('#aggregation').select2({
        width: '21vw'
    });
    if (userChartId !== 0) {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        $.ajax({
            "url": `/index/getChartOptions`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            var chartOptionJson = JSON.parse(data[0].CHART_OPTIONS_JSON)
            console.log(chartOptionJson["groupByColumns"]);
            $('#tableDropdown').val(`${data[0].TABLE_NAME}`).trigger('change')
            if ($('#colorSelector option[value="' + chartOptionJson[`colors`].toString() + '"]').length > 0) {
                $('#colorSelector').val(chartOptionJson[`colors`].toString()).trigger('change');
            } else {
                $('#colorSelect').val(chartOptionJson[`colors`]).trigger('change');
            } setTimeout(() => {
                $('#columns').val(chartOptionJson[`tableColumns`]).trigger('change')
                $('#groupBy').val(chartOptionJson[`groupByColumn`]).trigger('change')
                $('#aggregation').val(chartOptionJson[`aggregation`]).trigger('change')
            }, 1000);

            var intervalId = setInterval(function () {
                if (document.getElementById('groupByValues').children.length > 0) {
                    $('#groupByValues').val(chartOptionJson[`groupByValues`]).trigger('change')
                    clearInterval(intervalId)
                }
            }, 200);

        })
    }


}
function saveAreaJson(userChartId, divId) {
    var chartName = $('#chartType option:selected').text();
    var page = $('#pageName').val()
    var chartOptionJson = {}
    chartOptionJson["chartTitle"] = document.getElementById('chartTitle').value
    chartOptionJson["aggregation"] = $('#aggregation').val()
    chartOptionJson["groupByColumn"] = $('#groupBy').val()
    chartOptionJson["groupByColumnName"] = $('#groupBy').find('option:selected').text()
    chartOptionJson["tableColumns"] = $('#columns').val()
    var selectedValues = $('#columns').val()
    var selectedLabels = [];

    // Iterate over selected values and get corresponding labels
    $.each(selectedValues, function (index, value) {
        var label = $('#columns option[value="' + value + '"]').text();
        selectedLabels.push(label);
    });
    chartOptionJson["tableColumnsNames"] = selectedLabels
    chartOptionJson["table"] = $('#tableDropdown').val()
    chartOptionJson["tableName"] = $('#tableDropdown').find('option:selected').text()
    chartOptionJson["groupByValues"] = $('#groupByValues').val()
    if ($('#colorSelector').val() === '') {
        chartOptionJson["colors"] = $('#colorSelect').val()
    } else {
        chartOptionJson["colors"] = $('#colorSelector').val().split(',')
    }
    var jsonObj = {}
    jsonObj["userChartId"] = userChartId
    jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
    jsonObj["chartId"] = $('#chartType').val()
    jsonObj["chartOptionsJson"] = JSON.stringify(chartOptionJson)
    jsonObj["tableName"] = $('#tableDropdown').val()
    jsonObj["divId"] = divId
    jsonObj["pageName"] = $('#pageName').val()
    $.ajax({
        "url": `/index/saveLinearChartJsonAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        console.log(data.userChartID);
        createDataQueries(data.userChartID, chartName, divId, page)
    })


}
function setAreaChart(userChartId, divId) {
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        jsonObj["filterString"] = filterString
        $.ajax({
            "url": `/index/getLinearChartDataAPI`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            console.log(data);
            var chartJson = JSON.parse(data.chartJson)
            var chartOptionsJson = JSON.parse(data.chartOptionsJson)
            var chartData = data.chartData
            var labels = data.labels
            var groupByColumn = chartOptionsJson["groupByColumn"]
            var tableColumns = chartOptionsJson["tableColumnsNames"]
            var dataset = []
            var labelDataset = []
            for (var i = 0; i < tableColumns.length; i++) {
                var obj = {}
                obj["name"] = tableColumns[i]
                var set = []
                for (var j = 0; j < chartData.length; j++) {
                    var column = tableColumns[i]
                    set.push(chartData[j][`${column}`])
                }
                obj["data"] = set
                dataset.push(obj)
            }
            for (var i = 0; i < labels.length; i++) {
                labelDataset.push(labels[i][`${groupByColumn}`])
            }

            var newJson = {}
            newJson["series"] = dataset
            newJson["text"] = chartOptionsJson["chartTitle"]
            newJson["labels"] = labelDataset
            newJson["colors"] = chartOptionsJson["colors"]
            console.log(chartJson, newJson);
            var newChartJson = replaceLeafKeys(chartJson, newJson)
            console.log(newChartJson);
            document.getElementById(divId).setAttribute('name', 'chart')
            var chartDivId = document.getElementById(divId).children[1].getAttribute('id')
            document.querySelector(`#${chartDivId}`).innerHTML = ``
            var chart = new ApexCharts(document.querySelector(`#${chartDivId}`), newChartJson);
            chart.render();
            //saveChartJson(userChartId,newChartJson)

            resolve();
        }).fail(function (error) {
            reject(error);
        });
    });
}


// Pie chart
function createPieChartForm(chartId, userChartId, divId, chartName) {
    document.getElementById('tableDropdown').removeAttribute('onchange')
    document.getElementById('tableDropdown').setAttribute('onchange', 'getTableColumns(this.value);getTableGroupByColumns(this.value)')
    document.getElementById('editChartWiseForm').innerHTML = ``
    var formHTML = `<div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="columns">Colums</label>
                            <select class="form-control" id="columns">
                            
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="aggregation">Aggregation</label>
                            <select class="form-control" id="aggregation">
                            <option value="SUM">SUM</option>
                            <option value="COUNT">COUNT</option>
                            <option value="AVG">AVG</option>
                            <option value="MAX">MAX</option>
                            <option value="MIN">MIN</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="groupBy">Group By Column</label>
                            <select class="form-control" id="groupBy" onchange="getGroupByValues(this.value)">
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="groupByValues">Group By Column Values</label>
                            <select class="form-control" id="groupByValues" multiple>
                            </select>
                        </div>
                    </div>
  `
    document.getElementById('editChartWiseForm').innerHTML = formHTML
    $('#columns').select2({
        width: '21vw'
    });
    $('#groupByValues').select2({
        width: '21vw'
    });
    $('#groupBy').select2({
        width: '21vw'
    });

    $('#aggregation').select2({
        width: '21vw'
    });
    if (userChartId !== 0) {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        $.ajax({
            "url": `/index/getChartOptions`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            var chartOptionJson = JSON.parse(data[0].CHART_OPTIONS_JSON)
            console.log(chartOptionJson["groupByColumns"]);
            $('#tableDropdown').val(`${data[0].TABLE_NAME}`).trigger('change')
            if ($('#colorSelector option[value="' + chartOptionJson[`colors`].toString() + '"]').length > 0) {
                $('#colorSelector').val(chartOptionJson[`colors`].toString()).trigger('change');
            } else {
                $('#colorSelect').val(chartOptionJson[`colors`]).trigger('change');
            } setTimeout(() => {
                $('#columns').val(chartOptionJson[`tableColumns`]).trigger('change')
                $('#groupBy').val(chartOptionJson[`groupByColumn`]).trigger('change')
                $('#aggregation').val(chartOptionJson[`aggregation`]).trigger('change')
            }, 1000);

            var intervalId = setInterval(function () {
                if (document.getElementById('groupByValues').children.length > 0) {
                    $('#groupByValues').val(chartOptionJson[`groupByValues`]).trigger('change')
                    clearInterval(intervalId)
                }
            }, 200);

        })
    }


}
function savePieJson(userChartId, divId) {
    var chartName = $('#chartType option:selected').text();
    var page = $('#pageName').val()
    var chartOptionJson = {}
    chartOptionJson["chartTitle"] = document.getElementById('chartTitle').value
    chartOptionJson["aggregation"] = $('#aggregation').val()
    chartOptionJson["groupByColumn"] = $('#groupBy').val()
    chartOptionJson["groupByColumnName"] = $('#groupBy').find('option:selected').text()
    chartOptionJson["tableColumns"] = $('#columns').val()
    chartOptionJson["tableColumnsNames"] = $('#columns').find('option:selected').text()
    chartOptionJson["table"] = $('#tableDropdown').val()
    chartOptionJson["tableName"] = $('#tableDropdown').find('option:selected').text()
    chartOptionJson["groupByValues"] = $('#groupByValues').val()
    if ($('#colorSelector').val() === '') {
        chartOptionJson["colors"] = $('#colorSelect').val()
    } else {
        chartOptionJson["colors"] = $('#colorSelector').val().split(',')
    }
    var jsonObj = {}
    jsonObj["userChartId"] = userChartId
    jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
    jsonObj["chartId"] = $('#chartType').val()
    jsonObj["chartOptionsJson"] = JSON.stringify(chartOptionJson)
    jsonObj["tableName"] = $('#tableDropdown').val()
    jsonObj["divId"] = divId
    jsonObj["pageName"] = $('#pageName').val()
    $.ajax({
        "url": `/index/saveLinearChartJsonAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        console.log(data.userChartID);
        createDataQueries(data.userChartID, chartName, divId, page)
    })


}
function setPieChart(userChartId, divId) {
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        jsonObj["filterString"] = filterString
        $.ajax({
            "url": `/index/getLinearChartDataAPI`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            console.log(data);
            var chartJson = JSON.parse(data.chartJson)
            var chartOptionsJson = JSON.parse(data.chartOptionsJson)
            var chartData = data.chartData
            var labels = data.labels
            var groupByColumn = chartOptionsJson["groupByColumn"]
            var tableColumns = chartOptionsJson["tableColumnsNames"]
            var dataset = []
            var labelDataset = []
            for (var i = 0; i < chartData.length; i++) {
                dataset.push(chartData[i][`${tableColumns}`])
            }
            for (var i = 0; i < labels.length; i++) {
                labelDataset.push(labels[i][`${groupByColumn}`])
            }

            var newJson = {}
            newJson["series"] = dataset
            newJson["text"] = chartOptionsJson["chartTitle"]
            newJson["labels"] = labelDataset
            newJson["colors"] = chartOptionsJson["colors"]
            console.log(chartJson, newJson);
            var newChartJson = replaceLeafKeys(chartJson, newJson)
            console.log(newChartJson);
            document.getElementById(divId).setAttribute('name', 'chart')
            var chartDivId = document.getElementById(divId).children[1].getAttribute('id')
            document.querySelector(`#${chartDivId}`).innerHTML = ``
            var chart = new ApexCharts(document.querySelector(`#${chartDivId}`), newChartJson);
            chart.render();
            //saveChartJson(userChartId,newChartJson)

            resolve();
        }).fail(function (error) {
            reject(error);
        });
    });
}


//half radial
function createHalfRadialChartForm(chartId, userChartId, divId, chartName) {
    document.getElementById('tableDropdown').removeAttribute('onchange')
    document.getElementById('tableDropdown').setAttribute('onchange', 'getActMaxColumns(this.value)')
    document.getElementById('editChartWiseForm').innerHTML = ``
    var formHTML = `<div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="actValColumn">Actual Value Colum</label>
                            <select class="form-control" id="actValColumn">
                            
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="maxValColumn">Maximum Value Colum</label>
                            <select class="form-control" id="maxValColumn">
                            
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="aggregation">Aggregation</label>
                            <select class="form-control" id="aggregation">
                            <option value="SUM">SUM</option>
                            <option value="COUNT">COUNT</option>
                            <option value="AVG">AVG</option>
                            <option value="MAX">MAX</option>
                            <option value="MIN">MIN</option>
                            </select>
                        </div>
                    </div>
                            `
    document.getElementById('editChartWiseForm').innerHTML = formHTML
    $('#actValColumn').select2({
        width: '21vw'
    });
    $('#maxValColumn').select2({
        width: '21vw'
    });
    $('#aggregation').select2({
        width: '21vw'
    });
    if (userChartId !== 0) {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        $.ajax({
            "url": `/index/getChartOptions`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            var chartOptionJson = JSON.parse(data[0].CHART_OPTIONS_JSON)
            console.log(chartOptionJson["groupByColumns"]);
            $('#tableDropdown').val(`${data[0].TABLE_NAME}`).trigger('change')
            if ($('#colorSelector option[value="' + chartOptionJson[`colors`].toString() + '"]').length > 0) {
                $('#colorSelector').val(chartOptionJson[`colors`].toString()).trigger('change');
            } else {
                $('#colorSelect').val(chartOptionJson[`colors`]).trigger('change');
            }
            setTimeout(() => {
                $('#actValColumn').val(chartOptionJson[`actValColumn`]).trigger('change')
                $('#maxValColumn').val(chartOptionJson[`maxValColumn`]).trigger('change')
                $('#aggregation').val(chartOptionJson[`aggregation`]).trigger('change')
            }, 1000);

        })
    }


}
function saveHalfRadialJson(userChartId, divId) {
    var chartName = $('#chartType option:selected').text();
    var page = $('#pageName').val()
    var chartOptionJson = {}
    chartOptionJson["chartTitle"] = document.getElementById('chartTitle').value
    chartOptionJson["aggregation"] = $('#aggregation').val()
    chartOptionJson["tableColumns"] = [$('#actValColumn').val(), $('#maxValColumn').val()]
    chartOptionJson["tableColumnsNames"] = [$('#actValColumn').find('option:selected').text(), $('#maxValColumn').find('option:selected').text()]
    chartOptionJson["actValColumn"] = $('#actValColumn').val()
    chartOptionJson["maxValColumn"] = $('#maxValColumn').val()
    chartOptionJson["table"] = $('#tableDropdown').val()
    chartOptionJson["tableName"] = $('#tableDropdown').find('option:selected').text()
    //chartOptionJson["groupByValues"] = $('#groupByValues').val()
    if ($('#colorSelector').val() === '') {
        chartOptionJson["colors"] = $('#colorSelect').val()
    } else {
        chartOptionJson["colors"] = $('#colorSelector').val().split(',')
    }
    var jsonObj = {}
    jsonObj["userChartId"] = userChartId
    jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
    jsonObj["chartId"] = $('#chartType').val()
    jsonObj["chartOptionsJson"] = JSON.stringify(chartOptionJson)
    jsonObj["tableName"] = $('#tableDropdown').val()
    jsonObj["divId"] = divId
    jsonObj["pageName"] = $('#pageName').val()
    $.ajax({
        "url": `/index/saveLinearChartJsonAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        console.log(data.userChartID);
        createDataPercentQueries(data.userChartID, chartName, divId, page)
    })


}
function setHalfRadialChart(userChartId, divId) {
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        jsonObj["filterString"] = filterString
        $.ajax({
            "url": `/index/getPercentChartDataAPI`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            console.log(data);
            var chartJson = JSON.parse(data.chartJson)
            var chartOptionsJson = JSON.parse(data.chartOptionsJson)
            var chartData = data.chartData
            var labels = ['Percentage']
            //var groupByColumn = chartOptionsJson["groupByColumn"]
            var tableColumns = chartOptionsJson["tableColumnsNames"]
            var percentage = ((parseInt(chartData[0][`${tableColumns[0]}`]) / parseInt(chartData[0][`${tableColumns[1]}`])) * 100).toFixed(2)
            var dataset = [percentage]

            var newJson = {}
            newJson["series"] = dataset
            newJson["text"] = chartOptionsJson["chartTitle"]
            newJson["labels"] = labels
            newJson["colors"] = chartOptionsJson["colors"]
            console.log(chartJson, newJson);
            var newChartJson = replaceLeafKeys(chartJson, newJson)
            console.log(newChartJson);
            document.getElementById(divId).setAttribute('name', 'chart')
            var chartDivId = document.getElementById(divId).children[1].getAttribute('id')
            document.querySelector(`#${chartDivId}`).innerHTML = ``
            var chart = new ApexCharts(document.querySelector(`#${chartDivId}`), newChartJson);
            chart.render();
            //saveChartJson(userChartId,newChartJson)

            resolve();
        }).fail(function (error) {
            reject(error);
        });
    });
}


//full radial
function createFullRadialChartForm(chartId, userChartId, divId, chartName) {
    document.getElementById('tableDropdown').removeAttribute('onchange')
    document.getElementById('tableDropdown').setAttribute('onchange', 'getActMaxColumns(this.value)')
    document.getElementById('editChartWiseForm').innerHTML = ``
    var formHTML = `<div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="actValColumn">Actual Value Colum</label>
                            <select class="form-control" id="actValColumn">
                            
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="maxValColumn">Maximum Value Colum</label>
                            <select class="form-control" id="maxValColumn">
                            
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="aggregation">Aggregation</label>
                            <select class="form-control" id="aggregation">
                            <option value="SUM">SUM</option>
                            <option value="COUNT">COUNT</option>
                            <option value="AVG">AVG</option>
                            <option value="MAX">MAX</option>
                            <option value="MIN">MIN</option>
                            </select>
                        </div>
                    </div>
                            `
    document.getElementById('editChartWiseForm').innerHTML = formHTML
    $('#actValColumn').select2({
        width: '21vw'
    });
    $('#maxValColumn').select2({
        width: '21vw'
    });
    $('#aggregation').select2({
        width: '21vw'
    });
    if (userChartId !== 0) {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        $.ajax({
            "url": `/index/getChartOptions`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            var chartOptionJson = JSON.parse(data[0].CHART_OPTIONS_JSON)
            console.log(chartOptionJson["groupByColumns"]);
            $('#tableDropdown').val(`${data[0].TABLE_NAME}`).trigger('change')
            if ($('#colorSelector option[value="' + chartOptionJson[`colors`].toString() + '"]').length > 0) {
                $('#colorSelector').val(chartOptionJson[`colors`].toString()).trigger('change');
            } else {
                $('#colorSelect').val(chartOptionJson[`colors`]).trigger('change');
            } setTimeout(() => {
                $('#actValColumn').val(chartOptionJson[`actValColumn`]).trigger('change')
                $('#maxValColumn').val(chartOptionJson[`maxValColumn`]).trigger('change')
                $('#aggregation').val(chartOptionJson[`aggregation`]).trigger('change')
            }, 1000);

        })
    }


}
function saveFullRadialJson(userChartId, divId) {
    var chartName = $('#chartType option:selected').text();
    var page = $('#pageName').val()
    var chartOptionJson = {}
    chartOptionJson["chartTitle"] = document.getElementById('chartTitle').value
    chartOptionJson["aggregation"] = $('#aggregation').val()
    chartOptionJson["tableColumns"] = [$('#actValColumn').val(), $('#maxValColumn').val()]
    chartOptionJson["tableColumnsNames"] = [$('#actValColumn').find('option:selected').text(), $('#maxValColumn').find('option:selected').text()]
    chartOptionJson["actValColumn"] = $('#actValColumn').val()
    chartOptionJson["maxValColumn"] = $('#maxValColumn').val()
    chartOptionJson["table"] = $('#tableDropdown').val()
    chartOptionJson["tableName"] = $('#tableDropdown').find('option:selected').text()
    //chartOptionJson["groupByValues"] = $('#groupByValues').val()
    console.log(chartOptionJson);
    if ($('#colorSelector').val() === '') {
        chartOptionJson["colors"] = $('#colorSelect').val()
    } else {
        chartOptionJson["colors"] = $('#colorSelector').val().split(',')
    }
    var jsonObj = {}
    jsonObj["userChartId"] = userChartId
    jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
    jsonObj["chartId"] = $('#chartType').val()
    jsonObj["chartOptionsJson"] = JSON.stringify(chartOptionJson)
    jsonObj["tableName"] = $('#tableDropdown').val()
    jsonObj["divId"] = divId
    jsonObj["pageName"] = $('#pageName').val()
    $.ajax({
        "url": `/index/saveLinearChartJsonAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        console.log(data.userChartID);
        createDataPercentQueries(data.userChartID, chartName, divId, page)
    })


}
function setFullRadialChart(userChartId, divId) {
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        jsonObj["filterString"] = filterString
        $.ajax({
            "url": `/index/getPercentChartDataAPI`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            console.log(data);
            var chartJson = JSON.parse(data.chartJson)
            var chartOptionsJson = JSON.parse(data.chartOptionsJson)
            var chartData = data.chartData
            var labels = ['Percentage']
            //var groupByColumn = chartOptionsJson["groupByColumn"]
            var tableColumns = chartOptionsJson["tableColumnsNames"]
            var percentage = ((parseInt(chartData[0][`${tableColumns[0]}`]) / parseInt(chartData[0][`${tableColumns[1]}`])) * 100).toFixed(2)
            var dataset = [percentage]

            var newJson = {}
            newJson["series"] = dataset
            newJson["text"] = chartOptionsJson["chartTitle"]
            newJson["labels"] = labels
            newJson["colors"] = chartOptionsJson["colors"]
            console.log(chartJson, newJson);
            var newChartJson = replaceLeafKeys(chartJson, newJson)
            console.log(newChartJson);
            document.getElementById(divId).setAttribute('name', 'chart')
            var chartDivId = document.getElementById(divId).children[1].getAttribute('id')
            document.querySelector(`#${chartDivId}`).innerHTML = ``
            var chart = new ApexCharts(document.querySelector(`#${chartDivId}`), newChartJson);
            chart.render();

            //saveChartJson(userChartId,newChartJson)

            resolve();
        }).fail(function (error) {
            reject(error);
        });
    });
}

function createAbsValCompForm(chartId, userChartId, divId, chartName) {
    document.getElementById('tableDropdown').removeAttribute('onchange')
    document.getElementById('tableDropdown').setAttribute('onchange', 'getActMaxColumns(this.value)')
    document.getElementById('editChartWiseForm').innerHTML = ``
    var formHTML = `<div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="actValColumn">Actual Value Colum</label>
                            <select class="form-control" id="actValColumn">
                            
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="maxValColumn">Maximum Value Colum</label>
                            <select class="form-control" id="maxValColumn">
                            
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="aggregation">Aggregation</label>
                            <select class="form-control" id="aggregation">
                            <option value="SUM">SUM</option>
                            <option value="COUNT">COUNT</option>
                            <option value="AVG">AVG</option>
                            <option value="MAX">MAX</option>
                            <option value="MIN">MIN</option>
                            </select>
                        </div>
                    </div>
                            `
    document.getElementById('editChartWiseForm').innerHTML = formHTML
    $('#actValColumn').select2({
        width: '21vw'
    });
    $('#maxValColumn').select2({
        width: '21vw'
    });
    $('#aggregation').select2({
        width: '21vw'
    });
    if (userChartId !== 0) {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        $.ajax({
            "url": `/index/getChartOptions`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            var chartOptionJson = JSON.parse(data[0].CHART_OPTIONS_JSON)
            console.log(chartOptionJson["groupByColumns"]);
            $('#tableDropdown').val(`${data[0].TABLE_NAME}`).trigger('change')
            if ($('#colorSelector option[value="' + chartOptionJson[`colors`].toString() + '"]').length > 0) {
                $('#colorSelector').val(chartOptionJson[`colors`].toString()).trigger('change');
            } else {
                $('#colorSelect').val(chartOptionJson[`colors`]).trigger('change');
            } setTimeout(() => {
                $('#actValColumn').val(chartOptionJson[`actValColumn`]).trigger('change')
                $('#maxValColumn').val(chartOptionJson[`maxValColumn`]).trigger('change')
                $('#aggregation').val(chartOptionJson[`aggregation`]).trigger('change')
            }, 1000);

        })
    }


}
function saveAbsValCompJson(userChartId, divId) {
    var chartName = $('#chartType option:selected').text();
    var page = $('#pageName').val()
    var chartOptionJson = {}
    chartOptionJson["chartTitle"] = document.getElementById('chartTitle').value
    chartOptionJson["aggregation"] = $('#aggregation').val()
    chartOptionJson["tableColumns"] = [$('#actValColumn').val(), $('#maxValColumn').val()]
    chartOptionJson["tableColumnsNames"] = [$('#actValColumn').find('option:selected').text(), $('#maxValColumn').find('option:selected').text()]
    chartOptionJson["actValColumn"] = $('#actValColumn').val()
    chartOptionJson["maxValColumn"] = $('#maxValColumn').val()
    chartOptionJson["table"] = $('#tableDropdown').val()
    chartOptionJson["tableName"] = $('#tableDropdown').find('option:selected').text()
    //chartOptionJson["groupByValues"] = $('#groupByValues').val()
    if ($('#colorSelector').val() === '') {
        chartOptionJson["colors"] = $('#colorSelect').val()
    } else {
        chartOptionJson["colors"] = $('#colorSelector').val().split(',')
    }
    var jsonObj = {}
    jsonObj["userChartId"] = userChartId
    jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
    jsonObj["chartId"] = $('#chartType').val()
    jsonObj["chartOptionsJson"] = JSON.stringify(chartOptionJson)
    jsonObj["tableName"] = $('#tableDropdown').val()
    jsonObj["divId"] = divId
    jsonObj["pageName"] = $('#pageName').val()
    $.ajax({
        "url": `/index/saveLinearChartJsonAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        console.log(data.userChartID);
        createDataPercentQueries(data.userChartID, chartName, divId, page)
    })


}
function setAbsValComp(userChartId, divId) {
    return new Promise((resolve, reject) => {

        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        jsonObj["filterString"] = filterString
        $.ajax({
            "url": `/index/getPercentChartDataAPI`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json",
                "userId": sessionStorage.getItem("id")
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            console.log(data);
            var chartJson = JSON.parse(data.chartJson)
            var chartOptionsJson = JSON.parse(data.chartOptionsJson)
            var chartData = data.chartData
            var labels = ['Percentage']
            //var groupByColumn = chartOptionsJson["groupByColumn"]
            var tableColumns = chartOptionsJson["tableColumnsNames"]
            var percentage = ((parseInt(chartData[0][`${tableColumns[0]}`]) / parseInt(chartData[0][`${tableColumns[1]}`])) * 100).toFixed(2)
            var dataset = [percentage]


            document.getElementById(divId).setAttribute('name', 'chart')
            //$(divId).find('h6').remove()
            var color = chartOptionsJson["colors"][0] || `#38c219`
            const parentDiv = document.getElementById(divId);

            // Check if any H6 element exists
            const existingH6 = parentDiv.querySelector('h6');


            if (chartData[0][`${tableColumns[0]}`] == null) {
                var html = `<div style="font-size: 2vw;position: absolute;bottom: 10%;left: 50%; transform: translateX(-50%);"><span style="color:${color}">0</span>/0</div>`
            } else {
                var html = `<div style="font-size: 2vw;position: absolute;bottom: 10%;left: 50%; transform: translateX(-50%);"><span style="color:${color}">${chartData[0][`${tableColumns[0]}`]}</span>/${chartData[0][`${tableColumns[1]}`]}</div>`
            }
            if (existingH6) {
                var chartDivId = document.getElementById(divId).children[2].getAttribute('id')
                parentDiv.querySelector('h6').innerText = chartOptionsJson["chartTitle"]
            } else {
                var chartDivId = document.getElementById(divId).children[1].getAttribute('id')
                var headingElement = $('<h6>').attr('id', `${userChartId}Value`).text(`${chartOptionsJson["chartTitle"]}`);
                $(`#${chartDivId}`).before(headingElement);
                $(`#${userChartId}Value`).addClass('m-2').css('font-weight', 'bolder');
            }

            $(`#${chartDivId}`).html('')
            $(`#${chartDivId}`).html(html)

            var element = document.getElementById(divId);
            var htmlContent = element.outerHTML + element.innerHTML;
            console.log(htmlContent);
            resolve();
        }).fail(function (error) {
            reject(error);
        });
    });
}


function createAbsValForm(chartId, userChartId, divId, chartName) {
    document.getElementById('tableDropdown').removeAttribute('onchange')
    document.getElementById('tableDropdown').setAttribute('onchange', 'getTableColumns(this.value)')
    document.getElementById('editChartWiseForm').innerHTML = ``
    var formHTML = `<div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="columns">Colums</label>
                            <select class="form-control" id="columns">
                            
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group col-md-12">
                            <label for="aggregation">Aggregation</label>
                            <select class="form-control" id="aggregation">
                            <option value="SUM">SUM</option>
                            <option value="COUNT">COUNT</option>
                            <option value="AVG">AVG</option>
                            <option value="MAX">MAX</option>
                            <option value="MIN">MIN</option>
                            </select>
                        </div>
                    </div>
                    
  `
    document.getElementById('editChartWiseForm').innerHTML = formHTML
    $('#columns').select2({
        width: '21vw'
    });


    $('#aggregation').select2({
        width: '21vw'
    });
    if (userChartId !== 0) {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        $.ajax({
            "url": `/index/getChartOptions`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            var chartOptionJson = JSON.parse(data[0].CHART_OPTIONS_JSON)
            console.log(chartOptionJson["groupByColumns"]);
            $('#tableDropdown').val(`${data[0].TABLE_NAME}`).trigger('change')
            if ($('#colorSelector option[value="' + chartOptionJson[`colors`].toString() + '"]').length > 0) {
                $('#colorSelector').val(chartOptionJson[`colors`].toString()).trigger('change');
            } else {
                $('#colorSelect').val(chartOptionJson[`colors`]).trigger('change');
            } setTimeout(() => {
                $('#columns').val(chartOptionJson[`tableColumns`]).trigger('change')
                $('#aggregation').val(chartOptionJson[`aggregation`]).trigger('change')
            }, 1000);



        })
    }


}

function saveAbsValJson(userChartId, divId) {
    var chartName = $('#chartType option:selected').text();
    var page = $('#pageName').val()
    var chartOptionJson = {}
    chartOptionJson["chartTitle"] = document.getElementById('chartTitle').value
    chartOptionJson["aggregation"] = $('#aggregation').val()
    chartOptionJson["tableColumns"] = $('#columns').val()
    chartOptionJson["tableColumnsNames"] = $('#columns').find('option:selected').text()
    chartOptionJson["table"] = $('#tableDropdown').val()
    chartOptionJson["tableName"] = $('#tableDropdown').find('option:selected').text()
    //chartOptionJson["groupByValues"] = $('#groupByValues').val()
    if ($('#colorSelector').val() === '') {
        chartOptionJson["colors"] = $('#colorSelect').val()
    } else {
        chartOptionJson["colors"] = $('#colorSelector').val().split(',')
    }
    var jsonObj = {}
    jsonObj["userChartId"] = userChartId
    jsonObj["bucketId"] = sessionStorage.getItem('bucketId')
    jsonObj["chartId"] = $('#chartType').val()
    jsonObj["chartOptionsJson"] = JSON.stringify(chartOptionJson)
    jsonObj["tableName"] = $('#tableDropdown').val()
    jsonObj["divId"] = divId
    jsonObj["pageName"] = $('#pageName').val()
    $.ajax({
        "url": `/index/saveLinearChartJsonAPI`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        console.log(data.userChartID);
        createDataPercentQueries(data.userChartID, chartName, divId, page)
    })


}

function setAbsVal(userChartId, divId) {
    return new Promise((resolve, reject) => {
        var jsonObj = {}
        jsonObj["userChartId"] = userChartId
        jsonObj["filterString"] = filterString
        $.ajax({
            "url": `/index/getPercentChartDataAPI`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(jsonObj),
        }).done(function (data) {
            console.log(data);
            var chartJson = JSON.parse(data.chartJson)
            var chartOptionsJson = JSON.parse(data.chartOptionsJson)
            var chartData = data.chartData
            var labels = ['Percentage']
            //var groupByColumn = chartOptionsJson["groupByColumn"]
            var tableColumns = chartOptionsJson["tableColumnsNames"]
            var value = parseInt(chartData[0][`${tableColumns}`])
            if(isNaN(value)){
                value = 0
            }

            var dataset = [value]
            var color = chartOptionsJson["colors"][0] || `#38c219`
            const parentDiv = document.getElementById(divId);

            // Check if any H6 element exists
            const existingH6 = parentDiv.querySelector('h6');

            document.getElementById(divId).setAttribute('name', 'chart')
            var chartDivId = document.getElementById(divId).children[1].getAttribute('id')
            //$(`#${divId}`).find('h6').remove();
            if (existingH6) {
                var chartDivId = document.getElementById(divId).children[2].getAttribute('id')
                parentDiv.querySelector('h6').innerText = chartOptionsJson["chartTitle"]
            } else {
                var chartDivId = document.getElementById(divId).children[1].getAttribute('id')
                var headingElement = $('<h6>').attr('id', `${userChartId}Value`).text(`${chartOptionsJson["chartTitle"]}`);
                $(`#${chartDivId}`).before(headingElement);
                $(`#${userChartId}Value`).addClass('m-2').css('font-weight', 'bolder');
            }
            $(`#${chartDivId}`).html('')
            var html = `<div style="font-size: 2vw;position: absolute;bottom: 10%;left: 50%; transform: translateX(-50%);"><span style="color:${color}">${value}</span></div>`
            $(`#${chartDivId}`).html(html)
            resolve();
        }).fail(function (error) {
            reject(error);
        });
    });
}


// utility methods
function modifyHtmlString(htmlString, newHeight) {
    // Create a new HTML element to hold the provided string
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    // Change the height of the uppermost div
    var uppermostDiv = tempDiv.querySelector('div');
    if (uppermostDiv) {
        uppermostDiv.style.height = newHeight;
        uppermostDiv.classList.add('curved-border'); // Add a class for curved border
    }

    // Remove all id attributes from the HTML
    tempDiv.querySelectorAll('[id]').forEach(function (element) {
        element.removeAttribute('id');
    });

    // Get the modified HTML string
    var modifiedHtmlString = tempDiv.innerHTML;

    return modifiedHtmlString;
}
function setGridRadioChecked(value) {
    // Get all radio buttons with the name "gridRadio"
    var radioButtons = document.getElementsByName('gridRadio');

    // Loop through radio buttons to find the one with the specified value
    for (var i = 0; i < radioButtons.length; i++) {

        if (String(radioButtons[i].value) === String(value)) {

            // Set the checked property to true for the matched radio button
            radioButtons[i].checked = true;
            break; // Exit the loop since we found the matching radio button
        }
    }
}
function getAllKeys(jsonObject) {
    let keys = [];

    for (let key in jsonObject) {
        if (typeof jsonObject[key] === 'object' && jsonObject[key] !== null) {
            keys = keys.concat(getAllKeys(jsonObject[key]).map(innerKey => `${innerKey}`));
        } else {
            keys.push(key);
        }
    }
    return keys;
}
function getMonth(id) {
    var month = ``
    if (id == '1' || id == '01') {
        month = 'JAN'
    } else if (id == '2' || id == '02') {
        month = 'FEB'
    } else if (id == '3' || id == '03') {
        month = 'MAR'
    } else if (id == '4' || id == '04') {
        month = 'APR'
    } else if (id == '5' || id == '05') {
        month = 'MAY'
    } else if (id == '6' || id == '06') {
        month = 'JUN'
    } else if (id == '7' || id == '07') {
        month = 'JUL'
    } else if (id == '8' || id == '08') {
        month = 'AUG'
    } else if (id == '9' || id == '09') {
        month = 'SEP'
    } else if (id == '10') {
        month = 'OCT'
    } else if (id == '11') {
        month = 'NOV'
    } else if (id == '12') {
        month = 'DEC'
    }

    return month;
}

function setContrastTextColor(id) {
    var backgroundColor = getComputedStyle(document.getElementById(id)).backgroundColor;
    var brightness = getBrightness(backgroundColor);
    var textColor = brightness > 128 ? 'black' : 'white';
    document.getElementById(id).style.color = textColor;
}

function getBrightness(rgb) {
    // Extract RGB values from the string "rgb(r, g, b)"
    var rgbValues = rgb.match(/\d+/g).map(Number);

    // Calculate brightness using the formula: (R * 299 + G * 587 + B * 114) / 1000
    var brightness = (rgbValues[0] * 299 + rgbValues[1] * 587 + rgbValues[2] * 114) / 1000;

    return brightness;
}

function replaceLeafKeys(jsonObject, replacementObject) {
    let result = {};

    for (let key in jsonObject) {
        if (Array.isArray(jsonObject[key])) {
            // If the value is an array, use the replacement if available
            result[key] = replacementObject[key] !== undefined ? replacementObject[key] : jsonObject[key];
        } else if (typeof jsonObject[key] === 'object' && jsonObject[key] !== null) {
            if (key === 'series' || key === 'categories' || key === 'labels' || key === 'colors') {
                // For specific keys, replace with the value from replacementObject
                result[key] = replacementObject[key] !== undefined ? replacementObject[key] : jsonObject[key];
            } else {
                // Recursively process sub-objects
                result[key] = replaceLeafKeys(jsonObject[key], replacementObject);
            }
        } else {
            // For leaf values, replace only if key is present in replacementObject
            result[key] = replacementObject[key] !== undefined ? replacementObject[key] : jsonObject[key];
        }
    }

    return result;
}

function deleteChartButton(userChartId, divId) {

}


// function to generate custom colors 
const colors = [
    { id: '#6B2CDD', text: 'Purple Heart' },
    { id: '#0E8BE5', text: 'Navy Blue' },
    { id: '#E344D1', text: 'FrostBite' },
    { id: '#14B899', text: 'Emerald' },
    { id: '#CF3A0A', text: 'TiaMaria' },
    { id: '#E8A558', text: 'Porsche' },
    { id: '#24E263', text: 'Malachite' },
    { id: '#6BC51F', text: 'Lima' },
    { id: '#00FFFF', text: 'Aqua' },
    { id: '#9400D3', text: 'Dark Violet' },
    { id: '#98FB98', text: 'Pale Green' },
    { id: '#4682B4', text: 'Steel Blue' },
    { id: '#EE82EE', text: 'Violet' },
    { id: '#4B0082', text: 'Indigo' },
    { id: '#CD853F', text: 'Peru' },
    { id: '#CBA135', text: 'Satin Sheen Gold' },
    { id: '#E860AD', text: 'Brilliant rose' },
    { id: '#F4A460', text: 'Sandy Brown' },
    { id: '#EAE86F', text: 'Honey Suckle' },
    { id: '#9932CC', text: 'Dark Orchid' },
    { id: '#405580', text: 'Chambray' },
    { id: '#FDBCB4', text: 'Melon' },
    { id: '#E30B5D', text: 'Raspberry' },
    { id: '#91A092', text: 'Pewter' },
    { id: '#8B008B', text: 'Dark Magenta' },
    { id: '#00FFFF', text: 'cyan' },
    { id: '#00FF7F', text: 'Spring Green' },
    { id: '#D2691E', text: 'Cinnamon' },
    { id: '#FDFD96', text: 'Pastel Yellow' },
    { id: '#AEC6CF', text: 'Pastel Blue' },
    { id: '#FFDEAD', text: 'Navajo White' },
    { id: '#301934', text: 'Dark Purple' },
    { id: '#b57170', text: 'Marsala' },
    { id: '#ff7f50', text: 'Coral' },
    { id: '#c8a2c8', text: 'Lilac' },
    { id: '#DCDCDC', text: 'Gainsboro' },
    { id: '#9966cc', text: 'Amethyst Purple' },
    { id: '#003153', text: 'Prussian Blue' },
    { id: '#e4d96f', text: 'Straw' },
    { id: '#c2b280', text: 'Ecru' },
    { id: '#ff69b4', text: 'pink' },
    { id: '#f7cac9', text: 'Rose Quartz' },
    { id: '#ff4f00', text: 'International' },
    { id: '#66023c', text: 'Tyrian Purple' },
    { id: '#1E90FF', text: 'Dodger Blue' },
    { id: '#00CED1', text: 'Dark Turquoise' },
    { id: '#32CD32', text: 'Nature Green' },
    { id: '#87CEEB', text: 'Sky Blue' },
    { id: '#008080', text: 'Teal' },
    { id: '#20B2AA', text: 'Light Sea Green' },
    { id: '#FFFF00', text: 'Yellow' },
    { id: '#9ACD32', text: 'Yellow Green' },
    { id: '#556B2F', text: 'Dark Olive Green' },
    { id: '#ADFF2F', text: 'Green Yellow' },
    { id: '#FF5733', text: 'Tomato' },
    { id: '#FFD700', text: 'Gold' },
    { id: '#00FF00', text: 'Lime Green' },
    { id: '#FF69B4', text: 'Dark Pink' },
    { id: '#00BFFF', text: 'Deep Sky Blue' },
    { id: '#FF6347', text: 'Tomato' },
    { id: '#FF8C00', text: 'Dark Orange' },
    { id: '#8A2BE2', text: 'Blue Violet' },
    { id: '#FF1493', text: 'Deep Pink' },
];
$(document).ready(function () {

    const selectElement = $('#colorSelect');

    selectElement.select2({
        data: colors,
        multiple: true,
        templateResult: function (data) {
            if (!data.id) {
                return data.text;
            }
            const $option = $('<span></span>');
            $option.css({
                'display': 'flex',
                'align-items': 'center'
            });

            const $colorBox = $('<span></span>');
            $colorBox.css({
                'background-color': data.id,
                'width': '20px',
                'height': '20px',
                'margin-right': '10px'
            });
            $option.append($colorBox);

            const $textSpan = $('<span></span>');
            $textSpan.text(data.text);
            $option.append($textSpan);

            return $option;
        },
        templateSelection: function (data) {
            const $selection = $('<span></span>');
            $selection.css({
                'display': 'flex',
                'align-items': 'center'
            });

            const $colorBox = $('<span></span>');
            $colorBox.css({
                'background-color': data.id,
                'width': '20px',
                'height': '20px',
                'margin-right': '10px'
            });
            $selection.append($colorBox);

            const $textSpan = $('<span></span>');
            $textSpan.text(data.text);
            $selection.append($textSpan);

            return $selection;
        }
    });
});


const colorsArray = [
    ["#111D5E", "#C70039", "#F37121", "#FFBD69", "#A8DF65", "#EDF492", "#EFB960", "#EE91BC", "#FFF2B2", "#9ED763", "#2C9E4B", "#0A4650", "#FFF6F6", "#EEA1EB", "#CB22D7", "#891180", "#83CBFB", "#377FD9", "#EDF68D", "#F1D851", "#FFC7C7", "#DC7646", "#A45C5C", "#6C476E", "#422B72", "#266D98", "#3CB29A", "#C4F080", "#D0EFB5", "#EB7878", "#2F3E75", "#F3E595", "#F6F078", "#01D28E", "#434982", "#730068", "#0D7685", "#084D68", "#69C181", "#CCF186", "#716F81", "#B97A95", "#F6AE99", "#F2E1C1", "#F2E8C6", "#F5841A", "#BB0029", "#03002C", "#F0E9FF", "#CEA9FF"],
    ["#B346FF", "#545454", "#2E3B3E", "#50666B", "#F9B8BE", "#FD6378", "#F5FAC8", "#AEE8E6", "#8BCFCC", "#539092", "#F7FA86", "#76E7C7", "#9E7EFF", "#9C4B9E", "#FFFFD2", "#E4E4E4", "#8293FF", "#503BFF", "#F9F8EB", "#76B39D", "#05004E", "#FD5F00", "#5800FF", "#E900FF", "#FFC600", "#FEF9D9", "#CE7D00", "#935900", "#00541A", "#F3F9FB", "#87C0CD", "#226597", "#113F67", "#BEF2FF", "#4F7097", "#93A7D1", "#1BF5AF", "#4700D8", "#9900F0", "#F900BF", "#FF85B3", "#FFE7AD", "#DB75C5", "#A05F96", "#6A1051", "#F76262", "#216583", "#65C0BA", "#CFFDF8", "#FF1F5A"],
    ["#FFD615", "#F9FF21", "#1E2A78", "#61B15A", "#ADCE74", "#FFF76A", "#FFCE89", "#04879C", "#0C3C78", "#090030", "#F30A49", "#6C00FF", "#3C79F5", "#2DCDDF", "#F2DEBA", "#BBE06C", "#7CB855", "#469B4C", "#3C6E57", "#7882A4", "#C0A080", "#D1D1D1", "#EFEFEF", "#FF87CA", "#FFC4E1", "#EAEAEA", "#EED7CE", "#A1CAE2", "#C2B092", "#CFC5A5", "#EAE3C8", "#EFF5F5", "#D6E4E5", "#497174", "#EB6440", "#070F4E", "#2772DB", "#3AB1C8", "#F5EBEB", "#A9EEE6", "#FEFAEC", "#F38181", "#625772", "#CEFFF1", "#ACE7EF", "#A6ACEC", "#A56CC1", "#57C5B6", "#159895", "#1A5F7A"],
    ["#002B5B", "#461959", "#7A316F", "#CD6688", "#AED8CC", "#DA1212", "#F08C00", "#C6DA20", "#F3F5D5", "#F95959", "#FFE1A1", "#FCFFCC", "#D3E785", "#B4FF9F", "#F9FFA4", "#FFD59E", "#FFA1A1", "#45EBA5", "#21ABA5", "#1D566E", "#163A5F", "#481380", "#7F78D2", "#EFB1FF", "#FFE2FF", "#98DDCA", "#D5ECC2", "#FFD3B4", "#FFAAA7", "#9D5C0D", "#E5890A", "#F7D08A", "#FAFAFA", "#00028C", "#21AA93", "#01676B", "#FFC3E7", "#FAFFB8", "#C5F0A4", "#35B0AB", "#226B80", "#58828B", "#5E9387", "#C8E29D", "#F2F299", "#206A5D", "#81B214", "#FFCC29", "#F58634", "#A8E6CF"],
    ["#FDFFAB", "#FFD3B6", "#FFAAA5", "#BFCD7E", "#EE7777", "#8E2E6A", "#311054", "#F8FCFB", "#C9FDD7", "#79D1C3", "#6892D5", "#632626", "#9D5353", "#BF8B67", "#DACC96", "#D9F9F4", "#9CD9DE", "#86C1D4", "#5A92AF", "#445C3C", "#FDA77F", "#C9D99E", "#FAE8C8", "#C67ACE", "#D8F8B7", "#FF9A8C", "#CE1F6A", "#062C30", "#05595B", "#E2D784", "#F5F5F5", "#F0F2AC", "#A7CBD9", "#7E94BF", "#5357A6", "#472D2D", "#553939", "#704F4F", "#A77979", "#89F8CE", "#F5FAC7", "#DEC8ED", "#CC99F9", "#FFCCCC", "#CAABD8", "#9873B9", "#714288", "#CCAFAF", "#FFCAC2", "#FC9D9D"]
]


$(document).ready(function () {
    const selectElement = $('#colorSelector');
    let paletteCounter = 1;

    colorsArray.forEach(function (subArray) {
        let option = $('<option></option>');
        option.attr('value', subArray);
        option.text('Palette ' + paletteCounter)
        selectElement.append(option);

        paletteCounter++;
    });

    selectElement.select2();
});

$("#colorSelect").on("select2:select", function (evt) {
    var element = evt.params.data.element;
    var $element = $(element);

    $element.detach();
    $(this).append($element);
    $(this).trigger("change");
});
let changing = false;

function disableSelect(id) {
    if (!changing) {
        changing = true;
        if (id === 'colorSelector') {
            $('#colorSelect').val(null).trigger('change');
        } else if (id === 'colorSelect') {
            $('#colorSelector').val(null).trigger('change');
        }
        changing = false;
    }
}


// functions for colors after filter 
function generateColorPalette() {
    const selectElement = $('#colorSelector');
    let paletteCounter = 1;

    colorsArray.forEach(function (subArray) {
        let option = $('<option></option>');
        option.attr('value', subArray);
        option.text('Palette ' + paletteCounter)
        selectElement.append(option);

        paletteCounter++;
    });
    selectElement.select2();
}

function generateCustomColors() {
    setTimeout(() => {
        const selectElement = $('#colorSelect');
        selectElement.select2({
            data: colors,
            multiple: true,
            templateResult: function (data) {
                if (!data.id) {
                    return data.text;
                }
                const $option = $('<span></span>');
                $option.css({
                    'display': 'flex',
                    'align-items': 'center'
                });

                const $colorBox = $('<span></span>');
                $colorBox.css({
                    'background-color': data.id,
                    'width': '20px',
                    'height': '20px',
                    'margin-right': '10px'
                });
                $option.append($colorBox);

                const $textSpan = $('<span></span>');
                $textSpan.text(data.text);
                $option.append($textSpan);

                return $option;
            },
            templateSelection: function (data) {
                const $selection = $('<span></span>');
                $selection.css({
                    'display': 'flex',
                    'align-items': 'center'
                });

                const $colorBox = $('<span></span>');
                $colorBox.css({
                    'background-color': data.id,
                    'width': '20px',
                    'height': '20px',
                    'margin-right': '10px'
                });
                $selection.append($colorBox);

                const $textSpan = $('<span></span>');
                $textSpan.text(data.text);
                $selection.append($textSpan);

                return $selection;
            }
        });
    }, 1500);
}

function getMaxValue(arr) {
    return Math.max(...arr);
}

function getAverageValue(arr) {
    if (arr.length === 0) {
        return NaN; // Handle the case when the array is empty
    }

    const sum = arr.reduce((acc, val) => acc + val, 0);
    return parseFloat((sum / arr.length).toFixed(1));
}

function getMinValue(arr) {
    return Math.min(...arr);
}
