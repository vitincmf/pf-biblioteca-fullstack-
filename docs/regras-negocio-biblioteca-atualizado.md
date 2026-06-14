# Regras de Negócio — Sistema de Biblioteca

## 1. Objetivo do sistema

O sistema de biblioteca tem como objetivo controlar usuários, alunos, funcionários, unidades, categorias, livros e empréstimos. As regras de negócio devem garantir que apenas operações válidas sejam realizadas, respeitando o modelo lógico relacional do banco de dados.

O foco principal do backend é permitir que funcionários autenticados registrem livros, pesquisem livros, escolham livros disponíveis e criem empréstimos vinculados a alunos existentes. O banco de dados e o backend devem validar as informações informadas no processo, evitando inconsistências como usuário inexistente, aluno inativo, livro inexistente, livro duplicado no mesmo empréstimo, data de devolução inválida ou multa negativa.

---

## 2. Observações sobre o modelo lógico

O modelo lógico possui as seguintes entidades principais:

- `USUARIO`
- `ALUNO`
- `FUNCIONARIO`
- `UNIDADE`
- `TELEFONE_USUARIO`
- `TELEFONE_UNIDADE`
- `EMAIL_UNIDADE`
- `CATEGORIA`
- `LIVRO`
- `EMPRESTIMO`
- `REALIZA_EMPRESTIMO`
- `REGISTRA_ITEM`

A entidade `USUARIO` é especializada em `ALUNO` e `FUNCIONARIO`. Essa especialização é total e exclusiva, ou seja, todo usuário deve ser aluno ou funcionário, mas não pode ser os dois ao mesmo tempo.

O empréstimo é representado pela tabela `EMPRESTIMO`, pela associação com o aluno em `REALIZA_EMPRESTIMO` e pelos livros registrados em `REGISTRA_ITEM`. O relacionamento `REGISTRA_ITEM` envolve funcionário, empréstimo e livro, indicando qual funcionário registrou determinado livro em determinado empréstimo.

---

## 3. Perfis do sistema e permissões gerais

## 3.1 Funcionário

O funcionário é o principal operador administrativo do sistema. Ele deve entrar no sistema com sua própria conta e, depois de autenticado, pode executar ações relacionadas ao funcionamento da biblioteca.

Regras:

- O funcionário deve estar cadastrado como `FUNCIONARIO`.
- O funcionário deve estar associado a um registro válido em `USUARIO`.
- O funcionário não pode executar ações administrativas caso seu `USUARIO.status` esteja como `INATIVO`.
- O funcionário pode registrar livros no acervo.
- O funcionário pode pesquisar livros.
- O funcionário pode escolher livros para compor um empréstimo.
- O funcionário pode criar empréstimos informando os dados do aluno dentro do próprio processo de empréstimo.
- O funcionário não precisa pesquisar previamente uma lista de alunos para iniciar um empréstimo; ele pode informar dados identificadores do aluno, como matrícula, id ou e-mail, e o sistema valida essas informações.
- O funcionário responsável por registrar um item de empréstimo deve ser gravado em `REGISTRA_ITEM.id_funcionario`.

## 3.2 Aluno

O aluno representa o usuário que pode receber empréstimos de livros. Ele não deve possuir acesso administrativo ao sistema.

Regras:

- O aluno deve estar cadastrado como `ALUNO`.
- O aluno deve estar associado a um registro válido em `USUARIO`.
- O aluno não pode pesquisar, listar ou consultar dados de outros alunos.
- O aluno não pode cadastrar, alterar ou remover livros.
- O aluno não pode cadastrar, alterar ou remover categorias.
- O aluno não pode criar empréstimos diretamente.
- O aluno não pode registrar itens de empréstimo.
- O aluno não pode visualizar dados administrativos de funcionários, unidades, salários ou gerenciamento.
- O aluno pode consultar seus próprios dados, caso exista uma área de perfil.
- O aluno pode solicitar atualização dos próprios dados de contato, como endereço e telefone, caso essa função exista no sistema.
- O aluno pode consultar seu próprio histórico de empréstimos.
- O aluno pode pesquisar livros disponíveis no acervo, caso exista uma área de consulta para alunos.

## 3.3 Gerente de unidade

O gerente é um funcionário associado à gerência de uma unidade.

Regras:

