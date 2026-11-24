
const { Telegraf, Markup } = require('telegraf');

// Token diambil dari Environment Variables Vercel demi keamanan
const bot = new Telegraf(process.env.BOT_TOKEN);

// Link Gambar Landscape Full Layar (Rasio 16:9 - minimal 1280x720 px)
// Ganti dengan URL gambar banner milikmu sendiri
const BANNER = {
  HOME: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1280&auto=format&fit=crop',
  KATALOG: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1280&auto=format&fit=crop',
  FITUR: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1280&auto=format&fit=crop',
  INFO: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1280&auto=format&fit=crop'
};

// Fungsi untuk merapikan blok teks agar tampilan lebar & simetris di layar HP
const formatBlokTeks = (judul, kategori, deskripsi, catatan) => {
  return (
    `╔══════════════════════════╗\n` +
    `   ⚡ <b>${judul}</b>\n` +
    `╚══════════════════════════╝\n\n` +
    `📂 <b>KATEGORI :</b> <code>${kategori}</code>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `${deskripsi}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `💡 <i>${catatan}</i>`
  );
};

// ==========================================
// MENU UTAMA (/start)
// ==========================================
const getHomeMenu = (namaUser) => {
  const caption = formatBlokTeks(
    'DASHBOARD UTAMA SYSTEM',
    'MENU UTAMA • ONLINE 24/7',
    `Halo <b>${namaUser}</b>! 👋\n\nSelamat datang di pusat layanan otomatis. Silakan pilih blok kategori di bawah ini untuk mengakses fitur lengkap:`,
    'Server aktif 24 jam nonstop via Vercel Cloud.'
  );

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('🛒 KATEGORI LAYANAN', 'menu_katalog'),
      Markup.button.callback('⚙️ SEMUA FITUR', 'menu_fitur')
    ],
    [
      Markup.button.callback('📊 STATUS SERVER', 'menu_status'),
      Markup.button.callback('ℹ️ BANTUAN & INFO', 'menu_info')
    ],
    [
      Markup.button.url('🌐 BUKA WEB PORTAL', 'https://telegram.org'),
      Markup.button.url('💬 HUBUNGI ADMIN', 'https://t.me/username_kamu')
    ]
  ]);

  return { caption, keyboard };
};

// Trigger saat user mengetik /start
bot.start(async (ctx) => {
  const nama = ctx.from.first_name || 'User';
  const { caption, keyboard } = getHomeMenu(nama);

  await ctx.replyWithPhoto(BANNER.HOME, {
    caption: caption,
    parse_mode: 'HTML',
    ...keyboard
  });
});

// ==========================================
// HANDLER TOMBOL (Ganti Foto & Teks Tanpa Spam)
// ==========================================

// 1. Tombol Kembali ke Home
bot.action('menu_home', async (ctx) => {
  await ctx.answerCbQuery();
  const nama = ctx.from.first_name || 'User';
  const { caption, keyboard } = getHomeMenu(nama);

  await ctx.editMessageMedia(
    {
      type: 'photo',
      media: BANNER.HOME,
      caption: caption,
      parse_mode: 'HTML'
    },
    keyboard
  );
});

// 2. Blok Kategori Layanan
bot.action('menu_katalog', async (ctx) => {
  await ctx.answerCbQuery('Membuka Kategori...');
  const caption = formatBlokTeks(
    'BLOK KATEGORI LAYANAN',
    'KATALOG PRODUK & AKSES',
    `🔹 <b>[01] Paket Reguler</b>\n` +
    `└ Akses standar kecepatan tinggi.\n\n` +
    `🔹 <b>[02] Paket VIP / Pro</b>\n` +
    `└ Full akses prioritas tanpa batas.\n\n` +
    `🔹 <b>[03] Custom Request</b>\n` +
    `└ Pemesanan khusus sesuai kebutuhan.`,
    'Pilih salah satu kategori di bawah untuk detail.'
  );

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('📦 Paket Reguler', 'detail_reguler'),
      Markup.button.callback('👑 Paket VIP', 'detail_vip')
    ],
    [Markup.button.callback('🔙 KEMBALI KE MENU UTAMA', 'menu_home')]
  ]);

  await ctx.editMessageMedia(
    {
      type: 'photo',
      media: BANNER.KATALOG,
      caption: caption,
      parse_mode: 'HTML'
    },
    keyboard
  );
});

