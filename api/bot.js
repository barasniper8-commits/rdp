// ==========================================
// 1. KONFIGURASI & HELPER TELEGRAM API
// ==========================================
const BOT_TOKEN = process.env.BOT_TOKEN;

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
// 2. FORMAT TABEL & MENU BLOK KATEGORI
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
        { text: 'Cek ID', callback_data: 'aksi_id' },
        { text: 'Refresh', callback_data: 'blok_home' }
      ]
    ]
  };

  return { text, parse_mode: 'HTML', reply_markup };
}

const DATA_BLOK = {
  blok_fitur: {
    judul: 'FITUR UTAMA',
    sub: 'Akses fitur inti & perintah cepat',
    rows: [
      ['Modul 1', 'Aktif'],
      ['Modul 2', 'Aktif'],
      ['Respon', 'Instant']
    ]
  },
  blok_tools: {
    judul: 'TOOLS',
    sub: 'Utilitas & pengecekan sistem',
    rows: [
      ['Cek ID', 'Tersedia'],
      ['Ping Check', 'Tersedia']
    ]
  },
  blok_group: {
    judul: 'JAGA GROUP',
    sub: 'Moderasi & utilitas grup',
    rows: [
      ['Auto Info', 'Standby'],
      ['Welcome', 'Standby']
    ]
  },
  blok_market: {
    judul: 'MARKET',
    sub: 'Katalog layanan & informasi paket',
    rows: [
      ['Paket A', 'Tersedia'],
      ['Paket B', 'Tersedia']
    ]
  }
};

function menuBlok(key) {
  const item = DATA_BLOK[key];
  const text =
    `<b>${item.judul}</b>\n` +
    `<i>${item.sub}</i>\n\n` +
    `${buatTabel(item.rows)}\n\n` +
    `<blockquote>Gunakan tombol di bawah untuk kembali ke menu utama.</blockquote>`;

  const reply_markup = {
    inline_keyboard: [
      [
        { text: 'Cek ID Saya', callback_data: 'aksi_id' },
        { text: '⬅️ Kembali', callback_data: 'blok_home' }
      ]
    ]
  };

  return { text, parse_mode: 'HTML', reply_markup };
}

// ==========================================
// 3. HANDLER WEBHOOK VERCEL
// ==========================================
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(200).send('Bot Telegram Aktif 24 Jam di Vercel!');
  }

  try {
    const update = req.body || {};

    // Handler pesan (/start atau teks lain)
    if (update.message && update.message.chat) {
      const chatId = update.message.chat.id;
      const nama = update.message.from?.first_name || 'User';
      const payload = menuAwal(nama);

      await telegramApi('sendMessage', {
        chat_id: chatId,
        ...payload
      });
    }

    // Handler klik tombol inline
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message?.chat?.id;
      const messageId = cb.message?.message_id;
      const data = cb.data;
      const userId = cb.from?.id;
      const nama = cb.from?.first_name || 'User';

      if (data === 'aksi_id') {
        await telegramApi('answerCallbackQuery', {
          callback_query_id: cb.id,
          text: `ID Telegram kamu: ${userId}`,
          show_alert: true
        });
      } else if (data === 'blok_home') {
        const payload = menuAwal(nama);
        await telegramApi('answerCallbackQuery', {
          callback_query_id: cb.id,
          text: 'Diperbarui...'
        });
        if (chatId && messageId) {
          await telegramApi('editMessageText', {
            chat_id: chatId,
            message_id: messageId,
            ...payload
          });
        }
      } else if (DATA_BLOK[data]) {
        const payload = menuBlok(data);
        await telegramApi('answerCallbackQuery', {
          callback_query_id: cb.id
        });
        if (chatId && messageId) {
          await telegramApi('editMessageText', {
            chat_id: chatId,
            message_id: messageId,
            ...payload
          });
        }
      } else {
        await telegramApi('answerCallbackQuery', {
          callback_query_id: cb.id
        });
      }
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook Error:', err);
    return res.status(200).send('OK');
  }
};
