// background.js — handles Anthropic API calls from the service worker
// Content scripts send messages here to avoid CORS restrictions.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkTitle') {
    chrome.storage.local.get(['apiKey', 'enableDeepSearch'], async ({ apiKey, enableDeepSearch }) => {
      let videoMeta = null;
      if (enableDeepSearch && request.videoUrl) {
        videoMeta = await fetchVideoMeta(request.videoUrl).catch(() => null);
      }
      handleCheck(request.title, apiKey, videoMeta)
        .then(result => sendResponse({ success: true, result: { ...result, _deepSearched: !!videoMeta } }))
        .catch(err => sendResponse({ success: false, error: err.message }));
    });
    return true; // keep channel open for async
  }
});

async function fetchVideoMeta(videoUrl) {
  const res = await fetch(videoUrl);
  const html = await res.text();
  // uploadDate from JSON-LD
  let uploadDate = '';
  const ldIdx = html.indexOf('application/ld+json');
  if (ldIdx !== -1) {
    const jsonStart = html.indexOf('>', ldIdx) + 1;
    const jsonEnd = html.indexOf('</script>', jsonStart);
    if (jsonEnd !== -1) {
      try {
        const ld = JSON.parse(html.substring(jsonStart, jsonEnd).trim());
        uploadDate = ld.uploadDate || '';
      } catch (e) {}
    }
  }

  // description and viewCount from ytInitialPlayerResponse
  const descMatch = html.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/);
  const viewMatch = html.match(/"viewCount":"(\d+)"/);
  const description = descMatch ? JSON.parse('"' + descMatch[1] + '"') : '';
  const viewCount   = viewMatch ? viewMatch[1] : '';

  if (!uploadDate && !description && !viewCount) return null;
  return { description, uploadDate, viewCount };
}

async function handleCheck(title, apiKey, videoMeta = null) {
  const systemPrompt = `You are a headline truth-checker. Given a YouTube video title, assess whether the claim in the headline is likely TRUE, FALSE, MISLEADING, CLICKBAIT, or OPINION.

Respond in this exact JSON format and nothing else:
{
  "verdict": "TRUE" | "FALSE" | "MISLEADING" | "CLICKBAIT" | "OPINION" | "UNVERIFIABLE",
  "confidence": "high" | "medium" | "low",
  "summary": "1-2 sentence explanation of your assessment",
  "red_flags": ["list", "of", "red", "flags", "if any"]
}

Guidelines:
- CLICKBAIT: headline uses exaggerated language ("DESTROYS", "EXPLOSIVE", "ALL-OUT WAR") to dramatize mundane events
- MISLEADING: contains a kernel of truth but frames it deceptively
- FALSE: the core claim is factually wrong
- TRUE: the core claim is factually accurate
- OPINION: the headline is expressing a subjective view, not a factual claim
- UNVERIFIABLE: cannot determine truth from the headline alone

Focus on the literal claim. Flag emotional manipulation language. Be concise.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: videoMeta
            ? `Analyze this YouTube video title:\n\n"${title}"\n\nAdditional context:\nUpload date: ${videoMeta.uploadDate}\nViews: ${videoMeta.viewCount}\nDescription: ${videoMeta.description}`
            : `Analyze this YouTube video title:\n\n"${title}"`
        }
      ]
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`API ${response.status}: ${errBody.substring(0, 200)}`);
  }

  const data = await response.json();
  const text = data.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  // Parse JSON from response (strip markdown fences if present)
  const cleaned = text.replace(/```json\s*/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}
