const app = (() => {
  'use strict';

  let isSubscribed = false;
  let swRegistration = null;
  const PUBLIC_VAPID_KEY = "BIkTnffXEir_WbkKokaHGHJVuoEsmlx1rA8rCtBjD-_85PG4kU4dGtWjYE52ydNLchN6H9YL4lckQG5Kdsz2rJs";
  const PRIVATE_VAPID_KEY = "Pp03KqFQUwVUAOq95xafIU4XndC195N7tZ8cJKPNvr0";

  const notifyButton = document.querySelector('.js-notify-btn');
  const pushButton = document.querySelector('.js-push-btn');

  // - DEV NOTE -> To take this beyond the canonical use case, consider edge cases such as
  //               some sort of fallback UX to compensate for a lack of support in some way.
  if (!("Notification" in window)) {
    console.log("[main.js]: This browser does not support notifications.");
  }

  Notification.requestPermission((status) => {
    console.log(`[main.js]: Notification permission status -> ${status}`);
  });

  function displayNotification() {
    if (Notification.permission === "granted") {
      navigator.serviceWorker.getRegistration().then((swReg) => {
        const options = {
          body: "Hello world.",
          icon: "images/notification-flat.png",
          vibrate: [100, 50, 100],
          // tag: "id1",
          data: {
            dateOfArrival: Date.now(),
            primaryKey: 1,
          },
          actions: [
            {
              action: "explore",
              title: "Go to the site",
              icon: "images/checkmark.png",
            },
            {
              action: "close",
              title: "Close the notification",
              icon: "images/xmark.png",
            }
          ],
        };

        swReg.showNotification("Hello world.", options);
      });
    }
  }

  function initializeUI() {

    pushButton.addEventListener("click", () => {
      pushButton.disabled = true;
      if (isSubscribed) {
        unsubscribeUser();
      } else {
        subscribeUser();
      }
    });

    swRegistration.pushManager.getSubscription()
      .then((subscription) => {
        isSubscribed = (subscription !== null);
        updateSubscriptionOnServer(subscription);
        if (isSubscribed) {
          console.log(`[main.js]: user is subscribed`);
        } else {
          console.log(`[main.js]: user is not subscribed`);
        }
        updateBtn();
      });
  }

  const applicationServerPublicKey = PUBLIC_VAPID_KEY;

  function subscribeUser() {
    console.log(`[main.js]: subscribeUser() invoked. swReg object -> ${swRegistration}`);
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })
      .then((subscription) => {
        console.log(`[main.js]: user is subscribed -> ${subscription}`);
        updateSubscriptionOnServer(subscription);
        isSubscribed = true;
        updateBtn();
      }).catch((err) => {
        if (Notification.permission === "denied") {
          console.warn(`[main.js]: Permission for notifications was denied`);
        } else {
          console.error(`Failed to subscribe the user -> ${err}`);
        }
        updateBtn();
      });
  }

  function unsubscribeUser() {
    swRegistration.pushManager.getSubscription()
      .then((subscription) => {
        if(subscription) return subscription.unsubscribe();
      }).catch((err) => console.error(`[main.js]: error unsubscribing from push service`))
      .then(() => {
        updateSubscriptionOnServer(null);
        console.log(`[main.js]: user is unsubscribed from push service`);
        isSubscribed = false;
        updateBtn();
      });
  }

  function updateSubscriptionOnServer(subscription) {
    // Here's where you would send the subscription to the application server

    const subscriptionJson = document.querySelector('.js-subscription-json');
    const endpointURL = document.querySelector('.js-endpoint-url');
    const subAndEndpoint = document.querySelector('.js-sub-endpoint');

    if (subscription) {
      subscriptionJson.textContent = JSON.stringify(subscription);
      endpointURL.textContent = subscription.endpoint;
      subAndEndpoint.style.display = 'block';
    } else {
      subAndEndpoint.style.display = 'none';
    }
  }

  function updateBtn() {
    if (Notification.permission === 'denied') {
      pushButton.textContent = 'Push Messaging Blocked';
      pushButton.disabled = true;
      updateSubscriptionOnServer(null);
      return;
    }

    if (isSubscribed) {
      pushButton.textContent = 'Disable Push Messaging';
    } else {
      pushButton.textContent = 'Enable Push Messaging';
    }

    pushButton.disabled = false;
  }

  function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  notifyButton.addEventListener('click', () => {
    displayNotification();
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      console.log('Service Worker and Push is supported');

      navigator.serviceWorker.register('sw.js')
      .then(swReg => {
        console.log('Service Worker is registered', swReg);

        swRegistration = swReg;

        initializeUI();
      })
      .catch(err => {
        console.error('Service Worker Error', err);
      });
    });
  } else {
    console.warn('Push messaging is not supported');
    pushButton.textContent = 'Push Not Supported';
  }

})();
