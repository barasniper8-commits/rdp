const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN, {
  handlerTimeout: 30000
});

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

  const teks =
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

  return { teks, keyboard };
};

const daftarBlok = {
  kat_fitur_utama: {
    judul: 'FITUR UTAMA',
    sub: 'Akses fitur inti & perintah cepat',
    rows: [
      ['Modul 1', 'Aktif'],
      ['Modul 2', 'Aktif'],
      ['Respon', 'Instant']
    ]
  },
  kat_tools: {
    judul: 'TOOLS',
    sub: 'Utilitas & pengecekan sistem',
    rows: [
      ['Cek ID', 'Tersedia'],
      ['Ping Check', 'Tersedia']
    ]
  },
  kat_fun: {
    judul: 'FUN & GAMES',
    sub: 'Hiburan & mini interaksi',
    rows: [
      ['Random Pick', 'Ready'],
      ['Quick Quiz', 'Ready']
    ]
  },
  kat_control: {
    judul: 'CONTROL CENTER',
    sub: 'Pengaturan & diagnosa bot',
    rows: [
      ['Webhook', 'Connected'],
      ['Runtime', 'Serverless']
    ]
  },
  kat_group: {
    judul: 'JAGA GROUP',
    sub: 'Moderasi & utilitas grup',
    rows: [
      ['Auto Info', 'Standby'],
      ['Welcome', 'Standby']
    ]
  },
  kat_market: {
    judul: 'MARKET',
    sub: 'Katalog layanan & informasi paket',
    rows: [
      ['Paket A', 'Tersedia'],
      ['Paket B', 'Tersedia']
    ]
  },
  kat_dev: {
    judul: 'DEVELOPMENT',
    sub: 'Info build & integrasi sistem',
    rows: [
      ['Engine', 'Telegraf'],
      ['Deploy', 'Vercel']
    ]
  },
  kat_request: {
    judul: 'REQUEST FITUR',
    sub: 'Ajukan ide fitur atau layanan baru',
    rows: [
      ['Status', 'Terbuka'],
      ['Tujuan', 'Admin']
    ]
  },
  kat_lapor: {
    judul: 'LAPOR',
    sub: 'Laporkan bug, error, atau kendala',
    rows: [
      ['Saluran', 'Langsung'],
      ['Prioritas', 'Cepat']
    ]
  }
};

bot.start(async (ctx) => {
  const nama = ctx.from?.first_name || 'User';
  const { teks, keyboard } = getMenuUtama(nama);
  await ctx.reply(teks, { parse_mode: 'HTML', ...keyboard });
});

bot.action('menu_home', async (ctx) => {
  await ctx.answerCbQuery('Diperbarui...').catch(() => {});
  const nama = ctx.from?.first_name || 'User';
  const { teks, keyboard } = getMenuUtama(nama);
  await ctx.editMessageText(teks, { parse_mode: 'HTML', ...keyboard }).catch(async () => {
    await ctx.reply(teks, { parse_mode: 'HTML', ...keyboard });
  });
});

bot.action(Object.keys(daftarBlok), async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  const item = daftarBlok[ctx.match[0]];
  const tabel = buatTabelInfo(item.rows);

  const teks =
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

  await ctx.editMessageText(teks, { parse_mode: 'HTML', ...keyboard }).catch(async () => {
    await ctx.reply(teks, { parse_mode: 'HTML', ...keyboard });
  });
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
