const footerGroups = [
  ["About", "Press", "Copyright", "Contact us", "Creators", "Advertise", "Developers"],
  ["Terms", "Privacy", "Policy & Safety", "How KujuaTime works", "Test new features"]
];

export default function Footer() {
  return (
    <footer className="youtube-sidebar-footer">
      {footerGroups.map((group, index) => (
        <p key={`footer-${index}`}>
          {group.map((label) => (
            <a href="/docs" key={label}>
              {label}
            </a>
          ))}
        </p>
      ))}
      <small>© 2026 KujuaTime LLC</small>
    </footer>
  );
}
