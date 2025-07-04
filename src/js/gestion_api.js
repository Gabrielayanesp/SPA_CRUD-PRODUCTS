const API = "http://localhost:3000/productos";

// Get elements from HTML
const form = document.getElementById("producto-form");
const lista = document.getElementById("lista-productos");
const buscador = document.getElementById("buscador");
const filtro = document.getElementById("filtro-categoria");
const contador = document.getElementById("contador");

// Show products on screen
function mostrarProductos(data = []) {
  lista.innerHTML = "";

  const filtrados = data.filter((p) => {
    const porNombre = p.nombre
      .toLowerCase()
      .includes(buscador.value.toLowerCase());
    const porCategoria = filtro.value === "" || p.categoria === filtro.value;
    return porNombre && porCategoria;
  });

  contador.textContent = `${filtrados.length} product${
    filtrados.length !== 1 ? "s" : ""
  } found`;

  filtrados.forEach((prod) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${prod.nombre} <small>${prod.categoria}</small></h3>
      <p><strong>$${prod.precio.toFixed(2)}</strong></p>
      <p>${prod.descripcion}</p>
      <p>Stock: ${prod.stock}</p>
      <div class="acciones">
        <button onclick="editar(${prod.id})">Edit</button>
        <button onclick="borrar(${prod.id})">Delete</button>
      </div>
    `;
    lista.appendChild(div);
  });
}

// Get data from API
function cargarProductos() {
  fetch(API)
    .then((res) => res.json())
    .then((data) => mostrarProductos(data))
    .catch(() => {
      Swal.fire("Error", "Could not load products.", "error");
    });
}

// Save product
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const precio = parseFloat(document.getElementById("precio").value);
  const descripcion = document.getElementById("descripcion").value.trim();
  const categoria = document.getElementById("categoria").value;
  const stock = parseInt(document.getElementById("stock").value);

  if (!nombre || isNaN(precio) || !descripcion || !categoria || isNaN(stock)) {
    Swal.fire("Oops!", "All fields must be valid.", "error");
    return;
  }

  const nuevo = {
    id: String(Date.now()), 
    nombre,
    precio,
    descripcion,
    categoria,
    stock,
  };

  fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevo),
  })
    .then(() => {
      form.reset();
      cargarProductos();
      Swal.fire("Saved!", "Product was added successfully.", "success");
    })
    .catch(() => {
      Swal.fire("Error", "Could not save product.", "error");
    });
});

// Delete product
function borrar(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "This product will be deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#1976d2",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`${API}/${id}`, { method: "DELETE" })
        .then(() => {
          cargarProductos();
          Swal.fire("Deleted!", "Product was deleted.", "success");
        })
        .catch(() => {
          Swal.fire("Error", "Could not delete product.", "error");
        });
    }
  });
}

// edit 
function editar(id) {
  fetch(`${API}/${id}`)
    .then((res) => res.json())
    .then((prod) => {
      document.getElementById("edit-id").value = prod.id;
      document.getElementById("edit-nombre").value = prod.nombre;
      document.getElementById("edit-precio").value = prod.precio;
      document.getElementById("edit-descripcion").value = prod.descripcion;
      document.getElementById("edit-categoria").value = prod.categoria;
      document.getElementById("edit-stock").value = prod.stock;
      document.getElementById("edit-modal").style.display = "flex";
    });
}

// 
document.getElementById("cancel-edit").addEventListener("click", () => {
  document.getElementById("edit-modal").style.display = "none";
});

// edit form
document.getElementById("edit-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const id = document.getElementById("edit-id").value;
  const updated = {
    nombre: document.getElementById("edit-nombre").value,
    precio: parseFloat(document.getElementById("edit-precio").value),
    descripcion: document.getElementById("edit-descripcion").value,
    categoria: document.getElementById("edit-categoria").value,
    stock: parseInt(document.getElementById("edit-stock").value),
  };

  fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  })
    .then(() => {
      cargarProductos();
      document.getElementById("edit-modal").style.display = "none";
      Swal.fire("Updated!", "Product was updated successfully.", "success");
    })
    .catch(() => Swal.fire("Error", "Could not update product.", "error"));
});

// Load products and filter
buscador.addEventListener("input", cargarProductos);
filtro.addEventListener("change", cargarProductos);

cargarProductos();