// 3. Blok Semua Fitur Lengkap
bot.action('menu_fitur', async (ctx) => {
  await ctx.answerCbQuery('Membuka Daftar Fitur...');
  const caption = formatBlokTeks(
    'PANEL KONTROL FITUR',
    'TOOLS & AUTOMATION',
    `✅ <b>Auto Responder 24 Jam</b>\n` +
    `✅ <b>Sistem Blok Kategori Dinamis</b>\n` +
    `✅ <b>Anti-Spam Media Edit</b>\n` +
    `✅ <b>Integrasi API & Webhook Cepat</b>`,
    'Klik tombol aksi cepat di bawah untuk mencoba.'
  );

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('⚡ Cek Ping', 'aksi_ping'),
      Markup.button.callback('🆔 Cek ID Saya', 'aksi_id')
    ],
    [Markup.button.callback('🔙 KEMBALI KE MENU UTAMA', 'menu_home')]
  ]);

  await ctx.editMessageMedia(
    {
      type: 'photo',
      media: BANNER.FITUR,
      caption: caption,
      parse_mode: 'HTML'
    },
    keyboard
  );
});

// 4. Blok Status & Info
bot.action(['menu_status', 'menu_info'], async (ctx) => {
  await ctx.answerCbQuery();
  const caption = formatBlokTeks(
    'INFORMASI & STATUS SERVER',
    'SYSTEM DIAGNOSTICS',
    `🟢 <b>Status Bot :</b> AKTIF (24/7)\n` +
    `☁️ <b>Hosting :</b> Vercel Serverless\n` +
    `⚡ <b>Mode :</b> Webhook Real-Time\n` +
    `🕒 <b>Waktu Server :</b> ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`,
    'Tidak ada gangguan sistem terdeteksi.'
  );

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('🔄 REFRESH STATUS', 'menu_status')],
    [Markup.button.callback('🔙 KEMBALI KE MENU UTAMA', 'menu_home')]
  ]);

  await ctx.editMessageMedia(
    {
      type: 'photo',
      media: BANNER.INFO,
      caption: caption,
      parse_mode: 'HTML'
    },
    keyboard
  );
});

// ==========================================
// AKSI POP-UP NOTIFIKASI (Alert / Toast)
// ==========================================
bot.action('aksi_ping', async (ctx) => {
  await ctx.answerCbQuery('⚡ Pong! Kecepatan respon server: 18ms (Sangat Cepat)', { show_alert: true });
});

bot.action('aksi_id', async (ctx) => {
  await ctx.answerCbQuery(`🆔 ID Telegram Kamu: ${ctx.from.id}`, { show_alert: true });
});

bot.action(['detail_reguler', 'detail_vip'], async (ctx) => {
  const tipe = ctx.match[0] === 'detail_vip' ? 'VIP / PRO' : 'REGULER';
  await ctx.answerCbQuery(`Kamu memilih kategori ${tipe}. Silakan hubungi admin untuk aktivasi!`, { show_alert: true });
});

// ==========================================
// EXPORT WEBHOOK UNTUK VERCEL (WAJIB)
// ==========================================
module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      await bot.handleUpdate(req.body);
      res.status(200).send('OK');
    } else {
      res.status(200).send('Bot Telegram Aktif 24 Jam di Vercel!');
    }
  } catch (err) {
    console.error('Error Webhook:', err);
    res.status(500).send('Internal Server Error');
  }
};
