let packages = JSON.parse(localStorage.getItem("packages")) || [];
// Dodawanie paczki
function addPackage() {
 const courier = document.getElementById("courier").value.trim();
 const supplier = document.getElementById("supplier").value.trim();
 const receiver = document.getElementById("receiver").value.trim();
 if (!courier || !supplier || !receiver) {
   alert("Wszystkie pola muszą być wypełnione!");
   return;
 }
 const now = new Date();
 const newPackage = {
   courier,
   supplier,
   receiver,
   addedAt: now.toLocaleString(),
   receivedAt: null,
   receivedBy: null,
   received: false,
 };
 packages.push(newPackage);
 savePackages();
 updateFilters();
 renderPackages();
 clearForm();
}
// Oznaczanie paczki jako odebranej
function markAsReceived(index) {
 const confirmation = prompt("Potwierdź odbiór paczki, wpisując swoje imię:");
 if (confirmation) {
   const now = new Date();
   packages[index].received = true;
   packages[index].receivedAt = now.toLocaleString();
   packages[index].receivedBy = confirmation;
   savePackages();
   renderPackages();
 }
}
// Rejestracja Service Workera
if ('serviceWorker' in navigator) {
 window.addEventListener('load', () => {
   navigator.serviceWorker.register('/service-worker.js')
     .then((registration) => {
       console.log('Service Worker zarejestrowany: ', registration);
     })
     .catch((error) => {
       console.log('Rejestracja Service Workera nie powiodła się: ', error);
     });
 });
}
// Zapisywanie paczek do localStorage
function savePackages() {
 localStorage.setItem("packages", JSON.stringify(packages));
}
// Czyszczenie formularza
function clearForm() {
 document.getElementById("courier").value = "";
 document.getElementById("supplier").value = "";
 document.getElementById("receiver").value = "";
}
// Renderowanie paczek
function renderPackages() {
 const packageList = document.getElementById("packageList");
 const historyList = document.getElementById("historyList");
 const searchQuery = document.getElementById("search").value.trim().toLowerCase();
 const filterSupplier = document.getElementById("filterSupplier").value;
 const filterReceiver = document.getElementById("filterReceiver").value;
 packageList.innerHTML = "";
 historyList.innerHTML = "";
 packages.forEach((pkg, index) => {
   const matchQuery =
     pkg.courier.toLowerCase().includes(searchQuery) ||
     pkg.supplier.toLowerCase().includes(searchQuery) ||
     pkg.receiver.toLowerCase().includes(searchQuery);
   const matchSupplier = filterSupplier === "" || pkg.supplier === filterSupplier;
   const matchReceiver = filterReceiver === "" || pkg.receiver === filterReceiver;
   if (matchQuery && matchSupplier && matchReceiver) {
     if (!pkg.received) {
       const row = document.createElement("tr");
       row.innerHTML = `
<td>${pkg.courier}</td>
<td>${pkg.supplier}</td>
<td>${pkg.receiver}</td>
<td>${pkg.addedAt}</td>
<td><button onclick="markAsReceived(${index})">Odbierz</button></td>
       `;
       packageList.appendChild(row);
     } else {
       const row = document.createElement("tr");
       row.innerHTML = `
<td>${pkg.courier}</td>
<td>${pkg.supplier}</td>
<td>${pkg.receiver}</td>
<td>${pkg.addedAt}</td>
<td>${pkg.receivedAt}</td>
<td>${pkg.receivedBy || "Nieznany"}</td>
       `;
       historyList.appendChild(row);
     }
   }
 });
}
// Aktualizacja filtrów
function updateFilters() {
 const suppliers = [...new Set(packages.map(pkg => pkg.supplier))];
 const receivers = [...new Set(packages.map(pkg => pkg.receiver))];
 const supplierFilter = document.getElementById("filterSupplier");
 const receiverFilter = document.getElementById("filterReceiver");
 supplierFilter.innerHTML = '<option value="">Wszyscy</option>';
 receiverFilter.innerHTML = '<option value="">Wszyscy</option>';
 suppliers.forEach(supplier => {
   const option = document.createElement("option");
   option.value = supplier;
   option.textContent = supplier;
   supplierFilter.appendChild(option);
 });
 receivers.forEach(receiver => {
   const option = document.createElement("option");
   option.value = receiver;
   option.textContent = receiver;
   receiverFilter.appendChild(option);
 });
}
// Czyszczenie wszystkich danych
function clearAllData() {
 if (confirm("Czy na pewno chcesz usunąć wszystkie dane?")) {
   packages = [];
   savePackages();
   updateFilters();
   renderPackages();
 }
}
// Eksport do Excela
function exportToExcel() {
 const wb = XLSX.utils.book_new();
 const wsData = [["Kurier", "Dostawca", "Odbierający", "Data Dodania", "Data Odbioru", "Kto Odebrał"]];
 packages.forEach(pkg => {
   wsData.push([pkg.courier, pkg.supplier, pkg.receiver, pkg.addedAt, pkg.receivedAt, pkg.receivedBy]);
 });
 const ws = XLSX.utils.aoa_to_sheet(wsData);
 XLSX.utils.book_append_sheet(wb, ws, "Paczki");
 XLSX.writeFile(wb, "Paczki.xlsx");
}
// Eksport do Worda
function exportToWord() {
 const { Document, Packer, Paragraph, Table, TableRow, TableCell } = docx;
 const doc = new Document();
 const tableRows = [
   new TableRow({
     children: [
       new TableCell({ children: [new Paragraph("Kurier")] }),
       new TableCell({ children: [new Paragraph("Dostawca")] }),
       new TableCell({ children: [new Paragraph("Odbierający")] }),
       new TableCell({ children: [new Paragraph("Data Dodania")] }),
       new TableCell({ children: [new Paragraph("Data Odbioru")] }),
       new TableCell({ children: [new Paragraph("Kto Odebrał")] }),
     ],
   }),
 ];
 packages.forEach(pkg => {
   tableRows.push(
     new TableRow({
       children: [
         new TableCell({ children: [new Paragraph(pkg.courier)] }),
         new TableCell({ children: [new Paragraph(pkg.supplier)] }),
         new TableCell({ children: [new Paragraph(pkg.receiver)] }),
         new TableCell({ children: [new Paragraph(pkg.addedAt)] }),
         new TableCell({ children: [new Paragraph(pkg.receivedAt || "-")] }),
         new TableCell({ children: [new Paragraph(pkg.receivedBy || "-")] }),
       ],
     })
   );
 });
 const table = new Table({ rows: tableRows });
 doc.addSection({ children: [table] });
 Packer.toBlob(doc).then(blob => {
   saveAs(blob, "Paczki.docx");
 });
}
// Inicjalizacja i eventy
document.getElementById("addPackage").addEventListener("click", addPackage);
document.getElementById("search").addEventListener("input", renderPackages);
document.getElementById("filterSupplier").addEventListener("change", renderPackages);
document.getElementById("filterReceiver").addEventListener("change", renderPackages);
document.getElementById("clearData").addEventListener("click", clearAllData);
document.getElementById("exportExcel").addEventListener("click", exportToExcel);
document.getElementById("exportWord").addEventListener("click", exportToWord);
// Inicjalizacja aplikacji
updateFilters();
renderPackages();