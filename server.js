const express = require('express');
const body_parser = require('body-parser');
const mysql = require('mysql');
const url = require('url');
const db = require('./mysql/database');

const app = express();
const router = express.Router();

db.connect((err)=>{//connect database
    if(err) throw err;
    console.log('You are connected to the mysql');
});
app.use(body_parser.json());//configure body-parser to JSON
app.use('/',router);//make express router

router.get('/hospital/list',(req,res)=>{
    let sql = 'SELECT * FROM hospital';
    db.query(sql,(error,result,field)=>{
        if(error) throw error;
        res.send(JSON.stringify(result));
    })
});

router.get('/doctor/list',(req,res)=>{
    let sql ="SELECT doctor.name AS doctor_name,speciality.name AS speciality FROM doctor,speciality"+
     " WHERE doctor.speciality = speciality.id";
    db.query(sql,(error,result,field)=>{
        if(error) throw error;
        res.send(JSON.stringify(result));
    });
});

router.get('/speciality/list',(req,res)=>{
    let query = "SELECT * FROM speciality";
    db.query(query,(error,result,field)=>{
        if(error) throw error;
        res.send(JSON.stringify(result));
    });
});

router.get('/doctor/session/list', function(req,res){
    //let data = req.params.name;
    let uri = url.parse(req.url,true);
    let query = uri.query;//select paremeters that sent by the url
    let track = uri.search.search("%27");//tracking the ' notation to avoid from sql injection
    let where = "";
    
    if(track<0){
        if(query.hid)
            where += "AND doctor_session.hospital = '" + query.hid + "'";
        if(query.did)
            where += "AND doctor_session.doctor = '" + query.did + "'";
        if(query.sid)
            where += "AND doctor.speciality = '" + query.sid+"'"; 
        
        let sql = "SELECT doctor_session.*,doctor.name AS doctor_name,hospital.name AS hospital_name,speciality.name AS speciality ,hospital.place AS place"+
        " FROM doctor_session,doctor,hospital,speciality WHERE doctor_session.doctor = doctor.id AND doctor_session.hospital = hospital.id AND "+
        "doctor.speciality = speciality.id "+where;
        
        db.query(sql,(error,result,field)=>{
            if(error) throw error;
            res.send(JSON.stringify(result));
        });
    
    }else{
        res.status(400).send({error:true,massage:"incorrect request"});
    } 
});

router.post('/book/add',function(req,res){
    let req_body = req.body;
    //let query = "INSERT INTO appointment(doctor_session,name,phone,email) VALUES ('"+req_body.session_id+"','"+req_body.name+"','"+req_body.phone+"','"+req_body.email+"')";
    let query = "INSERT INTO appointment(doctor_session,name,phone,email) VALUES (?,?,?,?)"
    db.query(query,[req_body.session_id,req_body.name,req_body.phone,req_body.email],(error,result,field)=>{
        if(error) throw error;
        res.send(result);
    });
})

router.post('/',function(req,res){
    res.send("this is post api request");
});


app.listen(8080,(err)=>{
    if(err) throw err;
    console.log("you are listening to PORT :8080");
});

