Entidades diferentes podem ter o mesmo ID por conta do banco ter sido modelado de forma que as entidades fossem separadas em tabelas diferentes. => Devemos criar tabelas de tags diferentes para cada um tipo de entidade.

Considerando as tags como independentes, isto é, se tivermos várias entidades com uma mesma tag (mesmo id), ao alterar ou excluir a tag, o efeito surtirá apenas na tag da entidade que foi alterada, implicaria que na tabela de tags, a chave primária da entidade seria uma chave estrangeira e chave primária na tabela de tags

Isso acarreta na possibilidade de termos registros nas tabelas de tags onde as tags são idênticas (id, nome e valor iguais) apenas alterando o id da entidade. O que seria muito ruim em termos de uso de memória para o caso em que seja atribuído a mesma tag para várias entidades do mesmo tipo, considerando esse fato como recorrente, é mais interessante criarmos uma tabela associativa com as chaves primárias da entidade e da tag daquele tipo de entidade.

Dessa maneira, as tags serão independentes quanto ao tipo de entidade e dependentes dentro do mesmo tipo. Por exemplo: Se há uma tag com {id: 1, nome: 'grupo', value: 'valor'} atribuída a uma entidade do tipo 'problem', podemos ainda ter outra tag com {id: 1, nome: 'grupo', value: 'valor'} para uma entidade do tipo 'site', sendo que alterar a tag do tipo 'problem' não altera a tag do tipo 'site'. Entretanto, se houver outra entidade do tipo 'site' atribuída à mesma tag, ao alterar esta tag, a tag da outra entidade 'site' também será afetada.

Ao tentar atribuir uma tag a uma entidade, seria necessário verificar se já existe uma tag com aquele id e se existir, teria que verificar se seus atributos são iguais, o que gera um overhead de processamento muito grande na atribuição de tags. Porém esta dificuldade pode ser significativamente minimizada criando índices hash para as tags em cima dos ids.

Considerando todos esses fatores, decidiu-se por adotar a segunda abordagem: Criar tabelas diferentes para as tags de cada um dos tipos de entidade, conectando as tags e as entidades por meio de tabelas associativas.

Por conta do quesito usabilidade, pensando no encapsulamento de cada contest de forma a um contest não interferir na criação de tags de outro contest, a tabela de tags terá 'contestnumber' também como chave primária.