const Pool = require('pg').Pool
const pool = new Pool({
  host: 'boca-db',
  port: 5432,
  user: 'postgres',
  password: 'superpass',
  database: 'bocadb',
})

const countContests = async (contestId) => {
    return new Promise((resolve, reject) => {
      pool.query('SELECT COUNT(*) AS "qtd" FROM contesttable WHERE contestnumber = $1', [contestId], (error, results) => {
      if (error) {
        reject(error)
        // throw error
      }
  
      console.log('TERMINOU DE VERIFICAR SE EXISTE CONTEST')
  
      // console.log('results.rows: ' + results.rows)
      resolve(results)
    })})
    
    // console.log('row: ' + rows)
    // return parseInt(rows[0].qtd)
}


const middlewareCheckContest = async (req, res, next) => {
  if (req.params.contestId === undefined) {
    res.status(400).send('Bad Request: O ID da competição ou o JSON fornecido no corpo da requisição é inválido.')
    return
  }
  try
  {
    const contestId = req.params.contestId
    console.log('Verificando contestId: ' + contestId)
    var rows = (await countContests(contestId)).rows
    if(rows[0].qtd === 0) {
      res.status(404).send('Not Found: O ID da competição especificado na requisição não existe.')
      return
    }

    // Checar as tags aqui!!!
    next()
    return;
    // const entityTag = request.body.entityTag
    
    // await dbCreateTags(response, contestId, entityTag).then(() => {
    //   console.log('Success: tag(s) inserida(s).')
    //   res.status(204).send('Success: tag(s) atualizad(s).')
    // })
    // return
  }
  catch (error)
  {
    console.log('erro no check contest')
    console.log(error.message)
    res.status(500).send('Internal Server Error: Não foi possível verificar a existência da competição. Tente novamente.')
    return
  }
}

const checkTags = async (contestId, tagid, tagname, tagvalue) => {
  const result =  await pool.query('SELECT contestnumber, tagid, tagname, tagvalue FROM tag WHERE contestnumber = $1 AND tagid = $2', [contestId, tagid])

  for (row in result.rows){
    // console.log(row)
    if(row.tagname !== tagname || row.tagvalue !== tagvalue)
    {
      return false;
    }
  }
  return true;
}


const middlewareCheckTags = async (req, res, next) => {
  console.log('entrou no MIDLEWARE CHECK TAGS')
  if(req.body === undefined || req.params.contestId === undefined || req.body.entityTag === undefined) {
    console.log('Não passou o body ou o contestId')
    console.log(req.body)
    res.status(400).send('Bad Request: O ID da competição ou o JSON fornecido no corpo da requisição é inválido.')
    return
  }
  var contestId
  try{
    contestId = parseInt(req.params.contestId)
  } catch (error) {
    console.log('Erro ao converter o contestId para inteiro')
    res.status(400).send('Bad Request: O ID da competição ou o JSON fornecido no corpo da requisição é inválido.')
    return
  }

  console.log('req.body')
  console.log(req.body)

  const entityTag = req.body.entityTag

  console.log('EntityTag: ' + entityTag[0].tag[0].id)
  // Verificando erros/inconsistências de preenchimento do JSON
  for (let i = 0; i < entityTag.length; i++)
  {
    const entity = entityTag[i]

    // console.log(entity)
    if(entity.entityType === undefined || entity.entityId === undefined || entity.tag === undefined) {
      console.log('Não passou o entityType, entityId ou tag')
      res.status(400).send('Bad Request: O ID da competição ou o JSON fornecido no corpo da requisição é inválido.')
      return;
    }

    // Verifica se o tipo da entidade é válido
    if(entity.entityType !== 'language' && entity.entityType !== 'problem' && entity.entityType !== 'site' && entity.entityType !== 'site/user') {
      console.log('entityType inválido')
      res.status(400).send('Bad Request: O ID da competição ou o JSON fornecido no corpo da requisição é inválido.')
      return;
    }

    // Verifica o caso especial do site/user se ambos os ids foram passados pelo body
    if(entity.entityType === 'site/user') {
      let split = entity.entityId.split('/')
      if(split.length !== 2) {
        console.log('entityId inválido')
        res.status(400).send('Bad Request: O ID da competição ou o JSON fornecido no corpo da requisição é inválido.')
        return;
      }
    }


    for(let j = 0; j < entityTag[i].tag.length; j++)
    {
      const tag = entityTag[i].tag[j]
      
      if(tag.id === undefined || tag.name === undefined || tag.value === undefined) {
        console.log('Não passou o id, name ou value na tag')
        res.status(400).send('Bad Request: O ID da competição ou o JSON fornecido no corpo da requisição é inválido.')
        return;
      }

      if(typeof tag.id !== 'number' || typeof tag.name !== 'string' || typeof tag.value !== 'string') {
        console.log('id não é um número ou name/value não são strings')
        res.status(400).send('Bad Request: O ID da competição ou o JSON fornecido no corpo da requisição é inválido.')
        return;
      }

      // Verifica se a tag já existe para o contestId dado no banco de dados
      // e se existe verifica se os valores são iguais

      // Esta operação torna a atribuição de tags muito custosa, porém com a utilização de índices hash fica consideravelmente mais barata
      try{
        const result = await checkTags(contestId, tag.id, tag.name, tag.value)

        console.log(result)

        if(result === false) {
          console.log('Tag já existe no banco de dados e não possui os mesmos valores')
          res.status(400).send('Bad Request: O ID da competição ou o JSON fornecido no corpo da requisição é inválido.')
          return;
        }
        else
        {
          console.log('Passou a tag ' + tag.id)
        }
      }
      catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error: Ocorreu um erro ao verificar a existência da tag no banco de dados.')
        return;
      }
    }
  }

  next()
}

