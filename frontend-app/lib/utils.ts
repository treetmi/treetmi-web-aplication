import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format raw number/string to thousand separated string (e.g. 10000 -> "10.000")
export const formatNumberInput = (value: string | number): string => {
  if (value === undefined || value === null || value === '') return ''
  const clean = String(value).replace(/\D/g, '')
  if (!clean) return ''
  return Number(clean).toLocaleString('id-ID')
}

// Parse thousand separated string back to raw number (e.g. "10.000" -> 10000)
export const parseNumberInput = (value: string): number => {
  const clean = value.replace(/\D/g, '')
  return clean ? Number(clean) : 0
}

// Open and print a beautiful premium layout Payout Invoice
export function printPayoutInvoice(w: any, profile: any = null) {
  const invoiceId = `INV-WD-${(w.id || "").substring(0, 8).toUpperCase()}`
  
  // Check if user has uploaded a custom logo url in localStorage
  const savedLogoUrl = typeof window !== "undefined" ? localStorage.getItem("treetmi_logo_url") : null
  const logoHtml = savedLogoUrl 
    ? `<img src="${savedLogoUrl}" alt="Logo" style="max-height: 55px; max-width: 240px; object-fit: contain; border-radius: 8px;" />`
    : `<div class="logo"><span class="brand-highlight">treetmi</span>.id</div>`
  const creatorName = w.creator || profile?.username || "kreator"
  const dateStr = w.date || new Date(w.createdAt || Date.now()).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })

  const bankName = w.bankName || profile?.bank_account?.bank_name || "BCA"
  const accountNo = w.accountNo || profile?.bank_account?.account_number || "-------"
  const holderName = w.holder || profile?.bank_account?.account_holder_name || creatorName
  
  const amountRequested = Number(w.amount || w.amount_requested || 0)
  const fee = Number(w.disbursement_fee || 5000)
  const netReceived = amountRequested - fee

  // Status badges & text
  let statusText = "MENUNGGU (PENDING)"
  let statusColor = "#d97706" // Amber
  let statusBg = "#fef3c7"
  let statusStamp = "PENDING"
  let stampBorder = "rgba(217, 119, 6, 0.4)"

  if (w.status === "SUCCESS") {
    statusText = "LUNAS (PAID / SUCCESS)"
    statusColor = "#059669" // Emerald
    statusBg = "#d1fae5"
    statusStamp = "PAID"
    stampBorder = "rgba(5, 150, 105, 0.4)"
  } else if (w.status === "FAILED") {
    statusText = "GAGAL / DITOLAK (FAILED)"
    statusColor = "#dc2626" // Red
    statusBg = "#fee2e2"
    statusStamp = "FAILED"
    stampBorder = "rgba(220, 38, 38, 0.4)"
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice Payout ${invoiceId}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800;900&family=Share+Tech+Mono&display=swap');
        body {
          font-family: 'Outfit', sans-serif;
          color: #1a1a1a;
          background: #ffffff;
          margin: 0;
          padding: 40px;
          line-height: 1.5;
        }
        .invoice-box {
          max-width: 800px;
          margin: auto;
          border: 2px solid #eaeaea;
          border-radius: 24px;
          padding: 40px;
          position: relative;
          background: #fff;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px dashed #eaeaea;
          padding-bottom: 30px;
          margin-bottom: 30px;
        }
        .logo {
          font-weight: 900;
          font-style: italic;
          font-size: 28px;
          letter-spacing: -1.5px;
          color: #000;
        }
        .logo .brand-highlight {
          background: #FFD551;
          color: #000;
          padding: 2px 8px;
          border-radius: 6px;
          text-transform: uppercase;
          margin-right: 2px;
        }
        .invoice-title {
          text-align: right;
        }
        .invoice-title h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 900;
          font-style: italic;
          color: #000;
        }
        .invoice-title p {
          margin: 5px 0 0 0;
          font-family: 'Share Tech Mono', monospace;
          color: #666;
          font-size: 14px;
        }
        .details-grid {
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }
        .section-title {
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #999;
          margin-bottom: 12px;
          border-left: 3px solid #FFD551;
          padding-left: 8px;
        }
        .detail-card {
          background: #fafaf9;
          border: 1px solid #f0f0ee;
          border-radius: 16px;
          padding: 20px;
        }
        .detail-card p {
          margin: 6px 0;
          font-size: 14px;
          font-weight: 600;
        }
        .detail-card span {
          font-weight: 400;
          color: #666;
        }
        .detail-card .highlight {
          font-family: 'Share Tech Mono', monospace;
          font-weight: bold;
          color: #000;
        }
        .table-box {
          margin-bottom: 40px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        th {
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          color: #999;
          padding: 12px 15px;
          border-bottom: 2px solid #eaeaea;
        }
        td {
          padding: 18px 15px;
          border-bottom: 1px solid #fafaf9;
          font-size: 14px;
          font-weight: 600;
        }
        .amount-col {
          text-align: right;
        }
        .summary-box {
          display: flex;
          justify-content: flex-end;
          border-top: 2px solid #eaeaea;
          padding-top: 20px;
        }
        .summary-table {
          width: 300px;
        }
        .summary-table td {
          padding: 8px 0;
          border: none;
        }
        .summary-table .total-row td {
          font-size: 18px;
          font-weight: 900;
          font-style: italic;
          color: #000;
          padding-top: 15px;
          border-top: 2px solid #000;
        }
        .status-badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 12px;
          font-weight: 900;
          font-style: italic;
          text-transform: uppercase;
          color: ${statusColor};
          background: ${statusBg};
          border: 1px solid ${statusColor}33;
        }
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-15deg);
          font-size: 120px;
          font-weight: 900;
          font-style: italic;
          color: ${statusColor}0b;
          letter-spacing: 10px;
          border: 10px solid ${stampBorder};
          padding: 10px 40px;
          border-radius: 30px;
          pointer-events: none;
          text-transform: uppercase;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #999;
          font-weight: 600;
          font-style: italic;
          border-top: 1px solid #eaeaea;
          padding-top: 20px;
        }
        .print-btn {
          display: block;
          width: 120px;
          margin: 30px auto 0 auto;
          background: #000;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 900;
          font-style: italic;
          cursor: pointer;
          transition: background 0.2s;
          text-align: center;
        }
        .print-btn:hover {
          background: #222;
        }
        @media print {
          body {
            padding: 0;
          }
          .invoice-box {
            border: none;
            box-shadow: none;
            padding: 0;
          }
          .print-btn {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="watermark">${statusStamp}</div>
        
        <div class="header">
          ${logoHtml}
          <div class="invoice-title">
            <h1>BUKTI PENARIKAN SALDO</h1>
            <p>${invoiceId}</p>
          </div>
        </div>

        <div class="details-grid">
          <div>
            <div class="section-title">Informasi Penerima</div>
            <div class="detail-card">
              <p><span>Username:</span> @${creatorName}</p>
              <p><span>Tujuan Transfer:</span> ${bankName}</p>
              <p><span>No. Rekening:</span> <span class="highlight">${accountNo}</span></p>
              <p><span>Nama Pemilik:</span> ${holderName}</p>
            </div>
          </div>
          <div>
            <div class="section-title">Rincian Transaksi</div>
            <div class="detail-card">
              <p><span>Tanggal Pengajuan:</span> ${dateStr}</p>
              <p><span>Status Payout:</span> <span class="status-badge">${statusText}</span></p>
              <p><span>Sistem Asal:</span> treetmi.id Creator Platform</p>
            </div>
          </div>
        </div>

        <div class="table-box">
          <div class="section-title">Detail Pencairan</div>
          <table>
            <thead>
              <tr>
                <th>Deskripsi Item</th>
                <th class="amount-col">Nominal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Penarikan Saldo Dompet Kreator (${invoiceId})</td>
                <td class="amount-col font-bold">Rp ${amountRequested.toLocaleString("id-ID")}</td>
              </tr>
              <tr>
                <td>Biaya Layanan Pencairan Dana (Disbursement Fee)</td>
                <td class="amount-col text-red-500 font-bold">- Rp ${fee.toLocaleString("id-ID")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="summary-box">
          <table class="summary-table">
            <tr>
              <td class="font-bold text-slate-400">Total Pengajuan:</td>
              <td class="amount-col font-bold">Rp ${amountRequested.toLocaleString("id-ID")}</td>
            </tr>
            <tr>
              <td class="font-bold text-slate-400">Biaya Administrasi:</td>
              <td class="amount-col text-red-500 font-bold">- Rp ${fee.toLocaleString("id-ID")}</td>
            </tr>
            <tr class="total-row">
              <td>Total Diterima (Net):</td>
              <td class="amount-col">Rp ${netReceived.toLocaleString("id-ID")}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Terima kasih telah berkarya bersama treetmi.id. Simpan bukti pembayaran digital ini sebagai dokumen sah.</p>
          <p>&copy; ${new Date().getFullYear()} treetmi.id - Platform Dukungan Kreator Terbesar di Indonesia.</p>
        </div>
      </div>
      
      <button class="print-btn" onclick="window.print()">Cetak Invoice</button>
      
      <script>
        window.addEventListener('load', () => {
          setTimeout(() => {
            window.print();
          }, 500);
        });
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    alert("Pop-up diblokir oleh browser! Silakan izinkan pop-up untuk mencetak invoice.");
  }
}

