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
     url: reviewsP1},
    {title: "Review Requests Other",
     name: "reviews",
     url: reviews},
    {title: "Needinfos P1",
     name: "needinfosP1",
     url: needinfosP1},
    {title: "Needinfos Other",
     name: "needinfos",
     url: needinfos}
];

var totals = {},
    orgChart = [],
    requests = [];

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
            // push each fetch for a developer stat onto the requests array
            requests.push(fetch(report.url + encodeURIComponent(developer.bugmail))
                .then(res => { return res.json() })
                .then(body => {
                    var manager = developer.manager,
                        name = developer.name,
                        title = report.title;

                    console.log([title, manager, name, 
                        body.bugs.length].join(', '));

                    if (!totals[manager]) {
                        totals[manager] = {};
                    }
                    if (!totals[manager][title]) {
                            totals[manager][title] = 0;
                    }

                    totals[manager][title] = totals[manager][title] + body.bugs.length;
                })
                .catch(error => {
                    console.error(developer.bugmail, error);
                }));
        });
    });

    // once all the fetches have returned iterate over our totals object
    Promise.all(requests).then(function() {
        Object.keys(totals).forEach(manager => {
            Object.keys(totals[manager]).forEach(title => {
                console.log([title, manager, '||| Total',
                    totals[manager][title]].join(', '))
            }) 
        });
    });
}
