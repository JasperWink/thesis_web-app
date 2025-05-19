
export const EFFECT_TYPES = {
    NONE: 0,
    OVERLAY: 1,
    BLUR: 2,
    DESATURATE: 3
};


const getDiminishStrength = (nutri_score, effectType) => {
    const strengthMap = {
        [EFFECT_TYPES.NONE]: {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0
        },
        [EFFECT_TYPES.OVERLAY]: {
            0: 0,
            1: 0.3,
            2: 0.5,
            3: 0.7,
            4: 0.9
        },
        [EFFECT_TYPES.BLUR]: {
            0: 0,
            1: 5,
            2: 10,
            3: 15,
            4: 20
        },
        [EFFECT_TYPES.DESATURATE]: {
            0: 0,
            1: 0.3,
            2: 0.6,
            3: 0.8,
            4: 1
        }
    };
    return strengthMap[effectType][nutri_score];
};

const applyOverlay = (bbox, ctx, opacity) => {
    if (opacity <= 0) return

    const [x, y, w, h] = bbox;
    // PREVIOUS IMPLEMENTATION
    // ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    // ctx.fillRect(x, y, w, h);

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = 'white';
    ctx.fillRect(x, y, w, h);
    ctx.restore();
};

const applyBlur = (bbox, ctx, video, diminish_strength) => {
    if (diminish_strength <= 0) return;
    
    const [x, y, w, h] = bbox;

    // Use hardware-accelerated filter for blur
    ctx.save();
    
    // Create a clipping path for the bounding box
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    
    // Apply blur only to the clipped region
    ctx.filter = `blur(${diminish_strength}px)`;
    
    // Draw the video content into this region with the blur effect
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 
                  0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Reset filter
    ctx.filter = 'none';
    ctx.restore();
};

const applyDesaturation = (bbox, ctx, video, diminish_strength) => {
    const [x, y, w, h] = bbox;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    
    // Apply grayscale via compositing (no pixel loops)
    ctx.globalCompositeOperation = 'saturation';
    ctx.globalAlpha = diminish_strength;
    ctx.fillStyle = 'black';
    ctx.fillRect(x, y, w, h);
    
    ctx.restore();
};

const applyOutline = (bbox, ctx, det) => {
    const [x, y, w, h] = bbox;
    ctx.fillStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // -------------------- CAN MAYBE GO IN FINAL VERSION --------------------
    ctx.fillStyle = 'green';
    ctx.font = '16px Arial';
    ctx.fillText(
        `${det.class} (${Math.round(det.confidence * 100)}%) (${det.nutri_score})`,
        x,
        y - 5
    );
};

export const diminishObject = (canvas, video, detections, diminishMethod,
                               diminishType, useOutline, nutriScoreBaseline) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ----------------- DIT IS VOOR TESTEN, KAN WEG --------------------
    // console.log(diminishMethod, diminishType, useOutline, nutriScoreBaseline)
    // -----------------------------------------------------------------
    detections.forEach(det => {
        let nutri_score = det.nutri_score;

        // Threshold (Set nutri-score to either min or max)
        if (diminishMethod == 0) {
            nutri_score = nutri_score > nutriScoreBaseline ? 4 : 0;
        }

        const diminish_strength = getDiminishStrength(nutri_score, diminishType);

        switch(diminishType) {
            case EFFECT_TYPES.NONE:
                break;
            case EFFECT_TYPES.OVERLAY:
                applyOverlay(det.bbox, ctx, diminish_strength);
                break;
            case EFFECT_TYPES.BLUR:
                applyBlur(det.bbox, ctx, video, diminish_strength);
                break;
            case EFFECT_TYPES.DESATURATE:
                applyDesaturation(det.bbox, ctx, video, diminish_strength);
                break;
        }

        if (useOutline) {
            applyOutline(det.bbox, ctx, det)
        }
    });
};
