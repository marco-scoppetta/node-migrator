
const Migrator = require('./GraknMigrator');
const Template = require('./Templates');

const files = [
    {input: '/Data/info/info.csv', template: Template.migrateInfo},
    {input: '/Data/deals/deals.csv', template: Template.migrateDeals},
    {input: '/Data/details/details.csv', template: Template.migrateDetails},
];

const migrator = new Migrator('localhost:48555', 'example-ks', {verbose: true});

migrator.migrateCSV(files)
.then(()=>{ console.log('Migration Complete!');})
.catch((err)=>{ 
    console.log("Error while migrating: ")
    console.error(err);
})