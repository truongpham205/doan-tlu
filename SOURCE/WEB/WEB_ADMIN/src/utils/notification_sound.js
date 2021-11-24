import soundFile from 'assets/notification_sound/soundFile.mp3'
function playSound() {
  const audio = new Audio(soundFile)
  audio.play()
}
export default playSound
