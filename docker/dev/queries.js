const Pool = require('pg').Pool
const pool = new Pool({
  host: 'boca-db',
  port: 5432,
  user: 'postgres',
  password: 'superpass',
  database: 'bocadb',
})

const createTag = async (request, response) => {
  const contestId = parseInt(request.params.contestId)

  const entityTag = request.body.entityTag

  await entityTag.forEach(async (entity) => {
    await entity.tag.forEach(async (tag) => {

      console.log('CADASTRANDO TAG: ' + 'tagid: ' + tag.id + ' tagname: ' + tag.name + ' tagvalue: ' + tag.value + ' contestnumber: ' + contestId)
      try{
        const result = await pool.query('INSERT INTO tag (tagid, tagname, tagvalue, contestnumber) VALUES ($1, $2, $3, $4)', [tag.id, tag.name, tag.value, contestId])
      }
      catch(error)
      {
        console.log('tagid: ' + tag.id + ' tagname: ' + tag.name + ' tagvalue: ' + tag.value + ' contestnumber: ' + contestId)
        console.log(error.message)
        response.status(500).send('Internal Server Error: Ocorreu um erro ao inserir a tag ' + tag.name + ' no banco de dados.')
        return
      }

      if(entity.entityType === 'language') {
        try{
          const result = await pool.query('INSERT INTO language_tag (langnumber, contestnumber, tagid) VALUES ($1, $2, $3)', [entity.entityId, contestId, tag.id])
        }
        catch(error)
        {
          console.log('tagid: ' + tag.id + ' tagname: ' + tag.name + ' tagvalue: ' + tag.value + ' contestnumber: ' + contestId)
          response.status(500).send('Internal Server Error: Ocorreu um erro ao inserir a tag ' + tag.name + ' no banco de dados.')
          return
        }
      }
      else if(entity.entityType === 'problem') {
        try{
          const result = await pool.query('INSERT INTO problem_tag (problemnumber, contestnumber, tagid) VALUES ($1, $2, $3)', [entity.entityId, contestId, tag.id])

        }
        catch(error)
        {
          console.log('tagid: ' + tag.id + ' tagname: ' + tag.name + ' tagvalue: ' + tag.value + ' contestnumber: ' + contestId)
          response.status(500).send('Internal Server Error: Ocorreu um erro ao inserir a tag ' + tag.name + ' no banco de dados.')
          return
        }
      }
      else if(entity.entityType === 'site') {
        try{
          const result = await pool.query('INSERT INTO site_tag (sitenumber, contestnumber, tagid) VALUES ($1, $2, $3)', [entity.entityId, contestId, tag.id])
        }
        catch(error)
        {
          console.log('tagid: ' + tag.id + ' tagname: ' + tag.name + ' tagvalue: ' + tag.value + ' contestnumber: ' + contestId)
          response.status(500).send('Internal Server Error: Ocorreu um erro ao inserir a tag ' + tag.name + ' no banco de dados.')
          return
        }
      }
      else if(entity.entityType === 'site/user') {
        let split = entity.entityId.split('/')
        try{
          const result = await pool.query('INSERT INTO user_tag (usernumber, usersitenumber, contestnumber, tagid) VALUES ($1, $2, $3, $4)', [split[1], split[0], contestId, tag.id])
        }
        catch(error)
        {
          console.log('tagid: ' + tag.id + ' tagname: ' + tag.name + ' tagvalue: ' + tag.value + ' contestnumber: ' + contestId)
          response.status(500).send('Internal Server Error: Ocorreu um erro ao inserir a tag ' + tag.name + ' no banco de dados.')
        }
      }
    })
  })

  response.status(204).send('Sucess: tag(s) atualizad(s).')
  return
}

