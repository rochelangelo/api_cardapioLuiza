import express from "express";
import winston from "winston";
import cardapioRouter from "./routes/cardapio.js";
import vendaRouter from "./routes/vendas.js"
import { promises as fs } from "fs";
import cors from "cors";

const { readFile, writeFile } = fs;

const { combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`
});
global.logger = winston.createLogger({
  level: "silly",
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: "./dados/logger.log" })
  ],
  format: combine(
    label({ label: "logger" }),
    timestamp(),
    myFormat
  )
});



const TESTE = "TESTE";

const app = express();
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  res.render("index");
});

app.get("/cadastro", async (req, res) => {
  res.render("cardapio", { teste: TESTE });
});

app.get("/venda", async (req, res) => {
  const data = JSON.parse(await readFile("./dados/cardapio.json"));
  const a = data.produtos
  function update() {
    const select = document.getElementById('produto');
    let value = select.options[select.selectedIndex].value;
    console.log(value);
    return value;
  }

  res.render("venda", { data: a, update: update });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use("/api/cardapio", cardapioRouter);
app.use("/api/venda", vendaRouter);
app.listen(3000, async () => {
  try {
    await readFile("./dados/cardapio.json");
    await readFile("./dados/vendas.json");
    logger.info("API STARTED!");
  } catch (err) {
    const initJSONcardapio = {
      nextId: 1,
      produtos: []
    };
    const initJSONvendas = {
      nextId: 1,
      vendas: []
    };
    writeFile("./dados/cardapio.json", JSON.stringify(initJSONcardapio)).then(() => {
      logger.info("API STARTED! and FILE CREATED");
    }).catch(err => {
      logger.info(err);
    });
    writeFile("./dados/vendas.json", JSON.stringify(initJSONvendas)).then(() => {
      logger.info("API STARTED! and FILE CREATED");
    }).catch(err => {
      logger.info(err);
    });
  }
});