- Apenas um funcionário existente pode ser gerente de uma unidade.
- Uma unidade pode ter zero ou um gerente.
- Um mesmo funcionário pode gerenciar no máximo uma unidade.
- A gerência é representada por `UNIDADE.id_funcionario_gerente`.
- O sistema deve impedir que um aluno seja definido como gerente.
- O sistema deve impedir que um funcionário inativo seja definido como gerente.

## 3.4 Observação sobre login

O modelo lógico apresentado não possui campo de senha, tabela de autenticação ou tabela de permissões. Portanto, o login pode estar sendo tratado em outra parte do backend, por autenticação externa ou por uma implementação adicional não representada no diagrama.

As regras deste documento assumem que, após o login, o backend já consegue identificar se o usuário autenticado é `ALUNO` ou `FUNCIONARIO`.

---

## 4. Regras de usuário

### RN-USU-01 — Cadastro de usuário

Todo usuário deve possuir `id_usuario`, `nome`, `email` e `status`. O campo `endereco` é opcional.

### RN-USU-02 — E-mail único

Não pode existir mais de um usuário com o mesmo e-mail.

### RN-USU-03 — Status válido

O campo `status` deve aceitar apenas os valores `ATIVO` ou `INATIVO`.

### RN-USU-04 — Status inicial

Ao ser cadastrado, o usuário deve iniciar com status `ATIVO`.

### RN-USU-05 — Usuário inativo

Usuários inativos não devem realizar novas operações no sistema.

Regras específicas:

- Aluno inativo não deve receber novos empréstimos.
- Funcionário inativo não deve registrar livros.
- Funcionário inativo não deve criar empréstimos.
- Funcionário inativo não deve registrar itens em empréstimos.
- Funcionário inativo não deve ser definido como gerente de unidade.

### RN-USU-06 — Telefones do usuário

Um usuário pode possuir nenhum, um ou vários telefones. Cada telefone deve estar associado a um usuário existente.

---

## 5. Regras de especialização: aluno e funcionário

### RN-ESP-01 — Especialização total e exclusiva

Todo usuário deve pertencer obrigatoriamente a apenas uma das subclasses: `ALUNO` ou `FUNCIONARIO`.

### RN-ESP-02 — Usuário não pode ser aluno e funcionário ao mesmo tempo

O mesmo `id_usuario` não pode existir simultaneamente em `ALUNO` e `FUNCIONARIO`.

### RN-ESP-03 — Dados obrigatórios do aluno

Todo aluno deve possuir matrícula e curso.

### RN-ESP-04 — Matrícula única

Não pode existir mais de um aluno com a mesma matrícula.

### RN-ESP-05 — Dados opcionais do aluno

Os campos `semestre` e `observacao` são opcionais.

### RN-ESP-06 — Dados obrigatórios do funcionário

Todo funcionário deve possuir cargo e setor.

### RN-ESP-07 — Dados opcionais do funcionário

Os campos `salario` e `observacao` são opcionais.

### RN-ESP-08 — Proteção de dados de funcionário

Dados administrativos de funcionários, especialmente salário, não devem ser visíveis para alunos.

---

## 6. Regras de unidade

### RN-UNI-01 — Cadastro de unidade

Toda unidade deve possuir `id_unidade`, `nome` e `endereco`.

### RN-UNI-02 — Gerência de unidade

Uma unidade pode ter no máximo um funcionário gerente.

### RN-UNI-03 — Gerente deve ser funcionário

O gerente de uma unidade deve existir na tabela `FUNCIONARIO`.

### RN-UNI-04 — Funcionário gerente único

Um mesmo funcionário pode gerenciar no máximo uma unidade.

### RN-UNI-05 — Telefones da unidade

Uma unidade pode possuir nenhum, um ou vários telefones. Cada telefone deve estar associado a uma unidade existente.

### RN-UNI-06 — E-mails da unidade

Uma unidade pode possuir nenhum, um ou vários e-mails. Cada e-mail deve estar associado a uma unidade existente.

---

## 7. Regras de categoria

### RN-CAT-01 — Cadastro de categoria

Toda categoria deve possuir `id_categoria`, `nome` e `descricao`.

### RN-CAT-02 — Nome único de categoria

Não pode existir mais de uma categoria com o mesmo nome.

### RN-CAT-03 — Campos opcionais da categoria

Os campos `cor` e `observacao` são opcionais.

### RN-CAT-04 — Categoria vinculada a livros

Uma categoria pode possuir vários livros, mas cada livro deve pertencer obrigatoriamente a uma categoria.