const getSemUser = async (req, res) => {
  try{
    // Path parameters
    const contestId = req.params.contestId
    const entityType = req.params.entityType
    const entityId = req.params.entityId

    if(contestId === undefined || entityType === undefined || entityId === undefined)
    {
      res.status(400).send('Bad Request: Pelo menos um dos parâmetros fornecidos na requisição é inválido.')
      return
    }

    // Query parameters
    const tagid = req.query.tagId
    const tagname = req.query.tagName
    const tagvalue = req.query.tagValue

    let result = undefined

    if(entityType === 'problem')
    {
      if(tagid === undefined && tagname === undefined && tagvalue === undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM problem_tag NATURAL JOIN tag WHERE contestnumber = $1 AND problemnumber = $2', [contestId, entityId])
      }
      else if(tagid !== undefined && tagname === undefined && tagvalue === undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM problem_tag NATURAL JOIN tag WHERE contestnumber = $1 AND problemnumber = $2 AND tagid = $3', [contestId, entityId, tagid])
      }
      else if(tagid === undefined && tagname !== undefined && tagvalue === undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM problem_tag NATURAL JOIN tag WHERE contestnumber = $1 AND problemnumber = $2 AND tagname = $3', [contestId, entityId, tagname])
      }
      else if(tagid === undefined && tagname === undefined && tagvalue !== undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM problem_tag NATURAL JOIN tag WHERE contestnumber = $1 AND problemnumber = $2 AND tagvalue = $3', [contestId, entityId, tagvalue])
      }
      else if(tagid !== undefined && tagname !== undefined && tagvalue === undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM problem_tag NATURAL JOIN tag WHERE contestnumber = $1 AND problemnumber = $2 AND tagid = $3 AND tagname = $4', [contestId, entityId, tagid, tagname])
      }
      else if(tagid !== undefined && tagname === undefined && tagvalue !== undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM problem_tag NATURAL JOIN tag WHERE contestnumber = $1 AND problemnumber = $2 AND tagid = $3 AND tagvalue = $4', [contestId, entityId, tagid, tagvalue])
      }
      else if(tagid === undefined && tagname !== undefined && tagvalue !== undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM problem_tag NATURAL JOIN tag WHERE contestnumber = $1 AND problemnumber = $2 AND tagname = $3 AND tagvalue = $4', [contestId, entityId, tagname, tagvalue])
      }
      else if(tagid !== undefined && tagname !== undefined && tagvalue !== undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM problem_tag NATURAL JOIN tag WHERE contestnumber = $1 AND problemnumber = $2 AND tagid = $3 AND tagname = $4 AND tagvalue = $5', [contestId, entityId, tagid, tagname, tagvalue])
      }
    }
    else if(entityType === 'language')
    {
      if(tagid === undefined && tagname === undefined && tagvalue === undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM language_tag NATURAL JOIN tag WHERE contestnumber = $1 AND langnumber = $2', [contestId, entityId])
      }
      else if(tagid !== undefined && tagname === undefined && tagvalue === undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM language_tag NATURAL JOIN tag WHERE contestnumber = $1 AND langnumber = $2 AND tagid = $3', [contestId, entityId, tagid])
      }
      else if(tagid === undefined && tagname !== undefined && tagvalue === undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM language_tag NATURAL JOIN tag WHERE contestnumber = $1 AND langnumber = $2 AND tagname = $3', [contestId, entityId, tagname])
      }
      else if(tagid === undefined && tagname === undefined && tagvalue !== undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM language_tag NATURAL JOIN tag WHERE contestnumber = $1 AND langnumber = $2 AND tagvalue = $3', [contestId, entityId, tagvalue])
      }
      else if(tagid !== undefined && tagname !== undefined && tagvalue === undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM language_tag NATURAL JOIN tag WHERE contestnumber = $1 AND langnumber = $2 AND tagid = $3 AND tagname = $4', [contestId, entityId, tagid, tagname])
      }
      else if(tagid !== undefined && tagname === undefined && tagvalue !== undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM language_tag NATURAL JOIN tag WHERE contestnumber = $1 AND langnumber = $2 AND tagid = $3 AND tagvalue = $4', [contestId, entityId, tagid, tagvalue])
      }
      else if(tagid === undefined && tagname !== undefined && tagvalue !== undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM language_tag NATURAL JOIN tag WHERE contestnumber = $1 AND langnumber = $2 AND tagname = $3 AND tagvalue = $4', [contestId, entityId, tagname, tagvalue])
      }
      else if(tagid !== undefined && tagname !== undefined && tagvalue !== undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM language_tag NATURAL JOIN tag WHERE contestnumber = $1 AND langnumber = $2 AND tagid = $3 AND tagname = $4 AND tagvalue = $5', [contestId, entityId, tagid, tagname, tagvalue])
      }
    }
    else if(entityType === 'site')
    {
      if(tagid === undefined && tagname === undefined && tagvalue === undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM site_tag NATURAL JOIN tag WHERE contestnumber = $1 AND sitenumber = $2', [contestId, entityId])
      }
      else if(tagid !== undefined && tagname === undefined && tagvalue === undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM site_tag NATURAL JOIN tag WHERE contestnumber = $1 AND sitenumber = $2 AND tagid = $3', [contestId, entityId, tagid])
      }
      else if(tagid === undefined && tagname !== undefined && tagvalue === undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM site_tag NATURAL JOIN tag WHERE contestnumber = $1 AND sitenumber = $2 AND tagname = $3', [contestId, entityId, tagname])
      }
      else if(tagid === undefined && tagname === undefined && tagvalue !== undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM site_tag NATURAL JOIN tag WHERE contestnumber = $1 AND sitenumber = $2 AND tagvalue = $3', [contestId, entityId, tagvalue])
      }
      else if(tagid !== undefined && tagname !== undefined && tagvalue === undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM site_tag NATURAL JOIN tag WHERE contestnumber = $1 AND sitenumber = $2 AND tagid = $3 AND tagname = $4', [contestId, entityId, tagid, tagname])
      }
      else if(tagid !== undefined && tagname === undefined && tagvalue !== undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM site_tag NATURAL JOIN tag WHERE contestnumber = $1 AND sitenumber = $2 AND tagid = $3 AND tagvalue = $4', [contestId, entityId, tagid, tagvalue])
      }
      else if(tagid === undefined && tagname !== undefined && tagvalue !== undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM site_tag NATURAL JOIN tag WHERE contestnumber = $1 AND sitenumber = $2 AND tagname = $3 AND tagvalue = $4', [contestId, entityId, tagname, tagvalue])
      }
      else if(tagid !== undefined && tagname !== undefined && tagvalue !== undefined)
      {
        result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM site_tag NATURAL JOIN tag WHERE contestnumber = $1 AND sitenumber = $2 AND tagid = $3 AND tagname = $4 AND tagvalue = $5', [contestId, entityId, tagid, tagname, tagvalue])
      }
    }

    if(result.rowCount === 0)
    {
      res.status(404).send('Not Found: O ID da competição ou da entidade especificado na requisição não existe.')
      return
    }
    
    const tags = result.rows
    const resposta = {
      "entityTag": [
        {
          "entityType": entityType,
          "entityId": entityId,
          "tag": tags
        }
      ]
    }
    res.status(200).json(resposta)
    return

  }
  catch(error)
  {
    res.status(404).send('Not Found: O ID da competição ou da entidade especificado na requisição não existe.')
    return
  }
}

