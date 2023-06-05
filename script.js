// Konstanta yang digunakan untuk event
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const MOVED_EVENT = "moved-book";
const DELETED_EVENT = "deleted-book";

// Kunci penyimpanan untuk local storage
const STORAGE_KEY = "BOOKSHELF_APPS";

// Array untuk menyimpan daftar buku
const books = [];

// Fungsi untuk memeriksa apakah web browser mendukung fitur local storage
const isStorageExist = () => {
  if (typeof Storage === "undefined") {
    alert("Browser kamu tidak mendukung web storage");
    return false;
  }
  return true;
};

// Event listener untuk menampilkan buku saat event RENDER_EVENT dipicu
document.addEventListener(RENDER_EVENT, () => {
  // Mendapatkan elemen container untuk buku yang belum dibaca
  const unfinishedBook = document.getElementById("belumDibaca");
  unfinishedBook.innerHTML = "";

  // Mendapatkan elemen container untuk buku yang sudah dibaca
  const finishedBook = document.getElementById("sudahDibaca");
  finishedBook.innerHTML = "";

  // Memasukkan setiap buku ke dalam container yang sesuai
  for (const bookItem of books) {
    const bookElement = makeBookElement(bookItem);
    if (!bookItem.isComplete) {
      unfinishedBook.append(bookElement);
    } else {
      finishedBook.append(bookElement);
    }
  }
});

// Fungsi untuk menampilkan toast alert
const showCustomAlert = (message) => {
  const elementCustomAlert = document.createElement("div");
  elementCustomAlert.classList.add("alert");
  elementCustomAlert.innerText = message;

  document.body.insertBefore(elementCustomAlert, document.body.children[0]);
  setTimeout(() => {
    elementCustomAlert.remove();
  }, 2000);
};

// Event listener untuk menampilkan toast alert ketika buku disimpan
document.addEventListener(SAVED_EVENT, () => {
  showCustomAlert("Berhasil Disimpan!");
});

// Event listener untuk menampilkan toast alert ketika buku dipindahkan
document.addEventListener(MOVED_EVENT, () => {
  showCustomAlert("Berhasil Dipindahkan!");
});

// Event listener untuk menampilkan toast alert ketika buku dihapus
document.addEventListener(DELETED_EVENT, () => {
  showCustomAlert("Berhasil Dihapus!");
});

// Fungsi untuk memuat data dari localStorage jika ada
const loadDataFromStorage = () => {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (data !== null) {
    // Menyalin data ke array books
    books.push(...data);
  }

  // Men-trigger event RENDER_EVENT untuk menampilkan buku-buku yang sudah ada
  document.dispatchEvent(new Event(RENDER_EVENT));
};

// Fungsi untuk menyimpan data ke localStorage
const saveData = () => {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
};

// Fungsi untuk memindahkan data
const moveData = () => {
  document.dispatchEvent(new Event(MOVED_EVENT));
};

// Fungsi untuk menghapus data
const deleteData = () => {
  localStorage.removeItem(STORAGE_KEY); // Menghapus data dari local storage
  document.dispatchEvent(new Event(DELETED_EVENT));
};

// Fungsi untuk menambahkan data buku baru
const addBook = () => {
  const bookTitle = document.getElementById("judul").value;
  const bookAuthor = document.getElementById("penulis").value;
  const bookYear = document.getElementById("tahun").value;
  const bookDescription = document.getElementById("deskripsi").value;
  const bookHasFinished = document.getElementById("isRead").checked;

  // Menambahkan buku baru ke dalam array books
  books.push({
    id: +new Date(), // Menggunakan timestamp sebagai ID buku
    title: bookTitle,
    author: bookAuthor,
    year: Number(bookYear),
	deskripsi: bookDescription,
    isComplete: bookHasFinished,
  });

  // Reset input form
  document.getElementById("judul").value = "";
  document.getElementById("penulis").value = "";
  document.getElementById("tahun").value = "";
  document.getElementById("deskripsi").value = "";
  document.getElementById("isRead").checked = false;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData(); // Menyimpan perubahan ke local storage
};

