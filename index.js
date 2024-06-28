const inquirer = require("inquirer");
const chalk = require("chalk");
const fs = require("fs");

console.log("Bem vindo ao Accounts");

var nomeDaConta = "";
var globalAccount = null

menu();

function menu() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "Escolha uma opção do menu",
        choices: [
          "Criar conta",
          "Consultar saldo",
          "Depositar",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];
      console.log(chalk.bgRed.white(`O(A) Sr(a) escolheu a opção: ${action}`));

      switch (action) {
        case "Criar conta":
          iniciarCriarConta();
          return;
        case "Consultar saldo":
          mensagemMenu();
          verSaldo();
          return;
        case "Depositar":
          mensagemMenu();
          depositar();
          return;
        case "Sacar":
          mensagemMenu();
          sacar();
          return;
        case "Sair":
          console.log(chalk.bgRed.white(`Tchau, tchau!`));
          process.exit();
      }
    })
    .catch((err) => console.log(err));
    
}

function iniciarCriarConta() {
  console.log(
    chalk.bgGreen.white("-------------------------------------------")
  );
  console.log(
    chalk.bgGreen.white("- Vamos definir as configurações da conta -")
  );
  console.log(
    chalk.bgGreen.white("-------------------------------------------")
  );

  criarConta();
}

function mensagemMenu() {
  if(globalAccount !== null){
    console.log(
      chalk.bgGreen.white("-------------------------------------------")
    );
    console.log(
      chalk.bgGreen.white(`${nomeDaConta}, você já está logado(a)`)
    );
    console.log(
      chalk.bgGreen.white("-------------------------------------------")
    );
  }
  else{
    console.log(
      chalk.bgGreen.white("-------------------------------------------")
    );
    console.log(
      chalk.bgGreen.white("-         Vamos buscar sua conta!         -")
    );
    console.log(
      chalk.bgGreen.white("-------------------------------------------")
    );
  }
}

async function criarConta() {
  let account = await buscaConta()

  if (account !== null) {
    console.error("Essa conta já existe, por favor, escolha outro nome");
    criarConta();
    return;  
  }

  const novaConta = { balance: 0 };
  await manageAccount(novaConta);
  globalAccount = null;

  console.log(
    chalk.green(
      "Parabéns, " + nomeDaConta + "! Sua nova conta foi criada no Accounts!"
    )
  );
  
  menu();
}

async function depositar() {
  let account = null
  globalAccount !== null ? account = globalAccount : account = await buscaConta();

  if (account !== null) {
    globalAccount = account;
    await inquirer
    .prompt([
      {
        name: "valorDeposito",
        message: `\n-------------------------------
Digite o valor para deposito: 
-------------------------------\n`,
      },
    ])
    .then(async (answer) => {
      const valor = answer["valorDeposito"];

      try{
        if(isNaN(valor)){
          throw new Error();
        }
        account.balance += Number(valor);
        await manageAccount(account);
        
        console.log(
          chalk.bgGreen.white("Seu depósito foi efetuado. Seu novo saldo é: "+account.balance+" dinheiros")
        );
      }
      catch(err){
        console.log(chalk.bgRed.white(`Por favor, digite um valor numérico para depositar`));
        return;
      }
      
    })
    .catch((error) => {
      console.error(error);
    })
  }
  else{
    console.error("Conta não encontrada.")
  }
  menu()
}

async function sacar() {
  let account = null
  globalAccount !== null ? account = globalAccount : account = await buscaConta();

  if (account !== null) {
    globalAccount = account;
    await inquirer
    .prompt([
      {
        name: "valorSaque",
        message: `\n-------------------------------
Digite o valor para sacar: 
-------------------------------\n`,
      },
    ])
    .then(async (answer) => {
      const valor = answer["valorSaque"];

      try{
        if(isNaN(valor)){
          throw new Error();
        }
        account.balance -= Number(valor);
        if(account.balance < 0) throw new Error("-");
        await manageAccount(account);
        
        console.log(
          chalk.bgGreen.white("Seu saque foi efetuado. Seu novo saldo é: "+account.balance+" dinheiros")
        );
      }
      catch(err){
        if(err.message === "-"){
          console.log(chalk.bgRed.white(`Você ainda não tem esse saldo. Por favor saque um valor menor que ${valor} dinheiros`));
        }
        else{
          console.log(chalk.bgRed.white(`Por favor, digite um valor numérico para sacar`));
        }
        return;
      }
      
    })
    .catch((error) => {
      console.error(error);
    })
  }
  else{
    console.error("Conta não encontrada.")
  }
  menu()
}

async function verSaldo() {
  let account = null
  globalAccount !== null ? account = globalAccount : account = await buscaConta();

  if (account !== null) {
    globalAccount = account;
    
    console.log(
      chalk.bgGreen.white("Seu saldo é de: "+account.balance+" dinheiros")
    );

  }
  else{
    console.error("Conta não encontrada.")
  }
  menu()
}

async function buscaConta() {
  await inquirer
    .prompt([
      {
        name: "nomeDaConta",
        message: `\n------------------------
Digite o nome da conta: 
------------------------\n`,
      },
    ])
    .then((answer) => {
      nomeDaConta = answer["nomeDaConta"];
    })
    .catch((error) => {
      console.error(error);
  })

  if (nomeDaConta.length < 3) {
      console.error("Insira ao menos 3 caracteres para o nome")
      return buscaConta();
  } 
  else {
    if (fs.existsSync(`accounts/${nomeDaConta}.json`)) {
      const account = await fs.readFileSync(`accounts/${nomeDaConta}.json`, { encoding: "utf-8" } );
      return JSON.parse(account);
    }
  }
  return null;
}

async function manageAccount(account){
  fs.writeFileSync(
    `accounts/${nomeDaConta}.json`,
    JSON.stringify(account),
    function (err) {
      console.error(err);
    }
  );
}