const getUserSite = async (req, res) => {
  try{

    // Path parameters
    const contestId = req.params.contestId
    const entityType = 'site/user'
    const siteId = req.params.siteId
    const userId = req.params.userId
  
    if(contestId === undefined || entityType === undefined || siteId === undefined || userId === undefined)
    {
      res.status(400).send('Bad Request: Pelo menos um dos parâmetros fornecidos na requisição é inválido.')
      return
    }
  
    // Query parameters
    const tagid = req.query.tagId
    const tagname = req.query.tagName
    const tagvalue = req.query.tagValue
  
    let result = undefined
  
    if(tagid === undefined && tagname === undefined && tagvalue === undefined)
    {
      result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM user_tag NATURAL JOIN tag WHERE contestnumber = $1 AND usernumber = $2 AND usersitenumber = $3', [contestId, userId, siteId])
    }
    else if(tagid !== undefined && tagname === undefined && tagvalue === undefined)
    {
      result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM user_tag NATURAL JOIN tag WHERE contestnumber = $1 AND usernumber = $2 AND tagid = $3 AND usersitenumber = $4', [contestId, userId, tagid, siteId])
    }
    else if(tagid === undefined && tagname !== undefined && tagvalue === undefined)
    {
      result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM user_tag NATURAL JOIN tag WHERE contestnumber = $1 AND usernumber = $2 AND tagname = $3 AND usersitenumber = $4', [contestId, userId, tagname, siteId])
    }
    else if(tagid === undefined && tagname === undefined && tagvalue !== undefined)
    {
      result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM user_tag NATURAL JOIN tag WHERE contestnumber = $1 AND usernumber = $2 AND tagvalue = $3 AND usersitenumber = $4', [contestId, userId, tagvalue, siteId])
    }
    else if(tagid !== undefined && tagname !== undefined && tagvalue === undefined)
    {
      result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM user_tag NATURAL JOIN tag WHERE contestnumber = $1 AND usernumber = $2 AND tagid = $3 AND tagname = $4 AND usersitenumber = $5', [contestId, userId, tagid, tagname, siteId])
    }
    else if(tagid !== undefined && tagname === undefined && tagvalue !== undefined)
    {
      result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM user_tag NATURAL JOIN tag WHERE contestnumber = $1 AND usernumber = $2 AND tagid = $3 AND tagvalue = $4 AND usersitenumber = $5', [contestId, userId, tagid, tagvalue, siteId])
    }
    else if(tagid === undefined && tagname !== undefined && tagvalue !== undefined)
    {
      result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM user_tag NATURAL JOIN tag WHERE contestnumber = $1 AND usernumber = $2 AND tagname = $3 AND tagvalue = $4 AND usersitenumber = $5', [contestId, userId, tagname, tagvalue, siteId])
    }
    else if(tagid !== undefined && tagname !== undefined && tagvalue !== undefined)
    {
      result = await pool.query('SELECT tag.tagid, tag.tagname, tag.tagvalue FROM user_tag NATURAL JOIN tag WHERE contestnumber = $1 AND usernumber = $2 AND tagid = $3 AND tagname = $4 AND tagvalue = $5 AND usersitenumber = $6', [contestId, userId, tagid, tagname, tagvalue, siteId])
    }


    if(result.rowCount === 0)
    {
      res.status(404).send('Not Found: O ID da competição ou da entidade especificado na requisição não existe.')
      return
    }
    
    const tags = result.rows
    const resposta = {
      "entityTag": [
        {
          "entityType": entityType,
          "entityId": `${siteId}/${userId}`,
          "tag": tags
        }
      ]
    }
    res.status(200).json(resposta)
    return
  }
  catch(error)
  {
    console.log(error.message)
    res.status(404).send('Not Found: O ID da competição ou da entidade especificado na requisição não existe.')
    return
  }
}

