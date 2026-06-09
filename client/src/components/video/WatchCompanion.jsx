import { useMemo, useState } from "react";
import YoutubeIcon from "../common/YoutubeIcon.jsx";

const tabs = [
  { id: "pulse", label: "Pulse" },
  { id: "trust", label: "Trust" },
  { id: "creator", label: "Creator" },
  { id: "world", label: "World" },
  { id: "wellbeing", label: "Wellbeing" },
  { id: "chapters", label: "Chapters" },
  { id: "transcript", label: "Transcript" },
  { id: "notes", label: "Notes" }
];

export default function WatchCompanion({ video }) {
  const [activeTab, setActiveTab] = useState("pulse");
  const chapters = useMemo(
    () => [
      { time: "0:00", title: "Opening context" },
      { time: "1:24", title: `Why ${video.category || "this topic"} matters` },
      { time: "3:52", title: "Main walkthrough" },
      { time: "6:40", title: "Creator takeaways" }
    ],
    [video.category]
  );
  const pulse = useMemo(() => {
    const views = Number(video.views) || 0;
    const likes = Number(video.likes) || 0;
    const dislikes = Number(video.dislikes) || 0;
    const totalVotes = likes + dislikes || 1;
    const approval = Math.round((likes / totalVotes) * 100);
    const lift = Math.min(99, Math.max(62, Math.round(approval * 0.72 + Math.log10(views + 10) * 8)));

    return {
      lift,
      approval,
      creatorShare: Math.max(70, Math.min(92, Math.round(74 + approval / 7))),
      estimatedPool: Math.max(18, Math.round((views / 1000) * 1.8 + likes * 0.08)),
      signals: [
        { label: "Audience fit", value: `${approval}% positive` },
        { label: "Discovery lane", value: video.category || "Creators" },
        { label: "Next best action", value: "Follow the channel" }
      ]
    };
  }, [video]);

  return (
    <section className="watch-companion">
      <div className="watch-companion-tabs">
        {tabs.map((tab) => (
          <button className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)} key={tab.id}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "pulse" ? (
        <div className="watch-pulse-panel">
          <div className="watch-pulse-score">
            <YoutubeIcon name="sparkle" />
            <span>Audience Pulse</span>
            <strong>{pulse.lift}</strong>
            <small>momentum score</small>
          </div>
          <div className="watch-pulse-signals">
            {pulse.signals.map((signal) => (
              <span key={signal.label}>
                <small>{signal.label}</small>
                <strong>{signal.value}</strong>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === "creator" ? (
        <div className="watch-creator-panel">
          <div>
            <YoutubeIcon name="premium" />
            <small>Transparent creator share</small>
            <strong>{pulse.creatorShare}%</strong>
            <p>Projected creator-first payout share before payment fees and local taxes.</p>
          </div>
          <div>
            <YoutubeIcon name="save" />
            <small>Audience ownership</small>
            <strong>Portable members</strong>
            <p>Built for exports, direct community relationships, and less platform lock-in.</p>
          </div>
          <div>
            <YoutubeIcon name="sparkle" />
            <small>Momentum pool</small>
            <strong>${pulse.estimatedPool}</strong>
            <p>Estimated launch pool from views, saves, trust, and creator-lift signals.</p>
          </div>
        </div>
      ) : null}

      {activeTab === "world" ? (
        <div className="watch-world-panel">
          <span>
            <YoutubeIcon name="transcript" />
            <strong>Transcript-ready</strong>
            <small>Searchable, quotable, and accessible by default.</small>
          </span>
          <span>
            <YoutubeIcon name="captions" />
            <strong>Caption-first</strong>
            <small>Designed for translation, dubbing, and low-sound viewing.</small>
          </span>
          <span>
            <YoutubeIcon name="courses" />
            <strong>Local context</strong>
            <small>Regional discovery without trapping viewers in one bubble.</small>
          </span>
        </div>
      ) : null}

      {activeTab === "trust" ? (
        <div className="watch-trust-panel">
          <span>
            <YoutubeIcon name="admin" />
            <small>Origin</small>
            <strong>{video.channelName || video.ownerName || "KujuaTime Creator"}</strong>
          </span>
          <span>
            <YoutubeIcon name="captions" />
            <small>Disclosure</small>
            <strong>AI status pending creator attestation</strong>
          </span>
          <span>
            <YoutubeIcon name="report" />
            <small>Safety</small>
            <strong>{pulse.approval}% positive audience signal</strong>
          </span>
        </div>
      ) : null}

      {activeTab === "wellbeing" ? (
        <div className="watch-wellbeing-panel">
          <div>
            <YoutubeIcon name="watchLater" />
            <strong>Good stopping points</strong>
            <p>Watch the first chapter, save the main walkthrough, then leave with one useful action.</p>
          </div>
          <div>
            <YoutubeIcon name="sparkle" />
            <strong>Intent check</strong>
            <p>This video is best for learning, planning a creator project, or comparing production ideas.</p>
          </div>
        </div>
      ) : null}

      {activeTab === "chapters" ? (
        <div className="chapter-list">
          {chapters.map((chapter) => (
            <button key={chapter.time}>
              <span>{chapter.time}</span>
              <strong>{chapter.title}</strong>
            </button>
          ))}
        </div>
      ) : null}

      {activeTab === "transcript" ? (
        <div className="transcript-panel">
          <YoutubeIcon name="transcript" />
          <p>
            {video.title} opens with the core idea, moves through the {video.category || "creator"} context, and closes with practical takeaways.
          </p>
        </div>
      ) : null}

      {activeTab === "notes" ? (
        <div className="notes-panel">
          <YoutubeIcon name="sparkle" />
          <p>
            Save-worthy moments: the main walkthrough, the creator takeaways, and the parts viewers are most likely to replay.
          </p>
        </div>
      ) : null}
    </section>
  );
}
