const mysql = require('mysql2');
//Pool: collection of database connections that can be reused. database 의 request마다 새로운 connection을 여는게 아니라, 이거 하나로 유지.
//Create connection between the pool. THe pool-specific settings are the defaults.
const pool = mysql.createPool({
    host: 'localhost', //Connects to MySQL server running on the local machine.
    user: 'root', // Uses the MySQL root user to connect.
    database: 'app_db', // Connects to the 'test' database.
    password: '0909', // provided password for the root user.
    waitForConnections: true, //If the connection limit is reached, wait for a connection to be available instead of throwing an error.
    connectionLimit: 10, // # of maximum connections to the pool.
    queueLimit: 0
});

const getUsers = async() => { //getUsers: async function(perform tasks that take some time to complete, without blocking the execution of the rest of the code.)
    const promisePool = pool.promise(); // converts pool into promise, instead of callbacks
    const [rows] = await promisePool.query('select * from serverConnectionTest;'); // 'rows'라는 array에 database의 모든 rows를 담음.
    console.log(rows);
    return rows;
};

module.exports = {
    getUsers
};
