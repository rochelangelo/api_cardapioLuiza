import express from "express";
import { promises as fs } from "fs";

const { readFile, writeFile } = fs;

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile("./dados/vendas.json"));
    delete data.nextId;
    res.send(data);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    let venda = req.body;
    const data = JSON.parse(await readFile("./dados/vendas.json"));

    const { itens, valorTotal, desconto, dataCompra } = venda;

    venda = {
      id = data.nextId++,
      itens = itens,
      valorTotal = valorTotal,
      desconto = desconto,
      data = dataCompra
    }

    res.send(venda);
  } catch (err) {
    next(err);
  }
});



export default router;