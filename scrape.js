/*
 Run from a scratch-pad or wrap up as 
 an extension on https://phonebook.mozilla.org/tree.php

 https://gist.github.com/potch/c06001152bbb8d0cae593534d9b8ef92
*/

let employees = document.querySelectorAll('#orgchart li');

function getEmployee(el) {
  let key = el.id;
  let email = key.replace('-at-', '@');
  let queryPath = '/search.php?query=' + email +  '&exact_search=true&format=json';
  
  let request = new Request(queryPath, {
    method: 'GET', 
    redirect: 'follow',
    credentials: 'include',
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  });

  return fetch(request).then(r => {
    return r.json().then(j => j.users[0]);
  });
}

function chunkPromiseAll(arr, fn, progress, chunkSize) {
  return new Promise((resolve, reject) => {
    let pos = 0;
    let result = [];
    
    function next() {
      progress(Math.min(pos / arr.length, 1));
      Promise.all(arr.slice(pos, pos + chunkSize).map(fn)).then((r) => {
        result = result.concat(r);  
        if (pos < arr.length) {
          next();
        } else {
          resolve(result);
        }
      }).catch(reject);
      pos += chunkSize;      
    }
    
    next();
  });
}

let outputEl = document.createElement('div');
outputEl.style = 'padding: 2em; text-align: center';
outputEl.innerHTML = 'reticulating splines... ';
document.querySelector('#header').appendChild(outputEl);
let progressEl = document.createElement('progress');
progressEl.style = 'margin: 0 1em;';
outputEl.appendChild(progressEl);

function tick(p) {
  progressEl.value = p;
}

chunkPromiseAll(Array.from(employees), getEmployee, tick, 10).then(function (employees) {
  let output = JSON.stringify(employees, null, 2);
  let blob = new Blob([output], {type : 'application/json'});
  let link = document.createElement('a');
  link.setAttribute('download', 'phonebook.json');
  link.innerHTML = 'click here to download';
  link.style = 'color: #fff';
  link.setAttribute('href', window.URL.createObjectURL(blob));
  outputEl.appendChild(link);
});