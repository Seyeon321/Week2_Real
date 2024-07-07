const express = require('express');

const usersRouter = require('./usersRouter');

const app = express();
const port = 3000;

app.use(express.json());

app.use('/users', usersRouter);

//엔드포인트 설정
app.post("/auth/kakao/callback", (req, res) => {
    const user = req.body; //요청 본문에서 데이터 읽기
    console.log('Recieved user data:', user); // 데이터 처리 로직 추가
    res.status(201).send("User data received and processed.");
});

app.get('/', (req, res)=>{
    res.send(`<h2>welcome to server</h2>`);
});

app.listen(port, ()=>{
   console.log(`SERVER 실행됨 ${port}`); 
});