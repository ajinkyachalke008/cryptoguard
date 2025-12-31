import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { address } = await req.json();

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Determine risk profile based on address (mock logic)
  const isHighRisk = address?.toLowerCase().startsWith('0x') && address.length > 20;
  const botMultiplier = isHighRisk ? 2.5 : 1;

  const platforms = [
    {
      name: "Twitter/X",
      mentions: Math.floor(5000 + Math.random() * 10000),
      botScore: Math.min(95, Math.floor(25 * botMultiplier + Math.random() * 15)),
      sentiment: Math.floor(60 + Math.random() * 30),
      engagement: Math.floor(20000 + Math.random() * 50000),
    },
    {
      name: "Telegram",
      mentions: Math.floor(2000 + Math.random() * 5000),
      botScore: Math.min(95, Math.floor(20 * botMultiplier + Math.random() * 20)),
      sentiment: Math.floor(70 + Math.random() * 25),
      engagement: Math.floor(10000 + Math.random() * 20000),
    },
    {
      name: "Discord",
      mentions: Math.floor(1000 + Math.random() * 3000),
      botScore: Math.min(95, Math.floor(15 * botMultiplier + Math.random() * 10)),
      sentiment: Math.floor(65 + Math.random() * 20),
      engagement: Math.floor(5000 + Math.random() * 10000),
    }
  ];

  const signals = [
    { name: "Bot Posting Rhythm", detected: botMultiplier > 1.5, confidence: 85 + Math.random() * 10 },
    { name: "Follower Spike", detected: botMultiplier > 2, confidence: 92 + Math.random() * 5 },
    { name: "Recycled Content", detected: Math.random() > 0.5, confidence: 70 + Math.random() * 20 },
    { name: "Identical Phrases", detected: botMultiplier > 1.8, confidence: 88 + Math.random() * 8 },
    { name: "Coordinated Timing", detected: botMultiplier > 1.2, confidence: 80 + Math.random() * 15 },
  ];

  const influencers = [
    {
      author: "@CryptoGems" + Math.floor(Math.random() * 100),
      followers: Math.floor(10 + Math.random() * 900) + "K",
      content: "This project is insane! 🚀 High potential for 100x. Don't miss out on " + address,
      botScore: Math.floor(30 + Math.random() * 60),
      platform: "twitter",
      engagement: Math.floor(1000 + Math.random() * 10000)
    },
    {
      author: "Alpha Group Admin",
      followers: Math.floor(5 + Math.random() * 50) + "K",
      content: "Exclusive early call for our members. Bullish on this chart! 🔥",
      botScore: Math.floor(40 + Math.random() * 50),
      platform: "telegram",
      engagement: Math.floor(500 + Math.random() * 5000)
    }
  ];

  return NextResponse.json({
    platforms,
    signals,
    influencers,
    summary: {
      totalMentions: platforms.reduce((a, b) => a + b.mentions, 0),
      avgBotScore: Math.round(platforms.reduce((a, b) => a + b.botScore, 0) / platforms.length),
      riskLevel: botMultiplier > 2 ? "CRITICAL" : botMultiplier > 1.5 ? "HIGH" : "MODERATE"
    }
  });
}
