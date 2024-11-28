let infoProduct = JSON.parse(localStorage.getItem("infoProduct")) || [];
infoContainer();

document.getElementById("add").addEventListener("click", () => {
  addProduct();
});

document.querySelector("#product-alert i").addEventListener("click", () => {
  document.getElementById("product-alert").classList.add("hidden");
});

document.querySelector("#price-alert i").addEventListener("click", () => {
  document.getElementById("price-alert").classList.add("hidden");
});

// Submit 
document.getElementById("submit").addEventListener("click", () => {
  if (!infoProduct.length <= 0) {
    send();
  }
});

function disabledSubmitBtn() {
  if (infoProduct.length > 0) {
    document.getElementById("submit").disabled = false;
  } else {
    document.getElementById("submit").disabled = true;
  }
}
disabledSubmitBtn();

// add product
function addProduct() {
  const productNameEl = document.getElementById("product").value.trim();
  const priceProductEl = document.getElementById("price").value.trim();
  const noteEl = document.getElementById("note").value.trim();

  if (productNameEl === "") {
    document.getElementById("product-alert").classList.remove("hidden");
    document.getElementById("product").focus();
    return;
  } else {
    document.getElementById("product-alert").classList.add("hidden");
  }
  if (priceProductEl === "") {
    document.querySelector("#price-alert span").textContent = "กรุณาใส่ราคาสินค้า";
    document.getElementById("price-alert").classList.remove("hidden");
    document.getElementById("price").focus();
    return;
  } else if (isNaN(priceProductEl)) {
    document.querySelector("#price-alert span").textContent = "กรุณาใส่ตัวเลข";
    document.getElementById("price-alert").classList.remove("hidden");
    document.getElementById("price").focus();
    return;
  } else {
    document.getElementById("price-alert").classList.add("hidden");
  }

  let today = new Date();
  let formattedDate = (today.getDate().toString().padStart(2, '0')) + '/' +
    (today.getMonth() + 1).toString().padStart(2, '0') + '/' +
    today.getFullYear();

  infoProduct.push({
    date: formattedDate,
    productName: productNameEl,
    priceProduct: priceProductEl,
    note: noteEl
  });
  showToast('เพิ่มข้อมูลรายจ่ายแล้ว', 'success');
  disabledSubmitBtn();
  localStorage.setItem("infoProduct", JSON.stringify(infoProduct));
  document.getElementById("product").value = "";
  document.getElementById("product").focus();
  document.getElementById("price").value = "";
  document.getElementById("note").value = "";

  infoContainer();
}

// info-container
function infoContainer() {
  const infocontainer = document.querySelector("#info-container .space-y-4");

  let content = '';
  infoProduct.reverse().forEach((item, index) => {
    content += `
    <div class="flex justify-between items-center py-4 px-6 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
      <div class="flex flex-col w-full">
        <div class="flex justify-between items-center">
          <span class="font-semibold text-lg text-gray-800">${item.productName}</span>
          <span class="text-lg text-gray-600">฿${item.priceProduct}</span>
        </div>
        <div class="text-sm text-gray-500">
          <span>${item.note}</span>
        </div>
      </div>
      <div class="flex items-center ml-2">
        <button class="edit-btn text-blue-500 hover:text-blue-700 transition-colors duration-300 mr-2" data-index="${index}">
          <i class="fa-solid fa-pen-to-square text-xl"></i>
        </button>
        <button class="delete-btn text-red-500 hover:text-red-700 transition-colors duration-300" data-index="${index}">
          <i class="fa-solid fa-xmark text-xl cursor-pointer"></i>
        </button>
      </div>
    </div>
    `;
  });

  infocontainer.innerHTML = content;

  // Add delete functionality
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', () => {
      const index = button.getAttribute('data-index');
      deleteProduct(index);
    });
  });

  // Add edit functionality
  const editButtons = document.querySelectorAll('.edit-btn');
  editButtons.forEach(button => {
    button.addEventListener('click', () => {
      const index = button.getAttribute('data-index');
      showEditPopup(index);
    });
  });
}

