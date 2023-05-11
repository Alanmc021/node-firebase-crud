const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Inicializa o Firebase
const serviceAccount = require('./chave.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://teste-node-senai-default-rtdb.firebaseio.com"
});

// Registra um novo usuário
app.post('/signup', (req, res) => {
    const { email, password } = req.body;
    admin.auth().createUser({
        email: email,
        password: password
    })
        .then(() => {
            res.status(201).send('Usuário registrado com sucesso');
        })
        .catch(error => {
            res.status(500).send(error);
        });
});

// Faz login com um usuário existente
app.post('/login',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  validateRequest,
  (req, res) => {
    const { email, password } = req.body;
    admin.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        res.send('Login bem-sucedido');
      })
      .catch(error => {
        res.status(500).send(error);
      });
  });

// Cria uma nova pessoa
app.post('/pessoas', (req, res) => {
  const pessoa = req.body;
  admin.database().ref('pessoas').push(pessoa)
    .then(() => {
      res.status(201).send('Pessoa criada com sucesso');
    })
    .catch(error => {
      res.status(500).send(error);
    });
});

// Retorna todas as pessoas
app.get('/pessoas', (req, res) => {
  admin.database().ref('pessoas').once('value')
    .then(snapshot => {
      const pessoas = [];
      snapshot.forEach(childSnapshot => {
        const pessoa = childSnapshot.val();
        pessoa.id = childSnapshot.key;
        pessoas.push(pessoa);
      });
      res.send(pessoas);
    })
    .catch(error => {
      res.status(500).send(error);
    });
});

// Retorna uma pessoa por ID
app.get('/pessoas/:id', (req, res) => {
  const id = req.params.id;
  admin.database().ref(`pessoas/${id}`).once('value')
    .then(snapshot => {
      const pessoa = snapshot.val();
      pessoa.id = snapshot.key;
      res.send(pessoa);
    })
    .catch(error => {
      res.status(500).send(error);
    });
});

// Atualiza uma pessoa por ID
app.put('/pessoas/:id', (req, res) => {
  const id = req.params.id;
  const pessoa = req.body;
  admin.database().ref(`pessoas/${id}`).update(pessoa)
    .then(() => {
      res.send('Pessoa atualizada com sucesso');
    })
    .catch(error => {
      res.status(500).send(error);
    });
});

// Remove uma pessoa por ID
app.delete('/pessoas/:id', (req, res) => {
  const id = req.params.id;
  admin.database().ref(`pessoas/${id}`).remove()
    .then(() => {
      res.send('Pessoa removida com sucesso');
    })
    .catch(error => {
      res.status(500).send(error);
    });
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
