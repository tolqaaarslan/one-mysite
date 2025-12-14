/** Minimal Tailwind config to mirror custom tokens without altering existing CSS */
module.exports = {
  content: [
    './index.html',
    './assets/**/*.{js,css,html}',
  ],
  theme: {
    extend: {
      colors: {
        panel: 'rgba(20,20,20,0.288)',
        brandYellow: '#FFC857',
      },
      boxShadow: {
        panel: '0 4px 30px rgba(0,0,0,0.5)',
        video: '0 20px 50px rgba(0,0,0,0.6)',
      },
      borderRadius: {
        md: '8px',
      },
      fontFamily: {
        indie: ['Indie Flower', 'cursive'],
        patrick: ['Patrick Hand', 'cursive'],
        kalam: ['Kalam', 'cursive'],
        jim: ['Jim Nightshade', 'monospace'],
      },
    },
  },
};