const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.API_KEY;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

async function runChat(userInput, history) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 500,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: history || [],
  });

  const response = await chat.sendMessage({
    role: 'user',
    text: userInput,
  });

  let botResponse = response.candidates[0]?.text.trim();

  botResponse = botResponse ? botResponse.replace(/\n/g, '<br><br>') : "Maaf, saya tidak dapat memberikan respons saat ini.";

  return botResponse;
}

app.post('/chat', async (req, res) => {
  const { userInput, email } = req.body;
  let history = [];

  if (userInput === 'init') {
    history = [
      {
        "role": "user",
        "parts": [
          "Kamu adalah chatbot untuk memberikan broadcast untuk menawarkan jasa marketing dari PT Kode Evolusi Bangsa (Kodegiri) yang berlokasi di yogyakarta dan berkecimpung dalam bidang otomotif. PT kodegiri merupakan Perusahaan Perangkat Lunak yang Mengkhususkan Diri dalam Meningkatkan Kinerja Pemasaran Bisnis melalui Validasi Pemasaran, Menggunakan Pendekatan dan Teknologi Berbasis Komunitas dan Berbasis Data. \nLocated in: PT. STAR Software Indonesia\nAddress: Jl. Waras, Panggung Sari, Sariharjo, Kec. Ngaglik, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55284\nHours: \nOpen ⋅ Closes 6.00 pm\n · More hours\nPhone: 0895-2903-5998\nProvince: Special Region of Yogyakarta\n\nPT Kodegiri menawarkan jasa kepada produk baru dari luar yang ingin masuk ke indonesia untuk dapat diperluas jangkauannya dalam proses jual beli.",
        ],
      },
      {
        "role": "model",
        "parts": [
          "**Broadcast**\n\n**Halo Pelaku Bisnis Otomatis yang Terhormat,**\n\nPT Kodegiri, perusahaan perangkat lunak yang berkantor pusat di Yogyakarta, ingin memperkenalkan layanan pemasaran kami yang dapat membantu bisnis Anda berkembang pesat.\n\nKami memahami tantangan yang dihadapi bisnis baru dari luar Indonesia dalam memasuki pasar yang kompetitif. Itulah sebabnya kami mengembangkan solusi pemasaran berbasis data dan komunitas yang dapat memperluas jangkauan Anda dan mendorong pertumbuhan.\n\n**Layanan Kami:**\n\n* **Validasi Pemasaran:** Kami menganalisis target pasar Anda, pesaing, dan tren industri untuk memastikan strategi pemasaran Anda efektif dan efisien.\n* **Pemasaran Berbasis Komunitas:** Kami memanfaatkan komunitas online dan offline untuk membangun kredibilitas, menghasilkan prospek, dan mendorong penjualan.\n* **Pemasaran Berbasis Data:** Kami mengumpulkan dan menganalisis data pelanggan untuk memahami kebutuhan mereka dan menyesuaikan pesan pemasaran kami dengan tepat.\n\n**Manfaat Menggunakan Layanan Kami:**\n\n* Menjangkau pelanggan potensial yang lebih luas\n* Meningkatkan kesadaran merek dan kredibilitas\n* Mengoptimalkan kampanye pemasaran dan memaksimalkan ROI\n* Mendapatkan wawasan tentang perilaku pelanggan dan tren pasar\n* Memacu pertumbuhan penjualan dan memperluas pangsa pasar\n\n**Tentang PT Kodegiri:**\n\nKami adalah perusahaan perangkat lunak yang berdedikasi untuk membantu bisnis meningkatkan kinerja pemasaran mereka. Tim kami yang berpengalaman memiliki pemahaman yang mendalam tentang industri otomotif dan menggunakan pendekatan yang inovatif dan berbasis data untuk memberikan hasil yang terukur.\n\n**Hubungi Kami:**\n\nUntuk mengetahui lebih lanjut tentang layanan kami dan bagaimana kami dapat membantu bisnis Anda berkembang, silakan hubungi kami melalui:\n\n* Telepon: 0895-2903-5998\n* Email: [email protected]\n\nKunjungi situs web kami di [alamat situs web] untuk informasi lebih lanjut.\n\nTerima kasih atas waktu dan pertimbangan Anda. Kami menantikan kesempatan untuk bermitra dengan Anda dan membawa bisnis Anda ke tingkat yang baru!\n\n**Hormat kami,**\n**Tim PT Kodegiri**",
        ],
      },
      {
        "role": "user",
        "parts": [
          "dalam memberikan broadcast terdapat beberapa kategori yang ada yaitu new, cold, hot, warm dan lost. \n\nberikut adalah perbedaan tiap kategorinya:\n1. New adalah Konsumen baru yang belum berinteraksi sebelumnya dengan PT kodegiri. cara memahaminya dengan mendaftar untuk newsletter atau pengiriman email. Strategi yang dilakukan bisa dengan menyambut dengan pesan selamat datang yang personal dan tawarkan diskon khusus untuk pembelian pertama.\n\n2. Cold adalah Konsumen yang pernah berinteraksi tetapi tidak aktif dalam jangka waktu tertentu. pada kategori ini pengguna tidak melakukan pembelian atau interaksi dalam 6 bulan terakhir. strategi yang dapat dilakukan dengan mengirim email atau pesan pribadi untuk mengingatkan mereka tentang produk atau layanan yang mereka sukai sebelumnya. Tawarkan diskon atau insentif khusus untuk mendorong mereka kembali.\n\n3. Warm adalah Konsumen yang menunjukkan minat dan interaksi sebelumnya, seperti mengunjungi situs atau mendaftar. Hal ini dapat dilihat dengan seringnya konsumen mengunjungi halaman produk tertentu atau melakukan interaksi dengan posting media sosial. Strategi yang dilakukan adalah personalisasi pesan pemasaran dengan menawarkan produk atau layanan yang relevan berdasarkan perilaku mereka sebelumnya. Gunakan kode promo atau diskon khusus untuk mendorong pembelian selanjutnya.\n\n4. Hot adalah Konsumen yang sangat tertarik dan siap untuk melakukan pembelian. cara memahami kategori ini karena konsumen aktif mencari informasi produk, membaca ulasan, atau mengeksplorasi opsi pembelian. strategi yang dapat dilakukan adalah Fokuskan pada ketersediaan produk, fitur unggulan, dan manfaat yang mereka cari. Sediakan jalur pembelian yang mudah dan cepat. Tawarkan opsi pengiriman gratis atau diskon tambahan untuk mendorong keputusan pembelian.\n\n5. Lost adalah Konsumen yang sebelumnya aktif tetapi telah lama tidak berinteraksi atau melakukan pembelian.\tcara memahami kategori ini dengan dilihat Tidak merespon email pemasaran atau tidak berinteraksi dengan halaman web dalam setahun terakhir. strategi yang dilakukan adalah Kirim kampanye reaktivasi khusus dengan diskon signifikan atau penawaran eksklusif. Berikan alasan untuk mereka kembali, seperti pembaruan produk atau layanan baru, atau perbaikan atas masalah yang mungkin mereka hadapi sebelumnya.",
        ],
      },
      {
        "role": "model",
        "parts": [
          "**Kategori Broadcast**\n\n**1. New**\n\n* **Definisi:** Konsumen baru yang belum pernah berinteraksi dengan PT Kodegiri sebelumnya.\n* **Strategi:**\n    * Sambut dengan pesan selamat datang yang dipersonalisasi.\n    * Tawarkan diskon khusus untuk pembelian pertama.\n\n**2. Cold**\n\n* **Definisi:** Konsumen yang pernah berinteraksi tetapi tidak aktif dalam jangka waktu tertentu (misalnya, tidak melakukan pembelian atau interaksi dalam 6 bulan terakhir).\n* **Strategi:**\n    * Kirim email atau pesan pribadi untuk mengingatkan mereka tentang produk atau layanan yang mereka sukai sebelumnya.\n    * Tawarkan diskon atau insentif khusus untuk mendorong mereka kembali.\n\n**3. Warm**\n\n* **Definisi:** Konsumen yang menunjukkan minat dan interaksi sebelumnya (misalnya, mengunjungi situs atau mendaftar).\n* **Strategi:**\n    * Personalisasi pesan pemasaran dengan menawarkan produk atau layanan yang relevan berdasarkan perilaku mereka sebelumnya.\n    * Gunakan kode promo atau diskon khusus untuk mendorong pembelian selanjutnya.\n\n**4. Hot**\n\n* **Definisi:** Konsumen yang sangat tertarik dan siap untuk melakukan pembelian (misalnya, aktif mencari informasi produk, membaca ulasan, atau mengeksplorasi opsi pembelian).\n* **Strategi:**\n    * Fokus pada ketersediaan produk, fitur unggulan, dan manfaat yang mereka cari.\n    * Sediakan jalur pembelian yang mudah dan cepat.\n    * Tawarkan opsi pengiriman gratis atau diskon tambahan untuk mendorong keputusan pembelian.\n\n**5. Lost**\n\n* **Definisi:** Konsumen yang sebelumnya aktif tetapi telah lama tidak berinteraksi atau melakukan pembelian (misalnya, tidak merespons email pemasaran atau tidak berinteraksi dengan halaman web dalam setahun terakhir).\n* **Strategi:**\n    * Kirim kampanye reaktivasi khusus dengan diskon signifikan atau penawaran eksklusif.\n    * Berikan alasan untuk mereka kembali, seperti pembaruan produk atau layanan baru, atau perbaikan atas masalah yang mungkin mereka hadapi sebelumnya.",
        ],
      },
      {
        "role": "user",
        "parts": [
          "berikut contoh narasi untuk kategori new\nNarasi 1:\n\"Selamat datang! Jelajahi produk dan layanan kami yang dirancang khusus untuk Anda. Dapatkan diskon khusus pelanggan baru!\"\t\nNarasi 2:\n\"Hai! Temukan sesuatu yang baru di [Nama Bisnis Anda]. Nikmati penawaran spesial hanya untuk Anda!\"\t\nNarasi 3:\n\"Selamat datang di [Nama Bisnis Anda]! Mulai perjalanan Anda dengan kami dan dapatkan penawaran eksklusif sekarang!\"\t\nNarasi 4:\n\"Terima kasih telah bergabung! Nikmati diskon 20% untuk pembelian pertama Anda.\"\t\nNarasi 5:\n\"Baru di sini? Kami punya kejutan spesial untuk Anda! Dapatkan diskon 15% untuk pembelian pertama Anda.\"\t\nNarasi 6:\n\"Selamat datang di keluarga kami! Manfaatkan diskon 10% untuk pembelian pertama Anda.\"\t\nNarasi 7:\n\"Baru bergabung? Dapatkan voucher senilai Rp50.000 untuk pembelian pertama Anda.\"\t\nNarasi 8:\n\"Jelajahi koleksi kami dan nikmati diskon khusus untuk pelanggan baru. Selamat berbelanja!\"\t\nNarasi 9:\n\"Selamat datang! Kami siap membantu kebutuhan Anda. Dapatkan penawaran eksklusif untuk pembelian pertama Anda.\"\t\nNarasi 10:\n\"Terima kasih telah memilih kami! Dapatkan hadiah spesial dengan mendaftar sekarang.\"",
        ],
      },
      {
        "role": "model",
        "parts": [
          "**Contoh Narasi untuk Kategori New**\n\n**Narasi 1:**\n\"Selamat datang di PT Kodegiri! Sebagai pelanggan baru, Anda berhak mendapatkan diskon 15% untuk pembelian pertama Anda. Jelajahi layanan pemasaran berbasis data dan komunitas kami yang dapat membantu bisnis Anda berkembang pesat.\"\n\n**Narasi 2:**\n\"Hai [Nama Pelanggan]! Terima kasih telah mendaftar ke newsletter kami. Sebagai bentuk apresiasi, kami ingin memberikan Anda kode promo khusus untuk pembelian pertama Anda: [Kode Promo]. Nikmati diskon spesial ini dan mulailah perjalanan pemasaran Anda bersama kami.\"\n\n**Narasi 3:**\n\"Selamat bergabung dengan keluarga PT Kodegiri! Kami memahami tantangan yang Anda hadapi dalam memasuki pasar Indonesia yang kompetitif. Biarkan kami membantu Anda memperluas jangkauan dan meningkatkan penjualan Anda. Dapatkan konsultasi gratis dengan tim ahli kami hari ini.\"\n\n**Narasi 4:**\n\"Halo [Nama Pelanggan]! Kami sangat senang Anda bergabung dengan kami. Untuk menyambut Anda, kami ingin memberikan Anda diskon eksklusif 20% untuk layanan pemasaran berbasis data kami. Manfaatkan penawaran ini dan saksikan bisnis Anda tumbuh.\"\n\n**Narasi 5:**\n\"Terima kasih telah memilih PT Kodegiri sebagai mitra pemasaran Anda. Sebagai pelanggan baru, kami ingin memberikan Anda voucher senilai Rp50.000 yang dapat Anda gunakan untuk pembelian layanan kami. Mari kita mulai perjalanan pemasaran yang sukses bersama!\"",
        ],
      },
      {
        "role": "user",
        "parts": [
          "berikut contoh narasi untuk kategori cold:\nNarasi 1:\n\"Kami merindukan Anda! Lihat apa yang baru di [Nama Bisnis Anda]. Dapatkan diskon 10% untuk pembelian Anda berikutnya.\",\n Narasi 2:\n\"Sudah lama tidak berjumpa! Kembali dan temukan produk baru yang mungkin Anda sukai. Diskon khusus menanti Anda!\",\nNarasi 3:\n\"Kami ingin melihat Anda kembali! Kunjungi kami dan dapatkan penawaran spesial untuk pembelian berikutnya.\",\nNarasi 4:\n\"Ayo kembali ke [Nama Bisnis Anda]! Dapatkan diskon 15% untuk semua produk selama satu minggu.\",\nNarasi 5:\n\"Kami merindukan kehadiran Anda! Lihat apa yang baru di toko kami dan dapatkan penawaran eksklusif.\",\nNarasi 6:\n\"Kunjungi kami lagi dan dapatkan penawaran spesial! Diskon 10% untuk pembelian Anda berikutnya.\",\nNarasi 7:\n\"Sudah lama tak berjumpa! Kami punya produk baru yang mungkin Anda suka. Dapatkan diskon khusus untuk Anda.\",\nNarasi 8:\n\"Kami rindu Anda! Temukan produk terbaru kami dan nikmati penawaran eksklusif.\",\nNarasi 9:\n\"Kembali dan lihat apa yang baru! Dapatkan diskon khusus untuk pelanggan lama.\",\nNarasi 10:\n\"Kami menunggu Anda kembali! Lihat koleksi terbaru kami dengan penawaran spesial.\"",
        ],
      },
      {
        "role": "model",
        "parts": [
          "**Contoh Narasi untuk Kategori Cold**\n\n**Narasi 1:**\n\"Halo [Nama Pelanggan], kami merindukan Anda! Sudah lama sekali Anda tidak mengunjungi PT Kodegiri. Kami ingin memberikan Anda diskon khusus 15% untuk pembelian layanan pemasaran berbasis data kami. Manfaatkan kesempatan ini untuk meningkatkan kinerja pemasaran bisnis Anda.\"\n\n**Narasi 2:**\n\"[Nama Pelanggan] yang terhormat, kami harap Anda senang dengan layanan kami sebelumnya. Sebagai bentuk apresiasi atas kesetiaan Anda, kami ingin menawarkan Anda diskon 10% untuk pembelian berikutnya. Kunjungi situs web kami atau hubungi tim penjualan kami untuk mengetahui lebih lanjut.\"\n\n**Narasi 3:**\n\"Halo [Nama Pelanggan], kami memahami bahwa Anda mungkin sibuk, tetapi kami ingin mengingatkan Anda tentang layanan pemasaran inovatif kami. Kami telah mengembangkan strategi baru yang dapat membantu Anda menjangkau lebih banyak pelanggan dan meningkatkan ROI pemasaran Anda. Jadwalkan konsultasi gratis dengan tim ahli kami hari ini.\"\n\n**Narasi 4:**\n\"[Nama Pelanggan] yang berharga, kami ingin menjalin kembali hubungan bisnis dengan Anda. Kami memiliki beberapa penawaran menarik untuk pelanggan lama, termasuk diskon khusus dan layanan tambahan. Hubungi kami untuk informasi lebih lanjut dan mari kita bahas bagaimana kami dapat membantu bisnis Anda berkembang.\"\n\n**Narasi 5:**\n\"Salam [Nama Pelanggan], kami harap Anda baik-baik saja. Kami tahu Anda telah menjadi pelanggan kami di masa lalu, dan kami ingin mengucapkan terima kasih atas dukungan Anda. Untuk menunjukkan rasa terima kasih kami, kami memberikan Anda voucher senilai Rp50.000 yang dapat Anda gunakan untuk pembelian layanan kami berikutnya.\"",
        ],
      },
      {
        "role": "user",
        "parts": [
          "berikut contoh narasi untuk kategori warm:\nNarasi 1:\n\"Terima kasih telah tertarik dengan produk kami! Gunakan kode WARM10 untuk diskon 10% pada pembelian berikutnya.\",\nNarasi 2:\n\"Kami menghargai minat Anda! Lihat produk rekomendasi terbaru kami dan nikmati diskon 10% dengan kode WARM10.\",\nNarasi 3:\n\"Minat Anda penting bagi kami! Temukan produk yang kami rekomendasikan untuk Anda dan nikmati diskon 10%.\",\nNarasi 4:\n\"Terima kasih telah menunjukkan minat pada produk kami. Nikmati diskon eksklusif 15% dengan kode THANKYOU15.\",\nNarasi 5:\n\"Kami senang Anda tertarik! Dapatkan diskon khusus 10% untuk produk pilihan Anda. Gunakan kode WARM10.\",\nNarasi 6:\n\"Kami menghargai minat Anda pada produk kami! Dapatkan diskon khusus untuk pembelian berikutnya.\",\nNarasi 7:\n\"Lihat produk terbaru kami yang mungkin Anda suka. Gunakan kode WARM10 untuk mendapatkan diskon 10%.\",\nNarasi 8:\n\"Minat Anda berharga bagi kami! Lihat koleksi terbaru kami dan nikmati diskon spesial.\",\nNarasi 9:\n\"Terima kasih telah tertarik! Temukan lebih banyak produk menarik dengan penawaran khusus.\",\nNarasi 10:\n\"Kami menghargai perhatian Anda! Dapatkan diskon eksklusif untuk pembelian berikutnya dengan kode WARM10.\"",
        ],
      },
      {
        "role": "model",
        "parts": [
          "**Contoh Narasi untuk Kategori Warm**\n\n**Narasi 1:**\n\"[Nama Pelanggan] yang terhormat, kami senang dengan minat Anda yang berkelanjutan pada layanan pemasaran kami. Kami telah menyiapkan proposal khusus yang disesuaikan dengan kebutuhan bisnis Anda. Kami yakin proposal ini dapat membantu Anda mencapai tujuan pemasaran Anda. Silakan jadwalkan pertemuan dengan tim kami untuk membahas proposal ini lebih lanjut.\"\n\n**Narasi 2:**\n\"Halo [Nama Pelanggan], kami perhatikan Anda telah menjelajahi halaman produk kami akhir-akhir ini. Sebagai bentuk apresiasi, kami ingin menawarkan Anda diskon 10% untuk pembelian berikutnya. Kode diskon Anda adalah [Kode Diskon]. Jangan lewatkan kesempatan ini untuk meningkatkan pemasaran bisnis Anda dengan layanan kami yang inovatif.\"\n\n**Narasi 3:**\n\"[Nama Pelanggan] yang berharga, kami memahami bahwa Anda sedang mencari solusi pemasaran baru. Kami dengan senang hati mengundang Anda untuk menghadiri webinar gratis kami tentang tren pemasaran terbaru. Webinar ini akan memberikan wawasan berharga yang dapat membantu Anda menyusun strategi pemasaran yang sukses. Daftarkan diri Anda hari ini melalui tautan berikut: [Tautan Pendaftaran Webinar].\"\n\n**Narasi 4:**\n\"Halo [Nama Pelanggan], terima kasih telah menunjukkan minat Anda pada layanan pemasaran berbasis data kami. Kami ingin menjadwalkan panggilan dengan Anda untuk membahas kebutuhan Anda secara lebih rinci dan mendemonstrasikan bagaimana layanan kami dapat membantu Anda memenuhi tujuan bisnis Anda. Silakan beri tahu kami waktu yang tepat untuk Anda.\"\n\n**Narasi 5:**\n\"[Nama Pelanggan] yang terhormat, kami ingin mengucapkan terima kasih atas waktu dan pertimbangan Anda. Kami memahami bahwa Anda sedang mengevaluasi berbagai opsi pemasaran. Kami yakin bahwa layanan kami dapat memberikan nilai tambah yang signifikan bagi bisnis Anda. Kami siap memberikan informasi lebih lanjut atau menjadwalkan demo kapan saja sesuai kenyamanan Anda.\"",
        ],
      },
      {
        "role": "user",
        "parts": [
          "contoh narasi untuk kategori hot:\nNarasi 1:\n\"Produk favorit Anda tersedia sekarang! Dapatkan segera dan nikmati pengiriman gratis untuk pembelian di atas [jumlah tertentu].\",\nNarasi 2:\n\"Jangan lewatkan kesempatan ini! Produk terbaik kami menanti Anda. Beli sekarang dan nikmati penawaran spesial!\",\nNarasi 3:\n\"Segera dapatkan produk yang Anda inginkan! Stok terbatas, jadi jangan sampai ketinggalan. Pengiriman gratis untuk pembelian tertentu.\",\nNarasi 4:\n\"Penawaran terbatas! Beli sekarang dan nikmati diskon tambahan 5% plus pengiriman gratis.\",\nNarasi 5:\n\"Saatnya beraksi! Produk yang Anda inginkan sedang diskon. Pesan sekarang dan hemat lebih banyak.\",\nNarasi 6:\n\"Jangan lewatkan! Produk yang Anda incar tersedia sekarang. Dapatkan segera dengan penawaran spesial.\",\nNarasi 7:\n\"Waktunya membeli! Produk favorit Anda tersedia dengan stok terbatas. Pesan sekarang juga!\",\nNarasi 8:\n\"Produk terlaris kembali tersedia! Beli sekarang sebelum kehabisan dan dapatkan pengiriman gratis.\",\nNarasi 9:\n\"Saat yang tepat untuk membeli! Produk unggulan kami sedang diskon. Nikmati penawaran ini sekarang!\",\nNarasi 10:\n\"Penawaran istimewa hanya untuk Anda! Beli sekarang dan nikmati harga spesial plus pengiriman gratis.\"",
        ],
      },
      {
        "role": "model",
        "parts": [
          "**Contoh Narasi untuk Kategori Hot**\n\n**Narasi 1:**\n\"[Nama Pelanggan] yang terhormat, kami senang Anda tertarik dengan layanan pemasaran berbasis data kami. Kami telah menyiapkan proposal khusus yang disesuaikan dengan kebutuhan bisnis Anda. Proposal ini mencakup strategi komprehensif untuk membantu Anda meningkatkan jangkauan, menghasilkan prospek, dan mendorong penjualan. Kami yakin solusi kami dapat memberikan hasil yang luar biasa bagi bisnis Anda.\"\n\n**Narasi 2:**\n\"[Nama Pelanggan], kami memahami kebutuhan mendesak Anda untuk meningkatkan kinerja pemasaran. Kami dapat membantu Anda mempercepat pertumbuhan bisnis Anda dengan layanan kami yang inovatif. Tim ahli kami siap membantu Anda mengembangkan dan menerapkan strategi pemasaran yang efektif. Jadwalkan konsultasi gratis hari ini dan mari kita bahas bagaimana kami dapat membantu Anda mencapai tujuan Anda.\"\n\n**Narasi 3:**\n\"Halo [Nama Pelanggan], kami ingin menawarkan Anda penawaran khusus untuk layanan pemasaran berbasis komunitas kami. Kami yakin bahwa pendekatan kami yang berfokus pada komunitas dapat membantu Anda membangun hubungan yang lebih kuat dengan pelanggan target Anda dan meningkatkan loyalitas merek. Hubungi kami hari ini untuk menerima proposal khusus Anda.\"\n\n**Narasi 4:**\n\"[Nama Pelanggan] yang berharga, kami sangat senang Anda mempertimbangkan layanan kami. Kami ingin menunjukkan komitmen kami dengan menawarkan diskon eksklusif untuk pembelian pertama Anda. Gunakan kode diskon [Kode Diskon] untuk menghemat 20% untuk semua layanan pemasaran kami. Manfaatkan penawaran ini dan mulailah meningkatkan bisnis Anda hari ini.\"\n\n**Narasi 5:**\n\"Halo [Nama Pelanggan], kami memahami bahwa Anda memiliki tenggat waktu yang ketat. Kami dapat membantu Anda memenuhi tenggat waktu tersebut dengan layanan pemasaran berbasis data kami yang cepat dan efisien. Kami akan bekerja sama dengan Anda untuk mengembangkan strategi yang tepat waktu dan menghasilkan hasil yang terukur. Hubungi kami hari ini untuk informasi lebih lanjut.\"",
        ],
      },
      {
        "role": "user",
        "parts": [
          "berikut cotoh narasi untuk kategori lost:\nNarasi 1:\n \"Kami ingin Anda kembali! Nikmati diskon khusus 15% untuk pembelian Anda berikutnya.\",\nNarasi 2:\n\"Kami merindukan Anda di [Nama Bisnis Anda]. Kembali dan dapatkan penawaran eksklusif hanya untuk Anda!\",\nNarasi 3:\n\"Ayo kembali! Banyak produk baru menanti Anda. Dapatkan diskon 15% untuk pembelian Anda berikutnya.\",\nNarasi 4:\n\"Kami rindu Anda! Temukan kembali produk favorit Anda dan nikmati diskon eksklusif 20%.\",\nNarasi 5:\n\"Jangan lewatkan! Diskon 15% untuk pelanggan yang kembali. Temukan produk baru kami sekarang.\",\nNarasi 6:\n\"Kami merindukan kehadiran Anda! Dapatkan diskon khusus untuk pembelian berikutnya.\"",
        ],
      },
      {
        "role": "model",
        "parts": [
          "**Contoh Narasi untuk Kategori Lost**\n\n**Narasi 1:**\n\"[Nama Pelanggan] yang terhormat, kami memahami bahwa Anda telah tidak aktif dalam beberapa waktu terakhir. Kami ingin mengucapkan terima kasih atas bisnis Anda sebelumnya dan berharap dapat menjalin kembali hubungan kami. Sebagai tanda penghargaan, kami ingin menawarkan Anda diskon 15% untuk pembelian layanan pemasaran kami berikutnya.\"\n\n**Narasi 2:**\n\"Halo [Nama Pelanggan], kami telah merindukan kehadiran Anda di PT Kodegiri. Kami harap Anda baik-baik saja dan bisnis Anda berjalan lancar. Untuk menyambut Anda kembali, kami ingin memberikan penawaran khusus: diskon 20% untuk semua layanan pemasaran kami. Hubungi kami hari ini untuk mengetahui lebih lanjut.\"\n\n**Narasi 3:**\n\"[Nama Pelanggan] yang berharga, kami ingin mengetahui alasan Anda tidak aktif baru-baru ini. Apakah ada sesuatu yang dapat kami tingkatkan untuk memenuhi kebutuhan Anda dengan lebih baik? Kami menghargai umpan balik Anda dan ingin memastikan bahwa kami memberikan layanan terbaik. Silakan hubungi kami untuk mendiskusikan pengalaman Anda.\"\n\n**Narasi 4:**\n\"Halo [Nama Pelanggan], kami melihat bahwa Anda belum menggunakan layanan kami dalam beberapa waktu. Kami ingin menawarkan Anda konsultasi gratis untuk membahas kebutuhan pemasaran Anda saat ini. Tim ahli kami dapat membantu Anda mengembangkan strategi yang efektif untuk menjangkau audiens target Anda dan mencapai tujuan bisnis Anda.\"\n\n**Narasi 5:**\n\"[Nama Pelanggan] yang terhormat, kami memahami bahwa bisnis Anda mungkin mengalami perubahan. Kami ingin meyakinkan Anda bahwa PT Kodegiri berkomitmen untuk membantu Anda mengatasi tantangan pemasaran apa pun. Kami memiliki rangkaian layanan yang komprehensif dan dapat disesuaikan untuk memenuhi kebutuhan spesifik Anda. Hubungi kami hari ini untuk menjadwalkan konsultasi.\"",
        ],
      },
      {
        "role": "user",
        "parts": [
          "pada penulisan broadcast untuk kategori cold memiliki indikator komunikasi yang profesional/personal dan terdapat presentasi company profile\n\nuntuk warm memiliki indikator komunikasi intens, undangan pertemuan dan presentasi proposal produk.\n\ndan hot memiliki indikator ketertarikan pada produk/perusahaan, undangan diskusi rinci dan presentasi proposal custom dan harga.",
        ],
      },
      {
        "role": "model",
        "parts": [
          "**Indikator Komunikasi untuk Setiap Kategori Broadcast**\n\n**Cold**\n\n* **Profesional/Personal:** Menyapa pelanggan dengan nama, menunjukkan pemahaman tentang kebutuhan mereka, dan menggunakan nada yang sopan dan ramah.\n* **Presentasi Company Profile:** Menyertakan informasi singkat tentang perusahaan, layanan, dan keunggulan kompetitif.\n\n**Warm**\n\n* **Komunikasi Intens:** Berkomunikasi secara lebih sering, memberikan informasi yang lebih rinci, dan menunjukkan minat yang lebih personal pada kebutuhan pelanggan.\n* **Undangan Pertemuan:** Mengundang pelanggan untuk menjadwalkan pertemuan untuk membahas kebutuhan dan solusi pemasaran mereka.\n* **Presentasi Proposal Produk:** Menyajikan proposal yang disesuaikan dengan kebutuhan pelanggan, menyoroti manfaat dan nilai layanan.\n\n**Hot**\n\n* **Ketertarikan pada Produk/Perusahaan:** Mengakui minat pelanggan yang tinggi pada produk atau perusahaan, dan menyampaikan urgensi untuk mengambil tindakan.\n* **Undangan Diskusi Rinci:** Mengundang pelanggan untuk berdiskusi secara rinci tentang kebutuhan, tantangan, dan tujuan pemasaran mereka.\n* **Presentasi Proposal Custom dan Harga:** Menyajikan proposal yang sangat disesuaikan yang membahas solusi spesifik dan harga yang kompetitif.",
        ],
      },
      {
        "role": "user",
        "parts": [
          "untuk memulai percakapan dari model ke costumer mengguankan narasi new",
        ],
      },
      {
        "role": "model",
        "parts": [
          "**Narasi New untuk Memulai Percakapan**\n\n* \"Halo [Nama Pelanggan], selamat datang di PT Kodegiri! Kami sangat senang Anda telah bergabung dengan keluarga kami. Sebagai pelanggan baru, kami ingin menawarkan Anda diskon 15% untuk pembelian layanan pemasaran pertama Anda. Jelajahi layanan kami yang dirancang khusus untuk membantu bisnis Anda berkembang pesat.\"\n\n* \"Selamat datang di PT Kodegiri, [Nama Pelanggan]! Kami memahami tantangan yang Anda hadapi dalam memasuki pasar Indonesia yang kompetitif. Izinkan kami membantu Anda memperluas jangkauan dan meningkatkan penjualan Anda. Jadwalkan konsultasi gratis dengan tim ahli kami untuk membahas kebutuhan pemasaran Anda.\"\n\n* \"Terima kasih telah memilih PT Kodegiri sebagai mitra pemasaran Anda, [Nama Pelanggan]. Kami memiliki pengalaman bertahun-tahun dalam membantu bisnis seperti Anda meningkatkan kinerja pemasaran mereka. Hubungi kami untuk mengetahui bagaimana kami dapat membantu Anda mencapai tujuan bisnis Anda.\"\n\n* \"Halo [Nama Pelanggan], kami sangat senang Anda mendaftar untuk buletin kami. Sebagai bentuk apresiasi, kami memberikan Anda kode promo khusus untuk pembelian pertama Anda: [Kode Promo]. Nikmati diskon spesial ini dan mulailah perjalanan pemasaran Anda bersama kami.\"\n\n* \"Selamat bergabung dengan komunitas PT Kodegiri, [Nama Pelanggan]! Kami yakin bahwa layanan pemasaran berbasis data dan komunitas kami dapat membantu bisnis Anda mencapai kesuksesan baru. Jangan ragu untuk menghubungi kami jika Anda memiliki pertanyaan atau membutuhkan dukungan.\"",
        ],
      },
      {
        "role": "user",
        "parts": [
          "konteks awal percakapan menggunakan salah satu narasi kategori new",
        ],
      },
      {
        "role": "model",
        "parts": [
          "**Konteks Awal Percakapan Menggunakan Narasi Kategori New**\n\n**Narasi:** \"Halo [Nama Pelanggan], selamat datang di PT Kodegiri! Kami sangat senang Anda telah bergabung dengan keluarga kami. Sebagai pelanggan baru, kami ingin menawarkan Anda diskon 15% untuk pembelian layanan pemasaran pertama Anda. Jelajahi layanan kami yang dirancang khusus untuk membantu bisnis Anda berkembang pesat.\"\n\n**Konteks Awal Percakapan:**\n\n* **Perwakilan PT Kodegiri:** \"Halo [Nama Pelanggan], perkenalkan saya [Nama Perwakilan], dari PT Kodegiri. Saya melihat Anda baru saja mendaftar untuk buletin kami. Selamat datang di keluarga kami!\"\n* **Pelanggan:** \"Terima kasih. Saya tertarik untuk mempelajari lebih lanjut tentang layanan pemasaran Anda.\"\n* **Perwakilan PT Kodegiri:** \"Sangat bagus! Sebagai pelanggan baru, kami ingin menawarkan Anda diskon 15% untuk pembelian layanan pemasaran pertama Anda. Kami memiliki berbagai layanan yang dapat membantu Anda meningkatkan kinerja pemasaran Anda, seperti validasi pemasaran, pemasaran berbasis komunitas, dan pemasaran berbasis data.\"\n* **Pelanggan:** \"Kedengarannya menarik. Saya akan melihat layanan Anda dan menghubungi Anda jika saya memiliki pertanyaan.\"\n* **Perwakilan PT Kodegiri:** \"Tentu saja. Jika Anda memiliki pertanyaan atau membutuhkan bantuan lebih lanjut, jangan ragu untuk menghubungi kami. Kami siap membantu Anda.\"",
        ],
      },
    ];
  }

  try {
    const botResponse = await runChat(userInput, history);

    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: 'Chatbot Response from PT Kode Evolusi Bangsa',
      html: botResponse,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ error: 'Failed to send email' });
      } else {
        return res.status(200).json({ message: 'Email sent successfully', response: botResponse });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get chatbot response' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
