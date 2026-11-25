const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN, {
  handlerTimeout: 30000
});

const BANNER = {
  UTAMA: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1280&auto=format&fit=crop',
  KAT: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1280&auto=format&fit=crop',
  FITUR: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1280&auto=format&fit=crop'
};

const buatTabelInfo = (rows) => {
  const col1Width = 14;
  const col2Width = 14;
  const line = `+${'-'.repeat(col1Width + 2)}+${'-'.repeat(col2Width + 2)}+`;
  const header = `| ${'SYSTEM'.padEnd(col1Width)} | ${'DETAIL'.padEnd(col2Width)} |`;

  const body = rows
    .map(([k, v]) => {
      const kiri = String(k).slice(0, col1Width).padEnd(col1Width);
      const kanan = String(v).slice(0, col2Width).padEnd(col2Width);
      return `| ${kiri} | ${kanan} |`;
    })
    .join('\n');

  return `<pre>${line}\n${header}\n${line}\n${body}\n${line}</pre>`;
};

const getMenuUtama = (namaUser) => {
  const waktuWIB = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  const tabel = buatTabelInfo([
    ['Version', '7.0.0'],
    ['Hosting', 'Vercel 24/7'],
    ['Server Time', waktuWIB.slice(0, 16)],
    ['Mode', 'Webhook'],
    ['Status', 'Online']
  ]);

  const caption =
    `Welcome, <b>${namaUser}</b> ©\n` +
    `<i>All-in-one assistant untuk kategori, tools, info & kontrol cepat.</i>\n\n` +
    `<b>SYSTEM INFORMATION</b>\n` +
    `${tabel}\n\n` +
    `<blockquote>⚡ System Online • Pilih blok kategori atau fitur di bawah</blockquote>`;

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('Fitur Utama', 'kat_fitur_utama'),
      Markup.button.callback('Tools', 'kat_tools')
    ],
    [Markup.button.callback('Fun & Games', 'kat_fun')],
    [Markup.button.callback('Control Center', 'kat_control')],
    [
      Markup.button.callback('Jaga Group', 'kat_group'),
      Markup.button.callback('Market', 'kat_market')
    ],
    [
      Markup.button.callback('Development', 'kat_dev'),
      Markup.button.callback('Request Fitur', 'kat_request')
    ],
    [Markup.button.callback('Lapor', 'kat_lapor')],
    [
      Markup.button.callback('Refresh', 'menu_home'),
      Markup.button.url('Channel', 'https://t.me/telegram')
    ]
  ]);

  return { caption, keyboard };
};

