export default function createPlayer(container) {
    const video = document.createElement("video")
    video.muted = true
    video.autoplay = true
    video.loop = true

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    container.append(canvas)

    const video_canvas = document.createElement("canvas")
    const video_ctx = video_canvas.getContext("2d", { willReadFrequently: true })

    const options = {
        brightness_boost: 0,
        characters: " .:wqpdbkhao#@",
        bg_color: "#000",
        sample_size: 5,
        font_scale: 5,
        show_video: false,
        thumbnail_size: 200,
    }

    video.addEventListener("loadeddata", () => {
        video.play()
        render()

        container.append(video)
        video.controls = true
        video.style.position = "absolute"
        video.style.top = "0px"
        video.style.left = "0px"

        const size_ratio = video.height / video.width
        video.style.width = options.thumbnail_size + "px"
        video.style.height = options.thumbnail_size * size_ratio + "px"
    })

    function render() {
        if (video.videoHeight == 0) {
            return
        }

        video.style.display = (options.show_video) ? "block" : "none"

        const video_aspect_ratio_h = (video.videoHeight / video.videoWidth)
        const video_aspect_ratio_w = (video.videoWidth / video.videoHeight)

        // Resize video for performance
        const width = 600
        const height = width * video_aspect_ratio_h

        video.width = width
        video.height = height

        video_canvas.width = video.width
        video_canvas.height = video.height

        // Resize canvas to fit in the container
        canvas.width = container.clientWidth
        canvas.height = canvas.width * video_aspect_ratio_h

        if (canvas.height > container.clientHeight) {
            canvas.height = container.clientHeight
            canvas.width = canvas.height * video_aspect_ratio_w
        }

        // Clear the canvas for a new frame
        ctx.fillStyle = options.bg_color
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw video frame in tmp canvas to get the pixels
        video_ctx.drawImage(video, 0, 0, video.width, video.height)
        const pixels = video_ctx.getImageData(0, 0, video.width, video.height)

        // Find final font scale
        const scale = canvas.width / video.width
        ctx.font = `${scale * (options.font_scale)}px Arial`

        // For each character in the frame, render it
        for (let y = 0; y < video.height; y += options.sample_size) {
            for (let x = 0; x < video.width; x += options.sample_size) {
                drawCharacter(x, y, scale, pixels)
            }
        }

        requestAnimationFrame(render)
    }

    function drawCharacter(x, y, scale, pixels) {
        let red_sum = 0
        let green_sum = 0
        let blue_sum = 0

        // Sum the RGB of each pixel in the character box
        for (let offset_y = 0; offset_y < options.sample_size; offset_y++) {
            for (let offset_x = 0; offset_x < options.sample_size; offset_x++) {
                const pixel_index = (y + offset_y) * video.width + x + offset_x
                red_sum += pixels.data[pixel_index * 4 + 0] || 0
                green_sum += pixels.data[pixel_index * 4 + 1] || 0
                blue_sum += pixels.data[pixel_index * 4 + 2] || 0
            }
        }

        const nb_pixels = options.sample_size * options.sample_size

        // Find the RGB average
        const red_avg = red_sum / nb_pixels
        const green_avg = green_sum / nb_pixels
        const blue_avg = blue_sum / nb_pixels

        // https://en.wikipedia.org/wiki/Relative_luminance
        const brightness = (0.2126 * red_avg + 0.7152 * green_avg + 0.0722 * blue_avg) / 255

        // Apply brightness_boost
        let total_brightness = brightness + options.brightness_boost
        if (total_brightness > 1) total_brightness = 1
        if (total_brightness < 0) total_brightness = 0

        // Converts the brightness into a character index
        const char_index = Math.floor(total_brightness * (options.characters.length - 1))
        const char = options.characters[char_index]

        // If there's something to draw (skip dark spots)
        if (char !== " ") {
            ctx.fillStyle = `rgb(${red_avg}, ${green_avg}, ${blue_avg})` // Applique la couleur de texte
            ctx.fillText(char, x * scale, y * scale) // Dessine la lettre
        }
    }

    return {
        play(src) {
            video.src = src
        },
        video: video,
        options: options,
    }
}
