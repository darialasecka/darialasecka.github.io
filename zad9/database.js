// workers
var worker = new Worker('webworker.js');

// In the following line, you should include the prefixes of implementations you want to test.
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// DON'T use "var indexedDB = ..." if you're not in a function.
// Moreover, you may need references to some window.IDB* objects:
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
// (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

if (!window.indexedDB) {
  window.alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}

function init() {
  // Let us open our database
  var request = window.indexedDB.open("MyContactsDB", 1);

  request.onerror = function(event) {
    // Do something with request.errorCode!
    alert("Couldn't open database.");
  };

  request.onsuccess = function(event) {
    // Do something with request.result!
    db = event.target.result;

    db.onerror = function(event) {
      // Generic error handler for all errors targeted at this database's requests!
      alert("Database error: " + event.target.errorCode);
    };

    updateTable();
  };

  request.onupgradeneeded = function(event) {
    // Save the IDBDatabase interface
    var db = event.target.result;

    var objectStore = db.createObjectStore("contacts", {keyPath: "id", autoIncrement: true});

    objectStore.createIndex("name", "name", {unique:false});
    objectStore.createIndex("last_name", "last_name", {unique:false});
    objectStore.createIndex("id_number", "id_number", {unique:false});
    objectStore.createIndex("address", "address", {unique:false});
    objectStore.createIndex("city", "city", {unique:false});
    objectStore.createIndex("code", "code", {unique:false});
    objectStore.createIndex("phone_number", "phone_number", {unique:false});
    objectStore.createIndex("email", "email", {unique:false});

    objectStore.transaction.oncomplete = function(event) { };
  };

  // add / edit
  document.getElementById('addContact').onsubmit = function(e) {
    document.getElementById('add').innerHTML = "Add";
    var cid = document.getElementById('id').value;
    var cname = document.getElementById('name').value;
    var clast_name = document.getElementById('last_name').value;
    var cid_number = document.getElementById('id_number').value;
    var caddress = document.getElementById('address').value;
    var ccity = document.getElementById('city').value;
    var ccode = document.getElementById('country_code').value;
    var cphone_number = document.getElementById('phone_number').value;
    var cemail = document.getElementById('email').value;

    const contact = {
      name: cname,
      last_name: clast_name,
      id_number: cid_number,
      address: caddress,
      city: ccity,
      code: ccode,
      phone_number: cphone_number,
      email: cemail
    }

    if(cid != "") contact.id = parseInt(cid);

    var transaction = db.transaction(["contacts"], "readwrite");

    transaction.oncomplete = function(event) {
      console.log("All done!");
    };

    transaction.onerror = function(event) {
      console.dir(event);
    };

    var contactsObjectStore = transaction.objectStore("contacts");

    var request = contactsObjectStore.put(contact);

    request.onsuccess = function(event) {
      console.log("Contact added successfully.");
    };

    e.preventDefault();
    updateTable();
    clearForm();
    e.preventDefault();
  }

  function getRandomText(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * max) + min;
  }

  // generate
  document.getElementById('generate_data').onclick = function(e){
    document.getElementById('name').value = getRandomText(['Bob' , 'Jan', 'Marcel', 'Robert', 'Hubert' , 'Ryszard', 'Eugeniusz', 'Mariusz', 'Nataniel', 'Grzegorz']);
    document.getElementById('last_name').value = getRandomText(['Kowalski' , 'Nowak', 'Wiśniewski', 'Kowalczyk', 'Kamiński' , 'Lewandowski', 'Wójcik', 'Woźniak', 'Jankowski', 'Mazur']);
    document.getElementById('id_number').value = getRandomText(['AAA' , 'ABC', 'TES', 'KOW', 'DAT' , 'CBA', 'DOM']) + getRandomNumber(100000, 899999);
    document.getElementById('address').value = getRandomText(['al. Politechniki' , 'Stefanowskiego', 'Narutowicza', '11 Maja', 'Piotrkowska']) + " " + getRandomNumber(1, 60) + "/" + getRandomNumber(1,60);
    document.getElementById('city').value = getRandomText(['Łódź', 'Poznań', 'Warszawa', 'Kraków', 'Gdańsk', 'Gdynia', 'Sopot']);
    document.getElementById('country_code').value = getRandomNumber(10, 89) + "-" + getRandomNumber(100, 899);
    document.getElementById('phone_number').value = getRandomNumber(100000000, 899999999);
    document.getElementById('email').value = Math.random().toString(36).substring(2, 8) + "@" + getRandomText(['example.com', 'gamil.com', 'test.pl']);
  }

  // show
  function updateTable() {
    document.getElementById("contacts-table-body").innerHTML = "";

    var request = db.transaction("contacts")
      .objectStore("contacts")
      .openCursor();

    request.onerror = function(event) {
      console.dir(event);
    };

    request.onsuccess = function(event) {
      cursor = event.target.result;

      if(cursor) {
        document.getElementById("contacts-table-body").innerHTML += "<tr><td>" + cursor.key
          + "</td><td contenteditable>" + cursor.value.name
          + "</td><td contenteditable>" + cursor.value.last_name
          + "</td><td contenteditable>" + cursor.value.id_number
          + "</td><td contenteditable>" + cursor.value.address
          + "</td><td contenteditable>" + cursor.value.city
          + "</td><td contenteditable>" + cursor.value.code
          + "</td><td contenteditable>" + cursor.value.phone_number
          + "</td><td contenteditable>" + cursor.value.email
          + "</td><td><button onclick=\"delContact(" + cursor.key + ")\">Delete</button>"
          + "</td><td><button onclick=\"show(" + cursor.key + ")\">Edit</button>"
          + "</td></tr>";

        cursor.continue();
      }
    };
  }

  // find / search
  document.getElementById('search_button').onclick = function(e){
    search();
  }

  document.getElementById('buy_button').onclick = function(e){
    buy();
  }
}

