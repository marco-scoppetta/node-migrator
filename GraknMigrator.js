const Grakn = require('grakn');
const Papa = require('papaparse');
const fs = require('fs');

const USERNAME_FIELD = 'username';
const PASSWORD_FIELD = 'password';

function Migrator(uri, keyspace, options){
    let credentials = null;
    if(options && (USERNAME_FIELD in options) && (PASSWORD_FIELD in options)) {
        credentials = {username: options[USERNAME_FIELD], password: options[PASSWORD_FIELD]};
    }
    const session = Grakn.session(uri, keyspace, credentials);
    const verbose = (options) ? options.verbose : false;


    function mapCSVtoGraql(input, template){
        const queries = [];
        return new Promise((resolve, reject)=>{
            Papa.parse(fs.createReadStream(input),{
                header: true,
                complete: () => { resolve(queries); },
                step: (row)=>{ 
                    const graqlQuery = template(row.data[0]);
                    queries.push(graqlQuery);
                },
                error: (err) =>{ reject(err); }
            })
        })
    }
    
    async function executeQueries(tx, graqlQueries){
        for(graqlQuery of graqlQueries){
            if(verbose){ process.stdout.write("\r Executing query: "+graqlQuery);}
            await tx.execute(graqlQuery).catch((err)=>{ 
                tx.close(); 
                if('details' in err){ throw err.details;}
                else{ throw err;}
            });
        }
    }

    this.migrateCSV = async function(files){
        try{
            for(let {input, template} of files){
                const graqlQueries = await mapCSVtoGraql(input, template);
                const tx = await session.transaction(Grakn.txType.WRITE);
                process.stdout.write(`\n\nMigrating file [${input}] with template [${template.name}]`);
                let t;
                if(!verbose) { process.stdout.write('..'); t = setInterval(()=>{process.stdout.write('.')}, 2000); } 
                else { process.stdout.write(':\n'); }
                await executeQueries(tx, graqlQueries);
                await tx.commit();
                if(!verbose) { clearInterval(t); }
                else{process.stdout.write('\n'); }
                process.stdout.write(`FILE COMPLETE\n`);
            };
            session.close();
        }catch(e){
            session.close(); 
            throw e;
        }
    }

}





module.exports = Migrator;