// Fungsi untuk membuat elemen HTML yang merepresentasikan sebuah buku
const makeBookElement = (bookObject) => {
  // Membuat elemen judul buku
  const elementBookTitle = document.createElement("p");
  elementBookTitle.classList.add("item-title");
  elementBookTitle.innerHTML = `${bookObject.title} <span>(${bookObject.year})</span>`;

  // Membuat elemen penulis buku
  const elementBookAuthor = document.createElement("p");
  elementBookAuthor.classList.add("item-writer");
  elementBookAuthor.innerText = bookObject.author;

  // Menggabungkan elemen judul dan penulis buku ke dalam elemen container
  const descContainer = document.createElement("div");
  descContainer.classList.add("item-desc");
  descContainer.append(elementBookTitle, elementBookAuthor);

  // Membuat elemen container untuk tombol aksi
  const actionContainer = document.createElement("div");
  actionContainer.classList.add("item-action");

  // Membuat elemen container utama untuk buku
  const container = document.createElement("div");
  container.classList.add("item");
  container.append(descContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  // Tambahkan tombol "Info" pada setiap buku
  const infoBtn = createActionButton("info-btn", "bx bx-info-circle");
  infoBtn.addEventListener("click", () => {
    modalContainer.style.display = "block";
  });
  
  actionContainer.append(infoBtn);
  
  if (bookObject.isComplete) {
    // Jika buku sudah selesai, tambahkan tombol "Kembalikan"
    const returnBtn = createActionButton("kembalikan-btn", "bx bx-undo");
    returnBtn.addEventListener("click", () => {
      returnBookFromFinished(bookObject.id);
    });

    actionContainer.append(returnBtn);
  } else {
    // Jika buku belum selesai, tambahkan tombol "Selesai"
    const finishBtn = createActionButton("selesai-btn", "bx bx-check");
    finishBtn.addEventListener("click", () => {
      addBookToFinished(bookObject.id);
    });

    actionContainer.append(finishBtn);
  }

  // Tambahkan tombol "Hapus" pada setiap buku
  const deleteBtn = createActionButton("hapus-btn", "bx bx-trash");
  deleteBtn.addEventListener("click", () => {
    deleteBook(bookObject.id);
  });

  actionContainer.append(deleteBtn);
  container.append(actionContainer);
  
  // Tombol close modal
  const closeButton = document.createElement("span");
  closeButton.setAttribute("id", `close-${bookObject.id}`);
  closeButton.classList.add("close");
  closeButton.innerHTML = "&times;"
    
  // Tutup modal ketika close diklik
  closeButton.addEventListener("click", () => {
    modalContainer.style.display = "none";
  });
  
  // Tambahkan modal detail untuk setiap buku
  const modalContainer = document.createElement("div");
  modalContainer.setAttribute("id", `modal-${bookObject.id}`);
  modalContainer.classList.add("modal");
  modalContainer.innerHTML = 
  `<div class="modal-content" style="border-radius:20px"> ${closeButton.outerHTML}
  <h2 style="background-color:#3c83f6; height:40px; color:white; border-radius:20px 0;text-align: center;">${bookObject.title}</h2>
  <div class="row">
    <div class="col-md-5">
      <img height="300px" src="https://islandpress.org/sites/default/files/default_book_cover_2015.jpg">
    </div>
    <div class="col-md-7">
      <table style="margin-top:20px">
        <tr>
          <td width="150px">
            Nama Penulis
          </td>
          <td width="20px">
            :
          </td>
          <td>
            ${bookObject.author}
          </td>
        </tr>
        <tr>
          <td>
            Tahun
          </td>
          <td>
            :
          </td>
          <td>
            ${bookObject.year}
          </td>
        </tr>
        <tr>
          <td>
            Status
          </td>
          <td>
            :
          </td>
          <td>
            ${(bookObject.isComplete)? "Sudah selesai dibaca"
              : "Belum selesai dibaca"}
            </span>
          </td>
        </tr>
		<tr>
          <td>
            Deskripsi
          </td>
          <td>
            :
          </td>
          <td>
            ${bookObject.deskripsi}
          </td>
        </tr>
      </table>
    </div>
  </div>
  </div>`;
  
  // Tutup modal ketika klik di luar modal
  window.addEventListener("click", (event) => {
	  if (event.target == modalContainer) {
		modalContainer.style.display = "none";
	  }
  });
  
  // Tutup modal ketika tombol "Escape" ditekan
	window.addEventListener("keydown", (event) => {
	  if (event.key === "Escape") {
		var modalContainer = document.getElementById(`modal-${bookObject.id}`);
		modalContainer.style.display = "none";
	  }
	});

  container.append(modalContainer);

  return container;
};

// Fungsi untuk membuat tombol aksi
const createActionButton = (className, iconClass) => {
  const button = document.createElement("button");
  button.classList.add(className);
  button.innerHTML = `<i class="${iconClass}"></i>`;
  return button;
};

// Fungsi untuk mengubah status buku menjadi selesai
const addBookToFinished = (bookId) => {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  moveData();
};

// Fungsi untuk mengubah status buku menjadi belum selesai
const returnBookFromFinished = (bookId) => {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  moveData();
};

// Fungsi untuk menghapus buku
const deleteBook = (bookId) => {
  const bookIndex = findBookIndex(bookId);
  if (bookIndex === -1) return;

  books.splice(bookIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  deleteData();
};

// Fungsi untuk mencari buku berdasarkan ID. Mengembalikan objek buku jika ditemukan.
const findBook = (bookId) => {
  return books.find((book) => book.id === bookId);
};

// Fungsi untuk mencari buku berdasarkan ID. Mengembalikan index buku jika ditemukan.
const findBookIndex = (bookId) => {
  return books.findIndex((book) => book.id === bookId);
};

// Menambahkan event saat halaman pertama dimuat
document.addEventListener("DOMContentLoaded", () => {
  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const simpanForm = document.getElementById("formDataBuku");
  simpanForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addBook();
  });

  const searchForm = document.getElementById("formSearch");
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchBook();
  });

  const resetBtn = document.querySelector(".reset-btn");
  resetBtn.addEventListener("click", () => {
    document.getElementById("pencarian").value = "";
    searchBook();
  });
});

// Fungsi untuk mencari buku berdasarkan judul
const searchBook = () => {
  const searchInput = document.getElementById("pencarian").value.toLowerCase();
  const bookItems = document.getElementsByClassName("item");

  for (let i = 0; i < bookItems.length; i++) {
    const itemTitle = bookItems[i].querySelector(".item-title");
    if (itemTitle.textContent.toLowerCase().includes(searchInput)) {
      bookItems[i].classList.remove("hidden");
    } else {
      bookItems[i].classList.add("hidden");
    }
  }
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

const carouselItems = document.querySelectorAll('.carousel-item');
    let currentSlide = 0;

    const showSlide = (index) => {
      carouselItems.forEach((item, i) => {
        if (i === index) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    };

    const nextSlide = () => {
      currentSlide = (currentSlide + 1) % carouselItems.length;
      showSlide(currentSlide);
    };

    const prevSlide = () => {
      currentSlide = (currentSlide - 1 + carouselItems.length) % carouselItems.length;
      showSlide(currentSlide);
    };

    setInterval(nextSlide, 3000);