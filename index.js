const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const { getAuth } = require('firebase-admin/auth');


const app = express();
app.use(bodyParser.json());

// Inicializa o Firebase
const serviceAccount = require('./chave.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: ""
});

const auth2 = getAuth();

//Criar um novo usuario
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

//Login de um novo usuario 
// app.post('/login', (req, res) => {
//   const email = req.body.email;
//   const password = req.body.password;

//   // Autentica o usuário com email e senha usando o SDK do Firebase para clientes
//   admin.auth().getUserByEmail(email)
//     .then(user => {
//       return admin.auth().createCustomToken(user.uid);
//     })
//     .then(customToken => {
//       // Retorna o token personalizado para o front-end
//       res.json({ token: customToken });
//     })
//     .catch(err => {
//       console.log('Erro ao autenticar usuário:', err);
//       res.status(401).send('Credenciais inválidas');
//     });
// });

app.post("/forgot-password", (req, res) => {
  const email = req.body.email;
  auth2.generatePasswordResetLink(email)
    .then((link) => {
      res.send(link)
    })
    .catch((error) => {
      // trate o erro aqui
    });
})

// //Reset 
// app.post('/forgot-password', (req, res) => {
//   const email = req.body.email;

//   admin.auth().sendPasswordResetEmail(email)
//     .then(() => {
//       res.send('Email de recuperação de senha enviado com sucesso!');
//     })
//     .catch((error) => {
//       console.error(error);
//       res.status(500).send('Erro ao enviar email de recuperação de senha');
//     });
// });

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