---

## 8. Regras de livro

### RN-LIV-01 — Cadastro de livro

Todo livro deve possuir `id_livro`, `titulo`, `autor` e `id_categoria`.

### RN-LIV-02 — Campos opcionais do livro

Os campos `editora` e `ano_publicacao` são opcionais.

### RN-LIV-03 — Categoria obrigatória

Todo livro deve estar vinculado a uma categoria existente.

### RN-LIV-04 — Ano de publicação válido

O ano de publicação do livro não pode ser maior que o ano atual.

### RN-LIV-05 — Pesquisa de livros

O sistema deve permitir pesquisa de livros por título, autor ou categoria, conforme a interface implementada.

### RN-LIV-06 — Pesquisa sem diferença entre maiúsculas e minúsculas

A busca por título deve funcionar sem diferenciar letras maiúsculas e minúsculas. Por exemplo, uma busca por `dom casmurro` deve conseguir encontrar `Dom Casmurro`.

### RN-LIV-07 — Registro de livro por funcionário

Apenas funcionários autenticados e ativos devem poder cadastrar ou alterar livros.

### RN-LIV-08 — Aluno não registra livro

Alunos não devem poder cadastrar, alterar ou remover livros do acervo.

### RN-LIV-09 — Disponibilidade do livro

Antes de um livro ser incluído em um novo empréstimo, o sistema deve verificar se ele está disponível.

Observação importante: o modelo atual não possui uma tabela `EXEMPLAR`, campo de quantidade, campo de status do livro ou tabela específica de devolução. Portanto, se o sistema precisar controlar múltiplas cópias do mesmo livro ou devolução real com precisão, o modelo precisaria ser evoluído. Com o modelo atual, a disponibilidade deve ser inferida a partir dos registros de empréstimo existentes.

---

## 9. Regras de empréstimo

### RN-EMP-01 — Criação de empréstimo somente por funcionário

A criação de empréstimos deve ser feita por um funcionário autenticado e ativo.

### RN-EMP-02 — O aluno não cria empréstimo diretamente

O aluno não deve conseguir criar um empréstimo por conta própria. Ele pode ser o beneficiário do empréstimo, mas a operação é registrada por um funcionário.

### RN-EMP-03 — Funcionário informa os dados do aluno durante o empréstimo

No fluxo de criação do empréstimo, o funcionário deve informar os dados necessários para identificar o aluno, como matrícula, id do usuário ou e-mail.

O sistema deve validar esses dados e confirmar que:

- o aluno existe;
- o usuário está cadastrado em `USUARIO`;
- o usuário pertence à tabela `ALUNO`;
- o usuário não pertence à tabela `FUNCIONARIO`;
- o usuário está com status `ATIVO`.

### RN-EMP-04 — Empréstimo vinculado a aluno

Todo empréstimo deve estar associado a um aluno existente por meio de `REALIZA_EMPRESTIMO`.

### RN-EMP-05 — Restrição de um aluno por empréstimo

Mesmo que a tabela `REALIZA_EMPRESTIMO` represente uma associação entre aluno e empréstimo, a regra de negócio do sistema deve considerar que um empréstimo pertence a um único aluno.

Se a equipe quiser garantir isso diretamente no banco, deve existir uma restrição de unicidade sobre `REALIZA_EMPRESTIMO.id_emprestimo`, impedindo que o mesmo empréstimo seja associado a mais de um aluno.

### RN-EMP-06 — Aluno pode ter vários empréstimos

Um aluno pode possuir nenhum, um ou vários empréstimos ao longo do tempo.

### RN-EMP-07 — Quantidade mínima de livros

Todo empréstimo deve possuir pelo menos um livro registrado em `REGISTRA_ITEM`.

### RN-EMP-08 — Funcionário responsável por cada item

Cada livro incluído no empréstimo deve ser registrado com o funcionário responsável por aquela operação.

### RN-EMP-09 — Funcionário do item deve existir

O campo `REGISTRA_ITEM.id_funcionario` deve referenciar um funcionário existente.

### RN-EMP-10 — Livro do item deve existir

O campo `REGISTRA_ITEM.id_livro` deve referenciar um livro existente.

### RN-EMP-11 — Empréstimo do item deve existir

O campo `REGISTRA_ITEM.id_emprestimo` deve referenciar um empréstimo existente.

