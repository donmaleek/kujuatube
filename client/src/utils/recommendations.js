const intentCategoryWeights = {
  learn: { Education: 1.35, Technology: 1.18, Culture: 1.08 },
  create: { Education: 1.18, Technology: 1.28, Culture: 1.12, Gaming: 1.05 },
  relax: { Culture: 1.22, Music: 1.16, Sports: 1.12, Gaming: 1.12 }
};

export function getPulseScore(video) {
  return (Number(video.views) || 0) + (Number(video.likes) || 0) * 80 - (Number(video.dislikes) || 0) * 120;
}

function isLocalVideo(video, region) {
  const searchable = [video.title, video.description, video.channelName, video.channelHandle, video.category]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return searchable.includes("kenya") || searchable.includes("kenyan") || searchable.includes("nairobi") || searchable.includes(region.toLowerCase());
}

function getApproval(video) {
  const likes = Number(video.likes) || 0;
  const dislikes = Number(video.dislikes) || 0;
  return likes / (likes + dislikes || 1);
}

export function getVideoSignals(video, preferences, region) {
  const subscribers = Number(video.subscribers) || 0;
  const categoryWeights = intentCategoryWeights[preferences.intent] || intentCategoryWeights.learn;
  const signals = [];

  if (categoryWeights[video.category]) signals.push(`${preferences.intent === "create" ? "creator" : preferences.intent} fit`);
  if (isLocalVideo(video, region)) signals.push(`${region} relevance`);
  if (subscribers && subscribers <= 10000) signals.push("new creator lift");
  if (preferences.trustMode && getApproval(video) >= 0.96) signals.push("high trust signal");
  if (preferences.calmMode && ["Education", "Culture", "Technology"].includes(video.category)) signals.push("calm feed");

  return signals.slice(0, 3);
}

export function scoreVideoForPreferences(video, preferences, region) {
  const baseScore = getPulseScore(video);
  const categoryWeights = intentCategoryWeights[preferences.intent] || intentCategoryWeights.learn;
  const categoryMultiplier = categoryWeights[video.category] || 1;
  const localMultiplier = isLocalVideo(video, region) ? 1 + Number(preferences.localFirst) / 210 : 1;
  const subscriberCount = Number(video.subscribers) || 0;
  const creatorLift = subscriberCount && subscriberCount < 12000 ? 1 + Number(preferences.newCreators) / 260 : 1;
  const trustMultiplier = preferences.trustMode ? 0.92 + getApproval(video) * 0.16 : 1;
  const calmMultiplier = preferences.calmMode && ["Gaming", "Sports"].includes(video.category) ? 0.88 : 1;

  return baseScore * categoryMultiplier * localMultiplier * creatorLift * trustMultiplier * calmMultiplier;
}

export function rankVideos(videos, preferences, region) {
  return [...videos].sort((a, b) => scoreVideoForPreferences(b, preferences, region) - scoreVideoForPreferences(a, preferences, region));
}
