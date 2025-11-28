import createPlayer from './AsciiPlayer.js'
import { GUI } from './libs/lil-gui.esm.js';

const container = document.querySelector(".container")
const player = createPlayer(container)

// ==========================================
// Play samples

let current_index = -1

const videos = [
    "videos/01.mp4",
    "videos/02.mp4",
    "videos/03.mp4",
    "videos/04.mp4",
]

changeVideo()
setInterval(changeVideo, 6000)

function changeVideo() {
    current_index += 1

    if (current_index === videos.length) {
        current_index = 0
    }

    player.play(videos[current_index])
}

// ==========================================
// Show debug overlay
const gui = new GUI()

gui.add(player.options, 'show_video')
gui.add(player.options, 'font_scale', 2, 20, 1)
gui.add(player.options, 'sample_size', 2, 20, 1)
gui.add(player.options, 'brightness_boost', -1, 1, 0.01)
gui.add(player.options, 'characters')
gui.addColor(player.options, 'bg_color')

gui.close()