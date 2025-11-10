// JS/components/stockManager.js
const stockDatabase = {
    "product-123": { stock: 1, reserved: 0 },
    "product-456": { stock: 15, reserved: 2 },
    // ... more products
};



// stockManager.js
function broadcastStockUpdate(productId) {
    // Update product cards
    updateProductDisplays(productId);
    // Update cart if item is there
    updateCartStockLimits(productId);
    // Update product page if viewing that item
    updateProductPageStock(productId);
}


// In admin dashboard
function updateStock(productId, newStock) {
    stockDatabase[productId].stock = newStock;
    saveStockToLocalStorage(); // Or send to backend
    broadcastStockUpdate(productId); // Notify other parts of site
}



// In productpage.js
import { getStock, reserveStock } from '../stockManager.js';

// In cart.js  
import { getStock, updateReservedStock } from '../stockManager.js';

// In index.js
import { getStock } from '../stockManager.js';


/*
Admin Dashboard → 
  Updates stockDatabase → 
    Saves to localStorage → 
      Broadcasts to all components → 
        Updates UI everywhere*/
