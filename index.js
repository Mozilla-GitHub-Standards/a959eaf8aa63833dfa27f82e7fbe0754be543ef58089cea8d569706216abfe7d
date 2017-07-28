/*
 * API Queries
 */
const reviews = "https://bugzilla.mozilla.org/rest/bug?include_fields=id,summary,status&f1=requestees.login_name&f2=flagtypes.name&o1=equals&o2=substring&priority=--&priority=P2&priority=P3&priority=P4&priority=P5&resolution=---&v2=review%3F&v1="

const reviewsP1 = "https://bugzilla.mozilla.org/rest/bug?include_fields=id,summary,status&f1=requestees.login_name&f2=flagtypes.name&o1=equals&o2=substring&priority=P1&resolution=---&v2=review%3F&v1="

const needinfos = "https://bugzilla.mozilla.org/rest/bug?include_fields=id,summary,status&f1=requestees.login_name&f2=flagtypes.name&o1=equals&o2=substring&priority=--&priority=P2&priority=P3&priority=P4&priority=P5&resolution=---&v2=needinfo%3F&v1="

const needinfosP1 = "https://bugzilla.mozilla.org/rest/bug?include_fields=id,summary,status&f1=requestees.login_name&f2=flagtypes.name&o1=equals&o2=substring&priority=P1&resolution=---&v2=needinfo%3F&v1="

/*
 * Dependencies
 */ 
const fetch = require('make-fetch-happen');
const csv = require('csvtojson');
const csvFilePath = './data/org.csv';

/*
 * Reports
 */ 
var devReports = [
    {title: "Review Requests P1",
     name: "reviewsP1",
     url: reviews},
    {title: "Review Requests Other",
     name: "reviews",
     url: reviews},
    {title: "Needinfos P1",
     name: "needinfosP1",
     url: needinfos},
    {title: "Needinfos Other",
     name: "needinfos",
     url: needinfos}
];

/*
 * Read org chart
 */ 
csv()
.fromFile(csvFilePath)
.on('json', json => {
    orgChart.push(json);
})
.on('done', err => {
    if (err) {
        console.log(err);
    }
    else {
        createReport(); // call the report handler below
    }
});

/*
 * Handler to generate report
 */ 
function createReport() {
    console.log('#Mozilla Confidential, Named Individuals Only');
    console.log(['report', 'manager', 'name', 'count'].join(', '));
    devReports.forEach(report => {
        orgChart.forEach(developer => {
            fetch(report.url + encodeURIComponent(developer.bugmail))
            .then(res => { return res.json() })
            .then(body => {
                console.log([report.title,
                    developer.manager, developer.name, 
                    body.bugs.length].join(', '));
            });
        });
    });
}
