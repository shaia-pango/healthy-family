export function speakHebrew(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'he-IL';
  utter.rate = 0.95;
  utter.pitch = 1.1;
  window.speechSynthesis.speak(utter);
}
