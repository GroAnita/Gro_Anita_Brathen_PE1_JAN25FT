// JS/components/stockManager.js
const stockDatabase = {
    //fashion
    "3b43b2e4-62b0-4c02-9166-dffa46a0388c": { stock: 1, reserved: 1 },
    "5391e16f-d88b-4747-a989-f17fb178459d": { stock: 1, reserved: 0 },
    "f7bdd538-3914-409d-bd71-8ef962a9a9dd": { stock: 1, reserved: 0 },
    "95dc28de-9ef6-4c67-808b-6431a5de43e8": { stock: 1, reserved: 1 },
    "7c6353ec-17a9-4a4d-a9d7-6997465367e1": { stock: 1, reserved: 0 },
    "f2d44fba-09a7-4ccb-9ceb-a6212bf5c213": { stock: 1, reserved: 0 },
    //Electronics
    "f99cafd2-bd40-4694-8b33-a6052f36b435": { stock: 2, reserved: 0 },
    "159fdd2f-2b12-46de-9654-d9139525ba87": { stock: 1, reserved: 0 },
    "83111322-05a9-4a93-bc81-7d6b58f1a707": { stock: 1, reserved: 0 },
    "1fd1ddca-0d38-4e41-aa62-a1a7a57cf4b5": { stock: 1, reserved: 0 },
    "10d6cc02-b282-46bb-b35c-dbc4bb5d91d9": { stock: 1, reserved: 0 },
    "31e3a66f-2dbe-47ae-b80d-d9e5814f3e32": { stock: 1, reserved: 0 },
    "5aa2e388-8dfb-4d70-b031-3732d8c6771a": { stock: 1, reserved: 0 },
    "3f328f02-715e-477f-9738-7934af4bc5b0": { stock: 1, reserved: 0 },
    "894ca18f-9725-40b3-9429-1420ee2054da": { stock: 1, reserved: 0 },
    "be5e376d-e657-4035-8916-1580c52f4e98": { stock: 1, reserved: 0 },
    "ce5b64e3-440d-46e5-952f-bfdbad8a48d2": { stock: 1, reserved: 0 },
    "f5d453d1-e811-4225-81ac-cee54ef0384b": { stock: 1, reserved: 0 },
    "f6712e3b-8050-4841-bd64-f332a48f7566": { stock: 1, reserved: 0 },
    "fbf07ebe-9f9a-4895-8a16-567acbbeef4e": { stock: 1, reserved: 0 },
    //health and beauty
    "109566af-c5c2-4f87-86cb-76f36fb8d378": { stock: 10, reserved: 0 },
    "414f5b60-c574-4a2f-a77b-3956b983495b": { stock: 10, reserved: 0 },
    "9be4812e-16b2-44e6-bc55-b3aef9db2b82": { stock: 10, reserved: 0 },
    "c0d245f1-58fa-4b15-aa0c-a704772a122b": { stock: 10, reserved: 0 },
};


export function getAvailableStock(productId) {
    const item = stockDatabase[productId];
    if (!item) return 0;
    return item.stock - item.reserved;
}

function canAddToCart(productId, quantity = 1) {
    const available = getAvailableStock(productId);
    return available >= quantity;
}


function reserveStock(productId, quantity = 1) {
    if (!canAddToCart(productId, quantity)) {
        return false; 
    }
    stockDatabase[productId].reserved += quantity;
    return true;
}

function unreserveStock(productId, quantity = 1) {
    const item = stockDatabase[productId];
    if (!item) return;
    item.reserved = Math.max(0, item.reserved - quantity);
}

function confirmPurchase(productId, quantity = 1) {
    const item = stockDatabase[productId];
    if (!item) return false;
    if (item.reserved < quantity) return false;
    item.stock -= quantity;
    item.reserved -= quantity;
    return true;
}

function cancelReservation(productId, quantity = 1) {
    unreserveStock(productId, quantity);
}

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





/*
Admin Dashboard → 
  Updates stockDatabase → 
    Saves to localStorage → 
      Broadcasts to all components → 
        Updates UI everywhere*/
