// ==========================================
// 1. INISIALISASI & KONFIGURASI AWAL
// ==========================================
const BOT_TOKEN = process.env.BOT_TOKEN;

// Helper memanggil Telegram Bot API langsung via fetch
async function telegramApi(method, payload) {
  if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN belum diatur di Environment Variables Vercel');
  }

  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    throw new Error(`Telegram API ${method} gagal: ${JSON.stringify(data)}`);
  }

  return data.result;
}

// ==========================================
// 2. FORMAT TABEL & BLOK TOMBOL AWAL
// ==========================================
function buatTabel(rows) {
  const w1 = 14;
  const w2 = 14;
  const garis = `+${'-'.repeat(w1 + 2)}+${'-'.repeat(w2 + 2)}+`;
  const head = `| ${'SYSTEM'.padEnd(w1)} | ${'DETAIL'.padEnd(w2)} |`;

  const isi = rows
    .map(([k, v]) => {
      const kiri = String(k).slice(0, w1).padEnd(w1);
      const kanan = String(v).slice(0, w2).padEnd(w2);
      return `| ${kiri} | ${kanan} |`;
    })
    .join('\n');

  return `<pre>${garis}\n${head}\n${garis}\n${isi}\n${garis}</pre>`;
}

function menuAwal(namaUser = 'User') {
  const waktuWIB = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  const text =
    `Welcome, <b>${namaUser}</b> ©\n` +
    `<i>All-in-one assistant untuk kategori, tools, info & kontrol cepat.</i>\n\n` +
    `<b>SYSTEM INFORMATION</b>\n` +
    `${buatTabel([
      ['Version', '7.0.0'],
      ['Hosting', 'Vercel 24/7'],
      ['Time WIB', waktuWIB.slice(0, 16)],
      ['Mode', 'Webhook'],
      ['Status', 'Online']
    ])}\n\n` +
    `<blockquote>⚡ Pilih blok kategori atau fitur di bawah</blockquote>`;

  const reply_markup = {
    inline_keyboard: [
      [
        { text: 'Fitur Utama', callback_data: 'blok_fitur' },
        { text: 'Tools', callback_data: 'blok_tools' }
      ],
      [
        { text: 'Jaga Group', callback_data: 'blok_group' },
        { text: 'Market', callback_data: 'blok_market' }
      ],
      [
        { text: 'Refresh', callback_data: 'blok_home' }
      ]
    ]
  };

  return { text, parse_mode: 'HTML', reply_markup };
}
