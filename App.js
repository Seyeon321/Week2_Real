const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
const port = 80;

app.use(express.json());

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
    app.listen(port, '0.0.0.0', () => {
        console.log(`SERVER running on port ${port}`);
    });
}).catch(err => {
    console.error('Failed to connect to DB. Server not started');
});


app.get('/', (req, res)=>{
    res.send(`<h2>welcome to server</h2>`);
});

//======================================frontend 에서 post : 데이터 받아서 DB에 저장===================================================
//=================================1. 로그인========================================
app.post("/auth/kakao/callback", async(req, res) => {

    const {email, nickname} = req.body; //요청 본문에서 데이터 읽기
    const bEmail = req.body.email;
    const bNickname = req.body.nickname;
    

    console.log('Recieved user data'); // 데이터 처리 로직 추가
    console.log('Received request body:', req.body);
    try{
        const query = 'INSERT INTO user_inf (user_id, user_name) VALUES (?, ?)';
        const [result] = await connection.execute(query, [bEmail, bNickname]);
        console.log('Data inserted into MySQL:', result);
        res.status(201).send("User data received and processed.");
    } catch(error){
        console.error('Error inserting data into MySQL:', error);
        res.status(500).send('Error processing user data');}
});
//=================================2. 새 프로젝트 만들기========================================
app.post("/newproj", async(req, res) => {

    const {title, user_id, lan, type, start_d, end_d} = req.body; //요청 본문에서 데이터 읽기
    const bTitle = req.body.title;
    const bEmail = req.body.user_id;
    const bLan = req.body.lan;
    const bType = req.body.type;
    const bStartD = req.body.start_d;
    const bEndD = req.body.end_d;

    console.log('Recieved new project data', req.body);

    try{
        const query = 'INSERT INTO proj (title, user_id, lan, type, start_d, end_d, likes) VALUES (?, ?, ?, ?, ?, ?, 0)';
        const [rows, fields] = await connection.execute(query, [bTitle, bEmail, bLan||null, bType, bStartD, bEndD||null]);
        
        console.log('Data inserted into MySQL:', [rows]);
        res.status(201).send("User data received and processed.");
    } catch(error){
        console.error('Error inserting data into MySQL:', error);
        res.status(500).send('Error processing user data');}
});
//=================================3. 프로젝트 Id받기========================================
app.post("/idin", async(req, res) => {

    const {proj_id} = req.body; //요청 본문에서 데이터 읽기
    const bProjId = req.body.proj_id;

    console.log('Recieved id:', bProjId);
    try{
        const query = 'INSERT INTO proj_rec (proj_id) VALUES (?)';
        const [rows, fields] = await connection.execute(query, [bProjId]);
        
        console.log('Data inserted into MySQL:', [rows]);
        res.status(201).send("User data received and processed.");
    } catch(error){
        console.error('Error inserting data into MySQL:', error);
        res.status(500).send('Error processing user data');}
});
//===========================================frontend로 데이터 보내기 GET======================================================
//=================================1. 내 학습 페이지/마이페이지========================================
app.get('/user', async(req, res) => { //to fetch all users from table
    console.log('GET /users endpoint hit');

    const {user_id} = req.query;
    const bUserId = req.query.user_id;

    console.log('받은 req.query:', req.query);

    try{
        const query = 'SELECT u.user_id, u.user_name, p.proj_id, p.title, p.lan, p.type, p.start_d, p.end_d FROM proj AS p JOIN user_inf AS u ON (p.user_id = u.user_id) WHERE u.user_id = ? ORDER BY p.proj_id DESC';
        const[rows, fields] = await connection.execute(query, [bUserId]);

        console.log('Data sent to Frontend', [rows]);
        res.status(200).json(rows); // results are sent back as JSON
    } catch (error) {
        console.error('Error fetching data from MySQL:', error);
        res.status(500).send('Error fetching data from the database');
    }
});
//=================================2. 내 학습 상세폴더========================================
app.get('/detailout', async(req, res) => { //to fetch all users from table
    console.log('GET /project detail endpoint hit');

    const {proj_id} = req.query;
    const bProjId = req.query.proj_id;

    console.log('project Id is:', bProjId);

    try{
        const query = 'SELECT p.user_id, p.title, pr.contents, pr.reference, pr.remember FROM proj AS p JOIN proj_rec AS pr ON p.proj_id=pr.proj_id WHERE p.proj_id = ?'; 
        const[rows, fields] = await connection.execute(query, [bProjId]);

        console.log('Data sent to Frontend:', [rows]);
        res.status(200).json(rows); // results are sent back as JSON
    } catch (error) {
        console.error('Error fetching data from MySQL:', error);
        res.status(500).send('Error fetching data from the database');
    }
});
//=================================3. 둘러보기========================================
app.get('/orderbylikes', async(req, res) => { //to fetch all users from table
    console.log('GET / order by likes endpoint hit');

    try{
        const query = 'SELECT * FROM proj';
        const[rows] = await connection.execute(query);

        console.log('Data sent to Frontend', [rows]);
        res.status(200).json(rows); // results are sent back as JSON
    } catch (error) {
        console.error('Error fetching data from MySQL:', error);
        res.status(500).send('Error fetching data from the database');
    }
});
//=================================4. 마이페이지========================================
app.get('/mypage', async(req, res) => {
    console.log('GET / mypage endpoint hit');

    const {user_id} = req.query;
    const bUserId = req.query.user_id;

    try{
        const query = `
            SELECT 
            COUNT(CASE WHEN end_d IS NULL THEN 1 END) AS end_d_null_count,
            COUNT(CASE WHEN end_d IS NOT NULL THEN 1 END) AS end_d_not_null_count,
            SUM(likes) AS total_likes,
            (SELECT lan FROM proj WHERE user_id = ? 
            GROUP BY lan ORDER BY COUNT(*) DESC LIMIT 1) AS most_common_lan,
            (SELECT type FROM proj WHERE user_id = ? 
            GROUP BY type ORDER BY COUNT(*) DESC LIMIT 1) AS most_common_type
        FROM 
            proj
        WHERE 
            user_id = ?;
        `;
        const[rows] = await connection.execute(query, [bUserId, bUserId, bUserId]);

        console.log('Data sent to Frontend', [rows]);
        res.status(200).json(rows); // results are sent back as JSON
    } catch (error) {
        console.error('Error fetching data from MySQL:', error);
        res.status(500).send('Error fetching data from the database');
    }
});
//===========================================데이터 수정 PUT======================================================
//=================================1. 내 학습 페이지 수정========================================
app.put("/updateproj/:proj_id", async (req, res) => {

    const bProjId = req.params.proj_id; // Get the project ID from the URL parameter
    const {title, lang, type, start_d, end_d} = req.body; // Get the updated data from the request body
    const bTitle = req.body.title;
    const bLang = req.body.lang;
    const bType = req.body.type;
    const bStartD = req.body.start_d;
    const bEndD = req.body.end_d;

    console.log('Received updated project');

    try {
        const query = `
            UPDATE proj
            SET title = ?, lan = ?, type = ?, start_d = ?, end_d = ?
            WHERE proj_id = ?`;

        const [result] = await connection.execute(query, [bTitle, bLang, bType, bStartD, bEndD, bProjId]);

        console.log('Data updated in MySQL:', result);

        if (result.affectedRows > 0) {res.status(200).send("Project data updated successfully.");
        } else {res.status(404).send("Project not found.");
        }
    } catch (error) {
        console.error('Error updating data in MySQL:', error);
        res.status(500).send('Error updating project data');
    }
});
//=================================2. 내 학습 상세 페이지 수정========================================
app.put("/updateprojdetail", async (req, res) => {
    
    const {proj_id, contents, ref, remember, isLiked} = req.body; // Get the updated data from the request body
    const bProjId = req.body.proj_id;
    const bContents = req.body.contents;
    const bRef = req.body.ref;
    const bRemember = req.body.remember;
    const bIsLiked = req.body.isLiked;

    console.log('Received updated project detail', {bProjId, bContents, bRef, bRemember, bIsLiked});

    try{
        await connection.beginTransaction();
        const fields = [];

        if (bContents !== undefined) 
            fields.push(`contents = ${mysql.escape(bContents)}`);
        if (bRef !== undefined)
            fields.push(`reference = ${mysql.escape(bRef)}`);
        if (bRemember !== undefined)
            fields.push(`remember = ${mysql.escape(bRemember)}`);

        if(fields.length > 0){
            console.log('fields to update:', fields.join(', '));
            
            const query = `UPDATE proj_rec SET ${fields.join(', ')} WHERE proj_id = ${mysql.escape(bProjId)}`;

            console.log(query);
        
            const [result] = await connection.execute(query);

            console.log('Data updated in MySQL:', result);

            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).send("Project not found.");
            }
        }

        if (bIsLiked !== undefined) {
            // 먼저 현재 좋아요 상태를 확인합니다.
            const checkQuery = 'SELECT likes FROM proj WHERE proj_id = ?';
            const [rows] = await connection.execute(checkQuery, [bProjId]);
        
            if (rows.length === 0) {
                await connection.rollback();
                return res.status(404).send("Project not found.");
            }
        
            const currentLikes = rows[0].likes;
        
            // 새로운 좋아요 상태에 따라 업데이트를 수행합니다.
            let newLikes;
            if (bIsLiked) {
                newLikes = currentLikes + 1; // 이미 좋아요 상태면 증가하지 않음
            } else {
                newLikes = Math.max(0, currentLikes - 1); // 좋아요 취소 시 0 미만으로 내려가지 않도록 함
            }
        
            const updateQuery = 'UPDATE proj SET likes = ? WHERE proj_id = ?';
            const [result] = await connection.execute(updateQuery, [newLikes, bProjId]);
        
            console.log('Likes updated in SQL:', result);
        
            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).send("Project not found.");
            }
        }

        await connection.commit();
        res.status(200).send("Project data updated successfully.");
    } catch (error) {
        console.error("Error updating data in MySQL:", error);
        await connection.rollback();
        res.status(500).send("Error updating project data");
    }
});
//===========================================데이터 삭제 DELECT======================================================
//=================================1. 내 학습 페이지 삭제========================================
app.delete('/deleteproject', async (req, res) => {
    console.log('DELETE /deleteproject endpoint hit');

    const {proj_id} = req.query;
    const bProjId = req.query.proj_id; // or use req.body.proj_id if using request body

    try {
        const query = 'DELETE FROM proj WHERE proj_id = ?';
        const [result] = await connection.execute(query, [bProjId]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Project not found');
        }

        console.log(`Project with ID ${bProjId} deleted`);
        res.status(200).send(`Project with ID ${bProjId} deleted successfully`);
    } catch (error) {
        console.error('Error deleting data from MySQL:', error);
        res.status(500).send('Error deleting project from the database');
    }
});