const prisma = require('./prisma');

async function seedTrustBadges() {
  try {
    const count = await prisma.trustBadge.count();
    if (count > 0) {
      console.log('🌱 TrustBadges Seeding: Already seeded');
      return;
    }

    const defaultBadges = [
      {
        name: 'Rising Star',
        min_supporters: 1,
        bg_class: 'from-purple-500/20 to-indigo-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30',
        glow_class: 'shadow-[0_0_8px_rgba(147,51,234,0.2)]',
        icon_class: 'h-4 w-4 animate-pulse',
        badge_url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9InB1cnBsZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5Z29uIHBvaW50cz0iMTIgMiAxNS4wOSA4LjI2IDIyIDkuMjcgMTcgMTQuMTQgMTguMTggMjEuMDIgMTIgMTcuNzcgNS44MiAyMS4wMiA3IDE0LjE0IDIgOS4yNyA4LjkxIDguMjYgMTIgMiIvPjwvc3ZnPg=='
      },
      {
        name: 'Trusted Creator',
        min_supporters: 5,
        bg_class: 'from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
        glow_class: 'shadow-[0_0_10px_rgba(16,185,129,0.25)]',
        icon_class: 'h-4 w-4',
        badge_url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImVtZXJhbGQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjAgMTNjMCA1LTMuNSA3LjUtNy42NiA5LjdhMSAxIDAgMCAxLS42OCAwQzcuNSAyMC41IDQgMTggNCAxM1Y2YTEgMSAwIDAgMS43Ni0uOTdsOC0yYTEgMSAwIDAgMS40OCAwbDggMkExIDEgMCAwIDEgMjAgNnY3eiIvPjxwYXRoIGQ9Im05IDEyIDIgMiA0LTQiLz48L3N2Zz4='
      },
      {
        name: 'Super Creator',
        min_supporters: 15,
        bg_class: 'from-amber-500/25 to-yellow-500/25 text-amber-700 dark:text-amber-300 border-amber-500/40',
        glow_class: 'shadow-[0_0_12px_rgba(245,158,11,0.35)]',
        icon_class: 'h-4 w-4',
        badge_url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRyb3BoeSI+PHBhdGggZD0iTTUgOUg0LjVhMi41IDIuNSAwIDAgMSAwLTVINSIvPjxwYXRoIGQ9Ik0xOCA5aDEuNWEyLjUgMi41IDAgMCAwIDAtNUgxOCIvPjxwYXRoIGQ9Ik00IDIyaDE2Ii8+PHBhdGggZD0iTTEwIDE0LjY2VjE3YzAgLjU1LS40NSAxLTEgMUg0djJoMTZ2LTJoLTVjLS41NSAwLTEtLjQ1LTEtMXYtMi4zNCIvPjxwYXRoIGQ9Ik0xMiAyYTYgNiAwIDAgMSA2IDZ2MWE2IDYgMCAwIDEtNiA2IDYgNiAwIDAgMS02LTZWOGE2IDYgMCAwIDEgNi02eiIvPjwvc3ZnPg=='
      },
      {
        name: 'Ultimate Legend',
        min_supporters: 50,
        bg_class: 'from-rose-500/25 via-pink-500/25 to-purple-500/25 text-rose-600 dark:text-rose-300 border-rose-500/40',
        glow_class: 'shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse',
        icon_class: 'h-4 w-4 animate-bounce',
        badge_url: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9InJvc2UiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNOC41IDE0LjVBMi41IDIuNSAwIDAgMCAxMSAxMmMwLTEuMzgtLjUtMi0xLTMtMS4wNzItMi4xNDMuMjI0LTQuMDU0IDItNi41IDIuNSAyIDQuOSA0IDYuNSAyIDEuNiAzIDMuNSAzIDUuNWE3IDcgMCAxIDEtMTQgMGMwLTEuMTUzLjQzMy0yLjI5NCAxLTNhMi41IDIuNSAwIDAgMCAyLjUgMi41eiIvPjwvc3ZnPg=='
      }
    ];

    for (const badge of defaultBadges) {
      await prisma.trustBadge.create({
        data: badge
      });
    }

    console.log('🌱 TrustBadges Seeding: SUCCESS (4 badges seeded)');
  } catch (error) {
    console.error('❌ TrustBadges Seeding: FAILED', error.message);
  }
}

module.exports = { seedTrustBadges };