// Show edit popup
function showEditPopup(index) {
  const product = infoProduct[index];

  // Populate popup fields
  document.getElementById('edit-product').value = product.productName;
  document.getElementById('edit-price').value = product.priceProduct;
  document.getElementById('edit-note').value = product.note;

  const popup = document.getElementById('edit-popup');
  popup.classList.remove('hidden');

  // Save changes
  document.getElementById('save-edit').onclick = () => {
    const updatedProduct = document.getElementById('edit-product').value;
    const updatedPrice = parseFloat(document.getElementById('edit-price').value) || product.priceProduct;
    const updatedNote = document.getElementById('edit-note').value;

    if (updatedProduct.trim() === '') {
      document.getElementById('edit-product-alert').classList.remove('hidden');
      return;
    }

    // Update product
    infoProduct[index] = {
      productName: updatedProduct,
      priceProduct: updatedPrice,
      note: updatedNote
    };

    localStorage.setItem("infoProduct", JSON.stringify(infoProduct));
    popup.classList.add('hidden');
    infoContainer();
  };

  // Cancel editing
  document.getElementById('cancel-edit').onclick = () => {
    popup.classList.add('hidden');
  };
}

function deleteProduct(index) {
  infoProduct.splice(index, 1);
  localStorage.setItem('infoProduct', JSON.stringify(infoProduct));
  infoContainer();
  disabledSubmitBtn();
}

// Webhook  
function send() {
  const webhookUrl = "https://script.google.com/macros/s/AKfycbw0OpUPRvtNVngU5vKn8lSvey6znAlYuSfmuYo-JfVlHvsHkRIph5VRLUl2CQ_oAwFh/exec";
  const codeBalance = `=INDIRECT("F" & ROW()-1) - INDIRECT("C" & ROW())`;

  if (infoProduct.length > 0) {
    // เตรียมข้อมูลสำหรับการส่ง
    infoProduct.forEach(item => {
      const payload = JSON.stringify({
        date: item.date,
        productName: item.productName,
        priceProduct: item.priceProduct,
        note: item.note,
        codeBalance: codeBalance
      });

      fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload
      })
        .then(() => {
          console.log('Data sent successfully!');
          showToast('บันทึกข้อมูลรายจ่ายเสร็จสิ้น', 'info');
        })
        .catch(error => {
          console.error('Error sending data:', error);
          showToast('เกิดข้อผิดพลาดในการส่งข้อมูล', 'error');
        });
    });

    // แสดงข้อความกำลังบันทึก
    showToast('กำลังบันทึกข้อมูลรายจ่าย', 'warning');
    infoProduct = [];
    localStorage.removeItem('infoProduct');
    infoContainer();
    disabledSubmitBtn();
  } else {
    showToast('ไม่มีข้อมูลที่ต้องส่ง', 'info');
  }
}

// toast notifination
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');

  const toastItem = document.createElement('div');
  toastItem.classList.add(
    'toast-item',
    'flex',
    'items-center',
    'justify-between',
    'space-x-4',
    'py-4',
    'px-6',
    'rounded-lg',
    'shadow-lg',
    'transition-all',
    'duration-300',
    'ease-in-out',
    'opacity-0',
    'transform',
    'translate-x-full'
  );

  switch (type) {
    case 'success':
      toastItem.classList.add('bg-green-500');
      break;
    case 'error':
      toastItem.classList.add('bg-red-500');
      break;
    case 'info':
      toastItem.classList.add('bg-blue-500');
      break;
    case 'warning':
      toastItem.classList.add('bg-yellow-500');
      break;
  }

  const messageElement = document.createElement('span');
  messageElement.classList.add('toast-message', 'text-white', 'text-lg', 'flex-1');
  messageElement.textContent = message;

  toastItem.appendChild(messageElement);

  const closeButton = document.createElement('button');
  closeButton.classList.add('close-toast', 'text-white', 'hover:text-gray-200', 'focus:outline-none');
  closeButton.innerHTML = `
    <i class="fa-solid fa-xmark text-xl cursor-pointer"></i>
  `;
  closeButton.onclick = () => {
    toastItem.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => {
      toastItem.remove();
    }, 300);
  };

  toastItem.appendChild(closeButton);
  container.appendChild(toastItem);

  setTimeout(() => {
    toastItem.classList.remove('opacity-0', 'translate-x-full');
    toastItem.classList.add('opacity-100', 'translate-x-0');
  }, 100);

  setTimeout(() => {
    toastItem.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => {
      toastItem.remove();
    }, 300);
  }, 4000);
}

// toggle

let selected = localStorage.getItem('selected') === 'true';

// ค้นหาปุ่มที่ใช้เลือกแท็บ
const expensesTab = document.getElementById('expensesTab');
const incomeTab = document.getElementById('incomeTab');

