const CACHE_NAME = "ecommerce-pwa-cache-v1"
const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/index.js",
  "/flipkart.png",
  "/flipkart4.png",
  "/electronics.png",
  "/fashion.png",
  "/home.png",
  "/books.png",
]

// Install event: Cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache")
        return cache.addAll(urlsToCache)
      })
      .catch((err) => console.log("Cache install failed:", err)),
  )
  // Force the waiting service worker to become the active service worker
  self.skipWaiting()
})

// Activate event: Cleanup old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Deleting old cache:", cache)
            return caches.delete(cache)
          }
        }),
      )
    }),
  )
  // Take control of all clients as soon as it activates
  return self.clients.claim()
})

// IMPROVED FETCH: Better offline support with network-first strategy
self.addEventListener("fetch", (event) => {
  console.log("Fetch event for:", event.request.url)

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    console.log("Skipping cross-origin fetch:", event.request.url)
    return
  }

  event.respondWith(
    // Try network first
    fetch(event.request)
      .then((response) => {
        console.log("Network response for:", event.request.url)
        // Clone the response since we need to use it twice
        const responseClone = response.clone()

        // Update the cache with the fresh response
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone)
          console.log("Updated cache for:", event.request.url)
        })

        return response
      })
      .catch(() => {
        // If network fails, try the cache
        console.log("Network failed, trying cache for:", event.request.url)
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log("Found in cache:", event.request.url)
            return cachedResponse
          }

          // If not in cache and it's a document request, return the offline page
          if (event.request.mode === "navigate") {
            console.log("Returning index.html for offline navigation")
            return caches.match("/index.html")
          }

          // Otherwise, return a simple error response
          console.log("Not found in cache:", event.request.url)
          return new Response("Network error occurred. You are offline.", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          })
        })
      }),
  )
})

// IMPROVED SYNC: More robust background sync
self.addEventListener("sync", (event) => {
  console.log("Sync event received:", event.tag)

  if (event.tag === "sync-cart") {
    event.waitUntil(syncCartData())
  } else if (event.tag === "test-sync") {
    event.waitUntil(testSync())
  }
})

// Simple function to simulate syncing cart data
async function syncCartData() {
  console.log("Syncing cart data...")

  try {
    // Simulate successful sync
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Show notification
    await self.registration.showNotification("Cart Synced", {
      body: "Your cart items have been updated.",
      icon: "/flipkart.png",
      badge: "/flipkart.png",
    })

    console.log("Cart synced successfully")
  } catch (error) {
    console.error("Cart sync failed:", error)
    // Show error notification
    await self.registration.showNotification("Sync Failed", {
      body: "Could not sync your cart. Will try again later.",
      icon: "/flipkart.png",
      badge: "/flipkart.png",
    })
  }
}

// Test sync function
async function testSync() {
  console.log("Test sync running...")

  try {
    // Simulate successful sync
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Show notification
    await self.registration.showNotification("Test Sync", {
      body: "Background sync is working!",
      icon: "/flipkart.png",
      badge: "/flipkart.png",
    })

    console.log("Test sync completed")
  } catch (error) {
    console.error("Test sync failed:", error)
  }
}

// FIXED PUSH: Simplified push notification handling without JSON parsing
self.addEventListener("push", (event) => {
  console.log("Push event received:", event)

  // Get the notification text directly as text, no JSON parsing
  const notificationText = event.data ? event.data.text() : "🔥 Flash Sale: 50% Off on All Items! 🔥"

  console.log("Push notification text:", notificationText)

  const options = {
    body: notificationText,
    icon: "/flipkart.png",
    badge: "/flipkart.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View Offers",
      },
      {
        action: "close",
        title: "Close",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("Flipkart Alert", options))
})

// Notification click event handler
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event.notification.title)
  event.notification.close()

  // Handle notification action clicks
  if (event.action === "explore") {
    console.log('User clicked "View Offers" action')
    // You could open a specific page here
  } else if (event.action === "close") {
    console.log('User clicked "Close" action')
    return // Do nothing, just close the notification
  }

  // Open or focus main page
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/")
      }
    }),
  )
})

// Log any errors that occur during service worker execution
self.addEventListener("error", (event) => {
  console.error("Service Worker error:", event.message, event.filename, event.lineno)
})

console.log("Service Worker loaded successfully")