// Helper retry ringan untuk mengatasi socket hang up sesaat
async function jalankanDenganRetry(fn, percobaan = 2) {
  let errorTerakhir;
  for (let i = 0; i < percobaan; i++) {
    try {
      return await fn();
    } catch (err) {
      errorTerakhir = err;
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  throw errorTerakhir;
}

const kirimMenuAwal = async (ctx) => {
  const nama = ctx.from?.first_name || 'User';
  const { caption, keyboard } = getMenuUtama(nama);

  try {
    await jalankanDenganRetry(() =>
      ctx.replyWithPhoto(BANNER.UTAMA, {
        caption,
        parse_mode: 'HTML',
        ...keyboard
      })
    );
  } catch (err) {
    console.error('Fallback kirim teks karena foto gagal:', err.message);
    await jalankanDenganRetry(() =>
      ctx.reply(caption, {
        parse_mode: 'HTML',
        ...keyboard
      })
    );
  }
};

const ubahMenuMedia = async (ctx, fotoUrl, caption, keyboard) => {
  try {
    await jalankanDenganRetry(() =>
      ctx.editMessageMedia(
        {
          type: 'photo',
          media: fotoUrl,
          caption,
          parse_mode: 'HTML'
        },
        keyboard
      )
    );
  } catch (err) {
    console.error('Fallback edit/kirim pesan:', err.message);
    try {
      await ctx.editMessageCaption(caption, {
        parse_mode: 'HTML',
        ...keyboard
      });
    } catch (_) {
      await ctx.reply(caption, {
        parse_mode: 'HTML',
        ...keyboard
      });
    }
  }
};

bot.start(kirimMenuAwal);

bot.action('menu_home', async (ctx) => {
  await ctx.answerCbQuery('Diperbarui...').catch(() => {});
  const nama = ctx.from?.first_name || 'User';
  const { caption, keyboard } = getMenuUtama(nama);
  await ubahMenuMedia(ctx, BANNER.UTAMA, caption, keyboard);
});

const daftarBlok = {
  kat_fitur_utama: {
    judul: 'FITUR UTAMA',
    sub: 'Akses fitur inti & perintah cepat',
    rows: [
      ['Modul 1', 'Aktif'],
      ['Modul 2', 'Aktif'],
      ['Respon', 'Instant']
    ],
    banner: BANNER.FITUR
  },
  kat_tools: {
    judul: 'TOOLS',
    sub: 'Utilitas & pengecekan sistem',
    rows: [
      ['Cek ID', 'Tersedia'],
      ['Ping Check', 'Tersedia']
    ],
    banner: BANNER.FITUR
  },
  kat_fun: {
    judul: 'FUN & GAMES',
    sub: 'Hiburan & mini interaksi',
    rows: [
      ['Random Pick', 'Ready'],
      ['Quick Quiz', 'Ready']
    ],
    banner: BANNER.KAT
  },
  kat_control: {
    judul: 'CONTROL CENTER',
    sub: 'Pengaturan & diagnosa bot',
    rows: [
      ['Webhook', 'Connected'],
      ['Runtime', 'Serverless']
    ],
    banner: BANNER.FITUR
  },
  kat_group: {
    judul: 'JAGA GROUP',
    sub: 'Moderasi & utilitas grup',
    rows: [
      ['Auto Info', 'Standby'],
      ['Welcome', 'Standby']
    ],
    banner: BANNER.KAT
  },
  kat_market: {
    judul: 'MARKET',
    sub: 'Katalog layanan & informasi paket',
    rows: [
      ['Paket A', 'Tersedia'],
      ['Paket B', 'Tersedia']
    ],
    banner: BANNER.KAT
  },
  kat_dev: {
    judul: 'DEVELOPMENT',
    sub: 'Info build & integrasi sistem',
    rows: [
      ['Engine', 'Telegraf'],
      ['Deploy', 'Vercel']
    ],
    banner: BANNER.FITUR
  },
  kat_request: {
    judul: 'REQUEST FITUR',
    sub: 'Ajukan ide fitur atau layanan baru',
    rows: [
      ['Status', 'Terbuka'],
      ['Tujuan', 'Admin']
    ],
    banner: BANNER.KAT
  },
  kat_lapor: {
    judul: 'LAPOR',
    sub: 'Laporkan bug, error, atau kendala',
    rows: [
      ['Saluran', 'Langsung'],
      ['Prioritas', 'Cepat']
    ],
    banner: BANNER.KAT
  }
};

bot.action(Object.keys(daftarBlok), async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  const item = daftarBlok[ctx.match[0]];
  const tabel = buatTabelInfo(item.rows);

  const caption =
    `<b>${item.judul}</b>\n` +
    `<i>${item.sub}</i>\n\n` +
    `${tabel}\n\n` +
    `<blockquote>Gunakan tombol di bawah untuk aksi atau kembali ke menu utama.</blockquote>`;

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('Cek ID Saya', 'aksi_id'),
      Markup.button.callback('Ping Server', 'aksi_ping')
    ],
    [Markup.button.callback('⬅️ Kembali ke Menu Utama', 'menu_home')]
  ]);

  await ubahMenuMedia(ctx, item.banner, caption, keyboard);
});

bot.action('aksi_id', async (ctx) => {
  await ctx.answerCbQuery(`ID Telegram kamu: ${ctx.from.id}`, { show_alert: true }).catch(() => {});
});

bot.action('aksi_ping', async (ctx) => {
  await ctx.answerCbQuery('Webhook Vercel merespons normal!', { show_alert: true }).catch(() => {});
});

bot.catch((err) => {
  console.error('Telegraf Error:', err);
});

module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      await bot.handleUpdate(req.body);
      res.status(200).send('OK');
    } else {
      res.status(200).send('Bot Telegram Aktif 24 Jam di Vercel!');
    }
  } catch (err) {
    console.error('Webhook Error:', err);
    res.status(200).send('OK');
  }
};
