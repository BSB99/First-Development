'use strict';
const express = require('express');
const app = express();
const Port = 3000;
let db;

// Database 접속이 완료되면 nodejs 서버를
// 띄우는 listen함수 실행
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://admin:qwer1234@cluster0.9ehzh.mongodb.net/TodoApp?retryWrites=true&w=majority', (error, client) => {
    if(error) return console.log(error);
    // TodoApp이라는 database폴더에 연결요청
    db = client.db('TodoApp');

    app.listen(Port, () => {
        console.log(`listening on ${Port}`);
    });
});

// ejs라는 라이브러리를 쓰려고 할때
// 필수적인 setting
app.set('view engine', 'ejs');

//body-parser 라는 라이브러리가 있어야
//서버가 보낸 데이터들 처리가 쉽게 가능하다.
app.use(express.urlencoded({extended : true}));

app.get('/', (req,res) => {
    res.render('index.ejs');
    // res.sendFile(__dirname + '/index.html');
});

app.get('/write', (req,res) => {
    res.render('write.ejs');
    // res.sendFile(__dirname + "/write.html");
});

/* write.html에서 post방식으로 정보를
   /add라는 곳에 전달을 해주었다.
   그 정보는 req에 담겨져있다.

   post 요청으로 서버에 데이터를 전송하고 싶으면
   form 데이터의 경우 input에 name을 써야한다.

   받은 데이터를 db에 전달해야한다.
   collection에서 Post라는 저장폴더에
   insertOne 하나의 데이터를 저장한다.
*/
app.post('/add', (req, res) => {
    //counter 라는 콜렉션에 있는 게시물갯수를 찾아 number라는 변수에 집어넣는다.
    db.collection('counter').findOne({name : '게시물갯수'}, (error, result) => {
        console.log(result.totalPost);
        let number = result.totalPost;
        // 게시물 번호를 db에 전달하는것을 추가하였다.
        db.collection('Post').insertOne({ _id : number + 1, 날짜 : req.body.date, 제목 : req.body.title}, (error, result) => {
            console.log('Save Complet');
            // counter 라는 콜렉션에 있는 totalPost라는 항목 1 증가 (수정);
            // $inc = 증가, $set = 변경
            db.collection('counter').updateOne({name:'게시물갯수'},{ $inc : {totalPost:1} }, (error, result) => {
                if(error) return console.log(error);
            });   
        });

    });
    res.send('전송완료');
});



app.get('/list', (req,res) => {
    // db에 저장된 Post라는 collection안의 모든데이터를 꺼내오는법
    db.collection('Post').find().toArray((error, result)=> {
        console.log(result);
        res.render('list.ejs', { posts : result });
    });
});

app.delete('/delete', (req,res) => {
    console.log(req.body)
});