const express = require('express');

//pilote mysql pour une application nodejs.
const mysql =  require('mysql');

//middleware tierce pour etablir la connection entre la bd et l'application.
const myConnection = require('express-myconnection');
const connection = require('express-myconnection');

//configuration pour la connection a al base de donnees.
const optionBd ={
    host:'localhost',
    user:'is2ac',
    password:'',
    port:3306,
    database:'crudNodeJs'
};


app =  express();

//definition du moteur d'affichage ou generateur de templates -- ejs
app.set('view engine', 'ejs');
app.set('views')


//recuperer les donnees du formulaire
app.use(express.urlencoded({extended : false}));


//connexion avec la base de donnees
app.use(myConnection(mysql,optionBd, 'pool'));


/*
Fonction d'evaluation de test sur les credentials,
pour savoir si l'utilisateur est le sysadmin ou pas ?
*/

function test_sysadmin(email, password){
    if(email === "sysadmin" && password === "root"){
        return true
    }else{
        return false
    }
};


//end-point home
app.get('/', (req,res) =>{
    res.render('home')
});

//end-point apropos
app.get('/apropos', (req,res) =>{
    res.render('apropos')
});


//end-point allUsers de la base de donnees
app.post('/allUsers', (req,res) =>{
    //recuperation par methode post
    var email = req.body.email;
    var pwd = req.body.pwd;

    if(test_sysadmin(email,pwd)){
        req.getConnection((erreur, connection) =>{
            if(erreur){
                console.log('erreur 1');
            }else{
                connection.query('SELECT * FROM crudNodeJs.userApp AS c;', [], (err,resultat) =>{
                    if(err){
                        console.log('erreur 2')
                    }else{
                        //le test d'authentification doit etre realiser avant de donner l'acces au endpoint /postform.
                        res.render('postform', {resultat})
                    }
                })
            }
        });
    }else{
        res.redirect('/');
    }
});



//inscription et insertion
app.get('/signup', (req,res) =>{
    res.render('signup')
});


app.post('/postsignup', (req,res) =>{
    //recuperation des elements du formulaire
    let id =  req.body.id
    let email =  req.body.email
    let pwd = req.body.pwd
    let nom = req.body.nom
    let prenom =  req.body.prenom

    //
    req.getConnection((erreur, connection) =>{
        if(erreur){
            console.log('erreur 1');
        }else{
            connection.query('INSERT INTO crudNodeJs.userApp(userID, userEmail, userPwd, nom, prenom ) VALUE(?,?,?,?,?)', 
            [id, email, pwd, nom, prenom], (err) =>{
                if(err){
                    console.log('erreur 2')
                }else{
                    console.log('insertion reussie !')
                    res.redirect('/')
                }
            })
        }
    })
})


//routes pour realiser le update dans la base de donnees 
app.post('/update',(req,res) =>{
    const id =  req.body.userid;
    const email =  req.body.useremail;
    const pwd = req.body.userpwd;
    const nom = req.body.usernom;
    const prenom =  req.body.userprenom;

    var sql = `
    UPDATE crudNodeJs.userApp
    SET userEmail = "${email}",
    userPwd = "${pwd}",
    nom = "${nom}",
    prenom = "${prenom}"
    WHERE userID =  "${id}"
    `;


    req.getConnection((erreur, connection) =>{
        if(erreur){
            console.log('erreur 1')
        }else{
            connection.query(sql, (err) =>{
                if(err){
                    console.log("erreur 2")
                }else{
                    console.log("update reussie !")
                    res.redirect('/allUsers')
                }
            })
        }
    })
})



//routes pour realiser delete dans la base de donnees
app.post('/delete', (req, res) =>{
    
    let id_to_delete =  req.body.id;

    req.getConnection((erreur, connection) =>{
        if(erreur){
            console.log('erreur 1')
        }else{
            connection.query('DELETE FROM crudNodeJs.userApp WHERE userID = ?;', [id_to_delete],(err) => {
                if(err){
                    console.log('erreur 2')
                }else{
                    console.log('delete reussie !')
                    res.redirect('/allUsers')
                }
            })
        }
    })
})



//middlewares
app.use((req,res) =>{
    res.render('404')
});


app.listen(3001,()=>{
    console.log("Server on !")
})