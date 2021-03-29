/*
Copyright 2016 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
let idbApp = (function() {
  'use strict';

  // TODO 2 - check for support
  if (!(window.indexedDB)) {
    console.error("[main.js]: This browser does not have suppoort for IndexedDB");
    return;
  }

  const dbPromise = idb.open("couches-n-things", 5, (upgradeDb) => {
    switch (upgradeDb.oldVersion) {
      case 0:
        // placeholder case so that the switch block
        // will execute when the database is first created
        // (oldVersion is 0)
      case 1:
        console.log("[main.js]: Creating the products object store");
        upgradeDb.createObjectStore("products", {keyPath: "id"});
      case 2:
        console.log("Creating a name index");
        let store = upgradeDb.transaction.objectStore("products");
        store.createIndex("name", "name", { unique: true });
      case 3:
        console.log("Adding price and description indexes to the 'products' object store");
        let productStore = upgradeDb.transaction.objectStore("products");
        productStore.createIndex("price", "price");
        productStore.createIndex("description", "description");
      case 4:
      console.log("[main.js]: Creating the orders object store");
      upgradeDb.createObjectStore("orders", { keyPath: "id" });
    }
  });

  function addProducts() {

    // TODO 3.3 - add objects to the products store
    dbPromise.then((db) => {
      var tx = db.transaction('products', 'readwrite');
      var store = tx.objectStore('products');
      var items = [
        {
          name: 'Couch',
          id: 'cch-blk-ma',
          price: 499.99,
          color: 'black',
          material: 'mahogany',
          description: 'A very comfy couch',
          quantity: 3
        },
        {
          name: 'Armchair',
          id: 'ac-gr-pin',
          price: 299.99,
          color: 'grey',
          material: 'pine',
          description: 'A plush recliner armchair',
          quantity: 7
        },
        {
          name: 'Stool',
          id: 'st-re-pin',
          price: 59.99,
          color: 'red',
          material: 'pine',
          description: 'A light, high-stool',
          quantity: 3
        },
        {
          name: 'Chair',
          id: 'ch-blu-pin',
          price: 49.99,
          color: 'blue',
          material: 'pine',
          description: 'A plain chair for the kitchen table',
          quantity: 1
        },
        {
          name: 'Dresser',
          id: 'dr-wht-ply',
          price: 399.99,
          color: 'white',
          material: 'plywood',
          description: 'A plain dresser with five drawers',
          quantity: 4
        },
        {
          name: 'Cabinet',
          id: 'ca-brn-ma',
          price: 799.99,
          color: 'brown',
          material: 'mahogany',
          description: 'An intricately-designed, antique cabinet',
          quantity: 11
        }
      ];
      return Promise.all(items.map(function(item) {
          console.log('Adding item: ', item);
          return store.add(item);
        })
      ).catch(function(e) {
        tx.abort();
        console.log(e);
      }).then(function() {
        console.log('All items added successfully!');
      });
    });

  }

  function getByName(key) {
    return dbPromise.then((db) => {
      const tx = db.transaction("products", "readonly");
      const store = tx.objectStore("products");
      const index = store.index("name");
      return index.get(key);
    });
  }

  function displayByName() {
    let key = document.getElementById('name').value;
    if (key === '') {return;}
    let s = '';
    getByName(key).then(function(object) {
      if (!object) {return;}

      s += '<h2>' + object.name + '</h2><p>';
      for (let field in object) {
        s += field + ' = ' + object[field] + '<br/>';
      }
      s += '</p>';

    }).then(function() {
      if (s === '') {s = '<p>No results.</p>';}
      document.getElementById('results').innerHTML = s;
    });
  }

  function getByPrice() {

    let lower = document.getElementById('priceLower').value;
    let upper = document.getElementById('priceUpper').value;
    let lowerNum = Number(document.getElementById('priceLower').value);
    let upperNum = Number(document.getElementById('priceUpper').value);

    if (lower === '' && upper === '') {return;}
    let range;
    if (lower !== '' && upper !== '') {
      range = IDBKeyRange.bound(lowerNum, upperNum);
    } else if (lower === '') {
      range = IDBKeyRange.upperBound(upperNum);
    } else {
      range = IDBKeyRange.lowerBound(lowerNum);
    }
    let s = '';
    dbPromise.then(function(db) {
      let tx = db.transaction('products', 'readonly');
      let store = tx.objectStore('products');
      let index = store.index('price');
      return index.openCursor(range);
    }).then(function showRange(cursor) {
      if (!cursor) {return;}
      console.log('Cursored at:', cursor.value.name);
      s += '<h2>Price - ' + cursor.value.price + '</h2><p>';
      for (let field in cursor.value) {
        s += field + '=' + cursor.value[field] + '<br/>';
      }
      s += '</p>';
      return cursor.continue().then(showRange);
    }).then(function() {
      if (s === '') {s = '<p>No results.</p>';}
      document.getElementById('results').innerHTML = s;
    });

  }

  function getByDesc() {
    let key = document.getElementById('desc').value;
    if (key === '') {return;}
    let range = IDBKeyRange.only(key);
    let s = '';
    dbPromise.then(function(db) {
      let tx = db.transaction('products', 'readonly');
      let store = tx.objectStore('products');
      let index = store.index('description');
      return index.openCursor(range);
    }).then(function showRange(cursor) {
      if (!cursor) {return;}
      console.log('Cursored at:', cursor.value.name);
      s += '<h2>Price - ' + cursor.value.price + '</h2><p>';
      for (let field in cursor.value) {
        s += field + '=' + cursor.value[field] + '<br/>';
      }
      s += '</p>';
      return cursor.continue().then(showRange);

    }).then(function() {
      if (s === '') {s = '<p>No results.</p>';}
      document.getElementById('results').innerHTML = s;
    });
  }

  function addOrders() {
    dbPromise.then((db) => {
      const tx = db.transaction("orders", "readwrite");
      const store = tx.objectStore("orders");
      const orders = [
        {
          name: 'Cabinet',
          id: 'ca-brn-ma',
          price: 799.99,
          color: 'brown',
          material: 'mahogany',
          description: 'An intricately-designed, antique cabinet',
          quantity: 7
        },
        {
          name: 'Armchair',
          id: 'ac-gr-pin',
          price: 299.99,
          color: 'grey',
          material: 'pine',
          description: 'A plush recliner armchair',
          quantity: 3
        },
        {
          name: 'Couch',
          id: 'cch-blk-ma',
          price: 499.99,
          color: 'black',
          material: 'mahogany',
          description: 'A very comfy couch',
          quantity: 3
        }
      ];
      return Promise.all(orders.map((order) => {
        console.log("[main.js]: Adding order -> ", order);
        return store.add(order);
      })).catch((err) => {
        tx.abort();
        console.log("[main.js]: Error adding order -> ", err);
      }).then(() => {
        console.log("[main.js]: All orders added successfully.");
      })
    });
  }

  function showOrders() {
    var s = '';
    dbPromise.then(function(db) {
      var tx = db.transaction('orders', 'readonly');
      var store = tx.objectStore('orders');
      return store.openCursor();
    }).then(function showRange(cursor) {
      if (!cursor) {return;}
      console.log('Cursored at:', cursor.value.name);

      s += '<h2>' + cursor.value.name + '</h2><p>';
      for (var field in cursor.value) {
        s += field + '=' + cursor.value[field] + '<br/>';
      }
      s += '</p>';

      return cursor.continue().then(showRange);
    }).then(function() {
      if (s === '') {s = '<p>No results.</p>';}
      document.getElementById('orders').innerHTML = s;
    });
  }

  function getOrders() {
    return dbPromise.then((db) => {
      const tx = db.transaction("orders", "readonly");
      const store = tx.objectStore("orders");
      return store.getAll();
    });
  }

  function fulfillOrders() {
    getOrders().then(function(orders) {
      return processOrders(orders);
    }).then(function(updatedProducts) {
      updateProductsStore(updatedProducts);
    });
  }

  function processOrders(orders) {
    return dbPromise.then((db) => {
      const tx = db.transaction("products");
      const store = tx.objectStore("products");
      return Promise.all(
        orders.map((order) => {
          return store.get(order.id).then((product) => {
            return decrementQuantity(product, order);
          });
        })
      );
    });
  }

  function decrementQuantity(product, order) {
    return new Promise((resolve, reject) => {
      const item = product;
      const qtyRemaining = item.quantity - order.quantity;
      if (qtyRemaining < 0) {
        console.log("Not enough " + product.id  + " left in stock");
        document.getElementById("receipt").innerHtml = `<h3>Not enough ${product.id} left in stock!</h3>`;
        throw "Out of stock!";
      }
      item.quantity = qtyRemaining;
      resolve(item);
    });
  }


  function updateProductsStore(products) {
    dbPromise.then(function(db) {
      var tx = db.transaction('products', 'readwrite');
      var store = tx.objectStore('products');
      return Promise.all(products.map(function(item) {
          return store.put(item);
        })
      ).catch(function(e) {
        tx.abort();
        console.log(e);
      }).then(function() {
        console.log('Orders processed successfully!');
        document.getElementById('receipt').innerHTML =
        '<h3>Order processed successfully!</h3>';
      });
    });
  }

  return {
    dbPromise: (dbPromise),
    addProducts: (addProducts),
    getByName: (getByName),
    displayByName: (displayByName),
    getByPrice: (getByPrice),
    getByDesc: (getByDesc),
    addOrders: (addOrders),
    showOrders: (showOrders),
    getOrders: (getOrders),
    fulfillOrders: (fulfillOrders),
    processOrders: (processOrders),
    decrementQuantity: (decrementQuantity),
    updateProductsStore: (updateProductsStore)
  };
})();