// ฟังก์ชันเพื่อปรับตำแหน่งของ indicator
function updateIndicator() {
  const indicator = document.getElementById('indicator');
  if (selected) {
    indicator.classList.remove('left-1/2', '-ml-1', 'text-green-500');
    indicator.classList.add('left-1', 'text-blue-500', 'font-semibold');
    indicator.textContent = 'รายจ่าย';
  } else {
    indicator.classList.remove('left-1', 'text-blue-500', 'font-semibold');
    indicator.classList.add('left-1/2', '-ml-1', 'text-green-500');
    indicator.textContent = 'รายรับ';
  }
}

// ตั้งค่า event listeners ให้กับแท็บ
expensesTab.addEventListener('click', function () {
  selected = true;
  updateIndicator();
});

incomeTab.addEventListener('click', function () {
  selected = false;
  updateIndicator();
});

updateIndicator();

// Update form display function
function updateFormDisplay() {
  const expensesForm = document.getElementById('expenses-form');
  const incomeForm = document.getElementById('income-form');

  if (selected) {
    expensesForm.style.display = 'block';
    incomeForm.style.display = 'none';
  } else {
    expensesForm.style.display = 'none';
    incomeForm.style.display = 'block';
  }
}

// Event listeners for tabs
expensesTab.addEventListener('click', function () {
  selected = true;
  localStorage.setItem('selected', selected);
  updateIndicator();
  updateFormDisplay();
});

incomeTab.addEventListener('click', function () {
  selected = false;
  localStorage.setItem('selected', selected);
  updateIndicator();
  updateFormDisplay();
});

updateIndicator();
updateFormDisplay();

// Submit receive form
document.getElementById("submit-receive").addEventListener("click", () => {
  const receiverName = document.getElementById("itemName").value.trim();
  const amount = document.getElementById("amount").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!validateForm(receiverName, amount)) {
    return;
  }

  let today = new Date();
  let formattedDate = (today.getDate().toString().padStart(2, '0')) + '/' +
    (today.getMonth() + 1).toString().padStart(2, '0') + '/' +
    today.getFullYear();
  // Save the received data
  const receivedData = {
    date: formattedDate,
    itemName: receiverName,
    amount: parseFloat(amount),
    description: description
  };

  // Store this data in localStorage
  let receivedProducts = JSON.parse(localStorage.getItem("receivedProducts")) || [];
  receivedProducts.push(receivedData);
  localStorage.setItem("receivedProducts", JSON.stringify(receivedProducts));

  // Clear the form
  document.getElementById("itemName").value = "";
  document.getElementById("amount").value = "";
  document.getElementById("description").value = "";

  // Send income data
  sendIncome(receivedData);
});

function validateForm(receiverName, amount) {
  if (receiverName === "") {
    document.getElementById("receiver-alert").classList.remove("hidden");
    document.getElementById("itemName").focus();
    return false;
  } else {
    document.getElementById("receiver-alert").classList.add("hidden");
  }

  if (amount === "" || isNaN(amount) || amount <= 0) {
    document.getElementById("amount-alert").classList.remove("hidden");
    document.getElementById("amount").focus();
    return false;
  } else {
    document.getElementById("amount-alert").classList.add("hidden");
  }

  return true;
}

function sendIncome(receivedData) {
  const webhookUrl = "https://script.google.com/macros/s/AKfycbw0OpUPRvtNVngU5vKn8lSvey6znAlYuSfmuYo-JfVlHvsHkRIph5VRLUl2CQ_oAwFh/exec";
  const codeBalance = `=INDIRECT("F" & ROW()-1) + INDIRECT("D" & ROW())`;
  const payload = JSON.stringify({
    date: receivedData.date,
    amount: receivedData.amount,
    itemName: receivedData.itemName,
    description: receivedData.description,
    codeBalance: codeBalance
  });

  showToast('กำลังบันทึกข้อมูลรายจ่าย', 'warning');
  fetch(webhookUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload
  })
    .then(() => {
      console.log('Data sent successfully!');
      showToast('ส่งข้อมูลรายรับเสร็จสิ้น', 'info');
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

// Add close functionality for receiver alert
document.querySelector("#receiver-alert i").addEventListener("click", () => {
  document.getElementById("receiver-alert").classList.add("hidden");
});

// Add close functionality for amount alert
document.querySelector("#amount-alert i").addEventListener("click", () => {
  document.getElementById("amount-alert").classList.add("hidden");
});
