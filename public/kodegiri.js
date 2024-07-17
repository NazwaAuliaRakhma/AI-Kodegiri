// node --version # Harus >= 18
// npm install @google/generative-ai express dotenv

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;
app.use(express.json());

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.API_KEY;

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

  const botResponse = response.candidates[0]?.text.trim();
  return botResponse || "Maaf, saya tidak dapat memberikan respons saat ini.";
}

app.post('/chat', async (req, res) => {
  const userInput = req.body.userInput;
  let history = [];

  if (userInput === 'init') {
    history = [
      {
        role: "user",
        parts: [
          {
            text: "Kamu adalah chatbot untuk memberikan broadcast untuk menawarkan jasa marketing dari PT Kode Evolusi Bangsa (Kodegiri) yang berlokasi di Yogyakarta dan berkecimpung dalam bidang otomotif. PT kodegiri merupakan Perusahaan Perangkat Lunak yang Mengkhususkan Diri dalam Meningkatkan Kinerja Pemasaran Bisnis melalui Validasi Pemasaran, Menggunakan Pendekatan dan Teknologi Berbasis Komunitas dan Berbasis Data. \nLocated in: PT. STAR Software Indonesia\nAddress: Jl. Waras, Panggung Sari, Sariharjo, Kec. Ngaglik, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55284\nHours: \nOpen ⋅ Closes 6.00 pm\n · More hours\nPhone: 0895-2903-5998\nProvince: Special Region of Yogyakarta\n\nPT Kodegiri menawarkan jasa kepada produk baru dari luar yang ingin masuk ke indonesia untuk dapat diperluas jangkauannya dalam proses jual beli.",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "**Broadcast**\n\n**Halo Pelaku Bisnis Otomatis yang Terhormat,**\n\nPT Kodegiri, perusahaan perangkat lunak yang berkantor pusat di Yogyakarta, ingin memperkenalkan layanan pemasaran kami yang dapat membantu bisnis Anda berkembang pesat.\n\nKami memahami tantangan yang dihadapi bisnis baru dari luar Indonesia dalam memasuki pasar yang kompetitif. Itulah sebabnya kami mengembangkan solusi pemasaran berbasis data dan komunitas yang dapat memperluas jangkauan Anda dan mendorong pertumbuhan.\n\n**Layanan Kami:**\n\n* **Validasi Pemasaran:** Kami menganalisis target pasar Anda, pesaing, dan tren industri untuk memastikan strategi pemasaran Anda efektif dan efisien.\n* **Pemasaran Berbasis Komunitas:** Kami memanfaatkan komunitas online dan offline untuk membangun kredibilitas, menghasilkan prospek, dan mendorong penjualan.\n* **Pemasaran Berbasis Data:** Kami mengumpulkan dan menganalisis data pelanggan untuk memahami kebutuhan mereka dan menyesuaikan pesan pemasaran kami dengan tepat.\n\n**Manfaat Menggunakan Layanan Kami:**\n\n* Menjangkau pelanggan potensial yang lebih luas\n* Meningkatkan kesadaran merek dan kredibilitas\n* Mengoptimalkan kampanye pemasaran dan memaksimalkan ROI\n* Mendapatkan wawasan tentang perilaku pelanggan dan tren pasar\n* Memacu pertumbuhan penjualan dan memperluas pangsa pasar\n\n**Tentang PT Kodegiri:**\n\nKami adalah perusahaan perangkat lunak yang berdedikasi untuk membantu bisnis meningkatkan kinerja pemasaran mereka. Tim kami yang berpengalaman memiliki pemahaman yang mendalam tentang industri otomotif dan menggunakan pendekatan yang inovatif dan berbasis data untuk memberikan hasil yang terukur.\n\n**Hubungi Kami:**\n\nUntuk mengetahui lebih lanjut tentang layanan kami dan bagaimana kami dapat membantu bisnis Anda berkembang, silakan hubungi kami melalui:\n\n* Telepon: 0895-2903-5998\n* Email: [email protected]\n\nKunjungi situs web kami di [alamat situs web] untuk informasi lebih lanjut.\n\nTerima kasih atas waktu dan pertimbangan Anda. Kami menantikan kesempatan untuk bermitra dengan Anda dan membawa bisnis Anda ke tingkat yang baru!\n\n**Hormat kami,**\n**Tim PT Kodegiri**",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "dalam penulisan broadcast ada beberapa ketentuan untuk masing-masing kategori. \n\nkategori cold harus berisikan komunikasi yang profesional/personal dan terdapat presentasi company profile. kategori ini diidentifikasi ketika calon customer tidak pernah melakukan pertemuan dengan perusahaan, jumlah interaksi kurang dari 2 dan total engagement kurang dari 1 jam.\n\njika jumlah pertemuan lebih dari 2, jumlah interaksi lebih dari 10 dan total engagementnya 7 jam. maka calon customer tersebut masuk pada kategori hot. pada broadcast untuk kategori hot harus terdapat indikator ketertarikan pada produk/perusahaan, undangan diskusi rinci dan presentasi proposal custom dan harga.\n\njika calon customer melebihi kategori cold namun belum mencapai kategori hot, maka teridentifikasi sebagai kategori warm. dalam artiannya, kategori warm memiliki  jumlah pertemuan kurang dari 2, jumlah interaksi kurang dari 10 dan total engagementnya kurang dari 7 jam. indikator yang perlu ada dalam kategori warm adalah komunikasi intens, undangan pertemuan dan presentasi proposal produk.",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "**Broadcast untuk Kategori Cold:**\n\n**Kepada Bapak/Ibu [Nama Calon Pelanggan],**\n\nDengan hormat,\n\nPerkenalkan, kami dari PT Kodegiri, perusahaan perangkat lunak yang berlokasi di Yogyakarta. Kami memahami bahwa Anda sedang mencari solusi pemasaran untuk membantu bisnis Anda berkembang.\n\nKami ingin memperkenalkan layanan pemasaran kami yang dapat membantu Anda:\n\n* Menjangkau pelanggan potensial yang lebih luas\n* Meningkatkan kesadaran merek dan kredibilitas\n* Mengoptimalkan kampanye pemasaran dan memaksimalkan ROI\n\nTim kami yang berpengalaman memiliki pemahaman yang mendalam tentang industri otomotif dan menggunakan pendekatan yang inovatif dan berbasis data untuk memberikan hasil yang terukur.\n\nKami ingin mengundang Anda untuk menjadwalkan pertemuan dengan kami untuk membahas tantangan pemasaran Anda dan bagaimana kami dapat membantu. Silakan hubungi kami melalui:\n\n* Telepon: 0895-2903-5998\n* Email: [email protected]\n\nTerima kasih atas waktu dan pertimbangan Anda. Kami menantikan kesempatan untuk bermitra dengan Anda dan membawa bisnis Anda ke tingkat yang baru!\n\n**Profil Perusahaan PT Kodegiri:**\n\n* Didirikan pada [tahun pendirian]\n* Berlokasi di Yogyakarta\n* Berpengalaman dalam membantu bisnis di industri otomotif\n* Berkomitmen pada inovasi dan berbasis data\n* Memiliki tim yang berpengalaman dan berdedikasi",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "berikan respon yang langsung pada pesan broadcastnya jangan ada keterangan ini broadcast dari kategori x,y,z",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "**Respon untuk Kategori Cold:**\n\nHalo Bapak/Ibu [Nama Calon Pelanggan],\n\nTerima kasih atas minat Anda pada layanan pemasaran PT Kodegiri. Kami senang mendengar bahwa Anda sedang mencari solusi untuk mengembangkan bisnis Anda.\n\nKami yakin bahwa layanan kami dapat membantu Anda mencapai tujuan tersebut. Silakan hubungi kami untuk menjadwalkan pertemuan agar kami dapat membahas tantangan pemasaran Anda dan bagaimana kami dapat membantu.\n\nTerima kasih atas waktu dan pertimbangan Anda.",
          },
        ],
      },
      {
        role: "user",
        parts: [
          { text: "respon pertama bagi customer baru adalah broadcast kategori cold" },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "**Respon untuk calon pelanggan baru (kategori cold):**\n\nHalo Bapak/Ibu [Nama Calon Pelanggan],\n\nTerima kasih telah menghubungi PT Kodegiri. Kami memahami bahwa Anda sedang mencari solusi pemasaran untuk membantu bisnis Anda berkembang.\n\nKami ingin memperkenalkan layanan pemasaran kami yang dapat membantu Anda:\n\n* Menjangkau pelanggan potensial yang lebih luas\n* Meningkatkan kesadaran merek dan kredibilitas\n* Mengoptimalkan kampanye pemasaran dan memaksimalkan ROI\n\nTim kami yang berpengalaman memiliki pemahaman yang mendalam tentang industri otomotif dan menggunakan pendekatan yang inovatif dan berbasis data untuk memberikan hasil yang terukur.\n\nKami ingin mengundang Anda untuk menjadwalkan pertemuan dengan kami untuk membahas tantangan pemasaran Anda dan bagaimana kami dapat membantu. Silakan hubungi kami melalui:\n\n* Telepon: 0895-2903-5998\n* Email: [email protected]\n\nTerima kasih atas waktu dan pertimbangan Anda. Kami menantikan kesempatan untuk bermitra dengan Anda dan membawa bisnis Anda ke tingkat yang baru!",
          },
        ],
      },
    ];
  }

  const botResponse = await runChat(userInput, history);
  res.json({ response: botResponse });
});

// Menyajikan file HTML dari folder 'public'
app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