const middlewareCheckKeys = async (req, res, next) =>
{
  const contestId = req.params.contestId

  const entityTag = req.body.entityTag

  for (let i = 0; i < entityTag.length; i++)
  {
    const entityType = entityTag[i].entityType
  
    if(entityType === 'problem')
    {
      const entityId = entityTag[i].entityId
  
      const result = await pool.query('SELECT problemnumber FROM problemtable WHERE problemnumber = $1 AND contestnumber = $2', [entityId, contestId])
  
      if(result.rows.length === 0)
      {
        res.status(404).send('Not Found: O ID da entidade especificado na requisição não existe.')
        return
      }
    }
    else if(entityType === 'language')
    {
      const entityId = entityTag[i].entityId
  
      const result = await pool.query('SELECT langnumber FROM langtable WHERE langnumber = $1 AND contestnumber = $2', [entityId, contestId])
  
      if(result.rows.length === 0)
      {
        res.status(404).send('Not Found: O ID da entidade especificado na requisição não existe.')
        return
      }
    }
    else if(entityType === 'site')
    {
      const entityId = entityTag[i].entityId
  
      const result = await pool.query('SELECT sitenumber FROM sitetable WHERE sitenumber = $1 AND contestnumber = $2', [entityId, contestId])
  
      if(result.rows.length === 0)
      {
        res.status(404).send('Not Found: O ID da entidade especificado na requisição não existe.')
        return
      }
    }
    else if(entityType === 'site/user')
    {
      console.log('entrou no user/site pra ver')
      const entityId = entityTag[i].entityId

      const usersitenumber = entityId.split('/')[0]
      const usernumber = entityId.split('/')[1]

      const result = await pool.query('SELECT usernumber FROM usertable WHERE usernumber = $1 AND usersitenumber = $2 AND contestnumber = $3', [usernumber, usersitenumber, contestId])
  
      if(result.rows.length === 0)
      {
        res.status(404).send('Not Found: O ID da entidade especificado na requisição não existe.')
        return
      }
    }
    else
    {
      res.status(400).send('Bad Request: O ID da competição ou o JSON fornecido no corpo da requisição é inválido.')
      return
    }
  }

  next()

}

const middlewareCheckKeysPut = async (req, res, next) => {
  if(req.body === undefined || req.params.contestId === undefined || req.body.entityTag === undefined) {
    console.log('Não passou o body ou o contestId')
    console.log(req.body)
    res.status(400).send('Bad Request: O ID da competição ou o JSON fornecido no corpo da requisição é inválido.')
    return
  }

  const contestId = req.params.contestId
  const entityTag = req.body.entityTag

  for (let i = 0; i < entityTag.length; i++)
  {
    const entityType = entityTag[i].entityType
  
    if(entityType === 'problem')
    {
      const entityId = entityTag[i].entityId
      
      for (let j = 0; j < entityTag[i].tag.length; j++)
      {
        const result = await pool.query('SELECT problemnumber FROM problem_tag NATURAL JOIN tag WHERE problemnumber = $1 AND contestnumber = $2 AND tagid = $3', [entityId, contestId, entityTag[i].tag[j].id])
        
        if(result.rows.length === 0)
        {
          res.status(404).send('Not Found: O ID da tag especificado na requisição não existe.')
          return
        }
      }
    }
    else if(entityType === 'language')
    {
      const entityId = entityTag[i].entityId
  
      for (let j = 0; j < entityTag[i].tag.length; j++)
      {
        const result = await pool.query('SELECT langnumber FROM language_tag NATURAL JOIN tag WHERE langnumber = $1 AND contestnumber = $2 AND tagid = $3', [entityId, contestId, entityTag[i].tag[j].id])
        
        if(result.rows.length === 0)
        {
          res.status(404).send('Not Found: O ID da tag especificado na requisição não existe.')
          return
        }
      }
    }
    else if(entityType === 'site')
    {
      const entityId = entityTag[i].entityId
  
      for (let j = 0; j < entityTag[i].tag.length; j++)
      {
        const result = await pool.query('SELECT sitenumber FROM site_tag NATURAL JOIN tag WHERE sitenumber = $1 AND contestnumber = $2 AND tagid = $3', [entityId, contestId, entityTag[i].tag[j].id])
        
        if(result.rows.length === 0)
        {
          res.status(404).send('Not Found: O ID da tag especificado na requisição não existe.')
          return
        }
      }
    }
    else if(entityType === 'site/user')
    {
      console.log('entrou no user/site pra ver')
      const entityId = entityTag[i].entityId

      const usersitenumber = entityId.split('/')[0]
      const usernumber = entityId.split('/')[1]

      for (let j = 0; j < entityTag[i].tag.length; j++)
      {
        const result = await pool.query('SELECT usernumber FROM user_tag WHERE usernumber = $1 AND usersitenumber = $2 AND contestnumber = $3 AND tagid = $4', [usernumber, usersitenumber, contestId, entityTag[i].tag[j].id])
        
        if(result.rows.length === 0)
        {
          res.status(404).send('Not Found: O ID da tag especificado na requisição não existe.')
          return
        }
      }
    }
    else
    {
      res.status(400).send('Bad Request: O ID da competição ou o JSON fornecido no corpo da requisição é inválido.')
      return
    }
  }

  next()

}

module.exports = {
  middlewareCheckContest,
  middlewareCheckTags,
  middlewareCheckKeys,
  middlewareCheckKeysPut
}