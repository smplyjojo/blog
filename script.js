const chaveStorage = "blog-da-jojo-posts";
const formularioPost = document.querySelector("#form-post");
const listaPosts = document.querySelector("#lista-posts");
const mensagemFormulario = document.querySelector("#mensagem-form");

let posts = carregarPosts();

function carregarPosts() {
  try {
    return JSON.parse(localStorage.getItem(chaveStorage)) || [];
  } catch {
    return [];
  }
}

function salvarPosts() {
  try {
    localStorage.setItem(chaveStorage, JSON.stringify(posts));
    return true;
  } catch {
    mensagemFormulario.textContent = "Não foi possível salvar. Tente usar uma imagem menor.";
    return false;
  }
}

function criarElemento(nome, classe, texto) {
  const elemento = document.createElement(nome);
  if (classe) elemento.className = classe;
  if (texto) elemento.textContent = texto;
  return elemento;
}

function mostrarPosts() {
  listaPosts.replaceChildren();

  if (posts.length === 0) {
    listaPosts.append(criarElemento("p", "vazio", "Ainda não há publicações."));
    return;
  }

  posts.forEach((post) => {
    const artigo = criarElemento("article", "publicacao");
    const titulo = criarElemento("h3", "", post.titulo);
    const data = criarElemento("p", "data-post", new Date(post.data).toLocaleString("pt-BR"));

    artigo.append(titulo, data);

    if (post.imagem) {
      const imagem = document.createElement("img");
      imagem.className = "imagem-post";
      imagem.src = post.imagem;
      imagem.alt = post.titulo;
      artigo.append(imagem);
    }

    if (post.texto) {
      artigo.append(criarElemento("p", "", post.texto));
    }

    const secaoComentarios = criarElemento("section", "comentarios");
    secaoComentarios.append(criarElemento("h4", "", "Comentários"));

    const comentarios = criarElemento("ul", "lista-comentarios");
    post.comentarios.forEach((comentario) => {
      comentarios.append(criarElemento("li", "", comentario));
    });
    secaoComentarios.append(comentarios);

    const formularioComentario = criarElemento("form", "form-comentario");
    const campoComentario = document.createElement("input");
    campoComentario.type = "text";
    campoComentario.placeholder = "Escreva um comentário";
    campoComentario.setAttribute("aria-label", "Escreva um comentário");
    campoComentario.required = true;

    const botaoComentario = criarElemento("button", "", "Comentar");
    botaoComentario.type = "submit";
    formularioComentario.append(campoComentario, botaoComentario);

    formularioComentario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      post.comentarios.push(campoComentario.value.trim());
      if (salvarPosts()) mostrarPosts();
    });

    secaoComentarios.append(formularioComentario);
    artigo.append(secaoComentarios);
    listaPosts.append(artigo);
  });
}

formularioPost.addEventListener("submit", (evento) => {
  evento.preventDefault();
  mensagemFormulario.textContent = "";

  const titulo = formularioPost.elements.titulo.value.trim() || "Sem título";
  const texto = formularioPost.elements.texto.value.trim();
  const arquivo = formularioPost.elements.imagem.files[0];

  if (!texto && !arquivo) {
    mensagemFormulario.textContent = "Escreva um texto ou escolha uma imagem para publicar.";
    return;
  }

  const adicionarPost = (imagem = "") => {
    const novoPost = {
      id: Date.now(),
      titulo,
      texto,
      imagem,
      data: new Date().toISOString(),
      comentarios: []
    };

    posts.unshift(novoPost);
    if (salvarPosts()) {
      formularioPost.reset();
      mostrarPosts();
    } else {
      posts.shift();
    }
  };

  if (!arquivo) {
    adicionarPost();
    return;
  }

  if (!arquivo.type.startsWith("image/")) {
    mensagemFormulario.textContent = "Escolha um arquivo de imagem.";
    return;
  }

  const leitor = new FileReader();
  leitor.addEventListener("load", () => adicionarPost(leitor.result));
  leitor.addEventListener("error", () => {
    mensagemFormulario.textContent = "Não foi possível ler essa imagem.";
  });
  leitor.readAsDataURL(arquivo);
});

mostrarPosts();