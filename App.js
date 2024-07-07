const express = require('express');
const mysql = require('mysql2/promise');
// const usersRouter = require('./usersRouter');
const app = express();
const port = 3000;

app.use(express.json());
// app.use('/users', usersRouter);

//MySQL connection configuration
const dbConfig = {
    host: 'localhost', //Connects to MySQL server running on the local machine.
    user: 'root', // Uses the MySQL root user to connect.
    database: 'app_db', // Connects to the 'test' database.
    password: '0909', // provided password for the root user.
};
let connection;

//Function to connect to MySQL
async function connectDB() {
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to the MySQL database.');
    } catch (error) {
        console.error('Error connecting to the MySQL database:', error);
        process.exit(1);
    }
}

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`SERVER running on port ${port}`);
    });
}).catch(err => {
    console.error('Failed to connect to DB. Server not started');
});

app.get('/', (req, res)=>{
    res.send(`<h2>welcome to server</h2>`);
});

//======================================frontend 에서 post================================================= 
app.post("/auth/kakao/callback", async(req, res) => {
    const user = req.body; //요청 본문에서 데이터 읽기
    console.log('Recieved user data:', user); // 데이터 처리 로직 추가

    try{
        const query = 'INSERT INTO user_inf (user_name, user_id) VALUES (?, ?)';
        const [result] = await connection.execute(query, [user.nickname, user.email]);
        console.log('Data inserted into MySQL:', result);

        res.status(201).send("User data received and processed.");
    } catch(error){
        console.error('Error inserting data into MySQL:', error);
        res.status(500).send('Error processing user data');
    }
    
});

//======================================frontend 에서 get================================================= 
app.get('/users', async(req, res) => { //to fetch all users from table
    console.log('GET /users endpoint hit');
    const userID = "jennifer.sy.oh@gmail.com"
    try{
        const[rows, fields] = await connection.execute('SELECT u.user_name, p.title, p.lan, p.type, ps.start_d, ps.end_d FROM proj AS p JOIN user_inf AS u ON (p.user_id = u.user_id) JOIN proj_stat as ps ON (p.proj_id = ps.proj_id) WHERE u.user_id = ?', [userID]);
        res.status(200).json(rows); // results are sent back as JSON
    } catch (error) {
        console.error('Error fetching data from MySQL:', error);
        res.status(500).send('Error fetching data from the database');
    }
});