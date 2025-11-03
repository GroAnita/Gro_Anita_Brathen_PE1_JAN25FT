const productCategories = {
    //Fashion
    "3b43b2e4-62b0-4c02-9166-dffa46a0388c": ["fashion"],
    "5391e16f-d88b-4747-a989-f17fb178459d": ["fashion"],
    "f7bdd538-3914-409d-bd71-8ef962a9a9dd": ["fashion"],
    "95dc28de-9ef6-4c67-808b-6431a5de43e8": ["fashion"],
    "7c6353ec-17a9-4a4d-a9d7-6997465367e1": ["fashion"],
    "f2d44fba-09a7-4ccb-9ceb-a6212bf5c213": ["fashion"],
    //Electronics
    "f99cafd2-bd40-4694-8b33-a6052f36b435": ["electronics"],
    "159fdd2f-2b12-46de-9654-d9139525ba87": ["electronics"],
    "83111322-05a9-4a93-bc81-7d6b58f1a707": ["electronics"],
    "1fd1ddca-0d38-4e41-aa62-a1a7a57cf4b5": ["electronics"],
    "10d6cc02-b282-46bb-b35c-dbc4bb5d91d9": ["electronics"],
    "31e3a66f-2dbe-47ae-b80d-d9e5814f3e32": ["electronics"],
    "5aa2e388-8dfb-4d70-b031-3732d8c6771a": ["electronics"],
    "3f328f02-715e-477f-9738-7934af4bc5b0": ["electronics"],
    "894ca18f-9725-40b3-9429-1420ee2054da": ["electronics"],
    "be5e376d-e657-4035-8916-1580c52f4e98": ["electronics"],
    "ce5b64e3-440d-46e5-952f-bfdbad8a48d2": ["electronics"],
    "f5d453d1-e811-4225-81ac-cee54ef0384b": ["electronics"],
    "f6712e3b-8050-4841-bd64-f332a48f7566": ["electronics"],
    "fbf07ebe-9f9a-4895-8a16-567acbbeef4e": ["electronics"],
    //health and beauty
    "109566af-c5c2-4f87-86cb-76f36fb8d378": ["health and beauty"],
    "414f5b60-c574-4a2f-a77b-3956b983495b": ["health and beauty"],
    "9be4812e-16b2-44e6-bc55-b3aef9db2b82": ["health and beauty"],
    "c0d245f1-58fa-4b15-aa0c-a704772a122b": ["health and beauty"],

};

function getProductCategories(productId) {
    return productCategories[productId] || [];
}

function isInCategory(productId, category) {
    const categories = getProductCategories(productId);
    return categories.includes(category);
}