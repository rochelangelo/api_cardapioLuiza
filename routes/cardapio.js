import express from 'express';
import { promises as fs } from 'fs';

const { readFile, writeFile } = fs;

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    let produto = req.body;
    const data = JSON.parse(await readFile('./dados/cardapio.json'));
    if (
      produto.nome != '' &&
      produto.valor > 0 &&
      produto.descricao != '' &&
      produto.opcionais != '' &&
      produto.categoria != ''
    ) {
      if (produto.valorOpcional > 0) {
        produto = { id: data.nextId++, ...produto };
        data.produtos.push(produto);

        await writeFile('./dados/cardapio.json', JSON.stringify(data, null, 2));
        res
          .status(200)
          .redirect('https://apicafeluiza.herokuapp.com/')
          .send({ message: 'O item ' + produto.nome + ' foi cadastrado!' });
      } else if (
        produto.opcionais === 'não tem' &&
        produto.valorOpcional === 0
      ) {
        produto = {
          id: data.nextId++,
          nome: produto.nome,
          valor: produto.valor,
          descricao: produto.descricao,
          opcionais: produto.opcionais,
          valorOpcional: produto.valorOpcional,
          categoria: produto.categoria,
        };
        data.produtos.push(produto);

        await writeFile('./dados/cardapio.json', JSON.stringify(data));

        logger.info(
          `POST /produto - ${JSON.stringify(produto.id)}:${JSON.stringify(
            produto.nome
          )}`
        );
        res
          .status(200)
          .redirect('https://apicafeluiza.herokuapp.com/')
          .send({ message: 'O item ' + produto.nome + ' foi cadastrado!' });
      }
    } else {
      if (produto.nome == '') {
        logger.info(`GET /produto - error: "Nome produto INVALIDO"`);
        res.status(422).send({ error: 'Nome produto INVALIDO' });
      } else if (produto.valor <= 0) {
        logger.info(`GET /produto - error: "Preço do produto INVALIDO"`);
        res.status(422).send({ error: 'Preço do produto INVALIDO' });
      } else if (produto.descricao == '') {
        logger.info(`GET /produto - error: "Descrição do produto INVALIDA"`);
        res.status(422).send({ error: 'Descrição do produto INVALIDA' });
      } else if (produto.opcionais == '') {
        logger.info(`GET /produto - error: "opcionais do produto INVALIDOS"`);
        res.status(422).send({ error: 'opcionais do produto INVALIDOS' });
      } else if (produto.valorOpcional <= 0) {
        logger.info(`GET /produto - error: "Preço dos opcionais INVALIDO"`);
        res.status(422).send({ error: 'Preço dos opcionais INVALIDO' });
      } else if (produto.categoria == '') {
        logger.info(`GET /produto - error: "Categoria do produto INVALIDA"`);
        res.status(422).send({ error: 'Categoria do produto INVALIDA' });
      } else {
        console.log(req.body);
        logger.info(`GET /produto - error: "Não Cadastrado"`);
        res.status(422).send({ error: 'Não Cadastrado' });
      }
    }
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile('./dados/cardapio.json'));
    delete data.nextId;
    res.send(data);
    logger.info('GET /produtos');
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile('./dados/cardapio.json'));
    const produto = data.produtos.find(
      (produto) => produto.id === parseInt(req.params.id)
    );
    if (produto != null) {
      res.send(produto);
      logger.info(
        `GET /produto - ${JSON.stringify(produto.id)}:${JSON.stringify(
          produto.nome
        )}`
      );
    } else {
      logger.info(`GET /produto - error: "Produto não existente"`);
      res.status(404).send({ error: 'Produto não existente' });
    }
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile('./dados/cardapio.json'));
    data.produtos = data.produtos.filter(
      (produto) => produto.id !== parseInt(req.params.id)
    );
    await writeFile('./dados/cardapio.json', JSON.stringify(data));
    logger.info(`DELETE /produto - ${JSON.stringify(req.params.id)}`);
    res
      .status(200)
      .send({ message: 'O item ' + req.params.id + ' foi DELETADO!' });
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    let produto = req.body;
    const data = JSON.parse(await readFile('./dados/cardapio.json'));

    const index = data.produtos.findIndex((p) => p.id === produto.id);

    if (index === -1) {
      res.status(404).send({ error: 'Produto não existente' });
    }

    data.produtos[index] = produto;
    await writeFile('./dados/cardapio.json', JSON.stringify(data, null, 2));
    logger.info(
      `PUT /produto - ${JSON.stringify(produto.id)}:${JSON.stringify(
        produto.nome
      )}`
    );
    res
      .status(200)
      .send({
        message: 'O item ' + produto.id + ':' + produto.nome + ' foi ALTERADO!',
      });
  } catch (err) {
    next(err);
  }
});

router.use((err, res, req, next) => {
  logger.error(` ${req.method} ${req.baseUrl} - ${err.message}`);
  res.status(400).send({ error: err.message });
});

export default router;