function search(){
  var search = document.getElementById('search_input').value;
  if (!search) {
    search = "";
  }
  search = search.toLowerCase().split(' ');

  document.getElementById("contacts-table-body").innerHTML = "";
  var request = db.transaction("contacts").objectStore("contacts").openCursor();
  request.onerror = function(event){
    console.dir(event);
  };

  request.onsuccess = function(event) {
    cursor = event.target.result;

    if(cursor) {
      console.log(search);
      var containsAll = true;
      for(i = 0; i < search.length; i++) {
        var contains = false;
        if((cursor.key.toString().localeCompare(search[i]) == 0 ||
          cursor.value.name.toLowerCase().includes(search[i]) ||
          cursor.value.last_name.toLowerCase().includes(search[i]) ||
          cursor.value.id_number.toLowerCase().includes(search[i]) ||
          cursor.value.address.toLowerCase().includes(search[i]) ||
          cursor.value.city.toLowerCase().includes(search[i]) ||
          cursor.value.code.toLowerCase().includes(search[i]) ||
          cursor.value.phone_number.toLowerCase().includes(search[i]) ||
          cursor.value.email.toLowerCase().includes(search[i]) )) {
            contains = true;
          }
          containsAll &= contains;
          if(!containsAll) break;
      }
      if(containsAll) {
        document.getElementById("contacts-table-body").innerHTML += "<tr><td>" + cursor.key
          + "</td><td>" + cursor.value.name
          + "</td><td>" + cursor.value.last_name
          + "</td><td>" + cursor.value.id_number
          + "</td><td>" + cursor.value.address
          + "</td><td>" + cursor.value.city
          + "</td><td>" + cursor.value.code
          + "</td><td>" + cursor.value.phone_number
          + "</td><td>" + cursor.value.email
          + "</td><td><button onclick=\"delContact(" + cursor.key + ")\">Delete</button>"
          + "</td><td><button onclick=\"show(" + cursor.key + ")\">Edit</button>"
          + "</td></tr>";
      }
      cursor.continue();
    }
  };
}

function delContact(id) {
  var objectStore = db.transaction(["contacts"], "readwrite").objectStore("contacts");
  var request = objectStore.delete(id);
  request.onsuccess = function(event) {
      console.log("Deleted contact");
      window.location.reload(false);
  };
}

function show(id) {
  console.log(id);
  if (id != "") {
    var objectStore = db.transaction(["contacts"], "readwrite").objectStore("contacts");
    var request = objectStore.get(id);
    
    request.onsuccess = function(event) {
        var data = event.target.result;
        setFormToContact(data);
        document.getElementById('id').value = id;
        document.getElementById('id_number').value = data.id_number;
        document.getElementById('country_code').value = data.code;
        document.getElementById('phone_number').value = data.phone_number;
        document.getElementById('add').innerHTML = "Edit";
    };
  } 
  else {
    clearForm();
  }
}

function buy(){
  document.getElementById('add').innerHTML = "Add";

  var id = document.getElementById('id').value;
  if (id == "") {
    window.alert("Choose client (By pressing correct Edit button)");
    return;
  }

  var items = [];
  var inputs = document.querySelectorAll("input[type='checkbox']");
  for(var i = 0; i < inputs.length; i++) {
    if (inputs[i].checked == true) {
      var label = document.querySelector("label[for='" + inputs[i].id + "']")
      items.push(label.innerHTML);
    }
  }
  console.log(items);

  var win = window.open("", "Invoice");
  var contact = getFullForm();
  win.document.body.innerHTML = "<h4>Client data</h4>";
  for(var key in contact){
    win.document.body.innerHTML += "<p>" + key + ": " + contact[key] + "</p>";
  }
  win.document.body
  win.document.body.innerHTML += "<h4>Bought items</h4>";
  for(var el in items){
    win.document.body.innerHTML += "<p>" + items[el] + "</p>";
  }

  clearForm();
}

function clearForm(){
    document.getElementById('id').value = '';
    document.getElementById('name').value = '';
    document.getElementById('last_name').value = '';
    document.getElementById('id_number').value = '';
    document.getElementById('address').value = '';
    document.getElementById('city').value = '';
    document.getElementById('country_code').value = '';
    document.getElementById('phone_number').value = '';
    document.getElementById('email').value = '';
}

function getContactFromForm() {
  return {
    name: document.getElementById('name').value,
    last_name: document.getElementById('last_name').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    email: document.getElementById('email').value
  };
}

function getFullForm() {
  return {
    name: document.getElementById('name').value,
    last_name: document.getElementById('last_name').value,
    id_number: document.getElementById('id_number').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    code: document.getElementById('country_code').value,
    phone_number: document.getElementById('phone_number').value,
    email: document.getElementById('email').value
  };
}

function setFormToContact(data){
  document.getElementById('name').value = data.name;
  document.getElementById('last_name').value = data.last_name;
  document.getElementById('address').value = data.address;
  document.getElementById('city').value = data.city;
  document.getElementById('email').value = data.email;
}

window.addEventListener('DOMContentLoaded', (event) => {
  var search_input = document.getElementById('search_input');
  search_input.addEventListener('input', function(e) {
      search();
  });

  // Invert letters worker
  worker.onmessage = function(e) {
    setFormToContact(e.data);
    sendDataToImgWorker();
  }

  var worker_button = document.getElementById('worker_button');

  worker_button.addEventListener('click', function(e) {
    console.log('Message sent to worker');
    worker.postMessage(getContactFromForm());
  });
});