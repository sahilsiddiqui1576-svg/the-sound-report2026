export type Platform = "Spotify" | "Apple Music" | "Amazon Music" | "YouTube";

export type Song = {
  id: string;
  title: string;
  artist: string;
  language: string;
  region: string;
  genre: string;
  cover: string;
  spotify?: number;
  apple?: number;
  amazon?: number;
  youtubeViews?: string;
  movement?: number;
  score: number;
  label: string;
  reason: string;
};

export const pulseSongs: Song[] = [
  { id: "radhimaa", title: "Radhimaa", artist: "Sai Abhyankkar", language: "Tamil", region: "South India", genre: "I-Pop", cover: "/images/covers/radhimaa.jpg", spotify: 5, apple: 1, movement: 18, score: 92, label: "Cross-platform hit", reason: "A strong multi-platform signal with a clear regional identity." },
  { id: "arz-kiya-hai", title: "Arz Kiya Hai", artist: "Anuv Jain", language: "Hindi", region: "India", genre: "I-Pop", cover: "/images/covers/arz-kiya-hai.jpg", spotify: 1, apple: 4, movement: 11, score: 95, label: "Streaming leader", reason: "An independent pop release sitting at the centre of India's current listening conversation." },
  { id: "kalyani", title: "KALYANI (Remix)", artist: "ARJN, KDS, FIFTY4, Shreya Ghoshal", language: "Hindi", region: "India", genre: "Pop", cover: "/images/covers/kalyani.jpg", spotify: 3, apple: 7, amazon: 1, movement: 24, score: 94, label: "Platform mover", reason: "A high-velocity release appearing strongly across multiple DSP ecosystems." },
  { id: "bairan", title: "Bairan", artist: "Banjaare", language: "Hindi", region: "North India", genre: "I-Pop", cover: "/images/covers/bairan.jpg", spotify: 6, amazon: 3, movement: 16, score: 90, label: "Riser", reason: "Independent pop continues to occupy mainstream chart space." },
  { id: "gehra-hua", title: "Gehra Hua", artist: "Arijit Singh, Armaan Khan, Shashwat Sachdev", language: "Hindi", region: "India", genre: "Film / Pop", cover: "/images/covers/gehra-hua.jpg", spotify: 8, amazon: 5, movement: 7, score: 88, label: "Mainstream anchor", reason: "Film music remains powerful, but now competes inside a broader Indian pop ecosystem." },
];

export const keyNumbers = [
  { value: "335B", label: "Spotify streams of Indian artists in 2025" },
  { value: "+29%", label: "Indian artist royalties year over year" },
  { value: "40%+", label: "Royalties from listeners outside India" },
  { value: "12.8B", label: "First-time discoveries of Indian artists" },
];

export function rankByScore() {
  return [...pulseSongs].sort((a, b) => b.score - a.score);
}

export function fastestRiser() {
  return [...pulseSongs].sort((a, b) => (b.movement ?? 0) - (a.movement ?? 0))[0];
}
