// Simple Service Worker Registration
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/serviceworker.js")
        .then((reg) => {
          console.log("Service Worker registered successfully!", reg)
  
          // Test background sync
          if ("sync" in reg) {
            // Trigger a test sync event
            document.getElementById("syncButton")?.addEventListener("click", () => {
              reg.sync
                .register("test-sync")
                .then(() => console.log("Sync registered!"))
                .catch((err) => console.log("Sync registration failed:", err))
            })
          }
  
          // Test push notification (simulated)
          document.getElementById("notifyButton")?.addEventListener("click", () => {
            // This simulates receiving a push notification
            if (Notification.permission === "granted") {
              // Send a simple text message, not JSON
              const pushEvent = new MessageEvent("push-received", {
                data: "Test push notification",
              })
              window.dispatchEvent(pushEvent)
            } else {
              alert("Please grant notification permission first!")
            }
          })
        })
        .catch((err) => console.log("Service Worker registration failed:", err))
    })
  
    // Listen for simulated push events
    window.addEventListener("push-received", (event) => {
      if (Notification.permission === "granted") {
        navigator.serviceWorker.ready.then((reg) => {
          // Send a simple text notification, not JSON
          reg.showNotification("Flipkart Notification", {
            body: event.data || "🔥 Flash Sale: 50% Off on All Items! 🔥",
            icon: "/flipkart.png",
            badge: "/flipkart.png",
          })
        })
      }
    })
  }
  
  // Request notification permission
  document.addEventListener("DOMContentLoaded", () => {
    const notifyPermissionBtn = document.getElementById("notifyPermission")
    if (notifyPermissionBtn) {
      notifyPermissionBtn.addEventListener("click", () => {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            console.log("Notification permission granted.")
            alert("Notification permission granted!")
          } else {
            alert("Notification permission denied.")
          }
        })
      })
    }
  })
  
  // Simple cart functionality without IndexedDB
  const cart = []
  
  function addToCart(item) {
    cart.push(item)
    console.log("Item added to cart:", item)
    const cartCountElement = document.getElementById("cartCount")
    if (cartCountElement) {
      cartCountElement.textContent = cart.length.toString()
    }
  
    // Simulate cart update that would trigger sync
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.sync
          .register("sync-cart")
          .then(() => console.log("Cart sync registered"))
          .catch((err) => console.log("Cart sync registration failed:", err))
      })
    }
  }
  
  // Expose function to window for use in HTML
  window.addToCart = addToCart
  
  // Display cart items
  function displayCart() {
    const cartContainer = document.getElementById("cart-items")
    if (!cartContainer) return
  
    if (cart.length === 0) {
      cartContainer.innerHTML = "<p>Your cart is empty</p>"
      return
    }
  
    let html = "<ul>"
    let total = 0
  
    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity
      total += itemTotal
      html += `<li>${item.name} - ₹${item.price} x ${item.quantity} = ₹${itemTotal}</li>`
    })
  
    html += `</ul><p><strong>Total: ₹${total}</strong></p>`
    cartContainer.innerHTML = html
  }
  
  window.displayCart = displayCart
  
  // Fix for the addProductToCart error
  window.addProductToCart = (productId) => {
    console.log(`Product ${productId} added to cart`)
    // You can implement the actual functionality here
    // For now, just call addToCart with a default product
    addToCart({
      id: productId,
      name: `Product ${productId}`,
      price: 999,
      quantity: 1,
    })
  }
  