const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override')
const moment = require('moment');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'))

//declaring some variables in locals to use them in different routes 
app.use((req,res,next)=>{
    res.locals.moment = moment;
    next();
})

//database setup
var mysql = require('mysql');
const pool = mysql.createPool({
    connectionLimit: 5000,
    host:'localhost',
    user:'root',
    password: 'example',
    database: 'class'
});

//home page
app.get('/',(req,res)=>{
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(
            "SELECT * FROM todoapp ", 
            async(er, result, fields)=> {
                if (er) throw er;
                // console.log(result);
                res.render('index',{result})
            });
    });
});

//new form
app.get('/new',(req,res)=>{
    res.render('new')
})

//post
app.post('/',(req,res)=>{
    const {todo,expire} = req.body;
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(
            "INSERT INTO todoapp (todo,expire) VALUES (?,?)",
            [todo,expire], 
            async(er, result, fields)=> {
                if (er) throw er;
                // console.log(result);
            });
    });
    res.redirect('/');
})



//edit form
app.get('/edit', async(req, res) =>{
    const getId = req.query.list_id;
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query(
            "SELECT * FROM todoapp WHERE list_id = ?",
            [getId], async(er, result, fields)=> {
            if (er) throw er;
            // console.log(result);
            res.render('edit',{result})
        });
    });
    
    
});

//update post
app.put('/edit',async (req,res)=>{
    const {list_id,todo,expire} = req.body;
    pool.getConnection(async function(err, connection) {
        if (err) throw err;
        connection.query(
            "UPDATE todoapp SET todo = ?, expire = ? WHERE list_id = ?", 
            [todo, expire, list_id], async(er, result, fields)=> {
            if (er) throw er;
            // console.log(result);
        });
    });
    res.redirect('/');
});

//delete post
app.delete('/delete',(req,res)=>{
    const getId = req.body.list_id;
    pool.getConnection(async function(err, connection) {
        if (err) throw err;
        connection.query(
            "DELETE FROM todoapp WHERE list_id = ?", 
            [getId], async(er, result, fields)=> {
            if (er) throw er;
            // console.log(result);
        });
    });
    res.redirect('/');
})

app.listen(3003,()=>{
    console.log('serving on 3003')
});
