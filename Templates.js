function migrateInfo(l){
    let query = `insert $r isa example has name "${l['exampleName']}"; $o isa opening;`;

    query += ` (opener: $r, opened: $o) isa opens;`;
    return query;
}

function migrateDeals(l){
    let query=`match $r isa example has name "${l['exampleName']}"; `
    
    query +=`insert $deal isa deal has name "${l['deal']}" \
                has price ${l['price']} \
                has deal-ID "${l['ID']}" \
                has terms "${l['terms']}" \
                has description "${l['description']}";\
    (discounter: $r, discounted: $deal) isa discounts;`;

    return query;
}


function migrateDetails(l){
    let query=`match $r isa example has name "${l['exampleName']}"; `

	if (l['new'] === "yes"){
		query +=`example condition`;
	}

	if (l['old'] === "yes"){
		query +=`example condition`;
	}

    return query;
}

module.exports = {
    migrateInfo,
    migrateDeals,
    migrateDetails
}