const updateTags = async (req, res) => {
  const contestId = parseInt(req.params.contestId)

  const entityTag = req.body.entityTag

  try{
    for (let i = 0; i < entityTag.length; i++) {
      for (let j = 0; j < entityTag[i].tag.length; j++) {
        const tag = entityTag[i].tag[j]
        const result = await pool.query('UPDATE tag SET tagname = $1, tagvalue = $2 WHERE tagid = $3 AND contestnumber = $4', [tag.name, tag.value, tag.id, contestId])
      }
    }
    res.status(204).send('Sucess: tag(s) atualizad(s).')
    return
  }
  catch(error)
  {
    res.status(500).send('Internal Server Error: Ocorreu um erro ao atualizar as tags no banco de dados.')
    return
  }

}

const deleteTags = async (req, res) => {
  const contestId = parseInt(req.params.contestId)

  const entityTag = req.body.entityTag

  try{
    for (let i = 0; i < entityTag.length; i++) {
      for (let j = 0; j < entityTag[i].tag.length; j++) {
        const tag = entityTag[i].tag[j]

        if(entityTag[i].entityType === 'language')
        {
          const result = await pool.query('DELETE FROM language_tag WHERE tagid = $1 AND contestnumber = $2 AND langnumber = $3', [tag.id, contestId, entityTag[i].entityId])

        }
        else if(entityTag[i].entityType === 'problem')
        {
          const result = await pool.query('DELETE FROM problem_tag WHERE tagid = $1 AND contestnumber = $2 AND problemnumber = $3', [tag.id, contestId, entityTag[i].entityId])
        }
        else if(entityTag[i].entityType === 'site')
        {
          const result = await pool.query('DELETE FROM site_tag WHERE tagid = $1 AND contestnumber = $2 AND sitenumber = $3', [tag.id, contestId, entityTag[i].entityId])
        }
        else if(entityTag[i].entityType === 'site/user')
        {
          let split = entityTag[i].entityId.split('/')
          const result = await pool.query('DELETE FROM user_tag WHERE tagid = $1 AND contestnumber = $2 AND usernumber = $3 AND usersitenumber = $4', [tag.id, contestId, split[1], split[0]])
        }

        // Verifica se a tag está sendo usada por outra entidade e se não estiver, a exclui da tabela tag
        const resultproblem = await pool.query('SELECT * FROM problem_tag WHERE tagid = $1 AND contestnumber = $2', [tag.id, contestId])
        const resultlanguage = await pool.query('SELECT * FROM language_tag WHERE tagid = $1 AND contestnumber = $2', [tag.id, contestId])
        const resultsite = await pool.query('SELECT * FROM site_tag WHERE tagid = $1 AND contestnumber = $2', [tag.id, contestId])
        const resultuser = await pool.query('SELECT * FROM user_tag WHERE tagid = $1 AND contestnumber = $2', [tag.id, contestId])

        if(resultproblem.rowCount === 0 && resultlanguage.rowCount === 0 && resultsite.rowCount === 0 && resultuser.rowCount === 0)
        {
          const result = await pool.query('DELETE FROM tag WHERE tagid = $1 AND contestnumber = $2', [tag.id, contestId])
        }
      }
    }
    res.status(204).send('Sucess: tag(s) excluída(s).')
    return
  }
  catch(error)
  {
    console.log(error.message)
    res.status(500).send('Internal Server Error: Ocorreu um erro ao deletar as tags no banco de dados.')
    return
  }
}



module.exports = {
  createTag,
  getSemUser,
  getUserSite,
  updateTags,
  deleteTags
}