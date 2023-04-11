window.addEventListener('DOMContentLoaded', () => {
  
  let tasks = [];
  
  const content = document.querySelector('.content');
  const btnAddToCart = document.querySelectorAll('.btn-add');
  btnAddToCart.forEach(btnAdd => {
    btnAdd.addEventListener('click', event => {
      
      /*
        isi dari variabel "element" merupakan element div dengan 
        class "bg-white p-4 shadow rounded-1 my-2"
      */
      const element = event.target.parentElement.parentElement.children;
      // isi variabel "item" merupakan nama item
      const item = element[0].textContent.trim();
      // iisi variabel "image" merupakan gambar
      const image = element[1].src;
      // isi variabel "price" merupakan harga dari item tersebut
      const price = element[2].children[0].textContent.trim();
      
      // masukkan nama item, gambar dan harga sebagai objek
      const data = {
        item: item,
        image: image,
        price: parseFloat(setPrice(price))
      };
      
      // jika data telah terdaftar dibagian list
      if (isDataExist(data)) {
        
        return alerts('error', 'Data is already in the list!');
        
      } else {
        
        // jika data belum terdaftar dibagian list
        // masukkan isi variabel "data" kedalam variabel "tasks"
        tasks.unshift(data);
        // simpan isi variabel "tasks" kedalam localstorage
        saveToLocalstorage();
        // render element dan tampilkan element tersebut
        showUI(data);
        // beri pesan bahwa "data berhasil ditambahkan"
        alerts('success', 'Data has been added!');
        // update total pembayaran
        updateTotalCart();
        // tampilkan data yang ada didalam localstorage
        loadData();
        
      }
      
    });
  });
  
  function saveToLocalstorage() {
    /*
      simpan isi variabel "tasks" kedalam localstorage, lalu parsing menjadi
      sebuah string JSON
    */
    localStorage.setItem('shopping-cart', JSON.stringify(tasks));
  }
  
  function alerts(type, text) {
    // plugin dari "sweetalert2"
    swal.fire ({
      icon: type,
      title: 'Alert!',
      text: text
    });
  }
  
  function isDataExist({item, image, price}) {
    // nilai default apabila data belum terdaftar dibagian list
    let exist = false;
    tasks.forEach(task => {
      if (task.item == item && task.image == image && task.price == price) exist = true;
      if (task.item == item && task.image == image && task.price != price) exist = true;
      if (task.item == item && task.image != image && task.price == price) exist = true;
    });
    // kembalikan nilai berupa boolean true atau false
    return exist;
  }
  
  function setPrice(param) {
    /*
      potong isi parameter "param" dibagian simbol "$"
      lalu ambil bagian dari isi parameter "param" paling akhir
      contoh :
      $100 -> [$, 100] -> 100
      ------------------------
      nilai awal - potong menjadi beberapa bagian -> nilai akhir
    */
    const part = param.split('$');
    return part[part.length - 1];
  }
  
  function showUI(data, index = 0) {
    // render data menjadi sebuah element html
    const result = elementUI(data, index);
    // tampilkan element tersebut ke bagian halaman
    content.insertAdjacentHTML('beforeend', result);
  }
  
  function elementUI({item, image, price}, index) {
    return `
    <tr>
      <td class="p-3 fw-light">
        <img src="${image}" alt="image" width="60" class="rounded-1 me-2 mb-2">
        ${item}
      </td>
      <td class="p-3 fw-light">$${price}</td>
      <td class="p-3 fw-light">
        <input type="number" class="input-small input-number me-1 w-25" data-index="${index}">
        <button class="btn btn-danger rounded-1 btn-delete" data-index="${index}">delete</button>
      </td>
    </tr>
    `;
  }
  
  function loadData() {
    // kosongkan isi element content
    content.innerHTML = '';
    // ambil data yang ada didalam localstorage
    const data = localStorage.getItem('shopping-cart');
    /*
      jika variabel "data" menghasilkan boolean true, maka ubah isi variabel "tasks"
      dengan data yang sudah diparsing menjadi JSON. tapi apabila variabel "data" menghasilkan boolean
      false, maka ubah isi variabel "tasks" dengan array kosong
    */
    tasks = (data) ? JSON.parse(data) : [];
    tasks.forEach((task, index) => {
      /*
        looping variabel "tasks" dan jalankan fungsi untuk merender data menjadi element
        html dan untuk menghitung total biaya yang harus dibayarkan
      */
      showUI(task, index);
      updateTotalCart();
    });
  }
  
  loadData();
  
  function updateTotalCart() {
    // dapatkan element dengan class "total"
    const total = document.querySelector('.total');
    /*
      looping variabel "tasks" lalu ambil data dengan property "price" dan 
      setelah itu jumlahkan semua data tersebut
    */
    const data = tasks.map(task => task.price).reduce((total, num) => total += num, 0);
    // tampilkan hasilnya
    total.textContent = `$${data}`;
  }
  
  // sebuah input yang berada dibagian tabel
  window.addEventListener('keyup', event => {
    // jika element tersebut memiliki class "input-number"
    if (event.target.classList.contains('input-number')) {
      // harga lama
      const oldPrice = setPrice(event.target.parentElement.parentElement.cells[1].textContent);
      // value atau isi input
      const value = Number(event.target.value.trim());
      // ambil isi atribut "data-index" dari element yang dituju
      const index = event.target.dataset.index;
      let total = 0;
      // kalikan isi variabel "tasks" dengan isi input
      total += (tasks[index].price * value);
      /*
        ubah isi dari variabel "tasks" dengan property "price" dengan ketentuan
        jika input berisikan value, maka ubah isinya dengan isi dari variabel "total". tapi jika 
        input tidak ada value atau isinya sama sekali, maka ubah isinya dengan isi dari variabel "oldPrice"
      */
      tasks[index].price = (value) ? total : parseFloat(oldPrice);
      // simpan kedalam localstorage
      saveToLocalstorage();
      // update total pembayaran
      updateTotalCart();
    }
  });
  
  // hapus data
  window.addEventListener('click', event => {
    // jika element tersebut memiliki class "btn-delete"
    if (event.target.classList.contains('btn-delete')) {
      // ambil isi atribut "data-index" dari element yang ditekan
      const index = event.target.dataset.index;
      // jalankan fungsi deleteData()
      deleteData(index);
    }
  });
  
  function deleteData(index) {
    // plugin dari "sweetalert2"
    swal.fire ({
      icon: 'info',
      title: 'Are you sure?',
      text: 'do you want to delete this data?',
      showCancelButton: true
    })
    .then(response => {
      // kika tombol yang ditekan bertuliskan kata "ok" atau "yes"
      if (response.isConfirmed) {
        
        // hapus isi dari variabel "tasks" yang indexnya sesuai dengan isi parameter "index"
        tasks.splice(index, 1);
        // simpan perubahan data kedalam localstorage
        saveToLocalstorage();
        // update total pembayaran
        updateTotalCart();
        // berikan pesan bahwq "data berhasil dihapus"
        alerts('success', 'Data has been deleted!');
        // load data yang ada didalam localstorage
        loadData();
        
      }
    });
  }
  
  // tombol purchase
  const btnPurchase = document.querySelector('.btn-purchase');
  btnPurchase.addEventListener('click', () => {
    if (tasks.length > 0) {
      
      // jumlah dari isi variabel "tasks"
      const itemLength = tasks.length;
      /*
        dapatkan isi dari variabel "tasks" dengan property "price"
        lalu jumlahkan data twrsebut
      */
      const total = tasks.map(task => task.price).reduce((total, num) => total += num, 0);
      // ubah isi variabel menjadi array kosong
      tasks = [];
      // simpan perubahan data tersebut kedalam localstorage
      saveToLocalstorage();
      // update total pembayaran
      updateTotalCart();
      /*
        berikan pesan bahwwa data yang dibeli berapa jumlahnya dan berapa total 
        pembayarannya
      */
      alerts('success', `The items you take are as many as ${itemLength} and the total payment is $${total}`);
      // load data yang ada didalam localstorage
      loadData();
      
    }
  });
  
});