### RN-EMP-12 — Livro não pode se repetir no mesmo empréstimo

O mesmo livro não deve ser registrado mais de uma vez dentro do mesmo empréstimo.

Essa regra deve ser aplicada mesmo que o diagrama físico utilize uma chave composta envolvendo `id_funcionario`, `id_emprestimo` e `id_livro`. Do ponto de vista da regra de negócio, a combinação `id_emprestimo + id_livro` deve ser única, pois trocar o funcionário não deve permitir duplicar o mesmo livro dentro do mesmo empréstimo.

### RN-EMP-13 — Datas obrigatórias

Todo empréstimo deve possuir `data_emprestimo` e `data_devolucao`.

### RN-EMP-14 — Data de devolução válida

A data de devolução não pode ser anterior à data de empréstimo.

### RN-EMP-15 — Multa não negativa

A multa do empréstimo deve ser maior ou igual a zero.

### RN-EMP-16 — Multa opcional

A multa pode ser nula quando não houver atraso ou penalidade registrada.

### RN-EMP-17 — Observação opcional

O campo `observacao` do empréstimo pode ser usado para registrar informações administrativas, como justificativas, problemas ou comentários sobre a operação.

### RN-EMP-18 — Histórico de empréstimos

O sistema deve permitir consultar histórico de empréstimos com dados do aluno, livros, funcionário responsável, datas, categoria e multa, respeitando as permissões do usuário autenticado.

### RN-EMP-19 — Histórico do aluno

O aluno só deve conseguir consultar o próprio histórico de empréstimos.

### RN-EMP-20 — Histórico administrativo

Funcionários podem consultar históricos de empréstimos para fins administrativos, controle da biblioteca e atendimento ao aluno.

---

## 10. Fluxo correto de criação de empréstimo

1. O funcionário entra no sistema.
2. O funcionário faz login com sua conta.
3. O sistema valida se o usuário autenticado é funcionário e está ativo.
4. O funcionário acessa a função de criação de empréstimo.
5. O funcionário pesquisa e seleciona os livros que farão parte do empréstimo.
6. O sistema valida se os livros existem e podem ser emprestados.
7. O funcionário informa os dados do aluno dentro do formulário de empréstimo.
8. O sistema valida se o aluno existe, está ativo e pertence à tabela `ALUNO`.
9. O funcionário informa ou confirma a data de empréstimo e a data de devolução.
10. O sistema valida se a data de devolução não é anterior à data de empréstimo.
11. O sistema cria o registro em `EMPRESTIMO`.
12. O sistema associa o aluno ao empréstimo em `REALIZA_EMPRESTIMO`.
13. O sistema registra cada livro selecionado em `REGISTRA_ITEM`, junto com o funcionário responsável.
14. Se qualquer validação falhar, o empréstimo não deve ser concluído.
15. Se todas as validações forem aprovadas, o empréstimo fica disponível para consulta no histórico.

---

## 11. Regras de consulta e visibilidade

### RN-PERM-01 — Aluno não consulta outros alunos

Alunos não devem ter acesso à listagem ou pesquisa de outros alunos.

### RN-PERM-02 — Aluno não consulta funcionários

Alunos não devem ter acesso à listagem ou pesquisa de funcionários.

### RN-PERM-03 — Aluno não consulta salários

Alunos não devem visualizar informações salariais de funcionários.

### RN-PERM-04 — Aluno consulta apenas seus próprios dados

Quando existir área de perfil, o aluno deve consultar apenas seus próprios dados.

### RN-PERM-05 — Aluno consulta apenas seu próprio histórico

Quando existir histórico de empréstimos para aluno, ele deve visualizar apenas empréstimos vinculados ao seu próprio `id_usuario`.

### RN-PERM-06 — Funcionário consulta dados necessários ao atendimento

Funcionários podem consultar dados necessários para executar operações da biblioteca, como validar aluno, consultar livros e verificar histórico de empréstimos.

### RN-PERM-07 — Funcionário não deve acessar dados sensíveis sem necessidade

Mesmo sendo funcionário, o sistema deve evitar exposição desnecessária de dados sensíveis, como salário de outros funcionários, salvo se houver regra administrativa específica para isso.

---

## 12. Regras de integridade que devem ser respeitadas pelo backend e pelo banco

### RN-INT-01 — Integridade referencial

Todas as chaves estrangeiras devem apontar para registros existentes.

### RN-INT-02 — Ordem de criação dos dados

