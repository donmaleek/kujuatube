const paths = {
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  mic: (
    <>
      <path d="M12 4a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3Z" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  bell: (
    <>
      <path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16l-2-2Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  more: (
    <>
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  userCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 19a5 5 0 0 1 10 0" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  shorts: (
    <>
      <path d="m10 4 6 3-3 3 3 3-6 3-3-3 3-3-3-3 3-3Z" />
      <path d="m11 9 4 2-4 2V9Z" />
    </>
  ),
  subscriptions: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="m10 10 5 2-5 2v-4Z" />
      <path d="M7 3h10" />
    </>
  ),
  you: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  playlist: (
    <>
      <path d="M4 7h10" />
      <path d="M4 12h10" />
      <path d="M4 17h7" />
      <path d="m16 15 4 2-4 2v-4Z" />
    </>
  ),
  like: (
    <>
      <path d="M7 10v10" />
      <path d="M11 20h6.4a2 2 0 0 0 2-1.7l.9-6a2 2 0 0 0-2-2.3H15V5.8A2.8 2.8 0 0 0 12.2 3L9 10H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2Z" />
    </>
  ),
  dislike: (
    <>
      <path d="M17 14V4" />
      <path d="M13 4H6.6a2 2 0 0 0-2 1.7l-.9 6A2 2 0 0 0 5.7 14H9v4.2a2.8 2.8 0 0 0 2.8 2.8L15 14h4a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2Z" />
    </>
  ),
  share: (
    <>
      <path d="M4 12v7h16v-7" />
      <path d="M12 15V4" />
      <path d="m7 9 5-5 5 5" />
    </>
  ),
  save: (
    <>
      <path d="M6 4h12v17l-6-4-6 4V4Z" />
    </>
  ),
  clip: (
    <>
      <circle cx="7" cy="7" r="3" />
      <circle cx="7" cy="17" r="3" />
      <path d="M10 8.5 20 4" />
      <path d="M10 15.5 20 20" />
    </>
  ),
  theater: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 9h10v6H7z" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3 9.8 8.8 4 11l5.8 2.2L12 19l2.2-5.8L20 11l-5.8-2.2L12 3Z" />
      <path d="M19 3v4" />
      <path d="M17 5h4" />
    </>
  ),
  transcript: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </>
  ),
  play: (
    <>
      <path d="m8 5 11 7-11 7V5Z" />
    </>
  ),
  pause: (
    <>
      <path d="M8 5v14" />
      <path d="M16 5v14" />
    </>
  ),
  rewind: (
    <>
      <path d="m11 8-5 4 5 4V8Z" />
      <path d="m18 8-5 4 5 4V8Z" />
    </>
  ),
  forward: (
    <>
      <path d="m6 8 5 4-5 4V8Z" />
      <path d="m13 8 5 4-5 4V8Z" />
    </>
  ),
  volume: (
    <>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="M16 9.5a4 4 0 0 1 0 5" />
      <path d="M18.5 7a8 8 0 0 1 0 10" />
    </>
  ),
  muted: (
    <>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="m18 9-5 5" />
      <path d="m13 9 5 5" />
    </>
  ),
  captions: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 11h4" />
      <path d="M13 11h4" />
      <path d="M7 15h3" />
      <path d="M12 15h5" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a8 8 0 0 0 .1-2l2-1.5-2-3.5-2.4 1a8 8 0 0 0-1.7-1L15 5.5h-4l-.4 2.5a8 8 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a8 8 0 0 0 .1 2l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 1.7 1l.4 2.5h4l.4-2.5a8 8 0 0 0 1.7-1l2.4 1 2-3.5-2.2-1.5Z" />
    </>
  ),
  fullscreen: (
    <>
      <path d="M8 3H3v5" />
      <path d="M16 3h5v5" />
      <path d="M21 16v5h-5" />
      <path d="M3 16v5h5" />
    </>
  ),
  pip: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <rect x="12" y="12" width="6" height="4" rx="1" />
    </>
  ),
  trending: (
    <>
      <path d="M8 21c-2-2-3-4-3-6a7 7 0 0 1 3-5.8c.2 2 1.1 3.4 2.8 4.2C10.5 9.6 12 6.5 15 3c.8 3.8 4 5.8 4 10a8 8 0 0 1-3 6.2" />
      <path d="M10 21c-1-1-1.5-2.2-1.5-3.5A4.5 4.5 0 0 1 12 13c0 2 1 3 3 4 0 1.7-.7 3-2 4" />
    </>
  ),
  upload: (
    <>
      <path d="M12 17V5" />
      <path d="m7 10 5-5 5 5" />
      <path d="M5 19h14" />
    </>
  ),
  download: (
    <>
      <path d="M12 5v12" />
      <path d="m7 12 5 5 5-5" />
      <path d="M5 19h14" />
    </>
  ),
  admin: (
    <>
      <path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6l-8-3Z" />
      <path d="M9.5 12.5 11.5 14.5 15.5 10" />
    </>
  ),
  library: (
    <>
      <path d="M5 5v14" />
      <path d="M9 5v14" />
      <path d="m13 6 5 12" />
    </>
  ),
  watchLater: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l4 2" />
    </>
  ),
  yourVideos: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="m10 9 5 3-5 3V9Z" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V6l10-2v12" />
      <circle cx="7" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </>
  ),
  gaming: (
    <>
      <path d="M7 15h10l2 3a2 2 0 0 0 3-2l-1.4-7.2A4 4 0 0 0 16.7 6H7.3a4 4 0 0 0-3.9 2.8L2 16a2 2 0 0 0 3 2l2-3Z" />
      <path d="M8 10v3" />
      <path d="M6.5 11.5h3" />
      <path d="M16 11h.01" />
      <path d="M18 13h.01" />
    </>
  ),
  news: (
    <>
      <path d="M4 5h14a2 2 0 0 1 2 2v11H6a2 2 0 0 1-2-2V5Z" />
      <path d="M8 9h6" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </>
  ),
  courses: (
    <>
      <path d="m3 8 9-4 9 4-9 4-9-4Z" />
      <path d="M7 10v5c2 2 8 2 10 0v-5" />
    </>
  ),
  podcast: (
    <>
      <circle cx="12" cy="11" r="3" />
      <path d="M12 14v7" />
      <path d="M8 18h8" />
      <path d="M7 12a5 5 0 1 1 10 0" />
      <path d="M4 12a8 8 0 1 1 16 0" />
    </>
  ),
  premium: (
    <>
      <rect x="3" y="7" width="18" height="10" rx="3" />
      <path d="m10 10 5 2-5 2v-4Z" />
    </>
  ),
  kids: (
    <>
      <path d="M7 8h10a4 4 0 0 1 0 8H7a4 4 0 0 1 0-8Z" />
      <path d="m11 10 4 2-4 2v-4Z" />
    </>
  ),
  settings: (
    <>
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
      <path d="M4.9 15.5 3.7 17.6l2.8 2.8 2.1-1.2a8 8 0 0 0 2.4 1V22h4v-1.8a8 8 0 0 0 2.4-1l2.1 1.2 2.8-2.8-1.2-2.1a8 8 0 0 0 1-2.4H24v-4h-1.8a8 8 0 0 0-1-2.4l1.2-2.1-2.8-2.8-2.1 1.2a8 8 0 0 0-2.4-1V2h-4v1.8a8 8 0 0 0-2.4 1L6.6 3.6 3.8 6.4 5 8.5a8 8 0 0 0-1 2.4H2v4h1.9a8 8 0 0 0 1 2.6Z" />
    </>
  ),
  report: (
    <>
      <path d="M5 21V4" />
      <path d="M5 5h12l-1.5 4L17 13H5" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.7 2.7 0 0 1 5 1.5c0 2-2.5 2.1-2.5 4" />
      <path d="M12 18h.01" />
    </>
  ),
  feedback: (
    <>
      <path d="M4 5h16v11H8l-4 4V5Z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </>
  ),
  comment: (
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </>
  ),
  bookmark: (
    <>
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </>
  ),
  edit: (
    <>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
    </>
  ),
  delete: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6 18 20H6L5 6" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="m1 1 22 22" />
    </>
  )
};

export default function YoutubeIcon({ name, size = 24 }) {
  return (
    <svg
      aria-hidden="true"
      className="yt-icon"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name]}
    </svg>
  );
}
