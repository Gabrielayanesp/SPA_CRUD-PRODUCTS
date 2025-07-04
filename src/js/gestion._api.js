const API = "http://localhost:3000/productos";
const form = document.getElementById("producto-form");
const lista = document.getElementById("lista-productos");
const buscador = document.getElementById("buscador");
const filtro = document.getElementById("filtro-categoria");
const contador = document.getElementById("contador");

function mostrarProductos(data = []) {
  lista.innerHTML = "";
  const filtrados = data.filter((p) => {
    const porNombre = p.nombre
      .toLowerCase()
      .includes(buscador.value.toLowerCase());
    const porCategoria = filtro.value === "" || p.categoria === filtro.value;
    return porNombre && porCategoria;
  });

  contador.textContent = `${filtrados.length} producto${
    filtrados.length !== 1 ? "s" : ""
  } encontrado${filtrados.length !== 1 ? "s" : ""}`;

  filtrados.forEach((prod) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${prod.nombre} <small>${prod.categoria}</small></h3>
      <p><strong>$${prod.precio.toFixed(2)}</strong></p>
      <p>${prod.descripcion}</p>
      <p>Stock: ${prod.stock}</p>
      <div class="acciones">
        <button onclick="editar(${prod.id})">Editar</button>
        <button onclick="borrar(${prod.id})">Borrar</button>
      </div>
    `;
    lista.appendChild(div);
  });
}

function cargarProductos() {
  fetch(API)
    .then((res) => res.json())
    .then((data) => mostrarProductos(data))
    .catch((err) => alert("Error al cargar productos"));
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const precio = parseFloat(document.getElementById("precio").value);
  const descripcion = document.getElementById("descripcion").value.trim();
  const categoria = document.getElementById("categoria").value;
  const stock = parseInt(document.getElementById("stock").value);

  if (!nombre || isNaN(precio) || !descripcion || !categoria || isNaN(stock)) {
    alert("Todos los campos deben ser válidos");
    return;
  }

  const nuevo = { nombre, precio, descripcion, categoria, stock };

  fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevo),
  })
    .then(() => {
      form.reset();
      cargarProductos();
    })
    .catch((err) => alert("Error al guardar producto"));
});

function borrar(id) {
  if (confirm("¿Seguro que deseas eliminar este producto?")) {
    fetch(`${API}/${id}`, { method: "DELETE" })
      .then(() => cargarProductos())
      .catch((err) => alert("Error al eliminar producto"));
  }
}

function editar(id) {
  const nuevoNombre = prompt("Nuevo nombre:");
  const nuevoPrecio = prompt("Nuevo precio:");
  const nuevaDescripcion = prompt("Nueva descripción:");
  const nuevaCategoria = prompt("Nueva categoría:");
  const nuevoStock = prompt("Nuevo stock:");

  if (
    !nuevoNombre ||
    isNaN(nuevoPrecio) ||
    !nuevaDescripcion ||
    !nuevaCategoria ||
    isNaN(nuevoStock)
  ) {
    alert("Datos inválidos");
    return;
  }

  const actualizado = {
    nombre: nuevoNombre,
    precio: parseFloat(nuevoPrecio),
    descripcion: nuevaDescripcion,
    categoria: nuevaCategoria,
    stock: parseInt(nuevoStock),
  };

  fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(actualizado),
  })
    .then(() => cargarProductos())
    .catch((err) => alert("Error al actualizar"));
}

buscador.addEventListener("input", cargarProductos);
filtro.addEventListener("change", cargarProductos);

// Iniciar
cargarProductos();
