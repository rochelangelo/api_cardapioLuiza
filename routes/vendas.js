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

    const { itens, opcionais, valorOpcional, desconto, dataCompra } = venda;

    if (venda.itens.length > 0) {
      let valorItens = 0;
      let valorCompra = 0;
      let qtdItens = 0;
      venda.itens.forEach(item => {
        valorItens = item.valor * item.quantidade;
        valorCompra += valorItens;
        qtdItens++;
      });



      const time = Date.now();
      const hoje = new Date(time);

      venda = {
        id: data.nextId++,
        itens: itens,
        opcionais: opcionais,
        valorOpcional: valorOpcional,
        valorTotal: (valorCompra + valorOpcional) - desconto,
        desconto: desconto,
        quantidadeItens: qtdItens,
        data: hoje.toLocaleDateString()
      };

      data.vendas.push(venda);

      await writeFile("./dados/vendas.json", JSON.stringify(data, null, 2));
    }






    res.send(venda);
  } catch (err) {
    next(err);
  }
});



export default router;