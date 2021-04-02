self.addEventListener("notificationclose", (evt) => {
  const notification = evt.notification;
  const primaryKey = notification.data.primaryKey;

  console.log(`[sw.js]: Closed notification: ${primaryKey}`);
});

// self.addEventListener("notificationclick", (evt) => {
//   const notification = evt.notification;
//   const primaryKey = notification.data.primaryKey;
//   clients.openWindow(`samples/page${primaryKey}.html`);
//   notification.close();
// });

self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const primaryKey = notification.data.primaryKey;
  const action = event.action;

  // - DEV NOTE -> Not all platform support action buttons, and not every platform
  //               displays all actions. Handling actions in an 'else' block is a best
  //               practice which helps to provide a default user experience that works
  //               everywhere.
  if (action === 'close') {
    notification.close();
  } else {
    event.waitUntil(
      clients.matchAll().then((clients) => {
        const client = clients.find((c) => c.visibilityState === "visible");

        if (client !== undefined) {
          client.navigate(`samples/page${primaryKey}.html`);
          client.focus();
        } else {
          clients.openWindow('samples/page' + primaryKey + '.html');
          notification.close();
        }
      })
    );
  }

  self.registration.getNotifications().then((notifications) => {
    notifications.forEach((notification) => notification.close());
  });
});

self.addEventListener("push", (evt) => {
  let body;

  if (evt.data) body = evt.data.text();
  else body = "Default body";

  const options = {
    body,
    icon: "images/notification-flat.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
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
    ]
  };

  evt.waitUntil(
    clients.matchAll().then((client) => {
      console.log(`[sw.js]: Client -> ${client}`);
      if (client.length === 0) {
        self.registration.showNotification("Push Notification", options);
      } else {
        console.log(`[sw.js]: Application is already open.`);
      }
    })
  );
})
