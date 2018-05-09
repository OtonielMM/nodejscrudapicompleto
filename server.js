
//importar pacotes 
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Produto = require('./app/models/product');

//PERSISTÊNCIA
mongoose.connect('mongodb://localhost/bdCrud');

//Configurar a app para usar o body-parser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//Definindo a porta onde o servidor vai responder
var port = process.env.port || 8000;

//Definindo as rotas
var router = express.Router();//intercepta todas as rotas

//MIDDLEWARE
router.use(function(req,res,next){
    console.log("Interceptação pelo Middleware OK");
    next();
});

router.get('/', function(req, res){
    res.json({'message':'Ok, rota principal funcionando'});
});


//GetById
router.route('/produtos/:productId')
.get(function(req, res){
    const id = req. params.productId;

    // buscar no banco
    Produto.findById(id, function(err, produto){
        if(err){
                res.status(500).json({
                    message:"Erro ao tentar encontar produto, Id mal formado"
                });
        }
        else if(produto == null){
            res.status(400).json({
                message:"Produto não encotrado"
            });
        }
        else{
            res.status(200).json({
                message:"Produto encotrado",
                produto:produto
            });
        }
    });
})

//update no produto -- atualizar produto - put - ex:localhost:8000/api/produtos/(5aeb9c5200f0c83b3c11e113)productid
.put(function(req, res){
    const id = req.params.productId;
    Produto.findById(id, function(err, produto){
        if(err){
            res.status(500).json({
                message:"Id mal formado, errro ao tentar encontrar produto"
            });
        }
        else if(produto == null){
            res.status(400).json({
                message:"Produto não encotrado"
            });
        }
        else{
            produto.nome = req.body.nome;
            produto.preco = req.body.preco;
            produto.descricao = req.body.descricao;

            produto.save(function(err){
                if(err)
                    res.send("Erro ao tentar atualizar produto"+err);
                
                    res.status(200).json({
                        message :"Produto atualizado com sucesso"
                    });

            });
        }
    });
})


// deletar um produto - localhost:8000/api/produtos/(5aeb9c5200f0c83b3c11e113)productid
.delete(function(req, res){
    // ir ao ODM  no mongoose e buscar um valor para remover
    Produto.findByIdAndRemove(req.params.productId, (err, produto) =>{
        if(err) return res.status(500).send(err);

        const response = {
            message : "Produto removido com sucesso!",
            id: produto.id
        };
        return res.status(200).send(response);
    });
});

router.route('/produtos')
    //POST para produtos (CREATE)
    .post(function(req,res){
        var produto = new Produto();
        produto.nome = req.body.nome;
        produto.preco = req.body.preco;
        produto.descricao = req.body.descricao;

        produto.save(function(error){
            if(error)
                res.send("Erro ao tentar salvar um novo produto"+ error);

            res.status(201).json({message:'produto inserido com sucesso'});    
        });
    })

    .get(function(req, res){
        Produto.find(function(err, prods){
            if(err)
                res.send(err);
            
            res.status(200).json({
                message:"everything is here",
                todosProdutos:prods
            });
        });
    });

//Vinculo da app com o motor de rotas
//Dedfinindo uma rota padrão para as minhas apis
app.use('/api', router);

app.listen(port);
console.log("API up and running! on port " + port);
