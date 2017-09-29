/*
    Generate the tree of reports we'll use. 
*/

const employees = require('./data/phonebook.json');
const directors = [
    'Selena Deckelmann',
    'Chris Karlof',
    'Joe Hildebrand'
];

/*
    person is a JSON object scraped from phonebook representing an employee
    cn is the name string identifying a person
 */

function isManager(person) {
    return (person.ismanager === 'TRUE');
}

function manages(person, cn) {
    return (person.manager.cn === cn);
}

function getBugmail(person) {
    return (person.bugzillaemail || person.mail);
}

function getDirects(cn) {
    return employees.filter(employee => {
        return manages(employee, cn)
    });
}

function getTree(manager) {
    var directs = getDirects(manager);
    directs.forEach(direct => {
        console.log([manager,direct.cn,getBugmail(direct)].join(','));
        if (isManager(direct)) {
            getTree(direct.cn);
        }
    });
} 

/* main */

console.log(['manager', 'name', 'bugmail'].join(','));

directors.forEach(director => {
    getTree(director);
});
