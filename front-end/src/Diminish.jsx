export const diminishObj = (detections, ctx) => {
    detections.forEach(predictions => {
        const [x, y, width, height] = predictions['bbox'];
        const text = predictions['class'];
        const isCellphone = text.toLowerCase().includes('cell phone');
        const color = isCellphone ? "red" : "green";
        const style = isCellphone ? "rgba(128, 128, 128, 0.9)" : "rgba(128, 128, 128, 0)";

        // Set styling
        ctx.strokeStyle = color
        ctx.font = '18px Arial'
        ctx.fillStyle = color

        // Draw rectangle and text
        ctx.fillStyle = style;
        ctx.fillRect(x, y, width, height);
        ctx.fillText(text, x, y)
        ctx.stroke()
    })
}
