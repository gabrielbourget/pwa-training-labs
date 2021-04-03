(function() {
  'use strict';

  if (!('Notification' in window)) {
    console.log('This browser does not support notifications!');
    return;
  }

  if (!('serviceWorker' in navigator)) {
    console.log('This browser does not support service workers!');
    return;
  }

  if (!('PushManager' in window)) {
    console.log('This browser does not support push!');
    return;
  }

  window.addEventListener('load', () => {
      // Register service worker
      navigator.serviceWorker.register('sw.js')
        .then(reg => {
          console.log('Service Worker Registered!', reg);
        })
        .catch(err => {
          console.log('Service Worker registration failed: ', err);
        });

      // Request notification permission
      Notification.requestPermission(function(status) {
        console.log('Notification permission status:', status);
      });
    });

  // Send custom analytics event

  const favorite = () => {
    gtag("event", "favorite", {
      "event_category": "photos",
      "event_label": "cats",
    });
  };
  const favoriteButton = document.getElementById('favorite');
  favoriteButton.addEventListener('click', favorite);

  // Subscribe functionality

  const subscribe = () => {
    navigator.serviceWorker.ready
    .then(reg => {
      reg.pushManager.getSubscription()
      .then(sub => {
        if (!sub) {
          reg.pushManager.subscribe({userVisibleOnly: true})
          .then(subscription => {
            console.log('Subscribed to push,', subscription);
            gtag("event", "subscribe", {
              "event_category": "push",
              "event_label": "cat updates"
            });
          })
          .catch(error => {
            if (Notification.permission === 'denied') {
              console.warn('Subscribe failed, notifications are blocked');
              // Optional TODO - Send hits for subscribe error
            } else {
              console.error('Unable to subscribe to push', error);
              // Optional TODO - Send hits for subscribe error
            }
          });
        } else {
          console.log('Already subscribed');
        }
      }).catch(error => {
        console.log('Cannot access Subscription object', error);
      });
    });
  };
  const subscribeButton = document.getElementById('subscribe');
  subscribeButton.addEventListener('click', subscribe);

  // Unsubscribe functionality

  const unsubscribe = () => {
    navigator.serviceWorker.ready
    .then(reg => {
      reg.pushManager.getSubscription()
      .then(sub => {
        if (sub) {
          sub.unsubscribe()
          .then(() => {
            console.log('Unsubscribed!');
            gtag("event", "unsubscribe", {
              "event_category": "push",
              "event_label": "cat updates"
            });
          });
        } else {
          console.log('Not currently subscribed');
        }
      });
    })
    .catch(error => {
      console.warn('Error unsubscribing', error);
      // Optional TODO - Send hits for unsubscribe error
    });
  };
  const unsubscribeButton = document.getElementById('unsubscribe');
  unsubscribeButton.addEventListener('click', unsubscribe);

})();
