import sql from 'mssql'

// connection configs
const config = {
    user: 'mc365',
    password: 'tkadbrdhmc1!',
    server: '20.41.118.57',
    database: 'tsfmc_stt_system',
    port: 1433,
    options: {
        instancename: 'SQLEXPRESS',
        encrypt: false,
        trustedconnection: true,
        trustServerCertificate: true
    },
}

export default async function ExecuteQuery(query, options) {
    try {
        let pool = await sql.connect(config);
        let products = await pool.request().query(query, options);
        return products.recordset;
    }
    catch (error) {
        console.log(error);
    }
}