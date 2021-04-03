importScripts('js/analytics-helper.js');
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.4.1/workbox-sw.js');

workbox.googleAnalytics.initialize();

self.addEventListener('notificationclose', function(e) {
  var notification = e.notification;
  var primaryKey = notification.data.primaryKey;
  console.log('Closed notification: ' + primaryKey);
  e.waitUntil(
    sendAnalyticsEvent("close", "notification")
  );
});

self.addEventListener('notificationclick', function(e) {
  var notification = e.notification;
  var primaryKey = notification.data.primaryKey;
  notification.close();
  e.waitUntil(
    Promise.all([
      clients.openWindow('pages/page' + primaryKey + '.html'),
      sendAnalyticsEvent("click", "notification")
    ])
  );
});

self.addEventListener('push', function(e) {
  var options = {
    body: 'This notification was generated from a push!',
    icon: 'images/notification-flat.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '-push-notification'
    }
  };
  e.waitUntil(Promise.all([
      self.registration.showNotification('Hello world!', options),
      sendAnalyticsEvent("received", "push")
    ])
  );
});
