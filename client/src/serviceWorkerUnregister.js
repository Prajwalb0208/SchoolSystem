// This file unregisters any existing service workers
// Run this to clear old service workers

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister().then(function(boolean) {
        console.log('Service worker unregistered:', boolean);
      });
    }
  });
}

