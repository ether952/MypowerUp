// Service Worker para MyPowerUp: Manejo de Notificaciones de Entrenamiento y Acciones de Pantalla de Bloqueo

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Manejar clics en las notificaciones y en sus botones de acción ("✔ Serie Lista", "🔄 + Reps", "⚖ +2.5kg")
self.addEventListener('notificationclick', (event) => {
  const action = event.action;

  // No cerramos la notificación si fue una acción rápida para que siga visible mientras entrena
  if (!action || action === 'open') {
    event.notification.close();
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. Enviar evento al cliente activo (la app web abierta)
      for (const client of clientList) {
        if ('postMessage' in client) {
          client.postMessage({
            type: 'MYPOWERUP_WORKOUT_ACTION',
            action: action || 'focus'
          });
          if (!action && 'focus' in client) {
            return client.focus();
          }
        }
      }

      // 2. Si no hay ventana abierta y el usuario tocó la notificación general, abrir la app
      if (!action && self.clients.openWindow) {
        return self.clients.openWindow('/diario');
      }
    })
  );
});
