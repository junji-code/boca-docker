'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const queries = require('./queries.js');
const middlewares = require('./middlewares.js');



// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)


app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/api/contest/:contestId/tags', middlewares.middlewareCheckContest, middlewares.middlewareCheckKeys, middlewares.middlewareCheckTags, queries.createTag);

app.get('/api/contest/:contestId/tags/:entityType/:entityId', queries.getSemUser);

app.get('/api/contest/:contestId/tags/site/user/:siteId/:userId', queries.getUserSite);

app.put('/api/contest/:contestId/tags', middlewares.middlewareCheckContest, middlewares.middlewareCheckKeys, middlewares.middlewareCheckKeysPut, queries.updateTags);

app.delete('/api/contest/:contestId/tags', middlewares.middlewareCheckContest, middlewares.middlewareCheckKeys, queries.deleteTags);

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});
