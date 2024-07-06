const express = require('express'); //'express' import. express: create&manage routes, middleware for web server.
const userDBC = require('./userDBC');
const router = express.Router();

router.get('/getUsers', async (req, res)=>{
    let res_get_users = {
        status_code : 500,
        serverConnectionTest : [] 
    };    
    
    try{
        const rows = await userDBC.getUsers();
        res_get_users.status_code = 200;
        if(rows.length > 0){
            rows.forEach((serverConnectionTest)=>{
                res_get_users.serverConnectionTest.push({
                    id : serverConnectionTest.id,
                    name : serverConnectionTest.name,
                    age : serverConnectionTest.age,
                });
            });
        }
        else{
            console.log('사용자 없음');
        }
    }
        catch(error){
            console.log(error.message);
        }
        finally{
            //응답 
            //res.json(res_get_users);
            var result = '';
    
            for(var i=0; i < res_get_users.serverConnectionTest.length; i++){
                result += res_get_users.serverConnectionTest[i].id;
                result += res_get_users.serverConnectionTest[i].name;
                result += res_get_users.serverConnectionTest[i].age;
                
                result += "<br>";
            }
    
            res.send(result);
        }
});

module.exports = router;