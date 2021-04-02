const webPush = require('web-push');

const pushSubscription = {
  "endpoint":"https://fcm.googleapis.com/fcm/send/cUiyyyGnNHI:APA91bGclLfG5N_9kpl4XYFOekmNYhm5Kil2nThLKOJtNPWeYz_xCELyoYoIzAcYXwpn9L26C93NImxs_ZS7UtEuvpjHDDlxxi91XUbADEmvuXlyZacyHJUrskSV0PHl6J4e0TwKw-0U",
  "expirationTime": null,
  "keys": {
    "p256dh":"BAaJJrOxzxDQDhn3iNhYeWE2LhvP_PVI9yzuetcsCHjvjWlfwMecoyQspcKm8xuzHLEs5aGDwgnnrFQbE8f4q2Q",
    "auth":"UDjUFMaX1VwNa3y7XXTbiw"
  }
};

const vapidPublicKey = "BIkTnffXEir_WbkKokaHGHJVuoEsmlx1rA8rCtBjD-_85PG4kU4dGtWjYE52ydNLchN6H9YL4lckQG5Kdsz2rJs";
const vapidPrivateKey = "Pp03KqFQUwVUAOq95xafIU4XndC195N7tZ8cJKPNvr0";

const payload = 'Here is a payload!';

const options = {
  // gcmAPIKey: 'AAAAF9t1FbA:APA91bFzOjzCTw418FAX0fRdPUAvtxL0ubfqC0vps5flRaeDErM5NQZYo4AUxv6A6nfzufO9VIuErZm6RkfkUCDoDbsPKDgrKnlfgizVQI55NBPVGnA0OYlSTtw4ZQCrHTA_IYf1ywxT',
  TTL: 60,
  vapidDetails: {
    subject: "mailto: gabrielbourget@gmail.com",
    publicKey: vapidPublicKey,
    privateKey: vapidPrivateKey,
  }
};

webPush.sendNotification(
  pushSubscription,
  payload,
  options
);