Dados de tabelas dependentes só devem ser inseridos depois dos dados principais. Por exemplo:

- `USUARIO` deve existir antes de `ALUNO` ou `FUNCIONARIO`.
- `CATEGORIA` deve existir antes de `LIVRO`.
- `EMPRESTIMO` deve existir antes de `REGISTRA_ITEM`.
- `ALUNO` e `EMPRESTIMO` devem existir antes de `REALIZA_EMPRESTIMO`.

### RN-INT-03 — Transação na criação de empréstimo

A criação do empréstimo deve ser feita como uma operação única. Se uma etapa falhar, todas as etapas anteriores devem ser desfeitas.

Exemplo: se o empréstimo foi criado, mas um dos livros falhou ao ser registrado em `REGISTRA_ITEM`, o empréstimo inteiro deve ser cancelado.

### RN-INT-04 — Validação de datas no banco

O banco deve impedir que `data_devolucao` seja menor que `data_emprestimo`.

### RN-INT-05 — Validação da especialização

O banco deve impedir que o mesmo usuário seja cadastrado ao mesmo tempo como aluno e funcionário.

### RN-INT-06 — Validação de unicidade

Devem ser respeitadas as seguintes unicidades:

- e-mail de usuário;
- matrícula de aluno;
- nome de categoria;
- gerente de unidade;
- livro dentro do mesmo empréstimo.

---

## 13. Regras para histórico de empréstimos

### RN-HIST-01 — Histórico consolidado

O histórico de empréstimos deve consolidar informações que estão distribuídas entre `USUARIO`, `ALUNO`, `FUNCIONARIO`, `EMPRESTIMO`, `REGISTRA_ITEM`, `LIVRO` e `CATEGORIA`.

### RN-HIST-02 — Uso de view

A view de histórico pode ser usada para evitar que o backend precise repetir várias junções sempre que for exibir relatórios ou histórico.

### RN-HIST-03 — Acesso ao histórico por perfil

O acesso ao histórico deve respeitar o perfil do usuário:

- aluno: apenas o próprio histórico;
- funcionário: histórico necessário para operação da biblioteca;
- gerente: histórico relacionado à administração da unidade, se essa regra for implementada.

---

## 14. Regras que o modelo atual não cobre completamente

Algumas regras importantes de sistemas de biblioteca não estão totalmente representadas no diagrama lógico atual. Portanto, elas devem ser Verificadas se já existem no banco, e se a equipe implementou no backend.

### RN-LIM-01 — Login e senha

O modelo lógico não possui campo de senha nem tabela de autenticação.

### RN-LIM-02 — Devolução real

O modelo possui `data_devolucao`, mas não diferencia claramente data prevista de devolução e data real de devolução.

### RN-LIM-03 — Exemplares do mesmo livro

O modelo possui `LIVRO`, mas não possui `EXEMPLAR`. Assim, ele não controla várias cópias físicas do mesmo livro.

### RN-LIM-04 — Reserva de livro

O modelo não possui entidade ou tabela de reserva.

### RN-LIM-05 — Renovação de empréstimo

O modelo não possui entidade ou campo específico para renovação.

### RN-LIM-06 — Quantidade máxima de empréstimos por aluno

O modelo não define limite máximo de empréstimos ativos por aluno.

### RN-LIM-07 — Penalidade automática por atraso

O modelo possui multa, mas não define fórmula automática de cálculo da multa.

---

## 15. Resumo das regras centrais

- Funcionário autenticado e ativo registra livros e cria empréstimos.
- Aluno não cria empréstimo diretamente.
- O funcionário informa os dados do aluno durante a criação do empréstimo.
- O sistema valida se o aluno existe, está ativo e é realmente aluno.
- O empréstimo deve possuir datas válidas.
- O empréstimo deve conter pelo menos um livro.
- O mesmo livro não pode aparecer duas vezes no mesmo empréstimo.
- Cada item do empréstimo registra o funcionário responsável.
- Aluno não pesquisa outros alunos.
- Aluno não acessa dados administrativos.
- Aluno pode consultar apenas seus próprios dados e seu próprio histórico, caso essas funções existam.
- Livro deve pertencer obrigatoriamente a uma categoria.
- Usuário deve ser aluno ou funcionário, nunca ambos.
- O banco deve validar regras críticas como unicidade, integridade referencial, especialização exclusiva e datas válidas.
